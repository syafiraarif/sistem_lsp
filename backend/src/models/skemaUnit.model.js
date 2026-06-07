const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SkemaUnit = sequelize.define(
  "skema_unit",
  {
    id_skema: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_kelompok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    urutan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    tableName: "skema_unit",
    timestamps: false,
  }
);

module.exports = SkemaUnit;