const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Jadwal = sequelize.define("jadwal", {
  id_jadwal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Nama_Judul_Kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  Tahun: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  Periode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  Gelombang_Grup: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  Tgl_Awal_Pelaksanaan: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  Tgl_Akhir_Pelaksanaan: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  Jam: {
    type: DataTypes.TIME,
    allowNull: true
  },

  Kuota: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  Skema_Kompetensi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  TUK: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  Nomor_Surat_Tugas: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Sumber_Anggaran: {
    type: DataTypes.STRING(150),
    allowNull: true
  },

  Instansi_Pemberi_Anggaran: {
    type: DataTypes.STRING(150),
    allowNull: true
  }

}, {
  tableName: "jadwal",
  timestamps: false
});

module.exports = Jadwal;
