const UnitKompetensi = require("../../models/unitKompetensi.model");
const Skkni = require("../../models/skkni.model");
const UnitElemen = require("../../models/unitElemen.model");
const UnitKuk = require("../../models/unitKuk.model");
const SkemaUnit = require("../../models/skemaUnit.model");
const Skema = require("../../models/skema.model");
const response = require("../../utils/response.util");

exports.create = async (req, res) => {
  try {
    const { id_skema, ...unitData } = req.body;
    
    // Simpan Unit Kompetensi
    const data = await UnitKompetensi.create(unitData);

    // Otomatis masukkan relasinya ke tabel skema_unit
    if (id_skema) {
      await SkemaUnit.create({
        id_skema: id_skema,
        id_unit: data.id_unit,
        urutan: 1
      });
    }

    return response.success(res, "Unit kompetensi berhasil dibuat", data);
  } catch (err) {
    console.error(err);
    return response.error(res, "Gagal menambahkan unit: " + err.message, 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await UnitKompetensi.findAll({
      include: [
        {
          model: Skema,
          as: "skemaList",
          through: { attributes: [] }
        },
        {
          model: Skkni,
          as: "skkni",
          attributes: ["id_skkni", "judul_skkni", "no_skkni"]
        },
        {
          model: UnitElemen,
          as: "elemen",
          include: [
            {
              model: UnitKuk,
              as: "kuk"
            }
          ]
        }
      ],
      order: [
        ['id_unit', 'ASC'],
        [{ model: UnitElemen, as: 'elemen' }, 'urutan', 'ASC'],
        [{ model: UnitElemen, as: 'elemen' }, { model: UnitKuk, as: 'kuk' }, 'urutan', 'ASC']
      ]
    });

    return response.success(res, "List unit kompetensi", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await UnitKompetensi.findByPk(req.params.id, {
      include: [
        {
          model: Skema,
          as: "skemaList",
          through: { attributes: [] }
        },
        {
          model: Skkni,
          as: "skkni",
          attributes: ["id_skkni", "judul_skkni", "no_skkni"]
        },
        {
          model: UnitElemen,
          as: "elemen",
          include: [
            {
              model: UnitKuk,
              as: "kuk"
            }
          ]
        }
      ],
      order: [
        [{ model: UnitElemen, as: 'elemen' }, 'urutan', 'ASC'],
        [{ model: UnitElemen, as: 'elemen' }, { model: UnitKuk, as: 'kuk' }, 'urutan', 'ASC']
      ]
    });

    if (!data) {
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    return response.success(res, "Detail unit kompetensi", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await UnitKompetensi.findByPk(req.params.id);

    if (!data) {
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    const { id_skema, ...unitData } = req.body;
    await data.update(unitData);

    // Update relasi ke skema jika diedit
    if (id_skema) {
      const existingLink = await SkemaUnit.findOne({
        where: { id_unit: data.id_unit, id_skema: id_skema }
      });
      if (!existingLink) {
        await SkemaUnit.create({
          id_skema: id_skema,
          id_unit: data.id_unit,
          urutan: 1
        });
      }
    }

    return response.success(res, "Unit kompetensi berhasil diperbarui", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await UnitKompetensi.findByPk(req.params.id);

    if (!data) {
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    await data.destroy();

    return response.success(res, "Unit kompetensi berhasil dihapus");
  } catch (err) {
    return response.error(res, err.message);
  }
};