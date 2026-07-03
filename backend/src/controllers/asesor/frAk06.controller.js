const {
  FrAk06,
  FrAk06Detail,
  JadwalAsesor,
  PresensiAsesor,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");

// ================= GET DETAIL =================
exports.getFrAk06 = async (req, res) => {
  try {

    const { id_jadwal } = req.query;
    const id_asesor = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "id_jadwal wajib diisi"
      });
    }

    // cek apakah asesor bertugas
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses pada jadwal ini"
      });
    }

    const data = await FrAk06.findOne({
      where: {
        id_jadwal,
        id_asesor
      },
      include: [
        {
          model: FrAk06Detail,
          as: "details",
          separate: true,
          order: [
            ["id", "ASC"]
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.06 belum dibuat"
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error("GET FR.AK.06 ERROR :", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/// ================= SUBMIT =================
exports.submitFrAk06 = async (req, res) => {

  const transaction = await FrAk06.sequelize.transaction();

  try {

    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    // ================= VALIDASI =================

    if (!id_jadwal) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi"
      });
    }

    if (!ttd_asesor) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Tanda tangan asesor wajib diisi"
      });
    }

    if (!Array.isArray(detail) || detail.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Minimal harus terdapat satu detail asesmen"
      });
    }

    // ================= CEK PRESENSI =================

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      },
      transaction
    });

    if (!presensi) {

      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "Harap melakukan presensi terlebih dahulu"
      });
    }

    // ================= CEK PENUGASAN =================

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      },
      transaction
    });

    if (!tugas) {

      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    // ================= CEK DUPLIKAT =================

    const existing = await FrAk06.findOne({
      where: {
        id_jadwal,
        id_asesor
      },
      transaction
    });

    if (existing) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "FR.AK.06 sudah pernah dibuat"
      });
    }

    // ================= SIMPAN HEADER =================

    const fr = await FrAk06.create({
      id_jadwal,
      id_asesor,
      rekomendasi_1: rekomendasi_1 || null,
      rekomendasi_2: rekomendasi_2 || null,
      komentar: komentar || null,
      ttd_asesor
    }, {
      transaction
    });

    // ================= SIMPAN DETAIL =================

    const detailData = detail.map(item => ({
      id_fr_ak06: fr.id,

      aspek: item.aspek || null,

      validitas: Boolean(item.validitas),
      reliabel: Boolean(item.reliabel),
      fleksibel: Boolean(item.fleksibel),
      adil: Boolean(item.adil),

      task_skills: Boolean(item.task_skills),
      task_management: Boolean(item.task_management),
      contingency_management: Boolean(item.contingency_management),
      job_role: Boolean(item.job_role),
      transfer_skills: Boolean(item.transfer_skills),

      bukti: item.bukti || null
    }));

    await FrAk06Detail.bulkCreate(
      detailData,
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "FR.AK.06 berhasil disimpan",
      data: fr
    });

  } catch (error) {

    await transaction.rollback();

    console.error("SUBMIT FR.AK.06 ERROR :", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message
    });

  }

};

// ================= LIST =================
exports.listFrAk06 = async (req, res) => {

  try {

    const id_asesor = req.user.id_user;
    const { id_jadwal } = req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi"
      });
    }

    // =====================
    // CEK PENUGASAN ASESOR
    // =====================

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses pada jadwal ini"
      });
    }

    // =====================
    // AMBIL DATA
    // =====================

    const data = await FrAk06.findAll({

      where: {
        id_jadwal,
        id_asesor
      },

      include: [

        {
          model: FrAk06Detail,
          as: "details",
          separate: true,
          order: [
            ["id", "ASC"]
          ]
        },

        {
          model: Jadwal,
          as: "jadwal",
          include: [
            {
              model: Skema,
              as: "skema"
            },
            {
              model: Tuk,
              as: "tuk"
            }
          ]
        },

        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "ttd_path"
          ]
        }

      ],

      order: [
        ["created_at", "DESC"]
      ]

    });

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {

    console.error("LIST FR.AK.06 ERROR :", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message
    });

  }

};

