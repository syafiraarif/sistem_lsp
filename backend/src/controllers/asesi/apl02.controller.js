const {
  Apl02,
  Apl02Detail,
  Apl02Bukti,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


/*
=================================
GET FORM APL.02
=================================
*/

exports.getFormApl02 = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const skema = await Skema.findByPk(id_skema);

    if (!skema) {
      return res.status(404).json({
        success: false,
        message: "Skema tidak ditemukan"
      });
    }

    const units = await SkemaUnit.findAll({
      where: {
        id_skema
      },
      include: [
        {
          model: UnitKompetensi,
          as: "unit",
          include: [
            {
              model: UnitElemen,
              include: [
                {
                  model: UnitKuk
                }
              ]
            }
          ]
        }
      ],
      order: [
        ["urutan", "ASC"],
        [
          { model: UnitKompetensi, as: "unit" },
          "id_unit",
          "ASC"
        ],
        [
          { model: UnitKompetensi, as: "unit" },
          { model: UnitElemen },
          "urutan",
          "ASC"
        ],
        [
          { model: UnitKompetensi, as: "unit" },
          { model: UnitElemen },
          { model: UnitKuk },
          "urutan",
          "ASC"
        ]
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Form APL.02 berhasil diambil",
      data: {
        skema,
        units
      }
    });
  } catch (err) {
    console.error("GET FORM APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil form APL.02",
      error: err.message
    });
  }
};

/*
=================================
CREATE APL.02
=================================
*/

exports.createApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
          include: [
            {
              model: Skema,
              as: "skema"
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

    // Cek apakah APL.02 sudah pernah dibuat
    const existing = await Apl02.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "APL.02 sudah dibuat",
        data: existing
      });
    }

    // Buat header APL.02
    const apl02 = await Apl02.create({
      id_peserta,
      status: "draft"
    });

    return res.status(201).json({
      success: true,
      message: "APL.02 berhasil dibuat",
      data: apl02
    });

  } catch (err) {
    console.error("CREATE APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat APL.02",
      error: err.message
    });
  }
};

/*
=================================
SAVE PENILAIAN APL.02
=================================
*/

exports.savePenilaian = async (req, res) => {
  try {
    const {
      id_apl02,
      id_unit,
      id_elemen,
      kompeten,
      catatan
    } = req.body;

    // Validasi input
    if (!id_apl02 || !id_unit || !id_elemen || !kompeten) {
      return res.status(400).json({
        success: false,
        message: "Data penilaian belum lengkap."
      });
    }

    if (!["K", "BK"].includes(kompeten)) {
      return res.status(400).json({
        success: false,
        message: "Nilai kompeten harus K atau BK."
      });
    }

    // Cek header APL02
    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    if (apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit dan tidak dapat diubah."
      });
    }

    // Pastikan unit ada
    const unit = await UnitKompetensi.findByPk(id_unit);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit kompetensi tidak ditemukan."
      });
    }

    // Pastikan elemen ada
    const elemen = await UnitElemen.findByPk(id_elemen);

    if (!elemen) {
      return res.status(404).json({
        success: false,
        message: "Elemen kompetensi tidak ditemukan."
      });
    }

    // Cari apakah sudah pernah dinilai
    let detail = await Apl02Detail.findOne({
      where: {
        id_apl02,
        id_elemen
      }
    });

    if (detail) {
      await detail.update({
        id_unit,
        kompeten,
        catatan: catatan || "",
        updated_at: new Date()
      });
    } else {
      detail = await Apl02Detail.create({
        id_apl02,
        id_unit,
        id_elemen,
        kompeten,
        catatan: catatan || ""
      });
    }

    return res.status(200).json({
      success: true,
      message: "Penilaian berhasil disimpan.",
      data: detail
    });

  } catch (err) {
    console.error("SAVE PENILAIAN APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
UPLOAD BUKTI PORTOFOLIO
=================================
*/

exports.uploadBukti = async (req, res) => {
  try {
    const {
      id_detail,
      jenis_portofolio,
      nama_dokumen,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    const file = req.files?.file_bukti?.[0];

    if (!id_detail) {
      return res.status(400).json({
        success: false,
        message: "ID detail wajib diisi."
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File bukti wajib diupload."
      });
    }

    // cek detail
    const detail = await Apl02Detail.findByPk(id_detail, {
      include: [
        {
          model: Apl02,
          as: "apl02"
        }
      ]
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Detail APL.02 tidak ditemukan."
      });
    }

    // tidak boleh upload setelah submit
    if (detail.apl02 && detail.apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit sehingga bukti tidak dapat diubah."
      });
    }

    const payload = {
      id_detail,
      jenis_portofolio: jenis_portofolio || "",
      nama_dokumen: nama_dokumen || file.originalname,
      nomor_dokumen: nomor_dokumen || "",
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path.replace(/\\/g, "/")
    };

    // jika sudah ada dokumen dg nama yg sama -> update
    let bukti = await Apl02Bukti.findOne({
      where: {
        id_detail,
        nama_dokumen: payload.nama_dokumen
      }
    });

    if (bukti) {

      // hapus file lama
      if (
        bukti.file_path &&
        fs.existsSync(path.join(process.cwd(), bukti.file_path))
      ) {
        fs.unlinkSync(path.join(process.cwd(), bukti.file_path));
      }

      await bukti.update(payload);
      await bukti.reload();

    } else {

      bukti = await Apl02Bukti.create(payload);

    }

    return res.status(200).json({
      success: true,
      message: "Bukti portofolio berhasil disimpan.",
      data: bukti
    });

  } catch (err) {
    console.error("UPLOAD BUKTI APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengupload bukti.",
      error: err.message
    });
  }
};


