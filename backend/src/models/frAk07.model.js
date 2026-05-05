const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// FR.AK.07 Main Table
const FrAk07 = sequelize.define("fr_ak07", {
  id_fr_ak07: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_asesi: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  potensi_asesi: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ttd_asesor: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: "fr_ak07",
  timestamps: true,  // Automatically add createdAt and updatedAt
});

module.exports = FrAk07;