const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const ProfileTuk = require("../../models/profileTuk.model");
const response = require("../../utils/response.util");

exports.createTuk = async (req, res) => {
  try {
    const { username, password, ...profile } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash: hash,
      id_role: 4
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
