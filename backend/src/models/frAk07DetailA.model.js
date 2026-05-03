const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// FR.AK.07 Detail A (Checklist 1-8)
const FrAk07DetailA = sequelize.define("fr_ak07_detailA", {
  id_fr_ak07_detailA: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_fr_ak07: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nomor: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  aspek: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  butuh_penyesuaian: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "fr_ak07_detailA",
  timestamps: true,
});

module.exports = FrAk07DetailA;