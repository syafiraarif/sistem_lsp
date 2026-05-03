const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk02 = sequelize.define("fr_ak02", {
  id_fr_ak02: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten"),
    allowNull: true
  },

  tindak_lanjut: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  komentar_asesor: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  ttd_asesor: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ak02",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_peserta"] // 🔥 anti double submit
    }
  ]
});

module.exports = FrAk02;