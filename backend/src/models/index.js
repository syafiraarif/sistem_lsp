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
const BankSoalPG = require("./bankSoalPG.model")
const UnitElemen = require("./unitElemen.model")
const UnitKuk = require("./unitKuk.model")
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
const FrIa04a = require("./frIa04a.model");
const FrIa04aDetail = require("./frIa04aDetail.model");
const FrIa04b = require("./frIa04b.model");
const FrIa04bDetail = require("./frIa04bDetail.model");
const FrIa01 = require("./frIa01.model");
const FrIa01Detail = require("./frIa01Detail.model");
const FrIa05 = require("./frIa05.model");
const FrIa05Soal = require("./frIa05Soal.model");
const FrIa05Opsi = require("./frIa05Opsi.model");
const FrIa05Jawaban = require("./frIa05Jawaban.model");
const FrIa05Penilaian = require("./frIa05Penilaian.model");
const FrIa06 = require("./frIa06.model");
const FrIa06Soal = require("./frIa06Soal.model");
const FrIa06Jawaban = require("./frIa06Jawaban.model");
const FrIa06Penilaian = require("./frIa06Penilaian.model");
const FrIa07 = require("./frIa07.model");
const FrIa07Soal = require("./frIa07Soal.model");
const FrIa07Jawaban = require("./frIa07Jawaban.model");
const FrIa07Penilaian = require("./frIa07Penilaian.model");
const FrIa08 = require("./frIa08.model");
const FrIa08PenilaianDokumen = require("./frIa08PenilaianDokumen.model");
const FrIa08BankSoal = require("./frIa08BankSoal.model");
const FrIa09 = require("./frIa09.model");
const FrIa09Detail = require("./frIa09Detail.model");
const FrIa10 = require("./frIa10.model");
const FrAk03 = require("./frAk03.model");
const FrAk03Detail = require("./frAk03Detail.model");
const FrAk04 = require("./frAk04.model");

// ==========================
// FR.MAPA.01 (FINAL)
// ==========================

// HEADER → DETAIL
FrMapa01.hasMany(FrMapa01Detail, {
  foreignKey: "id_mapa01",
  as: "detail",
  onDelete: "CASCADE"
});

FrMapa01Detail.belongsTo(FrMapa01, {
  foreignKey: "id_mapa01"
});


// 🔗 HEADER → JADWAL
FrMapa01.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrMapa01, {
  foreignKey: "id_jadwal",
  as: "frMapa01"
});


// 🔗 HEADER → ASESOR
FrMapa01.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});

ProfileAsesor.hasMany(FrMapa01, {
  foreignKey: "id_asesor",
  as: "frMapa01"
});


// 🔗 DETAIL → UNIT
FrMapa01Detail.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(FrMapa01Detail, {
  foreignKey: "id_unit",
  as: "frMapa01Detail"
});

// ==========================
// FR.MAPA.02 (FINAL)
// ==========================

// HEADER → UNIT
FrMapa02.hasMany(FrMapa02Unit, {
  foreignKey: "id_mapa02",
  as: "unit",
  onDelete: "CASCADE"
});

FrMapa02Unit.belongsTo(FrMapa02, {
  foreignKey: "id_mapa02"
});

// UNIT → MUK
FrMapa02Unit.hasMany(FrMapa02Muk, {
  foreignKey: "id_mapa02_unit",
  as: "muk",
  onDelete: "CASCADE"
});

FrMapa02Muk.belongsTo(FrMapa02Unit, {
  foreignKey: "id_mapa02_unit"
});

// 🔗 MAPA02 → MAPA01
FrMapa02.belongsTo(FrMapa01, {
  foreignKey: "id_mapa01",
  as: "mapa01"
});

// 🔗 ke Jadwal
FrMapa02.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrMapa02, {
  foreignKey: "id_jadwal",
  as: "frMapa02"
});

// 🔗 ke Asesor
FrMapa02.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  as: "asesor"
});

ProfileAsesor.hasMany(FrMapa02, {
  foreignKey: "id_asesor",
  as: "frMapa02"
});

// 🔗 UNIT → MASTER
FrMapa02Unit.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unitDetail"
});

