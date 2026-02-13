const { BandingAsesmen, User } = require("../../models");

const getAllBanding = async (req, res) => {
  try {
    const data = await BandingAsesmen.findAll({
      include: [{ model: User, as: "user" }],
      order: [["tanggal_ajukan", "DESC"]]
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateStatusBanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_progress, keputusan, catatan_komite } = req.body;

    const banding = await BandingAsesmen.findByPk(id);
    if (!banding) {
      return res.status(404).json({ message: "Banding tidak ditemukan" });
    }

    await banding.update({
      status_progress,
      keputusan,
      catatan_komite,
      tanggal_putusan: keputusan !== "belum_diputus" ? new Date() : null
    });

    res.json({ message: "Banding berhasil diupdate", data: banding });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getAllBanding,
  updateStatusBanding
};
