
const Pendaftaran = require("../../models/pendaftaranAsesi.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");
const Notifikasi = require("../../models/notifikasi.model");
const { createNotifikasi } = require("../../services/notifikasi.service");
const { sendAccountEmail } = require("../../services/email.service");
const response = require("../../utils/response.util");
const sequelize = require("../../config/database");

const normalizeText = (value) => String(value || "").trim();

const normalizeEmail = (value) =>
  normalizeText(value).toLowerCase();

const buildProfileData = (pendaftaran, idUser) => ({
  id_user: idUser,
  nik: normalizeText(pendaftaran.nik),
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
});

exports.getAll = async (req, res) => {
  try {
    const data = await Pendaftaran.findAll({
      order: [["tanggal_daftar", "DESC"]],
    });

    return response.success(res, "List pendaftaran asesi", data);
  } catch (err) {
    console.error("GET PENDAFTARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.approvePendaftaran = async (req, res) => {
  let transaction = null;
  let user = null;
  let rawPassword = null;
  let createdNewUser = false;
  let reusedExistingUser = false;

  try {
    transaction = await sequelize.transaction();

    const pendaftaran = await Pendaftaran.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!pendaftaran) {
      await transaction.rollback();
      return response.error(res, "Data pendaftaran tidak ditemukan", 404);
    }

    if (pendaftaran.status !== "pending") {
      await transaction.rollback();
      return response.error(
        res,
        "Pendaftaran sudah diproses",
        400
      );
    }

    const nik = normalizeText(pendaftaran.nik);
    const email = normalizeEmail(pendaftaran.email);

    if (!nik || !email) {
      await transaction.rollback();
      return response.error(
        res,
        "NIK dan email pendaftar wajib tersedia",
        400
      );
    }

    let roleAsesi = await Role.findOne({
      where: {
        role_name: "ASESI",
      },
      transaction,
    });

    if (!roleAsesi) {
      roleAsesi = await Role.create(
        {
          role_name: "ASESI",
        },
        {
          transaction,
        }
      );
    }

    const [userByEmail, userByUsername] = await Promise.all([
      User.findOne({
        where: {
          email,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
      User.findOne({
        where: {
          username: nik,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
    ]);

    if (
      userByEmail &&
      userByUsername &&
      String(userByEmail.id_user) !== String(userByUsername.id_user)
    ) {
      await transaction.rollback();

      return response.error(
        res,
        "Email dan NIK terhubung dengan dua akun berbeda. Periksa data akun terlebih dahulu.",
        400
      );
    }

    const existingUser = userByEmail || userByUsername;

    if (existingUser) {
      const usernameSama =
        normalizeText(existingUser.username) === nik;

      const emailSama =
        normalizeEmail(existingUser.email) === email;

      if (!usernameSama || !emailSama) {
        await transaction.rollback();

        return response.error(
          res,
          "NIK atau email sudah dipakai akun lain dengan data berbeda. Periksa akun yang ditemukan sebelum melanjutkan approval.",
          400
        );
      }

      if (
        Number(existingUser.id_role) !== Number(roleAsesi.id_role)
      ) {
        await transaction.rollback();

        return response.error(
          res,
          "Akun dengan NIK dan email tersebut bukan akun berperan ASESI. Approval tidak dapat menggunakan akun itu secara otomatis.",
          400
        );
      }

      user = existingUser;
      reusedExistingUser = true;
    }

    const existingProfile = await ProfileAsesi.findOne({
      where: {
        nik,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingProfile && !user) {
      await transaction.rollback();

      return response.error(
        res,
        "Profil asesi dengan NIK ini sudah ada tetapi akun user yang cocok tidak ditemukan. Periksa hubungan id_user dan nik sebelum melanjutkan.",
        400
      );
    }

    if (
      existingProfile &&
      user &&
      String(existingProfile.id_user) !== String(user.id_user)
    ) {
      await transaction.rollback();

      return response.error(
        res,
        "Profil dengan NIK ini terhubung ke akun lain. Approval dibatalkan untuk menjaga data akun.",
        400
      );
    }

    if (!user) {
      const { createUser } = require("../../services/account.service");

      const created = await createUser(
        {
          username: nik,
          email: normalizeText(pendaftaran.email),
          no_hp: pendaftaran.no_hp,
          id_role: roleAsesi.id_role,
        },
        {
          transaction,
        }
      );

      user = created.user;
      rawPassword = created.rawPassword;
      createdNewUser = true;
    }

    const profileData = buildProfileData(
      pendaftaran,
      user.id_user
    );

    if (existingProfile) {
      await existingProfile.update(profileData, {
        transaction,
      });
    } else {
      await ProfileAsesi.create(profileData, {
        transaction,
      });
    }

    await pendaftaran.update(
      {
        status: "approved",
      },
      {
        transaction,
      }
    );

    await transaction.commit();
    transaction = null;
  } catch (err) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK APPROVE PENDAFTARAN ERROR:",
          rollbackError
        );
      }
    }

    console.error("APPROVE PENDAFTARAN ERROR:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return response.error(
        res,
        "NIK atau email terdeteksi duplikat pada database. Periksa data user dan profil asesi.",
        400
      );
    }

    return response.error(
      res,
      err.message || "Gagal memproses approval pendaftaran"
    );
  }

  let emailStatus = reusedExistingUser
    ? "akun_sudah_ada"
    : "terkirim";

  let emailErrorMessage = null;

  if (createdNewUser) {
    try {
      await sendAccountEmail(
        user.email,
        user.username,
        rawPassword
      );
    } catch (emailErr) {
      console.error("GAGAL KIRIM EMAIL AKUN:", emailErr);

      emailStatus = "gagal";
      emailErrorMessage = emailErr.message;
    }

    try {
      await createNotifikasi({
        channel: "email",
        tujuan: user.email,
        pesan:
          emailStatus === "terkirim"
            ? `Akun asesi berhasil dibuat. Username: ${user.username}`
            : `Akun asesi berhasil dibuat, tetapi email gagal dikirim. Username: ${user.username}`,
        status_kirim: emailStatus,
        ref_type: "akun",
        ref_id: user.id_user,
      });
    } catch (notificationError) {
      console.error(
        "GAGAL MENYIMPAN NOTIFIKASI APPROVAL:",
        notificationError
      );
    }
  }

  const successMessage = reusedExistingUser
    ? "Pendaftaran berhasil di-approve. Akun user yang sesuai sudah ada dan digunakan kembali."
    : "Pendaftaran berhasil di-approve dan akun asesi berhasil dibuat.";

  return response.success(res, successMessage, {
    id_pendaftaran: Number(req.params.id),
    id_user: user.id_user,
    username: user.username,
    email: user.email,
    akun_digunakan_kembali: reusedExistingUser,
    email_status: emailStatus,
    email_error: emailErrorMessage,
    password_default: createdNewUser ? rawPassword : null,
  });
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

exports.deletePendaftaran = async (req, res) => {
  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id);

    if (!pendaftaran) {
      return response.error(
        res,
        "Data pendaftaran tidak ditemukan",
        404
      );
    }

    await pendaftaran.destroy();

    return response.success(
      res,
      "Data pendaftaran berhasil dihapus secara permanen"
    );
  } catch (err) {
    console.error("DELETE PENDAFTARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.bulkDeletePendaftaran = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.error(
        res,
        "Tidak ada data yang dipilih untuk dihapus",
        400
      );
    }

    await Pendaftaran.destroy({
      where: {
        id_pendaftaran: ids,
      },
    });

    return response.success(
      res,
      `${ids.length} data pendaftaran berhasil dihapus`
    );
  } catch (err) {
    console.error("BULK DELETE PENDAFTARAN ERROR:", err);
    return response.error(res, err.message);
  }
};
