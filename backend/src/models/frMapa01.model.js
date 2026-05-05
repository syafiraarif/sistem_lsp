const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa01 = sequelize.define("fr_mapa01", {
  id_mapa01: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // ========================
  // PROFIL ASESI
  // ========================
  profil_asesi: DataTypes.TEXT,

  // ========================
  // PENDEKATAN
  // ========================
  jenis_asesi: {
    type: DataTypes.ENUM(
      "pelatihan_kompeten",
      "pelatihan_belum_kompeten",
      "pengalaman_kompeten",
      "pengalaman_belum_kompeten",
      "mandiri"
    )
  },

  tujuan_asesmen: {
    type: DataTypes.ENUM(
      "sertifikasi",
      "sertifikasi_ulang",
      "pkt",
      "rpl",
      "lainnya"
    )
  },

  tujuan_lainnya: DataTypes.TEXT,

  // ========================
  // KONTEKS
  // ========================
  lingkungan: {
    type: DataTypes.ENUM("nyata", "simulasi")
  },

  peluang_bukti: {
    type: DataTypes.ENUM("tersedia", "terbatas")
  },

  bukti_langsung: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  aktivitas_kerja: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  kegiatan_pembelajaran: DataTypes.TEXT,

  pelaksana: {
    type: DataTypes.ENUM(
      "lsp",
      "organisasi_pelatihan",
      "asesor_perusahaan"
    )
  },

  // ========================
  // STANDAR
  // ========================
  standar_kompetensi: DataTypes.TEXT,
  kurikulum_pelatihan: DataTypes.TEXT,
  spesifikasi_kinerja: DataTypes.TEXT,
  spesifikasi_produk: DataTypes.TEXT,
  pedoman_khusus: DataTypes.TEXT,

  // ========================
  // KONFIRMASI
  // ========================
  manajer_lsp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  master_asesor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  manajer_pelatihan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  supervisor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // ========================
  // MODIFIKASI
  // ========================
  karakteristik_asesi: DataTypes.TEXT,
  kebutuhan_kontekstual: DataTypes.TEXT,
  saran_pelatihan: DataTypes.TEXT,
  penyesuaian_perangkat: DataTypes.TEXT,
  peluang_integrasi: DataTypes.TEXT,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_mapa01",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_asesor"] // 🔥 biar tidak double isi
    }
  ]
});

module.exports = FrMapa01;