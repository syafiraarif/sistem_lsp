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
const SkemaUnit = require("./skemaUnit.model");
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
const BankSoalPG = require("./bankSoalPG.model");
const UnitElemen = require("./unitElemen.model");
const UnitKuk = require("./unitKuk.model");
const Mkva = require("./mkva.model");
const MkvaDetail = require("./mkvadetail.model");
const FrAk01 = require("./frAk01.model");
const FrAk02 = require("./frAk02.model");
const FrAk05 = require("./frAk05.model");
const FrAk06 = require("./frAk06.model");
const FrAk07 = require("./frAk07.model");
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
const FrMapa01 = require("./frMapa01.model");
const FrMapa01Detail = require("./frMapa01Detail.model");
const FrMapa02 = require("./frMapa02.model");
const FrMapa02Unit = require("./frMapa02Unit.model");
const FrMapa02Muk = require("./frMapa02Muk.model");
const FrIa02 = require("./frIa02.model");
const FrIa02Detail = require("./frIa02Detail.model");
const FrIa02Validator = require("./frIa02Validator.model");
const FrIa03 = require("./frIa03.model");
const FrIa03Pertanyaan = require("./frIa03Pertanyaan.model");
const FrIa03Jawaban = require("./frIa03Jawaban.model");
const FrIa01 = require("./frIa01.model");
const FrIa01Detail = require("./frIa01Detail.model");
const FrIa05 = require("./frIa05.model");
const FrIa05Soal = require("./frIa05Soal.model");
const FrIa05Opsi = require("./frIa05Opsi.model");
const FrIa05Jawaban = require("./frIa05Jawaban.model");
const FrIa05Penilaian = require("./frIa05Penilaian.model");
const FrAk03 = require("./frAk03.model");
const FrAk03Detail = require("./frAk03Detail.model");
const FrAk04 = require("./frAk04.model");
const HasilKeputusanAsesmen = require("./hasilKeputusanAsesmen.model");

// ==========================
// FR.MAPA.01 (FINAL)
// ==========================
FrMapa01.hasMany(FrMapa01Detail, { foreignKey: "id_mapa01", as: "detail", onDelete: "CASCADE" });
FrMapa01Detail.belongsTo(FrMapa01, { foreignKey: "id_mapa01" });
FrMapa01.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrMapa01, { foreignKey: "id_jadwal", as: "frMapa01" });
FrMapa01.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
ProfileAsesor.hasMany(FrMapa01, { foreignKey: "id_asesor", as: "frMapa01" });
FrMapa01Detail.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitKompetensi.hasMany(FrMapa01Detail, { foreignKey: "id_unit", as: "frMapa01Detail" });

// ==========================
// FR.MAPA.02 (FINAL)
// ==========================
FrMapa02.hasMany(FrMapa02Unit, { foreignKey: "id_mapa02", as: "unit", onDelete: "CASCADE" });
FrMapa02Unit.belongsTo(FrMapa02, { foreignKey: "id_mapa02" });
FrMapa02Unit.hasMany(FrMapa02Muk, { foreignKey: "id_mapa02_unit", as: "muk", onDelete: "CASCADE" });
FrMapa02Muk.belongsTo(FrMapa02Unit, { foreignKey: "id_mapa02_unit" });
FrMapa02.belongsTo(FrMapa01, { foreignKey: "id_mapa01", as: "mapa01" });
FrMapa02.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrMapa02, { foreignKey: "id_jadwal", as: "frMapa02" });
FrMapa02.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
ProfileAsesor.hasMany(FrMapa02, { foreignKey: "id_asesor", as: "frMapa02" });
FrMapa02Unit.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unitDetail" });
UnitKompetensi.hasMany(FrMapa02Unit, { foreignKey: "id_unit", as: "frMapa02Unit" });
FrMapa02Unit.belongsTo(KelompokPekerjaan, { foreignKey: "id_kelompok", as: "kelompok" });
KelompokPekerjaan.hasMany(FrMapa02Unit, { foreignKey: "id_kelompok", as: "frMapa02Unit" });

