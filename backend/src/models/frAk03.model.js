const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk03 = sequelize.define("fr_ak03", {
  id_fr_ak03: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tanggal_asesmen: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  catatan_lainnya: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: "fr_ak03",
  timestamps: false
});

module.exports = FrAk03;