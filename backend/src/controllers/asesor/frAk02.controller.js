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
  return (
    profile?.nama_lengkap ||
    profile?.nama ||
    user?.nama_lengkap ||
    user?.nama ||
    user?.username ||
    "-"
  );
};

const getTukType = (tuk) => {
  const value = String(
    tuk?.jenis_tuk ||
    tuk?.jenis ||
    ""
  ).toLowerCase().trim().replace(/\s+/g, "_");
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

  const unitIds = [
    ...new Set(
      relations
        .map((item) => Number(item.id_unit))
        .filter(Boolean)
    )
  ];

  const units = await UnitKompetensi.findAll({
    where: {
      id_unit: unitIds
    }
  });

  const unitMap = new Map(
    units.map((unit) => [
      Number(unit.id_unit),
      unit
    ])
  );

  return relations
    .map((relation) => {
      const unit = unitMap.get(
        Number(relation.id_unit)
      );

      if (!unit) return null;

      return {
        id_unit: unit.id_unit,
        kode_unit: unit.kode_unit,
        judul_unit: unit.judul_unit,
        urutan: relation.urutan
      };
    })
    .filter(Boolean);
};

const getContext = async (
  id_jadwal,
  id_peserta,
  id_asesor
) => {
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

  const [
    skema,
    tuk,
    user,
    profileAsesi,
    profileAsesor
  ] = await Promise.all([
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
  const map = new Map(
    savedDetails.map((item) => [
      Number(item.id_unit),
      item
    ])
  );

  return units.map((unit) => {
    const saved = map.get(
      Number(unit.id_unit)
    );

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

    const context = await getContext(
      Number(id_jadwal),
      Number(id_peserta),
      id_asesor
    );

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

    const units = await getUnitsBySkema(
      context.jadwal.id_skema
    );

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

    const normalizedDetails = normalizeDetails(
      units,
      savedDetails
    );

    const fr = existing
      ? existing.toJSON()
      : {};

    const data = {
      id_fr_ak02:
        fr.id_fr_ak02 ||
        null,
      exists:
        Boolean(existing),
      id_jadwal:
        Number(id_jadwal),
      id_peserta:
        Number(id_peserta),
      id_asesor:
        id_asesor,
      skema:
        context.skema?.toJSON?.() ||
        context.skema ||
        {},
      tuk:
        context.tuk?.toJSON?.() ||
        context.tuk ||
        {},
      jadwal:
        context.jadwal?.toJSON?.() ||
        context.jadwal ||
        {},
      asesi: {
        ...(context.profileAsesi?.toJSON?.() ||
          context.profileAsesi ||
          {}),
        nama_lengkap:
          context.profileAsesi?.nama_lengkap ||
          context.user?.nama_lengkap ||
          context.user?.nama ||
          context.user?.username ||
          "",
        ttd_path:
          context.profileAsesi?.ttd_path ||
          ""
      },
      asesor: {
        ...(context.profileAsesor?.toJSON?.() ||
          context.profileAsesor ||
          {}),
        nama_lengkap:
          context.profileAsesor?.nama_lengkap ||
          "",
        no_reg_asesor:
          context.profileAsesor?.no_reg_asesor ||
          "",
        ttd_path:
          context.profileAsesor?.ttd_path ||
          ""
      },
      tanggal_mulai:
        fr.tanggal_mulai ||
        context.jadwal?.tgl_awal ||
        "",
      tanggal_selesai:
        fr.tanggal_selesai ||
        context.jadwal?.tgl_akhir ||
        "",
      rekomendasi:
        fr.rekomendasi ||
        "",
      tindak_lanjut:
        fr.tindak_lanjut ||
        "",
      komentar_asesor:
        fr.komentar_asesor ||
        "",
      ttd_asesor:
        fr.ttd_asesor ||
        context.profileAsesor?.ttd_path ||
        "",
      detail:
        normalizedDetails
    };

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error(
      "GET FR.AK.02 ERROR:",
      err
    );

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

    const asesor = await ProfileAsesor.findByPk(
      id_asesor
    );

    const header = await FrAk02.create({
      id_jadwal: Number(id_jadwal),
      id_peserta: Number(id_peserta),
      id_asesor,
      tanggal_mulai:
        tanggal_mulai || null,
      tanggal_selesai:
        tanggal_selesai || null,
      rekomendasi:
        rekomendasi || null,
      tindak_lanjut:
        tindak_lanjut || null,
      komentar_asesor:
        komentar_asesor || null,
      ttd_asesor:
        ttd_asesor ||
        asesor?.ttd_path ||
        ""
    });

    const detailData = detail
      .filter((item) => item?.id_unit)
      .map((item) => ({
        id_fr_ak02:
          header.id_fr_ak02,
        id_unit:
          Number(item.id_unit),
        observasi:
          Boolean(item.observasi),
        portofolio:
          Boolean(item.portofolio),
        pihak_ketiga:
          Boolean(item.pihak_ketiga),
        wawancara:
          Boolean(item.wawancara),
        lisan:
          Boolean(item.lisan),
        tertulis:
          Boolean(item.tertulis),
        proyek:
          Boolean(item.proyek),
        lainnya:
          Boolean(item.lainnya)
      }));

    if (detailData.length) {
      await FrAk02Detail.bulkCreate(
        detailData
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "FR.AK.02 berhasil disimpan",
      data: {
        id_fr_ak02:
          header.id_fr_ak02
      }
    });
  } catch (err) {
    console.error(
      "SUBMIT FR.AK.02 ERROR:",
      err
    );

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

    const frAk02 =
      await FrAk02.findByPk(id);

    if (!frAk02) {
      return res.status(404).json({
        success: false,
        message:
          "FR.AK.02 tidak ditemukan"
      });
    }

    const akses =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal:
            frAk02.id_jadwal,
          id_user: id_asesor
        }
      });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses untuk mengubah FR.AK.02 ini"
      });
    }

    const asesor =
      await ProfileAsesor.findByPk(
        id_asesor
      );

    await frAk02.update({
      tanggal_mulai:
        tanggal_mulai !== undefined
          ? tanggal_mulai || null
          : frAk02.tanggal_mulai,
      tanggal_selesai:
        tanggal_selesai !== undefined
          ? tanggal_selesai || null
          : frAk02.tanggal_selesai,
      rekomendasi:
        rekomendasi !== undefined
          ? rekomendasi || null
          : frAk02.rekomendasi,
      tindak_lanjut:
        tindak_lanjut !== undefined
          ? tindak_lanjut || null
          : frAk02.tindak_lanjut,
      komentar_asesor:
        komentar_asesor !== undefined
          ? komentar_asesor || null
          : frAk02.komentar_asesor,
      ttd_asesor:
        ttd_asesor ||
        frAk02.ttd_asesor ||
        asesor?.ttd_path ||
        ""
    });

    if (Array.isArray(detail)) {
      for (const item of detail) {
        if (!item?.id_unit) {
          continue;
        }

        const payload = {
          observasi:
            Boolean(item.observasi),
          portofolio:
            Boolean(item.portofolio),
          pihak_ketiga:
            Boolean(item.pihak_ketiga),
          wawancara:
            Boolean(item.wawancara),
          lisan:
            Boolean(item.lisan),
          tertulis:
            Boolean(item.tertulis),
          proyek:
            Boolean(item.proyek),
          lainnya:
            Boolean(item.lainnya)
        };

        const existingDetail =
          await FrAk02Detail.findOne({
            where: {
              id_fr_ak02:
                Number(id),
              id_unit:
                Number(item.id_unit)
            }
          });

        if (existingDetail) {
          await existingDetail.update(
            payload
          );
        } else {
          await FrAk02Detail.create({
            id_fr_ak02:
              Number(id),
            id_unit:
              Number(item.id_unit),
            ...payload
          });
        }
      }
    }

    return res.json({
      success: true,
      message:
        "FR.AK.02 berhasil diperbarui",
      data: {
        id_fr_ak02:
          Number(id)
      }
    });
  } catch (err) {
    console.error(
      "UPDATE FR.AK.02 ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const listFrAk02 = async (req, res) => {
  try {
    const { id_jadwal } =
      req.params;

    const data =
      await FrAk02.findAll({
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
    console.error(
      "LIST FR.AK.02 ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const generatePdfFrAk02 = async (
  req,
  res
) => {
  try {
    const {
      id_jadwal,
      id_peserta
    } = req.params;

    const data =
      await FrAk02.findOne({
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
            ]
          }
        ]
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "FR.AK.02 tidak ditemukan"
      });
    }

    const context =
      await getContext(
        Number(id_jadwal),
        Number(id_peserta),
        Number(data.id_asesor)
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK02-${id_peserta}.pdf`
    );

    const doc =
      new PDFDocument({
        size: "A4",
        margin: 30
      });

    doc.pipe(res);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "FR.AK.02. REKAMAN ASESMEN KOMPETENSI",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        `Skema Sertifikasi : ${
          context?.skema?.judul_skema ||
          "-"
        }`
      )
      .text(
        `Nomor : ${
          context?.skema?.kode_skema ||
          "-"
        }`
      )
      .text(
        `TUK : ${
          context?.tuk?.nama_tuk ||
          "-"
        }`
      )
      .text(
        `Nama Asesor : ${
          context?.profileAsesor
            ?.nama_lengkap ||
          "-"
        }`
      )
      .text(
        `Nama Asesi : ${
          getName(
            context?.profileAsesi,
            context?.user
          )
        }`
      )
      .text(
        `Tanggal Mulai : ${
          data.tanggal_mulai ||
          "-"
        }`
      )
      .text(
        `Tanggal Selesai : ${
          data.tanggal_selesai ||
          "-"
        }`
      );

    doc.moveDown();

    data.detail.forEach(
      (item, index) => {
        if (doc.y > 740) {
          doc.addPage();
        }

        doc
          .font("Helvetica-Bold")
          .fontSize(7.5)
          .text(
            `${index + 1}. ${
              item.unit?.kode_unit ||
              "-"
            } - ${
              item.unit?.judul_unit ||
              "-"
            }`
          );

        doc
          .font("Helvetica")
          .fontSize(7)
          .text(
            `Observasi Demonstrasi : ${
              item.observasi
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Portofolio : ${
              item.portofolio
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Pernyataan Pihak Ketiga : ${
              item.pihak_ketiga
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Wawancara : ${
              item.wawancara
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Pertanyaan Lisan : ${
              item.lisan
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Pertanyaan Tertulis : ${
              item.tertulis
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Proyek Kerja : ${
              item.proyek
                ? "✓"
                : "□"
            }`
          )
          .text(
            `Lainnya : ${
              item.lainnya
                ? "✓"
                : "□"
            }`
          );

        doc.moveDown(0.5);
      }
    );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        `Rekomendasi : ${
          data.rekomendasi ===
          "kompeten"
            ? "Kompeten"
            : data.rekomendasi ===
              "belum_kompeten"
            ? "Belum Kompeten"
            : "-"
        }`
      );

    doc.moveDown(0.5);

    doc
      .text(
        "Tindak lanjut yang dibutuhkan :"
      )
      .font("Helvetica")
      .text(
        data.tindak_lanjut ||
        "-"
      );

    doc.moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text(
        "Komentar / Observasi oleh asesor :"
      )
      .font("Helvetica")
      .text(
        data.komentar_asesor ||
        "-"
      );

    doc.moveDown(2);

    if (data.ttd_asesor) {
      const filePath =
        path.join(
          process.cwd(),
          String(
            data.ttd_asesor
          ).replace(/^\/+/, "")
        );

      if (
        fs.existsSync(filePath)
      ) {
        doc.image(
          filePath,
          {
            width: 100
          }
        );

        doc.moveDown();
      }
    }

    doc
      .font("Helvetica")
      .text(
        `Asesor : ${
          context?.profileAsesor
            ?.nama_lengkap ||
          "-"
        }`
      )
      .text(
        `No. Reg : ${
          context?.profileAsesor
            ?.no_reg_asesor ||
          "-"
        }`
      );

    doc.end();
  } catch (err) {
    console.error(
      "PDF FR.AK.02 ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getFrAk02,
  submitFrAk02,
  updateFrAk02,
  listFrAk02,
  generatePdfFrAk02
};