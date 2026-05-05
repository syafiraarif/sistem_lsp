const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa08PenilaianDokumen = sequelize.define("fr_ia_08_penilaian_dokumen", {
  id_penilaian: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_08: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  sumber: {
    type: DataTypes.ENUM("apl01", "apl02"),
    allowNull: false
  },

  id_ref: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  valid: {
    type: DataTypes.BOOLEAN
  },

  asli: {
    type: DataTypes.BOOLEAN
  },

  terkini: {
    type: DataTypes.BOOLEAN
  },

  memadai: {
    type: DataTypes.BOOLEAN
  },

  catatan: {
    type: DataTypes.TEXT
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_08_penilaian_dokumen",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_fr_ia_08", "sumber", "id_ref"]
    }
  ]
});

module.exports = FrIa08PenilaianDokumen;