const sequelize = require("../../config/database");

exports.getStatistics = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM profile_asesor WHERE status_asesor = 'aktif') AS asesor,
        (SELECT COUNT(*) FROM tuk WHERE status = 'aktif') AS tuk,
        (SELECT COUNT(*) FROM skema WHERE status = 'aktif') AS skema,
        (SELECT COUNT(*) FROM profile_asesi) AS asesi
    `);

    const statistics = rows[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        asesor: Number(statistics.asesor) || 0,
        tuk: Number(statistics.tuk) || 0,
        skema: Number(statistics.skema) || 0,
        asesi: Number(statistics.asesi) || 0
      }
    });
  } catch (error) {
    console.error("GET PUBLIC STATISTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik SIMLSP"
    });
  }
};