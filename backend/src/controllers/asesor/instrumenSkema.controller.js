const {
  FrIa02,
  FrIa02Detail,
  FrIa02Validator,
  FrIa03,
  FrIa03Pertanyaan,
  FrIa05,
  FrIa05Soal,
  FrIa05Opsi,
  FrIa05Validator,
  Skema,
  SkemaUnit,
  UnitKompetensi,
  KelompokPekerjaan,
  ProfileAsesor
} = require("../../models");

const getUserId = (req) => req.user?.id_user || req.user?.id || req.user?.user_id || null;

const getCurrentAsesor = async (req) => {
  const id_user = getUserId(req);
  if (!id_user) return null;
  return ProfileAsesor.findOne({ where: { id_user } });
};

const getActiveSkema = async (id_skema) => {
  return Skema.findOne({ where: { id_skema, status: "aktif" } });
};

const getSkemaUnits = async (id_skema) => {
  return SkemaUnit.findAll({
    where: { id_skema },
    include: [
      { model: UnitKompetensi, as: "unit" },
      { model: KelompokPekerjaan, as: "kelompok" }
    ],
    order: [
      [{ model: KelompokPekerjaan, as: "kelompok" }, "urutan", "ASC"],
      ["urutan", "ASC"]
    ]
  });
};

const getSkemaGroups = async (id_skema) => {
  return KelompokPekerjaan.findAll({
    where: { id_skema },
    include: [
      {
        model: SkemaUnit,
        as: "skemaUnit",
        include: [{ model: UnitKompetensi, as: "unit" }]
      }
    ],
    order: [["urutan", "ASC"]]
  });
};

const getMasterFrIa02 = async (id_skema) => {
  return FrIa02.findOne({
    where: { id_skema, id_jadwal: null, id_asesi: null },
    include: [
      { model: Skema, as: "skema" },
      {
        model: FrIa02Detail,
        as: "detail",
        include: [{ model: KelompokPekerjaan, as: "kelompok" }]
      },
      {
        model: FrIa02Validator,
        as: "validator",
        include: [{ model: ProfileAsesor, as: "asesor" }],
        order: [["urutan", "ASC"]]
      }
    ],
    order: [["id_fr_ia_02", "DESC"]]
  });
};

const getMasterFrIa03 = async (id_skema) => {
  return FrIa03.findOne({
    where: { id_skema, id_jadwal: null, id_asesi: null },
    include: [
      { model: Skema, as: "skema" },
      {
        model: FrIa03Pertanyaan,
        as: "pertanyaan",
        include: [{ model: UnitKompetensi, as: "unit" }]
      },
      { model: ProfileAsesor, as: "asesor" }
    ],
    order: [["id_fr_ia_03", "DESC"]]
  });
};

const getMasterFrIa05 = async (id_skema) => {
  return FrIa05.findOne({
    where: { id_skema, id_jadwal: null },
    include: [
      { model: Skema, as: "skema" },
      {
        model: FrIa05Soal,
        as: "soal",
        include: [
          { model: FrIa05Opsi, as: "opsi" },
          { model: KelompokPekerjaan, as: "kelompok" }
        ]
      },
      {
        model: FrIa05Validator,
        as: "validator",
        include: [{ model: ProfileAsesor, as: "asesor" }]
      }
    ],
    order: [["id_fr_ia_05", "DESC"]]
  });
};

const normalizeDetails = (details) => {
  if (!Array.isArray(details)) return [];
  return details.map((item, index) => ({
    id_kelompok: Number(item.id_kelompok),
    kode_unit: item.kode_unit || null,
    judul_unit: item.judul_unit || null,
    urutan: Number(item.urutan || index + 1),
    skenario: item.skenario || null,
    langkah_kerja: item.langkah_kerja || null,
    peralatan: item.peralatan || null,
    durasi: item.durasi === "" || item.durasi === null || item.durasi === undefined ? null : Number(item.durasi)
  })).filter((item) => Number.isInteger(item.id_kelompok));
};

const normalizeValidators = (validators) => {
  if (!Array.isArray(validators)) return [];
  return validators.filter((item) => item.id_asesor).map((item, index) => ({
    id_asesor: Number(item.id_asesor),
    peran: item.peran === "validator" ? "validator" : "penyusun",
    urutan: Number(item.urutan || index + 1)
  }));
};

