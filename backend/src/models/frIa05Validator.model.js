const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05Validator = sequelize.define(
  "fr_ia_05_validator",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_fr_ia_05: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_asesor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    peran: {
      type: DataTypes.ENUM("penyusun", "validator"),
      allowNull: false,
    },

    urutan: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "fr_ia_05_validator",
    timestamps: false,
  }
);

module.exports = FrIa05Validator;