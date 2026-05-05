const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
const response = require("../../utils/response.util");

exports.changePassword = async (req, res) => {
  try {
    // 🔐 ambil user dari token
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "Unauthorized", 401);
    }

    const { old_password, new_password } = req.body;

    // ✅ validasi input
    if (!old_password || !new_password) {
      return response.error(res, "Password lama dan baru wajib diisi", 400);
    }

    // ✅ minimal password
    if (new_password.length < 6) {
      return response.error(res, "Password baru minimal 6 karakter", 400);
    }

    // 🔥 ambil user
    const user = await User.findByPk(userId);

    if (!user) {
      return response.error(res, "User tidak ditemukan", 404);
    }

    // 🔥 verifikasi password lama
    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      return response.error(res, "Password lama tidak sesuai", 401);
    }

    // 🔥 hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // 🔥 update password
    user.password_hash = hashedPassword;
    await user.save();

    return response.success(res, "Password berhasil diperbarui");

  } catch (err) {
    console.error("CHANGE PASSWORD ASESOR ERROR:", err);
    return response.error(res, err.message);
  }
};