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
const frIa04aController = require("../controllers/komite/frIa04a.controller");
const frIa04bKomiteController = require("../controllers/komite/frIa04b.controller");
const frIa04bAsesorController = require("../controllers/asesor/frIa04b.controller");
const frIa01Controller = require("../controllers/asesor/frIa01.controller");
const frIa05KomiteController = require("../controllers/komite/frIa05Komite.controller");
const frIa05AsesorController = require("../controllers/asesor/frIa05Penguji.controller");
const frIa06KomiteController = require("../controllers/komite/frIa06Komite.controller");
const frIa06AsesorController = require("../controllers/asesor/frIa06Penguji.controller");
const frIa07KomiteController = require("../controllers/komite/frIa07Komite.controller");
const frIa07AsesorController = require("../controllers/asesor/frIa07Penguji.controller");
const frIa08KomiteController = require("../controllers/komite/frIa08Komite.controller");
const frIa08Controller = require("../controllers/asesor/frIa08.controller");
const frIa09Controller = require("../controllers/asesor/frIa09Penguji.controller");
const frIa10Controller = require("../controllers/asesor/frIa10.controller");
const lupaPasswordAsesorController = require("../controllers/asesor/lupapasswordAsesor.controller");

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

// ambil detail FR.IA.02 (untuk load form / edit)
router.get("/fr-ia02", frIa02Controller.getDetail);
// submit FR.IA.02
router.post("/fr-ia02", frIa02Controller.createFrIa02);
// update FR.IA.02
router.put("/fr-ia02/:id", frIa02Controller.updateFrIa02);
// list FR.IA.02 per jadwal
router.get("/fr-ia02/list/:id_jadwal", frIa02Controller.getByJadwal);
// delete (optional tapi bagus buat testing)
router.delete("/fr-ia02/:id", frIa02Controller.deleteFrIa02);

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


/* ========================= FR.IA.04A ========================= */

// create / get header
router.post("/fr-ia04a", frIa04aController.createOrGet);

// ambil full data
router.get("/fr-ia04a/:id", frIa04aController.getForm);

// simpan detail
router.post("/fr-ia04a/detail", frIa04aController.saveDetail);

// download PDF
router.get("/fr-ia04a/:id/pdf", frIa04aController.downloadPdf);

/* ========================= FR.IA.04B ========================= */

/* ==================== KOMITE TEKNIS ==================== */

// create / get header + auto generate detail
router.post("/fr-ia04b", frIa04bKomiteController.createOrGet);

// ambil form (komite)
router.get("/fr-ia04b/komite/:id", frIa04bKomiteController.getForm);

// simpan lingkup, pertanyaan, kesesuaian
router.post("/fr-ia04b/komite", frIa04bKomiteController.saveKomite);


////////////////////////////////////////////////////////////

/* ==================== ASESOR PENGUJI ==================== */

// ambil form
router.get("/fr-ia04b/asesor/:id", frIa04bAsesorController.getForm);

// simpan tanggapan + pencapaian
router.post("/fr-ia04b/asesor", frIa04bAsesorController.saveAsesor);

// submit rekomendasi + ttd
router.post("/fr-ia04b/submit", frIa04bAsesorController.submit);

// download PDF
router.get("/fr-ia04b/:id/pdf", frIa04bAsesorController.downloadPdf);

/* ========================= FR.IA.01 (ASESOR PENGUJI) ========================= */

// create / simpan
router.post("/fr-ia01", frIa01Controller.create);
// ambil data by id (full + detail)
router.get("/fr-ia01/:id", frIa01Controller.getById);
// update data
router.put("/fr-ia01/:id", frIa01Controller.update);
// ambil berdasarkan peserta + jadwal (buat frontend load)
router.get("/fr-ia01", frIa01Controller.getByPeserta);
// download PDF
router.get("/fr-ia01/:id/pdf", frIa01Controller.downloadPdf);


/* ========================= FR.IA.05 ========================= */

/* ==================== KOMITE TEKNIS ==================== */

// create paket soal
router.post("/fr-ia05/komite", frIa05KomiteController.createPaket);
// get paket by jadwal
router.get("/fr-ia05/komite/jadwal/:id_jadwal", frIa05KomiteController.getByJadwal);
// tambah soal
router.post("/fr-ia05/komite/soal", frIa05KomiteController.createSoal);
// update soal
router.put("/fr-ia05/komite/soal/:id", frIa05KomiteController.updateSoal);
// delete soal
router.delete("/fr-ia05/komite/soal/:id", frIa05KomiteController.deleteSoal);
// tambah opsi jawaban
router.post("/fr-ia05/komite/opsi", frIa05KomiteController.createOpsi);
// get detail (soal + opsi)
router.get("/fr-ia05/komite/:id", frIa05KomiteController.getDetail);


/* ==================== ASESOR PENGUJI ==================== */

// lihat hasil jawaban asesi
router.get("/fr-ia05/asesor/hasil/:id_peserta", frIa05AsesorController.getHasilAsesi);
// hitung nilai otomatis
router.get("/fr-ia05/asesor/nilai/:id_peserta", frIa05AsesorController.hitungNilai);
// simpan penilaian + feedback + ttd
router.post("/fr-ia05/asesor/penilaian", frIa05AsesorController.simpanPenilaian);
// ambil penilaian
router.get("/fr-ia05/asesor/penilaian/:id_peserta", frIa05AsesorController.getPenilaian);

