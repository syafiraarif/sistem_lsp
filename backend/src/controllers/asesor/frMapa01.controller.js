// ===============================
// IMPORT
// ===============================
const {
  sequelize,
  FrMapa01,
  FrMapa01Detail,
  Jadwal,
  JadwalAsesor,
  PresensiAsesor,
  PesertaJadwal
} = require("../../models");

const PDFDocument = require("pdfkit");


// ===============================
// MAPPING POTENSI
// ===============================
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


// ===============================
// SUBMIT FR.MAPA.01
// ===============================
const submitFrMapa01 = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const id_user = req.user.id_user;

    const {
      id_jadwal,
      id_skema,
      id_peserta,
      header,
      detail
    } = req.body;

    if (!id_jadwal || !id_skema || !id_peserta) {
      return res.status(400).json({
        message:
          "id_jadwal, id_skema dan id_peserta wajib diisi"
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }

    const tugas = await JadwalAsesor.findOne({
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

    const presensi = await PresensiAsesor.findOne({
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

    const peserta = await PesertaJadwal.findOne({
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

    const existing = await FrMapa01.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(400).json({
        message:
          "FR.MAPA.01 peserta ini sudah pernah dibuat"
      });
    }

    if (!header?.jenis_asesi) {
      return res.status(400).json({
        message:
          "jenis_asesi wajib diisi"
      });
    }

    const potensi_default =
      getPotensiDefault(header.jenis_asesi);

    const mapa01 = await FrMapa01.create(
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

    if (detail?.length > 0) {

      const detailData = detail.map(item => ({
        id_mapa01: mapa01.id_mapa01,
        id_unit: item.id_unit,
        bukti: item.bukti,
        l: item.l,
        tl: item.tl,
        t: item.t,
        metode_observasi:
          item.metode_observasi,
        metode_portofolio:
          item.metode_portofolio,
        metode_tanya:
          item.metode_tanya,
        metode_verifikasi:
          item.metode_verifikasi
      }));

      await FrMapa01Detail.bulkCreate(
        detailData,
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return res.status(201).json({
      message:
        "FR.MAPA.01 berhasil disimpan",
      potensi_default,
      data: mapa01
    });

  } catch (err) {

    await t.rollback();

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


// ===============================
// GET DETAIL
// ===============================
const getFrMapa01 = async (req, res) => {

  try {

    const { id_peserta } = req.query;

    const id_user =
      req.user.id_user;

    const data =
      await FrMapa01.findOne({
        where: {
          id_peserta,
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
          }
        ]
      });

    return res.json({
      data
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


// ===============================
// UPDATE
// ===============================
const updateFrMapa01 = async (req, res) => {

  const t =
    await sequelize.transaction();

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

    let potensi_default =
      mapa01.potensi_default;

    if (header?.jenis_asesi) {

      potensi_default =
        getPotensiDefault(
          header.jenis_asesi
        );
    }

    await mapa01.update(
      {
        ...header,
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

    if (detail?.length > 0) {

      const detailData = detail.map(item => ({
        id_mapa01:
          mapa01.id_mapa01,
        id_unit: item.id_unit,
        bukti: item.bukti,
        l: item.l,
        tl: item.tl,
        t: item.t,
        metode_observasi:
          item.metode_observasi,
        metode_portofolio:
          item.metode_portofolio,
        metode_tanya:
          item.metode_tanya,
        metode_verifikasi:
          item.metode_verifikasi
      }));

      await FrMapa01Detail.bulkCreate(
        detailData,
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return res.json({
      message:
        "FR.MAPA.01 berhasil diupdate",
      potensi_default
    });

  } catch (err) {

    await t.rollback();

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


// ===============================
// LIST
// ===============================
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


// ===============================
// DOWNLOAD PDF
// ===============================
const downloadPdfFrMapa01 = async (req, res) => {

  try {

    const { id } =
      req.params;

    const id_user =
      req.user.id_user;

    const data =
      await FrMapa01.findOne({
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
          }
        ]
      });

    if (!data) {
      return res.status(404).json({
        message:
          "Data tidak ditemukan"
      });
    }

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
          align:
            "center"
        }
      );

    doc.moveDown();

    doc.fontSize(10);

    doc.text(
      `ID Peserta : ${data.id_peserta}`
    );

    doc.text(
      `Jenis Asesi : ${data.jenis_asesi}`
    );

    doc.text(
      `Potensi Default : ${data.potensi_default}`
    );

    doc.moveDown();

    data.detail.forEach(
      (
        item,
        index
      ) => {

        doc.text(
          `${index + 1}. Unit ${item.id_unit}`
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
      error:
        err.message
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