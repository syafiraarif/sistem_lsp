const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tuk = sequelize.define("tuk", {
  id_tuk: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  kode_tuk: {
    type: DataTypes.STRING(50),
    unique: true
  },

  nama_tuk: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  jenis_tuk: DataTypes.ENUM("mandiri","sewaktu","tempat_kerja"),

  institusi_induk: DataTypes.STRING(150),

  telepon: DataTypes.STRING(20),

  email: DataTypes.STRING(100),

  alamat: DataTypes.TEXT,

  provinsi: DataTypes.STRING(50),

  kota: DataTypes.STRING(50),

  kecamatan: DataTypes.STRING(50),

  kelurahan: DataTypes.STRING(50),

  kode_pos: DataTypes.STRING(10),

  no_lisensi: DataTypes.STRING(100),

  masa_berlaku_lisensi: DataTypes.DATE,

  status: {
    type: DataTypes.ENUM("aktif","nonaktif"),
    defaultValue: "aktif"
  },

  id_penanggung_jawab: {
    type: DataTypes.INTEGER
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "tuk",
  timestamps: false
});

module.exports = Tuk;