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
const TujuanPembayaran = require("./tujuanPembayaran.model");
const Pembayaran = require("./pembayaran.model");
const UnitKompetensi = require("./unitKompetensi.model");
const SkemaSkkni = require("./skemaSkkni.model");
const Surveillance = require("./surveillance.model");
const BankSoal = require("./bankSoal.model");
const BankSoalPG = require("./bankSoalPG.model")
const UnitElemen = require("./unitElemen.model")
const UnitKuk = require("./unitKuk.model")
const IA01Observasi = require("./ia01Observasi.model")
const IA03Pertanyaan = require("./ia03Pertanyaan.model")
const Mapa = require("./mapa.model");
const Mapa01 = require("./mapa01.model");
const Mapa02Mapping = require("./mapa02Mapping.model");
const Mapa02Metode = require("./mapa02Metode.model");
const Mkva = require("./mkva.model");
const MkvaDetail = require("./mkvadetail.model");
const FrAk01 = require("./frAk01.model");
const FrAk02 = require("./frAk02.model");
const FrAk05 = require("./frAk05.model");
const FrAk06 = require("./frAk06.model");
const FrAk07 = require("./frAk07.model");
const Mapa02Peserta = require("./mapa02_peserta.model");
const VerifikasiTuk = require("./verifikasiTuk.model");
const VerifikasiTukDetail = require("./verifikasiTukDetail.model");
const Presensi = require("./presensi");
const Apl01Dokumen = require("./apl01Dokumen.model");
const Apl02 = require("./apl02.model");
const Apl02Detail = require("./apl02Detail.model");
const Apl02Bukti = require("./apl02Bukti.model");
const PresensiAsesor = require("./presensiAsesor.model");
const FrAk02Detail = require("./frAk02Detail.model");
const FrAk06Detail = require("./frAk06Detail.model");

Role.hasMany(User, { foreignKey: "id_role" });
User.belongsTo(Role, { foreignKey: "id_role" });

User.hasOne(ProfileAsesi, { foreignKey: "id_user" });
User.hasOne(ProfileAsesor, { foreignKey: "id_user" });
User.hasOne(ProfileAdmin, { foreignKey: "id_user" });
User.hasOne(ProfileTuk, { foreignKey: "id_user" });

ProfileAsesi.belongsTo(User, { foreignKey: "id_user" });
ProfileAsesor.belongsTo(User, { foreignKey: "id_user", as: "user" });
ProfileAdmin.belongsTo(User, { foreignKey: "id_user" });
ProfileTuk.belongsTo(User, { foreignKey: "id_user" });

User.hasMany(Notifikasi, { foreignKey: "ref_id", constraints: false });
Notifikasi.belongsTo(User, { foreignKey: "ref_id", constraints: false });

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

// ✅ FIXED: Tambah relasi yang benar untuk ProfileAsesor
ProfileAsesor.hasMany(JadwalAsesor, { foreignKey: "id_user" });
JadwalAsesor.belongsTo(ProfileAsesor, { foreignKey: "id_user", as: "profileAsesor" });

User.hasMany(PesertaJadwal, { foreignKey: "id_user" });
PesertaJadwal.belongsTo(User, {foreignKey: "id_user", as: "user"});
Jadwal.hasMany(PesertaJadwal, { foreignKey: "id_jadwal" });
PesertaJadwal.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal"});

Persyaratan.hasMany(Apl01Dokumen, {
  foreignKey: "id_persyaratan",
  as: "dokumen"
});

// ==========================
// APL02 (FIXED STRUCTURE)
// ==========================

// Header → Peserta
Apl02.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasOne(Apl02, {
  foreignKey: "id_peserta",
  as: "apl02"
});

// Header → Detail
Apl02.hasMany(Apl02Detail, {
  foreignKey: "id_apl02",
  as: "detail"
});

Apl02Detail.belongsTo(Apl02, {
  foreignKey: "id_apl02",
  as: "apl02"
});

// Detail → Elemen
Apl02Detail.belongsTo(UnitElemen, {
  foreignKey: "id_elemen",
  as: "elemen"
});

Apl02Detail.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(Apl02Detail, {
  foreignKey: "id_unit"
});

UnitElemen.hasMany(Apl02Detail, {
  foreignKey: "id_elemen"
});

// Detail → Bukti
Apl02Detail.hasMany(Apl02Bukti, {
  foreignKey: "id_detail",
  as: "bukti"
});

