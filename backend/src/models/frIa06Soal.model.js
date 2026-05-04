const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa06Soal = sequelize.define("fr_ia_06_soal", {
  id_soal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_fr_ia_06: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_kelompok: DataTypes.INTEGER,
  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  jawaban_referensi: DataTypes.TEXT,
  urutan: DataTypes.INTEGER
}, {
  tableName: "fr_ia_06_soal",
  timestamps: false
});

module.exports = FrIa06Soal;