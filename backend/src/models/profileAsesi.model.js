const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProfileAsesi = sequelize.define("profile_asesi", {
  id_user: { type: DataTypes.INTEGER, primaryKey: true },
  nik: { type: DataTypes.CHAR(16), unique: true },
  nama_lengkap: DataTypes.STRING(100),
  jenis_kelamin: DataTypes.ENUM("laki-laki","perempuan"),
  tempat_lahir: DataTypes.STRING(50),
  tanggal_lahir: DataTypes.DATE,
  kebangsaan: DataTypes.STRING(50),

  alamat: DataTypes.TEXT,
  rt: DataTypes.STRING(5),
  rw: DataTypes.STRING(5),
  provinsi: DataTypes.STRING(50),
  kota: DataTypes.STRING(50),
  kecamatan: DataTypes.STRING(50),
  kelurahan: DataTypes.STRING(50),
  kode_pos: DataTypes.STRING(10),

  pendidikan_terakhir: DataTypes.STRING(100),
  universitas: DataTypes.STRING(150),
  jurusan: DataTypes.STRING(100),
  tahun_lulus: DataTypes.INTEGER,

  pekerjaan: DataTypes.STRING(100),
  jabatan: DataTypes.STRING(100),
  nama_perusahaan: DataTypes.STRING(150),
  alamat_perusahaan: DataTypes.TEXT,
  telp_perusahaan: DataTypes.STRING(20),
  fax_perusahaan: DataTypes.STRING(20),
  email_perusahaan: DataTypes.STRING(100),

  foto_profil: DataTypes.STRING(255),
  portofolio: DataTypes.STRING(255)
}, {
  tableName: "profile_asesi",
  timestamps: false
});

module.exports = ProfileAsesi;
