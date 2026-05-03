const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk02Detail = sequelize.define("fr_ak02_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ak02: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  observasi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  portofolio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  pihak_ketiga: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  wawancara: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  lisan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  tertulis: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  proyek: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  lainnya: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

}, {
  tableName: "fr_ak02_detail",
  timestamps: false
});

module.exports = FrAk02Detail;