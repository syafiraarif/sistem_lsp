const FrIa09 = require("../../models/frIa09.model");
const FrIa09Detail = require("../../models/frIa09Detail.model");
const BankSoal = require("../../models/frIa08BankSoal.model");

// ===============================
// GET DATA (soal + jawaban jika ada)
// ===============================
exports.getData = async (req, res) => {
  try {
    const { id_peserta, id_jadwal, id_skema } = req.query;

    // 🔹 cari header
    let header = await FrIa09.findOne({
      where: { id_peserta, id_jadwal }
    });

    // 🔹 ambil soal dari bank soal
    const soal = await BankSoal.findAll({
      where: { id_skema },
      order: [["id_soal", "ASC"]]
    });

    let detail = [];

    if (header) {
      detail = await FrIa09Detail.findAll({
        where: { id_fr_ia_09: header.id_fr_ia_09 }
      });
    }

    res.json({
      header,
      soal,
      detail
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ===============================
// CREATE HEADER
// ===============================
exports.create = async (req, res) => {
  try {
    const data = await FrIa09.create({
      id_fr_ia_08: req.body.id_fr_ia_08,
      id_peserta: req.body.id_peserta,
      id_jadwal: req.body.id_jadwal,
      id_skema: req.body.id_skema,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "FR.IA.09 berhasil dibuat",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ===============================
// SAVE DETAIL (jawaban per soal)
// ===============================
exports.saveDetail = async (req, res) => {
  try {
    const {
      id_fr_ia_09,
      id_soal,
      kesimpulan_jawaban,
      rekomendasi
    } = req.body;

    await FrIa09Detail.upsert({
      id_fr_ia_09,
      id_soal,
      kesimpulan_jawaban,
      rekomendasi,
      created_at: new Date()
    });

    res.json({
      message: "Jawaban berhasil disimpan"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ===============================
// SUBMIT (rekomendasi akhir + TTD)
// ===============================
exports.submit = async (req, res) => {
  try {
    const {
      id_fr_ia_09,
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor
    } = req.body;

    await FrIa09.update({
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor
    }, {
      where: { id_fr_ia_09 }
    });

    res.json({
      message: "FR.IA.09 selesai"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ===============================
// DELETE DETAIL (optional)
// ===============================
exports.deleteDetail = async (req, res) => {
  try {
    await FrIa09Detail.destroy({
      where: { id_detail: req.params.id }
    });

    res.json({
      message: "Detail dihapus"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};