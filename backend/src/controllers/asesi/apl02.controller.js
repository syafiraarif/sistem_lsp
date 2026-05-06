const {
  Apl02,
  Apl02Detail,
  Apl02Bukti,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
} = require("../../models");

/* =========================
   GET FORM APL02
========================= */
exports.getFormApl02 = async (req, res) => {
  try {
    const { id_skema } = req.params;

    if (!id_skema) {
      return res.status(400).json({
        success: false,
        message: "ID skema wajib dikirim",
      });
    }

    const data = await SkemaUnit.findAll({
      where: { id_skema },
      include: [
        {
          model: UnitKompetensi,
          as: "unit",
          required: false,
          include: [
            {
              model: UnitElemen,
              as: "elemen",
              required: false,
              include: [
                {
                  model: UnitKuk,
                  as: "kuk",
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [["urutan", "ASC"]],
    });

    return res.json({
      success: true,
      message: "Form APL02",
      data,
    });
  } catch (error) {
    console.error("ERROR GET FORM APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal ambil form APL02",
    });
  }
};

/* =========================
   CREATE APL02
========================= */
exports.createApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib dikirim",
      });
    }

    const existing = await Apl02.findOne({
      where: { id_peserta },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "APL02 sudah pernah dibuat",
        data: existing,
      });
    }

    const apl02 = await Apl02.create({
      id_peserta,
      status: "draft",
    });

    return res.json({
      success: true,
      message: "APL02 berhasil dibuat",
      data: apl02,
    });
  } catch (error) {
    console.error("ERROR CREATE APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal create APL02",
    });
  }
};

/* =========================
   SIMPAN PENILAIAN (K / BK)
========================= */
exports.savePenilaian = async (req, res) => {
  try {
    const { id_apl02, id_elemen, id_unit, kompeten, catatan } = req.body;

    if (!id_apl02 || !id_elemen) {
      return res.status(400).json({
        success: false,
        message: "ID APL02 dan ID elemen wajib dikirim",
      });
    }

    if (!kompeten) {
      return res.status(400).json({
        success: false,
        message: "Kompeten wajib dipilih",
      });
    }

    let finalIdUnit = id_unit || null;

    if (!finalIdUnit) {
      const elemen = await UnitElemen.findByPk(id_elemen);
      finalIdUnit = elemen?.id_unit || null;
    }

    let data = await Apl02Detail.findOne({
      where: { id_apl02, id_elemen },
    });

    if (data) {
      await data.update({
        id_unit: finalIdUnit,
        kompeten,
        catatan: catatan || "",
      });
    } else {
      data = await Apl02Detail.create({
        id_apl02,
        id_unit: finalIdUnit,
        id_elemen,
        kompeten,
        catatan: catatan || "",
      });
    }

    return res.json({
      success: true,
      message: "Penilaian berhasil disimpan",
      data,
    });
  } catch (error) {
    console.error("ERROR SAVE PENILAIAN APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal simpan penilaian",
    });
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
      tanggal_dokumen,
    } = req.body;

    if (!id_detail) {
      return res.status(400).json({
        success: false,
        message: "ID detail wajib dikirim",
      });
    }

    if (!req.files || !req.files.file_dokumen) {
      return res.status(400).json({
        success: false,
        message: "File wajib diupload",
      });
    }

    const file = req.files.file_dokumen[0];

    const bukti = await Apl02Bukti.create({
      id_detail,
      jenis_portofolio: jenis_portofolio || "",
      nama_dokumen: nama_dokumen || "",
      nomor_dokumen: nomor_dokumen || "",
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path,
    });

    return res.json({
      success: true,
      message: "Bukti berhasil diupload",
      data: bukti,
    });
  } catch (error) {
    console.error("ERROR UPLOAD BUKTI APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal upload bukti",
    });
  }
};

/* =========================
   GET DATA APL02 (VIEW)
========================= */
exports.getApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib dikirim",
      });
    }

    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: Apl02Detail,
          as: "detail",
          required: false,
          include: [
            {
              model: Apl02Bukti,
              as: "buktiTambahan",
              required: false,
            },
          ],
        },
      ],
    });

    return res.json({
      success: true,
      message: "Data APL02",
      data,
    });
  } catch (error) {
    console.error("ERROR GET DATA APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal ambil data APL02",
    });
  }
};

/* =========================
   DELETE BUKTI
========================= */
exports.deleteBukti = async (req, res) => {
  try {
    const { id_bukti } = req.params;

    if (!id_bukti) {
      return res.status(400).json({
        success: false,
        message: "ID bukti wajib dikirim",
      });
    }

    await Apl02Bukti.destroy({
      where: { id_bukti },
    });

    return res.json({
      success: true,
      message: "Bukti berhasil dihapus",
    });
  } catch (error) {
    console.error("ERROR DELETE BUKTI APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal hapus bukti",
    });
  }
};

/* =========================
   SUBMIT FINAL
========================= */
exports.submitApl02 = async (req, res) => {
  try {
    const { id_apl02 } = req.params;

    if (!id_apl02) {
      return res.status(400).json({
        success: false,
        message: "ID APL02 wajib dikirim",
      });
    }

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL02 tidak ditemukan",
      });
    }

    const totalDetail = await Apl02Detail.count({
      where: { id_apl02 },
    });

    if (totalDetail === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi dan simpan minimal satu penilaian terlebih dahulu",
      });
    }

    await apl02.update({
      status: "submitted",
      updated_at: new Date(),
    });

    return res.json({
      success: true,
      message: "APL02 berhasil disubmit",
    });
  } catch (error) {
    console.error("ERROR SUBMIT APL02:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal submit APL02",
    });
  }
};