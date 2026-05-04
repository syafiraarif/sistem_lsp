const FrIa06 = require("../../models/frIa06.model");
const Soal = require("../../models/frIa06Soal.model");


// ===============================
// CREATE PAKET ESSAY
// ===============================
exports.createPaket = async (req, res) => {
  try {
    const data = await FrIa06.create({
      ...req.body,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "Paket FR.IA.06 berhasil dibuat",
      data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// TAMBAH SOAL ESSAY
// ===============================
exports.createSoal = async (req, res) => {
  try {
    const data = await Soal.create(req.body);

    res.json({
      message: "Soal essay berhasil ditambahkan",
      data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// UPDATE SOAL
// ===============================
exports.updateSoal = async (req, res) => {
  try {
    await Soal.update(req.body, {
      where: { id_soal: req.params.id }
    });

    res.json({ message: "Soal berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// DELETE SOAL
// ===============================
exports.deleteSoal = async (req, res) => {
  try {
    await Soal.destroy({
      where: { id_soal: req.params.id }
    });

    res.json({ message: "Soal berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET DETAIL (SOAL + KUNCI)
// ===============================
exports.getDetail = async (req, res) => {
  try {
    const data = await FrIa06.findByPk(req.params.id, {
      include: [
        {
          model: Soal,
          as: "soal",
          order: [["urutan", "ASC"]]
        }
      ]
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};