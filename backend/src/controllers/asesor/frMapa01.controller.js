const {
  sequelize,
  FrMapa01,
  FrMapa01Detail,
  Jadwal,
  JadwalAsesor,
  PresensiAsesor
} = require("../../models");
const PDFDocument = require("pdfkit");


// ===============================
// 🔥 FUNCTION MAPPING POTENSI
// ===============================
const getPotensiDefault = (jenis) => {
  switch (jenis) {
    case "pelatihan_kompeten":
      return 2;

    case "pelatihan_belum_kompeten":
      return 2;

    case "pengalaman_kompeten":
      return 3;

    case "pengalaman_belum_kompeten":
      return 3;

    case "mandiri":
      return 5;

    default:
      return null;
  }
};


// ===============================
// 1. SUBMIT FR.MAPA.01
// ===============================
const submitFrMapa01 = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id_user = req.user.id_user;

    const { id_jadwal, id_skema, header, detail } = req.body;

    if (!id_jadwal || !id_skema) {
      return res.status(400).json({
        message: "id_jadwal dan id_skema wajib diisi"
      });
    }

    // ========================
    // VALIDASI
    // ========================
    const jadwal = await Jadwal.findByPk(id_jadwal);
    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const tugas = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user, status: "aktif" }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki tugas di jadwal ini"
      });
    }

    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user }
    });

    if (!presensi) {
      return res.status(403).json({
        message: "Wajib presensi terlebih dahulu"
      });
    }

    const existing = await FrMapa01.findOne({
      where: { id_jadwal, id_asesor: id_user }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.MAPA.01 sudah pernah diisi"
      });
    }

    // ========================
    // 🔥 MAPPING POTENSI
    // ========================
    if (!header.jenis_asesi) {
      return res.status(400).json({
        message: "jenis_asesi wajib diisi"
      });
    }

    const potensi_default = getPotensiDefault(header.jenis_asesi);

    // ========================
    // INSERT HEADER
    // ========================
    const mapa01 = await FrMapa01.create({
      id_jadwal,
      id_skema,
      id_asesor: id_user,
      potensi_default, // 🔥 INI YANG BARU
      ...header
    }, { transaction: t });

    // ========================
    // INSERT DETAIL
    // ========================
    if (detail && detail.length > 0) {
      const detailData = detail.map(item => ({
        id_mapa01: mapa01.id_mapa01,
        id_unit: item.id_unit,
        bukti: item.bukti,
        l: item.l,
        tl: item.tl,
        t: item.t,
        metode_observasi: item.metode_observasi,
        metode_portofolio: item.metode_portofolio,
        metode_tanya: item.metode_tanya,
        metode_verifikasi: item.metode_verifikasi
      }));

      await FrMapa01Detail.bulkCreate(detailData, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "FR.MAPA.01 berhasil disimpan",
      potensi_default, // 🔥 penting buat debug frontend
      data: mapa01
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ Submit MAPA01 Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


// ===============================
// 2. GET DETAIL
// ===============================
const getFrMapa01 = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const id_user = req.user.id_user;

    const data = await FrMapa01.findOne({
      where: { id_jadwal, id_asesor: id_user },
      include: [{ model: FrMapa01Detail, as: "detail" }]
    });

    return res.json({ data });

  } catch (err) {
    console.error("❌ Get MAPA01 Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ===============================
// 3. UPDATE
// ===============================
const updateFrMapa01 = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const id_user = req.user.id_user;
    const { header, detail } = req.body;

    const mapa01 = await FrMapa01.findByPk(id);

    if (!mapa01) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (mapa01.id_asesor !== id_user) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    // 🔥 update potensi juga kalau jenis berubah
    let potensi_default = mapa01.potensi_default;

    if (header.jenis_asesi) {
      potensi_default = getPotensiDefault(header.jenis_asesi);
    }

    await mapa01.update({
      ...header,
      potensi_default
    }, { transaction: t });

    await FrMapa01Detail.destroy({
      where: { id_mapa01: id },
      transaction: t
    });

    if (detail && detail.length > 0) {
      const detailData = detail.map(item => ({
        id_mapa01: id,
        id_unit: item.id_unit,
        bukti: item.bukti,
        l: item.l,
        tl: item.tl,
        t: item.t,
        metode_observasi: item.metode_observasi,
        metode_portofolio: item.metode_portofolio,
        metode_tanya: item.metode_tanya,
        metode_verifikasi: item.metode_verifikasi
      }));

      await FrMapa01Detail.bulkCreate(detailData, { transaction: t });
    }

    await t.commit();

    return res.json({
      message: "FR.MAPA.01 berhasil diupdate",
      potensi_default
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ Update MAPA01 Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


// ===============================
// 4. LIST
// ===============================
const listFrMapa01 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrMapa01.findAll({
      where: { id_jadwal },
      include: [{ model: FrMapa01Detail, as: "detail" }],
      order: [["created_at", "DESC"]]
    });

    return res.json({ total: data.length, data });

  } catch (err) {
    console.error("❌ List MAPA01 Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ===============================
// 5. PDF
// ===============================
const downloadPdfFrMapa01 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const data = await FrMapa01.findByPk(id, {
      include: [{ model: FrMapa01Detail, as: "detail" }]
    });

    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    if (data.id_asesor !== id_user) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=FR_MAPA01_${id}.pdf`);

    doc.pipe(res);

    doc.fontSize(16).text("FR.MAPA.01", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Jenis Asesi : ${data.jenis_asesi}`);
    doc.text(`Potensi Default : ${data.potensi_default}`);
    doc.moveDown();

    data.detail.forEach((item, i) => {
      doc.text(`${i + 1}. Unit ${item.id_unit}`);
    });

    doc.end();

  } catch (err) {
    console.error("❌ PDF Error:", err);
    return res.status(500).json({ message: "Gagal PDF", error: err.message });
  }
};


module.exports = {
  submitFrMapa01,
  getFrMapa01,
  updateFrMapa01,
  listFrMapa01,
  downloadPdfFrMapa01
};