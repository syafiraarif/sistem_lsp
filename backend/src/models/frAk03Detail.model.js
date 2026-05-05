const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk03Detail = sequelize.define("fr_ak03_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ak03: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  kode_pertanyaan: {
    type: DataTypes.STRING(10)
  },

  pertanyaan: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  jawaban: {
    type: DataTypes.ENUM("ya", "tidak"),
    allowNull: false
  },

  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ak03_detail",
  timestamps: false
});

module.exports = FrAk03Detail;