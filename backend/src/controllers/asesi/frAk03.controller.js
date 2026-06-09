const FrAk03 = require("../../models/frAk03.model");
const FrAk03Detail = require("../../models/frAk03Detail.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const HasilKeputusanAsesmen = require("../../models/hasilKeputusanAsesmen.model");

const PDFDocument = require("pdfkit");

/*
====================================
PERTANYAAN FIXED FR.AK.03
====================================
*/

const QUESTIONS = [
  "Saya mendapatkan penjelasan yang cukup memadai mengenai proses asesmen/uji kompetensi",
  "Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diujikan dan menilai diri sendiri terhadap pencapaiannya",
  "Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metoda, instrumen dan sumber asesmen serta jadwal asesmen",
  "Asesor berusaha menggali seluruh bukti pendukung yang sesuai dengan latar belakang pelatihan dan pengalaman yang saya miliki",
  "Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen",
  "Saya mendapatkan penjelasan yang memadai mengenai keputusan asesmen",
  "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjutnya",
  "Asesor bersama saya mempelajari semua dokumen asesmen serta menandatanganinya",
  "Saya mendapatkan jaminan kerahasiaan hasil asesmen serta penjelasan penanganan dokumen asesmen",
  "Asesor menggunakan keterampilan komunikasi yang efektif selama asesmen",
];

/*
====================================
HELPER
====================================
*/

const getIdUser = (req) => {
  return req.user?.id_user || req.user?.id || null;
};

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const normalizeJawaban = (value) => {
  const normalized = String(value || "").toLowerCase().trim();

  if (normalized === "ya") return "ya";
  if (normalized === "tidak") return "tidak";

  return null;
};

const findPesertaSaya = async (req) => {
  const idUser = getIdUser(req);
  const idPeserta =
    req.params.id_peserta ||
    req.query.id_peserta ||
    req.body.id_peserta ||
    null;

  const where = {
    id_user: idUser,
  };

  if (idPeserta) {
    where.id_peserta = idPeserta;
  }

  return PesertaJadwal.findOne({
    where,
    include: [
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        required: false,
      },
      {
        model: Jadwal,
        as: "jadwal",
        required: false,
        include: [
          {
            model: Skema,
            as: "skema",
            required: false,
          },
          {
            model: Tuk,
            as: "tuk",
            required: false,
          },
        ],
      },
    ],
    order: [["id_peserta", "DESC"]],
  });
};

const findKeputusanBelumKompeten = async (id_peserta) => {
  return HasilKeputusanAsesmen.findOne({
    where: {
      id_peserta,
      hasil: "belum_kompeten",
    },
    order: [
      ["tanggal_keputusan", "DESC"],
      ["id_keputusan", "DESC"],
    ],
  });
};

