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

const frIa01Controller = require("../controllers/asesor/frIa01.controller");
const frIa02Controller = require("../controllers/komite/frIa02.controller");
const frIa03KomiteController = require("../controllers/komite/frIa03.controller");
const frIa03AsesorController = require("../controllers/asesor/frIa03.controller");

const frIa05KomiteController = require("../controllers/komite/frIa05Komite.controller");
const frIa05PengujiController = require("../controllers/asesor/frIa05Penguji.controller");
const frIa05AsesiController = require("../controllers/asesi/frIa05Asesi.controller");

const lupaPasswordAsesorController = require("../controllers/asesor/lupapasswordAsesor.controller");
const hasilKeputusanController = require("../controllers/asesor/hasilKeputusanAsesmen.controller");

/* ===================================================
   AUTH ASESOR
=================================================== */

router.use(authMiddleware, roleMiddleware.asesorOnly);

/* ===================================================
   PROFILE
=================================================== */

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.put(
  "/profile/upload-ttd",
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  },
  profileController.uploadTTD
);

router.put(
  "/profile/upload-foto",
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  },
  profileController.uploadFotoProfil
);

/* ===================================================
   JADWAL
=================================================== */

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

router.get(
  "/list-asesor",
  jadwalAsesorController.getListAsesor
);

/* ===================================================
   MKVA
=================================================== */

router.get("/mkva/jadwal", mkvaController.getJadwalMkva);

router.get("/mkva/jadwal/:id_jadwal", mkvaController.getMkvaByJadwal);

router.post("/mkva/:id_jadwal/submit", mkvaController.submitMkva);

router.put("/mkva/:id_mkva/update", mkvaController.updateMkva);

router.get("/mkva/:id_mkva/pdf", mkvaController.downloadPdf);

router.get("/mkva/:id_mkva", mkvaController.getDetailMkva);

/* ===================================================
   VERIFIKASI TUK
=================================================== */

router.get(
  "/verifikasi-tuk/jadwal",
  verifikasiTukController.getJadwalVerifikasi
);

router.get("/verifikasi-tuk/form", verifikasiTukController.getForm);

router.post("/verifikasi-tuk/:id_jadwal/submit", verifikasiTukController.submit);

router.put(
  "/verifikasi-tuk/:id_verifikasi/update",
  verifikasiTukController.update
);

router.get(
  "/verifikasi-tuk/:id_verifikasi/pdf",
  verifikasiTukController.downloadPdf
);

router.get("/verifikasi-tuk/:id_jadwal", verifikasiTukController.getDetail);

/* ===================================================
   PRESENSI
=================================================== */

router.get("/presensi/cek", presensiController.cekPresensi);

router.post("/presensi", presensiController.presensiAsesor);

router.get("/presensi/:id_jadwal", presensiController.getDetailPresensi);

router.get("/presensi/list/:id_jadwal", presensiController.listPresensi);

router.get("/presensi/pdf/:id_jadwal", presensiController.downloadPdf);

/* ===================================================
   FR.AK.01
=================================================== */

router.get("/fr-ak01", frAk01Controller.getFrAk01);

router.post("/fr-ak01", frAk01Controller.submitFrAk01);

router.put("/fr-ak01/:id", frAk01Controller.updateFrAk01);

router.get("/fr-ak01/list/:id_jadwal", frAk01Controller.listFrAk01);

router.get(
  "/fr-ak01/:id/pdf",
  frAk01Controller.downloadPdfFrAk01
);

/* ========================= FR.AK.02 ========================= */

router.get("/fr-ak02", frAk02Controller.getFrAk02);

router.post("/fr-ak02", frAk02Controller.submitFrAk02);

router.put("/fr-ak02/:id", frAk02Controller.updateFrAk02);

router.get("/fr-ak02/list/:id_jadwal", frAk02Controller.listFrAk02);

router.get(
  "/fr-ak02/pdf/:id_jadwal/:id_peserta",
  frAk02Controller.generatePdfFrAk02
);


/* ========================= FR.AK.05 ========================= */
router.get("/fr-ak05", frAk05Controller.getFrAk05);

router.post("/fr-ak05", frAk05Controller.submitFrAk05);

router.put("/fr-ak05/:id", frAk05Controller.updateFrAk05);

router.get("/fr-ak05/list/:id_jadwal", frAk05Controller.listFrAk05);

router.get("/fr-ak05/:id/pdf", frAk05Controller.downloadPdfFrAk05);

/* ===================================================
   FR.AK.06
=================================================== */

router.get("/fr-ak06", frAk06Controller.getFrAk06);

router.post("/fr-ak06", frAk06Controller.submitFrAk06);

router.put("/fr-ak06/:id", frAk06Controller.updateFrAk06);

router.get("/fr-ak06/list/:id_jadwal", frAk06Controller.listFrAk06);

router.get("/fr-ak06/:id/pdf", frAk06Controller.downloadPdf);

/* ===================================================
   FR.AK.07
=================================================== */

router.get("/fr-ak07", frAk07Controller.getFrAk07);

router.post("/fr-ak07", frAk07Controller.submitFrAk07);

router.put("/fr-ak07/:id", frAk07Controller.updateFrAk07);

router.get("/fr-ak07/list/:id_jadwal", frAk07Controller.listFrAk07);

