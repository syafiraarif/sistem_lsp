// backend/src/routes/admin.routes.js
const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadExcel = require("../middlewares/uploadExcel.middleware");
const adminController = require("../controllers/admin/admin.controller");
const pendaftaranController = require("../controllers/admin/pendaftaran.controller");
const asesiAdmin = require("../controllers/admin/asesi.controller");
const pengaduanController = require("../controllers/admin/pengaduan.controller");
const notifikasiController = require("../controllers/admin/notifikasi.controller");
const asesorAdmin = require("../controllers/admin/asesor.controller");
const tukAdmin = require("../controllers/admin/tuk.controller");
const skkniController = require("../controllers/admin/skkni.controller");
const skemaController = require("../controllers/admin/skema.controller");
const biayaUjiController = require("../controllers/admin/biayaUji.controller");
const persyaratanController = require("../controllers/admin/persyaratan.controller");
const persyaratanTukController = require("../controllers/admin/persyaratanTuk.controller");
const kelompokPekerjaanController = require("../controllers/admin/kelompokPekerjaan.controller");
// const tukTempatController = require("../controllers/admin/tukTempat.controller"); // Dihapus karena tidak terlihat digunakan di rute yang ada
const adminProfile = require("../controllers/admin/profile.controller");
const bandingController = require("../controllers/admin/banding.controller");
const dokumenMutuController = require("../controllers/admin/dokumenMutu.controller");
const jadwalController = require("../controllers/admin/jadwal.controller");
const jadwalAsesorController = require("../controllers/admin/jadwalAsesor.controller");
const pesertaJadwalController = require("../controllers/admin/pesertaJadwal.controller");
const unitKompetensiController = require("../controllers/admin/unitKompetensi.controller");
const upload = require("../middlewares/upload.middleware");
const ctrl = require("../controllers/admin/surveillance.controller");
const accountController = require("../controllers/admin/account.controller");
const elemenKukController = require("../controllers/admin/elemenKuk.controller");
const pembayaranController = require("../controllers/admin/pembayaran.controller");
const feedbackAdminController = require("../controllers/admin/feedback.controller");

// PROTECT SEMUA ROUTE ADMIN
router.use(authMiddleware, roleMiddleware.adminOnly);

// ======================= FEEDBACK =======================
router.get("/feedback", feedbackAdminController.getAll);
router.put("/feedback/:id/toggle-status", feedbackAdminController.toggleStatus);
router.delete("/feedback/:id", feedbackAdminController.delete);

// ======================= SURVEILLANCE =======================
router.get("/surveillance", ctrl.getAllSurveillance);
router.put("/surveillance/:id/status", ctrl.updateStatusSurveillance);
router.get("/surveillance/export", ctrl.exportSurveillance);

// ======================= PROFILE ADMIN =======================
router.get("/profile", adminProfile.getProfile);
router.put("/profile", adminProfile.updateProfile);

// ======================= DOKUMEN MUTU =======================
router.post("/dokumen-mutu", upload, dokumenMutuController.createDokumen);
router.put("/dokumen-mutu/:id", upload, dokumenMutuController.updateDokumen);
router.get("/dokumen-mutu", dokumenMutuController.getAllDokumen);
router.delete("/dokumen-mutu/:id", dokumenMutuController.deleteDokumen);

// ======================= MANAJEMEN ASESOR =======================
router.post("/asesor", asesorAdmin.createAsesor);
router.get("/dropdown/skema", asesorAdmin.getSkemaDropdown);
router.get("/asesor", asesorAdmin.getAll);
router.get("/asesor/:id", asesorAdmin.getById);
router.put("/asesor/:id", asesorAdmin.update);
router.delete("/asesor/:id", asesorAdmin.delete);
router.post("/import-asesor", uploadExcel.single("file"), asesorAdmin.importAsesorExcel);
router.put("/asesor/:id/reset-password", asesorAdmin.resetPassword);
router.get("/download-template-asesor", asesorAdmin.downloadTemplate);

// ======================= MANAJEMEN ASESI =======================
router.post("/import-asesi", uploadExcel.single("file"), asesiAdmin.importAsesiExcel);
router.get("/asesi", asesiAdmin.getAll);
router.get("/asesi/:id", asesiAdmin.getById);
router.put("/asesi/:id", asesiAdmin.update);
router.delete("/asesi/:id", asesiAdmin.delete);
router.post("/asesi/:id/reset-password", asesiAdmin.resetPassword);
router.get("/download-template-asesi", asesiAdmin.downloadTemplate);

// ======================= MANAJEMEN TUK =======================
router.post("/tuk", upload, tukAdmin.createTuk);
router.post("/import-tuk", uploadExcel.single("file"), tukAdmin.importTukExcel);
router.get("/tuk", tukAdmin.getAll);
router.get("/tuk/:id", tukAdmin.getById);
router.put("/tuk/:id", upload, tukAdmin.update);
router.delete("/tuk/:id", tukAdmin.delete);
router.post("/tuk-tempat/attach-skema", tukAdmin.attachSkema);
router.delete("/tuk-tempat/detach-skema/:id_tuk/:id_skema", tukAdmin.detachSkema);
router.put("/tuk/:id/reset-password", tukAdmin.resetPassword);
router.post("/tuk/:id/generate-account", tukAdmin.generateAccount);

// ======================= ACCOUNT MANUAL EMAIL =======================
router.post("/send-email/:id", accountController.sendAccountEmailManual);

// ======================= DASHBOARD ADMIN =======================
router.get("/dashboard-summary", adminController.getDashboardSummary);
router.put("/admin/:id/reset-password", adminController.resetPassword);

