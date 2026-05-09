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
  asesor_penguji: 1,
  verifikator_tuk: 1,
  validator_mkva: 2,
  komite_teknis: 1
};


// ======================================
// MANAGE ASESOR
// ======================================

const manageAsesor = async (req, res) => {

  const transaction = await JadwalAsesor.sequelize.transaction();

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

    if (!Array.isArray(listAsesor) || listAsesor.length === 0) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "List asesor wajib diisi"
      });
    }

    // ======================================
    // VALIDASI MAX ASESOR
    // ======================================

    const maxAsesor = JENIS_TUGAS_RULE[jenisTugas];

    if (listAsesor.length > maxAsesor) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Maksimal ${maxAsesor} asesor untuk ${jenisTugas}`
      });
    }

    // ======================================
    // CEK JADWAL
    // ======================================

    const jadwal = await Jadwal.findOne({
      where: {
        id_jadwal: parseInt(id),
        id_tuk: req.user.id_tuk
      },
      transaction
    });

    if (!jadwal) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // AMBIL ID USER
    // ======================================

    const asesorIds = listAsesor.map(item =>
      parseInt(item.id_user)
    );

    // ======================================
    // VALIDASI DUPLIKAT
    // ======================================

    const uniqueIds = [...new Set(asesorIds)];

    if (uniqueIds.length !== asesorIds.length) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Terdapat asesor duplicate"
      });
    }

    // ======================================
    // VALIDASI ASESOR AKTIF
    // ======================================

    const asesorValid = await ProfileAsesor.findAll({

      where: {
        id_user: {
          [Op.in]: asesorIds
        },
        status_asesor: "aktif"
      },

      include: [
        {
          model: User,
          as: "user",
          required: true,
          where: {
            status_user: "aktif"
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

    if (asesorValid.length !== asesorIds.length) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Terdapat asesor tidak valid / nonaktif"
      });
    }

    // ======================================
    // HAPUS DATA LAMA
    // ======================================

    await JadwalAsesor.destroy({
      where: {
        id_jadwal: parseInt(id),
        jenis_tugas: jenisTugas
      },
      transaction
    });

    // ======================================
    // INSERT BARU
    // ======================================

    const payload = asesorIds.map(id_user => ({

      id_jadwal: parseInt(id),

      id_user: parseInt(id_user),

      jenis_tugas: jenisTugas,

      status: "aktif",

      assigned_by: req.user.id_user,

      created_at: new Date()

    }));


    await JadwalAsesor.bulkCreate(payload, {
      transaction
    });

    await transaction.commit();

    return res.json({
      success: true,
      message: `${jenisTugas} berhasil disimpan`,
      total: payload.length,
      data: payload
    });

  } catch (err) {

    await transaction.rollback();

    console.error("MANAGE ASESOR ERROR:", err);

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

    const { id, jenisTugas } = req.params;

    // ======================================
    // VALIDASI JENIS TUGAS
    // ======================================

    if (!JENIS_TUGAS_RULE[jenisTugas]) {

      return res.status(400).json({
        success: false,
        message: "Jenis tugas tidak valid"
      });
    }

    // ======================================
    // CEK JADWAL
    // ======================================

    const jadwal = await Jadwal.findOne({
      where: {
        id_jadwal: parseInt(id),
        id_tuk: req.user.id_tuk
      }
    });

    if (!jadwal) {

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // GET DATA
    // ======================================

    const data = await JadwalAsesor.findAll({

      where: {
        id_jadwal: parseInt(id),
        jenis_tugas: jenisTugas,
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

    console.error("LIST ASESOR ERROR:", err);

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

  const transaction = await JadwalAsesor.sequelize.transaction();

  try {

    const { id, jenisTugas, idUser } = req.params;

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
    // CEK JADWAL
    // ======================================

    const jadwal = await Jadwal.findOne({
      where: {
        id_jadwal: parseInt(id),
        id_tuk: req.user.id_tuk
      },
      transaction
    });

    if (!jadwal) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // ======================================
    // DELETE
    // ======================================

    const deleted = await JadwalAsesor.destroy({

      where: {
        id_jadwal: parseInt(id),
        id_user: parseInt(idUser),
        jenis_tugas: jenisTugas
      },

      transaction
    });

    if (!deleted) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Asesor tidak ditemukan"
      });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: "Asesor berhasil dihapus"
    });

  } catch (err) {

    await transaction.rollback();

    console.error("REMOVE ASESOR ERROR:", err);

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

    const data = await ProfileAsesor.findAll({

      where: {
        status_asesor: "aktif"
      },

      include: [
        {
          model: User,
          as: "user",
          required: true,
          where: {
            status_user: "aktif"
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

    console.error("GET ASESOR ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ======================================
// JENIS TUGAS AVAILABLE
// ======================================

const getJenisTugasAvailable = async (req, res) => {

  try {

    return res.json({
      success: true,
      data: [
        {
          jenis_tugas: "asesor_penguji",
          maksimal: 1
        },
        {
          jenis_tugas: "verifikator_tuk",
          maksimal: 1
        },
        {
          jenis_tugas: "validator_mkva",
          maksimal: 2
        },
        {
          jenis_tugas: "komite_teknis",
          maksimal: 1
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

