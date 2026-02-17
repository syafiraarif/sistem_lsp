const { Surveillance, User, Skema, ProfileAsesi } = require("../../models");

exports.getAllSurveillance = async (req, res) => {
  try {
    const data = await Surveillance.findAll({
      include: [
        {
          model: User,
          attributes: ["id_user", "email"],
          include: [
            {
              model: ProfileAsesi,
              attributes: ["nama_lengkap", "nik"],
            },
          ],
        },
        {
          model: Skema,
          attributes: ["id_skema", "judul_skema"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(data);
  } catch (err) {
    console.error("ADMIN GET SURVEILLANCE ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil data surveillance",
    });
  }
};

exports.updateStatusSurveillance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_verifikasi } = req.body;

    const allowed = ["submitted", "review", "valid", "tidak_valid"];

    if (!allowed.includes(status_verifikasi)) {
      return res.status(400).json({
        message: "Status tidak valid",
      });
    }

    const data = await Surveillance.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "Data surveillance tidak ditemukan",
      });
    }

    await data.update({ status_verifikasi });

    return res.json({
      message: "Status berhasil diupdate",
      data,
    });
  } catch (err) {
    console.error("UPDATE STATUS SURVEILLANCE ERROR:", err);
    return res.status(500).json({
      message: "Gagal update status",
    });
  }
};
