const Skema = require("../../models/skema.model");
const BiayaUji = require("../../models/biayaUji.model"); // model baru untuk harga
const TujuanTransfer = require("../../models/tujuanPembayaran.model");
const Pembayaran = require("../../models/pembayaran.model");
const response = require("../../utils/response.util");

/* ================= GET DETAIL PEMBAYARAN ================= */
exports.getDetailPembayaran = async (req, res) => {
  try {
    const { id_skema } = req.params;

    // Ambil judul skema
    const skema = await Skema.findByPk(id_skema, { attributes: ["judul_skema"] });
    if (!skema) return response.error(res, "Skema tidak ditemukan", 404);

    // Ambil harga dari tabel biaya_uji
    const biaya = await BiayaUji.findAll({
      where: { id_skema },
      attributes: ["id_biaya", "nominal", "jenis_biaya", "metode_uji", "keterangan"],
    });

    const tujuanTransfer = await TujuanTransfer.findAll({ where: { status: "aktif" } });

    response.success(res, "Detail pembayaran", {
      skema: skema.judul_skema,
      harga: biaya.length > 0 ? biaya[0].nominal : 0,
      tujuan_transfer: tujuanTransfer,
    });
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};

/* ================= SUBMIT PEMBAYARAN ================= */
exports.submitPembayaran = async (req, res) => {
  try {
    const { id_skema, metode_pembayaran, jalur_pembayaran, id_tujuan_transfer } = req.body;

    if (!id_skema || !metode_pembayaran) {
      return response.error(res, "ID skema dan metode pembayaran wajib", 400);
    }

    if (metode_pembayaran === "transfer_rekening" && (!jalur_pembayaran || !id_tujuan_transfer)) {
      return response.error(res, "Jalur pembayaran dan tujuan transfer wajib untuk Transfer Rekening", 400);
    }

    if (metode_pembayaran === "tunai" && jalur_pembayaran !== "tunai") {
      return response.error(res, "Jalur pembayaran harus tunai jika metode tunai", 400);
    }

    // Ambil harga dari biaya_uji
    const biaya = await BiayaUji.findAll({ where: { id_skema } });
    if (!biaya || biaya.length === 0) return response.error(res, "Harga untuk skema tidak ditemukan", 404);

    // Cek pembayaran pending sebelumnya
    const existing = await Pembayaran.findOne({ where: { id_skema, status: "pending" } });
    if (existing) return response.error(res, "Pembayaran sudah ada dan masih pending", 409);

    const waktuBatas = new Date(Date.now() + 30 * 60 * 1000); // 30 menit

    const pembayaran = await Pembayaran.create({
      id_skema,
      metode_pembayaran,
      jalur_pembayaran,
      id_tujuan_transfer: id_tujuan_transfer || null,
      nominal: biaya[0].nominal,
      status: "pending",
      waktu_batas: waktuBatas,
    });

    let tujuanDetail = null;
    if (id_tujuan_transfer) {
      tujuanDetail = await TujuanTransfer.findByPk(id_tujuan_transfer);
    }

    response.success(res, "Pembayaran berhasil dibuat. Lakukan pembayaran sesuai struk.", {
      id_pembayaran: pembayaran.id_pembayaran,
      skema: biaya[0].jenis_biaya || "Uji Kompetensi",
      metode_pembayaran,
      jalur_pembayaran,
      tujuan_transfer: tujuanDetail,
      nominal: biaya[0].nominal,
      waktu_batas: pembayaran.waktu_batas,
      instruksi: "Bayar dalam 30 menit. Setelah bayar, upload bukti jika diperlukan.",
    });
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};

/* ================= UPLOAD BUKTI BAYAR ================= */
exports.uploadBuktiBayar = async (req, res) => {
  try {
    const { id_pembayaran } = req.params;
    const file = req.files?.bukti_bayar?.[0];

    const pembayaran = await Pembayaran.findByPk(id_pembayaran);
    if (!pembayaran) return response.error(res, "Pembayaran tidak ditemukan", 404);

    await pembayaran.update({
      status: "paid",
      bukti_bayar: file ? file.path : null,
    });

    response.success(res, "Bukti bayar berhasil diupload. Status pembayaran: Paid.", {
      id_pembayaran: pembayaran.id_pembayaran,
      status: pembayaran.status,
      bukti_bayar: pembayaran.bukti_bayar,
    });
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};

/* ================= GET STATUS PEMBAYARAN ================= */
exports.getStatusPembayaran = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const pembayaran = await Pembayaran.findOne({ where: { id_skema } });
    if (!pembayaran) return response.error(res, "Belum ada pembayaran untuk skema ini", 404);

    response.success(res, "Status pembayaran", {
      id_pembayaran: pembayaran.id_pembayaran,
      status: pembayaran.status,
      metode_pembayaran: pembayaran.metode_pembayaran,
      waktu_batas: pembayaran.waktu_batas,
    });
  } catch (err) {
    console.error(err);
    response.error(res, err.message);
  }
};