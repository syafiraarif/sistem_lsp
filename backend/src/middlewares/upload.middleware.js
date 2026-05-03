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
STORAGE CONFIG (FIXED)
=====================================
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const field = file.fieldname;

    let folder = "uploads";

    const dokumenFields = [
      "pas_foto",
      "ktp",
      "ijazah",
      "transkrip",
      "kk",
      "surat_kerja",
    ];

    /*
    =============================
    DOKUMEN ASESI
    =============================
    */
    if (dokumenFields.includes(field)) {
      folder = path.join("uploads", "asesi", "dokumen", field);
    }

    /*
    =============================
    TANDA TANGAN (FIX MULTI ROLE)
    =============================
    */
    else if (field === "ttd") {
      if (req.user && req.user.role === "asesor") {
        folder = path.join("uploads", "asesor", "ttd"); // ✅ asesor
      } else {
        folder = path.join("uploads", "asesi", "ttd"); // ✅ asesi
      }
    }

    /*
    =============================
    APL01 DOKUMEN
    =============================
    */
    else if (field === "file_dokumen_apl01") {
      const id = req.body.id_apl01 || "umum";
      folder = path.join("uploads", "asesi", "apl01", "dokumen", `apl01_${id}`);
    }

    /*
    =============================
    APL02 BUKTI
    =============================
    */
    else if (field === "file_bukti") {
      const id = req.body.id_detail || "umum";
      folder = path.join("uploads", "asesi", "apl02", "bukti", `detail_${id}`);
    }

    /*
    =============================
    FOTO TUK
    =============================
    */
    else if (field === "foto") {
      folder = path.join("uploads", "tuk", "foto_profile");
    }

    ensureDir(folder);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const cleanName = file.originalname.replace(/\s/g, "_");

    let filename = `${timestamp}-${cleanName}`;

    /*
    =============================
    CUSTOM NAMING
    =============================
    */
    if (file.fieldname === "file_dokumen_apl01") {
      filename = `apl01_${req.body.id_apl01 || "x"}_${timestamp}${ext}`;
    }

    if (file.fieldname === "file_bukti") {
      filename = `apl02_${req.body.id_detail || "x"}_${timestamp}${ext}`;
    }

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
    fileSize: 10 * 1024 * 1024,
    files: 12,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;

    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      new Error(
        "File type not allowed. Only PDF, JPG, JPEG, PNG are permitted."
      )
    );
  },
});

/*
=====================================
FIELDS CONFIG
=====================================
*/
const uploadMiddleware = upload.fields([
  { name: "file_dokumen", maxCount: 1 },
  { name: "file_dokumen_apl01", maxCount: 1 },
  { name: "file_bukti", maxCount: 1 },
  { name: "file_pendukung", maxCount: 1 },
  { name: "dokumen_tambahan", maxCount: 10 },
  { name: "tanda_tangan", maxCount: 1 },
  { name: "bukti_bayar", maxCount: 1 },
  { name: "ttd", maxCount: 1 },
  { name: "pas_foto", maxCount: 1 },
  { name: "ktp", maxCount: 1 },
  { name: "ijazah", maxCount: 1 },
  { name: "transkrip", maxCount: 1 },
  { name: "kk", maxCount: 1 },
  { name: "surat_kerja", maxCount: 1 },
  { name: "foto_profil", maxCount: 1 },
  { name: "portofolio", maxCount: 1 },
  { name: "foto", maxCount: 1 },
]);

module.exports = uploadMiddleware;