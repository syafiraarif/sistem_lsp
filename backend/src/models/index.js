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

// relasi role - user
Role.hasMany(User, { foreignKey: "id_role" });
User.belongsTo(Role, { foreignKey: "id_role" });

// relasi user - profile
User.hasOne(ProfileAsesi, { foreignKey: "id_user" });
User.hasOne(ProfileAsesor, { foreignKey: "id_user" });
User.hasOne(ProfileAdmin, { foreignKey: "id_user" });
User.hasOne(ProfileTuk, { foreignKey: "id_user" });

ProfileAsesi.belongsTo(User, { foreignKey: "id_user" });
ProfileAsesor.belongsTo(User, { foreignKey: "id_user" });
ProfileAdmin.belongsTo(User, { foreignKey: "id_user" });
ProfileTuk.belongsTo(User, { foreignKey: "id_user" });

/* SKKNI - SKEMA */
Skkni.hasMany(Skema, { foreignKey: "skkni_id" });
Skema.belongsTo(Skkni, { foreignKey: "skkni_id" });

/* SKEMA SELF REFERENCE */
Skema.hasMany(Skema, { foreignKey: "skema_induk_id", as: "subSkema" });
Skema.belongsTo(Skema, { foreignKey: "skema_induk_id", as: "skemaInduk" });

/* SKEMA - BIAYA */
Skema.hasMany(BiayaUji, { foreignKey: "id_skema" });
BiayaUji.belongsTo(Skema, { foreignKey: "id_skema" });

/* SKEMA - PERSYARATAN ASESI */
Skema.belongsToMany(Persyaratan, {
  through: SkemaPersyaratan,
  foreignKey: "id_skema"
});
Persyaratan.belongsToMany(Skema, {
  through: SkemaPersyaratan,
  foreignKey: "id_persyaratan"
});

Skema.belongsToMany(PersyaratanTuk, {
  through: SkemaPersyaratanTuk,
  foreignKey: "id_skema"
});
PersyaratanTuk.belongsToMany(Skema, {
  through: SkemaPersyaratanTuk,
  foreignKey: "id_persyaratan_tuk"
});

Skema.hasMany(KelompokPekerjaan, { foreignKey: "id_skema" });
KelompokPekerjaan.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Tuk, {
  through: TukSkema,
  foreignKey: "id_skema"
});
Tuk.belongsToMany(Skema, {
  through: TukSkema,
  foreignKey: "id_tuk"
});

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
  Tuk
};