const { Op } = require("sequelize");

const Jawaban = require("../../models/frIa05Jawaban.model");
const Penilaian = require("../../models/frIa05Penilaian.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");
const FrIa05 = require("../../models/frIa05.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesi = require("../../models/profileAsesi.model");

/* =======================================
HELPER
======================================= */

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

const toFileUrl = (req, filePath) => {
  if (!filePath) return null;

  if (String(filePath).startsWith("http")) {
    return filePath;
  }

  return `${getBaseUrl(req)}/${String(filePath)
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")}`;
};

const sanitizeOpsi = (opsi = []) => {
  return opsi.map((item) => ({
    id_opsi: item.id_opsi,
    id_soal: item.id_soal,
    kode_opsi: item.kode_opsi,
    jawaban: item.jawaban,
  }));
};

const sanitizeSoal = (soal = [], req) => {
  return soal
    .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0))
    .map((item) => ({
      id_soal: item.id_soal,
      id_fr_ia_05: item.id_fr_ia_05,
      id_kelompok: item.id_kelompok,
      pertanyaan: item.pertanyaan,
      gambar: item.gambar || null,
      gambar_url: toFileUrl(req, item.gambar),
      urutan: item.urutan,
      kelompok: item.kelompok || null,
      opsi: sanitizeOpsi(item.opsi || []),
    }));
};

const normalizeHasil = (hasil) => {
  const plainHasil = toPlain(hasil);

  if (!plainHasil) return null;

  return {
    id_penilaian: plainHasil.id_penilaian,
    id_peserta: plainHasil.id_peserta,
    id_fr_ia_05: plainHasil.id_fr_ia_05,
    jumlah_benar: Number(plainHasil.jumlah_benar || 0),
    jumlah_salah: Number(plainHasil.jumlah_salah || 0),
    nilai: Number(plainHasil.nilai || 0),
    hasil: plainHasil.hasil || "-",
    umpan_balik: plainHasil.umpan_balik || "",
    catatan: plainHasil.catatan || "",
    tanggal_penilaian: plainHasil.tanggal_penilaian || null,
  };
};

const buildPaketPayload = (paket, peserta, profile, hasil, req) => {
  const plainPaket = toPlain(paket);
  const plainPeserta = toPlain(peserta);
  const plainProfile = toPlain(profile);
  const plainHasil = normalizeHasil(hasil);

  const jadwal = plainPaket?.jadwal || plainPeserta?.jadwal || {};
  const skema = plainPaket?.skema || jadwal?.skema || {};
  const tuk = jadwal?.tuk || {};

  return {
    paket: {
      id_fr_ia_05: plainPaket?.id_fr_ia_05,
      id_jadwal: plainPaket?.id_jadwal,
      id_skema: plainPaket?.id_skema,
      kode_paket: plainPaket?.kode_paket,
      judul_paket: plainPaket?.judul_paket,
      passing_grade: Number(plainPaket?.passing_grade || 70),
      soal: sanitizeSoal(plainPaket?.soal || [], req),
    },

    peserta: {
      id_peserta: plainPeserta?.id_peserta,
      id_jadwal: plainPeserta?.id_jadwal,
      id_user: plainPeserta?.id_user,
      status_asesmen: plainPeserta?.status_asesmen,
      nomor_peserta: plainPeserta?.nomor_peserta,
    },

    profile: {
      id_user: plainProfile?.id_user,
      nama_lengkap: plainProfile?.nama_lengkap || "-",
      nik: plainProfile?.nik || "-",
      ttd_path: plainProfile?.ttd_path || null,
      ttd_url: toFileUrl(req, plainProfile?.ttd_path),
    },

    skema: {
      id_skema: skema?.id_skema || plainPaket?.id_skema,
      kode_skema: skema?.kode_skema || "-",
      judul_skema: skema?.judul_skema || skema?.nama_skema || "-",
    },

    jadwal: {
      id_jadwal: jadwal?.id_jadwal || plainPaket?.id_jadwal,
      nama_kegiatan: jadwal?.nama_kegiatan || "-",
      tgl_awal: jadwal?.tgl_awal || null,
      tgl_akhir: jadwal?.tgl_akhir || null,
      jam: jadwal?.jam || "-",
      status: jadwal?.status || "-",
      pelaksanaan_uji: jadwal?.pelaksanaan_uji || "-",
    },

    tuk: {
      id_tuk: tuk?.id_tuk || jadwal?.id_tuk || null,
      nama_tuk: tuk?.nama_tuk || tuk?.nama || "-",
      alamat: tuk?.alamat || "-",
    },

    hasil: plainHasil,
    already_submitted: Boolean(plainHasil),
  };
};

const findPeserta = async ({ id_peserta, id_user }) => {
  return PesertaJadwal.findOne({
    where: {
      id_peserta,
      id_user,
    },
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
        ],
      },
    ],
  });
};

const findProfileAsesi = async (id_user) => {
  return ProfileAsesi.findOne({
    where: {
      id_user,
    },
  });
};