// ==========================
// FR.IA.01 (OBSERVASI AKTIVITAS KERJA)
// ==========================
FrIa01.hasMany(FrIa01Detail, { foreignKey: "id_fr_ia_01", as: "detail", onDelete: "CASCADE" });
FrIa01Detail.belongsTo(FrIa01, { foreignKey: "id_fr_ia_01" });
FrIa01.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrIa01, { foreignKey: "id_jadwal", as: "frIa01List" });
FrIa01.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrIa01, { foreignKey: "id_peserta", as: "frIa01List" });
FrIa01.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", targetKey: "id_user", as: "asesor" });
ProfileAsesor.hasMany(FrIa01, { foreignKey: "id_asesor", sourceKey: "id_user", as: "frIa01List" });
FrIa01Detail.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitKompetensi.hasMany(FrIa01Detail, { foreignKey: "id_unit", as: "frIa01Detail" });
FrIa01Detail.belongsTo(UnitElemen, { foreignKey: "id_elemen", as: "elemen" });
UnitElemen.hasMany(FrIa01Detail, { foreignKey: "id_elemen", as: "frIa01Detail" });
FrIa01Detail.belongsTo(UnitKuk, { foreignKey: "id_kuk", as: "kuk" });
UnitKuk.hasMany(FrIa01Detail, { foreignKey: "id_kuk", as: "frIa01Detail" });

// ==========================
// FR.IA.02 (TPD - KOMITE TEKNIS)
// ==========================
FrIa02.hasMany(FrIa02Detail, { foreignKey: "id_fr_ia_02", as: "detail", onDelete: "CASCADE" });
FrIa02Detail.belongsTo(FrIa02, { foreignKey: "id_fr_ia_02", as: "frIa02" });
FrIa02.hasMany(FrIa02Validator, { foreignKey: "id_fr_ia_02", as: "validator", onDelete: "CASCADE" });
FrIa02Validator.belongsTo(FrIa02, { foreignKey: "id_fr_ia_02", as: "frIa02" });
FrIa02.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrIa02, { foreignKey: "id_jadwal", as: "frIa02" });
FrIa02.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(FrIa02, { foreignKey: "id_skema", as: "frIa02" });
FrIa02.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });
Tuk.hasMany(FrIa02, { foreignKey: "id_tuk", as: "frIa02" });
ProfileAsesor.hasMany(FrIa02, { foreignKey: "id_asesor", sourceKey: "id_user", as: "frIa02" });
FrIa02.belongsTo(
ProfileAsesi,
{
 foreignKey:"id_asesi",
 targetKey:"id_user",
 as:"asesi"
}
);
ProfileAsesi.hasMany(
FrIa02,
{
 foreignKey:"id_asesi",
 sourceKey:"id_user",
 as:"frIa02List"
}
);

FrIa02Detail.belongsTo(KelompokPekerjaan, { foreignKey: "id_kelompok", as: "kelompok" });
KelompokPekerjaan.hasMany(FrIa02Detail, { foreignKey: "id_kelompok", as: "frIa02Detail" });
FrIa02Validator.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", targetKey: "id_user", as: "asesor" });
ProfileAsesor.hasMany(FrIa02Validator, { foreignKey: "id_asesor", sourceKey: "id_user", as: "frIa02Validator" });

