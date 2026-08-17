const FrIa03 = require("../../models/frIa03.model");
const FrIa03Pertanyaan = require("../../models/frIa03Pertanyaan.model");
const FrIa03Jawaban = require("../../models/frIa03Jawaban.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const PesertaJadwal = require("../../models/pesertaJadwal.model");

const getFrIa03Data = async (id) => {
  let data = await FrIa03.findByPk(id, {
    include: [
      {
        model: FrIa03Pertanyaan,
        as: "pertanyaan",
        include: [
          {
            model: UnitKompetensi,
            as: "unit"
          },
          {
            model: FrIa03Jawaban,
            as: "jawaban"
          }
        ]
      },
      {
        model: ProfileAsesor,
        as: "asesor"
      },
      {
        model: ProfileAsesi,
        as: "asesi"
      },
      {
        model: Skema,
        as: "skema"
      },
      {
        model: Tuk,
        as: "tuk"
      }
    ]
  });

  if (!data) {
    data = await FrIa03.findOne({
      where: {
        id_jadwal: id
      },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: FrIa03Jawaban,
              as: "jawaban"
            }
          ]
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: ProfileAsesi,
          as: "asesi"
        },
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        }
      ]
    });
  }

  return data;
};

exports.getForm = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta pada jadwal tersebut tidak ditemukan"
      });
    }

    const data = await FrIa03.findOne({
      where: {
        id_jadwal,
        id_asesi: peserta.id_user
      },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            {
              model: FrIa03Jawaban,
              as: "jawaban"
            },
            {
              model: UnitKompetensi,
              as: "unit"
            }
          ]
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: ProfileAsesi,
          as: "asesi"
        },
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        }
      ],
      order: [
        [
          {
            model: FrIa03Pertanyaan,
            as: "pertanyaan"
          },
          "urutan",
          "ASC"
        ]
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.IA.03 untuk peserta tersebut belum tersedia"
      });
    }

    return res.json({
      success: true,
      data: data.toJSON()
    });
  } catch (error) {
    console.error("Error getForm FR.IA.03:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data FR.IA.03",
      error: error.message
    });
  }
};

exports.saveJawaban = async (req, res) => {
  try {
    const {
      id_pertanyaan,
      tanggapan,
      rekomendasi,
      umpan_balik,
      ttd_asesor
    } = req.body;

    if (!id_pertanyaan) {
      return res.status(400).json({
        success: false,
        message: "id_pertanyaan wajib diisi"
      });
    }

    const pertanyaan = await FrIa03Pertanyaan.findByPk(id_pertanyaan);

    if (!pertanyaan) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan FR.IA.03 tidak ditemukan"
      });
    }

    const existing = await FrIa03Jawaban.findOne({
      where: {
        id_pertanyaan
      }
    });

    const payload = {
      tanggapan: tanggapan !== undefined ? tanggapan : existing?.tanggapan || "",
      rekomendasi: rekomendasi !== undefined ? rekomendasi : existing?.rekomendasi || null,
      umpan_balik: umpan_balik !== undefined ? umpan_balik : existing?.umpan_balik || "",
      ttd_asesor: ttd_asesor !== undefined ? ttd_asesor : existing?.ttd_asesor || null
    };

    if (existing) {
      await existing.update(payload);

      return res.json({
        success: true,
        message: "Jawaban FR.IA.03 berhasil diperbarui",
        data: existing
      });
    }

    const data = await FrIa03Jawaban.create({
      id_pertanyaan,
      ...payload
    });

    return res.status(201).json({
      success: true,
      message: "Jawaban FR.IA.03 berhasil disimpan",
      data
    });
  } catch (error) {
    console.error("Error saveJawaban FR.IA.03:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan jawaban FR.IA.03",
      error: error.message
    });
  }
};

