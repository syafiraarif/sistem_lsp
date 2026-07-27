// ===============================
// CONTROLLER ASESOR (FR.IA.03)
// ===============================
const FrIa03 = require("../../models/frIa03.model");
const FrIa03Pertanyaan = require("../../models/frIa03Pertanyaan.model");
const FrIa03Jawaban = require("../../models/frIa03Jawaban.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const PDFDocument = require("pdfkit");


// ===============================
// GET FULL DATA (UNTUK FORM)
// ===============================
exports.getForm = async (req, res) => {
  try {
    const { id } = req.params;

const data = await FrIa03.findByPk(id, {
    include: [
        {
            model: FrIa03Pertanyaan,
            as: "pertanyaan",
            include: [
                {
                    model: UnitKompetensi,
                    as: "unit"
                },
                {
                    model: FrIa03Jawaban,
                    as: "jawaban"
                }
            ]
        },
        { model: ProfileAsesor, as: "asesor" },
        { model: ProfileAsesi, as: "asesi" },
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" }
    ]
});

    if (!data) {
      return res.status(404).json({ message: "Data FR.IA.03 tidak ditemukan" });
    }

    res.json(data);

  } catch (err) {
    console.error("Error in getForm:", err);
    res.status(500).json({ message: "Gagal mengambil data FR.IA.03", error: err.message });
  }
};


// ===============================
// SAVE / UPDATE JAWABAN
// ===============================
exports.saveJawaban = async (req, res) => {
  try {
    const { id_pertanyaan, tanggapan, rekomendasi, umpan_balik, ttd_asesor } = req.body;

    // Cek apakah pertanyaan sudah ada di database
    const existing = await FrIa03Jawaban.findOne({
      where: { id_pertanyaan }
    });

    if (existing) {
      // Jika jawaban sudah ada, update jawaban yang ada
      await FrIa03Jawaban.update({
        tanggapan,
        rekomendasi,
        umpan_balik,
        ttd_asesor
      }, {
        where: { id_pertanyaan }
      });

      return res.json({ message: "Jawaban berhasil diperbarui" });
    }

    // Jika jawaban belum ada, buat jawaban baru
    const data = await FrIa03Jawaban.create({
      id_pertanyaan,
      tanggapan,
      rekomendasi,
      umpan_balik,
      ttd_asesor
    });

    res.status(201).json({ message: "Jawaban berhasil disimpan", data });

  } catch (err) {
    console.error("Error in saveJawaban:", err);
    res.status(500).json({ message: "Gagal menyimpan jawaban", error: err.message });
  }
};


// ===============================
// DOWNLOAD PDF
// ===============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa03.findByPk(id, {
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: FrIa03Jawaban,
              as: "jawaban"
            }
          ]
        },
        { model: ProfileAsesor, as: "asesor" },
        { model: ProfileAsesi, as: "asesi" },
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data FR.IA.03 tidak ditemukan" });
    }

    // Membuat dokumen PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-IA-03-${id}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc.fontSize(14).text("FR.IA.03", { align: "center" });
    doc.text("PERTANYAAN UNTUK MENDUKUNG OBSERVASI", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Skema : ${data?.skema?.judul_skema || "-"}`);
    doc.text(`Asesor : ${data?.asesor?.nama_lengkap || "-"}`);
    doc.text(`Asesi : ${data?.asesi?.nama_lengkap || "-"}`);
    doc.text(`Tanggal : ${data?.tanggal || "-"}`);

    doc.moveDown();

    // ================= PERTANYAAN =================
    let no = 1;

    for (const p of data.pertanyaan) {
      doc.moveDown();
      doc.font("Helvetica-Bold").text(`${no}. ${p.pertanyaan}`);
      doc.font("Helvetica");

      if (p.unit) {
        doc.text(`Unit: ${p.unit.kode_unit} - ${p.unit.judul_unit}`);
      }

      doc.moveDown(0.5);

      // JAWABAN
      doc.text(`Tanggapan: ${p.jawaban?.tanggapan || "-"}`);
      doc.text(`Rekomendasi: ${p.jawaban?.rekomendasi || "-"}`);

      doc.moveDown();

      no++;
    }

    // ================= UMPAN BALIK =================
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Umpan Balik Asesi:");
    doc.font("Helvetica").text(
      data.pertanyaan[0]?.jawaban?.umpan_balik || "-"
    );

    doc.moveDown();

    // ================= TTD =================
    doc.text("Tanda Tangan Asesor:");

    if (data.asesor?.ttd_path) {
      try {
        doc.image(data.asesor.ttd_path, {
          width: 100
        });
      } catch (e) {
        doc.text("(TTD tidak ditemukan)");
      }
    }

    doc.end();

  } catch (err) {
    console.error("Error in downloadPdf:", err);
    res.status(500).json({ message: "Gagal mendownload PDF", error: err.message });
  }
};