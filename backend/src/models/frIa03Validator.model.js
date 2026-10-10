const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa03Validator = sequelize.define(
  "fr_ia_03_validator",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_fr_ia_03: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_asesor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    peran: {
      type: DataTypes.ENUM(
        "penyusun",
        "validator"
      ),
      allowNull: false
    },
    urutan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: "fr_ia_03_validator",
    timestamps: false
  }
);

module.exports = FrIa03Validator;