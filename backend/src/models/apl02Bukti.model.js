const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl02Bukti = sequelize.define("apl02_bukti", {
  id_bukti: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_detail: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  jenis_portofolio: {
    type: DataTypes.STRING(100)
  },

  nama_dokumen: {
    type: DataTypes.STRING(255)
  },

  nomor_dokumen: {
    type: DataTypes.STRING(100)
  },

  tanggal_dokumen: {
    type: DataTypes.DATE
  },

  file_path: {
    type: DataTypes.STRING(255)
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "apl02_bukti",
  timestamps: false
});

module.exports = Apl02Bukti;