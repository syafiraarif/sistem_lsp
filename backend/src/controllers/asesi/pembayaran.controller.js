const Skema = require("../../models/skema.model");
const BiayaUji = require("../../models/biayaUji.model");
const TujuanTransfer = require("../../models/tujuanPembayaran.model");
const Pembayaran = require("../../models/pembayaran.model");
const response = require("../../utils/response.util");

exports.getDetailPembayaran = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const skema = await Skema.findByPk(id_skema, {
      attributes: ["id_skema", "judul_skema", "kode_skema"],
    });

    if (!skema) {
      return response.error(res, "Skema tidak ditemukan", 404);
    }

    const biaya = await BiayaUji.findAll({
      where: { id_skema },
      attributes: [
        "id_biaya",
        "nominal",
        "jenis_biaya",
        "metode_uji",
        "keterangan",
      ],
    });

    const tujuanTransfer = await TujuanTransfer.findAll({
      where: { status: "aktif" },
      attributes: [
        ["id_tujuan", "id_tujuan_transfer"],
        ["bank", "nama_bank"],
        ["nomor_rekening", "nomor_rekening"],
        ["nama_tujuan", "atas_nama"],
        "status",
      ],
    });

    return response.success(res, "Detail pembayaran", {
      skema: skema.judul_skema,
      kode_skema: skema.kode_skema,
      harga: biaya.length > 0 ? biaya[0].nominal : 0,
      tujuan_transfer: tujuanTransfer,
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

exports.submitPembayaran = async (req, res) => {
  try {
    const {
      id_skema,
      metode_pembayaran,
      jalur_pembayaran,
      id_tujuan_transfer,
    } = req.body;

    if (!id_skema || !metode_pembayaran) {
      return response.error(res, "ID skema dan metode pembayaran wajib", 400);
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

    if (
      metode_pembayaran === "transfer_rekening" &&
      (!jalur_pembayaran || !id_tujuan_transfer)
    ) {
      return response.error(
        res,
        "Jalur pembayaran dan tujuan transfer wajib untuk transfer rekening",
        400
      );
    }

    const biaya = await BiayaUji.findAll({
      where: { id_skema },
    });

    if (!biaya || biaya.length === 0) {
      return response.error(res, "Harga untuk skema tidak ditemukan", 404);
    }

    const existing = await Pembayaran.findOne({
      where: { id_skema },
      order: [["id_pembayaran", "DESC"]],
    });

    if (
      existing &&
      ["pending", "menunggu_validasi", "paid"].includes(existing.status)
    ) {
      return response.error(
        res,
        existing.status === "paid"
          ? "Pembayaran sudah diterima admin"
          : "Pembayaran sudah diajukan dan sedang menunggu validasi admin",
        409
      );
    }

    const pembayaran = await Pembayaran.create({
      id_skema,
      metode_pembayaran,
      jalur_pembayaran:
        metode_pembayaran === "tunai"
          ? "tunai"
          : metode_pembayaran === "qris"
          ? "qris"
          : metode_pembayaran === "virtual_account"
          ? "virtual_account"
          : jalur_pembayaran,
      id_tujuan_transfer:
        metode_pembayaran === "transfer_rekening"
          ? id_tujuan_transfer
          : null,
      nominal: biaya[0].nominal,
      status: "pending",
      waktu_batas: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return response.success(res, "Pembayaran berhasil dibuat", {
      id_pembayaran: pembayaran.id_pembayaran,
      status: pembayaran.status,
      metode_pembayaran: pembayaran.metode_pembayaran,
      jalur_pembayaran: pembayaran.jalur_pembayaran,
      nominal: pembayaran.nominal,
      waktu_batas: pembayaran.waktu_batas,
      instruksi:
        "Silakan bayar, upload bukti pembayaran, lalu tunggu validasi admin.",
    });
  } catch (err) {
    console.error("SUBMIT PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.uploadBuktiBayar = async (req, res) => {
  try {
    const { id_pembayaran } = req.params;
    const file = req.files?.bukti_bayar?.[0];

    const pembayaran = await Pembayaran.findByPk(id_pembayaran);

    if (!pembayaran) {
      return response.error(res, "Pembayaran tidak ditemukan", 404);
    }

    if (pembayaran.status === "paid") {
      return response.error(res, "Pembayaran sudah divalidasi admin", 400);
    }

    await pembayaran.update({
      status: "menunggu_validasi",
      bukti_bayar: file
        ? file.path.replace(/\\/g, "/")
        : pembayaran.bukti_bayar,
      waktu_pembayaran: new Date(),
    });

    return response.success(
      res,
      "Bukti bayar berhasil diupload. Menunggu validasi admin.",
      {
        id_pembayaran: pembayaran.id_pembayaran,
        status: "menunggu_validasi",
        bukti_bayar: pembayaran.bukti_bayar,
      }
    );
  } catch (err) {
    console.error("UPLOAD BUKTI BAYAR ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.getStatusPembayaran = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const pembayaran = await Pembayaran.findOne({
      where: { id_skema },
      order: [["id_pembayaran", "DESC"]],
    });

    if (!pembayaran) {
      return response.success(res, "Belum ada pembayaran untuk skema ini", {
        id_pembayaran: null,
        status: "belum bayar",
      });
    }

    return response.success(res, "Status pembayaran", {
      id_pembayaran: pembayaran.id_pembayaran,
      status: pembayaran.status,
      metode_pembayaran: pembayaran.metode_pembayaran,
      jalur_pembayaran: pembayaran.jalur_pembayaran,
      waktu_batas: pembayaran.waktu_batas,
      bukti_bayar: pembayaran.bukti_bayar,
      catatan_admin: pembayaran.catatan_admin,
    });
  } catch (err) {
    console.error("GET STATUS PEMBAYARAN ERROR:", err);
    return response.error(res, err.message);
  }
};