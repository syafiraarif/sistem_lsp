const FrIa04b = require("../../models/frIa04b.model");
const FrIa04bDetail = require("../../models/frIa04bDetail.model");
const JadwalAsesor = require("../../models/jadwalAsesor.model");
const PDFDocument = require("pdfkit");
const fs = require("fs");


// ===============================
// VALIDASI ASESOR PENGUJI
// ===============================
const isAsesor = async (id_jadwal, id_user) => {
  const data = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      id_user,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    }
  });
  return !!data;
};


// ===============================
// GET FORM (ASESOR)
// ===============================
exports.getForm = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa04b.findByPk(id, {
      include: [
        {
          model: FrIa04bDetail,
          as: "detail"
        }
      ]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// INPUT ASESOR (TANGGAPAN)
// ===============================
exports.saveAsesor = async (req, res) => {
  try {
    const { id_detail, tanggapan, pencapaian } = req.body;

    await FrIa04bDetail.update(
      { tanggapan, pencapaian },
      { where: { id_detail } }
    );

    res.json({ success: true, message: "Penilaian tersimpan" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// FINAL SUBMIT (REKOMENDASI + TTD)
// ===============================
exports.submit = async (req, res) => {
  try {
    const { id, rekomendasi, ttd } = req.body;

    await FrIa04b.update(
      {
        rekomendasi,
        ttd_asesor: ttd
      },
      { where: { id_fr_ia_04b: id } }
    );

    res.json({ success: true, message: "Submit berhasil" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// DOWNLOAD PDF FR.IA.04B
// ===============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa04b.findByPk(id, {
      include: [
        {
          model: FrIa04bDetail,
          as: "detail"
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-IA-04B-${id}.pdf`
    );

    doc.pipe(res);

    // ===============================
    // HEADER
    // ===============================
    doc.fontSize(14).text("FR.IA.04B", { align: "center" });
    doc.text("PENILAIAN PROYEK / KEGIATAN TERSTRUKTUR", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`ID Peserta : ${data.id_peserta}`);
    doc.text(`Tanggal : ${data.created_at}`);
    doc.moveDown();

    // ===============================
    // DETAIL LOOP
    // ===============================
    let no = 1;

    for (const d of data.detail) {
      doc.moveDown();

      doc.font("Helvetica-Bold")
        .text(`Aspek ${no}`);
      doc.font("Helvetica");

      doc.text(`Lingkup: ${d.lingkup || "-"}`);
      doc.text(`Pertanyaan: ${d.pertanyaan || "-"}`);
      doc.text(`Kesesuaian: ${d.kesesuaian || "-"}`);
      doc.text(`Tanggapan: ${d.tanggapan || "-"}`);
      doc.text(`Pencapaian: ${d.pencapaian || "-"}`);

      no++;
    }

    // ===============================
    // REKOMENDASI
    // ===============================
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Rekomendasi:");
    doc.font("Helvetica").text(data.rekomendasi || "-");

    // ===============================
    // TTD
    // ===============================
    if (data.ttd_asesor) {
      try {
        const base64Data = data.ttd_asesor.replace(/^data:image\/png;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, "base64");

        doc.moveDown();
        doc.text("Tanda Tangan:");
        doc.image(imgBuffer, {
          fit: [150, 100]
        });

      } catch (err) {
        doc.text("TTD gagal ditampilkan");
      }
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal generate PDF", error: err.message });
  }
};