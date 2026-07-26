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
  UnitKompetensi,
  UnitElemen,
  UnitKuk,
  KelompokPekerjaan
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/*
=====================================
HELPER
=====================================
*/

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function"
    ? data.toJSON()
    : data;
};

const safeNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? null
    : parsed;
};

const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};


/*
=====================================
AMBIL DETAIL UNIT
=====================================
*/

const getUnitFull = async (id_unit) => {

  const unitData =
    await UnitKompetensi.findByPk(id_unit);

  if (!unitData) {
    return null;
  }

  const unit = toPlain(unitData);

  const elemenData =
    await UnitElemen.findAll({

      where: {
        id_unit
      },

      order: [
        ["urutan", "ASC"]
      ]

    });

  const elemen = [];

  for (const item of elemenData) {

    const plainElemen = toPlain(item);

    const kukData =
      await UnitKuk.findAll({

        where: {
          id_elemen: plainElemen.id_elemen
        },

        order: [
          ["urutan", "ASC"]
        ]

      });

    elemen.push({

      ...plainElemen,

      kuk: kukData.map((x) => toPlain(x))

    });

  }

  return {

    ...unit,

    elemen

  };

};


/*
=====================================
AMBIL UNIT BERDASARKAN SKEMA
=====================================
*/

const getUnitKompetensiBySkema =
async (id_skema) => {

  if (!id_skema) {
    return [];
  }

  const relasi =
    await SkemaUnit.findAll({

      where: {
        id_skema
      },

      order: [
        ["urutan", "ASC"]
      ]

    });

  const result = [];

  for (const item of relasi) {

    const rel = toPlain(item);

    const unit =
      await getUnitFull(rel.id_unit);

    if (!unit) {
      continue;
    }

    result.push({

      ...unit,

      skema_unit: {
        id_skema: safeNumber(rel.id_skema),
        id_unit: safeNumber(rel.id_unit),
        urutan: safeNumber(rel.urutan)
      }

    });

  }

  return result;

};


/*
=====================================
FORMAT URL DOKUMEN
=====================================
*/

const formatDokumenWithUrl = (
  req,
  dokumen = []
) => {

  const baseUrl =
    getBaseUrl(req);

  return dokumen.map((item) => ({

    ...item,

    file_url: item.file_path
      ? `${baseUrl}/${item.file_path}`
      : null

  }));

};



/*
=====================================
GET FORM APL.01
=====================================
*/

