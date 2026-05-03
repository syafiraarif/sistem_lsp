const {
  FrAk01,
  PesertaJadwal,
  JadwalAsesor,
  PresensiAsesor
} = require("../../models");

const response = require("../../utils/response.util");


// ✅ 1. SUBMIT FR.AK.01
const submitFrAk01 = async (req, res) => {
  try {
    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      id_peserta,
      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      bukti_lainnya,
      ttd_asesor
    } = req.body;

    // 🔥 VALIDASI WAJIB
    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal dan id_peserta wajib diisi"
      });
    }

    if (!ttd_asesor) {
      return res.status(400).json({
        message: "Tanda tangan asesor wajib diisi"
      });
    }

    // ✅ CEK PRESENSI DULU
    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!presensi) {
      return res.status(403).json({
        message: "Harap lakukan presensi terlebih dahulu"
      });
    }

    // ✅ CEK APAKAH DIA ASESOR DI JADWAL INI
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    // ✅ CEK PESERTA VALID
    const peserta = await PesertaJadwal.findOne({
      where: { id_peserta, id_jadwal }
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal ini"
      });
    }

    // ✅ CEK SUDAH ADA ATAU BELUM
    const existing = await FrAk01.findOne({
      where: { id_jadwal, id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.AK.01 sudah diisi untuk peserta ini"
      });
    }

    // ✅ SIMPAN DATA
    const data = await FrAk01.create({
      id_jadwal,
      id_peserta,
      id_asesor,

      bukti_portofolio: !!bukti_portofolio,
      bukti_observasi: !!bukti_observasi,
      bukti_tertulis: !!bukti_tertulis,
      bukti_wawancara: !!bukti_wawancara,
      bukti_review_produk: !!bukti_review_produk,
      bukti_kegiatan_terstruktur: !!bukti_kegiatan_terstruktur,
      bukti_lisan: !!bukti_lisan,

      bukti_lainnya: bukti_lainnya || null,

      ttd_asesor
    });

    return res.status(201).json({
      message: "FR.AK.01 berhasil disimpan",
      data
    });

  } catch (err) {
    console.error("❌ Submit FR.AK.01 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};



// ✅ 2. GET DETAIL FR.AK.01
const getFrAk01 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal dan id_peserta wajib"
      });
    }

    const data = await FrAk01.findOne({
      where: { id_jadwal, id_peserta }
    });

    return res.json({
      data
    });

  } catch (err) {
    console.error("❌ Get FR.AK.01 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ✅ 3. UPDATE FR.AK.01
const updateFrAk01 = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await FrAk01.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        message: "Data FR.AK.01 tidak ditemukan"
      });
    }

    await FrAk01.update(req.body, {
      where: { id_fr_ak01: id }
    });

    return res.json({
      message: "FR.AK.01 berhasil diupdate"
    });

  } catch (err) {
    console.error("❌ Update FR.AK.01 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ✅ 4. LIST FR.AK.01 PER JADWAL
const listFrAk01 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrAk01.findAll({
      where: { id_jadwal },
      order: [["created_at", "DESC"]]
    });

    return res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error("❌ List FR.AK.01 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  submitFrAk01,
  getFrAk01,
  updateFrAk01,
  listFrAk01
};