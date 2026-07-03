const {
  Apl02,
  Apl02Detail,
  Apl02Bukti,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
  PesertaJadwal,
  Jadwal,
  Skema,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


/*
=================================
GET FORM APL.02
=================================
*/

exports.getFormApl02 = async (req, res) => {
  try {
    const { id_skema } = req.params;

    // Ambil data skema
    const skema = await Skema.findByPk(id_skema);

    if (!skema) {
      return res.status(404).json({
        success: false,
        message: "Skema tidak ditemukan"
      });
    }

    // Ambil seluruh unit, elemen dan KUK
    const units = await SkemaUnit.findAll({
      where: {
        id_skema
      },
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
      order: [
        ["urutan", "ASC"],
        [{ model: UnitKompetensi, as: "unit" }, { model: UnitElemen, as: "elemen" }, "urutan", "ASC"],
        [
          { model: UnitKompetensi, as: "unit" },
          { model: UnitElemen, as: "elemen" },
          { model: UnitKuk, as: "kuk" },
          "urutan",
          "ASC"
        ]
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Form APL.02 berhasil diambil",
      data: {
        skema,
        units
      }
    });

  } catch (err) {
    console.error("GET FORM APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil form APL.02",
      error: err.message
    });
  }
};


/*
=================================
CREATE APL.02
=================================
*/

exports.createApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
          include: [
            {
              model: Skema,
              as: "skema"
            }
          ]
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    // Cek apakah APL.02 sudah pernah dibuat
    const existing = await Apl02.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "APL.02 sudah dibuat",
        data: existing
      });
    }

    // Buat header APL.02
    const apl02 = await Apl02.create({
      id_peserta,
      status: "draft"
    });

    return res.status(201).json({
      success: true,
      message: "APL.02 berhasil dibuat",
      data: apl02
    });

  } catch (err) {
    console.error("CREATE APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat APL.02",
      error: err.message
    });
  }
};

/*
=================================
SAVE PENILAIAN APL.02
=================================
*/

exports.savePenilaian = async (req, res) => {
  try {
    const {
      id_apl02,
      id_unit,
      id_elemen,
      kompeten,
      catatan
    } = req.body;

    // Validasi input
    if (!id_apl02 || !id_unit || !id_elemen || !kompeten) {
      return res.status(400).json({
        success: false,
        message: "Data penilaian belum lengkap."
      });
    }

    if (!["K", "BK"].includes(kompeten)) {
      return res.status(400).json({
        success: false,
        message: "Nilai kompeten harus K atau BK."
      });
    }

    // Cek header APL02
    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    if (apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit dan tidak dapat diubah."
      });
    }

    // Pastikan unit ada
    const unit = await UnitKompetensi.findByPk(id_unit);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit kompetensi tidak ditemukan."
      });
    }

    // Pastikan elemen ada
    const elemen = await UnitElemen.findByPk(id_elemen);

    if (!elemen) {
      return res.status(404).json({
        success: false,
        message: "Elemen kompetensi tidak ditemukan."
      });
    }

    // Cari apakah sudah pernah dinilai
    let detail = await Apl02Detail.findOne({
      where: {
        id_apl02,
        id_elemen
      }
    });

    if (detail) {
      await detail.update({
        id_unit,
        kompeten,
        catatan: catatan || "",
        updated_at: new Date()
      });
    } else {
      detail = await Apl02Detail.create({
        id_apl02,
        id_unit,
        id_elemen,
        kompeten,
        catatan: catatan || ""
      });
    }

    return res.status(200).json({
      success: true,
      message: "Penilaian berhasil disimpan.",
      data: detail
    });

  } catch (err) {
    console.error("SAVE PENILAIAN APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
UPLOAD BUKTI PORTOFOLIO
=================================
*/

exports.uploadBukti = async (req, res) => {
  try {
    const {
      id_detail,
      jenis_portofolio,
      nama_dokumen,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    const file = req.files?.file_dokumen?.[0];

    if (!id_detail) {
      return res.status(400).json({
        success: false,
        message: "ID detail wajib diisi."
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File bukti wajib diupload."
      });
    }

    // cek detail
    const detail = await Apl02Detail.findByPk(id_detail, {
      include: [
        {
          model: Apl02,
          as: "apl02"
        }
      ]
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Detail APL.02 tidak ditemukan."
      });
    }

    // tidak boleh upload setelah submit
    if (detail.apl02 && detail.apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit sehingga bukti tidak dapat diubah."
      });
    }

    const payload = {
      id_detail,
      jenis_portofolio: jenis_portofolio || "",
      nama_dokumen: nama_dokumen || file.originalname,
      nomor_dokumen: nomor_dokumen || "",
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path.replace(/\\/g, "/")
    };

    // jika sudah ada dokumen dg nama yg sama -> update
    let bukti = await Apl02Bukti.findOne({
      where: {
        id_detail,
        nama_dokumen: payload.nama_dokumen
      }
    });

    if (bukti) {

      // hapus file lama
      if (
        bukti.file_path &&
        fs.existsSync(path.join(process.cwd(), bukti.file_path))
      ) {
        fs.unlinkSync(path.join(process.cwd(), bukti.file_path));
      }

      await bukti.update(payload);
      await bukti.reload();

    } else {

      bukti = await Apl02Bukti.create(payload);

    }

    return res.status(200).json({
      success: true,
      message: "Bukti portofolio berhasil disimpan.",
      data: bukti
    });

  } catch (err) {
    console.error("UPLOAD BUKTI APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengupload bukti.",
      error: err.message
    });
  }
};


