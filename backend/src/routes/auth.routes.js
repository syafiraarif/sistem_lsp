const router = require("express").Router();
const authController = require("../controllers/auth/auth.controller");
const {
  loginLimiter,
  publicFormLimiter
} = require("../middlewares/rateLimit.middleware");

router.post(
  "/login",
  loginLimiter,
  authController.login
);

router.post(
  "/forgot-access",
  publicFormLimiter,
  authController.forgotAccess
);

router.post(
  "/reset-access",
  publicFormLimiter,
  authController.resetAccess
);

router.post(
  "/logout",
  authController.logout
);

module.exports = router;