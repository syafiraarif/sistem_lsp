const { PesertaJadwal, User, Jadwal, ProfileAsesi, Skema } = require("../../models");
const response = require("../../utils/response.util");
const { Op } = require("sequelize");

exports.getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: [
        { 
          model: User, 
          as: "user",
          include: [{ model: ProfileAsesi }] 
        },
        { 
          model: Jadwal, 
          as: "jadwal",
          include: [{ model: Skema, as: "skema" }] 
        }
      ],
      distinct: true
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

    if (status === 'terjadwal') {
      whereCondition.status_asesmen = { [Op.in]: ['terdaftar', 'pra_asesmen', 'asesmen'] };
    } else if (status) {
      whereCondition.status_asesmen = status;
    }

    const data = await PesertaJadwal.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          include: [{ model: ProfileAsesi }] 
        },
        {
          model: Jadwal,
          as: "jadwal",
          include: [{ model: Skema, as: "skema" }] 
        }
      ],
      distinct: true 
    });

    return response.success(res, "List peserta jadwal global", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};
