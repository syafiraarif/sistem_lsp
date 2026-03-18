const ProfileAdmin = require("../../models/profileAdmin.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAdmin.findByPk(req.user.id_user);
 
    if (!data) {
      return response.success(res, "Profil admin belum diisi", {});
    }

    response.success(res, "Profil admin ditemukan", data);
  } catch (err) {
    console.error("Get Profile Error:", err);
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;
 
    const bodyData = { ...req.body };

    if (req.file) {
      bodyData.foto = req.file.filename;
    }

    const payload = { ...bodyData, id_user: id_user };

    const existingProfile = await ProfileAdmin.findByPk(id_user);

    if (existingProfile) {
      await ProfileAdmin.update(bodyData, {
        where: { id_user: id_user }
      });
    } else {
      await ProfileAdmin.create(payload);
    }

    response.success(res, "Profil admin berhasil diperbarui");
  } catch (err) {
    console.error("Update Profile Error:", err);
    response.error(res, "Gagal menyimpan profil: " + err.message);
  }
};
