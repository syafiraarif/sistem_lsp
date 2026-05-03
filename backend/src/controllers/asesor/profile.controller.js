const ProfileAsesor = require("../../models/profileAsesor.model");
const response = require("../../utils/response.util");
const fs = require("fs");
const path = require("path");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAsesor.findByPk(req.user.id_user);
    response.success(res, "Profil asesor", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await ProfileAsesor.update(req.body, {
      where: { id_user: req.user.id_user }
    });
    response.success(res, "Profil asesor diperbarui");
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.uploadTTD = async (req, res) => {
  try {
    const file = req.files && req.files['ttd'] ? req.files['ttd'][0] : null;

    if (!file) {
      return response.error(res, "File TTD tidak ditemukan", 400);
    }

    const profileLama = await ProfileAsesor.findByPk(req.user.id_user);

    // Hapus file lama
    if (profileLama && profileLama.ttd_path) {
      const filePathLama = path.join(__dirname, "../../../", profileLama.ttd_path);
      if (fs.existsSync(filePathLama)) {
        fs.unlinkSync(filePathLama);
      }
    }

    // Fix path biar universal
    const ttdPath = file.path.replace(/\\/g, "/");

    const [affectedRows] = await ProfileAsesor.update(
      { ttd_path: ttdPath },
      { where: { id_user: req.user.id_user } }
    );

    if (affectedRows === 0) {
      return response.error(res, "Upload TTD gagal", 404);
    }

    response.success(res, "TTD berhasil disimpan", { ttd_path: ttdPath });

  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};


/*
=====================================
UPLOAD FOTO PROFIL (BARU)
=====================================
*/
exports.uploadFotoProfil = async (req, res) => {
  try {
    const file = req.files && req.files['foto_profil']
      ? req.files['foto_profil'][0]
      : null;

    if (!file) {
      return response.error(res, "File foto profil tidak ditemukan", 400);
    }

    const profileLama = await ProfileAsesor.findByPk(req.user.id_user);

    // Hapus foto lama jika ada
    if (profileLama && profileLama.foto_profil) {
      const oldPath = path.join(__dirname, "../../../", profileLama.foto_profil);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Fix path biar aman
    const fotoPath = file.path.replace(/\\/g, "/");

    const [affectedRows] = await ProfileAsesor.update(
      { foto_profil: fotoPath },
      { where: { id_user: req.user.id_user } }
    );

    if (affectedRows === 0) {
      return response.error(res, "Upload foto profil gagal", 404);
    }

    response.success(res, "Foto profil berhasil disimpan", {
      foto_profil: fotoPath
    });

  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};