const findPaketById = async (id_fr_ia_05) => {
  return FrIa05.findByPk(id_fr_ia_05, {
    include: [
      {
        model: Soal,
        as: "soal",
        include: [
          {
            model: Opsi,
            as: "opsi",
            attributes: ["id_opsi", "id_soal", "kode_opsi", "jawaban"],
          },
        ],
      },
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
        ],
      },
      {
        model: Skema,
        as: "skema",
      },
    ],
  });
};

const findPaketByJadwal = async (id_jadwal) => {
  return FrIa05.findOne({
    where: {
      id_jadwal,
    },
    include: [
      {
        model: Soal,
        as: "soal",
        include: [
          {
            model: Opsi,
            as: "opsi",
            attributes: ["id_opsi", "id_soal", "kode_opsi", "jawaban"],
          },
        ],
      },
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
        ],
      },
      {
        model: Skema,
        as: "skema",
      },
    ],
    order: [["id_fr_ia_05", "DESC"]],
  });
};

const validateJadwalOpen = (jadwal) => {
  if (!jadwal) {
    return {
      allowed: false,
      message: "Jadwal tidak ditemukan",
    };
  }

  if (!["open", "ongoing"].includes(jadwal.status)) {
    return {
      allowed: false,
      message: "Ujian belum dibuka",
    };
  }

  return {
    allowed: true,
    message: "Ujian dibuka",
  };
};

/* =======================================
GET PAKET BERDASARKAN JADWAL
GET /api/asesi/fr-ia05/paket-jadwal/:id_jadwal/:id_peserta
======================================= */

exports.getPaketByJadwal = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;

    const peserta = await findPeserta({
      id_peserta,
      id_user: req.user.id_user,
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    if (Number(peserta.id_jadwal) !== Number(id_jadwal)) {
      return res.status(403).json({
        status: "error",
        message: "Peserta tidak terdaftar pada jadwal ini",
      });
    }

    const paket = await findPaketByJadwal(id_jadwal);

    if (!paket) {
      return res.status(404).json({
        status: "error",
        message: "Paket FR.IA.05 belum dibuat oleh komite teknis",
      });
    }

    const hasil = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05: paket.id_fr_ia_05,
      },
    });

    const profile = await findProfileAsesi(req.user.id_user);

    return res.json({
      status: "success",
      message: hasil
        ? "FR.IA.05 sudah dikerjakan"
        : "Paket FR.IA.05 berhasil diambil",
      data: buildPaketPayload(paket, peserta, profile, hasil, req),
    });
  } catch (err) {
    console.error("GET PAKET FRIA05 BY JADWAL ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil paket FR.IA.05",
      error: err.message,
    });
  }
};

/* =======================================
GET SOAL UNTUK ASESI
GET /api/asesi/fr-ia05/:id_fr_ia_05/:id_peserta
======================================= */

exports.getSoal = async (req, res) => {
  try {
    const { id_fr_ia_05, id_peserta } = req.params;

    const peserta = await findPeserta({
      id_peserta,
      id_user: req.user.id_user,
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const paket = await findPaketById(id_fr_ia_05);

    if (!paket) {
      return res.status(404).json({
        status: "error",
        message: "Paket soal tidak ditemukan",
      });
    }

    if (Number(paket.id_jadwal) !== Number(peserta.id_jadwal)) {
      return res.status(403).json({
        status: "error",
        message: "Paket soal tidak sesuai dengan jadwal peserta",
      });
    }

    const hasil = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05,
      },
    });

    const profile = await findProfileAsesi(req.user.id_user);

    return res.json({
      status: "success",
      message: hasil
        ? "FR.IA.05 sudah dikerjakan"
        : "Soal FR.IA.05 berhasil diambil",
      data: buildPaketPayload(paket, peserta, profile, hasil, req),
    });
  } catch (err) {
    console.error("GET SOAL FRIA05 ASESI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil soal FR.IA.05",
      error: err.message,
    });
  }
};

/* =======================================
SUBMIT JAWABAN ASESI
POST /api/asesi/fr-ia05/submit
======================================= */

