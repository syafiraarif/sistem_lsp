const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const {
  FrAk04,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor
} = require("../../models");

const getCurrentUserId = (req) => Number(req.user?.id_user || req.user?.id);

const getAsesorByJadwal = async (id_jadwal) => {
  if (!id_jadwal) {
    return null;
  }

  const jadwalAsesor = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    }
  });

  if (!jadwalAsesor) {
    return null;
  }

  const idAsesor = jadwalAsesor.id_asesor || jadwalAsesor.id_user;

  if (!idAsesor) {
    return null;
  }

  return ProfileAsesor.findByPk(idAsesor);
};

const getPesertaContext = async (id_peserta, id_user) => {
  const peserta = await PesertaJadwal.findOne({
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
        as: "profileAsesi"
      }
    ]
  });

  if (!peserta) {
    return null;
  }

  let asesor = null;

  if (peserta.id_asesor) {
    asesor = await ProfileAsesor.findByPk(
      peserta.id_asesor
    );
  }

  if (!asesor) {
    asesor = await getAsesorByJadwal(
      peserta.id_jadwal
    );
  }

  return {
    peserta,
    asesor
  };
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

const normalizeFilePath = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (
    path.isAbsolute(stringValue) &&
    fs.existsSync(stringValue)
  ) {
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
    path.join(
      process.cwd(),
      "public",
      cleaned
    ),
    path.join(
      __dirname,
      "../../../",
      cleaned
    )
  ];

  return candidates.find((filePath) => fs.existsSync(filePath)) || "";
};

const safeText = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }

  return String(value);
};

