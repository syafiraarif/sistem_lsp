const {
  Presensi,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  JadwalAsesor,
  ProfileAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

const toUrl = (req, filePath) => {
  if (!filePath) {
    return null;
  }

  if (String(filePath).startsWith("http")) {
    return filePath;
  }

  return `${getBaseUrl(req)}/${String(filePath).replace(/\\/g, "/")}`;
};

const normalizePath = (filePath) => {
  if (!filePath) {
    return null;
  }

  return String(filePath).replace(/\\/g, "/");
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const normalizeTime = (value) => {
  if (!value) {
    return "00:00:00";
  }

  const text = String(value);

  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) {
    return text;
  }

  if (/^\d{2}:\d{2}$/.test(text)) {
    return `${text}:00`;
  }

  return "00:00:00";
};

const buildMulaiPresensi = (jadwal) => {
  if (!jadwal) {
    return null;
  }

  const tanggalPraAsesmen = normalizeDate(jadwal.tgl_pra_asesmen);
  const tanggalAwal = normalizeDate(jadwal.tgl_awal);
  const tanggalBuka = tanggalPraAsesmen || tanggalAwal;

  if (!tanggalBuka) {
    return null;
  }

  const jamBuka = tanggalPraAsesmen ? "00:00:00" : normalizeTime(jadwal.jam);

  return new Date(`${tanggalBuka}T${jamBuka}`);
};

const buildSelesaiPresensi = (jadwal) => {
  if (!jadwal) {
    return null;
  }

  const tanggalPraAsesmen = normalizeDate(jadwal.tgl_pra_asesmen);
  const tanggalAkhir = normalizeDate(jadwal.tgl_akhir);
  const tanggalAwal = normalizeDate(jadwal.tgl_awal);
  const tanggalTutup = tanggalPraAsesmen || tanggalAkhir || tanggalAwal;

  if (!tanggalTutup) {
    return null;
  }

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
      waktu_tutup: "-"
    };
  }

  if (!["open", "ongoing"].includes(jadwal.status)) {
    return {
      allowed: false,
      message: "Jadwal belum aktif",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup:
        normalizeDate(
          jadwal.tgl_akhir ||
          jadwal.tgl_pra_asesmen ||
          jadwal.tgl_awal
        ) || "-"
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
      waktu_tutup: "-"
    };
  }

  if (now < mulai) {
    return {
      allowed: false,
      message: "Presensi belum dibuka karena belum masuk waktu pra asesmen/jadwal",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: selesai
    };
  }

  if (now > selesai) {
    return {
      allowed: false,
      message: "Presensi sudah ditutup karena jadwal sudah selesai",
      waktu_buka: getWaktuBukaLabel(jadwal),
      waktu_tutup: selesai
    };
  }

  return {
    allowed: true,
    message: "Presensi sudah dibuka",
    waktu_buka: getWaktuBukaLabel(jadwal),
    waktu_tutup: selesai
  };
};

const getPesertaByUser = async (id_user, id_skema = null) => {
  const whereJadwal = {};

  if (id_skema) {
    whereJadwal.id_skema = id_skema;
  }

  return PesertaJadwal.findOne({
    where: {
      id_user
    },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        where: whereJadwal,
        required: true,
        include: [
          {
            model: Skema,
            as: "skema"
          },
          {
            model: Tuk,
            as: "tuk"
          }
        ]
      },
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        attributes: [
          "id_user",
          "nama_lengkap",
          "nik",
          "ttd_path"
        ]
      }
    ],
    order: [["created_at", "DESC"]]
  });
};

const getPesertaById = async (id_peserta, id_user) => {
  return PesertaJadwal.findOne({
    where: {
      id_peserta,
      id_user
    },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        include: [
          {
            model: Skema,
            as: "skema"
          },
          {
            model: Tuk,
            as: "tuk"
          }
        ]
      },
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        attributes: [
          "id_user",
          "nama_lengkap",
          "nik",
          "ttd_path"
        ]
      }
    ]
  });
};

