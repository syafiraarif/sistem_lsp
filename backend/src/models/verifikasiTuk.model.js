const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerifikasiTuk = sequelize.define("verifikasi_tuk", {
  id_verifikasi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  keputusan: {
    type: DataTypes.ENUM("sesuai", "tidak_sesuai"),
    allowNull: false
  },

  ttd_asesor: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: "verifikasi_tuk",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = VerifikasiTuk;