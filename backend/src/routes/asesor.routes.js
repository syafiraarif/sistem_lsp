const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");
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
const frMapa01Controller = require("../controllers/asesor/frMapa01.controller");
const frMapa02Controller = require("../controllers/asesor/frMapa02.controller");
const frIa02Controller = require("../controllers/komite/frIa02.controller");
const frIa03KomiteController = require("../controllers/komite/frIa03.controller");
const frIa03AsesorController = require("../controllers/asesor/frIa03.controller");
const frIa01Controller = require("../controllers/asesor/frIa01.controller");
const frIa05KomiteController = require("../controllers/komite/frIa05Komite.controller");
const frIa05PengujiController =
require("../controllers/asesor/frIa05Penguji.controller");

const frIa05AsesiController =
require("../controllers/asesi/frIa05Asesi.controller");
const lupaPasswordAsesorController = require("../controllers/asesor/lupapasswordAsesor.controller");
const hasilKeputusanController =
require("../controllers/asesor/hasilKeputusanAsesmen.controller");

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

// ✅ TAMBAHAN BARU
router.put(
  "/profile/upload-foto",
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  profileController.uploadFotoProfil
);

/* ========================= JADWAL ========================= */
/* ========================= JADWAL ========================= */
router.get("/jadwal-saya", jadwalAsesorController.getJadwalSaya);

router.get(
  "/jadwal-uji-kompetensi",
  jadwalAsesorController.getJadwalUjiKompetensi
);

router.get(
  "/jadwal-verifikasi-tuk",
  jadwalAsesorController.getJadwalVerifikasiTuk
);

router.get(
  "/jadwal-komite-teknis",
  jadwalAsesorController.getJadwalKomiteTeknis
);

router.get(
  "/jadwal/:id_jadwal/peserta",
  pesertaJadwalController.getPesertaByJadwal
);

router.put(
  "/peserta/:id/nilai",
  pesertaJadwalController.updateNilaiPeserta
);

/* ===================================================
======================= MKVA ==========================
=================================================== */


/* jadwal mkva */

router.get(
"/mkva/jadwal",
mkvaController.getJadwalMkva
);


/* cek mkva by jadwal */

router.get(
"/mkva/jadwal/:id_jadwal",
mkvaController.getMkvaByJadwal
);


/* submit */

router.post(
"/mkva/:id_jadwal/submit",
mkvaController.submitMkva
);


/* update */

router.put(
"/mkva/:id_mkva/update",
mkvaController.updateMkva
);


/* pdf */

router.get(
"/mkva/:id_mkva/pdf",
mkvaController.downloadPdf
);


/* detail mkva */

router.get(
"/mkva/:id_mkva",
mkvaController.getDetailMkva
);



/* ===================================================
=================== VERIFIKASI TUK ===================
=================================================== */


/* jadwal verifikasi */

router.get(

"/verifikasi-tuk/jadwal",

verifikasiTukController
.getJadwalVerifikasi

);


/* master form */

router.get(

"/verifikasi-tuk/form",

verifikasiTukController
.getForm

);


/* submit */

router.post(

"/verifikasi-tuk/:id_jadwal/submit",

verifikasiTukController
.submit

);


/* update */

router.put(

"/verifikasi-tuk/:id_verifikasi/update",

verifikasiTukController
.update

);


/* pdf */

router.get(

"/verifikasi-tuk/:id_verifikasi/pdf",

verifikasiTukController
.downloadPdf

);


/* detail terakhir */

router.get(

"/verifikasi-tuk/:id_jadwal",

verifikasiTukController
.getDetail

);

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


/* ========================= FR.MAPA.01 ========================= */

// ambil detail FR.MAPA.01 (untuk load form / edit)
router.get("/fr-mapa01", frMapa01Controller.getFrMapa01);
// submit FR.MAPA.01
router.post("/fr-mapa01", frMapa01Controller.submitFrMapa01);
// update FR.MAPA.01
router.put("/fr-mapa01/:id", frMapa01Controller.updateFrMapa01);
// list FR.MAPA.01 per jadwal
router.get("/fr-mapa01/list/:id_jadwal", frMapa01Controller.listFrMapa01);
// download PDF
router.get("/fr-mapa01/:id/pdf", frMapa01Controller.downloadPdfFrMapa01);


/* ========================= FR.MAPA.02 ========================= */

// generate otomatis dari MAPA01
router.post("/fr-mapa02/generate", frMapa02Controller.generateMapa02);
// ambil detail MAPA02
router.get("/fr-mapa02", frMapa02Controller.getMapa02);
// update pilihan (checkbox MUK)
router.put("/fr-mapa02/:id", frMapa02Controller.updateMapa02);
// download PDF
router.get("/fr-mapa02/:id/pdf", frMapa02Controller.downloadPdfMapa02);

/* ========================= FR.IA.02 (KOMITE TEKNIS) ========================= */

/* FR.IA.02 */

router.get(
"/fr-ia02/tugas",
frIa02Controller.getTugasKomite
);

router.get(
"/fr-ia02",
frIa02Controller.getDetail
);

router.post(
"/fr-ia02",
frIa02Controller.createFrIa02
);

