const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa03 = sequelize.define("fr_ia_03", {
  id_fr_ia_03: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tanggal: {
    type: DataTypes.DATEONLY
  },

  created_by: DataTypes.INTEGER,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_03",
  timestamps: false
});

module.exports = FrIa03;