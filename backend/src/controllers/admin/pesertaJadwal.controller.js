const { PesertaJadwal, User, Jadwal } = require("../../models");

const getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: [
        { model: User, as: "user" },
        { model: Jadwal, as: "jadwal" }
      ]
    });

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getPesertaByJadwal
};
