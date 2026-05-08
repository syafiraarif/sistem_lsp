const UnitElemen = require("../../models/unitElemen.model");
const UnitKuk = require("../../models/unitKuk.model");
const response = require("../../utils/response.util");

exports.createElemen = async (req, res) => {
  try {
    const data = await UnitElemen.create(req.body);
    response.success(res, "Elemen berhasil dibuat", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateElemen = async (req, res) => {
  try {
    const data = await UnitElemen.findByPk(req.params.id);
    if (!data) return response.error(res, "Elemen tidak ditemukan", 404);
    await data.update(req.body);
    response.success(res, "Elemen berhasil diperbarui", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.deleteElemen = async (req, res) => {
  try {
    const data = await UnitElemen.findByPk(req.params.id);
    if (!data) return response.error(res, "Elemen tidak ditemukan", 404);
    await data.destroy();
    response.success(res, "Elemen berhasil dihapus");
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.createKuk = async (req, res) => {
  try {
    const data = await UnitKuk.create(req.body);
    response.success(res, "KUK berhasil dibuat", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateKuk = async (req, res) => {
  try {
    const data = await UnitKuk.findByPk(req.params.id);
    if (!data) return response.error(res, "KUK tidak ditemukan", 404);
    await data.update(req.body);
    response.success(res, "KUK berhasil diperbarui", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.deleteKuk = async (req, res) => {
  try {
    const data = await UnitKuk.findByPk(req.params.id);
    if (!data) return response.error(res, "KUK tidak ditemukan", 404);
    await data.destroy();
    response.success(res, "KUK berhasil dihapus");
  } catch (err) {
    response.error(res, err.message);
  }
};