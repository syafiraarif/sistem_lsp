const { Op } = require("sequelize");

const Skema = require("../../models/skema.model");
const BiayaUji = require("../../models/biayaUji.model");
const TujuanTransfer = require("../../models/tujuanPembayaran.model");
const Pembayaran = require("../../models/pembayaran.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");
const response = require("../../utils/response.util");

/* ===============================
HELPER
================================ */

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeMetode = (value) => {
  return String(value || "").trim();
};

const normalizeJalur = (metode, jalur) => {
  if (metode === "tunai") return "tunai";
  if (metode === "qris") return "qris";
  if (metode === "virtual_account") return "virtual_account";

  return String(jalur || "").trim();
};

const formatTujuanTransfer = (item) => {
  return {
    id_tujuan_transfer: item.id_tujuan || item.id_tujuan_transfer || item.id,
    nama_bank: item.bank || item.nama_bank || "-",
    nomor_rekening: item.nomor_rekening || "-",
    atas_nama: item.nama_tujuan || item.atas_nama || "-",
    status: item.status,
  };
};

const findPesertaByUserAndSkema = async ({ id_user, id_skema }) => {
  return PesertaJadwal.findOne({
    where: {
      id_user,
    },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        where: {
          id_skema,
        },
      },
    ],
    order: [["id_peserta", "DESC"]],
  });
};

const getStatusLabel = (status) => {
  if (!status) return "belum bayar";
  return status;
};

/* ===============================
GET DETAIL PEMBAYARAN
GET /api/asesi/pembayaran/:id_skema/detail
================================ */

