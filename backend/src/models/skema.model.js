const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Skema = sequelize.define("skema", {
  id_skema: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  kode_skema: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },

  judul_skema: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  judul_skema_en: DataTypes.STRING(255),

  jenis_skema: {
    type: DataTypes.ENUM("klaster", "kkni", "okupasi"),
    allowNull: false,
  },

  level_kkni: DataTypes.TINYINT,

  bidang: DataTypes.STRING(255),

  jenjang_kualifikasi: {
    type: DataTypes.ENUM(
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX"
    ),
    defaultValue: "I",
  },

  kode_sektor: DataTypes.STRING(50),

  kode_kbli: DataTypes.STRING(50),

  kode_kbji: DataTypes.STRING(50),

  nomor_revisi: DataTypes.STRING(50),

  status_dokumen: {
    type: DataTypes.ENUM("terkendali", "tidak_terkendali"),
    defaultValue: "terkendali",
  },

  dokumen: DataTypes.STRING(255),

  status: {
    type: DataTypes.ENUM("draft", "aktif", "nonaktif"),
    defaultValue: "draft",
  },

}, {
  tableName: "skema",
  timestamps: false,
});

module.exports = Skema;