/*
=================================
GET APL.02
=================================
*/
exports.getApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },
            {
              model: Jadwal,
              as: "jadwal",
              include: [
                {
                  model: Skema,
                  as: "skema"
                }
              ]
            }
          ]
        },
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: UnitElemen,
              as: "elemen"
            },
            {
              model: Apl02Bukti,
              as: "buktiTambahan"
            }
          ]
        }
      ],
      order: [
        [{ model: Apl02Detail, as: "detail" }, "id_detail", "ASC"]
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "APL.02 belum dibuat."
      });
    }

    const result = data.toJSON();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    result.detail = result.detail.map((detail) => ({
      ...detail,
      buktiTambahan: detail.buktiTambahan.map((bukti) => ({
        ...bukti,
        file_url: `${baseUrl}/${bukti.file_path}`
      }))
    }));

    return res.status(200).json({
      success: true,
      message: "Data APL.02 berhasil diambil.",
      data: result
    });

  } catch (err) {
    console.error("GET APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
DELETE BUKTI PORTOFOLIO
=================================
*/

exports.deleteBukti = async (req, res) => {
  try {
    const { id_bukti } = req.params;

    const bukti = await Apl02Bukti.findByPk(id_bukti, {
      include: [
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: Apl02,
              as: "apl02"
            }
          ]
        }
      ]
    });

    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: "Bukti portofolio tidak ditemukan."
      });
    }

    // Tidak boleh hapus jika sudah submit
    if (
      bukti.detail &&
      bukti.detail.apl02 &&
      bukti.detail.apl02.status !== "draft"
    ) {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit sehingga bukti tidak dapat dihapus."
      });
    }

    // Hapus file fisik
    if (bukti.file_path) {
      const filePath = path.join(process.cwd(), bukti.file_path);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await bukti.destroy();

    return res.status(200).json({
      success: true,
      message: "Bukti portofolio berhasil dihapus."
    });

  } catch (err) {
    console.error("DELETE BUKTI APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus bukti portofolio.",
      error: err.message
    });
  }
};

/*
=================================
SAVE REKOMENDASI
=================================
*/

exports.saveRekomendasi = async (req, res) => {
  try {
    const {
      id_apl02,
      rekomendasi_asesi,
      pendekatan_rekomendasi
    } = req.body;

    if (!id_apl02) {
      return res.status(400).json({
        success: false,
        message: "ID APL.02 wajib diisi."
      });
    }

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    if (apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit."
      });
    }

    await apl02.update({
      rekomendasi_asesi: rekomendasi_asesi || "",
      pendekatan_rekomendasi: pendekatan_rekomendasi || "",
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Rekomendasi berhasil disimpan.",
      data: apl02
    });

  } catch (err) {
    console.error("SAVE REKOMENDASI:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan rekomendasi.",
      error: err.message
    });
  }
};

