const FrAk03 = require("../../models/frAk03.model");
const FrAk03Detail = require("../../models/frAk03Detail.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");

const PDFDocument = require("pdfkit");


// ===============================
// CREATE / SIMPAN FR.AK.03
// ===============================
exports.createFrAk03 = async (req, res) => {
  try {
    const {
      id_peserta,
      id_jadwal,
      id_skema,
      id_tuk,
      tanggal_asesmen,
      catatan_lainnya,
      jawaban // array
    } = req.body;

    // 🔍 cek sudah pernah isi atau belum
    const existing = await FrAk03.findOne({ where: { id_peserta } });
    if (existing) {
      return res.status(400).json({
        message: "FR.AK.03 sudah pernah diisi"
      });
    }

    // 🧾 buat header
    const fr = await FrAk03.create({
      id_peserta,
      id_jadwal,
      id_skema,
      id_tuk,
      tanggal_asesmen,
      catatan_lainnya
    });

    // 🧾 insert detail
    const detailData = jawaban.map((item, index) => ({
      id_fr_ak03: fr.id_fr_ak03,
      kode_pertanyaan: `Q${index + 1}`,
      pertanyaan: item.pertanyaan,
      jawaban: item.jawaban,
      catatan: item.catatan || null
    }));

    await FrAk03Detail.bulkCreate(detailData);

    res.json({
      message: "FR.AK.03 berhasil disimpan",
      data: fr
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menyimpan FR.AK.03",
      error: error.message
    });
  }
};



// ===============================
// GET DETAIL FR.AK.03
// ===============================
exports.getFrAk03ByPeserta = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await FrAk03.findOne({
      where: { id_peserta },
      include: [
        {
          model: FrAk03Detail
        },
        {
          model: PesertaJadwal,
          include: [
            {
              model: ProfileAsesi
            }
          ]
        },
        {
          model: Jadwal,
          include: [Skema, Tuk]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        message: "Data FR.AK.03 tidak ditemukan"
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
// GENERATE PDF
// ===============================
exports.generatePdfFrAk03 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await FrAk03.findOne({
      where: { id_peserta },
      include: [
        { model: FrAk03Detail },
        {
          model: PesertaJadwal,
          include: [{ model: ProfileAsesi }]
        },
        {
          model: Jadwal,
          include: [Skema, Tuk]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        message: "Data tidak ditemukan"
      });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=FR_AK03.pdf"
    );

    doc.pipe(res);

    // ===============================
    // HEADER
    // ===============================
    doc.fontSize(14).text("FR.AK.03. UMPAN BALIK DAN CATATAN ASESMEN", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(10).text(`Nama Asesi: ${data.peserta_jadwal.profile_asesi.nama_lengkap}`);
    doc.text(`Tanggal Asesmen: ${data.tanggal_asesmen}`);
    doc.text(`Skema: ${data.jadwal.skema.judul_skema}`);
    doc.text(`TUK: ${data.jadwal.tuk.nama_tuk}`);

    doc.moveDown();

    // ===============================
    // TABLE HEADER
    // ===============================
    doc.fontSize(10).text("No | Pertanyaan | Ya | Tidak | Catatan");
    doc.moveDown(0.5);

    // ===============================
    // ISI
    // ===============================
    data.fr_ak03_details.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.pertanyaan}`
      );
      doc.text(`Jawaban: ${item.jawaban.toUpperCase()}`);
      doc.text(`Catatan: ${item.catatan || "-"}`);
      doc.moveDown();
    });

    // ===============================
    // CATATAN LAINNYA
    // ===============================
    doc.moveDown();
    doc.text("Catatan Lainnya:");
    doc.text(data.catatan_lainnya || "-");

    doc.end();

  } catch (error) {
    res.status(500).json({
      message: "Gagal generate PDF",
      error: error.message
    });
  }
};