// ================= UPDATE =================
exports.updateFrAk06 = async (req, res) => {

  const transaction = await FrAk06.sequelize.transaction();

  try {

    const { id } = req.params;
    const id_asesor = req.user.id_user;

    const {
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    const fr = await FrAk06.findOne({
      where: {
        id,
        id_asesor
      },
      transaction
    });

    if (!fr) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "FR.AK.06 tidak ditemukan"
      });

    }

    if (!Array.isArray(detail)) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Detail harus berupa array"
      });

    }

    // ===========================
    // UPDATE HEADER
    // ===========================

    await fr.update({

      rekomendasi_1:
        rekomendasi_1 ?? fr.rekomendasi_1,

      rekomendasi_2:
        rekomendasi_2 ?? fr.rekomendasi_2,

      komentar:
        komentar ?? fr.komentar,

      ttd_asesor:
        ttd_asesor ?? fr.ttd_asesor

    }, {
      transaction
    });

    // ===========================
    // HAPUS DETAIL LAMA
    // ===========================

    await FrAk06Detail.destroy({

      where: {
        id_fr_ak06: fr.id
      },

      transaction

    });

    // ===========================
    // INSERT DETAIL BARU
    // ===========================

    const detailData = detail.map(item => ({

      id_fr_ak06: fr.id,

      aspek: item.aspek || null,

      validitas: Boolean(item.validitas),
      reliabel: Boolean(item.reliabel),
      fleksibel: Boolean(item.fleksibel),
      adil: Boolean(item.adil),

      task_skills: Boolean(item.task_skills),
      task_management: Boolean(item.task_management),
      contingency_management: Boolean(item.contingency_management),
      job_role: Boolean(item.job_role),
      transfer_skills: Boolean(item.transfer_skills),

      bukti: item.bukti || null

    }));

    await FrAk06Detail.bulkCreate(
      detailData,
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(200).json({

      success: true,
      message: "FR.AK.06 berhasil diperbarui",
      data: fr

    });

  } catch (error) {

    await transaction.rollback();

    console.error(
      "UPDATE FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/// ================= DOWNLOAD PDF =================
exports.downloadPdf = async (req, res) => {

  try {

    const { id } = req.params;
    const id_asesor = req.user.id_user;

    const data = await FrAk06.findOne({

      where: {
        id,
        id_asesor
      },

      include: [

        {
          model: FrAk06Detail,
          as: "details",
          separate: true,
          order: [["id", "ASC"]]
        },

        {
          model: Jadwal,
          as: "jadwal",
          include: [
            {
              model: Skema,
              as: "skema"
            },
            {
              model: Tuk,
              as: "tuk"
            }
          ]
        },

        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "nama_lengkap",
            "ttd_path"
          ]
        }

      ]

    });

    if (!data) {

      return res.status(404).json({
        success: false,
        message: "FR.AK.06 tidak ditemukan"
      });

    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK-06-${id}.pdf`
    );

    doc.pipe(res);

    // =====================================
    // HEADER
    // =====================================

    doc
      .fontSize(16)
      .text("FR.AK.06", {
        align: "center"
      });

    doc
      .fontSize(13)
      .text("MENINJAU PROSES ASESMEN", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Nama Asesor : ${data.asesor?.nama_lengkap || "-"}`);
    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`Skema : ${data.jadwal?.skema?.judul_skema || "-"}`);
    doc.text(`TUK : ${data.jadwal?.tuk?.nama_tuk || "-"}`);

    doc.text(
      `Tanggal : ${
        data.created_at
          ? new Date(data.created_at).toLocaleDateString("id-ID")
          : "-"
      }`
    );

    doc.moveDown();

    // =====================================
    // DETAIL
    // =====================================

    doc
      .fontSize(12)
      .text("Detail Peninjauan", {
        underline: true
      });

    doc.moveDown();

    (data.details || []).forEach((item, index) => {

      doc.fontSize(11);

      doc.text(`${index + 1}. ${item.aspek || "-"}`);

      doc.moveDown(0.2);

      doc.text(
        `Prinsip Asesmen :
✓ Validitas : ${item.validitas ? "Ya" : "Tidak"}
✓ Reliabel : ${item.reliabel ? "Ya" : "Tidak"}
✓ Fleksibel : ${item.fleksibel ? "Ya" : "Tidak"}
✓ Adil : ${item.adil ? "Ya" : "Tidak"}`
      );

      doc.moveDown(0.2);

      doc.text(
        `Dimensi Kompetensi :
✓ Task Skills : ${item.task_skills ? "Ya" : "Tidak"}
✓ Task Management Skills : ${item.task_management ? "Ya" : "Tidak"}
✓ Contingency Management Skills : ${item.contingency_management ? "Ya" : "Tidak"}
✓ Job Role / Environment Skills : ${item.job_role ? "Ya" : "Tidak"}
✓ Transfer Skills : ${item.transfer_skills ? "Ya" : "Tidak"}`
      );

      doc.moveDown(0.2);

      doc.text(`Bukti : ${item.bukti || "-"}`);

      doc.moveDown();

    });

    // =====================================
    // REKOMENDASI
    // =====================================

    doc
      .fontSize(12)
      .text("Rekomendasi", {
        underline: true
      });

    doc.moveDown(0.5);

    doc.text(`1. ${data.rekomendasi_1 || "-"}`);
    doc.text(`2. ${data.rekomendasi_2 || "-"}`);

    doc.moveDown();

    // =====================================
    // KOMENTAR
    // =====================================

    doc
      .fontSize(12)
      .text("Komentar", {
        underline: true
      });

    doc.moveDown(0.5);

    doc.text(data.komentar || "-");

    doc.moveDown(2);

    // =====================================
    // TTD
    // =====================================

    doc.text("Tanda Tangan Asesor");

    const ttdPath =
      data.asesor?.ttd_path || data.ttd_asesor;

    if (ttdPath) {

      try {

        doc.image(ttdPath, {
          width: 120
        });

      } catch (err) {

        doc.text("(Tanda tangan tidak ditemukan)");

      }

    } else {

      doc.text("-");

    }

    doc.moveDown();

    doc.text(
      data.asesor?.nama_lengkap || "-"
    );

    doc.end();

  } catch (error) {

    console.error(
      "DOWNLOAD PDF FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};