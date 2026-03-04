const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PendaftaranAsesi = sequelize.define("pendaftaran_asesi", {
  id_pendaftaran: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nik: {
    type: DataTypes.CHAR(16),
    allowNull: false
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  no_hp: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  alamat_lengkap: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  provinsi: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  kota: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  kecamatan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  kelurahan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  wilayah_rji: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  program_studi: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  kompetensi_keahlian: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
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