const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const response = require("../../utils/response.util");

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
const submitFrAk05 = async (req, res) => {
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

    if (!id_jadwal || !id_peserta || !rekomendasi || !ttd_asesor) {
      return res.status(400).json({ message: "Data wajib belum lengkap" });
    }

    // cek presensi
    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!presensi) {
      return res.status(403).json({ message: "Harap presensi dulu" });
    }

    // cek tugas
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({ message: "Tidak punya tugas" });
    }

    // cek duplicate
    const exist = await FrAk05.findOne({
      where: { id_jadwal, id_peserta }
    });

    if (exist) {
      return res.status(400).json({ message: "FR.AK.05 sudah ada" });
    }

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
    });

    res.status(201).json({
      message: "FR.AK.05 berhasil disimpan",
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// UPDATE FR.AK.05
// ==========================
const updateFrAk05 = async (req, res) => {
  try {
    const id = req.params.id;
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

    const data = await FrAk05.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // 🔒 hanya asesor yg buat yg boleh update
    if (data.id_asesor !== id_asesor) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    await data.update({
      rekomendasi: rekomendasi ?? data.rekomendasi,
      keterangan: keterangan ?? data.keterangan,
      aspek_positif_negatif: aspek_positif_negatif ?? data.aspek_positif_negatif,
      penolakan_hasil: penolakan_hasil ?? data.penolakan_hasil,
      saran_perbaikan: saran_perbaikan ?? data.saran_perbaikan,
      catatan: catatan ?? data.catatan,
      ttd_asesor: ttd_asesor ?? data.ttd_asesor
    });

    res.status(200).json({
      message: "FR.AK.05 berhasil diupdate",
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// DOWNLOAD PDF
// ==========================
const downloadPdfFrAk05 = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrAk05.findByPk(id, {
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [{ model: ProfileAsesi, as: "asesi" }]
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: Jadwal,
          as: "jadwal",
          include: [
            { model: Skema, as: "skema" },
            { model: Tuk, as: "tuk" }
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK05-${id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc.fontSize(16).text("FR.AK.05 LAPORAN ASESMEN", {
      align: "center"
    });

    doc.moveDown();

    // =========================
    // DATA UTAMA
    // =========================
    doc.fontSize(12);
    doc.text(`Nama Asesi: ${data.peserta?.asesi?.nama_lengkap || "-"}`);
    doc.text(`Nama Asesor: ${data.asesor?.nama_lengkap || "-"}`);
    doc.text(`Skema: ${data.jadwal?.skema?.judul_skema || "-"}`);
    doc.text(`TUK: ${data.jadwal?.tuk?.nama_tuk || "-"}`);

    doc.moveDown();

    // =========================
    // HASIL
    // =========================
    doc.text(`Rekomendasi: ${data.rekomendasi}`);
    doc.text(`Keterangan: ${data.keterangan || "-"}`);

    doc.moveDown();

    doc.text("Aspek Positif & Negatif:");
    doc.text(data.aspek_positif_negatif || "-");

    doc.moveDown();

    doc.text("Penolakan Hasil:");
    doc.text(data.penolakan_hasil || "-");

    doc.moveDown();

    doc.text("Saran Perbaikan:");
    doc.text(data.saran_perbaikan || "-");

    doc.moveDown();

    doc.text("Catatan:");
    doc.text(data.catatan || "-");

    doc.moveDown();

    // =========================
    // TTD
    // =========================
    doc.text("Tanda Tangan Asesor:");

    if (data.ttd_asesor && fs.existsSync(data.ttd_asesor)) {
      doc.image(data.ttd_asesor, {
        width: 150
      });
    } else {
      doc.text("(TTD tidak tersedia)");
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal generate PDF" });
  }
};

// ==========================
// GET DETAIL FR.AK.05
// ==========================
const getFrAk05 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;

    const data = await FrAk05.findOne({
      where: { id_jadwal, id_peserta }
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==========================
// LIST FR.AK.05
// ==========================
const listFrAk05 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrAk05.findAll({
      where: { id_jadwal }
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitFrAk05,
  updateFrAk05,
  downloadPdfFrAk05,
  getFrAk05,
  listFrAk05
};