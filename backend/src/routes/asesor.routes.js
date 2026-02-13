const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const profileController = require("../controllers/asesor/profile.controller");
const jadwalAsesorController = require("../controllers/asesor/jadwal.controller");
const pesertaJadwalController = require("../controllers/asesor/pesertaJadwal.controller");

router.use(authMiddleware, roleMiddleware.asesorOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.get("/jadwal-saya", jadwalAsesorController.getJadwalSaya);

router.put("/peserta/:id/nilai", pesertaJadwalController.updateNilaiPeserta);

module.exports = router;
