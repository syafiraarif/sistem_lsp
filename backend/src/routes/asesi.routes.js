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

/* ========================= PROFILE ========================= */
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put(
  "/profile/upload-dokumen",
  uploadMiddleware,
  profileController.uploadDokumen
);
router.put("/profile/upload-ttd", profileController.uploadTTD);
router.get("/profile/files", profileController.getFiles);
router.put("/ubah-password", lupaPasswordAsesiController.changePassword);

/* ========================= APL01 ========================= */
router.get("/apl01/form/:id_peserta", apl01Controller.getFormApl01);
router.post("/apl01/create", apl01Controller.createApl01);
router.post(
  "/apl01/upload",
  uploadMiddleware,
  apl01Controller.uploadDokumenApl01
);
router.get("/apl01/:id_peserta", apl01Controller.getApl01);
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

/* ========================= APL02 ========================= */
router.get("/apl02/form/:id_skema", apl02Controller.getFormApl02);
router.post("/apl02/create", apl02Controller.createApl02);
router.post("/apl02/penilaian", apl02Controller.savePenilaian);
router.post("/apl02/upload", uploadMiddleware, apl02Controller.uploadBukti);
router.get("/apl02/:id_peserta", apl02Controller.getApl02);
router.delete("/apl02/bukti/:id_bukti", apl02Controller.deleteBukti);
router.put("/apl02/submit/:id_apl02", apl02Controller.submitApl02);

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

/* ========================= PRESENSI ========================= */
router.get("/presensi/status/:id_peserta", presensiController.getStatusPresensi);
router.get("/presensi/detail/:id_peserta", presensiController.getDetailPresensi);
router.post("/presensi", uploadMiddleware, presensiController.createPresensi);

/* ========================= FR.AK.03 ========================= */
router.get("/fr-ak03/:id_peserta", frAk03Controller.getFrAk03ByPeserta);
router.post("/fr-ak03", frAk03Controller.createFrAk03);
router.get("/fr-ak03/pdf/:id_peserta", frAk03Controller.generatePdfFrAk03);

/* ========================= FR.AK.04 ========================= */
router.get("/fr-ak04/:id_peserta", frAk04Controller.getFrAk04ByPeserta);
router.post("/fr-ak04", frAk04Controller.createFrAk04);
router.get("/fr-ak04/pdf/:id_peserta", frAk04Controller.generatePdfFrAk04);

/* ========================= FR.IA.05 ASESI ========================= */


/*
========================================
AMBIL SOAL
========================================

- cek apakah sudah submit
- kalau sudah submit -> tidak bisa buka soal lagi
- tidak menampilkan jawaban benar
*/

router.get(

"/fr-ia05/:id_fr_ia_05/:id_peserta",

frIa05AsesiController.getSoal

);



/*
========================================
SUBMIT UJIAN
========================================

- submit sekali
- langsung lock
- otomatis hitung nilai
*/

router.post(

"/fr-ia05/submit",

frIa05AsesiController.submit

);



/*
========================================
LIHAT HASIL UJIAN
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