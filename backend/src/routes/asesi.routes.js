const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");  // Ditambahkan untuk fitur upload dokumen

const profileController = require("../controllers/asesi/profile.controller");
const pendaftaranController = require("../controllers/asesi/pendaftaran.controller");
const aplikasiController = require("../controllers/asesi/aplikasi.controller");  // Import untuk controller aplikasi asesmen
const apl02Controller = require("../controllers/asesi/apl02.controller");  // Import untuk controller APL02
const pembayaranController = require("../controllers/asesi/pembayaran.controller");  // Tambahkan import untuk controller pembayaran

router.use(authMiddleware, roleMiddleware.asesiOnly);

// Endpoint lama (profil dan pendaftaran)
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Endpoint baru untuk upload dokumen persyaratan LSP
router.put("/profile/upload-dokumen", uploadMiddleware, profileController.uploadDokumen);

router.post("/pendaftaran", pendaftaranController.daftar);

// Endpoint baru untuk aplikasi asesmen
router.get("/skema", aplikasiController.getSkema);
router.get("/skema/:id_skema/persyaratan", aplikasiController.getPersyaratanBySkema);
router.get("/skkni", aplikasiController.getSkkni);
router.get("/skkni/:id_skkni/units", aplikasiController.getUnitKompetensiBySkkni);
router.post("/aplikasi", uploadMiddleware, aplikasiController.submitAplikasi);  // Upload included untuk dokumen dan tanda tangan
router.get("/aplikasi", aplikasiController.getAplikasi);

// Endpoint baru untuk pembayaran (harus bayar dulu sebelum APL01/APL02)
router.get("/pembayaran/:id_aplikasi/detail", pembayaranController.getDetailPembayaran);
router.post("/pembayaran/submit", pembayaranController.submitPembayaran);
router.put("/pembayaran/:id_pembayaran/upload-bukti", uploadMiddleware, pembayaranController.uploadBuktiBayar);
router.get("/pembayaran/:id_aplikasi/status", pembayaranController.getStatusPembayaran);

// Endpoint baru untuk APL02 (Asesmen Mandiri)
router.get("/apl02/:id_aplikasi/units", apl02Controller.getUnitsForApl02);  // Get unit kompetensi dengan elemen/kriteria untuk APL02
router.post("/apl02/submit", uploadMiddleware, apl02Controller.submitApl02);  // Submit jawaban APL02 dengan upload file bukti
router.put("/apl02/update/:id_apl02", uploadMiddleware, apl02Controller.updateApl02);  // Tambahkan endpoint untuk update jawaban APL02 (jika perlu edit)
router.get("/apl02/:id_aplikasi", apl02Controller.getApl02Data);  // Get data APL02 yang sudah diisi

module.exports = router;