Apl02Bukti.belongsTo(Apl02Detail, {
  foreignKey: "id_detail",
  as: "detail"
});

// Relasi baru Pembayaran → Skema
Pembayaran.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(Pembayaran, { foreignKey: "id_skema", as: "pembayaran" });

// Relasi Pembayaran → TujuanPembayaran tetap
Pembayaran.belongsTo(TujuanPembayaran, { foreignKey: "id_tujuan_transfer" });

User.hasMany(BandingAsesmen, { foreignKey: "id_user" });
BandingAsesmen.belongsTo(User, { foreignKey: "id_user", as: "user"});

Jadwal.hasMany(BandingAsesmen, { foreignKey: "id_jadwal" });
BandingAsesmen.belongsTo(Jadwal, { foreignKey: "id_jadwal" });

Skema.hasMany(BandingAsesmen, { foreignKey: "id_skema" });
BandingAsesmen.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Skkni, { through: SkemaSkkni, foreignKey: "id_skema"});
Skkni.belongsToMany(Skema, { through: SkemaSkkni, foreignKey: "id_skkni"});

User.hasMany(Surveillance, { foreignKey: "id_user" });
Surveillance.belongsTo(User, { foreignKey: "id_user" });

Skema.hasMany(Surveillance, { foreignKey: "id_skema" });
Surveillance.belongsTo(Skema, { foreignKey: "id_skema" });

UnitKompetensi.hasMany(IA01Observasi, { foreignKey: "id_unit"});
UnitKuk.hasMany(IA01Observasi, { foreignKey: "id_kuk"});


BankSoal.hasMany(BankSoalPG, { foreignKey: "id_soal" });
BankSoalPG.belongsTo(BankSoal, { foreignKey: "id_soal" });

UnitKompetensi.hasMany(UnitElemen, { foreignKey: "id_unit" });
UnitElemen.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });

UnitElemen.hasMany(UnitKuk, { foreignKey: "id_elemen" });
UnitKuk.belongsTo(UnitElemen, { foreignKey: "id_elemen" });

IA01Observasi.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });
IA01Observasi.belongsTo(UnitKuk, { foreignKey: "id_kuk" });

IA03Pertanyaan.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });
UnitKompetensi.hasMany(IA03Pertanyaan, { foreignKey: "id_unit" });

BankSoal.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });
UnitKompetensi.hasMany(BankSoal, { foreignKey: "id_unit" });

Skema.hasMany(Mapa, { foreignKey: "id_skema" });
Mapa.belongsTo(Skema, { foreignKey: "id_skema" });

User.hasMany(Mapa, { foreignKey: "created_by" });
Mapa.belongsTo(User, {foreignKey: "created_by", as: "creator"});

Mapa.hasOne(Mapa01, { foreignKey: "id_mapa" });
Mapa01.belongsTo(Mapa, { foreignKey: "id_mapa" });

Mapa.hasMany(Mapa02Mapping, { foreignKey: "id_mapa" });
Mapa02Mapping.belongsTo(Mapa, { foreignKey: "id_mapa" });

UnitKompetensi.hasMany(Mapa02Mapping, { foreignKey: "id_unit" });
Mapa02Mapping.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });

KelompokPekerjaan.hasMany(Mapa02Mapping, { foreignKey: "id_kelompok"});
Mapa02Mapping.belongsTo(KelompokPekerjaan, { foreignKey: "id_kelompok"});

Mapa02Mapping.hasMany(Mapa02Metode, { foreignKey: "id_mapping"});
Mapa02Metode.belongsTo(Mapa02Mapping, { foreignKey: "id_mapping"});

// ==========================
// MKVA RELATION (FINAL)
// ==========================

Mkva.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(Mkva, { foreignKey: "id_jadwal", as: "mkvas" });

Mkva.belongsTo(User, { foreignKey: "id_user", as: "asesor" });
User.hasMany(Mkva, { foreignKey: "id_user", as: "mkvas" });

Mkva.hasMany(MkvaDetail, {
  foreignKey: "id_mkva",
  as: "details",
  onDelete: "CASCADE"
});

MkvaDetail.belongsTo(Mkva, {
  foreignKey: "id_mkva",
  as: "mkva"
});

// ==========================
// VERIFIKASI TUK RELATION (FINAL)
// ==========================

// HEADER → DETAIL
VerifikasiTuk.hasMany(VerifikasiTukDetail, {
  foreignKey: "id_verifikasi",
  as: "details",
  onDelete: "CASCADE"
});

