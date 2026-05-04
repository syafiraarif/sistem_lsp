const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa04b = sequelize.define("fr_ia_04b", {
  id_fr_ia_04b: {
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

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten"),
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
  tableName: "fr_ia_04b",
  timestamps: false
});

module.exports = FrIa04b;