const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/tuk/profile.controller");
const jadwalController = require("../controllers/tuk/jadwal.controller");

router.use(authMiddleware, roleMiddleware.tukOnly);

// Profile routes
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Jadwal routes (CRUD)
router.post("/jadwal", jadwalController.createJadwal);
router.get("/jadwal", jadwalController.getAllJadwal);
router.get("/jadwal/:id", jadwalController.getJadwalById);
router.put("/jadwal/:id", jadwalController.updateJadwal);
router.delete("/jadwal/:id", jadwalController.deleteJadwal);

// Asesor di jadwal routes
router.post("/jadwal/:id/asesor", jadwalController.addAsesorToJadwal); // Tambah asesor ke jadwal
router.delete("/jadwal/:id/asesor/:userId", jadwalController.removeAsesorFromJadwal); // Hapus asesor dari jadwal
router.get("/jadwal/:id/asesor", jadwalController.getAsesorInJadwal); // Get asesor di jadwal

module.exports = router;