VerifikasiTukDetail.belongsTo(VerifikasiTuk, {
  foreignKey: "id_verifikasi",
  as: "verifikasi"
});

// HEADER → JADWAL
VerifikasiTuk.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(VerifikasiTuk, {
  foreignKey: "id_jadwal",
  as: "verifikasiTuk"
});

// HEADER → USER (ASESOR)
VerifikasiTuk.belongsTo(User, {
  foreignKey: "id_user",
  as: "asesor"
});

User.hasMany(VerifikasiTuk, {
  foreignKey: "id_user",
  as: "verifikasiTuk"
});

// DETAIL → PERSYARATAN TUK
VerifikasiTukDetail.belongsTo(PersyaratanTuk, {
  foreignKey: "id_persyaratan_tuk",
  as: "persyaratan"
});

PersyaratanTuk.hasMany(VerifikasiTukDetail, {
  foreignKey: "id_persyaratan_tuk"
});

// ==========================
// FR.AK.01 RELATION (FIXED)
// ==========================

// 🔗 ke peserta_jadwal
FrAk01.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk01, {
  foreignKey: "id_peserta",
  as: "frAk01"
});

// 🔗 ke jadwal
FrAk01.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk01, {
  foreignKey: "id_jadwal",
  as: "frAk01"
});

// 🔗 ke asesor (user)
FrAk01.belongsTo(User, {
  foreignKey: "id_asesor",
  as: "asesor"
});

User.hasMany(FrAk01, {
  foreignKey: "id_asesor",
  as: "frAk01"
});

// 🔗 ke profile asesor (buat nama lengkap)
FrAk01.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "profileAsesor"
});

// ==========================
// FR.AK.02 RELATION (FINAL CLEAN)
// ==========================

// unit → detail
UnitKompetensi.hasMany(FrAk02Detail, {
  foreignKey: "id_unit"
});

// asesor → frAk02
ProfileAsesor.hasMany(FrAk02, {
  foreignKey: "id_asesor"
});

// 🔗 HEADER → PESERTA
FrAk02.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk02, {
  foreignKey: "id_peserta",
  as: "frAk02"
});


// 🔗 HEADER → JADWAL
FrAk02.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk02, {
  foreignKey: "id_jadwal",
  as: "frAk02"
});


// 🔗 HEADER → ASESOR (PROFILE, bukan User)
FrAk02.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});


// ==========================
// DETAIL RELATION (WAJIB)
// ==========================

// HEADER → DETAIL
FrAk02.hasMany(FrAk02Detail, {
  foreignKey: "id_fr_ak02",
  as: "detail"
});

FrAk02Detail.belongsTo(FrAk02, {
  foreignKey: "id_fr_ak02"
});


// DETAIL → UNIT KOMPETENSI
FrAk02Detail.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

// ==========================
// FR.AK.05 (CLEAN & FIX)
// ==========================

// ke jadwal
FrAk05.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk05, {
  foreignKey: "id_jadwal",
  as: "frAk05"
});


// ke peserta_jadwal
FrAk05.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk05, {
  foreignKey: "id_peserta",
  as: "frAk05"
});


// ke asesor (pakai ProfileAsesor biar langsung dapat nama)
FrAk05.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});

ProfileAsesor.hasMany(FrAk05, {
  foreignKey: "id_asesor",
  as: "frAk05"
});

PesertaJadwal.belongsTo(ProfileAsesi, {
  foreignKey: "id_user",
  as: "asesi"
});


// ==========================
// FR.AK.06 (FINAL CLEAN)
// ==========================
Skema.hasMany(FrAk06, {
  foreignKey: "id_skema",
  as: "frAk06"
});

FrAk06.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk06, {
  foreignKey: "id_peserta",
  as: "frAk06"
});

Tuk.hasMany(FrAk06, {
  foreignKey: "id_tuk",
  as: "frAk06"
});

FrAk06.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

FrAk06.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

// 🔗 ke jadwal
FrAk06.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk06, {
  foreignKey: "id_jadwal",
  as: "frAk06"
});


// 🔗 ke asesor (pakai ProfileAsesor biar langsung dapat nama)
FrAk06.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});

ProfileAsesor.hasMany(FrAk06, {
  foreignKey: "id_asesor",
  as: "frAk06"
});