// ======================= PENDAFTARAN =======================
router.get("/pendaftaran", pendaftaranController.getAll);
router.post("/pendaftaran/:id/approve", pendaftaranController.approvePendaftaran);
router.post("/pendaftaran/:id/reject", pendaftaranController.rejectPendaftaran);
router.delete("/pendaftaran/:id", pendaftaranController.deletePendaftaran);
router.post("/pendaftaran/bulk-delete", pendaftaranController.bulkDeletePendaftaran);

// ======================= PENGADUAN =======================
router.get("/pengaduan", pengaduanController.getAllPengaduan);
router.put("/pengaduan/:id/status", pengaduanController.updateStatusPengaduan);

// ======================= NOTIFIKASI =======================
router.get("/notifikasi", notifikasiController.getAll);

// ======================= JADWAL =======================
router.post("/jadwal", jadwalController.create);
router.get("/jadwal", jadwalController.getAll);
router.get("/jadwal/:id", jadwalController.getById);
router.put("/jadwal/:id", jadwalController.update);
router.put("/jadwal/:id/status", jadwalController.updateStatus);
router.delete("/jadwal/:id", jadwalController.delete);

// ======================= JADWAL ASESOR =======================
router.post("/jadwal-asesor", jadwalAsesorController.assign);
router.get("/jadwal-asesor/:id_jadwal", jadwalAsesorController.getByJadwal);
router.put("/jadwal-asesor/:id_jadwal/:id_user/:jenis_tugas", jadwalAsesorController.updateStatus);
router.delete("/jadwal-asesor/:id_jadwal/:id_user/:jenis_tugas", jadwalAsesorController.remove);

// ======================= SKKNI =======================
router.post("/skkni", upload, skkniController.create);
router.put("/skkni/:id", upload, skkniController.update);
router.get("/skkni", skkniController.getAll);
router.get("/skkni/:id", skkniController.getById);
router.delete("/skkni/:id", skkniController.delete);

// ======================= SKEMA =======================
router.post("/skema", upload, skemaController.create);
router.get("/skema", skemaController.getAll);
router.get("/skema/:id", skemaController.getDetail);
router.put("/skema/:id", upload, skemaController.update);
router.delete("/skema/:id", skemaController.delete);

// ======================= BIAYA UJI =======================
router.post("/biaya-uji", biayaUjiController.create);
router.get("/biaya-uji/skema/:id_skema", biayaUjiController.getBySkema);
router.put("/biaya-uji/:id", biayaUjiController.update);
router.delete("/biaya-uji/:id", biayaUjiController.delete);

// ======================= PERSYARATAN (DASAR & TUK) =======================
router.post("/persyaratan", persyaratanController.create);
router.get("/persyaratan", persyaratanController.getAll);
router.get("/persyaratan/:id", persyaratanController.getById);
router.put("/persyaratan/:id", persyaratanController.update);
router.delete("/persyaratan/:id", persyaratanController.delete);
router.post("/persyaratan/attach", persyaratanController.attachToSkema);
router.delete("/persyaratan/detach/:id_skema/:id_persyaratan", persyaratanController.detachFromSkema);

router.post("/persyaratan-tuk", persyaratanTukController.create);
router.put("/persyaratan-tuk/:id", persyaratanTukController.update);
router.get("/persyaratan-tuk", persyaratanTukController.getAll);
router.post("/persyaratan-tuk/attach", persyaratanTukController.attachToSkema);
router.delete("/persyaratan-tuk/detach/:id_skema/:id_persyaratan_tuk", persyaratanTukController.detachFromSkema);

// ======================= KELOMPOK PEKERJAAN =======================
router.post("/kelompok-pekerjaan", kelompokPekerjaanController.create);
router.get("/kelompok-pekerjaan/skema/:id_skema", kelompokPekerjaanController.getBySkema);
router.put("/kelompok-pekerjaan/:id", kelompokPekerjaanController.update);
router.delete("/kelompok-pekerjaan/:id", kelompokPekerjaanController.delete);

// ======================= BANDING =======================
router.get("/banding", bandingController.getAllBanding);
router.put("/banding/:id", bandingController.updateStatusBanding);

// ======================= PESERTA JADWAL (GLOBAL & PER JADWAL) =======================
router.get("/peserta-jadwal/global", pesertaJadwalController.getAllPesertaGlobal);
router.get("/jadwal/:id_jadwal/peserta", pesertaJadwalController.getPesertaByJadwal);
router.put("/peserta-jadwal/:id_peserta/assign-asesor", pesertaJadwalController.assignAsesorToPeserta);

// ======================= UNIT KOMPETENSI =======================
router.post("/unit-kompetensi", unitKompetensiController.create);
router.get("/unit-kompetensi", unitKompetensiController.getAll);
router.get("/unit-kompetensi/:id", unitKompetensiController.getById);
router.put("/unit-kompetensi/:id", unitKompetensiController.update);
router.delete("/unit-kompetensi/:id", unitKompetensiController.delete);

// ======================= ELEMEN & KUK =======================
router.post("/unit-elemen", elemenKukController.createElemen);
router.put("/unit-elemen/:id", elemenKukController.updateElemen);
router.delete("/unit-elemen/:id", elemenKukController.deleteElemen);

router.post("/unit-kuk", elemenKukController.createKuk);
router.put("/unit-kuk/:id", elemenKukController.updateKuk);
router.delete("/unit-kuk/:id", elemenKukController.deleteKuk);

// ======================= PEMBAYARAN =======================
router.get("/pembayaran", pembayaranController.getAll);
router.put("/pembayaran/:id/approve", pembayaranController.approve);
router.put("/pembayaran/:id/reject", pembayaranController.reject);

module.exports = router;