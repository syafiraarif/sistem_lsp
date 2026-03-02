const { PersyaratanTuk, SkemaPersyaratanTuk } = require("../../models");
const response = require("../../utils/response.util");

exports.create = async (req, res) => {
  try {
    const data = await PersyaratanTuk.create(req.body);
    return response.success(res, "Persyaratan TUK berhasil ditambahkan", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await PersyaratanTuk.findAll();
    return response.success(res, "List persyaratan TUK", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const persyaratan = await PersyaratanTuk.findByPk(id);

    if (!persyaratan) {
      return response.error(res, "Persyaratan TUK tidak ditemukan", 404);
    }

    await persyaratan.update(req.body);

    return response.success(res, "Persyaratan TUK berhasil diupdate", persyaratan);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.attachToSkema = async (req, res) => {
  try {
    const { id_skema, id_persyaratan_tuk } = req.body;

    const existing = await SkemaPersyaratanTuk.findOne({
      where: { id_skema, id_persyaratan_tuk }
    });

    if (existing) {
      return response.error(res, "Relasi sudah ada", 400);
    }

    const data = await SkemaPersyaratanTuk.create({
      id_skema,
      id_persyaratan_tuk
    });

    return response.success(res, "Persyaratan TUK berhasil dikaitkan ke skema", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.detachFromSkema = async (req, res) => {
  try {
    const { id_skema, id_persyaratan_tuk } = req.params;

    const deleted = await SkemaPersyaratanTuk.destroy({
      where: { id_skema, id_persyaratan_tuk }
    });

    if (!deleted) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    return response.success(res, "Persyaratan TUK berhasil dilepas dari skema");
  } catch (err) {
    return response.error(res, err.message);
  }
};