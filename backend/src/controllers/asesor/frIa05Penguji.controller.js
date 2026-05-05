const Jawaban = require("../../models/frIa05Jawaban.model");
const Penilaian = require("../../models/frIa05Penilaian.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");


// ===============================
// LIHAT HASIL ASESI
// ===============================
exports.getHasilAsesi = async (req, res) => {
  try {
    const data = await Jawaban.findAll({
      where: { id_peserta: req.params.id_peserta },
      include: [
        {
          model: Soal,
          include: [Opsi]
        },
        {
          model: Opsi
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
// HITUNG NILAI OTOMATIS
// ===============================
exports.hitungNilai = async (req, res) => {
  try {
    const jawaban = await Jawaban.findAll({
      where: { id_peserta: req.params.id_peserta }
    });

    let benar = 0;
    let salah = 0;

    jawaban.forEach(j => {
      if (j.is_benar) benar++;
      else salah++;
    });

    const total = jawaban.length;
    const nilai = total > 0 ? (benar / total) * 100 : 0;

    res.json({
      total,
      benar,
      salah,
      nilai
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SIMPAN PENILAIAN + FEEDBACK
// ===============================
exports.simpanPenilaian = async (req, res) => {
  try {
    const {
      id_peserta,
      id_fr_ia_05,
      jumlah_benar,
      jumlah_salah,
      nilai,
      hasil,
      umpan_balik,
      catatan,
      ttd_asesor
    } = req.body;

    const data = await Penilaian.create({
      id_peserta,
      id_fr_ia_05,
      jumlah_benar,
      jumlah_salah,
      nilai,
      hasil,
      umpan_balik,
      catatan,
      ttd_asesor,
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
// GET PENILAIAN ASESI
// ===============================
exports.getPenilaian = async (req, res) => {
  try {
    const data = await Penilaian.findOne({
      where: {
        id_peserta: req.params.id_peserta
      }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};