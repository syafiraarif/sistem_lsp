const Jawaban = require("../../models/frIa05Jawaban.model");
const Penilaian = require("../../models/frIa05Penilaian.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");
const FrIa05 = require("../../models/frIa05.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const Jadwal = require("../../models/jadwal.model");

/* =======================================
GET SOAL UNTUK ASESI
======================================= */
exports.getSoal = async (req, res) => {
  try {
    const { id_fr_ia_05, id_peserta } = req.params;

    // pastikan peserta sesuai user
    const peserta = await PesertaJadwal.findOne({
      where: { id_peserta, id_user: req.user.id_user },
      include: [{ model: Jadwal, as: "jadwal" }],
    });

    if (!peserta)
      return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // cek sudah submit
    const submitted = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 },
    });
    if (submitted)
      return res.status(400).json({ message: "Anda sudah mengerjakan ujian ini" });

    // ambil paket soal
    const paket = await FrIa05.findByPk(id_fr_ia_05, {
      include: [
        {
          model: Soal,
          as: "soal",
          include: [{ model: Opsi, as: "opsi", attributes: ["id_opsi", "kode_opsi", "jawaban"] }],
        },
        { model: Jadwal, as: "jadwal" },
      ],
    });

    if (!paket) return res.status(404).json({ message: "Paket soal tidak ditemukan" });

    // cek jadwal aktif
    if (!["open", "ongoing"].includes(peserta.jadwal.status))
      return res.status(400).json({ message: "Ujian belum dibuka" });

    // urutkan soal
    paket.soal.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

    return res.json({ message: "Soal berhasil diambil", data: paket });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =======================================
SUBMIT JAWABAN ASESI
======================================= */
exports.submit = async (req, res) => {
  const transaction = await Jawaban.sequelize.transaction();
  try {
    const { id_peserta, id_fr_ia_05, jawaban } = req.body;

    // cek sudah submit
    const submitted = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 },
      transaction,
    });
    if (submitted) {
      await transaction.rollback();
      return res.status(400).json({ message: "Jawaban sudah dikunci" });
    }

    // ambil semua soal paket
    const soalPaket = await Soal.findAll({ where: { id_fr_ia_05 }, transaction });

    if (jawaban.length !== soalPaket.length) {
      await transaction.rollback();
      return res.status(400).json({ message: "Semua soal wajib dijawab" });
    }

    // simpan jawaban dan hitung benar/salah
    let benar = 0;
    let salah = 0;

    for (const item of jawaban) {
      const opsi = await Opsi.findOne({
        where: { id_opsi: item.id_opsi, id_soal: item.id_soal },
        transaction,
      });
      if (!opsi) {
        await transaction.rollback();
        return res.status(400).json({ message: `Opsi ${item.id_opsi} tidak valid` });
      }

      const isBenar = opsi.is_benar;
      if (isBenar) benar++;
      else salah++;

      await Jawaban.create(
        {
          id_peserta,
          id_soal: item.id_soal,
          id_opsi: item.id_opsi,
          is_benar: isBenar,
          created_at: new Date(),
        },
        { transaction }
      );
    }

    const total = soalPaket.length;
    const nilai = Number(((benar / total) * 100).toFixed(2));
    const paket = await FrIa05.findByPk(id_fr_ia_05, { transaction });
    const status = nilai >= paket.passing_grade ? "kompeten" : "belum_kompeten";

    await Penilaian.create(
      {
        id_peserta,
        id_fr_ia_05,
        jumlah_benar: benar,
        jumlah_salah: salah,
        nilai,
        hasil: status,
        submitted: true,
        tanggal_penilaian: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      message: "Submit berhasil",
      hasil: { total, benar, salah, nilai, status },
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: err.message });
  }
};

/* =======================================
GET HASIL ASESI
======================================= */
exports.getHasil = async (req, res) => {
  try {
    const { id_fr_ia_05, id_peserta } = req.params;

    const data = await Penilaian.findOne({
      where: { id_peserta, id_fr_ia_05 },
    });

    if (!data) return res.status(404).json({ message: "Belum mengerjakan ujian" });

    res.json({ message: "Hasil ujian", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};