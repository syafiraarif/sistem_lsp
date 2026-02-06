const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/asesor/profile.controller");

router.use(authMiddleware, roleMiddleware.asesorOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

module.exports = router;
