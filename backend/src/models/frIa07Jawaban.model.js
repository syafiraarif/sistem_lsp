const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa07Jawaban = sequelize.define("fr_ia_07_jawaban", {
  id_jawaban: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_07: { // 🔥 WAJIB ADA
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_soal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  jawaban_asesi: DataTypes.TEXT,

  pencapaian: {
    type: DataTypes.ENUM("ya", "tidak")
  },

  created_by: { // 🔥 OPTIONAL TAPI BAGUS
    type: DataTypes.INTEGER
  },

  created_at: DataTypes.DATE

}, {
  tableName: "fr_ia_07_jawaban",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_peserta", "id_soal"]
    }
  ]
});

module.exports = FrIa07Jawaban;