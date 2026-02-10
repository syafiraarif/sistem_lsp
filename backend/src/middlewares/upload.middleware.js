const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder tujuan upload (pastikan folder 'uploads/' ada di root project dan writable)
  },
  filename: (req, file, cb) => {
    // Nama file unik: timestamp + nama asli file
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Konfigurasi multer dengan validasi
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10MB per file
    files: 12 // Maksimal 12 file (10 dokumen tambahan + 1 tanda tangan + 1 file bukti APL02 + 1 bukti bayar)
  },
  fileFilter: (req, file, cb) => {
    // Izinkan hanya PDF, JPG, JPEG, PNG untuk dokumen dan tanda tangan
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not allowed. Only PDF, JPG, JPEG, PNG are permitted."));
    }
  }
});

// Ekspor sebagai fields untuk mendukung multiple input file
// - dokumen_tambahan: maksimal 10 file (untuk dokumen PDF, nomor SK, tanggal SK)
// - tanda_tangan: maksimal 1 file (untuk tanda tangan asesi)
// - file_bukti: maksimal 1 file (untuk bukti APL02)
// - bukti_bayar: maksimal 1 file (untuk bukti pembayaran)
module.exports = upload.fields([
  { name: "dokumen_tambahan", maxCount: 10 },
  { name: "tanda_tangan", maxCount: 1 },
  { name: "file_bukti", maxCount: 1 },  // Untuk APL02
  { name: "bukti_bayar", maxCount: 1 }  // Tambahkan untuk upload bukti bayar
]);