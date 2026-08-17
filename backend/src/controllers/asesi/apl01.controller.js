const {
  Apl01Asesmen,
  Apl01Dokumen,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  Persyaratan,
  SkemaPersyaratan,
  ProfileAsesi,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
  KelompokPekerjaan
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const toPlain = (data) => {
  if (!data) {
    return null;
  }

  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

const getUnitFull = async (id_unit) => {
  const unitData = await UnitKompetensi.findByPk(id_unit);

  if (!unitData) {
    return null;
  }

  const unit = toPlain(unitData);
  const elemenData = await UnitElemen.findAll({
    where: { id_unit },
    order: [["urutan", "ASC"]]
  });

  const elemen = [];

  for (const item of elemenData) {
    const plainElemen = toPlain(item);
    const kukData = await UnitKuk.findAll({
      where: { id_elemen: plainElemen.id_elemen },
      order: [["urutan", "ASC"]]
    });

    elemen.push({
      ...plainElemen,
      kuk: kukData.map((x) => toPlain(x))
    });
  }

  return {
    ...unit,
    elemen
  };
};

const getUnitKompetensiBySkema = async (id_skema) => {
  if (!id_skema) {
    return [];
  }

  const relasi = await SkemaUnit.findAll({
    where: { id_skema },
    order: [["urutan", "ASC"]]
  });

  const result = [];

  for (const item of relasi) {
    const rel = toPlain(item);
    const unit = await getUnitFull(rel.id_unit);

    if (!unit) {
      continue;
    }

    result.push({
      ...unit,
      skema_unit: {
        id_skema: safeNumber(rel.id_skema),
        id_unit: safeNumber(rel.id_unit),
        urutan: safeNumber(rel.urutan)
      }
    });
  }

  return result;
};

const formatDokumenWithUrl = (req, dokumen = []) => {
  const baseUrl = getBaseUrl(req);

  return dokumen.map((item) => ({
    ...item,
    file_url: item.file_path ? `${baseUrl}/${item.file_path}` : null
  }));
};

exports.getFormApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const id_user = req.user.id_user || req.user.id;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

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
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const profile = await ProfileAsesi.findByPk(peserta.id_user);
    const persyaratan = await SkemaPersyaratan.findAll({
      where: {
        id_skema: peserta.jadwal.id_skema
      },
      include: [
        {
          model: Persyaratan,
          as: "persyaratan"
        }
      ],
      order: [["id_persyaratan", "ASC"]]
    });

    const persyaratanDasar = persyaratan.filter(
      (item) =>
        item.persyaratan &&
        item.persyaratan.jenis_persyaratan === "dasar"
    );

    const persyaratanAdministratif = persyaratan.filter(
      (item) =>
        item.persyaratan &&
        item.persyaratan.jenis_persyaratan === "administratif"
    );

    return res.status(200).json({
      success: true,
      data: {
        peserta: peserta.toJSON(),
        profile: profile ? profile.toJSON() : null,
        jadwal: peserta.jadwal ? peserta.jadwal.toJSON() : null,
        skema: peserta.jadwal?.skema ? peserta.jadwal.skema.toJSON() : null,
        tuk: peserta.jadwal?.tuk ? peserta.jadwal.tuk.toJSON() : null,
        persyaratanDasar,
        persyaratanAdministratif
      }
    });
  } catch (err) {
    console.error("GET FORM APL01:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.createApl01 = async (req, res) => {
  try {
    const id_user = req.user.id_user || req.user.id;
    const { id_peserta, tujuan_asesmen, tujuan_lainnya } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

    const tujuanValid = [
      "sertifikasi",
      "sertifikasi_ulang",
      "pkk",
      "rpl",
      "lainnya"
    ];

    if (!tujuan_asesmen || !tujuanValid.includes(tujuan_asesmen)) {
      return res.status(400).json({
        success: false,
        message: "Tujuan asesmen tidak valid"
      });
    }

    if (tujuan_asesmen === "lainnya" && !tujuan_lainnya) {
      return res.status(400).json({
        success: false,
        message: "Tujuan lainnya wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal"
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    if (!peserta.jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal asesmen tidak ditemukan"
      });
    }

    const existing = await Apl01Asesmen.findOne({
      where: { id_peserta }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "APL.01 sudah pernah dibuat",
        data: existing.toJSON()
      });
    }

    const apl01 = await Apl01Asesmen.create({
      id_peserta,
      id_jadwal: peserta.id_jadwal,
      id_skema: peserta.jadwal.id_skema,
      tujuan_asesmen,
      tujuan_lainnya: tujuan_asesmen === "lainnya" ? tujuan_lainnya : null,
      status: "draft"
    });

    return res.status(201).json({
      success: true,
      message: "APL.01 berhasil dibuat",
      data: apl01.toJSON()
    });
  } catch (err) {
    console.error("CREATE APL01:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.uploadDokumenApl01 = async (req, res) => {
  try {
    const {
      id_apl01,
      id_persyaratan,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    const file = req.files?.file_dokumen?.[0];

    if (!id_apl01 || !id_persyaratan) {
      return res.status(400).json({
        success: false,
        message: "id_apl01 dan id_persyaratan wajib diisi"
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File dokumen wajib diupload"
      });
    }

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    if (apl01.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.01 sudah disubmit dan tidak dapat diubah"
      });
    }

    const persyaratan = await Persyaratan.findByPk(id_persyaratan);

    if (!persyaratan) {
      return res.status(404).json({
        success: false,
        message: "Persyaratan tidak ditemukan"
      });
    }

    const payload = {
      id_apl01,
      id_persyaratan,
      nomor_dokumen: nomor_dokumen || null,
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path.replace(/\\/g, "/")
    };

    let dokumen = await Apl01Dokumen.findOne({
      where: {
        id_apl01,
        id_persyaratan
      }
    });

    if (dokumen) {
      if (dokumen.file_path) {
        const oldFile = path.join(process.cwd(), dokumen.file_path);

        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }

      await dokumen.update(payload);
      await dokumen.reload();
    } else {
      dokumen = await Apl01Dokumen.create(payload);
    }

    return res.status(200).json({
      success: true,
      message: "Dokumen berhasil disimpan",
      data: dokumen.toJSON()
    });
  } catch (err) {
    console.error("UPLOAD DOKUMEN APL01:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const id_user = req.user.id_user || req.user.id;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

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
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const profile = await ProfileAsesi.findByPk(peserta.id_user);
    const apl01 = await Apl01Asesmen.findOne({
      where: { id_peserta },
      include: [
        {
          model: Apl01Dokumen,
          as: "dokumen",
          include: [
            {
              model: Persyaratan,
              as: "persyaratan"
            }
          ]
        }
      ]
    });

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 belum dibuat"
      });
    }

    const data = apl01.toJSON();
    data.dokumen = formatDokumenWithUrl(req, data.dokumen);

    return res.status(200).json({
      success: true,
      data: {
        apl01: data,
        peserta: peserta.toJSON(),
        profile: profile ? profile.toJSON() : null,
        jadwal: peserta.jadwal ? peserta.jadwal.toJSON() : null,
        skema: peserta.jadwal?.skema ? peserta.jadwal.skema.toJSON() : null,
        tuk: peserta.jadwal?.tuk ? peserta.jadwal.tuk.toJSON() : null
      }
    });
  } catch (err) {
    console.error("GET APL01:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.submitFinalApl01 = async (req, res) => {
  try {
    const { id_apl01 } = req.params;
    const id_user = req.user.id_user || req.user.id;
    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta: apl01.id_peserta,
        id_user
      }
    });

    if (!peserta) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses"
      });
    }

    if (apl01.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.01 sudah disubmit"
      });
    }

    const persyaratanWajib = await SkemaPersyaratan.findAll({
      where: {
        id_skema: apl01.id_skema,
        wajib: true
      }
    });

    const dokumen = await Apl01Dokumen.findAll({
      where: { id_apl01 }
    });

    const uploadedIds = dokumen.map((item) => item.id_persyaratan);
    const missing = persyaratanWajib.filter(
      (item) => !uploadedIds.includes(item.id_persyaratan)
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada dokumen persyaratan yang belum diupload",
        missing
      });
    }

    const profile = await ProfileAsesi.findByPk(peserta.id_user);

    if (!profile || !profile.ttd_path) {
      return res.status(400).json({
        success: false,
        message: "Silakan upload tanda tangan terlebih dahulu"
      });
    }

    await apl01.update({
      status: "submit"
    });

    return res.status(200).json({
      success: true,
      message: "APL.01 berhasil disubmit",
      data: apl01.toJSON()
    });
  } catch (err) {
    console.error("SUBMIT APL01:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.generatePdfApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const id_user = req.user.id_user || req.user.id;

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
        }
      ]
    });

    if (!peserta) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses"
      });
    }

    const profile = await ProfileAsesi.findByPk(peserta.id_user);
    const apl01 = await Apl01Asesmen.findOne({
      where: { id_peserta },
      include: [
        {
          model: Apl01Dokumen,
          as: "dokumen",
          include: [
            {
              model: Persyaratan,
              as: "persyaratan"
            }
          ]
        }
      ]
    });

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    const persyaratanRows = await SkemaPersyaratan.findAll({
      where: {
        id_skema: apl01.id_skema
      },
      include: [
        {
          model: Persyaratan,
          as: "persyaratan"
        }
      ],
      order: [["id_persyaratan", "ASC"]]
    });

    const dokumenMap = new Map(
      (apl01.dokumen || []).map((item) => [
        Number(item.id_persyaratan),
        item
      ])
    );

    const requirements = persyaratanRows.map((item) => ({
      id_persyaratan: item.id_persyaratan,
      nama_persyaratan: item.persyaratan?.nama_persyaratan || "-",
      jenis_persyaratan: item.persyaratan?.jenis_persyaratan || "-",
      wajib: Boolean(item.wajib),
      dokumen: dokumenMap.get(Number(item.id_persyaratan)) || null
    }));

    const dasar = requirements.filter(
      (item) => item.jenis_persyaratan === "dasar"
    );

    const administratif = requirements.filter(
      (item) => item.jenis_persyaratan === "administratif"
    );

    const lainnya = requirements.filter(
      (item) =>
        item.jenis_persyaratan !== "dasar" &&
        item.jenis_persyaratan !== "administratif"
    );

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
        Title: `APL.01 - ${profile?.nama_lengkap || "Asesi"}`
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=APL01-${id_peserta}.pdf`
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

    const getFileName = (value) => {
      if (!value) {
        return "-";
      }

      return path.basename(String(value).replace(/\\/g, "/"));
    };

    const getFileUrl = (item) => {
      if (item?.file_url) {
        return item.file_url;
      }

      if (!item?.file_path) {
        return "";
      }

      return `${getBaseUrl(req)}/${String(item.file_path).replace(/^[/\\]+/, "")}`;
    };

    const drawCell = (x, y, width, height, text = "", options = {}) => {
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

      doc.save().lineWidth(0.7).strokeColor("#000000").rect(
        x,
        y,
        width,
        height
      ).stroke().restore();

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

    const drawCheckbox = (x, y, width, height, checked) => {
      const boxSize = 9;
      const boxX = x + (width - boxSize) / 2;
      const boxY = y + (height - boxSize) / 2;

      doc.save().lineWidth(0.8).strokeColor("#000000").rect(
        boxX,
        boxY,
        boxSize,
        boxSize
      ).stroke().restore();

      if (checked) {
        doc.save()
          .lineWidth(1.1)
          .lineCap("round")
          .lineJoin("round")
          .strokeColor("#000000")
          .moveTo(boxX + 1.2, boxY + 4.8)
          .lineTo(boxX + 4, boxY + 7)
          .lineTo(boxX + 7.7, boxY + 1.8)
          .stroke()
          .restore();
      }
    };

    const drawWajibCell = (x, y, width, height, checked) => {
      const boxSize = 9;
      const labelWidth = 22;
      const groupWidth = boxSize + labelWidth + 5;
      const startX = x + (width - groupWidth) / 2;
      const boxY = y + (height - boxSize) / 2;

      drawCheckbox(
        startX,
        boxY,
        boxSize,
        boxSize,
        checked
      );

      doc
        .font("Helvetica")
        .fontSize(6.2)
        .fillColor("#000000")
        .text(
          checked ? "Ya" : "Tidak",
          startX + boxSize + 5,
          boxY + 1,
          {
            width: labelWidth,
            lineBreak: false
          }
        );
    };

    const drawSectionTitle = (title, currentY) => {
      drawCell(
        LEFT,
        currentY,
        CONTENT_WIDTH,
        23,
        title,
        {
          bold: true,
          fontSize: 8,
          align: "center",
          fill: "#E5E7EB"
        }
      );

      return currentY + 23;
    };

    const drawRequirementHeader = (currentY) => {
      const noWidth = 28;
      const requirementWidth = 168;
      const typeWidth = 70;
      const wajibWidth = 52;
      const numberWidth = 88;
      const dateWidth = 76;
      const statusWidth = CONTENT_WIDTH - noWidth - requirementWidth - typeWidth - wajibWidth - numberWidth - dateWidth;
      const headerHeight = 38;

      drawCell(LEFT, currentY, noWidth, headerHeight, "No.", {
        bold: true,
        align: "center",
        fontSize: 6.2
      });

      drawCell(
        LEFT + noWidth,
        currentY,
        requirementWidth,
        headerHeight,
        "Persyaratan",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth,
        currentY,
        typeWidth,
        headerHeight,
        "Jenis",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + typeWidth,
        currentY,
        wajibWidth,
        headerHeight,
        "Wajib",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + typeWidth + wajibWidth,
        currentY,
        numberWidth,
        headerHeight,
        "Nomor Dokumen",
        {
          bold: true,
          align: "center",
          fontSize: 6
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + typeWidth + wajibWidth + numberWidth,
        currentY,
        dateWidth,
        headerHeight,
        "Tanggal",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + typeWidth + wajibWidth + numberWidth + dateWidth,
        currentY,
        statusWidth,
        headerHeight,
        "Status",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      return {
        noWidth,
        requirementWidth,
        typeWidth,
        wajibWidth,
        numberWidth,
        dateWidth,
        statusWidth,
        nextY: currentY + headerHeight
      };
    };

    const drawRequirementTable = (rows, currentY) => {
      if (!rows.length) {
        drawCell(
          LEFT,
          currentY,
          CONTENT_WIDTH,
          40,
          "Belum ada data persyaratan.",
          {
            align: "center",
            fontSize: 7
          }
        );

        return currentY + 40;
      }

      let columns = drawRequirementHeader(currentY);
      currentY = columns.nextY;

      rows.forEach((item, index) => {
        const requirementHeight = doc.heightOfString(
          safe(item.nama_persyaratan),
          {
            width: columns.requirementWidth - 8,
            fontSize: 6,
            lineGap: 0
          }
        );

        const numberText = item.dokumen?.nomor_dokumen || "-";
        const numberHeight = doc.heightOfString(safe(numberText), {
          width: columns.numberWidth - 8,
          fontSize: 5.7,
          lineGap: 0
        });

        const rowHeight = Math.max(
          46,
          requirementHeight + 14,
          numberHeight + 14
        );

        if (currentY + rowHeight > PAGE_HEIGHT - BOTTOM) {
          doc.addPage();
          currentY = TOP;

          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(
              "APL.01 - PERSYARATAN DOKUMEN",
              LEFT,
              currentY,
              {
                width: CONTENT_WIDTH,
                align: "center"
              }
            );

          currentY += 20;
          columns = drawRequirementHeader(currentY);
          currentY = columns.nextY;
        }

        drawCell(
          LEFT,
          currentY,
          columns.noWidth,
          rowHeight,
          String(index + 1),
          {
            align: "center",
            valign: "center",
            fontSize: 6
          }
        );

        drawCell(
          LEFT + columns.noWidth,
          currentY,
          columns.requirementWidth,
          rowHeight,
          item.nama_persyaratan,
          {
            valign: "center",
            fontSize: 6,
            padding: 4
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth,
          currentY,
          columns.typeWidth,
          rowHeight,
          item.jenis_persyaratan,
          {
            align: "center",
            valign: "center",
            fontSize: 5.7
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.typeWidth,
          currentY,
          columns.wajibWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        drawWajibCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.typeWidth,
          currentY,
          columns.wajibWidth,
          rowHeight,
          Boolean(item.wajib)
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.typeWidth + columns.wajibWidth,
          currentY,
          columns.numberWidth,
          rowHeight,
          numberText,
          {
            align: "center",
            valign: "center",
            fontSize: 5.8,
            padding: 4
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.typeWidth + columns.wajibWidth + columns.numberWidth,
          currentY,
          columns.dateWidth,
          rowHeight,
          formatTanggal(item.dokumen?.tanggal_dokumen),
          {
            align: "center",
            valign: "center",
            fontSize: 5.7
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.typeWidth + columns.wajibWidth + columns.numberWidth + columns.dateWidth,
          currentY,
          columns.statusWidth,
          rowHeight,
          item.dokumen ? "Lengkap" : item.wajib ? "Belum Ada" : "Opsional",
          {
            bold: true,
            align: "center",
            valign: "center",
            fontSize: 5.8
          }
        );

        currentY += rowHeight;
      });

      return currentY;
    };

    const drawUploadedHeader = (currentY) => {
      const noWidth = 28;
      const requirementWidth = 168;
      const numberWidth = 100;
      const dateWidth = 76;
      const fileWidth = CONTENT_WIDTH - noWidth - requirementWidth - numberWidth - dateWidth;
      const headerHeight = 35;

      drawCell(
        LEFT,
        currentY,
        noWidth,
        headerHeight,
        "No.",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth,
        currentY,
        requirementWidth,
        headerHeight,
        "Persyaratan",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth,
        currentY,
        numberWidth,
        headerHeight,
        "Nomor Dokumen",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + numberWidth,
        currentY,
        dateWidth,
        headerHeight,
        "Tanggal",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      drawCell(
        LEFT + noWidth + requirementWidth + numberWidth + dateWidth,
        currentY,
        fileWidth,
        headerHeight,
        "File",
        {
          bold: true,
          align: "center",
          fontSize: 6.2
        }
      );

      return {
        noWidth,
        requirementWidth,
        numberWidth,
        dateWidth,
        fileWidth,
        nextY: currentY + headerHeight
      };
    };

    const drawUploadedTable = (rows, currentY) => {
      if (!rows.length) {
        drawCell(
          LEFT,
          currentY,
          CONTENT_WIDTH,
          45,
          "Belum ada dokumen yang diupload.",
          {
            align: "center",
            fontSize: 7
          }
        );

        return currentY + 45;
      }

      let columns = drawUploadedHeader(currentY);
      currentY = columns.nextY;

      rows.forEach((item, index) => {
        const requirementName = item.persyaratan?.nama_persyaratan || "-";
        const fileName = getFileName(item.file_path);
        const fileUrl = getFileUrl(item);

        const requirementHeight = doc.heightOfString(
          safe(requirementName),
          {
            width: columns.requirementWidth - 8,
            fontSize: 5.8,
            lineGap: 0
          }
        );

        const numberHeight = doc.heightOfString(
          safe(item.nomor_dokumen || "-"),
          {
            width: columns.numberWidth - 8,
            fontSize: 5.8,
            lineGap: 0
          }
        );

        const fileHeight = doc.heightOfString(
          safe(fileName),
          {
            width: columns.fileWidth - 8,
            fontSize: 5.5,
            lineGap: 0
          }
        );

        const rowHeight = Math.max(
          48,
          requirementHeight + 14,
          numberHeight + 14,
          fileHeight + 14
        );

        if (currentY + rowHeight > PAGE_HEIGHT - BOTTOM) {
          doc.addPage();
          currentY = TOP;

          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(
              "APL.01 - DOKUMEN YANG DIUPLOAD",
              LEFT,
              currentY,
              {
                width: CONTENT_WIDTH,
                align: "center"
              }
            );

          currentY += 20;
          columns = drawUploadedHeader(currentY);
          currentY = columns.nextY;
        }

        drawCell(
          LEFT,
          currentY,
          columns.noWidth,
          rowHeight,
          String(index + 1),
          {
            align: "center",
            valign: "center",
            fontSize: 6
          }
        );

        drawCell(
          LEFT + columns.noWidth,
          currentY,
          columns.requirementWidth,
          rowHeight,
          requirementName,
          {
            align: "left",
            valign: "center",
            fontSize: 5.8
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth,
          currentY,
          columns.numberWidth,
          rowHeight,
          item.nomor_dokumen || "-",
          {
            align: "center",
            valign: "center",
            fontSize: 5.8
          }
        );

        drawCell(
          LEFT + columns.noWidth + columns.requirementWidth + columns.numberWidth,
          currentY,
          columns.dateWidth,
          rowHeight,
          formatTanggal(item.tanggal_dokumen),
          {
            align: "center",
            valign: "center",
            fontSize: 5.7
          }
        );

        const fileX = LEFT + columns.noWidth + columns.requirementWidth + columns.numberWidth + columns.dateWidth;
        const fileY = currentY;
        const filePadding = 5;
        const fileTextWidth = columns.fileWidth - filePadding * 2;

        drawCell(
          fileX,
          fileY,
          columns.fileWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        doc
          .font("Helvetica")
          .fontSize(5.5)
          .fillColor("#2563EB");

        const fileTextHeight = doc.heightOfString(fileName, {
          width: fileTextWidth,
          align: "center",
          lineGap: 0
        });

        const fileTextY = fileY + Math.max(
          filePadding,
          (rowHeight - fileTextHeight) / 2
        );

        doc.text(
          fileName,
          fileX + filePadding,
          fileTextY,
          {
            width: fileTextWidth,
            align: "center",
            lineGap: 0,
            underline: true,
            link: fileUrl || undefined
          }
        );

        if (fileUrl) {
          doc.link(
            fileX + filePadding,
            fileTextY,
            fileTextWidth,
            Math.max(fileTextHeight, 8),
            fileUrl
          );
        }

        doc.fillColor("#000000");
        currentY += rowHeight;
      });

      return currentY;
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

    const namaAsesi = profile?.nama_lengkap || "-";
    const nomorPeserta = peserta.nomor_peserta || "-";
    const idPeserta = safe(peserta.id_peserta);
    const idJadwal = safe(peserta.id_jadwal);
    const namaKegiatan = peserta.jadwal?.nama_kegiatan || peserta.jadwal?.nama || "-";
    const namaSkema = peserta.jadwal?.skema?.judul_skema || "-";
    const kodeSkema = peserta.jadwal?.skema?.kode_skema || "-";
    const namaTuk = peserta.jadwal?.tuk?.nama_tuk || "-";
    const jenisTuk = peserta.jadwal?.tuk?.jenis_tuk || peserta.jadwal?.tuk?.jenis || "-";
    const tanggalAwal = peserta.jadwal?.tgl_awal || null;
    const tanggalAkhir = peserta.jadwal?.tgl_akhir || null;

    const tujuanMap = {
      sertifikasi: "Sertifikasi",
      sertifikasi_ulang: "Sertifikasi Ulang",
      pkk: "Pengakuan Kompetensi Kerja",
      rpl: "Rekognisi Pembelajaran Lampau",
      lainnya: "Lainnya"
    };

    let currentY = TOP;

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(
        "FORMULIR APL.01",
        LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 20;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "FORMULIR PERMOHONAN SERTIFIKASI KOMPETENSI",
        LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 25;

    const infoLabelWidth = 145;
    const infoSeparatorWidth = 18;
    const infoValueWidth = CONTENT_WIDTH - infoLabelWidth - infoSeparatorWidth;

    const drawInfoRow = (label, value) => {
      const textHeight = doc.heightOfString(safe(value), {
        width: infoValueWidth - 8,
        fontSize: 6.7
      });

      const rowHeight = Math.max(23, textHeight + 10);

      drawCell(
        LEFT,
        currentY,
        infoLabelWidth,
        rowHeight,
        label,
        {
          bold: true,
          fontSize: 6.8
        }
      );

      drawCell(
        LEFT + infoLabelWidth,
        currentY,
        infoSeparatorWidth,
        rowHeight,
        ":",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        LEFT + infoLabelWidth + infoSeparatorWidth,
        currentY,
        infoValueWidth,
        rowHeight,
        value,
        {
          fontSize: 6.8
        }
      );

      currentY += rowHeight;
    };

    drawInfoRow("Nama Asesi", namaAsesi);
    drawInfoRow("Nomor Peserta", nomorPeserta);
    drawInfoRow("ID Peserta", idPeserta);
    drawInfoRow("ID Jadwal", idJadwal);
    drawInfoRow("Nama Kegiatan", namaKegiatan);
    drawInfoRow("Skema Sertifikasi", namaSkema);
    drawInfoRow("Kode Skema", kodeSkema);
    drawInfoRow("TUK", namaTuk);
    drawInfoRow("Jenis TUK", jenisTuk);
    drawInfoRow("Tanggal Awal", formatTanggal(tanggalAwal));
    drawInfoRow("Tanggal Akhir", formatTanggal(tanggalAkhir));
    drawInfoRow(
      "Status APL.01",
      apl01.status === "submit" ? "SUBMITTED" : "DRAFT"
    );

    currentY += 12;

    if (currentY + 80 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("TUJUAN ASESMEN", currentY);

    const tujuanValue = tujuanMap[apl01.tujuan_asesmen] || safe(apl01.tujuan_asesmen);
    const tujuanDetail =
      apl01.tujuan_asesmen === "lainnya" && apl01.tujuan_lainnya
        ? `${tujuanValue} - ${apl01.tujuan_lainnya}`
        : tujuanValue;

    const tujuanHeight = Math.max(
      40,
      doc.heightOfString(tujuanDetail, {
        width: CONTENT_WIDTH - 170,
        fontSize: 6.7
      }) + 14
    );

    drawCell(
      LEFT,
      currentY,
      150,
      tujuanHeight,
      "Tujuan Asesmen",
      {
        bold: true,
        fontSize: 7
      }
    );

    drawCell(
      LEFT + 150,
      currentY,
      CONTENT_WIDTH - 150,
      tujuanHeight,
      tujuanDetail,
      {
        fontSize: 6.7
      }
    );

    currentY += tujuanHeight + 12;

    if (currentY + 80 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("PERSYARATAN DOKUMEN", currentY);

    if (dasar.length) {
      drawCell(
        LEFT,
        currentY,
        CONTENT_WIDTH,
        20,
        "PERSYARATAN DASAR",
        {
          bold: true,
          fontSize: 7,
          fill: "#F1F5F9"
        }
      );

      currentY += 20;
      currentY = drawRequirementTable(dasar, currentY);
      currentY += 10;
    }

    if (administratif.length) {
      if (currentY + 60 > PAGE_HEIGHT - BOTTOM) {
        doc.addPage();
        currentY = TOP;
      }

      drawCell(
        LEFT,
        currentY,
        CONTENT_WIDTH,
        20,
        "PERSYARATAN ADMINISTRATIF",
        {
          bold: true,
          fontSize: 7,
          fill: "#F1F5F9"
        }
      );

      currentY += 20;
      currentY = drawRequirementTable(administratif, currentY);
      currentY += 10;
    }

    if (lainnya.length) {
      if (currentY + 60 > PAGE_HEIGHT - BOTTOM) {
        doc.addPage();
        currentY = TOP;
      }

      drawCell(
        LEFT,
        currentY,
        CONTENT_WIDTH,
        20,
        "PERSYARATAN LAINNYA",
        {
          bold: true,
          fontSize: 7,
          fill: "#F1F5F9"
        }
      );

      currentY += 20;
      currentY = drawRequirementTable(lainnya, currentY);
      currentY += 10;
    }

    currentY += 8;

    if (currentY + 70 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("DOKUMEN YANG DIUPLOAD", currentY);
    currentY = drawUploadedTable(apl01.dokumen || [], currentY);
    currentY += 14;

    if (currentY + 160 > PAGE_HEIGHT - BOTTOM) {
      doc.addPage();
      currentY = TOP;
    }

    currentY = drawSectionTitle("TANDA TANGAN ASESI", currentY);

    const signatureHalf = CONTENT_WIDTH / 2;
    const signatureHeaderHeight = 25;
    const signatureBodyHeight = 105;

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
      "Tanda Tangan dan Tanggal",
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
      namaAsesi,
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
      profile?.ttd_path,
      LEFT + signatureHalf + 10,
      currentY + 4,
      signatureHalf - 20,
      60
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        formatTanggal(tanggalAwal || new Date()),
        LEFT + signatureHalf + 8,
        currentY + 82,
        {
          width: signatureHalf - 16,
          align: "center",
          lineBreak: false
        }
      );

    const pageRange = doc.bufferedPageRange();

    if (pageRange && pageRange.count > 1) {
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
    }

    doc.fillColor("#000000");
    doc.end();
  } catch (err) {
    console.error("GENERATE PDF APL01:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};