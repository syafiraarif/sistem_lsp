const {
  FrIa01,
  FrIa01Detail,
  Jadwal,
  PesertaJadwal,
  ProfileAsesor,
  UnitKompetensi,
  UnitElemen,
  UnitKuk
} = require("../../models");

const PDFDocument = require("pdfkit");

exports.create = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_peserta,
      id_asesor,
      umpan_balik,
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor,
      detail
    } = req.body;

    // 🔹 CEK DUPLIKAT (optional tapi penting)
    const existing = await FrIa01.findOne({
      where: { id_jadwal, id_peserta, id_asesor }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.IA.01 sudah pernah dibuat"
      });
    }

    // 🔹 BUAT HEADER
    const header = await FrIa01.create({
      id_jadwal,
      id_peserta,
      id_asesor,
      umpan_balik,
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor
    });

    // 🔹 BUAT DETAIL
    if (detail && detail.length > 0) {
      const dataDetail = detail.map(item => ({
        id_fr_ia_01: header.id_fr_ia_01,
        id_unit: item.id_unit,
        id_elemen: item.id_elemen,
        id_kuk: item.id_kuk,
        standar_industri: item.standar_industri,
        pencapaian: item.pencapaian,
        penilaian_lanjut: item.penilaian_lanjut
      }));

      await FrIa01Detail.bulkCreate(dataDetail);
    }

    return res.json({
      message: "FR.IA.01 berhasil disimpan",
      data: header
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await FrIa01.findByPk(req.params.id, {
      include: [
        {
          model: FrIa01Detail,
          as: "detail",
          include: [
            { model: UnitKompetensi, as: "unit" },
            { model: UnitElemen, as: "elemen" },
            { model: UnitKuk, as: "kuk" }
          ]
        },
        { model: Jadwal, as: "jadwal" },
        { model: PesertaJadwal, as: "peserta" },
        { model: ProfileAsesor, as: "asesor" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      umpan_balik,
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor,
      detail
    } = req.body;

    // 🔹 UPDATE HEADER
    await FrIa01.update({
      umpan_balik,
      rekomendasi,
      catatan_rekomendasi,
      ttd_asesor
    }, {
      where: { id_fr_ia_01: id }
    });

    // 🔹 HAPUS DETAIL LAMA
    await FrIa01Detail.destroy({
      where: { id_fr_ia_01: id }
    });

    // 🔹 INSERT DETAIL BARU
    if (detail && detail.length > 0) {
      const newDetail = detail.map(item => ({
        id_fr_ia_01: id,
        id_unit: item.id_unit,
        id_elemen: item.id_elemen,
        id_kuk: item.id_kuk,
        standar_industri: item.standar_industri,
        pencapaian: item.pencapaian,
        penilaian_lanjut: item.penilaian_lanjut
      }));

      await FrIa01Detail.bulkCreate(newDetail);
    }

    res.json({ message: "FR.IA.01 berhasil diupdate" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByPeserta = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;

    const data = await FrIa01.findOne({
      where: { id_jadwal, id_peserta },
      include: [
        {
          model: FrIa01Detail,
          as: "detail"
        }
      ]
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const data = await FrIa01.findByPk(req.params.id, {
      include: [
        {
          model: FrIa01Detail,
          as: "detail",
          include: [
            { model: UnitKompetensi, as: "unit" },
            { model: UnitElemen, as: "elemen" },
            { model: UnitKuk, as: "kuk" }
          ]
        },
        { model: Jadwal, as: "jadwal" },
        { model: PesertaJadwal, as: "peserta" },
        { model: ProfileAsesor, as: "asesor" }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-IA-01-${data.id_fr_ia_01}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc.fontSize(14).text("FR.IA.01", { align: "center" });
    doc.text("CEKLIS OBSERVASI AKTIVITAS KERJA", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Asesi : ${data.peserta?.nama || "-"}`);
    doc.text(`Asesor : ${data.asesor?.nama_lengkap || "-"}`);
    doc.text(`Tanggal : ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // ================= TABLE =================
    doc.fontSize(9);

    data.detail.forEach((d, i) => {
      doc.text(`${i + 1}. ${d.kuk?.nama_kuk || "-"}`);
      doc.text(`Standar : ${d.standar_industri || "-"}`);
      doc.text(`Pencapaian : ${d.pencapaian}`);
      doc.text(`Catatan : ${d.penilaian_lanjut || "-"}`);
      doc.moveDown();
    });

    // ================= FOOTER =================
    doc.moveDown();
    doc.text("Umpan Balik:");
    doc.text(data.umpan_balik || "-");
    doc.moveDown();

    doc.text(`Rekomendasi: ${data.rekomendasi || "-"}`);
    doc.moveDown();

    if (data.ttd_asesor) {
      try {
        doc.image(data.ttd_asesor, { width: 100 });
      } catch (err) {
        doc.text("(TTD tidak valid)");
      }
    }

    doc.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};