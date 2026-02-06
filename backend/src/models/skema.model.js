const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Skema = sequelize.define("skema", {
  id_skema: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kode_skema: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  judul_skema: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  judul_skema_en: DataTypes.STRING(255),

  jenis_skema: {
    type: DataTypes.ENUM("Klaster", "KKNI", "Okupasi"),
    allowNull: false
  },
  level_kkni: DataTypes.TINYINT,

  bidang_okupasi: DataTypes.STRING(255),
  kode_sektor: DataTypes.STRING(50),
  kode_kbli: DataTypes.STRING(50),
  kode_kbji: DataTypes.STRING(50),

  skema_induk_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  keterangan_bukti: DataTypes.TEXT,
  skor_min_ai05: DataTypes.INTEGER,

  kedalaman_bukti: DataTypes.ENUM(
    "Elemen Kompetensi",
    "Kriteria Unjuk Kerja"
  ),

  dokumen: DataTypes.STRING(255),
  status: {
    type: DataTypes.ENUM("aktif", "nonaktif"),
    defaultValue: "aktif"
  },

  skkni_id: DataTypes.INTEGER
}, {
  tableName: "skema",
  timestamps: false
});

module.exports = Skema;
