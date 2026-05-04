// ===============================
// ✅ IMPORT MODEL (FIXED)
// ===============================
const FrIa02 = require("../../models/frIa02.model");
const FrIa02Detail = require("../../models/frIa02Detail.model");
const FrIa02Validator = require("../../models/frIa02Validator.model");

const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const ProfileAsesi = require("../../models/profileAsesi.model");


// ===============================
// ✅ CREATE
// ===============================
exports.createFrIa02 = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal,
      details = [],
      validators = []
    } = req.body;

    const fr = await FrIa02.create({
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal
    });

    // DETAIL
    if (details.length > 0) {
      const detailData = details.map(d => ({
        id_fr_ia_02: fr.id_fr_ia_02,
        id_kelompok: d.id_kelompok,
        skenario: d.skenario,
        langkah_kerja: d.langkah_kerja,
        peralatan: d.peralatan,
        durasi: d.durasi
      }));

      await FrIa02Detail.bulkCreate(detailData);
    }

    // VALIDATOR
    if (validators.length > 0) {
      const validatorData = validators.map(v => ({
        id_fr_ia_02: fr.id_fr_ia_02,
        id_asesor: v.id_asesor,
        peran: v.peran,
        urutan: v.urutan
      }));

      await FrIa02Validator.bulkCreate(validatorData);
    }

    res.status(201).json({
      message: "FR IA 02 berhasil disimpan",
      data: fr
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menyimpan FR IA 02",
      error: error.message
    });
  }
};


// ===============================
// ✅ GET LIST BY JADWAL
// ===============================
exports.getByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrIa02.findAll({
      where: { id_jadwal },
      include: [
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" },
        { model: ProfileAsesor, as: "asesor" },
        { model: ProfileAsesi, as: "asesi" }
      ],
      order: [["id_fr_ia_02", "DESC"]]
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// ✅ GET DETAIL
// ===============================
exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa02.findOne({
      where: { id_fr_ia_02: id },
      include: [
        {
          model: FrIa02Detail,
          as: "detail",
          include: [
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            }
          ]
        },
        {
          model: FrIa02Validator,
          as: "validator",
          include: [
            {
              model: ProfileAsesor,
              as: "asesor",
              attributes: ["id_user", "nama_lengkap"]
            }
          ]
        },
        { model: Skema, as: "skema" },
        { model: Tuk, as: "tuk" },
        { model: ProfileAsesor, as: "asesor" },
        { model: ProfileAsesi, as: "asesi" }
      ]
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// ✅ UPDATE
// ===============================
exports.updateFrIa02 = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal,
      details = [],
      validators = []
    } = req.body;

    await FrIa02.update({
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      id_asesi,
      tanggal
    }, {
      where: { id_fr_ia_02: id }
    });

    // RESET DETAIL
    await FrIa02Detail.destroy({ where: { id_fr_ia_02: id } });

    if (details.length > 0) {
      const detailData = details.map(d => ({
        id_fr_ia_02: id,
        id_kelompok: d.id_kelompok,
        skenario: d.skenario,
        langkah_kerja: d.langkah_kerja,
        peralatan: d.peralatan,
        durasi: d.durasi
      }));

      await FrIa02Detail.bulkCreate(detailData);
    }

    // RESET VALIDATOR
    await FrIa02Validator.destroy({ where: { id_fr_ia_02: id } });

    if (validators.length > 0) {
      const validatorData = validators.map(v => ({
        id_fr_ia_02: id,
        id_asesor: v.id_asesor,
        peran: v.peran,
        urutan: v.urutan
      }));

      await FrIa02Validator.bulkCreate(validatorData);
    }

    res.json({ message: "FR IA 02 berhasil diupdate" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// ✅ DELETE
// ===============================
exports.deleteFrIa02 = async (req, res) => {
  try {
    const { id } = req.params;

    await FrIa02.destroy({
      where: { id_fr_ia_02: id }
    });

    res.json({
      message: "FR IA 02 berhasil dihapus"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};