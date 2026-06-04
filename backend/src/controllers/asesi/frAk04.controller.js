const FrAk04 = require("../../models/frAk04.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const PDFDocument = require("pdfkit");

// ===============================
// CREATE FR.AK.04
// ===============================
exports.createFrAk04 = async (req, res) => {
  try {
    const { proses_banding_dijelaskan, diskusi_dengan_asesor, melibatkan_orang_lain, alasan_banding } = req.body;

    // Ambil peserta dari login
    const idUser = req.user.id_user || req.user.id;
    const peserta = await PesertaJadwal.findOne({
      where: { id_user: idUser },
      include: [
        { model: ProfileAsesi, as: "profileAsesi" },
        { model: ProfileAsesor, as: "asesor_penguji" }, // Asesor yang menguji
        { model: Jadwal, as: "jadwal", include: [{ model: Skema, as: "skema" }, { model: Tuk, as: "tuk" }] }
      ]
    });

    if (!peserta) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // Cek FR.AK.04 sudah diisi
    const existing = await FrAk04.findOne({ where: { id_peserta: peserta.id_peserta } });
    if (existing) return res.status(400).json({ message: "FR.AK.04 sudah pernah diisi" });

    // Validasi jawaban
    if (!proses_banding_dijelaskan || !diskusi_dengan_asesor || !melibatkan_orang_lain || !alasan_banding) {
      return res.status(400).json({ message: "Semua pertanyaan wajib diisi" });
    }

    // Ambil TTD Asesi dari profile
    const ttd_asesi = peserta.profileAsesi.ttd_path || null;

    // Simpan data
    const data = await FrAk04.create({
      id_peserta: peserta.id_peserta,
      id_jadwal: peserta.id_jadwal,
      id_skema: peserta.jadwal.id_skema,
      id_tuk: peserta.jadwal.id_tuk,
      tanggal_asesmen: new Date(),
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding,
      ttd_asesi
    });

    res.json({ message: "FR.AK.04 berhasil disimpan", data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan FR.AK.04", error: err.message });
  }
};

// ===============================
// GET FR.AK.04 BY PESERTA
// ===============================
exports.getFrAk04ByPeserta = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const data = await FrAk04.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            { model: ProfileAsesi, as: "profileAsesi" },
            { model: ProfileAsesor, as: "asesor_penguji" }
          ]
        },
        { model: Jadwal, as: "jadwal", include: [{ model: Skema, as: "skema" }, { model: Tuk, as: "tuk" }] }
      ]
    });

    if (!data) return res.status(404).json({ message: "Data FR.AK.04 tidak ditemukan" });
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data FR.AK.04", error: err.message });
  }
};

// ===============================
// GENERATE PDF FR.AK.04
// ===============================
exports.generatePdfFrAk04 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const data = await FrAk04.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            { model: ProfileAsesi, as: "profileAsesi" },
            { model: ProfileAsesor, as: "asesor_penguji" }
          ]
        },
        { model: Jadwal, as: "jadwal", include: [{ model: Skema, as: "skema" }, { model: Tuk, as: "tuk" }] }
      ]
    });

    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=FR_AK04.pdf");
    doc.pipe(res);

    const namaAsesi = data.peserta.profileAsesi.nama_lengkap || "-";
    const namaAsesor = data.peserta.asesor_penguji?.nama_lengkap || "-";
    const namaSkema = data.jadwal.skema.judul_skema || "-";
    const namaTuk = data.jadwal.tuk.nama_tuk || "-";

    // Header
    doc.fontSize(14).text("FR.AK.04. BANDING ASESMEN", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Nama Asesi : ${namaAsesi}`);
    doc.text(`Nama Asesor : ${namaAsesor}`);
    doc.text(`Tanggal Asesmen : ${data.tanggal_asesmen}`);
    doc.text(`Skema : ${namaSkema}`);
    doc.text(`TUK : ${namaTuk}`);
    doc.moveDown();

    // Jawaban Ya/Tidak
    doc.text("Jawaban Asesi:");
    doc.moveDown(0.5);
    doc.text(`1. Proses banding dijelaskan : ${data.proses_banding_dijelaskan.toUpperCase()}`);
    doc.text(`2. Diskusi dengan asesor : ${data.diskusi_dengan_asesor.toUpperCase()}`);
    doc.text(`3. Melibatkan orang lain : ${data.melibatkan_orang_lain.toUpperCase()}`);
    doc.moveDown();

    // Alasan banding
    doc.text("Alasan Banding:");
    doc.text(data.alasan_banding || "-");
    doc.moveDown(2);

    // TTD Asesi
    doc.text("Tanda Tangan Asesi:");
    if (data.peserta.profileAsesi.ttd_path) {
      try { doc.image(data.peserta.profileAsesi.ttd_path, { width: 100 }); }
      catch { doc.text("(TTD tidak ditemukan)"); }
    } else { doc.text("-"); }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal generate PDF FR.AK.04", error: err.message });
  }
};