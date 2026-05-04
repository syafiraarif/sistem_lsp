const Jawaban = require("../../models/frIa06Jawaban.model");
const Penilaian = require("../../models/frIa06Penilaian.model");
const Soal = require("../../models/frIa06Soal.model");


// ===============================
// LIHAT JAWABAN ASESI + SOAL + KUNCI
// ===============================
exports.getJawabanAsesi = async (req, res) => {
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
// NILAI PER SOAL (YA / TIDAK)
// ===============================
exports.nilaiJawaban = async (req, res) => {
  try {
    const { pencapaian, catatan_asesor } = req.body;

    await Jawaban.update(
      { pencapaian, catatan_asesor },
      { where: { id_jawaban: req.params.id } }
    );

    res.json({ message: "Penilaian per soal berhasil disimpan" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// HITUNG HASIL (OPSIONAL)
// ===============================
exports.hitungHasil = async (req, res) => {
  try {
    const jawaban = await Jawaban.findAll({
      where: { id_peserta: req.params.id_peserta }
    });

    let ya = 0;
    let tidak = 0;

    jawaban.forEach(j => {
      if (j.pencapaian === "ya") ya++;
      else if (j.pencapaian === "tidak") tidak++;
    });

    res.json({
      total: jawaban.length,
      tercapai: ya,
      belum: tidak
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SIMPAN PENILAIAN AKHIR
// ===============================
exports.simpanPenilaian = async (req, res) => {
  try {
    const data = await Penilaian.create({
      ...req.body,
      tanggal_penilaian: new Date()
    });

    res.json({
      message: "Penilaian akhir berhasil disimpan",
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