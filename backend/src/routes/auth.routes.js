const router = require("express").Router();
const authController = require("../controllers/auth/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
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
  "/heartbeat",
  authMiddleware,
  authController.heartbeat
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

module.exports = router;