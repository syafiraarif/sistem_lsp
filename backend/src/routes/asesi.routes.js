const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");  
const profileController = require("../controllers/asesi/profile.controller");
const pendaftaranController = require("../controllers/asesi/pendaftaran.controller");
const aplikasiController = require("../controllers/asesi/aplikasi.controller");  
const apl02Controller = require("../controllers/asesi/apl02.controller");  
const pembayaranController = require("../controllers/asesi/pembayaran.controller"); 
const bandingController = require("../controllers/asesi/banding.controller");
const pesertaJadwalController = require("../controllers/asesi/pesertaJadwal.controller");

router.use(authMiddleware, roleMiddleware.asesiOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put("/profile/upload-dokumen", uploadMiddleware, profileController.uploadDokumen);

router.post("/pendaftaran", pendaftaranController.daftar);

router.get("/skema", aplikasiController.getSkema);
router.get("/skema/:id_skema/persyaratan", aplikasiController.getPersyaratanBySkema);
router.get("/skkni", aplikasiController.getSkkni);
router.get("/skkni/:id_skkni/units", aplikasiController.getUnitKompetensiBySkkni);
router.post("/aplikasi", uploadMiddleware, aplikasiController.submitAplikasi); 
router.get("/aplikasi", aplikasiController.getAplikasi);

router.get("/pembayaran/:id_aplikasi/detail", pembayaranController.getDetailPembayaran);
router.post("/pembayaran/submit", pembayaranController.submitPembayaran);
router.put("/pembayaran/:id_pembayaran/upload-bukti", uploadMiddleware, pembayaranController.uploadBuktiBayar);
router.get("/pembayaran/:id_aplikasi/status", pembayaranController.getStatusPembayaran);

router.get("/apl02/:id_aplikasi/units", apl02Controller.getUnitsForApl02);  
router.post("/apl02/submit", uploadMiddleware, apl02Controller.submitApl02);  
router.put("/apl02/update/:id_apl02", uploadMiddleware, apl02Controller.updateApl02);  
router.get("/apl02/:id_aplikasi", apl02Controller.getApl02Data);  

router.get("/jadwal-saya", pesertaJadwalController.getJadwalSaya);

router.post("/banding", bandingController.ajukanBanding);
router.get("/banding-saya", bandingController.getBandingSaya);

module.exports = router;