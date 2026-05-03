const {
  Apl01Asesmen,
  Apl01Dokumen,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  Persyaratan,
  SkemaPersyaratan
} = require("../../models");

exports.getFormApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const peserta = await PesertaJadwal.findByPk(id_peserta, {
      include: [
        {
          model: Jadwal,
          include: [
            { model: Skema, as: "skema" },
            { model: Tuk, as: "tuk" }
          ]
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }

    // ambil persyaratan sesuai skema
    const persyaratan = await SkemaPersyaratan.findAll({
      where: { id_skema: peserta.Jadwal.id_skema },
      include: [{ model: Persyaratan }]
    });

    return res.json({
      peserta,
      persyaratan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil form APL01" });
  }
};

exports.createApl01 = async (req, res) => {
  try {
    const {
      id_peserta,
      tujuan_asesmen,
      tujuan_lainnya
    } = req.body;

    // ambil data peserta
    const peserta = await PesertaJadwal.findByPk(id_peserta);

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan"
      });
    }

    // cek sudah ada belum
    const existing = await Apl01Asesmen.findOne({
      where: { id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "APL01 sudah dibuat"
      });
    }

    const apl01 = await Apl01Asesmen.create({
      id_peserta,
      id_jadwal: peserta.id_jadwal,
      id_skema: peserta.id_skema || null,
      tujuan_asesmen,
      tujuan_lainnya,
      status: "draft"
    });

    res.json({
      message: "APL01 berhasil dibuat",
      data: apl01
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal membuat APL01"
    });
  }
};


exports.uploadDokumenApl01 = async (req, res) => {
  try {
    const {
      id_apl01,
      id_persyaratan,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    if (!req.files || !req.files.file_dokumen) {
      return res.status(400).json({
        message: "File wajib diupload"
      });
    }

    const filePath = req.files.file_dokumen[0].path;

    const dokumen = await Apl01Dokumen.create({
      id_apl01,
      id_persyaratan,
      nomor_dokumen,
      tanggal_dokumen,
      file_path: filePath
    });

    res.json({
      message: "Dokumen berhasil diupload",
      data: dokumen
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal upload dokumen"
    });
  }
};


exports.getApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const apl01 = await Apl01Asesmen.findOne({
      where: { id_peserta },
      include: [
        {
          model: Apl01Dokumen,
          include: [
            {
              model: Persyaratan
            }
          ]
        }
      ]
    });

    if (!apl01) {
      return res.status(404).json({
        message: "APL01 belum dibuat"
      });
    }

    res.json({
      data: apl01
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal ambil data APL01"
    });
  }
};


exports.submitFinalApl01 = async (req, res) => {
  try {
    const { id_apl01 } = req.params;

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        message: "APL01 tidak ditemukan"
      });
    }

    // cek semua dokumen wajib sudah ada
    const dokumen = await Apl01Dokumen.findAll({
      where: { id_apl01 }
    });

    if (dokumen.length === 0) {
      return res.status(400).json({
        message: "Dokumen belum diupload"
      });
    }

    await apl01.update({
      status: "submit"
    });

    res.json({
      message: "APL01 berhasil disubmit"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal submit APL01"
    });
  }
};