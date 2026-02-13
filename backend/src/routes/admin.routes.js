const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin/admin.controller");
const pendaftaranController = require("../controllers/admin/pendaftaran.controller");
const pengaduanController = require("../controllers/admin/pengaduan.controller");
const notifikasiController = require("../controllers/admin/notifikasi.controller");
const asesorAdmin = require("../controllers/admin/asesor.controller");
const tukAdmin = require("../controllers/admin/tuk.controller");
const skkniController = require("../controllers/admin/skkni.controller");
const skemaController = require("../controllers/admin/skema.controller");
const biayaUjiController = require("../controllers/admin/biayaUji.controller");
const persyaratanController = require("../controllers/admin/persyaratan.controller");
const persyaratanTukController = require("../controllers/admin/persyaratanTuk.controller");
const kelompokPekerjaanController = require("../controllers/admin/kelompokPekerjaan.controller");
const tukTempatController = require("../controllers/admin/tukTempat.controller");
const adminProfile = require("../controllers/admin/profile.controller");
const bandingController = require("../controllers/admin/banding.controller");
const dokumenMutuController = require("../controllers/admin/dokumenMutu.controller");
const pesertaJadwalController = require("../controllers/admin/pesertaJadwal.controller");

router.get("/profile", adminProfile.getProfile);
router.put("/profile", adminProfile.updateProfile);


router.post("/asesor", asesorAdmin.createAsesor);
router.post("/tuk-akun", tukAdmin.createTuk);

router.use(authMiddleware, roleMiddleware.adminOnly);

router.get("/dashboard", adminController.getDashboard);

router.get("/pendaftaran", pendaftaranController.getAll);
router.post("/pendaftaran/:id/approve", pendaftaranController.approvePendaftaran);

router.get("/pengaduan", pengaduanController.getAll);
router.put("/pengaduan/:id/status", pengaduanController.updateStatus);

router.get("/notifikasi", notifikasiController.getAll);

router.post("/skkni", skkniController.create);
router.get("/skkni", skkniController.getAll);
router.get("/skkni/:id", skkniController.getById);
router.put("/skkni/:id", skkniController.update);
router.delete("/skkni/:id", skkniController.delete);

router.post("/skema", skemaController.create);
router.get("/skema", skemaController.getAll);
router.get("/skema/:id", skemaController.getDetail);
router.put("/skema/:id", skemaController.update);
router.delete("/skema/:id", skemaController.delete);

router.post("/biaya-uji", biayaUjiController.create);
router.get("/biaya-uji/skema/:id_skema", biayaUjiController.getBySkema);
router.put("/biaya-uji/:id", biayaUjiController.update);
router.delete("/biaya-uji/:id", biayaUjiController.delete);

router.post("/persyaratan", persyaratanController.create);
router.get("/persyaratan", persyaratanController.getAll);

router.post("/persyaratan-tuk", persyaratanTukController.create);
router.get("/persyaratan-tuk", persyaratanTukController.getAll);
router.post("/persyaratan-tuk/attach", persyaratanTukController.attachToSkema);
router.delete(
  "/persyaratan-tuk/detach/:id_skema/:id_persyaratan_tuk",
  persyaratanTukController.detachFromSkema
);

router.post("/kelompok-pekerjaan", kelompokPekerjaanController.create);
router.get(
  "/kelompok-pekerjaan/skema/:id_skema",
  kelompokPekerjaanController.getBySkema
);
router.put("/kelompok-pekerjaan/:id", kelompokPekerjaanController.update);
router.delete("/kelompok-pekerjaan/:id", kelompokPekerjaanController.delete);

router.post("/tuk-tempat", tukTempatController.create);
router.get("/tuk-tempat", tukTempatController.getAll);
router.put("/tuk-tempat/:id", tukTempatController.update);
router.delete("/tuk-tempat/:id", tukTempatController.delete);

router.post("/tuk-tempat/attach-skema", tukTempatController.attachSkema);
router.delete(
  "/tuk-tempat/detach-skema/:id_tuk/:id_skema",
  tukTempatController.detachSkema
);

router.get("/banding", bandingController.getAllBanding);
router.put("/banding/:id", bandingController.updateStatusBanding);

router.post("/dokumen-mutu", dokumenMutuController.createDokumen);
router.get("/dokumen-mutu", dokumenMutuController.getAllDokumen);
router.put("/dokumen-mutu/:id", dokumenMutuController.updateDokumen);
router.delete("/dokumen-mutu/:id", dokumenMutuController.deleteDokumen);

router.get(
  "/jadwal/:id_jadwal/peserta",
  pesertaJadwalController.getPesertaByJadwal
);


module.exports = router;
