const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const profileController = require("../controllers/tuk/profile.controller");
const jadwalController = require("../controllers/tuk/jadwal.controller");
const jadwalAsesorController = require("../controllers/tuk/jadwalAsesor.controller");
const lupaPasswordTukController = require("../controllers/tuk/lupaPasswordTuk.controller");

const wilayahController = require("../controllers/public/wilayah.controller");


// ======================================
// MIDDLEWARE
// ======================================

router.use(
  authMiddleware,
  roleMiddleware.tukOnly
);


// ======================================
// PROFILE
// ======================================

router.get(
  "/profile",
  profileController.getProfile
);

router.put(
  "/profile",
  profileController.updateProfile
);

router.post(
  "/ubah-password",
  lupaPasswordTukController.changePassword
);


// ======================================
// JADWAL
// ======================================

// ✅ GET SKEMA MANDIRI
router.get(
  "/skema",
  jadwalController.getSkemaTuk
);

// ✅ CREATE JADWAL
router.post(
  "/jadwal",
  jadwalController.createJadwal
);

// ✅ LIST JADWAL
router.get(
  "/jadwal",
  jadwalController.getAllJadwal
);

// ✅ DETAIL JADWAL
router.get(
  "/jadwal/:id",
  jadwalController.getJadwalById
);

// ✅ DETAIL LENGKAP JADWAL + ASESOR
router.get(
  "/jadwal/:id/detail",
  jadwalController.getDetailJadwalLengkap
);

// ✅ UPDATE JADWAL
router.put(
  "/jadwal/:id",
  jadwalController.updateJadwal
);

// ✅ DELETE JADWAL
router.delete(
  "/jadwal/:id",
  jadwalController.deleteJadwal
);


// ======================================
// ASESOR JADWAL
// ======================================

// ✅ LIST JENIS TUGAS
router.get(
  "/jenis-tugas",
  jadwalAsesorController.getJenisTugasAvailable
);

// ✅ GET SEMUA ASESOR AKTIF
router.get(
  "/asesor",
  jadwalAsesorController.getAsesorTuk
);

// ✅ LIST ASESOR PADA JADWAL
router.get(
  "/jadwal/:id/asesor/:jenisTugas",
  jadwalAsesorController.listAsesorJadwal
);

// ✅ ASSIGN / REPLACE ASESOR
router.post(
  "/jadwal/:id/asesor/:jenisTugas",
  jadwalAsesorController.manageAsesor
);

// ✅ HAPUS ASESOR DARI JADWAL
router.delete(
  "/jadwal/:id/asesor/:jenisTugas/:idUser",
  jadwalAsesorController.removeAsesor
);


// ======================================
// WILAYAH
// ======================================

router.get(
  "/wilayah/provinsi",
  wilayahController.getProvinsi
);

router.get(
  "/wilayah/kota/:id",
  wilayahController.getKota
);

router.get(
  "/wilayah/kecamatan/:id",
  wilayahController.getKecamatan
);

router.get(
  "/wilayah/kelurahan/:id",
  wilayahController.getKelurahan
);


// ======================================
// EXPORT
// ======================================

module.exports = router;