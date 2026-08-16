const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const FrAk06 = sequelize.define(
  "fr_ak06",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_jadwal: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_asesor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rekomendasi_1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rekomendasi_2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    komentar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ttd_asesor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "fr_ak06",
    timestamps: false
  }
);
module.exports = FrAk06;