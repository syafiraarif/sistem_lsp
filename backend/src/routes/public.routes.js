const router = require("express").Router();
const pendaftaran = require("../controllers/public/pendaftaran.controller");
const pengaduan = require("../controllers/public/pengaduan.controller");
const { publicFormLimiter } = require("../middlewares/rateLimit.middleware");
const wilayah = require("../controllers/public/wilayah.controller");

router.post("/pendaftaran", publicFormLimiter, pendaftaran.create);
router.post("/pengaduan", publicFormLimiter, pengaduan.create);

router.get("/provinsi", wilayah.getProvinsi);
router.get("/kota/:id", wilayah.getKota);
router.get("/kecamatan/:id", wilayah.getKecamatan);
router.get("/kelurahan/:id", wilayah.getKelurahan);

module.exports = router;
