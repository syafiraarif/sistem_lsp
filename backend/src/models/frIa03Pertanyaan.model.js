const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa03Pertanyaan = sequelize.define("fr_ia_03_pertanyaan", {
  id_pertanyaan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_03: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  urutan: DataTypes.INTEGER,

  created_by: DataTypes.INTEGER,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_03_pertanyaan",
  timestamps: false
});

module.exports = FrIa03Pertanyaan;