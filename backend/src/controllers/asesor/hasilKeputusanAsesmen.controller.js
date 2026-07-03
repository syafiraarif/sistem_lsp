const {
  sequelize,
  HasilKeputusanAsesmen,
  PesertaJadwal,
  JadwalAsesor,
  ProfileAsesor,
  Jadwal,
  ProfileAsesi,
  Presensi,
  Apl01Asesmen,
  Apl02,
  FrIa05Penilaian,
} = require("../../models");

/* =========================
HELPER
========================= */

const normalizeHasil = (hasil) => {
  const value = String(hasil || "").toLowerCase().trim();

  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten") return "belum_kompeten";
  if (value === "belum_kompeten") return "belum_kompeten";

  return null;
};

const normalizeNilai = (nilai) => {
  if (nilai === undefined || nilai === null || nilai === "") return null;

  const number = Number(nilai);

  if (Number.isNaN(number)) return null;

  if (number < 0) return 0;
  if (number > 100) return 100;

  return Number(number.toFixed(2));
};

const getIdAsesor = (req) => {
  return req.user?.id_user || req.user?.id || null;
};

const cekAksesAsesorKePeserta = async ({
  id_peserta,
  id_jadwal,
  id_asesor,
  transaction = null,
}) => {
  const peserta = await PesertaJadwal.findOne({
    where: {
      id_peserta,
      id_jadwal,
    },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        required: false,
      },
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        required: false,
      },
    ],
    transaction,
  });

  if (!peserta) {
    return {
      allowed: false,
      status: 404,
      message: "Peserta tidak ditemukan pada jadwal ini",
      peserta: null,
    };
  }

  const jadwalAsesor = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      id_user: id_asesor,
    },
    transaction,
  });

  if (!jadwalAsesor) {
    return {
      allowed: false,
      status: 403,
      message: "Anda tidak memiliki akses ke jadwal peserta ini",
      peserta,
    };
  }

  return {
    allowed: true,
    status: 200,
    message: "Akses valid",
    peserta,
    jadwalAsesor,
  };
};

const getNilaiFria05 = async (id_peserta, transaction = null) => {
  return FrIa05Penilaian.findOne({
    where: {
      id_peserta,
    },
    order: [["tanggal_penilaian", "DESC"], ["id_penilaian", "DESC"]],
    transaction,
  });
};

const buildKelengkapan = async (id_peserta) => {
  const [presensi, apl01, apl02, fria05, keputusan] = await Promise.all([
    Presensi.findOne({ where: { id_peserta } }),
    Apl01Asesmen.findOne({ where: { id_peserta } }),
    Apl02.findOne({ where: { id_peserta } }),
    getNilaiFria05(id_peserta),
    HasilKeputusanAsesmen.findOne({
      where: { id_peserta },
      order: [["tanggal_keputusan", "DESC"], ["id_keputusan", "DESC"]],
    }),
  ]);

  return {
    presensi: Boolean(presensi),
    apl01: Boolean(apl01),
    apl02: Boolean(apl02),
    fria05: Boolean(fria05),
    keputusan: Boolean(keputusan),
    data: {
      presensi,
      apl01,
      apl02,
      fria05,
      keputusan,
    },
  };
};

const buildResponseKeputusan = async (keputusan) => {
  if (!keputusan) return null;

  const plain = keputusan.toJSON ? keputusan.toJSON() : keputusan;
  const kelengkapan = await buildKelengkapan(plain.id_peserta);

  return {
    ...plain,
    kelengkapan,
  };
};

/* =======================================
SUBMIT HASIL KEPUTUSAN ASESMEN
POST /api/asesor/hasil-keputusan
======================================= */

