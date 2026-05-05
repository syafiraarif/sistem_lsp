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
          as: "jadwal",
          include: [
            { model: Skema, as: "skema" },
            { model: Tuk, as: "tuk" }
          ]
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan"
      });
    }

    if (!peserta.jadwal) {
      return res.status(404).json({
        message: "Jadwal peserta tidak ditemukan"
      });
    }

    const id_skema = peserta.jadwal.id_skema;

    const persyaratan = await SkemaPersyaratan.findAll({
  where: { id_skema },
  include: [
    {
      model: Persyaratan,
      as: "persyaratan"
    }
  ]
});

    return res.json({
      peserta,
      persyaratan
    });
  } catch (error) {
    console.error("GET FORM APL01 ERROR:", error);
    return res.status(500).json({
      message: "Gagal ambil form APL01",
      error: error.message
    });
  }
};

exports.createApl01 = async (req, res) => {
  try {
    const { id_peserta, tujuan_asesmen, tujuan_lainnya } = req.body;

    const peserta = await PesertaJadwal.findByPk(id_peserta, {
      include: [
        {
          model: Jadwal,
          as: "jadwal"
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan"
      });
    }

    if (!peserta.jadwal) {
      return res.status(404).json({
        message: "Jadwal peserta tidak ditemukan"
      });
    }

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
      id_skema: peserta.jadwal.id_skema,
      tujuan_asesmen,
      tujuan_lainnya,
      status: "draft"
    });

    return res.json({
      message: "APL01 berhasil dibuat",
      data: apl01
    });
  } catch (error) {
    console.error("CREATE APL01 ERROR:", error);
    return res.status(500).json({
      message: "Gagal membuat APL01",
      error: error.message
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
      nomor_dokumen: nomor_dokumen || null,
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: filePath
    });

    return res.json({
      message: "Dokumen berhasil diupload",
      data: dokumen
    });
  } catch (error) {
    console.error("UPLOAD DOKUMEN APL01 ERROR:", error);
    return res.status(500).json({
      message: "Gagal upload dokumen",
      error: error.message
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
          as: "dokumen",
          include: [
            {
              model: Persyaratan,
              as: "persyaratan"
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

    return res.json({
      data: apl01
    });
  } catch (error) {
    console.error("GET APL01 ERROR:", error);
    return res.status(500).json({
      message: "Gagal ambil data APL01",
      error: error.message
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

    return res.json({
      message: "APL01 berhasil disubmit"
    });
  } catch (error) {
    console.error("SUBMIT APL01 ERROR:", error);
    return res.status(500).json({
      message: "Gagal submit APL01",
      error: error.message
    });
  }
};