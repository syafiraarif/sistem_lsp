const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl02Detail = sequelize.define("apl02_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_apl02: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_elemen: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  kompeten: {
    type: DataTypes.ENUM("K", "BK"),
    allowNull: false
  },

  catatan: {
    type: DataTypes.TEXT
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "apl02_detail",
  timestamps: false
});

module.exports = Apl02Detail;