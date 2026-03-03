const DokumenMutu = require("../../models/dokumenMutu.model");
const response = require("../../utils/response.util");

exports.createDokumen = async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.files?.file_dokumen) {
      body.file_dokumen = req.files.file_dokumen[0].filename;
    }

    if (req.files?.file_pendukung) {
      body.file_pendukung = req.files.file_pendukung[0].filename;
    }

    const data = await DokumenMutu.create(body);

    response.success(res, "Dokumen berhasil ditambahkan", data);
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};


exports.getAllDokumen = async (req, res) => {
  try {
    const data = await DokumenMutu.findAll({
      order: [["created_at", "DESC"]],
    });

    response.success(res, "List dokumen mutu", data);
  } catch (err) {
    response.error(res, "Terjadi kesalahan server");
  }
};


exports.updateDokumen = async (req, res) => {
  try {
    const { id } = req.params;

    const dok = await DokumenMutu.findByPk(id);
    if (!dok) {
      return response.error(res, "Dokumen tidak ditemukan", 404);
    }

    const body = { ...req.body };

    if (req.files?.file_dokumen) {
      body.file_dokumen = req.files.file_dokumen[0].filename;
    }

    if (req.files?.file_pendukung) {
      body.file_pendukung = req.files.file_pendukung[0].filename;
    }

    await dok.update(body);

    response.success(res, "Dokumen berhasil diupdate", dok);
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};


exports.deleteDokumen = async (req, res) => {
  try {
    const { id } = req.params;

    const dok = await DokumenMutu.findByPk(id);
    if (!dok) {
      return response.error(res, "Dokumen tidak ditemukan", 404);
    }

    await dok.destroy();

    response.success(res, "Dokumen berhasil dihapus");
  } catch (err) {
    response.error(res, "Terjadi kesalahan server");
  }
};