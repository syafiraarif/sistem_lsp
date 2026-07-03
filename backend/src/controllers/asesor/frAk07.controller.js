const {
  sequelize,
  FrAk07,
  FrAk07DetailA,
  FrAk07DetailB,
  FrAk07Hasil,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor,
  PresensiAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const response = require("../../utils/response.util");

// ===============================
// GET DETAIL FR.AK.07
// ===============================
const getFrAk07 = async (req, res) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "id_fr_ak07 wajib diisi"
      });
    }

    const frAk07 = await FrAk07.findOne({
      where: {
        id_fr_ak07: id
      },
      include: [

        // ==========================
        // DETAIL A
        // ==========================
        {
          model: FrAk07DetailA,
          as: "detailsA",
          separate: true,
          order: [["nomor", "ASC"]],
          attributes: [
            "id_fr_ak07_detailA",
            "nomor",
            "aspek",
            "butuh_penyesuaian",
            "keterangan"
          ]
        },

        // ==========================
        // DETAIL B
        // ==========================
        {
          model: FrAk07DetailB,
          as: "detailsB",
          separate: true,
          order: [["nomor", "ASC"]],
          attributes: [
            "id_fr_ak07_detailB",
            "nomor",
            "pertanyaan",
            "jawaban",
            "standar_industri",
            "sop",
            "regulasi_teknik",
            "metode_asesmen",
            "instrumen_asesmen"
          ]
        },

        // ==========================
        // HASIL
        // ==========================
        {
          model: FrAk07Hasil,
          as: "results",
          attributes: [
            "id_fr_ak07_hasil",
            "bagian",
            "acuan_pembanding",
            "metode_asesmen",
            "instrumen_asesmen"
          ]
        },

        // ==========================
        // PESERTA
        // ==========================
        {
          model: PesertaJadwal,
          as: "peserta",
          attributes: [
            "id_peserta",
            "id_jadwal",
            "nomor_peserta"
          ],
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

        // ==========================
        // JADWAL
        // ==========================
        {
          model: Jadwal,
          as: "jadwal",
          attributes: [
            "id_jadwal",
            "tgl_awal"
          ],
          include: [
            {
              model: Skema,
              as: "skema",
              attributes: [
                "kode_skema",
                "judul_skema",
                "jenis_skema"
              ]
            },
            {
              model: Tuk,
              as: "tuk",
              attributes: [
                "nama_tuk",
                "jenis_tuk"
              ]
            }
          ]
        },

        // ==========================
        // ASESOR
        // ==========================
        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
          ]
        }

      ]
    });

    if (!frAk07) {
      return res.status(404).json({
        message: "FR.AK.07 tidak ditemukan"
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data FR.AK.07",
      data: frAk07
    });

  } catch (error) {

    console.error("Get FR.AK.07 Error :", error);

    return res.status(500).json({
      message: error.message
    });

  }
};