/* ========================= FR.IA.06 ========================= */

/* ==================== KOMITE TEKNIS ==================== */

// create paket essay
router.post("/fr-ia06/komite", frIa06KomiteController.createPaket);
// tambah soal essay + jawaban referensi
router.post("/fr-ia06/komite/soal", frIa06KomiteController.createSoal);
// update soal
router.put("/fr-ia06/komite/soal/:id", frIa06KomiteController.updateSoal);
// delete soal
router.delete("/fr-ia06/komite/soal/:id", frIa06KomiteController.deleteSoal);
// get detail (soal + jawaban referensi)
router.get("/fr-ia06/komite/:id", frIa06KomiteController.getDetail);

/* ==================== ASESOR PENGUJI ==================== */

// lihat jawaban asesi + soal + kunci
router.get("/fr-ia06/asesor/hasil/:id_peserta", frIa06AsesorController.getJawabanAsesi);
// nilai per soal (ya / tidak)
router.put("/fr-ia06/asesor/nilai/:id", frIa06AsesorController.nilaiJawaban);
// hitung hasil (optional)
router.get("/fr-ia06/asesor/hasil-nilai/:id_peserta", frIa06AsesorController.hitungHasil);
// simpan penilaian akhir + umpan balik + ttd
router.post("/fr-ia06/asesor/penilaian", frIa06AsesorController.simpanPenilaian);
// ambil penilaian
router.get("/fr-ia06/asesor/penilaian/:id_peserta", frIa06AsesorController.getPenilaian);

/* ========================= FR.IA.07 ========================= */

/* ==================== KOMITE TEKNIS ==================== */

// create paket
router.post("/fr-ia07/komite", frIa07KomiteController.createPaket);
// tambah soal lisan + kunci jawaban
router.post("/fr-ia07/komite/soal", frIa07KomiteController.createSoal);
// update soal
router.put("/fr-ia07/komite/soal/:id", frIa07KomiteController.updateSoal);
// delete soal
router.delete("/fr-ia07/komite/soal/:id", frIa07KomiteController.deleteSoal);
// get detail (soal + kunci)
router.get("/fr-ia07/komite/:id", frIa07KomiteController.getDetail);

/* ==================== ASESOR PENGUJI ==================== */

// ambil form (soal + jawaban asesi)
router.get("/fr-ia07/asesor/:id_peserta", frIa07AsesorController.getForm);
// simpan jawaban asesi + pencapaian
router.post("/fr-ia07/asesor/jawaban", frIa07AsesorController.saveJawaban);
// simpan penilaian akhir + umpan balik + ttd
router.post("/fr-ia07/asesor/penilaian", frIa07AsesorController.savePenilaian);
// ambil penilaian
router.get("/fr-ia07/asesor/penilaian/:id_peserta", frIa07AsesorController.getPenilaian);

/* ========================= FR.IA.08 ========================= */
// ==================== KOMITE TEKNIS ====================

// create soal wawancara
router.post("/fr-ia08/komite/soal", frIa08KomiteController.createSoal);
// update soal
router.put("/fr-ia08/komite/soal/:id", frIa08KomiteController.updateSoal);
// delete soal
router.delete("/fr-ia08/komite/soal/:id", frIa08KomiteController.deleteSoal); 
// get soal berdasarkan skema
router.get("/fr-ia08/komite/skema/:id_skema", frIa08KomiteController.getSoalBySkema);

// ==================== ASESOR PENGUJI ====================

// ambil data APL01 + APL02 (untuk ditampilkan di UI)
router.get("/fr-ia08/asesor/data/:id_peserta", frIa08Controller.getData);
// create header FR.IA.08
router.post("/fr-ia08", frIa08Controller.create);
// simpan penilaian dokumen
router.post("/fr-ia08/penilaian", frIa08Controller.savePenilaian);
// ambil penilaian (reload form)
router.get("/fr-ia08/penilaian/:id", frIa08Controller.getPenilaian);

/* ========================= FR.IA.09 ========================= */
// ==================== ASESOR PENGUJI ====================

// ambil data (soal + jawaban jika ada)
router.get("/fr-ia09", frIa09Controller.getData);
// create header FR.IA.09
router.post("/fr-ia09", frIa09Controller.create);
// simpan jawaban per soal (kesimpulan + K/BK)
router.post("/fr-ia09/detail", frIa09Controller.saveDetail);
// hapus detail (optional)
router.delete("/fr-ia09/detail/:id", frIa09Controller.deleteDetail);
// submit akhir (rekomendasi + ttd)
router.post("/fr-ia09/submit", frIa09Controller.submit);

/* ========================= FR.IA.10 ========================= */
// ==================== ASESOR PENGUJI ====================

// ambil data FR.IA.10 (by peserta + jadwal)
router.get("/fr-ia10", frIa10Controller.getByPeserta);
// create / update FR.IA.10
router.post("/fr-ia10", frIa10Controller.save);
// (optional admin / debug)
router.get("/fr-ia10/list", frIa10Controller.getAll);


router.put(
  "/change-password",
  lupaPasswordAsesorController.changePassword
);

module.exports = router;