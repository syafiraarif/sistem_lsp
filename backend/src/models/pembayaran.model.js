const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pembayaran = sequelize.define(
  "pembayaran",
  {
    id_pembayaran: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_peserta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_skema: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metode_pembayaran: {
      type: DataTypes.ENUM(
        "tunai",
        "transfer_rekening",
        "qris",
        "virtual_account"
      ),
      allowNull: false,
    },
    jalur_pembayaran: {
      type: DataTypes.ENUM(
        "tunai",
        "m-banking",
        "atm",
        "e-wallet",
        "qris",
        "virtual_account"
      ),
      allowNull: true,
    },
    id_tujuan_transfer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nominal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    waktu_pembayaran: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    waktu_batas: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "menunggu_validasi",
        "paid",
        "ditolak",
        "expired",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    bukti_bayar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    catatan_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pembayaran",
    timestamps: false,
  }
);

module.exports = Pembayaran;