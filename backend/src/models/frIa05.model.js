const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const FrIa05 = sequelize.define("fr_ia_05", {
  id_fr_ia_05: {
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

  kode_paket: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  judul_paket: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  passing_grade: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  },

  nama_asesi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  waktu: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "fr_ia_05",
  timestamps: false
});

module.exports = FrIa05;