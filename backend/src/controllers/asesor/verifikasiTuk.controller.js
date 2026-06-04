const {
  VerifikasiTuk,
  VerifikasiTukDetail,
  PersyaratanTuk,
  ProfileAsesor,
  JadwalAsesor,
  Jadwal,
  Skema,
  Tuk
} = require("../../models");

const response = require("../../utils/response.util");

/* =====================================
GET JADWAL VERIFIKASI
===================================== */
exports.getJadwalVerifikasi = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await JadwalAsesor.findAll({
      where: {
        id_user,
        jenis_tugas: "verifikator_tuk",
        status: "aktif"
      },
      include: [{
        model: Jadwal,
        as: "jadwal",
        required: true,
        include: [
          {
            model: Skema,
            as: "skema",
            required: false
          },
          {
            model: Tuk,
            as: "tuk",
            required: false
          }
        ]
      }]
    });

    const result = data.map(item => {
      const jadwal = item.jadwal;
      return {
        id_jadwal: jadwal?.id_jadwal,
        nama_kegiatan: jadwal?.nama_kegiatan,
        tanggal: jadwal?.tgl_awal,
        skema: jadwal?.skema?.judul_skema,
        tempat: jadwal?.tuk?.nama_tuk,
        boleh_verifikasi: true
      };
    });

    return response.success(
      res,
      "Jadwal Verifikasi",
      result
    );
  } catch (err) {
    console.log(err);
    return response.error(
      res,
      err.message
    );
  }
};

/* =====================================
GET FORM
===================================== */
exports.getForm = async (req, res) => {
  try {
    const data = await PersyaratanTuk.findAll();
    return response.success(
      res,
      "Form Verifikasi",
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};

/* =====================================
GET DETAIL
===================================== */
exports.getDetail = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const data = await VerifikasiTuk.findOne({
      where: {
        id_jadwal,
        id_user
      },
      include: [{
        model: VerifikasiTukDetail,
        as: "details",
        required: false
      }]
    });

    if (!data) {
      return response.success(
        res,
        "Belum ada verifikasi",
        null
      );
    }

    return response.success(
      res,
      "Detail Verifikasi",
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};

/* =====================================
SUBMIT
===================================== */
exports.submit = async (req, res) => {
  const t = await VerifikasiTuk.sequelize.transaction();

  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.params;

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        jenis_tugas: "verifikator_tuk",
        status: "aktif"
      }
    });

    if (!tugas) {
      return response.error(
        res,
        "Tidak diizinkan",
        403
      );
    }

    const exist = await VerifikasiTuk.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    if (exist) {
      return response.error(
        res,
        "Sudah mengisi"
      );
    }

    const profile = await ProfileAsesor.findOne({
      where: { id_user }
    });

    const verifikasi = await VerifikasiTuk.create({
      id_jadwal,
      id_user,
      keputusan: req.body.keputusan,
      ttd_asesor: profile?.ttd_path || null
    }, {
      transaction: t
    });

    const detailData = (req.body.detail || []).map(item => ({
      id_verifikasi: verifikasi.id_verifikasi,
      id_persyaratan_tuk: item.id_persyaratan_tuk,
      jumlah_total: item.jumlah_total || 0,
      jumlah_baik: item.jumlah_baik || 0,
      jumlah_rusak: item.jumlah_rusak || 0,
      keterangan: item.keterangan || ""
    }));

    if (detailData.length) {
      await VerifikasiTukDetail.bulkCreate(detailData, { transaction: t });
    }

    await t.commit();

    return response.success(
      res,
      "Verifikasi berhasil"
    );
  } catch (err) {
    await t.rollback();
    return response.error(
      res,
      err.message
    );
  }
};

/* =====================================
UPDATE
===================================== */
exports.update = async (req, res) => {
  const t = await VerifikasiTuk.sequelize.transaction();

  try {
    const { id_verifikasi } = req.params;
    const id_user = req.user.id_user;

    const data = await VerifikasiTuk.findOne({
      where: {
        id_verifikasi,
        id_user
      }
    });

    if (!data) {
      return response.error(
        res,
        "Data tidak ditemukan"
      );
    }

    await data.update({
      keputusan: req.body.keputusan
    }, {
      transaction: t
    });

    await VerifikasiTukDetail.destroy({
      where: { id_verifikasi },
      transaction: t
    });

    const details = (req.body.detail || []).map(item => ({
      id_verifikasi,
      id_persyaratan_tuk: item.id_persyaratan_tuk,
      jumlah_total: item.jumlah_total || 0,
      jumlah_baik: item.jumlah_baik || 0,
      jumlah_rusak: item.jumlah_rusak || 0,
      keterangan: item.keterangan || ""
    }));

    if (details.length) {
      await VerifikasiTukDetail.bulkCreate(details, { transaction: t });
    }

    await t.commit();

    return response.success(
      res,
      "Update berhasil"
    );
  } catch (err) {
    await t.rollback();
    return response.error(
      res,
      err.message
    );
  }
};

/* =====================================
DOWNLOAD PDF
==================================== */
exports.downloadPdf = async (req, res) => {
  try {
    const { id_verifikasi } = req.params;

    const data = await VerifikasiTuk.findOne({
      where: { id_verifikasi },
      include: [{
        model: VerifikasiTukDetail,
        as: "details",
        required: false
      }]
    });

    if (!data) {
      return response.error(
        res,
        "Data tidak ditemukan"
      );
    }

    return response.success(
      res,
      "PDF belum tersedia",
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};