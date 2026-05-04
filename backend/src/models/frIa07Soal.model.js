const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa07Soal = sequelize.define("fr_ia_07_soal", {
  id_soal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_fr_ia_07: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_unit: DataTypes.INTEGER,
  id_kelompok: DataTypes.INTEGER,

  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  kunci_jawaban: DataTypes.TEXT,

  urutan: DataTypes.INTEGER
}, {
  tableName: "fr_ia_07_soal",
  timestamps: false
});

module.exports = FrIa07Soal;