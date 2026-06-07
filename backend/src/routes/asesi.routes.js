const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const profileController = require("../controllers/asesi/profile.controller");
const apl01Controller = require("../controllers/asesi/apl01.controller");
const apl02Controller = require("../controllers/asesi/apl02.controller");
const pembayaranController = require("../controllers/asesi/pembayaran.controller");
const bandingController = require("../controllers/asesi/banding.controller");
const pesertaJadwalController = require("../controllers/asesi/pesertaJadwal.controller");
const unitKompetensiAsesi = require("../controllers/asesi/unitKompetensi.controller");
const wilayahController = require("../controllers/public/wilayah.controller");
const lupaPasswordAsesiController = require("../controllers/asesi/lupapasswordAsesi.controller");
const presensiController = require("../controllers/asesi/presensi.controller");
const frAk03Controller = require("../controllers/asesi/frAk03.controller");
const frAk04Controller = require("../controllers/asesi/frAk04.controller");
const frIa05AsesiController = require("../controllers/asesi/frIa05Asesi.controller");
const hasilAkhirAsesiController =
require("../controllers/asesi/hasilAkhirAsesi.controller");

router.use(authMiddleware, roleMiddleware.asesiOnly);

/* =========================
PROFILE
========================= */

router.get(
  "/profile",
  profileController.getProfile
);

router.put(
  "/profile",
  profileController.updateProfile
);

/*
UPLOAD FOTO PROFIL
*/

router.put(

  "/profile/upload-dokumen",

  uploadMiddleware,

  profileController.uploadDokumen

);

/*
UPLOAD TTD BASE64
(tidak perlu uploadMiddleware
karena pakai req.body.ttd_base64)
*/

router.put(

  "/profile/upload-ttd",

  profileController.uploadTTD

);

/*
AMBIL FOTO + TTD
*/

router.get(

  "/profile/files",

  profileController.getFiles

);

/*
UBAH PASSWORD
*/

router.put(

  "/ubah-password",

  lupaPasswordAsesiController.changePassword

);


/* =========================
APL01 ROUTES
========================= */

// Ambil form APL01
router.get("/apl01/form/:id_peserta", apl01Controller.getFormApl01);

// Buat APL01
router.post("/apl01/create", apl01Controller.createApl01);

// Upload dokumen persyaratan
router.post(
  "/apl01/upload",
  uploadMiddleware,
  apl01Controller.uploadDokumenApl01
);

// Ambil APL01 dan dokumennya
router.get("/apl01/:id_peserta", apl01Controller.getApl01);

// Generate PDF APL01
router.get("/apl01/pdf/:id_peserta", apl01Controller.generatePdfApl01);

// Submit APL01 (cek kelengkapan dokumen + TTD profile)
router.put("/apl01/submit/:id_apl01", apl01Controller.submitFinalApl01);

/* ========================= PEMBAYARAN ========================= */
router.get(
  "/pembayaran/:id_skema/detail",
  pembayaranController.getDetailPembayaran
);
router.post("/pembayaran/submit", pembayaranController.submitPembayaran);
router.put(
  "/pembayaran/:id_pembayaran/upload-bukti",
  uploadMiddleware,
  pembayaranController.uploadBuktiBayar
);
router.get(
  "/pembayaran/:id_skema/status",
  pembayaranController.getStatusPembayaran
);

/* =========================
APL02 ROUTES
========================= */

/*
AMBIL FORM APL02
(berdasarkan skema)
*/
router.get(
  "/apl02/form/:id_skema",
  apl02Controller.getFormApl02
);


/*
BUAT APL02
*/
router.post(
  "/apl02/create",
  apl02Controller.createApl02
);


/*
SIMPAN PENILAIAN
(K / BK + catatan)
*/
router.post(
  "/apl02/penilaian",
  apl02Controller.savePenilaian
);


/*
UPLOAD BUKTI PORTOFOLIO
*/
router.post(

  "/apl02/upload",

  uploadMiddleware,

  apl02Controller.uploadBukti

);


/*
AMBIL DATA APL02
*/
router.get(

  "/apl02/:id_peserta",

  apl02Controller.getApl02

);


/*
GENERATE PDF APL02
(termasuk TTD profile asesi)
*/
router.get(

  "/apl02/pdf/:id_peserta",

  apl02Controller.generatePdfApl02

);


/*
HAPUS BUKTI
*/
router.delete(

  "/apl02/bukti/:id_bukti",

  apl02Controller.deleteBukti

);


/*
SUBMIT FINAL
(lock data)
*/
router.put(

  "/apl02/submit/:id_apl02",

  apl02Controller.submitApl02

);

/* ========================= JADWAL ASESI ========================= */
router.get("/jadwal/tersedia", pesertaJadwalController.getJadwalTersedia);
router.get("/jadwal-saya", pesertaJadwalController.getJadwalSaya);
router.post("/jadwal/pilih", pesertaJadwalController.pilihJadwal);
router.get("/jadwal/:id/peserta", pesertaJadwalController.getPesertaJadwal);
router.get("/jadwal/:id/asesor", pesertaJadwalController.getAsesorJadwal);
router.get("/jadwal/:id", pesertaJadwalController.getDetailJadwal);

