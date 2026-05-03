const { FrAk07, FrAk07DetailA, FrAk07DetailB, FrAk07Hasil } = require("../../models");
const PDFDocument = require('pdfkit');
const path = require('path');

// Get FR.AK.07 details by ID
const getFrAk07 = async (req, res) => {
  try {
    const { id } = req.query;

    // Fetch the FR.AK.07 record, along with its related details
    const frAk07 = await FrAk07.findOne({
      where: { id_fr_ak07: id },
      include: [
        {
          model: FrAk07DetailA,
          as: "detailsA",
          attributes: ["nomor", "aspek", "butuh_penyesuaian", "keterangan"],
        },
        {
          model: FrAk07DetailB,
          as: "detailsB",
          attributes: [
            "nomor",
            "pertanyaan",
            "jawaban",
            "standar_industri",
            "sop",
            "regulasi_teknik",
            "metode_asesmen",
            "instrumen_asesmen",
          ],
        },
        {
          model: FrAk07Hasil,
          as: "results",
          attributes: [
            "bagian",
            "acuan_pembanding",
            "metode_asesmen",
            "instrumen_asesmen",
          ],
        },
      ],
    });

    if (!frAk07) {
      return res.status(404).json({ message: "FR.AK.07 record not found." });
    }

    res.status(200).json({ data: frAk07 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching FR.AK.07 record." });
  }
};

// Submit FR.AK.07
const submitFrAk07 = async (req, res) => {
  try {
    const { id_jadwal, id_asesor, id_asesi, potensi_asesi, ttd_asesor, detailsA, detailsB, results } = req.body;

    // Create a new FR.AK.07 record
    const frAk07 = await FrAk07.create({
      id_jadwal,
      id_asesor,
      id_asesi,
      potensi_asesi,
      ttd_asesor,
    });

    // Create associated detailsA
    for (const detailA of detailsA) {
      await FrAk07DetailA.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        nomor: detailA.nomor,
        aspek: detailA.aspek,
        butuh_penyesuaian: detailA.butuh_penyesuaian,
        keterangan: detailA.keterangan,
      });
    }

    // Create associated detailsB
    for (const detailB of detailsB) {
      await FrAk07DetailB.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        nomor: detailB.nomor,
        pertanyaan: detailB.pertanyaan,
        jawaban: detailB.jawaban,
        standar_industri: detailB.standar_industri,
        sop: detailB.sop,
        regulasi_teknik: detailB.regulasi_teknik,
        metode_asesmen: detailB.metode_asesmen,
        instrumen_asesmen: detailB.instrumen_asesmen,
      });
    }

    // Create associated results
    for (const result of results) {
      await FrAk07Hasil.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        bagian: result.bagian,
        acuan_pembanding: result.acuan_pembanding,
        metode_asesmen: result.metode_asesmen,
        instrumen_asesmen: result.instrumen_asesmen,
      });
    }

    res.status(201).json({ message: "FR.AK.07 submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting FR.AK.07 record." });
  }
};

// Update FR.AK.07 by ID
const updateFrAk07 = async (req, res) => {
  try {
    const { id } = req.params;
    const { potensi_asesi, ttd_asesor, detailsA, detailsB, results } = req.body;

    const frAk07 = await FrAk07.findByPk(id);

    if (!frAk07) {
      return res.status(404).json({ message: "FR.AK.07 record not found." });
    }

    // Update the main FR.AK.07 record
    frAk07.potensi_asesi = potensi_asesi;
    frAk07.ttd_asesor = ttd_asesor;
    await frAk07.save();

    // Update associated detailsA
    await FrAk07DetailA.destroy({ where: { id_fr_ak07: frAk07.id_fr_ak07 } });
    for (const detailA of detailsA) {
      await FrAk07DetailA.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        nomor: detailA.nomor,
        aspek: detailA.aspek,
        butuh_penyesuaian: detailA.butuh_penyesuaian,
        keterangan: detailA.keterangan,
      });
    }

    // Update associated detailsB
    await FrAk07DetailB.destroy({ where: { id_fr_ak07: frAk07.id_fr_ak07 } });
    for (const detailB of detailsB) {
      await FrAk07DetailB.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        nomor: detailB.nomor,
        pertanyaan: detailB.pertanyaan,
        jawaban: detailB.jawaban,
        standar_industri: detailB.standar_industri,
        sop: detailB.sop,
        regulasi_teknik: detailB.regulasi_teknik,
        metode_asesmen: detailB.metode_asesmen,
        instrumen_asesmen: detailB.instrumen_asesmen,
      });
    }

    // Update associated results
    await FrAk07Hasil.destroy({ where: { id_fr_ak07: frAk07.id_fr_ak07 } });
    for (const result of results) {
      await FrAk07Hasil.create({
        id_fr_ak07: frAk07.id_fr_ak07,
        bagian: result.bagian,
        acuan_pembanding: result.acuan_pembanding,
        metode_asesmen: result.metode_asesmen,
        instrumen_asesmen: result.instrumen_asesmen,
      });
    }

    res.status(200).json({ message: "FR.AK.07 updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating FR.AK.07 record." });
  }
};

// List FR.AK.07 records by Jadwal ID
const listFrAk07 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const frAk07List = await FrAk07.findAll({
      where: { id_jadwal },
      include: [
        { model: FrAk07DetailA, as: "detailsA" },
        { model: FrAk07DetailB, as: "detailsB" },
        { model: FrAk07Hasil, as: "results" },
      ],
    });

    res.status(200).json({ data: frAk07List });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching FR.AK.07 list." });
  }
};

// Download PDF for FR.AK.07 using pdfkit
const downloadPdfFrAk07 = async (req, res) => {
  try {
    const { id } = req.params;

    const frAk07 = await FrAk07.findOne({
      where: { id_fr_ak07: id },
      include: [
        { model: FrAk07DetailA, as: "detailsA" },
        { model: FrAk07DetailB, as: "detailsB" },
        { model: FrAk07Hasil, as: "results" },
      ],
    });

    if (!frAk07) {
      return res.status(404).json({ message: "FR.AK.07 record not found." });
    }

    // Create the PDF directly in the controller using pdfkit
    const doc = new PDFDocument();

    // Add content to the PDF
    doc.text("FR.AK.07 Report", 10, 10);
    doc.text(`ID FR.AK.07: ${frAk07.id_fr_ak07}`, 10, 20);
    doc.text(`Potensi Asesi: ${frAk07.potensi_asesi}`, 10, 30);

    // Add detailsA
    doc.text("Details A:", 10, 40);
    frAk07.detailsA.forEach((detailA, index) => {
      doc.text(`${index + 1}. ${detailA.aspek}`, 10, 50 + index * 10);
      doc.text(`Need Adjustment: ${detailA.butuh_penyesuaian || 'None'}`, 10, 60 + index * 10);
    });

    // Add detailsB
    doc.text("Details B:", 10, 80);
    frAk07.detailsB.forEach((detailB, index) => {
      doc.text(`${index + 1}. ${detailB.pertanyaan}`, 10, 90 + index * 10);
    });

    // Add Results
    doc.text("Results:", 10, 110);
    frAk07.results.forEach((result, index) => {
      doc.text(`${index + 1}. ${result.bagian}`, 10, 120 + index * 10);
    });

    // Send the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=fr_ak07.pdf");
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating PDF for FR.AK.07." });
  }
};

module.exports = {
  getFrAk07,
  submitFrAk07,
  updateFrAk07,
  listFrAk07,
  downloadPdfFrAk07,
};