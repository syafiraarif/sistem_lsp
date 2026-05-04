const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05Soal = sequelize.define("fr_ia_05_soal", {
  id_soal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_fr_ia_05: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_kelompok: DataTypes.INTEGER,
  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  gambar: DataTypes.STRING(255),
  urutan: DataTypes.INTEGER
}, {
  tableName: "fr_ia_05_soal",
  timestamps: false
});

module.exports = FrIa05Soal;