const FrIa08 = require("../../models/frIa08.model");
const Penilaian = require("../../models/frIa08PenilaianDokumen.model");

const Apl01Dokumen = require("../../models/apl01Dokumen.model");
const Apl01Asesmen = require("../../models/apl01Asesmen.model");

const Apl02 = require("../../models/apl02.model");
const Apl02Detail = require("../../models/apl02Detail.model");
const Apl02Bukti = require("../../models/apl02Bukti.model");


// ✅ AMBIL DATA PORTOFOLIO
exports.getData = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    // APL01
    const apl01 = await Apl01Dokumen.findAll({
      include: [
        {
          model: Apl01Asesmen,
          where: { id_peserta }
        }
      ]
    });

    // APL02
    const apl02 = await Apl02Bukti.findAll({
      include: [
        {
          model: Apl02Detail,
          include: [
            {
              model: Apl02,
              where: { id_peserta }
            }
          ]
        }
      ]
    });

    res.json({ apl01, apl02 });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ CREATE HEADER FR.IA.08
exports.create = async (req, res) => {
  try {
    if (req.user.role !== "asesor_penguji") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const data = await FrIa08.create({
      id_peserta: req.body.id_peserta,
      id_jadwal: req.body.id_jadwal,
      id_skema: req.body.id_skema,
      created_by: req.user.id,
      created_at: new Date()
    });

    res.json({
      message: "FR.IA.08 berhasil dibuat",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ SIMPAN PENILAIAN DOKUMEN
exports.savePenilaian = async (req, res) => {
  try {
    if (req.user.role !== "asesor_penguji") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const {
      id_fr_ia_08,
      sumber,
      id_ref,
      valid,
      asli,
      terkini,
      memadai,
      catatan
    } = req.body;

    await Penilaian.upsert({
      id_fr_ia_08,
      sumber,
      id_ref,
      valid,
      asli,
      terkini,
      memadai,
      catatan,
      created_at: new Date()
    });

    res.json({
      message: "Penilaian disimpan"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ GET PENILAIAN (reload UI)
exports.getPenilaian = async (req, res) => {
  try {
    const data = await Penilaian.findAll({
      where: { id_fr_ia_08: req.params.id }
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};