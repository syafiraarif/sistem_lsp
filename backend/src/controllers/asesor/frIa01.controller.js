const path = require("path");
const sequelize = require("../../config/database");
const {
  FrIa01,
  FrIa01Detail,
  Jadwal,
  PesertaJadwal,
  ProfileAsesor,
  ProfileAsesi,
  Skema,
  Tuk,
  SkemaUnit,
  KelompokPekerjaan,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
} = require("../../models");
const PDFDocument = require("pdfkit");

const getCurrentUserId = (req) => Number(req.user?.id_user || req.user?.id);

const buildContext = async ({ id_jadwal, id_peserta, id_asesor }) => {
  const jadwal = await Jadwal.findByPk(id_jadwal);
  if (!jadwal) return null;

  const [skema, tuk, peserta] = await Promise.all([
    Skema.findByPk(jadwal.id_skema),
    Tuk.findByPk(jadwal.id_tuk),
    PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal,
      },
    }),
  ]);

  if (!peserta) return { jadwal, skema, tuk, peserta: null };

  const [asesi, asesor] = await Promise.all([
    ProfileAsesi.findByPk(peserta.id_user),
    ProfileAsesor.findByPk(id_asesor),
  ]);

  const skemaUnits = await SkemaUnit.findAll({
    where: { id_skema: jadwal.id_skema },
    order: [
      ["id_kelompok", "ASC"],
      ["urutan", "ASC"],
    ],
  });

  const unitIds = [...new Set(skemaUnits.map((row) => Number(row.id_unit)).filter(Boolean))];
  const kelompokIds = [...new Set(skemaUnits.map((row) => Number(row.id_kelompok)).filter(Boolean))];

  const [units, kelompokList, elements, kuks] = await Promise.all([
    unitIds.length
      ? UnitKompetensi.findAll({ where: { id_unit: unitIds } })
      : [],
    kelompokIds.length
      ? KelompokPekerjaan.findAll({
          where: { id_kelompok: kelompokIds },
          order: [["urutan", "ASC"]],
        })
      : [],
    unitIds.length
      ? UnitElemen.findAll({
          where: { id_unit: unitIds },
          order: [["urutan", "ASC"]],
        })
      : [],
    [],
  ]);

  const elementIds = elements.map((row) => Number(row.id_elemen)).filter(Boolean);
  const kukRows = elementIds.length
    ? await UnitKuk.findAll({
        where: { id_elemen: elementIds },
        order: [["urutan", "ASC"]],
      })
    : [];

  const unitMap = new Map(units.map((row) => [Number(row.id_unit), row]));
  const groupMap = new Map(kelompokList.map((row) => [Number(row.id_kelompok), row]));
  const elementMap = new Map();
  elements.forEach((row) => {
    const key = Number(row.id_unit);
    if (!elementMap.has(key)) elementMap.set(key, []);
    elementMap.get(key).push(row);
  });

  const kukMap = new Map();
  kukRows.forEach((row) => {
    const key = Number(row.id_elemen);
    if (!kukMap.has(key)) kukMap.set(key, []);
    kukMap.get(key).push(row);
  });

  const grouped = [];
  for (const relation of skemaUnits) {
    const groupId = Number(relation.id_kelompok);
    let group = grouped.find((item) => Number(item.id_kelompok) === groupId);
    if (!group) {
      const groupData = groupMap.get(groupId);
      group = {
        id_kelompok: relation.id_kelompok,
        nama_kelompok: groupData?.nama_kelompok || `Kelompok Pekerjaan ${grouped.length + 1}`,
        deskripsi: groupData?.deskripsi || null,
        urutan: groupData?.urutan || grouped.length + 1,
        units: [],
      };
      grouped.push(group);
    }

    const unit = unitMap.get(Number(relation.id_unit));
    if (!unit) continue;

    const existingUnit = group.units.find((item) => Number(item.id_unit) === Number(unit.id_unit));
    if (existingUnit) continue;

    const unitElements = elementMap.get(Number(unit.id_unit)) || [];
    const rows = [];
    unitElements.forEach((element) => {
      const unitKuks = kukMap.get(Number(element.id_elemen)) || [];
      unitKuks.forEach((kuk) => {
        rows.push({
          id_unit: unit.id_unit,
          kode_unit: unit.kode_unit,
          judul_unit: unit.judul_unit,
          id_elemen: element.id_elemen,
          nama_elemen: element.nama_elemen,
          id_kuk: kuk.id_kuk,
          kuk: kuk.kuk,
          urutan_elemen: element.urutan,
          urutan_kuk: kuk.urutan,
          pencapaian: null,
          standar_industri: `SOP ${skema?.judul_skema || ""}`.trim() || null,
          penilaian_lanjut: null,
        });
      });
    });

    group.units.push({
      id_unit: unit.id_unit,
      kode_unit: unit.kode_unit,
      judul_unit: unit.judul_unit,
      urutan: relation.urutan,
      detail: rows,
    });
  }

  grouped.sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
  grouped.forEach((group) => {
    group.units.sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
  });

  return {
    jadwal,
    skema,
    tuk,
    peserta,
    asesi,
    asesor,
    kelompokPekerjaan: grouped,
  };
};

