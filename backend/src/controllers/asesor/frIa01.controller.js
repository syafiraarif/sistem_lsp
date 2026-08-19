const path = require("path");
const fs = require("fs");
const sequelize = require("../../config/database");

const {
  FrIa01,
  FrIa01Detail,
  Jadwal,
  JadwalAsesor,
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

  if (!jadwal) {
    return null;
  }

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

  if (!peserta) {
    return {
      jadwal,
      skema,
      tuk,
      peserta: null,
    };
  }

  const [asesi, asesor] = await Promise.all([
    ProfileAsesi.findByPk(peserta.id_user),
    ProfileAsesor.findByPk(id_asesor),
  ]);

  const skemaUnits = await SkemaUnit.findAll({
    where: {
      id_skema: jadwal.id_skema,
    },
    order: [
      ["id_kelompok", "ASC"],
      ["urutan", "ASC"],
    ],
  });

  const unitIds = [
    ...new Set(
      skemaUnits.map((row) => Number(row.id_unit)).filter(Boolean)
    ),
  ];

  const kelompokIds = [
    ...new Set(
      skemaUnits.map((row) => Number(row.id_kelompok)).filter(Boolean)
    ),
  ];

  const [units, kelompokList, elements] = await Promise.all([
    unitIds.length
      ? UnitKompetensi.findAll({
          where: {
            id_unit: unitIds,
          },
        })
      : [],
    kelompokIds.length
      ? KelompokPekerjaan.findAll({
          where: {
            id_kelompok: kelompokIds,
          },
          order: [["urutan", "ASC"]],
        })
      : [],
    unitIds.length
      ? UnitElemen.findAll({
          where: {
            id_unit: unitIds,
          },
          order: [["urutan", "ASC"]],
        })
      : [],
  ]);

  const elementIds = elements
    .map((row) => Number(row.id_elemen))
    .filter(Boolean);

  const kukRows = elementIds.length
    ? await UnitKuk.findAll({
        where: {
          id_elemen: elementIds,
        },
        order: [["urutan", "ASC"]],
      })
    : [];

  const unitMap = new Map(
    units.map((row) => [Number(row.id_unit), row])
  );

  const groupMap = new Map(
    kelompokList.map((row) => [Number(row.id_kelompok), row])
  );

  const elementMap = new Map();

  elements.forEach((row) => {
    const key = Number(row.id_unit);

    if (!elementMap.has(key)) {
      elementMap.set(key, []);
    }

    elementMap.get(key).push(row);
  });

  const kukMap = new Map();

  kukRows.forEach((row) => {
    const key = Number(row.id_elemen);

    if (!kukMap.has(key)) {
      kukMap.set(key, []);
    }

    kukMap.get(key).push(row);
  });

  const grouped = [];

  for (const relation of skemaUnits) {
    const groupId = Number(relation.id_kelompok);

    let group = grouped.find(
      (item) => Number(item.id_kelompok) === groupId
    );

    if (!group) {
      const groupData = groupMap.get(groupId);

      group = {
        id_kelompok: relation.id_kelompok,
        nama_kelompok:
          groupData?.nama_kelompok ||
          `Kelompok Pekerjaan ${grouped.length + 1}`,
        deskripsi: groupData?.deskripsi || null,
        urutan: groupData?.urutan || grouped.length + 1,
        units: [],
      };

      grouped.push(group);
    }

    const unit = unitMap.get(Number(relation.id_unit));

    if (!unit) {
      continue;
    }

    const existingUnit = group.units.find(
      (item) => Number(item.id_unit) === Number(unit.id_unit)
    );

    if (existingUnit) {
      continue;
    }

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
          standar_industri:
            `SOP ${skema?.judul_skema || ""}`.trim() || null,
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

  grouped.sort(
    (a, b) => Number(a.urutan || 0) - Number(b.urutan || 0)
  );

  grouped.forEach((group) => {
    group.units.sort(
      (a, b) => Number(a.urutan || 0) - Number(b.urutan || 0)
    );
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
      (unit.detail || []).forEach((item) => {
        result.push({
          ...item,
        });
      });
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
              standar_industri:
                sopStandard ||
                saved.standar_industri ||
                item.standar_industri ||
                null,
              pencapaian: saved.pencapaian,
              penilaian_lanjut: saved.penilaian_lanjut,
            }
          : {
              ...item,
              standar_industri:
                sopStandard ||
                item.standar_industri ||
                null,
            };
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
    id_jadwal:
      context?.jadwal?.id_jadwal ||
      record?.id_jadwal,
    id_peserta:
      context?.peserta?.id_peserta ||
      record?.id_peserta,
    id_asesor:
      context?.asesor?.id_user ||
      record?.id_asesor,
    umpan_balik: record?.umpan_balik || "",
    rekomendasi: record?.rekomendasi || "",
    catatan_rekomendasi:
      record?.catatan_rekomendasi || "",
    ttd_asesor:
      record?.ttd_asesor ||
      context?.asesor?.ttd_path ||
      "",
    detail: flat,
    kelompokPekerjaan: groups,
    jadwal:
      context?.jadwal?.toJSON?.() ||
      context?.jadwal ||
      {},
    skema:
      context?.skema?.toJSON?.() ||
      context?.skema ||
      {},
    tuk:
      context?.tuk?.toJSON?.() ||
      context?.tuk ||
      {},
    asesor:
      context?.asesor?.toJSON?.() ||
      context?.asesor ||
      {},
    asesi: {
      ...(context?.asesi?.toJSON?.() ||
        context?.asesi ||
        {}),
      id_peserta:
        context?.peserta?.id_peserta ||
        record?.id_peserta ||
        null,
      id_jadwal:
        context?.peserta?.id_jadwal ||
        record?.id_jadwal ||
        null,
      nomor_peserta:
        context?.peserta?.nomor_peserta ||
        null,
      status_asesmen:
        context?.peserta?.status_asesmen ||
        null,
    },
  };
};

exports.getTugasAsesor = async (req, res) => {
  try {
    const data = await PesertaJadwal.findAll({
      where: {
        id_asesor: getCurrentUserId(req),
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
        },
      ],
      order: [
        ["id_peserta", "DESC"],
      ],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getByPeserta = async (req, res) => {
  try {
    const id_jadwal = Number(req.query.id_jadwal);
    const id_peserta = Number(req.query.id_peserta);
    const id_asesor = getCurrentUserId(req);

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal dan id_peserta wajib diisi",
      });
    }

    const tugasAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        jenis_tugas: "asesor_penguji",
        status: "aktif",
      },
    });

    if (!tugasAsesor) {
      return res.status(403).json({
        message: "Anda bukan asesor penguji pada jadwal ini",
      });
    }

    const context = await buildContext({
      id_jadwal,
      id_peserta,
      id_asesor,
    });

    if (!context) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan",
      });
    }

    if (!context.peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal tersebut",
      });
    }

    const existing = await FrIa01.findOne({
      where: {
        id_jadwal,
        id_peserta,
      },
      order: [["id_fr_ia_01", "DESC"]],
    });

    if (!existing) {
      const data = makeResponse({
        context,
      });

      return res.json({
        generated: true,
        ...data,
      });
    }

    const detailRows = await FrIa01Detail.findAll({
      where: {
        id_fr_ia_01: existing.id_fr_ia_01,
      },
      order: [["id_detail", "ASC"]],
    });

    return res.json(
      makeResponse({
        record: existing,
        context,
        detailRows,
      })
    );
  } catch (err) {
    console.error("GET FR.IA.01 ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const id_asesor = getCurrentUserId(req);
    const id_jadwal = Number(req.body.id_jadwal);
    const id_peserta = Number(req.body.id_peserta);
    const detail = Array.isArray(req.body.detail)
      ? req.body.detail
      : [];

    const hasTidak = detail.some(
      (item) => item.pencapaian === "tidak"
    );

    const allYa =
      detail.length > 0 &&
      detail.every(
        (item) => item.pencapaian === "ya"
      );

    const derivedRekomendasi = hasTidak
      ? "belum_kompeten"
      : allYa
      ? "kompeten"
      : req.body.rekomendasi || null;

    if (!id_jadwal || !id_peserta) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "id_jadwal dan id_peserta wajib diisi",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal,
      },
    });

    if (!peserta) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal tersebut",
      });
    }

    const tugasAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        jenis_tugas: "asesor_penguji",
        status: "aktif",
      },
    });

    if (!tugasAsesor) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Anda bukan asesor penguji pada jadwal ini",
      });
    }

    const existing = await FrIa01.findOne({
      where: {
        id_jadwal,
        id_peserta,
      },
    });

    if (existing) {
      await transaction.rollback();

      return res.status(409).json({
        message:
          "FR.IA.01 sudah tersedia",
        id_fr_ia_01:
          existing.id_fr_ia_01,
      });
    }

    const asesor = await ProfileAsesor.findByPk(
      id_asesor
    );

    const header = await FrIa01.create(
      {
        id_jadwal,
        id_peserta,
        id_asesor,
        umpan_balik:
          req.body.umpan_balik || null,
        rekomendasi:
          derivedRekomendasi,
        catatan_rekomendasi:
          req.body.catatan_rekomendasi ||
          null,
        ttd_asesor:
          req.body.ttd_asesor ||
          asesor?.ttd_path ||
          null,
      },
      {
        transaction,
      }
    );

    if (detail.length) {
      await FrIa01Detail.bulkCreate(
        detail.map((item) => ({
          id_fr_ia_01:
            header.id_fr_ia_01,
          id_unit: item.id_unit,
          id_elemen: item.id_elemen,
          id_kuk: item.id_kuk,
          standar_industri:
            item.standar_industri ||
            null,
          pencapaian: [
            "ya",
            "tidak",
          ].includes(item.pencapaian)
            ? item.pencapaian
            : null,
          penilaian_lanjut:
            item.penilaian_lanjut ||
            null,
        })),
        {
          transaction,
        }
      );
    }

    await transaction.commit();

    res.status(201).json({
      message:
        "FR.IA.01 berhasil dibuat",
      id_fr_ia_01:
        header.id_fr_ia_01,
      data: header,
    });
  } catch (err) {
    await transaction.rollback();

    console.error(
      "CREATE FR.IA.01 ERROR:",
      err
    );

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.update = async (req, res) => {
  const transaction =
    await sequelize.transaction();

  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const current = await FrIa01.findOne({
      where: {
        id_fr_ia_01: id,
        id_asesor,
      },
    });

    if (!current) {
      await transaction.rollback();

      return res.status(404).json({
        message:
          "FR.IA.01 tidak ditemukan",
      });
    }

    const asesor = await ProfileAsesor.findByPk(
      id_asesor
    );

    const detail = Array.isArray(req.body.detail)
      ? req.body.detail
      : [];

    const hasTidak = detail.some(
      (item) => item.pencapaian === "tidak"
    );

    const allYa =
      detail.length > 0 &&
      detail.every(
        (item) => item.pencapaian === "ya"
      );

    const derivedRekomendasi = hasTidak
      ? "belum_kompeten"
      : allYa
      ? "kompeten"
      : req.body.rekomendasi || null;

    await current.update(
      {
        umpan_balik:
          req.body.umpan_balik ||
          null,
        rekomendasi:
          derivedRekomendasi,
        catatan_rekomendasi:
          req.body.catatan_rekomendasi ||
          null,
        ttd_asesor:
          req.body.ttd_asesor ||
          asesor?.ttd_path ||
          null,
        updated_at: new Date(),
      },
      {
        transaction,
      }
    );

    await FrIa01Detail.destroy({
      where: {
        id_fr_ia_01: id,
      },
      transaction,
    });

    if (detail.length) {
      await FrIa01Detail.bulkCreate(
        detail.map((item) => ({
          id_fr_ia_01: id,
          id_unit: item.id_unit,
          id_elemen: item.id_elemen,
          id_kuk: item.id_kuk,
          standar_industri:
            item.standar_industri ||
            null,
          pencapaian: [
            "ya",
            "tidak",
          ].includes(item.pencapaian)
            ? item.pencapaian
            : null,
          penilaian_lanjut:
            item.penilaian_lanjut ||
            null,
        })),
        {
          transaction,
        }
      );
    }

    await transaction.commit();

    res.json({
      message:
        "FR.IA.01 berhasil diperbarui",
      id_fr_ia_01: id,
    });
  } catch (err) {
    await transaction.rollback();

    console.error(
      "UPDATE FR.IA.01 ERROR:",
      err
    );

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const existing = await FrIa01.findOne({
      where: {
        id_fr_ia_01: id,
        id_asesor,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message:
          "FR.IA.01 tidak ditemukan",
      });
    }

    const context = await buildContext({
      id_jadwal: existing.id_jadwal,
      id_peserta: existing.id_peserta,
      id_asesor,
    });

    if (!context?.peserta) {
      return res.status(404).json({
        message:
          "Peserta tidak ditemukan",
      });
    }

    const detailRows = await FrIa01Detail.findAll({
      where: {
        id_fr_ia_01: id,
      },
      order: [
        ["id_detail", "ASC"],
      ],
    });

    res.json(
      makeResponse({
        record: existing,
        context,
        detailRows,
      })
    );
  } catch (err) {
    console.error(
      "GET BY ID FR.IA.01 ERROR:",
      err
    );

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_asesor = getCurrentUserId(req);

    const existing = await FrIa01.findOne({
      where: {
        id_fr_ia_01: id,
        id_asesor,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message:
          "FR.IA.01 tidak ditemukan",
      });
    }

    const context = await buildContext({
      id_jadwal: existing.id_jadwal,
      id_peserta: existing.id_peserta,
      id_asesor,
    });

    if (!context?.peserta) {
      return res.status(404).json({
        message:
          "Peserta tidak ditemukan",
      });
    }

    const detailRows = await FrIa01Detail.findAll({
      where: {
        id_fr_ia_01: id,
      },
      order: [
        ["id_detail", "ASC"],
      ],
    });

    const groups = mergeSavedDetail(
      context.kelompokPekerjaan,
      detailRows,
      context.skema?.judul_skema
    );

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const LEFT = 24;
    const RIGHT = 24;
    const TOP = 22;
    const BOTTOM = 28;
    const CONTENT_WIDTH =
      PAGE_WIDTH - LEFT - RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      autoFirstPage: true,
      info: {
        Title:
          `FR.IA.01 - ${context.asesi?.nama_lengkap || "Asesi"}`,
      },
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FRIA01-${id}.pdf`
    );

    doc.pipe(res);

    const safe = (value) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
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

      return date.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    };

    const normalizeSignaturePath = (value) => {
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

      const cleaned = stringValue.replace(
        /^[/\\]+/,
        ""
      );

      const candidates = [
        path.join(
          process.cwd(),
          cleaned
        ),
        path.join(
          process.cwd(),
          "uploads",
          cleaned.replace(
            /^uploads[/\\]/,
            ""
          )
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
        ),
      ];

      return (
        candidates.find(
          (filePath) =>
            fs.existsSync(filePath)
        ) || ""
      );
    };

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
        padding = 4,
        fill = null,
      } = options;

      if (fill) {
        doc
          .save()
          .fillColor(fill)
          .rect(
            x,
            y,
            width,
            height
          )
          .fill()
          .restore();
      }

      doc
        .save()
        .lineWidth(0.7)
        .strokeColor("#000000")
        .rect(
          x,
          y,
          width,
          height
        )
        .stroke()
        .restore();

      doc
        .font(
          bold
            ? "Helvetica-Bold"
            : "Helvetica"
        )
        .fontSize(fontSize)
        .fillColor("#000000");

      const value = safe(text);
      const textWidth = Math.max(
        width - padding * 2,
        6
      );

      const textHeight =
        doc.heightOfString(
          value,
          {
            width: textWidth,
            align,
          }
        );

      let textY = y + padding;

      if (valign === "center") {
        textY =
          y +
          Math.max(
            padding,
            (height - textHeight) / 2
          );
      }

      if (valign === "bottom") {
        textY =
          y +
          height -
          textHeight -
          padding;
      }

      doc.text(
        value,
        x + padding,
        textY,
        {
          width: textWidth,
          align,
          lineGap: 0,
        }
      );
    };

    const drawCheckbox = (
      x,
      y,
      width,
      height,
      checked,
      boxSize = 9
    ) => {
      const boxX =
        x +
        (width - boxSize) / 2;

      const boxY =
        y +
        (height - boxSize) / 2;

      doc
        .save()
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
        doc
          .save()
          .lineWidth(1.15)
          .lineCap("round")
          .lineJoin("round")
          .strokeColor("#000000")
          .moveTo(
            boxX + 1.4,
            boxY + boxSize * 0.52
          )
          .lineTo(
            boxX + boxSize * 0.42,
            boxY + boxSize * 0.82
          )
          .lineTo(
            boxX + boxSize * 0.86,
            boxY + boxSize * 0.18
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
        normalizeSignaturePath(value);

      if (
        !signaturePath ||
        !fs.existsSync(signaturePath)
      ) {
        return;
      }

      try {
        const imageWidth = Math.min(
          150,
          width - 16
        );

        const imageHeight = Math.min(
          55,
          height - 16
        );

        const imageX =
          x +
          (width - imageWidth) / 2;

        const imageY =
          y +
          (height - imageHeight) / 2;

        doc.image(
          signaturePath,
          imageX,
          imageY,
          {
            fit: [
              imageWidth,
              imageHeight,
            ],
            align: "center",
            valign: "center",
          }
        );
      } catch (error) {
        return;
      }
    };

    let currentY = TOP;

    const drawPageTitle = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#000000")
        .text(
          "FR.IA.01. CL - CEKLIS OBSERVASI AKTIVITAS DI TEMPAT KERJA ATAU TEMPAT KERJA SIMULASI",
          LEFT,
          currentY,
          {
            width: CONTENT_WIDTH,
            align: "center",
          }
        );

      currentY += 24;
    };

    const ensureSpace = (
      height,
      title = true
    ) => {
      if (
        currentY + height >
        PAGE_HEIGHT - BOTTOM
      ) {
        doc.addPage();
        currentY = TOP;

        if (title) {
          drawPageTitle();
        }
      }
    };

    const drawPageNumber = () => {
      const range =
        doc.bufferedPageRange();

      if (
        !range ||
        range.count <= 1
      ) {
        return;
      }

      for (
        let pageIndex = range.start;
        pageIndex <
        range.start + range.count;
        pageIndex += 1
      ) {
        doc.switchToPage(
          pageIndex
        );

        doc
          .font("Helvetica")
          .fontSize(6.5)
          .fillColor("#555555")
          .text(
            `Halaman ${pageIndex - range.start + 1} dari ${range.count}`,
            LEFT,
            PAGE_HEIGHT - 16,
            {
              width: CONTENT_WIDTH,
              align: "center",
              lineBreak: false,
            }
          );
      }

      doc.fillColor("#000000");
    };

    const skema = context?.skema || {};
    const tuk = context?.tuk || {};
    const asesor = context?.asesor || {};
    const asesi = context?.asesi || {};

    const namaAsesi =
      asesi?.nama_lengkap || "-";

    const namaAsesor =
      asesor?.nama_lengkap || "-";

    const tanggal = formatTanggal(
      context?.jadwal?.tgl_awal ||
      context?.jadwal?.tgl_akhir ||
      existing.created_at
    );

    drawPageTitle();

    const headerCol1 = 150;
    const headerCol2 = 58;
    const headerCol3 = 18;
    const headerCol4 =
      CONTENT_WIDTH -
      headerCol1 -
      headerCol2 -
      headerCol3;

    const headerRows = [
      28,
      28,
      27,
      27,
      27,
      27,
    ];

    drawCell(
      LEFT,
      currentY,
      headerCol1,
      headerRows[0] +
        headerRows[1],
      "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
      {
        bold: true,
        valign: "center",
        padding: 6,
      }
    );

    drawCell(
      LEFT + headerCol1,
      currentY,
      headerCol2,
      headerRows[0],
      "Judul",
      {
        bold: true,
        align: "center",
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2,
      currentY,
      headerCol3,
      headerRows[0],
      ":",
      {
        align: "center",
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2 +
        headerCol3,
      currentY,
      headerCol4,
      headerRows[0],
      skema?.judul_skema ||
        "-",
      {
        bold: true,
      }
    );

    drawCell(
      LEFT + headerCol1,
      currentY +
        headerRows[0],
      headerCol2,
      headerRows[1],
      "Nomor",
      {
        bold: true,
        align: "center",
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2,
      currentY +
        headerRows[0],
      headerCol3,
      headerRows[1],
      ":",
      {
        align: "center",
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2 +
        headerCol3,
      currentY +
        headerRows[0],
      headerCol4,
      headerRows[1],
      skema?.kode_skema ||
        "-",
      {}
    );

    currentY +=
      headerRows[0] +
      headerRows[1];

    const headerSimpleRow = (
      label,
      value
    ) => {
      drawCell(
        LEFT,
        currentY,
        headerCol1 +
          headerCol2,
        27,
        label,
        {
          bold: true,
        }
      );

      drawCell(
        LEFT +
          headerCol1 +
          headerCol2,
        currentY,
        headerCol3,
        27,
        ":",
        {
          align: "center",
        }
      );

      drawCell(
        LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        currentY,
        headerCol4,
        27,
        value,
        {}
      );

      currentY += 27;
    };

    const tukType = String(
      tuk?.jenis_tuk ||
      tuk?.jenis ||
      ""
    )
      .toLowerCase()
      .trim();

    drawCell(
      LEFT,
      currentY,
      headerCol1 +
        headerCol2,
      headerRows[2],
      "TUK",
      {
        bold: true,
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2,
      currentY,
      headerCol3,
      headerRows[2],
      ":",
      {
        align: "center",
      }
    );

    drawCell(
      LEFT +
        headerCol1 +
        headerCol2 +
        headerCol3,
      currentY,
      headerCol4,
      headerRows[2],
      "",
      {
        padding: 0,
      }
    );

    const tukOption = (
      x,
      label,
      checked
    ) => {
      drawCheckbox(
        x,
        currentY,
        18,
        27,
        checked,
        8
      );

      doc
        .font("Helvetica")
        .fontSize(7)
        .text(
          label,
          x + 20,
          currentY + 8,
          {
            width: 68,
            lineBreak: false,
          }
        );
    };

    const tukStart =
      LEFT +
      headerCol1 +
      headerCol2 +
      headerCol3 +
      9;

    tukOption(
      tukStart,
      "Sewaktu",
      tukType.includes(
        "sewaktu"
      )
    );

    tukOption(
      tukStart + 82,
      "Tempat Kerja",
      tukType.includes(
        "tempat"
      ) ||
        tukType.includes(
          "kerja"
        )
    );

    tukOption(
      tukStart + 182,
      "Mandiri",
      tukType.includes(
        "mandiri"
      )
    );

    currentY +=
      headerRows[2];

    headerSimpleRow(
      "Nama Asesor",
      namaAsesor
    );

    headerSimpleRow(
      "Nama Asesi",
      namaAsesi
    );

    headerSimpleRow(
      "Tanggal",
      tanggal
    );

    currentY += 10;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      22,
      "PANDUAN BAGI ASESOR",
      {
        bold: true,
        fontSize: 8,
        fill: "#E5E7EB",
      }
    );

    currentY += 22;

    const guideText =
      "1. Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.\n" +
      "2. Isilah standar industri atau tempat kerja.\n" +
      "3. Beri tanda centang pada kolom YA atau TIDAK sesuai hasil observasi.\n" +
      "4. Penilaian Lanjut disesuaikan dengan hasil pengamatan.\n" +
      "5. Isilah kolom KUK sesuai dengan Unit Kompetensi/SKKNI.";

    const guideHeight = Math.max(
      66,
      doc.heightOfString(
        guideText,
        {
          width:
            CONTENT_WIDTH - 14,
          fontSize: 7,
          lineGap: 1,
        }
      ) + 12
    );

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      guideHeight,
      guideText,
      {
        fontSize: 7,
        valign: "top",
        padding: 7,
      }
    );

    currentY +=
      guideHeight + 10;

    groups.forEach(
      (group, groupIndex) => {
        ensureSpace(72);

        doc
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .text(
            group.nama_kelompok ||
              `Kelompok Pekerjaan ${groupIndex + 1}`,
            LEFT,
            currentY,
            {
              width: CONTENT_WIDTH,
            }
          );

        currentY += 14;

        const groupCol = 145;
        const noCol = 32;
        const codeCol = 104;
        const titleCol =
          CONTENT_WIDTH -
          groupCol -
          noCol -
          codeCol;

        const groupHeight =
          28 +
          group.units.length * 24;

        drawCell(
          LEFT,
          currentY,
          groupCol,
          groupHeight,
          group.nama_kelompok ||
            `Kelompok Pekerjaan ${groupIndex + 1}`,
          {
            bold: true,
            valign: "center",
            padding: 6,
          }
        );

        drawCell(
          LEFT + groupCol,
          currentY,
          noCol,
          28,
          "No.",
          {
            bold: true,
            align: "center",
          }
        );

        drawCell(
          LEFT +
            groupCol +
            noCol,
          currentY,
          codeCol,
          28,
          "Kode Unit",
          {
            bold: true,
            align: "center",
          }
        );

        drawCell(
          LEFT +
            groupCol +
            noCol +
            codeCol,
          currentY,
          titleCol,
          28,
          "Judul Unit",
          {
            bold: true,
            align: "center",
          }
        );

        group.units.forEach(
          (unit, index) => {
            const rowY =
              currentY +
              28 +
              index * 24;

            drawCell(
              LEFT + groupCol,
              rowY,
              noCol,
              24,
              `${index + 1}.`,
              {
                align: "center",
              }
            );

            drawCell(
              LEFT +
                groupCol +
                noCol,
              rowY,
              codeCol,
              24,
              unit.kode_unit ||
                "-",
              {}
            );

            drawCell(
              LEFT +
                groupCol +
                noCol +
                codeCol,
              rowY,
              titleCol,
              24,
              unit.judul_unit ||
                "-",
              {
                fontSize: 6.7,
              }
            );
          }
        );

        currentY +=
          groupHeight + 9;

        group.units.forEach(
          (unit) => {
            const detailCount =
              (unit.detail || []).length;

            ensureSpace(
              105 +
                Math.min(
                  detailCount * 35,
                  210
                ),
              true
            );

            drawCell(
              LEFT,
              currentY,
              125,
              21,
              "Unit Kompetensi",
              {
                bold: true,
              }
            );

            drawCell(
              LEFT + 125,
              currentY,
              18,
              21,
              ":",
              {
                align: "center",
              }
            );

            drawCell(
              LEFT + 143,
              currentY,
              CONTENT_WIDTH - 143,
              21,
              unit.kode_unit ||
                "-",
              {
                bold: true,
              }
            );

            currentY += 21;

            drawCell(
              LEFT,
              currentY,
              125,
              21,
              "Judul Unit",
              {
                bold: true,
              }
            );

            drawCell(
              LEFT + 125,
              currentY,
              18,
              21,
              ":",
              {
                align: "center",
              }
            );

            drawCell(
              LEFT + 143,
              currentY,
              CONTENT_WIDTH - 143,
              21,
              unit.judul_unit ||
                "-",
              {}
            );

            currentY += 25;

            const widths = [
              28,
              72,
              163,
              92,
              42,
              42,
              CONTENT_WIDTH - 441,
            ];

            const headerHeight = 48;

            drawCell(
              LEFT,
              currentY,
              widths[0],
              headerHeight,
              "No.",
              {
                bold: true,
                align: "center",
              }
            );

            drawCell(
              LEFT + widths[0],
              currentY,
              widths[1],
              headerHeight,
              "Elemen",
              {
                bold: true,
                align: "center",
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1],
              currentY,
              widths[2],
              headerHeight,
              "Kriteria Unjuk Kerja",
              {
                bold: true,
                align: "center",
                fontSize: 6.7,
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1] +
                widths[2],
              currentY,
              widths[3],
              headerHeight,
              "Standar Industri\natau Tempat Kerja",
              {
                bold: true,
                align: "center",
                fontSize: 6.3,
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1] +
                widths[2] +
                widths[3],
              currentY,
              widths[4] +
                widths[5],
              22,
              "Pencapaian",
              {
                bold: true,
                align: "center",
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1] +
                widths[2] +
                widths[3] +
                widths[4] +
                widths[5],
              currentY,
              widths[6],
              headerHeight,
              "Penilaian\nLanjut",
              {
                bold: true,
                align: "center",
                fontSize: 6.5,
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1] +
                widths[2] +
                widths[3],
              currentY + 22,
              widths[4],
              26,
              "Ya",
              {
                bold: true,
                align: "center",
              }
            );

            drawCell(
              LEFT +
                widths[0] +
                widths[1] +
                widths[2] +
                widths[3] +
                widths[4],
              currentY + 22,
              widths[5],
              26,
              "Tidak",
              {
                bold: true,
                align: "center",
              }
            );

            currentY += headerHeight;

            const elementBuckets =
              new Map();

            (unit.detail || []).forEach(
              (row) => {
                const key =
                  Number(
                    row.id_elemen
                  );

                if (
                  !elementBuckets.has(
                    key
                  )
                ) {
                  elementBuckets.set(
                    key,
                    []
                  );
                }

                elementBuckets
                  .get(key)
                  .push(row);
              }
            );

            [
              ...elementBuckets.entries(),
            ].forEach(
              (
                [
                  elementId,
                  elementRows,
                ],
                elementIndex
              ) => {
                const elementText =
                  elementRows[0]
                    ?.nama_elemen ||
                  "-";

                const elementHeight =
                  Math.max(
                    34,
                    elementRows.length *
                      34
                  );

                ensureSpace(
                  elementHeight + 5,
                  false
                );

                drawCell(
                  LEFT,
                  currentY,
                  widths[0],
                  elementHeight,
                  String(
                    elementIndex + 1
                  ),
                  {
                    fontSize: 6.7,
                    align: "center",
                    valign: "center",
                  }
                );

                drawCell(
                  LEFT +
                    widths[0],
                  currentY,
                  widths[1],
                  elementHeight,
                  elementText,
                  {
                    fontSize: 6.5,
                    valign: "center",
                  }
                );

                elementRows.forEach(
                  (
                    row,
                    rowIndex
                  ) => {
                    const rowY =
                      currentY +
                      rowIndex * 34;

                    let x =
                      LEFT +
                      widths[0] +
                      widths[1];

                    drawCell(
                      x,
                      rowY,
                      widths[2],
                      34,
                      row.kuk ||
                        "-",
                      {
                        fontSize: 6.4,
                        valign: "top",
                        padding: 4,
                      }
                    );

                    x += widths[2];

                    drawCell(
                      x,
                      rowY,
                      widths[3],
                      34,
                      row.standar_industri ||
                        `SOP ${context.skema?.judul_skema || ""}`.trim(),
                      {
                        fontSize: 5.9,
                        valign: "top",
                        padding: 4,
                      }
                    );

                    x += widths[3];

                    drawCell(
                      x,
                      rowY,
                      widths[4],
                      34,
                      "",
                      {
                        padding: 0,
                      }
                    );

                    drawCheckbox(
                      x,
                      rowY,
                      widths[4],
                      34,
                      row.pencapaian ===
                        "ya",
                      8
                    );

                    x += widths[4];

                    drawCell(
                      x,
                      rowY,
                      widths[5],
                      34,
                      "",
                      {
                        padding: 0,
                      }
                    );

                    drawCheckbox(
                      x,
                      rowY,
                      widths[5],
                      34,
                      row.pencapaian ===
                        "tidak",
                      8
                    );

                    x += widths[5];

                    drawCell(
                      x,
                      rowY,
                      widths[6],
                      34,
                      row.penilaian_lanjut ||
                        "",
                      {
                        fontSize: 5.8,
                        valign: "top",
                        padding: 4,
                      }
                    );
                  }
                );

                currentY +=
                  elementHeight;
              }
            );

            currentY += 9;
          }
        );
      }
    );

    ensureSpace(120, true);

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      22,
      "Umpan Balik untuk Asesi:",
      {
        bold: true,
        fontSize: 8,
      }
    );

    currentY += 22;

    const feedback =
      existing.umpan_balik ||
      "-";

    const feedbackHeight =
      Math.max(
        72,
        doc.heightOfString(
          feedback,
          {
            width:
              CONTENT_WIDTH - 14,
            fontSize: 7,
          }
        ) + 14
      );

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      feedbackHeight,
      feedback,
      {
        fontSize: 7,
        valign: "top",
        padding: 7,
      }
    );

    currentY +=
      feedbackHeight + 12;

    ensureSpace(
      275,
      true
    );

    const half =
      CONTENT_WIDTH / 2;

    const bottomTop =
      currentY;

    const bottomHeight =
      252;

    drawCell(
      LEFT,
      bottomTop,
      half,
      bottomHeight,
      "",
      {
        padding: 0,
      }
    );

    drawCell(
      LEFT + half,
      bottomTop,
      half,
      bottomHeight,
      "",
      {
        padding: 0,
      }
    );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "Rekomendasi:",
        LEFT + 7,
        bottomTop + 7
      );

    drawCell(
      LEFT + 8,
      bottomTop + 27,
      18,
      22,
      "",
      {
        padding: 0,
      }
    );

    drawCheckbox(
      LEFT + 8,
      bottomTop + 27,
      18,
      22,
      existing.rekomendasi ===
        "kompeten",
      9
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        "Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan KOMPETEN",
        LEFT + 32,
        bottomTop + 30,
        {
          width: half - 40,
        }
      );

    drawCell(
      LEFT + 8,
      bottomTop + 67,
      18,
      22,
      "",
      {
        padding: 0,
      }
    );

    drawCheckbox(
      LEFT + 8,
      bottomTop + 67,
      18,
      22,
      existing.rekomendasi ===
        "belum_kompeten",
      9
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        "Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan BELUM KOMPETEN",
        LEFT + 32,
        bottomTop + 70,
        {
          width: half - 40,
        }
      );

    const belum = [];

    groups.forEach(
      (group) => {
        (group.units || []).forEach(
          (unit) => {
            (unit.detail || []).forEach(
              (row) => {
                if (
                  row.pencapaian ===
                  "tidak"
                ) {
                  belum.push(
                    `${group.nama_kelompok || "-"} | ${unit.kode_unit || "-"} - ${unit.judul_unit || "-"} | ${row.nama_elemen || "-"} | ${row.kuk || "-"}`
                  );
                }
              }
            );
          }
        );
      }
    );

    if (
      existing.rekomendasi ===
        "belum_kompeten" &&
      belum.length
    ) {
      doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text(
          "Kriteria yang belum terpenuhi:",
          LEFT + 8,
          bottomTop + 105,
          {
            width:
              half - 16,
          }
        );

      doc
        .font("Helvetica")
        .fontSize(5.5);

      let resultY =
        bottomTop + 118;

      belum
        .slice(0, 4)
        .forEach(
          (item) => {
            doc.text(
              `• ${item}`,
              LEFT + 10,
              resultY,
              {
                width:
                  half - 18,
              }
            );

            resultY += 15;
          }
        );
    }

    if (
      existing.catatan_rekomendasi
    ) {
      doc
        .font("Helvetica")
        .fontSize(6.3)
        .text(
          existing.catatan_rekomendasi,
          LEFT + 8,
          bottomTop + 198,
          {
            width:
              half - 16,
            height: 35,
          }
        );
    }

    const rightX =
      LEFT + half;

    drawCell(
      rightX,
      bottomTop,
      half,
      bottomHeight,
      "",
      {
        padding: 0,
      }
    );

    drawCell(
      rightX,
      bottomTop,
      half,
      24,
      "ASESI",
      {
        bold: true,
        fontSize: 8,
        padding: 8,
      }
    );

    drawCell(
      rightX,
      bottomTop + 24,
      half,
      23,
      `Nama : ${namaAsesi}`,
      {
        fontSize: 6.8,
        padding: 7,
      }
    );

    drawCell(
      rightX,
      bottomTop + 47,
      half,
      68,
      "",
      {
        padding: 0,
      }
    );

    drawSignature(
      asesi?.ttd_path,
      rightX + 12,
      bottomTop + 50,
      half - 24,
      50
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        tanggal,
        rightX + 10,
        bottomTop + 96,
        {
          width: half - 20,
          align: "center",
          lineBreak: false,
        }
      );

    drawCell(
      rightX,
      bottomTop + 115,
      half,
      24,
      "ASESOR",
      {
        bold: true,
        fontSize: 8,
        padding: 8,
      }
    );

    drawCell(
      rightX,
      bottomTop + 139,
      half,
      21,
      `Nama : ${namaAsesor}`,
      {
        fontSize: 6.8,
        padding: 7,
      }
    );

    drawCell(
      rightX,
      bottomTop + 160,
      half,
      21,
      `No. Reg : ${asesor?.no_reg_asesor || "-"}`,
      {
        fontSize: 6.5,
        padding: 7,
      }
    );

    drawCell(
      rightX,
      bottomTop + 181,
      half,
      67,
      "",
      {
        padding: 0,
      }
    );

    drawSignature(
      asesor?.ttd_path ||
        existing.ttd_asesor,
      rightX + 12,
      bottomTop + 184,
      half - 24,
      50
    );

    doc
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        tanggal,
        rightX + 10,
        bottomTop + 230,
        {
          width: half - 20,
          align: "center",
          lineBreak: false,
        }
      );

    drawPageNumber();

    doc.end();
  } catch (err) {
    console.error(
      "PDF FR.IA.01 ERROR:",
      err
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message:
          "Gagal membuat PDF",
        error: err.message,
      });
    }
  }
};