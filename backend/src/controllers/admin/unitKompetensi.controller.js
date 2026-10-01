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

const validateKelompokInSkema = async ({ id_skema, id_kelompok, transaction }) => {
  const idSkemaNumber = toNumberOrNull(id_skema);
  const idKelompokNumber = toNumberOrNull(id_kelompok);
  if (!idSkemaNumber) throw new Error("Skema wajib dipilih");
  if (!idKelompokNumber) throw new Error("Kelompok pekerjaan wajib dipilih");
  
  const kelompok = await KelompokPekerjaan.findOne({
    where: { id_skema: idSkemaNumber, id_kelompok: idKelompokNumber },
    transaction,
  });
  if (!kelompok) throw new Error("Kelompok pekerjaan tidak ditemukan pada skema ini");
  return kelompok;
};

const attachKelompokToUnits = async (units) => {
  const plainUnits = units.map((unit) =>
    typeof unit.toJSON === "function" ? unit.toJSON() : unit
  );
  const relations = await sequelize.query(
    `
    SELECT 
      su.id_skema, su.id_kelompok, su.id_unit, su.urutan,
      kp.nama_kelompok, kp.deskripsi AS deskripsi_kelompok, kp.urutan AS urutan_kelompok
    FROM skema_unit su
    INNER JOIN kelompok_pekerjaan kp ON kp.id_kelompok = su.id_kelompok
    ORDER BY kp.urutan ASC, su.urutan ASC
    `,
    { type: QueryTypes.SELECT }
  );
  return plainUnits.map((unit) => {
    const idUnit = unit.id_unit || unit.id;
    const unitRelations = relations.filter((rel) => Number(rel.id_unit) === Number(idUnit));
    const skemaList = Array.isArray(unit.skemaList) ? unit.skemaList : [];
    
    const enrichedSkemaList = skemaList.map((skema) => {
      const rel = unitRelations.find((item) => Number(item.id_skema) === Number(skema.id_skema));
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
        id_skema: rel.id_skema, id_kelompok: rel.id_kelompok, nama_kelompok: rel.nama_kelompok,
        deskripsi: rel.deskripsi_kelompok, urutan_kelompok: rel.urutan_kelompok, urutan_unit: rel.urutan,
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
    const { id_skema, id_kelompok, id_skkni, kode_unit, judul_unit, urutan } = req.body;
    
    if (!id_skema || !id_kelompok || !kode_unit || !judul_unit) {
      await t.rollback();
      return response.error(res, "Skema, Kelompok, Kode, dan Judul wajib diisi", 400);
    }

    const kodeUnit = String(kode_unit).trim();
    const kelompok = await validateKelompokInSkema({ id_skema, id_kelompok, transaction: t });

    // 1. Cek apakah unit sudah ada di Master Data
    let unit = await UnitKompetensi.findOne({ where: { kode_unit: kodeUnit }, transaction: t });

    if (!unit) {
      // Buat unit baru jika belum ada
      if (!id_skkni) {
        await t.rollback();
        return response.error(res, "SKKNI wajib dipilih untuk unit baru", 400);
      }
      unit = await UnitKompetensi.create({
        id_skkni: toNumberOrNull(id_skkni),
        kode_unit: kodeUnit,
        judul_unit: String(judul_unit).trim(),
      }, { transaction: t });
    } else {
      // Pastikan unit belum dihubungkan ke kelompok/skema ini
      const existingLink = await SkemaUnit.findOne({
        where: { id_skema: toNumberOrNull(id_skema), id_kelompok: kelompok.id_kelompok, id_unit: unit.id_unit },
        transaction: t,
      });
      if (existingLink) {
        await t.rollback();
        return response.error(res, `Unit "${kodeUnit}" sudah ada di kelompok ini.`, 409);
      }
    }

    // 2. Hubungkan Unit ke Skema dan Kelompok
    await SkemaUnit.create({
      id_skema: toNumberOrNull(id_skema),
      id_kelompok: kelompok.id_kelompok,
      id_unit: unit.id_unit,
      urutan: toNumberOrNull(urutan) || 1,
    }, { transaction: t });

    await t.commit();
    return response.success(res, "Unit kompetensi berhasil ditambahkan", unit);
  } catch (err) {
    await t.rollback();
    return response.error(res, "Gagal menambahkan unit: " + err.message, 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await UnitKompetensi.findAll({
      include: [
        {
          model: Skema, as: "skemaList",
          through: { attributes: ["id_skema", "id_kelompok", "id_unit", "urutan"] },
        },
        { model: Skkni, as: "skkni", attributes: ["id_skkni", "judul_skkni", "no_skkni"] },
        {
          model: UnitElemen, as: "elemen",
          include: [{ model: UnitKuk, as: "kuk" }],
        },
      ],
      order: [
        ["id_unit", "ASC"],
        [{ model: UnitElemen, as: "elemen" }, "urutan", "ASC"],
        [{ model: UnitElemen, as: "elemen" }, { model: UnitKuk, as: "kuk" }, "urutan", "ASC"],
      ],
    });
    const result = await attachKelompokToUnits(data);
    return response.success(res, "List unit kompetensi", result);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await UnitKompetensi.findByPk(req.params.id, {
      include: [
        {
          model: Skema, as: "skemaList",
          through: { attributes: ["id_skema", "id_kelompok", "id_unit", "urutan"] },
        },
        { model: Skkni, as: "skkni", attributes: ["id_skkni", "judul_skkni", "no_skkni"] },
        {
          model: UnitElemen, as: "elemen",
          include: [{ model: UnitKuk, as: "kuk" }],
        },
      ],
    });
    if (!data) return response.error(res, "Unit kompetensi tidak ditemukan", 404);
    const result = await attachKelompokToUnits([data]);
    return response.success(res, "Detail unit", result[0]);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_skema, id_kelompok, id_skkni, kode_unit, judul_unit, urutan } = req.body;
    const data = await UnitKompetensi.findByPk(req.params.id);
    if (!data) {
      await t.rollback();
      return response.error(res, "Unit tidak ditemukan", 404);
    }

    const kodeUnit = String(kode_unit).trim();
    
    // Cek duplikasi jika mengubah kode unit
    const existingUnit = await UnitKompetensi.findOne({ where: { kode_unit: kodeUnit }, transaction: t });
    if (existingUnit && Number(existingUnit.id_unit) !== Number(req.params.id)) {
      await t.rollback();
      return response.error(res, `Kode unit "${kodeUnit}" sudah digunakan.`, 409);
    }

    const kelompok = await validateKelompokInSkema({ id_skema, id_kelompok, transaction: t });

    // Update Master Data
    await data.update({
      id_skkni: toNumberOrNull(id_skkni) || data.id_skkni,
      kode_unit: kodeUnit,
      judul_unit: String(judul_unit).trim(),
    }, { transaction: t });

    // Update Pivot Link (urutan / pindah kelompok)
    const existingLink = await SkemaUnit.findOne({
      where: { id_unit: data.id_unit, id_skema: toNumberOrNull(id_skema) },
      transaction: t,
    });
    
    if (existingLink) {
      await existingLink.update({
        id_kelompok: kelompok.id_kelompok,
        urutan: toNumberOrNull(urutan) || existingLink.urutan || 1,
      }, { transaction: t });
    }

    await t.commit();
    return response.success(res, "Unit kompetensi diperbarui", data);
  } catch (err) {
    await t.rollback();
    return response.error(res, "Gagal memperbarui unit: " + err.message, 500);
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

    const id_skema = req.query.id_skema;

    if (id_skema) {
      // 1. Hapus link dari skema spesifik ini
      await SkemaUnit.destroy({
        where: { id_unit: data.id_unit, id_skema: toNumberOrNull(id_skema) },
        transaction: t,
      });

      // 2. Hitung apakah unit ini masih dipakai di skema lain
      const countUsed = await SkemaUnit.count({
        where: { id_unit: data.id_unit },
        transaction: t
      });

      // 3. Jika sudah tidak dipakai di skema mana pun, sekalian hapus master datanya
      if (countUsed === 0) {
        await data.destroy({ transaction: t });
      }
    } else {
      // Fallback jika id_skema tidak dikirim (hapus semua)
      await SkemaUnit.destroy({ where: { id_unit: data.id_unit }, transaction: t });
      await data.destroy({ transaction: t });
    }

    await t.commit();
    return response.success(res, "Unit berhasil dihapus dari skema");
  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};