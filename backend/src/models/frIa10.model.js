const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa10 = sequelize.define("fr_ia_10", {
  id_fr_ia_10: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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

  // 🔹 DATA PIHAK KETIGA
  nama_pihak_ketiga: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  tempat_kerja: DataTypes.STRING(255),
  alamat: DataTypes.TEXT,
  telepon: DataTypes.STRING(50),

  // 🔹 YA / TIDAK
  q_k3: DataTypes.BOOLEAN,
  q_kerjasama: DataTypes.BOOLEAN,
  q_manajemen_tugas: DataTypes.BOOLEAN,
  q_adaptasi: DataTypes.BOOLEAN,
  q_respon: DataTypes.BOOLEAN,
  q_konfirmasi: DataTypes.BOOLEAN,

  // 🔹 DESKRIPTIF
  hubungan: DataTypes.TEXT,
  lama_bekerja: DataTypes.STRING(100),
  kedekatan: DataTypes.TEXT,
  pengalaman: DataTypes.TEXT,
  keyakinan: DataTypes.TEXT,
  kebutuhan_pelatihan: DataTypes.TEXT,
  komentar: DataTypes.TEXT,

  // 🔹 TTD
  ttd_asesor: DataTypes.TEXT,

  created_by: DataTypes.INTEGER,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE
  }

}, {
  tableName: "fr_ia_10",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_peserta", "id_jadwal"]
    }
  ]
});

module.exports = FrIa10;