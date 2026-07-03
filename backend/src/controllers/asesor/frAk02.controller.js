const {
  FrAk02,
  FrAk02Detail,
  PresensiAsesor,
  JadwalAsesor,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  UnitKompetensi,
  ProfileAsesi,
  ProfileAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const response = require("../../utils/response.util");


// ==========================
// SUBMIT FR.AK.02
// ==========================
const submitFrAk02 = async (req, res) => {
  try {

    const id_asesor = req.user.id_user;

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

    // ==========================
    // VALIDASI
    // ==========================

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "ID jadwal dan peserta wajib diisi"
      });
    }

    if (!Array.isArray(detail) || detail.length === 0) {
      return res.status(400).json({
        message: "Checklist unit kompetensi wajib diisi"
      });
    }

    if (!ttd_asesor) {
      return res.status(400).json({
        message: "Tanda tangan asesor wajib diisi"
      });
    }

    // ==========================
    // PRESENSI ASESOR
    // ==========================

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      }
    });

    if (!presensi) {
      return res.status(403).json({
        message: "Asesor belum melakukan presensi"
      });
    }

    // ==========================
    // PENUGASAN ASESOR
    // ==========================

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda bukan asesor pada jadwal ini"
      });
    }

    // ==========================
    // PESERTA
    // ==========================

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal
      }
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan"
      });
    }

    // ==========================
    // DUPLIKAT
    // ==========================

    const existing = await FrAk02.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.AK.02 sudah pernah dibuat"
      });
    }

    // ==========================
    // HEADER
    // ==========================

    const header = await FrAk02.create({

      id_jadwal,
      id_peserta,
      id_asesor,

      tanggal_mulai,
      tanggal_selesai,

      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor

    });

    // ==========================
    // DETAIL UNIT
    // ==========================

    const detailData = detail.map((item) => ({

      id_fr_ak02: header.id_fr_ak02,

      id_unit: item.id_unit,

      observasi: Boolean(item.observasi),

      portofolio: Boolean(item.portofolio),

      pihak_ketiga: Boolean(item.pihak_ketiga),

      wawancara: Boolean(item.wawancara),

      lisan: Boolean(item.lisan),

      tertulis: Boolean(item.tertulis),

      proyek: Boolean(item.proyek),

      lainnya: Boolean(item.lainnya)

    }));

    await FrAk02Detail.bulkCreate(detailData);

    return res.status(201).json({

      success: true,

      message: "FR.AK.02 berhasil disimpan",

      data: {
        id_fr_ak02: header.id_fr_ak02
      }

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }
};

// ==========================
// GET DETAIL FR.AK.02
// ==========================
const getFrAk02 = async (req, res) => {

  try {

    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal || !id_peserta) {

      return res.status(400).json({
        success: false,
        message: "ID jadwal dan peserta wajib diisi"
      });

    }

    const data = await FrAk02.findOne({

      where: {
        id_jadwal,
        id_peserta
      },

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
        message: "FR.AK.02 tidak ditemukan"
      });

    }

    return res.json({

      success: true,
      data

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,
      message: err.message

    });

  }

};


// ==========================
// UPDATE FR.AK.02
// ==========================
const updateFrAk02 = async (req, res) => {

  try {

    const { id } = req.params;

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

    // ==========================
    // UPDATE HEADER
    // ==========================

    await frAk02.update({

      tanggal_mulai,
      tanggal_selesai,
      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor

    });

    // ==========================
    // UPDATE DETAIL
    // ==========================

    if (Array.isArray(detail)) {

      for (const item of detail) {

        const existingDetail = await FrAk02Detail.findOne({

          where: {

            id_fr_ak02: id,
            id_unit: item.id_unit

          }

        });

        if (existingDetail) {

          await existingDetail.update({

            observasi: Boolean(item.observasi),
            portofolio: Boolean(item.portofolio),
            pihak_ketiga: Boolean(item.pihak_ketiga),
            wawancara: Boolean(item.wawancara),
            lisan: Boolean(item.lisan),
            tertulis: Boolean(item.tertulis),
            proyek: Boolean(item.proyek),
            lainnya: Boolean(item.lainnya)

          });

        }

      }

    }

    return res.json({

      success: true,
      message: "FR.AK.02 berhasil diperbarui"

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,
      message: err.message

    });

  }

};


// ==========================
// LIST FR.AK.02 PER JADWAL
// ==========================
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

    console.error(err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

// ==========================
// GENERATE PDF FR.AK.02
// ==========================
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
              association: "unit"
            }
          ]
        }

      ]

    });

    if (!data) {

      return res.status(404).json({
        message: "FR.AK.02 tidak ditemukan"
      });

    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR_AK02_${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    doc.pipe(res);

    // ==========================
    // HEADER
    // ==========================

    doc
      .fontSize(16)
      .text("FR.AK.02", {
        align: "center"
      });

    doc
      .fontSize(14)
      .text("REKAMAN ASESMEN KOMPETENSI", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`ID Peserta : ${data.id_peserta}`);
    doc.text(`Tanggal Mulai : ${data.tanggal_mulai || "-"}`);
    doc.text(`Tanggal Selesai : ${data.tanggal_selesai || "-"}`);

    doc.moveDown();

    // ==========================
    // UNIT
    // ==========================

    doc.fontSize(12).text("Unit Kompetensi");

    doc.moveDown(0.5);

    data.detail.forEach((item, index) => {

      doc.fontSize(10);

      doc.text(
        `${index + 1}. ${item.unit?.judul_unit || "-"}`
      );

      doc.text(
        `Observasi : ${item.observasi ? "✔" : "-"}`
      );

      doc.text(
        `Portofolio : ${item.portofolio ? "✔" : "-"}`
      );

      doc.text(
        `Pihak Ketiga : ${item.pihak_ketiga ? "✔" : "-"}`
      );

      doc.text(
        `Wawancara : ${item.wawancara ? "✔" : "-"}`
      );

      doc.text(
        `Lisan : ${item.lisan ? "✔" : "-"}`
      );

      doc.text(
        `Tertulis : ${item.tertulis ? "✔" : "-"}`
      );

      doc.text(
        `Proyek : ${item.proyek ? "✔" : "-"}`
      );

      doc.text(
        `Lainnya : ${item.lainnya ? "✔" : "-"}`
      );

      doc.moveDown();

    });

    // ==========================
    // HASIL
    // ==========================

    doc.moveDown();

    doc.text(
      `Rekomendasi : ${data.rekomendasi}`
    );

    doc.moveDown();

    doc.text(
      "Tindak Lanjut :"
    );

    doc.text(
      data.tindak_lanjut || "-"
    );

    doc.moveDown();

    doc.text(
      "Komentar Asesor :"
    );

    doc.text(
      data.komentar_asesor || "-"
    );

    doc.moveDown(2);

    // ==========================
    // TTD
    // ==========================

    if (data.ttd_asesor) {

      const fileTTD = path.join(
        process.cwd(),
        data.ttd_asesor
      );

      if (fs.existsSync(fileTTD)) {

        doc.image(fileTTD, {
          width: 90
        });

      }

    }

    doc.moveDown();

    doc.text("Asesor");

    doc.end();

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: err.message
    });

  }

};

module.exports = {
  submitFrAk02,
  getFrAk02,
  updateFrAk02,
  listFrAk02,
  generatePdfFrAk02
};