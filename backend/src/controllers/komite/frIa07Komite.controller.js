const FrIa07 = require("../../models/frIa07.model");
const Soal = require("../../models/frIa07Soal.model");


// ===============================
// CREATE PAKET
// ===============================
exports.createPaket = async (req, res) => {
  try {
    const data = await FrIa07.create({
      id_jadwal: req.body.id_jadwal,
      id_skema: req.body.id_skema,
      judul: req.body.judul,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "Paket FR.IA.07 berhasil dibuat",
      data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET PAKET BY JADWAL
// ===============================
exports.getByJadwal = async (req, res) => {
  try {
    const data = await FrIa07.findAll({
      where: { id_jadwal: req.params.id_jadwal }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// TAMBAH SOAL LISAN
// ===============================
exports.createSoal = async (req, res) => {
  try {
    const data = await Soal.create({
      id_fr_ia_07: req.body.id_fr_ia_07,
      id_unit: req.body.id_unit,
      id_kelompok: req.body.id_kelompok,
      pertanyaan: req.body.pertanyaan,
      kunci_jawaban: req.body.kunci_jawaban,
      urutan: req.body.urutan
    });

    res.json({
      message: "Soal lisan berhasil ditambahkan",
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
    const data = await FrIa07.findByPk(req.params.id, {
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