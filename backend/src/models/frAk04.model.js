const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk04 = sequelize.define("fr_ak04", {
  id_fr_ak04: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // 🔗 RELASI
  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // 1 peserta hanya 1 banding
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tanggal_asesmen: {
    type: DataTypes.DATEONLY
  },

  // 🔥 PERTANYAAN (YA / TIDAK)
  proses_banding_dijelaskan: {
    type: DataTypes.ENUM("ya", "tidak"),
    allowNull: false
  },

  diskusi_dengan_asesor: {
    type: DataTypes.ENUM("ya", "tidak"),
    allowNull: false
  },

  melibatkan_orang_lain: {
    type: DataTypes.ENUM("ya", "tidak"),
    allowNull: false
  },

  // 🔥 ISI UTAMA
  alasan_banding: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // 🔥 TANDA TANGAN
  ttd_asesi: {
    type: DataTypes.STRING(255)
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: "fr_ak04",
  timestamps: false
});

module.exports = FrAk04;