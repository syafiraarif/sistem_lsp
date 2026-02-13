const JadwalTUK = require('../../models/jadwalTUK.model');
const Tuk = require('../../models/tuk.model');
const JadwalAsesor = require('../../models/jadwalAsesor.model'); 
const User = require('../../models/user.model'); 
const ProfileAsesor = require('../../models/profileAsesor.model'); 
const { Op } = require('sequelize');

const createJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk; 
    if (!tukId) {
      return res.status(400).json({ message: 'ID TUK tidak ditemukan di token.' });
    }

    const { Nama_Judul_Kegiatan, Tahun, Periode, Gelombang_Grup, Tgl_Awal_Pelaksanaan, Tgl_Akhir_Pelaksanaan, Jam, Kuota, Skema_Kompetensi, Nomor_Surat_Tugas, Sumber_Anggaran, Instansi_Pemberi_Anggaran } = req.body;

    if (!Nama_Judul_Kegiatan || !Tahun || !Skema_Kompetensi || !Sumber_Anggaran) {
      return res.status(400).json({ message: 'Field wajib: Nama_Judul_Kegiatan, Tahun, Skema_Kompetensi, Sumber_Anggaran.' });
    }
    if (Tgl_Awal_Pelaksanaan && Tgl_Akhir_Pelaksanaan && new Date(Tgl_Awal_Pelaksanaan) > new Date(Tgl_Akhir_Pelaksanaan)) {
      return res.status(400).json({ message: 'Tanggal awal pelaksanaan harus sebelum atau sama dengan tanggal akhir.' });
    }
    if (Kuota && Kuota < 0) {
      return res.status(400).json({ message: 'Kuota tidak boleh negatif.' });
    }

    const jadwal = await JadwalTUK.create({
      Nama_Judul_Kegiatan,
      Tahun,
      Periode,
      Gelombang_Grup,
      Tgl_Awal_Pelaksanaan,
      Tgl_Akhir_Pelaksanaan,
      Jam,
      Kuota,
      Skema_Kompetensi,
      TUK: tukId,
      Nomor_Surat_Tugas,
      Sumber_Anggaran,
      Instansi_Pemberi_Anggaran,
    });

    res.status(201).json({
      message: 'Jadwal berhasil dibuat.',
      data: jadwal,
    });
  } catch (error) {
    console.error('Error creating jadwal:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Data tidak valid.', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getAllJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    if (!tukId) {
      return res.status(400).json({ message: 'ID TUK tidak ditemukan di token.' });
    }

    const { tahun, periode, gelombang_grup, status } = req.query;
    const whereClause = { TUK: tukId };
    if (tahun) whereClause.Tahun = tahun;
    if (periode) whereClause.Periode = { [Op.iLike]: `%${periode}%` }; 
    if (gelombang_grup) whereClause.Gelombang_Grup = { [Op.iLike]: `%${gelombang_grup}%` };
    if (status) whereClause.status = status; 

    const jadwalList = await JadwalTUK.findAll({
      where: whereClause,
      include: [
        { model: Tuk, as: 'tuk', attributes: ['nama_tuk', 'email'] }, 
      ],
      order: [['Tahun', 'DESC'], ['Tgl_Awal_Pelaksanaan', 'DESC']], 
    });

    res.status(200).json({
      message: 'Daftar jadwal berhasil diambil.',
      data: jadwalList,
    });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getJadwalById = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id } = req.params;

    const jadwal = await JadwalTUK.findOne({
      where: { id_jadwal: id, TUK: tukId },
      include: [
        { model: Tuk, as: 'tuk', attributes: ['nama_tuk', 'email'] },
      ],
    });

    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    res.status(200).json({
      message: 'Detail jadwal berhasil diambil.',
      data: jadwal,
    });
  } catch (error) {
    console.error('Error fetching jadwal by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const updateJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id } = req.params;
    const updates = req.body;

    if (updates.Tgl_Awal_Pelaksanaan && updates.Tgl_Akhir_Pelaksanaan && new Date(updates.Tgl_Awal_Pelaksanaan) > new Date(updates.Tgl_Akhir_Pelaksanaan)) {
      return res.status(400).json({ message: 'Tanggal awal pelaksanaan harus sebelum atau sama dengan tanggal akhir.' });
    }
    if (updates.Kuota && updates.Kuota < 0) {
      return res.status(400).json({ message: 'Kuota tidak boleh negatif.' });
    }

    const jadwal = await JadwalTUK.findOne({ where: { id_jadwal: id, TUK: tukId } });
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    await jadwal.update(updates);

    res.status(200).json({
      message: 'Jadwal berhasil diperbarui.',
      data: jadwal,
    });
  } catch (error) {
    console.error('Error updating jadwal:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Data tidak valid.', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const deleteJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id } = req.params;

    const jadwal = await JadwalTUK.findOne({ where: { id_jadwal: id, TUK: tukId } });
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    await jadwal.destroy();

    res.status(200).json({
      message: 'Jadwal berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const addAsesorToJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id } = req.params; 
    const { id_user, jenis_tugas } = req.body;

    const validJenis = [
      'jadwal Asesor penguji',
      'Verifikator TUK',
      'Validator MKVA',
      'Peninjau Instrumen Asesmen'
    ];
    if (!validJenis.includes(jenis_tugas)) {
      return res.status(400).json({ message: 'Jenis tugas tidak valid.' });
    }

    const jadwal = await JadwalTUK.findOne({ where: { id_jadwal: id, TUK: tukId } });
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (jenis_tugas === 'Peninjau Instrumen Asesmen') {
      const tugas1Exists = await JadwalAsesor.findOne({
        where: {
          id_jadwal: id,
          id_user,
          jenis_tugas: 'jadwal Asesor penguji'
        }
      });
      if (tugas1Exists) {
        return res.status(400).json({ message: 'User ini sudah assigned tugas "jadwal Asesor penguji" di jadwal ini, sehingga tidak bisa dipilih untuk tugas ini.' });
      }
    }

    const existing = await JadwalAsesor.findOne({ where: { id_jadwal: id, id_user, jenis_tugas } });
    if (existing) {
      return res.status(400).json({ message: 'User sudah assigned tugas ini di jadwal ini.' });
    }

    await JadwalAsesor.create({ id_jadwal: id, id_user, jenis_tugas });

    res.status(201).json({ message: 'User berhasil ditambahkan ke jadwal dengan tugas tersebut.' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const removeAsesorFromJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id, userId } = req.params; 

    const jadwal = await JadwalTUK.findOne({ where: { id_jadwal: id, TUK: tukId } });
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    const deleted = await JadwalAsesor.destroy({ where: { id_jadwal: id, id_user: userId } });
    if (!deleted) {
      return res.status(404).json({ message: 'User tidak ditemukan di jadwal ini.' });
    }

    res.status(200).json({ message: 'User berhasil dihapus dari jadwal.' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getAsesorInJadwal = async (req, res) => {
  try {
    const tukId = req.user.id_tuk;
    const { id } = req.params;

    const jadwal = await JadwalTUK.findOne({ where: { id_jadwal: id, TUK: tukId } });
    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak milik TUK ini.' });
    }

    const userList = await JadwalAsesor.findAll({
      where: { id_jadwal: id },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['username', 'email'], 
          include: [{ model: ProfileAsesor, as: 'profileAsesor', attributes: ['nama_lengkap', 'no_reg_asesor'] }]  
        }
      ],
    });

    res.status(200).json({ message: 'Daftar user di jadwal berhasil diambil.', data: userList });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal,
  addAsesorToJadwal,
  removeAsesorFromJadwal,
  getAsesorInJadwal,
};