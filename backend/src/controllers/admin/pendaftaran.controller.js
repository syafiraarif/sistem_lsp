const bcrypt = require("bcryptjs");
const Pendaftaran = require("../../models/pendaftaranAsesi.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const User = require("../../models/user.model");
const { sendAccountEmail } = require("../../services/email.service");
const response = require("../../utils/response.util");

exports.getAll = async (req, res) => {
  try {
    const data = await Pendaftaran.findAll();
    response.success(res, "List pendaftaran asesi", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.approvePendaftaran = async (req, res) => {
  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id);
    if (!pendaftaran) return res.status(404).json({ message: "Data tidak ditemukan" });

    const username = pendaftaran.nik;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      username,
      password_hash: hashedPassword,
      id_role: 2,
      email: pendaftaran.email,
      no_hp: pendaftaran.no_hp
    });

    await ProfileAsesi.create({
    id_user: user.id_user,
    nik: pendaftaran.nik,
    nama_lengkap: pendaftaran.nama_lengkap,
    provinsi: pendaftaran.provinsi,
    kota: pendaftaran.kota,
    kecamatan: pendaftaran.kecamatan,
    kelurahan: pendaftaran.kelurahan
    });

    await sendAccountEmail(pendaftaran.email, username, rawPassword);

    response.success(
      res,
      "Akun asesi berhasil dibuat & dikirim ke email"
    );
    } catch (err) {
      response.error(res, err.message);
    }
};