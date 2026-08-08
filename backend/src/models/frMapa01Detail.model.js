const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa01Detail = sequelize.define(
  "fr_mapa01_detail",
  {
    id_detail: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_mapa01: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    bukti: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    l: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    tl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    t: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    metode_observasi: {
      type: DataTypes.ENUM(
        "CL",
        "DIT",
        "DPL",
        "DPT",
        "CVP",
        "VPK",
        "CRP",
        "PW"
      ),
      allowNull: true,
    },

    metode_portofolio: {
      type: DataTypes.ENUM(
        "CL",
        "DIT",
        "DPL",
        "DPT",
        "CVP",
        "VPK",
        "CRP",
        "PW"
      ),
      allowNull: true,
    },

    metode_tanya: {
      type: DataTypes.ENUM(
        "CL",
        "DIT",
        "DPL",
        "DPT",
        "CVP",
        "VPK",
        "CRP",
        "PW"
      ),
      allowNull: true,
    },

    metode_verifikasi: {
      type: DataTypes.ENUM(
        "CL",
        "DIT",
        "DPL",
        "DPT",
        "CVP",
        "VPK",
        "CRP",
        "PW"
      ),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "fr_mapa01_detail",
    timestamps: false,
  }
);

module.exports = FrMapa01Detail;