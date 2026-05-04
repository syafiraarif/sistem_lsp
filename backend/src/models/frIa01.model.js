const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa01 = sequelize.define("fr_ia_01", {
  id_fr_ia_01: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  umpan_balik: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten"),
    allowNull: true
  },

  catatan_rekomendasi: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  ttd_asesor: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "fr_ia_01",
  timestamps: false
});

module.exports = FrIa01;