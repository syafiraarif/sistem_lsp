// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const JadwalTUK = sequelize.define('JadwalTUK', {
//   id_jadwal: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//     allowNull: false,
//   },
//   Nama_Judul_Kegiatan: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//   },
//   Tahun: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   Periode: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   Gelombang_Grup: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   Tgl_Awal_Pelaksanaan: {
//     type: DataTypes.DATEONLY,
//     allowNull: true,
//   },
//   Tgl_Akhir_Pelaksanaan: {
//     type: DataTypes.DATEONLY,
//     allowNull: true,
//   },
//   Jam: {
//     type: DataTypes.STRING(50),
//     allowNull: true,
//   },
//   Kuota: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   Skema_Kompetensi: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'skema', 
//       key: 'id_skema',
//     },
//   },
//   TUK: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'tuk', 
//       key: 'id_tuk',
//     },
//   },
//   Nomor_Surat_Tugas: {
//     type: DataTypes.STRING(100),
//     allowNull: true,
//   },
//   Sumber_Anggaran: {
//     type: DataTypes.ENUM('APBN', 'APBD', 'Perusahaan', 'Sendiri'),
//     allowNull: false,
//   },
//   Instansi_Pemberi_Anggaran: {
//     type: DataTypes.STRING(255),
//     allowNull: true, 
//   },
//   status: { 
//     type: DataTypes.ENUM('aktif', 'nonaktif'),
//     allowNull: true,
//     defaultValue: 'aktif',
//   },
//   created_at: { 
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   tableName: 'jadwal', 
//   timestamps: false, 
//   indexes: [
//     { fields: ['Tahun'] }, 
//     { fields: ['Skema_Kompetensi'] }, 
//     { fields: ['TUK'] }, 
//     { fields: ['status'] }, 
//   ],
// });

// JadwalTUK.associate = (models) => {
//   JadwalTUK.belongsTo(models.Skema, { foreignKey: 'Skema_Kompetensi', as: 'skema' });
//   JadwalTUK.belongsTo(models.Tuk, { foreignKey: 'TUK', as: 'tuk' });
// };

// module.exports = JadwalTUK;