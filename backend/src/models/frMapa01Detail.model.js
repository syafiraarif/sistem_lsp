const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa01Detail = sequelize.define("fr_mapa01_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_mapa01: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  bukti: DataTypes.TEXT,

  l: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  tl: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  t: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // ========================
  // METODE ASESMEN
  // ========================
  metode_observasi: {
    type: DataTypes.ENUM("CL","DIT","DPL","DPT","CVP","VPK","CRP","PW")
  },

  metode_portofolio: {
    type: DataTypes.ENUM("CL","DIT","DPL","DPT","CVP","VPK","CRP","PW")
  },

  metode_tanya: {
    type: DataTypes.ENUM("CL","DIT","DPL","DPT","CVP","VPK","CRP","PW")
  },

  metode_verifikasi: {
    type: DataTypes.ENUM("CL","DIT","DPL","DPT","CVP","VPK","CRP","PW")
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_mapa01_detail",
  timestamps: false
});

module.exports = FrMapa01Detail;