exports.saveUmpanBalik = async (req, res) => {
  try {
    const { id_jadwal, id_peserta, umpan_balik } = req.body;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta pada jadwal tersebut tidak ditemukan"
      });
    }

    const dataFrIa03 = await FrIa03.findOne({
      where: {
        id_jadwal,
        id_asesi: peserta.id_user
      }
    });

    if (!dataFrIa03) {
      return res.status(404).json({
        success: false,
        message: "FR.IA.03 tidak ditemukan"
      });
    }

    const pertanyaan = await FrIa03Pertanyaan.findAll({
      where: {
        id_fr_ia_03: dataFrIa03.id_fr_ia_03
      }
    });

    if (!pertanyaan.length) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan FR.IA.03 tidak ditemukan"
      });
    }

    for (const item of pertanyaan) {
      const existing = await FrIa03Jawaban.findOne({
        where: {
          id_pertanyaan: item.id_pertanyaan
        }
      });

      if (existing) {
        await existing.update({
          umpan_balik: umpan_balik || ""
        });
      } else {
        await FrIa03Jawaban.create({
          id_pertanyaan: item.id_pertanyaan,
          tanggapan: "",
          rekomendasi: null,
          umpan_balik: umpan_balik || ""
        });
      }
    }

    return res.json({
      success: true,
      message: "Umpan balik berhasil disimpan"
    });
  } catch (error) {
    console.error("Error saveUmpanBalik:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan umpan balik",
      error: error.message
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getFrIa03Data(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.IA.03 tidak ditemukan"
      });
    }

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 28;
    const MARGIN_RIGHT = 28;
    const MARGIN_TOP = 24;
    const MARGIN_BOTTOM = 24;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="FR-IA-03-${id}.pdf"`
    );

    doc.pipe(res);

    const safe = (value) => {
      return value === null || value === undefined || value === "" ? "-" : String(value);
    };

    const formatTanggal = (value) => {
      if (!value) return "-";

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

    const getNama = (obj) => {
      return obj?.nama_lengkap || obj?.nama || obj?.username || "-";
    };

    const getUnitKode = (unit) => {
      return unit?.kode_unit || unit?.kode || "-";
    };

    const getUnitJudul = (unit) => {
      return unit?.judul_unit || unit?.nama_unit || unit?.judul || unit?.nama || "-";
    };

    const normalizeSignaturePath = (value) => {
      if (!value) return "";

      const stringValue = String(value);

      if (path.isAbsolute(stringValue) && fs.existsSync(stringValue)) {
        return stringValue;
      }

      const cleaned = stringValue.replace(/^[/\\]+/, "");

      const candidates = [
        path.join(process.cwd(), cleaned),
        path.join(process.cwd(), "uploads", cleaned.replace(/^uploads[/\\]/, "")),
        path.join(process.cwd(), "public", cleaned)
      ];

      return candidates.find((item) => fs.existsSync(item)) || "";
    };

    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        fontSize = 7,
        bold = false,
        align = "left",
        valign = "center",
        padding = 4,
        fill = null
      } = options;

      if (fill) {
        doc.save().fillColor(fill).rect(x, y, width, height).fill().restore();
      }

      doc.save().lineWidth(0.7).strokeColor("#000000").rect(x, y, width, height).stroke().restore();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).fillColor("#000000");

      const value = safe(text);
      const textWidth = Math.max(width - padding * 2, 5);
      const textHeight = doc.heightOfString(value, {
        width: textWidth,
        align
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
        align,
        lineGap: 0
      });
    };

    const drawCheckbox = (x, y, width, height, checked, boxSize = 9) => {
      const boxX = x + (width - boxSize) / 2;
      const boxY = y + (height - boxSize) / 2;

      doc.save().lineWidth(0.8).strokeColor("#000000").rect(boxX, boxY, boxSize, boxSize).stroke().restore();

      if (checked) {
        doc.save().lineWidth(1.2).lineCap("round").lineJoin("round").strokeColor("#000000")
          .moveTo(boxX + 1.5, boxY + 4.5)
          .lineTo(boxX + 4, boxY + 7)
          .lineTo(boxX + 7.5, boxY + 2)
          .stroke()
          .restore();
      }
    };

    const drawRadio = (x, y, width, height, checked) => {
      const radius = 4.5;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      doc.save().lineWidth(0.8).strokeColor("#000000").circle(centerX, centerY, radius).stroke().restore();

      if (checked) {
        doc.save().fillColor("#000000").circle(centerX, centerY, 2.4).fill().restore();
      }
    };

    const drawSignature = (value, x, y, width, height) => {
      const signaturePath = normalizeSignaturePath(value);

      if (!signaturePath || !fs.existsSync(signaturePath)) {
        doc.font("Helvetica").fontSize(7).fillColor("#666666").text(
          "Tanda tangan belum tersedia",
          x,
          y + height / 2 - 4,
          {
            width,
            align: "center"
          }
        );
        doc.fillColor("#000000");
        return;
      }

      try {
        const imageWidth = Math.min(180, width - 12);
        const imageHeight = Math.min(55, height - 12);
        const imageX = x + (width - imageWidth) / 2;
        const imageY = y + 5;

        doc.image(signaturePath, imageX, imageY, {
          fit: [imageWidth, imageHeight],
          align: "center",
          valign: "center"
        });
      } catch (error) {
        doc.font("Helvetica").fontSize(7).text(
          "Tanda tangan belum tersedia",
          x,
          y + height / 2 - 4,
          {
            width,
            align: "center"
          }
        );
      }
    };

    const drawPageNumber = () => {
      const range = doc.bufferedPageRange();

      if (!range || range.count <= 1) {
        return;
      }

      for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica").fontSize(6.5).fillColor("#555555").text(
          `Halaman ${pageIndex - range.start + 1} dari ${range.count}`,
          MARGIN_LEFT,
          PAGE_HEIGHT - 15,
          {
            width: CONTENT_WIDTH,
            align: "center",
            lineBreak: false
          }
        );
      }

      doc.fillColor("#000000");
    };

    const questions = [...(data.pertanyaan || [])].sort((a, b) => {
      return Number(a?.urutan || 0) - Number(b?.urutan || 0);
    });

    const groupedQuestions = {};

    questions.forEach((item) => {
      const kelompok =
        item?.unit?.kelompok_pekerjaan?.nama_kelompok ||
        item?.unit?.kelompok?.nama_kelompok ||
        item?.kelompok_pekerjaan ||
        "Kelompok Pekerjaan";

      if (!groupedQuestions[kelompok]) {
        groupedQuestions[kelompok] = [];
      }

      groupedQuestions[kelompok].push(item);
    });

    const getJawaban = (item) => {
      if (Array.isArray(item?.jawaban)) {
        return item.jawaban[0] || {};
      }

      return item?.jawaban || {};
    };

    const skema = data?.skema || {};
    const tuk = data?.tuk || {};
    const asesor = data?.asesor || {};
    const asesi = data?.asesi || {};

    const namaAsesi = getNama(asesi);
    const namaAsesor = getNama(asesor);
    const tanggal = formatTanggal(
      data?.tanggal ||
      data?.created_at ||
      new Date()
    );

    let currentY = MARGIN_TOP;

    const drawTitle = () => {
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#000000").text(
        "FR.IA.03. PERTANYAAN UNTUK MENDUKUNG OBSERVASI",
        MARGIN_LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

      currentY += 24;
    };

    const drawHeaderTable = () => {
      const col1 = 155;
      const col2 = 55;
      const col3 = 18;
      const col4 = CONTENT_WIDTH - col1 - col2 - col3;
      const rowHeight = 28;

      drawCell(
        MARGIN_LEFT,
        currentY,
        col1,
        rowHeight * 2,
        "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
        {
          bold: true,
          valign: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1,
        currentY,
        col2,
        rowHeight,
        "Judul",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY,
        col4,
        rowHeight,
        skema?.judul_skema || skema?.nama_skema || "-",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1,
        currentY + rowHeight,
        col2,
        rowHeight,
        "Nomor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY + rowHeight,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY + rowHeight,
        col4,
        rowHeight,
        skema?.kode_skema || skema?.nomor_skema || "-",
        {
          bold: true
        }
      );

      currentY += rowHeight * 2;

      drawCell(
        MARGIN_LEFT,
        currentY,
        col1 + col2,
        rowHeight,
        "TUK",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY,
        col4,
        rowHeight,
        tuk?.nama_tuk || tuk?.nama || "-",
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        col1 + col2,
        rowHeight,
        "Nama Asesor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY,
        col4,
        rowHeight,
        namaAsesor,
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        col1 + col2,
        rowHeight,
        "Nama Asesi",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY,
        col4,
        rowHeight,
        namaAsesi,
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        col1 + col2,
        rowHeight,
        "Tanggal",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2,
        currentY,
        col3,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + col1 + col2 + col3,
        currentY,
        col4,
        rowHeight,
        tanggal,
        {}
      );

      currentY += rowHeight + 10;
    };

    const drawGuide = () => {
      const text =
        "1. Pertanyaan pada formulir dibuat oleh Komite Teknis dan tidak dapat diubah oleh Asesor Penguji.\n" +
        "2. Tanggapan diisi berdasarkan jawaban asesi pada saat interview.\n" +
        "3. Pencapaian Ya atau Tdk ditentukan oleh Asesor Penguji berdasarkan hasil interview.\n" +
        "4. Umpan balik untuk asesi diisi oleh Asesor Penguji setelah proses asesmen.";

      const height = Math.max(
        82,
        doc.heightOfString(text, {
          width: CONTENT_WIDTH - 14,
          fontSize: 7.1,
          lineGap: 1
        }) + 14
      );

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        24,
        "PANDUAN BAGI ASESOR",
        {
          bold: true,
          fill: "#E5E7EB"
        }
      );

      drawCell(
        MARGIN_LEFT,
        currentY + 24,
        CONTENT_WIDTH,
        height,
        text,
        {
          fontSize: 7.1,
          valign: "top",
          padding: 7
        }
      );

      currentY += 24 + height + 10;
    };

    const drawGroupTable = (kelompok, list) => {
      const groupHeight = 30 + list.length * 23;

      if (currentY + groupHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        currentY = MARGIN_TOP;
        drawTitle();
      }

      const groupCol = 145;
      const noCol = 32;
      const kodeCol = 105;
      const judulCol = CONTENT_WIDTH - groupCol - noCol - kodeCol;

      drawCell(
        MARGIN_LEFT,
        currentY,
        groupCol,
        groupHeight,
        kelompok?.trim() || "Kelompok Pekerjaan",
        {
          valign: "center",
          fontSize: 7
        }
      );

      drawCell(
        MARGIN_LEFT + groupCol,
        currentY,
        noCol,
        30,
        "No.",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + groupCol + noCol,
        currentY,
        kodeCol,
        30,
        "Kode Unit",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + groupCol + noCol + kodeCol,
        currentY,
        judulCol,
        30,
        "Judul Unit",
        {
          bold: true,
          align: "center"
        }
      );

      list.forEach((item, index) => {
        const rowY = currentY + 30 + index * 23;

        drawCell(
          MARGIN_LEFT + groupCol,
          rowY,
          noCol,
          23,
          `${index + 1}.`,
          {
            align: "center"
          }
        );

        drawCell(
          MARGIN_LEFT + groupCol + noCol,
          rowY,
          kodeCol,
          23,
          getUnitKode(item.unit),
          {}
        );

        drawCell(
          MARGIN_LEFT + groupCol + noCol + kodeCol,
          rowY,
          judulCol,
          23,
          getUnitJudul(item.unit),
          {}
        );
      });

      currentY += groupHeight + 8;
    };

    const drawQuestionTable = (list) => {
      if (currentY + 105 > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        currentY = MARGIN_TOP;
        drawTitle();
      }

      const questionCol = CONTENT_WIDTH - 120;
      const yesCol = 60;
      const noCol = 60;
      const headerHeight = 27;

      drawCell(
        MARGIN_LEFT,
        currentY,
        questionCol,
        headerHeight,
        "Pertanyaan",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol,
        currentY,
        yesCol + noCol,
        headerHeight,
        "Pencapaian",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += headerHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        questionCol,
        24,
        "",
        {
          padding: 0
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol,
        currentY,
        yesCol,
        24,
        "Ya",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol + yesCol,
        currentY,
        noCol,
        24,
        "Tdk",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += 24;

      list.forEach((item, index) => {
        const jawaban = getJawaban(item);
        const pertanyaanText = `${index + 1}. ${item.pertanyaan || "-"}`;

        const questionHeight = Math.max(
          48,
          doc.heightOfString(pertanyaanText, {
            width: questionCol - 12,
            fontSize: 7
          }) + 14
        );

        if (currentY + questionHeight + 55 > PAGE_HEIGHT - MARGIN_BOTTOM) {
          doc.addPage();
          currentY = MARGIN_TOP;
          drawTitle();
          drawQuestionTableHeader();
        }

        drawCell(
          MARGIN_LEFT,
          currentY,
          questionCol,
          questionHeight,
          pertanyaanText,
          {
            fontSize: 7,
            valign: "top",
            padding: 6
          }
        );

        drawCell(
          MARGIN_LEFT + questionCol,
          currentY,
          yesCol,
          questionHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheckbox(
          MARGIN_LEFT + questionCol,
          currentY,
          yesCol,
          questionHeight,
          jawaban?.rekomendasi === "kompeten",
          9
        );

        drawCell(
          MARGIN_LEFT + questionCol + yesCol,
          currentY,
          noCol,
          questionHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheckbox(
          MARGIN_LEFT + questionCol + yesCol,
          currentY,
          noCol,
          questionHeight,
          jawaban?.rekomendasi === "belum_kompeten",
          9
        );

        currentY += questionHeight;

        const tanggapan = jawaban?.tanggapan || "-";

        const responseHeight = Math.max(
          55,
          doc.heightOfString(tanggapan, {
            width: CONTENT_WIDTH - 14,
            fontSize: 6.8
          }) + 20
        );

        drawCell(
          MARGIN_LEFT,
          currentY,
          CONTENT_WIDTH,
          responseHeight,
          "",
          {
            padding: 0
          }
        );

        doc.font("Helvetica-Bold").fontSize(6.8).text(
          "Tanggapan:",
          MARGIN_LEFT + 7,
          currentY + 7
        );

        doc.font("Helvetica").fontSize(6.8).text(
          tanggapan,
          MARGIN_LEFT + 7,
          currentY + 19,
          {
            width: CONTENT_WIDTH - 14,
            lineGap: 0
          }
        );

        currentY += responseHeight;
      });
    };

    const drawQuestionTableHeader = () => {
      const questionCol = CONTENT_WIDTH - 120;
      const yesCol = 60;
      const noCol = 60;
      const headerHeight = 27;

      drawCell(
        MARGIN_LEFT,
        currentY,
        questionCol,
        headerHeight,
        "Pertanyaan",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol,
        currentY,
        yesCol + noCol,
        headerHeight,
        "Pencapaian",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += headerHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        questionCol,
        24,
        "",
        {
          padding: 0
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol,
        currentY,
        yesCol,
        24,
        "Ya",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + questionCol + yesCol,
        currentY,
        noCol,
        24,
        "Tdk",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += 24;
    };

    drawTitle();
    drawHeaderTable();
    drawGuide();

    for (const [kelompok, list] of Object.entries(groupedQuestions)) {
      drawGroupTable(kelompok, list);
      drawQuestionTable(list);
      currentY += 8;
    }

    if (currentY + 120 > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      currentY = MARGIN_TOP;
      drawTitle();
    }

    const umpanBalik =
      questions
        .map((item) => {
          const jawaban = getJawaban(item);
          return jawaban?.umpan_balik || "";
        })
        .find(Boolean) || "-";

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      26,
      "Umpan balik untuk asesi:",
      {
        bold: true
      }
    );

    currentY += 26;

    const feedbackHeight = Math.max(
      75,
      doc.heightOfString(umpanBalik, {
        width: CONTENT_WIDTH - 14,
        fontSize: 7
      }) + 14
    );

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      feedbackHeight,
      umpanBalik,
      {
        valign: "top",
        padding: 7,
        fontSize: 7
      }
    );

    currentY += feedbackHeight + 12;

    if (currentY + 220 > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      currentY = MARGIN_TOP;
      drawTitle();
    }

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "ASESI :",
      {
        bold: true
      }
    );

    currentY += 25;

    drawCell(
      MARGIN_LEFT,
      currentY,
      150,
      32,
      "Nama",
      {
        bold: true
      }
    );

    drawCell(
      MARGIN_LEFT + 150,
      currentY,
      20,
      32,
      ":",
      {
        align: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 170,
      currentY,
      CONTENT_WIDTH - 170,
      32,
      namaAsesi,
      {}
    );

    currentY += 32;

    drawCell(
      MARGIN_LEFT,
      currentY,
      150,
      95,
      "Tanda tangan dan Tanggal",
      {
        bold: true,
        valign: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 150,
      currentY,
      20,
      95,
      ":",
      {
        align: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 170,
      currentY,
      CONTENT_WIDTH - 170,
      95,
      "",
      {
        padding: 0
      }
    );

    drawSignature(
      asesi?.ttd_path || asesi?.ttd || asesi?.signature,
      MARGIN_LEFT + 180,
      currentY + 5,
      CONTENT_WIDTH - 190,
      65
    );

    doc.font("Helvetica").fontSize(7).text(
      tanggal,
      MARGIN_LEFT + 180,
      currentY + 76,
      {
        width: CONTENT_WIDTH - 190,
        align: "center"
      }
    );

    currentY += 105;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "ASESOR :",
      {
        bold: true
      }
    );

    currentY += 25;

    drawCell(
      MARGIN_LEFT,
      currentY,
      150,
      32,
      "Nama",
      {
        bold: true
      }
    );

    drawCell(
      MARGIN_LEFT + 150,
      currentY,
      20,
      32,
      ":",
      {
        align: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 170,
      currentY,
      CONTENT_WIDTH - 170,
      32,
      namaAsesor,
      {}
    );

    currentY += 32;

    drawCell(
      MARGIN_LEFT,
      currentY,
      150,
      32,
      "No. Reg",
      {
        bold: true
      }
    );

    drawCell(
      MARGIN_LEFT + 150,
      currentY,
      20,
      32,
      ":",
      {
        align: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 170,
      currentY,
      CONTENT_WIDTH - 170,
      32,
      asesor?.no_reg_asesor || "-",
      {}
    );

    currentY += 32;

    drawCell(
      MARGIN_LEFT,
      currentY,
      150,
      95,
      "Tanda tangan dan Tanggal",
      {
        bold: true,
        valign: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 150,
      currentY,
      20,
      95,
      ":",
      {
        align: "center"
      }
    );

    drawCell(
      MARGIN_LEFT + 170,
      currentY,
      CONTENT_WIDTH - 170,
      95,
      "",
      {
        padding: 0
      }
    );

    drawSignature(
      asesor?.ttd_path || questions[0]?.jawaban?.ttd_asesor,
      MARGIN_LEFT + 180,
      currentY + 5,
      CONTENT_WIDTH - 190,
      65
    );

    doc.font("Helvetica").fontSize(7).text(
      tanggal,
      MARGIN_LEFT + 180,
      currentY + 76,
      {
        width: CONTENT_WIDTH - 190,
        align: "center"
      }
    );

    drawPageNumber();
    doc.end();
    } catch (err) {
    console.error("Error downloadPdf FR.IA.03:", err);

    if (res.headersSent || res.writableEnded) {
      return;
    }

    return res.status(500).json({
      success: false,
      message: "Gagal mendownload PDF",
      error: err.message
    });
  }
};