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

    if (!data) return response.error(res, "Profil asesi tidak ditemukan", 404);

    return response.success(res, "Profil asesi", data);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===================================================== */
/* UPDATE PROFILE */
/* ===================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (!profile) {
      return response.error(res, "Profil tidak ditemukan", 404);
    }

    const [affectedRows] = await ProfileAsesi.update(req.body, {
      where: { id_user: req.user.id_user },
    });

    if (!affectedRows) {
      return response.error(res, "Tidak ada perubahan", 400);
    }

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);
    return response.success(res, "Profil asesi diperbarui", updatedData);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===================================================== */
/* UPLOAD DOKUMEN ASESI */
/* ===================================================== */
exports.uploadDokumen = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return response.error(res, "Tidak ada file yang diupload", 400);
    }

    const allowedFields = [
      "pas_foto",
      "ktp",
      "ijazah",
      "transkrip",
      "kk",
      "surat_kerja",
      "foto_profil",   // ✅ tambahan
      "portofolio",    // ✅ tambahan
    ];

    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (!profile) {
      return response.error(res, "Profil tidak ditemukan", 404);
    }

    const updateData = {};

    const dokumenDir = path.join(process.cwd(), "uploads", "asesi", "dokumen");
    if (!fs.existsSync(dokumenDir)) {
      fs.mkdirSync(dokumenDir, { recursive: true });
    }

    for (const field of allowedFields) {
      if (req.files[field] && req.files[field][0]) {

        // hapus file lama
        if (profile[field]) {
          const oldPath = path.join(process.cwd(), profile[field]);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log(`File lama ${field} berhasil dihapus`);
          }
        }

        const fieldDir = path.join(dokumenDir, field);
        if (!fs.existsSync(fieldDir)) {
          fs.mkdirSync(fieldDir, { recursive: true });
        }

        const fileName = `${field}_${req.user.id_user}${path.extname(req.files[field][0].originalname)}`;
        const filePath = path.join(fieldDir, fileName);

        fs.renameSync(req.files[field][0].path, filePath);

        updateData[field] = path.join(
          "uploads",
          "asesi",
          "dokumen",
          field,
          fileName
        ).replace(/\\/g, "/");

        console.log(`File baru ${field} berhasil diupload`);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return response.error(res, "Tidak ada file valid yang diupload", 400);
    }

    await ProfileAsesi.update(updateData, {
      where: { id_user: req.user.id_user },
    });

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);

    return response.success(res, "Dokumen berhasil diperbarui", updatedData);

  } catch (err) {
    console.error("UPLOAD DOKUMEN ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===================================================== */
/* UPLOAD TTD */
/* ===================================================== */
exports.uploadTTD = async (req, res) => {
  try {
    const { ttd_base64 } = req.body;

    if (!ttd_base64 || typeof ttd_base64 !== "string") {
      return response.error(res, "Tanda tangan tidak ditemukan", 400);
    }

    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (!profile) {
      return response.error(res, "Profil tidak ditemukan", 404);
    }

    if (profile.ttd_path) {
      const oldPath = path.join(process.cwd(), profile.ttd_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const uploadDir = path.join(process.cwd(), "uploads", "asesi", "ttd");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const base64Data = ttd_base64.replace(/^data:image\/\w+;base64,/, "");
    if (!base64Data) return response.error(res, "Format TTD tidak valid", 400);

    const fileName = `ttd_${req.user.id_user}.png`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const ttdPath = path.join("uploads", "asesi", "ttd", fileName).replace(/\\/g, "/");

    await ProfileAsesi.update(
      { ttd_path: ttdPath },
      { where: { id_user: req.user.id_user } }
    );

    return response.success(res, "TTD berhasil diperbarui", { ttd_path: ttdPath });

  } catch (err) {
    console.error("UPLOAD TTD ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===================================================== */
/* GET FILES */
/* ===================================================== */
exports.getFiles = async (req, res) => {
  try {
    const profile = await ProfileAsesi.findByPk(req.user.id_user);

    if (!profile) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const files = [
      "pas_foto",
      "ktp",
      "ijazah",
      "transkrip",
      "kk",
      "surat_kerja",
      "foto_profil",   // ✅ tambahan
      "portofolio",    // ✅ tambahan
      "ttd_path"
    ];

    const data = {};

    files.forEach((key) => {
      const value = profile[key];

      if (value) {
        data[key === "ttd_path" ? "ttd" : key] = `${baseUrl}/${value}`;
      } else {
        data[key === "ttd_path" ? "ttd" : key] = null;
      }
    });

    return response.success(res, "File berhasil diambil", data);

  } catch (err) {
    console.error("GET FILES ERROR:", err);
    return response.error(res, err.message);
  }
};