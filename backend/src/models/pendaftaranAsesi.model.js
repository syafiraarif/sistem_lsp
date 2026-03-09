const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PendaftaranAsesi = sequelize.define("pendaftaran_asesi", {
  id_pendaftaran: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nik: DataTypes.CHAR(16),
  nama_lengkap: DataTypes.STRING(100),
  email: DataTypes.STRING(100),
  no_hp: DataTypes.STRING(20),
  provinsi: DataTypes.STRING(50),
  kota: DataTypes.STRING(50),
  kecamatan: DataTypes.STRING(50),
  kelurahan: DataTypes.STRING(50),
  wilayah_rji: DataTypes.STRING(100),
  program_studi: DataTypes.STRING(100),
  kompetensi_keahlian: DataTypes.STRING(100),
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending"
  },
  tanggal_daftar: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "pendaftaran_asesi",
  timestamps: false
});

module.exports = PendaftaranAsesi;