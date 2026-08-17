const {
  FrAk02,
  FrAk02Detail,
  JadwalAsesor,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  SkemaUnit,
  UnitKompetensi,
  ProfileAsesi,
  ProfileAsesor,
  User
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getName = (profile, user) => {
  return profile?.nama_lengkap || profile?.nama || user?.nama_lengkap || user?.nama || user?.username || "-";
};

const getTukType = (tuk) => {
  const value = String(tuk?.jenis_tuk || tuk?.jenis || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (value.includes("sewaktu")) return "sewaktu";
  if (value.includes("tempat")) return "tempat_kerja";
  if (value.includes("mandiri")) return "mandiri";
  return "";
};

const getUnitsBySkema = async (id_skema) => {
  if (!id_skema) return [];

  const relations = await SkemaUnit.findAll({
    where: { id_skema },
    order: [["urutan", "ASC"]]
  });

  if (!relations.length) return [];

  const unitIds = [...new Set(relations.map((item) => Number(item.id_unit)).filter(Boolean))];

  const units = await UnitKompetensi.findAll({
    where: { id_unit: unitIds }
  });

  const unitMap = new Map(units.map((unit) => [Number(unit.id_unit), unit]));

  return relations.map((relation) => {
    const unit = unitMap.get(Number(relation.id_unit));

    if (!unit) return null;

    return {
      id_unit: unit.id_unit,
      kode_unit: unit.kode_unit,
      judul_unit: unit.judul_unit,
      urutan: relation.urutan
    };
  }).filter(Boolean);
};

const getContext = async (id_jadwal, id_peserta, id_asesor) => {
  const jadwal = await Jadwal.findByPk(id_jadwal);

  if (!jadwal) return null;

  const peserta = await PesertaJadwal.findOne({
    where: {
      id_jadwal,
      id_peserta
    }
  });

  if (!peserta) {
    return {
      jadwal,
      peserta: null
    };
  }

  const [skema, tuk, user, profileAsesi, profileAsesor] = await Promise.all([
    Skema.findByPk(jadwal.id_skema),
    Tuk.findByPk(jadwal.id_tuk),
    User.findByPk(peserta.id_user),
    ProfileAsesi.findByPk(peserta.id_user),
    ProfileAsesor.findByPk(id_asesor)
  ]);

  return {
    jadwal,
    peserta,
    skema,
    tuk,
    user,
    profileAsesi,
    profileAsesor
  };
};

const getEmptyDetail = (unit) => {
  return {
    id_detail: null,
    id_unit: unit.id_unit,
    kode_unit: unit.kode_unit,
    judul_unit: unit.judul_unit,
    urutan: unit.urutan,
    observasi: false,
    portofolio: false,
    pihak_ketiga: false,
    wawancara: false,
    lisan: false,
    tertulis: false,
    proyek: false,
    lainnya: false
  };
};

const normalizeDetails = (units, savedDetails) => {
  const map = new Map(savedDetails.map((item) => [Number(item.id_unit), item]));

  return units.map((unit) => {
    const saved = map.get(Number(unit.id_unit));

    if (!saved) {
      return getEmptyDetail(unit);
    }

    return {
      id_detail: saved.id_detail || null,
      id_unit: unit.id_unit,
      kode_unit: unit.kode_unit,
      judul_unit: unit.judul_unit,
      urutan: unit.urutan,
      observasi: Boolean(saved.observasi),
      portofolio: Boolean(saved.portofolio),
      pihak_ketiga: Boolean(saved.pihak_ketiga),
      wawancara: Boolean(saved.wawancara),
      lisan: Boolean(saved.lisan),
      tertulis: Boolean(saved.tertulis),
      proyek: Boolean(saved.proyek),
      lainnya: Boolean(saved.lainnya)
    };
  });
};

const getFrAk02 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;
    const id_asesor = Number(req.user.id_user);

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan ID peserta wajib dikirim"
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini"
      });
    }

    const context = await getContext(Number(id_jadwal), Number(id_peserta), id_asesor);

    if (!context) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    if (!context.peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const units = await getUnitsBySkema(context.jadwal.id_skema);

    const existing = await FrAk02.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      order: [["id_fr_ak02", "DESC"]]
    });

    let savedDetails = [];

    if (existing) {
      savedDetails = await FrAk02Detail.findAll({
        where: {
          id_fr_ak02: existing.id_fr_ak02
        },
        include: [
          {
            model: UnitKompetensi,
            as: "unit",
            required: false
          }
        ],
        order: [["id_detail", "ASC"]]
      });
    }

    const normalizedDetails = normalizeDetails(units, savedDetails);
    const fr = existing ? existing.toJSON() : {};

    return res.json({
      success: true,
      data: {
        id_fr_ak02: fr.id_fr_ak02 || null,
        exists: Boolean(existing),
        id_jadwal: Number(id_jadwal),
        id_peserta: Number(id_peserta),
        id_asesor,
        skema: context.skema?.toJSON?.() || context.skema || {},
        tuk: context.tuk?.toJSON?.() || context.tuk || {},
        jadwal: context.jadwal?.toJSON?.() || context.jadwal || {},
        asesi: {
          ...(context.profileAsesi?.toJSON?.() || context.profileAsesi || {}),
          nama_lengkap: context.profileAsesi?.nama_lengkap || context.user?.nama_lengkap || context.user?.nama || context.user?.username || "",
          ttd_path: context.profileAsesi?.ttd_path || ""
        },
        asesor: {
          ...(context.profileAsesor?.toJSON?.() || context.profileAsesor || {}),
          nama_lengkap: context.profileAsesor?.nama_lengkap || "",
          no_reg_asesor: context.profileAsesor?.no_reg_asesor || "",
          ttd_path: context.profileAsesor?.ttd_path || ""
        },
        tanggal_mulai: fr.tanggal_mulai || context.jadwal?.tgl_awal || "",
        tanggal_selesai: fr.tanggal_selesai || context.jadwal?.tgl_akhir || "",
        rekomendasi: fr.rekomendasi || "",
        tindak_lanjut: fr.tindak_lanjut || "",
        komentar_asesor: fr.komentar_asesor || "",
        ttd_asesor: fr.ttd_asesor || context.profileAsesor?.ttd_path || "",
        detail: normalizedDetails
      }
    });
  } catch (err) {
    console.error("GET FR.AK.02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const submitFrAk02 = async (req, res) => {
  try {
    const id_asesor = Number(req.user.id_user);
    const {
      id_jadwal,
      id_peserta,
      tanggal_mulai,
      tanggal_selesai,
      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor,
      detail
    } = req.body;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan peserta wajib diisi"
      });
    }

    if (!Array.isArray(detail) || detail.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Unit kompetensi wajib tersedia"
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini"
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
        message: "Peserta tidak ditemukan"
      });
    }

    const existing = await FrAk02.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FR.AK.02 sudah tersedia",
        data: {
          id_fr_ak02: existing.id_fr_ak02
        }
      });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);

    const header = await FrAk02.create({
      id_jadwal: Number(id_jadwal),
      id_peserta: Number(id_peserta),
      id_asesor,
      tanggal_mulai: tanggal_mulai || null,
      tanggal_selesai: tanggal_selesai || null,
      rekomendasi: rekomendasi || null,
      tindak_lanjut: tindak_lanjut || null,
      komentar_asesor: komentar_asesor || null,
      ttd_asesor: ttd_asesor || asesor?.ttd_path || ""
    });

    const detailData = detail.filter((item) => item?.id_unit).map((item) => ({
      id_fr_ak02: header.id_fr_ak02,
      id_unit: Number(item.id_unit),
      observasi: Boolean(item.observasi),
      portofolio: Boolean(item.portofolio),
      pihak_ketiga: Boolean(item.pihak_ketiga),
      wawancara: Boolean(item.wawancara),
      lisan: Boolean(item.lisan),
      tertulis: Boolean(item.tertulis),
      proyek: Boolean(item.proyek),
      lainnya: Boolean(item.lainnya)
    }));

    if (detailData.length) {
      await FrAk02Detail.bulkCreate(detailData);
    }

    return res.status(201).json({
      success: true,
      message: "FR.AK.02 berhasil disimpan",
      data: {
        id_fr_ak02: header.id_fr_ak02
      }
    });
  } catch (err) {
    console.error("SUBMIT FR.AK.02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const updateFrAk02 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_asesor = Number(req.user.id_user);
    const {
      tanggal_mulai,
      tanggal_selesai,
      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor,
      detail
    } = req.body;

    const frAk02 = await FrAk02.findByPk(id);

    if (!frAk02) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.02 tidak ditemukan"
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal: frAk02.id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah FR.AK.02 ini"
      });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);

    await frAk02.update({
      tanggal_mulai: tanggal_mulai !== undefined ? tanggal_mulai || null : frAk02.tanggal_mulai,
      tanggal_selesai: tanggal_selesai !== undefined ? tanggal_selesai || null : frAk02.tanggal_selesai,
      rekomendasi: rekomendasi !== undefined ? rekomendasi || null : frAk02.rekomendasi,
      tindak_lanjut: tindak_lanjut !== undefined ? tindak_lanjut || null : frAk02.tindak_lanjut,
      komentar_asesor: komentar_asesor !== undefined ? komentar_asesor || null : frAk02.komentar_asesor,
      ttd_asesor: ttd_asesor || frAk02.ttd_asesor || asesor?.ttd_path || ""
    });

    if (Array.isArray(detail)) {
      for (const item of detail) {
        if (!item?.id_unit) continue;

        const payload = {
          observasi: Boolean(item.observasi),
          portofolio: Boolean(item.portofolio),
          pihak_ketiga: Boolean(item.pihak_ketiga),
          wawancara: Boolean(item.wawancara),
          lisan: Boolean(item.lisan),
          tertulis: Boolean(item.tertulis),
          proyek: Boolean(item.proyek),
          lainnya: Boolean(item.lainnya)
        };

        const existingDetail = await FrAk02Detail.findOne({
          where: {
            id_fr_ak02: Number(id),
            id_unit: Number(item.id_unit)
          }
        });

        if (existingDetail) {
          await existingDetail.update(payload);
        } else {
          await FrAk02Detail.create({
            id_fr_ak02: Number(id),
            id_unit: Number(item.id_unit),
            ...payload
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "FR.AK.02 berhasil diperbarui",
      data: {
        id_fr_ak02: Number(id)
      }
    });
  } catch (err) {
    console.error("UPDATE FR.AK.02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const listFrAk02 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrAk02.findAll({
      where: {
        id_jadwal
      },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta"
        }
      ],
      order: [
        ["tanggal_mulai", "DESC"],
        ["id_fr_ak02", "DESC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error("LIST FR.AK.02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const generatePdfFrAk02 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;

    const data = await FrAk02.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      include: [
        {
          model: FrAk02Detail,
          as: "detail",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            }
          ],
          order: [["id_detail", "ASC"]]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.02 tidak ditemukan"
      });
    }

    const context = await getContext(Number(id_jadwal), Number(id_peserta), Number(data.id_asesor));

    if (!context || !context.peserta) {
      return res.status(404).json({
        success: false,
        message: "Data peserta FR.AK.02 tidak ditemukan"
      });
    }

    const details = await FrAk02Detail.findAll({
      where: {
        id_fr_ak02: data.id_fr_ak02
      },
      include: [
        {
          model: UnitKompetensi,
          as: "unit",
          required: false
        }
      ],
      order: [["id_detail", "ASC"]]
    });

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 23;
    const MARGIN_RIGHT = 23;
    const MARGIN_TOP = 24;
    const MARGIN_BOTTOM = 24;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=FR-AK02-${id_peserta}.pdf`);

    doc.pipe(res);

    const safe = (value) => {
      return value === null || value === undefined || value === "" ? "-" : String(value);
    };

    const formatTanggal = (value) => {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return String(value);

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
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

      doc.save().lineWidth(0.65).strokeColor("#000000").rect(x, y, width, height).stroke().restore();
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
        doc.save().lineWidth(1.25).lineCap("round").lineJoin("round").strokeColor("#000000")
          .moveTo(boxX + 1.6, boxY + 4.6)
          .lineTo(boxX + 4, boxY + 7.2)
          .lineTo(boxX + 7.5, boxY + 2)
          .stroke()
          .restore();
      }
    };

    const drawTukOption = (x, y, width, checked, label) => {
      const boxSize = 8;
      const gap = 3;
      const labelWidth = width - boxSize - gap;
      const groupWidth = boxSize + gap + labelWidth;
      const groupX = x + (width - groupWidth) / 2;
      const centerY = y + 14;
      const boxY = centerY - boxSize / 2;

      doc.save().lineWidth(0.75).strokeColor("#000000").rect(groupX, boxY, boxSize, boxSize).stroke().restore();

      if (checked) {
        doc.save().lineWidth(1.15).lineCap("round").lineJoin("round").strokeColor("#000000")
          .moveTo(groupX + 1.2, boxY + 4.1)
          .lineTo(groupX + 3.5, boxY + 6.4)
          .lineTo(groupX + 6.9, boxY + 1.7)
          .stroke()
          .restore();
      }

      doc.font("Helvetica").fontSize(7).text(label, groupX + boxSize + gap, centerY - 4, {
        width: labelWidth,
        lineBreak: false
      });
    };

    const drawRotatedHeader = (text, x, y, width, height) => {
      doc.save();
      doc.translate(x + width / 2, y + height / 2);
      doc.rotate(270);
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#000000").text(text, -height / 2 + 4, -3, {
        width: height - 8,
        align: "center",
        lineGap: 0
      });
      doc.restore();
    };

    const drawSignature = (value, x, y, width, height) => {
      const signaturePath = normalizeSignaturePath(value);

      if (!signaturePath || !fs.existsSync(signaturePath)) return;

      try {
        const imageWidth = Math.min(145, width - 16);
        const imageHeight = Math.min(52, height - 10);
        const imageX = x + (width - imageWidth) / 2;
        const imageY = y + 5;

        doc.image(signaturePath, imageX, imageY, {
          fit: [imageWidth, imageHeight],
          align: "center",
          valign: "center"
        });
      } catch (error) {}
    };

    const drawPageNumber = () => {
      const range = doc.bufferedPageRange();

      if (!range || range.count <= 1) return;

      for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica").fontSize(6.5).fillColor("#555555").text(
          `Halaman ${pageIndex - range.start + 1} dari ${range.count}`,
          MARGIN_LEFT,
          PAGE_HEIGHT - 14,
          {
            width: CONTENT_WIDTH,
            align: "center",
            lineBreak: false
          }
        );
      }

      doc.fillColor("#000000");
    };

    const addPageIfNeeded = (requiredHeight) => {
      if (currentY + requiredHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        currentY = MARGIN_TOP;
        drawPageTitle();
      }
    };

    const drawPageTitle = () => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000").text(
        "FR.AK.02. REKAMAN ASESMEN KOMPETENSI",
        MARGIN_LEFT,
        currentY,
        {
          width: CONTENT_WIDTH,
          align: "center"
        }
      );
      currentY += 19;
    };

    const namaAsesi = getName(context.profileAsesi, context.user);
    const namaAsesor = context.profileAsesor?.nama_lengkap || context.profileAsesor?.nama || "-";
    const tanggalMulai = formatTanggal(data.tanggal_mulai || context.jadwal?.tgl_awal);
    const tanggalSelesai = formatTanggal(data.tanggal_selesai || context.jadwal?.tgl_akhir);
    const rekomendasi = data.rekomendasi === "kompeten" ? "Kompeten" : data.rekomendasi === "belum_kompeten" ? "Belum Kompeten" : "-";

    let currentY = MARGIN_TOP;

    doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000").text(
      "FR.AK.02. REKAMAN ASESMEN KOMPETENSI",
      MARGIN_LEFT,
      currentY,
      {
        width: CONTENT_WIDTH,
        align: "center"
      }
    );

    currentY += 24;

    const headerCol1 = 180;
    const headerCol2 = 125;
    const headerCol3 = CONTENT_WIDTH - headerCol1 - headerCol2;
    const headerRow = 28;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow * 2, "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)", {
      bold: true,
      valign: "center"
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2, headerRow, "Judul :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRow, context.skema?.judul_skema || "-", {});

    drawCell(MARGIN_LEFT + headerCol1, currentY + headerRow, headerCol2, headerRow, "Nomor :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY + headerRow, headerCol3, headerRow, context.skema?.kode_skema || "-", {});

    currentY += headerRow * 2;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow, "TUK :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2 + headerCol3, headerRow, "", {
      padding: 0
    });

    const tukWidth = (headerCol2 + headerCol3) / 3;
    const tukType = getTukType(context.tuk);

    drawTukOption(MARGIN_LEFT + headerCol1, currentY, tukWidth, tukType === "sewaktu", "Sewaktu");
    drawTukOption(MARGIN_LEFT + headerCol1 + tukWidth, currentY, tukWidth, tukType === "tempat_kerja", "Tempat Kerja");
    drawTukOption(MARGIN_LEFT + headerCol1 + tukWidth * 2, currentY, tukWidth, tukType === "mandiri", "Mandiri");

    currentY += headerRow;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow, "Nama Asesor :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2 + headerCol3, headerRow, namaAsesor, {});

    currentY += headerRow;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow, "Nama Asesi :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2 + headerCol3, headerRow, namaAsesi, {});

    currentY += headerRow;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow, "Tanggal Asesmen", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2, headerRow, "Mulai :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRow, tanggalMulai, {});

    currentY += headerRow;

    drawCell(MARGIN_LEFT, currentY, headerCol1, headerRow, "", {
      padding: 0
    });

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2, headerRow, "Selesai :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRow, tanggalSelesai, {});

    currentY += headerRow + 7;

    doc.font("Helvetica").fontSize(6.8).fillColor("#000000").text(
      "Beri tanda centang (✓) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi Asesi untuk setiap Unit Kompetensi",
      MARGIN_LEFT,
      currentY,
      {
        width: CONTENT_WIDTH,
        lineGap: 0
      }
    );

    currentY += 19;

    addPageIfNeeded(145);

    const unitCol = 225;
    const evidenceCol = (CONTENT_WIDTH - unitCol) / 8;
    const unitHeaderHeight = 105;
    const unitRowMinHeight = 42;

    drawCell(MARGIN_LEFT, currentY, unitCol, unitHeaderHeight, "Unit Kompetensi", {
      bold: true,
      align: "center",
      valign: "center"
    });

    const evidenceHeaders = [
      "Observasi\nDemonstrasi",
      "Portofolio",
      "Pernyataan\nPihak Ketiga",
      "Wawancara",
      "Pertanyaan\nLisan",
      "Pertanyaan\nTertulis",
      "Proyek\nKerja",
      "Lainnya"
    ];

    evidenceHeaders.forEach((header, index) => {
      const x = MARGIN_LEFT + unitCol + evidenceCol * index;
      drawCell(x, currentY, evidenceCol, unitHeaderHeight, "", {
        padding: 0
      });
      drawRotatedHeader(header, x, currentY, evidenceCol, unitHeaderHeight);
    });

    currentY += unitHeaderHeight;

    const renderUnitRow = (item) => {
      const judul = `${item.unit?.kode_unit || item.kode_unit || "-"} - ${item.unit?.judul_unit || item.judul_unit || "-"}`;
      const textHeight = doc.heightOfString(judul, {
        width: unitCol - 10,
        fontSize: 6.8
      });
      const rowHeight = Math.max(unitRowMinHeight, textHeight + 12);

      drawCell(MARGIN_LEFT, currentY, unitCol, rowHeight, judul, {
        fontSize: 6.8,
        valign: "center"
      });

      const checks = [
        item.observasi,
        item.portofolio,
        item.pihak_ketiga,
        item.wawancara,
        item.lisan,
        item.tertulis,
        item.proyek,
        item.lainnya
      ];

      checks.forEach((checked, index) => {
        const x = MARGIN_LEFT + unitCol + evidenceCol * index;
        drawCell(x, currentY, evidenceCol, rowHeight, "", {
          padding: 0
        });
        drawCheckbox(x, currentY, evidenceCol, rowHeight, Boolean(checked), 9);
      });

      currentY += rowHeight;
    };

    if (!details.length) {
      drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 45, "Unit kompetensi belum tersedia.", {
        align: "center"
      });
      currentY += 45;
    } else {
      for (const item of details) {
        if (currentY + unitRowMinHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
          doc.addPage();
          currentY = MARGIN_TOP;
          drawPageTitle();

          drawCell(MARGIN_LEFT, currentY, unitCol, unitHeaderHeight, "Unit Kompetensi", {
            bold: true,
            align: "center",
            valign: "center"
          });

          evidenceHeaders.forEach((header, index) => {
            const x = MARGIN_LEFT + unitCol + evidenceCol * index;
            drawCell(x, currentY, evidenceCol, unitHeaderHeight, "", {
              padding: 0
            });
            drawRotatedHeader(header, x, currentY, evidenceCol, unitHeaderHeight);
          });

          currentY += unitHeaderHeight;
        }

        renderUnitRow(item);
      }
    }

    addPageIfNeeded(110);

    drawCell(MARGIN_LEFT, currentY, unitCol, 45, "Rekomendasi hasil asesmen", {
      bold: true,
      valign: "center"
    });

    drawCell(MARGIN_LEFT + unitCol, currentY, CONTENT_WIDTH - unitCol, 45, "", {
      padding: 0
    });

    const recommendationWidth = (CONTENT_WIDTH - unitCol) / 2;

    drawCheckbox(MARGIN_LEFT + unitCol, currentY, recommendationWidth, 45, data.rekomendasi === "kompeten", 10);

    doc.font("Helvetica").fontSize(7).text(
      "Kompeten",
      MARGIN_LEFT + unitCol + recommendationWidth / 2 + 8,
      currentY + 18,
      {
        width: recommendationWidth / 2 - 12
      }
    );

    drawCheckbox(
      MARGIN_LEFT + unitCol + recommendationWidth,
      currentY,
      recommendationWidth,
      45,
      data.rekomendasi === "belum_kompeten",
      10
    );

    doc.font("Helvetica").fontSize(7).text(
      "Belum kompeten",
      MARGIN_LEFT + unitCol + recommendationWidth + recommendationWidth / 2 + 8,
      currentY + 18,
      {
        width: recommendationWidth / 2 - 12
      }
    );

    currentY += 45;

    const followLabel = 185;

    const followHeight = Math.max(
      75,
      doc.heightOfString(data.tindak_lanjut || "-", {
        width: CONTENT_WIDTH - followLabel - 12,
        fontSize: 6.8
      }) + 14
    );

    addPageIfNeeded(followHeight);

    drawCell(MARGIN_LEFT, currentY, followLabel, followHeight, "Tindak lanjut yang dibutuhkan\n(Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)", {
      bold: true,
      valign: "top",
      fontSize: 6.6
    });

    drawCell(MARGIN_LEFT + followLabel, currentY, CONTENT_WIDTH - followLabel, followHeight, data.tindak_lanjut || "-", {
      valign: "top",
      fontSize: 6.8,
      padding: 6
    });

    currentY += followHeight;

    const commentHeight = Math.max(
      60,
      doc.heightOfString(data.komentar_asesor || "-", {
        width: CONTENT_WIDTH - followLabel - 12,
        fontSize: 6.8
      }) + 14
    );

    addPageIfNeeded(commentHeight);

    drawCell(MARGIN_LEFT, currentY, followLabel, commentHeight, "Komentar / Observasi oleh asesor", {
      bold: true,
      valign: "top",
      fontSize: 6.8
    });

    drawCell(MARGIN_LEFT + followLabel, currentY, CONTENT_WIDTH - followLabel, commentHeight, data.komentar_asesor || "-", {
      valign: "top",
      fontSize: 6.8,
      padding: 6
    });

    currentY += commentHeight + 10;

    addPageIfNeeded(245);

    const signatureLabel = 120;
    const signatureValue = CONTENT_WIDTH - signatureLabel;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 26, "Asesi :", {
      bold: true
    });

    currentY += 26;

    drawCell(MARGIN_LEFT, currentY, signatureLabel, 38, "Nama", {});

    drawCell(MARGIN_LEFT + signatureLabel, currentY, 20, 38, ":", {
      align: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel + 20, currentY, signatureValue - 20, 38, namaAsesi, {});

    currentY += 38;

    const signatureBodyHeight = 82;

    drawCell(MARGIN_LEFT, currentY, signatureLabel, signatureBodyHeight, "Tanda tangan dan\nTanggal", {
      valign: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel, currentY, 20, signatureBodyHeight, ":", {
      align: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel + 20, currentY, signatureValue - 20, signatureBodyHeight, "", {
      padding: 0
    });

    drawSignature(
      context.profileAsesi?.ttd_path,
      MARGIN_LEFT + signatureLabel + 20,
      currentY,
      signatureValue - 20,
      signatureBodyHeight - 20
    );

    doc.font("Helvetica").fontSize(6.8).text(
      tanggalSelesai,
      MARGIN_LEFT + signatureLabel + 20,
      currentY + signatureBodyHeight - 17,
      {
        width: signatureValue - 20,
        align: "center"
      }
    );

    currentY += signatureBodyHeight + 10;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 26, "Asesor :", {
      bold: true
    });

    currentY += 26;

    drawCell(MARGIN_LEFT, currentY, signatureLabel, 38, "Nama", {});

    drawCell(MARGIN_LEFT + signatureLabel, currentY, 20, 38, ":", {
      align: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel + 20, currentY, signatureValue - 20, 38, namaAsesor, {});

    currentY += 38;

    drawCell(MARGIN_LEFT, currentY, signatureLabel, 38, "No. Reg.", {});

    drawCell(MARGIN_LEFT + signatureLabel, currentY, 20, 38, ":", {
      align: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel + 20, currentY, signatureValue - 20, 38, context.profileAsesor?.no_reg_asesor || "-", {});

    currentY += 38;

    drawCell(MARGIN_LEFT, currentY, signatureLabel, signatureBodyHeight, "Tanda tangan dan\nTanggal", {
      valign: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel, currentY, 20, signatureBodyHeight, ":", {
      align: "center"
    });

    drawCell(MARGIN_LEFT + signatureLabel + 20, currentY, signatureValue - 20, signatureBodyHeight, "", {
      padding: 0
    });

    drawSignature(
      data.ttd_asesor || context.profileAsesor?.ttd_path,
      MARGIN_LEFT + signatureLabel + 20,
      currentY,
      signatureValue - 20,
      signatureBodyHeight - 20
    );

    doc.font("Helvetica").fontSize(6.8).text(
      tanggalSelesai,
      MARGIN_LEFT + signatureLabel + 20,
      currentY + signatureBodyHeight - 17,
      {
        width: signatureValue - 20,
        align: "center"
      }
    );

    currentY += signatureBodyHeight + 14;

    addPageIfNeeded(90);

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 24, "LAMPIRAN DOKUMEN:", {
      bold: true
    });

    currentY += 24;

    const attachments = [
      "Dokumen APL 01 peserta",
      "Dokumen APL 02 peserta",
      "Bukti-bukti berkualitas peserta",
      "Tinjauan proses asesmen"
    ];

    attachments.forEach((item, index) => {
      drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 21, `${index + 1}. ${item}`, {
        fontSize: 6.8,
        padding: 4
      });
      currentY += 21;
    });

    drawPageNumber();
    doc.end();
  } catch (err) {
    console.error("PDF FR.AK.02 ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};

module.exports = {
  getFrAk02,
  submitFrAk02,
  updateFrAk02,
  listFrAk02,
  generatePdfFrAk02
};