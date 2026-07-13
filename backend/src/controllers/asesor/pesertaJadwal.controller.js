const {
  PesertaJadwal,
  User,
  Jadwal,
  JadwalAsesor,
  ProfileAsesi,
  Presensi,
  Apl01Asesmen,
  Apl02,
  FrIa05Penilaian,
  HasilKeputusanAsesmen,
} = require("../../models");

/* =========================
HELPER
========================= */

const normalizeStatusAsesmen = (status) => {
  if (!status) return "belum_dinilai";

  const value = String(status).toLowerCase().trim();

  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten") return "belum_kompeten";
  if (value === "belum_kompeten") return "belum_kompeten";

  if (value === "terdaftar") return "belum_dinilai";
  if (value === "pra_asesmen") return "belum_dinilai";
  if (value === "asesmen") return "belum_dinilai";

  return value;
};

const getNamaAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};

  return (
    profile.nama_lengkap ||
    profile.nama ||
    user.nama_lengkap ||
    user.nama ||
    user.username ||
    "-"
  );
};

const getNikAsesi = (plain) => {
  const profile = plain.profileAsesi || {};

  return (
    profile.nik ||
    profile.no_ktp ||
    profile.nomor_identitas ||
    profile.no_identitas ||
    "-"
  );
};

const getEmailAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};

  return user.email || profile.email || "-";
};

const getNoHpAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};

  return user.no_hp || profile.no_hp || profile.nomor_hp || "-";
};

const getKelengkapanPeserta = async (id_peserta) => {
  // PERBAIKAN: Jika id_peserta null atau undefined, batalkan fetch. 
  // Jika tidak, Sequelize akan menarik semua row tanpa filter (milik orang lain)
  if (!id_peserta) {
    return {
      presensi: false,
      apl01: false,
      apl02: false,
      fria05: false,
      keputusan: false,
      presensi_data: null,
      apl01_data: null,
      apl02_data: null,
      fria05_data: null,
      keputusan_data: null,
      total_lengkap: 0,
      total_wajib: 4,
    };
  }

  const [presensi, apl01, apl02, fria05, keputusan] = await Promise.all([
    Presensi.findOne({
      where: {
        id_peserta,
      },
    }),

    Apl01Asesmen.findOne({
      where: {
        id_peserta,
      },
    }),

    Apl02.findOne({
      where: {
        id_peserta,
      },
    }),

    FrIa05Penilaian.findOne({
      where: {
        id_peserta,
      },
      order: [["tanggal_penilaian", "DESC"], ["id_penilaian", "DESC"]],
    }),

    HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta,
      },
      order: [["tanggal_keputusan", "DESC"], ["id_keputusan", "DESC"]],
    }),
  ]);

  return {
    presensi: Boolean(presensi),
    apl01: Boolean(apl01),
    apl02: Boolean(apl02),
    fria05: Boolean(fria05),
    keputusan: Boolean(keputusan),

    presensi_data: presensi,
    apl01_data: apl01,
    apl02_data: apl02,
    fria05_data: fria05,
    keputusan_data: keputusan,

    total_lengkap: [
      Boolean(presensi),
      Boolean(apl01),
      Boolean(apl02),
      Boolean(fria05),
    ].filter(Boolean).length,

    total_wajib: 4,
  };
};

/* =========================
GET PESERTA BY JADWAL
GET /api/asesor/jadwal/:id_jadwal/peserta
========================= */

const getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        status: "error",
        message: "ID jadwal wajib dikirim",
      });
    }

    const jadwalAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
      },
    });

    if (!jadwalAsesor) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke jadwal ini",
      });
    }

    const data = await PesertaJadwal.findAll({
      where: {
        id_jadwal,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["password", "password_hash"],
          },
        },
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          required: false,
        },
        {
          model: Jadwal,
          as: "jadwal",
          required: false,
        },
      ],
      order: [["id_peserta", "ASC"]],
    });

    const result = [];

    for (const item of data) {
      const plain = item.toJSON ? item.toJSON() : item;
      // PERBAIKAN: Antisipasi jika `id_peserta` dalam plain terdefinisi menggunakan key `.id`
      const idPesertaValid = plain.id_peserta || plain.id;
      const kelengkapan = await getKelengkapanPeserta(idPesertaValid);

      const nilaiFria05 = kelengkapan.fria05_data?.nilai;
      const hasilFria05 = kelengkapan.fria05_data?.hasil;
      const keputusan = kelengkapan.keputusan_data;

      result.push({
        ...plain,

        id_peserta: idPesertaValid,
        id_jadwal: plain.id_jadwal,
        id_user: plain.id_user,

        nama_lengkap: getNamaAsesi(plain),
        nik: getNikAsesi(plain),
        email: getEmailAsesi(plain),
        no_hp: getNoHpAsesi(plain),

        status_asesmen: normalizeStatusAsesmen(
          keputusan?.hasil || plain.status_asesmen
        ),

        nilai_akhir:
          plain.nilai_akhir !== null && plain.nilai_akhir !== undefined
            ? plain.nilai_akhir
            : nilaiFria05 || "",

        keterangan:
          plain.keterangan || keputusan?.catatan_asesor || "",

        hasil_keputusan: keputusan || null,

        fria05_penilaian: kelengkapan.fria05_data || null,

        nilai_fria05: nilaiFria05 || null,
        hasil_fria05: hasilFria05 || null,

        kelengkapan,

        user: plain.user || {},
        profileAsesi: plain.profileAsesi || {},
      });
    }

    return res.json({
      status: "success",
      message: "Data peserta jadwal berhasil diambil",
      data: result,
    });
  } catch (err) {
    console.error("GET PESERTA BY JADWAL ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

/* =========================
UPDATE NILAI PESERTA
PUT /api/asesor/peserta/:id/nilai
========================= */

const updateNilaiPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const { status_asesmen, nilai_akhir, keterangan } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID peserta wajib dikirim",
      });
    }

    const peserta = await PesertaJadwal.findByPk(id);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const jadwalAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal: peserta.id_jadwal,
        id_user,
      },
    });

    if (!jadwalAsesor) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses untuk menilai peserta pada jadwal ini",
      });
    }

    await peserta.update({
      status_asesmen:
        status_asesmen !== undefined && status_asesmen !== null
          ? normalizeStatusAsesmen(status_asesmen)
          : peserta.status_asesmen,

      nilai_akhir:
        nilai_akhir !== undefined && nilai_akhir !== null && nilai_akhir !== ""
          ? nilai_akhir
          : peserta.nilai_akhir,

      keterangan:
        keterangan !== undefined ? keterangan : peserta.keterangan,
    });

    await peserta.reload();

    return res.json({
      status: "success",
      message: "Nilai peserta berhasil diupdate",
      data: peserta,
    });
  } catch (err) {
    console.error("UPDATE NILAI PESERTA ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

module.exports = {
  getPesertaByJadwal,
  updateNilaiPeserta,
};