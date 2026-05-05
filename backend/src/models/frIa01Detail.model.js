const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa01Detail = sequelize.define("fr_ia_01_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_01: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  id_elemen: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  id_kuk: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  standar_industri: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  pencapaian: {
    type: DataTypes.ENUM("ya", "tidak"),
    allowNull: true
  },

  penilaian_lanjut: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_01_detail",
  timestamps: false
});

module.exports = FrIa01Detail;