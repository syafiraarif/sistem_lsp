const FrAk04 = require("../../models/frAk04.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const ProfileAsesor = require("../../models/profileAsesor.model");

const PDFDocument = require("pdfkit");


// ===============================
// CREATE FR.AK.04
// ===============================
exports.createFrAk04 = async (req, res) => {
  try {
    const {
      id_peserta,
      id_jadwal,
      id_skema,
      id_tuk,
      tanggal_asesmen,
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding,
      ttd_asesi
    } = req.body;

    // 🔍 cek sudah isi atau belum
    const existing = await FrAk04.findOne({
      where: { id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.AK.04 sudah pernah diisi"
      });
    }

    // 🔥 validasi sederhana
    if (
      !proses_banding_dijelaskan ||
      !diskusi_dengan_asesor ||
      !melibatkan_orang_lain ||
      !alasan_banding
    ) {
      return res.status(400).json({
        message: "Semua pertanyaan wajib diisi"
      });
    }

    const data = await FrAk04.create({
      id_peserta,
      id_jadwal,
      id_skema,
      id_tuk,
      tanggal_asesmen,
      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding,
      ttd_asesi
    });

    res.json({
      message: "FR.AK.04 berhasil disimpan",
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menyimpan FR.AK.04",
      error: error.message
    });
  }
};



// ===============================
// GET FR.AK.04 BY PESERTA
// ===============================
exports.getFrAk04ByPeserta = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await FrAk04.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "asesi"
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
        message: "Data FR.AK.04 tidak ditemukan"
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data",
      error: error.message
    });
  }
};



// ===============================
// GENERATE PDF FR.AK.04
// ===============================
exports.generatePdfFrAk04 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await FrAk04.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "asesi"
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
        message: "Data tidak ditemukan"
      });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=FR_AK04.pdf");

    doc.pipe(res);

    // ===============================
    // HEADER
    // ===============================
    doc.fontSize(14).text("FR.AK.04. BANDING ASESMEN", {
      align: "center"
    });

    doc.moveDown();

    const namaAsesi = data.peserta?.asesi?.nama_lengkap || "-";
    const namaSkema = data.jadwal?.skema?.judul_skema || "-";
    const namaTuk = data.jadwal?.tuk?.nama_tuk || "-";

    doc.fontSize(10).text(`Nama Asesi : ${namaAsesi}`);
    doc.text(`Tanggal Asesmen : ${data.tanggal_asesmen}`);
    doc.text(`Skema : ${namaSkema}`);
    doc.text(`TUK : ${namaTuk}`);

    doc.moveDown();

    // ===============================
    // PERTANYAAN
    // ===============================
    doc.text("Jawaban Asesi:");

    doc.moveDown(0.5);

    doc.text(`1. Proses banding dijelaskan : ${data.proses_banding_dijelaskan.toUpperCase()}`);
    doc.text(`2. Diskusi dengan asesor : ${data.diskusi_dengan_asesor.toUpperCase()}`);
    doc.text(`3. Melibatkan orang lain : ${data.melibatkan_orang_lain.toUpperCase()}`);

    doc.moveDown();

    // ===============================
    // ALASAN
    // ===============================
    doc.text("Alasan Banding:");
    doc.text(data.alasan_banding || "-");

    doc.moveDown(2);

    // ===============================
    // TTD
    // ===============================
    doc.text("Tanda Tangan Asesi:");

    if (data.ttd_asesi) {
      try {
        doc.image(data.ttd_asesi, {
          width: 100
        });
      } catch (err) {
        doc.text("(TTD tidak ditemukan)");
      }
    } else {
      doc.text("-");
    }

    doc.end();

  } catch (error) {
    res.status(500).json({
      message: "Gagal generate PDF",
      error: error.message
    });
  }
};