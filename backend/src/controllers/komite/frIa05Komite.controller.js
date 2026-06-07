// backend/src/controllers/komite/frIa05Komite.controller.js

const PDFDocument = require("pdfkit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
  FrIa05,
  FrIa05Soal,
  FrIa05Opsi,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesor,
  JadwalAsesor,
  User,
} = require("../../models");

const sequelize = FrIa05.sequelize;

/* ===============================
UPLOAD GAMBAR SOAL
================================ */

const uploadDir = path.join(process.cwd(), "uploads", "fria05");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

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

exports.uploadGambar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
}).single("gambar_file");

/* ===============================
HELPER RESPONSE
================================ */

const success = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/* ===============================
HELPER UMUM
================================ */

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const getUserId = (req) => {
  return (
    req.user?.id_user ||
    req.user?.id ||
    req.user?.user_id ||
    req.user?.id_asesor ||
    null
  );
};

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const normalizeOpsi = (opsiInput = []) => {
  let parsedInput = opsiInput;

  if (typeof opsiInput === "string") {
    try {
      parsedInput = JSON.parse(opsiInput);
    } catch {
      parsedInput = [];
    }
  }

  const defaultOpsi = [
    { kode_opsi: "A", jawaban: "", is_benar: false },
    { kode_opsi: "B", jawaban: "", is_benar: false },
    { kode_opsi: "C", jawaban: "", is_benar: false },
    { kode_opsi: "D", jawaban: "", is_benar: false },
    { kode_opsi: "E", jawaban: "", is_benar: false },
  ];

  const source =
    Array.isArray(parsedInput) && parsedInput.length > 0
      ? parsedInput
      : defaultOpsi;

  return source.map((item, index) => {
    const kode =
      item.kode_opsi ||
      item.kode ||
      defaultOpsi[index]?.kode_opsi ||
      String.fromCharCode(65 + index);

    return {
      kode_opsi: String(kode).slice(0, 1).toUpperCase(),
      jawaban: item.jawaban || "",
      is_benar: item.is_benar === true || item.is_benar === "true" || item.is_benar === 1 ? 1 : 0,
    };
  });
};

const normalizeUploadPath = (file) => {
  if (!file) return null;

  return `/uploads/fria05/${file.filename}`;
};

const getPublicFilePath = (value) => {
  if (!value) return null;

  if (String(value).startsWith("http")) {
    return null;
  }

  const clean = String(value).replace(/^\/+/, "");

  const candidates = [
    path.join(process.cwd(), clean),
    path.join(process.cwd(), "public", clean),
    path.join(process.cwd(), "uploads", clean.replace(/^uploads[\\/]/, "")),
  ];

  return candidates.find((item) => fs.existsSync(item)) || null;
};

const drawImage = (doc, imagePath, x, y, fit = [260, 140]) => {
  try {
    const localPath = getPublicFilePath(imagePath);

    if (!localPath) return false;

    doc.image(localPath, x, y, {
      fit,
      align: "center",
      valign: "center",
    });

    return true;
  } catch (err) {
    console.log("Gagal render gambar:", err.message);
    return false;
  }
};

/* ===============================
GET JADWAL DETAIL
================================ */

const getJadwalDetail = async (id_jadwal) => {
  const jadwalData = await Jadwal.findOne({
    where: {
      id_jadwal,
    },
  });

  if (!jadwalData) return null;

  const jadwal = toPlain(jadwalData);

  let skema = null;
  let tuk = null;

  if (jadwal.id_skema) {
    const skemaData = await Skema.findByPk(jadwal.id_skema);
    skema = toPlain(skemaData);
  }

  if (jadwal.id_tuk) {
    const tukData = await Tuk.findByPk(jadwal.id_tuk);
    tuk = toPlain(tukData);
  }

  return {
    ...jadwal,
    skema,
    tuk,
  };
};

/* ===============================
GET PROFILE ASESOR
================================ */

const getProfileByUserId = async (id_user) => {
  if (!id_user || !ProfileAsesor) return null;

  const profileData = await ProfileAsesor.findOne({
    where: {
      id_user,
    },
  });

  const profile = toPlain(profileData);

  let user = null;

  if (User && id_user) {
    try {
      const userData = await User.findByPk(id_user);
      user = toPlain(userData);
    } catch {
      user = null;
    }
  }

  return {
    ...(profile || {}),
    user,
    id_user,
    nama_lengkap:
      profile?.nama_lengkap ||
      profile?.nama_asesor ||
      user?.nama_lengkap ||
      user?.nama ||
      user?.username ||
      "",
    ttd_path:
      profile?.ttd_path ||
      profile?.tanda_tangan ||
      profile?.ttd ||
      profile?.signature ||
      "",
  };
};

