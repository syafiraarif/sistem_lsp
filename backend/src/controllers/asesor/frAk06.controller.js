const { FrAk06, FrAk06Detail, JadwalAsesor, PresensiAsesor } = require("../../models");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ================= GET DETAIL =================
exports.getFrAk06 = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const id_asesor = req.user.id;

    const data = await FrAk06.findOne({
      where: { id_jadwal, id_asesor },
      include: [{ model: FrAk06Detail, as: "details" }]
    });

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= SUBMIT =================
exports.submitFrAk06 = async (req, res) => {
  try {
    const id_asesor = req.user.id;

    const {
      id_jadwal,
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    if (!id_jadwal || !ttd_asesor) {
      return res.status(400).json({
        success: false,
        message: "id_jadwal dan ttd wajib diisi"
      });
    }

    // 🔥 VALIDASI PRESENSI
    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!presensi) {
      return res.status(400).json({
        success: false,
        message: "Asesor belum presensi"
      });
    }

    // 🔥 VALIDASI JADWAL
    const jadwal = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!jadwal) {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses"
      });
    }

    // 🔥 CEK DUPLIKAT
    const existing = await FrAk06.findOne({
      where: { id_jadwal, id_asesor }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "FR.AK.06 sudah pernah disubmit"
      });
    }

    // CREATE HEADER
    const fr = await FrAk06.create({
      id_jadwal,
      id_asesor,
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor
    });

    // INSERT DETAIL
    if (Array.isArray(detail)) {
      const detailData = detail.map(item => ({
        id_fr_ak06: fr.id,
        aspek: item.aspek || null,
        validitas: !!item.validitas,
        reliabel: !!item.reliabel,
        fleksibel: !!item.fleksibel,
        adil: !!item.adil,
        task_skills: !!item.task_skills,
        task_management: !!item.task_management,
        contingency_management: !!item.contingency_management,
        job_role: !!item.job_role,
        transfer_skills: !!item.transfer_skills,
        bukti: item.bukti || null
      }));

      await FrAk06Detail.bulkCreate(detailData);
    }

    res.status(201).json({
      success: true,
      message: "FR.AK.06 berhasil disimpan",
      data: fr
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= UPDATE =================
exports.updateFrAk06 = async (req, res) => {
  try {
    const { id } = req.params;

    const fr = await FrAk06.findByPk(id);

    if (!fr) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan"
      });
    }

    const {
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    await fr.update({
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor
    });

    // RESET DETAIL
    await FrAk06Detail.destroy({
      where: { id_fr_ak06: id }
    });

    if (Array.isArray(detail)) {
      const detailData = detail.map(item => ({
        id_fr_ak06: id,
        aspek: item.aspek || null,
        validitas: !!item.validitas,
        reliabel: !!item.reliabel,
        fleksibel: !!item.fleksibel,
        adil: !!item.adil,
        task_skills: !!item.task_skills,
        task_management: !!item.task_management,
        contingency_management: !!item.contingency_management,
        job_role: !!item.job_role,
        transfer_skills: !!item.transfer_skills,
        bukti: item.bukti || null
      }));

      await FrAk06Detail.bulkCreate(detailData);
    }

    res.status(200).json({
      success: true,
      message: "FR.AK.06 berhasil diupdate"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= LIST =================
exports.listFrAk06 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrAk06.findAll({
      where: { id_jadwal },
      include: [{ model: FrAk06Detail, as: "details" }]
    });

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= DOWNLOAD PDF =================
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrAk06.findByPk(id, {
      include: [{ model: FrAk06Detail, as: "details" }]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan"
      });
    }

    const details = data.details || [];

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-AK-06-${id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(16).text("FR.AK.06 MENINJAU PROSES ASESMEN", { align: "center" });
    doc.moveDown();

    doc.text(`Jadwal: ${data.id_jadwal}`);
    doc.text(`Asesor: ${data.id_asesor}`);
    doc.moveDown();

    details.forEach((d, i) => {
      doc.text(`${i + 1}. ${d.aspek || "-"}`);
      doc.text(`Validitas: ${d.validitas ? "✔" : "-"}`);
      doc.text(`Reliabel: ${d.reliabel ? "✔" : "-"}`);
      doc.text(`Bukti: ${d.bukti || "-"}`);
      doc.moveDown();
    });

    doc.text("Rekomendasi:");
    doc.text(`1. ${data.rekomendasi_1 || "-"}`);
    doc.text(`2. ${data.rekomendasi_2 || "-"}`);

    doc.moveDown();
    doc.text(`Komentar: ${data.komentar || "-"}`);

    doc.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