/*
=================================
SUBMIT APL.02
=================================
*/

exports.submitApl02 = async (req, res) => {
  try {
    const { id_apl02 } = req.params;

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    if (apl02.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit."
      });
    }

    // Ambil seluruh detail
    const detail = await Apl02Detail.findAll({
      where: {
        id_apl02
      },
      include: [
        {
          model: Apl02Bukti,
          as: "buktiTambahan"
        }
      ]
    });

    if (detail.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Silakan isi penilaian terlebih dahulu."
      });
    }

    // Pastikan setiap penilaian memiliki bukti
    const belumLengkap = detail.filter(
      (item) => !item.buktiTambahan || item.buktiTambahan.length === 0
    );

    if (belumLengkap.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada penilaian yang belum memiliki bukti portofolio."
      });
    }

    await apl02.update({
      status: "submitted",
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "APL.02 berhasil disubmit."
    });

  } catch (err) {
    console.error("SUBMIT APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
GENERATE PDF APL.02
=================================
*/
exports.generatePdfApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },
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
        },
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: UnitElemen,
              as: "elemen"
            },
            {
              model: Apl02Bukti,
              as: "buktiTambahan"
            }
          ]
        }
      ],
      order: [[{ model: Apl02Detail, as: "detail" }, "id_detail", "ASC"]]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 24;
    const MARGIN_RIGHT = 24;
    const MARGIN_TOP = 24;
    const MARGIN_BOTTOM = 28;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      autoFirstPage: true,
      info: {
        Title: `APL.02 - ${data.peserta?.profileAsesi?.nama_lengkap || "Asesi"}`
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=APL02-${id_peserta}.pdf`);
    doc.pipe(res);

    const safe = (value) => {
      if (value === undefined || value === null || value === "") return "-";
      return String(value);
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

    const normalizeFilePath = (value) => {
      if (!value) return "";

      const stringValue = String(value);

      if (path.isAbsolute(stringValue) && fs.existsSync(stringValue)) {
        return stringValue;
      }

      const cleaned = stringValue.replace(/^[/\\]+/, "");
      const candidates = [
        path.join(process.cwd(), cleaned),
        path.join(process.cwd(), "uploads", cleaned.replace(/^uploads[/\\]/, "")),
        path.join(process.cwd(), "public", cleaned),
        path.join(__dirname, "../../../", cleaned)
      ];

      return candidates.find((filePath) => fs.existsSync(filePath)) || "";
    };

    const isImageFile = (filePath) => {
      const extension = path.extname(filePath || "").toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp"].includes(extension);
    };

    const drawCell = (x, y, width, height, text = "", options = {}) => {
      const { fontSize = 7, bold = false, align = "left", valign = "center", padding = 4, fill = null } = options;

      if (fill) {
        doc.save().fillColor(fill).rect(x, y, width, height).fill().restore();
      }

      doc.save().lineWidth(0.7).strokeColor("#000000").rect(x, y, width, height).stroke().restore();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).fillColor("#000000");

      const value = safe(text);
      const textWidth = Math.max(width - padding * 2, 6);
      const textHeight = doc.heightOfString(value, { width: textWidth, align });
      let textY = y + padding;

      if (valign === "center") textY = y + Math.max(padding, (height - textHeight) / 2);
      if (valign === "bottom") textY = y + height - textHeight - padding;

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

      doc.save().lineWidth(0.8).strokeColor("#000000").rect(boxX, boxY, boxSize, boxSize).stroke().restore();

      if (checked) {
        doc.save().lineWidth(1.15).lineCap("round").lineJoin("round").strokeColor("#000000").moveTo(boxX + 1.4, boxY + boxSize * 0.52).lineTo(boxX + boxSize * 0.42, boxY + boxSize * 0.82).lineTo(boxX + boxSize * 0.86, boxY + boxSize * 0.18).stroke().restore();
      }
    };

    const getEvidenceHeight = (evidence) => {
      if (!evidence?.length) return 52;

      let totalHeight = 8;

      evidence.forEach((file) => {
        const filePath = normalizeFilePath(file.file_path);
        totalHeight += filePath && isImageFile(filePath) ? 82 : 24;
      });

      return Math.max(52, totalHeight);
    };

    const drawEvidence = (evidence, x, y, width, height) => {
      if (!evidence?.length) {
        doc.font("Helvetica").fontSize(5.8).fillColor("#666666").text("Belum ada bukti", x + 4, y + height / 2 - 3, {
          width: width - 8,
          align: "center"
        });
        return;
      }

      let currentY = y + 5;

      evidence.forEach((file, index) => {
        const filePath = normalizeFilePath(file.file_path);

        if (filePath && isImageFile(filePath)) {
          const imageWidth = Math.min(width - 12, 105);
          const imageHeight = Math.min(58, height - 15);
          const imageX = x + (width - imageWidth) / 2;

          if (currentY + imageHeight > y + height - 12) return;

          try {
            doc.image(filePath, imageX, currentY, {
              fit: [imageWidth, imageHeight],
              align: "center",
              valign: "center"
            });

            currentY += imageHeight + 4;

            const fileName = file.nama_dokumen || file.nama_file || `Bukti ${index + 1}`;

            doc.font("Helvetica").fontSize(5).fillColor("#000000").text(fileName, x + 4, currentY, {
              width: width - 8,
              align: "center",
              lineBreak: false
            });

            currentY += 12;
          } catch (error) {
            doc.font("Helvetica").fontSize(5.5).fillColor("#666666").text(file.nama_dokumen || file.nama_file || `Bukti ${index + 1}`, x + 4, currentY, {
              width: width - 8,
              align: "center"
            });

            currentY += 18;
          }
        } else {
          const fileName = file.nama_dokumen || file.nama_file || `Bukti ${index + 1}`;

          doc.font("Helvetica").fontSize(5.3).fillColor("#000000").text(`${index + 1}. ${fileName}`, x + 4, currentY, {
            width: width - 8
          });

          currentY += 18;
        }
      });
    };

    const drawSignature = (value, x, y, width, height) => {
      const signaturePath = normalizeFilePath(value);

      if (!signaturePath || !fs.existsSync(signaturePath)) return;

      try {
        const imageWidth = Math.min(150, width - 16);
        const imageHeight = Math.min(55, height - 16);
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

    const ensureSpace = (currentY, height) => {
      if (currentY + height > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        return MARGIN_TOP;
      }

      return currentY;
    };

    const peserta = data.peserta || {};
    const profileAsesi = peserta.profileAsesi || {};
    const jadwal = peserta.jadwal || {};
    const skema = jadwal.skema || {};
    const tuk = jadwal.tuk || {};
    const namaAsesi = profileAsesi.nama_lengkap || "-";
    const tanggal = jadwal.tgl_awal || jadwal.tgl_akhir || data.updated_at || data.created_at || null;

    doc.font("Helvetica-Bold").fontSize(14).fillColor("#000000").text("FORMULIR APL.02", MARGIN_LEFT, MARGIN_TOP, {
      width: CONTENT_WIDTH,
      align: "center"
    });

    doc.font("Helvetica-Bold").fontSize(9).text("ASESMEN MANDIRI", MARGIN_LEFT, MARGIN_TOP + 19, {
      width: CONTENT_WIDTH,
      align: "center"
    });

    let currentY = MARGIN_TOP + 41;
    const infoLabel = 145;
    const infoSeparator = 18;
    const infoValue = CONTENT_WIDTH - infoLabel - infoSeparator;
    const infoHeight = 26;

    const drawInfoRow = (label, value) => {
      drawCell(MARGIN_LEFT, currentY, infoLabel, infoHeight, label, {
        bold: true,
        fontSize: 7
      });

      drawCell(MARGIN_LEFT + infoLabel, currentY, infoSeparator, infoHeight, ":", {
        bold: true,
        align: "center"
      });

      drawCell(MARGIN_LEFT + infoLabel + infoSeparator, currentY, infoValue, infoHeight, value, {
        fontSize: 7
      });

      currentY += infoHeight;
    };

    drawInfoRow("Nama Asesi", namaAsesi);
    drawInfoRow("Skema Sertifikasi", skema.judul_skema || "-");
    drawInfoRow("Kode Skema", skema.kode_skema || "-");
    drawInfoRow("TUK", tuk.nama_tuk || tuk.nama || "-");
    drawInfoRow("Tanggal", formatTanggal(tanggal));
    drawInfoRow("Status", data.status === "submitted" ? "SUBMITTED" : "DRAFT");

    currentY += 12;
    currentY = ensureSpace(currentY, 55);

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 23, "PENILAIAN ASESMEN MANDIRI", {
      bold: true,
      fontSize: 8,
      align: "center",
      fill: "#E5E7EB"
    });

    currentY += 23;

    const colNo = 28;
    const colUnit = 105;
    const colElemen = 113;
    const colKompetensi = 58;
    const colCatatan = 105;
    const colBukti = CONTENT_WIDTH - colNo - colUnit - colElemen - colKompetensi - colCatatan;
    const headerHeight = 39;

    drawCell(MARGIN_LEFT, currentY, colNo, headerHeight, "No.", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + colNo, currentY, colUnit, headerHeight, "Unit Kompetensi", {
      bold: true,
      align: "center",
      fontSize: 6.2
    });

    drawCell(MARGIN_LEFT + colNo + colUnit, currentY, colElemen, headerHeight, "Elemen Kompetensi", {
      bold: true,
      align: "center",
      fontSize: 6.2
    });

    drawCell(MARGIN_LEFT + colNo + colUnit + colElemen, currentY, colKompetensi, headerHeight, "Kompetensi", {
      bold: true,
      align: "center",
      fontSize: 6.2
    });

    drawCell(MARGIN_LEFT + colNo + colUnit + colElemen + colKompetensi, currentY, colCatatan, headerHeight, "Catatan", {
      bold: true,
      align: "center",
      fontSize: 6.5
    });

    drawCell(MARGIN_LEFT + colNo + colUnit + colElemen + colKompetensi + colCatatan, currentY, colBukti, headerHeight, "Bukti Portofolio", {
      bold: true,
      align: "center",
      fontSize: 6.2
    });

    currentY += headerHeight;

    const details = data.detail || [];

    if (!details.length) {
      drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 42, "Belum ada data penilaian.", {
        align: "center"
      });

      currentY += 42;
    }

    details.forEach((item, index) => {
      const evidence = item.buktiTambahan || [];
      const evidenceHeight = getEvidenceHeight(evidence);
      const unitCode = item.unit?.kode_unit || item.kode_unit || "-";
      const unitTitle = item.unit?.judul_unit || item.judul_unit || "-";
      const unitText = `${unitCode}\n${unitTitle}`;
      const elementText = item.elemen?.nama_elemen || item.nama_elemen || "-";
      const noteText = item.catatan || "-";
      const elementHeight = doc.heightOfString(elementText, {
        width: colElemen - 8,
        fontSize: 5.8
      });
      const unitHeight = doc.heightOfString(unitText, {
        width: colUnit - 8,
        fontSize: 5.5
      });
      const noteHeight = doc.heightOfString(noteText, {
        width: colCatatan - 8,
        fontSize: 5.5
      });
      const rowHeight = Math.max(60, evidenceHeight, elementHeight + 12, unitHeight + 12, noteHeight + 12);

      currentY = ensureSpace(currentY, rowHeight);

      drawCell(MARGIN_LEFT, currentY, colNo, rowHeight, String(index + 1), {
        align: "center",
        valign: "top",
        fontSize: 6.5
      });

      drawCell(MARGIN_LEFT + colNo, currentY, colUnit, rowHeight, unitText, {
        valign: "top",
        fontSize: 5.5,
        padding: 4
      });

      drawCell(MARGIN_LEFT + colNo + colUnit, currentY, colElemen, rowHeight, elementText, {
        valign: "top",
        fontSize: 5.8,
        padding: 4
      });

      const competenceX = MARGIN_LEFT + colNo + colUnit + colElemen;
      const competenceHalf = colKompetensi / 2;

      drawCell(competenceX, currentY, colKompetensi, rowHeight, "", {
        padding: 0
      });

      drawCheckbox(competenceX, currentY, competenceHalf, rowHeight, item.kompeten === "K");
      drawCheckbox(competenceX + competenceHalf, currentY, competenceHalf, rowHeight, item.kompeten === "BK");

      doc.font("Helvetica-Bold").fontSize(5.2).fillColor("#000000").text("K", competenceX, currentY + rowHeight - 13, {
        width: competenceHalf,
        align: "center",
        lineBreak: false
      });

      doc.font("Helvetica-Bold").fontSize(5.2).text("BK", competenceX + competenceHalf, currentY + rowHeight - 13, {
        width: competenceHalf,
        align: "center",
        lineBreak: false
      });

      drawCell(competenceX + colKompetensi, currentY, colCatatan, rowHeight, noteText, {
        valign: "top",
        fontSize: 5.5,
        padding: 4
      });

      const evidenceX = competenceX + colKompetensi + colCatatan;

      drawCell(evidenceX, currentY, colBukti, rowHeight, "", {
        padding: 0
      });

      drawEvidence(evidence, evidenceX, currentY, colBukti, rowHeight);
      currentY += rowHeight;
    });

    currentY += 12;
    currentY = ensureSpace(currentY, 150);

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 23, "REKOMENDASI ASESI", {
      bold: true,
      align: "center",
      fontSize: 8,
      fill: "#E5E7EB"
    });

    currentY += 23;

    const recommendationHeight = 42;

    drawCell(MARGIN_LEFT, currentY, 115, recommendationHeight, "Rekomendasi", {
      bold: true,
      fontSize: 7.2
    });

    drawCell(MARGIN_LEFT + 115, currentY, CONTENT_WIDTH - 115, recommendationHeight, data.rekomendasi_asesi || "-", {
      fontSize: 7.2
    });

    currentY += recommendationHeight;

    const approachText = data.pendekatan_rekomendasi || "-";
    const approachHeight = Math.max(65, doc.heightOfString(approachText, {
      width: CONTENT_WIDTH - 125,
      fontSize: 6.4
    }) + 14);

    drawCell(MARGIN_LEFT, currentY, 115, approachHeight, "Pendekatan / Alasan", {
      bold: true,
      valign: "top",
      fontSize: 7
    });

    drawCell(MARGIN_LEFT + 115, currentY, CONTENT_WIDTH - 115, approachHeight, approachText, {
      valign: "top",
      fontSize: 6.4,
      padding: 5
    });

    currentY += approachHeight + 14;
    currentY = ensureSpace(currentY, 135);

    const signWidth = CONTENT_WIDTH / 2;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 24, "TANDA TANGAN DAN TANGGAL", {
      bold: true,
      align: "center",
      fontSize: 8,
      fill: "#E5E7EB"
    });

    currentY += 24;

    drawCell(MARGIN_LEFT, currentY, signWidth, 25, "Asesi", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + signWidth, currentY, signWidth, 25, "Asesi", {
      bold: true,
      align: "center"
    });

    currentY += 25;

    const signBody = 92;

    drawCell(MARGIN_LEFT, currentY, signWidth, signBody, "", {
      padding: 0
    });

    drawCell(MARGIN_LEFT + signWidth, currentY, signWidth, signBody, "", {
      padding: 0
    });

    drawSignature(profileAsesi?.ttd_path, MARGIN_LEFT + 10, currentY + 5, signWidth - 20, 55);

    doc.font("Helvetica").fontSize(6.5).fillColor("#000000").text(namaAsesi, MARGIN_LEFT + 8, currentY + 62, {
      width: signWidth - 16,
      align: "center",
      lineBreak: false
    });

    doc.font("Helvetica").fontSize(6.5).text(formatTanggal(tanggal), MARGIN_LEFT + 8, currentY + 74, {
      width: signWidth - 16,
      align: "center",
      lineBreak: false
    });

    doc.font("Helvetica").fontSize(6.5).text(namaAsesi, MARGIN_LEFT + signWidth + 8, currentY + 62, {
      width: signWidth - 16,
      align: "center",
      lineBreak: false
    });

    doc.font("Helvetica").fontSize(6.5).text(formatTanggal(tanggal), MARGIN_LEFT + signWidth + 8, currentY + 74, {
      width: signWidth - 16,
      align: "center",
      lineBreak: false
    });

    const range = doc.bufferedPageRange();

    if (range && range.count > 1) {
      for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica").fontSize(6.5).fillColor("#555555").text(`Halaman ${pageIndex - range.start + 1} dari ${range.count}`, MARGIN_LEFT, PAGE_HEIGHT - 16, {
          width: CONTENT_WIDTH,
          align: "center",
          lineBreak: false
        });
      }
    }

    doc.end();
  } catch (err) {
    console.error("GENERATE PDF APL02:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Gagal membuat PDF.",
        error: err.message
      });
    }
  }
};