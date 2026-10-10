const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa02 = sequelize.define("fr_ia_02", {
  id_fr_ia_02: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  id_asesi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  status_validasi: {
    type: DataTypes.ENUM("disetujui", "ditolak", "menunggu"),
    defaultValue: "menunggu"
  },  

    catatan_admin: {
    type: DataTypes.TEXT,
    allowNull: true
  },  

  created_by: DataTypes.INTEGER,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "fr_ia_02",
  timestamps: false
});

module.exports = FrIa02;