exports.getSkemaList = async (req, res) => {
  try {
    const skemas = await Skema.findAll({ where: { status: "aktif" }, order: [["judul_skema", "ASC"]] });
    const data = await Promise.all(skemas.map(async (item) => {
      const plain = item.toJSON();
      const [frIa02, frIa03, frIa05, kelompok, unit] = await Promise.all([
        getMasterFrIa02(plain.id_skema),
        getMasterFrIa03(plain.id_skema),
        getMasterFrIa05(plain.id_skema),
        KelompokPekerjaan.count({ where: { id_skema: plain.id_skema } }),
        SkemaUnit.count({ where: { id_skema: plain.id_skema } })
      ]);
      return {
        ...plain,
        instrumen: {
          fr_ia_02: Boolean(frIa02),
          fr_ia_03: Boolean(frIa03),
          fr_ia_05: Boolean(frIa05),
          kelompok_pekerjaan: kelompok,
          unit_kompetensi: unit
        }
      };
    }));
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil daftar skema", error: error.message });
  }
};

exports.getSkemaDetail = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    const [kelompok, units, frIa02, frIa03, frIa05] = await Promise.all([
      getSkemaGroups(id_skema),
      getSkemaUnits(id_skema),
      getMasterFrIa02(id_skema),
      getMasterFrIa03(id_skema),
      getMasterFrIa05(id_skema)
    ]);
    return res.json({
      success: true,
      data: {
        skema: skema.toJSON(),
        kelompok: kelompok.map((item) => item.toJSON()),
        units: units.map((item) => item.toJSON()),
        instrumen: {
          fr_ia_02: frIa02 ? frIa02.toJSON() : null,
          fr_ia_03: frIa03 ? frIa03.toJSON() : null,
          fr_ia_05: frIa05 ? frIa05.toJSON() : null
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail skema", error: error.message });
  }
};

exports.getFrIa02Master = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    const [master, units, kelompok] = await Promise.all([getMasterFrIa02(id_skema), getSkemaUnits(id_skema), getSkemaGroups(id_skema)]);
    return res.json({
      success: true,
      data: {
        skema: skema.toJSON(),
        master: master ? master.toJSON() : null,
        units: units.map((item) => item.toJSON()),
        kelompok: kelompok.map((item) => item.toJSON())
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil FR.IA.02", error: error.message });
  }
};

exports.getFrIa02UnitBySkema = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    const units = await getSkemaUnits(id_skema);
    return res.json({ success: true, data: units.map((item) => item.toJSON()) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil unit skema", error: error.message });
  }
};

exports.saveFrIa02Master = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const asesor = await getCurrentAsesor(req);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    if (!asesor) return res.status(404).json({ success: false, message: "Profil asesor tidak ditemukan" });
    const details = normalizeDetails(req.body.details);
    const validators = normalizeValidators(req.body.validators);
    let master = await getMasterFrIa02(id_skema);
    if (!master) {
      master = await FrIa02.create({
        id_jadwal: null,
        id_skema,
        id_tuk: null,
        id_asesor: asesor.id_user,
        id_asesi: null,
        tanggal: null,
        created_by: asesor.id_user,
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      await master.update({ id_asesor: asesor.id_user, created_by: master.created_by || asesor.id_user, updated_at: new Date() });
    }
    await FrIa02Detail.destroy({ where: { id_fr_ia_02: master.id_fr_ia_02 } });
    await FrIa02Validator.destroy({ where: { id_fr_ia_02: master.id_fr_ia_02 } });
    if (details.length) await FrIa02Detail.bulkCreate(details.map((item) => ({ id_fr_ia_02: master.id_fr_ia_02, ...item })));
    if (validators.length) await FrIa02Validator.bulkCreate(validators.map((item) => ({ id_fr_ia_02: master.id_fr_ia_02, ...item })));
    const result = await getMasterFrIa02(id_skema);
    return res.json({ success: true, message: "FR.IA.02 berhasil disimpan berdasarkan skema", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menyimpan FR.IA.02", error: error.message });
  }
};

const ensureMasterFrIa03 = async (id_skema, req) => {
  const existing = await getMasterFrIa03(id_skema);
  if (existing) return existing;
  const asesor = await getCurrentAsesor(req);
  if (!asesor) throw new Error("Profil asesor tidak ditemukan");
  return FrIa03.create({
    id_jadwal: null,
    id_skema,
    id_tuk: null,
    id_asesor: asesor.id_user,
    id_asesi: null,
    tanggal: null,
    created_by: asesor.id_user,
    created_at: new Date()
  });
};

exports.getFrIa03Master = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    const [master, units] = await Promise.all([getMasterFrIa03(id_skema), getSkemaUnits(id_skema)]);
    return res.json({ success: true, data: { skema: skema.toJSON(), master: master ? master.toJSON() : null, units: units.map((item) => item.toJSON()) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil FR.IA.03", error: error.message });
  }
};

exports.createFrIa03MasterPertanyaan = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const id_unit = Number(req.body.id_unit);
    const pertanyaan = String(req.body.pertanyaan || "").trim();
    const urutan = Number(req.body.urutan || 1);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    if (!id_unit || !pertanyaan) return res.status(400).json({ success: false, message: "Unit kompetensi dan pertanyaan wajib diisi" });
    const mapping = await SkemaUnit.findOne({ where: { id_skema, id_unit } });
    if (!mapping) return res.status(400).json({ success: false, message: "Unit kompetensi tidak termasuk dalam skema" });
    const master = await ensureMasterFrIa03(id_skema, req);
    const data = await FrIa03Pertanyaan.create({ id_fr_ia_03: master.id_fr_ia_03, id_unit, pertanyaan, urutan, created_by: getUserId(req), created_at: new Date() });
    return res.status(201).json({ success: true, message: "Pertanyaan FR.IA.03 berhasil disimpan", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menyimpan pertanyaan FR.IA.03", error: error.message });
  }
};

exports.updateFrIa03MasterPertanyaan = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const id_pertanyaan = Number(req.params.id_pertanyaan);
    const data = await FrIa03Pertanyaan.findByPk(id_pertanyaan, { include: [{ model: FrIa03, as: "frIa03" }] });
    if (!data || Number(data.frIa03?.id_skema) !== id_skema || data.frIa03?.id_jadwal !== null) return res.status(404).json({ success: false, message: "Pertanyaan FR.IA.03 tidak ditemukan" });
    const id_unit = Number(req.body.id_unit);
    if (id_unit) {
      const mapping = await SkemaUnit.findOne({ where: { id_skema, id_unit } });
      if (!mapping) return res.status(400).json({ success: false, message: "Unit kompetensi tidak termasuk dalam skema" });
    }
    await data.update({ id_unit: id_unit || data.id_unit, pertanyaan: String(req.body.pertanyaan || data.pertanyaan).trim(), urutan: Number(req.body.urutan || data.urutan || 1) });
    return res.json({ success: true, message: "Pertanyaan FR.IA.03 berhasil diperbarui", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memperbarui pertanyaan FR.IA.03", error: error.message });
  }
};

exports.deleteFrIa03MasterPertanyaan = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const id_pertanyaan = Number(req.params.id_pertanyaan);
    const data = await FrIa03Pertanyaan.findByPk(id_pertanyaan, { include: [{ model: FrIa03, as: "frIa03" }] });
    if (!data || Number(data.frIa03?.id_skema) !== id_skema || data.frIa03?.id_jadwal !== null) return res.status(404).json({ success: false, message: "Pertanyaan FR.IA.03 tidak ditemukan" });
    await data.destroy();
    return res.json({ success: true, message: "Pertanyaan FR.IA.03 berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menghapus pertanyaan FR.IA.03", error: error.message });
  }
};

exports.getFrIa05Master = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    const master = await getMasterFrIa05(id_skema);
    return res.json({ success: true, data: { skema: skema.toJSON(), master: master ? master.toJSON() : null } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil FR.IA.05", error: error.message });
  }
};

exports.saveFrIa05Master = async (req, res) => {
  try {
    const id_skema = Number(req.params.id_skema);
    const asesor = await getCurrentAsesor(req);
    const skema = await getActiveSkema(id_skema);
    if (!skema) return res.status(404).json({ success: false, message: "Skema tidak ditemukan" });
    if (!asesor) return res.status(404).json({ success: false, message: "Profil asesor tidak ditemukan" });
    const kode_paket = String(req.body.kode_paket || `FRIA05-${skema.kode_skema}`).trim();
    if (!kode_paket) return res.status(400).json({ success: false, message: "Kode paket wajib diisi" });
    let master = await getMasterFrIa05(id_skema);
    const payload = {
      id_jadwal: null,
      id_skema,
      kode_paket,
      judul_paket: String(req.body.judul_paket || "Paket Soal FR.IA.05").trim(),
      passing_grade: Number(req.body.passing_grade || 70),
      nama_asesi: null,
      tanggal: null,
      waktu: null,
      created_by: master?.created_by || asesor.id_user,
      created_at: master?.created_at || new Date()
    };
    if (!master) master = await FrIa05.create(payload);
    else await master.update(payload);
    await FrIa05Validator.destroy({ where: { id_fr_ia_05: master.id_fr_ia_05 } });
    const validators = normalizeValidators(req.body.validators);
    if (validators.length) await FrIa05Validator.bulkCreate(validators.map((item) => ({ id_fr_ia_05: master.id_fr_ia_05, ...item })));
    const result = await getMasterFrIa05(id_skema);
    return res.json({ success: true, message: "Paket FR.IA.05 berhasil disimpan berdasarkan skema", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menyimpan paket FR.IA.05", error: error.message });
  }
};
 