UnitKompetensi.hasMany(FrMapa02Unit, {
  foreignKey: "id_unit",
  as: "frMapa02Unit"
});

// 🔗 KELOMPOK
FrMapa02Unit.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrMapa02Unit, {
  foreignKey: "id_kelompok",
  as: "frMapa02Unit"
});

// ==========================
// FR.IA.01 (OBSERVASI AKTIVITAS KERJA)
// ==========================

// 🔗 HEADER → DETAIL
FrIa01.hasMany(FrIa01Detail, {
  foreignKey: "id_fr_ia_01",
  as: "detail",
  onDelete: "CASCADE"
});

FrIa01Detail.belongsTo(FrIa01, {
  foreignKey: "id_fr_ia_01"
});


// 🔗 HEADER → JADWAL
FrIa01.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa01, {
  foreignKey: "id_jadwal",
  as: "frIa01List"
});


// 🔗 HEADER → PESERTA
FrIa01.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa01, {
  foreignKey: "id_peserta",
  as: "frIa01List"
});


// 🔗 HEADER → ASESOR
FrIa01.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa01, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa01List"
});


// ==========================
// DETAIL → MASTER
// ==========================

// 🔗 DETAIL → UNIT
FrIa01Detail.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(FrIa01Detail, {
  foreignKey: "id_unit",
  as: "frIa01Detail"
});


// 🔗 DETAIL → ELEMEN
FrIa01Detail.belongsTo(UnitElemen, {
  foreignKey: "id_elemen",
  as: "elemen"
});

UnitElemen.hasMany(FrIa01Detail, {
  foreignKey: "id_elemen",
  as: "frIa01Detail"
});


// 🔗 DETAIL → KUK
FrIa01Detail.belongsTo(UnitKuk, {
  foreignKey: "id_kuk",
  as: "kuk"
});

UnitKuk.hasMany(FrIa01Detail, {
  foreignKey: "id_kuk",
  as: "frIa01Detail"
});

// ==========================
// FR.IA.02 (TPD - KOMITE TEKNIS)
// ==========================

// 🔗 HEADER → DETAIL
FrIa02.hasMany(FrIa02Detail, {
  foreignKey: "id_fr_ia_02",
  as: "detail",
  onDelete: "CASCADE"
});

FrIa02Detail.belongsTo(FrIa02, {
  foreignKey: "id_fr_ia_02",
  as: "frIa02"
});


// 🔗 HEADER → VALIDATOR / PENYUSUN
FrIa02.hasMany(FrIa02Validator, {
  foreignKey: "id_fr_ia_02",
  as: "validator",
  onDelete: "CASCADE"
});

FrIa02Validator.belongsTo(FrIa02, {
  foreignKey: "id_fr_ia_02",
  as: "frIa02"
});


// 🔗 HEADER → JADWAL
FrIa02.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa02, {
  foreignKey: "id_jadwal",
  as: "frIa02"
});


// 🔗 HEADER → SKEMA
FrIa02.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa02, {
  foreignKey: "id_skema",
  as: "frIa02"
});


// 🔗 HEADER → TUK
FrIa02.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrIa02, {
  foreignKey: "id_tuk",
  as: "frIa02"
});


ProfileAsesor.hasMany(FrIa02, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa02"
});

FrIa02.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesi.hasMany(FrIa02, {
  foreignKey: "id_asesi",
  sourceKey: "id_user", // 🔥 WAJIB
  as: "frIa02"
});

FrIa02.belongsTo(ProfileAsesi, {
  foreignKey: "id_asesi",
  targetKey: "id_user", // 🔥 WAJIB
  as: "asesi"
});


// 🔗 DETAIL → KELOMPOK PEKERJAAN
FrIa02Detail.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa02Detail, {
  foreignKey: "id_kelompok",
  as: "frIa02Detail"
});


FrIa02Validator.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa02Validator, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa02Validator"
});

// ==========================
// FR.IA.03 (PERTANYAAN OBSERVASI)
// ==========================

// 🔗 HEADER → PERTANYAAN
FrIa03.hasMany(FrIa03Pertanyaan, {
  foreignKey: "id_fr_ia_03",
  as: "pertanyaan",
  onDelete: "CASCADE"
});

