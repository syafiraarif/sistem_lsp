const {
  PesertaJadwal,
  User,
  Jadwal,
  ProfileAsesi,
  ProfileAsesor,
  Skema,
} = require("../../models");

const response = require("../../utils/response.util");
const { Op } = require("sequelize");

const pesertaJadwalInclude = [
  {
    model: User,
    as: "user",
    attributes: ["id_user", "username", "email", "no_hp", "status_user"],
    include: [
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        required: false,
      },
    ],
  },
  {
    model: Jadwal,
    as: "jadwal",
    attributes: [
      "id_jadwal",
      "id_skema",
      "id_tuk",
      "nama_kegiatan",
      "tgl_pra_asesmen",
      "tahun",
      "periode_bulan",
      "gelombang",
      "tgl_awal",
      "tgl_akhir",
      "jam",
      "pelaksanaan_uji",
      "url_agenda",
      "status",
    ],
    include: [
      {
        model: Skema,
        as: "skema",
        attributes: ["id_skema", "kode_skema", "judul_skema"],
        required: false,
      },
    ],
  },
  {
    model: User,
    as: "asesor_penguji",
    attributes: ["id_user", "username", "email", "no_hp", "status_user"],
    required: false,
    include: [
      {
        model: ProfileAsesor,
        required: false,
      },
    ],
  },
];

exports.getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: pesertaJadwalInclude,
      distinct: true,
    });

    return response.success(res, "List peserta jadwal", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.getAllPesertaGlobal = async (req, res) => {
  try {
    const { status } = req.query;

    let whereCondition = {};

    if (status === "terjadwal") {
      whereCondition.status_asesmen = {
        [Op.in]: ["terdaftar", "pra_asesmen", "asesmen"],
      };
    } else if (status) {
      whereCondition.status_asesmen = status;
    }

    const data = await PesertaJadwal.findAll({
      where: whereCondition,
      include: pesertaJadwalInclude,
      distinct: true,
    });

    return response.success(res, "List peserta jadwal global", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.assignAsesorToPeserta = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const { id_asesor } = req.body;

    const peserta = await PesertaJadwal.findByPk(id_peserta);

    if (!peserta) {
      return response.error(res, "Peserta tidak ditemukan", 404);
    }

    peserta.id_asesor = id_asesor || null;
    await peserta.save();

    return response.success(res, "Asesor berhasil ditugaskan ke peserta");
  } catch (err) {
    console.error(err);
    return response.error(res, "Terjadi kesalahan server", 500);
  }
};