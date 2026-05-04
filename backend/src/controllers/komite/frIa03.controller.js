const FrIa03 = require("../../models/frIa03.model");
const FrIa03Pertanyaan = require("../../models/frIa03Pertanyaan.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const PDFDocument = require("pdfkit");

// ===============================
// CREATE HEADER (OPTIONAL)
// ===============================
exports.createHeader = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal
    } = req.body;

    // Validasi data inputan
    if (!id_jadwal || !id_skema || !id_tuk || !id_asesor || !id_asesi || !tanggal) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // Membuat header FR.IA.03
    const data = await FrIa03.create({
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal
    });

    res.status(201).json({ message: "Header FR.IA.03 berhasil dibuat", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat header FR.IA.03", error: err.message });
  }
};


// ===============================
// CREATE PERTANYAAN
// ===============================
exports.createPertanyaan = async (req, res) => {
  try {
    const { id_fr_ia_03, id_unit, pertanyaan, urutan } = req.body;

    // Validasi data inputan
    if (!id_fr_ia_03 || !id_unit || !pertanyaan || !urutan) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const data = await FrIa03Pertanyaan.create({
      id_fr_ia_03,
      id_unit,
      pertanyaan,
      urutan
    });

    res.status(201).json({ message: "Pertanyaan berhasil dibuat", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat pertanyaan", error: err.message });
  }
};


// ===============================
// UPDATE PERTANYAAN
// ===============================
exports.updatePertanyaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { pertanyaan } = req.body;

    // Validasi inputan
    if (!pertanyaan) {
      return res.status(400).json({ message: "Pertanyaan tidak boleh kosong" });
    }

    // Update pertanyaan berdasarkan ID
    const updated = await FrIa03Pertanyaan.update(
      { pertanyaan },
      { where: { id_pertanyaan: id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }

    res.json({ message: "Pertanyaan berhasil diupdate" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate pertanyaan", error: err.message });
  }
};


// ===============================
// DELETE PERTANYAAN
// ===============================
exports.deletePertanyaan = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus pertanyaan berdasarkan ID
    const deleted = await FrIa03Pertanyaan.destroy({
      where: { id_pertanyaan: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }

    res.json({ message: "Pertanyaan berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus pertanyaan", error: err.message });
  }
};


// ===============================
// GET PERTANYAAN (UNTUK EDIT)
// ===============================
exports.getByFr = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa03.findOne({
      where: { id_fr_ia_03: id },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            { model: UnitKompetensi, as: "unit" }
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data FR.IA.03 tidak ditemukan" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mendapatkan pertanyaan", error: err.message });
  }
};


// ===============================
// DOWNLOAD PDF
// ===============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa03.findOne({
      where: { id_fr_ia_03: id },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            { model: UnitKompetensi, as: "unit" }
          ]
        },
        { model: Skema, as: "skema" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data FR.IA.03 tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-IA-03-Komite-${id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(14).text("FR.IA.03 (KOMITE)", { align: "center" });
    doc.text("PERTANYAAN OBSERVASI", { align: "center" });

    doc.moveDown();
    doc.text(`Skema: ${data?.skema?.judul_skema || "-"}`);

    doc.moveDown();

    let no = 1;

    // Menambahkan pertanyaan
    for (const p of data.pertanyaan) {
      doc.moveDown();
      doc.text(`${no}. ${p.pertanyaan}`);

      if (p.unit) {
        doc.text(`Unit: ${p.unit.kode_unit}`);
      }

      no++;
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mendownload PDF", error: err.message });
  }
};