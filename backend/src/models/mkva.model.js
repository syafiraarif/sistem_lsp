const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mkva = sequelize.define("mkva", {
  id_mkva: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  periode: {
    type: DataTypes.ENUM(
      "sebelum_asesmen",
      "pada_saat_asesmen",
      "setelah_asesmen"
    ),
    allowNull: false
  },

  // VALIDASI
  tujuan_fokus_validasi: DataTypes.TEXT,
  konteks_validasi: DataTypes.TEXT,
  pendekatan_validasi: DataTypes.TEXT,

  // ORANG
  asesor_kompetensi: DataTypes.TEXT,
  lead_asesor: DataTypes.TEXT,
  manajer_supervisor: DataTypes.TEXT,
  tenaga_ahli: DataTypes.TEXT,
  koord_pelatihan: DataTypes.TEXT,
  anggota_asosiasi: DataTypes.TEXT,

  hasil_konfirmasi: DataTypes.TEXT,

  // DOKUMEN
  acuan_pembanding: DataTypes.TEXT,
  dokumen_terkait: DataTypes.TEXT,

  // PROSES
  keterampilan_komunikasi: DataTypes.TEXT,

  // HASIL
  temuan_validasi: DataTypes.TEXT,
  rekomendasi: DataTypes.TEXT,

  // JSON
  rencana_implementasi: DataTypes.TEXT

}, {
  tableName: "mkva",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = Mkva;