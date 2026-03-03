const { Jadwal, Tuk, Skema } = require("../../models");
const { Op } = require("sequelize");

/* =============================== */
const getSkemaTuk = async (req, res) => {
  try {
    const tukId = req.user?.id_tuk;

    if (!tukId) {
      return res.status(400).json({ message: "ID TUK tidak ditemukan di token." });
    }

    const data = await Skema.findAll();

    res.json({ data });

  } catch (err) {
    console.error("ERROR getSkemaTuk:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan server" });
  }
};
/* =============================== */

const createJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    if (!tukId)
      return res.status(400).json({ message: "ID TUK tidak ditemukan." });

    const allowedTipe = ["luring","daring","hybrid","onsite"];
    const allowedStatus = ["draft","open","ongoing","selesai","arsip"];

    const data = await Jadwal.create({
      ...req.body,
      id_skema: parseInt(req.body.id_skema),
      tahun: parseInt(req.body.tahun),
      kuota: parseInt(req.body.kuota),
      pelaksanaan_uji: allowedTipe.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : "luring",
      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : "draft",
      id_tuk: tukId,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ message: "Jadwal berhasil dibuat", data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* =============================== */
const getAllJadwal = async (req, res) => {
  try {
    const tukId = req.user?.id_tuk;

    if (!tukId) {
      return res.status(400).json({ message: "ID TUK tidak ditemukan di token." });
    }

    const data = await Jadwal.findAll({
      where: { id_tuk: tukId },

      // SAFE INCLUDE (tidak error kalau relasi bermasalah)
      include: [
        {
          model: Tuk,
          as: "tuk",
          attributes: ["nama_tuk", "email"],
          required: false
        },
        {
          model: Skema,
          as: "skema",
          attributes: ["kode_skema", "judul_skema", "jenis_skema"],
          required: false
        }
      ],

      order: [["tahun", "DESC"]]
    });

    res.json({ data });

  } catch (err) {
    console.error("ERROR getAllJadwal:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan server" });
  }
};

/* =============================== */
const getJadwalById = async (req, res) => {
  try {
    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const data = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: tukId },
      include: [
        { model: Tuk, as: "tuk", required: false },
        { model: Skema, as: "skema", required: false }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ data });

  } catch (err) {
    console.error("ERROR getJadwalById:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan server" });
  }
};

/* =============================== */
const updateJadwal = async (req, res) => {
  try {
    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: tukId }
    });

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const allowedTipe = ["luring","daring","hybrid","onsite"];
    const allowedStatus = ["draft","open","ongoing","selesai","arsip"];

    const updateData = {
      ...req.body,

      id_skema: req.body.id_skema
        ? parseInt(req.body.id_skema)
        : jadwal.id_skema,

      tahun: req.body.tahun
        ? parseInt(req.body.tahun)
        : jadwal.tahun,

      kuota: req.body.kuota
        ? parseInt(req.body.kuota)
        : jadwal.kuota,

      pelaksanaan_uji: allowedTipe.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : jadwal.pelaksanaan_uji,

      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : jadwal.status,

      updated_at: new Date()
    };

    await jadwal.update(updateData);

    res.json({
      message: "Jadwal berhasil diupdate",
      data: jadwal
    });

  } catch (err) {
    console.error("ERROR UPDATE JADWAL:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan server" });
  }
};

/* =============================== */
const deleteJadwal = async (req, res) => {
  try {
    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: tukId }
    });

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    await jadwal.destroy();

    res.json({ message: "Jadwal berhasil dihapus" });

  } catch (err) {
    console.error("ERROR DELETE JADWAL:", err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan server" });
  }
};

module.exports = {
  getSkemaTuk,
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
};