const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");
const profileController = require("../controllers/asesor/profile.controller");
const jadwalAsesorController = require("../controllers/asesor/jadwal.controller");
const pesertaJadwalController = require("../controllers/asesor/pesertaJadwal.controller");
const mkvaController = require("../controllers/asesor/mkva.controller");
const frAk01Controller = require("../controllers/asesor/frAk01.controller"); // ✅ Nama variabel berbeda

router.use(authMiddleware, roleMiddleware.asesorOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Route upload TTD
router.put("/profile/upload-ttd", (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, profileController.uploadTTD);

router.get("/jadwal-saya", jadwalAsesorController.getJadwalSaya);
router.put("/peserta/:id/nilai", pesertaJadwalController.updateNilaiPeserta);

// Route FR.AK.01 menggunakan frAk01Controller
router.get("/fr-ak-01/form/:id_peserta_jadwal", frAk01Controller.getFormData);
router.post("/fr-ak-01/form/:id_peserta_jadwal", frAk01Controller.submitForm);
router.put("/fr-ak-01/:id_fr_ak_01/sign", frAk01Controller.signForm);
router.get("/fr-ak-01/:id_fr_ak_01/pdf", frAk01Controller.downloadPdf);

// Route MKVA tetap menggunakan mkvaController
router.get("/mkva/jadwal", mkvaController.getJadwalAsesor);
router.get("/mkva/form/:id_jadwal", mkvaController.getFormData);
router.post("/mkva/form/:id_jadwal", mkvaController.submitForm);
router.get("/mkva/download/:id_mkva", mkvaController.downloadForm);
router.get("/mkva/surat-tugas/:id_jadwal", mkvaController.downloadSuratTugas);

module.exports = router;