const getAsesorByJadwal = async (id_jadwal) => {
  if (!id_jadwal) {
    return [];
  }

  return JadwalAsesor.findAll({
    where: {
      id_jadwal,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    },
    include: [
      {
        model: ProfileAsesor,
        as: "profileAsesor"
      }
    ]
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
      ? "TTD belum tersedia di profile"
      : statusWaktu.message,
    skema_sertifikasi: {
      jenis: skema?.jenis_skema || skema?.jenis || "-",
      judul: skema?.judul_skema || skema?.nama_skema || "-",
      kode: skema?.kode_skema || skema?.kode || "-"
    },
    tuk: {
      jenis: tuk?.jenis_tuk || tuk?.jenis || "-",
      nama: tuk?.nama_tuk || tuk?.nama || "-",
      alamat: tuk?.alamat || "-"
    },
    jadwal_pelaksanaan: {
      hari_tanggal:
        jadwal?.tgl_pra_asesmen ||
        jadwal?.tgl_awal ||
        "-",
      tanggal_pra_asesmen:
        jadwal?.tgl_pra_asesmen || null,
      tanggal_mulai: jadwal?.tgl_awal || "-",
      tanggal_selesai: jadwal?.tgl_akhir || "-",
      jam: jadwal?.jam || "-",
      tempat: tuk?.nama_tuk || jadwal?.lokasi || "-",
      pelaksanaan_uji: jadwal?.pelaksanaan_uji || "-",
      status: jadwal?.status || "-"
    },
    presensi: presensi
      ? {
          id_presensi: presensi.id_presensi,
          id_peserta: presensi.id_peserta,
          ttd_asesi_path: presensi.ttd_asesi_path,
          ttd_asesi_url: toUrl(req, presensi.ttd_asesi_path),
          waktu_presensi: presensi.waktu_presensi
        }
      : null,
    asesor
  };
};

exports.getPraAsesmenForm = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = req.query.id_skema || null;
    const peserta = await getPesertaByUser(id_user, id_skema);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Data peserta jadwal tidak ditemukan"
      });
    }

    if (!peserta.jadwal) {
      return res.status(404).json({
        status: "error",
        message: "Jadwal peserta tidak ditemukan"
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta: peserta.id_peserta
      }
    });

    const data = await buildPresensiPayload(req, peserta, presensi);

    return res.json({
      status: "success",
      message: "Data pra asesmen berhasil diambil",
      data
    });
  } catch (err) {
    console.error("GET PRA ASESMEN FORM ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data pra asesmen",
      error: err.message
    });
  }
};

exports.submitPraAsesmen = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib dikirim"
      });
    }

    const peserta = await getPesertaById(id_peserta, id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    if (!peserta.jadwal) {
      return res.status(400).json({
        status: "error",
        message: "Jadwal tidak ditemukan"
      });
    }

    const profile = peserta.profileAsesi;

    if (!profile?.ttd_path) {
      return res.status(400).json({
        status: "error",
        message: "TTD belum tersedia di profile. Silakan upload TTD terlebih dahulu."
      });
    }

    const statusWaktu = cekStatusWaktuPresensi(peserta.jadwal);

    if (!statusWaktu.allowed) {
      return res.status(400).json({
        status: "error",
        message: statusWaktu.message,
        data: {
          waktu_buka_presensi: statusWaktu.waktu_buka,
          waktu_tutup_presensi: statusWaktu.waktu_tutup
        }
      });
    }

    const existing = await Presensi.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Kamu sudah presensi dan tidak bisa presensi dua kali.",
        data: existing
      });
    }

    const presensi = await Presensi.create({
      id_peserta,
      ttd_asesi_path: normalizePath(profile.ttd_path),
      waktu_presensi: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    await peserta.update({
      status_asesmen: "pra_asesmen"
    });

    return res.status(201).json({
      status: "success",
      message: "Presensi berhasil. TTD otomatis diambil dari profile.",
      data: presensi
    });
  } catch (err) {
    console.error("SUBMIT PRA ASESMEN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal submit pra asesmen",
      error: err.message
    });
  }
};

exports.downloadPraAsesmen = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = req.query.id_skema || null;
    const peserta = await getPesertaByUser(id_user, id_skema);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Data peserta tidak ditemukan"
      });
    }

    req.params.id_peserta = peserta.id_peserta;

    return exports.generatePdfPresensi(req, res);
  } catch (err) {
    console.error("DOWNLOAD PRA ASESMEN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal download PDF pra asesmen",
      error: err.message
    });
  }
};

exports.getStatusPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta
      }
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
        presensi
      }
    });
  } catch (err) {
    console.error("GET STATUS PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil status presensi",
      error: err.message
    });
  }
};

exports.getDetailPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta
      }
    });

    const data = await buildPresensiPayload(req, peserta, presensi);

    return res.json({
      status: "success",
      message: "Detail presensi berhasil diambil",
      data
    });
  } catch (err) {
    console.error("GET DETAIL PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail presensi",
      error: err.message
    });
  }
};

