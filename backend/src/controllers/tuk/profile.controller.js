const { ProfileTuk, Tuk, User } = require("../../models");
const response = require("../../utils/response.util");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

/* ===================================================== */
/* HELPER USERNAME / KODE TUK */
/* ===================================================== */

const cleanUsername = (value) => {
  if (!value) return "";

  return String(value)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toUpperCase();
};

const generateUsernameTuk = (userId) => {
  return `TUK-${String(userId).padStart(6, "0")}`;
};

/* ===================================================== */
/* GET PROFILE */
/* ===================================================== */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const user = await User.findByPk(userId, {
      attributes: ["id_user", "username", "email", "no_hp", "status_user"]
    });

    if (!user) {
      return response.error(res, "User tidak ditemukan", 404);
    }

    const profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    let tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    if (!tuk && user?.username) {
      tuk = await Tuk.findOne({
        where: { kode_tuk: user.username }
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return response.success(res, "Profil TUK berhasil dimuat", {
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        no_hp: user.no_hp,
        status_user: user.status_user
      },
      profile_tuk: profile
        ? {
            ...profile.toJSON(),
            foto_url: profile.foto
              ? `${baseUrl}/${profile.foto}`
              : null
          }
        : null,
      tuk: tuk || null
    });

  } catch (err) {
    console.error("GetProfile Error:", err);
    return response.error(res, err.message);
  }
};


/* ===================================================== */
/* UPDATE PROFILE */
/* ===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return response.error(res, "User tidak ditemukan", 404);
    }

    let profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      profile = await ProfileTuk.create({ id_user: userId });
    }

    let tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    if (!tuk && user?.username) {
      tuk = await Tuk.findOne({
        where: { kode_tuk: user.username }
      });
    }

    const requestedUsername = cleanUsername(
      req.body.username || req.body.kode_tuk || user.username
    );

    const finalUsername =
      requestedUsername || generateUsernameTuk(userId);

    if (finalUsername.length < 3) {
      return response.error(res, "Username / Kode TUK minimal 3 karakter", 400);
    }

    const existingUser = await User.findOne({
      where: {
        username: finalUsername,
        id_user: { [Op.ne]: userId }
      }
    });

    if (existingUser) {
      return response.error(res, "Username sudah digunakan", 400);
    }

    const existingTuk = await Tuk.findOne({
      where: {
        kode_tuk: finalUsername,
        ...(tuk?.id_tuk
          ? { id_tuk: { [Op.ne]: tuk.id_tuk } }
          : {})
      }
    });

    if (existingTuk) {
      return response.error(res, "Kode TUK / username sudah digunakan", 400);
    }

    const allowedFields = [
      "nik",
      "jenis_kelamin",
      "tempat_lahir",
      "tanggal_lahir",
      "alamat",
      "provinsi",
      "kota",
      "kecamatan",
      "kelurahan",
      "kode_pos"
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        updateData[field] = req.body[field];
      }
    }

    const usernameChanged = user.username !== finalUsername;

    if (Object.keys(updateData).length === 0 && !usernameChanged) {
      return response.error(res, "Tidak ada data yang diupdate", 400);
    }

    if (usernameChanged) {
      await user.update({
        username: finalUsername
      });
    }

    if (Object.keys(updateData).length > 0) {
      await profile.update(updateData);
    }

    const tukUpdateData = {
      kode_tuk: finalUsername,
      id_penanggung_jawab: userId
    };

    const tukFields = [
      "alamat",
      "provinsi",
      "kota",
      "kecamatan",
      "kelurahan",
      "kode_pos"
    ];

    for (const field of tukFields) {
      if (updateData[field]) {
        tukUpdateData[field] = updateData[field];
      }
    }

    if (req.body.nama_tuk !== undefined && req.body.nama_tuk !== null && req.body.nama_tuk !== "") {
      tukUpdateData.nama_tuk = req.body.nama_tuk;
    }

    if (req.body.telepon !== undefined && req.body.telepon !== null && req.body.telepon !== "") {
      tukUpdateData.telepon = req.body.telepon;
    }

    if (req.body.email !== undefined && req.body.email !== null && req.body.email !== "") {
      tukUpdateData.email = req.body.email;
    }

    if (tuk) {
      await tuk.update(tukUpdateData);
    } else {
      await Tuk.create({
        kode_tuk: finalUsername,
        nama_tuk: req.body.nama_tuk || `TUK ${finalUsername}`,
        jenis_tuk: req.body.jenis_tuk || "mandiri",
        institusi_induk: req.body.institusi_induk || null,
        telepon: req.body.telepon || user.no_hp || null,
        email: req.body.email || user.email || null,
        alamat: req.body.alamat || null,
        provinsi: req.body.provinsi || null,
        kota: req.body.kota || null,
        kecamatan: req.body.kecamatan || null,
        kelurahan: req.body.kelurahan || null,
        kode_pos: req.body.kode_pos || null,
        status: "aktif",
        id_penanggung_jawab: userId
      });
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: ["id_user", "username", "email", "no_hp", "status_user"]
    });

    const updatedProfile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    const updatedTuk = await Tuk.findOne({
      where: {
        [Op.or]: [
          { id_penanggung_jawab: userId },
          { kode_tuk: finalUsername }
        ]
      }
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return response.success(res, "Profil berhasil diperbarui", {
      user: updatedUser,
      profile_tuk: {
        ...updatedProfile.toJSON(),
        foto_url: updatedProfile.foto
          ? `${baseUrl}/${updatedProfile.foto}`
          : null
      },
      tuk: updatedTuk || null
    });

  } catch (err) {
    console.error("UpdateProfile Error:", err);
    return response.error(res, err.message);
  }
};


/* ===================================================== */
/* UPLOAD FOTO TUK */
/* ===================================================== */
exports.uploadFoto = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    if (!req.files || !req.files.foto) {
      return response.error(res, "Tidak ada file foto yang diupload", 400);
    }

    const file = req.files.foto[0];

    let profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      profile = await ProfileTuk.create({ id_user: userId });
    }

    if (profile.foto && typeof profile.foto === "string") {
      const oldPath = path.join(process.cwd(), profile.foto);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const fotoPath = file.path.replace(/\\/g, "/");

    await profile.update({
      foto: fotoPath
    });

    const updatedProfile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return response.success(res, "Foto berhasil diperbarui", {
      ...updatedProfile.toJSON(),
      foto_url: updatedProfile.foto
        ? `${baseUrl}/${updatedProfile.foto}`
        : null
    });

  } catch (err) {
    console.error("UPLOAD FOTO ERROR:", err);
    return response.error(res, err.message);
  }
};