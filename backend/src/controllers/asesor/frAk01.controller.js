const {
  FrAk01,
  Jadwal,
  JadwalAsesor,
  PesertaJadwal,
  Skema,
  Tuk,
  User,
  ProfileAsesor,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getNama = (obj) => {
  return obj?.nama_lengkap || obj?.nama || obj?.username || "-";
};

const getTanggalJadwal = (jadwal) => {
  return jadwal?.tgl_awal || jadwal?.tanggal || jadwal?.tgl_asesmen || jadwal?.tgl_mulai || null;
};

const getWaktuJadwal = (jadwal) => {
  const mulai = jadwal?.waktu_mulai || jadwal?.jam_mulai || jadwal?.start_time || "";
  const selesai = jadwal?.waktu_selesai || jadwal?.jam_selesai || jadwal?.end_time || "";
  if (mulai && selesai) return `${mulai} - ${selesai}`;
  return mulai || selesai || "";
};

const toBoolean = (value) => {
  return value === true || value === 1 || value === "1" || value === "true" || value === "ya" || value === "YA" || value === "yes" || value === "checked";
};

const normalizeWaktu = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const stringValue = String(value).replace(/[^0-9]/g, "");
  if (!stringValue) return null;
  const numberValue = Number(stringValue);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const submitFrAk01 = async (req, res) => {
  try {
    const id_asesor = req.user.id_user;
    const {
      id_jadwal,
      id_peserta,
      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      t_lainnya,
      bukti_lainnya,
      waktu,
      persetujuan,
      ttd_asesor
    } = req.body;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({ success: false, message: "ID Jadwal dan ID Peserta wajib diisi." });
    }

    const peserta = await PesertaJadwal.findOne({
      where: { id_peserta, id_jadwal }
    });

    if (!peserta) {
      return res.status(404).json({ success: false, message: "Peserta tidak ditemukan pada jadwal tersebut." });
    }

    const akses = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!akses) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke jadwal ini." });
    }

    const existing = await FrAk01.findOne({
      where: { id_jadwal, id_peserta }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FR.AK.01 sudah tersedia.",
        id_fr_ak01: existing.id_fr_ak01
      });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);
    const waktuMenit = normalizeWaktu(waktu);

    const data = await FrAk01.create({
      id_jadwal,
      id_peserta,
      id_asesor,
      bukti_portofolio: Boolean(bukti_portofolio),
      bukti_observasi: Boolean(bukti_observasi),
      bukti_tertulis: Boolean(bukti_tertulis),
      bukti_wawancara: Boolean(bukti_wawancara),
      bukti_review_produk: Boolean(bukti_review_produk),
      bukti_kegiatan_terstruktur: Boolean(bukti_kegiatan_terstruktur),
      bukti_lisan: Boolean(bukti_lisan),
      t_lainnya: Boolean(t_lainnya),
      bukti_lainnya: bukti_lainnya && String(bukti_lainnya).trim() !== "" ? String(bukti_lainnya).trim() : null,
      waktu: waktuMenit,
      persetujuan: persetujuan !== undefined ? Boolean(persetujuan) : true,
      ttd_asesor: ttd_asesor || asesor?.ttd_path || null
    });

    return res.status(201).json({
      success: true,
      message: "FR.AK.01 berhasil disimpan.",
      data
    });
  } catch (err) {
    console.error("SUBMIT FR.AK.01 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFrAk01 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });
    }

    const data = await FrAk01.findOne({
      where: { id_jadwal, id_peserta },
      order: [["created_at", "DESC"]]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error("GET FR.AK.01 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateFrAk01 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_asesor = req.user.id_user;
    const {
      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      t_lainnya,
      bukti_lainnya,
      waktu,
      persetujuan,
      ttd_asesor
    } = req.body;

    const existing = await FrAk01.findByPk(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal: existing.id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah FR.AK.01 ini."
      });
    }

    const waktuUpdate = waktu !== undefined ? normalizeWaktu(waktu) : existing.waktu;

    await existing.update({
      bukti_portofolio: bukti_portofolio !== undefined ? Boolean(bukti_portofolio) : existing.bukti_portofolio,
      bukti_observasi: bukti_observasi !== undefined ? Boolean(bukti_observasi) : existing.bukti_observasi,
      bukti_tertulis: bukti_tertulis !== undefined ? Boolean(bukti_tertulis) : existing.bukti_tertulis,
      bukti_wawancara: bukti_wawancara !== undefined ? Boolean(bukti_wawancara) : existing.bukti_wawancara,
      bukti_review_produk: bukti_review_produk !== undefined ? Boolean(bukti_review_produk) : existing.bukti_review_produk,
      bukti_kegiatan_terstruktur: bukti_kegiatan_terstruktur !== undefined ? Boolean(bukti_kegiatan_terstruktur) : existing.bukti_kegiatan_terstruktur,
      bukti_lisan: bukti_lisan !== undefined ? Boolean(bukti_lisan) : existing.bukti_lisan,
      t_lainnya: t_lainnya !== undefined ? Boolean(t_lainnya) : existing.t_lainnya,
      bukti_lainnya: bukti_lainnya !== undefined ? (String(bukti_lainnya).trim() !== "" ? String(bukti_lainnya).trim() : null) : existing.bukti_lainnya,
      waktu: waktuUpdate,
      persetujuan: persetujuan !== undefined ? Boolean(persetujuan) : existing.persetujuan,
      ttd_asesor: ttd_asesor || existing.ttd_asesor
    });

    await existing.reload();

    return res.json({
      success: true,
      message: "FR.AK.01 berhasil diperbarui.",
      data: existing
    });
  } catch (err) {
    console.error("UPDATE FR.AK.01 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listFrAk01 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    const data = await FrAk01.findAll({
      where: { id_jadwal },
      order: [["created_at", "DESC"]]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error("LIST FR.AK.01 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadPdfFrAk01 = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await FrAk01.findByPk(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    const [jadwal, peserta] = await Promise.all([
      Jadwal.findByPk(data.id_jadwal),
      PesertaJadwal.findOne({
        where: {
          id_peserta: data.id_peserta,
          id_jadwal: data.id_jadwal
        }
      })
    ]);

    if (!jadwal || !peserta) {
      return res.status(404).json({
        success: false,
        message: "Data jadwal atau peserta FR.AK.01 tidak ditemukan."
      });
    }

    const [skema, tuk, user, profileAsesi, asesor] = await Promise.all([
      Skema.findByPk(jadwal.id_skema),
      Tuk.findByPk(jadwal.id_tuk),
      User.findByPk(peserta.id_user),
      ProfileAsesi.findByPk(peserta.id_user),
      ProfileAsesor.findByPk(data.id_asesor)
    ]);

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 25;
    const MARGIN_RIGHT = 25;
    const MARGIN_TOP = 25;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=FR-AK01-${data.id_fr_ak01}.pdf`);

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

    const getTukType = () => {
      const value = String(tuk?.jenis_tuk || tuk?.jenis || "").toLowerCase().trim().replace(/\s+/g, "_");
      if (value.includes("sewaktu")) return "sewaktu";
      if (value.includes("tempat")) return "tempat_kerja";
      if (value.includes("mandiri")) return "mandiri";
      return "";
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
        padding = 4
      } = options;

      doc.save().lineWidth(0.7).strokeColor("#000000").rect(x, y, width, height).stroke().restore();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).fillColor("#000000");

      const value = safe(text);
      const textHeight = doc.heightOfString(value, {
        width: Math.max(width - padding * 2, 5),
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
        width: Math.max(width - padding * 2, 5),
        align
      });
    };

    const drawCheckbox = (x, y, width, height, checked, boxSize = 9) => {
      const boxX = x + (width - boxSize) / 2;
      const boxY = y + (height - boxSize) / 2;

      doc.save().lineWidth(0.8).strokeColor("#000000").rect(boxX, boxY, boxSize, boxSize).stroke().restore();

      if (checked) {
        doc.save().lineWidth(1.25).lineCap("round").lineJoin("round").strokeColor("#000000")
          .moveTo(boxX + 1.5, boxY + 4.5)
          .lineTo(boxX + 4, boxY + 7)
          .lineTo(boxX + 7.5, boxY + 2)
          .stroke()
          .restore();
      }
    };

    const drawTukOption = (x, centerY, checked, label, width) => {
      const boxSize = 9;
      const gap = 4;
      const labelWidth = width - boxSize - gap;
      const groupWidth = boxSize + gap + labelWidth;
      const groupX = x + (width - groupWidth) / 2;
      const boxY = centerY - boxSize / 2;

      doc.save().lineWidth(0.8).strokeColor("#000000").rect(groupX, boxY, boxSize, boxSize).stroke().restore();

      if (checked) {
        doc.save().lineWidth(1.25).lineCap("round").lineJoin("round").strokeColor("#000000")
          .moveTo(groupX + 1.5, boxY + 4.5)
          .lineTo(groupX + 4, boxY + 7)
          .lineTo(groupX + 7.5, boxY + 2)
          .stroke()
          .restore();
      }

      doc.font("Helvetica").fontSize(7).text(label, groupX + boxSize + gap, boxY - 1, {
        width: labelWidth,
        lineBreak: false
      });
    };

    const drawSignature = (fileValue, cellX, cellY, cellWidth, cellHeight) => {
      const signaturePath = normalizeSignaturePath(fileValue);

      if (!signaturePath || !fs.existsSync(signaturePath)) return;

      try {
        const imageWidth = Math.min(150, cellWidth - 20);
        const imageHeight = Math.min(60, cellHeight - 10);
        const imageX = cellX + (cellWidth - imageWidth) / 2;
        const imageY = cellY + 5;

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
        doc.font("Helvetica").fontSize(7).fillColor("#555555").text(
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

    const namaAsesi = profileAsesi?.nama_lengkap || user?.nama_lengkap || user?.nama || user?.username || "-";
    const namaAsesor = asesor?.nama_lengkap || asesor?.nama || "-";
    const tanggalAsesi = formatTanggal(data.tanggal_asesi || data.tanggal || data.created_at || getTanggalJadwal(jadwal));
    const tanggalAsesor = formatTanggal(data.tanggal_asesor || data.tanggal || data.created_at || getTanggalJadwal(jadwal));
    const tanggalPelaksanaan = formatTanggal(data.hari_tanggal || data.tanggal_pelaksanaan || data.tanggal || getTanggalJadwal(jadwal));
    const waktu = data.waktu !== null && data.waktu !== undefined && data.waktu !== "" ? `${data.waktu} Menit` : "-";
    const tukType = getTukType();

    doc.font("Helvetica-Bold").fontSize(14).text(
      "FR.AK.01. PERSETUJUAN ASESMEN DAN KERAHASIAAN",
      MARGIN_LEFT,
      MARGIN_TOP,
      {
        width: CONTENT_WIDTH,
        align: "center"
      }
    );

    let currentY = MARGIN_TOP + 28;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      38,
      "Persetujuan Asesmen ini untuk menjamin bahwa Peserta telah diberi arahan secara rinci tentang perencanaan dan proses asesmen.",
      {
        fontSize: 7.2,
        valign: "center"
      }
    );

    currentY += 38;

    const headerCol1 = 145;
    const headerCol2 = 55;
    const headerCol3 = 18;
    const headerCol4 = CONTENT_WIDTH - headerCol1 - headerCol2 - headerCol3;
    const headerRows = [30, 30, 28, 28, 28];

    drawCell(
      MARGIN_LEFT,
      currentY,
      headerCol1,
      headerRows[0] + headerRows[1],
      "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)*",
      {
        bold: true
      }
    );

    drawCell(MARGIN_LEFT + headerCol1, currentY, headerCol2, headerRows[0], "Judul :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRows[0], ":", {
      align: "center"
    });

    drawCell(
      MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3,
      currentY,
      headerCol4,
      headerRows[0],
      skema?.judul_skema || "-",
      {}
    );

    drawCell(MARGIN_LEFT + headerCol1, currentY + headerRows[0], headerCol2, headerRows[1], "Nomor :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY + headerRows[0], headerCol3, headerRows[1], ":", {
      align: "center"
    });

    drawCell(
      MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3,
      currentY + headerRows[0],
      headerCol4,
      headerRows[1],
      skema?.kode_skema || "-",
      {}
    );

    currentY += headerRows[0] + headerRows[1];

    drawCell(MARGIN_LEFT, currentY, headerCol1 + headerCol2, headerRows[2], "TUK :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRows[2], ":", {
      align: "center"
    });

    drawCell(
      MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3,
      currentY,
      headerCol4,
      headerRows[2],
      "",
      {
        padding: 0
      }
    );

    const tukWidth = headerCol4 / 3;
    const tukStartX = MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3;
    const tukCenterY = currentY + headerRows[2] / 2;

    drawTukOption(tukStartX, tukCenterY, tukType === "sewaktu", "Sewaktu", tukWidth);
    drawTukOption(tukStartX + tukWidth, tukCenterY, tukType === "tempat_kerja", "Tempat Kerja", tukWidth);
    drawTukOption(tukStartX + tukWidth * 2, tukCenterY, tukType === "mandiri", "Mandiri", tukWidth);

    currentY += headerRows[2];

    drawCell(MARGIN_LEFT, currentY, headerCol1 + headerCol2, headerRows[3], "Nama Asesor :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRows[3], ":", {
      align: "center"
    });

    drawCell(
      MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3,
      currentY,
      headerCol4,
      headerRows[3],
      namaAsesor,
      {}
    );

    currentY += headerRows[3];

    drawCell(MARGIN_LEFT, currentY, headerCol1 + headerCol2, headerRows[4], "Nama Asesi :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, currentY, headerCol3, headerRows[4], ":", {
      align: "center"
    });

    drawCell(
      MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3,
      currentY,
      headerCol4,
      headerRows[4],
      namaAsesi,
      {}
    );

    currentY += headerRows[4] + 8;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "Bukti yang akan dikumpulkan :",
      {
        bold: true
      }
    );

    currentY += 25;

    const evidenceLeft = CONTENT_WIDTH / 2;
    const evidenceRow = 27;

    const evidenceLeftRows = [
      ["TL : VERIFIKASI PORTOFOLIO", data.bukti_portofolio],
      ["L : OBSERVASI LANGSUNG", data.bukti_observasi],
      ["T : DAFTAR PERTANYAAN TULIS / PILIHAN GANDA", data.bukti_tertulis],
      ["T : DAFTAR PERTANYAAN LISAN", data.bukti_lisan],
      ["T : PERTANYAAN WAWANCARA", data.bukti_wawancara],
      ["T : LAINNYA", data.t_lainnya]
    ];

    const evidenceRightRows = [
      ["TL : HASIL REVIU PRODUK", data.bukti_review_produk],
      ["L : HASIL KEGIATAN TERSTRUKTUR", data.bukti_kegiatan_terstruktur]
    ];

    const evidenceTotalRows = Math.max(evidenceLeftRows.length, evidenceRightRows.length);

    drawCell(MARGIN_LEFT, currentY, evidenceLeft, evidenceRow * evidenceTotalRows, "", {
      padding: 0
    });

    drawCell(MARGIN_LEFT + evidenceLeft, currentY, evidenceLeft, evidenceRow * evidenceTotalRows, "", {
      padding: 0
    });

    evidenceLeftRows.forEach((item, index) => {
      const rowY = currentY + index * evidenceRow;

      drawCheckbox(MARGIN_LEFT + 5, rowY, 16, evidenceRow, Boolean(item[1]), 9);

      doc.font("Helvetica").fontSize(6.8).text(item[0], MARGIN_LEFT + 24, rowY + 8, {
        width: evidenceLeft - 30
      });
    });

    evidenceRightRows.forEach((item, index) => {
      const rowY = currentY + index * evidenceRow;
      const rightX = MARGIN_LEFT + evidenceLeft;

      drawCheckbox(rightX + 5, rowY, 16, evidenceRow, Boolean(item[1]), 9);

      doc.font("Helvetica").fontSize(6.8).text(item[0], rightX + 24, rowY + 8, {
        width: evidenceLeft - 30
      });
    });

    currentY += evidenceRow * evidenceTotalRows;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      30,
      `Keterangan lainnya : ${data.bukti_lainnya || "-"}`,
      {}
    );

    currentY += 38;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      26,
      "Pelaksanaan asesmen disepakati pada :",
      {
        bold: true
      }
    );

    currentY += 26;

    const pelaksanaanLabel = 170;
    const pelaksanaanValue = CONTENT_WIDTH - pelaksanaanLabel;

    drawCell(MARGIN_LEFT, currentY, pelaksanaanLabel, 30, "Hari Tanggal :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + pelaksanaanLabel, currentY, pelaksanaanValue, 30, tanggalPelaksanaan, {});

    currentY += 30;

    drawCell(MARGIN_LEFT, currentY, pelaksanaanLabel, 30, "Waktu :", {
      bold: true
    });

    drawCell(MARGIN_LEFT + pelaksanaanLabel, currentY, pelaksanaanValue, 30, waktu, {});

    currentY += 30;

    drawCell(MARGIN_LEFT, currentY, pelaksanaanLabel, 30, "TUK :", {
      bold: true
    });

    drawCell(
      MARGIN_LEFT + pelaksanaanLabel,
      currentY,
      pelaksanaanValue,
      30,
      tuk?.nama_tuk || "-",
      {}
    );

    currentY += 40;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 25, "Asesi:", {
      bold: true
    });

    currentY += 25;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      55,
      "Bahwa saya telah mendapatkan penjelasan terkait hak dan prosedur banding asesmen dari asesor.",
      {
        valign: "center"
      }
    );

    currentY += 55;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 25, "Asesor:", {
      bold: true
    });

    currentY += 25;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      75,
      "Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun atau organisasi apapun selain kepada pihak yang berwenang sehubungan dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.",
      {
        valign: "center",
        fontSize: 7
      }
    );

    currentY += 75;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 25, "Asesi:", {
      bold: true
    });

    currentY += 25;

    drawCell(
      MARGIN_LEFT,
      currentY,
      CONTENT_WIDTH,
      60,
      "Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang dikumpulkan hanya digunakan untuk pengembangan profesional dan hanya dapat diakses oleh orang tertentu saja.",
      {
        valign: "center"
      }
    );

    currentY += 70;

    if (currentY > PAGE_HEIGHT - 290) {
      doc.addPage();
      currentY = MARGIN_TOP;
    }

    const signCol = CONTENT_WIDTH / 3;
    const signHeader = 27;
    const signBody = 105;

    drawCell(MARGIN_LEFT, currentY, signCol, signHeader, "Nama Asesi", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + signCol, currentY, signCol, signHeader, "Tanda tangan Asesi", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + signCol * 2, currentY, signCol, signHeader, "Tanggal:", {
      bold: true,
      align: "center"
    });

    currentY += signHeader;

    drawCell(MARGIN_LEFT, currentY, signCol, signBody, namaAsesi, {
      align: "center",
      valign: "center"
    });

    drawCell(MARGIN_LEFT + signCol, currentY, signCol, signBody, "", {
      padding: 0
    });

    drawCell(MARGIN_LEFT + signCol * 2, currentY, signCol, signBody, tanggalAsesi, {
      align: "center",
      valign: "center"
    });

    drawSignature(
      profileAsesi?.ttd_path,
      MARGIN_LEFT + signCol,
      currentY,
      signCol,
      signBody
    );

    currentY += signBody;

    drawCell(MARGIN_LEFT, currentY, signCol, signHeader, "Nama Asesor", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + signCol, currentY, signCol, signHeader, "Tanda tangan Asesor", {
      bold: true,
      align: "center"
    });

    drawCell(MARGIN_LEFT + signCol * 2, currentY, signCol, signHeader, "Tanggal:", {
      bold: true,
      align: "center"
    });

    currentY += signHeader;

    drawCell(MARGIN_LEFT, currentY, signCol, signBody, namaAsesor, {
      align: "center",
      valign: "center"
    });

    drawCell(MARGIN_LEFT + signCol, currentY, signCol, signBody, "", {
      padding: 0
    });

    drawCell(MARGIN_LEFT + signCol * 2, currentY, signCol, signBody, tanggalAsesor, {
      align: "center",
      valign: "center"
    });

    drawSignature(
      data.ttd_asesor || asesor?.ttd_path,
      MARGIN_LEFT + signCol,
      currentY,
      signCol,
      signBody
    );

    drawPageNumber();

    doc.end();
  } catch (err) {
    console.error("PDF FR.AK.01 ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};

const getFrAk01Asesor = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;
    const id_asesor = req.user.id_user;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        status: "error",
        message: "ID jadwal dan ID peserta wajib dikirim."
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
        status: "error",
        message: "Anda tidak memiliki akses ke jadwal ini."
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        status: "error",
        message: "Jadwal tidak ditemukan."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal
      }
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan."
      });
    }

    const [
      skema,
      tuk,
      user,
      profileAsesi,
      asesor
    ] = await Promise.all([
      Skema.findByPk(jadwal.id_skema),
      Tuk.findByPk(jadwal.id_tuk),
      User.findByPk(peserta.id_user),
      ProfileAsesi.findByPk(peserta.id_user),
      ProfileAsesor.findByPk(id_asesor)
    ]);

    const existing = await FrAk01.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      order: [["created_at", "DESC"]]
    });

    const fr = existing ? existing.toJSON() : {};

    return res.json({
      status: "success",
      data: {
        id_fr_ak01: fr.id_fr_ak01 || null,
        id_jadwal: Number(id_jadwal),
        id_peserta: Number(id_peserta),
        id_asesor: Number(id_asesor),
        exists: Boolean(existing),
        tanggal: fr.tanggal || fr.tanggal_persetujuan || fr.created_at || getTanggalJadwal(jadwal) || null,
        skema: skema?.toJSON?.() || skema || {},
        tuk: tuk?.toJSON?.() || tuk || {},
        asesor: {
          ...(asesor?.toJSON?.() || asesor || {}),
          nama_lengkap: asesor?.nama_lengkap || "",
          no_reg_asesor: asesor?.no_reg_asesor || "",
          ttd_path: asesor?.ttd_path || ""
        },
        asesi: {
          ...(profileAsesi?.toJSON?.() || profileAsesi || {}),
          nama_lengkap: profileAsesi?.nama_lengkap || user?.nama_lengkap || user?.nama || user?.username || "",
          ttd_path: profileAsesi?.ttd_path || "",
          tanggal: fr.tanggal_asesi || fr.tanggal || fr.created_at || getTanggalJadwal(jadwal) || null
        },
        jadwal: jadwal?.toJSON?.() || jadwal || {},
        bukti: {
          tl_verifikasi_portofolio: toBoolean(fr.bukti_portofolio),
          tl_hasil_reviu_produk: toBoolean(fr.bukti_review_produk),
          l_observasi_langsung: toBoolean(fr.bukti_observasi),
          l_hasil_kegiatan_terstruktur: toBoolean(fr.bukti_kegiatan_terstruktur),
          t_daftar_pertanyaan_tulis: toBoolean(fr.bukti_tertulis),
          t_daftar_pertanyaan_lisan: toBoolean(fr.bukti_lisan),
          t_pertanyaan_wawancara: toBoolean(fr.bukti_wawancara),
          t_lainnya: toBoolean(fr.t_lainnya),
          lainnya: fr.bukti_lainnya || ""
        },
        pelaksanaan: {
          hari_tanggal: fr.hari_tanggal || fr.tanggal_pelaksanaan || fr.tanggal || getTanggalJadwal(jadwal) || null,
          waktu: fr.waktu !== undefined && fr.waktu !== null ? String(fr.waktu) : "",
          tuk: fr.tuk_pelaksanaan || tuk?.nama_tuk || ""
        },
        persetujuan: fr.persetujuan !== undefined ? Boolean(fr.persetujuan) : true,
        ttd_asesor: fr.ttd_asesor || asesor?.ttd_path || "",
        raw: fr
      }
    });
  } catch (err) {
    console.error("GET FR.AK.01 ASESOR ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server.",
      error: err.message
    });
  }
};

module.exports = {
  submitFrAk01,
  getFrAk01,
  updateFrAk01,
  listFrAk01,
  downloadPdfFrAk01,
  getFrAk01Asesor
};