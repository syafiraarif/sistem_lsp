const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerifikasiTukDetail = sequelize.define("verifikasi_tuk_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_verifikasi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_persyaratan_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  jumlah_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  jumlah_baik: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  jumlah_rusak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: "verifikasi_tuk_detail",
  timestamps: false
});

module.exports = VerifikasiTukDetail;