const FrIa10 = require("../../models/frIa10.model");

// ===============================
// 🔹 SAVE (CREATE / UPDATE)
// ===============================
exports.save = async (req, res) => {
  try {
    // 🔒 Hanya asesor penguji
    if (req.user.jenis_tugas !== "asesor_penguji") {
      return res.status(403).json({
        message: "Hanya asesor penguji yang boleh mengisi FR.IA.10"
      });
    }

    const userId = req.user.id;

    const {
      id_peserta,
      id_jadwal,
      id_skema,

      nama_pihak_ketiga,
      tempat_kerja,
      alamat,
      telepon,

      q_k3,
      q_kerjasama,
      q_manajemen_tugas,
      q_adaptasi,
      q_respon,
      q_konfirmasi,

      hubungan,
      lama_bekerja,
      kedekatan,
      pengalaman,
      keyakinan,
      kebutuhan_pelatihan,
      komentar,

      ttd_asesor
    } = req.body;

    // 🔍 cek data existing
    let data = await FrIa10.findOne({
      where: { id_peserta, id_jadwal }
    });

    // ===============================
    // 🔹 UPDATE
    // ===============================
    if (data) {
      await data.update({
        nama_pihak_ketiga,
        tempat_kerja,
        alamat,
        telepon,

        q_k3,
        q_kerjasama,
        q_manajemen_tugas,
        q_adaptasi,
        q_respon,
        q_konfirmasi,

        hubungan,
        lama_bekerja,
        kedekatan,
        pengalaman,
        keyakinan,
        kebutuhan_pelatihan,
        komentar,

        ttd_asesor
      });

      return res.json({
        message: "FR.IA.10 berhasil diupdate",
        data
      });
    }

    // ===============================
    // 🔹 CREATE
    // ===============================
    data = await FrIa10.create({
      id_peserta,
      id_jadwal,
      id_skema,

      nama_pihak_ketiga,
      tempat_kerja,
      alamat,
      telepon,

      q_k3,
      q_kerjasama,
      q_manajemen_tugas,
      q_adaptasi,
      q_respon,
      q_konfirmasi,

      hubungan,
      lama_bekerja,
      kedekatan,
      pengalaman,
      keyakinan,
      kebutuhan_pelatihan,
      komentar,

      ttd_asesor,
      created_by: userId
    });

    res.json({
      message: "FR.IA.10 berhasil dibuat",
      data
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// ===============================
// 🔹 GET BY PESERTA
// ===============================
exports.getByPeserta = async (req, res) => {
  try {
    const { id_peserta, id_jadwal } = req.params;

    const data = await FrIa10.findOne({
      where: { id_peserta, id_jadwal }
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// ===============================
// 🔹 GET ALL (OPTIONAL ADMIN)
// ===============================
exports.getAll = async (req, res) => {
  try {
    const data = await FrIa10.findAll();

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};