const getCurrentAsesorProfile = async (req) => {
  const id_user = getUserId(req);
  return getProfileByUserId(id_user);
};

const getAsesorByTugas = async (id_jadwal, tugasList = []) => {
  if (!JadwalAsesor || !id_jadwal) return null;

  try {
    for (const jenis_tugas of tugasList) {
      const row = await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          jenis_tugas,
          status: "aktif",
        },
      });

      const plain = toPlain(row);

      if (plain?.id_user) {
        const profile = await getProfileByUserId(plain.id_user);
        if (profile) return profile;
      }
    }
  } catch (err) {
    console.log("Gagal get asesor by tugas:", err.message);
  }

  return null;
};

const getSignaturePeople = async (req, id_jadwal) => {
  const current = await getCurrentAsesorProfile(req);

  const penyusun =
    (await getAsesorByTugas(id_jadwal, [
      "komite_teknis",
      "validator_komite",
      "penyusun",
      "validator_mkva",
    ])) || current;

  const validator =
    (await getAsesorByTugas(id_jadwal, [
      "asesor_penguji",
      "penguji",
      "asesor",
      "asesor_kompetensi",
    ])) || null;

  return {
    penyusun,
    validator,
  };
};

/* ===============================
GET PAKET FULL BY ID
================================ */

const getPaketFullById = async (id_fr_ia_05) => {
  const paketData = await FrIa05.findByPk(id_fr_ia_05);

  if (!paketData) return null;

  const paket = toPlain(paketData);

  const jadwal = await getJadwalDetail(paket.id_jadwal);

  let skema = null;

  if (paket.id_skema) {
    const skemaData = await Skema.findByPk(paket.id_skema);
    skema = toPlain(skemaData);
  }

  const soalData = await FrIa05Soal.findAll({
    where: {
      id_fr_ia_05: paket.id_fr_ia_05,
    },
    order: [["urutan", "ASC"]],
  });

  const soal = [];

  for (const item of soalData) {
    const plainSoal = toPlain(item);

    const opsiData = await FrIa05Opsi.findAll({
      where: {
        id_soal: plainSoal.id_soal,
      },
      order: [["kode_opsi", "ASC"]],
    });

    soal.push({
      ...plainSoal,
      opsi: opsiData.map((opsi) => toPlain(opsi)),
    });
  }

  return {
    ...paket,
    jadwal,
    skema: skema || jadwal?.skema || null,
    soal,
  };
};

const getPaketFullByJadwal = async (id_jadwal) => {
  const paket = await FrIa05.findOne({
    where: {
      id_jadwal,
    },
    order: [["id_fr_ia_05", "DESC"]],
  });

  if (!paket) return null;

  return getPaketFullById(paket.id_fr_ia_05);
};

/* ===============================
CREATE / UPDATE PAKET SOAL
POST /api/asesor/fr-ia05/komite
================================ */

