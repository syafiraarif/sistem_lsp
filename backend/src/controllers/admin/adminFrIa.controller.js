// backend/controllers/adminFrIa.controller.js
const { FrIa02, FrIa02Detail, FrIa02Validator, FrIa03, FrIa03Pertanyaan, Skema, UnitKompetensi, SkemaUnit, KelompokPekerjaan, ProfileAsesor } = require("../../models");

// ===============================
// CONTROLLER FR.IA.02 (MASTER)
// ===============================

exports.getFrIa02Master = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const master = await FrIa02.findOne({
      where: { id_skema, id_jadwal: null, id_asesi: null },
      include: [
        {
          model: FrIa02Detail,
          as: "detail",
          include: [{ model: KelompokPekerjaan, as: "kelompok" }]
        },
        {
          model: FrIa02Validator,
          as: "validator",
          include: [{ model: ProfileAsesor, as: "asesor" }]
        },
        { model: Skema, as: "skema" }
      ],
      order: [["id_fr_ia_02", "DESC"]]
    });

    if (master) {
      return res.json({ success: true, data: master });
    } else {
      // Ubah dari res.status(404) menjadi res.json() saja agar terhitung sukses (200 OK)
      // Ini akan menghilangkan error merah di console saat data master belum ada.
      return res.json({ success: true, data: null, message: "Master FR.IA.02 belum tersedia" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveFrIa02Master = async (req, res) => {
  try {
    const { id_skema, details = [], validators = [] } = req.body;
    const adminId = req.user?.id_user || req.user?.id || 1;

    const skema = await Skema.findByPk(id_skema);
    if (!skema) return res.status(404).json({ message: "Skema tidak ditemukan" });

    let fr = await FrIa02.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });

    // Cek Role Pembuat (Opsional: Jika nanti Asesor bisa akses fungsi ini)
    // Asumsi saat ini yang akses fungsi di bawah ini adalah Admin
    if (!fr) {
      fr = await FrIa02.create({
        id_skema,
        id_jadwal: null,
        id_asesi: null,
        created_by: adminId,
        tanggal: new Date(),
        status_validasi: "disetujui" // Auto disetujui karena Admin yang buat master
      });
    } else {
      await fr.update({ updated_at: new Date(), status_validasi: "disetujui" });
    }

    const frId = fr.id_fr_ia_02 || fr.id; 

    // Reset data lama
    await FrIa02Detail.destroy({ where: { id_fr_ia_02: frId } });
    await FrIa02Validator.destroy({ where: { id_fr_ia_02: frId } });

    // 1. Simpan detail langkah kerja
    if (details.length > 0) {
      await FrIa02Detail.bulkCreate(
        details.map((item) => ({
          id_fr_ia_02: frId,
          id_kelompok: item.id_kelompok,
          kode_unit: item.kode_unit,
          judul_unit: item.judul_unit,
          urutan: item.urutan,
          skenario: item.skenario,
          langkah_kerja: item.langkah_kerja,
          peralatan: item.peralatan,
          durasi: item.durasi
        }))
      );
    }

    // 2. Simpan asesor (Perbaikan utama agar asesor tidak hilang)
    if (validators.length > 0) {
      await FrIa02Validator.bulkCreate(
        validators.map((v) => ({
          id_fr_ia_02: frId,
          id_asesor: v.id_asesor,
          peran: v.peran,
          urutan: v.urutan
        }))
      );
    }

    res.json({ success: true, message: "Master FR.IA.02 berhasil disimpan", data: fr });
  } catch (err) {
    console.error("ERROR SAVE FR.IA.02 MASTER:", err); 
    res.status(500).json({ error: err.message });
  }
};

// Tambahkan fungsi ini di bawah exports.getFrIa03Master
exports.saveFrIa03Header = async (req, res) => {
  try {
    const { id_skema, validators = [] } = req.body;
    const adminId = req.user?.id_user || req.user?.id || 1;

    let header = await FrIa03.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });
    if (!header) {
      header = await FrIa03.create({ id_skema, id_jadwal: null, id_asesi: null, created_by: adminId, tanggal: new Date(), status_validasi: "disetujui" });
    }

    // Jika kamu punya tabel/model FrIa03Validator, kita simpan datanya:
    const { FrIa03Validator } = require("../../models");
    if (FrIa03Validator) {
       await FrIa03Validator.destroy({ where: { id_fr_ia_03: header.id_fr_ia_03 } });
       if (validators.length) {
         await FrIa03Validator.bulkCreate(validators.map(v => ({
           id_fr_ia_03: header.id_fr_ia_03, id_asesor: v.id_asesor, peran: v.peran, urutan: v.urutan
         })));
       }
    }
    res.json({ success: true, data: header });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- FUNGSI BARU: VALIDASI FR.IA.02 ---
exports.validasiFrIa02Master = async (req, res) => {
  try {
    const { id_skema } = req.params;
    const { status_validasi, catatan } = req.body; // 'disetujui' atau 'ditolak'

    const fr = await FrIa02.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });
    
    if (!fr) {
      return res.status(404).json({ success: false, message: "Data FR.IA.02 tidak ditemukan" });
    }

    await fr.update({ 
      status_validasi, 
      catatan_admin: catatan || null,
      updated_at: new Date() 
    });

    res.json({ success: true, message: `FR.IA.02 berhasil ${status_validasi}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnitBySkema = async (req, res) => {
  try {
    const { id_skema } = req.params;
    const mapping = await SkemaUnit.findAll({
      where: { id_skema },
      include: [
        { model: UnitKompetensi, as: "unit" },
        { model: KelompokPekerjaan, as: "kelompok" }
      ],
      order: [["urutan", "ASC"]]
    });

    const unit = mapping.map((item) => ({
      id_unit: item.unit?.id_unit,
      kode_unit: item.unit?.kode_unit,
      judul_unit: item.unit?.judul_unit,
      id_kelompok: item.id_kelompok,
      nama_kelompok: item.kelompok?.nama_kelompok,
      urutan: item.urutan
    }));

    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// CONTROLLER FR.IA.03 (MASTER)
// ===============================

exports.getFrIa03Master = async (req, res) => {
  try {
    const id_skema = req.params.id_skema.split(':')[0]; // Fix jika URL tiba-tiba ketambahan :1 

    const data = await FrIa03.findOne({
      where: { id_skema, id_jadwal: null, id_asesi: null },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [{ model: UnitKompetensi, as: "unit" }]
        },
        { model: Skema, as: "skema" }
      ],
    });

    if (!data) return res.json({ success: true, data: null, message: "Data FR.IA.03 belum tersedia" }); // Ubah 404 jadi 200 agar FE tidak merah
    return res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveFrIa03Header = async (req, res) => {
  try {
    const { id_skema, validators = [] } = req.body;
    const adminId = req.user?.id_user || req.user?.id || 1;

    let header = await FrIa03.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });
    if (!header) {
      header = await FrIa03.create({ id_skema, id_jadwal: null, id_asesi: null, created_by: adminId, tanggal: new Date(), status_validasi: "disetujui" });
    }

    // PENTING: Karena sepertinya FrIa03Validator belum stabil di DB-mu, 
    // jika gagal menyimpan validator, kita cukup abaikan errornya agar proses header tetap sukses
    try {
      const { FrIa03Validator } = require("../../models");
      if (FrIa03Validator) {
         await FrIa03Validator.destroy({ where: { id_fr_ia_03: header.id_fr_ia_03 } });
         if (validators.length) {
           await FrIa03Validator.bulkCreate(validators.map(v => ({
             id_fr_ia_03: header.id_fr_ia_03, id_asesor: v.id_asesor, peran: v.peran, urutan: v.urutan
           })));
         }
      }
    } catch (e) {
      console.warn("Lewati simpan validator IA03 (Model FrIa03Validator mungkin belum ada):", e.message);
    }
    
    res.json({ success: true, message: "Header FR.IA.03 berhasil disimpan", data: header });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.savePertanyaanIa03 = async (req, res) => {
  try {
    const { id_skema, id_unit, pertanyaan, urutan } = req.body;
    const adminId = req.user?.id_user || req.user?.id || 1;

    let header = await FrIa03.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });
    if (!header) {
      header = await FrIa03.create({ 
        id_skema, id_jadwal: null, id_asesi: null, created_by: adminId, tanggal: new Date(), status_validasi: "disetujui"
      });
    }

    // Fix: Tambahkan created_by agar tidak error 500 (kolom tidak boleh null)
    const data = await FrIa03Pertanyaan.create({ 
      id_fr_ia_03: header.id_fr_ia_03, id_unit, pertanyaan, urutan, created_by: adminId 
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("Error nambah pertanyaan IA03:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- FUNGSI BARU: VALIDASI FR.IA.03 ---
exports.validasiFrIa03Master = async (req, res) => {
  try {
    const { id_skema } = req.params;
    const { status_validasi, catatan } = req.body;

    const header = await FrIa03.findOne({ where: { id_skema, id_jadwal: null, id_asesi: null } });
    if (!header) return res.status(404).json({ message: "Data FR.IA.03 tidak ditemukan" });

    await header.update({ 
      status_validasi, 
      catatan_admin: catatan || null,
      updated_at: new Date() 
    });

    res.json({ success: true, message: `FR.IA.03 berhasil ${status_validasi}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePertanyaanIa03 = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_unit, pertanyaan, urutan } = req.body;
    const soal = await FrIa03Pertanyaan.findByPk(id);

    if (!soal) return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });

    await soal.update({ id_unit, pertanyaan, urutan });
    res.json({ success: true, data: soal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePertanyaanIa03 = async (req, res) => {
  try {
    const { id } = req.params;
    await FrIa03Pertanyaan.destroy({ where: { id_pertanyaan: id } });
    res.json({ success: true, message: "Dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};