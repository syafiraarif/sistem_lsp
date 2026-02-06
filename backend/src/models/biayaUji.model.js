const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BiayaUji = sequelize.define("biaya_uji", {
  id_biaya: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jenis_biaya: {
    type: DataTypes.ENUM("Uji Kompetensi", "Pra Asesmen", "Lainnya"),
    allowNull: false
  },
  metode_uji: {
    type: DataTypes.ENUM("Luring", "Daring", "Hybrid"),
    allowNull: false
  },
  nominal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  keterangan: DataTypes.TEXT
}, {
  tableName: "biaya_uji",
  timestamps: false
});

module.exports = BiayaUji;
