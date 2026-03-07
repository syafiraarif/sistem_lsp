const { Tuk } = require("../../models");
const response = require("../../utils/response.util");

/* ========================= */
/* GET PROFILE TUK */
/* ========================= */
exports.getProfile = async (req, res) => {
  try {

    const tukId = req.user?.id_tuk;

    if (!tukId) {
      return response.error(res, "ID TUK tidak ditemukan di token", 400);
    }

    const data = await Tuk.findByPk(tukId);

    if (!data) {
      return response.error(res, "Data TUK tidak ditemukan", 404);
    }

    response.success(res, "Profil TUK", data);

  } catch (err) {
    response.error(res, err.message);
  }
};

/* ========================= */
/* UPDATE PROFILE TUK */
/* ========================= */
exports.updateProfile = async (req, res) => {
  try {

    const tukId = req.user?.id_tuk;

    if (!tukId) {
      return response.error(res, "ID TUK tidak ditemukan di token", 400);
    }

    const tuk = await Tuk.findByPk(tukId);

    if (!tuk) {
      return response.error(res, "Data TUK tidak ditemukan", 404);
    }

    await tuk.update(req.body);

    response.success(res, "Profil TUK berhasil diperbarui", tuk);

  } catch (err) {
    response.error(res, err.message);
  }
};