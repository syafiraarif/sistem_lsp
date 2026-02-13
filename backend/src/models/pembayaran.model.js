const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pembayaran = sequelize.define("pembayaran", {
  id_pembayaran: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_aplikasi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metode_pembayaran: {
    type: DataTypes.ENUM("Tunai", "Transfer Rekening"),
    allowNull: false
  },
  jalur_pembayaran: {
    type: DataTypes.ENUM("Tunai", "M-banking", "ATM", "E-wallet"),
    allowNull: true
  },
  id_tujuan_transfer: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nominal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  waktu_pembayaran: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  waktu_batas: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "expired", "cancelled"),
    defaultValue: "pending"
  },
  bukti_bayar: {
    type: DataTypes.STRING(255),  
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "pembayaran",
  timestamps: false
});

// Relasi
const AplikasiAsesmen = require("./aplikasiAsesmen.model");
const TujuanTransfer = require("./tujuanTransfer.model");
Pembayaran.belongsTo(AplikasiAsesmen, { foreignKey: "id_aplikasi" });
Pembayaran.belongsTo(TujuanTransfer, { foreignKey: "id_tujuan_transfer" });

module.exports = Pembayaran;