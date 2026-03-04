const ProfileAsesi = require("../../models/profileAsesi.model");
const response = require("../../utils/response.util");
const fs = require("fs");
const path = require("path");

/* ===================================================== */
/* GET PROFILE */
/* ===================================================== */
exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAsesi.findByPk(req.user.id_user);

    if (!data) {
      return response.error(res, "Profil asesi tidak ditemukan", 404);
    }

    return response.success(res, "Profil asesi", data);

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {

    const [affectedRows] = await ProfileAsesi.update(req.body, {
      where: { id_user: req.user.id_user }
    });

    if (!affectedRows) {
      return response.error(
        res,
        "Tidak ada perubahan atau profil tidak ditemukan",
        404
      );
    }

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);

    return response.success(res, "Profil asesi diperbarui", updatedData);

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.uploadDokumen = async (req, res) => {
  try {

    const files = req.files || {};
    const updateData = {};

    const allowedFields = [
      "pas_foto",
      "ktp",
      "ijazah",
      "transkrip",
      "kk",
      "surat_kerja"
    ];

    allowedFields.forEach((field) => {
      if (files[field] && files[field][0]) {
        updateData[field] = files[field][0].path.replace(/\\/g, "/");
      }
    });

    if (Object.keys(updateData).length === 0) {
      return response.error(res, "Tidak ada file yang diupload", 400);
    }

    const [affectedRows] = await ProfileAsesi.update(updateData, {
      where: { id_user: req.user.id_user }
    });

    if (!affectedRows) {
      return response.error(
        res,
        "Upload gagal atau profil tidak ditemukan",
        404
      );
    }

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);

    return response.success(res, "Dokumen berhasil diupload", updatedData);

  } catch (err) {
    console.error("UPLOAD DOKUMEN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.uploadTTD = async (req, res) => {
  try {

    const { ttd_base64 } = req.body;

    if (!ttd_base64 || typeof ttd_base64 !== "string") {
      return response.error(res, "Tanda tangan tidak ditemukan", 400);
    }

    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (profile?.ttd_path) {

      const oldPath = path.join(
        process.cwd(),
        profile.ttd_path
      );

      if (fs.existsSync(oldPath)) {
        await fs.promises.unlink(oldPath);
      }
    }

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "ttd",
      "asesi"
    );

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const base64Data = ttd_base64.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    if (!base64Data) {
      return response.error(res, "Format TTD tidak valid", 400);
    }

    const fileName = `ttd_${req.user.id_user}.png`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(
      filePath,
      Buffer.from(base64Data, "base64")
    );

    const ttdPath = path.join(
      "uploads",
      "ttd",
      "asesi",
      fileName
    ).replace(/\\/g, "/");

    const [affectedRows] = await ProfileAsesi.update(
      { ttd_path: ttdPath },
      { where: { id_user: req.user.id_user } }
    );

    if (!affectedRows) {
      return response.error(res, "Gagal menyimpan TTD", 404);
    }

    return response.success(res, "TTD berhasil diperbarui", {
      ttd_path: ttdPath
    });

  } catch (err) {
    console.error("UPLOAD TTD ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.getFiles = async (req, res) => {
  try {

    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (!profile) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const data = {
      pas_foto: profile.pas_foto
        ? `${baseUrl}/${profile.pas_foto}`
        : null,

      ktp: profile.ktp
        ? `${baseUrl}/${profile.ktp}`
        : null,

      ijazah: profile.ijazah
        ? `${baseUrl}/${profile.ijazah}`
        : null,

      transkrip: profile.transkrip
        ? `${baseUrl}/${profile.transkrip}`
        : null,

      kk: profile.kk
        ? `${baseUrl}/${profile.kk}`
        : null,

      surat_kerja: profile.surat_kerja
        ? `${baseUrl}/${profile.surat_kerja}`
        : null,

      ttd: profile.ttd_path
        ? `${baseUrl}/${profile.ttd_path}`
        : null
    };

    return response.success(res, "File berhasil diambil", data);

  } catch (err) {
    console.error("GET FILES ERROR:", err);
    return response.error(res, err.message);
  }
};