// ==========================
// FR.IA.03 (PERTANYAAN OBSERVASI)
// ==========================
FrIa03.hasMany(FrIa03Pertanyaan, { foreignKey: "id_fr_ia_03", as: "pertanyaan", onDelete: "CASCADE" });
FrIa03Pertanyaan.belongsTo(FrIa03, { foreignKey: "id_fr_ia_03", as: "frIa03" });
FrIa03Pertanyaan.hasOne(FrIa03Jawaban, { foreignKey: "id_pertanyaan", as: "jawaban", onDelete: "CASCADE" });
FrIa03Jawaban.belongsTo(FrIa03Pertanyaan, { foreignKey: "id_pertanyaan", as: "pertanyaan" });
FrIa03Pertanyaan.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitKompetensi.hasMany(FrIa03Pertanyaan, { foreignKey: "id_unit", as: "frIa03Pertanyaan" });
FrIa03.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrIa03, { foreignKey: "id_jadwal", as: "frIa03" });
FrIa03.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(FrIa03, { foreignKey: "id_skema", as: "frIa03" });
FrIa03.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });
Tuk.hasMany(FrIa03, { foreignKey: "id_tuk", as: "frIa03" });
FrIa03.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", targetKey: "id_user", as: "asesor" });
ProfileAsesor.hasMany(FrIa03, { foreignKey: "id_asesor", sourceKey: "id_user", as: "frIa03" });
FrIa03.belongsTo(ProfileAsesi, { foreignKey: "id_asesi", targetKey: "id_user", as: "asesi" });
ProfileAsesi.hasMany(
FrIa03,
{
 foreignKey:"id_asesi",
 sourceKey:"id_user",
 as:"frIa03List"
}
);


// ==========================
// FR.IA.05
// ==========================
FrIa05Soal.hasMany(FrIa05Jawaban, { foreignKey: "id_soal", as: "jawaban" });
FrIa05Opsi.hasMany(FrIa05Jawaban, { foreignKey: "id_opsi", as: "jawabanAsesi" });
FrIa05.hasMany(FrIa05Soal, { foreignKey: "id_fr_ia_05", as: "soal", onDelete: "CASCADE" });
FrIa05Soal.belongsTo(FrIa05, { foreignKey: "id_fr_ia_05", as: "frIa05" });
FrIa05Soal.hasMany(FrIa05Opsi, { foreignKey: "id_soal", as: "opsi", onDelete: "CASCADE" });
FrIa05Opsi.belongsTo(FrIa05Soal, { foreignKey: "id_soal", as: "soal" });
FrIa05Soal.belongsTo(KelompokPekerjaan, { foreignKey: "id_kelompok", as: "kelompok" });
KelompokPekerjaan.hasMany(FrIa05Soal, { foreignKey: "id_kelompok", as: "frIa05Soal" });
FrIa05Jawaban.belongsTo(FrIa05Soal, { foreignKey: "id_soal", as: "soal" });
FrIa05Jawaban.belongsTo(FrIa05Opsi, { foreignKey: "id_opsi", as: "opsi" });
FrIa05Jawaban.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrIa05Jawaban, { foreignKey: "id_peserta", as: "frIa05Jawaban" });
FrIa05.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrIa05, { foreignKey: "id_jadwal", as: "frIa05" });
FrIa05.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(FrIa05, { foreignKey: "id_skema", as: "frIa05" });
FrIa05Penilaian.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrIa05Penilaian, { foreignKey: "id_peserta", as: "frIa05Penilaian" });
FrIa05Penilaian.belongsTo(FrIa05, { foreignKey: "id_fr_ia_05", as: "paket" });
FrIa05.hasMany(FrIa05Penilaian, { foreignKey: "id_fr_ia_05", as: "penilaian" });
FrIa05.belongsTo(ProfileAsesor, { foreignKey: "created_by", targetKey: "id_user", as: "pembuat" });
ProfileAsesor.hasMany(FrIa05, { foreignKey: "created_by", sourceKey: "id_user", as: "frIa05" });

// ==========================
// OTHER CORE RELATIONS
// ==========================
Role.hasMany(User, { foreignKey: "id_role" });
User.belongsTo(Role, { foreignKey: "id_role" });

User.hasOne(ProfileAsesi, {
 foreignKey: "id_user",
 as: "profileAsesi",
 onDelete: "CASCADE"
});
User.hasOne(ProfileAsesor, { foreignKey: "id_user" });
User.hasOne(ProfileAdmin, { foreignKey: "id_user" });
User.hasOne(ProfileTuk, { foreignKey: "id_user" });


