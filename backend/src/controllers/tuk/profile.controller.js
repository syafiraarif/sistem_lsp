const { ProfileTuk, Tuk, User } = require("../../models");
const response = require("../../utils/response.util");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

/* ===================================================== */
/* GET PROFILE */
/* ===================================================== */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    let tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    let user = null;

    if (!tuk) {
      user = await User.findByPk(userId, {
        attributes: ["username"]
      });

      if (user?.username) {
        tuk = await Tuk.findOne({
          where: { kode_tuk: user.username }
        });
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return response.success(res, "Profil TUK berhasil dimuat", {
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

    let profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      profile = await ProfileTuk.create({ id_user: userId });
    }

    let tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    let user = null;

    if (!tuk) {
      user = await User.findByPk(userId, {
        attributes: ["username"]
      });

      if (user?.username) {
        tuk = await Tuk.findOne({
          where: { kode_tuk: user.username }
        });
      }
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

    // ✅ FIX VALIDASI (biar tidak skip value kosong valid)
    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return response.error(res, "Tidak ada data yang diupdate", 400);
    }

    await profile.update(updateData);

    // 🔥 sync ke tabel TUK
    if (tuk) {
      const tukFields = [
        "alamat",
        "provinsi",
        "kota",
        "kecamatan",
        "kelurahan",
        "kode_pos"
      ];

      const tukUpdateData = {};

      for (const field of tukFields) {
        if (updateData[field]) {
          tukUpdateData[field] = updateData[field];
        }
      }

      if (Object.keys(tukUpdateData).length > 0) {
        await tuk.update(tukUpdateData);
      }
    }

    const updatedProfile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    const updatedTuk = await Tuk.findOne({
      where: {
        [Op.or]: [
          { id_penanggung_jawab: userId },
          user?.username ? { kode_tuk: user.username } : null
        ].filter(Boolean)
      }
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return response.success(res, "Profil berhasil diperbarui", {
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

    // ✅ validasi file
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

    // 🔥 hapus foto lama (SAFE)
    if (profile.foto && typeof profile.foto === "string") {
      const oldPath = path.join(process.cwd(), profile.foto);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // ✅ pakai path dari multer
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