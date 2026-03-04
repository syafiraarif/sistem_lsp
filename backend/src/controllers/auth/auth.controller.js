const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const Tuk = require("../../models/tuk.model"); // ✅ TAMBAHKAN INI
const { secret, expiresIn } = require("../../config/jwt");

exports.login = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi"
      });
    }

    // 🔎 Cari user + role
    const user = await User.findOne({
      where: { username },
      include: [Role]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    // 🔒 Cek status akun
    if (user.status_user !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif"
      });
    }

    // 🔐 Validasi password
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Password salah"
      });
    }

    // ✅ Ambil role
    const roleName = user.role?.role_name?.toLowerCase() || null;

    let idTuk = null;

    // 🔥 Jika role = TUK → ambil id_tuk dari tabel tuk
    if (roleName === "tuk") {

      const tukData = await Tuk.findOne({
        where: {
          kode_tuk: user.username
        }
      });

      if (tukData) {
        idTuk = tukData.id_tuk;
      }

    }

    // 🔐 Generate JWT
    const token = jwt.sign(
      {
        id_user: user.id_user,
        role: roleName,
        id_tuk: idTuk
      },
      secret,
      { expiresIn }
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id_user: user.id_user,
          username: user.username,
          role: roleName,
          id_tuk: idTuk
        }
      }
    });

  } catch (error) {

    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
};

exports.logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logout berhasil"
  });
};