// backend/src/controllers/asesor/pesertaJadwal.controller.js

const { PesertaJadwal, User, Jadwal, JadwalAsesor } = require("../../models");

const getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const jadwalAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
      },
    });

    if (!jadwalAsesor) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses ke jadwal ini",
      });
    }

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: Jadwal,
          as: "jadwal",
        },
      ],
      order: [["id_peserta_jadwal", "ASC"]],
    });

    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

const updateNilaiPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const {
      status_asesmen,
      nilai_akhir,
      keterangan,
    } = req.body;

    const peserta = await PesertaJadwal.findByPk(id);

    if (!peserta) {
      return res.status(404).json({
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
        message: "Anda tidak memiliki akses untuk menilai peserta pada jadwal ini",
      });
    }

    await peserta.update({
      status_asesmen,
      nilai_akhir,
      keterangan,
    });

    return res.json({
      message: "Nilai peserta berhasil diupdate",
      data: peserta,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

module.exports = {
  getPesertaByJadwal,
  updateNilaiPeserta,
};