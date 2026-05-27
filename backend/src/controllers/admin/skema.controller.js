const {
  Skema,
  Skkni,
  BiayaUji,
  Persyaratan,
  PersyaratanTuk,
  KelompokPekerjaan,
  Tuk,
} = require("../../models");

const response = require("../../utils/response.util");

const buildPayload = (body, files) => {
  const payload = {
    kode_skema: body.kode_skema || null,
    judul_skema: body.judul_skema || null,
    judul_skema_en: body.judul_skema_en || null,

    jenis_skema: body.jenis_skema || "kkni",

    level_kkni: body.level_kkni
      ? Number(body.level_kkni)
      : null,

    bidang: body.bidang || null,

    jenjang_kualifikasi:
      body.jenjang_kualifikasi || "I",

    kode_sektor: body.kode_sektor || null,

    kode_kbli: body.kode_kbli || null,

    kode_kbji: body.kode_kbji || null,

    nomor_revisi: body.nomor_revisi || null,

    status_dokumen:
      body.status_dokumen || "terkendali",

    status: body.status || "draft",
  };

  if (files?.file_dokumen?.[0]) {
    payload.dokumen = files.file_dokumen[0].filename;
  }

  return payload;
};

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body, req.files);

    if (!payload.kode_skema) {
      return response.error(res, "Kode skema wajib diisi", 400);
    }

    if (!payload.judul_skema) {
      return response.error(res, "Judul skema wajib diisi", 400);
    }

    const existing = await Skema.findOne({
      where: { kode_skema: payload.kode_skema },
    });

    if (existing) {
      return response.error(res, "Kode skema sudah digunakan", 400);
    }

    const data = await Skema.create(payload);

    return response.success(res, "Skema berhasil dibuat", data);
  } catch (err) {
    console.error("CREATE SKEMA ERROR:", err);
    return response.error(res, err.message || "Gagal membuat skema", 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Skema.findAll({
      // Pastikan relasi ini terdefinisi dengan benar di models/index.js
      include: [
        { model: Skkni, as: 'skknis' }, 
        { model: Persyaratan }
      ],
      order: [["id_skema", "DESC"]],
    });

    return response.success(res, "List skema", data);
  } catch (err) {
    console.error("GET ALL SKEMA ERROR:", err); // Lihat log di terminal backend kamu!
    return response.error(res, err.message || "Gagal mengambil skema", 500);
  }
};

exports.getDetail = async (req, res) => {
  try {
    const data = await Skema.findByPk(req.params.id, {
      include: [
        { model: Skkni, as: 'skknis' },
        BiayaUji,
        Persyaratan,
        PersyaratanTuk,
        KelompokPekerjaan,
        Tuk,
      ],
    });

    if (!data) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    return response.success(res, "Detail skema", data);
  } catch (err) {
    console.error("GET DETAIL SKEMA ERROR:", err);
    return response.error(
      res,
      err.message || "Gagal mengambil detail skema",
      500
    );
  }
};

exports.update = async (req, res) => {
  try {
    const skema = await Skema.findByPk(req.params.id);

    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    const payload = buildPayload(req.body, req.files);

    if (!payload.kode_skema) {
      return response.error(res, "Kode skema wajib diisi", 400);
    }

    if (!payload.judul_skema) {
      return response.error(res, "Judul skema wajib diisi", 400);
    }

    const existing = await Skema.findOne({
      where: { kode_skema: payload.kode_skema },
    });

    if (existing && Number(existing.id_skema) !== Number(req.params.id)) {
      return response.error(res, "Kode skema sudah digunakan", 400);
    }

    if (!payload.dokumen && skema.dokumen) {
      payload.dokumen = skema.dokumen;
    }

    await skema.update(payload);

    return response.success(res, "Skema berhasil diperbarui", skema);
  } catch (err) {
    console.error("UPDATE SKEMA ERROR:", err);
    return response.error(res, err.message || "Gagal memperbarui skema", 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const skema = await Skema.findByPk(req.params.id);

    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    await skema.destroy();

    return response.success(res, "Skema berhasil dihapus");
  } catch (err) {
    console.error("DELETE SKEMA ERROR:", err);
    return response.error(res, err.message || "Gagal menghapus skema", 500);
  }
};