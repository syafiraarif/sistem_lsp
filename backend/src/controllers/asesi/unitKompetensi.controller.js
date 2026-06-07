const UnitKompetensi = require("../../models/unitKompetensi.model");
const Skkni = require("../../models/skkni.model");
const UnitElemen = require("../../models/unitElemen.model");
const UnitKuk = require("../../models/unitKuk.model");
const SkemaUnit = require("../../models/skemaUnit.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");
const response = require("../../utils/response.util");

/* ===============================
HELPER
================================ */

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getUnitFull = async (id_unit) => {
  const unit = await UnitKompetensi.findByPk(id_unit, {
    include: [
      {
        model: Skkni,
        as: "skkni",
        required: false,
        attributes: ["id_skkni", "judul_skkni", "no_skkni"],
      },
    ],
  });

  if (!unit) return null;

  const plainUnit = toPlain(unit);

  const elemenData = await UnitElemen.findAll({
    where: {
      id_unit,
    },
    order: [["urutan", "ASC"]],
  });

  const elemen = [];

  for (const item of elemenData) {
    const plainElemen = toPlain(item);

    const kukData = await UnitKuk.findAll({
      where: {
        id_elemen: plainElemen.id_elemen,
      },
      order: [["urutan", "ASC"]],
    });

    elemen.push({
      ...plainElemen,
      kuk: kukData.map((kuk) => toPlain(kuk)),
    });
  }

  return {
    ...plainUnit,
    elemen,
  };
};

/* ===============================
GET UNIT BY SKKNI
GET /api/asesi/unit-kompetensi/skkni/:id_skkni
================================ */

exports.getBySkkni = async (req, res) => {
  try {
    const { id_skkni } = req.params;

    const data = await UnitKompetensi.findAll({
      where: {
        id_skkni,
      },
      include: [
        {
          model: Skkni,
          as: "skkni",
          required: false,
          attributes: ["id_skkni", "judul_skkni", "no_skkni"],
        },
        {
          model: UnitElemen,
          as: "elemen",
          required: false,
          include: [
            {
              model: UnitKuk,
              as: "kuk",
              required: false,
            },
          ],
        },
      ],
      order: [
        ["id_unit", "ASC"],
        [{ model: UnitElemen, as: "elemen" }, "urutan", "ASC"],
        [
          { model: UnitElemen, as: "elemen" },
          { model: UnitKuk, as: "kuk" },
          "urutan",
          "ASC",
        ],
      ],
    });

    return response.success(res, "List unit kompetensi berdasarkan SKKNI", data);
  } catch (err) {
    console.error("GET UNIT BY SKKNI ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===============================
GET UNIT BY SKEMA
GET /api/asesi/unit-kompetensi/skema/:id_skema
================================ */

exports.getBySkema = async (req, res) => {
  try {
    const { id_skema } = req.params;

    if (!id_skema) {
      return response.error(res, "ID skema wajib diisi", 400);
    }

    const relasi = await SkemaUnit.findAll({
      where: {
        id_skema,
      },
      order: [
        ["id_kelompok", "ASC"],
        ["urutan", "ASC"],
        ["id_unit", "ASC"],
      ],
    });

    if (!relasi.length) {
      return response.success(
        res,
        "Belum ada unit kompetensi pada skema ini",
        []
      );
    }

    const result = [];

    for (const item of relasi) {
      const plainRelasi = toPlain(item);

      const unit = await getUnitFull(plainRelasi.id_unit);

      if (!unit) continue;

      let kelompok = null;

      if (plainRelasi.id_kelompok) {
        const kelompokData = await KelompokPekerjaan.findByPk(
          plainRelasi.id_kelompok
        );

        kelompok = toPlain(kelompokData);
      }

      result.push({
        ...unit,

        skema_unit: {
          id_skema: safeNumber(plainRelasi.id_skema),
          id_kelompok: safeNumber(plainRelasi.id_kelompok),
          id_unit: safeNumber(plainRelasi.id_unit),
          urutan: safeNumber(plainRelasi.urutan),
        },

        kelompok_pekerjaan: kelompok
          ? {
              id_kelompok: kelompok.id_kelompok,
              id_skema: kelompok.id_skema,
              nama_kelompok: kelompok.nama_kelompok,
              deskripsi: kelompok.deskripsi,
              urutan: kelompok.urutan,
            }
          : null,
      });
    }

    return response.success(
      res,
      "List unit kompetensi berdasarkan skema",
      result
    );
  } catch (err) {
    console.error("GET UNIT BY SKEMA ERROR:", err);
    return response.error(res, err.message);
  }
};

/* ===============================
GET DETAIL UNIT
GET /api/asesi/unit-kompetensi/:id
================================ */

exports.getDetail = async (req, res) => {
  try {
    const data = await getUnitFull(req.params.id);

    if (!data) {
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    return response.success(res, "Detail unit kompetensi", data);
  } catch (err) {
    console.error("GET DETAIL UNIT ERROR:", err);
    return response.error(res, err.message);
  }
};