ProfileAsesi.belongsTo(User, {
 foreignKey: "id_user",
 as: "user"
});
ProfileAsesor.belongsTo(User, { foreignKey: "id_user", as: "user" });
ProfileAdmin.belongsTo(User, { foreignKey: "id_user" });
ProfileTuk.belongsTo(User, { foreignKey: "id_user" });

User.hasMany(Notifikasi, { foreignKey: "ref_id", constraints: false });
Notifikasi.belongsTo(User, { foreignKey: "ref_id", constraints: false });

Skkni.hasMany(UnitKompetensi, { foreignKey: "id_skkni" });
UnitKompetensi.belongsTo(Skkni, { foreignKey: "id_skkni", as: "skkni" });

Skema.hasMany(BiayaUji, { foreignKey: "id_skema" });
BiayaUji.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Persyaratan, { through: SkemaPersyaratan, foreignKey: "id_skema"});
Persyaratan.belongsToMany(Skema, { through: SkemaPersyaratan, foreignKey: "id_persyaratan"});

SkemaPersyaratan.belongsTo(Persyaratan, { foreignKey: "id_persyaratan", as: "persyaratan" });
Persyaratan.hasMany(SkemaPersyaratan, { foreignKey: "id_persyaratan", as: "skema_persyaratan" });

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

ProfileAsesor.hasMany(JadwalAsesor, { foreignKey: "id_user" });
JadwalAsesor.belongsTo(ProfileAsesor, { foreignKey: "id_user", as: "profileAsesor" });

User.hasMany(PesertaJadwal, { foreignKey: "id_user" });
ProfileAsesi.hasMany(
PesertaJadwal,
{
 foreignKey:"id_user",
 sourceKey:"id_user",
 as:"pesertaJadwal"
}
);

PesertaJadwal.belongsTo(
ProfileAsesi,
{
 foreignKey:"id_user",
 targetKey:"id_user",
 as:"profileAsesi"
}
);
PesertaJadwal.belongsTo(User, {foreignKey: "id_user", as: "user"});
Jadwal.hasMany(PesertaJadwal, { foreignKey: "id_jadwal" });
PesertaJadwal.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal"});

Persyaratan.hasMany(Apl01Dokumen, { foreignKey: "id_persyaratan", as: "dokumen" });

// ==========================
// APL02 (FIXED STRUCTURE)
// ==========================
Apl02.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasOne(Apl02, { foreignKey: "id_peserta", as: "apl02" });

Apl02.hasMany(Apl02Detail, { foreignKey: "id_apl02", as: "detail" });
Apl02Detail.belongsTo(Apl02, { foreignKey: "id_apl02", as: "apl02" });

Apl02Detail.belongsTo(UnitElemen, { foreignKey: "id_elemen", as: "elemen" });
Apl02Detail.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitKompetensi.hasMany(Apl02Detail, { foreignKey: "id_unit" });
UnitElemen.hasMany(Apl02Detail, { foreignKey: "id_elemen" });

Apl02Detail.hasMany(Apl02Bukti, { foreignKey: "id_detail", as: "buktiTambahan" });
Apl02Bukti.belongsTo(Apl02Detail, { foreignKey: "id_detail", as: "detail" });

Pembayaran.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(Pembayaran, { foreignKey: "id_skema", as: "pembayaran" });
Pembayaran.belongsTo(TujuanPembayaran, { foreignKey: "id_tujuan_transfer" });

User.hasMany(BandingAsesmen, { foreignKey: "id_user" });
BandingAsesmen.belongsTo(User, { foreignKey: "id_user", as: "user"});
Jadwal.hasMany(BandingAsesmen, { foreignKey: "id_jadwal" });
BandingAsesmen.belongsTo(Jadwal, { foreignKey: "id_jadwal" });
Skema.hasMany(BandingAsesmen, { foreignKey: "id_skema" });
BandingAsesmen.belongsTo(Skema, { foreignKey: "id_skema" });

Skema.belongsToMany(Skkni, { through: SkemaSkkni, foreignKey: "id_skema", as: 'skknis'});
Skkni.belongsToMany(Skema, { through: SkemaSkkni, foreignKey: "id_skkni", as: 'skemas'});

