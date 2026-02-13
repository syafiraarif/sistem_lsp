const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl02AsesmenMandiri = sequelize.define("apl02_asesmen_mandiri", {
  id_apl02: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_aplikasi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  elemen_kompetensi: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: "Deskripsi lengkap Elemen Kompetensi dengan nomor dinamis"
  },
  kriteria_unjuk_kerja: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: "Deskripsi lengkap Kriteria Unjuk Kerja dengan nomor dinamis"
  },
  jawaban: {
    type: DataTypes.ENUM("K", "BK"),
    allowNull: false
  },
  jenis_pengalaman: {
    type: DataTypes.ENUM(
      "hasil karya atau produk",
      "pengalaman pembuatan laporan",
      "pengalaman magang",
      "pengalaman menjadi narasumber",
      "pengalaman kerja",
      "pengalaman pendidikan",
      "pengalaman proyek",
      "pengalaman studi kasus"
    ),
    allowNull: false
  },
  nama_dokumen: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nomor_dokumen: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tanggal_dokumen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  file_bukti: {
    type: DataTypes.STRING(255), 
    allowNull: true
  },
  catatan_bukti: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "apl02_asesmen_mandiri",
  timestamps: false
});

// Relasi
const AplikasiAsesmen = require("./aplikasiAsesmen.model");
const UnitKompetensi = require("./unitKompetensi.model");
Apl02AsesmenMandiri.belongsTo(AplikasiAsesmen, { foreignKey: "id_aplikasi" });
Apl02AsesmenMandiri.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });

module.exports = Apl02AsesmenMandiri;