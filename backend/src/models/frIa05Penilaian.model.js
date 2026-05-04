const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05Penilaian = sequelize.define("fr_ia_05_penilaian", {
  id_penilaian: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_fr_ia_05: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jumlah_benar: DataTypes.INTEGER,
  jumlah_salah: DataTypes.INTEGER,
  nilai: DataTypes.DECIMAL(5,2),
  hasil: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten")
  },
  umpan_balik: DataTypes.TEXT,
  catatan: DataTypes.TEXT,
  ttd_asesor: DataTypes.STRING(255),
  tanggal_penilaian: DataTypes.DATE
}, {
  tableName: "fr_ia_05_penilaian",
  timestamps: false
});

module.exports = FrIa05Penilaian;