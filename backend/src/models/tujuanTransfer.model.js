const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TujuanTransfer = sequelize.define("tujuan_transfer", {
  id_tujuan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_tujuan: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nomor_rekening: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  bank: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("aktif", "nonaktif"),
    defaultValue: "aktif"
  }
}, {
  tableName: "tujuan_transfer",
  timestamps: false
});

module.exports = TujuanTransfer;