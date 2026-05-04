const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05Opsi = sequelize.define("fr_ia_05_opsi", {
  id_opsi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_soal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kode_opsi: {
    type: DataTypes.CHAR(1),
    allowNull: false
  },
  jawaban: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_benar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "fr_ia_05_opsi",
  timestamps: false
});

module.exports = FrIa05Opsi;