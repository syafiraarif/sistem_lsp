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

// ===============================
// GENERATE PDF FR.AK.04
// ===============================
exports.generatePdfFrAk04 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const data = await FrAk04.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            { model: ProfileAsesi, as: "profileAsesi" },
            { model: ProfileAsesor, as: "asesor_penguji" }
          ]
        },
        { model: Jadwal, as: "jadwal", include: [{ model: Skema, as: "skema" }, { model: Tuk, as: "tuk" }] }
      ]
    });

    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=FR_AK04.pdf");
    doc.pipe(res);

    const namaAsesi = data.peserta.profileAsesi.nama_lengkap || "-";
    const namaAsesor = data.peserta.asesor_penguji?.nama_lengkap || "-";
    const namaSkema = data.jadwal.skema.judul_skema || "-";
    const namaTuk = data.jadwal.tuk.nama_tuk || "-";

    // Header
    doc.fontSize(14).text("FR.AK.04. BANDING ASESMEN", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Nama Asesi : ${namaAsesi}`);
    doc.text(`Nama Asesor : ${namaAsesor}`);
    doc.text(`Tanggal Asesmen : ${data.tanggal_asesmen}`);
    doc.text(`Skema : ${namaSkema}`);
    doc.text(`TUK : ${namaTuk}`);
    doc.moveDown();

    // Jawaban Ya/Tidak
    doc.text("Jawaban Asesi:");
    doc.moveDown(0.5);
    doc.text(`1. Proses banding dijelaskan : ${data.proses_banding_dijelaskan.toUpperCase()}`);
    doc.text(`2. Diskusi dengan asesor : ${data.diskusi_dengan_asesor.toUpperCase()}`);
    doc.text(`3. Melibatkan orang lain : ${data.melibatkan_orang_lain.toUpperCase()}`);
    doc.moveDown();

    // Alasan banding
    doc.text("Alasan Banding:");
    doc.text(data.alasan_banding || "-");
    doc.moveDown(2);

    // TTD Asesi
    doc.text("Tanda Tangan Asesi:");
    if (data.peserta.profileAsesi.ttd_path) {
      try { doc.image(data.peserta.profileAsesi.ttd_path, { width: 100 }); }
      catch { doc.text("(TTD tidak ditemukan)"); }
    } else { doc.text("-"); }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal generate PDF FR.AK.04", error: err.message });
  }
};