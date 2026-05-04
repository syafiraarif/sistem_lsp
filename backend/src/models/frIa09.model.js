const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa09 = sequelize.define("fr_ia_09", {
  id_fr_ia_09: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_08: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_by: {
    type: DataTypes.INTEGER
  },

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten")
  },

  catatan_rekomendasi: {
    type: DataTypes.TEXT
  },

  ttd_asesor: {
    type: DataTypes.STRING(255)
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_09",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_peserta", "id_jadwal"]
    }
  ]
});

module.exports = FrIa09;