FrIa03Pertanyaan.belongsTo(FrIa03, {
  foreignKey: "id_fr_ia_03",
  as: "frIa03"
});


// 🔗 PERTANYAAN → JAWABAN (1:1)
FrIa03Pertanyaan.hasOne(FrIa03Jawaban, {
  foreignKey: "id_pertanyaan",
  as: "jawaban",
  onDelete: "CASCADE"
});

FrIa03Jawaban.belongsTo(FrIa03Pertanyaan, {
  foreignKey: "id_pertanyaan",
  as: "pertanyaan"
});


// 🔗 PERTANYAAN → UNIT KOMPETENSI
FrIa03Pertanyaan.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(FrIa03Pertanyaan, {
  foreignKey: "id_unit",
  as: "frIa03Pertanyaan"
});


// 🔗 HEADER → JADWAL
FrIa03.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa03, {
  foreignKey: "id_jadwal",
  as: "frIa03"
});


// 🔗 HEADER → SKEMA
FrIa03.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa03, {
  foreignKey: "id_skema",
  as: "frIa03"
});


// 🔗 HEADER → TUK
FrIa03.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrIa03, {
  foreignKey: "id_tuk",
  as: "frIa03"
});


// 🔗 HEADER → ASESOR
FrIa03.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa03, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa03"
});


// 🔗 HEADER → ASESI
FrIa03.belongsTo(ProfileAsesi, {
  foreignKey: "id_asesi",
  targetKey: "id_user",
  as: "asesi"
});

ProfileAsesi.hasMany(FrIa03, {
  foreignKey: "id_asesi",
  sourceKey: "id_user",
  as: "frIa03"
});

// ==========================
// FR.IA.04A (DIT - KOMITE TEKNIS)
// ==========================

// 🔗 HEADER → DETAIL
FrIa04a.hasMany(FrIa04aDetail, {
  foreignKey: "id_fr_ia_04a",
  as: "detail",
  onDelete: "CASCADE"
})

FrIa04aDetail.belongsTo(FrIa04a, {
  foreignKey: "id_fr_ia_04a"
});


// 🔗 HEADER → JADWAL
FrIa04a.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa04a, {
  foreignKey: "id_jadwal",
  as: "frIa04aList"
});


// 🔗 HEADER → SKEMA
FrIa04a.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa04a, {
  foreignKey: "id_skema",
  as: "frIa04aList"
});


// 🔗 HEADER → TUK
FrIa04a.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrIa04a, {
  foreignKey: "id_tuk",
  as: "frIa04aList"
});

// 🔗 HEADER → ASESOR (PROFILE)
FrIa04a.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa04a, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa04aList"
});


// 🔗 DETAIL → KELOMPOK PEKERJAAN
FrIa04aDetail.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa04aDetail, {
  foreignKey: "id_kelompok",
  as: "frIa04aDetail"
});
// ==========================
// FR.IA.04B (PROYEK / TERSTRUKTUR)
// ==========================

// 🔗 HEADER → DETAIL
FrIa04b.hasMany(FrIa04bDetail, {
  foreignKey: "id_fr_ia_04b",
  as: "detail",
  onDelete: "CASCADE"
});

FrIa04bDetail.belongsTo(FrIa04b, {
  foreignKey: "id_fr_ia_04b"
});


// 🔗 HEADER → JADWAL
FrIa04b.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa04b, {
  foreignKey: "id_jadwal",
  as: "frIa04bList"
});


// 🔗 HEADER → PESERTA
FrIa04b.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa04b, {
  foreignKey: "id_peserta",
  as: "frIa04bList"
});


// 🔗 HEADER → SKEMA
FrIa04b.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa04b, {
  foreignKey: "id_skema",
  as: "frIa04bList"
});


// 🔗 HEADER → TUK
FrIa04b.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrIa04b, {
  foreignKey: "id_tuk",
  as: "frIa04bList"
});


