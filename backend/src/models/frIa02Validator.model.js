const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa02Validator = sequelize.define("fr_ia_02_validator", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_02: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  peran: {
    type: DataTypes.ENUM("penyusun", "validator"),
    allowNull: false
  },

  urutan: DataTypes.INTEGER

}, {
  tableName: "fr_ia_02_validator",
  timestamps: false
});

module.exports = FrIa02Validator;