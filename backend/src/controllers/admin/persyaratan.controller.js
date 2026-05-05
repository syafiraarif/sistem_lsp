const { Persyaratan, SkemaPersyaratan, Skema } = require("../../models");
const response = require("../../utils/response.util");

// ===============================
// CREATE
// ===============================
exports.create = async (req, res) => {
  try {
    const { nama_persyaratan, jenis_persyaratan, keterangan } = req.body;

    if (!nama_persyaratan || !jenis_persyaratan) {
      return response.error(res, "Nama dan jenis persyaratan wajib diisi", 400);
    }

    const data = await Persyaratan.create({
      nama_persyaratan,
      jenis_persyaratan,
      keterangan
    });

    return response.success(res, "Persyaratan berhasil ditambahkan", data);

  } catch (err) {
    console.error("ERROR CREATE:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// GET ALL
// ===============================
exports.getAll = async (req, res) => {
  try {
    const data = await Persyaratan.findAll({
      order: [["id_persyaratan", "DESC"]]
    });

    return response.success(res, "List persyaratan", data);

  } catch (err) {
    console.error("ERROR GET ALL:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// GET BY ID
// ===============================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    return response.success(res, "Detail persyaratan", data);

  } catch (err) {
    console.error("ERROR GET BY ID:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// UPDATE
// ===============================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    await data.update(req.body);

    return response.success(res, "Persyaratan berhasil diupdate", data);

  } catch (err) {
    console.error("ERROR UPDATE:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// DELETE
// ===============================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Persyaratan.findByPk(id);

    if (!data) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    await data.destroy();

    return response.success(res, "Persyaratan berhasil dihapus");

  } catch (err) {
    console.error("ERROR DELETE:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// ATTACH KE SKEMA
// ===============================
exports.attachToSkema = async (req, res) => {
  try {
    let { id_skema, id_persyaratan, wajib } = req.body;

    // ✅ VALIDASI
    if (!id_skema || !id_persyaratan) {
      return response.error(res, "ID Skema dan ID Persyaratan wajib diisi", 400);
    }

    // ✅ PASTIKAN NUMBER
    id_skema = parseInt(id_skema);
    id_persyaratan = parseInt(id_persyaratan);

    // ✅ CEK SKEMA ADA
    const skema = await Skema.findByPk(id_skema);
    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    // ✅ CEK PERSYARATAN ADA
    const persyaratan = await Persyaratan.findByPk(id_persyaratan);
    if (!persyaratan) {
      return response.error(res, "Persyaratan tidak ditemukan", 404);
    }

    // ✅ CEK DUPLIKAT
    const existing = await SkemaPersyaratan.findOne({
      where: { id_skema, id_persyaratan }
    });

    if (existing) {
      return response.error(res, "Persyaratan sudah ada di skema", 400);
    }

    // ✅ INSERT
    const data = await SkemaPersyaratan.create({
      id_skema,
      id_persyaratan,
      wajib: wajib !== undefined ? wajib : true
    });

    return response.success(res, "Persyaratan berhasil ditambahkan ke skema", data);

  } catch (err) {
    console.error("ERROR ATTACH:", err);
    return response.error(res, err.message);
  }
};

// ===============================
// DETACH DARI SKEMA
// ===============================
exports.detachFromSkema = async (req, res) => {
  try {
    let { id_skema, id_persyaratan } = req.params;

    id_skema = parseInt(id_skema);
    id_persyaratan = parseInt(id_persyaratan);

    const deleted = await SkemaPersyaratan.destroy({
      where: { id_skema, id_persyaratan }
    });

    if (!deleted) {
      return response.error(res, "Relasi persyaratan tidak ditemukan", 404);
    }

    return response.success(res, "Persyaratan berhasil dilepas dari skema");

  } catch (err) {
    console.error("ERROR DETACH:", err);
    return response.error(res, err.message);
  }
};