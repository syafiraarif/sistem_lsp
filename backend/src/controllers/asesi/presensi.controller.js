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

/* =========================
HELPER
========================= */

const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

const toUrl = (req, filePath) => {
  if (!filePath) return null;
  if (String(filePath).startsWith("http")) return filePath;

  return `${getBaseUrl(req)}/${String(filePath).replace(/\\/g, "/")}`;
};

const normalizePath = (filePath) => {
  if (!filePath) return null;
  return String(filePath).replace(/\\/g, "/");
};

const normalizeDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const normalizeTime = (value) => {
  if (!value) return "00:00:00";

  const text = String(value);

  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text;
  if (/^\d{2}:\d{2}$/.test(text)) return `${text}:00`;

  return "00:00:00";
};

const buildMulaiPresensi = (jadwal) => {
  if (!jadwal) return null;

  const tanggalPraAsesmen = normalizeDate(jadwal.tgl_pra_asesmen);
  const tanggalAwal = normalizeDate(jadwal.tgl_awal);

  const tanggalBuka = tanggalPraAsesmen || tanggalAwal;

  if (!tanggalBuka) return null;

  const jamBuka = tanggalPraAsesmen ? "00:00:00" : normalizeTime(jadwal.jam);

  return new Date(`${tanggalBuka}T${jamBuka}`);
};

const buildSelesaiPresensi = (jadwal) => {
  if (!jadwal) return null;

  const tanggalPraAsesmen = normalizeDate(jadwal.tgl_pra_asesmen);
  const tanggalAkhir = normalizeDate(jadwal.tgl_akhir);
  const tanggalAwal = normalizeDate(jadwal.tgl_awal);

  const tanggalTutup = tanggalPraAsesmen || tanggalAkhir || tanggalAwal;

  if (!tanggalTutup) return null;

  return new Date(`${tanggalTutup}T23:59:59`);
};

const getWaktuBukaLabel = (jadwal) => {
  const tanggalPraAsesmen = normalizeDate(jadwal?.tgl_pra_asesmen);
  const tanggalAwal = normalizeDate(jadwal?.tgl_awal);
  const jam = normalizeTime(jadwal?.jam);

  if (tanggalPraAsesmen) {
    return `${tanggalPraAsesmen} 00:00:00`;
  }

  if (tanggalAwal) {
    return `${tanggalAwal} ${jam}`;
  }

  return "-";
};

const cekStatusWaktuPresensi = (jadwal) => {
  if (!jadwal) {
    return {
      allowed: false,
      message: "Jadwal tidak ditemukan",
      waktu_buka: "-",
      waktu_tutup: "-",
    };
  }

  if (!["open", "ongoing"].includes(jadwal.status)) {
    return {
      allowed: false,
      message: "Jadwal belum aktif",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: normalizeDate(jadwal.tgl_akhir || jadwal.tgl_pra_asesmen || jadwal.tgl_awal) || "-",
    };
  }

  const mulai = buildMulaiPresensi(jadwal);
  const selesai = buildSelesaiPresensi(jadwal);
  const now = new Date();

  if (!mulai || !selesai) {
    return {
      allowed: false,
      message: "Tanggal pra asesmen atau tanggal jadwal belum lengkap",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: "-",
    };
  }

  if (now < mulai) {
    return {
      allowed: false,
      message: "Presensi belum dibuka karena belum masuk waktu pra asesmen/jadwal",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: selesai,
    };
  }

  if (now > selesai) {
    return {
      allowed: false,
      message: "Presensi sudah ditutup karena jadwal sudah selesai",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: selesai,
    };
  }

  return {
    allowed: true,
    message: "Presensi sudah dibuka",
    waktu_buka: getWaktuBukaLabel(jadwal),
    waktu_tutup: selesai,
  };
};

const getPesertaByUser = async (id_user, id_skema = null) => {
  const jadwalInclude = {
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
  };

  if (id_skema) {
    jadwalInclude.where = {
      id_skema,
    };
    jadwalInclude.required = true;
  }

  return PesertaJadwal.findOne({
    where: {
      id_user,
    },
    include: [
      jadwalInclude,
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        attributes: ["id_user", "nama_lengkap", "nik", "ttd_path"],
      },
    ],
    order: [["id_peserta", "DESC"]],
  });
};

