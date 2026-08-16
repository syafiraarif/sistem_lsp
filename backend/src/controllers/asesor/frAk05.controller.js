const sequelize = require("../../config/database");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const {
  FrAk05,
  PresensiAsesor,
  JadwalAsesor,
  PesertaJadwal,
  ProfileAsesor,
  ProfileAsesi,
  Jadwal,
  Skema,
  Tuk,
  User
} = require("../../models");

const getNamaAsesi = (profile, user) => {
  return profile?.nama_lengkap || profile?.nama || user?.nama_lengkap || user?.nama || user?.username || "-";
};

const getNamaAsesor = (profile) => {
  return profile?.nama_lengkap || profile?.nama || "-";
};

const getTukType = (tuk) => {
  const value = String(tuk?.jenis_tuk || tuk?.jenis || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (value.includes("sewaktu")) return "sewaktu";
  if (value.includes("tempat")) return "tempat_kerja";
  if (value.includes("mandiri")) return "mandiri";
  return "";
};

const getTanggalJadwal = (jadwal) => {
  return jadwal?.tgl_awal || jadwal?.tanggal || jadwal?.tgl_asesmen || jadwal?.tgl_mulai || null;
};

const submitFrAk05 = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id_asesor = Number(req.user.id_user);
    const {
      id_jadwal,
      id_peserta,
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;
    if (!id_jadwal || !id_peserta) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "ID Jadwal dan ID Peserta wajib diisi." });
    }
    if (!rekomendasi) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Rekomendasi wajib dipilih." });
    }
    if (!["kompeten", "belum_kompeten"].includes(rekomendasi)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Rekomendasi tidak valid." });
    }
    const akses = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor },
      transaction
    });
    if (!akses) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke jadwal ini." });
    }
    const peserta = await PesertaJadwal.findOne({
      where: { id_jadwal, id_peserta },
      transaction
    });
    if (!peserta) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Peserta tidak ditemukan pada jadwal ini." });
    }
    const existing = await FrAk05.findOne({
      where: { id_jadwal, id_peserta },
      transaction
    });
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "FR.AK.05 sudah pernah dibuat untuk peserta ini.",
        data: { id_fr_ak05: existing.id_fr_ak05 }
      });
    }
    const profileAsesor = await ProfileAsesor.findByPk(id_asesor, { transaction });
    const signature = ttd_asesor || profileAsesor?.ttd_path || "";
    if (!signature) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Tanda tangan asesor belum tersedia." });
    }
    const data = await FrAk05.create({
      id_jadwal: Number(id_jadwal),
      id_peserta: Number(id_peserta),
      id_asesor,
      rekomendasi,
      keterangan: keterangan !== undefined && keterangan !== null ? String(keterangan).trim() || null : null,
      aspek_positif_negatif: aspek_positif_negatif !== undefined && aspek_positif_negatif !== null ? String(aspek_positif_negatif).trim() || null : null,
      penolakan_hasil: penolakan_hasil !== undefined && penolakan_hasil !== null ? String(penolakan_hasil).trim() || null : null,
      saran_perbaikan: saran_perbaikan !== undefined && saran_perbaikan !== null ? String(saran_perbaikan).trim() || null : null,
      catatan: catatan !== undefined && catatan !== null ? String(catatan).trim() || null : null,
      ttd_asesor: signature
    }, { transaction });
    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: "FR.AK.05 berhasil disimpan.",
      data: {
        id_fr_ak05: data.id_fr_ak05,
        id_jadwal: data.id_jadwal,
        id_peserta: data.id_peserta,
        id_asesor: data.id_asesor,
        rekomendasi: data.rekomendasi,
        keterangan: data.keterangan,
        aspek_positif_negatif: data.aspek_positif_negatif,
        penolakan_hasil: data.penolakan_hasil,
        saran_perbaikan: data.saran_perbaikan,
        catatan: data.catatan,
        ttd_asesor: data.ttd_asesor,
        created_at: data.created_at
      }
    });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    console.error("SUBMIT FR.AK.05 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateFrAk05 = async (req, res) => {
  try {
    const { id_fr_ak05 } = req.params;
    const id_asesor = Number(req.user.id_user);
    if (!id_fr_ak05) {
      return res.status(400).json({ success: false, message: "ID FR.AK.05 wajib diisi." });
    }
    const {
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;
    if (rekomendasi !== undefined && !["kompeten", "belum_kompeten"].includes(rekomendasi)) {
      return res.status(400).json({ success: false, message: "Rekomendasi tidak valid." });
    }
    const data = await FrAk05.findOne({
      where: { id_fr_ak05: Number(id_fr_ak05), id_asesor }
    });
    if (!data) {
      return res.status(404).json({ success: false, message: "FR.AK.05 tidak ditemukan." });
    }
    const profileAsesor = await ProfileAsesor.findByPk(id_asesor);
    await data.update({
      rekomendasi: rekomendasi !== undefined ? rekomendasi : data.rekomendasi,
      keterangan: keterangan !== undefined ? String(keterangan).trim() || null : data.keterangan,
      aspek_positif_negatif: aspek_positif_negatif !== undefined ? String(aspek_positif_negatif).trim() || null : data.aspek_positif_negatif,
      penolakan_hasil: penolakan_hasil !== undefined ? String(penolakan_hasil).trim() || null : data.penolakan_hasil,
      saran_perbaikan: saran_perbaikan !== undefined ? String(saran_perbaikan).trim() || null : data.saran_perbaikan,
      catatan: catatan !== undefined ? String(catatan).trim() || null : data.catatan,
      ttd_asesor: ttd_asesor || data.ttd_asesor || profileAsesor?.ttd_path || ""
    });
    await data.reload();
    return res.status(200).json({
      success: true,
      message: "FR.AK.05 berhasil diperbarui.",
      data: {
        id_fr_ak05: data.id_fr_ak05,
        id_jadwal: data.id_jadwal,
        id_peserta: data.id_peserta,
        id_asesor: data.id_asesor,
        rekomendasi: data.rekomendasi,
        keterangan: data.keterangan,
        aspek_positif_negatif: data.aspek_positif_negatif,
        penolakan_hasil: data.penolakan_hasil,
        saran_perbaikan: data.saran_perbaikan,
        catatan: data.catatan,
        ttd_asesor: data.ttd_asesor,
        created_at: data.created_at
      }
    });
  } catch (err) {
    console.error("UPDATE FR.AK.05 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFrAk05 = async (req, res) => {
  try {
    const id_asesor = Number(req.user.id_user);
    const { id_jadwal, id_peserta } = req.query;
    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({ success: false, message: "ID Jadwal dan ID Peserta wajib diisi." });
    }
    const peserta = await PesertaJadwal.findOne({
      where: { id_jadwal, id_peserta },
      include: [
        { model: ProfileAsesi, as: "profileAsesi", required: false },
        { model: User, as: "user", required: false },
        {
          model: Jadwal,
          as: "jadwal",
          required: false,
          include: [
            { model: Skema, as: "skema", required: false },
            { model: Tuk, as: "tuk", required: false }
          ]
        }
      ]
    });
    if (!peserta) {
      return res.status(404).json({ success: false, message: "Peserta tidak ditemukan pada jadwal ini." });
    }
    const akses = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });
    if (!akses) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke jadwal ini." });
    }
    const jadwal = peserta.jadwal || await Jadwal.findByPk(id_jadwal);
    if (!jadwal) {
      return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan." });
    }
    const skema = jadwal.skema || await Skema.findByPk(jadwal.id_skema);
    const tuk = jadwal.tuk || await Tuk.findByPk(jadwal.id_tuk);
    const user = peserta.user || await User.findByPk(peserta.id_user);
    const profileAsesor = await ProfileAsesor.findByPk(id_asesor);
    const existing = await FrAk05.findOne({
      where: { id_jadwal, id_peserta, id_asesor }
    });
    const profileAsesi = peserta.profileAsesi || {};
    if (!existing) {
      return res.status(200).json({
        success: true,
        message: "FR.AK.05 belum dibuat.",
        data: {
          id_fr_ak05: null,
          id_jadwal: Number(id_jadwal),
          id_peserta: Number(id_peserta),
          id_asesor,
          exists: false,
          skema: skema?.toJSON?.() || skema || {},
          tuk: tuk?.toJSON?.() || tuk || {},
          jadwal: jadwal?.toJSON?.() || jadwal || {},
          asesi: {
            ...(profileAsesi?.toJSON?.() || profileAsesi || {}),
            nama_lengkap: profileAsesi?.nama_lengkap || user?.nama_lengkap || user?.nama || user?.username || "-",
            ttd_path: profileAsesi?.ttd_path || ""
          },
          asesor: {
            ...(profileAsesor?.toJSON?.() || profileAsesor || {}),
            nama_lengkap: profileAsesor?.nama_lengkap || "",
            no_reg_asesor: profileAsesor?.no_reg_asesor || "",
            ttd_path: profileAsesor?.ttd_path || ""
          },
          tanggal: getTanggalJadwal(jadwal) || ""
        }
      });
    }
    const plain = existing.toJSON ? existing.toJSON() : existing;
    return res.status(200).json({
      success: true,
      data: {
        ...plain,
        id_fr_ak05: plain.id_fr_ak05 || null,
        id_jadwal: plain.id_jadwal || Number(id_jadwal),
        id_peserta: plain.id_peserta || Number(id_peserta),
        id_asesor: plain.id_asesor || id_asesor,
        exists: true,
        skema: skema?.toJSON?.() || skema || {},
        tuk: tuk?.toJSON?.() || tuk || {},
        jadwal: jadwal?.toJSON?.() || jadwal || {},
        asesi: {
          ...(profileAsesi?.toJSON?.() || profileAsesi || {}),
          nama_lengkap: profileAsesi?.nama_lengkap || user?.nama_lengkap || user?.nama || user?.username || "-",
          ttd_path: profileAsesi?.ttd_path || ""
        },
        asesor: {
          ...(profileAsesor?.toJSON?.() || profileAsesor || {}),
          nama_lengkap: profileAsesor?.nama_lengkap || "",
          no_reg_asesor: profileAsesor?.no_reg_asesor || "",
          ttd_path: profileAsesor?.ttd_path || ""
        },
        tanggal: plain.created_at || getTanggalJadwal(jadwal) || ""
      }
    });
  } catch (err) {
    console.error("GET FR.AK.05 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listFrAk05 = async (req, res) => {
  try {
    const id_asesor = Number(req.user.id_user);
    const { id_jadwal } = req.params;
    if (!id_jadwal) {
      return res.status(400).json({ success: false, message: "ID Jadwal wajib diisi." });
    }
    const data = await FrAk05.findAll({
      where: { id_jadwal, id_asesor },
      order: [["created_at", "DESC"]]
    });
    return res.status(200).json({ success: true, total: data.length, data });
  } catch (err) {
    console.error("LIST FR.AK.05 ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadPdfFrAk05 = async (req, res) => {
  try {
    const { id_fr_ak05 } = req.params;
    const id_asesor = Number(req.user.id_user);
    const data = await FrAk05.findOne({
      where: { id_fr_ak05: Number(id_fr_ak05), id_asesor }
    });
    if (!data) {
      return res.status(404).json({ success: false, message: "FR.AK.05 tidak ditemukan." });
    }
    const [peserta, asesor, jadwal] = await Promise.all([
      PesertaJadwal.findOne({
        where: { id_peserta: data.id_peserta, id_jadwal: data.id_jadwal },
        include: [
          { model: ProfileAsesi, as: "profileAsesi", required: false },
          { model: User, as: "user", required: false }
        ]
      }),
      ProfileAsesor.findByPk(data.id_asesor),
      Jadwal.findByPk(data.id_jadwal)
    ]);
    if (!peserta) {
      return res.status(404).json({ success: false, message: "Data peserta FR.AK.05 tidak ditemukan." });
    }
    const [skema, tuk] = await Promise.all([
      jadwal?.id_skema ? Skema.findByPk(jadwal.id_skema) : null,
      jadwal?.id_tuk ? Tuk.findByPk(jadwal.id_tuk) : null
    ]);
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 25;
    const MARGIN_RIGHT = 25;
    const MARGIN_TOP = 25;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=FR-AK05-${data.id_fr_ak05}.pdf`);
    doc.pipe(res);

    const safe = (value) => value === null || value === undefined || value === "" ? "-" : String(value);
    const formatTanggal = (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };
    const drawCell = (x, y, width, height, text, options = {}) => {
      const { fontSize = 7, bold = false, align = "left", valign = "center", padding = 4 } = options;
      doc.save().lineWidth(0.7).strokeColor("#000000").rect(x, y, width, height).stroke().restore();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).fillColor("#000000");
      const value = safe(text);
      const textHeight = doc.heightOfString(value, { width: Math.max(width - padding * 2, 5), align });
      let textY = y + padding;
      if (valign === "center") textY = y + Math.max(padding, (height - textHeight) / 2);
      if (valign === "bottom") textY = y + height - textHeight - padding;
      doc.text(value, x + padding, textY, { width: Math.max(width - padding * 2, 5), align });
    };
    const drawCheckbox = (x, y, width, height, checked, boxSize = 10) => {
      const boxX = x + (width - boxSize) / 2;
      const boxY = y + (height - boxSize) / 2;
      doc.save().lineWidth(0.8).strokeColor("#000000").rect(boxX, boxY, boxSize, boxSize).stroke().restore();
      if (checked) {
        doc.save().lineWidth(1.3).lineCap("round").lineJoin("round").strokeColor("#000000").moveTo(boxX + 2, boxY + 5).lineTo(boxX + 4.5, boxY + 8).lineTo(boxX + 8.5, boxY + 2).stroke().restore();
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
        doc.save().lineWidth(1.3).lineCap("round").lineJoin("round").strokeColor("#000000").moveTo(groupX + 1.5, boxY + 4.5).lineTo(groupX + 4, boxY + 7).lineTo(groupX + 7.5, boxY + 2).stroke().restore();
      }
      doc.font("Helvetica").fontSize(7).text(label, groupX + boxSize + gap, boxY - 1, { width: labelWidth, lineBreak: false });
    };
    const normalizeSignaturePath = (value) => {
      if (!value) return "";
      const stringValue = String(value);
      if (path.isAbsolute(stringValue) && fs.existsSync(stringValue)) return stringValue;
      const cleaned = stringValue.replace(/^[/\\]+/, "");
      const candidates = [
        path.join(process.cwd(), cleaned),
        path.join(process.cwd(), "uploads", cleaned.replace(/^uploads[/\\]/, "")),
        path.join(process.cwd(), "public", cleaned)
      ];
      return candidates.find((item) => fs.existsSync(item)) || "";
    };
    const drawPageNumber = () => {
      const range = doc.bufferedPageRange();
      if (!range || range.count <= 1) return;
      for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
        doc.switchToPage(pageIndex);
        doc.font("Helvetica").fontSize(7).fillColor("#555555").text(`Halaman ${pageIndex - range.start + 1} dari ${range.count}`, MARGIN_LEFT, PAGE_HEIGHT - 15, { width: CONTENT_WIDTH, align: "center" });
      }
    };

    const namaAsesi = getNamaAsesi(peserta.profileAsesi, peserta.user);
    const namaAsesor = getNamaAsesor(asesor);
    const tanggal = formatTanggal(data.created_at || getTanggalJadwal(jadwal));
    const tukType = getTukType(tuk);
    const headerCol1 = 145;
    const headerCol2 = 60;
    const headerCol3 = 18;
    const headerCol4 = CONTENT_WIDTH - headerCol1 - headerCol2 - headerCol3;

    doc.font("Helvetica-Bold").fontSize(14).text("FR.AK.05. LAPORAN ASESMEN", MARGIN_LEFT, MARGIN_TOP, { width: CONTENT_WIDTH, align: "center" });

    let currentY = MARGIN_TOP + 24;
    let y = currentY;
    const headerRows = [29, 29, 28, 28, 28, 28];

    drawCell(MARGIN_LEFT, y, headerCol1, headerRows[0] + headerRows[1], "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)", { bold: true });
    drawCell(MARGIN_LEFT + headerCol1, y, headerCol2, headerRows[0], "Judul", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, y, headerCol3, headerRows[0], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y, headerCol4, headerRows[0], skema?.judul_skema || "-", {});
    drawCell(MARGIN_LEFT + headerCol1, y + headerRows[0], headerCol2, headerRows[1], "Nomor", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2, y + headerRows[0], headerCol3, headerRows[1], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y + headerRows[0], headerCol4, headerRows[1], skema?.kode_skema || "-", {});

    y += headerRows[0] + headerRows[1];

    drawCell(MARGIN_LEFT, y, headerCol1, headerRows[2], "TUK", { bold: true });
    drawCell(MARGIN_LEFT + headerCol1, y, headerCol2 + headerCol3, headerRows[2], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y, headerCol4, headerRows[2], "", { padding: 0 });

    const tukWidth = headerCol4 / 3;
    const tukStartX = MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3 + 8;
    const tukCenterY = y + headerRows[2] / 2;

    drawTukOption(tukStartX, tukCenterY, tukType === "sewaktu", "Sewaktu", tukWidth);
    drawTukOption(tukStartX + tukWidth, tukCenterY, tukType === "tempat_kerja", "Tempat Kerja", tukWidth);
    drawTukOption(tukStartX + tukWidth * 2, tukCenterY, tukType === "mandiri", "Mandiri", tukWidth);

    y += headerRows[2];

    drawCell(MARGIN_LEFT, y, headerCol1, headerRows[3], "Nama Asesor", { bold: true });
    drawCell(MARGIN_LEFT + headerCol1, y, headerCol2 + headerCol3, headerRows[3], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y, headerCol4, headerRows[3], namaAsesor, {});

    y += headerRows[3];

    drawCell(MARGIN_LEFT, y, headerCol1, headerRows[4], "No. Reg. Asesor", { bold: true });
    drawCell(MARGIN_LEFT + headerCol1, y, headerCol2 + headerCol3, headerRows[4], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y, headerCol4, headerRows[4], asesor?.no_reg_asesor || "-", {});

    y += headerRows[4];

    drawCell(MARGIN_LEFT, y, headerCol1, headerRows[5], "Tanggal", { bold: true });
    drawCell(MARGIN_LEFT + headerCol1, y, headerCol2 + headerCol3, headerRows[5], ":", { align: "center" });
    drawCell(MARGIN_LEFT + headerCol1 + headerCol2 + headerCol3, y, headerCol4, headerRows[5], tanggal, {});

    currentY = y + headerRows[5] + 12;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 25, "Hasil Asesmen", { bold: true });
    currentY += 25;

    const colNo = 40;
    const colNama = 220;
    const colK = 55;
    const colBK = 65;
    const colKet = CONTENT_WIDTH - colNo - colNama - colK - colBK;
    const headerHeight = 28;
    const bodyHeight = 70;

    drawCell(MARGIN_LEFT, currentY, colNo, headerHeight, "No.", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + colNo, currentY, colNama, headerHeight, "Nama Asesi", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + colNo + colNama, currentY, colK, headerHeight, "K", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + colNo + colNama + colK, currentY, colBK, headerHeight, "BK", { bold: true, align: "center" });
    drawCell(MARGIN_LEFT + colNo + colNama + colK + colBK, currentY, colKet, headerHeight, "Keterangan**", { bold: true, align: "center" });

    currentY += headerHeight;

    drawCell(MARGIN_LEFT, currentY, colNo, bodyHeight, "1.", { align: "center", valign: "top" });
    drawCell(MARGIN_LEFT + colNo, currentY, colNama, bodyHeight, namaAsesi, { valign: "top" });
    drawCell(MARGIN_LEFT + colNo + colNama, currentY, colK, bodyHeight, "", { padding: 0 });
    drawCheckbox(MARGIN_LEFT + colNo + colNama, currentY, colK, bodyHeight, data.rekomendasi === "kompeten", 11);
    drawCell(MARGIN_LEFT + colNo + colNama + colK, currentY, colBK, bodyHeight, "", { padding: 0 });
    drawCheckbox(MARGIN_LEFT + colNo + colNama + colK, currentY, colBK, bodyHeight, data.rekomendasi === "belum_kompeten", 11);
    drawCell(MARGIN_LEFT + colNo + colNama + colK + colBK, currentY, colKet, bodyHeight, data.keterangan || "-", { valign: "top", padding: 6 });

    currentY += bodyHeight + 6;

    drawCell(MARGIN_LEFT, currentY, CONTENT_WIDTH, 24, "** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema", { fontSize: 6.5 });
    currentY += 34;

    const feedbackLabel = 195;
    const feedbackHeight = 72;
    const feedbackRows = [
      ["Aspek Negatif dan Positif dalam Asesmen", data.aspek_positif_negatif],
      ["Pencatatan Penolakan Hasil Asesmen", data.penolakan_hasil],
      ["Saran Perbaikan : (Asesor/Personil Terkait)", data.saran_perbaikan]
    ];

    feedbackRows.forEach(([label, value]) => {
      drawCell(MARGIN_LEFT, currentY, feedbackLabel, feedbackHeight, label, { valign: "center" });
      drawCell(MARGIN_LEFT + feedbackLabel, currentY, CONTENT_WIDTH - feedbackLabel, feedbackHeight, value || "-", { valign: "top", padding: 7 });
      currentY += feedbackHeight;
    });

    currentY += 10;

    if (currentY > PAGE_HEIGHT - 245) {
      doc.addPage();
      currentY = MARGIN_TOP;
    }

    const noteWidth = CONTENT_WIDTH * 0.52;
    const infoWidth = CONTENT_WIDTH - noteWidth;
    const noteHeight = 210;
    const infoX = MARGIN_LEFT + noteWidth;
    const infoLabelWidth = 75;
    const infoValueWidth = infoWidth - infoLabelWidth;

    drawCell(MARGIN_LEFT, currentY, noteWidth, noteHeight, "", { padding: 0 });
    drawCell(MARGIN_LEFT, currentY, noteWidth, 28, "Catatan :", { bold: true });
    drawCell(MARGIN_LEFT, currentY + 28, noteWidth, noteHeight - 28, data.catatan || "-", { valign: "top", padding: 7 });

    drawCell(infoX, currentY, infoWidth, 28, "Asesor :", { bold: true });
    drawCell(infoX, currentY + 28, infoLabelWidth, 45, "Nama", {});
    drawCell(infoX + infoLabelWidth, currentY + 28, infoValueWidth, 45, namaAsesor, {});
    drawCell(infoX, currentY + 73, infoLabelWidth, 45, "No. Reg", {});
    drawCell(infoX + infoLabelWidth, currentY + 73, infoValueWidth, 45, asesor?.no_reg_asesor || "-", {});

    const signY = currentY + 118;
    const signHeight = noteHeight - 118;

    drawCell(infoX, signY, infoLabelWidth, signHeight, "Tanda tangan/\nTanggal", { valign: "center" });
    drawCell(infoX + infoLabelWidth, signY, infoValueWidth, signHeight, "", { padding: 0 });

    const signaturePath = normalizeSignaturePath(data.ttd_asesor || asesor?.ttd_path);

    if (signaturePath && fs.existsSync(signaturePath)) {
      try {
        const signatureWidth = Math.min(120, infoValueWidth - 20);
        const signatureHeight = 55;
        const signatureX = infoX + infoLabelWidth + (infoValueWidth - signatureWidth) / 2;
        const signatureY = signY + 8;
        doc.image(signaturePath, signatureX, signatureY, { fit: [signatureWidth, signatureHeight] });
      } catch (error) {}
    }

    doc.font("Helvetica").fontSize(6.5).text(tanggal, infoX + infoLabelWidth + 5, signY + signHeight - 19, { width: infoValueWidth - 10, align: "center" });

    drawPageNumber();
    doc.end();
  } catch (err) {
    console.error("DOWNLOAD PDF FR.AK.05 ERROR:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = {
  submitFrAk05,
  updateFrAk05,
  getFrAk05,
  listFrAk05,
  downloadPdfFrAk05
};