exports.submitKeputusan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_peserta, id_jadwal, hasil, catatan_asesor, nilai_akhir } =
      req.body;

    const id_asesor = getIdAsesor(req);
    const hasilFinal = normalizeHasil(hasil);

    if (!id_asesor) {
      await t.rollback();

      return res.status(401).json({
        status: "error",
        message: "User asesor tidak valid",
      });
    }

    if (!id_peserta || !id_jadwal) {
      await t.rollback();

      return res.status(400).json({
        status: "error",
        message: "id_peserta dan id_jadwal wajib dikirim",
      });
    }

    if (!hasilFinal) {
      await t.rollback();

      return res.status(400).json({
        status: "error",
        message: "Hasil keputusan wajib kompeten atau belum_kompeten",
      });
    }

    const akses = await cekAksesAsesorKePeserta({
      id_peserta,
      id_jadwal,
      id_asesor,
      transaction: t,
    });

    if (!akses.allowed) {
      await t.rollback();

      return res.status(akses.status).json({
        status: "error",
        message: akses.message,
      });
    }

    const nilaiFria05 = await getNilaiFria05(id_peserta, t);
    const nilaiManual = normalizeNilai(nilai_akhir);

    const nilaiFinal =
      nilaiManual !== null
        ? nilaiManual
        : nilaiFria05?.nilai !== undefined && nilaiFria05?.nilai !== null
        ? Number(nilaiFria05.nilai)
        : 0;

    const catatanFinal =
      catatan_asesor ||
      (hasilFinal === "belum_kompeten"
        ? "Asesi dinyatakan belum kompeten berdasarkan hasil asesmen."
        : "Asesi dinyatakan kompeten berdasarkan hasil asesmen.");

    let keputusan = await HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta,
        id_jadwal,
      },
      transaction: t,
    });

    if (keputusan) {
      await keputusan.update(
        {
          id_asesor,
          hasil: hasilFinal,
          catatan_asesor: catatanFinal,
          tanggal_keputusan: new Date(),
          updated_at: new Date(),
        },
        {
          transaction: t,
        }
      );
    } else {
      keputusan = await HasilKeputusanAsesmen.create(
        {
          id_peserta,
          id_jadwal,
          id_asesor,
          hasil: hasilFinal,
          catatan_asesor: catatanFinal,
          tanggal_keputusan: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          transaction: t,
        }
      );
    }

    await PesertaJadwal.update(
      {
        id_asesor,
        status_asesmen: hasilFinal,
        nilai_akhir: nilaiFinal,
        keterangan: catatanFinal,
        waktu_selesai: new Date(),
      },
      {
        where: {
          id_peserta,
          id_jadwal,
        },
        transaction: t,
      }
    );

    await t.commit();

    const keputusanTerbaru = await HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta,
        id_jadwal,
      },
      include: [
        {
          model: ProfileAsesor,
          as: "asesor",
          required: false,
        },
        {
          model: PesertaJadwal,
          as: "peserta",
          required: false,
          include: [
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
        },
        {
          model: Jadwal,
          as: "jadwal",
          required: false,
        },
      ],
    });

    return res.json({
      status: "success",
      message: "Keputusan asesmen berhasil disimpan",
      data: await buildResponseKeputusan(keputusanTerbaru),
    });
  } catch (err) {
    await t.rollback();

    console.error("SUBMIT HASIL KEPUTUSAN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal menyimpan keputusan asesmen",
      error: err.message,
    });
  }
};

/* =======================================
GET KEPUTUSAN ASESMEN
GET /api/asesor/hasil-keputusan/:id_peserta
======================================= */

exports.getKeputusan = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const id_asesor = getIdAsesor(req);

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
      },
      include: [
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
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const akses = await cekAksesAsesorKePeserta({
      id_peserta,
      id_jadwal: peserta.id_jadwal,
      id_asesor,
    });

    if (!akses.allowed) {
      return res.status(akses.status).json({
        status: "error",
        message: akses.message,
      });
    }

    const keputusan = await HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta,
        id_jadwal: peserta.id_jadwal,
      },
      include: [
        {
          model: ProfileAsesor,
          as: "asesor",
          required: false,
        },
        {
          model: PesertaJadwal,
          as: "peserta",
          required: false,
          include: [
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
        },
        {
          model: Jadwal,
          as: "jadwal",
          required: false,
        },
      ],
      order: [["tanggal_keputusan", "DESC"], ["id_keputusan", "DESC"]],
    });

    const kelengkapan = await buildKelengkapan(id_peserta);

    if (!keputusan) {
      return res.json({
        status: "success",
        message: "Keputusan belum tersedia",
        data: {
          keputusan: null,
          peserta,
          kelengkapan,
        },
      });
    }

    return res.json({
      status: "success",
      message: "Keputusan asesmen berhasil diambil",
      data: {
        keputusan,
        peserta,
        kelengkapan,
      },
    });
  } catch (err) {
    console.error("GET KEPUTUSAN ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil keputusan asesmen",
      error: err.message,
    });
  }
};

/* =======================================
HASIL AKHIR UNTUK ASESI / ASESOR
GET /api/asesor/hasil-akhir/:id_peserta
======================================= */

exports.getHasilAkhir = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const keputusan = await HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta,
      },
      order: [["tanggal_keputusan", "DESC"], ["id_keputusan", "DESC"]],
    });

    if (!keputusan) {
      return res.status(404).json({
        status: "error",
        message: "Hasil belum tersedia",
      });
    }

    const kelengkapan = await buildKelengkapan(id_peserta);

    if (keputusan.hasil === "belum_kompeten") {
      return res.json({
        status: "success",
        message: "Asesi belum kompeten. FRAK03 dan FRAK04 perlu diisi.",
        data: {
          status_asesmen: "belum_kompeten",
          hasil: keputusan,
          redirect: ["FRAK03", "FRAK04"],
          kelengkapan,
        },
      });
    }

    return res.json({
      status: "success",
      message: "Asesi kompeten",
      data: {
        status_asesmen: "kompeten",
        hasil: keputusan,
        redirect: [],
        kelengkapan,
      },
    });
  } catch (err) {
    console.error("GET HASIL AKHIR ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil hasil akhir",
      error: err.message,
    });
  }
};