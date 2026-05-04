const FrIa05 = require("../../models/frIa05.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");


// ===============================
// CREATE PAKET SOAL
// ===============================
exports.createPaket = async (req, res) => {
  try {
    const data = await FrIa05.create({
      ...req.body,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "Paket soal berhasil dibuat",
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
    const data = await FrIa05.findAll({
      where: { id_jadwal: req.params.id_jadwal }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// TAMBAH SOAL
// ===============================
exports.createSoal = async (req, res) => {
  try {
    const data = await Soal.create(req.body);

    res.json({
      message: "Soal berhasil ditambahkan",
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
// TAMBAH OPSI JAWABAN
// ===============================
exports.createOpsi = async (req, res) => {
  try {
    const { id_soal, kode_opsi, jawaban, is_benar } = req.body;

    // kalau ada jawaban benar baru → reset yang lama
    if (is_benar) {
      await Opsi.update(
        { is_benar: false },
        { where: { id_soal } }
      );
    }

    const data = await Opsi.create({
      id_soal,
      kode_opsi,
      jawaban,
      is_benar
    });

    res.json({
      message: "Opsi berhasil ditambahkan",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET DETAIL SOAL + OPSI
// ===============================
exports.getDetail = async (req, res) => {
  try {
    const data = await FrIa05.findByPk(req.params.id, {
      include: [
        {
          model: Soal,
          include: [Opsi]
        }
      ]
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};