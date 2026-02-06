const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const response = require("../../utils/response.util");

exports.createAsesor = async (req, res) => {
  try {
    const { username, password, ...profile } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash: hash,
      id_role: 3
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