router.put(
"/fr-ia02/:id",
frIa02Controller.updateFrIa02
);

router.get(
"/fr-ia02/list/:id_jadwal",
frIa02Controller.getByJadwal
);

router.get(
"/fr-ia02/:id/pdf",
frIa02Controller.downloadPdf
);

router.delete(
"/fr-ia02/:id",
frIa02Controller.deleteFrIa02
);

/* ========================= FR.IA.03 ========================= */

/* ==================== KOMITE TEKNIS ==================== */

// create pertanyaan
router.post("/fr-ia03/komite/pertanyaan", frIa03KomiteController.createPertanyaan);

// update pertanyaan
router.put("/fr-ia03/komite/pertanyaan/:id", frIa03KomiteController.updatePertanyaan);

// delete pertanyaan
router.delete("/fr-ia03/komite/pertanyaan/:id", frIa03KomiteController.deletePertanyaan);

// get soal (khusus komite)
router.get("/fr-ia03/komite/:id", frIa03KomiteController.getByFr);

// download PDF soal
router.get("/fr-ia03/komite/:id/pdf", frIa03KomiteController.downloadPdf);


////////////////////////////////////////////////////////////

/* ==================== ASESOR PENGUJI ==================== */

// ambil form (soal + jawaban)
router.get("/fr-ia03/asesor/:id", frIa03AsesorController.getForm);

// simpan / update jawaban
router.post("/fr-ia03/asesor/jawaban", frIa03AsesorController.saveJawaban);

// download PDF hasil
router.get("/fr-ia03/asesor/:id/pdf", frIa03AsesorController.downloadPdf);



/* ========================= FR.IA.01 (ASESOR PENGUJI) ========================= */

// list tugas assessor
router.get(
"/fr-ia01/tugas",
frIa01Controller.getTugasAsesor
);

// create / simpan
router.post("/fr-ia01", frIa01Controller.create);

// ambil data by id
router.get("/fr-ia01/:id", frIa01Controller.getById);

// update
router.put("/fr-ia01/:id", frIa01Controller.update);

// load berdasarkan peserta+jadwal
router.get("/fr-ia01", frIa01Controller.getByPeserta);

// download pdf
router.get("/fr-ia01/:id/pdf", frIa01Controller.downloadPdf);


/* ========================= FR.IA.05 ========================= */


/* ===========================================
================ KOMITE TEKNIS ===============
=========================================== */

router.post(
"/fr-ia05/komite",
frIa05KomiteController.createPaket
);

router.get(
"/fr-ia05/komite/jadwal/:id_jadwal",
frIa05KomiteController.getByJadwal
);

router.post(
"/fr-ia05/komite/soal",
frIa05KomiteController.createSoal
);

router.put(
"/fr-ia05/komite/soal/:id",
frIa05KomiteController.updateSoal
);

router.delete(
"/fr-ia05/komite/soal/:id",
frIa05KomiteController.deleteSoal
);

router.post(
"/fr-ia05/komite/opsi",
frIa05KomiteController.createOpsi
);

router.get(
"/fr-ia05/komite/:id",
frIa05KomiteController.getDetail
);

router.get(
"/fr-ia05/komite/:id/pdf",
frIa05KomiteController.downloadPdf
);



/* ===========================================
===================== ASESI ==================
=========================================== */

router.get(

"/fr-ia05/asesi/:id_fr_ia_05/:id_peserta",

frIa05AsesiController.getSoal

);


router.post(

"/fr-ia05/asesi/submit",

frIa05AsesiController.submit

);


router.get(

"/fr-ia05/asesi/hasil/:id_fr_ia_05/:id_peserta",

frIa05AsesiController.getHasil

);



/* ===========================================
============== ASESOR PENGUJI ===============
=========================================== */

router.get(

"/fr-ia05/asesor/hasil/:id_peserta",

frIa05PengujiController.getHasilAsesi

);


router.get(

"/fr-ia05/asesor/nilai/:id_peserta",

frIa05PengujiController.hitungNilai

);


router.post(

"/fr-ia05/asesor/penilaian",

frIa05PengujiController.simpanPenilaian

);


router.get(

"/fr-ia05/asesor/penilaian/:id_peserta",

frIa05PengujiController.getPenilaian

);


router.get(

"/fr-ia05/asesor/:id_peserta/pdf",

frIa05PengujiController.downloadPdf

);

/* ========================= HASIL KEPUTUSAN ASESMEN ========================= */


/*
=====================================
ASESOR MENENTUKAN HASIL AKHIR
=====================================

kompeten
atau

belum kompeten
*/

router.post(

"/hasil-keputusan",

hasilKeputusanController.submitKeputusan

);



/*
=====================================
DETAIL HASIL KEPUTUSAN
=====================================
*/

router.get(

"/hasil-keputusan/:id_peserta",

hasilKeputusanController.getKeputusan

);



/*
=====================================
LIHAT HASIL AKHIR ASESI
=====================================
*/

router.get(

"/hasil-akhir/:id_peserta",

hasilKeputusanController.getHasilAkhir

);

router.put(
  "/change-password",
  lupaPasswordAsesorController.changePassword
);

module.exports = router;