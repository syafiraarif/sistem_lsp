const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05Jawaban = sequelize.define("fr_ia_05_jawaban", {
  id_jawaban: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_soal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_opsi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_benar: DataTypes.BOOLEAN,
  created_at: DataTypes.DATE
}, {
  tableName: "fr_ia_05_jawaban",
  timestamps: false
});

module.exports = FrIa05Jawaban;