exports.submit = async (req, res) => {
  const transaction = await Jawaban.sequelize.transaction();

  try {
    const { id_peserta, id_fr_ia_05, jawaban } = req.body;

    if (!id_peserta || !id_fr_ia_05) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "id_peserta dan id_fr_ia_05 wajib dikirim",
      });
    }

    if (!Array.isArray(jawaban) || jawaban.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Jawaban wajib dikirim",
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user,
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
        },
      ],
      transaction,
    });

    if (!peserta) {
      await transaction.rollback();

      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const jadwalStatus = validateJadwalOpen(peserta.jadwal);

    if (!jadwalStatus.allowed) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: jadwalStatus.message,
      });
    }

    const paket = await FrIa05.findByPk(id_fr_ia_05, {
      transaction,
    });

    if (!paket) {
      await transaction.rollback();

      return res.status(404).json({
        status: "error",
        message: "Paket FR.IA.05 tidak ditemukan",
      });
    }

    if (Number(paket.id_jadwal) !== Number(peserta.id_jadwal)) {
      await transaction.rollback();

      return res.status(403).json({
        status: "error",
        message: "Paket FR.IA.05 tidak sesuai dengan jadwal peserta",
      });
    }

    const submitted = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05,
      },
      transaction,
    });

    if (submitted) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Soal sudah dikerjakan dan jawaban sudah dikunci",
      });
    }

    const soalPaket = await Soal.findAll({
      where: {
        id_fr_ia_05,
      },
      transaction,
    });

    if (soalPaket.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Paket soal belum memiliki soal",
      });
    }

    if (jawaban.length !== soalPaket.length) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Semua soal wajib dijawab",
      });
    }

    const soalIds = soalPaket.map((item) => Number(item.id_soal));
    const uniqueSoalJawaban = [
      ...new Set(jawaban.map((item) => Number(item.id_soal))),
    ];

    if (uniqueSoalJawaban.length !== soalPaket.length) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Jawaban tidak valid. Ada soal yang belum dijawab atau duplikat.",
      });
    }

    const invalidSoal = uniqueSoalJawaban.find(
      (id_soal) => !soalIds.includes(Number(id_soal))
    );

    if (invalidSoal) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: `Soal ${invalidSoal} tidak termasuk dalam paket ini`,
      });
    }

    await Jawaban.destroy({
      where: {
        id_peserta,
        id_soal: {
          [Op.in]: soalIds,
        },
      },
      transaction,
    });

    let benar = 0;
    let salah = 0;

    for (const item of jawaban) {
      const opsi = await Opsi.findOne({
        where: {
          id_opsi: item.id_opsi,
          id_soal: item.id_soal,
        },
        transaction,
      });

      if (!opsi) {
        await transaction.rollback();

        return res.status(400).json({
          status: "error",
          message: `Opsi ${item.id_opsi} tidak valid`,
        });
      }

      const isBenar = Boolean(opsi.is_benar);

      if (isBenar) {
        benar++;
      } else {
        salah++;
      }

      await Jawaban.create(
        {
          id_peserta,
          id_soal: item.id_soal,
          id_opsi: item.id_opsi,
          is_benar: isBenar,
          created_at: new Date(),
        },
        {
          transaction,
        }
      );
    }

    const total = soalPaket.length;
    const nilai = Number(((benar / total) * 100).toFixed(2));
    const passingGrade = Number(paket.passing_grade || 70);
    const hasilStatus = nilai >= passingGrade ? "kompeten" : "belum_kompeten";

    const penilaian = await Penilaian.create(
      {
        id_peserta,
        id_fr_ia_05,
        jumlah_benar: benar,
        jumlah_salah: salah,
        nilai,
        hasil: hasilStatus,
        tanggal_penilaian: new Date(),
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return res.json({
      status: "success",
      message: "Submit FR.IA.05 berhasil. Nilai otomatis sudah dihitung.",
      data: normalizeHasil(penilaian),
      hasil: {
        total,
        jumlah_benar: benar,
        jumlah_salah: salah,
        benar,
        salah,
        nilai,
        passing_grade: passingGrade,
        hasil: hasilStatus,
        status: hasilStatus,
      },
    });
  } catch (err) {
    await transaction.rollback();

    console.error("SUBMIT FRIA05 ASESI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal submit FR.IA.05",
      error: err.message,
    });
  }
};

/* =======================================
GET HASIL ASESI
GET /api/asesi/fr-ia05/hasil/:id_fr_ia_05/:id_peserta
======================================= */

exports.getHasil = async (req, res) => {
  try {
    const { id_fr_ia_05, id_peserta } = req.params;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user,
      },
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan",
      });
    }

    const data = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05,
      },
    });

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Belum mengerjakan ujian",
      });
    }

    return res.json({
      status: "success",
      message: "Hasil ujian FR.IA.05 berhasil diambil",
      data: normalizeHasil(data),
    });
  } catch (err) {
    console.error("GET HASIL FRIA05 ASESI ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil hasil FR.IA.05",
      error: err.message,
    });
  }
};


exports.getStatus = async (req, res) => {
  try {

    const { id_peserta } = req.params;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user
      }
    });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    const paket = await FrIa05.findOne({
      where: {
        id_jadwal: peserta.id_jadwal
      },
      order: [["id_fr_ia_05","DESC"]]
    });

    if (!paket) {
      return res.json({
        status: "success",
        data: {
          submitted: false,
          status: "belum"
        }
      });
    }

    const hasil = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05: paket.id_fr_ia_05
      }
    });

    return res.json({
      status: "success",
      data: {
        submitted: !!hasil,
        status: hasil ? "submitted" : "belum",
        id_fr_ia_05: paket.id_fr_ia_05
      }
    });

  } catch(err){

    console.error(err);

    return res.status(500).json({
      status:"error",
      message:"Gagal mengambil status FR.IA.05"
    });

  }
};