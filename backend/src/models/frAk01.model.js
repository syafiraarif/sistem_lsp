const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk01 = sequelize.define("fr_ak01", {
  id_fr_ak01: {
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

  // =========================
  // CHECKLIST BUKTI
  // =========================
  bukti_portofolio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_observasi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_tertulis: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_wawancara: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_review_produk: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_kegiatan_terstruktur: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_lisan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  bukti_lainnya: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // =========================
  // PERSETUJUAN & TTD
  // =========================
  persetujuan: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: "fr_ak01",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_peserta"] // 🔥 biar ga double input
    }
  ]
});

module.exports = FrAk01;