// ======================================
// SUBMIT FR.AK.07
// ======================================
const submitFrAk07 = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      id_asesi,
      potensi_asesi,
      ttd_asesor,
      detailsA = [],
      detailsB = [],
      results = []
    } = req.body;

    if (!id_jadwal || !id_asesi) {

      await t.rollback();

      return res.status(400).json({
        message: "id_jadwal dan id_asesi wajib diisi"
      });

    }

    // ===========================
    // Cek presensi asesor
    // ===========================

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      },
      transaction: t
    });

    if (!presensi) {

      await t.rollback();

      return res.status(403).json({
        message: "Asesor belum melakukan presensi."
      });

    }

    // ===========================
    // Cek tugas asesor
    // ===========================

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      },
      transaction: t
    });

    if (!tugas) {

      await t.rollback();

      return res.status(403).json({
        message: "Anda bukan asesor pada jadwal ini."
      });

    }

    // ===========================
    // Cek peserta
    // ===========================

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta: id_asesi,
        id_jadwal
      },
      transaction: t
    });

    if (!peserta) {

      await t.rollback();

      return res.status(404).json({
        message: "Peserta tidak ditemukan."
      });

    }

    // ===========================
    // Cek sudah submit
    // ===========================

    const existing = await FrAk07.findOne({
      where: {
        id_jadwal,
        id_asesi
      },
      transaction: t
    });

    if (existing) {

      await t.rollback();

      return res.status(400).json({
        message: "FR.AK.07 sudah pernah dibuat."
      });

    }

    // ===========================
    // Simpan Header
    // ===========================

    const frAk07 = await FrAk07.create({

      id_jadwal,
      id_asesor,
      id_asesi,

      potensi_asesi:
        Array.isArray(potensi_asesi)
          ? JSON.stringify(potensi_asesi)
          : potensi_asesi,

      ttd_asesor

    }, {
      transaction: t
    });

    // ===========================
    // Detail A
    // ===========================

    for (const item of detailsA) {

      await FrAk07DetailA.create({

        id_fr_ak07: frAk07.id_fr_ak07,

        nomor: item.nomor,

        aspek: item.aspek,

        butuh_penyesuaian: item.butuh_penyesuaian,

        keterangan:
          Array.isArray(item.keterangan)
            ? JSON.stringify(item.keterangan)
            : item.keterangan

      }, {
        transaction: t
      });

    }

    // ===========================
    // Detail B
    // ===========================

    for (const item of detailsB) {

      await FrAk07DetailB.create({

        id_fr_ak07: frAk07.id_fr_ak07,

        nomor: item.nomor,

        pertanyaan: item.pertanyaan,

        jawaban: item.jawaban,

        standar_industri: item.standar_industri,

        sop: item.sop,

        regulasi_teknik: item.regulasi_teknik,

        metode_asesmen: item.metode_asesmen,

        instrumen_asesmen: item.instrumen_asesmen

      }, {
        transaction: t
      });

    }

    // ===========================
    // Hasil
    // ===========================

    for (const item of results) {

      await FrAk07Hasil.create({

        id_fr_ak07: frAk07.id_fr_ak07,

        bagian: item.bagian,

        acuan_pembanding: item.acuan_pembanding,

        metode_asesmen: item.metode_asesmen,

        instrumen_asesmen: item.instrumen_asesmen

      }, {
        transaction: t
      });

    }

    await t.commit();

    return res.status(201).json({

      message: "FR.AK.07 berhasil disimpan",

      data: frAk07

    });

  } catch (error) {

    await t.rollback();

    console.error("Submit FR.AK.07 Error :", error);

    return res.status(500).json({

      message: error.message

    });

  }

};

