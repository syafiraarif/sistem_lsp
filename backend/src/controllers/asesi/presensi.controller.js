const {
  Presensi,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  JadwalAsesor,
  ProfileAsesor,
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* =========================
HELPER
========================= */

const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

const toUrl = (req, filePath) => {
  if (!filePath) return null;
  if (String(filePath).startsWith("http")) return filePath;

  const base = getBaseUrl(req);
  return `${base}/${String(filePath).replace(/\\/g, "/")}`;
};

const normalizePath = (filePath) => {
  if (!filePath) return null;
  return String(filePath).replace(/\\/g, "/");
};

const normalizeDate = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return dateValue.toISOString().slice(0, 10);
  }

  return String(dateValue).slice(0, 10);
};

const normalizeTime = (timeValue) => {
  if (!timeValue) return "00:00:00";

  const text = String(timeValue);

  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text;
  if (/^\d{2}:\d{2}$/.test(text)) return `${text}:00`;

  return "00:00:00";
};

const buildMulaiJadwal = (jadwal) => {
  const tanggal = normalizeDate(jadwal?.tgl_awal);
  const jam = normalizeTime(jadwal?.jam);

  if (!tanggal) return null;

  return new Date(`${tanggal}T${jam}`);
};

const buildSelesaiJadwal = (jadwal) => {
  const tanggal = normalizeDate(jadwal?.tgl_akhir || jadwal?.tgl_awal);

  if (!tanggal) return null;

  return new Date(`${tanggal}T23:59:59`);
};

const isJadwalAktifUntukPresensi = (jadwal) => {
  if (!jadwal) {
    return {
      allowed: false,
      message: "Jadwal tidak ditemukan",
    };
  }

  if (!["open", "ongoing"].includes(jadwal.status)) {
    return {
      allowed: false,
      message: "Jadwal belum aktif",
    };
  }

  const now = new Date();
  const mulai = buildMulaiJadwal(jadwal);
  const selesai = buildSelesaiJadwal(jadwal);

  if (!mulai || !selesai) {
    return {
      allowed: false,
      message: "Tanggal atau jam jadwal belum lengkap",
    };
  }

  if (now < mulai) {
    return {
      allowed: false,
      message: "Presensi belum dibuka karena jadwal belum dimulai",
    };
  }

  if (now > selesai) {
    return {
      allowed: false,
      message: "Presensi sudah ditutup karena jadwal sudah selesai",
    };
  }

  return {
    allowed: true,
    message: "Presensi sudah dibuka",
  };
};

const findPesertaAktifByUser = async (id_user) => {
  return await PesertaJadwal.findOne({
    where: {
      id_user,
    },
    include: [
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
        model: ProfileAsesi,
        as: "profileAsesi",
        attributes: ["id_user", "nama_lengkap", "ttd_path"],
      },
    ],
    order: [["id_peserta", "DESC"]],
  });
};

const getAsesorByJadwal = async (id_jadwal) => {
  if (!id_jadwal) return [];

  return await JadwalAsesor.findAll({
    where: {
      id_jadwal,
      jenis_tugas: "asesor_penguji",
      status: "aktif",
    },
    include: [
      {
        model: ProfileAsesor,
        as: "profileAsesor",
      },
    ],
  });
};

/* =========================
PRA ASESMEN FORM
endpoint:
GET /api/asesi/pra-asesmen/form
========================= */