/*
=================================
GET APL.02
=================================
*/

exports.getApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },
            {
              model: Jadwal,
              as: "jadwal",
              include: [
                {
                  model: Skema,
                  as: "skema"
                }
              ]
            }
          ]
        },
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: UnitElemen,
              as: "elemen"
            },
            {
              model: Apl02Bukti,
              as: "buktiTambahan"
            }
          ]
        }
      ],
      order: [
        [{ model: Apl02Detail, as: "detail" }, "id_detail", "ASC"]
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "APL.02 belum dibuat."
      });
    }

    const result = data.toJSON();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    result.detail = result.detail.map((detail) => ({
      ...detail,
      buktiTambahan: detail.buktiTambahan.map((bukti) => ({
        ...bukti,
        file_url: `${baseUrl}/${bukti.file_path}`
      }))
    }));

    return res.status(200).json({
      success: true,
      message: "Data APL.02 berhasil diambil.",
      data: result
    });

  } catch (err) {
    console.error("GET APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
DELETE BUKTI PORTOFOLIO
=================================
*/

exports.deleteBukti = async (req, res) => {
  try {
    const { id_bukti } = req.params;

    const bukti = await Apl02Bukti.findByPk(id_bukti, {
      include: [
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: Apl02,
              as: "apl02"
            }
          ]
        }
      ]
    });

    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: "Bukti portofolio tidak ditemukan."
      });
    }

    // Tidak boleh hapus jika sudah submit
    if (
      bukti.detail &&
      bukti.detail.apl02 &&
      bukti.detail.apl02.status !== "draft"
    ) {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit sehingga bukti tidak dapat dihapus."
      });
    }

    // Hapus file fisik
    if (bukti.file_path) {
      const filePath = path.join(process.cwd(), bukti.file_path);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await bukti.destroy();

    return res.status(200).json({
      success: true,
      message: "Bukti portofolio berhasil dihapus."
    });

  } catch (err) {
    console.error("DELETE BUKTI APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus bukti portofolio.",
      error: err.message
    });
  }
};

/*
=================================
SUBMIT APL.02
=================================
*/

