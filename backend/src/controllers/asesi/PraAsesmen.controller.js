const {
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  User,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor,
  Presensi,
} = require("../../models");

/* =========================
   GET FORM PRA ASESMEN
========================= */
exports.getFormPraAsesmen = async (req, res) => {
  try {
    const id_user = req.user?.id_user || req.user?.id;

    if (!id_user) {
      return res.status(401).json({
        success: false,
        message: "User tidak valid",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: { id_user },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
          include: [
            {
              model: Skema,
              as: "skema",
            },
            {
              model: Tuk,
              as: "tuk",
            },
            {
              model: JadwalAsesor,
              include: [
                {
                  model: ProfileAsesor,
                  as: "profileAsesor",
                  include: [
                    {
                      model: User,
                      as: "user",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: ProfileAsesi,
          as: "asesi",
        },
        {
          model: Presensi,
          as: "presensi",
        },
      ],
      order: [["id_peserta", "DESC"]],
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Data peserta jadwal tidak ditemukan",
      });
    }

    const jadwal = peserta.jadwal || {};
    const skema = jadwal.skema || {};
    const tuk = jadwal.tuk || {};
    const asesi = peserta.asesi || {};

    const asesorData =
      jadwal.jadwal_asesors ||
      jadwal.JadwalAsesors ||
      jadwal.JadwalAsesor ||
      [];

    const asesorPertama = Array.isArray(asesorData) ? asesorData[0] : null;

    const namaAsesor =
      asesorPertama?.profileAsesor?.nama_lengkap ||
      asesorPertama?.profileAsesor?.nama_asesor ||
      asesorPertama?.profileAsesor?.user?.nama ||
      asesorPertama?.profileAsesor?.user?.username ||
      "-";

    const namaAsesi =
      asesi.nama_lengkap ||
      asesi.nama_asesi ||
      asesi.nama ||
      req.user?.nama ||
      req.user?.username ||
      "-";

    const presensi = peserta.presensi || null;

    return res.json({
      success: true,
      message: "Form pra asesmen berhasil diambil",
      data: {
        id_peserta: peserta.id_peserta,
        id_jadwal: peserta.id_jadwal,
        id_skema: jadwal.id_skema,

        skema_sertifikasi: {
          jenis: skema.jenis_skema || skema.jenis || "Skema",
          judul: skema.judul_skema || skema.nama_skema || "-",
          nomor: skema.kode_skema || skema.nomor_skema || "-",
        },

        tuk: {
          jenis: tuk.jenis_tuk || tuk.jenis || "TUK",
          nama: tuk.nama_tuk || tuk.nama || "-",
        },

        nama_asesor: namaAsesor,
        nama_asesi: namaAsesi,

        jadwal_pelaksanaan: {
          hari_tanggal: formatTanggalRange(jadwal.tgl_awal, jadwal.tgl_akhir),
          tempat: jadwal.tempat || tuk.alamat || tuk.nama_tuk || "-",
          pelaksanaan_uji: jadwal.pelaksanaan_uji || "-",
        },

        ttd_asesi_ready: Boolean(
          asesi.ttd ||
            asesi.tanda_tangan ||
            asesi.file_ttd ||
            asesi.ttd_asesi
        ),

        is_submitted: Boolean(presensi),
        presensi,
      },
    });
  } catch (error) {
    console.error("GET FORM PRA ASESMEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil form pra asesmen",
      error: error.message,
    });
  }
};

/* =========================
   SUBMIT PRA ASESMEN
========================= */
exports.submitPraAsesmen = async (req, res) => {
  try {
    const { id_peserta, catatan } = req.body;
    const id_user = req.user?.id_user || req.user?.id;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib dikirim",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user,
      },
      include: [
        {
          model: Presensi,
          as: "presensi",
        },
      ],
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Data peserta tidak ditemukan",
      });
    }

    if (peserta.presensi) {
      return res.status(400).json({
        success: false,
        message: "Pra asesmen sudah pernah disubmit",
      });
    }

    const presensi = await Presensi.create({
      id_peserta,
      catatan: catatan || "Hadir",
      status: "hadir",
      waktu_presensi: new Date(),
    });

    return res.json({
      success: true,
      message: "Pra asesmen berhasil disubmit",
      data: presensi,
    });
  } catch (error) {
    console.error("SUBMIT PRA ASESMEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal submit pra asesmen",
      error: error.message,
    });
  }
};

/* =========================
   DOWNLOAD PRA ASESMEN
========================= */
exports.downloadPraAsesmen = async (req, res) => {
  try {
    return res.status(501).json({
      success: false,
      message:
        "Fitur download PDF pra asesmen belum dibuat. Endpoint sudah aktif, tinggal tambahkan generator PDF.",
    });
  } catch (error) {
    console.error("DOWNLOAD PRA ASESMEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal download pra asesmen",
      error: error.message,
    });
  }
};

/* =========================
   HELPER
========================= */
function formatTanggalRange(tglAwal, tglAkhir) {
  const awal = formatTanggal(tglAwal);
  const akhir = formatTanggal(tglAkhir);

  if (awal === "-" && akhir === "-") return "-";
  if (awal === akhir) return awal;

  return `${awal} - ${akhir}`;
}

function formatTanggal(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}