exports.createPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        status: "error",
        message: "id_peserta wajib diisi"
      });
    }

    req.body.id_peserta = id_peserta;

    return exports.submitPraAsesmen(req, res);
  } catch (err) {
    console.error("CREATE PRESENSI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal membuat presensi",
      error: err.message
    });
  }
};

exports.generatePdfPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const peserta = await getPesertaById(id_peserta, req.user.id_user);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    const presensi = await Presensi.findOne({
      where: {
        id_peserta
      }
    });

    if (!presensi) {
      return res.status(404).json({
        status: "error",
        message: "Presensi belum dilakukan"
      });
    }

    const profile = peserta.profileAsesi;
    const jadwal = peserta.jadwal;
    const skema = jadwal?.skema;
    const tuk = jadwal?.tuk;
    const asesorList = await getAsesorByJadwal(peserta.id_jadwal);

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const LEFT = 24;
    const RIGHT = 24;
    const TOP = 24;
    const BOTTOM = 28;
    const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: `Presensi Pra Asesmen - ${profile?.nama_lengkap || "Asesi"}`
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=presensi_pra_asesmen_${id_peserta}.pdf`
    );

    doc.pipe(res);

    const safe = (value) => {
      if (value === undefined || value === null || value === "") {
        return "-";
      }

      return String(value);
    };

    const formatTanggal = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    };

    const formatWaktu = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    };

    const normalizeFilePath = (value) => {
      if (!value) {
        return "";
      }

      const stringValue = String(value);

      if (path.isAbsolute(stringValue) && fs.existsSync(stringValue)) {
        return stringValue;
      }

      const cleaned = stringValue.replace(/^[/\\]+/, "");

      const candidates = [
        path.join(process.cwd(), cleaned),
        path.join(
          process.cwd(),
          "uploads",
          cleaned.replace(/^uploads[/\\]/, "")
        ),
        path.join(process.cwd(), "public", cleaned),
        path.join(__dirname, "../../../", cleaned)
      ];

      return candidates.find((filePath) => fs.existsSync(filePath)) || "";
    };

    const drawCell = (x, y, width, height, text = "", options = {}) => {
      const {
        fontSize = 7,
        bold = false,
        align = "left",
        valign = "center",
        padding = 5,
        fill = null
      } = options;

      if (fill) {
        doc.save()
          .fillColor(fill)
          .rect(x, y, width, height)
          .fill()
          .restore();
      }

      doc.save()
        .lineWidth(0.7)
        .strokeColor("#000000")
        .rect(x, y, width, height)
        .stroke()
        .restore();

      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor("#000000");

      const value = safe(text);
      const textWidth = Math.max(width - padding * 2, 6);
      const textHeight = doc.heightOfString(value, {
        width: textWidth,
        align,
        lineGap: 0
      });

      let textY = y + padding;

      if (valign === "center") {
        textY = y + Math.max(padding, (height - textHeight) / 2);
      }

      if (valign === "bottom") {
        textY = y + height - textHeight - padding;
      }

      doc.text(value, x + padding, textY, {
        width: textWidth,
        height: Math.max(height - padding * 2, 6),
        align,
        lineGap: 0
      });
    };

    const drawPageNumber = () => {
      const pageRange = doc.bufferedPageRange();

      if (!pageRange || pageRange.count <= 1) {
        return;
      }

      for (
        let pageIndex = pageRange.start;
        pageIndex < pageRange.start + pageRange.count;
        pageIndex += 1
      ) {
        doc.switchToPage(pageIndex);
        doc
          .font("Helvetica")
          .fontSize(6)
          .fillColor("#555555")
          .text(
            `Halaman ${pageIndex - pageRange.start + 1} dari ${pageRange.count}`,
            LEFT,
            PAGE_HEIGHT - 16,
            {
              width: CONTENT_WIDTH,
              align: "center",
              lineBreak: false
            }
          );
      }

      doc.fillColor("#000000");
    };

    const drawSignature = (value, x, y, width, height) => {
      const signaturePath = normalizeFilePath(value);

      if (!signaturePath) {
        return;
      }

      try {
        const imageWidth = Math.min(155, width - 16);
        const imageHeight = Math.min(60, height - 12);
        const imageX = x + (width - imageWidth) / 2;
        const imageY = y + (height - imageHeight) / 2;

        doc.image(signaturePath, imageX, imageY, {
          fit: [imageWidth, imageHeight],
          align: "center",
          valign: "center"
        });
      } catch (error) {
        return;
      }
    };

    const drawSectionTitle = (title, y) => {
      drawCell(
        LEFT,
        y,
        CONTENT_WIDTH,
        24,
        title,
        {
          bold: true,
          fontSize: 8,
          align: "center",
          fill: "#E5E7EB"
        }
      );

      return y + 24;
    };

    let currentY = TOP;

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(
        "PRESENSI PRA ASESMEN",
        LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 28;

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "DAFTAR HADIR PESERTA ASESMEN",
        LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 24;

    currentY = drawSectionTitle("DATA PESERTA DAN JADWAL", currentY);

    const labelWidth = 145;
    const separatorWidth = 18;
    const valueWidth = CONTENT_WIDTH - labelWidth - separatorWidth;

    const drawInfoRow = (label, value) => {
      const textHeight = doc.heightOfString(safe(value), {
        width: valueWidth - 10,
        fontSize: 6.8,
        lineGap: 0
      });

      const rowHeight = Math.max(24, textHeight + 10);

      drawCell(
        LEFT,
        currentY,
        labelWidth,
        rowHeight,
        label,
        {
          bold: true,
          fontSize: 6.8
        }
      );

      drawCell(
        LEFT + labelWidth,
        currentY,
        separatorWidth,
        rowHeight,
        ":",
        {
          bold: true,
          align: "center",
          fontSize: 6.8
        }
      );

      drawCell(
        LEFT + labelWidth + separatorWidth,
        currentY,
        valueWidth,
        rowHeight,
        value,
        {
          fontSize: 6.8
        }
      );

      currentY += rowHeight;
    };

    drawInfoRow(
      "Nama Asesi",
      profile?.nama_lengkap || "-"
    );

    drawInfoRow(
      "NIK",
      profile?.nik || "-"
    );

    drawInfoRow(
      "Jenis Skema",
      skema?.jenis_skema || skema?.jenis || "-"
    );

    drawInfoRow(
      "Judul Skema",
      skema?.judul_skema || skema?.nama_skema || "-"
    );

    drawInfoRow(
      "Kode Skema",
      skema?.kode_skema || skema?.kode || "-"
    );

    drawInfoRow(
      "Jenis TUK",
      tuk?.jenis_tuk || tuk?.jenis || "-"
    );

    drawInfoRow(
      "Nama TUK",
      tuk?.nama_tuk || tuk?.nama || "-"
    );

    drawInfoRow(
      "Alamat TUK",
      tuk?.alamat || "-"
    );

    drawInfoRow(
      "Tanggal Pra Asesmen",
      formatTanggal(
        jadwal?.tgl_pra_asesmen ||
        jadwal?.tgl_awal
      )
    );

    drawInfoRow(
      "Tanggal Pelaksanaan",
      `${formatTanggal(jadwal?.tgl_awal)} - ${formatTanggal(jadwal?.tgl_akhir)}`
    );

    drawInfoRow(
      "Jam",
      jadwal?.jam || "-"
    );

    drawInfoRow(
      "Tempat",
      tuk?.nama_tuk || jadwal?.lokasi || "-"
    );

    drawInfoRow(
      "Pelaksanaan Uji",
      jadwal?.pelaksanaan_uji || "-"
    );

    drawInfoRow(
      "Status Jadwal",
      jadwal?.status || "-"
    );

    currentY += 12;

    if (currentY + 180 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("INFORMASI PRESENSI", currentY);

    const presensiRows = [
      ["Status Presensi", "HADIR"],
      ["Waktu Presensi", formatWaktu(presensi.waktu_presensi)],
      ["Keterangan", "Presensi pra asesmen berhasil tercatat"],
      ["Tanda Tangan", presensi.ttd_asesi_path ? "Tersedia" : "Tidak tersedia"]
    ];

    presensiRows.forEach(([label, value]) => {
      drawCell(
        LEFT,
        currentY,
        labelWidth,
        26,
        label,
        {
          bold: true,
          fontSize: 6.8
        }
      );

      drawCell(
        LEFT + labelWidth,
        currentY,
        CONTENT_WIDTH - labelWidth,
        26,
        value,
        {
          fontSize: 6.8
        }
      );

      currentY += 26;
    });

    currentY += 12;

    if (currentY + 170 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("TANDA TANGAN ASESII", currentY);

    const signatureHalf = CONTENT_WIDTH / 2;
    const signatureHeaderHeight = 25;
    const signatureBodyHeight = 110;

    drawCell(
      LEFT,
      currentY,
      signatureHalf,
      signatureHeaderHeight,
      "Nama Asesi",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + signatureHalf,
      currentY,
      signatureHalf,
      signatureHeaderHeight,
      "Tanda Tangan dan Waktu",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    currentY += signatureHeaderHeight;

    drawCell(
      LEFT,
      currentY,
      signatureHalf,
      signatureBodyHeight,
      profile?.nama_lengkap || "-",
      {
        bold: true,
        align: "center",
        valign: "center",
        fontSize: 7.5
      }
    );

    drawCell(
      LEFT + signatureHalf,
      currentY,
      signatureHalf,
      signatureBodyHeight,
      "",
      {
        padding: 0
      }
    );

    drawSignature(
      presensi.ttd_asesi_path || profile?.ttd_path,
      LEFT + signatureHalf + 10,
      currentY + 8,
      signatureHalf - 20,
      62
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        formatWaktu(presensi.waktu_presensi),
        LEFT + signatureHalf + 8,
        currentY + 84,
        {
          width: signatureHalf - 16,
          align: "center",
          lineBreak: false
        }
      );

    currentY += signatureBodyHeight + 12;

    if (asesorList.length > 0) {
      if (currentY + 120 > PAGE_HEIGHT - BOTTOM) {
        doc.addPage();
        currentY = TOP;
      }

      currentY = drawSectionTitle("ASESOR PENGUJI", currentY);

      const asesorRows = asesorList.map((item) => ({
        nama: item.profileAsesor?.nama_lengkap || "-",
        nomor:
          item.profileAsesor?.no_reg_asesor ||
          item.profileAsesor?.no_lisensi ||
          "-"
      }));

      const asesorHeaderHeight = 25;
      const asesorRowHeight = 32;
      const asesorNoWidth = 35;
      const asesorNamaWidth = CONTENT_WIDTH - asesorNoWidth - 125;
      const asesorRegWidth = 125;

      drawCell(
        LEFT,
        currentY,
        asesorNoWidth,
        asesorHeaderHeight,
        "No.",
        {
          bold: true,
          align: "center",
          fontSize: 6.5
        }
      );

      drawCell(
        LEFT + asesorNoWidth,
        currentY,
        asesorNamaWidth,
        asesorHeaderHeight,
        "Nama Asesor",
        {
          bold: true,
          align: "center",
          fontSize: 6.5
        }
      );

      drawCell(
        LEFT + asesorNoWidth + asesorNamaWidth,
        currentY,
        asesorRegWidth,
        asesorHeaderHeight,
        "No. Reg / Lisensi",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      currentY += asesorHeaderHeight;

      asesorRows.forEach((item, index) => {
        drawCell(
          LEFT,
          currentY,
          asesorNoWidth,
          asesorRowHeight,
          String(index + 1),
          {
            align: "center",
            fontSize: 6.5
          }
        );

        drawCell(
          LEFT + asesorNoWidth,
          currentY,
          asesorNamaWidth,
          asesorRowHeight,
          item.nama,
          {
            fontSize: 6.5
          }
        );

        drawCell(
          LEFT + asesorNoWidth + asesorNamaWidth,
          currentY,
          asesorRegWidth,
          asesorRowHeight,
          item.nomor,
          {
            align: "center",
            fontSize: 6.2
          }
        );

        currentY += asesorRowHeight;
      });

      currentY += 12;
    }

    if (currentY + 70 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("PENGESAHAN PRESENSI", currentY);

    const approvalRows = [
      ["Nama Asesi", profile?.nama_lengkap || "-"],
      ["Status", "Hadir"],
      ["Waktu Presensi", formatWaktu(presensi.waktu_presensi)],
      ["Dokumen", "Presensi Pra Asesmen"]
    ];

    approvalRows.forEach(([label, value]) => {
      drawCell(
        LEFT,
        currentY,
        labelWidth,
        24,
        label,
        {
          bold: true,
          fontSize: 6.6
        }
      );

      drawCell(
        LEFT + labelWidth,
        currentY,
        CONTENT_WIDTH - labelWidth,
        24,
        value,
        {
          fontSize: 6.6
        }
      );

      currentY += 24;
    });

    drawPageNumber();
    doc.end();
  } catch (err) {
    console.error("PDF PRESENSI ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        message: "Gagal membuat PDF presensi",
        error: err.message
      });
    }
  }
};