// 🔗 HEADER → ASESOR
FrIa04b.belongsTo(ProfileAsesor, {
  foreignKey: "id_asesor",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa04b, {
  foreignKey: "id_asesor",
  sourceKey: "id_user",
  as: "frIa04bList"
});


// 🔗 DETAIL → KELOMPOK PEKERJAAN
FrIa04bDetail.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa04bDetail, {
  foreignKey: "id_kelompok",
  as: "frIa04bDetail"
});

//FR.IA.05
FrIa05Soal.hasMany(FrIa05Jawaban, {
  foreignKey: "id_soal",
  as: "jawaban"
});

FrIa05Opsi.hasMany(FrIa05Jawaban, {
  foreignKey: "id_opsi",
  as: "jawabanAsesi"
});

FrIa05.hasMany(FrIa05Soal, {
  foreignKey: "id_fr_ia_05",
  as: "soal",
  onDelete: "CASCADE"
});

FrIa05Soal.belongsTo(FrIa05, {
  foreignKey: "id_fr_ia_05",
  as: "frIa05"
});

FrIa05Soal.hasMany(FrIa05Opsi, {
  foreignKey: "id_soal",
  as: "opsi",
  onDelete: "CASCADE"
});

FrIa05Opsi.belongsTo(FrIa05Soal, {
  foreignKey: "id_soal",
  as: "soal"
});

FrIa05Soal.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa05Soal, {
  foreignKey: "id_kelompok",
  as: "frIa05Soal"
});

FrIa05Jawaban.belongsTo(FrIa05Soal, {
  foreignKey: "id_soal",
  as: "soal"
});

FrIa05Jawaban.belongsTo(FrIa05Opsi, {
  foreignKey: "id_opsi",
  as: "opsi"
});

FrIa05Jawaban.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa05Jawaban, {
  foreignKey: "id_peserta",
  as: "frIa05Jawaban"
});

FrIa05.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa05, {
  foreignKey: "id_jadwal",
  as: "frIa05"
});

FrIa05.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa05, {
  foreignKey: "id_skema",
  as: "frIa05"
});

FrIa05Penilaian.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa05Penilaian, {
  foreignKey: "id_peserta",
  as: "frIa05Penilaian"
});

FrIa05Penilaian.belongsTo(FrIa05, {
  foreignKey: "id_fr_ia_05",
  as: "paket"
});

FrIa05.hasMany(FrIa05Penilaian, {
  foreignKey: "id_fr_ia_05",
  as: "penilaian"
});

FrIa05.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "pembuat"
});

ProfileAsesor.hasMany(FrIa05, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa05"
});


//FR.IA.06
FrIa06.hasMany(FrIa06Soal, {
  foreignKey: "id_fr_ia_06",
  as: "soal",
  onDelete: "CASCADE"
});

FrIa06Soal.belongsTo(FrIa06, {
  foreignKey: "id_fr_ia_06",
  as: "paket"
});

FrIa06Soal.hasMany(FrIa06Jawaban, {
  foreignKey: "id_soal",
  as: "jawaban",
  onDelete: "CASCADE"
});

FrIa06Jawaban.belongsTo(FrIa06Soal, {
  foreignKey: "id_soal",
  as: "soal"
});

FrIa06Soal.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa06Soal, {
  foreignKey: "id_kelompok",
  as: "frIa06Soal"
});

FrIa06Jawaban.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa06Jawaban, {
  foreignKey: "id_peserta",
  as: "frIa06Jawaban"
});

FrIa06.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa06, {
  foreignKey: "id_jadwal",
  as: "frIa06"
});

FrIa06.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa06, {
  foreignKey: "id_skema",
  as: "frIa06"
});

FrIa06Penilaian.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa06Penilaian, {
  foreignKey: "id_peserta",
  as: "frIa06Penilaian"
});

FrIa06Penilaian.belongsTo(FrIa06, {
  foreignKey: "id_fr_ia_06",
  as: "paket"
});

FrIa06.hasMany(FrIa06Penilaian, {
  foreignKey: "id_fr_ia_06",
  as: "penilaian"
});

FrIa06.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "pembuat"
});

ProfileAsesor.hasMany(FrIa06, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa06"
});

//FR.IA.07

FrIa07Jawaban.belongsTo(FrIa07, {
  foreignKey: "id_fr_ia_07",
  as: "paket"
});

