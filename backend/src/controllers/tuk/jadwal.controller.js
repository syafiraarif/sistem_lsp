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


// 🔥 HELPER (TAMBAHAN, TIDAK MERUBAH FLOW)
const getTukId = async (req) => {
  let tukId = req.user?.id_tuk;

  if (!tukId) {
    const userId = req.user?.id_user;

    if (!userId) return null;

    const tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    if (tuk) tukId = tuk.id_tuk;
  }

  return tukId;
};


const getSkemaTuk = async (req, res) => {
  try {

    const tukId = await getTukId(req);

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

    const data = await Skema.findAll({
      where: { status: "aktif" } // 🔥 biar rapi
    });

    return res.json({ data });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};


const createJadwal = async (req, res) => {

  const transaction = await Jadwal.sequelize.transaction();

  try {

    const tukId = await getTukId(req);
    const idSkema = parseInt(req.body.id_skema);

    if (!tukId) {
      return res.status(400).json({
        message: "ID TUK tidak ditemukan."
      });
    }

    if (!idSkema || isNaN(idSkema)) {
      return res.status(400).json({
        message: "ID Skema tidak valid"
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

    const data = await Jadwal.create({
      kode_jadwal: req.body.kode_jadwal || null,
      id_skema: idSkema,
      id_tuk: tukId,
      nama_kegiatan: req.body.nama_kegiatan,
      tahun: req.body.tahun ? parseInt(req.body.tahun) : null,
      periode_bulan: req.body.periode_bulan || null,
      gelombang: req.body.gelombang || null,
      tgl_pra_asesmen: req.body.tgl_pra_asesmen || null,
      tgl_awal: req.body.tgl_awal || null,
      tgl_akhir: req.body.tgl_akhir || null,
      jam: req.body.jam || null,
      kuota: req.body.kuota ? parseInt(req.body.kuota) : 0,
      pelaksanaan_uji: allowedTipe.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : "luring",
      url_agenda: req.body.url_agenda || "",
      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : "draft",
      created_by: req.user?.id_user || null,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction });

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


const getAllJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);

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


const getJadwalById = async (req, res) => {

  try {

    const tukId = await getTukId(req);
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


const updateJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);
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


const deleteJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);
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


const getDetailJadwalLengkap = async (req, res) => {

  try {

    const tukId = await getTukId(req);
    const { id } = req.params;

    const data = await Jadwal.findOne({
      where: {
        id_jadwal: id,
        id_tuk: tukId
      },

      include: [

        {
          model: Skema,
          as: "skema",
          attributes: ["id_skema", "kode_skema", "judul_skema", "jenis_skema"]
        },

        {
          model: Tuk,
          as: "tuk",
          attributes: ["id_tuk", "nama_tuk", "email"]
        },
        {
          model: JadwalAsesor,
          as: "asesorList",
          required: false,
          include: [

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