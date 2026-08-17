const {
  FrIa02,
  FrIa02Detail,
  FrIa02Validator,
  FrIa03,
  Jadwal,
  JadwalAsesor,
  Skema,
  Tuk,
  KelompokPekerjaan,
  ProfileAsesor,
  ProfileAsesi,
  PesertaJadwal,
  UnitKompetensi,
  SkemaUnit
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.getTugasKomite = async (req, res) => {
  try {
    const assessorId = req.user.id_user || req.user.id;
    const data = await JadwalAsesor.findAll({
      where: {
        id_user: assessorId,
        jenis_tugas: "komite_teknis",
        status: "aktif"
      },
      include: [
        {
          model: Jadwal,
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
        }
      ]
    });
    res.json(data.map((item) => item.Jadwal).filter(Boolean));
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const assessorId = req.user.id_user || req.user.id;
    const existing = await FrIa02.findOne({
      where: {
        id_jadwal,
        id_asesor: assessorId
      },
      include: [
        {
          model: FrIa02Detail,
          as: "detail",
          include: [
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            }
          ]
        },
        {
          model: FrIa02Validator,
          as: "validator",
          include: [
            {
              model: ProfileAsesor,
              as: "asesor"
            }
          ]
        },
        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "id_user",
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
          ]
        },
        {
          model: ProfileAsesi,
          as: "asesi",
          attributes: [
            "id_user",
            "nama_lengkap",
            "ttd_path"
          ]
        }
      ]
    });

    if (existing) {
      return res.json({
        ...existing.toJSON(),
        nama_asesor: existing.asesor?.nama_lengkap,
        no_reg_asesor: existing.asesor?.no_reg_asesor,
        ttd_asesor: existing.asesor?.ttd_path,
        nama_asesi: existing.asesi?.nama_lengkap,
        ttd_asesi: existing.asesi?.ttd_path
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    const kelompok = await KelompokPekerjaan.findAll({
      where: {
        id_skema: jadwal.id_skema
      },
      order: [
        ["urutan", "ASC"]
      ]
    });

    res.json({
      generated: true,
      jadwal,
      detail: kelompok.map((item) => ({
        id_kelompok: item.id_kelompok,
        nama_kelompok: item.nama_kelompok,
        skenario: null,
        langkah_kerja: null,
        peralatan: null,
        durasi: null
      }))
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getUnitBySkema = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    const mapping = await SkemaUnit.findAll({
      where: {
        id_skema: jadwal.id_skema
      },
      include: [
        {
          model: UnitKompetensi,
          as: "unit"
        },
        {
          model: KelompokPekerjaan,
          as: "kelompok"
        }
      ],
      order: [
        ["urutan", "ASC"]
      ]
    });

    const unit = mapping.map((item) => ({
      id_unit: item.unit?.id_unit,
      kode_unit: item.unit?.kode_unit,
      judul_unit: item.unit?.judul_unit,
      id_kelompok: item.id_kelompok,
      nama_kelompok: item.kelompok?.nama_kelompok,
      urutan: item.urutan
    }));

    res.json(unit);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

exports.createFrIa02 = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_asesi,
      tanggal,
      details = [],
      validators = []
    } = req.body;

    const assessorId = req.user.id_user || req.user.id;

    const cek = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: assessorId,
        jenis_tugas: "komite_teknis",
        status: "aktif"
      }
    });

    if (!cek) {
      return res.status(403).json({
        message: "Anda bukan komite teknis"
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    const fr = await FrIa02.create({
      id_jadwal,
      id_skema: jadwal.id_skema,
      id_tuk: jadwal.id_tuk,
      id_asesor: assessorId,
      id_asesi,
      tanggal,
      created_by: assessorId
    });

    if (details.length) {
      await FrIa02Detail.bulkCreate(
        details.map((item) => ({
          id_fr_ia_02: fr.id_fr_ia_02,
          id_kelompok: item.id_kelompok,
          kode_unit: item.kode_unit,
          judul_unit: item.judul_unit,
          urutan: item.urutan,
          skenario: item.skenario,
          langkah_kerja: item.langkah_kerja,
          peralatan: item.peralatan,
          durasi: item.durasi
        }))
      );
    }

    if (validators.length) {
      await FrIa02Validator.bulkCreate(
        validators.map((item) => ({
          id_fr_ia_02: fr.id_fr_ia_02,
          id_asesor: item.id_asesor,
          peran: item.peran,
          urutan: item.urutan
        }))
      );
    }

    const existingFrIa03 = await FrIa03.findOne({
      where: {
        id_jadwal
      }
    });

    if (!existingFrIa03) {
      try {
        await FrIa03.create({
          id_jadwal,
          id_skema: jadwal.id_skema,
          id_tuk: jadwal.id_tuk,
          id_asesor: assessorId,
          id_asesi,
          tanggal,
          created_by: assessorId
        });
      } catch (err) {
        console.error("GAGAL CREATE FRIA03", err);
      }
    }

    res.json(fr);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.updateFrIa02 = async (req, res) => {
  try {
    const id = req.params.id;

    await FrIa02.update(
      {
        id_asesi: req.body.id_asesi,
        tanggal: req.body.tanggal,
        updated_at: new Date()
      },
      {
        where: {
          id_fr_ia_02: id
        }
      }
    );

    const cek = await FrIa02.findByPk(id);

    if (!cek) {
      return res.status(404).json({
        message: "FR.IA.02 tidak ditemukan"
      });
    }

    const existingFrIa03 = await FrIa03.findOne({
      where: {
        id_jadwal: cek.id_jadwal
      }
    });

    if (!existingFrIa03) {
      try {
        await FrIa03.create({
          id_jadwal: cek.id_jadwal,
          id_skema: cek.id_skema,
          id_tuk: cek.id_tuk,
          id_asesor: cek.id_asesor,
          id_asesi: cek.id_asesi,
          tanggal: cek.tanggal,
          created_by: cek.created_by
        });
      } catch (err) {
        console.error("GAGAL CREATE HEADER FRIA03", err);
      }
    }

    await FrIa02Detail.destroy({
      where: {
        id_fr_ia_02: id
      }
    });

    await FrIa02Validator.destroy({
      where: {
        id_fr_ia_02: id
      }
    });

    if (req.body.details?.length) {
      await FrIa02Detail.bulkCreate(
        req.body.details.map((item) => ({
          id_fr_ia_02: id,
          id_kelompok: item.id_kelompok,
          kode_unit: item.kode_unit,
          judul_unit: item.judul_unit,
          urutan: item.urutan,
          skenario: item.skenario,
          langkah_kerja: item.langkah_kerja,
          peralatan: item.peralatan,
          durasi: item.durasi
        }))
      );
    }

    if (req.body.validators?.length) {
      await FrIa02Validator.bulkCreate(
        req.body.validators.map((item) => ({
          id_fr_ia_02: id,
          id_asesor: item.id_asesor,
          peran: item.peran,
          urutan: item.urutan
        }))
      );
    }

    res.json({
      message: "updated"
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getByJadwal = async (req, res) => {
  try {
    const data = await FrIa02.findAll({
      where: {
        id_jadwal: req.params.id_jadwal
      }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const data = await FrIa02.findByPk(req.params.id, {
      include: [
        {
          model: FrIa02Detail,
          as: "detail",
          include: [
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            }
          ]
        },
        {
          model: FrIa02Validator,
          as: "validator",
          include: [
            {
              model: ProfileAsesor,
              as: "asesor"
            }
          ]
        },
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: ProfileAsesi,
          as: "asesi"
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.IA.02 tidak ditemukan"
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
      `inline; filename=FR-IA-02-${data.id_fr_ia_02}.pdf`
    );

    doc.pipe(res);

    const safe = (value) => {
      return value === null || value === undefined || value === "" ? "-" : String(value);
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

    const normalizeSignaturePath = (value) => {
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

    const drawSignature = (value, x, y, width, height) => {
      const signaturePath = normalizeSignaturePath(value);

      if (!signaturePath || !fs.existsSync(signaturePath)) {
        return;
      }

      try {
        const imageWidth = Math.min(170, width - 14);
        const imageHeight = Math.min(55, height - 10);
        const imageX = x + (width - imageWidth) / 2;
        const imageY = y + 5;

        doc.image(signaturePath, imageX, imageY, {
          fit: [imageWidth, imageHeight],
          align: "center",
          valign: "center"
        });
      } catch (err) {
        console.error("GAGAL LOAD SIGNATURE FR.IA.02", err);
      }
    };

    const drawPageNumber = () => {
      const range = doc.bufferedPageRange();

      if (!range || range.count <= 1) {
        return;
      }

      for (
        let pageIndex = range.start;
        pageIndex < range.start + range.count;
        pageIndex += 1
      ) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica").fontSize(6.5).fillColor("#555555").text(
          `Hal. ${pageIndex - range.start + 1} dari ${range.count}`,
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

    const detail = Array.isArray(data.detail) ? [...data.detail] : [];

    detail.sort((a, b) => {
      return Number(a?.urutan || 0) - Number(b?.urutan || 0);
    });

    const groupMap = new Map();

    detail.forEach((item) => {
      const idKelompok = String(
        item?.id_kelompok ||
        item?.kelompok?.id_kelompok ||
        "0"
      );

      if (!groupMap.has(idKelompok)) {
        groupMap.set(idKelompok, {
          id_kelompok: item?.id_kelompok || item?.kelompok?.id_kelompok,
          nama_kelompok: item?.kelompok?.nama_kelompok || "Kelompok Pekerjaan",
          urutan: item?.kelompok?.urutan || item?.urutan || 0,
          items: []
        });
      }

      groupMap.get(idKelompok).items.push(item);
    });

    const groups = [...groupMap.values()].sort((a, b) => {
      return Number(a.urutan || 0) - Number(b.urutan || 0);
    });

    const skema = data.skema || {};
    const tuk = data.tuk || {};
    const asesor = data.asesor || {};
    const asesi = data.asesi || {};
    const validators = Array.isArray(data.validator) ? [...data.validator] : [];

    const namaAsesor = asesor.nama_lengkap || "-";
    const noRegAsesor = asesor.no_reg_asesor || "-";
    const namaAsesi = asesi.nama_lengkap || "-";
    const tanggal = formatTanggal(data.tanggal);
    const ttdAsesor = asesor.ttd_path || "";
    const ttdAsesi = asesi.ttd_path || "";

    let currentY = MARGIN_TOP;

    const ensureSpace = (height) => {
      if (currentY + height > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        currentY = MARGIN_TOP;
        drawTitle();
        return true;
      }

      return false;
    };

    const drawTitle = () => {
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#000000").text(
        "FR.IA.02. TPD - TUGAS PRAKTIK DEMONSTRASI",
        MARGIN_LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

      currentY += 24;
    };

    const drawHeader = () => {
      const labelCol = 150;
      const titleCol = 60;
      const colonCol = 18;
      const valueCol = CONTENT_WIDTH - labelCol - titleCol - colonCol;
      const rowHeight = 28;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        rowHeight * 2,
        "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
        {
          bold: true,
          valign: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        titleCol,
        rowHeight,
        "Judul",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY,
        valueCol,
        rowHeight,
        skema?.judul_skema || "-",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY + rowHeight,
        titleCol,
        rowHeight,
        "Nomor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY + rowHeight,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY + rowHeight,
        valueCol,
        rowHeight,
        skema?.kode_skema || "-",
        {
          bold: true
        }
      );

      currentY += rowHeight * 2;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol + titleCol,
        rowHeight,
        "TUK",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY,
        valueCol,
        rowHeight,
        tuk?.nama_tuk || tuk?.nama || "-",
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol + titleCol,
        rowHeight,
        "Nama Asesor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY,
        valueCol,
        rowHeight,
        namaAsesor,
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol + titleCol,
        rowHeight,
        "Nama Asesi",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY,
        valueCol,
        rowHeight,
        namaAsesi,
        {}
      );

      currentY += rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol + titleCol,
        rowHeight,
        "Tanggal",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol,
        currentY,
        colonCol,
        rowHeight,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + titleCol + colonCol,
        currentY,
        valueCol,
        rowHeight,
        tanggal,
        {}
      );

      currentY += rowHeight + 10;
    };

    const drawPetunjuk = () => {
      const petunjuk = [
        "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktek",
        "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
        "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
        "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)"
      ];

      const text = petunjuk
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");

      const height = Math.max(
        95,
        doc.heightOfString(text, {
          width: CONTENT_WIDTH - 14,
          fontSize: 7,
          lineGap: 1
        }) + 14
      );

      ensureSpace(24 + height + 10);

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        24,
        "A. Petunjuk",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT,
        currentY + 24,
        CONTENT_WIDTH,
        height,
        text,
        {
          fontSize: 7,
          valign: "top",
          padding: 7
        }
      );

      currentY += 24 + height + 10;
    };

    const drawGroup = (group, index) => {
      const items = Array.isArray(group.items) ? group.items : [];

      ensureSpace(260);

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        24,
        index === 0 ? "B. Skenario Tugas Praktik Demonstrasi" : "Skenario Tugas Praktik Demonstrasi",
        {
          bold: true
        }
      );

      currentY += 24;

      const groupCol = 112;
      const noCol = 32;
      const kodeCol = 110;
      const judulCol = CONTENT_WIDTH - groupCol - noCol - kodeCol;
      const headerHeight = 28;
      const rowHeight = 24;
      const tableHeight = headerHeight + Math.max(items.length, 1) * rowHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        groupCol,
        tableHeight,
        "Kelompok\nPekerjaan",
        {
          bold: true,
          align: "center",
          valign: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + groupCol,
        currentY,
        noCol,
        headerHeight,
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
        headerHeight,
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
        headerHeight,
        "Judul Unit",
        {
          bold: true,
          align: "center"
        }
      );

      if (!items.length) {
        drawCell(
          MARGIN_LEFT + groupCol,
          currentY + headerHeight,
          CONTENT_WIDTH - groupCol,
          rowHeight,
          "-",
          {
            align: "center"
          }
        );
      }

      items.forEach((item, itemIndex) => {
        const rowY = currentY + headerHeight + itemIndex * rowHeight;

        drawCell(
          MARGIN_LEFT + groupCol,
          rowY,
          noCol,
          rowHeight,
          `${itemIndex + 1}.`,
          {
            align: "center"
          }
        );

        drawCell(
          MARGIN_LEFT + groupCol + noCol,
          rowY,
          kodeCol,
          rowHeight,
          item.kode_unit || "-",
          {}
        );

        drawCell(
          MARGIN_LEFT + groupCol + noCol + kodeCol,
          rowY,
          judulCol,
          rowHeight,
          item.judul_unit || "-",
          {}
        );
      });

      currentY += tableHeight + 8;

      const first = items[0] || {};
      const scenario = first.skenario || "-";
      const langkah = first.langkah_kerja || "-";
      const peralatan = first.peralatan || "-";
      const durasi = first.durasi !== null && first.durasi !== undefined && first.durasi !== "" ? `${first.durasi} Menit` : "-";
      const labelCol = 170;
      const valueCol = CONTENT_WIDTH - labelCol;

      const scenarioHeight = Math.max(
        65,
        doc.heightOfString(scenario, {
          width: valueCol - 12,
          fontSize: 7
        }) + 16
      );

      ensureSpace(scenarioHeight + 200);

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        scenarioHeight,
        "Skenario Tugas Praktik Demonstrasi :",
        {
          bold: true,
          valign: "top",
          fontSize: 6.8
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        valueCol,
        scenarioHeight,
        scenario,
        {
          valign: "top",
          fontSize: 7,
          padding: 6
        }
      );

      currentY += scenarioHeight;

      const langkahHeight = Math.max(
        65,
        doc.heightOfString(langkah, {
          width: valueCol - 12,
          fontSize: 7
        }) + 16
      );

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        langkahHeight,
        "Langkah Kerja :",
        {
          bold: true,
          valign: "top",
          fontSize: 6.8
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        valueCol,
        langkahHeight,
        langkah,
        {
          valign: "top",
          fontSize: 7,
          padding: 6
        }
      );

      currentY += langkahHeight;

      const equipmentHeight = Math.max(
        65,
        doc.heightOfString(peralatan, {
          width: valueCol - 12,
          fontSize: 7
        }) + 16
      );

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        equipmentHeight,
        "Perlengkapan dan Peralatan :",
        {
          bold: true,
          valign: "top",
          fontSize: 6.8
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        valueCol,
        equipmentHeight,
        peralatan,
        {
          valign: "top",
          fontSize: 7,
          padding: 6
        }
      );

      currentY += equipmentHeight;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        30,
        "Waktu :",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        valueCol,
        30,
        durasi,
        {}
      );

      currentY += 38;
    };

    const drawSignatureSection = () => {
      ensureSpace(285);

      const labelCol = 150;
      const colonCol = 20;
      const valueCol = CONTENT_WIDTH - labelCol - colonCol;

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
        labelCol,
        32,
        "Nama",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        colonCol,
        32,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        32,
        namaAsesi,
        {}
      );

      currentY += 32;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        90,
        "Tanda tangan dan Tanggal",
        {
          bold: true,
          valign: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        colonCol,
        90,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        90,
        "",
        {
          padding: 0
        }
      );

      drawSignature(
        ttdAsesi,
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        65
      );

      doc.font("Helvetica").fontSize(7).text(
        tanggal,
        MARGIN_LEFT + labelCol + colonCol,
        currentY + 70,
        {
          width: valueCol,
          align: "center"
        }
      );

      currentY += 100;

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
        labelCol,
        32,
        "Nama",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        colonCol,
        32,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        32,
        namaAsesor,
        {}
      );

      currentY += 32;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        32,
        "No. Reg",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        colonCol,
        32,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        32,
        noRegAsesor,
        {}
      );

      currentY += 32;

      drawCell(
        MARGIN_LEFT,
        currentY,
        labelCol,
        90,
        "Tanda tangan dan Tanggal",
        {
          bold: true,
          valign: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol,
        currentY,
        colonCol,
        90,
        ":",
        {
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        90,
        "",
        {
          padding: 0
        }
      );

      drawSignature(
        ttdAsesor,
        MARGIN_LEFT + labelCol + colonCol,
        currentY,
        valueCol,
        65
      );

      doc.font("Helvetica").fontSize(7).text(
        tanggal,
        MARGIN_LEFT + labelCol + colonCol,
        currentY + 70,
        {
          width: valueCol,
          align: "center"
        }
      );

      currentY += 100;
    };

    const drawValidatorSection = () => {
      const penyusun = validators.filter(
        (item) => String(item.peran || "").toLowerCase() === "penyusun"
      );

      const validator = validators.filter(
        (item) => String(item.peran || "").toLowerCase() === "validator"
      );

      ensureSpace(220);

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        25,
        "PENYUSUN DAN VALIDATOR",
        {
          bold: true
        }
      );

      currentY += 25;

      const statusCol = 85;
      const noCol = 32;
      const nameCol = 170;
      const metCol = 110;
      const signCol = CONTENT_WIDTH - statusCol - noCol - nameCol - metCol;
      const headerHeight = 32;
      const rowHeight = 55;

      drawCell(
        MARGIN_LEFT,
        currentY,
        statusCol,
        headerHeight,
        "STATUS",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + statusCol,
        currentY,
        noCol,
        headerHeight,
        "NO.",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + statusCol + noCol,
        currentY,
        nameCol,
        headerHeight,
        "NAMA",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + statusCol + noCol + nameCol,
        currentY,
        metCol,
        headerHeight,
        "NOMOR MET",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT + statusCol + noCol + nameCol + metCol,
        currentY,
        signCol,
        headerHeight,
        "TANDA TANGAN\nDAN TANGGAL",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += headerHeight;

      const drawRows = (items, status) => {
        items.forEach((item, index) => {
          if (currentY + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
            doc.addPage();
            currentY = MARGIN_TOP;
            drawTitle();
          }

          const profile = item.asesor || {};
          const nama = profile.nama_lengkap || "-";
          const nomorMet = profile.no_lisensi || profile.no_reg_asesor || "-";
          const ttd = profile.ttd_path || "";

          drawCell(
            MARGIN_LEFT,
            currentY,
            statusCol,
            rowHeight,
            status,
            {
              bold: true,
              align: "center"
            }
          );

          drawCell(
            MARGIN_LEFT + statusCol,
            currentY,
            noCol,
            rowHeight,
            index + 1,
            {
              align: "center"
            }
          );

          drawCell(
            MARGIN_LEFT + statusCol + noCol,
            currentY,
            nameCol,
            rowHeight,
            nama,
            {}
          );

          drawCell(
            MARGIN_LEFT + statusCol + noCol + nameCol,
            currentY,
            metCol,
            rowHeight,
            nomorMet,
            {
              align: "center"
            }
          );

          drawCell(
            MARGIN_LEFT + statusCol + noCol + nameCol + metCol,
            currentY,
            signCol,
            rowHeight,
            "",
            {
              padding: 0
            }
          );

          drawSignature(
            ttd,
            MARGIN_LEFT + statusCol + noCol + nameCol + metCol,
            currentY,
            signCol,
            rowHeight - 14
          );

          doc.font("Helvetica").fontSize(6.3).text(
            formatTanggal(item.tanggal || data.tanggal),
            MARGIN_LEFT + statusCol + noCol + nameCol + metCol,
            currentY + rowHeight - 13,
            {
              width: signCol,
              align: "center"
            }
          );

          currentY += rowHeight;
        });
      };

      if (!validators.length) {
        drawCell(
          MARGIN_LEFT,
          currentY,
          CONTENT_WIDTH,
          rowHeight,
          "Data penyusun dan validator belum tersedia.",
          {
            align: "center"
          }
        );

        currentY += rowHeight;
        return;
      }

      drawRows(penyusun, "Penyusun");
      drawRows(validator, "Validator");
    };

    drawTitle();
    drawHeader();
    drawPetunjuk();

    if (!groups.length) {
      ensureSpace(60);

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        50,
        "Data skenario tugas praktik belum tersedia.",
        {
          align: "center"
        }
      );

      currentY += 60;
    } else {
      groups.forEach((group, index) => {
        drawGroup(group, index);
      });
    }

    drawSignatureSection();
    drawValidatorSection();
    drawPageNumber();
    doc.end();
  } catch (err) {
    console.error("DOWNLOAD PDF FR.IA.02 ERROR:", err);

    if (res.headersSent || res.writableEnded) {
      return;
    }

    return res.status(500).json({
      success: false,
      message: "Gagal membuat PDF FR.IA.02",
      error: err.message
    });
  }
};

exports.deleteFrIa02 = async (req, res) => {
  try {
    const id = req.params.id;

    await FrIa02Detail.destroy({
      where: {
        id_fr_ia_02: id
      }
    });

    await FrIa02Validator.destroy({
      where: {
        id_fr_ia_02: id
      }
    });

    await FrIa02.destroy({
      where: {
        id_fr_ia_02: id
      }
    });

    res.json({
      message: "deleted"
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const getPengujiContext = async (req, idJadwal, idPeserta) => {
  const assessorId = req.user.id_user || req.user.id;

  const assignment = await JadwalAsesor.findOne({
    where: {
      id_jadwal: idJadwal,
      id_user: assessorId,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    }
  });

  if (!assignment) {
    const error = new Error("Anda bukan asesor penguji pada jadwal ini");
    error.status = 403;
    throw error;
  }

  const peserta = await PesertaJadwal.findOne({
    where: {
      id_peserta: idPeserta,
      id_jadwal: idJadwal
    }
  });

  if (!peserta) {
    const error = new Error("Peserta tidak ditemukan pada jadwal ini");
    error.status = 404;
    throw error;
  }

  return {
    assessorId,
    peserta
  };
};

const findCommitteeSource = async (idJadwal, idUserAsesi) => {
  const committeeAssignments = await JadwalAsesor.findAll({
    where: {
      id_jadwal: idJadwal,
      jenis_tugas: "komite_teknis",
      status: "aktif"
    },
    attributes: ["id_user"]
  });

  const committeeIds = committeeAssignments.map((item) => item.id_user);

  if (!committeeIds.length) {
    return null;
  }

  return FrIa02.findOne({
    where: {
      id_jadwal: idJadwal,
      id_asesi: idUserAsesi,
      id_asesor: committeeIds
    },
    include: [
      {
        model: FrIa02Detail,
        as: "detail",
        include: [
          {
            model: KelompokPekerjaan,
            as: "kelompok"
          }
        ]
      },
      {
        model: FrIa02Validator,
        as: "validator",
        include: [
          {
            model: ProfileAsesor,
            as: "asesor",
            attributes: [
              "id_user",
              "nama_lengkap",
              "no_lisensi",
              "no_reg_asesor",
              "ttd_path"
            ]
          }
        ]
      }
    ],
    order: [
      ["created_at", "DESC"]
    ]
  });
};

const findPengujiRecord = async (idJadwal, idUserAsesi, assessorId) => {
  return FrIa02.findOne({
    where: {
      id_jadwal: idJadwal,
      id_asesi: idUserAsesi,
      id_asesor: assessorId
    },
    include: [
      {
        model: FrIa02Detail,
        as: "detail",
        include: [
          {
            model: KelompokPekerjaan,
            as: "kelompok"
          }
        ]
      },
      {
        model: FrIa02Validator,
        as: "validator",
        include: [
          {
            model: ProfileAsesor,
            as: "asesor",
            attributes: [
              "id_user",
              "nama_lengkap",
              "no_lisensi",
              "no_reg_asesor",
              "ttd_path"
            ]
          }
        ]
      }
    ],
    order: [
      ["created_at", "DESC"]
    ]
  });
};

const formatFrIa02Penguji = async (
  record,
  idJadwal,
  idUserAsesi,
  assessorId,
  approved
) => {
  if (!record) {
    return null;
  }

  const jadwal = await Jadwal.findByPk(idJadwal, {
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
  });

  const asesor = await ProfileAsesor.findByPk(assessorId, {
    attributes: [
      "id_user",
      "nama_lengkap",
      "no_reg_asesor",
      "ttd_path"
    ]
  });

  const asesi = await ProfileAsesi.findByPk(idUserAsesi, {
    attributes: [
      "id_user",
      "nama_lengkap",
      "ttd_path"
    ]
  });

  const groups = [];
  const groupIndex = new Map();

  for (const item of record.detail || []) {
    const key = String(item.id_kelompok);

    if (!groupIndex.has(key)) {
      const group = {
        id_kelompok: item.id_kelompok,
        kelompok_pekerjaan: item.kelompok?.nama_kelompok || "-",
        units: [],
        skenario_tugas: item.skenario || "",
        langkah_kerja: item.langkah_kerja || "",
        perlengkapan_peralatan: item.peralatan || "",
        waktu: item.durasi || ""
      };

      groupIndex.set(key, groups.length);
      groups.push(group);
    }

    const group = groups[groupIndex.get(key)];

    group.units.push({
      kode_unit: item.kode_unit || "",
      judul_unit: item.judul_unit || "",
      urutan: item.urutan || group.units.length + 1
    });

    if (!group.skenario_tugas) {
      group.skenario_tugas = item.skenario || "";
    }

    if (!group.langkah_kerja) {
      group.langkah_kerja = item.langkah_kerja || "";
    }

    if (!group.perlengkapan_peralatan) {
      group.perlengkapan_peralatan = item.peralatan || "";
    }

    if (!group.waktu) {
      group.waktu = item.durasi || "";
    }
  }

  const penyusun = [];
  const validator = [];

  for (const item of record.validator || []) {
    const reviewer = {
      id_user: item.id_asesor,
      nama: item.asesor?.nama_lengkap || "",
      nomor_met: item.asesor?.no_lisensi || item.asesor?.no_reg_asesor || "",
      ttd: item.asesor?.ttd_path || "",
      tanggal: record.tanggal || ""
    };

    if (String(item.peran || "").toLowerCase() === "penyusun") {
      penyusun.push(reviewer);
    } else {
      validator.push(reviewer);
    }
  }

  return {
    id_fr_ia_02: record.id_fr_ia_02,
    approved,
    tanggal: record.tanggal || "",
    skema: jadwal?.skema || {},
    tuk: jadwal?.tuk?.nama_tuk || jadwal?.tuk?.nama || "",
    nama_asesor: asesor?.nama_lengkap || "",
    no_reg_asesor: asesor?.no_reg_asesor || "",
    ttd_asesor: asesor?.ttd_path || "",
    nama_asesi: asesi?.nama_lengkap || "",
    ttd_asesi: asesi?.ttd_path || "",
    kelompok: groups,
    penyusun,
    validator
  };
};

exports.getFrIa02Penguji = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_peserta
    } = req.params;

    const {
      assessorId,
      peserta
    } = await getPengujiContext(
      req,
      id_jadwal,
      id_peserta
    );

    let record = await findPengujiRecord(
      id_jadwal,
      peserta.id_user,
      assessorId
    );

    let approved = Boolean(record);

    if (!record) {
      record = await findCommitteeSource(
        id_jadwal,
        peserta.id_user
      );

      approved = false;
    }

    if (!record) {
      return res.status(404).json({
        message: "FR.IA.02 dari Komite Teknis belum tersedia untuk peserta ini"
      });
    }

    const result = await formatFrIa02Penguji(
      record,
      id_jadwal,
      peserta.id_user,
      assessorId,
      approved
    );

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Gagal memuat FR.IA.02 Penguji"
    });
  }
};

exports.accFrIa02Penguji = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_peserta
    } = req.params;

    const {
      assessorId,
      peserta
    } = await getPengujiContext(
      req,
      id_jadwal,
      id_peserta
    );

    const source = await findCommitteeSource(
      id_jadwal,
      peserta.id_user
    );

    if (!source) {
      return res.status(404).json({
        message: "FR.IA.02 Komite Teknis belum tersedia untuk peserta ini"
      });
    }

    let target = await findPengujiRecord(
      id_jadwal,
      peserta.id_user,
      assessorId
    );

    if (!target) {
      target = await FrIa02.create({
        id_jadwal: Number(id_jadwal),
        id_skema: source.id_skema,
        id_tuk: source.id_tuk,
        id_asesor: assessorId,
        id_asesi: peserta.id_user,
        tanggal: source.tanggal,
        created_by: assessorId
      });
    } else {
      await target.update({
        id_skema: source.id_skema,
        id_tuk: source.id_tuk,
        tanggal: source.tanggal,
        updated_at: new Date()
      });
    }

    await FrIa02Detail.destroy({
      where: {
        id_fr_ia_02: target.id_fr_ia_02
      }
    });

    await FrIa02Validator.destroy({
      where: {
        id_fr_ia_02: target.id_fr_ia_02
      }
    });

    if ((source.detail || []).length) {
      await FrIa02Detail.bulkCreate(
        source.detail.map((item) => ({
          id_fr_ia_02: target.id_fr_ia_02,
          id_kelompok: item.id_kelompok,
          kode_unit: item.kode_unit,
          judul_unit: item.judul_unit,
          urutan: item.urutan,
          skenario: item.skenario,
          langkah_kerja: item.langkah_kerja,
          peralatan: item.peralatan,
          durasi: item.durasi
        }))
      );
    }

    if ((source.validator || []).length) {
      await FrIa02Validator.bulkCreate(
        source.validator.map((item) => ({
          id_fr_ia_02: target.id_fr_ia_02,
          id_asesor: item.id_asesor,
          peran: item.peran,
          urutan: item.urutan
        }))
      );
    }

    const result = await formatFrIa02Penguji(
      target,
      id_jadwal,
      peserta.id_user,
      assessorId,
      true
    );

    res.json({
      message: "FR.IA.02 berhasil di-ACC",
      data: result
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Gagal melakukan ACC FR.IA.02"
    });
  }
};