// dari paket
FrIa07.hasMany(FrIa07Jawaban, {
  foreignKey: "id_fr_ia_07",
  as: "jawaban_paket"
});

FrIa07Jawaban.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "asesor"
});

FrIa07.hasMany(FrIa07Soal, {
  foreignKey: "id_fr_ia_07",
  as: "soal",
  onDelete: "CASCADE"
});

FrIa07Soal.belongsTo(FrIa07, {
  foreignKey: "id_fr_ia_07",
  as: "paket"
});

FrIa07Soal.hasMany(FrIa07Jawaban, {
  foreignKey: "id_soal",
  as: "jawaban",
  onDelete: "CASCADE"
});

FrIa07Jawaban.belongsTo(FrIa07Soal, {
  foreignKey: "id_soal",
  as: "soal"
});

FrIa07Soal.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(FrIa07Soal, {
  foreignKey: "id_unit",
  as: "frIa07Soal"
});

FrIa07Soal.belongsTo(KelompokPekerjaan, {
  foreignKey: "id_kelompok",
  as: "kelompok"
});

KelompokPekerjaan.hasMany(FrIa07Soal, {
  foreignKey: "id_kelompok",
  as: "frIa07Soal"
});

FrIa07Jawaban.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa07Jawaban, {
  foreignKey: "id_peserta",
  as: "frIa07Jawaban"
});

FrIa07.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa07, {
  foreignKey: "id_jadwal",
  as: "frIa07"
});

FrIa07.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa07, {
  foreignKey: "id_skema",
  as: "frIa07"
});

FrIa07Penilaian.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa07Penilaian, {
  foreignKey: "id_peserta",
  as: "frIa07Penilaian"
});

FrIa07Penilaian.belongsTo(FrIa07, {
  foreignKey: "id_fr_ia_07",
  as: "paket"
});

FrIa07.hasMany(FrIa07Penilaian, {
  foreignKey: "id_fr_ia_07",
  as: "penilaian"
});

FrIa07.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "pembuat"
});

ProfileAsesor.hasMany(FrIa07, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa07"
});

//FR.IA.08
// ==========================
// FR.IA.08 (FINAL FIXED)
// ==========================

// 🔗 HEADER → PENILAIAN DOKUMEN
FrIa08.hasMany(FrIa08PenilaianDokumen, {
  foreignKey: "id_fr_ia_08",
  as: "penilaian",
  onDelete: "CASCADE"
});

FrIa08PenilaianDokumen.belongsTo(FrIa08, {
  foreignKey: "id_fr_ia_08",
  as: "frIa08"
});


// 🔗 HEADER → PESERTA
FrIa08.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa08, {
  foreignKey: "id_peserta",
  as: "frIa08List"
});


// 🔗 HEADER → JADWAL
FrIa08.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa08, {
  foreignKey: "id_jadwal",
  as: "frIa08"
});


// 🔗 HEADER → SKEMA
FrIa08.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa08, {
  foreignKey: "id_skema",
  as: "frIa08"
});


// 🔗 HEADER → ASESOR (YANG NILAI)
FrIa08.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa08, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa08"
});

// ==========================
// FR.IA.08 BANK SOAL (KOMITE)
// ==========================

// 🔗 BANK SOAL → SKEMA
FrIa08BankSoal.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa08BankSoal, {
  foreignKey: "id_skema",
  as: "bankSoalWawancara"
});


// 🔗 BANK SOAL → UNIT
FrIa08BankSoal.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(FrIa08BankSoal, {
  foreignKey: "id_unit",
  as: "bankSoalWawancara"
});


// 🔗 BANK SOAL → ELEMEN
FrIa08BankSoal.belongsTo(UnitElemen, {
  foreignKey: "id_elemen",
  as: "elemen"
});

UnitElemen.hasMany(FrIa08BankSoal, {
  foreignKey: "id_elemen",
  as: "bankSoalWawancara"
});


// 🔗 BANK SOAL → KUK
FrIa08BankSoal.belongsTo(UnitKuk, {
  foreignKey: "id_kuk",
  as: "kuk"
});