const getPesertaById = async (id_peserta, id_user) => {
  return PesertaJadwal.findOne({
    where: {
      id_peserta,
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
        attributes: ["id_user", "nama_lengkap", "nik", "ttd_path"],
      },
    ],
  });
};

const getAsesorByJadwal = async (id_jadwal) => {
  if (!id_jadwal) return [];

  return JadwalAsesor.findAll({
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

const buildPresensiPayload = async (req, peserta, presensi = null) => {
  const asesor = await getAsesorByJadwal(peserta.id_jadwal);
  const profile = peserta.profileAsesi;
  const jadwal = peserta.jadwal;
  const skema = jadwal?.skema;
  const tuk = jadwal?.tuk;

  const statusWaktu = cekStatusWaktuPresensi(jadwal);
  const ttdPath = profile?.ttd_path || null;

  const namaAsesor =
    asesor
      .map((item) => item.profileAsesor?.nama_lengkap)
      .filter(Boolean)
      .join(", ") || "-";

  return {
    id_peserta: peserta.id_peserta,
    id_jadwal: peserta.id_jadwal,
    id_skema: jadwal?.id_skema || null,

    nama_asesi: profile?.nama_lengkap || "-",
    nik_asesi: profile?.nik || "-",
    nama_asesor: namaAsesor,

    ttd_asesi_ready: Boolean(ttdPath),
    ttd_asesi_path: ttdPath,
    ttd_asesi_url: toUrl(req, ttdPath),

    is_submitted: Boolean(presensi),
    can_submit: Boolean(ttdPath) && !presensi && statusWaktu.allowed,

    waktu_buka_presensi: statusWaktu.waktu_buka,
    waktu_tutup_presensi: statusWaktu.waktu_tutup,

    message: presensi
      ? "Presensi pra asesmen sudah tercatat"
      : !ttdPath
      ? "TTD belum tersedia di profile asesi"
      : statusWaktu.message,

    skema_sertifikasi: {
      jenis: skema?.jenis_skema || skema?.jenis || "-",
      judul: skema?.judul_skema || skema?.nama_skema || "-",
      kode: skema?.kode_skema || skema?.kode || "-",
    },

    tuk: {
      jenis: tuk?.jenis_tuk || tuk?.jenis || "-",
      nama: tuk?.nama_tuk || tuk?.nama || "-",
      alamat: tuk?.alamat || "-",
    },

    jadwal_pelaksanaan: {
      hari_tanggal: jadwal?.tgl_pra_asesmen || jadwal?.tgl_awal || "-",
      tanggal_pra_asesmen: jadwal?.tgl_pra_asesmen || null,
      tanggal_mulai: jadwal?.tgl_awal || "-",
      tanggal_selesai: jadwal?.tgl_akhir || "-",
      jam: jadwal?.jam || "-",
      tempat: tuk?.nama_tuk || jadwal?.lokasi || "-",
      pelaksanaan_uji: jadwal?.pelaksanaan_uji || "-",
      status: jadwal?.status || "-",
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
  };
};

/* =========================
GET PRA ASESMEN FORM
GET /api/asesi/pra-asesmen/form?id_skema=...
========================= */

exports.getPraAsesmenForm = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = req.query.id_skema || null;

    const peserta = await getPesertaByUser(id_user, id_skema);

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

    const data = await buildPresensiPayload(req, peserta, presensi);

    return res.json({
      status: "success",
      message: "Data pra asesmen berhasil diambil",
      data,
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
POST /api/asesi/pra-asesmen/submit
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

    const peserta = await getPesertaById(id_peserta, id_user);

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
        message: "TTD belum tersedia di profile. Silakan upload TTD terlebih dahulu.",
      });
    }

    const statusWaktu = cekStatusWaktuPresensi(peserta.jadwal);

    if (!statusWaktu.allowed) {
      return res.status(400).json({
        status: "error",
        message: statusWaktu.message,
        data: {
          waktu_buka_presensi: statusWaktu.waktu_buka,
          waktu_tutup_presensi: statusWaktu.waktu_tutup,
        },
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
        message: "Kamu sudah presensi dan tidak bisa presensi dua kali.",
        data: existing,
      });
    }

    const presensi = await Presensi.create({
      id_peserta,
      ttd_asesi_path: normalizePath(profile.ttd_path),
      waktu_presensi: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await peserta.update({
      status_asesmen: "pra_asesmen",
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
DOWNLOAD PRA ASESMEN
GET /api/asesi/pra-asesmen/download?id_skema=...
========================= */

exports.downloadPraAsesmen = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = req.query.id_skema || null;

    const peserta = await getPesertaByUser(id_user, id_skema);

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

/* =========================
GET STATUS PRESENSI
GET /api/asesi/presensi/status/:id_peserta
========================= */

exports.getStatusPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta,
      },
    });

    const statusWaktu = cekStatusWaktuPresensi(peserta.jadwal);

    return res.json({
      status: "success",
      message: "Status presensi berhasil diambil",
      data: {
        id_peserta,
        is_submitted: Boolean(presensi),
        can_submit:
          Boolean(peserta.profileAsesi?.ttd_path) &&
          !presensi &&
          statusWaktu.allowed,
        message: presensi
          ? "Sudah presensi"
          : !peserta.profileAsesi?.ttd_path
          ? "TTD belum tersedia"
          : statusWaktu.message,
        waktu_buka_presensi: statusWaktu.waktu_buka,
        waktu_tutup_presensi: statusWaktu.waktu_tutup,
        presensi,
      },
    });
  } catch (err) {
    console.error("GET STATUS PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil status presensi",
      error: err.message,
    });
  }
};

/* =========================
GET DETAIL PRESENSI
GET /api/asesi/presensi/detail/:id_peserta
========================= */

exports.getDetailPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta,
      },
    });

    const data = await buildPresensiPayload(req, peserta, presensi);

    return res.json({
      status: "success",
      message: "Detail presensi berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("GET DETAIL PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail presensi",
      error: err.message,
    });
  }
};

