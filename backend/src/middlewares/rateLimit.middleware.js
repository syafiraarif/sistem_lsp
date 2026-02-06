const rateLimit = require("express-rate-limit");

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    message: "Terlalu banyak request, silakan coba lagi nanti."
  },
  standardHeaders: true,
  legacyHeaders: false
});

exports.loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5, 
  message: {
    message: "Terlalu banyak percobaan login, coba lagi 10 menit kemudian."
  },
  standardHeaders: true,
  legacyHeaders: false
});

exports.publicFormLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 10,
  message: {
    message: "Anda terlalu sering mengirim data, silakan tunggu beberapa saat."
  },
  standardHeaders: true,
  legacyHeaders: false
});
