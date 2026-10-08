// backend/src/controllers/admin/frIa05.controller.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { FrIa05, FrIa05Soal, FrIa05Opsi, Skema } = require("../../models");
const sequelize = FrIa05.sequelize;

/* ===============================
  UPLOAD GAMBAR SOAL
================================ */
const uploadDir = path.join(process.cwd(), "uploads", "fria05");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "");
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("File harus berupa gambar JPG, PNG, atau WEBP"), false);
  }
  cb(null, true);
};

exports.uploadGambar = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single("gambar_file");

/* ===============================
  HELPERS
================================ */
const success = (res, message, data = null, status = 200) => res.status(status).json({ success: true, message, data });
const error = (res, message, status = 500) => res.status(status).json({ success: false, message });
const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || !value ? null : parsed;
};
const toPlain = (data) => (data && typeof data.toJSON === "function" ? data.toJSON() : data);

const normalizeOpsi = (opsiInput = []) => {
  let parsed = typeof opsiInput === "string" ? JSON.parse(opsiInput || "[]") : opsiInput;
  const defaultOpsi = ["A", "B", "C", "D", "E"].map((k) => ({ kode_opsi: k, jawaban: "", is_benar: false }));
  const source = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultOpsi;
  
  return source.map((item, index) => ({
    kode_opsi: String(item.kode_opsi || defaultOpsi[index].kode_opsi).slice(0, 1).toUpperCase(),
    jawaban: item.jawaban || "",
    is_benar: item.is_benar === true || item.is_benar === "true" || item.is_benar === 1 ? 1 : 0,
  }));
};

const normalizeUploadPath = (file) => (file ? `/uploads/fria05/${file.filename}` : null);

/* ===============================
  GET PAKET FULL BY ID
================================ */
const getPaketFullById = async (id_fr_ia_05) => {
  const paketData = await FrIa05.findByPk(id_fr_ia_05);
  if (!paketData) return null;
  
  const paket = toPlain(paketData);
  let skema = null;
  if (paket.id_skema) {
    skema = toPlain(await Skema.findByPk(paket.id_skema));
  }

  const soalData = await FrIa05Soal.findAll({
    where: { id_fr_ia_05: paket.id_fr_ia_05 },
    order: [["urutan", "ASC"]],
  });

  const soal = [];
  for (const item of soalData) {
    const plainSoal = toPlain(item);
    const opsiData = await FrIa05Opsi.findAll({
      where: { id_soal: plainSoal.id_soal },
      order: [["kode_opsi", "ASC"]],
    });
    soal.push({ ...plainSoal, opsi: opsiData.map(toPlain) });
  }

  return { ...paket, skema, soal };
};

