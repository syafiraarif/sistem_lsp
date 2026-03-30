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
    console.log('🔍 DEBUG - manageAsesor:', {
      id: req.params.id,
      jenisTugas: req.params.jenisTugas,
      user: req.user,
      body: req.body
    });

    const { id, jenisTugas } = req.params;
    const { listAsesor } = req.body;

    // Validasi input
    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      await t.rollback();
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    if (!Array.isArray(listAsesor) || listAsesor.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "List asesor wajib diisi" });
    }

    // ✅ Cek jadwal
    const jadwal = await Jadwal.findOne({
      where: { 
        id_jadwal: id, 
        id_tuk: req.user.id_tuk 
      },
      transaction: t
    });

    console.log('🔍 JADWAL:', jadwal ? 'FOUND' : 'NOT FOUND');

    if (!jadwal) {
      await t.rollback();
      return res.status(404).json({ 
        message: `Jadwal ${id} tidak ditemukan untuk TUK ${req.user.id_tuk}` 
      });
    }

    // 🔥 FIXED: Validasi asesor dengan ALIAS BENAR
    const validAsesorIds = [];
    const invalidAsesorIds = [];
    
    for (const item of listAsesor) {
      if (!item.id_user) {
        console.log('⚠️ Skip invalid id_user:', item);
        continue;
      }

      // ✅ FIXED: Alias User = 'user' sesuai model
      const asesorProfile = await ProfileAsesor.findOne({
        where: { id_user: item.id_user },
        include: [{
          model: User,
          as: 'user', // 🔥 FIXED: Alias BENAR
          attributes: ['status_user'],
          where: { status_user: 'aktif' },
          required: true
        }],
        transaction: t
      });

      if (asesorProfile) {
        validAsesorIds.push(item.id_user);
        console.log('✅ Valid asesor:', item.id_user);
      } else {
        invalidAsesorIds.push(item.id_user);
        console.log('❌ Invalid asesor:', item.id_user);
      }
    }

    console.log('📊 Valid asesor IDs:', validAsesorIds);
    console.log('📊 Invalid asesor IDs:', invalidAsesorIds);

    if (validAsesorIds.length === 0) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Tidak ada asesor yang valid", 
        invalid: invalidAsesorIds 
      });
    }

    // ✅ Cek existing records
    const existingRecords = await JadwalAsesor.findAll({
      where: {
        id_jadwal: id,
        id_user: { [Op.in]: validAsesorIds },
        jenis_tugas: jenisTugas
      },
      transaction: t
    });

    console.log('📊 Existing records:', existingRecords.length);

    const newRecords = validAsesorIds.filter(id_user => 
      !existingRecords.some(record => record.id_user === parseInt(id_user))
    );

    console.log('📊 New records to create:', newRecords);

    let baruCount = 0;
    if (newRecords.length > 0) {
      const createdRecords = await JadwalAsesor.bulkCreate(
        newRecords.map(id_user => ({
          id_jadwal: parseInt(id),
          id_user: parseInt(id_user),
          jenis_tugas: jenisTugas,
          assigned_by: parseInt(req.user.id_user),
          status: 'aktif'
        })),
        { 
          transaction: t,
          validate: true
        }
      );
      baruCount = createdRecords.length;
      console.log('✅ Created records:', baruCount);
    }

    await t.commit();
    console.log('🎉 Transaction committed successfully');

    res.json({
      message: `Asesor (${jenisTugas}) berhasil ditambahkan`,
      baru: baruCount,
      sudah_ada: existingRecords.length,
      total: baruCount + existingRecords.length,
      valid_ids: validAsesorIds
    });

  } catch (err) {
    await t.rollback();
    console.error('💥 Manage Asesor FULL ERROR:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    res.status(500).json({
      message: "Server error",
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined // ✅ FIXED: Syntax lengkap
    });
  }
};

