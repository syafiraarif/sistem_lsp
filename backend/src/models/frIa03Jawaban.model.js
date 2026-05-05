const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa03Jawaban = sequelize.define("fr_ia_03_jawaban", {
  id_jawaban: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_pertanyaan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tanggapan: DataTypes.TEXT,

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten")
  },

  umpan_balik: DataTypes.TEXT,

  ttd_asesor: DataTypes.STRING

}, {
  tableName: "fr_ia_03_jawaban",
  timestamps: false
});

module.exports = FrIa03Jawaban;