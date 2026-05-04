const Jawaban = require("../../models/frIa06Jawaban.model");
const Penilaian = require("../../models/frIa06Penilaian.model");
const Soal = require("../../models/frIa06Soal.model");
const FrIa06 = require("../../models/frIa06.model");


// ===============================
// GET SOAL UNTUK ASESI
// ===============================
exports.getSoal = async (req, res) => {
  try {
    const { id_fr_ia_06, id_peserta } = req.params;

    // 🔒 cek sudah submit
    const sudah = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_06 }
    });

    if (sudah) {
      return res.status(400).json({
        message: "Anda sudah mengerjakan, tidak bisa mengakses ulang"
      });
    }

    const data = await FrIa06.findByPk(id_fr_ia_06, {
      include: [
        {
          model: Soal,
          as: "soal",
          attributes: [
            "id_soal",
            "pertanyaan",
            "urutan"
          ],
          order: [["urutan", "ASC"]]
        }
      ]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SIMPAN JAWABAN (DRAFT OPTIONAL)
// ===============================
exports.saveJawaban = async (req, res) => {
  try {
    const { id_peserta, jawaban } = req.body;

    for (const j of jawaban) {
      await Jawaban.upsert({
        id_peserta,
        id_soal: j.id_soal,
        jawaban_asesi: j.jawaban_asesi,
        created_at: new Date()
      });
    }

    res.json({
      message: "Jawaban berhasil disimpan"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// SUBMIT FINAL (LOCK)
// ===============================
exports.submit = async (req, res) => {
  const t = await Jawaban.sequelize.transaction();

  try {
    const { id_peserta, id_fr_ia_06 } = req.body;

    // 🔒 cek sudah submit
    const sudah = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_06 }
    });

    if (sudah) {
      return res.status(400).json({
        message: "Jawaban sudah dikunci!"
      });
    }

    // 🔥 ambil semua soal
    const soal = await Soal.findAll({
      where: { id_fr_ia_06 }
    });

    // 🔥 validasi semua soal sudah dijawab
    for (const s of soal) {
      const cek = await Jawaban.findOne({
        where: {
          id_peserta,
          id_soal: s.id_soal
        }
      });

      if (!cek || !cek.jawaban_asesi) {
        await t.rollback();
        return res.status(400).json({
          message: `Soal belum dijawab: ${s.id_soal}`
        });
      }
    }

    // 🔥 buat penilaian kosong (menunggu asesor)
    await Penilaian.create({
      id_peserta,
      id_fr_ia_06,
      hasil: null, // nanti diisi asesor
      tanggal_penilaian: null
    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Submit berhasil, menunggu penilaian asesor"
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// LIHAT JAWABAN SENDIRI
// ===============================
exports.getJawabanSaya = async (req, res) => {
  try {
    const { id_peserta, id_fr_ia_06 } = req.params;

    const data = await Jawaban.findAll({
      where: { id_peserta },
      include: [
        {
          model: Soal,
          as: "soal",
          where: { id_fr_ia_06 }
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
// CEK STATUS (SUDAH DINILAI / BELUM)
// ===============================
exports.getStatus = async (req, res) => {
  try {
    const { id_peserta, id_fr_ia_06 } = req.params;

    const data = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_06 }
    });

    if (!data) {
      return res.json({
        status: "belum_submit"
      });
    }

    if (!data.hasil) {
      return res.json({
        status: "menunggu_penilaian"
      });
    }

    return res.json({
      status: "selesai",
      hasil: data.hasil
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};