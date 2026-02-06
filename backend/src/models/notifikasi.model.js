const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notifikasi = sequelize.define("notifikasi", {
  id_notifikasi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  channel: DataTypes.ENUM("email","wa"),
  tujuan: DataTypes.STRING(100),
  pesan: DataTypes.TEXT,
  waktu_kirim: DataTypes.DATE,
  status_kirim: DataTypes.ENUM("terkirim","gagal"),
  ref_type: DataTypes.ENUM("pendaftaran","pengaduan","akun"),
  ref_id: DataTypes.INTEGER
}, {
  tableName: "notifikasi",
  timestamps: false
});

module.exports = Notifikasi;
