const transporter = require("../config/mailer");

exports.sendAccountEmail = async (email, username, password) => {
  if (!email) {
    throw new Error("Email tujuan kosong");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER atau EMAIL_PASS belum diset di .env");
  }

  return await transporter.sendMail({
    from: `"Sistem LSP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Akun Sistem LSP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Akun Sistem LSP Anda</h2>
        <p>Pendaftaran Anda sudah diverifikasi oleh admin.</p>

        <table style="border-collapse: collapse; margin-top: 12px;">
          <tr>
            <td style="padding: 6px 12px; font-weight: bold;">Username</td>
            <td style="padding: 6px 12px;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-weight: bold;">Password</td>
            <td style="padding: 6px 12px;">${password}</td>
          </tr>
        </table>

        <p style="margin-top: 16px;">
          Silakan login dan segera ganti password Anda.
        </p>
      </div>
    `,
  });
};