User.hasMany(Surveillance, { foreignKey: "id_user" });
Surveillance.belongsTo(User, { foreignKey: "id_user" });
Skema.hasMany(Surveillance, { foreignKey: "id_skema" });
Surveillance.belongsTo(Skema, { foreignKey: "id_skema" });

BankSoal.hasMany(BankSoalPG, { foreignKey: "id_soal" });
BankSoalPG.belongsTo(BankSoal, { foreignKey: "id_soal" });

UnitKompetensi.hasMany(UnitElemen, { foreignKey: "id_unit" });
UnitElemen.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });

UnitElemen.hasMany(UnitKuk, { foreignKey: "id_elemen" });
UnitKuk.belongsTo(UnitElemen, { foreignKey: "id_elemen" });

// ==========================
// FORM RELATION & SKEMA-UNIT
// ==========================

// ✅ Skema → SkemaUnit
Skema.hasMany(SkemaUnit, {
  foreignKey: "id_skema",
  as: "skemaUnit"
});

SkemaUnit.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});
SkemaUnit.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitKompetensi.hasMany(SkemaUnit, { foreignKey: "id_unit", as: "skemaUnit" });

// 🔥 PERBAIKAN PENTING: Hubungkan Skema dan UnitKompetensi secara Many-to-Many
Skema.belongsToMany(UnitKompetensi, { through: SkemaUnit, foreignKey: "id_skema", as: "unitKompetensiList" });
UnitKompetensi.belongsToMany(Skema, { through: SkemaUnit, foreignKey: "id_unit", as: "skemaList" });

UnitKompetensi.hasMany(UnitElemen, { foreignKey: "id_unit", as: "elemen" });
UnitElemen.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });
UnitElemen.hasMany(UnitKuk, { foreignKey: "id_elemen", as: "kuk" });
UnitKuk.belongsTo(UnitElemen, { foreignKey: "id_elemen", as: "elemen" });

BankSoal.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });
UnitKompetensi.hasMany(BankSoal, { foreignKey: "id_unit" });

Mkva.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(Mkva, { foreignKey: "id_jadwal", as: "mkvas" });
Mkva.belongsTo(User, { foreignKey: "id_user", as: "asesor" });
User.hasMany(Mkva, { foreignKey: "id_user", as: "mkvas" });
Mkva.hasMany(MkvaDetail, { foreignKey: "id_mkva", as: "details", onDelete: "CASCADE" });
MkvaDetail.belongsTo(Mkva, { foreignKey: "id_mkva", as: "mkva" });

VerifikasiTuk.hasMany(VerifikasiTukDetail, { foreignKey: "id_verifikasi", as: "details", onDelete: "CASCADE" });
VerifikasiTukDetail.belongsTo(VerifikasiTuk, { foreignKey: "id_verifikasi", as: "verifikasi" });
VerifikasiTuk.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(VerifikasiTuk, { foreignKey: "id_jadwal", as: "verifikasiTuk" });
VerifikasiTuk.belongsTo(User, { foreignKey: "id_user", as: "asesor" });
User.hasMany(VerifikasiTuk, { foreignKey: "id_user", as: "verifikasiTuk" });
VerifikasiTukDetail.belongsTo(PersyaratanTuk, { foreignKey: "id_persyaratan_tuk", as: "persyaratan" });
PersyaratanTuk.hasMany(VerifikasiTukDetail, { foreignKey: "id_persyaratan_tuk" });

FrAk01.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk01, { foreignKey: "id_peserta", as: "frAk01" });
FrAk01.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk01, { foreignKey: "id_jadwal", as: "frAk01" });
FrAk01.belongsTo(User, { foreignKey: "id_asesor", as: "asesor" });
User.hasMany(FrAk01, { foreignKey: "id_asesor", as: "frAk01" });
FrAk01.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "profileAsesor" });

