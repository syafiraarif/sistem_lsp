const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, Tuk } = require("../../models");
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

    if (user.status_user !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif"
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Password salah"
      });
    }

    const roleName = user.role?.role_name?.toLowerCase() || null;
    let idTuk = null;

    // 🔥 PERBAIKAN: Cari TUK dengan 3 cara (FLEKSIBEL)
    if (roleName === "tuk") {
      // Cara 1: id_penanggung_jawab = user.id_user
      let tukData = await Tuk.findOne({
        where: { id_penanggung_jawab: user.id_user }
      });

      // Cara 2: Jika gagal, cari berdasarkan kode_tuk = username
      if (!tukData) {
        tukData = await Tuk.findOne({
          where: { 
            kode_tuk: user.username,
            status: 'aktif'
          }
        });
      }

      // Cara 3: Jika masih gagal, cari TUK pertama yang aktif untuk user ini
      if (!tukData) {
        tukData = await Tuk.findOne({
          where: { status: 'aktif' },
          order: [['created_at', 'ASC']]
        });
      }

      if (tukData) {
        idTuk = tukData.id_tuk;
        console.log(`✅ TUK ditemukan: ${tukData.kode_tuk} (id: ${idTuk}) untuk user ${user.username}`);
      } else {
        console.log(`⚠️ TUK TIDAK DITEMUKAN untuk ${user.username} (id_user: ${user.id_user})`);
      }
    }

    const token = jwt.sign(
      {
        id_user: user.id_user,
        username: user.username, // 🔥 Tambah untuk logging
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