const flattenGroups = (groups) => {
  const result = [];
  (groups || []).forEach((group) => {
    (group.units || []).forEach((unit) => {
      (unit.detail || []).forEach((item) => result.push({ ...item }));
    });
  });
  return result;
};

const mergeSavedDetail = (groups, savedRows = [], skemaJudul = "") => {
  const map = new Map(
    savedRows.map((row) => [Number(row.id_kuk), row])
  );
  const sopStandard = `SOP ${skemaJudul || ""}`.trim();

  return groups.map((group) => ({
    ...group,
    units: (group.units || []).map((unit) => ({
      ...unit,
      detail: (unit.detail || []).map((item) => {
        const saved = map.get(Number(item.id_kuk));
        return saved
          ? {
              ...item,
              id_detail: saved.id_detail,
              standar_industri: sopStandard || saved.standar_industri || item.standar_industri || null,
              pencapaian: saved.pencapaian,
              penilaian_lanjut: saved.penilaian_lanjut,
            }
          : { ...item, standar_industri: sopStandard || item.standar_industri || null };
      }),
    })),
  }));
};

const makeResponse = ({ record, context, detailRows = [] }) => {
  const groups = mergeSavedDetail(
    context?.kelompokPekerjaan || [],
    detailRows,
    context?.skema?.judul_skema
  );
  const flat = flattenGroups(groups);

  return {
    id_fr_ia_01: record?.id_fr_ia_01 || null,
    id_jadwal: context?.jadwal?.id_jadwal || record?.id_jadwal,
    id_peserta: context?.peserta?.id_peserta || record?.id_peserta,
    id_asesor: context?.asesor?.id_user || record?.id_asesor,
    umpan_balik: record?.umpan_balik || "",
    rekomendasi: record?.rekomendasi || "",
    catatan_rekomendasi: record?.catatan_rekomendasi || "",
    ttd_asesor:
      record?.ttd_asesor || context?.asesor?.ttd_path || "",
    detail: flat,
    kelompokPekerjaan: groups,
    jadwal: context?.jadwal?.toJSON?.() || context?.jadwal || {},
    skema: context?.skema?.toJSON?.() || context?.skema || {},
    tuk: context?.tuk?.toJSON?.() || context?.tuk || {},
    asesor: context?.asesor?.toJSON?.() || context?.asesor || {},
    asesi: {
      ...(context?.asesi?.toJSON?.() || context?.asesi || {}),
      id_peserta: context?.peserta?.id_peserta || record?.id_peserta || null,
      id_jadwal: context?.peserta?.id_jadwal || record?.id_jadwal || null,
      nomor_peserta: context?.peserta?.nomor_peserta || null,
      status_asesmen: context?.peserta?.status_asesmen || null,
    },
  };
};