// ======================================
// UPDATE FR.AK.07
// ======================================
const updateFrAk07 = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const { id } = req.params;

    const {
      potensi_asesi,
      ttd_asesor,
      detailsA = [],
      detailsB = [],
      results = []
    } = req.body;

    const frAk07 = await FrAk07.findByPk(id, {
      transaction: t
    });

    if (!frAk07) {

      await t.rollback();

      return res.status(404).json({
        message: "FR.AK.07 tidak ditemukan"
      });

    }

    // ==========================
    // UPDATE HEADER
    // ==========================

    await frAk07.update({

      potensi_asesi:
        Array.isArray(potensi_asesi)
          ? JSON.stringify(potensi_asesi)
          : potensi_asesi,

      ttd_asesor

    }, {
      transaction: t
    });

    // ==========================
    // HAPUS DETAIL LAMA
    // ==========================

    await FrAk07DetailA.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    await FrAk07DetailB.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    await FrAk07Hasil.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    // ==========================
    // SIMPAN DETAIL A
    // ==========================

    for (const item of detailsA) {

      await FrAk07DetailA.create({

        id_fr_ak07: id,

        nomor: item.nomor,

        aspek: item.aspek,

        butuh_penyesuaian: item.butuh_penyesuaian,

        keterangan:
          Array.isArray(item.keterangan)
            ? JSON.stringify(item.keterangan)
            : item.keterangan

      }, {
        transaction: t
      });

    }

    // ==========================
    // SIMPAN DETAIL B
    // ==========================

    for (const item of detailsB) {

      await FrAk07DetailB.create({

        id_fr_ak07: id,

        nomor: item.nomor,

        pertanyaan: item.pertanyaan,

        jawaban: item.jawaban,

        standar_industri: item.standar_industri,

        sop: item.sop,

        regulasi_teknik: item.regulasi_teknik,

        metode_asesmen: item.metode_asesmen,

        instrumen_asesmen: item.instrumen_asesmen

      }, {
        transaction: t
      });

    }

    // ==========================
    // SIMPAN HASIL
    // ==========================

    for (const item of results) {

      await FrAk07Hasil.create({

        id_fr_ak07: id,

        bagian: item.bagian,

        acuan_pembanding: item.acuan_pembanding,

        metode_asesmen: item.metode_asesmen,

        instrumen_asesmen: item.instrumen_asesmen

      }, {
        transaction: t
      });

    }

    await t.commit();

    return res.status(200).json({

      message: "FR.AK.07 berhasil diperbarui"

    });

  } catch (error) {

    await t.rollback();

    console.error("Update FR.AK.07 Error :", error);

    return res.status(500).json({

      message: error.message

    });

  }

};

// ======================================
// LIST FR.AK.07 PER JADWAL
// ======================================
const listFrAk07 = async (req, res) => {

  try {

    const { id_jadwal } = req.params;

    if (!id_jadwal) {

      return res.status(400).json({
        message: "id_jadwal wajib diisi"
      });

    }

    const data = await FrAk07.findAll({

      where: {
        id_jadwal
      },

      include: [

        // ==========================
        // PESERTA
        // ==========================
        {
          model: PesertaJadwal,
          as: "peserta",
          attributes: [
            "id_peserta",
            "nomor_peserta"
          ],
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi",
              attributes: [
                "nama_lengkap"
              ]
            }
          ]
        },

        // ==========================
        // ASESOR
        // ==========================
        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "no_reg_asesor"
          ]
        },

        // ==========================
        // DETAIL A
        // ==========================
        {
          model: FrAk07DetailA,
          as: "detailsA"
        },

        // ==========================
        // DETAIL B
        // ==========================
        {
          model: FrAk07DetailB,
          as: "detailsB"
        },

        // ==========================
        // HASIL
        // ==========================
        {
          model: FrAk07Hasil,
          as: "results"
        }

      ],

      order: [
        ["id_fr_ak07", "DESC"]
      ]

    });

    return res.status(200).json({

      total: data.length,

      data

    });

  } catch (error) {

    console.error("List FR.AK.07 Error :", error);

    return res.status(500).json({

      message: error.message

    });

  }

};

