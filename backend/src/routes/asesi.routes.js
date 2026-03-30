const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const profileController = require("../controllers/asesi/profile.controller");
const aplikasiController = require("../controllers/asesi/apl01.controller");
const apl02Controller = require("../controllers/asesi/apl02.controller");
const pembayaranController = require("../controllers/asesi/pembayaran.controller");
const bandingController = require("../controllers/asesi/banding.controller");
const pesertaJadwalController = require("../controllers/asesi/pesertaJadwal.controller");
const unitKompetensiAsesi = require("../controllers/asesi/unitKompetensi.controller");
const wilayahController = require("../controllers/public/wilayah.controller");
const lupaPasswordAsesiController = require("../controllers/asesi/lupapasswordAsesi.controller");
const praAsesmenController = require("../controllers/asesi/praAsesmenAsesi.controller"); // <<< tambahan

// Semua route hanya bisa diakses oleh asesi
router.use(authMiddleware, roleMiddleware.asesiOnly);

/* ========================= PROFILE ========================= */
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put("/profile/upload-dokumen", uploadMiddleware, profileController.uploadDokumen);
router.put("/profile/upload-ttd", profileController.uploadTTD);
router.get("/profile/files", profileController.getFiles);
router.put("/ubah-password", lupaPasswordAsesiController.changePassword);

/* ========================= SKEMA & APLIKASI ========================= */
router.get("/skema", aplikasiController.getSkema);
router.get("/skema/:id_skema/persyaratan", aplikasiController.getPersyaratanBySkema);
router.get("/skkni", aplikasiController.getSkkni);
router.get("/skkni/:id_skkni/units", aplikasiController.getUnitKompetensiBySkkni);
router.post("/aplikasi", uploadMiddleware, aplikasiController.submitAplikasi);
router.get("/aplikasi", aplikasiController.getAplikasi);

/* ========================= PEMBAYARAN ========================= */
router.post("/pembayaran/submit", pembayaranController.submitPembayaran);
router.put("/pembayaran/:id_pembayaran/upload-bukti", uploadMiddleware, pembayaranController.uploadBuktiBayar);
router.get("/pembayaran/:id_skema/detail", pembayaranController.getDetailPembayaran);
router.get("/pembayaran/:id_skema/status", pembayaranController.getStatusPembayaran);

/* ========================= APL02 ========================= */
router.get("/apl02/:id_skema/units", apl02Controller.getUnitsForApl02);
router.post("/apl02/submit", uploadMiddleware, apl02Controller.submitApl02);
router.put("/apl02/update/:id_apl02", uploadMiddleware, apl02Controller.updateApl02);
router.get("/apl02/:id_skema", apl02Controller.getApl02Data);

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
router.get("/unit-kompetensi/skkni/:id_skkni", unitKompetensiAsesi.getBySkkni);
router.get("/unit-kompetensi/:id", unitKompetensiAsesi.getDetail);

/* ========================= PRA ASESMEN ========================= */
router.get("/pra-asesmen/form", praAsesmenController.getFormData);        // ambil data form
router.post("/pra-asesmen/submit", praAsesmenController.submitForm);     // submit presensi
router.get("/pra-asesmen/download", praAsesmenController.downloadPdf);   // download PDF

/* ========================= WILAYAH ========================= */
router.get("/wilayah/provinsi", wilayahController.getProvinsi);
router.get("/wilayah/kota/:id", wilayahController.getKota);
router.get("/wilayah/kecamatan/:id", wilayahController.getKecamatan);
router.get("/wilayah/kelurahan/:id", wilayahController.getKelurahan);

/* ========================= 404 fallback ========================= */
router.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

module.exports = router;