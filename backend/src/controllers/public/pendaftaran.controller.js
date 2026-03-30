const axios = require("axios");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/database");
const {PendaftaranAsesi, User, Role, ProfileAsesi} = require("../../models");
const response = require("../../utils/response.util");

exports.create = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {
    const { captchaToken, ...payload } = req.body;

    if (!captchaToken) {
      await transaction.rollback();
      return response.error(res, "Captcha wajib diisi", 400);
    }

    const verify = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      }
    );

    if (!verify.data.success) {
      await transaction.rollback();
      return response.error(res, "Captcha tidak valid", 400);
    }

    let roleAsesi = await Role.findOne({
      where: { role_name: "ASESI" },
      transaction
    });

    if (!roleAsesi) {

      roleAsesi = await Role.create(
        { role_name: "ASESI" },
        { transaction }
      );

    }

    const existingEmail = await User.findOne({
      where: { email: payload.email },
      transaction
    });

    if (existingEmail) {
      await transaction.rollback();
      return response.error(res, "Email sudah digunakan");
    }

    const existingNikUser = await User.findOne({
      where: { username: payload.nik },
      transaction
    });

    if (existingNikUser) {
      await transaction.rollback();
      return response.error(res, "NIK sudah digunakan");
    }

    const existingNikProfile = await ProfileAsesi.findOne({
      where: { nik: payload.nik },
      transaction
    });

    if (existingNikProfile) {
      await transaction.rollback();
      return response.error(res, "NIK sudah terdaftar");
    }

    const data = await PendaftaranAsesi.create(
      payload,
      { transaction }
    );

    const hashedPassword = await bcrypt.hash(
      payload.nik,
      10
    );

    const user = await User.create({
      username: payload.nik,
      password_hash: hashedPassword,
      id_role: roleAsesi.id_role,
      email: payload.email,
      no_hp: payload.no_hp
    }, { transaction });

    await ProfileAsesi.create({
      id_user: user.id_user,
      nik: payload.nik,
      nama_lengkap: payload.nama_lengkap,
      provinsi: payload.provinsi,
      kota: payload.kota,
      kecamatan: payload.kecamatan,
      kelurahan: payload.kelurahan,
      alamat: payload.alamat_lengkap
    }, { transaction });

    await transaction.commit();
    return response.success(
      res,
      "Pendaftaran berhasil",
      data
    );
  } catch (err) {

    await transaction.rollback();

    console.error("PENDAFTARAN ERROR:", err);

    return response.error(
      res,
      "Gagal mendaftar"
    );

  }

};