exports.getPraAsesmenForm = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const peserta = await findPesertaAktifByUser(id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Data peserta jadwal tidak ditemukan",
      });
    }

    if (!peserta.jadwal) {
      return res.status(404).json({
        status: "error",
        message: "Jadwal peserta tidak ditemukan",
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta: peserta.id_peserta,
      },
    });

    const asesor = await getAsesorByJadwal(peserta.id_jadwal);

    const profile = peserta.profileAsesi;
    const ttdPath = profile?.ttd_path || null;
    const statusJadwal = isJadwalAktifUntukPresensi(peserta.jadwal);

    const namaAsesor =
      asesor
        .map((item) => item.profileAsesor?.nama_lengkap)
        .filter(Boolean)
        .join(", ") || "-";

    return res.json({
      status: "success",
      message: "Data pra asesmen berhasil diambil",
      data: {
        id_peserta: peserta.id_peserta,
        id_jadwal: peserta.id_jadwal,
        id_skema: peserta.jadwal.id_skema,

        nama_asesi: profile?.nama_lengkap || "-",
        nama_asesor: namaAsesor,

        ttd_asesi_ready: Boolean(ttdPath),
        ttd_asesi_path: ttdPath,
        ttd_asesi_url: toUrl(req, ttdPath),

        is_submitted: Boolean(presensi),
        can_submit: Boolean(ttdPath) && !presensi && statusJadwal.allowed,

        message: presensi
          ? "Presensi pra asesmen sudah tercatat"
          : !ttdPath
          ? "TTD belum tersedia di profile asesi"
          : statusJadwal.message,

        skema_sertifikasi: {
          jenis:
            peserta.jadwal.skema?.jenis_skema ||
            peserta.jadwal.skema?.jenis ||
            "-",
          judul:
            peserta.jadwal.skema?.judul_skema ||
            peserta.jadwal.skema?.nama_skema ||
            "-",
          kode:
            peserta.jadwal.skema?.kode_skema ||
            peserta.jadwal.skema?.kode ||
            "-",
        },

        tuk: {
          jenis:
            peserta.jadwal.tuk?.jenis_tuk ||
            peserta.jadwal.tuk?.jenis ||
            "-",
          nama:
            peserta.jadwal.tuk?.nama_tuk ||
            peserta.jadwal.tuk?.nama ||
            "-",
          alamat: peserta.jadwal.tuk?.alamat || "-",
        },

        jadwal_pelaksanaan: {
          hari_tanggal: peserta.jadwal.tgl_awal || "-",
          tanggal_mulai: peserta.jadwal.tgl_awal || "-",
          tanggal_selesai: peserta.jadwal.tgl_akhir || "-",
          jam: peserta.jadwal.jam || "-",
          tempat:
            peserta.jadwal.tuk?.nama_tuk || peserta.jadwal.lokasi || "-",
          pelaksanaan_uji:
            peserta.jadwal.pelaksanaan_uji ||
            peserta.jadwal.jenis_pelaksanaan ||
            "-",
          status: peserta.jadwal.status,
        },

        presensi: presensi
          ? {
              id_presensi: presensi.id_presensi,
              id_peserta: presensi.id_peserta,
              ttd_asesi_path: presensi.ttd_asesi_path,
              ttd_asesi_url: toUrl(req, presensi.ttd_asesi_path),
              waktu_presensi: presensi.waktu_presensi,
            }
          : null,

        asesor,
      },
    });
  } catch (err) {
    console.error("GET PRA ASESMEN FORM ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data pra asesmen",
      error: err.message,
    });
  }
};

/* =========================
SUBMIT PRA ASESMEN
endpoint:
POST /api/asesi/pra-asesmen/submit
TTD otomatis dari profile_asesi.ttd_path
========================= */

exports.submitPraAsesmen = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib dikirim",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user,
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
        },
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          attributes: ["id_user", "nama_lengkap", "ttd_path"],
        },
      ],
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    if (!peserta.jadwal) {
      return res.status(400).json({
        status: "error",
        message: "Jadwal tidak ditemukan",
      });
    }

    const profile = peserta.profileAsesi;

    if (!profile?.ttd_path) {
      return res.status(400).json({
        status: "error",
        message:
          "TTD belum tersedia di profile. Silakan upload TTD terlebih dahulu.",
      });
    }

    const statusJadwal = isJadwalAktifUntukPresensi(peserta.jadwal);

    if (!statusJadwal.allowed) {
      return res.status(400).json({
        status: "error",
        message: statusJadwal.message,
      });
    }

    const existing = await Presensi.findOne({
      where: {
        id_peserta,
      },
    });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Kamu sudah presensi",
        data: existing,
      });
    }

    const presensi = await Presensi.create({
      id_peserta,
      ttd_asesi_path: normalizePath(profile.ttd_path),
      waktu_presensi: new Date(),
    });

    return res.status(201).json({
      status: "success",
      message: "Presensi berhasil. TTD otomatis diambil dari profile.",
      data: presensi,
    });
  } catch (err) {
    console.error("SUBMIT PRA ASESMEN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal submit pra asesmen",
      error: err.message,
    });
  }
};

/* =========================
DOWNLOAD PDF PRA ASESMEN
endpoint:
GET /api/asesi/pra-asesmen/download
========================= */

exports.downloadPraAsesmen = async (req, res) => {
  try {
    const peserta = await findPesertaAktifByUser(req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Data peserta tidak ditemukan",
      });
    }

    req.params.id_peserta = peserta.id_peserta;

    return exports.generatePdfPresensi(req, res);
  } catch (err) {
    console.error("DOWNLOAD PRA ASESMEN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal download PDF pra asesmen",
      error: err.message,
    });
  }
};

