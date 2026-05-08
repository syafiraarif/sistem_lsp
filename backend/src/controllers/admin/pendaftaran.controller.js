const Pendaftaran = require("../../models/pendaftaranAsesi.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");
const Notifikasi = require("../../models/notifikasi.model");
const { createNotifikasi } = require("../../services/notifikasi.service");
const { sendAccountEmail } = require("../../services/email.service");
const response = require("../../utils/response.util");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    const data = await Pendaftaran.findAll({
      order: [["tanggal_daftar", "DESC"]],
    });

    return response.success(res, "List pendaftaran asesi", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.approvePendaftaran = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id, {
      transaction: t,
    });

    if (!pendaftaran) {
      await t.rollback();
      return response.error(res, "Data tidak ditemukan", 404);
    }

    if (pendaftaran.status !== "pending") {
      await t.rollback();
      return response.error(res, "Pendaftaran sudah diproses", 400);
    }

    let roleAsesi = await Role.findOne({
      where: { role_name: "ASESI" },
      transaction: t,
    });

    if (!roleAsesi) {
      roleAsesi = await Role.create(
        {
          role_name: "ASESI",
        },
        { transaction: t }
      );
    }

    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: pendaftaran.email }, { username: pendaftaran.nik }],
      },
      transaction: t,
    });

    let rawPassword = null;
    let isNewUser = false;

    if (!user) {
      const { createUser } = require("../../services/account.service");

      const created = await createUser(
        {
          username: pendaftaran.nik,
          email: pendaftaran.email,
          no_hp: pendaftaran.no_hp,
          id_role: roleAsesi.id_role,
        },
        { transaction: t }
      );

      user = created.user;
      rawPassword = created.rawPassword;
      isNewUser = true;
    }

    let profile = await ProfileAsesi.findOne({
      where: { nik: pendaftaran.nik },
      transaction: t,
    });

    if (!profile) {
      await ProfileAsesi.create(
        {
          id_user: user.id_user,
          nik: pendaftaran.nik,
          nama_lengkap: pendaftaran.nama_lengkap,
          provinsi: pendaftaran.provinsi,
          kota: pendaftaran.kota,
          kecamatan: pendaftaran.kecamatan,
          kelurahan: pendaftaran.kelurahan,
          alamat: pendaftaran.alamat_lengkap,

          pendidikan_terakhir:
            pendaftaran.pendidikan_terakhir ||
            pendaftaran.program_studi ||
            null,

          pekerjaan: pendaftaran.pekerjaan || null,
          jabatan: pendaftaran.jabatan || null,
          nama_perusahaan: pendaftaran.nama_perusahaan || null,
          alamat_perusahaan: pendaftaran.alamat_perusahaan || null,
          telp_perusahaan: pendaftaran.telp_perusahaan || null,
          fax_perusahaan: pendaftaran.fax_perusahaan || null,
          email_perusahaan: pendaftaran.email_perusahaan || null,
        },
        { transaction: t }
      );
    } else {
      await profile.update(
        {
          id_user: profile.id_user || user.id_user,

          nama_lengkap: profile.nama_lengkap || pendaftaran.nama_lengkap,
          provinsi: profile.provinsi || pendaftaran.provinsi,
          kota: profile.kota || pendaftaran.kota,
          kecamatan: profile.kecamatan || pendaftaran.kecamatan,
          kelurahan: profile.kelurahan || pendaftaran.kelurahan,
          alamat: profile.alamat || pendaftaran.alamat_lengkap,

          pendidikan_terakhir:
            profile.pendidikan_terakhir ||
            pendaftaran.pendidikan_terakhir ||
            pendaftaran.program_studi ||
            null,

          pekerjaan: profile.pekerjaan || pendaftaran.pekerjaan || null,
          jabatan: profile.jabatan || pendaftaran.jabatan || null,
          nama_perusahaan:
            profile.nama_perusahaan || pendaftaran.nama_perusahaan || null,
          alamat_perusahaan:
            profile.alamat_perusahaan || pendaftaran.alamat_perusahaan || null,
          telp_perusahaan:
            profile.telp_perusahaan || pendaftaran.telp_perusahaan || null,
          fax_perusahaan:
            profile.fax_perusahaan || pendaftaran.fax_perusahaan || null,
          email_perusahaan:
            profile.email_perusahaan || pendaftaran.email_perusahaan || null,
        },
        { transaction: t }
      );
    }

    await pendaftaran.update(
      {
        status: "approved",
      },
      { transaction: t }
    );

    await t.commit();

    let statusKirim = "terkirim";

    if (isNewUser && rawPassword) {
      try {
        await sendAccountEmail(user.email, user.username, rawPassword);
      } catch (err) {
        console.error("Gagal kirim email akun:", err.message);
        statusKirim = "gagal";
      }
    } else {
      statusKirim = "tidak_dikirim";
    }

    await createNotifikasi({
      channel: "email",
      tujuan: user.email,
      pesan: isNewUser
        ? `Akun asesi berhasil dibuat. Username: ${user.username}`
        : `Pendaftaran asesi berhasil diverifikasi. Akun sudah tersedia. Username: ${user.username}`,
      status_kirim: statusKirim,
      ref_type: "akun",
      ref_id: user.id_user,
    });

    return response.success(res, "Pendaftaran berhasil di-approve", {
      user_status: isNewUser ? "created" : "existing",
      username: user.username,
    });
  } catch (err) {
    await t.rollback();

    console.error("APPROVE PENDAFTARAN ERROR:", err);

    return response.error(res, err.message);
  }
};

exports.rejectPendaftaran = async (req, res) => {
  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id);

    if (!pendaftaran) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    if (pendaftaran.status !== "pending") {
      return response.error(
        res,
        "Pendaftaran sudah diproses sebelumnya",
        400
      );
    }

    await pendaftaran.update({
      status: "rejected",
    });

    await Notifikasi.create({
      channel: "email",
      tujuan: pendaftaran.email,
      pesan: "Pendaftaran Anda ditolak oleh admin",
      waktu_kirim: new Date(),
      status_kirim: "terkirim",
      ref_type: "pendaftaran",
      ref_id: pendaftaran.id_pendaftaran,
    });

    return response.success(res, "Pendaftaran berhasil ditolak");
  } catch (err) {
    console.error("REJECT PENDAFTARAN ERROR:", err);
    return response.error(res, err.message);
  }
};