// ======================================
// DOWNLOAD PDF FR.AK.07
// ======================================
const downloadPdfFrAk07 = async (req, res) => {

  try {

    const { id } = req.params;

    const data = await FrAk07.findOne({

      where: {
        id_fr_ak07: id
      },

      include: [

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
              as: "skema",
              attributes: [
                "kode_skema",
                "judul_skema"
              ]
            },
            {
              model: Tuk,
              as: "tuk",
              attributes: [
                "nama_tuk"
              ]
            }
          ]
        },

        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "ttd_path"
          ]
        },

        {
          model: FrAk07DetailA,
          as: "detailsA"
        },

        {
          model: FrAk07DetailB,
          as: "detailsB"
        },

        {
          model: FrAk07Hasil,
          as: "results"
        }

      ]

    });

    if (!data) {

      return res.status(404).json({
        message: "FR.AK.07 tidak ditemukan"
      });

    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR_AK07_${data.id_fr_ak07}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    doc.pipe(res);

    // ===================================
    // HEADER
    // ===================================

    doc
      .fontSize(16)
      .text("FR.AK.07", {
        align: "center"
      });

    doc
      .fontSize(13)
      .text("PENINJAUAN PROSES ASESMEN", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(10);

    doc.text(
      `Nama Asesi : ${
        data.peserta?.profileAsesi?.nama_lengkap || "-"
      }`
    );

    doc.text(
      `Nama Asesor : ${
        data.asesor?.nama_lengkap || "-"
      }`
    );

    doc.text(
      `Skema : ${
        data.jadwal?.skema?.judul_skema || "-"
      }`
    );

    doc.text(
      `Kode Skema : ${
        data.jadwal?.skema?.kode_skema || "-"
      }`
    );

    doc.text(
      `TUK : ${
        data.jadwal?.tuk?.nama_tuk || "-"
      }`
    );

    doc.moveDown();

    // ===================================
    // POTENSI ASESI
    // ===================================

    doc
      .fontSize(12)
      .text("Potensi Asesi");

    doc.fontSize(10);

    let potensi = data.potensi_asesi;

    try {

      potensi = JSON.parse(
        data.potensi_asesi
      ).join(", ");

    } catch (e) {}

    doc.text(
      potensi || "-"
    );

    doc.moveDown();

    // ===================================
    // DETAIL A
    // ===================================

    doc
      .fontSize(12)
      .text("Bagian A");

    doc.moveDown(0.5);

    data.detailsA.forEach((item) => {

      doc.fontSize(10);

      doc.text(
        `${item.nomor}. ${item.aspek}`
      );

      doc.text(
        `Penyesuaian : ${item.butuh_penyesuaian}`
      );

      doc.text(
        `Keterangan : ${item.keterangan || "-"}`
      );

      doc.moveDown();

    });

    // ===================================
    // DETAIL B
    // ===================================

    doc
      .fontSize(12)
      .text("Bagian B");

    doc.moveDown(0.5);

    data.detailsB.forEach((item) => {

      doc.fontSize(10);

      doc.text(
        `${item.nomor}. ${item.pertanyaan}`
      );

      doc.text(
        `Jawaban : ${item.jawaban || "-"}`
      );

      doc.text(
        `Standar Industri : ${item.standar_industri || "-"}`
      );

      doc.text(
        `SOP : ${item.sop || "-"}`
      );

      doc.text(
        `Regulasi Teknik : ${item.regulasi_teknik || "-"}`
      );

      doc.text(
        `Metode Asesmen : ${item.metode_asesmen || "-"}`
      );

      doc.text(
        `Instrumen Asesmen : ${item.instrumen_asesmen || "-"}`
      );

      doc.moveDown();

    });

    // ===================================
    // HASIL
    // ===================================

    doc
      .fontSize(12)
      .text("Hasil Peninjauan");

    doc.moveDown(0.5);

    data.results.forEach((item) => {

      doc.fontSize(10);

      doc.text(
        `${item.bagian}`
      );

      doc.text(
        `Acuan Pembanding : ${item.acuan_pembanding || "-"}`
      );

      doc.text(
        `Metode Asesmen : ${item.metode_asesmen || "-"}`
      );

      doc.text(
        `Instrumen Asesmen : ${item.instrumen_asesmen || "-"}`
      );

      doc.moveDown();

    });

    // ===================================
    // TTD
    // ===================================

    doc.moveDown(2);

    doc.text(
      "Tanda Tangan Asesor"
    );

    if (
      data.asesor?.ttd_path &&
      fs.existsSync(data.asesor.ttd_path)
    ) {

      doc.image(
        data.asesor.ttd_path,
        {
          width: 100
        }
      );

    } else {

      doc.text("(Tidak ada tanda tangan)");

    }

    doc.end();

  } catch (error) {

    console.error(
      "Download PDF FR.AK.07 Error :",
      error
    );

    return res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getFrAk07,
  submitFrAk07,
  updateFrAk07,
  listFrAk07,
  downloadPdfFrAk07,
};