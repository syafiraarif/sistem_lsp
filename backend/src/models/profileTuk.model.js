const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProfileTuk = sequelize.define("profile_tuk", {

  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },

  nik: {
    type: DataTypes.CHAR(16),
    unique: true
  },

  nama_lengkap: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  jenis_kelamin: DataTypes.ENUM("laki-laki","perempuan"),

  tempat_lahir: DataTypes.STRING(50),

  tanggal_lahir: DataTypes.DATE,

  alamat: DataTypes.TEXT,

  provinsi: DataTypes.STRING(50),

  kota: DataTypes.STRING(50),

  kecamatan: DataTypes.STRING(50),

  kelurahan: DataTypes.STRING(50),

  kode_pos: DataTypes.STRING(10),

  foto: DataTypes.STRING(255),

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: DataTypes.DATE

}, {
  tableName: "profile_tuk",
  timestamps: false
});

module.exports = ProfileTuk;