const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/tuk/profile.controller");

router.use(authMiddleware, roleMiddleware.tukOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

module.exports = router;
