const { Jadwal, User, ProfileAsesor, JadwalAsesor } = require("../../models");
const { Op } = require("sequelize");
const ALLOWED_JENIS_TUGAS = [
  'asesor_penguji',
  'verifikator_tuk',
  'validator_mkva',
  'komite_teknis'
];

const manageAsesor = async (req, res) => {
  const t = await JadwalAsesor.sequelize.transaction();

  try {
    const { id, jenisTugas } = req.params;
    const { listAsesor } = req.body;

    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      await t.rollback();
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    if (!Array.isArray(listAsesor) || listAsesor.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "List asesor wajib diisi" });
    }

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: req.user.id_tuk }
    });

    if (!jadwal) {
      await t.rollback();
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    for (const item of listAsesor) {
      if (!item.id_user) continue;

      const user = await User.findByPk(item.id_user);
      if (!user) continue;

      await JadwalAsesor.findOrCreate({
        where: {
          id_jadwal: id,
          id_user: item.id_user,
          jenis_tugas: jenisTugas
        },
        defaults: {
          assigned_by: req.user.id_user,
          status: 'aktif'
        },
        transaction: t
      });
    }

    await t.commit();

    res.json({
      message: `Asesor (${jenisTugas}) berhasil ditambahkan`
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const listAsesorJadwal = async (req, res) => {
  try {
    const { id, jenisTugas } = req.params;

    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: req.user.id_tuk }
    });

    if (!jadwal)
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    const data = await JadwalAsesor.findAll({
      where: {
        id_jadwal: id,
        jenis_tugas: jenisTugas
      },
      include: [
        {
          model: User,
          as: 'asesor',
          attributes: ['no_hp']
        },
        {
          model: ProfileAsesor,
          as: 'profileAsesor',
          attributes: ['nama_lengkap', 'no_reg_asesor', 'no_lisensi']
        }
      ]
    });

    const result = data.map(item => ({
      id_user: item.id_user,
      nama_lengkap: item.profileAsesor?.nama_lengkap || null,
      no_reg_asesor: item.profileAsesor?.no_reg_asesor || null,
      no_lisensi: item.profileAsesor?.no_lisensi || null,
      no_hp: item.asesor?.no_hp || null,
      status: item.status
    }));

    res.json({ data: result });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const removeAsesor = async (req, res) => {
  try {
    const { id, jenisTugas, idUser } = req.params;

    // Validasi jenis tugas
    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: req.user.id_tuk }
    });

    if (!jadwal)
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    const deleted = await JadwalAsesor.destroy({
      where: {
        id_jadwal: id,
        id_user: idUser,
        jenis_tugas: jenisTugas
      }
    });

    if (!deleted)
      return res.status(404).json({
        message: "Asesor tidak ditemukan pada jenis tugas ini"
      });

    res.json({ message: "Asesor berhasil dihapus" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  manageAsesor,
  listAsesorJadwal,
  removeAsesor
};