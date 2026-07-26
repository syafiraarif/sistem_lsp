const {
  Jadwal,
  User,
  ProfileAsesor,
  JadwalAsesor
} = require("../../models");

const { Op } = require("sequelize");


// ======================================
// RULE JENIS TUGAS
// ======================================

const JENIS_TUGAS_RULE = {

  asesor_penguji: {
    min: 1,
    dynamic: true
  },

  verifikator_tuk: {
    min: 2,
    max: 2
  },

  validator_mkva: {
    min: 2,
    max: 3
  },

  komite_teknis: {
    min: 1,
    max: 3
  }
};


// ======================================
// MANAGE ASESOR
// ======================================

const manageAsesor = async (req, res) => {

  const transaction =
    await JadwalAsesor.sequelize.transaction();

  try {

    const { id, jenisTugas } = req.params;

    const { listAsesor } = req.body;

    // ======================================
    // VALIDASI JENIS TUGAS
    // ======================================

    if (!JENIS_TUGAS_RULE[jenisTugas]) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Jenis tugas tidak valid"
      });
    }

    // ======================================
    // VALIDASI LIST ASESOR
    // ======================================

    if (
      !Array.isArray(listAsesor) ||
      listAsesor.length === 0
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "List asesor wajib diisi"
      });
    }

    // ======================================
    // CEK JADWAL
    // ======================================

    const jadwal =
      await Jadwal.findOne({

      where: {
        id_jadwal:
          parseInt(id),

        id_tuk:
          req.user.id_tuk
      },

      transaction
    });

    if (!jadwal) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // HANYA JADWAL OPEN
    // ======================================

    if (jadwal.status !== "open") {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Asesor hanya bisa ditambahkan pada jadwal open"
      });
    }

    // ======================================
    // AMBIL ID USER
    // ======================================

    const asesorIds =
      listAsesor.map(item =>
        parseInt(item.id_user)
      );

    // ======================================
    // VALIDASI DUPLIKAT
    // ======================================

    const uniqueIds =
      [...new Set(asesorIds)];

    if (
      uniqueIds.length !== asesorIds.length
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Terdapat asesor duplicate"
      });
    }

    // ======================================
    // VALIDASI JUMLAH ASESOR
    // ======================================

    const rule =
      JENIS_TUGAS_RULE[jenisTugas];

    // ======================================
    // KHUSUS ASESOR PENGUJI
    // 1 ASESOR = 10 ASESI
    // ======================================

    if (
      jenisTugas === "asesor_penguji"
    ) {

      const totalAsesorNeeded =
        Math.ceil(
          jadwal.kuota / 10
        );

      if (
        listAsesor.length !==
        totalAsesorNeeded
      ) {

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Kuota ${jadwal.kuota} peserta membutuhkan ${totalAsesorNeeded} asesor penguji`
        });
      }
    }

    // ======================================
    // VALIDASI FIXED TEAM
    // ======================================

    else {

      if (
        listAsesor.length <
        rule.min
      ) {

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Minimal ${rule.min} asesor untuk ${jenisTugas}`
        });
      }

      if (
        listAsesor.length >
        rule.max
      ) {

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Maksimal ${rule.max} asesor untuk ${jenisTugas}`
        });
      }
    }

    // ======================================
    // VALIDASI ASESOR AKTIF
    // ======================================

    const asesorValid =
      await ProfileAsesor.findAll({

      where: {

        id_user: {
          [Op.in]:
            asesorIds
        },

        status_asesor:
          "aktif"
      },

      include: [
        {
          model: User,
          as: "user",
          required: true,
          where: {
            status_user:
              "aktif"
          },
          attributes: [
            "id_user",
            "username",
            "email",
            "no_hp"
          ]
        }
      ],

      transaction
    });

    if (
      asesorValid.length !==
      asesorIds.length
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Terdapat asesor tidak valid / nonaktif"
      });
    }

    // ======================================
    // VALIDASI BENTROK JADWAL
    // ======================================

    const bentrok =
      await JadwalAsesor.findAll({

      include: [
        {
          model: Jadwal,
          required: true,

          where: {

            status: {
              [Op.in]: [
                "open",
                "ongoing"
              ]
            },

            [Op.or]: [

              {
                tgl_awal:
                  jadwal.tgl_awal
              },

              {
                tgl_akhir:
                  jadwal.tgl_akhir
              }
            ]
          }
        }
      ],

      where: {

        id_user: {
          [Op.in]:
            asesorIds
        },

        status: "aktif",

        id_jadwal: {
          [Op.ne]:
            parseInt(id)
        }
      },

      transaction
    });

    if (bentrok.length > 0) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Terdapat asesor yang sudah memiliki jadwal pada tanggal tersebut"
      });
    }

    // ======================================
    // HAPUS DATA LAMA
    // ======================================

    await JadwalAsesor.destroy({

      where: {

        id_jadwal:
          parseInt(id),

        jenis_tugas:
          jenisTugas
      },

      transaction
    });

    // ======================================
    // INSERT BARU
    // ======================================

    const payload =
      asesorIds.map(id_user => ({

      id_jadwal:
        parseInt(id),

      id_user:
        parseInt(id_user),

      jenis_tugas:
        jenisTugas,

      status: "aktif",

      assigned_by:
        req.user.id_user,

      created_at:
        new Date()

    }));

    await JadwalAsesor.bulkCreate(
      payload,
      { transaction }
    );

    await transaction.commit();

    return res.json({
      success: true,
      message:
        `${jenisTugas} berhasil disimpan`,
      total: payload.length,
      data: payload
    });

  } catch (err) {

    await transaction.rollback();

    console.error(
      "MANAGE ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// LIST ASESOR JADWAL
// ======================================

const listAsesorJadwal = async (req, res) => {

  try {

    const { id, jenisTugas } =
      req.params;

    if (
      !JENIS_TUGAS_RULE[jenisTugas]
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Jenis tugas tidak valid"
      });
    }

    const jadwal =
      await Jadwal.findOne({

      where: {
        id_jadwal:
          parseInt(id),

        id_tuk:
          req.user.id_tuk
      }
    });

    if (!jadwal) {

      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    const data =
      await JadwalAsesor.findAll({

      where: {

        id_jadwal:
          parseInt(id),

        jenis_tugas:
          jenisTugas,

        status: "aktif"
      },

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

    console.error(
      "LIST ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// REMOVE ASESOR
// ======================================

const removeAsesor = async (req, res) => {

  const transaction =
    await JadwalAsesor.sequelize.transaction();

  try {

    const {
      id,
      jenisTugas,
      idUser
    } = req.params;

    if (
      !JENIS_TUGAS_RULE[jenisTugas]
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Jenis tugas tidak valid"
      });
    }

    const jadwal =
      await Jadwal.findOne({

      where: {
        id_jadwal:
          parseInt(id),

        id_tuk:
          req.user.id_tuk
      },

      transaction
    });

    if (!jadwal) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // HANYA OPEN / DRAFT
    // ======================================

    if (
      !["draft", "open"]
        .includes(jadwal.status)
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Asesor tidak bisa dihapus pada jadwal ongoing/selesai"
      });
    }

    const deleted =
      await JadwalAsesor.destroy({

      where: {

        id_jadwal:
          parseInt(id),

        id_user:
          parseInt(idUser),

        jenis_tugas:
          jenisTugas
      },

      transaction
    });

    if (!deleted) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Asesor tidak ditemukan"
      });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message:
        "Asesor berhasil dihapus"
    });

  } catch (err) {

    await transaction.rollback();

    console.error(
      "REMOVE ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// GET SEMUA ASESOR
// ======================================

const getAsesorTuk = async (req, res) => {

  try {

    const data =
      await ProfileAsesor.findAll({

      where: {
        status_asesor:
          "aktif"
      },

      include: [
        {
          model: User,
          as: "user",

          required: true,

          where: {
            status_user:
              "aktif"
          },

          attributes: [
            "id_user",
            "username",
            "email",
            "no_hp"
          ]
        }
      ],

      attributes: [
        "id_user",
        "nama_lengkap",
        "gelar_depan",
        "gelar_belakang",
        "no_reg_asesor",
        "no_lisensi",
        "bidang_keahlian",
        "foto_profil"
      ],

      order: [
        ["nama_lengkap", "ASC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {

    console.error(
      "GET ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// JENIS TUGAS AVAILABLE
// ======================================

const getJenisTugasAvailable =
  async (req, res) => {

  try {

    return res.json({

      success: true,

      data: [

        {
          jenis_tugas:
            "asesor_penguji",

          keterangan:
            "1 asesor menangani maksimal 10 asesi"
        },

        {
          jenis_tugas:
            "verifikator_tuk",

          minimal: 2,
          maksimal: 2
        },

        {
          jenis_tugas:
            "validator_mkva",

          minimal: 2,
          maksimal: 3
        },

        {
          jenis_tugas:
            "komite_teknis",

          minimal: 1,
          maksimal: 3
        }

      ]
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  manageAsesor,
  listAsesorJadwal,
  removeAsesor,
  getAsesorTuk,
  getJenisTugasAvailable
};