/* ===============================
  GET MASTER PAKET BY SKEMA
  GET /api/admin/fr-ia05/skema/:id_skema
================================ */
exports.getBySkema = async (req, res) => {
  try {
    const { id_skema } = req.params;
    if (!id_skema) return error(res, "ID Skema wajib diisi", 400);

    const skema = await Skema.findByPk(id_skema);
    if (!skema) return error(res, "Skema tidak ditemukan", 404);

    // Cari paket master untuk skema ini (biasanya yang id_jadwal-nya null jika dibuat oleh admin, atau ambil yang paling pertama)
    let paket = await FrIa05.findOne({
      where: { id_skema, id_jadwal: null }, 
      order: [["id_fr_ia_05", "DESC"]]
    });

    let fullData = null;
    if (paket) {
      fullData = await getPaketFullById(paket.id_fr_ia_05);
    }

    return success(res, "Data Master FR.IA.05 Skema berhasil dimuat", {
      skema: toPlain(skema),
      paket: fullData
    });
  } catch (err) {
    console.error("ERROR GET FRIA05 BY SKEMA:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
  CREATE / UPDATE PAKET HEADER
  POST /api/admin/fr-ia05/paket
================================ */
exports.createPaket = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_skema, kode_paket, judul_paket, passing_grade, waktu } = req.body;
    if (!id_skema) {
      await t.rollback();
      return error(res, "ID Skema wajib diisi", 400);
    }

    let paket = await FrIa05.findOne({ where: { id_skema, id_jadwal: null }, transaction: t });

    const payload = {
      id_skema: safeNumber(id_skema),
      id_jadwal: null, // Null karena ini master soal milik Admin
      kode_paket: kode_paket || `MASTER-FRIA05-SKM-${id_skema}`,
      judul_paket: judul_paket || "Master Paket Soal FR.IA.05",
      passing_grade: safeNumber(passing_grade) || 70,
      waktu: safeNumber(waktu) || 90,
      created_by: req.user?.id_user || null,
      created_at: paket?.created_at || new Date(),
    };

    if (paket) {
      await paket.update(payload, { transaction: t });
    } else {
      paket = await FrIa05.create(payload, { transaction: t });
    }

    await t.commit();
    const fullData = await getPaketFullById(paket.id_fr_ia_05);
    return success(res, "Paket soal master berhasil disimpan", fullData);
  } catch (err) {
    await t.rollback();
    console.error("ERROR CREATE PAKET FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
  CREATE SOAL + OPSI
  POST /api/admin/fr-ia05/soal
================================ */
exports.createSoal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_fr_ia_05, id_kelompok, pertanyaan, urutan, opsi } = req.body;
    
    if (!id_fr_ia_05 || !pertanyaan) {
      await t.rollback();
      return error(res, "ID Paket dan Pertanyaan wajib diisi", 400);
    }

    const soal = await FrIa05Soal.create({
      id_fr_ia_05: safeNumber(id_fr_ia_05),
      id_kelompok: safeNumber(id_kelompok),
      pertanyaan: String(pertanyaan).trim(),
      gambar: normalizeUploadPath(req.file) || req.body.gambar_lama || null,
      urutan: safeNumber(urutan) || 1,
    }, { transaction: t });

    const opsiFinal = normalizeOpsi(opsi).map((item) => ({
      id_soal: soal.id_soal,
      kode_opsi: item.kode_opsi,
      jawaban: item.jawaban,
      is_benar: item.is_benar,
    }));

    if (opsiFinal.length > 0) {
      await FrIa05Opsi.bulkCreate(opsiFinal, { transaction: t });
    }

    await t.commit();
    const fullData = await getPaketFullById(id_fr_ia_05);
    return success(res, "Soal berhasil ditambahkan", fullData);
  } catch (err) {
    await t.rollback();
    return error(res, err.message, 500);
  }
};

/* ===============================
  UPDATE SOAL + OPSI
  PUT /api/admin/fr-ia05/soal/:id
================================ */
exports.updateSoal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { id_kelompok, pertanyaan, urutan, opsi, hapus_gambar } = req.body;

    const soal = await FrIa05Soal.findByPk(id);
    if (!soal) {
      await t.rollback();
      return error(res, "Soal tidak ditemukan", 404);
    }

    let finalGambar = normalizeUploadPath(req.file) || req.body.gambar_lama || soal.gambar;
    if (hapus_gambar === "true") finalGambar = null;

    await soal.update({
      id_kelompok: safeNumber(id_kelompok),
      pertanyaan: String(pertanyaan).trim(),
      gambar: finalGambar,
      urutan: safeNumber(urutan) || soal.urutan,
    }, { transaction: t });

    await FrIa05Opsi.destroy({ where: { id_soal: soal.id_soal }, transaction: t });

    const opsiFinal = normalizeOpsi(opsi).map((item) => ({
      id_soal: soal.id_soal,
      kode_opsi: item.kode_opsi,
      jawaban: item.jawaban,
      is_benar: item.is_benar,
    }));

    if (opsiFinal.length > 0) {
      await FrIa05Opsi.bulkCreate(opsiFinal, { transaction: t });
    }

    await t.commit();
    const fullData = await getPaketFullById(soal.id_fr_ia_05);
    return success(res, "Soal berhasil diupdate", fullData);
  } catch (err) {
    await t.rollback();
    return error(res, err.message, 500);
  }
};

/* ===============================
  DELETE SOAL
  DELETE /api/admin/fr-ia05/soal/:id
================================ */
exports.deleteSoal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const soal = await FrIa05Soal.findByPk(req.params.id);
    if (!soal) {
      await t.rollback();
      return error(res, "Soal tidak ditemukan", 404);
    }

    const idFrIa05 = soal.id_fr_ia_05;
    await FrIa05Opsi.destroy({ where: { id_soal: soal.id_soal }, transaction: t });
    await soal.destroy({ transaction: t });

    await t.commit();
    const fullData = await getPaketFullById(idFrIa05);
    return success(res, "Soal berhasil dihapus", fullData);
  } catch (err) {
    await t.rollback();
    return error(res, err.message, 500);
  }
};