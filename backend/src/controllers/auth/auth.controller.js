const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, Tuk } = require("../../models");
const { secret, expiresIn } = require("../../config/jwt");
const transporter = require("../../config/mailer");

const resetExpiresIn = "15m";

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
};

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

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Password salah"
      });
    }

    const roleName =
      user.role?.role_name?.toLowerCase() ||
      null;

    let idTuk = null;

    if (roleName === "tuk") {
      let tukData = await Tuk.findOne({
        where: {
          id_penanggung_jawab: user.id_user
        }
      });

      if (!tukData) {
        tukData = await Tuk.findOne({
          where: {
            kode_tuk: user.username,
            status: "aktif"
          }
        });
      }

      if (!tukData) {
        tukData = await Tuk.findOne({
          where: {
            status: "aktif"
          },
          order: [["created_at", "ASC"]]
        });
      }

      if (tukData) {
        idTuk = tukData.id_tuk;
      }
    }

    const token = jwt.sign(
      {
        id_user: user.id_user,
        username: user.username,
        role: roleName,
        id_tuk: idTuk
      },
      secret,
      {
        expiresIn
      }
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

exports.forgotAccess = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    console.log("====================================");
    console.log("📩 FORGOT ACCESS");
    console.log("📧 Email request:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email wajib diisi"
      });
    }

    const user = await User.findOne({
      where: { email }
    });

    console.log(
      "👤 User ditemukan:",
      user
        ? {
            id_user: user.id_user,
            email: user.email,
            status_user: user.status_user
          }
        : null
    );

    if (!user) {
      console.log("❌ Email tidak terdaftar");

      return res.status(404).json({
        success: false,
        message: "Email tidak terdaftar. Silakan minta admin membuatkan akun terlebih dahulu."
      });
    }

    if (user.status_user !== "aktif") {
      console.log("❌ Akun tidak aktif");

      return res.status(403).json({
        success: false,
        message: "Akun dengan email tersebut tidak aktif. Silakan hubungi admin."
      });
    }

    const resetToken = jwt.sign(
      {
        id_user: user.id_user,
        email: user.email,
        purpose: "reset-access"
      },
      secret,
      {
        expiresIn: "15m"
      }
    );

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    ).replace(/\/+$/, "");

    const resetUrl =
      `${frontendUrl}/reset-akses/${resetToken}`;

    console.log(
      "🔗 Reset URL berhasil dibuat"
    );

    console.log(
      "📤 Mengirim email ke:",
      user.email
    );

    const info = await transporter.sendMail({
      from: {
        name: "SIMLSP",
        address: process.env.EMAIL_USER
      },
      to: user.email,
      replyTo: process.env.EMAIL_USER,
      subject: "Pemulihan Akses SIMLSP",
      text: `Pemulihan akses SIMLSP. Klik link berikut untuk membuat password baru: ${resetUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e2e8f0;">
            <h2 style="color:#071E3D;margin-top:0;">Pemulihan Akses SIMLSP</h2>
            <p style="color:#64748b;line-height:1.7;">
              Anda menerima email ini karena meminta pemulihan akses akun SIMLSP.
            </p>
            <p style="color:#64748b;line-height:1.7;">
              Link pemulihan berikut berlaku selama 15 menit.
            </p>
            <div style="text-align:center;margin:30px 0;">
              <a
                href="${resetUrl}"
                style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;"
              >
                Pulihkan Akses
              </a>
            </div>
            <p style="color:#94a3b8;font-size:13px;line-height:1.6;">
              Jika Anda tidak meminta pemulihan akses, abaikan email ini.
            </p>
          </div>
        </div>
      `
    });

    console.log("✅ EMAIL BERHASIL DIKIRIM");
    console.log("📨 Message ID:", info.messageId);
    console.log("✅ Accepted:", info.accepted);
    console.log("❌ Rejected:", info.rejected);
    console.log("📡 SMTP Response:", info.response);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      message: "Link pemulihan akses telah dikirim ke email Anda."
    });
  } catch (error) {
    console.error("====================================");
    console.error("❌ FORGOT ACCESS ERROR");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Response:", error.response);
    console.error("Response Code:", error.responseCode);
    console.error("Rejected:", error.rejected);
    console.error("Rejected Errors:", error.rejectedErrors);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: "Gagal mengirim link pemulihan akses.",
      error: error.message
    });
  }
};

exports.resetAccess = async (req, res) => {
  try {
    const {
      token,
      password,
      password_confirmation
    } = req.body;

    if (
      !token ||
      !password ||
      !password_confirmation
    ) {
      return res.status(400).json({
        success: false,
        message: "Data reset password belum lengkap"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter"
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "Konfirmasi password tidak sama"
      });
    }

    let payload;

    try {
      payload = jwt.verify(
        token,
        secret
      );
    } catch {
      return res.status(400).json({
        success: false,
        message: "Link pemulihan sudah tidak berlaku atau tidak valid"
      });
    }

    if (payload.purpose !== "reset-access") {
      return res.status(400).json({
        success: false,
        message: "Token pemulihan tidak valid"
      });
    }

    const user = await User.findByPk(
      payload.id_user
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan"
      });
    }

    if (user.status_user !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif"
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    await user.update({
      password_hash: passwordHash
    });

    return res.json({
      success: true,
      message: "Password berhasil diubah. Silakan login kembali."
    });
  } catch (error) {
    console.error(
      "RESET ACCESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal mengubah password."
    });
  }
};

exports.logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logout berhasil"
  });
};