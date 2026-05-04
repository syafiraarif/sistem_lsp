const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa02Muk = sequelize.define("fr_mapa02_muk", {
  id_muk: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_mapa02_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  kode_muk: {
    type: DataTypes.STRING(50)
  },

  nama_muk: {
    type: DataTypes.TEXT
  },

  potensi_asesi: {
    type: DataTypes.TINYINT,
    allowNull: false
  },

  dipilih: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_mapa02_muk",
  timestamps: false
});

module.exports = FrMapa02Muk;