const cekAksesFrAk03 = async (req) => {
  const peserta = await findPesertaSaya(req);

  if (!peserta) {
    return {
      allowed: false,
      statusCode: 404,
      message: "Peserta tidak ditemukan",
      peserta: null,
      keputusan: null,
    };
  }

  const keputusan = await findKeputusanBelumKompeten(peserta.id_peserta);

  if (!keputusan) {
    return {
      allowed: false,
      statusCode: 403,
      message:
        "FR.AK.03 hanya dapat diisi jika hasil akhir asesmen adalah Belum Kompeten",
      peserta,
      keputusan: null,
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    message: "Akses FR.AK.03 valid",
    peserta,
    keputusan,
  };
};

const findFrAk03Lengkap = async (id_peserta) => {
  return FrAk03.findOne({
    where: {
      id_peserta,
    },
    include: [
      {
        model: FrAk03Detail,
        as: "detailAk03",
      },
      {
        model: PesertaJadwal,
        as: "peserta",
        include: [
          {
            model: ProfileAsesi,
            as: "profileAsesi",
          },
        ],
      },
      {
        model: Jadwal,
        as: "jadwal",
        include: [
          {
            model: Skema,
            as: "skema",
          },
          {
            model: Tuk,
            as: "tuk",
          },
        ],
      },
      {
        model: Skema,
        as: "skema",
      },
      {
        model: Tuk,
        as: "tuk",
      },
    ],
    order: [[{ model: FrAk03Detail, as: "detailAk03" }, "id_detail", "ASC"]],
  });
};

const buildFormResponse = async ({ peserta, keputusan }) => {
  const existing = await findFrAk03Lengkap(peserta.id_peserta);
  const plainPeserta = toPlain(peserta);
  const plainKeputusan = toPlain(keputusan);
  const plainExisting = toPlain(existing);

  const jadwal = plainPeserta?.jadwal || {};
  const skema = jadwal?.skema || {};
  const tuk = jadwal?.tuk || {};
  const profile = plainPeserta?.profileAsesi || {};

  return {
    id_peserta: plainPeserta.id_peserta,
    id_jadwal: plainPeserta.id_jadwal,
    id_skema: jadwal.id_skema || skema.id_skema || null,
    id_tuk: jadwal.id_tuk || tuk.id_tuk || null,

    nama_asesi: profile.nama_lengkap || "-",
    nik: profile.nik || "-",

    skema: {
      id_skema: skema.id_skema || jadwal.id_skema || null,
      kode_skema: skema.kode_skema || "-",
      judul_skema: skema.judul_skema || skema.nama_skema || "-",
    },

    tuk: {
      id_tuk: tuk.id_tuk || jadwal.id_tuk || null,
      nama_tuk: tuk.nama_tuk || tuk.nama || "-",
      alamat: tuk.alamat || "-",
    },

    jadwal: {
      id_jadwal: jadwal.id_jadwal || plainPeserta.id_jadwal,
      nama_kegiatan: jadwal.nama_kegiatan || "-",
      tgl_awal: jadwal.tgl_awal || null,
      tgl_akhir: jadwal.tgl_akhir || null,
      jam: jadwal.jam || "-",
    },

    keputusan: plainKeputusan,

    questions: QUESTIONS.map((text, index) => ({
      kode_pertanyaan: `Q${index + 1}`,
      pertanyaan: text,
    })),

    existing: plainExisting,
    is_submitted: Boolean(plainExisting),
    can_submit: !plainExisting,
  };
};

/*
====================================
GET FORM FR.AK.03
GET /api/asesi/fr-ak03/form?id_peserta=...
====================================
*/

exports.getFormFrAk03 = async (req, res) => {
  try {
    const akses = await cekAksesFrAk03(req);

    if (!akses.allowed) {
      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    const data = await buildFormResponse({
      peserta: akses.peserta,
      keputusan: akses.keputusan,
    });

    return res.json({
      status: "success",
      message: "Form FR.AK.03 berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("GET FORM FR.AK.03 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil form FR.AK.03",
      error: err.message,
    });
  }
};

/*
====================================
CREATE FR.AK.03
POST /api/asesi/fr-ak03
====================================
*/

exports.createFrAk03 = async (req, res) => {
  const transaction = await FrAk03.sequelize.transaction();

  try {
    const { id_peserta, jawaban, catatan_lainnya } = req.body;

    if (!id_peserta) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib dikirim",
      });
    }

    const akses = await cekAksesFrAk03(req);

    if (!akses.allowed) {
      await transaction.rollback();

      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    const peserta = akses.peserta;

    if (Number(peserta.id_peserta) !== Number(id_peserta)) {
      await transaction.rollback();

      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke peserta ini",
      });
    }

    const existing = await FrAk03.findOne({
      where: {
        id_peserta: peserta.id_peserta,
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "FR.AK.03 sudah pernah diisi",
      });
    }

    if (!Array.isArray(jawaban) || jawaban.length !== QUESTIONS.length) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Jawaban tidak lengkap",
      });
    }

    const invalidJawaban = jawaban.find((item) => {
      return !normalizeJawaban(item?.jawaban);
    });

    if (invalidJawaban) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Setiap jawaban wajib bernilai ya atau tidak",
      });
    }

    const jadwal = peserta.jadwal || {};

    const fr = await FrAk03.create(
      {
        id_peserta: peserta.id_peserta,
        id_jadwal: peserta.id_jadwal,
        id_skema: jadwal.id_skema,
        id_tuk: jadwal.id_tuk,
        tanggal_asesmen: new Date(),
        catatan_lainnya: catatan_lainnya || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        transaction,
      }
    );

    await FrAk03Detail.bulkCreate(
      jawaban.map((item, index) => ({
        id_fr_ak03: fr.id_fr_ak03,
        kode_pertanyaan: `Q${index + 1}`,
        pertanyaan: QUESTIONS[index],
        jawaban: normalizeJawaban(item.jawaban),
        catatan: item.catatan || null,
        created_at: new Date(),
      })),
      {
        transaction,
      }
    );

    await transaction.commit();

    const data = await findFrAk03Lengkap(peserta.id_peserta);

    return res.status(201).json({
      status: "success",
      message: "FR.AK.03 berhasil disimpan",
      data,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("CREATE FR.AK.03 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal menyimpan FR.AK.03",
      error: err.message,
    });
  }
};

