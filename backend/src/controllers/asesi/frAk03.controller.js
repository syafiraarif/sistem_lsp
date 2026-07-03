const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const response = require("../../utils/response.util");

const {
  FrAk03,
  FrAk03Detail,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor,
  Presensi
} = require("../../models");

/*
==================================================
PERTANYAAN TETAP (FIXED) FR.AK.03
==================================================
*/

const QUESTIONS = [
  "Saya mendapatkan penjelasan yang cukup memadai mengenai proses asesmen/uji kompetensi.",
  "Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diujikan dan menilai diri sendiri terhadap pencapaiannya.",
  "Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metode, instrumen, sumber asesmen, serta jadwal asesmen.",
  "Asesor berusaha menggali seluruh bukti pendukung yang sesuai dengan latar belakang pelatihan dan pengalaman yang saya miliki.",
  "Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen.",
  "Saya mendapatkan penjelasan yang memadai mengenai keputusan asesmen.",
  "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjutnya.",
  "Asesor bersama saya mempelajari semua dokumen asesmen serta menandatanganinya.",
  "Saya mendapatkan jaminan kerahasiaan hasil asesmen serta penjelasan mengenai penanganan dokumen asesmen.",
  "Asesor menggunakan keterampilan komunikasi yang efektif selama asesmen."
];

/*
==================================================
GET FORM FR.AK.03
==================================================
*/

exports.getFormFrAk03 = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_user
      },
      include: [
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
        },
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          attributes: [
            "nama_lengkap"
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

    return res.status(200).json({
      success: true,
      data: {
        id_peserta: peserta.id_peserta,
        id_jadwal: peserta.id_jadwal,

        nama_asesi: peserta.profileAsesi?.nama_lengkap || null,

        skema: peserta.jadwal?.skema || null,

        tuk: peserta.jadwal?.tuk || null,

        tanggal_mulai: peserta.jadwal?.tgl_awal || null,

        tanggal_selesai: peserta.jadwal?.tgl_akhir || null,

        questions: QUESTIONS
      }
    });

  } catch (error) {

    console.error("GET FORM FR.AK.03 :", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
==================================================
CREATE / SUBMIT FR.AK.03
==================================================
*/

exports.createFrAk03 = async (req, res) => {

  const transaction = await FrAk03.sequelize.transaction();

  try {

    const id_user = req.user.id_user;

    const {
      jawaban,
      catatan_lainnya
    } = req.body;

    // ===========================
    // VALIDASI JAWABAN
    // ===========================
    if (!Array.isArray(jawaban)) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Jawaban harus berupa array."
      });

    }

    if (jawaban.length !== QUESTIONS.length) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Jumlah jawaban harus ${QUESTIONS.length}.`
      });

    }

    // ===========================
    // CEK PESERTA
    // ===========================
    const peserta = await PesertaJadwal.findOne({

      where: {
        id_user
      },

      include: [
        {
          model: Jadwal,
          as: "jadwal"
        }
      ],

      transaction

    });

    if (!peserta) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan."
      });

    }

    // ===========================
    // CEK DUPLIKAT
    // ===========================
    const existing = await FrAk03.findOne({

      where: {
        id_peserta: peserta.id_peserta
      },

      transaction

    });

    if (existing) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "FR.AK.03 sudah pernah diisi."
      });

    }

    // ===========================
    // SIMPAN HEADER
    // ===========================
    const fr = await FrAk03.create({

      id_peserta: peserta.id_peserta,

      id_jadwal: peserta.id_jadwal,

      id_skema: peserta.jadwal.id_skema,

      id_tuk: peserta.jadwal.id_tuk,

      tanggal_asesmen: new Date(),

      catatan_lainnya

    }, {
      transaction
    });

    // ===========================
    // SIMPAN DETAIL
    // ===========================
    const detailData = jawaban.map((item, index) => ({

      id_fr_ak03: fr.id_fr_ak03,

      kode_pertanyaan: `Q${index + 1}`,

      pertanyaan: QUESTIONS[index],

      jawaban:
        item.jawaban === "ya"
          ? "ya"
          : "tidak",

      catatan: item.catatan || null

    }));

    await FrAk03Detail.bulkCreate(detailData, {
      transaction
    });

    await transaction.commit();

    return res.status(201).json({

      success: true,

      message: "FR.AK.03 berhasil disimpan.",

      data: fr

    });

  } catch (error) {

    await transaction.rollback();

    console.error("CREATE FR.AK.03 :", error);

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


/*
==================================================
GET DETAIL FR.AK.03
==================================================
*/

exports.getFrAk03ByPeserta = async (req, res) => {
  try {

    const { id_peserta } = req.params;

    const data = await FrAk03.findOne({
      where: {
        id_peserta
      },
      include: [
        {
          model: FrAk03Detail,
          as: "detailAk03",
          separate: true,
          order: [["kode_pertanyaan", "ASC"]]
        },
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi",
              attributes: [
                "nama_lengkap",
                "ttd_path"
              ]
            }
          ]
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

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.03 tidak ditemukan."
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error("GET DETAIL FR.AK.03 :", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
==================================================
GENERATE PDF FR.AK.03
==================================================
*/

exports.generatePdfFrAk03 = async (req, res) => {
  try {

    const { id_peserta } = req.params;

    const data = await FrAk03.findOne({
      where: {
        id_peserta
      },
      include: [
        {
          model: FrAk03Detail,
          as: "detailAk03",
          separate: true,
          order: [["kode_pertanyaan", "ASC"]]
        },
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            }
          ]
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

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.AK.03 tidak ditemukan."
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 40
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK03-${id_peserta}.pdf`
    );

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc
      .fontSize(16)
      .text("FR.AK.03", {
        align: "center"
      });

    doc
      .fontSize(13)
      .text("UMPAN BALIK DAN CATATAN ASESMEN", {
        align: "center"
      });

    doc.moveDown(2);

    // =========================
    // DATA ASESI
    // =========================
    doc.fontSize(11);

    doc.text(
      `Nama Asesi : ${data.peserta?.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(
      `Skema Sertifikasi : ${data.jadwal?.skema?.judul_skema || "-"}`
    );

    doc.text(
      `TUK : ${data.jadwal?.tuk?.nama_tuk || "-"}`
    );

    doc.text(
      `Tanggal Asesmen : ${
        data.tanggal_asesmen
          ? new Date(data.tanggal_asesmen).toLocaleDateString("id-ID")
          : "-"
      }`
    );

    doc.moveDown();

    // =========================
    // DETAIL PERTANYAAN
    // =========================
    doc
      .fontSize(12)
      .text("Umpan Balik Peserta", {
        underline: true
      });

    doc.moveDown();

    (data.detailAk03 || []).forEach((item, index) => {

      doc.fontSize(11);

      doc.text(`${index + 1}. ${item.pertanyaan}`);

      doc.text(
        `Jawaban : ${item.jawaban === "ya" ? "Ya" : "Tidak"}`
      );

      doc.text(
        `Catatan : ${item.catatan || "-"}`
      );

      doc.moveDown();

    });

    // =========================
    // CATATAN LAINNYA
    // =========================
    doc
      .fontSize(12)
      .text("Catatan Lainnya", {
        underline: true
      });

    doc.moveDown(0.5);

    doc.fontSize(11).text(
      data.catatan_lainnya || "-"
    );

    doc.end();

  } catch (error) {

    console.error("PDF FR.AK.03 :", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};