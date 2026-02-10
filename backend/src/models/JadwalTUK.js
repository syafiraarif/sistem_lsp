const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sesuaikan path ke file konfigurasi database Anda

const JadwalTUK = sequelize.define('JadwalTUK', {
  id_jadwal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  Nama_Judul_Kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Periode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  Gelombang_Grup: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  Tgl_Awal_Pelaksanaan: {
    type: DataTypes.DATEONLY, // DATE untuk tipe date
    allowNull: true,
  },
  Tgl_Akhir_Pelaksanaan: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Jam: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  Kuota: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Skema_Kompetensi: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'skema', // Nama tabel skema
      key: 'id_skema',
    },
  },
  TUK: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tuk', // Nama tabel tuk
      key: 'id_tuk',
    },
  },
  Nomor_Surat_Tugas: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Sumber_Anggaran: {
    type: DataTypes.ENUM('APBN', 'APBD', 'Perusahaan', 'Sendiri'),
    allowNull: false,
  },
  Instansi_Pemberi_Anggaran: {
    type: DataTypes.STRING(255),
    allowNull: true, // Diasumsikan Yes Null berdasarkan struktur umum
  },
  status: { // Kolom tambahan untuk audit (aktif/nonaktif)
    type: DataTypes.ENUM('aktif', 'nonaktif'),
    allowNull: true,
    defaultValue: 'aktif',
  },
  created_at: { // Kolom tambahan untuk audit (timestamp pembuatan)
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'jadwal', // Diubah ke 'jadwal' untuk match SQL sebelumnya (jika tabel di DB adalah 'jadwal')
  timestamps: false, // Tidak ada createdAt/updatedAt bawaan Sequelize
  indexes: [
    { fields: ['Tahun'] }, // Index pada Tahun
    { fields: ['Skema_Kompetensi'] }, // Index pada Skema_Kompetensi
    { fields: ['TUK'] }, // Index pada TUK
    { fields: ['status'] }, // Index tambahan pada status untuk performa
  ],
});

// Relasi
JadwalTUK.associate = (models) => {
  JadwalTUK.belongsTo(models.Skema, { foreignKey: 'Skema_Kompetensi', as: 'skema' });
  JadwalTUK.belongsTo(models.Tuk, { foreignKey: 'TUK', as: 'tuk' });
};

module.exports = JadwalTUK;