const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk06Detail = sequelize.define("fr_ak06_detail", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ak06: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  aspek: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // prinsip asesmen
  validitas: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reliabel: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fleksibel: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  adil: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // dimensi kompetensi
  task_skills: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  task_management: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  contingency_management: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  job_role: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  transfer_skills: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: "fr_ak06_detail",
  timestamps: false
});

module.exports = FrAk06Detail;