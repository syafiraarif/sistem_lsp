const FrIa04b = require("../../models/frIa04b.model");
const FrIa04bDetail = require("../../models/frIa04bDetail.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");
const JadwalAsesor = require("../../models/jadwalAsesor.model");

// ===============================
// VALIDASI KOMITE
// ===============================
const isKomite = async (id_jadwal, id_user) => {
  const data = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      id_user,
      jenis_tugas: "komite_teknis",
      status: "aktif"
    }
  });
  return !!data;
};


// ===============================
// CREATE HEADER + AUTO DETAIL
// ===============================
exports.createOrGet = async (req, res) => {
  try {
    const { id_jadwal, id_peserta, id_skema, id_tuk } = req.body;
    const id_user = req.user.id_user;

    if (!(await isKomite(id_jadwal, id_user))) {
      return res.status(403).json({ message: "Bukan komite teknis" });
    }

    let header = await FrIa04b.findOne({
      where: { id_jadwal, id_peserta }
    });

    if (!header) {
      header = await FrIa04b.create({
        id_jadwal,
        id_peserta,
        id_skema,
        id_tuk,
        id_asesor: id_user
      });

      // 🔥 AUTO GENERATE DETAIL
      const kelompok = await KelompokPekerjaan.findAll({
        where: { id_skema },
        order: [["id_kelompok", "ASC"]]
      });

      const detailData = kelompok.map(k => ({
        id_fr_ia_04b: header.id_fr_ia_04b,
        id_kelompok: k.id_kelompok
      }));

      await FrIa04bDetail.bulkCreate(detailData);
    }

    res.json({ success: true, data: header });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// INPUT KOMITE (SOAL)
// ===============================
exports.saveKomite = async (req, res) => {
  try {
    const { id_detail, lingkup, pertanyaan, kesesuaian } = req.body;

    await FrIa04bDetail.update(
      { lingkup, pertanyaan, kesesuaian },
      { where: { id_detail } }
    );

    res.json({ success: true, message: "Data komite tersimpan" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET FORM (KOMITE)
// ===============================
exports.getForm = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrIa04b.findByPk(id, {
      include: [
        {
          model: FrIa04bDetail,
          as: "detail"
        }
      ]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};