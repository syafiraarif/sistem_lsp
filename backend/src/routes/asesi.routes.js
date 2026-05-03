const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const profileController = require("../controllers/asesi/profile.controller");
const apl01Controller = require("../controllers/asesi/apl01.controller");
const apl02Controller = require("../controllers/asesi/apl02.controller");
const pembayaranController = require("../controllers/asesi/pembayaran.controller");
const bandingController = require("../controllers/asesi/banding.controller");
const pesertaJadwalController = require("../controllers/asesi/pesertaJadwal.controller");
const unitKompetensiAsesi = require("../controllers/asesi/unitKompetensi.controller");
const wilayahController = require("../controllers/public/wilayah.controller");
const lupaPasswordAsesiController = require("../controllers/asesi/lupapasswordAsesi.controller");
const presensiController = require("../controllers/asesi/presensi.controller");


// Semua route hanya bisa diakses oleh asesi
router.use(authMiddleware, roleMiddleware.asesiOnly);

/* ========================= PROFILE ========================= */
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put("/profile/upload-dokumen", uploadMiddleware, profileController.uploadDokumen);
router.put("/profile/upload-ttd", profileController.uploadTTD);
router.get("/profile/files", profileController.getFiles);
router.put("/ubah-password", lupaPasswordAsesiController.changePassword);

/* ========================= APL01 ========================= */

// ambil data form (jadwal + skema + persyaratan)
router.get("/apl01/form/:id_peserta", apl01Controller.getFormApl01);

// create / mulai APL01
router.post("/apl01/create", apl01Controller.createApl01);

// upload dokumen per persyaratan
router.post("/apl01/upload", uploadMiddleware, apl01Controller.uploadDokumenApl01);

// ambil data APL01 (detail + dokumen)
router.get("/apl01/:id_peserta", apl01Controller.getApl01);

// submit final (validasi semua wajib)
router.put("/apl01/submit/:id_apl01", apl01Controller.submitFinalApl01);

/* ========================= PEMBAYARAN ========================= */
router.post("/pembayaran/submit", pembayaranController.submitPembayaran);
router.put("/pembayaran/:id_pembayaran/upload-bukti", uploadMiddleware, pembayaranController.uploadBuktiBayar);
router.get("/pembayaran/:id_skema/detail", pembayaranController.getDetailPembayaran);
router.get("/pembayaran/:id_skema/status", pembayaranController.getStatusPembayaran);

/* ========================= APL02 ========================= */

// ambil form (unit + elemen + kuk)
router.get("/apl02/form/:id_skema", apl02Controller.getFormApl02);

// create APL02
router.post("/apl02/create", apl02Controller.createApl02);

// simpan penilaian (K / BK)
router.post("/apl02/penilaian", apl02Controller.savePenilaian);

// upload bukti per elemen
router.post("/apl02/upload", uploadMiddleware, apl02Controller.uploadBukti);

// ambil data APL02
router.get("/apl02/:id_peserta", apl02Controller.getApl02);

// hapus bukti
router.delete("/apl02/bukti/:id_bukti", apl02Controller.deleteBukti);

// submit final
router.put("/apl02/submit/:id_apl02", apl02Controller.submitApl02);

/* ========================= JADWAL ASESI ========================= */
router.get("/jadwal/tersedia", pesertaJadwalController.getJadwalTersedia);
router.get("/jadwal-saya", pesertaJadwalController.getJadwalSaya);
router.post("/jadwal/pilih", pesertaJadwalController.pilihJadwal);
router.get("/jadwal/:id/peserta", pesertaJadwalController.getPesertaJadwal);
router.get("/jadwal/:id/asesor", pesertaJadwalController.getAsesorJadwal);
router.get("/jadwal/:id", pesertaJadwalController.getDetailJadwal);

/* ========================= BANDING ========================= */
router.post("/banding", bandingController.ajukanBanding);
router.get("/banding-saya", bandingController.getBandingSaya);

/* ========================= UNIT KOMPETENSI ========================= */
router.get("/unit-kompetensi/skkni/:id_skkni", unitKompetensiAsesi.getBySkkni);
router.get("/unit-kompetensi/:id", unitKompetensiAsesi.getDetail);


/* ========================= WILAYAH ========================= */
router.get("/wilayah/provinsi", wilayahController.getProvinsi);
router.get("/wilayah/kota/:id", wilayahController.getKota);
router.get("/wilayah/kecamatan/:id", wilayahController.getKecamatan);
router.get("/wilayah/kelurahan/:id", wilayahController.getKelurahan);

/* ========================= PRESENSI ========================= */

// cek status (sudah presensi atau belum)
router.get("/presensi/status/:id_peserta", presensiController.getStatusPresensi);

// ambil detail (untuk tampilan halaman)
router.get("/presensi/detail/:id_peserta", presensiController.getDetailPresensi);

// submit presensi (upload tanda tangan)
router.post("/presensi", uploadMiddleware, presensiController.createPresensi);

/* ========================= 404 fallback ========================= */
router.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

module.exports = router;