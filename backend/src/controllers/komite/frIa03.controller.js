const FrIa03 = require("../../models/frIa03.model");
const FrIa03Pertanyaan = require("../../models/frIa03Pertanyaan.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const puppeteer = require("puppeteer");

const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const SkemaUnit = require("../../models/skemaUnit.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");

// ===============================
// CREATE HEADER (OPTIONAL)
// ===============================
exports.createHeader = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      tanggal
    } = req.body;

    // Validasi data inputan
    if (!id_jadwal || !id_skema || !id_tuk || !id_asesor || !tanggal) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existing = await FrIa03.findOne({
    where:{
        id_jadwal,
    }
});

      if (existing) {
        return res.status(200).json({
          message: "Header sudah ada",
          data: existing,
        });
      }

    // Membuat header FR.IA.03
    const data = await FrIa03.create({
      id_jadwal,
      id_skema,
      id_tuk,
      id_asesor,
      tanggal
    });

    res.status(201).json({ message: "Header FR.IA.03 berhasil dibuat", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat header FR.IA.03", error: err.message });
  }
};


// ===============================
// CREATE PERTANYAAN
// ===============================
exports.createPertanyaan = async (req, res) => {
  try {

    const {
      id_jadwal,
      id_unit,
      pertanyaan,
      urutan
    } = req.body;

    if (!id_jadwal || !id_unit || !pertanyaan || !urutan) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const header = await FrIa03.findOne({
      where: {
        id_jadwal,
      },
    });

    if (!header) {
      return res.status(404).json({
        message: "Header FR.IA.03 belum dibuat",
      });
    }

    const data = await FrIa03Pertanyaan.create({
      id_fr_ia_03: header.id_fr_ia_03,
      id_unit,
      pertanyaan,
      urutan,
    });

    res.status(201).json({
      message: "Pertanyaan berhasil dibuat",
      data,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Gagal membuat pertanyaan",
      error: err.message,
    });
  }
};


// ===============================
// UPDATE PERTANYAAN
// ===============================
exports.updatePertanyaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_unit, pertanyaan, urutan } = req.body;

    const soal = await FrIa03Pertanyaan.findByPk(id);

    if (!soal) {
      return res.status(404).json({
        message: "Pertanyaan tidak ditemukan",
      });
    }

    await soal.update({
      id_unit,
      pertanyaan,
      urutan,
    });

    res.json({
      message: "Pertanyaan berhasil diperbarui",
      data: soal,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Gagal mengupdate pertanyaan",
      error: err.message,
    });
  }
};


// ===============================
// DELETE PERTANYAAN
// ===============================
exports.deletePertanyaan = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus pertanyaan berdasarkan ID
    const deleted = await FrIa03Pertanyaan.destroy({
      where: { id_pertanyaan: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }

    res.json({ message: "Pertanyaan berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus pertanyaan", error: err.message });
  }
};


// ===============================
// GET PERTANYAAN (UNTUK EDIT)
// ===============================
exports.getByFr = async (req, res) => {
  try {

    const { id_jadwal } = req.params;

    const data = await FrIa03.findOne({

      where: {
        id_jadwal,
      },

      include: [

        {
  model: FrIa03Pertanyaan,
  as: "pertanyaan",
  include: [
    {
      model: UnitKompetensi,
      as: "unit",
      include: [
        {
          model: SkemaUnit,
          as: "skemaUnit",
          include: [
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            }
          ]
        }
      ]
    }
  ]
},

        {
          model: Skema,
          as: "skema",
        },

        {
          model: Tuk,
          as: "tuk",
        },

        {
          model: ProfileAsesor,
          as: "asesor",
          attributes: [
            "id_user",
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path",
          ],
        },

        {
          model: ProfileAsesi,
          as: "asesi",
          attributes: [
            "id_user",
            "nama_lengkap",
            "ttd_path",
          ],
        },

      ],

    });
  
    console.log(
    JSON.stringify(data, null, 2)
);

    if (!data) {
      return res.status(404).json({
        message: "Data FR.IA.03 tidak ditemukan",
      });
    }

    return res.json({

      ...data.toJSON(),

      nama_asesor: data.asesor?.nama_lengkap,
      no_reg_asesor: data.asesor?.no_reg_asesor,
      ttd_asesor: data.asesor?.ttd_path,

      nama_asesi: data.asesi?.nama_lengkap,
      ttd_asesi: data.asesi?.ttd_path,

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Gagal mendapatkan data FR.IA.03",
      error: err.message,
    });
  }
};

// ===============================
// DOWNLOAD PDF
// ===============================
exports.downloadPdf = async (req, res) => {
  res.json({
    message: "Download PDF berhasil dipanggil"
  });
};