exports.getDetailPembayaran = async (req, res) => {
  try {
    const { id_skema } = req.params;

    if (!id_skema) {
      return response.error(res, "ID skema wajib diisi", 400);
    }

    const skema = await Skema.findByPk(id_skema, {
      attributes: ["id_skema", "judul_skema", "kode_skema"],
    });

    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    const biaya = await BiayaUji.findOne({
      where: {
        id_skema,
      },
      order: [["id_biaya", "DESC"]],
    });

    const tujuanTransfer = await TujuanTransfer.findAll({
      where: {
        status: "aktif",
      },
      order: [["id_tujuan", "ASC"]],
    });

    const tujuanTransferFormatted = tujuanTransfer.map(formatTujuanTransfer);

    return response.success(res, "Detail pembayaran", {
      skema: skema.judul_skema,
      kode_skema: skema.kode_skema,
      harga: Number(biaya?.nominal || 0),

      tujuan_transfer: tujuanTransferFormatted,

      qris: {
        enabled: true,
        image_url: "/uploads/qris/qris.png",
        atas_nama: "LSP",
      },

      virtual_account: {
        enabled: true,
        nomor_va: `8808${String(id_skema).padStart(6, "0")}`,
        nama_bank: "Virtual Account",
        atas_nama: "LSP",
      },
    });
  } catch (err) {
    console.error("GET DETAIL PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===============================
SUBMIT PEMBAYARAN
POST /api/asesi/pembayaran/submit
================================ */

exports.submitPembayaran = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = safeNumber(req.body.id_skema);
    const metode_pembayaran = normalizeMetode(req.body.metode_pembayaran);
    const jalur_pembayaran = normalizeJalur(
      metode_pembayaran,
      req.body.jalur_pembayaran
    );
    const id_tujuan_transfer = safeNumber(req.body.id_tujuan_transfer);

    if (!id_skema || !metode_pembayaran) {
      return response.error(
        res,
        "ID skema dan metode pembayaran wajib diisi",
        400
      );
    }

    const allowedMetode = [
      "tunai",
      "transfer_rekening",
      "qris",
      "virtual_account",
    ];

    if (!allowedMetode.includes(metode_pembayaran)) {
      return response.error(res, "Metode pembayaran tidak valid", 400);
    }

    const allowedJalur = [
      "tunai",
      "m-banking",
      "atm",
      "e-wallet",
      "qris",
      "virtual_account",
    ];

    if (!allowedJalur.includes(jalur_pembayaran)) {
      return response.error(res, "Jalur pembayaran tidak valid", 400);
    }

    if (metode_pembayaran === "transfer_rekening") {
      if (!jalur_pembayaran || !id_tujuan_transfer) {
        return response.error(
          res,
          "Jalur pembayaran dan tujuan transfer wajib untuk transfer rekening",
          400
        );
      }

      const tujuan = await TujuanTransfer.findOne({
        where: {
          id_tujuan: id_tujuan_transfer,
          status: "aktif",
        },
      });

      if (!tujuan) {
        return response.error(res, "Tujuan transfer tidak ditemukan", 404);
      }
    }

    const skema = await Skema.findByPk(id_skema);

    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    const peserta = await findPesertaByUserAndSkema({
      id_user,
      id_skema,
    });

    if (!peserta) {
      return response.error(
        res,
        "Kamu belum memilih jadwal untuk skema ini",
        400
      );
    }

    const biaya = await BiayaUji.findOne({
      where: {
        id_skema,
      },
      order: [["id_biaya", "DESC"]],
    });

    if (!biaya) {
      return response.error(res, "Harga untuk skema tidak ditemukan", 404);
    }

    const existing = await Pembayaran.findOne({
      where: {
        id_user,
        id_peserta: peserta.id_peserta,
        id_skema,
        status: {
          [Op.in]: ["pending", "menunggu_validasi", "paid"],
        },
      },
      order: [["id_pembayaran", "DESC"]],
    });

    if (existing) {
      return response.error(
        res,
        existing.status === "paid"
          ? "Pembayaran sudah diterima admin"
          : "Pembayaran sudah diajukan dan sedang menunggu validasi admin",
        409
      );
    }

    const pembayaran = await Pembayaran.create({
      id_user,
      id_peserta: peserta.id_peserta,
      id_skema,

      metode_pembayaran,

      jalur_pembayaran,

      id_tujuan_transfer:
        metode_pembayaran === "transfer_rekening" ? id_tujuan_transfer : null,

      nominal: biaya.nominal,

      status:
        metode_pembayaran === "tunai" ? "menunggu_validasi" : "pending",

      waktu_pembayaran: new Date(),

      waktu_batas: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return response.success(res, "Pembayaran berhasil dibuat", {
      id_pembayaran: pembayaran.id_pembayaran,
      id_user: pembayaran.id_user,
      id_peserta: pembayaran.id_peserta,
      id_skema: pembayaran.id_skema,
      status: pembayaran.status,
      metode_pembayaran: pembayaran.metode_pembayaran,
      jalur_pembayaran: pembayaran.jalur_pembayaran,
      nominal: pembayaran.nominal,
      waktu_batas: pembayaran.waktu_batas,
      waktu_pembayaran: pembayaran.waktu_pembayaran,
    });
  } catch (err) {
    console.error("SUBMIT PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===============================
UPLOAD BUKTI BAYAR
PUT /api/asesi/pembayaran/:id_pembayaran/upload-bukti
================================ */

exports.uploadBuktiBayar = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_pembayaran } = req.params;

    const pembayaran = await Pembayaran.findOne({
      where: {
        id_pembayaran,
        id_user,
      },
    });

    if (!pembayaran) {
      return response.error(res, "Pembayaran tidak ditemukan", 404);
    }

    if (pembayaran.status === "paid") {
      return response.error(res, "Pembayaran sudah divalidasi admin", 400);
    }

    if (pembayaran.status === "menunggu_validasi") {
      return response.error(
        res,
        "Bukti pembayaran sudah diupload dan sedang menunggu validasi admin",
        400
      );
    }

    const file = req.files?.bukti_bayar?.[0];

    if (!file) {
      return response.error(res, "Bukti pembayaran wajib diupload", 400);
    }

    const filePath = file.path.replace(/\\/g, "/");

    await pembayaran.update({
      status: "menunggu_validasi",
      bukti_bayar: filePath,
      waktu_pembayaran: new Date(),
    });

    return response.success(
      res,
      "Bukti bayar berhasil diupload. Menunggu validasi admin.",
      {
        id_pembayaran: pembayaran.id_pembayaran,
        id_user: pembayaran.id_user,
        id_peserta: pembayaran.id_peserta,
        id_skema: pembayaran.id_skema,
        status: pembayaran.status,
        metode_pembayaran: pembayaran.metode_pembayaran,
        jalur_pembayaran: pembayaran.jalur_pembayaran,
        nominal: pembayaran.nominal,
        bukti_bayar: pembayaran.bukti_bayar,
        waktu_pembayaran: pembayaran.waktu_pembayaran,
        waktu_batas: pembayaran.waktu_batas,
      }
    );
  } catch (err) {
    console.error("UPLOAD BUKTI BAYAR ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===============================
GET STATUS PEMBAYARAN
GET /api/asesi/pembayaran/:id_skema/status
================================ */

exports.getStatusPembayaran = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_skema = safeNumber(req.params.id_skema);

    if (!id_skema) {
      return response.error(res, "ID skema wajib diisi", 400);
    }

    const peserta = await findPesertaByUserAndSkema({
      id_user,
      id_skema,
    });

    if (!peserta) {
      return response.success(res, "Belum memilih jadwal untuk skema ini", {
        id_pembayaran: null,
        id_user,
        id_peserta: null,
        id_skema,
        status: "belum bayar",
        metode_pembayaran: null,
        jalur_pembayaran: null,
        nominal: 0,
        waktu_batas: null,
        waktu_pembayaran: null,
        bukti_bayar: null,
        catatan_admin: null,
      });
    }

    const pembayaran = await Pembayaran.findOne({
      where: {
        id_user,
        id_peserta: peserta.id_peserta,
        id_skema,
      },
      order: [["id_pembayaran", "DESC"]],
    });

    if (!pembayaran) {
      return response.success(res, "Belum ada pembayaran untuk skema ini", {
        id_pembayaran: null,
        id_user,
        id_peserta: peserta.id_peserta,
        id_skema,
        status: "belum bayar",
        metode_pembayaran: null,
        jalur_pembayaran: null,
        nominal: 0,
        waktu_batas: null,
        waktu_pembayaran: null,
        bukti_bayar: null,
        catatan_admin: null,
      });
    }

    return response.success(res, "Status pembayaran", {
      id_pembayaran: pembayaran.id_pembayaran,
      id_user: pembayaran.id_user,
      id_peserta: pembayaran.id_peserta,
      id_skema: pembayaran.id_skema,
      status: getStatusLabel(pembayaran.status),
      metode_pembayaran: pembayaran.metode_pembayaran || null,
      jalur_pembayaran: pembayaran.jalur_pembayaran || null,
      nominal: pembayaran.nominal || 0,
      waktu_batas: pembayaran.waktu_batas || null,
      waktu_pembayaran: pembayaran.waktu_pembayaran || null,
      bukti_bayar: pembayaran.bukti_bayar || null,
      catatan_admin: pembayaran.catatan_admin || null,
    });
  } catch (err) {
    console.error("GET STATUS PEMBAYARAN ERROR:", err);

    return response.success(res, "Belum ada pembayaran untuk skema ini", {
      id_pembayaran: null,
      status: "belum bayar",
      metode_pembayaran: null,
      jalur_pembayaran: null,
      nominal: 0,
      waktu_batas: null,
      waktu_pembayaran: null,
      bukti_bayar: null,
      catatan_admin: null,
    });
  }
};