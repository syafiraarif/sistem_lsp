const {
  Presensi,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi
} = require("../../models");

/*
=====================================
CREATE PRESENSI
=====================================
*/
exports.createPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        message: "id_peserta wajib diisi"
      });
    }

    if (!req.files || !req.files.ttd_presensi) {
      return res.status(400).json({
        message: "Tanda tangan wajib diupload"
      });
    }

    const peserta = await PesertaJadwal.findByPk(id_peserta);

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan"
      });
    }

    const existing = await Presensi.findOne({
      where: { id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "Anda sudah presensi"
      });
    }

    const ttdPath = req.files.ttd_presensi[0].path;

    const presensi = await Presensi.create({
      id_peserta,
      ttd_asesi_path: ttdPath,
      waktu_presensi: new Date()
    });

    return res.status(201).json({
      message: "Presensi berhasil",
      status: "hadir",
      data: presensi
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal presensi"
    });
  }
};


/*
=====================================
STATUS PRESENSI
=====================================
*/
exports.getStatusPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    console.log("ID PESERTA:", id_peserta);

    const presensi = await Presensi.findOne({
      where: { id_peserta }
    });

    return res.json({
      status: presensi ? "hadir" : "belum_presensi",
      data: presensi || null
    });

  } catch (error) {
    console.error("ERROR PRESENSI:", error); // 🔥 INI PENTING
    return res.status(500).json({
      message: "Gagal mengambil status",
      error: error.message
    });
  }
};


/*
=====================================
DETAIL PRESENSI (UNTUK UI)
=====================================
*/
exports.getDetailPresensi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await Presensi.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          include: [
            {
              model: Jadwal,
              include: [
                { model: Skema },
                { model: Tuk }
              ]
            },
            {
              model: ProfileAsesi,
              as: "asesi",
              attributes: ["id_user", "nama_lengkap"]
            }
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        message: "Belum presensi"
      });
    }

    return res.json({
      status: "hadir",
      data
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal ambil detail"
    });
  }
};