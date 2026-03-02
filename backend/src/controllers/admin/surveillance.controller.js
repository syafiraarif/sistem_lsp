const { Surveillance, User, Skema } = require("../../models");
const { Op } = require("sequelize");
const response = require("../../utils/response.util");
const ExcelJS = require("exceljs");

exports.getAllSurveillance = async (req, res) => {
  try {
    const {
      search,
      periode,
      id_skema,
      status_verifikasi,
      sumber_dana
    } = req.query;

    const where = {};

    if (periode) where.periode_surveillance = periode;
    if (id_skema) where.id_skema = id_skema;
    if (status_verifikasi) where.status_verifikasi = status_verifikasi;
    if (sumber_dana) where.sumber_dana = sumber_dana;

    if (search) {
      where[Op.or] = [
        { periode_surveillance: { [Op.like]: `%${search}%` } },
        { sumber_dana: { [Op.like]: `%${search}%` } }
      ];
    }

    const data = await Surveillance.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id_user", "username", "email"]
        },
        {
          model: Skema,
          attributes: ["id_skema", "judul_skema"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    return response.success(res, "Data surveillance", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.updateStatusSurveillance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_verifikasi } = req.body;

    const allowed = ["submitted", "review", "valid", "tidak_valid"];

    if (!allowed.includes(status_verifikasi)) {
      return response.error(res, "Status tidak valid", 400);
    }

    const data = await Surveillance.findByPk(id);

    if (!data) {
      return response.error(res, "Data surveillance tidak ditemukan", 404);
    }

    await data.update({ status_verifikasi });

    return response.success(res, "Status berhasil diupdate", data);
  } catch (err) {
    console.error("UPDATE STATUS SURVEILLANCE ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.exportSurveillance = async (req, res) => {
  try {
    const data = await Surveillance.findAll({
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: Skema, attributes: ["judul_skema"] }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Surveillance");

    sheet.columns = [
      { header: "Username", key: "username" },
      { header: "Email", key: "email" },
      { header: "Judul Skema", key: "judul_skema" },
      { header: "Periode", key: "periode_surveillance" },
      { header: "Sumber Dana", key: "sumber_dana" },
      { header: "Status", key: "status_verifikasi" }
    ];

    data.forEach(item => {
      sheet.addRow({
        username: item.User?.username,
        email: item.User?.email,
        judul_skema: item.Skema?.judul_skema,
        periode_surveillance: item.periode_surveillance,
        sumber_dana: item.sumber_dana,
        status_verifikasi: item.status_verifikasi
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=surveillance.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return response.error(res, err.message);
  }
};