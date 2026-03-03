// backend/src/controllers/tuk/lupaPasswordTuk.controller.js

const { User } = require("../../models");
const response = require("../../utils/response.util");
const bcrypt = require("bcrypt");

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return response.error(res, "Password lama dan baru wajib diisi", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) return response.error(res, "User tidak ditemukan", 404);

    // Cek apakah user punya password
    if (!user.password_hash) {
      return response.error(res, "Akun ini belum memiliki password", 400);
    }

    // Verifikasi password lama (pake password_hash)
    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) return response.error(res, "Password lama tidak sesuai", 401);

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    return response.success(res, "Password berhasil diperbarui");
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};