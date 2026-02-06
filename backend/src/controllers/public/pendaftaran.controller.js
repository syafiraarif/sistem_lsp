const Pendaftaran = require("../../models/pendaftaranAsesi.model");

exports.create = async (req, res) => {
  try {
    const data = await Pendaftaran.create(req.body);
    res.json({ message: "Pendaftaran berhasil", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
