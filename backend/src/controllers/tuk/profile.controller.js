const { ProfileTuk, Tuk } = require("../../models");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {

    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      return response.error(res, "Profil TUK tidak ditemukan", 404);
    }

    const tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    response.success(res, "Profil TUK", {
      profile_tuk: profile,
      tuk: tuk
    });

  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {

    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      return response.error(res, "Profil TUK tidak ditemukan", 404);
    }

    await profile.update(req.body);

    response.success(res, "Profil TUK berhasil diperbarui", profile);

  } catch (err) {
    response.error(res, err.message);
  }
};