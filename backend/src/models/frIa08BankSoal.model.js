const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa08BankSoal = sequelize.define("fr_ia_08_bank_soal", {
  id_soal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER
  },

  id_elemen: {
    type: DataTypes.INTEGER
  },

  id_kuk: {
    type: DataTypes.INTEGER
  },

  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  jawaban_diharapkan: {
    type: DataTypes.TEXT
  },

  created_by: {
    type: DataTypes.INTEGER
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_08_bank_soal",
  timestamps: false
});

module.exports = FrIa08BankSoal;