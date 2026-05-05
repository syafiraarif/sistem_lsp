const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa06Jawaban = sequelize.define("fr_ia_06_jawaban", {
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
  jawaban_asesi: DataTypes.TEXT,

  pencapaian: {
    type: DataTypes.ENUM("ya", "tidak")
  },

  catatan_asesor: DataTypes.TEXT,

  created_at: DataTypes.DATE
}, {
  tableName: "fr_ia_06_jawaban",
  timestamps: false,

  // ✅ HARUS DI SINI
  indexes: [
    {
      unique: true,
      fields: ["id_peserta", "id_soal"]
    }
  ]
});

module.exports = FrIa06Jawaban;