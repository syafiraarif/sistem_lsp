const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa02Unit = sequelize.define("fr_mapa02_unit", {
  id_mapa02_unit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_mapa02: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_kelompok: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  urutan: DataTypes.INTEGER,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_mapa02_unit",
  timestamps: false
});

module.exports = FrMapa02Unit;