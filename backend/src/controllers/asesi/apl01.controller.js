const {
  Apl01Asesmen,
  Apl01Dokumen,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  Persyaratan,
  SkemaPersyaratan,
  ProfileAsesi,
  SkemaUnit,
  UnitKompetensi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


/*
=====================================
GET FORM APL.01
=====================================
*/

exports.getFormApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;
    const id_user = req.user.id_user;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      },
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
            },
            {
              model: Tuk,
              as: "tuk"
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

    const persyaratan = await SkemaPersyaratan.findAll({
      where: {
        id_skema: peserta.jadwal.id_skema
      },
      include: [
        {
          model: Persyaratan,
          as: "persyaratan"
        }
      ],
      order: [["id_persyaratan", "ASC"]]
    });

    const persyaratanDasar = persyaratan.filter(
      item => item.persyaratan?.jenis_persyaratan === "dasar"
    );

    const persyaratanAdministratif = persyaratan.filter(
      item => item.persyaratan?.jenis_persyaratan === "administratif"
    );

    return res.status(200).json({
      success: true,
      data: {
        peserta,
        profile: peserta.profileAsesi,
        jadwal: peserta.jadwal,
        skema: peserta.jadwal?.skema,
        tuk: peserta.jadwal?.tuk,
        persyaratanDasar,
        persyaratanAdministratif
      }
    });

  } catch (err) {

    console.error("GET FORM APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

/*
=====================================
CREATE APL01
=====================================
*/

exports.createApl01 = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const {
      id_peserta,
      tujuan_asesmen,
      tujuan_lainnya
    } = req.body;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

    if (!tujuan_asesmen) {
      return res.status(400).json({
        success: false,
        message: "Tujuan asesmen wajib dipilih"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal"
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const existing = await Apl01Asesmen.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "APL.01 sudah pernah dibuat",
        data: existing
      });
    }

    const apl01 = await Apl01Asesmen.create({
      id_peserta,
      id_jadwal: peserta.id_jadwal,
      id_skema: peserta.jadwal.id_skema,
      tujuan_asesmen,
      tujuan_lainnya:
        tujuan_asesmen === "lainnya"
          ? (tujuan_lainnya || null)
          : null,
      status: "draft"
    });

    return res.status(201).json({
      success: true,
      message: "APL.01 berhasil dibuat",
      data: apl01
    });

  } catch (err) {

    console.error("CREATE APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

/*
=====================================
UPLOAD DOKUMEN APL.01
=====================================
*/

exports.uploadDokumenApl01 = async (req, res) => {
  try {

    const {
      id_apl01,
      id_persyaratan,
      nomor_dokumen,
      tanggal_dokumen
    } = req.body;

    if (!id_apl01 || !id_persyaratan) {
      return res.status(400).json({
        success: false,
        message: "id_apl01 dan id_persyaratan wajib diisi"
      });
    }

    const file = req.files?.file_dokumen?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File dokumen wajib diupload"
      });
    }

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    if (apl01.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.01 sudah disubmit dan tidak dapat diubah"
      });
    }

    const payload = {
      id_apl01,
      id_persyaratan,
      nomor_dokumen: nomor_dokumen || null,
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path.replace(/\\/g, "/")
    };

    let dokumen = await Apl01Dokumen.findOne({
      where: {
        id_apl01,
        id_persyaratan
      }
    });

    if (dokumen) {

      if (
        dokumen.file_path &&
        fs.existsSync(path.join(process.cwd(), dokumen.file_path))
      ) {
        fs.unlinkSync(path.join(process.cwd(), dokumen.file_path));
      }

      await dokumen.update(payload);
      await dokumen.reload();

    } else {

      dokumen = await Apl01Dokumen.create(payload);

    }

    return res.status(200).json({
      success: true,
      message: "Dokumen berhasil disimpan",
      data: dokumen
    });

  } catch (err) {

    console.error("UPLOAD DOKUMEN APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};



/*
=====================================
GET APL.01
=====================================
*/

exports.getApl01 = async (req, res) => {
  try {

    const { id_peserta } = req.params;
    const id_user = req.user.id_user;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "id_peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const apl01 = await Apl01Asesmen.findOne({
      where: {
        id_peserta
      },
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
        success: false,
        message: "APL.01 belum dibuat"
      });
    }

    const data = apl01.toJSON();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    data.dokumen = (data.dokumen || []).map(item => ({
      ...item,
      file_url: item.file_path
        ? `${baseUrl}/${item.file_path}`
        : null
    }));

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {

    console.error("GET APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};


/*
=====================================
SUBMIT APL.01
=====================================
*/

exports.submitFinalApl01 = async (req, res) => {
  try {

    const { id_apl01 } = req.params;
    const id_user = req.user.id_user;

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta: apl01.id_peserta,
        id_user
      }
    });

    if (!peserta) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses"
      });
    }

    if (apl01.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL.01 sudah disubmit"
      });
    }

    // ambil semua persyaratan wajib
    const wajib = await SkemaPersyaratan.findAll({
      where: {
        id_skema: apl01.id_skema,
        wajib: true
      }
    });

    // dokumen yang sudah diupload
    const uploaded = await Apl01Dokumen.findAll({
      where: {
        id_apl01
      }
    });

    const uploadedIds = uploaded.map(item => item.id_persyaratan);

    const missing = wajib.filter(item =>
      !uploadedIds.includes(item.id_persyaratan)
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada dokumen persyaratan yang belum diupload",
        missing
      });
    }

    // cek tanda tangan profile
    const profile = await ProfileAsesi.findByPk(peserta.id_user);

    if (!profile || !profile.ttd_path) {
      return res.status(400).json({
        success: false,
        message: "Silakan upload tanda tangan terlebih dahulu"
      });
    }

    // update status (sesuai model)
    await apl01.update({
      status: "submit"
    });

    return res.status(200).json({
      success: true,
      message: "APL.01 berhasil disubmit"
    });

  } catch (err) {

    console.error("SUBMIT APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};


/*
=====================================
GENERATE PDF APL.01
=====================================
*/

exports.generatePdfApl01 = async (req, res) => {
  try {

    const { id_peserta } = req.params;
    const id_user = req.user.id_user;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user
      }
    });

    if (!peserta) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses"
      });
    }

    const apl01 = await Apl01Asesmen.findOne({
      where: {
        id_peserta
      },
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
                },
                {
                  model: Tuk,
                  as: "tuk"
                }
              ]
            }
          ]
        },
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
        success: false,
        message: "APL.01 tidak ditemukan"
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=APL01_${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    doc.pipe(res);

    // =============================
    // HEADER
    // =============================

    doc
      .fontSize(18)
      .text("FORMULIR APL.01", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(
      `Nama Asesi : ${apl01.peserta?.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(
      `Skema Sertifikasi : ${apl01.peserta?.jadwal?.skema?.judul_skema || "-"}`
    );

    doc.text(
      `TUK : ${apl01.peserta?.jadwal?.tuk?.nama_tuk || "-"}`
    );

    doc.text(
      `Tujuan Asesmen : ${apl01.tujuan_asesmen || "-"}`
    );

    if (
      apl01.tujuan_asesmen === "lainnya" &&
      apl01.tujuan_lainnya
    ) {
      doc.text(`Keterangan : ${apl01.tujuan_lainnya}`);
    }

    doc.moveDown();

    // =============================
    // DOKUMEN
    // =============================

    doc
      .fontSize(13)
      .text("Dokumen Persyaratan", {
        underline: true
      });

    doc.moveDown(0.5);

    (apl01.dokumen || []).forEach((item, index) => {

      if (doc.y > 720) {
        doc.addPage();
      }

      doc.text(
        `${index + 1}. ${item.persyaratan?.nama_persyaratan || "-"}`
      );

      doc.text(
        `Nomor Dokumen : ${item.nomor_dokumen || "-"}`
      );

      doc.text(
        `Tanggal : ${item.tanggal_dokumen || "-"}`
      );

      doc.text(
        `Status : ${item.status || "-"}`
      );

      doc.moveDown();

    });

    // =============================
    // TTD
    // =============================

    doc.moveDown(2);

    doc.text("Asesi", {
      align: "right"
    });

    const ttdPath = apl01.peserta?.profileAsesi?.ttd_path;

    if (ttdPath) {

      const fullPath = path.join(
        process.cwd(),
        ttdPath
      );

      if (fs.existsSync(fullPath)) {

        doc.image(fullPath, 420, doc.y, {
          width: 100
        });

      }

    }

    doc.moveDown(4);

    doc.text(
      apl01.peserta?.profileAsesi?.nama_lengkap || "-",
      {
        align: "right"
      }
    );

    doc.end();

  } catch (err) {

    console.error("GENERATE PDF APL01 :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};