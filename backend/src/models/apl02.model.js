const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl02 = sequelize.define("apl02", {
  id_apl02: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("draft", "submitted"),
    defaultValue: "draft"
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "apl02",
  timestamps: false
});

module.exports = Apl02;