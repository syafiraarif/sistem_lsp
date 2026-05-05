const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk05 = sequelize.define("fr_ak05", {
  id: {
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

  rekomendasi: {
    type: DataTypes.ENUM("kompeten", "belum_kompeten"),
    allowNull: false
  },

  keterangan: {
    type: DataTypes.TEXT
  },

  aspek_positif_negatif: {
    type: DataTypes.TEXT
  },

  penolakan_hasil: {
    type: DataTypes.TEXT
  },

  saran_perbaikan: {
    type: DataTypes.TEXT
  },

  catatan: {
    type: DataTypes.TEXT
  },

  ttd_asesor: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  is_final: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "fr_ak05",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_peserta"] // 🔥 biar ga double
    }
  ]
});

module.exports = FrAk05;