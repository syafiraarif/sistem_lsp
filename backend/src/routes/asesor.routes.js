const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

// CONTROLLER YANG PASTI ADA
const profileController = require("../controllers/asesor/profile.controller");
const jadwalAsesorController = require("../controllers/asesor/jadwal.controller");
const pesertaJadwalController = require("../controllers/asesor/pesertaJadwal.controller");
const mkvaController = require("../controllers/asesor/mkva.controller");
const verifikasiTukController = require("../controllers/asesor/verifikasiTuk.controller");
const presensiController = require("../controllers/asesor/presensi.controller");
const frAk01Controller = require("../controllers/asesor/frAk01.controller");
const frAk02Controller = require("../controllers/asesor/frAk02.controller");
const frAk05Controller = require("../controllers/asesor/frAk05.controller");
const frAk06Controller = require("../controllers/asesor/frAk06.controller");
const frAk07Controller = require("../controllers/asesor/frAk07.controller");

// 🔐 hanya asesor
router.use(authMiddleware, roleMiddleware.asesorOnly);

/* ========================= PROFILE ========================= */
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.put(
  "/profile/upload-ttd",
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  profileController.uploadTTD
);

/* ========================= JADWAL ========================= */
router.get("/jadwal-saya", jadwalAsesorController.getJadwalSaya);
router.put("/peserta/:id/nilai", pesertaJadwalController.updateNilaiPeserta);

/* ========================= MKVA ========================= */

// daftar jadwal MKVA
router.get("/mkva/jadwal", mkvaController.getJadwalMkva);

// detail MKVA
router.get("/mkva/:id_mkva", mkvaController.getDetailMkva);

// submit MKVA
router.post("/mkva/:id_jadwal/submit", mkvaController.submitMkva);

// update MKVA
router.put("/mkva/:id_mkva/update", mkvaController.updateMkva);

// download PDF
router.get("/mkva/:id_mkva/pdf", mkvaController.downloadPdf);

router.get("/verifikasi-tuk/form", verifikasiTukController.getForm);
router.get("/verifikasi-tuk/:id_jadwal", verifikasiTukController.getDetail);
router.post("/verifikasi-tuk/:id_jadwal/submit", verifikasiTukController.submit);
router.put("/verifikasi-tuk/:id_verifikasi/update", verifikasiTukController.update);
router.get("/verifikasi-tuk/:id_verifikasi/pdf", verifikasiTukController.downloadPdf);

/* ========================= PRESENSI ========================= */

// cek apakah sudah presensi
router.get("/presensi/cek", presensiController.cekPresensi);

// detail presensi (opsional untuk UI)
router.get("/presensi/:id_jadwal", presensiController.getDetailPresensi);

// submit presensi (TTD)
router.post("/presensi", presensiController.presensiAsesor);

// list presensi (optional untuk admin / monitoring)
router.get("/presensi/list/:id_jadwal", presensiController.listPresensi);

/* ========================= FR.AK.01 ========================= */

// ambil detail FR.AK.01 (untuk load form)
router.get("/fr-ak01", frAk01Controller.getFrAk01);

// submit FR.AK.01
router.post("/fr-ak01", frAk01Controller.submitFrAk01);

// update FR.AK.01 (kalau mau edit)
router.put("/fr-ak01/:id", frAk01Controller.updateFrAk01);

// list FR.AK.01 per jadwal (optional)
router.get("/fr-ak01/list/:id_jadwal", frAk01Controller.listFrAk01);

/* ========================= FR.AK.02 ========================= */

// ambil detail FR.AK.02
router.get("/fr-ak02", frAk02Controller.getFrAk02);

// submit FR.AK.02
router.post("/fr-ak02", frAk02Controller.submitFrAk02);

// update FR.AK.02
router.put("/fr-ak02/:id", frAk02Controller.updateFrAk02);

// list FR.AK.02 per jadwal
router.get("/fr-ak02/list/:id_jadwal", frAk02Controller.listFrAk02);

router.get("/fr-ak05", frAk05Controller.getFrAk05);

router.post("/fr-ak05", frAk05Controller.submitFrAk05);

router.put("/fr-ak05/:id", frAk05Controller.updateFrAk05);

router.get("/fr-ak05/list/:id_jadwal", frAk05Controller.listFrAk05);

// 🔥 ini yg tadi salah
router.get("/fr-ak05/:id/pdf", frAk05Controller.downloadPdfFrAk05);

/* ========================= FR.AK.06 ========================= */

// ambil detail FR.AK.06
router.get("/fr-ak06", frAk06Controller.getFrAk06);

// submit FR.AK.06
router.post("/fr-ak06", frAk06Controller.submitFrAk06);

// update FR.AK.06
router.put("/fr-ak06/:id", frAk06Controller.updateFrAk06);

// list FR.AK.06 per jadwal
router.get("/fr-ak06/list/:id_jadwal", frAk06Controller.listFrAk06);

// download PDF
router.get("/fr-ak06/:id/pdf", frAk06Controller.downloadPdf);

/* ========================= FR.AK.07 ========================= */

// ambil detail FR.AK.07
router.get("/fr-ak07", frAk07Controller.getFrAk07);

// submit FR.AK.07
router.post("/fr-ak07", frAk07Controller.submitFrAk07);

// update FR.AK.07
router.put("/fr-ak07/:id", frAk07Controller.updateFrAk07);

// list FR.AK.07 per jadwal
router.get("/fr-ak07/list/:id_jadwal", frAk07Controller.listFrAk07);

// download PDF
router.get("/fr-ak07/:id/pdf", frAk07Controller.downloadPdfFrAk07);

module.exports = router;