const bcrypt = require("bcryptjs");
const { User, ProfileTuk, Role } = require("../../models");
const response = require("../../utils/response.util");

exports.createTuk = async (req, res) => {
  try {
    const { username, password, ...profile } = req.body;

    const role = await Role.findOne({
      where: { role_name: "TUK" }
    });

    if (!role) {
      return response.error(res, "Role tuk tidak ditemukan", 500);
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash: hash,
      id_role: role.id_role
    });

    await ProfileTuk.create({
      id_user: user.id_user,
      ...profile
    });

    response.success(res, "Akun TUK berhasil dibuat");
  } catch (err) {
    response.error(res, err.message);
  }
};