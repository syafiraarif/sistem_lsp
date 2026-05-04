const Jawaban = require("../../models/frIa05Jawaban.model");
const Penilaian = require("../../models/frIa05Penilaian.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");
const FrIa05 = require("../../models/frIa05.model");


// ===============================
// GET SOAL UNTUK ASESI
// ===============================
exports.getSoal = async (req, res) => {
  try {
    const { id_fr_ia_05, id_peserta } = req.params;

    // 🔒 cek sudah submit atau belum
    const sudah = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 }
    });

    if (sudah) {
      return res.status(400).json({
        message: "Anda sudah mengerjakan ujian ini"
      });
    }

    const data = await FrIa05.findByPk(id_fr_ia_05, {
      include: [
        {
          model: Soal,
          as: "soal",
          include: [
            {
              model: Opsi,
              as: "opsi",
              attributes: ["id_opsi", "kode_opsi", "jawaban"] // ❗ tanpa is_benar
            }
          ]
        }
      ]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SUBMIT JAWABAN ASESI
// ===============================
exports.submit = async (req, res) => {
  const t = await Jawaban.sequelize.transaction();

  try {
    const { id_peserta, id_fr_ia_05, jawaban } = req.body;

    // 🔒 cegah submit ulang
    const sudah = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 }
    });

    if (sudah) {
      return res.status(400).json({
        message: "Jawaban sudah dikunci!"
      });
    }

    let benar = 0;
    let salah = 0;

    // 🔥 proses semua jawaban
    for (const j of jawaban) {
      const opsi = await Opsi.findByPk(j.id_opsi);

      if (!opsi) {
        await t.rollback();
        return res.status(400).json({
          message: `Opsi tidak ditemukan (id_opsi: ${j.id_opsi})`
        });
      }

      const isBenar = opsi.is_benar;

      if (isBenar) benar++;
      else salah++;

      await Jawaban.create({
        id_peserta,
        id_soal: j.id_soal,
        id_opsi: j.id_opsi,
        is_benar: isBenar,
        created_at: new Date()
      }, { transaction: t });
    }

    const total = jawaban.length;
    const nilai = total > 0 ? (benar / total) * 100 : 0;

    // 🔥 ambil passing grade
    const paket = await FrIa05.findByPk(id_fr_ia_05);

    if (!paket) {
      await t.rollback();
      return res.status(404).json({ message: "Paket soal tidak ditemukan" });
    }

    const hasil = nilai >= paket.passing_grade
      ? "kompeten"
      : "belum_kompeten";

    // 🔥 simpan penilaian
    await Penilaian.create({
      id_peserta,
      id_fr_ia_05,
      jumlah_benar: benar,
      jumlah_salah: salah,
      nilai,
      hasil,
      tanggal_penilaian: new Date()
    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Submit berhasil",
      hasil: {
        total,
        benar,
        salah,
        nilai,
        status: hasil
      }
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// GET HASIL AKHIR ASESI
// ===============================
exports.getHasil = async (req, res) => {
  try {
    const { id_peserta, id_fr_ia_05 } = req.params;

    const data = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 }
    });

    if (!data) {
      return res.status(404).json({
        message: "Belum mengerjakan ujian"
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};