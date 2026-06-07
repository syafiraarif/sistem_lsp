const { QueryTypes } = require("sequelize");

const UnitKompetensi = require("../../models/unitKompetensi.model");
const Skkni = require("../../models/skkni.model");
const UnitElemen = require("../../models/unitElemen.model");
const UnitKuk = require("../../models/unitKuk.model");
const SkemaUnit = require("../../models/skemaUnit.model");
const Skema = require("../../models/skema.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");
const response = require("../../utils/response.util");

const sequelize = UnitKompetensi.sequelize;

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getOrCreateKelompok = async ({
  id_skema,
  nama_kelompok,
  deskripsi,
  urutan,
  transaction,
}) => {
  if (!id_skema) {
    throw new Error("Skema wajib dipilih");
  }

  if (!nama_kelompok || !String(nama_kelompok).trim()) {
    throw new Error("Nama kelompok pekerjaan wajib diisi");
  }

  const namaKelompok = String(nama_kelompok).trim();

  let kelompok = await KelompokPekerjaan.findOne({
    where: {
      id_skema,
      nama_kelompok: namaKelompok,
    },
    transaction,
  });

  if (kelompok) {
    await kelompok.update(
      {
        deskripsi: deskripsi ?? kelompok.deskripsi,
        urutan: toNumberOrNull(urutan) || kelompok.urutan || 1,
      },
      { transaction }
    );

    return kelompok;
  }

  kelompok = await KelompokPekerjaan.create(
    {
      id_skema,
      nama_kelompok: namaKelompok,
      deskripsi: deskripsi || null,
      urutan: toNumberOrNull(urutan) || 1,
    },
    { transaction }
  );

  return kelompok;
};

