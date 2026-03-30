const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": ["'self'", "http://localhost:5173"], 
      },
    },
  })
);

// Tambahan support payload besar (ttd base64 dll)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api", limiter);
app.use("/api", apiLimiter);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/asesi", require("./routes/asesi.routes"));
app.use("/api/asesor", require("./routes/asesor.routes"));
app.use("/api/tuk", require("./routes/tuk.routes"));
app.use("/api/public", require("./routes/public.routes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

module.exports = app;