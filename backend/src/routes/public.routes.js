const router = require("express").Router();
const pendaftaran = require("../controllers/public/pendaftaran.controller");
const pengaduan = require("../controllers/public/pengaduan.controller");
const skema = require("../controllers/admin/skema.controller");
const { publicFormLimiter } = require("../middlewares/rateLimit.middleware");
const wilayah = require("../controllers/public/wilayah.controller");
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/public/surveillance.controller");
const dropdown = require("../controllers/public/dropdown.controller");

router.get("/dropdown/jadwal", dropdown.getWilayahUjiDropdown );
router.get("/dropdown/skema", dropdown.getSkemaDropdown);

router.post("/surveillance", publicFormLimiter, ctrl.createSurveillance);

router.post("/pendaftaran", publicFormLimiter, pendaftaran.create);
router.post("/pengaduan", publicFormLimiter, pengaduan.create);

router.get("/skema", skema.getAll);

router.get("/provinsi", wilayah.getProvinsi);
router.get("/kota/:id", wilayah.getKota);
router.get("/kecamatan/:id", wilayah.getKecamatan);
router.get("/kelurahan/:id", wilayah.getKelurahan);

module.exports = router;