const attachKelompokToUnits = async (units) => {
  const plainUnits = units.map((unit) =>
    typeof unit.toJSON === "function" ? unit.toJSON() : unit
  );

  const relations = await sequelize.query(
    `
    SELECT 
      su.id_skema,
      su.id_kelompok,
      su.id_unit,
      su.urutan,
      kp.nama_kelompok,
      kp.deskripsi AS deskripsi_kelompok,
      kp.urutan AS urutan_kelompok
    FROM skema_unit su
    LEFT JOIN kelompok_pekerjaan kp
      ON kp.id_kelompok = su.id_kelompok
    ORDER BY
      kp.urutan ASC,
      su.urutan ASC
    `,
    { type: QueryTypes.SELECT }
  );

  return plainUnits.map((unit) => {
    const idUnit = unit.id_unit || unit.id;

    const unitRelations = relations.filter(
      (rel) => Number(rel.id_unit) === Number(idUnit)
    );

    const skemaList = Array.isArray(unit.skemaList) ? unit.skemaList : [];

    const enrichedSkemaList = skemaList.map((skema) => {
      const rel = unitRelations.find(
        (item) => Number(item.id_skema) === Number(skema.id_skema)
      );

      return {
        ...skema,
        id_kelompok: rel?.id_kelompok || null,
        nama_kelompok: rel?.nama_kelompok || null,
        deskripsi_kelompok: rel?.deskripsi_kelompok || null,
        urutan_kelompok: rel?.urutan_kelompok || null,
        urutan: rel?.urutan || null,
      };
    });

    return {
      ...unit,
      skemaList: enrichedSkemaList,
      kelompokList: unitRelations.map((rel) => ({
        id_skema: rel.id_skema,
        id_kelompok: rel.id_kelompok,
        nama_kelompok: rel.nama_kelompok,
        deskripsi: rel.deskripsi_kelompok,
        urutan_kelompok: rel.urutan_kelompok,
        urutan_unit: rel.urutan,
      })),
      id_kelompok: unitRelations[0]?.id_kelompok || null,
      nama_kelompok: unitRelations[0]?.nama_kelompok || null,
      deskripsi_kelompok: unitRelations[0]?.deskripsi_kelompok || null,
      urutan_kelompok: unitRelations[0]?.urutan_kelompok || null,
      urutan_skema_unit: unitRelations[0]?.urutan || null,
    };
  });
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      id_skema,
      id_skkni,
      kode_unit,
      judul_unit,
      nama_kelompok,
      deskripsi_kelompok,
      urutan_kelompok,
      urutan,
    } = req.body;

    if (!id_skema) {
      await t.rollback();
      return response.error(res, "Skema wajib dipilih", 400);
    }

    if (!nama_kelompok) {
      await t.rollback();
      return response.error(res, "Kelompok pekerjaan wajib diisi", 400);
    }

    if (!id_skkni) {
      await t.rollback();
      return response.error(res, "SKKNI wajib dipilih", 400);
    }

    if (!kode_unit || !judul_unit) {
      await t.rollback();
      return response.error(res, "Kode unit dan judul unit wajib diisi", 400);
    }

    const kelompok = await getOrCreateKelompok({
      id_skema,
      nama_kelompok,
      deskripsi: deskripsi_kelompok,
      urutan: urutan_kelompok,
      transaction: t,
    });

    const data = await UnitKompetensi.create(
      {
        id_skkni,
        kode_unit,
        judul_unit,
      },
      { transaction: t }
    );

    await SkemaUnit.create(
      {
        id_skema: toNumberOrNull(id_skema),
        id_kelompok: kelompok.id_kelompok,
        id_unit: data.id_unit,
        urutan: toNumberOrNull(urutan) || 1,
      },
      { transaction: t }
    );

    await t.commit();

    return response.success(
      res,
      "Unit kompetensi berhasil dibuat",
      data
    );
  } catch (err) {
    await t.rollback();
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
          through: {
            attributes: ["id_skema", "id_kelompok", "id_unit", "urutan"],
          },
        },
        {
          model: Skkni,
          as: "skkni",
          attributes: ["id_skkni", "judul_skkni", "no_skkni"],
        },
        {
          model: UnitElemen,
          as: "elemen",
          include: [
            {
              model: UnitKuk,
              as: "kuk",
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

    const result = await attachKelompokToUnits(data);

    return response.success(res, "List unit kompetensi", result);
  } catch (err) {
    console.error(err);
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
          through: {
            attributes: ["id_skema", "id_kelompok", "id_unit", "urutan"],
          },
        },
        {
          model: Skkni,
          as: "skkni",
          attributes: ["id_skkni", "judul_skkni", "no_skkni"],
        },
        {
          model: UnitElemen,
          as: "elemen",
          include: [
            {
              model: UnitKuk,
              as: "kuk",
            },
          ],
        },
      ],
    });

    if (!data) {
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    const result = await attachKelompokToUnits([data]);

    return response.success(res, "Detail unit kompetensi", result[0]);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const data = await UnitKompetensi.findByPk(req.params.id);

    if (!data) {
      await t.rollback();
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    const {
      id_skema,
      id_skkni,
      kode_unit,
      judul_unit,
      nama_kelompok,
      deskripsi_kelompok,
      urutan_kelompok,
      urutan,
    } = req.body;

    if (!id_skema) {
      await t.rollback();
      return response.error(res, "Skema wajib dipilih", 400);
    }

    if (!nama_kelompok) {
      await t.rollback();
      return response.error(res, "Kelompok pekerjaan wajib diisi", 400);
    }

    if (!id_skkni) {
      await t.rollback();
      return response.error(res, "SKKNI wajib dipilih", 400);
    }

    if (!kode_unit || !judul_unit) {
      await t.rollback();
      return response.error(res, "Kode unit dan judul unit wajib diisi", 400);
    }

    const kelompok = await getOrCreateKelompok({
      id_skema,
      nama_kelompok,
      deskripsi: deskripsi_kelompok,
      urutan: urutan_kelompok,
      transaction: t,
    });

    await data.update(
      {
        id_skkni,
        kode_unit,
        judul_unit,
      },
      { transaction: t }
    );

    const existingLink = await SkemaUnit.findOne({
      where: {
        id_unit: data.id_unit,
        id_skema,
      },
      transaction: t,
    });

    if (existingLink) {
      await existingLink.update(
        {
          id_kelompok: kelompok.id_kelompok,
          urutan: toNumberOrNull(urutan) || existingLink.urutan || 1,
        },
        { transaction: t }
      );
    } else {
      await SkemaUnit.create(
        {
          id_skema: toNumberOrNull(id_skema),
          id_kelompok: kelompok.id_kelompok,
          id_unit: data.id_unit,
          urutan: toNumberOrNull(urutan) || 1,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return response.success(res, "Unit kompetensi berhasil diperbarui", data);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const data = await UnitKompetensi.findByPk(req.params.id);

    if (!data) {
      await t.rollback();
      return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    }

    await SkemaUnit.destroy({
      where: {
        id_unit: data.id_unit,
      },
      transaction: t,
    });

    await data.destroy({ transaction: t });

    await t.commit();

    return response.success(res, "Unit kompetensi berhasil dihapus");
  } catch (err) {
    await t.rollback();
    console.error(err);
    return response.error(res, err.message);
  }
};