const listAsesorJadwal = async (req, res) => {
  try {
    console.log('🔍 DEBUG - listAsesorJadwal:', req.params);
    
    const { id, jenisTugas } = req.params;

    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    const jadwal = await Jadwal.findOne({
      where: { 
        id_jadwal: id, 
        id_tuk: req.user.id_tuk 
      }
    });

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    // 🔥 FIXED: Include dengan ALIAS BENAR
    const data = await JadwalAsesor.findAll({
      where: {
        id_jadwal: id,
        jenis_tugas: jenisTugas,
        status: 'aktif'
      },
      include: [
        {
          model: User,
          as: 'asesor',
          attributes: ['id_user', 'no_hp', 'username'],
          required: true,
          where: { status_user: 'aktif' }
        },
        {
          model: ProfileAsesor,
          as: 'profileAsesor',
          attributes: ['nama_lengkap', 'no_reg_asesor', 'no_lisensi', 'gelar_depan', 'gelar_belakang'],
          required: true
        },
        {
          model: User,
          as: 'assigner',
          attributes: ['id_user', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const result = data.map(item => ({
      id: `${item.id_jadwal}-${item.id_user}-${item.jenis_tugas}`,
      id_user: item.id_user,
      nama_lengkap: `${item.profileAsesor?.gelar_depan || ''} ${item.profileAsesor?.nama_lengkap || ''} ${item.profileAsesor?.gelar_belakang || ''}`.trim() || 'N/A',
      no_reg_asesor: item.profileAsesor?.no_reg_asesor || null,
      no_lisensi: item.profileAsesor?.no_lisensi || null,
      no_hp: item.asesor?.no_hp || null,
      username: item.asesor?.username || null,
      assigned_by: item.assigner?.username || null,
      status: item.status,
      jenis_tugas: item.jenis_tugas,
      createdAt: item.created_at
    }));

    res.json({ 
      data: result,
      total: result.length,
      jadwal: {
        id_jadwal: id,
        nama_kegiatan: jadwal.nama_kegiatan
      }
    });

  } catch (err) {
    console.error('💥 List Asesor Error:', err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

const removeAsesor = async (req, res) => {
  const t = await JadwalAsesor.sequelize.transaction();

  try {
    console.log('🔍 DEBUG - removeAsesor:', req.params);
    
    const { id, jenisTugas, idUser } = req.params;

    if (!ALLOWED_JENIS_TUGAS.includes(jenisTugas)) {
      await t.rollback();
      return res.status(400).json({ message: "Jenis tugas tidak valid" });
    }

    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id, id_tuk: req.user.id_tuk },
      transaction: t
    });

    if (!jadwal) {
      await t.rollback();
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const deleted = await JadwalAsesor.destroy({
      where: {
        id_jadwal: parseInt(id),
        id_user: parseInt(idUser),
        jenis_tugas: jenisTugas
      },
      transaction: t
    });

    console.log('🗑️ Deleted count:', deleted);

    if (!deleted) {
      await t.rollback();
      return res.status(404).json({
        message: "Asesor tidak ditemukan pada jenis tugas ini"
      });
    }

    await t.commit();
    res.json({ 
      message: "Asesor berhasil dihapus",
      deleted: true,
      id_user: idUser,
      jenis_tugas: jenisTugas
    });

  } catch (err) {
    await t.rollback();
    console.error('💥 Remove Asesor Error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAsesorTuk = async (req, res) => {
  try {
    console.log('🔍 DEBUG - getAsesorTuk');
    
    // 🔥 FIXED: Alias User = 'user'
    const asesors = await ProfileAsesor.findAll({
      include: [
        {
          model: User,
          as: 'user', // ✅ Alias BENAR
          where: {
            status_user: 'aktif'
          },
          attributes: ['id_user', 'username', 'no_hp', 'email'],
          required: true
        }
      ],
      where: {
        status_asesor: 'aktif'
      },
      attributes: [
        'id_user', 
        'nama_lengkap', 
        'no_reg_asesor', 
        'no_lisensi', 
        'gelar_depan', 
        'gelar_belakang',
        'bidang_keahlian'
      ],
      order: [['nama_lengkap', 'ASC']]
    });

    const result = asesors.map(item => ({
      id_user: item.id_user,
      nama_lengkap: `${item.gelar_depan || ''} ${item.nama_lengkap || ''} ${item.gelar_belakang || ''}`.trim(),
      no_reg_asesor: item.no_reg_asesor || null,
      no_lisensi: item.no_lisensi || null,
      bidang_keahlian: item.bidang_keahlian || null,
      no_hp: item.user?.no_hp || null,
      email: item.user?.email || null,
      username: item.user?.username || null
    }));

    console.log('✅ getAsesorTuk success:', result.length, 'asesors');

    res.json({ 
      data: result,
      total: result.length 
    });

  } catch (err) {
    console.error('💥 Get Asesor TUK Error:', err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

const getJenisTugasAvailable = async (req, res) => {
  try {
    res.json({ 
      data: ALLOWED_JENIS_TUGAS,
      message: "Jenis tugas yang tersedia"
    });
  } catch (err) {
    console.error('💥 getJenisTugasAvailable Error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  manageAsesor,
  listAsesorJadwal,
  removeAsesor,
  getAsesorTuk,
  getJenisTugasAvailable
};