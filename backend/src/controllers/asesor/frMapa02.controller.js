const {
  sequelize,
  FrMapa02,
  FrMapa02Unit,
  FrMapa02Muk,
  FrMapa01,
  SkemaUnit,
  UnitKompetensi,
  KelompokPekerjaan
} = require("../../models");

const PDFDocument = require("pdfkit");

// ===============================
// 🔥 MASTER MUK (DEFAULT)
// ===============================
const MASTER_MUK = [
  { kode: "FR.IA.01", nama: "Ceklis Observasi", potensi: 1 },
  { kode: "FR.IA.02", nama: "Tugas Praktik Demonstrasi", potensi: 1 },
  { kode: "FR.IA.03", nama: "Pertanyaan Pendukung Observasi", potensi: 1 },
  { kode: "FR.IA.04", nama: "Instruksi Terstruktur", potensi: 2 },
  { kode: "FR.IA.05", nama: "Pertanyaan Tertulis PG", potensi: 1 },
  { kode: "FR.IA.06", nama: "Pertanyaan Tertulis Esai", potensi: 1 },
  { kode: "FR.IA.07", nama: "Pertanyaan Lisan", potensi: 4 },
  { kode: "FR.IA.08", nama: "Verifikasi Portofolio", potensi: 3 },
  { kode: "FR.IA.09", nama: "Wawancara", potensi: 3 },
  { kode: "FR.IA.10", nama: "Verifikasi Pihak Ketiga", potensi: 3 },
  { kode: "FR.IA.11", nama: "Ceklis Review Produk", potensi: 4 }
];


// ===============================
// 1. GENERATE MAPA02
// ===============================
const generateMapa02 = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.body;

    // ========================
    // CEK MAPA01
    // ========================
    const mapa01 = await FrMapa01.findOne({
      where: { id_jadwal, id_asesor: id_user }
    });

    if (!mapa01) {
      return res.status(404).json({
        message: "FR.MAPA.01 belum diisi"
      });
    }

    // ========================
    // CEK SUDAH ADA?
    // ========================
    const existing = await FrMapa02.findOne({
      where: { id_jadwal, id_asesor: id_user }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.MAPA.02 sudah dibuat"
      });
    }

    // ========================
    // INSERT HEADER
    // ========================
    const mapa02 = await FrMapa02.create({
      id_jadwal,
      id_skema: mapa01.id_skema,
      id_asesor: id_user,
      id_mapa01: mapa01.id_mapa01
    }, { transaction: t });

    // ========================
    // AMBIL UNIT DARI SKEMA
    // ========================
    const units = await SkemaUnit.findAll({
      where: { id_skema: mapa01.id_skema },
      include: [
        { model: UnitKompetensi, as: "unit" },
        { model: KelompokPekerjaan, as: "kelompok" }
      ]
    });

    for (const u of units) {
      const unitRow = await FrMapa02Unit.create({
        id_mapa02: mapa02.id_mapa02,
        id_unit: u.id_unit,
        id_kelompok: u.id_kelompok,
        urutan: u.urutan
      }, { transaction: t });

      // ========================
      // INSERT MUK DEFAULT
      // ========================
      const mukData = MASTER_MUK.map(m => ({
        id_mapa02_unit: unitRow.id_mapa02_unit,
        kode_muk: m.kode,
        nama_muk: m.nama,
        potensi_asesi: m.potensi,

        // 🔥 AUTO CHECK SESUAI MAPA01
        dipilih: m.potensi === mapa01.potensi_default
      }));

      await FrMapa02Muk.bulkCreate(mukData, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "FR.MAPA.02 berhasil digenerate",
      data: mapa02
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ Generate MAPA02 Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


// ===============================
// 2. GET DETAIL MAPA02
// ===============================
const getMapa02 = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const id_user = req.user.id_user;

    const data = await FrMapa02.findOne({
      where: { id_jadwal, id_asesor: id_user },
      include: [
        {
          model: FrMapa02Unit,
          as: "unit",
          include: [
            {
              model: FrMapa02Muk,
              as: "muk"
            }
          ]
        }
      ]
    });

    return res.json({ data });

  } catch (err) {
    console.error("❌ Get MAPA02 Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// 3. UPDATE (CENTANG MUK)
// ===============================
const updateMapa02 = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { muk } = req.body;

    // muk = [{ id_muk, dipilih }]

    for (const m of muk) {
      await FrMapa02Muk.update(
        { dipilih: m.dipilih },
        {
          where: { id_muk: m.id_muk },
          transaction: t
        }
      );
    }

    await t.commit();

    return res.json({
      message: "MAPA02 berhasil diupdate"
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ Update MAPA02 Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const downloadPdfMapa02 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const data = await FrMapa02.findByPk(id, {
      include: [
        {
          model: FrMapa02Unit,
          as: "unit",
          include: [
            {
              model: FrMapa02Muk,
              as: "muk"
            }
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (data.id_asesor !== id_user) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    // ========================
    // BUAT PDF
    // ========================
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR_MAPA02_${id}.pdf`
    );

    doc.pipe(res);

    // ========================
    // HEADER
    // ========================
    doc.fontSize(14).text("FR.MAPA.02", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`ID Asesor : ${data.id_asesor}`);
    doc.moveDown();

    // ========================
    // LOOP UNIT
    // ========================
    data.unit.forEach((u, index) => {
      doc.fontSize(11).text(`Unit ${index + 1} (ID: ${u.id_unit})`);
      doc.moveDown(0.5);

      // ========================
      // LOOP MUK YANG DIPILIH
      // ========================
      u.muk
        .filter(m => m.dipilih)
        .forEach((m, i) => {
          doc.fontSize(9).text(
            `- ${m.kode_muk} (${m.nama_muk}) [Potensi ${m.potensi_asesi}]`
          );
        });

      doc.moveDown();
    });

    doc.end();

  } catch (err) {
    console.error("❌ PDF MAPA02 Error:", err);
    return res.status(500).json({
      message: "Gagal generate PDF",
      error: err.message
    });
  }
};

module.exports = {
  generateMapa02,
  getMapa02,
  updateMapa02,
  downloadPdfMapa02
};