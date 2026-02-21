const bcrypt = require("bcryptjs");
const { User, ProfileAsesor, Role } = require("../../models");
const response = require("../../utils/response.util");

exports.createAsesor = async (req, res) => {
  try {
    const { username, password, ...profile } = req.body;

    const role = await Role.findOne({
      where: { role_name: "ASESOR" }
    });

    if (!role) {
      return response.error(res, "Role asesor tidak ditemukan", 500);
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash: hash,
      id_role: role.id_role
    });

    await ProfileAsesor.create({
      id_user: user.id_user,
      ...profile
    });

    response.success(res, "Asesor berhasil dibuat");
  } catch (err) {
    response.error(res, err.message);
  }
};