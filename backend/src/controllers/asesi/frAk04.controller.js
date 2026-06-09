const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const FrAk04 = require("../../models/frAk04.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const HasilKeputusanAsesmen = require("../../models/hasilKeputusanAsesmen.model");

/* ===============================
HELPER
=============================== */

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
    req.body.id_peserta ||
    req.query.id_peserta ||
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

const cekAksesFrAk04 = async (req) => {
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
        "FR.AK.04 hanya dapat diisi jika hasil akhir asesmen adalah Belum Kompeten",
      peserta,
      keputusan: null,
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    message: "Akses FR.AK.04 valid",
    peserta,
    keputusan,
  };
};

const findFrAk04Lengkap = async (id_peserta) => {
  return FrAk04.findOne({
    where: {
      id_peserta,
    },
    include: [
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
  });
};

const buildFrAk04Response = ({ data, peserta, keputusan }) => {
  const plainData = toPlain(data);
  const plainPeserta = toPlain(peserta);
  const plainKeputusan = toPlain(keputusan);

  const jadwal = plainData?.jadwal || plainPeserta?.jadwal || {};
  const skema = plainData?.skema || jadwal?.skema || {};
  const tuk = plainData?.tuk || jadwal?.tuk || {};
  const profile = plainData?.peserta?.profileAsesi || plainPeserta?.profileAsesi || {};

  return {
    id_fr_ak04: plainData?.id_fr_ak04 || null,
    id_peserta: plainPeserta?.id_peserta || plainData?.id_peserta || null,
    id_jadwal: plainPeserta?.id_jadwal || plainData?.id_jadwal || null,
    id_skema: jadwal?.id_skema || skema?.id_skema || plainData?.id_skema || null,
    id_tuk: jadwal?.id_tuk || tuk?.id_tuk || plainData?.id_tuk || null,

    nama_asesi: profile?.nama_lengkap || "-",
    nik: profile?.nik || "-",

    tanggal_asesmen: plainData?.tanggal_asesmen || jadwal?.tgl_akhir || jadwal?.tgl_awal || null,

    proses_banding_dijelaskan: plainData?.proses_banding_dijelaskan || "",
    diskusi_dengan_asesor: plainData?.diskusi_dengan_asesor || "",
    melibatkan_orang_lain: plainData?.melibatkan_orang_lain || "",
    alasan_banding: plainData?.alasan_banding || "",
    ttd_asesi: plainData?.ttd_asesi || profile?.ttd_path || null,

    keputusan: plainKeputusan || null,

    skema: {
      id_skema: skema?.id_skema || jadwal?.id_skema || null,
      kode_skema: skema?.kode_skema || "-",
      judul_skema: skema?.judul_skema || skema?.nama_skema || "-",
    },

    tuk: {
      id_tuk: tuk?.id_tuk || jadwal?.id_tuk || null,
      nama_tuk: tuk?.nama_tuk || tuk?.nama || "-",
      alamat: tuk?.alamat || "-",
    },

    jadwal: {
      id_jadwal: jadwal?.id_jadwal || plainPeserta?.id_jadwal || plainData?.id_jadwal || null,
      nama_kegiatan: jadwal?.nama_kegiatan || "-",
      tgl_awal: jadwal?.tgl_awal || null,
      tgl_akhir: jadwal?.tgl_akhir || null,
      jam: jadwal?.jam || "-",
    },

    is_submitted: Boolean(plainData),
    can_submit: !plainData,
  };
};

const resolveFilePath = (filePath) => {
  if (!filePath) return null;

  const normalized = String(filePath).replace(/\\/g, "/");

  if (path.isAbsolute(normalized) && fs.existsSync(normalized)) {
    return normalized;
  }

  const possiblePaths = [
    path.join(process.cwd(), normalized),
    path.join(process.cwd(), "public", normalized),
    path.join(process.cwd(), "uploads", normalized),
    path.join(process.cwd(), normalized.replace(/^uploads\//, "")),
  ];

  return possiblePaths.find((item) => fs.existsSync(item)) || null;
};

/* ===============================
CREATE FR.AK.04
POST /api/asesi/fr-ak04
=============================== */

exports.createFrAk04 = async (req, res) => {
  const transaction = await FrAk04.sequelize.transaction();

  try {
    const {
      id_peserta,
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding,
    } = req.body;

    if (!id_peserta) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib dikirim",
      });
    }

    const akses = await cekAksesFrAk04(req);

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

    const jawaban1 = normalizeJawaban(proses_banding_dijelaskan);
    const jawaban2 = normalizeJawaban(diskusi_dengan_asesor);
    const jawaban3 = normalizeJawaban(melibatkan_orang_lain);

    if (!jawaban1 || !jawaban2 || !jawaban3) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Semua pertanyaan Ya/Tidak wajib diisi",
      });
    }

    if (!alasan_banding || !String(alasan_banding).trim()) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Alasan banding wajib diisi",
      });
    }

    const existing = await FrAk04.findOne({
      where: {
        id_peserta: peserta.id_peserta,
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "FR.AK.04 sudah pernah diisi",
      });
    }

    const jadwal = peserta.jadwal || {};
    const profile = peserta.profileAsesi || {};

    const data = await FrAk04.create(
      {
        id_peserta: peserta.id_peserta,
        id_jadwal: peserta.id_jadwal,
        id_skema: jadwal.id_skema,
        id_tuk: jadwal.id_tuk,
        tanggal_asesmen: new Date(),
        proses_banding_dijelaskan: jawaban1,
        diskusi_dengan_asesor: jawaban2,
        melibatkan_orang_lain: jawaban3,
        alasan_banding: String(alasan_banding).trim(),
        ttd_asesi: profile.ttd_path || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    const detail = await findFrAk04Lengkap(data.id_peserta);

    return res.status(201).json({
      status: "success",
      message: "FR.AK.04 berhasil disimpan",
      data: buildFrAk04Response({
        data: detail,
        peserta,
        keputusan: akses.keputusan,
      }),
    });
  } catch (err) {
    await transaction.rollback();

    console.error("CREATE FR.AK.04 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal menyimpan FR.AK.04",
      error: err.message,
    });
  }
};