UnitKompetensi.hasMany(FrAk02Detail, { foreignKey: "id_unit" });
ProfileAsesor.hasMany(FrAk02, { foreignKey: "id_asesor" });
FrAk02.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk02, { foreignKey: "id_peserta", as: "frAk02" });
FrAk02.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk02, { foreignKey: "id_jadwal", as: "frAk02" });
FrAk02.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
FrAk02.hasMany(FrAk02Detail, { foreignKey: "id_fr_ak02", as: "detail" });
FrAk02Detail.belongsTo(FrAk02, { foreignKey: "id_fr_ak02" });
FrAk02Detail.belongsTo(UnitKompetensi, { foreignKey: "id_unit", as: "unit" });

FrAk03.hasMany(FrAk03Detail, { foreignKey: "id_fr_ak03", as: "detailAk03", onDelete: "CASCADE" });
FrAk03Detail.belongsTo(FrAk03, { foreignKey: "id_fr_ak03", as: "frAk03" });
FrAk03.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk03, { foreignKey: "id_peserta", as: "frAk03List" });
FrAk03.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk03, { foreignKey: "id_jadwal", as: "frAk03" });
FrAk03.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(FrAk03, { foreignKey: "id_skema", as: "frAk03" });
FrAk03.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });
Tuk.hasMany(FrAk03, { foreignKey: "id_tuk", as: "frAk03" });

FrAk04.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasOne(FrAk04, { foreignKey: "id_peserta", as: "frAk04" });
FrAk04.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk04, { foreignKey: "id_jadwal", as: "frAk04" });
FrAk04.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
Skema.hasMany(FrAk04, { foreignKey: "id_skema", as: "frAk04" });
FrAk04.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });
Tuk.hasMany(FrAk04, { foreignKey: "id_tuk", as: "frAk04" });

FrAk05.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk05, { foreignKey: "id_jadwal", as: "frAk05" });
FrAk05.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk05, { foreignKey: "id_peserta", as: "frAk05" });
FrAk05.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
ProfileAsesor.hasMany(FrAk05, { foreignKey: "id_asesor", as: "frAk05" });


Skema.hasMany(FrAk06, { foreignKey: "id_skema", as: "frAk06" });
FrAk06.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk06, { foreignKey: "id_peserta", as: "frAk06" });
Tuk.hasMany(FrAk06, { foreignKey: "id_tuk", as: "frAk06" });
FrAk06.belongsTo(Skema, { foreignKey: "id_skema", as: "skema" });
FrAk06.belongsTo(Tuk, { foreignKey: "id_tuk", as: "tuk" });
FrAk06.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk06, { foreignKey: "id_jadwal", as: "frAk06" });
FrAk06.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
ProfileAsesor.hasMany(FrAk06, { foreignKey: "id_asesor", as: "frAk06" });
FrAk06.hasMany(FrAk06Detail, { foreignKey: "id_fr_ak06", as: "detail", onDelete: "CASCADE" });
FrAk06Detail.belongsTo(FrAk06, { foreignKey: "id_fr_ak06", as: "frAk06" });

FrAk07.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasMany(FrAk07, { foreignKey: "id_peserta", as: "frAk07" });
FrAk07.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
Jadwal.hasMany(FrAk07, { foreignKey: "id_jadwal", as: "frAk07" });
FrAk07.belongsTo(ProfileAsesor, { foreignKey: "id_asesor", as: "asesor" });
ProfileAsesor.hasMany(FrAk07, { foreignKey: "id_asesor", as: "frAk07" });

PesertaJadwal.hasOne(Presensi, { foreignKey: "id_peserta", as: "presensi" });
Presensi.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });

User.hasMany(Tuk, { foreignKey: "id_penanggung_jawab" });
Tuk.belongsTo(User, { foreignKey: "id_penanggung_jawab", as: "penanggungJawab" });

