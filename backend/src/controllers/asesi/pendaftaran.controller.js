const Pendaftaran = require("../../models/pendaftaranAsesi.model");
const response = require("../../utils/response.util");

exports.daftar = async (req, res) => {
  try {
    const data = await Pendaftaran.create(req.body);
    response.success(res, "Pendaftaran berhasil", data);
  } catch (err) {
    response.error(res, err.message);
  }
};
