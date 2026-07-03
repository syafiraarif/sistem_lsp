const PDFDocument = require("pdfkit");
const fs = require("fs");

const {
  FrAk05,
  PresensiAsesor,
  JadwalAsesor,
  PesertaJadwal,
  ProfileAsesor,
  ProfileAsesi,
  Jadwal,
  Skema,
  Tuk
} = require("../../models");


// ==========================
// SUBMIT FR.AK.05
// ==========================
exports.submitFrAk05 = async (req, res) => {

  const transaction = await FrAk05.sequelize.transaction();

  try {

    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      id_peserta,
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;

    // ================= VALIDASI =================

    if (!id_jadwal) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    if (!id_peserta) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "ID Peserta wajib diisi."
      });
    }

    if (!rekomendasi) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Rekomendasi wajib dipilih."
      });
    }

    if (!ttd_asesor) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanda tangan asesor wajib diisi."
      });
    }

    // ================= CEK PRESENSI =================

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      },
      transaction
    });

    if (!presensi) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Harap melakukan presensi terlebih dahulu."
      });
    }

    // ================= CEK TUGAS ASESOR =================

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      },
      transaction
    });

    if (!tugas) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Anda tidak bertugas pada jadwal ini."
      });
    }

    // ================= CEK PESERTA =================

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal
      },
      transaction
    });

    if (!peserta) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan pada jadwal ini."
      });
    }

    // ================= CEK DUPLIKAT =================

    const existing = await FrAk05.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      transaction
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "FR.AK.05 sudah pernah dibuat untuk peserta ini."
      });
    }

    // ================= SIMPAN =================

    const data = await FrAk05.create({
      id_jadwal,
      id_peserta,
      id_asesor,
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    }, {
      transaction
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "FR.AK.05 berhasil disimpan.",
      data
    });

  } catch (err) {

    await transaction.rollback();

    console.error("SUBMIT FR.AK.05 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ==========================
// UPDATE FR.AK.05
// ==========================
exports.updateFrAk05 = async (req, res) => {

  const transaction = await FrAk05.sequelize.transaction();

  try {

    const { id } = req.params;
    const id_asesor = req.user.id_user;

    const {
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;

    // ================= CEK DATA =================

    const data = await FrAk05.findOne({
      where: {
        id,
        id_asesor
      },
      transaction
    });

    if (!data) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "FR.AK.05 tidak ditemukan."
      });

    }

    // ================= UPDATE =================

    await data.update(
      {
        rekomendasi:
          rekomendasi ?? data.rekomendasi,

        keterangan:
          keterangan ?? data.keterangan,

        aspek_positif_negatif:
          aspek_positif_negatif ?? data.aspek_positif_negatif,

        penolakan_hasil:
          penolakan_hasil ?? data.penolakan_hasil,

        saran_perbaikan:
          saran_perbaikan ?? data.saran_perbaikan,

        catatan:
          catatan ?? data.catatan,

        ttd_asesor:
          ttd_asesor ?? data.ttd_asesor,

        updated_at: new Date()
      },
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "FR.AK.05 berhasil diperbarui.",
      data
    });

  } catch (err) {

    await transaction.rollback();

    console.error("UPDATE FR.AK.05 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==========================
// DOWNLOAD PDF FR.AK.05
// ==========================
exports.downloadPdfFrAk05 = async (req, res) => {
  try {

    const { id } = req.params;
    const id_asesor = req.user.id_user;

    const data = await FrAk05.findOne({
      where: {
        id,
        id_asesor
      },
      include: [
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
          model: ProfileAsesor,
          as: "asesor"
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
        message: "FR.AK.05 tidak ditemukan."
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK05-${id}.pdf`
    );

    doc.pipe(res);

    // ==================================
    // HEADER
    // ==================================

    doc
      .fontSize(16)
      .text("FR.AK.05", {
        align: "center"
      });

    doc
      .fontSize(13)
      .text("LAPORAN ASESMEN", {
        align: "center"
      });

    doc.moveDown();

    // ==================================
    // INFORMASI
    // ==================================

    doc.fontSize(11);

    doc.text(`Judul Skema : ${data.jadwal?.skema?.judul_skema || "-"}`);
    doc.text(`Kode Skema  : ${data.jadwal?.skema?.kode_skema || "-"}`);
    doc.text(`TUK         : ${data.jadwal?.tuk?.nama_tuk || "-"}`);
    doc.text(`Nama Asesor : ${data.asesor?.nama_lengkap || "-"}`);
    doc.text(
      `Tanggal     : ${
        data.created_at
          ? new Date(data.created_at).toLocaleDateString("id-ID")
          : "-"
      }`
    );

    doc.moveDown();

    // ==================================
    // HASIL ASESMEN
    // ==================================

    doc.fontSize(12).text("Hasil Asesmen", {
      underline: true
    });

    doc.moveDown(0.5);

    doc.text(`Nama Asesi : ${data.peserta?.profileAsesi?.nama_lengkap || "-"}`);

    doc.text(
      `Rekomendasi : ${
        data.rekomendasi === "kompeten"
          ? "☑ Kompeten"
          : "☑ Belum Kompeten"
      }`
    );

    doc.text(`Keterangan : ${data.keterangan || "-"}`);

    doc.moveDown();

    // ==================================
    // ASPEK
    // ==================================

    doc.fontSize(12).text("Aspek Positif dan Negatif", {
      underline: true
    });

    doc.moveDown(0.3);

    doc.fontSize(11).text(
      data.aspek_positif_negatif || "-"
    );

    doc.moveDown();

    // ==================================
    // PENOLAKAN
    // ==================================

    doc.fontSize(12).text("Pencatatan Penolakan Hasil", {
      underline: true
    });

    doc.moveDown(0.3);

    doc.fontSize(11).text(
      data.penolakan_hasil || "-"
    );

    doc.moveDown();

    // ==================================
    // SARAN
    // ==================================

    doc.fontSize(12).text("Saran Perbaikan", {
      underline: true
    });

    doc.moveDown(0.3);

    doc.fontSize(11).text(
      data.saran_perbaikan || "-"
    );

    doc.moveDown();

    // ==================================
    // CATATAN
    // ==================================

    doc.fontSize(12).text("Catatan", {
      underline: true
    });

    doc.moveDown(0.3);

    doc.fontSize(11).text(
      data.catatan || "-"
    );

    doc.moveDown(2);

    // ==================================
    // ASESOR
    // ==================================

    doc.fontSize(12).text("Asesor");

    doc.moveDown(0.3);

    doc.fontSize(11);

    doc.text(`Nama : ${data.asesor?.nama_lengkap || "-"}`);

    doc.text(
      `No. Registrasi : ${data.asesor?.no_reg_asesor || "-"}`
    );

    doc.moveDown();

    doc.text("Tanda Tangan :");

    if (data.ttd_asesor && fs.existsSync(data.ttd_asesor)) {

      doc.image(data.ttd_asesor, {
        width: 120
      });

    } else {

      doc.text("(TTD tidak tersedia)");

    }

    doc.moveDown();

    doc.text(
      `Tanggal : ${
        data.created_at
          ? new Date(data.created_at).toLocaleDateString("id-ID")
          : "-"
      }`
    );

    doc.end();

  } catch (err) {

    console.error("DOWNLOAD PDF FR.AK.05 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ==========================
// GET DETAIL FR.AK.05
// ==========================
exports.getFrAk05 = async (req, res) => {
  try {

    const id_asesor = req.user.id_user;
    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID Peserta wajib diisi."
      });
    }

    const data = await FrAk05.findOne({
      where: {
        id_jadwal,
        id_peserta,
        id_asesor
      },
      include: [
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
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
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
        message: "FR.AK.05 belum dibuat."
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {

    console.error("GET FR.AK.05 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};


// ==========================
// LIST FR.AK.05
// ==========================
exports.listFrAk05 = async (req, res) => {
  try {

    const id_asesor = req.user.id_user;
    const { id_jadwal } = req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    const data = await FrAk05.findAll({
      where: {
        id_jadwal,
        id_asesor
      },
      include: [
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
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "no_reg_asesor"
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
      ],
      order: [
        ["created_at", "DESC"]
      ]
    });

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {

    console.error("LIST FR.AK.05 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

