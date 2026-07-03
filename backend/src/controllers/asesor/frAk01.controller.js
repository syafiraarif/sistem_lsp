const {
  sequelize,

  // FORM
  FrAk01,

  // JADWAL
  Jadwal,
  JadwalAsesor,
  PesertaJadwal,
  PresensiAsesor,

  // MASTER
  Skema,

  // USER
  User,
  ProfileAsesor,
  ProfileAsesi

} = require("../../models");

const PDFDocument = require("pdfkit");

const response = require("../../utils/response.util");


// =============================================
// SUBMIT FR.AK.01
// =============================================
const submitFrAk01 = async (req, res) => {

  try {

    const id_asesor = req.user.id_user;

    const {

      id_jadwal,
      id_peserta,

      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      bukti_lainnya,

      persetujuan,

      ttd_asesor

    } = req.body;

    // =====================================
    // VALIDASI
    // =====================================

    if (!id_jadwal || !id_peserta) {

      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });

    }

    if (!ttd_asesor) {

      return res.status(400).json({
        success: false,
        message: "Tanda tangan asesor wajib diisi."
      });

    }

    // =====================================
    // CEK PRESENSI
    // =====================================

    const presensi = await PresensiAsesor.findOne({

      where: {
        id_jadwal,
        id_user: id_asesor
      }

    });

    if (!presensi) {

      return res.status(403).json({
        success: false,
        message: "Harap melakukan presensi terlebih dahulu."
      });

    }

    // =====================================
    // CEK TUGAS ASESOR
    // =====================================

    const tugas = await JadwalAsesor.findOne({

      where: {

        id_jadwal,
        id_user: id_asesor,
        status: "aktif"

      }

    });

    if (!tugas) {

      return res.status(403).json({

        success: false,

        message: "Anda bukan asesor aktif pada jadwal ini."

      });

    }

    // =====================================
    // CEK PESERTA
    // =====================================

    const peserta = await PesertaJadwal.findOne({

      where: {

        id_peserta,
        id_jadwal

      }

    });

    if (!peserta) {

      return res.status(404).json({

        success: false,

        message: "Peserta tidak ditemukan."

      });

    }

    // =====================================
    // CEK DUPLIKAT
    // =====================================

    const existing = await FrAk01.findOne({

      where: {

        id_jadwal,
        id_peserta

      }

    });

    if (existing) {

      return res.status(409).json({

        success: false,

        message: "FR.AK.01 sudah pernah dibuat."

      });

    }

    // =====================================
    // SIMPAN
    // =====================================

    const data = await FrAk01.create({

      id_jadwal,
      id_peserta,
      id_asesor,

      bukti_portofolio: Boolean(bukti_portofolio),

      bukti_observasi: Boolean(bukti_observasi),

      bukti_tertulis: Boolean(bukti_tertulis),

      bukti_wawancara: Boolean(bukti_wawancara),

      bukti_review_produk: Boolean(bukti_review_produk),

      bukti_kegiatan_terstruktur: Boolean(
        bukti_kegiatan_terstruktur
      ),

      bukti_lisan: Boolean(
        bukti_lisan
      ),

      bukti_lainnya:
        bukti_lainnya && bukti_lainnya.trim() !== ""
          ? bukti_lainnya
          : null,

      persetujuan:
        persetujuan !== undefined
          ? Boolean(persetujuan)
          : true,

      ttd_asesor

    });

    return res.status(201).json({

      success: true,

      message: "FR.AK.01 berhasil disimpan.",

      data

    });

  } catch (err) {

    console.error("Submit FR.AK.01 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

// =============================================
// GET DETAIL FR.AK.01
// =============================================
const getFrAk01 = async (req, res) => {

  try {

    const { id_jadwal, id_peserta } = req.query;

    // =====================================
    // VALIDASI
    // =====================================

    if (!id_jadwal || !id_peserta) {

      return res.status(400).json({

        success: false,

        message: "ID Jadwal dan ID Peserta wajib diisi."

      });

    }

    // =====================================
    // AMBIL DATA
    // =====================================

    const data = await FrAk01.findOne({

      where: {
        id_jadwal,
        id_peserta
      },

      include: [

        {
          model: PesertaJadwal,
          as: "peserta"
        }

      ]

    });

    // =====================================
    // TIDAK DITEMUKAN
    // =====================================

    if (!data) {

      return res.status(404).json({

        success: false,

        message: "FR.AK.01 tidak ditemukan."

      });

    }

    return res.status(200).json({

      success: true,

      message: "Data FR.AK.01 berhasil diambil.",

      data

    });

  } catch (err) {

    console.error("Get FR.AK.01 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};



// ✅ 3. UPDATE FR.AK.01
// =============================================
// UPDATE FR.AK.01
// =============================================
const updateFrAk01 = async (req, res) => {

  try {

    const { id } = req.params;

    const {

      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      bukti_lainnya,
      persetujuan,
      ttd_asesor

    } = req.body;

    // ===============================
    // CEK DATA
    // ===============================

    const existing = await FrAk01.findByPk(id);

    if (!existing) {

      return res.status(404).json({

        success: false,

        message: "Data FR.AK.01 tidak ditemukan."

      });

    }

    // ===============================
    // UPDATE
    // ===============================

    await existing.update({

      bukti_portofolio:
        bukti_portofolio !== undefined
          ? Boolean(bukti_portofolio)
          : existing.bukti_portofolio,

      bukti_observasi:
        bukti_observasi !== undefined
          ? Boolean(bukti_observasi)
          : existing.bukti_observasi,

      bukti_tertulis:
        bukti_tertulis !== undefined
          ? Boolean(bukti_tertulis)
          : existing.bukti_tertulis,

      bukti_wawancara:
        bukti_wawancara !== undefined
          ? Boolean(bukti_wawancara)
          : existing.bukti_wawancara,

      bukti_review_produk:
        bukti_review_produk !== undefined
          ? Boolean(bukti_review_produk)
          : existing.bukti_review_produk,

      bukti_kegiatan_terstruktur:
        bukti_kegiatan_terstruktur !== undefined
          ? Boolean(bukti_kegiatan_terstruktur)
          : existing.bukti_kegiatan_terstruktur,

      bukti_lisan:
        bukti_lisan !== undefined
          ? Boolean(bukti_lisan)
          : existing.bukti_lisan,

      bukti_lainnya:
        bukti_lainnya !== undefined
          ? bukti_lainnya
          : existing.bukti_lainnya,

      persetujuan:
        persetujuan !== undefined
          ? Boolean(persetujuan)
          : existing.persetujuan,

      ttd_asesor:
        ttd_asesor || existing.ttd_asesor

    });

    return res.status(200).json({

      success: true,

      message: "FR.AK.01 berhasil diperbarui.",

      data: existing

    });

  } catch (err) {

    console.error("Update FR.AK.01 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};



// ✅ 4. LIST FR.AK.01 PER JADWAL
// =============================================
// LIST FR.AK.01 PER JADWAL
// =============================================
const listFrAk01 = async (req, res) => {

  try {

    const { id_jadwal } = req.params;

    // ===============================
    // VALIDASI
    // ===============================

    if (!id_jadwal) {

      return res.status(400).json({

        success: false,

        message: "ID Jadwal wajib diisi."

      });

    }

    // ===============================
    // AMBIL DATA
    // ===============================

    const data = await FrAk01.findAll({

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
        ["created_at", "DESC"]
      ]

    });

    return res.status(200).json({

      success: true,

      total: data.length,

      message: "Daftar FR.AK.01 berhasil diambil.",

      data

    });

  } catch (err) {

    console.error("List FR.AK.01 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

// =============================================
// DOWNLOAD PDF FR.AK.01
// =============================================
const downloadPdfFrAk01 = async (req, res) => {

  try {

    const { id } = req.params;

    const data = await FrAk01.findByPk(id, {

      include: [

        {
          model: PesertaJadwal,
          as: "peserta"
        }

      ]

    });

    if (!data) {

      return res.status(404).json({

        success: false,

        message: "FR.AK.01 tidak ditemukan."

      });

    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK01-${data.id_fr_ak01}.pdf`
    );

    const doc = new PDFDocument({

      size: "A4",
      margin: 40

    });

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("FR.AK.01", {
        align: "center"
      });

    doc
      .fontSize(14)
      .text("PERSETUJUAN ASESMEN DAN KERAHASIAAN", {
        align: "center"
      });

    doc.moveDown();

    doc.font("Helvetica");

    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`ID Peserta : ${data.id_peserta}`);
    doc.text(`ID Asesor : ${data.id_asesor}`);

    doc.moveDown();

    // =========================
    // CHECKLIST
    // =========================

    const list = [

      ["Portofolio", data.bukti_portofolio],

      ["Observasi", data.bukti_observasi],

      ["Pertanyaan Tertulis", data.bukti_tertulis],

      ["Wawancara", data.bukti_wawancara],

      ["Review Produk", data.bukti_review_produk],

      [
        "Kegiatan Terstruktur",
        data.bukti_kegiatan_terstruktur
      ],

      ["Pertanyaan Lisan", data.bukti_lisan]

    ];

    list.forEach(item => {

      doc.text(
        `${item[1] ? "☑" : "☐"} ${item[0]}`
      );

    });

    doc.moveDown();

    doc.text(
      `Lainnya : ${data.bukti_lainnya || "-"}`
    );

    doc.moveDown(2);

    doc.text(
      `Persetujuan : ${data.persetujuan ? "YA" : "TIDAK"}`
    );

    doc.moveDown(2);

    doc.text(
      "Tanda Tangan Asesor"
    );

    doc.moveDown();

    if (
      data.ttd_asesor &&
      data.ttd_asesor.startsWith("data:image")
    ) {

      const base64 = data.ttd_asesor.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

      const img = Buffer.from(
        base64,
        "base64"
      );

      doc.image(
        img,
        {
          width: 180
        }
      );

    } else {

      doc.text("-");

    }

    doc.end();

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};


module.exports = {
  submitFrAk01,
  getFrAk01,
  updateFrAk01,
  listFrAk01,
  downloadPdfFrAk01
};