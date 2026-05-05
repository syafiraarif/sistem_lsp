const Jawaban = require("../../models/frIa07Jawaban.model");
const Penilaian = require("../../models/frIa07Penilaian.model");
const Soal = require("../../models/frIa07Soal.model");


// ===============================
// GET FORM (SOAL + JAWABAN ASESI)
// ===============================
exports.getForm = async (req, res) => {
  try {
    const data = await Jawaban.findAll({
      where: { id_peserta: req.params.id_peserta },
      include: [
        {
          model: Soal,
          as: "soal"
        }
      ],
      order: [["id_soal", "ASC"]]
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SIMPAN / UPDATE JAWABAN ASESI
// ===============================
exports.saveJawaban = async (req, res) => {
  try {
    const { id_peserta, id_soal, jawaban_asesi, pencapaian } = req.body;

    const [data] = await Jawaban.upsert({
      id_peserta,
      id_soal,
      jawaban_asesi,
      pencapaian,
      created_at: new Date()
    });

    res.json({
      message: "Jawaban berhasil disimpan",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SIMPAN PENILAIAN AKHIR
// ===============================
exports.savePenilaian = async (req, res) => {
  try {
    const data = await Penilaian.create({
      id_peserta: req.body.id_peserta,
      id_fr_ia_07: req.body.id_fr_ia_07,
      hasil: req.body.hasil,
      umpan_balik: req.body.umpan_balik,
      rekomendasi: req.body.rekomendasi,
      ttd_asesor: req.body.ttd_asesor,
      tanggal_penilaian: new Date()
    });

    res.json({
      message: "Penilaian berhasil disimpan",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET PENILAIAN
// ===============================
exports.getPenilaian = async (req, res) => {
  try {
    const data = await Penilaian.findOne({
      where: { id_peserta: req.params.id_peserta }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};