exports.getTugasAsesor = async (req, res) => {
  try {
    const data = await PesertaJadwal.findAll({
      where: { id_asesor: getCurrentUserId(req) },
      include: [{ model: Jadwal, as: "jadwal" }],
      order: [["id_peserta", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByPeserta = async (req, res) => {
  try {
    const id_jadwal = Number(req.query.id_jadwal);
    const id_peserta = Number(req.query.id_peserta);
    const id_asesor = getCurrentUserId(req);

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({ message: "id_jadwal dan id_peserta wajib diisi" });
    }

    const context = await buildContext({ id_jadwal, id_peserta, id_asesor });
    if (!context) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }
    if (!context.peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan pada jadwal tersebut" });
    }
    if (Number(context.peserta.id_asesor) !== id_asesor) {
      return res.status(403).json({ message: "Peserta bukan tanggung jawab asesor" });
    }

    const existing = await FrIa01.findOne({
      where: { id_jadwal, id_peserta, id_asesor },
      order: [["id_fr_ia_01", "DESC"]],
    });

    if (!existing) {
      const data = makeResponse({ context });
      return res.json({ generated: true, ...data });
    }

    const detailRows = await FrIa01Detail.findAll({
      where: { id_fr_ia_01: existing.id_fr_ia_01 },
      order: [["id_detail", "ASC"]],
    });

    return res.json(makeResponse({
      record: existing,
      context,
      detailRows,
    }));
  } catch (err) {
    console.error("GET FR.IA.01 ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id_asesor = getCurrentUserId(req);
    const id_jadwal = Number(req.body.id_jadwal);
    const id_peserta = Number(req.body.id_peserta);
    const detail = Array.isArray(req.body.detail) ? req.body.detail : [];
    const hasTidak = detail.some((item) => item.pencapaian === "tidak");
    const allYa = detail.length > 0 && detail.every((item) => item.pencapaian === "ya");
    const derivedRekomendasi = hasTidak ? "belum_kompeten" : allYa ? "kompeten" : (req.body.rekomendasi || null);

    if (!id_jadwal || !id_peserta) {
      await transaction.rollback();
      return res.status(400).json({ message: "id_jadwal dan id_peserta wajib diisi" });
    }

    const peserta = await PesertaJadwal.findOne({
      where: { id_peserta, id_jadwal, id_asesor },
    });
    if (!peserta) {
      await transaction.rollback();
      return res.status(403).json({ message: "Peserta bukan tanggung jawab asesor" });
    }

    const existing = await FrIa01.findOne({
      where: { id_jadwal, id_peserta, id_asesor },
    });
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({ message: "FR.IA.01 sudah tersedia", id_fr_ia_01: existing.id_fr_ia_01 });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);

    const header = await FrIa01.create(
      {
        id_jadwal,
        id_peserta,
        id_asesor,
        umpan_balik: req.body.umpan_balik || null,
        rekomendasi: derivedRekomendasi,
        catatan_rekomendasi: req.body.catatan_rekomendasi || null,
        ttd_asesor: req.body.ttd_asesor || asesor?.ttd_path || null,
      },
      { transaction }
    );

    if (detail.length) {
      await FrIa01Detail.bulkCreate(
        detail.map((item) => ({
          id_fr_ia_01: header.id_fr_ia_01,
          id_unit: item.id_unit,
          id_elemen: item.id_elemen,
          id_kuk: item.id_kuk,
          standar_industri: item.standar_industri || null,
          pencapaian: ["ya", "tidak"].includes(item.pencapaian)
            ? item.pencapaian
            : null,
          penilaian_lanjut: item.penilaian_lanjut || null,
        })),
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json({
      message: "FR.IA.01 berhasil dibuat",
      id_fr_ia_01: header.id_fr_ia_01,
      data: header,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("CREATE FR.IA.01 ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const current = await FrIa01.findOne({
      where: { id_fr_ia_01: id, id_asesor },
    });
    if (!current) {
      await transaction.rollback();
      return res.status(404).json({ message: "FR.IA.01 tidak ditemukan" });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);
    const detail = Array.isArray(req.body.detail) ? req.body.detail : [];
    const hasTidak = detail.some((item) => item.pencapaian === "tidak");
    const allYa = detail.length > 0 && detail.every((item) => item.pencapaian === "ya");
    const derivedRekomendasi = hasTidak ? "belum_kompeten" : allYa ? "kompeten" : (req.body.rekomendasi || null);

    await current.update(
      {
        umpan_balik: req.body.umpan_balik || null,
        rekomendasi: derivedRekomendasi,
        catatan_rekomendasi: req.body.catatan_rekomendasi || null,
        ttd_asesor: req.body.ttd_asesor || asesor?.ttd_path || null,
        updated_at: new Date(),
      },
      { transaction }
    );

    await FrIa01Detail.destroy({
      where: { id_fr_ia_01: id },
      transaction,
    });

    if (detail.length) {
      await FrIa01Detail.bulkCreate(
        detail.map((item) => ({
          id_fr_ia_01: id,
          id_unit: item.id_unit,
          id_elemen: item.id_elemen,
          id_kuk: item.id_kuk,
          standar_industri: item.standar_industri || null,
          pencapaian: ["ya", "tidak"].includes(item.pencapaian)
            ? item.pencapaian
            : null,
          penilaian_lanjut: item.penilaian_lanjut || null,
        })),
        { transaction }
      );
    }

    await transaction.commit();
    res.json({ message: "FR.IA.01 berhasil diperbarui", id_fr_ia_01: id });
  } catch (err) {
    await transaction.rollback();
    console.error("UPDATE FR.IA.01 ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const existing = await FrIa01.findOne({
      where: { id_fr_ia_01: id, id_asesor },
    });

    if (!existing) {
      return res.status(404).json({ message: "FR.IA.01 tidak ditemukan" });
    }

    const context = await buildContext({
      id_jadwal: existing.id_jadwal,
      id_peserta: existing.id_peserta,
      id_asesor,
    });

    if (!context?.peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }

    const detailRows = await FrIa01Detail.findAll({
      where: { id_fr_ia_01: id },
      order: [["id_detail", "ASC"]],
    });

    res.json(makeResponse({ record: existing, context, detailRows }));
  } catch (err) {
    console.error("GET BY ID FR.IA.01 ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const existing = await FrIa01.findOne({
      where: { id_fr_ia_01: id, id_asesor },
    });
    if (!existing) {
      return res.status(404).json({ message: "FR.IA.01 tidak ditemukan" });
    }

    const context = await buildContext({
      id_jadwal: existing.id_jadwal,
      id_peserta: existing.id_peserta,
      id_asesor,
    });

    const detailRows = await FrIa01Detail.findAll({
      where: { id_fr_ia_01: id },
      order: [["id_detail", "ASC"]],
    });
    const groups = mergeSavedDetail(context.kelompokPekerjaan, detailRows, context.skema?.judul_skema);

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 28, bottom: 28, left: 28, right: 28 },
      info: { Title: `FR.IA.01 - ${context.asesi?.nama_lengkap || "Asesi"}` },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=FRIA01-${id}.pdf`);
    doc.pipe(res);

    const pageW = 595.28;
    const left = 28;
    const right = pageW - 28;
    const usable = right - left;

    const ensureSpace = (height) => {
      if (doc.y + height > 815) doc.addPage();
    };

    const line = (x1, y1, x2, y2, width = 0.6) => {
      doc.lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    const drawCell = (x, y, w, h, text = "", opts = {}) => {
      doc.rect(x, y, w, h).stroke();
      doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts.size || 7.5)
        .text(String(text ?? ""), x + 3, y + 3, {
          width: w - 6,
          height: h - 6,
          align: opts.align || "left",
          valign: "center",
        });
    };

    doc.font("Helvetica-Bold").fontSize(12).text(
      "FR.IA.01. CL - CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI",
      left,
      28,
      { width: usable, align: "center" }
    );
    doc.moveDown(0.8);

    let y = doc.y;
    const infoRows = [
      ["Skema Sertifikasi\n(KKNI/Okupasi/Klaster)", "Judul", context.skema?.judul_skema || "-"],
      ["", "Nomor", context.skema?.kode_skema || "-"],
      ["TUK", "", context.tuk?.nama_tuk || "-"],
      ["Nama Asesor", "", context.asesor?.nama_lengkap || "-"],
      ["Nama Asesi", "", context.asesi?.nama_lengkap || "-"],
      ["Tanggal", "", String(context.jadwal?.tgl_awal || context.jadwal?.tgl_akhir || "-")],
    ];
    const hInfo = 23;
    infoRows.forEach((r, idx) => {
      const c1 = idx < 2 ? 154 : 154;
      const c2 = 68;
      const c3 = usable - c1 - c2;
      drawCell(left, y, c1, hInfo, r[0], { bold: true });
      drawCell(left + c1, y, c2, hInfo, r[1], { bold: true });
      drawCell(left + c1 + c2, y, c3, hInfo, r[2]);
      y += hInfo;
    });

    y += 14;
    drawCell(left, y, usable, 18, "PANDUAN BAGI ASESOR", { bold: true, size: 8.5 });
    const guide = [
      "Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.",
      "Isilah standar industri atau tempat kerja.",
      "Beri tanda centang pada kolom YA/Tidak sesuai hasil observasi.",
      "Penilaian Lanjut disesuaikan dengan hasil pengamatan.",
      "Isilah kolom KUK sesuai dengan Unit Kompetensi/SKKNI.",
    ];
    y += 18;
    guide.forEach((text) => {
      ensureSpace(18);
      doc.font("Helvetica").fontSize(7).text(`• ${text}`, left + 6, y + 3, { width: usable - 12 });
      y += 13;
    });

    groups.forEach((group, groupIndex) => {
      ensureSpace(75);
      y += 10;
      doc.font("Helvetica-Bold").fontSize(8.5).text(group.nama_kelompok || `Kelompok Pekerjaan ${groupIndex + 1}`, left, y);
      y += 12;

      const gw = [42, 135, usable - 177];
      drawCell(left, y, gw[0], 22, "No.", { bold: true, align: "center" });
      drawCell(left + gw[0], y, gw[1], 22, "Kode Unit", { bold: true, align: "center" });
      drawCell(left + gw[0] + gw[1], y, gw[2], 22, "Judul Unit", { bold: true, align: "center" });
      y += 22;

      group.units.forEach((unit, unitIndex) => {
        const rowH = 22;
        ensureSpace(rowH + 10);
        drawCell(left, y, gw[0], rowH, String(unitIndex + 1), { align: "center" });
        drawCell(left + gw[0], y, gw[1], rowH, unit.kode_unit || "-");
        drawCell(left + gw[0] + gw[1], y, gw[2], rowH, unit.judul_unit || "-");
        y += rowH;
      });

      group.units.forEach((unit) => {
        ensureSpace(80);
        y += 10;
        drawCell(left, y, 130, 20, "Unit Kompetensi", { bold: true });
        drawCell(left + 130, y, 55, 20, ":", { align: "center" });
        drawCell(left + 185, y, usable - 185, 20, unit.kode_unit || "-", { bold: true });
        y += 20;
        drawCell(left, y, 130, 20, "Judul Unit", { bold: true });
        drawCell(left + 130, y, 55, 20, ":", { align: "center" });
        drawCell(left + 185, y, usable - 185, 20, unit.judul_unit || "-");
        y += 24;

        const widths = [30, 74, 168, 98, 43, 43, usable - 456];
        drawCell(left, y, widths[0], 48, "No.", { bold: true, align: "center" });
        drawCell(left + widths[0], y, widths[1], 48, "Elemen", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1], y, widths[2], 48, "Kriteria Unjuk Kerja", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1] + widths[2], y, widths[3], 48, "Standar Industri\natau Tempat Kerja", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1] + widths[2] + widths[3], y, widths[4] + widths[5], 22, "Pencapaian", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1] + widths[2] + widths[3] + widths[4] + widths[5], y, widths[6], 48, "Penilaian\nLanjut", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1] + widths[2] + widths[3], y + 22, widths[4], 26, "Ya", { bold: true, align: "center" });
        drawCell(left + widths[0] + widths[1] + widths[2] + widths[3] + widths[4], y + 22, widths[5], 26, "Tidak", { bold: true, align: "center" });
        y += 48;

        const elementBuckets = new Map();
        (unit.detail || []).forEach((row) => {
          if (!elementBuckets.has(Number(row.id_elemen))) elementBuckets.set(Number(row.id_elemen), []);
          elementBuckets.get(Number(row.id_elemen)).push(row);
        });

        [...elementBuckets.values()].forEach((elementRows, elementIndex) => {
          elementRows.forEach((row, rowIndex) => {
            const rowH = 34;
            ensureSpace(rowH + 4);
            let xx = left;
            if (rowIndex === 0) {
              doc.rect(xx, y, widths[0], rowH * elementRows.length).stroke();
              doc.font("Helvetica").fontSize(7).text(String(elementIndex + 1), xx + 3, y + 4, { width: widths[0] - 6, align: "center" });
            }
            xx += widths[0];
            if (rowIndex === 0) {
              doc.rect(xx, y, widths[1], rowH * elementRows.length).stroke();
              doc.font("Helvetica").fontSize(7).text(String(row.nama_elemen || "-"), xx + 3, y + 4, { width: widths[1] - 6, height: rowH * elementRows.length - 6 });
            }
            xx += widths[1];
            drawCell(xx, y, widths[2], rowH, row.kuk || "-", { size: 7 }); xx += widths[2];
            drawCell(xx, y, widths[3], rowH, row.standar_industri || `SOP ${context.skema?.judul_skema || ""}`.trim() || "", { size: 6.6 }); xx += widths[3];
            drawCell(xx, y, widths[4], rowH, row.pencapaian === "ya" ? "✓" : "", { size: 9, align: "center" }); xx += widths[4];
            drawCell(xx, y, widths[5], rowH, row.pencapaian === "tidak" ? "✓" : "", { size: 9, align: "center" }); xx += widths[5];
            drawCell(xx, y, widths[6], rowH, row.penilaian_lanjut || "", { size: 6.6 });
            y += rowH;
          });
        });
      });
    });

    ensureSpace(160);
    y += 14;
    drawCell(left, y, usable, 18, "Umpan Balik untuk asesi:", { bold: true });
    drawCell(left, y + 18, usable, 75, existing.umpan_balik || "", { size: 8 });
    y += 105;

    drawCell(left, y, usable / 2, 165, "", {});
    drawCell(left + usable / 2, y, usable / 2, 165, "", {});
    doc.font("Helvetica-Bold").fontSize(8).text("Rekomendasi:", left + 5, y + 5);
    doc.font("Helvetica").fontSize(7.2).text(`${existing.rekomendasi === "kompeten" ? "☒" : "☐"} Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan KOMPETEN`, left + 6, y + 22, { width: usable / 2 - 12 });
    doc.text(`${existing.rekomendasi === "belum_kompeten" ? "☒" : "☐"} Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan BELUM KOMPETEN`, left + 6, y + 55, { width: usable / 2 - 12 });
    const belum = [];
    groups.forEach((group) => {
      (group.units || []).forEach((unit) => {
        (unit.detail || []).forEach((row) => {
          if (row.pencapaian === "tidak") {
            belum.push(`${group.nama_kelompok || "-"} | ${unit.kode_unit || "-"} - ${unit.judul_unit || "-"} | ${row.nama_elemen || "-"} | ${row.kuk || "-"}`);
          }
        });
      });
    });
    if (existing.rekomendasi === "belum_kompeten" && belum.length) {
      doc.font("Helvetica-Bold").fontSize(6.8).text("Kriteria yang belum terpenuhi:", left + 6, y + 83, { width: usable / 2 - 12 });
      doc.font("Helvetica").fontSize(6.2);
      let ry = y + 96;
      belum.slice(0, 5).forEach((item) => {
        doc.text(`• ${item}`, left + 8, ry, { width: usable / 2 - 16 });
        ry += 17;
      });
    }
    if (existing.catatan_rekomendasi) doc.text(existing.catatan_rekomendasi, left + 6, y + 150, { width: usable / 2 - 12 });

    const sx = left + usable / 2;
    doc.font("Helvetica-Bold").fontSize(8).text("Asesi", sx + 5, y + 5);
    doc.font("Helvetica").fontSize(7.5).text(`Nama : ${context.asesi?.nama_lengkap || "-"}`, sx + 5, y + 22, { width: usable / 2 - 12 });
    const asesiSig = context.asesi?.ttd_path;
    if (asesiSig) {
      try {
        const filePath = path.join(__dirname, '../../../', String(asesiSig).replace(/^\/+/, ''));
        doc.image(filePath, sx + 8, y + 45, { fit: [130, 45] });
      } catch (_) {}
    }
    doc.font("Helvetica-Bold").fontSize(8).text("Asesor", sx + 5, y + 78);
    doc.font("Helvetica").fontSize(7.5).text(`Nama : ${context.asesor?.nama_lengkap || "-"}`, sx + 5, y + 95, { width: usable / 2 - 12 });
    doc.text(`No. Reg : ${context.asesor?.no_reg_asesor || "-"}`, sx + 5, y + 112, { width: usable / 2 - 12 });
    const asesorSig = context.asesor?.ttd_path;
    if (asesorSig) {
      try {
        const filePath = path.join(__dirname, '../../../', String(asesorSig).replace(/^\/+/, ''));
        doc.image(filePath, sx + 8, y + 128, { fit: [130, 35] });
      } catch (_) {}
    }

    doc.end();
  } catch (err) {
    console.error("PDF FR.IA.01 ERROR:", err);
    res.status(500).json({ message: "Gagal membuat PDF", error: err.message });
  }
};
