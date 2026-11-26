const {
  BandingAsesmen,
  User,
  PesertaJadwal,
  FrAk04,
  FrAk03,
  Skema,
  Jadwal,
  ProfileAsesi,
} = require("../../models");
const { Op } = require("sequelize");
const response = require("../../utils/response.util");

exports.getAllBanding = async (req, res) => {
  try {
    const { status, search } = req.query;
    const whereCondition = {};

    if (status) {
      whereCondition.status_progress = status;
    }

    if (search) {
      whereCondition[Op.or] = [
        { isi_banding: { [Op.like]: `%${search}%` } },
        { keputusan: { [Op.like]: `%${search}%` } },
        { catatan_komite: { [Op.like]: `%${search}%` } },
      ];
    }

    const rows = await BandingAsesmen.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id_user", "username", "email"],
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi",
              attributes: ["nama_lengkap", "nik"],
              required: false,
            },
          ],
        },
        {
          model: Skema,
          attributes: ["id_skema", "judul_skema", "kode_skema"],
          required: false,
        },
        {
          model: Jadwal,
          attributes: ["id_jadwal", "nama_kegiatan", "tanggal_mulai"],
          required: false,
        },
      ],
      order: [["tanggal_ajukan", "DESC"]],
    });

    // Cocokkan dengan PesertaJadwal, FR.AK.04, dan FR.AK.03 agar id_peserta valid
    const enrichedData = await Promise.all(
      rows.map(async (row) => {
        const plain = row.toJSON();

        const pesertaWhere = { id_user: plain.id_user };
        if (plain.id_jadwal) {
          pesertaWhere.id_jadwal = plain.id_jadwal;
        }

        let peserta = await PesertaJadwal.findOne({
          where: pesertaWhere,
          order: [["id_peserta", "DESC"]],
        });

        // Fallback jika id_jadwal di banding tidak cocok, cari berdasarkan id_user saja
        if (!peserta && plain.id_jadwal) {
          peserta = await PesertaJadwal.findOne({
            where: { id_user: plain.id_user },
            order: [["id_peserta", "DESC"]],
          });
        }

        const id_peserta = peserta ? peserta.id_peserta : null;

        let frAk04 = null;
        let frAk03 = null;

        if (id_peserta) {
          frAk04 = await FrAk04.findOne({
            where: { id_peserta },
            attributes: ["id_fr_ak04", "tanggal_asesmen", "alasan_banding"],
          });
          frAk03 = await FrAk03.findOne({
            where: { id_peserta },
            attributes: ["id_fr_ak03", "tanggal_asesmen"],
          });
        }

        return {
          ...plain,
          id_peserta,
          has_ak04: Boolean(frAk04),
          has_ak03: Boolean(frAk03),
          fr_ak04_info: frAk04,
          fr_ak03_info: frAk03,
        };
      })
    );

    return response.success(res, "List banding", enrichedData);
  } catch (err) {
    console.error("GET ALL BANDING ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.updateStatusBanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_progress, keputusan, catatan_komite } = req.body;

    const banding = await BandingAsesmen.findByPk(id);
    if (!banding) {
      return response.error(res, "Banding tidak ditemukan", 404);
    }

    const allowedProgress = ["diajukan", "tindak_lanjut", "pleno_komite", "selesai"];
    const allowedKeputusan = ["belum_diputuskan", "diterima", "ditolak"];

    if (status_progress && !allowedProgress.includes(status_progress)) {
      return response.error(res, "Status progress tidak valid", 400);
    }
    if (keputusan && !allowedKeputusan.includes(keputusan)) {
      return response.error(res, "Keputusan banding tidak valid", 400);
    }

    await banding.update({
      status_progress: status_progress || banding.status_progress,
      keputusan: keputusan || banding.keputusan,
      catatan_komite: catatan_komite !== undefined ? catatan_komite : banding.catatan_komite,
      tanggal_putusan:
        keputusan && keputusan !== "belum_diputuskan" ? new Date() : null,
    });

    return response.success(res, "Keputusan banding berhasil diperbarui", banding);
  } catch (err) {
    return response.error(res, err.message);
  }
};