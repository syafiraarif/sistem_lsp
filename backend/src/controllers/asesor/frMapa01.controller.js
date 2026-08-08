const {
  sequelize,
  FrMapa01,
  FrMapa01Detail,
  Jadwal,
  JadwalAsesor,
  PresensiAsesor,
  PesertaJadwal,
  Skema,
  SkemaUnit,
  UnitKompetensi,
  KelompokPekerjaan,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");

const getPotensiDefault = (jenis) => {
  switch (jenis) {
    case "pelatihan_kompeten":
    case "pelatihan_belum_kompeten":
      return 2;
    case "pengalaman_kompeten":
    case "pengalaman_belum_kompeten":
      return 3;
    case "mandiri":
      return 5;
    default:
      return null;
  }
};

const getUnitKompetensi = async (id_skema) => {
  const data = await SkemaUnit.findAll({
    where: {
      id_skema
    },
    order: [
      ["id_kelompok", "ASC"],
      ["urutan", "ASC"]
    ]
  });

  const kelompokIds = [...new Set(data.map((item) => item.id_kelompok))];
  const unitIds = [...new Set(data.map((item) => item.id_unit))];

  const kelompokData = kelompokIds.length
    ? await KelompokPekerjaan.findAll({
        where: {
          id_kelompok: kelompokIds
        },
        order: [["urutan", "ASC"]]
      })
    : [];

  const unitData = unitIds.length
    ? await UnitKompetensi.findAll({
        where: {
          id_unit: unitIds
        }
      })
    : [];

  const kelompokMap = new Map(
    kelompokData.map((item) => [
      Number(item.id_kelompok),
      item
    ])
  );

  const unitMap = new Map(
    unitData.map((item) => [
      Number(item.id_unit),
      item
    ])
  );

  return data.map((item) => {
    const kelompok = kelompokMap.get(
      Number(item.id_kelompok)
    );

    const unit = unitMap.get(
      Number(item.id_unit)
    );

    return {
      id_skema: item.id_skema,
      id_kelompok: item.id_kelompok,
      nama_kelompok:
        kelompok?.nama_kelompok || "-",
      deskripsi_kelompok:
        kelompok?.deskripsi || null,
      id_unit: item.id_unit,
      kode_unit:
        unit?.kode_unit || "-",
      judul_unit:
        unit?.judul_unit || "-",
      urutan: item.urutan
    };
  });
};

const getGroupedUnitKompetensi = async (id_skema) => {
  const units = await getUnitKompetensi(id_skema);

  const grouped = [];

  units.forEach((item) => {
    let kelompok = grouped.find(
      (group) =>
        Number(group.id_kelompok) ===
        Number(item.id_kelompok)
    );

    if (!kelompok) {
      kelompok = {
        id_kelompok: item.id_kelompok,
        nama_kelompok: item.nama_kelompok,
        deskripsi_kelompok:
          item.deskripsi_kelompok,
        units: []
      };

      grouped.push(kelompok);
    }

    kelompok.units.push({
      id_unit: item.id_unit,
      kode_unit: item.kode_unit,
      judul_unit: item.judul_unit,
      urutan: item.urutan
    });
  });

  return grouped;
};

const getPesertaProfile = async (id_peserta) => {
  const peserta = await PesertaJadwal.findByPk(
    id_peserta
  );

  if (!peserta) {
    return null;
  }

  const profile = await ProfileAsesi.findByPk(
    peserta.id_user
  );

  return {
    id_peserta: peserta.id_peserta,
    id_user: peserta.id_user,
    id_jadwal: peserta.id_jadwal,
    id_asesor: peserta.id_asesor,
    status_asesmen:
      peserta.status_asesmen,
    nomor_peserta:
      peserta.nomor_peserta,
    nik: profile?.nik || null,
    nama_lengkap:
      profile?.nama_lengkap || null,
    jenis_kelamin:
      profile?.jenis_kelamin || null,
    tempat_lahir:
      profile?.tempat_lahir || null,
    tanggal_lahir:
      profile?.tanggal_lahir || null,
    alamat:
      profile?.alamat || null,
    email:
      profile?.email || null,
    foto_profil:
      profile?.foto_profil || null,
    ttd_path:
      profile?.ttd_path || null
  };
};

const submitFrMapa01 = async (req, res) => {
  let t;

  try {
    const id_user = req.user.id_user;

    const {
      id_jadwal,
      id_skema,
      id_peserta,
      header,
      detail
    } = req.body;

    if (
      !id_jadwal ||
      !id_skema ||
      !id_peserta
    ) {
      return res.status(400).json({
        message:
          "id_jadwal, id_skema dan id_peserta wajib diisi"
      });
    }

    const jadwal =
      await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message:
          "Jadwal tidak ditemukan"
      });
    }

    if (
      Number(jadwal.id_skema) !==
      Number(id_skema)
    ) {
      return res.status(400).json({
        message:
          "Skema tidak sesuai dengan jadwal"
      });
    }

    const tugas =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user,
          status: "aktif"
        }
      });

    if (!tugas) {
      return res.status(403).json({
        message:
          "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    const presensi =
      await PresensiAsesor.findOne({
        where: {
          id_jadwal,
          id_user
        }
      });

    if (!presensi) {
      return res.status(403).json({
        message:
          "Wajib presensi terlebih dahulu"
      });
    }

    const peserta =
      await PesertaJadwal.findOne({
        where: {
          id_peserta,
          id_jadwal,
          id_asesor: id_user
        }
      });

    if (!peserta) {
      return res.status(403).json({
        message:
          "Peserta bukan tanggung jawab asesor"
      });
    }

    if (!header?.jenis_asesi) {
      return res.status(400).json({
        message:
          "jenis_asesi wajib diisi"
      });
    }

    const existing =
      await FrMapa01.findOne({
        where: {
          id_jadwal,
          id_peserta,
          id_asesor: id_user
        }
      });

    if (existing) {
      return res.status(400).json({
        message:
          "FR.MAPA.01 peserta ini sudah pernah dibuat"
      });
    }

    const unitKompetensi =
      await getUnitKompetensi(id_skema);

    if (!unitKompetensi.length) {
      return res.status(400).json({
        message:
          "Unit kompetensi untuk skema ini belum tersedia"
      });
    }

    const potensi_default =
      getPotensiDefault(
        header.jenis_asesi
      );

    t = await sequelize.transaction();

    const mapa01 =
      await FrMapa01.create(
        {
          id_jadwal,
          id_skema,
          id_peserta,
          id_asesor: id_user,
          potensi_default,
          ...header
        },
        {
          transaction: t
        }
      );

    if (
      Array.isArray(detail) &&
      detail.length > 0
    ) {
      const validUnitIds =
        new Set(
          unitKompetensi.map(
            (item) =>
              Number(item.id_unit)
          )
        );

      const detailData =
        detail
          .filter((item) =>
            validUnitIds.has(
              Number(item.id_unit)
            )
          )
          .map((item) => ({
            id_mapa01:
              mapa01.id_mapa01,
            id_unit:
              item.id_unit,
            bukti:
              item.bukti || null,
            l:
              Boolean(item.l),
            tl:
              Boolean(item.tl),
            t:
              Boolean(item.t),
            metode_observasi:
              item.metode_observasi ||
              null,
            metode_portofolio:
              item.metode_portofolio ||
              null,
            metode_tanya:
              item.metode_tanya ||
              null,
            metode_verifikasi:
              item.metode_verifikasi ||
              null
          }));

      if (detailData.length > 0) {
        await FrMapa01Detail.bulkCreate(
          detailData,
          {
            transaction: t
          }
        );
      }
    }

    await t.commit();

    return res.status(201).json({
      message:
        "FR.MAPA.01 berhasil disimpan",
      potensi_default,
      data: mapa01,
      unitKompetensi
    });
  } catch (err) {
    if (t) {
      await t.rollback();
    }

    console.error(
      "Submit MAPA01 Error:",
      err
    );

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const getFrMapa01 = async (req, res) => {
  try {
    const {
      id_peserta,
      id_jadwal
    } = req.query;

    const id_user =
      req.user.id_user;

    if (!id_peserta) {
      return res.status(400).json({
        message:
          "id_peserta wajib diisi"
      });
    }

    const wherePeserta = {
      id_peserta,
      id_asesor: id_user
    };

    if (id_jadwal) {
      wherePeserta.id_jadwal =
        id_jadwal;
    }

    const peserta =
      await PesertaJadwal.findOne({
        where: wherePeserta
      });

    if (!peserta) {
      return res.status(404).json({
        message:
          "Peserta tidak ditemukan atau bukan tanggung jawab asesor"
      });
    }

    const jadwal =
      await Jadwal.findByPk(
        peserta.id_jadwal
      );

    if (!jadwal) {
      return res.status(404).json({
        message:
          "Jadwal peserta tidak ditemukan"
      });
    }

    const skema =
      await Skema.findByPk(
        jadwal.id_skema
      );

    const data =
      await FrMapa01.findOne({
        where: {
          id_peserta,
          id_jadwal:
            peserta.id_jadwal,
          id_asesor: id_user
        },
        include: [
          {
            model: FrMapa01Detail,
            as: "detail"
          }
        ]
      });

    const profil =
      await getPesertaProfile(
        id_peserta
      );

    const unitKompetensi =
      await getUnitKompetensi(
        jadwal.id_skema
      );

    const kelompokPekerjaan =
      await getGroupedUnitKompetensi(
        jadwal.id_skema
      );

    return res.json({
      data,
      peserta: profil,
      jadwal: {
        id_jadwal:
          jadwal.id_jadwal,
        kode_jadwal:
          jadwal.kode_jadwal,
        nama_kegiatan:
          jadwal.nama_kegiatan,
        id_skema:
          jadwal.id_skema,
        id_tuk:
          jadwal.id_tuk,
        tgl_pra_asesmen:
          jadwal.tgl_pra_asesmen,
        tgl_awal:
          jadwal.tgl_awal,
        tgl_akhir:
          jadwal.tgl_akhir,
        jam: jadwal.jam,
        pelaksanaan_uji:
          jadwal.pelaksanaan_uji
      },
      skema,
      unitKompetensi,
      kelompokPekerjaan
    });
  } catch (err) {
    console.error(
      "Get MAPA01 Error:",
      err
    );

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const updateFrMapa01 = async (req, res) => {
  let t;

  try {
    const { id } = req.params;

    const id_user =
      req.user.id_user;

    const {
      header,
      detail
    } = req.body;

    const mapa01 =
      await FrMapa01.findOne({
        where: {
          id_mapa01: id,
          id_asesor: id_user
        }
      });

    if (!mapa01) {
      return res.status(404).json({
        message:
          "Data tidak ditemukan"
      });
    }

    const peserta =
      await PesertaJadwal.findOne({
        where: {
          id_peserta:
            mapa01.id_peserta,
          id_jadwal:
            mapa01.id_jadwal,
          id_asesor: id_user
        }
      });

    if (!peserta) {
      return res.status(403).json({
        message:
          "Peserta bukan tanggung jawab asesor"
      });
    }

    const unitKompetensi =
      await getUnitKompetensi(
        mapa01.id_skema
      );

    if (!unitKompetensi.length) {
      return res.status(400).json({
        message:
          "Unit kompetensi untuk skema ini belum tersedia"
      });
    }

    let potensi_default =
      mapa01.potensi_default;

    if (header?.jenis_asesi) {
      potensi_default =
        getPotensiDefault(
          header.jenis_asesi
        );
    }

    t = await sequelize.transaction();

    await mapa01.update(
      {
        ...header,
        id_peserta:
          mapa01.id_peserta,
        id_jadwal:
          mapa01.id_jadwal,
        id_skema:
          mapa01.id_skema,
        id_asesor:
          mapa01.id_asesor,
        potensi_default
      },
      {
        transaction: t
      }
    );

    await FrMapa01Detail.destroy({
      where: {
        id_mapa01:
          mapa01.id_mapa01
      },
      transaction: t
    });

    if (
      Array.isArray(detail) &&
      detail.length > 0
    ) {
      const validUnitIds =
        new Set(
          unitKompetensi.map(
            (item) =>
              Number(item.id_unit)
          )
        );

      const detailData =
        detail
          .filter((item) =>
            validUnitIds.has(
              Number(item.id_unit)
            )
          )
          .map((item) => ({
            id_mapa01:
              mapa01.id_mapa01,
            id_unit:
              item.id_unit,
            bukti:
              item.bukti || null,
            l:
              Boolean(item.l),
            tl:
              Boolean(item.tl),
            t:
              Boolean(item.t),
            metode_observasi:
              item.metode_observasi ||
              null,
            metode_portofolio:
              item.metode_portofolio ||
              null,
            metode_tanya:
              item.metode_tanya ||
              null,
            metode_verifikasi:
              item.metode_verifikasi ||
              null
          }));

      if (detailData.length > 0) {
        await FrMapa01Detail.bulkCreate(
          detailData,
          {
            transaction: t
          }
        );
      }
    }

    await t.commit();

    return res.json({
      message:
        "FR.MAPA.01 berhasil diupdate",
      potensi_default,
      data: mapa01,
      unitKompetensi
    });
  } catch (err) {
    if (t) {
      await t.rollback();
    }

    console.error(
      "Update MAPA01 Error:",
      err
    );

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const listFrMapa01 = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.params;

    const data =
      await FrMapa01.findAll({
        where: {
          id_jadwal
        },
        include: [
          {
            model: FrMapa01Detail,
            as: "detail"
          },
          {
            model: PesertaJadwal,
            as: "peserta"
          }
        ],
        order: [
          [
            "created_at",
            "DESC"
          ]
        ]
      });

    return res.json({
      total: data.length,
      data
    });
  } catch (err) {
    console.error(
      "List MAPA01 Error:",
      err
    );

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const downloadPdfFrMapa01 = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const id_user =
      req.user.id_user;

    const data = await FrMapa01.findOne({
    where: {
      id_mapa01: id,
      id_asesor: id_user
    },
    include: [
      {
        model: FrMapa01Detail,
        as: "detail"
      },
      {
        model: PesertaJadwal,
        as: "peserta"
      },
      {
        model: Skema,
        as: "skema",
        attributes: [
          "id_skema",
          "kode_skema",
          "judul_skema"
        ]
      }
    ]
  });

    if (!data) {
      return res.status(404).json({
        message:
          "Data tidak ditemukan"
      });
    }

    const skema =
      await Skema.findByPk(
        data.id_skema
      );

    const unitKompetensi =
      await getUnitKompetensi(
        data.id_skema
      );

    const unitMap = new Map(
      unitKompetensi.map(
        (item) => [
          Number(item.id_unit),
          item
        ]
      )
    );

    const doc =
      new PDFDocument({
        size: "A4",
        margin: 40
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR_MAPA01_${id}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(16)
      .text(
        "FR.MAPA.01",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc.fontSize(10);

    doc.text(
      `Kode Skema : ${
        skema?.kode_skema || "-"
      }`
    );

    doc.text(
      `Judul Skema : ${
        skema?.judul_skema || "-"
      }`
    );

    doc.text(
      `ID Peserta : ${
        data.id_peserta
      }`
    );

    doc.text(
      `Jenis Asesi : ${
        data.jenis_asesi || "-"
      }`
    );

    doc.text(
      `Potensi Default : ${
        data.potensi_default || "-"
      }`
    );

    doc.moveDown();

    data.detail.forEach(
      (item, index) => {
        const unit =
          unitMap.get(
            Number(item.id_unit)
          );

        doc.text(
          `${index + 1}. ${
            unit?.kode_unit || "-"
          } - ${
            unit?.judul_unit || "-"
          }`
        );
      }
    );

    doc.end();
  } catch (err) {
    console.error(
      "PDF MAPA01 Error:",
      err
    );

    return res.status(500).json({
      message:
        "Gagal generate PDF",
      error: err.message
    });
  }
};

module.exports = {
  submitFrMapa01,
  getFrMapa01,
  updateFrMapa01,
  listFrMapa01,
  downloadPdfFrMapa01
};