exports.getFormApl01 = async (req, res) => {

  try {

    const { id_peserta } = req.params;

    const id_user =
      req.user.id_user || req.user.id;

    if (!id_peserta) {

      return res.status(400).json({

        success: false,
        message: "id_peserta wajib diisi"

      });

    }
    

    const peserta =
      await PesertaJadwal.findOne({

        where: {
          id_peserta,
          id_user
        },

        include: [

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

    const profile =
      await ProfileAsesi.findByPk(
        peserta.id_user
      );

    const persyaratan =
      await SkemaPersyaratan.findAll({

        where: {
          id_skema: peserta.jadwal.id_skema
        },

        include: [

          {

            model: Persyaratan,

            as: "persyaratan"

          }

        ],

        order: [

          ["id_persyaratan", "ASC"]

        ]

      });

    const persyaratanDasar =
      persyaratan.filter(

        (item) =>
          item.persyaratan &&
          item.persyaratan.jenis_persyaratan === "dasar"

      );

    const persyaratanAdministratif =
      persyaratan.filter(

        (item) =>
          item.persyaratan &&
          item.persyaratan.jenis_persyaratan === "administratif"

      );

    return res.status(200).json({

      success: true,

      data: {

        peserta: peserta.toJSON(),

        profile: profile
          ? profile.toJSON()
          : null,

        jadwal: peserta.jadwal
          ? peserta.jadwal.toJSON()
          : null,

        skema: peserta.jadwal?.skema
          ? peserta.jadwal.skema.toJSON()
          : null,

        tuk: peserta.jadwal?.tuk
          ? peserta.jadwal.tuk.toJSON()
          : null,

        persyaratanDasar,

        persyaratanAdministratif

      }

    });

  } catch (err) {

    console.error(
      "GET FORM APL01 :",
      err
    );

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

/*
=====================================
CREATE APL.01
POST /api/asesi/apl01/create
=====================================
*/

exports.createApl01 = async (req, res) => {

  try {

    const id_user =
      req.user.id_user || req.user.id;

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

    const tujuanValid = [

      "sertifikasi",
      "sertifikasi_ulang",
      "pkk",
      "rpl",
      "lainnya"

    ];

    if (
      !tujuan_asesmen ||
      !tujuanValid.includes(tujuan_asesmen)
    ) {

      return res.status(400).json({

        success: false,
        message: "Tujuan asesmen tidak valid"

      });

    }

    if (
      tujuan_asesmen === "lainnya" &&
      !tujuan_lainnya
    ) {

      return res.status(400).json({

        success: false,
        message: "Tujuan lainnya wajib diisi"

      });

    }

    const peserta =
      await PesertaJadwal.findOne({

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

    if (!peserta.jadwal) {

      return res.status(404).json({

        success: false,
        message: "Jadwal asesmen tidak ditemukan"

      });

    }

    const existing =
      await Apl01Asesmen.findOne({

        where: {
          id_peserta
        }

      });

    if (existing) {

      return res.status(409).json({

        success: false,

        message: "APL.01 sudah pernah dibuat",

        data: existing.toJSON()

      });

    }

    const apl01 =
      await Apl01Asesmen.create({

        id_peserta,

        id_jadwal:
          peserta.id_jadwal,

        id_skema:
          peserta.jadwal.id_skema,

        tujuan_asesmen,

        tujuan_lainnya:
          tujuan_asesmen === "lainnya"
            ? tujuan_lainnya
            : null,

        status: "draft"

      });

    return res.status(201).json({

      success: true,

      message: "APL.01 berhasil dibuat",

      data: apl01.toJSON()

    });

  } catch (err) {

    console.error(
      "CREATE APL01 :",
      err
    );

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

    console.log("=== MASUK CONTROLLER ===");
    console.log(req.body);
    console.log(req.files);

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

    const file =
      req.files?.file_dokumen?.[0];

    if (!file) {

      return res.status(400).json({

        success: false,
        message: "File dokumen wajib diupload"

      });

    }

    const apl01 =
      await Apl01Asesmen.findByPk(id_apl01);

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

    const persyaratan =
      await Persyaratan.findByPk(id_persyaratan);

    if (!persyaratan) {

      return res.status(404).json({

        success: false,
        message: "Persyaratan tidak ditemukan"

      });

    }

    const payload = {

      id_apl01,

      id_persyaratan,

      nomor_dokumen:
        nomor_dokumen || null,

      tanggal_dokumen:
        tanggal_dokumen || null,

      file_path:
        file.path.replace(/\\/g, "/")

    };

    let dokumen =
      await Apl01Dokumen.findOne({

        where: {

          id_apl01,
          id_persyaratan

        }

      });

    if (dokumen) {

      if (
        dokumen.file_path &&
        fs.existsSync(
          path.join(
            process.cwd(),
            dokumen.file_path
          )
        )
      ) {

        fs.unlinkSync(

          path.join(
            process.cwd(),
            dokumen.file_path
          )

        );

      }

      await dokumen.update(payload);

      await dokumen.reload();

    } else {

      dokumen =
        await Apl01Dokumen.create(payload);

    }

    return res.status(200).json({

      success: true,

      message: "Dokumen berhasil disimpan",

      data: dokumen.toJSON()

    });

  } catch (err) {

    console.error(
      "UPLOAD DOKUMEN APL01 :",
      err
    );

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

    const id_user =
      req.user.id_user || req.user.id;

    if (!id_peserta) {

      return res.status(400).json({

        success: false,
        message: "id_peserta wajib diisi"

      });

    }

    const peserta =
      await PesertaJadwal.findOne({

        where: {
          id_peserta,
          id_user
        },

        include: [

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

    const profile =
      await ProfileAsesi.findByPk(
        peserta.id_user
      );

    const apl01 =
      await Apl01Asesmen.findOne({

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

    const data =
      apl01.toJSON();

    data.dokumen =
      formatDokumenWithUrl(
        req,
        data.dokumen
      );

    return res.status(200).json({

      success: true,

      data: {

        apl01: data,

        peserta: peserta.toJSON(),

        profile: profile
          ? profile.toJSON()
          : null,

        jadwal: peserta.jadwal
          ? peserta.jadwal.toJSON()
          : null,

        skema: peserta.jadwal?.skema
          ? peserta.jadwal.skema.toJSON()
          : null,

        tuk: peserta.jadwal?.tuk
          ? peserta.jadwal.tuk.toJSON()
          : null

      }

    });

  } catch (err) {

    console.error(
      "GET APL01 :",
      err
    );

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

    const id_user =
      req.user.id_user || req.user.id;

    const apl01 =
      await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {

      return res.status(404).json({

        success: false,
        message: "APL.01 tidak ditemukan"

      });

    }

    const peserta =
      await PesertaJadwal.findOne({

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

    /*
    =====================================
    CEK PERSYARATAN WAJIB
    =====================================
    */

    const persyaratanWajib =
      await SkemaPersyaratan.findAll({

        where: {

          id_skema: apl01.id_skema,
          wajib: true

        }

      });

    const dokumen =
      await Apl01Dokumen.findAll({

        where: {
          id_apl01
        }

      });

    const uploadedIds =
      dokumen.map((item) => item.id_persyaratan);

    const missing =
      persyaratanWajib.filter(

        (item) =>
          !uploadedIds.includes(
            item.id_persyaratan
          )

      );

    if (missing.length > 0) {

      return res.status(400).json({

        success: false,

        message:
          "Masih ada dokumen persyaratan yang belum diupload",

        missing

      });

    }

    /*
    =====================================
    CEK TTD ASESI
    =====================================
    */

    const profile =
      await ProfileAsesi.findByPk(
        peserta.id_user
      );

    if (
      !profile ||
      !profile.ttd_path
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Silakan upload tanda tangan terlebih dahulu"

      });

    }

    /*
    =====================================
    UPDATE STATUS
    =====================================
    */

    await apl01.update({

      status: "submit"

    });

    return res.status(200).json({

      success: true,

      message:
        "APL.01 berhasil disubmit",

      data: apl01.toJSON()

    });

  } catch (err) {

    console.error(
      "SUBMIT APL01 :",
      err
    );

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

    const id_user =
      req.user.id_user || req.user.id;

    const peserta =
      await PesertaJadwal.findOne({

        where: {
          id_peserta,
          id_user
        },

        include: [

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

      return res.status(403).json({

        success: false,

        message: "Anda tidak memiliki akses"

      });

    }

    const profile =
      await ProfileAsesi.findByPk(
        peserta.id_user
      );

    const apl01 =
      await Apl01Asesmen.findOne({

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

        message: "APL.01 tidak ditemukan"

      });

    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=APL01_${id_peserta}.pdf`
    );

    const doc =
      new PDFDocument({

        size: "A4",

        margin: 50

      });

    doc.pipe(res);

    /*
    =====================================
    HEADER
    =====================================
    */

    doc
      .fontSize(18)
      .text(
        "FORMULIR APL.01",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Nama Asesi : ${profile?.nama_lengkap || "-"}`
      );

    doc.text(
      `Skema Sertifikasi : ${
        peserta.jadwal?.skema?.judul_skema || "-"
      }`
    );

    doc.text(
      `TUK : ${
        peserta.jadwal?.tuk?.nama_tuk || "-"
      }`
    );

    doc.text(
      `Tujuan Asesmen : ${apl01.tujuan_asesmen}`
    );

    if (
      apl01.tujuan_asesmen === "lainnya" &&
      apl01.tujuan_lainnya
    ) {

      doc.text(
        `Keterangan : ${apl01.tujuan_lainnya}`
      );

    }

    doc.moveDown();

    /*
    =====================================
    DOKUMEN
    =====================================
    */

    doc
      .fontSize(13)
      .text(
        "Dokumen Persyaratan",
        {
          underline: true
        }
      );

    doc.moveDown(0.5);

    apl01.dokumen.forEach((item, index) => {

      if (doc.y > 720) {

        doc.addPage();

      }

      doc
        .fontSize(11)
        .text(
          `${index + 1}. ${item.persyaratan?.nama_persyaratan || "-"}`
        );

      doc.text(
        `Nomor Dokumen : ${item.nomor_dokumen || "-"}`
      );

      doc.text(
        `Tanggal : ${item.tanggal_dokumen || "-"}`
      );

      doc.text(
        `Status : ${item.status || "pending"}`
      );

      doc.moveDown();

    });

    /*
    =====================================
    TTD
    =====================================
    */

    doc.moveDown(2);

    const imageY = doc.y;

    if (profile?.ttd_path) {

      const fileTTD =
        path.join(
          process.cwd(),
          profile.ttd_path
        );

      if (
        fs.existsSync(fileTTD)
      ) {

        doc.image(
          fileTTD,
          420,
          imageY,
          {
            width: 90
          }
        );

      }

    }

    doc.moveDown(5);

    doc.text(
      "Asesi",
      {
        align: "right"
      }
    );

    doc.text(
      profile?.nama_lengkap || "-",
      {
        align: "right"
      }
    );

    doc.end();

  } catch (err) {

    console.error(
      "GENERATE PDF APL01 :",
      err
    );

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};