UnitKuk.hasMany(FrIa08BankSoal, {
  foreignKey: "id_kuk",
  as: "bankSoalWawancara"
});


// 🔗 BANK SOAL → PEMBUAT (KOMITE)
FrIa08BankSoal.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "pembuat"
});

ProfileAsesor.hasMany(FrIa08BankSoal, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "bankSoalWawancara"
});

// ==========================
// FR.IA.09 (FINAL)
// ==========================

// 🔗 HEADER → DETAIL
FrIa09.hasMany(FrIa09Detail, {
  foreignKey: "id_fr_ia_09",
  as: "detailJawaban",
  onDelete: "CASCADE"
});

FrIa09Detail.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa09Detail, {
  foreignKey: "id_peserta",
  as: "frIa09Detail"
});

FrIa09Detail.belongsTo(FrIa09, {
  foreignKey: "id_fr_ia_09",
  as: "frIa09"
});


// 🔗 DETAIL → BANK SOAL (FR.IA.08)
FrIa09Detail.belongsTo(FrIa08BankSoal, {
  foreignKey: "id_soal",
  as: "soal"
});

FrIa08BankSoal.hasMany(FrIa09Detail, {
  foreignKey: "id_soal",
  as: "jawabanAsesor"
});

// 🔗 HEADER → PESERTA
FrIa09.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa09, {
  foreignKey: "id_peserta",
  as: "frIa09List"
});


// 🔗 HEADER → JADWAL
FrIa09.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa09, {
  foreignKey: "id_jadwal",
  as: "frIa09"
});


// 🔗 HEADER → SKEMA
FrIa09.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa09, {
  foreignKey: "id_skema",
  as: "frIa09"
});


// 🔗 HEADER → ASESOR (PENGUJI)
FrIa09.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa09, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa09"
});

// 🔗 FR.IA.09 → FR.IA.08
FrIa09.belongsTo(FrIa08, {
  foreignKey: "id_fr_ia_08",
  as: "frIa08"
});

FrIa08.hasOne(FrIa09, {
  foreignKey: "id_fr_ia_08",
  as: "frIa09"
});

// ==========================
// FR.IA.10 (KLARIFIKASI PIHAK KETIGA)
// ==========================

// 🔗 HEADER → PESERTA
FrIa10.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrIa10, {
  foreignKey: "id_peserta",
  as: "frIa10List"
});


// 🔗 HEADER → JADWAL
FrIa10.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrIa10, {
  foreignKey: "id_jadwal",
  as: "frIa10"
});


// 🔗 HEADER → SKEMA
FrIa10.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrIa10, {
  foreignKey: "id_skema",
  as: "frIa10"
});


// 🔗 HEADER → ASESOR (PENGUJI)
FrIa10.belongsTo(ProfileAsesor, {
  foreignKey: "created_by",
  targetKey: "id_user",
  as: "asesor"
});

ProfileAsesor.hasMany(FrIa10, {
  foreignKey: "created_by",
  sourceKey: "id_user",
  as: "frIa10"
});


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

SkemaPersyaratan.belongsTo(Persyaratan, {
  foreignKey: "id_persyaratan",
  as: "persyaratan"
});

Persyaratan.hasMany(SkemaPersyaratan, {
  foreignKey: "id_persyaratan",
  as: "skema_persyaratan"
});

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
  as: "buktiTambahan"
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


BankSoal.hasMany(BankSoalPG, { foreignKey: "id_soal" });
BankSoalPG.belongsTo(BankSoal, { foreignKey: "id_soal" });

UnitKompetensi.hasMany(UnitElemen, { foreignKey: "id_unit" });
UnitElemen.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });

UnitElemen.hasMany(UnitKuk, { foreignKey: "id_elemen" });
UnitKuk.belongsTo(UnitElemen, { foreignKey: "id_elemen" });

// ==========================
// APL02 FORM RELATION
// ==========================

// SkemaUnit → UnitKompetensi
SkemaUnit.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

UnitKompetensi.hasMany(SkemaUnit, {
  foreignKey: "id_unit",
  as: "skemaUnit"
});

