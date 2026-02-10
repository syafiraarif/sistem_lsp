const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");  // Ditambahkan untuk fitur upload dokumen

const profileController = require("../controllers/asesi/profile.controller");
const pendaftaranController = require("../controllers/asesi/pendaftaran.controller");

router.use(authMiddleware, roleMiddleware.asesiOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Endpoint baru untuk upload dokumen persyaratan LSP
router.put("/profile/upload-dokumen", uploadMiddleware, profileController.uploadDokumen);

router.post("/pendaftaran", pendaftaranController.daftar);

module.exports = router;