exports.submitApl02 = async (req, res) => {
  try {
    const { id_apl02 } = req.params;

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    if (apl02.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "APL.02 sudah disubmit."
      });
    }

    // Ambil seluruh detail
    const detail = await Apl02Detail.findAll({
      where: {
        id_apl02
      },
      include: [
        {
          model: Apl02Bukti,
          as: "buktiTambahan"
        }
      ]
    });

    if (detail.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Silakan isi penilaian terlebih dahulu."
      });
    }

    // Pastikan setiap penilaian memiliki bukti
    const belumLengkap = detail.filter(
      (item) => !item.buktiTambahan || item.buktiTambahan.length === 0
    );

    if (belumLengkap.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada penilaian yang belum memiliki bukti portofolio."
      });
    }

    await apl02.update({
      status: "submitted",
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "APL.02 berhasil disubmit."
    });

  } catch (err) {
    console.error("SUBMIT APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      error: err.message
    });
  }
};


/*
=================================
GENERATE PDF APL.02
=================================
*/

exports.generatePdfApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const data = await Apl02.findOne({
      where: { id_peserta },
      include: [
        {
          model: PesertaJadwal,
          as: "peserta",
          include: [
            {
              model: ProfileAsesi,
              as: "profileAsesi"
            },
            {
              model: Jadwal,
              as: "jadwal",
              include: [
                {
                  model: Skema,
                  as: "skema"
                }
              ]
            }
          ]
        },
        {
          model: Apl02Detail,
          as: "detail",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: UnitElemen,
              as: "elemen"
            },
            {
              model: Apl02Bukti,
              as: "buktiTambahan"
            }
          ]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "APL.02 tidak ditemukan."
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=APL02-${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    doc.pipe(res);

    // ==========================
    // HEADER
    // ==========================
    doc
      .fontSize(18)
      .text("FORMULIR APL.02", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(11);

    doc.text(
      `Nama Asesi : ${
        data.peserta?.profileAsesi?.nama_lengkap || "-"
      }`
    );

    doc.text(
      `Skema Sertifikasi : ${
        data.peserta?.jadwal?.skema?.judul_skema || "-"
      }`
    );

    doc.text(
      `Status : ${data.status}`
    );

    doc.moveDown();

    // ==========================
    // DETAIL PENILAIAN
    // ==========================
    data.detail.forEach((item, index) => {

      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.unit?.judul_unit || "-"}`, {
          underline: true
        });

      doc.fontSize(10);

      doc.text(
        `Elemen : ${item.elemen?.nama_elemen || "-"}`
      );

      doc.text(
        `Penilaian : ${item.kompeten}`
      );

      doc.text(
        `Catatan : ${item.catatan || "-"}`
      );

      doc.text("Bukti Portofolio :");

      if (
        item.buktiTambahan &&
        item.buktiTambahan.length > 0
      ) {

        item.buktiTambahan.forEach((bukti, i) => {

          doc.text(
            `   ${i + 1}. ${bukti.nama_dokumen || "-"}`
          );

          doc.text(
            `      Jenis : ${bukti.jenis_portofolio || "-"}`
          );

          doc.text(
            `      Nomor : ${bukti.nomor_dokumen || "-"}`
          );

          doc.text(
            `      Tanggal : ${bukti.tanggal_dokumen || "-"}`
          );

        });

      } else {

        doc.text("   Tidak ada bukti.");

      }

      doc.moveDown();

    });

    // ==========================
    // TANDA TANGAN
    // ==========================
    doc.moveDown(2);

    doc.text("Asesi", {
      align: "right"
    });

    const ttdPath = data.peserta?.profileAsesi?.ttd_path;

    if (ttdPath) {

      const fullPath = path.join(
        process.cwd(),
        ttdPath
      );

      if (fs.existsSync(fullPath)) {

        doc.image(fullPath, 430, doc.y, {
          width: 90
        });

      }

    }

    doc.moveDown(5);

    doc.text(
      data.peserta?.profileAsesi?.nama_lengkap || "",
      {
        align: "right"
      }
    );

    doc.end();

  } catch (err) {
    console.error("GENERATE PDF APL02:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat PDF.",
      error: err.message
    });
  }
};