/*
====================================
GET DETAIL FR.AK.03
GET /api/asesi/fr-ak03/:id_peserta
====================================
*/

exports.getFrAk03ByPeserta = async (req, res) => {
  try {
    const akses = await cekAksesFrAk03(req);

    if (!akses.allowed) {
      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    if (Number(akses.peserta.id_peserta) !== Number(req.params.id_peserta)) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke data FR.AK.03 ini",
      });
    }

    const data = await findFrAk03Lengkap(req.params.id_peserta);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "FR.AK.03 belum diisi",
      });
    }

    return res.json({
      status: "success",
      message: "Detail FR.AK.03 berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("GET DETAIL FR.AK.03 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail FR.AK.03",
      error: err.message,
    });
  }
};

/*
====================================
GENERATE PDF
GET /api/asesi/fr-ak03/pdf/:id_peserta
====================================
*/

exports.generatePdfFrAk03 = async (req, res) => {
  try {
    const akses = await cekAksesFrAk03(req);

    if (!akses.allowed) {
      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    if (Number(akses.peserta.id_peserta) !== Number(req.params.id_peserta)) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke PDF FR.AK.03 ini",
      });
    }

    const data = await findFrAk03Lengkap(req.params.id_peserta);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Data FR.AK.03 tidak ditemukan",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-AK-03-${req.params.id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
    });

    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("FR.AK.03 UMPAN BALIK DAN CATATAN ASESMEN", {
        align: "center",
      });

    doc.moveDown();

    doc.fontSize(11).font("Helvetica");

    doc.text(
      `Nama Asesi : ${data.peserta?.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(`Skema : ${data.jadwal?.skema?.judul_skema || "-"}`);

    doc.text(`TUK : ${data.jadwal?.tuk?.nama_tuk || "-"}`);

    doc.text(`Tanggal Asesmen : ${data.tanggal_asesmen || "-"}`);

    doc.moveDown();

    const detail = Array.isArray(data.detailAk03) ? data.detailAk03 : [];

    detail.forEach((item, index) => {
      doc.font("Helvetica-Bold").text(`${index + 1}. ${item.pertanyaan}`);
      doc.font("Helvetica").text(`Jawaban : ${String(item.jawaban).toUpperCase()}`);
      doc.text(`Catatan : ${item.catatan || "-"}`);
      doc.moveDown();
    });

    doc.font("Helvetica-Bold").text("Catatan Lainnya:");
    doc.font("Helvetica").text(data.catatan_lainnya || "-");

    doc.end();
  } catch (err) {
    console.error("GENERATE PDF FR.AK.03 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal membuat PDF FR.AK.03",
      error: err.message,
    });
  }
};