const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa04a = sequelize.define("fr_ia_04a", {
  id_fr_ia_04a: {
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

  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "fr_ia_04a",
  timestamps: false
});

module.exports = FrIa04a;