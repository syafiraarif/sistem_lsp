const { Mkva, MkvaDetail, JadwalAsesor, Jadwal, Skema, Tuk } = require("../../models");
const response = require("../../utils/response.util");
const PDFDocument = require("pdfkit");

const safeParse = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatMkvaResponse = (mkva) => ({
  ...mkva.toJSON(),
  tujuan_fokus_validasi: safeParse(mkva.tujuan_fokus_validasi),
  konteks_validasi: safeParse(mkva.konteks_validasi),
  pendekatan_validasi: safeParse(mkva.pendekatan_validasi),
  asesor_kompetensi: safeParse(mkva.asesor_kompetensi),
  acuan_pembanding: safeParse(mkva.acuan_pembanding),
  dokumen_terkait: safeParse(mkva.dokumen_terkait),
  keterampilan_komunikasi: safeParse(mkva.keterampilan_komunikasi),
  rencana_implementasi: safeParse(mkva.rencana_implementasi)
});

exports.getJadwalMkva = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const data = await JadwalAsesor.findAll({
      where: {
        id_user,
        jenis_tugas: "validator_mkva",
        status: "aktif"
      },
      include: [{
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
          },
          {
            model: Mkva,
            as: "mkvas",
            required: false,
            where: {
              id_user
            },
            attributes: ["id_mkva", "id_jadwal", "id_user", "periode", "updated_at"]
          }
        ]
      }]
    });

    const result = data.map((ja) => {
      const j = ja.jadwal;
      const mkva = j?.mkvas?.[0] || null;
      return {
        id_jadwal: j?.id_jadwal,
        id_mkva: mkva?.id_mkva || null,
        status_mkva: mkva ? "selesai" : "belum",
        nama_kegiatan: j?.nama_kegiatan,
        skema: j?.skema?.judul_skema,
        kode_skema: j?.skema?.kode_skema,
        tanggal: j?.tgl_awal,
        tanggal_akhir: j?.tgl_akhir,
        tempat: j?.tuk?.nama_tuk,
        status: ja.status,
        boleh_mkva: true
      };
    });

    return response.success(res, "Daftar jadwal MKVA", result);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getDetailMkva = async (req, res) => {
  try {
    const { id_mkva } = req.params;
    const mkva = await Mkva.findOne({
      where: { id_mkva },
      include: [{
        model: MkvaDetail,
        as: "details"
      }]
    });

    if (!mkva) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    return response.success(res, "Detail MKVA", formatMkvaResponse(mkva));
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.submitMkva = async (req, res) => {
  const t = await Mkva.sequelize.transaction();

  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.params;
    const isValidator = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        jenis_tugas: "validator_mkva",
        status: "aktif"
      }
    });

    if (!isValidator) {
      await t.rollback();
      return response.error(res, "Tidak diizinkan", 403);
    }

    const existing = await Mkva.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    if (existing) {
      await t.rollback();
      return response.error(res, "MKVA sudah diisi", 400);
    }

    const mkva = await Mkva.create({
      id_jadwal,
      id_user,
      periode: req.body.periode,
      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),
      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),
      lead_asesor: req.body.lead_asesor || null,
      manajer_supervisor: req.body.manajer_supervisor || null,
      tenaga_ahli: req.body.tenaga_ahli || null,
      koord_pelatihan: req.body.koord_pelatihan || null,
      anggota_asosiasi: req.body.anggota_asosiasi || null,
      hasil_konfirmasi: req.body.hasil_konfirmasi || null,
      acuan_pembanding: JSON.stringify(req.body.acuan_pembanding || []),
      dokumen_terkait: JSON.stringify(req.body.dokumen_terkait || []),
      keterampilan_komunikasi: JSON.stringify(req.body.keterampilan_komunikasi || []),
      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,
      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, {
      transaction: t
    });

    const details = (req.body.detail_penilaian || []).map((item) => ({
      id_mkva: mkva.id_mkva,
      aspek: item.aspek || "",
      bukti_valid: Boolean(item.V),
      bukti_authentic: Boolean(item.A),
      bukti_terkini: Boolean(item.T),
      bukti_memadai: Boolean(item.M),
      prinsip_valid: Boolean(item.Vp),
      prinsip_reliable: Boolean(item.R),
      prinsip_fair: Boolean(item.F),
      prinsip_flexible: Boolean(item.FL)
    }));

    if (details.length) {
      await MkvaDetail.bulkCreate(details, {
        transaction: t
      });
    }

    await t.commit();

    return response.success(res, "MKVA berhasil disimpan", {
      id_mkva: mkva.id_mkva
    });
  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.updateMkva = async (req, res) => {
  const t = await Mkva.sequelize.transaction();

  try {
    const { id_mkva } = req.params;
    const id_user = req.user.id_user;
    const mkva = await Mkva.findOne({
      where: {
        id_mkva,
        id_user
      }
    });

    if (!mkva) {
      await t.rollback();
      return response.error(res, "Data tidak ditemukan", 404);
    }

    await mkva.update({
      periode: req.body.periode,
      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),
      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),
      lead_asesor: req.body.lead_asesor || null,
      manajer_supervisor: req.body.manajer_supervisor || null,
      tenaga_ahli: req.body.tenaga_ahli || null,
      koord_pelatihan: req.body.koord_pelatihan || null,
      anggota_asosiasi: req.body.anggota_asosiasi || null,
      hasil_konfirmasi: req.body.hasil_konfirmasi || null,
      acuan_pembanding: JSON.stringify(req.body.acuan_pembanding || []),
      dokumen_terkait: JSON.stringify(req.body.dokumen_terkait || []),
      keterampilan_komunikasi: JSON.stringify(req.body.keterampilan_komunikasi || []),
      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,
      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, {
      transaction: t
    });

    await MkvaDetail.destroy({
      where: {
        id_mkva
      },
      transaction: t
    });

    const details = (req.body.detail_penilaian || []).map((item) => ({
      id_mkva,
      aspek: item.aspek || "",
      bukti_valid: Boolean(item.V),
      bukti_authentic: Boolean(item.A),
      bukti_terkini: Boolean(item.T),
      bukti_memadai: Boolean(item.M),
      prinsip_valid: Boolean(item.Vp),
      prinsip_reliable: Boolean(item.R),
      prinsip_fair: Boolean(item.F),
      prinsip_flexible: Boolean(item.FL)
    }));

    if (details.length) {
      await MkvaDetail.bulkCreate(details, {
        transaction: t
      });
    }

    await t.commit();
    return response.success(res, "MKVA berhasil diupdate");
  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.getMkvaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;
    const mkva = await Mkva.findOne({
      where: {
        id_jadwal,
        id_user
      },
      include: [{
        model: MkvaDetail,
        as: "details",
        required: false
      }]
    });

    if (!mkva) {
      return response.success(res, "Belum ada MKVA", null);
    }

    return response.success(res, "Detail MKVA", formatMkvaResponse(mkva));
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id_mkva } = req.params;
    const id_user = req.user.id_user;
    const mkva = await Mkva.findOne({
      where: {
        id_mkva,
        id_user
      },
      include: [
        {
          model: MkvaDetail,
          as: "details"
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
    });

    if (!mkva) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    const data = formatMkvaResponse(mkva);
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: true,
      info: {
        Title: `FR.VA ${id_mkva}`,
        Author: "Sistem LSP"
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=MKVA_${id_mkva}.pdf`);
    doc.pipe(res);

    const W = 595.28;
    const H = 841.89;
    const M = 28;
    const CW = W - M * 2;
    const black = "#111111";
    const orange = "#F28C28";
    const grey = "#F2F4F7";
    const red = "#C1272D";

    const jadwal = mkva.jadwal || {};
    const skema = jadwal.skema || {};
    const tuk = jadwal.tuk || {};
    const tujuan = data.tujuan_fokus_validasi;
    const konteks = data.konteks_validasi;
    const pendekatan = data.pendekatan_validasi;
    const acuan = data.acuan_pembanding;
    const dokumen = data.dokumen_terkait;
    const komunikasi = data.keterampilan_komunikasi;
    const asesor = data.asesor_kompetensi.filter(Boolean);
    const details = Array.isArray(data.details) ? data.details : [];
    const plans = Array.isArray(data.rencana_implementasi) ? data.rencana_implementasi : [];
    const temuan = String(data.temuan_validasi || "").split("\n").map((item) => item.trim()).filter(Boolean);
    const rekomendasi = String(data.rekomendasi || "").split("\n").map((item) => item.trim()).filter(Boolean);
    const tanggal = jadwal.tgl_awal || jadwal.tanggal || "";
    const tempat = tuk.nama_tuk || tuk.nama || jadwal.tempat || jadwal.lokasi || "-";
    const namaSkema = skema.judul_skema || jadwal.nama_skema || jadwal.skema || "-";
    const kodeSkema = skema.kode_skema || jadwal.kode_skema || "-";
    const periodeMap = {
      sebelum_asesmen: "SEBELUM ASESMEN",
      pada_saat_asesmen: "PADA SAAT ASESMEN",
      setelah_asesmen: "SETELAH ASESMEN"
    };
    const periode = periodeMap[data.periode] || data.periode || "-";

    const tujuanOptions = [
      ["bagian_penjaminan_mutu", "Bagian dari proses penjaminan mutu organisasi"],
      ["mengantisipasi_risiko", "Mengantisipasi risiko"],
      ["memenuhi_persyaratan_bnsp", "Memenuhi persyaratan BNSP"],
      ["memastikan_kesesuaian_bukti", "Memastikan kesesuaian bukti-bukti"],
      ["meningkatkan_kualitas_asesmen", "Meningkatkan kualitas asesmen"],
      ["mengevaluasi_kualitas_perangkat_asesmen", "Mengevaluasi kualitas perangkat asesmen"],
      ["manual_tujuan", ""]
    ];

    const konteksOptions = [
      ["internal_organisasi", "Internal organisasi"],
      ["eksternal_organisasi", "Eksternal organisasi"],
      ["proses_lisensi_relisensi", "Proses lisensi/re lisensi"],
      ["dengan_kolega_asesor", "Dengan kolega asesor"],
      ["kolega_organisasi_pelatihan_atau_asesmen", "Kolega dari organisasi pelatihan atau asesmen"],
      ["manual_konteks", ""]
    ];

    const pendekatanOptions = [
      ["panel_asesmen", "Panel asesmen"],
      ["pertemuan_moderasi", "Pertemuan moderasi"],
      ["mengkaji_perangkat_asesmen", "Mengkaji perangkat asesmen"],
      ["acuan_pembanding", "Acuan pembanding"],
      ["pengujian_lapangan_uji_coba_perangkat_asesmen", "Pengujian lapangan dan uji coba perangkat asesmen"],
      ["umpan_balik_klien", "Umpan balik dari klien"],
      ["manual_pendekatan", ""]
    ];

    const acuanOptions = [
      ["standar_kompetensi", "Standar kompetensi"],
      ["sop_ik", "SOP/IK"],
      ["manual_instruction_book", "Manual Instruction/book"],
      ["standar_kinerja", "Standar Kinerja"],
      ["manual_acuan", ""]
    ];

    const dokumenOptions = [
      ["skema_sertifikasi", "Skema sertifikasi"],
      ["skkni_sk3_ski", "SKKNI/SK3/SKI"],
      ["perangkat_asesmen", "Perangkat asesmen"],
      ["peraturan_pedoman", "Peraturan/Pedoman"],
      ["manual_dokumen", ""]
    ];

    const komunikasiOptions = [
      ["pro_aktif", "PRO AKTIF"],
      ["active_listening", "ACTIVE LISTENING"],
      ["komunikasi_lisan_tertulis_visual", "Komunikasi lisan, tertulis dan Visual"],
      ["manual_komunikasi", ""]
    ];

    const defaultAspects = [
      "Proses asesmen",
      "Rencana asesmen",
      "Interpretasi standar kompetensi",
      "Interpretasi acuan pembanding lainnya",
      "Penyeleksian dan penerapan metode asesmen",
      "Penyeleksian dan penerapan perangkat asesmen",
      "Bukti-bukti yang dikumpulkan",
      "Proses pengambilan keputusan"
    ];

    const has = (values, key) => values.some((value) => String(value) === key);

    const manualValue = (values) => {
      const found = values.find((value) => String(value).startsWith("manual:"));
      return found ? String(found).slice(7).trim() : "";
    };

    const formatDate = (value) => {
      if (!value) return "-";
      const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) return String(value);
      return parsed.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    };

    const wrapText = (value, width, size, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
      const words = String(cleanValue(value)).replace(/\s+/g, " ").trim().split(" ");
      const lines = [];
      let line = "";

      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;

        if (!line || doc.widthOfString(test) <= width) {
          line = test;
        } else {
          lines.push(line);
          line = word;
        }
      });

      if (line) lines.push(line);
      return lines.length ? lines : ["-"];
    };

    const cleanValue = (value) => {
      if (value === null || value === undefined || String(value).trim() === "") return "-";
      return String(value);
    };

    const drawText = (value, x, y, width, height, options = {}) => {
      const pad = options.pad ?? 3;
      const size = options.size || 7;
      const bold = Boolean(options.bold);
      const lineHeight = options.lineHeight || size + 1.1;
      const textWidth = Math.max(8, width - pad * 2);
      const maxLines = Math.max(1, Math.floor((height - pad * 2) / lineHeight));
      const lines = wrapText(value, textWidth, size, bold).slice(0, maxLines);

      doc.save();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica");
      doc.fontSize(size);
      doc.fillColor(options.color || black);

      lines.forEach((line, index) => {
        doc.text(line, x + pad, y + pad + index * lineHeight, {
          width: textWidth,
          lineBreak: false,
          align: options.align || "left"
        });
      });

      doc.restore();
      doc.y = 0;
    };

    const drawBox = (x, y, width, height, fill = null) => {
      doc.save();
      doc.lineWidth(0.65);
      doc.strokeColor(black);

      if (fill) {
        doc.fillColor(fill);
        doc.rect(x, y, width, height).fillAndStroke();
      } else {
        doc.rect(x, y, width, height).stroke();
      }

      doc.restore();
      doc.y = 0;
    };

    const cell = (x, y, width, height, value = "", options = {}) => {
      drawBox(x, y, width, height, options.fill || null);

      if (value !== "") {
        drawText(value, x, y, width, height, options);
      }
    };

    const checkbox = (x, y, checked) => {
      const bx = x + 4;
      const by = y + 5;
      const size = 8;

      doc.save();
      doc.lineWidth(0.6);
      doc.strokeColor(black);
      doc.rect(bx, by, size, size).stroke();

      if (checked) {
        doc.lineWidth(1.05);
        doc.moveTo(bx + 1.2, by + 4.1);
        doc.lineTo(bx + 3.4, by + 6.4);
        doc.lineTo(bx + 7.1, by + 1.7);
        doc.stroke();
      }

      doc.restore();
      doc.y = 0;
    };

    const optionCell = (x, y, width, height, option, values, bold = false) => {
      const isManual = option[0].startsWith("manual_");
      const manual = manualValue(values);
      const label = isManual ? manual || "................................................" : option[1];
      const checked = isManual ? Boolean(manual) : has(values, option[0]);

      cell(x, y, width, height);
      checkbox(x, y, checked);
      drawText(label, x + 13, y, width - 13, height, {
        bold,
        size: 6.1,
        pad: 2
      });
    };

    const section = (number, title, y) => {
      cell(M, y, CW, 23, `${number}. ${title}`, {
        fill: orange,
        bold: true,
        size: 8.5,
        pad: 4
      });

      return y + 23;
    };

    const pageHeader = (page) => {
      drawText("Badan Nasional Sertifikasi Profesi", M, 12, 190, 10, {
        bold: true,
        size: 6,
        pad: 0
      });

      drawText("FR.VA. MEMBERIKAN KONTRIBUSI DALAM VALIDASI ASESMEN", W - M - 285, 12, 285, 10, {
        size: 5.7,
        align: "right",
        pad: 0
      });

      drawText(`${page}/4`, W - M - 22, H - 20, 22, 10, {
        size: 5.8,
        align: "right",
        pad: 0
      });

      drawText("Badan Nasional Sertifikasi Profesi", M, H - 20, 220, 10, {
        size: 5.6,
        pad: 0
      });

      drawText("FR.VA. MEMBERIKAN KONTRIBUSI DALAM VALIDASI ASESMEN", W - M - 300, H - 20, 300, 10, {
        size: 5.6,
        align: "right",
        pad: 0
      });
    };

    pageHeader(1);

    let y = 38;

    drawText("FR.VA. MEMBERIKAN KONTRIBUSI DALAM VALIDASI ASESMEN", M, y, CW, 18, {
      bold: true,
      size: 11,
      align: "center",
      pad: 0
    });

    y += 23;

    const metaRows = [
      ["Tim Validasi", asesor.length ? asesor.map((item, index) => `${index + 1}. ${item}`).join("\n") : "-", "Hari/Tanggal", formatDate(tanggal)],
      ["Periode", periode, "Tempat", tempat],
      ["Nama Skema", namaSkema, "Nomor Skema", kodeSkema]
    ];

    metaRows.forEach((row) => {
      cell(M, y, 84, 28, row[0], {
        fill: grey,
        bold: true,
        size: 6.4
      });

      cell(M + 84, y, 190, 28, row[1], {
        color: red,
        size: 6.4
      });

      cell(M + 274, y, 75, 28, row[2], {
        fill: grey,
        bold: true,
        size: 6.4
      });

      cell(M + 349, y, CW - 349, 28, row[3], {
        color: red,
        size: 6.4
      });

      y += 28;
    });

    y += 8;
    y = section(1, "Menyiapkan Proses Validasi", y);

    const colW = CW / 3;

    cell(M, y, colW, 24, "TUJUAN DAN FOKUS VALIDASI", {
      fill: grey,
      bold: true,
      size: 6
    });

    cell(M + colW, y, colW, 24, "KONTEKS VALIDASI", {
      fill: grey,
      bold: true,
      size: 6
    });

    cell(M + colW * 2, y, colW, 24, "PENDEKATAN VALIDASI", {
      fill: grey,
      bold: true,
      size: 6
    });

    y += 24;

    for (let i = 0; i < 7; i += 1) {
      optionCell(M, y, colW, 26, tujuanOptions[i], tujuan, i === 2 || i === 5);

      if (konteksOptions[i]) {
        optionCell(M + colW, y, colW, 26, konteksOptions[i], konteks, i === 0 || i === 2);
      } else {
        cell(M + colW, y, colW, 26);
      }

      optionCell(M + colW * 2, y, colW, 26, pendekatanOptions[i], pendekatan, i === 2 || i === 4);
      y += 26;
    }

    y += 7;

    const roleW = 168;
    const nameW = 142;
    const discussW = CW - roleW - nameW;
    const people = [
      ["Asesor kompetensi (wajib)", asesor.join("\n")],
      ["Lead Asesor", data.lead_asesor],
      ["Manager, supervisor", data.manajer_supervisor],
      ["Tenaga ahli di bidangnya", data.tenaga_ahli],
      ["Koord. Pelatihan", data.koord_pelatihan],
      ["Anggota asosiasi industry/profesi", data.anggota_asosiasi]
    ];

    cell(M, y, roleW, 22, "Orang yang relevan", {
      fill: grey,
      bold: true,
      size: 6.4
    });

    cell(M + roleW, y, nameW, 22, "Nama", {
      fill: grey,
      bold: true,
      size: 6.4
    });

    cell(M + roleW + nameW, y, discussW, 22, "Hasil konfirmasi/diskusi tujuan, fokus & konteks", {
      fill: grey,
      bold: true,
      size: 6.1
    });

    y += 22;

    people.forEach((person, index) => {
      const rowH = 25.5;

      cell(M, y, roleW, rowH, person[0], {
        bold: index === 0,
        size: 6.1
      });

      cell(M + roleW, y, nameW, rowH, person[1] || "-", {
        color: red,
        size: 6.1
      });

      if (index === 0) {
        cell(M + roleW + nameW, y, discussW, rowH * people.length, data.hasil_konfirmasi || "-", {
          color: red,
          size: 6
        });
      }

      y += rowH;
    });

    doc.addPage({ size: "A4", margin: 0 });
    pageHeader(2);

    y = 38;
    y = section(2, "Memberikan Kontribusi dalam Proses Validasi", y);

    const half = CW / 2;

    cell(M, y, half, 24, "Acuan Pembanding", {
      fill: grey,
      bold: true,
      size: 6.8
    });

    cell(M + half, y, half, 24, "Dokumen terkait dan bahan-bahan", {
      fill: grey,
      bold: true,
      size: 6.8
    });

    y += 24;

    for (let i = 0; i < 5; i += 1) {
      optionCell(M, y, half, 25, acuanOptions[i], acuan, i < 2);
      optionCell(M + half, y, half, 25, dokumenOptions[i], dokumen, i < 4);
      y += 25;
    }

    y += 8;

    cell(M, y, 155, 92, "Keterampilan komunikasi yang digunakan dalam kegiatan validasi :", {
      fill: grey,
      bold: true,
      size: 6.3
    });

    for (let i = 0; i < komunikasiOptions.length; i += 1) {
      optionCell(M + 155, y + i * 23, CW - 155, 23, komunikasiOptions[i], komunikasi, i < 2);
    }

    y += 100;

    cell(M, y, CW, 23, "PEMENUHAN TERHADAP :", {
      fill: grey,
      bold: true,
      size: 7.5,
      align: "center"
    });

    y += 23;

    const noW = 25;
    const aspectW = 287;
    const markW = (CW - noW - aspectW) / 8;

    cell(M, y, noW, 37, "No.", {
      fill: grey,
      bold: true,
      size: 6.4,
      align: "center"
    });

    cell(M + noW, y, aspectW, 37, "Aspek-Aspek Dalam Kegiatan Validasi\n(Meninjau, Membandingkan, Mengevaluasi)", {
      fill: grey,
      bold: true,
      size: 5.9,
      align: "center"
    });

    cell(M + noW + aspectW, y, markW * 4, 18.5, "ATURAN BUKTI", {
      fill: grey,
      bold: true,
      size: 6,
      align: "center"
    });

    cell(M + noW + aspectW + markW * 4, y, markW * 4, 18.5, "PRINSIP ASESMEN", {
      fill: grey,
      bold: true,
      size: 6,
      align: "center"
    });

    ["V", "A", "T", "M", "V", "R", "F", "F"].forEach((mark, index) => {
      cell(M + noW + aspectW + index * markW, y + 18.5, markW, 18.5, mark, {
        fill: grey,
        bold: true,
        size: 6.3,
        align: "center"
      });
    });

    y += 37;

    for (let i = 0; i < 8; i += 1) {
      const item = details[i] || {};
      const rowH = 26;
      const flags = [
        Boolean(item.bukti_valid),
        Boolean(item.bukti_authentic),
        Boolean(item.bukti_terkini),
        Boolean(item.bukti_memadai),
        Boolean(item.prinsip_valid),
        Boolean(item.prinsip_reliable),
        Boolean(item.prinsip_fair),
        Boolean(item.prinsip_flexible)
      ];

      cell(M, y, noW, rowH, `${i + 1}.`, {
        size: 6.3,
        align: "center"
      });

      cell(M + noW, y, aspectW, rowH, item.aspek || defaultAspects[i], {
        size: 6
      });

      flags.forEach((flag, index) => {
        const x = M + noW + aspectW + index * markW;
        cell(x, y, markW, rowH);
        checkbox(x, y, flag);
      });

      y += rowH;
    }

    doc.addPage({ size: "A4", margin: 0 });
    pageHeader(3);

    y = 38;
    y = section(3, "Memberikan Kontribusi untuk Hasil Asesmen", y);

    const findingW = CW / 2;

    cell(M, y, findingW, 29, "TEMUAN-TEMUAN VALIDASI :", {
      fill: grey,
      bold: true,
      size: 6.8
    });

    cell(M + findingW, y, findingW, 29, "REKOMENDASI-REKOMENDASI UNTUK MENINGKATKAN PRAKTEK ASESMEN", {
      fill: grey,
      bold: true,
      size: 5.8
    });

    y += 29;

    for (let i = 0; i < 4; i += 1) {
      const left = temuan[i] ? `${i + 1}. ${temuan[i]}` : `${i + 1}.`;
      const right = rekomendasi[i] || "";

      cell(M, y, findingW, 94, left, {
        color: red,
        bold: true,
        size: 6
      });

      cell(M + findingW, y, findingW, 94, right, {
        color: red,
        bold: true,
        size: 6
      });

      y += 94;
    }

    doc.addPage({ size: "A4", margin: 0 });
    pageHeader(4);

    y = 38;

    cell(M, y, CW, 30, "Rencana Implementasi Perubahan / Perbaikan Pelaksanaan Asesmen :", {
      fill: orange,
      bold: true,
      size: 8.2,
      align: "center"
    });

    y += 30;

    const planNoW = 28;
    const planTimeW = 82;
    const planPersonW = 118;
    const planActivityW = CW - planNoW - planTimeW - planPersonW;

    cell(M, y, planNoW, 42, "NO.", {
      fill: grey,
      bold: true,
      size: 6.6,
      align: "center"
    });

    cell(M + planNoW, y, planActivityW, 42, "KEGIATAN PERBAIKAN SESUAI REKOMENDASI", {
      fill: grey,
      bold: true,
      size: 6.5,
      align: "center"
    });

    cell(M + planNoW + planActivityW, y, planTimeW, 42, "WAKTU\nPENYELESAIAN", {
      fill: grey,
      bold: true,
      size: 6.4,
      align: "center"
    });

    cell(M + planNoW + planActivityW + planTimeW, y, planPersonW, 42, "PENANGGUNG JAWAB", {
      fill: grey,
      bold: true,
      size: 6.5,
      align: "center"
    });

    y += 42;

    for (let i = 0; i < 4; i += 1) {
      const item = plans[i] || {};
      const rowH = 88;

      cell(M, y, planNoW, rowH, `${i + 1}.`, {
        size: 6.6,
        align: "center"
      });

      cell(M + planNoW, y, planActivityW, rowH, item.rencana || "", {
        color: red,
        bold: true,
        size: 6.3
      });

      cell(M + planNoW + planActivityW, y, planTimeW, rowH, item.target_waktu || "", {
        color: red,
        size: 6.3,
        align: "center"
      });

      cell(M + planNoW + planActivityW + planTimeW, y, planPersonW, rowH, item.penanggung_jawab || "", {
        color: red,
        size: 6.3
      });

      y += rowH;
    }

    y += 16;

    cell(M, y, CW, 24, `ID MKVA: ${id_mkva}   |   Dibuat: ${formatDate(mkva.created_at || "")}`, {
      fill: grey,
      bold: true,
      size: 6.5
    });

    doc.end();
  } catch (err) {
    return response.error(res, err.message);
  }
};