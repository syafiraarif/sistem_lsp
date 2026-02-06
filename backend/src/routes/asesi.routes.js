const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/asesi/profile.controller");
const pendaftaranController = require("../controllers/asesi/pendaftaran.controller");

router.use(authMiddleware, roleMiddleware.asesiOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.post("/pendaftaran", pendaftaranController.daftar);

module.exports = router;
