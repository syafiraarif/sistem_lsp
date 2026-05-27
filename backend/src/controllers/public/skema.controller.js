const {
  Skema,
  Persyaratan,
  SkemaUnit,
  UnitKompetensi,
} = require("../../models");

exports.getAllPublic = async (req, res) => {
  try {
    const data = await Skema.findAll({
      where: { status: "aktif" },
      include: [
        {
          model: Persyaratan,
          attributes: ["id_persyaratan", "nama_persyaratan"],
          through: { attributes: [] },
        },
        {
          model: SkemaUnit,
          as: "skemaUnit",
          attributes: ["id_skema", "id_unit", "urutan"],
          required: false,
          include: [
            {
              model: UnitKompetensi,
              as: "unit",
              attributes: ["id_unit", "kode_unit", "judul_unit"],
              required: false,
            },
          ],
        },
      ],
      order: [
        ["judul_skema", "ASC"],
        [{ model: SkemaUnit, as: "skemaUnit" }, "urutan", "ASC"],
      ],
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET PUBLIC SKEMA ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};