// UnitKompetensi → Elemen
UnitKompetensi.hasMany(UnitElemen, {
  foreignKey: "id_unit",
  as: "elemen"
});

UnitElemen.belongsTo(UnitKompetensi, {
  foreignKey: "id_unit",
  as: "unit"
});

// Elemen → KUK
UnitElemen.hasMany(UnitKuk, {
  foreignKey: "id_elemen",
  as: "kuk"
});

UnitKuk.belongsTo(UnitElemen, {
  foreignKey: "id_elemen",
  as: "elemen"
});

BankSoal.belongsTo(UnitKompetensi, { foreignKey: "id_unit" });
UnitKompetensi.hasMany(BankSoal, { foreignKey: "id_unit" });

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
// FR.AK.03 (UMPAN BALIK ASESI)
// ==========================

// 🔗 HEADER → DETAIL
FrAk03.hasMany(FrAk03Detail, {
  foreignKey: "id_fr_ak03",
  as: "detailAk03",
  onDelete: "CASCADE"
});

FrAk03Detail.belongsTo(FrAk03, {
  foreignKey: "id_fr_ak03",
  as: "frAk03"
});


// 🔗 HEADER → PESERTA
FrAk03.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasMany(FrAk03, {
  foreignKey: "id_peserta",
  as: "frAk03List"
});


// 🔗 HEADER → JADWAL
FrAk03.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk03, {
  foreignKey: "id_jadwal",
  as: "frAk03"
});


// 🔗 HEADER → SKEMA
FrAk03.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrAk03, {
  foreignKey: "id_skema",
  as: "frAk03"
});


// 🔗 HEADER → TUK
FrAk03.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrAk03, {
  foreignKey: "id_tuk",
  as: "frAk03"
});

// ==========================
// FR.AK.04 (BANDING ASESMEN)
// ==========================

// 🔗 ke peserta_jadwal
FrAk04.belongsTo(PesertaJadwal, {
  foreignKey: "id_peserta",
  as: "peserta"
});

PesertaJadwal.hasOne(FrAk04, {
  foreignKey: "id_peserta",
  as: "frAk04"
});


// 🔗 ke jadwal
FrAk04.belongsTo(Jadwal, {
  foreignKey: "id_jadwal",
  as: "jadwal"
});

Jadwal.hasMany(FrAk04, {
  foreignKey: "id_jadwal",
  as: "frAk04"
});


// 🔗 ke skema
FrAk04.belongsTo(Skema, {
  foreignKey: "id_skema",
  as: "skema"
});

Skema.hasMany(FrAk04, {
  foreignKey: "id_skema",
  as: "frAk04"
});


// 🔗 ke TUK
FrAk04.belongsTo(Tuk, {
  foreignKey: "id_tuk",
  as: "tuk"
});

Tuk.hasMany(FrAk04, {
  foreignKey: "id_tuk",
  as: "frAk04"
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

PesertaJadwal.belongsTo(User, { as: 'asesor_penguji', foreignKey: 'id_asesor' });
User.hasMany(PesertaJadwal, { as: 'asesi_yang_diuji', foreignKey: 'id_asesor' });

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
  SkemaUnit,
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
  Mkva,
  FrAk01,
  FrAk02,
  FrAk05,
  FrAk06,
  FrAk06Detail,
  FrAk07,
  MkvaDetail,
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
FrIa02,
FrIa02Detail,
FrIa02Validator,
FrIa03,
FrIa03Pertanyaan,
FrIa03Jawaban,
FrIa04a,
FrIa04aDetail,
FrIa04b,
FrIa04bDetail,
FrIa01,
FrIa01Detail,
FrIa05,
FrIa05Soal,
FrIa05Opsi,
FrIa05Jawaban,
FrIa05Penilaian,
FrIa06,
FrIa06Soal,
FrIa06Jawaban,
FrIa06Penilaian,
FrIa07,
FrIa07Soal,
FrIa07Jawaban,
FrIa07Penilaian,
FrIa08,
FrIa08PenilaianDokumen,
FrIa08BankSoal,
FrIa09,
FrIa09Detail,
FrIa10,
FrAk03,
FrAk03Detail,
FrAk04
};