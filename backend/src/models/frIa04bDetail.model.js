const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa04bDetail = sequelize.define("fr_ia_04b_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_04b: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_kelompok: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // ================= KOMITE =================
  lingkup: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  kesesuaian: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // ================= ASESOR =================
  tanggapan: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  pencapaian: {
    type: DataTypes.ENUM("K", "BK"),
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_04b_detail",
  timestamps: false
});

module.exports = FrIa04bDetail;