/* ========================= BANDING ========================= */
router.post("/banding", bandingController.ajukanBanding);
router.get("/banding-saya", bandingController.getBandingSaya);

/* ========================= UNIT KOMPETENSI ========================= */
router.get(
  "/unit-kompetensi/skkni/:id_skkni",
  unitKompetensiAsesi.getBySkkni
);
router.get("/unit-kompetensi/:id", unitKompetensiAsesi.getDetail);

/* ========================= WILAYAH ========================= */
router.get("/wilayah/provinsi", wilayahController.getProvinsi);
router.get("/wilayah/kota/:id", wilayahController.getKota);
router.get("/wilayah/kecamatan/:id", wilayahController.getKecamatan);
router.get("/wilayah/kelurahan/:id", wilayahController.getKelurahan);

/* =========================
PRESENSI ROUTES
========================= */

/*
CEK STATUS PRESENSI
*/
router.get(
  "/presensi/status/:id_peserta",
  presensiController.getStatusPresensi
);

/*
DETAIL PRESENSI
*/
router.get(
  "/presensi/detail/:id_peserta",
  presensiController.getDetailPresensi
);

/*
CREATE PRESENSI
(ttd wajib, jadwal aktif & sesuai tanggal)
*/
router.post(
  "/presensi",
  uploadMiddleware,
  presensiController.createPresensi
);

/*
GENERATE PDF PRESENSI
(munculkan detail presensi + asesor + ttd)
*/
router.get(
  "/presensi/pdf/:id_peserta",
  presensiController.generatePdfPresensi
);

/* =========================
FR.AK.03 ROUTES
========================= */

/*
========================================
AMBIL FORM FR.AK.03

- hanya untuk peserta BELUM KOMPETEN
- ambil pertanyaan fixed
- ambil data skema + tuk
========================================
*/
router.get(
  "/fr-ak03/form",
  frAk03Controller.getFormFrAk03
);


/*
========================================
SUBMIT FR.AK.03

- hanya submit 1x
- auto ambil peserta dari login
========================================
*/
router.post(
  "/fr-ak03",
  frAk03Controller.createFrAk03
);


/*
========================================
DETAIL FR.AK.03
========================================
*/
router.get(
  "/fr-ak03/:id_peserta",
  frAk03Controller.getFrAk03ByPeserta
);


/*
========================================
GENERATE PDF FR.AK.03
========================================
*/
router.get(
  "/fr-ak03/pdf/:id_peserta",
  frAk03Controller.generatePdfFrAk03
);

/* ========================= FR.AK.04 ========================= */

/*
========================================
SUBMIT FR.AK.04
- hanya submit 1x
- ambil peserta otomatis dari login
========================================
*/
router.post(
  "/fr-ak04",
  frAk04Controller.createFrAk04
);

/*
========================================
DETAIL FR.AK.04
- ambil peserta + asesor + skema + TUK
========================================
*/
router.get(
  "/fr-ak04/:id_peserta",
  frAk04Controller.getFrAk04ByPeserta
);

/*
========================================
GENERATE PDF FR.AK.04
- tampil otomatis Nama Asesi, Nama Asesor, Tanggal, Skema, TUK
- ambil TTD dari profileAsesi
========================================
*/
router.get(
  "/fr-ak04/pdf/:id_peserta",
  frAk04Controller.generatePdfFrAk04
);

/* =========================
FR.IA.05 ASESI
========================= */

/*
========================================
AMBIL SOAL UJIAN
- cek submit
- tidak tampilkan jawaban benar
========================================
*/
router.get(
  "/fr-ia05/:id_fr_ia_05/:id_peserta",
  frIa05AsesiController.getSoal
);


/*
========================================
SUBMIT JAWABAN ASESI
- submit sekali
- auto hitung nilai
- lock jawaban
========================================
*/
router.post(
  "/fr-ia05/submit",
  frIa05AsesiController.submit
);


/*
========================================
LIHAT HASIL ASESI
========================================
*/
router.get(
  "/fr-ia05/hasil/:id_fr_ia_05/:id_peserta",
  frIa05AsesiController.getHasil
);

/* ========================= 404 fallback ========================= */
router.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

/* ========================= HASIL AKHIR ASESI ========================= */


/*
========================================
CEK STATUS HASIL ASESMEN
========================================

kompeten

atau

belum kompeten
*/

router.get(

"/hasil-saya",

hasilAkhirAsesiController.getStatusSaya

);



/*
========================================
DETAIL HASIL ASESMEN
========================================

jika kompeten:

Presensi
APL01
APL02
FRIA PDF
*/

router.get(

"/hasil-saya/detail",

hasilAkhirAsesiController.getHasilSaya

);

module.exports = router;