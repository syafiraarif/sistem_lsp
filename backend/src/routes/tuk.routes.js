const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/tuk/profile.controller");
const jadwalController = require("../controllers/tuk/jadwal.controller");
const jadwalAsesorController = require("../controllers/tuk/jadwalAsesor.controller");
const lupaPasswordTukController = require("../controllers/tuk/lupaPasswordTuk.controller"); // Import controller baru

router.use(authMiddleware, roleMiddleware.tukOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.post("/ubah-password", lupaPasswordTukController.changePassword);

// tuk.routes.js
router.get("/skema", jadwalController.getSkemaTuk);

router.post("/jadwal", jadwalController.createJadwal);
router.get("/jadwal", jadwalController.getAllJadwal);
router.get("/jadwal/:id", jadwalController.getJadwalById);
router.put("/jadwal/:id", jadwalController.updateJadwal);
router.delete("/jadwal/:id", jadwalController.deleteJadwal);

router.post("/jadwal/:id/asesor", jadwalAsesorController.manageAsesor); 
router.get("/jadwal/:id/asesor", jadwalAsesorController.listAsesorJadwal); 
router.delete("/jadwal/:id/asesor/:idUser/:jenisTugas", jadwalAsesorController.removeAsesor);

module.exports = router;