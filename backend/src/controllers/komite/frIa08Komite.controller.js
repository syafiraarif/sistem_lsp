const BankSoal = require("../../models/frIa08BankSoal.model");

// ✅ CREATE SOAL
exports.createSoal = async (req, res) => {
  try {
    if (req.user.role !== "komite_teknis") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const data = await BankSoal.create({
      id_skema: req.body.id_skema,
      id_unit: req.body.id_unit,
      id_elemen: req.body.id_elemen,
      id_kuk: req.body.id_kuk,
      pertanyaan: req.body.pertanyaan,
      jawaban_diharapkan: req.body.jawaban_diharapkan,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "Soal berhasil dibuat",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ GET SOAL PER SKEMA
exports.getSoalBySkema = async (req, res) => {
  try {
    const data = await BankSoal.findAll({
      where: { id_skema: req.params.id_skema },
      order: [["id_soal", "ASC"]]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ UPDATE SOAL
exports.updateSoal = async (req, res) => {
  try {
    if (req.user.role !== "komite_teknis") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    await BankSoal.update({
      pertanyaan: req.body.pertanyaan,
      jawaban_diharapkan: req.body.jawaban_diharapkan
    }, {
      where: { id_soal: req.params.id }
    });

    res.json({ message: "Soal berhasil diupdate" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ DELETE SOAL
exports.deleteSoal = async (req, res) => {
  try {
    if (req.user.role !== "komite_teknis") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    await BankSoal.destroy({
      where: { id_soal: req.params.id }
    });

    res.json({ message: "Soal berhasil dihapus" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};