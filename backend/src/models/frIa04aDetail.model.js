const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa04aDetail = sequelize.define("fr_ia_04a_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_04a: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_kelompok: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  situation: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  task: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  action: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  result: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  demonstrasi: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_04a_detail",
  timestamps: false
});

module.exports = FrIa04aDetail;