Apl01Asesmen.belongsTo(PesertaJadwal, { foreignKey: "id_peserta", as: "peserta" });
PesertaJadwal.hasOne(Apl01Asesmen, { foreignKey: "id_peserta", as: "apl01" });
Apl01Asesmen.hasMany(Apl01Dokumen, { foreignKey: "id_apl01", as: "dokumen" });
Apl01Dokumen.belongsTo(Apl01Asesmen, { foreignKey: "id_apl01", as: "apl01" });
Apl01Dokumen.belongsTo(Persyaratan, { foreignKey: "id_persyaratan", as: "persyaratan" });

Jadwal.hasMany(PresensiAsesor, { foreignKey: "id_jadwal", as: "presensiAsesor" });
PresensiAsesor.belongsTo(Jadwal, { foreignKey: "id_jadwal", as: "jadwal" });
User.hasMany(PresensiAsesor, { foreignKey: "id_user", as: "presensiAsesor" });
PresensiAsesor.belongsTo(User, { foreignKey: "id_user", as: "asesor" });
ProfileAsesor.hasMany(PresensiAsesor, { foreignKey: "id_user" });
PresensiAsesor.belongsTo(ProfileAsesor, { foreignKey: "id_user", as: "profileAsesor" });

PesertaJadwal.belongsTo(User, { as: 'asesor_penguji', foreignKey: 'id_asesor' });
User.hasMany(PesertaJadwal, { as: 'asesi_yang_diuji', foreignKey: 'id_asesor' });

// ==========================
// HASIL KEPUTUSAN ASESMEN
// ==========================

HasilKeputusanAsesmen.belongsTo(
PesertaJadwal,
{

foreignKey:
"id_peserta",

as:
"peserta"

}
);

PesertaJadwal.hasMany(
HasilKeputusanAsesmen,
{

foreignKey:
"id_peserta",

as:
"hasilKeputusan"

}
);



HasilKeputusanAsesmen.belongsTo(
Jadwal,
{

foreignKey:
"id_jadwal",

as:
"jadwal"

}
);

Jadwal.hasMany(
HasilKeputusanAsesmen,
{

foreignKey:
"id_jadwal",

as:
"hasilKeputusan"

}
);



HasilKeputusanAsesmen.belongsTo(
ProfileAsesor,
{

foreignKey:
"id_asesor",

targetKey:
"id_user",

as:
"asesor"

}
);

ProfileAsesor.hasMany(
HasilKeputusanAsesmen,
{

foreignKey:
"id_asesor",

sourceKey:
"id_user",

as:
"hasilKeputusan"

}
);

module.exports = {
User, Role, ProfileAsesi, ProfileAsesor, ProfileAdmin, ProfileTuk,
Pengaduan, PendaftaranAsesi, Notifikasi, Skkni, Skema, SkemaUnit,
BiayaUji, Persyaratan, SkemaPersyaratan, PersyaratanTuk,
SkemaPersyaratanTuk, KelompokPekerjaan, Tuk, TukSkema,
BandingAsesmen, DokumenMutu, Jadwal, JadwalAsesor,
PesertaJadwal, Apl01Asesmen, TujuanPembayaran, Pembayaran,
UnitKompetensi, SkemaSkkni, Surveillance, BankSoal,
BankSoalPG, UnitElemen, UnitKuk, Mkva,
FrAk01, FrAk02, FrAk05,
FrAk06, FrAk06Detail,
FrAk07, MkvaDetail,
VerifikasiTukDetail,
VerifikasiTuk,
Presensi,
Apl01Dokumen,
Apl02,
Apl02Detail,
Apl02Bukti,
PresensiAsesor,
FrAk02Detail,

FrMapa01,
FrMapa01Detail,
FrMapa02,
FrMapa02Unit,
FrMapa02Muk,

FrIa01,
FrIa01Detail,

FrIa02,
FrIa02Detail,
FrIa02Validator,

FrIa03,
FrIa03Pertanyaan,
FrIa03Jawaban,

FrIa05,
FrIa05Soal,
FrIa05Opsi,
FrIa05Jawaban,
FrIa05Penilaian,

FrAk03,
FrAk03Detail,
FrAk04,
HasilKeputusanAsesmen
};