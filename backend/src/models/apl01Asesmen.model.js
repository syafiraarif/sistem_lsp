const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl01Asesmen = sequelize.define("apl01_asesmen", {
  id_apl01: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tujuan_asesmen: {
    type: DataTypes.ENUM(
      "sertifikasi",
      "sertifikasi_ulang",
      "pkk",
      "rpl",
      "lainnya"
    ),
    defaultValue: "sertifikasi"
  },

  tujuan_lainnya: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM(
      "draft",
      "submit",
      "verifikasi",
      "disetujui",
      "ditolak"
    ),
    defaultValue: "draft"
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: "apl01_asesmen",
  timestamps: false
});

module.exports = Apl01Asesmen;