exports.createPaket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id_user = getUserId(req);

    const {
      id_jadwal,
      id_skema,
      kode_paket,
      judul_paket,
      passing_grade,
    } = req.body;

    if (!id_jadwal) {
      await t.rollback();
      return error(res, "Jadwal wajib diisi", 400);
    }

    const jadwal = await getJadwalDetail(id_jadwal);

    if (!jadwal) {
      await t.rollback();
      return error(res, "Jadwal tidak ditemukan", 404);
    }

    const finalIdSkema =
      safeNumber(id_skema) ||
      safeNumber(jadwal.id_skema) ||
      safeNumber(jadwal.skema?.id_skema);

    if (!finalIdSkema) {
      await t.rollback();
      return error(res, "Skema pada jadwal tidak ditemukan", 400);
    }

    let paket = await FrIa05.findOne({
      where: {
        id_jadwal,
      },
      transaction: t,
    });

    const payload = {
      id_jadwal: safeNumber(id_jadwal),
      id_skema: finalIdSkema,
      kode_paket: kode_paket || `FRIA05-${id_jadwal}`,
      judul_paket: judul_paket || "Paket Soal FR.IA.05",
      passing_grade: safeNumber(passing_grade) || 70,
      created_by: id_user,
      created_at: paket?.created_at || new Date(),
    };

    if (paket) {
      await paket.update(payload, {
        transaction: t,
      });
    } else {
      paket = await FrIa05.create(payload, {
        transaction: t,
      });
    }

    await t.commit();

    const fullData = await getPaketFullById(paket.id_fr_ia_05);

    return success(res, "Paket soal berhasil disimpan", fullData);
  } catch (err) {
    await t.rollback();
    console.error("ERROR CREATE PAKET FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
GET PAKET BY JADWAL
GET /api/asesor/fr-ia05/komite/jadwal/:id_jadwal
================================ */

exports.getByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const jadwal = await getJadwalDetail(id_jadwal);

    if (!jadwal) {
      return error(res, "Jadwal tidak ditemukan", 404);
    }

    const paket = await getPaketFullByJadwal(id_jadwal);
    const signature = await getSignaturePeople(req, id_jadwal);

    return success(res, "Data FR.IA.05 berhasil dimuat", {
      jadwal,
      asesor: signature.penyusun,
      penyusun: signature.penyusun,
      validator: signature.validator,
      tanggal: getTodayDate(),
      paket,
    });
  } catch (err) {
    console.error("ERROR GET FRIA05 BY JADWAL:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
GET DETAIL PAKET + SOAL + OPSI
GET /api/asesor/fr-ia05/komite/:id
================================ */

exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const paket = await getPaketFullById(id);

    if (!paket) {
      return error(res, "Paket tidak ditemukan", 404);
    }

    const signature = await getSignaturePeople(req, paket.id_jadwal);

    return success(res, "Detail paket FR.IA.05", {
      ...paket,
      penyusun: signature.penyusun,
      validator: signature.validator,
    });
  } catch (err) {
    console.error("ERROR GET DETAIL FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
CREATE SOAL + OPSI
POST /api/asesor/fr-ia05/komite/soal
================================ */

exports.createSoal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      id_fr_ia_05,
      id_kelompok,
      pertanyaan,
      urutan,
      opsi,
      gambar_lama,
    } = req.body;

    if (!id_fr_ia_05) {
      await t.rollback();
      return error(res, "ID paket FR.IA.05 wajib diisi", 400);
    }

    if (!pertanyaan || !String(pertanyaan).trim()) {
      await t.rollback();
      return error(res, "Pertanyaan wajib diisi", 400);
    }

    const paket = await FrIa05.findByPk(id_fr_ia_05);

    if (!paket) {
      await t.rollback();
      return error(res, "Paket FR.IA.05 tidak ditemukan", 404);
    }

    const uploadedPath = normalizeUploadPath(req.file);
    const finalGambar = uploadedPath || gambar_lama || null;

    const soal = await FrIa05Soal.create(
      {
        id_fr_ia_05: safeNumber(id_fr_ia_05),
        id_kelompok: safeNumber(id_kelompok),
        pertanyaan: String(pertanyaan).trim(),
        gambar: finalGambar,
        urutan: safeNumber(urutan) || 1,
      },
      {
        transaction: t,
      }
    );

    const opsiFinal = normalizeOpsi(opsi).map((item) => ({
      id_soal: soal.id_soal,
      kode_opsi: item.kode_opsi,
      jawaban: item.jawaban,
      is_benar: item.is_benar,
    }));

    if (opsiFinal.length > 0) {
      await FrIa05Opsi.bulkCreate(opsiFinal, {
        transaction: t,
      });
    }

    await t.commit();

    const fullData = await getPaketFullById(id_fr_ia_05);

    return success(res, "Soal berhasil ditambahkan", fullData);
  } catch (err) {
    await t.rollback();
    console.error("ERROR CREATE SOAL FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
UPDATE SOAL + OPSI
PUT /api/asesor/fr-ia05/komite/soal/:id
================================ */

exports.updateSoal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      id_kelompok,
      pertanyaan,
      urutan,
      opsi,
      gambar_lama,
      hapus_gambar,
    } = req.body;

    const soal = await FrIa05Soal.findByPk(id);

    if (!soal) {
      await t.rollback();
      return error(res, "Soal tidak ditemukan", 404);
    }

    if (!pertanyaan || !String(pertanyaan).trim()) {
      await t.rollback();
      return error(res, "Pertanyaan wajib diisi", 400);
    }

    const uploadedPath = normalizeUploadPath(req.file);

    let finalGambar = soal.gambar || gambar_lama || null;

    if (hapus_gambar === "true") {
      finalGambar = null;
    }

    if (uploadedPath) {
      finalGambar = uploadedPath;
    }

    await soal.update(
      {
        id_kelompok: safeNumber(id_kelompok),
        pertanyaan: String(pertanyaan).trim(),
        gambar: finalGambar,
        urutan: safeNumber(urutan) || soal.urutan || 1,
      },
      {
        transaction: t,
      }
    );

    await FrIa05Opsi.destroy({
      where: {
        id_soal: soal.id_soal,
      },
      transaction: t,
    });

    const opsiFinal = normalizeOpsi(opsi).map((item) => ({
      id_soal: soal.id_soal,
      kode_opsi: item.kode_opsi,
      jawaban: item.jawaban,
      is_benar: item.is_benar,
    }));

    if (opsiFinal.length > 0) {
      await FrIa05Opsi.bulkCreate(opsiFinal, {
        transaction: t,
      });
    }

    await t.commit();

    const fullData = await getPaketFullById(soal.id_fr_ia_05);

    return success(res, "Soal berhasil diupdate", fullData);
  } catch (err) {
    await t.rollback();
    console.error("ERROR UPDATE SOAL FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
DELETE SOAL
DELETE /api/asesor/fr-ia05/komite/soal/:id
================================ */

exports.deleteSoal = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const soal = await FrIa05Soal.findByPk(id);

    if (!soal) {
      await t.rollback();
      return error(res, "Soal tidak ditemukan", 404);
    }

    const idFrIa05 = soal.id_fr_ia_05;

    await FrIa05Opsi.destroy({
      where: {
        id_soal: soal.id_soal,
      },
      transaction: t,
    });

    await soal.destroy({
      transaction: t,
    });

    await t.commit();

    const fullData = await getPaketFullById(idFrIa05);

    return success(res, "Soal berhasil dihapus", fullData);
  } catch (err) {
    await t.rollback();
    console.error("ERROR DELETE SOAL FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
CREATE OPSI MANUAL
POST /api/asesor/fr-ia05/komite/opsi
================================ */

exports.createOpsi = async (req, res) => {
  try {
    const { id_soal, kode_opsi, jawaban, is_benar } = req.body;

    if (!id_soal) {
      return error(res, "ID soal wajib diisi", 400);
    }

    if (!kode_opsi) {
      return error(res, "Kode opsi wajib diisi", 400);
    }

    if (!jawaban || !String(jawaban).trim()) {
      return error(res, "Jawaban wajib diisi", 400);
    }

    const soal = await FrIa05Soal.findByPk(id_soal);

    if (!soal) {
      return error(res, "Soal tidak ditemukan", 404);
    }

    if (is_benar) {
      await FrIa05Opsi.update(
        {
          is_benar: false,
        },
        {
          where: {
            id_soal,
          },
        }
      );
    }

    const data = await FrIa05Opsi.create({
      id_soal,
      kode_opsi: String(kode_opsi).slice(0, 1).toUpperCase(),
      jawaban: String(jawaban).trim(),
      is_benar: Boolean(is_benar),
    });

    return success(res, "Opsi berhasil ditambahkan", data);
  } catch (err) {
    console.error("ERROR CREATE OPSI FRIA05:", err);
    return error(res, err.message, 500);
  }
};

/* ===============================
DOWNLOAD PDF KOMITE
GET /api/asesor/fr-ia05/komite/:id/pdf
================================ */

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const paket = await getPaketFullById(id);

    if (!paket) {
      return error(res, "Paket tidak ditemukan", 404);
    }

    const jadwal = paket.jadwal || {};
    const skema = paket.skema || jadwal.skema || {};
    const tuk = jadwal.tuk || {};
    const soalSorted = Array.isArray(paket.soal) ? paket.soal : [];
    const signature = await getSignaturePeople(req, paket.id_jadwal);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FRIA05-${paket.kode_paket || paket.id_fr_ia_05}.pdf`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    doc.pipe(res);

    doc.font("Helvetica-Bold").fontSize(13);
    doc.text("FR.IA.05A. DPT - PERTANYAAN TERTULIS PILIHAN GANDA");
    doc.moveDown();

    doc.fontSize(9);

    const startX = 40;
    let y = doc.y;
    const tableWidth = 515;
    const rowH = 20;

    const drawCell = (x, yPos, w, h, text, bold = false) => {
      doc.rect(x, yPos, w, h).stroke();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      doc.text(text || "", x + 4, yPos + 5, {
        width: w - 8,
        height: h - 4,
      });
    };

    drawCell(
      startX,
      y,
      160,
      rowH * 2,
      "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
      true
    );

    drawCell(startX + 160, y, 60, rowH, "Judul", true);
    drawCell(startX + 220, y, 15, rowH, ":");
    drawCell(
      startX + 235,
      y,
      tableWidth - 235,
      rowH,
      skema.judul_skema || "-",
      true
    );

    drawCell(startX + 160, y + rowH, 60, rowH, "Nomor", true);
    drawCell(startX + 220, y + rowH, 15, rowH, ":");
    drawCell(
      startX + 235,
      y + rowH,
      tableWidth - 235,
      rowH,
      skema.kode_skema || "-",
      true
    );

    y += rowH * 2;

    const infoRows = [
      ["TUK", tuk.nama_tuk || "Mandiri/Sewaktu/Tempat Kerja"],
      ["Nama Asesor", signature.penyusun?.nama_lengkap || ""],
      ["Nama Asesi", ""],
      ["Tanggal", ""],
      ["Waktu", ""],
    ];

    infoRows.forEach(([label, value]) => {
      drawCell(startX, y, 220, rowH, label, true);
      drawCell(startX + 220, y, 15, rowH, ":");
      drawCell(startX + 235, y, tableWidth - 235, rowH, value || "");
      y += rowH;
    });

    doc.y = y + 20;
    doc.font("Helvetica").fontSize(10);
    doc.text("Jawab semua pertanyaan berikut:");
    doc.moveDown(0.5);

    if (!soalSorted.length) {
      doc.text("Belum ada pertanyaan.");
    }

    soalSorted.forEach((soal, index) => {
      if (doc.y > 700) doc.addPage();

      const questionTop = doc.y;

      doc.font("Helvetica").fontSize(10);

      doc.text(`${index + 1}.`, startX, questionTop, {
        width: 25,
      });

      doc.text(soal.pertanyaan || "-", startX + 28, questionTop, {
        width: 470,
      });

      doc.moveDown(0.8);

      if (soal.gambar) {
        const imageY = doc.y;
        const rendered = drawImage(doc, soal.gambar, startX + 28, imageY, [
          260,
          140,
        ]);

        if (rendered) {
          doc.y = imageY + 150;
        } else {
          doc.fontSize(8).text(`Gambar: ${soal.gambar}`, startX + 28, doc.y, {
            width: 460,
          });
          doc.moveDown(0.5);
        }
      }

      const opsiList = Array.isArray(soal.opsi) ? soal.opsi : [];

      opsiList.forEach((opsi) => {
        const opsiY = doc.y;

        doc.text(
          `${String(opsi.kode_opsi || "").toLowerCase()}.`,
          startX + 28,
          opsiY,
          {
            width: 25,
          }
        );

        doc.text(opsi.jawaban || "-", startX + 58, opsiY, {
          width: 440,
        });

        doc.moveDown(0.4);
      });

      doc.moveDown(0.5);
    });

    if (doc.y > 610) doc.addPage();

    doc.moveDown(2);

    const drawSignature = (title, person) => {
      const x = 350;
      const signY = doc.y;

      doc.font("Helvetica").fontSize(10);
      doc.text(title, x, signY, {
        width: 170,
        align: "center",
      });

      if (person?.ttd_path) {
        const signPath = getPublicFilePath(person.ttd_path);

        if (signPath) {
          try {
            doc.image(signPath, x + 35, signY + 20, {
              fit: [100, 55],
            });
          } catch (err) {
            console.log("Gagal render tanda tangan:", err.message);
          }
        }
      }

      doc.text(person?.nama_lengkap || "____________________", x, signY + 80, {
        width: 170,
        align: "center",
      });

      doc.moveDown(6);
    };

    drawSignature("Penyusun / Komite Teknis", signature.penyusun);
    drawSignature("Validator / Asesor Penguji", signature.validator);

    doc.end();
  } catch (err) {
    console.error("ERROR PDF FRIA05:", err);
    return error(res, err.message, 500);
  }
};