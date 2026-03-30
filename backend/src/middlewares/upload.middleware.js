const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
=====================================
CREATE FOLDER IF NOT EXISTS
=====================================
*/
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/*
=====================================
STORAGE CONFIG
=====================================
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const field = file.fieldname;

    let folder = "uploads";

    /*
    =====================================
    ROUTE KHUSUS DOKUMEN ASESI
    =====================================
    */
    const dokumenFields = [
      "pas_foto",
      "ktp",
      "ijazah",
      "transkrip",
      "kk",
      "surat_kerja",
    ];

    if (dokumenFields.includes(field)) {
      folder = path.join("uploads", "asesi", "dokumen", field);
    }

    /*
    =====================================
    ROUTE KHUSUS TTD
    =====================================
    */
    if (field === "ttd") {
      folder = path.join("uploads", "asesi", "ttd");
    }

    ensureDir(folder);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s/g, "_");
    const filename = `${timestamp}-${cleanName}`;
    cb(null, filename);
  },
});

/*
=====================================
UPLOAD CONFIG
=====================================
*/
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 12,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error("File type not allowed. Only PDF, JPG, JPEG, PNG are permitted."));
  },
});

/*
=====================================
FIELDS CONFIG
=====================================
*/
const uploadMiddleware = upload.fields([
  { name: "file_dokumen", maxCount: 1 },
  { name: "file_pendukung", maxCount: 1 },
  { name: "dokumen_tambahan", maxCount: 10 },
  { name: "tanda_tangan", maxCount: 1 },
  { name: "file_bukti", maxCount: 1 },
  { name: "bukti_bayar", maxCount: 1 },
  { name: "ttd", maxCount: 1 },
  { name: "pas_foto", maxCount: 1 },
  { name: "ktp", maxCount: 1 },
  { name: "ijazah", maxCount: 1 },
  { name: "transkrip", maxCount: 1 },
  { name: "kk", maxCount: 1 },
  { name: "surat_kerja", maxCount: 1 },
  { name: "foto_profil", maxCount: 1 },   // ✅
  { name: "portofolio", maxCount: 1 },    // ✅
]);

module.exports = uploadMiddleware;