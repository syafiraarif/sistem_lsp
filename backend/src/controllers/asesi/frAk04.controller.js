const {
  sequelize,
  FrAk04,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");

// ===============================
// CREATE FR.AK.04
// ===============================
exports.createFrAk04 = async (req, res) => {

  try {

    const idUser = req.user.id_user || req.user.id;

    const {

      proses_banding_dijelaskan,
      diskusi_dengan_asesor,
      melibatkan_orang_lain,
      alasan_banding

    } = req.body;

    // =====================================
    // VALIDASI
    // =====================================

    if (
      !proses_banding_dijelaskan ||
      !diskusi_dengan_asesor ||
      !melibatkan_orang_lain
    ) {

      return res.status(400).json({

        success: false,

        message: "Semua pertanyaan wajib dijawab."

      });

    }

    if (!alasan_banding || alasan_banding.trim() === "") {

      return res.status(400).json({

        success: false,

        message: "Alasan banding wajib diisi."

      });

    }

    // =====================================
    // AMBIL DATA PESERTA
    // =====================================

    const peserta = await PesertaJadwal.findOne({

      where: {
        id_user: idUser
      },

      include: [

        {
          model: ProfileAsesi,
          as: "profileAsesi"
        },

        {
          model: ProfileAsesor,
          as: "asesor_penguji"
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

        }

      ]

    });

    if (!peserta) {

      return res.status(404).json({

        success: false,

        message: "Data peserta tidak ditemukan."

      });

    }

    if (!peserta.jadwal) {

      return res.status(404).json({

        success: false,

        message: "Data jadwal tidak ditemukan."

      });

    }

    // =====================================
    // SUDAH PERNAH MENGISI?
    // =====================================

    const existing = await FrAk04.findOne({

      where: {

        id_peserta: peserta.id_peserta

      }

    });

    if (existing) {

      return res.status(409).json({

        success: false,

        message: "FR.AK.04 sudah pernah diisi."

      });

    }

    // =====================================
    // TTD ASESI
    // =====================================

    const ttd_asesi =
      peserta.profileAsesi?.ttd_path || null;

    // =====================================
    // SIMPAN
    // =====================================

    const data = await FrAk04.create({

      id_peserta: peserta.id_peserta,

      id_jadwal: peserta.id_jadwal,

      id_skema: peserta.jadwal.id_skema,

      id_tuk: peserta.jadwal.id_tuk,

      tanggal_asesmen: new Date(),

      proses_banding_dijelaskan,

      diskusi_dengan_asesor,

      melibatkan_orang_lain,

      alasan_banding,

      ttd_asesi

    });

    return res.status(201).json({

      success: true,

      message: "FR.AK.04 berhasil disimpan.",

      data: {

        ...data.toJSON(),

        nama_asesi:
          peserta.profileAsesi?.nama_lengkap,

        nama_asesor:
          peserta.asesor_penguji?.nama_lengkap,

        nama_skema:
          peserta.jadwal?.skema?.judul_skema,

        kode_skema:
          peserta.jadwal?.skema?.kode_skema,

        nama_tuk:
          peserta.jadwal?.tuk?.nama_tuk

      }

    });

  } catch (err) {

    console.error("Create FR.AK.04 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

// ===============================
// GET DETAIL FR.AK.04
// ===============================
exports.getFrAk04ByPeserta = async (req, res) => {

  try {

    const { id_peserta } = req.params;

    if (!id_peserta) {

      return res.status(400).json({

        success: false,

        message: "ID Peserta wajib diisi."

      });

    }

    const data = await FrAk04.findOne({

      where: {
        id_peserta
      },

      include: [

        {

          model: PesertaJadwal,
          as: "peserta",

          include: [

            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },

            {
              model: ProfileAsesor,
              as: "asesor_penguji"
            }

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

        }

      ]

    });

    if (!data) {

      return res.status(404).json({

        success: false,

        message: "Data FR.AK.04 tidak ditemukan."

      });

    }

    return res.status(200).json({

      success: true,

      message: "Data FR.AK.04 berhasil diambil.",

      data: {

        id_fr_ak04: data.id_fr_ak04,

        id_peserta: data.id_peserta,

        id_jadwal: data.id_jadwal,

        id_skema: data.id_skema,

        id_tuk: data.id_tuk,

        tanggal_asesmen: data.tanggal_asesmen,

        proses_banding_dijelaskan:
          data.proses_banding_dijelaskan,

        diskusi_dengan_asesor:
          data.diskusi_dengan_asesor,

        melibatkan_orang_lain:
          data.melibatkan_orang_lain,

        alasan_banding:
          data.alasan_banding,

        ttd_asesi:
          data.ttd_asesi,

        nama_asesi:
          data.peserta?.profileAsesi?.nama_lengkap || "-",

        nama_asesor:
          data.peserta?.asesor_penguji?.nama_lengkap || "-",

        nama_skema:
          data.jadwal?.skema?.judul_skema || "-",

        kode_skema:
          data.jadwal?.skema?.kode_skema || "-",

        nama_tuk:
          data.jadwal?.tuk?.nama_tuk || "-"

      }

    });

  } catch (err) {

    console.error("Get FR.AK.04 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

/* ===============================
GENERATE PDF FR.AK.04
GET /api/asesi/fr-ak04/pdf/:id_peserta
=============================== */

exports.generatePdfFrAk04 = async (req, res) => {
  try {

    const { id_peserta } = req.params;
    const id_user = req.user.id_user;

    // ===============================
    // VALIDASI AKSES
    // ===============================

    const pesertaLogin = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      }
    });

    if (!pesertaLogin) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses"
      });
    }

    // ===============================
    // AMBIL DATA FR.AK.04
    // ===============================

    const data = await FrAk04.findOne({
      where: {
        id_peserta
      },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },
            {
              model: ProfileAsesor,
              as: "asesor_penguji"
            }
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
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.AK.04 tidak ditemukan"
      });
    }

    // ===============================
    // PDF
    // ===============================

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FR-AK-04-${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40
    });

    doc.pipe(res);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("FORM FR.AK.04", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(11).font("Helvetica");

    doc.text(
      `Nama Asesi : ${data.peserta?.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(
      `NIK : ${data.peserta?.profileAsesi?.nik || "-"}`
    );

    doc.text(
      `Tanggal Asesmen : ${data.tanggal_asesmen || "-"}`
    );

    doc.text(
      `Skema : ${data.jadwal?.skema?.judul_skema || "-"}`
    );

    doc.text(
      `TUK : ${data.jadwal?.tuk?.nama_tuk || "-"}`
    );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Jawaban Asesi");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .text(
        `1. Proses banding telah dijelaskan : ${String(
          data.proses_banding_dijelaskan || "-"
        ).toUpperCase()}`
      );

    doc.text(
      `2. Telah berdiskusi dengan asesor : ${String(
        data.diskusi_dengan_asesor || "-"
      ).toUpperCase()}`
    );

    doc.text(
      `3. Melibatkan orang lain : ${String(
        data.melibatkan_orang_lain || "-"
      ).toUpperCase()}`
    );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Alasan Banding");

    doc
      .font("Helvetica")
      .text(data.alasan_banding || "-");

    doc.moveDown(2);

    doc
      .font("Helvetica-Bold")
      .text("Tanda Tangan Asesi");

    const ttd = data.ttd_asesi || data.peserta?.profileAsesi?.ttd_path;

    if (ttd) {

      const fullPath = path.join(
        process.cwd(),
        ttd
      );

      if (fs.existsSync(fullPath)) {

        doc.image(fullPath, {
          width: 120
        });

      } else {

        doc.text("(File TTD tidak ditemukan)");

      }

    } else {

      doc.text("-");

    }

    doc.moveDown(2);

    doc.text(
      data.peserta?.profileAsesi?.nama_lengkap || "-",
      {
        align: "right"
      }
    );

    doc.end();

  } catch (err) {

    console.error("GENERATE PDF FR.AK.04 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};