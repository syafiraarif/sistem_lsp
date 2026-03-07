const { Persyaratan } = require("../../models");
const response = require("../../utils/response.util");

exports.create = async (req, res) => {
  try {
    const data = await Persyaratan.create(req.body);
    response.success(res, "Persyaratan berhasil ditambahkan", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Persyaratan.findAll();
    response.success(res, "List persyaratan", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    response.success(res, "Detail persyaratan", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    await data.update(req.body);

    response.success(res, "Persyaratan berhasil diupdate", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    await data.destroy();

    response.success(res, "Persyaratan berhasil dihapus");
  } catch (err) {
    response.error(res, err.message);
  }
};