/* =========================
CREATE PRESENSI MANUAL
POST /api/asesi/presensi
========================= */

exports.createPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib diisi",
      });
    }

    req.body.id_peserta = id_peserta;

    return exports.submitPraAsesmen(req, res);
  } catch (err) {
    console.error("CREATE PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal membuat presensi",
      error: err.message,
    });
  }
};

/* =========================
PDF PRESENSI
GET /api/asesi/presensi/pdf/:id_peserta
========================= */

exports.generatePdfPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta,
      },
    });

    if (!presensi) {
      return res.status(404).json({
        status: "error",
        message: "Presensi belum dilakukan",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=presensi_pra_asesmen_${id_peserta}.pdf`
    );

    doc.pipe(res);

    const profile = peserta.profileAsesi;
    const jadwal = peserta.jadwal;
    const skema = jadwal?.skema;
    const tuk = jadwal?.tuk;

    doc.fontSize(16).font("Helvetica-Bold").text("PRESENSI PRA ASESMEN", {
      align: "center",
    });

    doc.moveDown(1);

    doc.fontSize(11).font("Helvetica");

    doc.text(`Nama Asesi : ${profile?.nama_lengkap || "-"}`);
    doc.text(`NIK        : ${profile?.nik || "-"}`);
    doc.text(`Skema      : ${skema?.judul_skema || skema?.nama_skema || "-"}`);
    doc.text(`Kode Skema : ${skema?.kode_skema || "-"}`);
    doc.text(`TUK        : ${tuk?.nama_tuk || tuk?.nama || "-"}`);
    doc.text(`Tanggal    : ${jadwal?.tgl_pra_asesmen || jadwal?.tgl_awal || "-"}`);
    doc.text(`Jam        : ${jadwal?.jam || "-"}`);
    doc.text(`Waktu Presensi : ${presensi.waktu_presensi || "-"}`);

    doc.moveDown(2);

    doc.font("Helvetica-Bold").text("Tanda Tangan Asesi:");
    doc.moveDown(1);

    if (presensi.ttd_asesi_path) {
      try {
        doc.image(presensi.ttd_asesi_path, {
          width: 130,
        });
      } catch (err) {
        doc.font("Helvetica").text("(File TTD tidak ditemukan)");
      }
    } else {
      doc.font("Helvetica").text("-");
    }

    doc.moveDown(1);
    doc.font("Helvetica").text(profile?.nama_lengkap || "-", {
      underline: true,
    });

    doc.end();
  } catch (err) {
    console.error("PDF PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal membuat PDF presensi",
      error: err.message,
    });
  }
};