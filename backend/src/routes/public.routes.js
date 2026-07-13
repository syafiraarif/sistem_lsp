const router = require("express").Router();

const pendaftaran = require("../controllers/public/pendaftaran.controller");
const pengaduan = require("../controllers/public/pengaduan.controller");
const skema = require("../controllers/public/skema.controller");
const { publicFormLimiter } = require("../middlewares/rateLimit.middleware");
const wilayah = require("../controllers/public/wilayah.controller");
const ctrl = require("../controllers/public/surveillance.controller");
const dropdown = require("../controllers/public/dropdown.controller");
const tukCtrl = require("../controllers/public/tukTempat.controller");
const jadwalCtrl = require("../controllers/public/jadwal.controller");
const asesorController = require("../controllers/public/asesor.controller");
const feedbackController = require("../controllers/public/feedback.controller");

router.post("/feedback", feedbackController.create);
router.get("/feedback/active", feedbackController.getActiveFeedback);

router.get("/asesor", asesorController.getAllPublic);
router.get("/asesor/:id", asesorController.getByIdPublic);

router.get("/jadwal", jadwalCtrl.getAllPublic);
router.get("/dropdown/jadwal", dropdown.getWilayahUjiDropdown);
router.get("/dropdown/skema", dropdown.getSkemaDropdown);
router.get("/dropdown/kebangsaan", dropdown.getKebangsaanDropdown);

router.post("/surveillance", publicFormLimiter, ctrl.createSurveillance);

router.post("/pendaftaran", publicFormLimiter, pendaftaran.create);
router.post("/pengaduan", pengaduan.create);

router.get("/skema", skema.getAllPublic);

router.get("/provinsi", wilayah.getProvinsi);
router.get("/kota/:id", wilayah.getKota);
router.get("/kecamatan/:id", wilayah.getKecamatan);
router.get("/kelurahan/:id", wilayah.getKelurahan);

router.get("/tuk", tukCtrl.getAllPublic);

module.exports = router;