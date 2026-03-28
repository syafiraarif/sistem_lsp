const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/tuk/profile.controller");
const jadwalController = require("../controllers/tuk/jadwal.controller");
const jadwalAsesorController = require("../controllers/tuk/jadwalAsesor.controller");
const lupaPasswordTukController = require("../controllers/tuk/lupaPasswordTuk.controller");

const wilayahController = require("../controllers/public/wilayah.controller");

router.use(authMiddleware, roleMiddleware.tukOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.post("/ubah-password", lupaPasswordTukController.changePassword);

// 📋 Jadwal
router.get("/skema", jadwalController.getSkemaTuk);
router.post("/jadwal", jadwalController.createJadwal);
router.get("/jadwal", jadwalController.getAllJadwal);
router.get("/jadwal/:id", jadwalController.getJadwalById);
router.put("/jadwal/:id", jadwalController.updateJadwal);
router.delete("/jadwal/:id", jadwalController.deleteJadwal);

// ✅ ASESOR ROUTES - SESUAI CONTROLLER
router.get("/jadwal/:id/asesor/:jenisTugas", jadwalAsesorController.listAsesorJadwal);
router.post("/jadwal/:id/asesor/:jenisTugas", jadwalAsesorController.manageAsesor);
router.delete("/jadwal/:id/asesor/:jenisTugas/:idUser", jadwalAsesorController.removeAsesor);
router.get("/asesor", jadwalAsesorController.getAsesorTuk);

router.get("/wilayah/provinsi", wilayahController.getProvinsi);
router.get("/wilayah/kota/:id", wilayahController.getKota);
router.get("/wilayah/kecamatan/:id", wilayahController.getKecamatan);
router.get("/wilayah/kelurahan/:id", wilayahController.getKelurahan);

module.exports = router;