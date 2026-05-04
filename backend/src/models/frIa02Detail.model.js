const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa02Detail = sequelize.define("fr_ia_02_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_02: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_kelompok: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  skenario: DataTypes.TEXT,
  langkah_kerja: DataTypes.TEXT,
  peralatan: DataTypes.TEXT,
  durasi: DataTypes.INTEGER

}, {
  tableName: "fr_ia_02_detail",
  timestamps: false
});

module.exports = FrIa02Detail;