// controllers/komite/frIa04a.controller.js

const FrIa04a = require("../../models/frIa04a.model");
const FrIa04aDetail = require("../../models/frIa04aDetail.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");
const JadwalAsesor = require("../../models/jadwalAsesor.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const PDFDocument = require("pdfkit");


// ===============================
// VALIDASI KOMITE TEKNIS
// ===============================
const isKomite = async (id_jadwal, id_user) => {
  const data = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      id_user,
      jenis_tugas: "komite_teknis",
      status: "aktif"
    }
  });

  return !!data;
};



// ===============================
// CREATE / GET HEADER
// ===============================
exports.createOrGet = async (req, res) => {
  try {
    const { id_jadwal, id_skema, id_tuk, tanggal } = req.body;
    const id_user = req.user.id_user;

    // validasi komite teknis
    const valid = await isKomite(id_jadwal, id_user);
    if (!valid) {
      return res.status(403).json({ message: "Bukan komite teknis" });
    }

    let data = await FrIa04a.findOne({
      where: { id_jadwal, id_asesor: id_user }
    });

    if (!data) {
      data = await FrIa04a.create({
        id_jadwal,
        id_skema,
        id_tuk,
        id_asesor: id_user,
        tanggal
      });
    }

    res.json({ message: "OK", data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat/mengambil data", error: err.message });
  }
};



// ===============================
// GET FULL DATA (FORM)
// ===============================
exports.getForm = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa04a.findOne({
      where: { id_fr_ia_04a: id },
      include: [
        {
          model: FrIa04aDetail,
          as: "detail",
          include: [
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            }
          ]
        },
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil data", error: err.message });
  }
};



// ===============================
// SAVE / UPDATE DETAIL (S T A R)
// ===============================
exports.saveDetail = async (req, res) => {
  try {
    const {
      id_fr_ia_04a,
      id_kelompok,
      situation,
      task,
      action,
      result,
      demonstrasi
    } = req.body;

    const existing = await FrIa04aDetail.findOne({
      where: { id_fr_ia_04a, id_kelompok }
    });

    if (existing) {
      await FrIa04aDetail.update(
        { situation, task, action, result, demonstrasi },
        { where: { id_fr_ia_04a, id_kelompok } }
      );

      return res.json({ message: "Berhasil update" });
    }

    const data = await FrIa04aDetail.create({
      id_fr_ia_04a,
      id_kelompok,
      situation,
      task,
      action,
      result,
      demonstrasi
    });

    res.status(201).json({ message: "Berhasil simpan", data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal simpan detail", error: err.message });
  }
};



// ===============================
// DOWNLOAD PDF
// ===============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa04a.findOne({
      where: { id_fr_ia_04a: id },
      include: [
        {
          model: FrIa04aDetail,
          as: "detail",
          include: [
            { model: KelompokPekerjaan, as: "kelompok" }
          ]
        },
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-IA-04A-${id}.pdf`
    );

    doc.pipe(res);

    // HEADER
    doc.fontSize(14).text("FR.IA.04A", { align: "center" });
    doc.text("DAFTAR INSTRUKSI TERSTRUKTUR", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Skema : ${data?.skema?.judul_skema || "-"}`);
    doc.text(`TUK : ${data?.tuk?.nama_tuk || "-"}`);
    doc.text(`Tanggal : ${data?.tanggal || "-"}`);

    doc.moveDown();

    // LOOP KELOMPOK
    let no = 1;

    for (const d of data.detail) {
      doc.moveDown();
      doc.font("Helvetica-Bold").text(`${no}. ${d.kelompok?.nama_kelompok || "-"}`);
      doc.font("Helvetica");

      doc.text(`SITUATION: ${d.situation || "-"}`);
      doc.text(`TASK: ${d.task || "-"}`);
      doc.text(`ACTION: ${d.action || "-"}`);
      doc.text(`RESULT: ${d.result || "-"}`);
      doc.text(`DEMONSTRASI: ${d.demonstrasi || "-"}`);

      no++;
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal generate PDF", error: err.message });
  }
};