router.get("/fr-ak07/:id/pdf", frAk07Controller.downloadPdfFrAk07);

/* ===================================================
   FR.MAPA.01
=================================================== */

router.get("/fr-mapa01", frMapa01Controller.getFrMapa01);

router.post("/fr-mapa01", frMapa01Controller.submitFrMapa01);

router.put("/fr-mapa01/:id", frMapa01Controller.updateFrMapa01);

router.get("/fr-mapa01/list/:id_jadwal", frMapa01Controller.listFrMapa01);

router.get("/fr-mapa01/:id/pdf", frMapa01Controller.downloadPdfFrMapa01);

/* ===================================================
   FR.MAPA.02
=================================================== */

router.post("/fr-mapa02/generate", frMapa02Controller.generateMapa02);

router.get("/fr-mapa02", frMapa02Controller.getMapa02);

router.put("/fr-mapa02/:id", frMapa02Controller.updateMapa02);

router.get("/fr-mapa02/:id/pdf", frMapa02Controller.downloadPdfMapa02);

/* ===================================================
   FR.IA.02 - KOMITE TEKNIS
=================================================== */

router.get("/fr-ia02/tugas", frIa02Controller.getTugasKomite);

router.get("/fr-ia02", frIa02Controller.getDetail);

router.post("/fr-ia02", frIa02Controller.createFrIa02);

router.put("/fr-ia02/:id", frIa02Controller.updateFrIa02);

router.get("/fr-ia02/list/:id_jadwal", frIa02Controller.getByJadwal);

router.get("/fr-ia02/:id/pdf", frIa02Controller.downloadPdf);

router.delete("/fr-ia02/:id", frIa02Controller.deleteFrIa02);

router.get(
  "/fr-ia02/unit/:id_jadwal",
  frIa02Controller.getUnitBySkema
);

/* ===================================================
   FR.IA.03 - KOMITE TEKNIS
=================================================== */

router.post(
  "/fr-ia03/komite/pertanyaan",
  frIa03KomiteController.createPertanyaan
);

router.put(
  "/fr-ia03/komite/pertanyaan/:id",
  frIa03KomiteController.updatePertanyaan
);

router.delete(
  "/fr-ia03/komite/pertanyaan/:id",
  frIa03KomiteController.deletePertanyaan
);

router.get(
  "/fr-ia03/komite/:id_jadwal",
  frIa03KomiteController.getByFr
);

router.get(
  "/fr-ia03/komite/:id_jadwal/pdf",
  frIa03KomiteController.downloadPdf
);

/* ===================================================
   FR.IA.03 - ASESOR PENGUJI
=================================================== */

router.get("/fr-ia03/asesor/:id", frIa03AsesorController.getForm);

router.post("/fr-ia03/asesor/jawaban", frIa03AsesorController.saveJawaban);

router.get("/fr-ia03/asesor/:id/pdf", frIa03AsesorController.downloadPdf);

/* ===================================================
   FR.IA.01 - ASESOR PENGUJI
=================================================== */

router.get("/fr-ia01/tugas", frIa01Controller.getTugasAsesor);

router.post("/fr-ia01", frIa01Controller.create);

router.get("/fr-ia01/:id", frIa01Controller.getById);

router.put("/fr-ia01/:id", frIa01Controller.update);

router.get("/fr-ia01", frIa01Controller.getByPeserta);

router.get("/fr-ia01/:id/pdf", frIa01Controller.downloadPdf);

/* ===================================================
   FR.IA.05 - KOMITE TEKNIS
=================================================== */

router.get(
  "/fr-ia05/komite/jadwal/:id_jadwal",
  frIa05KomiteController.getByJadwal
);

router.get(
  "/fr-ia05/komite/asesor",
  frIa05KomiteController.getAsesor
);

router.post(
  "/fr-ia05/komite",
  frIa05KomiteController.createPaket
);

router.get(
  "/fr-ia05/komite/:id",
  frIa05KomiteController.getDetail
);

router.post(
  "/fr-ia05/komite/soal",
  frIa05KomiteController.uploadGambar,
  frIa05KomiteController.createSoal
);

router.put(
  "/fr-ia05/komite/soal/:id",
  frIa05KomiteController.uploadGambar,
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
  "/fr-ia05/komite/:id/pdf",
  frIa05KomiteController.downloadPdf
);

/* ===================================================
   FR.IA.05 - ASESI
=================================================== */

router.get(
  "/fr-ia05/asesi/:id_fr_ia_05/:id_peserta",
  frIa05AsesiController.getSoal
);

router.post("/fr-ia05/asesi/submit", frIa05AsesiController.submit);

router.get(
  "/fr-ia05/asesi/hasil/:id_fr_ia_05/:id_peserta",
  frIa05AsesiController.getHasil
);

/* ===================================================
   FR.IA.05 - ASESOR PENGUJI
=================================================== */

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

/* ===================================================
   HASIL KEPUTUSAN ASESMEN
=================================================== */

router.post("/hasil-keputusan", hasilKeputusanController.submitKeputusan);

router.get("/hasil-keputusan/:id_peserta", hasilKeputusanController.getKeputusan);

router.get("/hasil-akhir/:id_peserta", hasilKeputusanController.getHasilAkhir);

/* ===================================================
   PASSWORD
=================================================== */

router.put("/change-password", lupaPasswordAsesorController.changePassword);

module.exports = router;