const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa07Penilaian = sequelize.define("fr_ia_07_penilaian", {
  id_penilaian: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_fr_ia_07: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  hasil: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten")
  },

  umpan_balik: DataTypes.TEXT,
  rekomendasi: DataTypes.TEXT,

  ttd_asesor: DataTypes.STRING(255),
  tanggal_penilaian: DataTypes.DATE
}, {
  tableName: "fr_ia_07_penilaian",
  timestamps: false
});

module.exports = FrIa07Penilaian;