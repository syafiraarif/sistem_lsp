const { Skkni } = require("../../models");
const response = require("../../utils/response.util");

exports.create = async (req, res) => {
  try {
    const data = await Skkni.create(req.body);
    response.success(res, "SKKNI berhasil ditambahkan", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Skkni.findAll();
    response.success(res, "List SKKNI", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Skkni.findByPk(req.params.id);
    if (!data) return response.error(res, "SKKNI tidak ditemukan", 404);
    response.success(res, "Detail SKKNI", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const skkni = await Skkni.findByPk(req.params.id);
    if (!skkni) return response.error(res, "SKKNI tidak ditemukan", 404);

    await skkni.update(req.body);
    response.success(res, "SKKNI berhasil diperbarui", skkni);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const skkni = await Skkni.findByPk(req.params.id);
    if (!skkni) return response.error(res, "SKKNI tidak ditemukan", 404);

    await skkni.destroy();
    response.success(res, "SKKNI berhasil dihapus");
  } catch (err) {
    response.error(res, err.message);
  }
};
