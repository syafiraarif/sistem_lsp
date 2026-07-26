// backend/src/controllers/asesor/jadwal.controller.js

const models = require("../../models");

const { JadwalAsesor, Jadwal } = models;

const getNestedJadwalInclude = () => {
  const include = [];

  if (Jadwal?.associations?.skema) {
    include.push({ association: "skema" });
  }

  if (Jadwal?.associations?.tuk) {
    include.push({ association: "tuk" });
  }

  return include;
};

const getJadwalInclude = () => {
  const nestedInclude = getNestedJadwalInclude();

  return [
    {
      model: Jadwal,
      as: "jadwal",
      include: nestedInclude,
    },
  ];
};

const getJadwalByJenisTugas = async (req, res, jenis_tugas = null) => {
  try {
    const id_user = req.user.id_user;

    const where = { id_user };

    if (jenis_tugas) {
      where.jenis_tugas = jenis_tugas;
    }

    const data = await JadwalAsesor.findAll({
      where,
      include: getJadwalInclude(),
      order: [["created_at", "DESC"]],
    });

    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

const getJadwalSaya = async (req, res) => {
  return getJadwalByJenisTugas(req, res);
};

const getJadwalUjiKompetensi = async (req, res) => {
  return getJadwalByJenisTugas(req, res, "asesor_penguji");
};

const getJadwalVerifikasiTuk = async (req, res) => {
  return getJadwalByJenisTugas(req, res, "verifikator_tuk");
};

const getJadwalKomiteTeknis = async (req, res) => {
  return getJadwalByJenisTugas(req, res, "komite_teknis");
};

const { ProfileAsesor, User } = models;

const getListAsesor = async (req, res) => {
  try {
    const data = await ProfileAsesor.findAll({
      where: {
        status_asesor: "aktif",
      },
      include: [
        {
          model: User,
          as: "user",
          required: true,
          where: {
            status_user: "aktif",
          },
          attributes: [
            "id_user",
            "username",
            "email",
            "no_hp",
          ],
        },
      ],
      attributes: [
        "id_user",
        "nama_lengkap",
        "gelar_depan",
        "gelar_belakang",
        "no_reg_asesor",
        "no_lisensi",
      ],
      order: [["nama_lengkap", "ASC"]],
    });

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getJadwalSaya,
  getJadwalUjiKompetensi,
  getJadwalVerifikasiTuk,
  getJadwalKomiteTeknis,
  getListAsesor,
};