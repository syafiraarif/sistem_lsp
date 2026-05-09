const Pembayaran = require("../../models/pembayaran.model");
const Skema = require("../../models/skema.model");
const response = require("../../utils/response.util");

exports.getAll = async (req, res) => {
  try {
    const data = await Pembayaran.findAll({
      include: [
        {
          model: Skema,
          required: false,
          attributes: ["id_skema", "kode_skema", "judul_skema"],
        },
      ],
      order: [["id_pembayaran", "DESC"]],
    });

    return response.success(res, "List pembayaran", data);
  } catch (err) {
    console.error("GET ALL PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.approve = async (req, res) => {
  try {
    const pembayaran = await Pembayaran.findByPk(req.params.id);

    if (!pembayaran) {
      return response.error(res, "Pembayaran tidak ditemukan", 404);
    }

    if (!["pending", "menunggu_validasi"].includes(pembayaran.status)) {
      return response.error(res, "Pembayaran sudah diproses", 400);
    }

    await pembayaran.update({
      status: "paid",
      catatan_admin: req.body?.catatan_admin || null,
      divalidasi_pada: new Date(),
    });

    return response.success(res, "Pembayaran berhasil diterima", pembayaran);
  } catch (err) {
    console.error("APPROVE PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.reject = async (req, res) => {
  try {
    const pembayaran = await Pembayaran.findByPk(req.params.id);

    if (!pembayaran) {
      return response.error(res, "Pembayaran tidak ditemukan", 404);
    }

    if (!["pending", "menunggu_validasi"].includes(pembayaran.status)) {
      return response.error(res, "Pembayaran sudah diproses", 400);
    }

    await pembayaran.update({
      status: "rejected",
      catatan_admin: req.body?.catatan_admin || "Pembayaran ditolak admin",
      divalidasi_pada: new Date(),
    });

    return response.success(res, "Pembayaran berhasil ditolak", pembayaran);
  } catch (err) {
    console.error("REJECT PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};