// backend/src/controllers/asesor/pesertaJadwal.controller.js

const {
  PesertaJadwal,
  User,
  Jadwal,
  JadwalAsesor,
  ProfileAsesi,
} = require("../../models");

/* =========================
HELPER
========================= */

const normalizeStatusAsesmen = (status) => {
  if (!status) return "belum_kompeten";

  const value = String(status).toLowerCase().trim();

  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten") return "belum_kompeten";
  if (value === "belum_kompeten") return "belum_kompeten";
  if (value === "terdaftar") return "belum_kompeten";
  if (value === "pra_asesmen") return "belum_kompeten";
  if (value === "asesmen") return "belum_kompeten";

  return value;
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

    const result = data.map((item) => {
      const plain = item.toJSON ? item.toJSON() : item;
      const user = plain.user || {};
      const profile = plain.profileAsesi || {};

      return {
        ...plain,

        id_peserta: plain.id_peserta,
        id_jadwal: plain.id_jadwal,
        id_user: plain.id_user,

        nama_lengkap:
          profile.nama_lengkap ||
          profile.nama ||
          user.nama_lengkap ||
          user.nama ||
          user.username ||
          "-",

        nik:
          profile.nik ||
          profile.no_ktp ||
          profile.nomor_identitas ||
          profile.no_identitas ||
          "-",

        email:
          user.email ||
          profile.email ||
          "-",

        no_hp:
          user.no_hp ||
          profile.no_hp ||
          profile.nomor_hp ||
          "-",

        status_asesmen: normalizeStatusAsesmen(plain.status_asesmen),
        nilai_akhir: plain.nilai_akhir,
        keterangan: plain.keterangan,

        user,
        profileAsesi: profile,
      };
    });

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
        message: "Anda tidak memiliki akses untuk menilai peserta pada jadwal ini",
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
        keterangan !== undefined
          ? keterangan
          : peserta.keterangan,
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