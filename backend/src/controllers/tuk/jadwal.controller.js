const {
  Jadwal,
  Tuk,
  Skema,
  TukSkema,
  User,
  ProfileAsesor,
  JadwalAsesor
} = require("../../models");

const { Op } = require("sequelize");

/* ===================================================== */
/* GET SKEMA */
/* ===================================================== */
const getSkemaTuk = async (req, res) => {
  try {

    const tukId = req.user?.id_tuk;

    if (!tukId) {
      return res.status(400).json({
        message: "ID TUK tidak ditemukan di token."
      });
    }

    const tukExist = await Tuk.findByPk(tukId);
    if (!tukExist) {
      return res.status(404).json({
        message: "TUK tidak valid"
      });
    }

    const data = await Skema.findAll();

    return res.json({ data });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* CREATE JADWAL + AUTO INSERT KE TUK_SKEMA */
/* ===================================================== */
const createJadwal = async (req, res) => {

  const transaction = await Jadwal.sequelize.transaction();

  try {

    const tukId = req.user?.id_tuk;
    const idSkema = parseInt(req.body.id_skema);

    if (!tukId) {
      return res.status(400).json({
        message: "ID TUK tidak ditemukan."
      });
    }

    const tukExist = await Tuk.findByPk(tukId);
    if (!tukExist) {
      return res.status(404).json({
        message: "TUK tidak ditemukan"
      });
    }

    const allowedTipe = ["luring", "daring", "hybrid", "onsite"];
    const allowedStatus = ["draft", "open", "ongoing", "selesai", "arsip"];

    /* ================= CREATE JADWAL ================= */

    const data = await Jadwal.create({
      kode_jadwal: req.body.kode_jadwal,
      id_skema: idSkema,
      id_tuk: tukId,
      nama_kegiatan: req.body.nama_kegiatan,
      tahun: parseInt(req.body.tahun),
      periode_bulan: req.body.periode_bulan,
      gelombang: req.body.gelombang,
      tgl_pra_asesmen: req.body.tgl_pra_asesmen,
      tgl_awal: req.body.tgl_awal,
      tgl_akhir: req.body.tgl_akhir,
      jam: req.body.jam,
      kuota: parseInt(req.body.kuota) || 0,
      pelaksanaan_uji: allowedTipe.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : "luring",
      url_agenda: req.body.url_agenda || "",
      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : "draft",
      created_by: req.user?.id_user,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction });

    /* ================= AUTO INSERT KE TUK_SKEMA ================= */

    await TukSkema.findOrCreate({
      where: {
        id_tuk: tukId,
        id_skema: idSkema
      },
      defaults: {
        id_tuk: tukId,
        id_skema: idSkema
      },
      transaction
    });

    await transaction.commit();

    return res.status(201).json({
      message: "Jadwal berhasil dibuat & skema tersimpan ke TUK",
      data
    });

  } catch (err) {

    await transaction.rollback();

    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* GET ALL JADWAL */
/* ===================================================== */
const getAllJadwal = async (req, res) => {

  try {

    const tukId = req.user?.id_tuk;

    const data = await Jadwal.findAll({
      where: { id_tuk: tukId },
      include: [
        {
          model: Tuk,
          as: "tuk",
          attributes: ["nama_tuk", "email"]
        },
        {
          model: Skema,
          as: "skema",
          attributes: ["kode_skema", "judul_skema", "jenis_skema"]
        }
      ],
      order: [["tahun", "DESC"]]
    });

    return res.json({ data });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* GET BY ID */
/* ===================================================== */
const getJadwalById = async (req, res) => {

  try {

    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const data = await Jadwal.findOne({
      where: {
        id_jadwal: id,
        id_tuk: tukId
      },
      include: [
        { model: Tuk, as: "tuk" },
        { model: Skema, as: "skema" }
      ]
    });

    if (!data) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    return res.json({ data });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* UPDATE JADWAL */
/* ===================================================== */
const updateJadwal = async (req, res) => {

  try {

    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const jadwal = await Jadwal.findOne({
      where: {
        id_jadwal: id,
        id_tuk: tukId
      }
    });

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    const allowedTipe = ["luring", "daring", "hybrid", "onsite"];
    const allowedStatus = ["draft", "open", "ongoing", "selesai", "arsip"];

    await jadwal.update({

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

    });

    return res.json({
      message: "Jadwal berhasil diupdate",
      data: jadwal
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* DELETE JADWAL */
/* ===================================================== */
const deleteJadwal = async (req, res) => {

  try {

    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const jadwal = await Jadwal.findOne({
      where: {
        id_jadwal: id,
        id_tuk: tukId
      }
    });

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    await jadwal.destroy();

    return res.json({
      message: "Jadwal berhasil dihapus"
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message
    });
  }
};

/* ===================================================== */
/* DETAIL LENGKAP JADWAL */
/* ===================================================== */
const getDetailJadwalLengkap = async (req, res) => {

  try {

    const tukId = req.user?.id_tuk;
    const { id } = req.params;

    const data = await Jadwal.findOne({
      where: {
        id_jadwal: id,
        id_tuk: tukId
      },

      include: [

        /* ================= SKEMA ================= */
        {
          model: Skema,
          as: "skema",
          attributes: ["id_skema", "kode_skema", "judul_skema", "jenis_skema"]
        },

        /* ================= TUK ================= */
        {
          model: Tuk,
          as: "tuk",
          attributes: ["id_tuk", "nama_tuk", "email"]
        },

        /* ================= ASESO R YANG TERDAFTAR ================= */
        {
          model: JadwalAsesor,
          as: "asesorList",
          required: false,
          include: [

            /* USER ASESO R */
            {
              model: User,
              as: "asesor",
              attributes: [
                "id_user",
                "username",
                "email",
                "no_hp"
              ]
            },

            /* PROFILE ASESO R */
            {
              model: ProfileAsesor,
              as: "profileAsesor",
              required: false
            }

          ]
        }

      ]
    });

    if (!data) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    return res.json({
      data
    });

  } catch (err) {

    console.error("ERROR DETAIL JADWAL:", err);

    return res.status(500).json({
      message: err.message || "Terjadi kesalahan server"
    });

  }
};

module.exports = {
  getDetailJadwalLengkap,
  getSkemaTuk,
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
};