// 🔗 HEADER → DETAIL (WAJIB BANGET)
FrAk06.hasMany(FrAk06Detail, {
  foreignKey: "id_fr_ak06",
  as: "detail",
  onDelete: "CASCADE"
});

FrAk06Detail.belongsTo(FrAk06, {
  foreignKey: "id_fr_ak06",
  as: "frAk06"
});

// ==========================
// FR.AK.07 (FINAL FIX)
// ==========================

// 🔗 ke peserta_jadwal
FrAk07.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk07, {
  foreignKey: "id_peserta",
  as: "frAk07"
});


// 🔗 ke jadwal
FrAk07.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk07, {
  foreignKey: "id_jadwal",
  as: "frAk07"
});


// 🔗 ke asesor (pakai ProfileAsesor biar langsung ambil nama)
FrAk07.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});

ProfileAsesor.hasMany(FrAk07, {
  foreignKey: "id_asesor",
  as: "frAk07"
});

PesertaJadwal.hasMany(Mapa02Peserta, { foreignKey: "id_peserta" }); 
Mapa02Peserta.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "pesertaJadwal" });

Mapa.hasMany(Mapa02Peserta, { foreignKey: "id_mapa" }); 
Mapa02Peserta.belongsTo(Mapa, { foreignKey: "id_mapa", as: "mapa" });

Mapa02Mapping.hasMany(Mapa02Peserta, { foreignKey: "id_mapping" });
Mapa02Peserta.belongsTo(Mapa02Mapping, { foreignKey: "id_mapping", as: "mapping" });

PesertaJadwal.hasOne(Presensi, {
  foreignKey: "id_peserta",
  as: "presensi"
});

Presensi.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

User.hasMany(Tuk, { foreignKey: "id_penanggung_jawab" });
Tuk.belongsTo(User, { 
  foreignKey: "id_penanggung_jawab",
  as: "penanggungJawab"
});
// ==========================
// APL01 (CLEAN VERSION)
// ==========================

// Header → Peserta
Apl01Asesmen.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasOne(Apl01Asesmen, {
  foreignKey: "id_peserta",
  as: "apl01"
});

// Header → Dokumen
Apl01Asesmen.hasMany(Apl01Dokumen, {
  foreignKey: "id_apl01",
  as: "dokumen"
});

Apl01Dokumen.belongsTo(Apl01Asesmen, {
  foreignKey: "id_apl01",
  as: "apl01"
});

// Dokumen → Persyaratan
Apl01Dokumen.belongsTo(Persyaratan, {
  foreignKey: "id_persyaratan",
  as: "persyaratan"
});

// ==========================
// PRESENSI ASESOR RELATION
// ==========================

// 🔗 Jadwal → Presensi Asesor
Jadwal.hasMany(PresensiAsesor, {
  foreignKey: "id_jadwal",
  as: "presensiAsesor"
});

PresensiAsesor.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

// 🔗 User (Asesor) → Presensi
User.hasMany(PresensiAsesor, {
  foreignKey: "id_user",
  as: "presensiAsesor"
});

PresensiAsesor.belongsTo(User, {
  foreignKey: "id_user",
  as: "asesor"
});

// 🔗 Profile Asesor (optional tapi bagus)
ProfileAsesor.hasMany(PresensiAsesor, {
  foreignKey: "id_user"
});

PresensiAsesor.belongsTo(ProfileAsesor, {
  foreignKey: "id_user",
  as: "profileAsesor"
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
  Tuk,
  TukSkema,
  BandingAsesmen,
  DokumenMutu,
  Jadwal,
  JadwalAsesor,
  PesertaJadwal,
  Apl01Asesmen,
  TujuanPembayaran,
  Pembayaran,
  UnitKompetensi,
  SkemaSkkni,
  Surveillance,
  BankSoal,
  BankSoalPG,
  UnitElemen,
  UnitKuk,
  IA01Observasi,
  IA03Pertanyaan,
  Mapa,
  Mapa01,
  Mapa02Mapping,
  Mapa02Metode,
  Mkva,
  FrAk01,
  FrAk02,
  FrAk05,
  FrAk06,
  FrAk06Detail,
  FrAk07,
  Mapa02Peserta,
  MkvaDetail,
  VerifikasiTukDetail,
  VerifikasiTuk,
  Presensi,
  Apl01Dokumen,
  Apl02,
Apl02Detail,
Apl02Bukti,
PresensiAsesor,
FrAk02Detail
};