exports.createFrAk04 = async (req, res) => {
  try {
    const id_user = getCurrentUserId(req);
    const id_peserta = Number(req.body.id_peserta);
    const {
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding
    } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi."
      });
    }

    const jawabanValid =
      ["ya", "tidak"].includes(
        proses_banding_dijelaskan
      ) &&
      ["ya", "tidak"].includes(
        diskusi_dengan_asesor
      ) &&
      ["ya", "tidak"].includes(
        melibatkan_orang_lain
      );

    if (!jawabanValid) {
      return res.status(400).json({
        success: false,
        message: "Semua pertanyaan wajib dijawab Ya atau Tidak."
      });
    }

    if (
      !alasan_banding ||
      alasan_banding.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Alasan banding wajib diisi."
      });
    }

    const context = await getPesertaContext(
      id_peserta,
      id_user
    );

    if (!context) {
      return res.status(404).json({
        success: false,
        message: "Data peserta tidak ditemukan."
      });
    }

    if (!context.peserta.jadwal) {
      return res.status(404).json({
        success: false,
        message: "Data jadwal tidak ditemukan."
      });
    }

    const existing = await FrAk04.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FR.AK.04 sudah pernah diisi.",
        data: existing
      });
    }

    const ttd_asesi =
      context.peserta.profileAsesi?.ttd_path || null;

    const data = await FrAk04.create({
      id_peserta,
      id_jadwal: context.peserta.id_jadwal,
      id_skema: context.peserta.jadwal.id_skema,
      id_tuk: context.peserta.jadwal.id_tuk,
      tanggal_asesmen: new Date(),
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding,
      ttd_asesi
    });

    return res.status(201).json({
      success: true,
      message: "FR.AK.04 berhasil disimpan.",
      data: {
        ...data.toJSON(),
        nama_asesi:
          context.peserta.profileAsesi?.nama_lengkap || "-",
        nik:
          context.peserta.profileAsesi?.nik || "-",
        nama_asesor:
          context.asesor?.nama_lengkap || "-",
        kode_asesor:
          context.asesor?.no_reg_asesor || "-",
        nama_skema:
          context.peserta.jadwal?.skema?.judul_skema || "-",
        kode_skema:
          context.peserta.jadwal?.skema?.kode_skema || "-",
        nama_tuk:
          context.peserta.jadwal?.tuk?.nama_tuk || "-",
        ttd_asesi:
          ttd_asesi
      }
    });
  } catch (err) {
    console.error("CREATE FR.AK.04 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getFrAk04ByPeserta = async (req, res) => {
  try {
    const id_peserta = Number(req.params.id_peserta);
    const id_user = getCurrentUserId(req);

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi."
      });
    }

    const context = await getPesertaContext(
      id_peserta,
      id_user
    );

    if (!context) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan."
      });
    }

    const peserta = context.peserta;
    const asesor = context.asesor;
    const profile = peserta.profileAsesi;
    const jadwal = peserta.jadwal;
    const skema = jadwal?.skema;
    const tuk = jadwal?.tuk;

    const data = await FrAk04.findOne({
      where: {
        id_peserta
      }
    });

    if (!data) {
      return res.status(200).json({
        success: true,
        message: "Data dasar FR.AK.04 berhasil diambil.",
        data: {
          id_fr_ak04: null,
          id_peserta: peserta.id_peserta,
          id_jadwal: peserta.id_jadwal,
          id_skema: jadwal?.id_skema || null,
          id_tuk: jadwal?.id_tuk || null,
          tanggal_asesmen:
            jadwal?.tgl_akhir ||
            jadwal?.tgl_awal ||
            null,
          proses_banding_dijelaskan: "",
          diskusi_dengan_asesor: "",
          melibatkan_orang_lain: "",
          alasan_banding: "",
          ttd_asesi:
            profile?.ttd_path || null,
          nama_asesi:
            profile?.nama_lengkap || "-",
          nik:
            profile?.nik || "-",
          nama_asesor:
            asesor?.nama_lengkap || "-",
          kode_asesor:
            asesor?.no_reg_asesor || "-",
          nama_skema:
            skema?.judul_skema || "-",
          kode_skema:
            skema?.kode_skema || "-",
          nama_tuk:
            tuk?.nama_tuk || "-",
          skema: skema || {},
          tuk: tuk || {},
          jadwal: jadwal || {},
          peserta: peserta.toJSON(),
          profileAsesi:
            profile?.toJSON() || null,
          is_submitted: false,
          can_submit: true
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data FR.AK.04 berhasil diambil.",
      data: {
        id_fr_ak04: data.id_fr_ak04,
        id_peserta: data.id_peserta,
        id_jadwal: data.id_jadwal,
        id_skema: data.id_skema,
        id_tuk: data.id_tuk,
        tanggal_asesmen:
          data.tanggal_asesmen,
        proses_banding_dijelaskan:
          data.proses_banding_dijelaskan,
        diskusi_dengan_asesor:
          data.diskusi_dengan_asesor,
        melibatkan_orang_lain:
          data.melibatkan_orang_lain,
        alasan_banding:
          data.alasan_banding,
        ttd_asesi:
          data.ttd_asesi ||
          profile?.ttd_path ||
          null,
        nama_asesi:
          profile?.nama_lengkap || "-",
        nik:
          profile?.nik || "-",
        nama_asesor:
          asesor?.nama_lengkap || "-",
        kode_asesor:
          asesor?.no_reg_asesor || "-",
        nama_skema:
          skema?.judul_skema || "-",
        kode_skema:
          skema?.kode_skema || "-",
        nama_tuk:
          tuk?.nama_tuk || "-",
        skema: skema || {},
        tuk: tuk || {},
        jadwal: jadwal || {},
        peserta: peserta.toJSON(),
        profileAsesi:
          profile?.toJSON() || null,
        is_submitted: true,
        can_submit: false
      }
    });
  } catch (err) {
    console.error("GET FR.AK.04 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.generatePdfFrAk04 = async (req, res) => {
  try {
    const id_peserta = Number(req.params.id_peserta);
    const id_user = getCurrentUserId(req);

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi."
      });
    }

    const context = await getPesertaContext(
      id_peserta,
      id_user
    );

    if (!context) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses."
      });
    }

    const data = await FrAk04.findOne({
      where: {
        id_peserta
      }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.AK.04 tidak ditemukan."
      });
    }

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const LEFT = 42;
    const RIGHT = 42;
    const TOP = 32;
    const BOTTOM = 34;
    const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: `FR.AK.04 - ${context.peserta.profileAsesi?.nama_lengkap || "Asesi"}`
      }
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-AK-04-${id_peserta}.pdf`
    );

    doc.pipe(res);

    const drawCell = (
      x,
      y,
      width,
      height,
      text = "",
      options = {}
    ) => {
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

      doc.font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor("#000000");

      const value = safeText(text);
      const textWidth = Math.max(width - padding * 2, 8);
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
        height: Math.max(height - padding * 2, 8),
        align,
        lineGap: 0
      });
    };

    const drawCheckbox = (
      x,
      y,
      width,
      height,
      checked
    ) => {
      const boxSize = 9;
      const boxX = x + (width - boxSize) / 2;
      const boxY = y + (height - boxSize) / 2;

      doc.save()
        .lineWidth(0.8)
        .strokeColor("#000000")
        .rect(
          boxX,
          boxY,
          boxSize,
          boxSize
        )
        .stroke()
        .restore();

      if (checked) {
        doc.save()
          .lineWidth(1)
          .lineCap("round")
          .lineJoin("round")
          .strokeColor("#000000")
          .moveTo(
            boxX + 1.2,
            boxY + 4.8
          )
          .lineTo(
            boxX + 4,
            boxY + 7
          )
          .lineTo(
            boxX + 7.7,
            boxY + 1.8
          )
          .stroke()
          .restore();
      }
    };

    const drawSignature = (
      value,
      x,
      y,
      width,
      height
    ) => {
      const signaturePath =
        normalizeFilePath(value);

      if (!signaturePath) {
        return;
      }

      try {
        const imageWidth = Math.min(
          125,
          width - 16
        );
        const imageHeight = Math.min(
          58,
          height - 12
        );
        const imageX = x + (width - imageWidth) / 2;
        const imageY = y + (height - imageHeight) / 2;

        doc.image(
          signaturePath,
          imageX,
          imageY,
          {
            fit: [
              imageWidth,
              imageHeight
            ],
            align: "center",
            valign: "center"
          }
        );
      } catch {
        return;
      }
    };

    const contextProfile =
      context.peserta.profileAsesi;

    const namaAsesi =
      contextProfile?.nama_lengkap || "-";

    const namaAsesor =
      context.asesor?.nama_lengkap || "-";

    const kodeAsesor =
      context.asesor?.no_reg_asesor || "-";

    const namaSkema =
      context.peserta.jadwal?.skema?.judul_skema ||
      "-";

    const kodeSkema =
      context.peserta.jadwal?.skema?.kode_skema ||
      "-";

    const namaTuk =
      context.peserta.jadwal?.tuk?.nama_tuk ||
      "-";

    let currentY = TOP;

    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "FR.AK.04. BANDING ASESMEN",
        LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 24;

    const infoRowHeight = 21;

    const drawInfoRow = (label, value) => {
      const labelWidth = 145;
      const valueWidth =
        CONTENT_WIDTH - labelWidth;

      drawCell(
        LEFT,
        currentY,
        labelWidth,
        infoRowHeight,
        label,
        {
          bold: true,
          fontSize: 7
        }
      );

      drawCell(
        LEFT + labelWidth,
        currentY,
        valueWidth,
        infoRowHeight,
        value,
        {
          fontSize: 7
        }
      );

      currentY += infoRowHeight;
    };

    drawInfoRow(
      "Nama Asesi",
      namaAsesi
    );

    drawInfoRow(
      "Nama Asesor",
      namaAsesor
    );

    drawInfoRow(
      "Tanggal Asesmen",
      formatTanggal(
        data.tanggal_asesmen
      )
    );

    currentY += 8;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini:",
      {
        bold: true,
        fontSize: 7,
        fill: "#E5E7EB"
      }
    );

    currentY += 25;

    const noWidth = 30;
    const yesWidth = 55;
    const noAnswerWidth = 55;
    const questionWidth = CONTENT_WIDTH - noWidth - yesWidth - noAnswerWidth;
    const tableHeaderHeight = 24;

    drawCell(
      LEFT,
      currentY,
      noWidth,
      tableHeaderHeight,
      "No.",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + noWidth,
      currentY,
      questionWidth,
      tableHeaderHeight,
      "PERTANYAAN",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + noWidth + questionWidth,
      currentY,
      yesWidth,
      tableHeaderHeight,
      "YA",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + noWidth + questionWidth + yesWidth,
      currentY,
      noAnswerWidth,
      tableHeaderHeight,
      "TIDAK",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    currentY += tableHeaderHeight;

    const questionRows = [
      {
        text: "Apakah Proses Banding telah dijelaskan kepada Anda?",
        value: data.proses_banding_dijelaskan
      },
      {
        text: "Apakah Anda telah mendiskusikan Banding dengan Asesor?",
        value: data.diskusi_dengan_asesor
      },
      {
        text: "Apakah Anda mau melibatkan orang lain membantu Anda dalam Proses Banding?",
        value: data.melibatkan_orang_lain
      }
    ];

    questionRows.forEach(
      (item, index) => {
        const textHeight = doc.heightOfString(
          item.text,
          {
            width: questionWidth - 10,
            fontSize: 7
          }
        );

        const rowHeight = Math.max(
          34,
          textHeight + 12
        );

        drawCell(
          LEFT,
          currentY,
          noWidth,
          rowHeight,
          String(index + 1),
          {
            align: "center",
            fontSize: 7
          }
        );

        drawCell(
          LEFT + noWidth,
          currentY,
          questionWidth,
          rowHeight,
          item.text,
          {
            fontSize: 7
          }
        );

        drawCell(
          LEFT + noWidth + questionWidth,
          currentY,
          yesWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheckbox(
          LEFT + noWidth + questionWidth,
          currentY,
          yesWidth,
          rowHeight,
          item.value === "ya"
        );

        drawCell(
          LEFT + noWidth + questionWidth + yesWidth,
          currentY,
          noAnswerWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheckbox(
          LEFT + noWidth + questionWidth + yesWidth,
          currentY,
          noAnswerWidth,
          rowHeight,
          item.value === "tidak"
        );

        currentY += rowHeight;
      }
    );

    currentY += 8;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap Skema Sertifikasi berikut:",
      {
        bold: true,
        fontSize: 6.6,
        fill: "#F1F5F9"
      }
    );

    currentY += 25;

    drawCell(
      LEFT,
      currentY,
      150,
      24,
      "Skema Sertifikasi",
      {
        bold: true,
        fontSize: 6.8
      }
    );

    drawCell(
      LEFT + 150,
      currentY,
      CONTENT_WIDTH - 150,
      24,
      namaSkema,
      {
        fontSize: 6.8
      }
    );

    currentY += 24;

    drawCell(
      LEFT,
      currentY,
      150,
      24,
      "No. Skema Sertifikasi",
      {
        bold: true,
        fontSize: 6.8
      }
    );

    drawCell(
      LEFT + 150,
      currentY,
      CONTENT_WIDTH - 150,
      24,
      kodeSkema,
      {
        fontSize: 6.8
      }
    );

    currentY += 32;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "Banding ini diajukan atas alasan sebagai berikut:",
      {
        bold: true,
        fontSize: 6.8,
        fill: "#F1F5F9"
      }
    );

    currentY += 25;

    const reasonText =
      data.alasan_banding || "-";

    const reasonHeight = Math.max(
      100,
      doc.heightOfString(
        reasonText,
        {
          width: CONTENT_WIDTH - 12,
          fontSize: 7
        }
      ) + 18
    );

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      reasonHeight,
      reasonText,
      {
        fontSize: 7,
        valign: "top",
        padding: 6
      }
    );

    currentY += reasonHeight + 8;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      45,
      "Anda mempunyai hak mengajukan banding jika Anda menilai Proses Asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.",
      {
        bold: true,
        fontSize: 6.7,
        valign: "center",
        padding: 6
      }
    );

    currentY += 55;

    const half = CONTENT_WIDTH / 2;
    const signatureHeaderHeight = 24;
    const signatureBodyHeight = 105;

    drawCell(
      LEFT,
      currentY,
      half,
      signatureHeaderHeight,
      "Tanda Tangan Asesi",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + half,
      currentY,
      half,
      signatureHeaderHeight,
      "Tanggal",
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
      half,
      signatureBodyHeight,
      "",
      {
        padding: 0
      }
    );

    drawCell(
      LEFT + half,
      currentY,
      half,
      signatureBodyHeight,
      "",
      {
        padding: 0
      }
    );

    drawSignature(
      data.ttd_asesi ||
        contextProfile?.ttd_path,
      LEFT,
      currentY + 4,
      half,
      62
    );

    doc.font("Helvetica")
      .fontSize(6.7)
      .text(
        namaAsesi,
        LEFT + 8,
        currentY + 73,
        {
          width: half - 16,
          align: "center",
          lineBreak: false
        }
      );

    doc.font("Helvetica")
      .fontSize(6.7)
      .text(
        formatTanggal(
          data.tanggal_asesmen
        ),
        LEFT + half + 8,
        currentY + 45,
        {
          width: half - 16,
          align: "center",
          lineBreak: false
        }
      );

    currentY += signatureBodyHeight + 10;

    const pageRange =
      doc.bufferedPageRange();

    if (
      pageRange &&
      pageRange.count > 1
    ) {
      for (
        let pageIndex = pageRange.start;
        pageIndex < pageRange.start + pageRange.count;
        pageIndex += 1
      ) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica")
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
    }

    doc.fillColor("#000000");
    doc.end();
  } catch (err) {
    console.error(
      "GENERATE PDF FR.AK.04 ERROR:",
      err
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};