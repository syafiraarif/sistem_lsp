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


// ======================================
// HELPER GET TUK ID
// ======================================

const getTukId = async (req) => {

  let tukId = req.user?.id_tuk;

  if (!tukId) {

    const userId = req.user?.id_user;

    if (!userId) return null;

    const tuk = await Tuk.findOne({
      where: {
        id_penanggung_jawab: userId
      }
    });

    if (tuk) {
      tukId = tuk.id_tuk;
    }
  }

  return tukId;
};


// ======================================
// GET SKEMA TUK
// ======================================

const getSkemaTuk = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    if (!tukId) {
      return res.status(400).json({
        success: false,
        message: "ID TUK tidak ditemukan"
      });
    }

    const tuk = await Tuk.findByPk(tukId);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message: "TUK tidak ditemukan"
      });
    }

    const data = await Skema.findAll({

      where: {
        status: "aktif"
      },

      order: [
        ["judul_skema", "ASC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {

    console.error("GET SKEMA ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// CREATE JADWAL
// ======================================

const createJadwal = async (req, res) => {

  const transaction = await Jadwal.sequelize.transaction();

  try {

    const tukId = await getTukId(req);

    if (!tukId) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "ID TUK tidak ditemukan"
      });
    }

    // ======================================
    // VALIDASI ID SKEMA
    // ======================================

    const idSkema = parseInt(req.body.id_skema);

    if (!idSkema || isNaN(idSkema)) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "ID Skema tidak valid"
      });
    }

    // ======================================
    // VALIDASI TUK
    // ======================================

    const tuk = await Tuk.findByPk(tukId);

    if (!tuk) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "TUK tidak ditemukan"
      });
    }

    // ======================================
    // VALIDASI SKEMA
    // ======================================

    const skema = await Skema.findOne({
      where: {
        id_skema: idSkema,
        status: "aktif"
      }
    });

    if (!skema) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Skema tidak ditemukan / nonaktif"
      });
    }

    // ======================================
    // VALIDASI KUOTA
    // ======================================

    const kuota = parseInt(req.body.kuota || 0);

    if (kuota > 10) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Kuota maksimal 10 peserta"
      });
    }

    // ======================================
    // VALIDASI TANGGAL
    // ======================================

    if (
      req.body.tgl_awal &&
      req.body.tgl_akhir &&
      req.body.tgl_awal > req.body.tgl_akhir
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Tanggal awal tidak boleh melebihi tanggal akhir"
      });
    }

    // ======================================
    // ENUM
    // ======================================

    const allowedPelaksanaan = [
      "luring",
      "daring",
      "hybrid",
      "onsite"
    ];

    const allowedStatus = [
      "draft",
      "open",
      "ongoing",
      "selesai",
      "arsip"
    ];

    // ======================================
    // CREATE JADWAL
    // ======================================

    const data = await Jadwal.create({

      kode_jadwal: req.body.kode_jadwal || null,

      id_skema: idSkema,

      id_tuk: tukId,

      nama_kegiatan: req.body.nama_kegiatan,

      tgl_pra_asesmen: req.body.tgl_pra_asesmen || null,

      tahun: req.body.tahun
        ? parseInt(req.body.tahun)
        : null,

      periode_bulan: req.body.periode_bulan || null,

      gelombang: req.body.gelombang || null,

      tgl_awal: req.body.tgl_awal || null,

      tgl_akhir: req.body.tgl_akhir || null,

      jam: req.body.jam || null,

      kuota,

      pelaksanaan_uji: allowedPelaksanaan.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : "luring",

      url_agenda: req.body.url_agenda || null,

      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : "draft",

      created_by: req.user.id_user,

      created_at: new Date(),

      updated_at: new Date()

    }, { transaction });

    // ======================================
    // SIMPAN TUK SKEMA
    // ======================================

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
      success: true,
      message: "Jadwal berhasil dibuat",
      data
    });

  } catch (err) {

    await transaction.rollback();

    console.error("CREATE JADWAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// GET ALL JADWAL
// ======================================

const getAllJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    const data = await Jadwal.findAll({

      where: {
        id_tuk: tukId
      },

      include: [

        {
          model: Tuk,
          as: "tuk",
          attributes: [
            "id_tuk",
            "nama_tuk",
            "email"
          ]
        },

        {
          model: Skema,
          as: "skema",
          attributes: [
            "id_skema",
            "kode_skema",
            "judul_skema",
            "jenis_skema"
          ]
        }

      ],

      order: [
        ["created_at", "DESC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {

    console.error("GET ALL JADWAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// GET JADWAL BY ID
// ======================================

const getJadwalById = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    const { id } = req.params;

    const data = await Jadwal.findOne({

      where: {
        id_jadwal: parseInt(id),
        id_tuk: tukId
      },

      include: [

        {
          model: Tuk,
          as: "tuk"
        },

        {
          model: Skema,
          as: "skema"
        }

      ]
    });

    if (!data) {

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    return res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error("GET JADWAL BY ID ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// UPDATE JADWAL
// ======================================

const updateJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    const { id } = req.params;

    const jadwal = await Jadwal.findOne({

      where: {
        id_jadwal: parseInt(id),
        id_tuk: tukId
      }
    });

    if (!jadwal) {

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // VALIDASI KUOTA
    // ======================================

    if (req.body.kuota) {

      const kuota = parseInt(req.body.kuota);

      if (kuota > 10) {

        return res.status(400).json({
          success: false,
          message: "Kuota maksimal 10 peserta"
        });
      }
    }

    // ======================================
    // VALIDASI TANGGAL
    // ======================================

    const tglAwal = req.body.tgl_awal || jadwal.tgl_awal;
    const tglAkhir = req.body.tgl_akhir || jadwal.tgl_akhir;

    if (tglAwal > tglAkhir) {

      return res.status(400).json({
        success: false,
        message: "Tanggal awal tidak boleh melebihi tanggal akhir"
      });
    }

    // ======================================
    // ENUM
    // ======================================

    const allowedPelaksanaan = [
      "luring",
      "daring",
      "hybrid",
      "onsite"
    ];

    const allowedStatus = [
      "draft",
      "open",
      "ongoing",
      "selesai",
      "arsip"
    ];

    // ======================================
    // UPDATE
    // ======================================

    await jadwal.update({

      ...req.body,

      kuota: req.body.kuota
        ? parseInt(req.body.kuota)
        : jadwal.kuota,

      pelaksanaan_uji: allowedPelaksanaan.includes(req.body.pelaksanaan_uji)
        ? req.body.pelaksanaan_uji
        : jadwal.pelaksanaan_uji,

      status: allowedStatus.includes(req.body.status)
        ? req.body.status
        : jadwal.status,

      updated_at: new Date()

    });

    return res.json({
      success: true,
      message: "Jadwal berhasil diupdate",
      data: jadwal
    });

  } catch (err) {

    console.error("UPDATE JADWAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// DELETE JADWAL
// ======================================

const deleteJadwal = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    const { id } = req.params;

    const jadwal = await Jadwal.findOne({

      where: {
        id_jadwal: parseInt(id),
        id_tuk: tukId
      }
    });

    if (!jadwal) {

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // HAPUS ASESOR DULU
    // ======================================

    await JadwalAsesor.destroy({
      where: {
        id_jadwal: parseInt(id)
      }
    });

    // ======================================
    // HAPUS JADWAL
    // ======================================

    await jadwal.destroy();

    return res.json({
      success: true,
      message: "Jadwal berhasil dihapus"
    });

  } catch (err) {

    console.error("DELETE JADWAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// DETAIL JADWAL LENGKAP
// ======================================

const getDetailJadwalLengkap = async (req, res) => {

  try {

    const tukId = await getTukId(req);

    const { id } = req.params;

    const data = await Jadwal.findOne({

      where: {
        id_jadwal: parseInt(id),
        id_tuk: tukId
      },

      include: [

        {
          model: Skema,
          as: "skema",
          attributes: [
            "id_skema",
            "kode_skema",
            "judul_skema",
            "jenis_skema"
          ]
        },

        {
          model: Tuk,
          as: "tuk",
          attributes: [
            "id_tuk",
            "nama_tuk",
            "email"
          ]
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
              attributes: [
                "nama_lengkap",
                "gelar_depan",
                "gelar_belakang",
                "no_reg_asesor",
                "no_lisensi",
                "bidang_keahlian",
                "foto_profil"
              ]
            }

          ]
        }

      ]
    });

    if (!data) {

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    return res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error("DETAIL JADWAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
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

