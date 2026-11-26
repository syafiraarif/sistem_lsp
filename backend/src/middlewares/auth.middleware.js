const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  try {
    req.user = jwt.verify(token, secret);

    const user = await User.findByPk(req.user.id_user, {
      attributes: ["id_user", "status_user"]
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    if (user.status_user !== "aktif") {
      return res.status(403).json({ message: "Akun tidak aktif. Silakan hubungi Admin." });
    }

    await user.update({ last_activity_at: new Date() });

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Invalid token" });
    }

    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Gagal memvalidasi sesi" });
  }
};