/*
=====================================
CREATE PRESENSI MANUAL
route:
POST /api/asesi/presensi
Bisa upload TTD, tapi kalau tidak upload akan ambil dari profile.
=====================================
*/

exports.createPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        message: "id_peserta wajib diisi",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user,
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
        },
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          attributes: ["id_user", "nama_lengkap", "ttd_path"],
        },
      ],
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan",
      });
    }

    if (!peserta.jadwal) {
      return res.status(400).json({
        message: "Jadwal tidak ditemukan",
      });
    }

    const statusJadwal = isJadwalAktifUntukPresensi(peserta.jadwal);

    if (!statusJadwal.allowed) {
      return res.status(400).json({
        message: statusJadwal.message,
      });
    }

    const existing = await Presensi.findOne({
      where: {
        id_peserta,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Sudah presensi",
      });
    }

    const file = req.files?.ttd_presensi?.[0];

    const ttdPath = file
      ? normalizePath(file.path)
      : normalizePath(peserta.profileAsesi?.ttd_path);

    if (!ttdPath) {
      return res.status(400).json({
        message:
          "TTD belum tersedia. Upload TTD atau lengkapi TTD di profile.",
      });
    }

    const presensi = await Presensi.create({
      id_peserta,
      ttd_asesi_path: ttdPath,
      waktu_presensi: new Date(),
    });

    return res.status(201).json({
      message: "Presensi berhasil",
      status: "hadir",
      data: presensi,
    });
  } catch (err) {
    console.error("CREATE PRESENSI ERROR:", err);

    return res.status(500).json({
      message: "Gagal presensi",
      error: err.message,
    });
  }
};

/*
=====================================
STATUS PRESENSI
=====================================
*/

exports.getStatusPresensi = async (req, res) => {
  try {
    const presensi = await Presensi.findOne({
      where: {
        id_peserta: req.params.id_peserta,
      },
    });

    return res.json({
      status: presensi ? "hadir" : "belum_presensi",
      data: presensi || null,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

/*
=====================================
DETAIL PRESENSI
=====================================
*/

exports.getDetailPresensi = async (req, res) => {
  try {
    const data = await Presensi.findOne({
      where: {
        id_peserta: req.params.id_peserta,
      },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
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
              model: ProfileAsesi,
              as: "profileAsesi",
              attributes: ["id_user", "nama_lengkap", "ttd_path"],
            },
          ],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        message: "Belum presensi",
      });
    }

    const asesor = await getAsesorByJadwal(data.peserta.id_jadwal);

    data.dataValues.ttd_url = toUrl(req, data.ttd_asesi_path);

    return res.json({
      status: "hadir",
      data,
      asesor,
    });
  } catch (err) {
    console.error("GET DETAIL PRESENSI ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

/*
=====================================
GENERATE PDF PRESENSI
=====================================
*/

exports.generatePdfPresensi = async (req, res) => {
  try {
    const data = await Presensi.findOne({
      where: {
        id_peserta: req.params.id_peserta,
      },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
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
              model: ProfileAsesi,
              as: "profileAsesi",
            },
          ],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        message: "Belum presensi",
      });
    }

    const asesor = await getAsesorByJadwal(data.peserta.id_jadwal);

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=presensi-${req.params.id_peserta}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("FORM PRESENSI ASESMEN", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(
      `Nama Peserta : ${data.peserta.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(`Skema : ${data.peserta.jadwal?.skema?.judul_skema || "-"}`);

    doc.text(`TUK : ${data.peserta.jadwal?.tuk?.nama_tuk || "-"}`);

    doc.text(
      `Tanggal Presensi : ${new Date(
        data.waktu_presensi
      ).toLocaleString("id-ID")}`
    );

    doc.moveDown();

    doc.text("Asesor Penguji:");

    asesor.forEach((a, i) => {
      doc.text(`${i + 1}. ${a.profileAsesor?.nama_lengkap || "-"}`);
    });

    doc.moveDown(2);

    const ttd = path.join(process.cwd(), data.ttd_asesi_path || "");

    if (data.ttd_asesi_path && fs.existsSync(ttd)) {
      doc.image(ttd, 420, doc.y, {
        width: 100,
      });
    }

    doc.moveDown(4);

    doc.text("Asesi", {
      align: "right",
    });

    doc.end();
  } catch (err) {
    console.error("GENERATE PDF PRESENSI ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};