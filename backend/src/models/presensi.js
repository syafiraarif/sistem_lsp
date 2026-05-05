const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Presensi = sequelize.define("presensi", {
  id_presensi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },

  ttd_asesi_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  waktu_presensi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "presensi",
  timestamps: false
});

module.exports = Presensi;