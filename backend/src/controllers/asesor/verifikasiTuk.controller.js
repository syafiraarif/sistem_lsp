const {
  VerifikasiTuk,
  VerifikasiTukDetail,
  PersyaratanTuk,
  ProfileAsesor
} = require("../../models");

const response = require("../../utils/response.util");


// ============================
// GET FORM (ambil persyaratan)
// ============================
exports.getForm = async (req, res) => {
  try {
    const data = await PersyaratanTuk.findAll();

    return response.success(res, "Data form verifikasi TUK", data);

  } catch (err) {
    return response.error(res, err.message);
  }
};


// ============================
// GET DETAIL (untuk edit)
// ============================
exports.getDetail = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const data = await VerifikasiTuk.findOne({
      where: { id_jadwal, id_user },
      include: [
        {
          model: VerifikasiTukDetail,
          as: "details"
        }
      ]
    });

    if (!data) {
      return response.error(res, "Data tidak ditemukan");
    }

    return response.success(res, "Detail verifikasi", data);

  } catch (err) {
    return response.error(res, err.message);
  }
};


// ============================
// SUBMIT
// ============================
exports.submit = async (req, res) => {
  const t = await VerifikasiTuk.sequelize.transaction();

  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.params;

    const { keputusan, detail } = req.body;

    if (!detail || detail.length === 0) {
      return response.error(res, "Detail tidak boleh kosong");
    }

    // cek sudah pernah isi
    const exist = await VerifikasiTuk.findOne({
      where: { id_jadwal, id_user }
    });

    if (exist) {
      return response.error(res, "Sudah mengisi verifikasi");
    }

    // ambil tanda tangan asesor
    const profile = await ProfileAsesor.findOne({
      where: { id_user }
    });

    const verifikasi = await VerifikasiTuk.create({
      id_jadwal,
      id_user,
      keputusan,
      ttd_asesor: profile?.ttd_path || null
    }, { transaction: t });

    const detailData = detail.map(item => ({
      id_verifikasi: verifikasi.id_verifikasi,
      id_persyaratan_tuk: item.id_persyaratan_tuk,
      jumlah_total: item.jumlah_total || 0,
      jumlah_baik: item.jumlah_baik || 0,
      jumlah_rusak: item.jumlah_rusak || 0,
      keterangan: item.keterangan || ""
    }));

    await VerifikasiTukDetail.bulkCreate(detailData, { transaction: t });

    await t.commit();

    return response.success(res, "Verifikasi berhasil disimpan");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};


// ============================
// UPDATE
// ============================
exports.update = async (req, res) => {
  const t = await VerifikasiTuk.sequelize.transaction();

  try {
    const { id_verifikasi } = req.params;
    const id_user = req.user.id_user;

    const { keputusan, detail } = req.body;

    const verifikasi = await VerifikasiTuk.findOne({
      where: { id_verifikasi, id_user }
    });

    if (!verifikasi) {
      return response.error(res, "Data tidak ditemukan");
    }

    await verifikasi.update({
      keputusan
    }, { transaction: t });

    // hapus detail lama
    await VerifikasiTukDetail.destroy({
      where: { id_verifikasi },
      transaction: t
    });

    // insert ulang detail
    const detailData = detail.map(item => ({
      id_verifikasi,
      id_persyaratan_tuk: item.id_persyaratan_tuk,
      jumlah_total: item.jumlah_total || 0,
      jumlah_baik: item.jumlah_baik || 0,
      jumlah_rusak: item.jumlah_rusak || 0,
      keterangan: item.keterangan || ""
    }));

    await VerifikasiTukDetail.bulkCreate(detailData, { transaction: t });

    await t.commit();

    return response.success(res, "Verifikasi berhasil diupdate");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};


// ============================
// DOWNLOAD PDF (placeholder)
// ============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id_verifikasi } = req.params;

    const data = await VerifikasiTuk.findOne({
      where: { id_verifikasi },
      include: [
        {
          model: VerifikasiTukDetail,
          as: "details"
        }
      ]
    });

    if (!data) {
      return response.error(res, "Data tidak ditemukan");
    }

    // nanti bisa pakai pdfkit / html-pdf
    return res.json({
      message: "PDF belum dibuat",
      data
    });

  } catch (err) {
    return response.error(res, err.message);
  }
};