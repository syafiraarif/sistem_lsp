const User = require("./user.model");
const Role = require("./role.model");
const ProfileAsesi = require("./profileAsesi.model");
const ProfileAsesor = require("./profileAsesor.model");
const ProfileAdmin = require("./profileAdmin.model");
const ProfileTuk = require("./profileTuk.model");
const Pengaduan = require("./pengaduan.model");
const PendaftaranAsesi = require("./pendaftaranAsesi.model");
const Notifikasi = require("./notifikasi.model");
const Skkni = require("./skkni.model");
const Skema = require("./skema.model");
const BiayaUji = require("./biayaUji.model");
const Persyaratan = require("./persyaratan.model");
const SkemaPersyaratan = require("./skemaPersyaratan.model");
const PersyaratanTuk = require("./persyaratanTuk.model");
const SkemaPersyaratanTuk = require("./skemaPersyaratanTuk.model");
const KelompokPekerjaan = require("./kelompokPekerjaan.model");
const Tuk = require("./tuk.model");
const TukSkema = require("./tukSkema.model");
const BandingAsesmen = require("./bandingAsesmen.model");
const DokumenMutu = require("./dokumenMutu.model");
const Jadwal = require("./jadwal.model");
const JadwalAsesor = require("./jadwalAsesor.model");
const PesertaJadwal = require("./pesertaJadwal.model");
const Apl01Asesmen = require("./apl01Asesmen.model");
const Apl02AsesmenMandiri = require("./apl02AsesmenMandiri.model");
const TujuanPembayaran = require("./tujuanPembayaran.model");
const Pembayaran = require("./pembayaran.model");
const UnitKompetensi = require("./unitKompetensi.model");
const SkemaSkkni = require("./skemaSkkni.model");


Role.hasMany(User, { foreignKey: "id_role" });
User.belongsTo(Role, { foreignKey: "id_role" });

User.hasOne(ProfileAsesi, { foreignKey: "id_user" });
User.hasOne(ProfileAsesor, { foreignKey: "id_user" });
User.hasOne(ProfileAdmin, { foreignKey: "id_user" });
User.hasOne(ProfileTuk, { foreignKey: "id_user" });

ProfileAsesi.belongsTo(User, { foreignKey: "id_user" });
ProfileAsesor.belongsTo(User, { foreignKey: "id_user" });
ProfileAdmin.belongsTo(User, { foreignKey: "id_user" });
ProfileTuk.belongsTo(User, { foreignKey: "id_user" });

Skkni.hasMany(UnitKompetensi, { foreignKey: "id_skkni" });
UnitKompetensi.belongsTo(Skkni, { foreignKey: "id_skkni" });

Skema.hasMany(BiayaUji, { foreignKey: "id_skema" });
BiayaUji.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Persyaratan, { through: SkemaPersyaratan, foreignKey: "id_skema"});

Persyaratan.belongsToMany(Skema, { through: SkemaPersyaratan, foreignKey: "id_persyaratan"});

Skema.belongsToMany(PersyaratanTuk, { through: SkemaPersyaratanTuk, foreignKey: "id_skema"});

PersyaratanTuk.belongsToMany(Skema, { through: SkemaPersyaratanTuk, foreignKey: "id_persyaratan_tuk"});

Skema.hasMany(KelompokPekerjaan, { foreignKey: "id_skema" });
KelompokPekerjaan.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Tuk, { through: TukSkema, foreignKey: "id_skema"});

Tuk.belongsToMany(Skema, { through: TukSkema, foreignKey: "id_tuk"});

Skema.hasMany(Jadwal, { foreignKey: "id_skema" });
Jadwal.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });

Tuk.hasMany(Jadwal, { foreignKey: "id_tuk" });
Jadwal.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });

User.hasMany(Jadwal, { foreignKey: "created_by" });
Jadwal.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Jadwal.hasMany(JadwalAsesor, { foreignKey: "id_jadwal" });
JadwalAsesor.belongsTo(Jadwal, { foreignKey: "id_jadwal" });

User.hasMany(JadwalAsesor, { foreignKey: "id_user" });
JadwalAsesor.belongsTo(User, { foreignKey: "id_user", as: "asesor" });

User.hasMany(JadwalAsesor, { foreignKey: "assigned_by" });
JadwalAsesor.belongsTo(User, { foreignKey: "assigned_by", as: "assigner"});

User.hasMany(PesertaJadwal, { foreignKey: "id_user" });
PesertaJadwal.belongsTo(User, { foreignKey: "id_user" });

Jadwal.hasMany(PesertaJadwal, { foreignKey: "id_jadwal" });
PesertaJadwal.belongsTo(Jadwal, { foreignKey: "id_jadwal" });

Apl01Asesmen.belongsTo(User, { foreignKey: "id_user" });
Apl01Asesmen.belongsTo(Skema, { foreignKey: "id_skema" });
Apl01Asesmen.belongsTo(Jadwal, { foreignKey: "id_jadwal" });

Apl01Asesmen.hasMany(Apl02AsesmenMandiri, { foreignKey: "id_apl01" });
Apl02AsesmenMandiri.belongsTo(Apl01Asesmen, { foreignKey: "id_apl01" });

Apl02AsesmenMandiri.belongsTo(UnitKompetensi, { foreignKey: "id_unit"});

Pembayaran.belongsTo(Apl01Asesmen, { foreignKey: "id_apl01" });
Apl01Asesmen.hasMany(Pembayaran, { foreignKey: "id_apl01" });

Pembayaran.belongsTo(TujuanPembayaran, { foreignKey: "id_tujuan_transfer"});

User.hasMany(BandingAsesmen, { foreignKey: "id_user" });
BandingAsesmen.belongsTo(User, { foreignKey: "id_user" });

Jadwal.hasMany(BandingAsesmen, { foreignKey: "id_jadwal" });
BandingAsesmen.belongsTo(Jadwal, { foreignKey: "id_jadwal" });

Skema.hasMany(BandingAsesmen, { foreignKey: "id_skema" });
BandingAsesmen.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Skkni, { through: SkemaSkkni, foreignKey: "id_skema"});

Skkni.belongsToMany(Skema, { through: SkemaSkkni, foreignKey: "id_skkni"});

module.exports = {
  User,
  Role,
  ProfileAsesi,
  ProfileAsesor,
  ProfileAdmin,
  ProfileTuk,
  Pengaduan,
  PendaftaranAsesi,
  Notifikasi,
  Skkni,
  Skema,
  BiayaUji,
  Persyaratan,
  SkemaPersyaratan,
  PersyaratanTuk,
  SkemaPersyaratanTuk,
  KelompokPekerjaan,
  Tuk,
  TukSkema,
  BandingAsesmen,
  DokumenMutu,
  Jadwal,
  JadwalAsesor,
  PesertaJadwal,
  Apl01Asesmen,
  Apl02AsesmenMandiri,
  TujuanPembayaran,
  Pembayaran,
  UnitKompetensi,
  SkemaSkkni
};
