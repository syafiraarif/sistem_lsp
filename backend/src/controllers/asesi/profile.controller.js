const ProfileAsesi = require("../../models/profileAsesi.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAsesi.findByPk(req.user.id_user);
    response.success(res, "Profil asesi", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await ProfileAsesi.update(req.body, {
      where: { id_user: req.user.id_user }
    });
    response.success(res, "Profil asesi diperbarui");
  } catch (err) {
    response.error(res, err.message);
  }
};
