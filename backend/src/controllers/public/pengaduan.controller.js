const Pengaduan = require("../../models/pengaduan.model");

exports.create = async (req, res) => {
  try {
    const data = await Pengaduan.create(req.body);
    res.json({ message: "Pengaduan terkirim", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
