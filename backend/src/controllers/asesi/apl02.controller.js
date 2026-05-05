const { 
  apl02: Apl02, 
  apl02_detail: Apl02Detail, 
  apl02_bukti: Apl02Bukti,
  skema_unit: SkemaUnit,
  unit_kompetensi: UnitKompetensi,
  unit_elemen: UnitElemen,
  unit_kuk: UnitKuk
} = require("../../models");

/* =========================
   GET FORM APL02
========================= */
exports.getFormApl02 = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const data = await SkemaUnit.findAll({
      where: { id_skema },
      include: [
        {
          model: UnitKompetensi,
          as: "unit",
          include: [
            {
              model: UnitElemen,
              as: "elemen",
              include: [
                {
                  model: UnitKuk,
                  as: "kuk"
                }
              ]
            }
          ]
        }
      ],
      order: [["urutan", "ASC"]]
    });

    res.json({
      message: "Form APL02",
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil form APL02" });
  }
};


/* =========================
   CREATE APL02
========================= */
exports.createApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    const existing = await Apl02.findOne({
      where: { id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "APL02 sudah pernah dibuat"
      });
    }

    const apl02 = await Apl02.create({
      id_peserta
    });

    res.json({
      message: "APL02 berhasil dibuat",
      data: apl02
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal create APL02" });
  }
};


/* =========================
   SIMPAN PENILAIAN (K / BK)
========================= */
exports.savePenilaian = async (req, res) => {
  try {
    const { id_apl02, id_elemen, kompeten, catatan } = req.body;

    let data = await Apl02Detail.findOne({
      where: { id_apl02, id_elemen }
    });

    if (data) {
      await data.update({
        kompeten,
        catatan
      });
    } else {
      data = await Apl02Detail.create({
        id_apl02,
        id_elemen,
        kompeten,
        catatan
      });
    }

    res.json({
      message: "Penilaian berhasil disimpan",
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal simpan penilaian" });
  }
};


/* =========================
   UPLOAD BUKTI
========================= */
exports.uploadBukti = async (req, res) => {
  try {
    const {
      id_detail,
      jenis_portofolio,
      nama_dokumen,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    if (!req.files || !req.files.file_dokumen) {
      return res.status(400).json({
        message: "File wajib diupload"
      });
    }

    const file = req.files.file_dokumen[0];

    const bukti = await Apl02Bukti.create({
      id_detail,
      jenis_portofolio,
      nama_dokumen,
      nomor_dokumen,
      tanggal_dokumen,
      file_path: file.path
    });

    res.json({
      message: "Bukti berhasil diupload",
      data: bukti
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal upload bukti" });
  }
};


/* =========================
   GET DATA APL02 (VIEW)
========================= */
exports.getApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: Apl02Bukti,
              as: "bukti"
            }
          ]
        }
      ]
    });

    res.json({
      message: "Data APL02",
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil data APL02" });
  }
};


/* =========================
   DELETE BUKTI
========================= */
exports.deleteBukti = async (req, res) => {
  try {
    const { id_bukti } = req.params;

    await Apl02Bukti.destroy({
      where: { id_bukti }
    });

    res.json({
      message: "Bukti berhasil dihapus"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal hapus bukti" });
  }
};


/* =========================
   SUBMIT FINAL
========================= */
exports.submitApl02 = async (req, res) => {
  try {
    const { id_apl02 } = req.params;

    await Apl02.update(
      { status: "submitted" },
      { where: { id_apl02 } }
    );

    res.json({
      message: "APL02 berhasil disubmit"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal submit APL02" });
  }
};