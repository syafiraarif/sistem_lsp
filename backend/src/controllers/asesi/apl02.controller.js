const AplikasiAsesmen = require("../../models/aplikasiAsesmen.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const Apl02AsesmenMandiri = require("../../models/apl02AsesmenMandiri.model");
const Pembayaran = require("../../models/pembayaran.model");  // Tambahkan import untuk cek pembayaran
const response = require("../../utils/response.util");

// Get list unit kompetensi yang dipilih untuk aplikasi tertentu (dengan elemen dan kriteria, nomor ditambahkan dinamis)
exports.getUnitsForApl02 = async (req, res) => {
  try {
    const { id_aplikasi } = req.params;

    // Cek apakah aplikasi milik user dan status submitted atau draft
    const aplikasi = await AplikasiAsesmen.findOne({
      where: { id_aplikasi, id_user: req.user.id_user, status: ["draft", "submitted"] }  // Pastikan aplikasi dalam status yang bisa diisi APL02
    });
    if (!aplikasi) {
      return response.error(res, "Aplikasi tidak ditemukan, tidak milik Anda, atau tidak dalam status yang valid untuk APL02", 404);
    }

    // Cek apakah pembayaran sudah "paid" (asesi harus bayar dulu sebelum APL02)
    const pembayaran = await Pembayaran.findOne({ where: { id_aplikasi, status: "paid" } });
    if (!pembayaran) {
      return response.error(res, "Pembayaran belum dilakukan atau belum dikonfirmasi. Selesaikan pembayaran terlebih dahulu.", 403);
    }

    // Get unit kompetensi yang dipilih (dari selected_units)
    const selectedUnits = aplikasi.selected_units || [];
    if (selectedUnits.length === 0) {
      return response.error(res, "Tidak ada unit kompetensi yang dipilih untuk aplikasi ini", 400);
    }

    const units = await UnitKompetensi.findAll({
      where: { id_unit: selectedUnits },
      attributes: ["id_unit", "kode_unit", "judul_unit", "elemen_kriteria"]  // elemen_kriteria adalah JSON dengan elemen_kompetensi dan kriteria_unjuk_kerja
    });

    // Tambahkan nomor dinamis berdasarkan urutan unit yang dipilih
    const unitsWithNumbers = units.map((unit, unitIndex) => {
      const elemenKriteria = unit.elemen_kriteria;
      if (!elemenKriteria) return unit;

      // Nomor elemen: 1.1, 2.1, dll. (unitIndex + 1 adalah nomor unit dalam urutan pilihan, .1 adalah elemen pertama)
      const elemenNumber = `${unitIndex + 1}.1`;  // Asumsi satu elemen per unit
      const elemenKompetensiWithNumber = `${elemenNumber}. ${elemenKriteria.elemen_kompetensi}`;

      // Nomor kriteria: 1.1.1, 1.1.2, dll.
      const kriteriaWithNumbers = elemenKriteria.kriteria_unjuk_kerja.map((kriteria, kriteriaIndex) => {
        const kriteriaNumber = `${elemenNumber}.${kriteriaIndex + 1}`;
        return `${kriteriaNumber}. ${kriteria}`;
      });

      return {
        ...unit.toJSON(),
        elemen_kriteria: {
          elemen_kompetensi: elemenKompetensiWithNumber,
          kriteria_unjuk_kerja: kriteriaWithNumbers
        }
      };
    });

    response.success(res, "Unit kompetensi untuk APL02", unitsWithNumbers);
  } catch (err) {
    response.error(res, err.message);
  }
};

// Submit jawaban APL02 untuk satu kriteria (dengan upload file bukti)
exports.submitApl02 = async (req, res) => {
  try {
    const { id_aplikasi, id_unit, elemen_kompetensi, kriteria_unjuk_kerja, jawaban, jenis_pengalaman, nama_dokumen, nomor_dokumen, tanggal_dokumen, catatan_bukti } = req.body;
    const files = req.files;

    // Validasi dasar
    if (!id_aplikasi || !id_unit || !elemen_kompetensi || !kriteria_unjuk_kerja || !jawaban || !jenis_pengalaman) {
      return response.error(res, "Semua field wajib diisi kecuali file dan catatan", 400);
    }

    // Cek apakah aplikasi milik user dan status valid
    const aplikasi = await AplikasiAsesmen.findOne({
      where: { id_aplikasi, id_user: req.user.id_user, status: ["draft", "submitted"] }
    });
    if (!aplikasi) {
      return response.error(res, "Aplikasi tidak ditemukan, tidak milik Anda, atau tidak dalam status yang valid", 404);
    }

    // Cek apakah pembayaran sudah "paid"
    const pembayaran = await Pembayaran.findOne({ where: { id_aplikasi, status: "paid" } });
    if (!pembayaran) {
      return response.error(res, "Pembayaran belum dilakukan atau belum dikonfirmasi. Selesaikan pembayaran terlebih dahulu.", 403);
    }

    // Cek apakah id_unit ada di selected_units aplikasi
    const selectedUnits = aplikasi.selected_units || [];
    if (!selectedUnits.includes(parseInt(id_unit))) {
      return response.error(res, "Unit kompetensi tidak valid untuk aplikasi ini", 400);
    }

    // Cek duplikasi: Pastikan kriteria ini belum di-submit untuk aplikasi dan unit ini
    const existing = await Apl02AsesmenMandiri.findOne({
      where: { id_aplikasi, id_unit, kriteria_unjuk_kerja }
    });
    if (existing) {
      return response.error(res, "Jawaban untuk kriteria ini sudah ada. Gunakan update jika perlu.", 409);
    }

    // Handle upload file bukti
    let fileBuktiPath = null;
    if (files && files.file_bukti && files.file_bukti[0]) {
      fileBuktiPath = files.file_bukti[0].path;
    }

    // Simpan data APL02
    const apl02 = await Apl02AsesmenMandiri.create({
      id_aplikasi,
      id_unit,
      elemen_kompetensi,  // TEXT, menyimpan deskripsi lengkap dengan nomor
      kriteria_unjuk_kerja,  // TEXT, menyimpan deskripsi lengkap dengan nomor
      jawaban,
      jenis_pengalaman,
      nama_dokumen,
      nomor_dokumen,
      tanggal_dokumen,
      file_bukti: fileBuktiPath,
      catatan_bukti
    });

    response.success(res, "Jawaban APL02 berhasil disimpan", apl02);
  } catch (err) {
    // Handle error upload file (jika multer error)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return response.error(res, "File terlalu besar. Maksimal 10MB.", 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return response.error(res, "File tidak valid atau terlalu banyak.", 400);
    }
    response.error(res, err.message);
  }
};

// Get data APL02 untuk aplikasi tertentu (untuk review atau edit)
exports.getApl02Data = async (req, res) => {
  try {
    const { id_aplikasi } = req.params;

    // Cek kepemilikan dan status
    const aplikasi = await AplikasiAsesmen.findOne({
      where: { id_aplikasi, id_user: req.user.id_user }
    });
    if (!aplikasi) {
      return response.error(res, "Aplikasi tidak ditemukan atau tidak milik Anda", 404);
    }

    const data = await Apl02AsesmenMandiri.findAll({
      where: { id_aplikasi },
      include: [
        { 
          model: UnitKompetensi, 
          attributes: ["kode_unit", "judul_unit", "elemen_kriteria"]  // Include elemen_kriteria untuk referensi
        }
      ],
      order: [["created_at", "ASC"]]  // Urutkan berdasarkan waktu submit
    });

    response.success(res, "Data APL02", data);
  } catch (err) {
    response.error(res, err.message);
  }
};