const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Jadwal = sequelize.define("jadwal", {
  id_jadwal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kode_jadwal: DataTypes.STRING(50),
  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_tuk: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nama_kegiatan: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tgl_pra_asesmen: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tahun: DataTypes.INTEGER,
  periode_bulan: DataTypes.STRING(20),
  gelombang: DataTypes.STRING(20),
  tgl_awal: DataTypes.DATEONLY,
  tgl_akhir: DataTypes.DATEONLY,
  jam: DataTypes.TIME,
  pelaksanaan_uji: DataTypes.ENUM("luring", "daring", "hybrid", "onsite"),
  url_agenda: DataTypes.STRING(255),
  status: {
    type: DataTypes.ENUM(
      "draft",
      "disetujui",
      "ditolak",
      "open",
      "ongoing",
      "selesai",
      "arsip"
    ),
    defaultValue: "draft"
  },
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: "jadwal",
  timestamps: false
});

module.exports = Jadwal;