/* ===============================
GET FR.AK.04 BY PESERTA
GET /api/asesi/fr-ak04/:id_peserta
=============================== */

exports.getFrAk04ByPeserta = async (req, res) => {
  try {
    const akses = await cekAksesFrAk04(req);

    if (!akses.allowed) {
      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    if (Number(akses.peserta.id_peserta) !== Number(req.params.id_peserta)) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke data FR.AK.04 ini",
      });
    }

    const data = await findFrAk04Lengkap(req.params.id_peserta);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "FR.AK.04 belum diisi",
        data: buildFrAk04Response({
          data: null,
          peserta: akses.peserta,
          keputusan: akses.keputusan,
        }),
      });
    }

    return res.json({
      status: "success",
      message: "Data FR.AK.04 berhasil diambil",
      data: buildFrAk04Response({
        data,
        peserta: akses.peserta,
        keputusan: akses.keputusan,
      }),
    });
  } catch (err) {
    console.error("GET FR.AK.04 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data FR.AK.04",
      error: err.message,
    });
  }
};

/* ===============================
GENERATE PDF FR.AK.04
GET /api/asesi/fr-ak04/pdf/:id_peserta
=============================== */

exports.generatePdfFrAk04 = async (req, res) => {
  try {
    const akses = await cekAksesFrAk04(req);

    if (!akses.allowed) {
      return res.status(akses.statusCode).json({
        status: "error",
        message: akses.message,
      });
    }

    if (Number(akses.peserta.id_peserta) !== Number(req.params.id_peserta)) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke PDF FR.AK.04 ini",
      });
    }

    const data = await findFrAk04Lengkap(req.params.id_peserta);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Data FR.AK.04 tidak ditemukan",
      });
    }

    const plainData = toPlain(data);
    const peserta = plainData.peserta || {};
    const profile = peserta.profileAsesi || {};
    const jadwal = plainData.jadwal || {};
    const skema = jadwal.skema || plainData.skema || {};
    const tuk = jadwal.tuk || plainData.tuk || {};

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-AK-04-${req.params.id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
    });

    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("FR.AK.04 BANDING ASESMEN", {
        align: "center",
      });

    doc.moveDown();

    doc.fontSize(11).font("Helvetica");
    doc.text(`Nama Asesi : ${profile.nama_lengkap || "-"}`);
    doc.text(`NIK : ${profile.nik || "-"}`);
    doc.text(`Tanggal Asesmen : ${plainData.tanggal_asesmen || "-"}`);
    doc.text(`Skema : ${skema.judul_skema || skema.nama_skema || "-"}`);
    doc.text(`TUK : ${tuk.nama_tuk || tuk.nama || "-"}`);

    doc.moveDown();

    doc.font("Helvetica-Bold").text("Jawaban Asesi:");
    doc.moveDown(0.5);

    doc.font("Helvetica").text(
      `1. Proses banding telah dijelaskan kepada saya: ${String(
        plainData.proses_banding_dijelaskan || "-"
      ).toUpperCase()}`
    );

    doc.text(
      `2. Saya telah mendiskusikan banding dengan asesor: ${String(
        plainData.diskusi_dengan_asesor || "-"
      ).toUpperCase()}`
    );

    doc.text(
      `3. Saya ingin melibatkan orang lain dalam proses banding: ${String(
        plainData.melibatkan_orang_lain || "-"
      ).toUpperCase()}`
    );

    doc.moveDown();

    doc.font("Helvetica-Bold").text("Alasan Banding:");
    doc.font("Helvetica").text(plainData.alasan_banding || "-");

    doc.moveDown(2);

    doc.font("Helvetica-Bold").text("Tanda Tangan Asesi:");
    const ttdPath = resolveFilePath(plainData.ttd_asesi || profile.ttd_path);

    if (ttdPath) {
      try {
        doc.image(ttdPath, {
          width: 120,
        });
      } catch (imageErr) {
        doc.font("Helvetica").text("(TTD tidak dapat ditampilkan)");
      }
    } else {
      doc.font("Helvetica").text("-");
    }

    doc.end();
  } catch (err) {
    console.error("GENERATE PDF FR.AK.04 ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal generate PDF FR.AK.04",
      error: err.message,
    });
  }
};