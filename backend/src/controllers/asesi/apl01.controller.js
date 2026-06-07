const {
  Apl01Asesmen,
  Apl01Dokumen,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  Persyaratan,
  SkemaPersyaratan,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const SkemaUnit = require("../../models/skemaUnit.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const UnitElemen = require("../../models/unitElemen.model");
const UnitKuk = require("../../models/unitKuk.model");
const KelompokPekerjaan = require("../../models/kelompokPekerjaan.model");

/*
=====================================
HELPER
=====================================
*/

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getUnitFull = async (id_unit) => {
  const unitData = await UnitKompetensi.findByPk(id_unit);

  if (!unitData) return null;

  const unit = toPlain(unitData);

  const elemenData = await UnitElemen.findAll({
    where: {
      id_unit
    },
    order: [["urutan", "ASC"]]
  });

  const elemen = [];

  for (const item of elemenData) {
    const plainElemen = toPlain(item);

    const kukData = await UnitKuk.findAll({
      where: {
        id_elemen: plainElemen.id_elemen
      },
      order: [["urutan", "ASC"]]
    });

    elemen.push({
      ...plainElemen,
      kuk: kukData.map((kuk) => toPlain(kuk))
    });
  }

  return {
    ...unit,
    elemen
  };
};

const getUnitKompetensiBySkema = async (id_skema) => {
  if (!id_skema) return [];

  const relasi = await SkemaUnit.findAll({
    where: {
      id_skema
    },
    order: [
      ["id_kelompok", "ASC"],
      ["urutan", "ASC"],
      ["id_unit", "ASC"]
    ]
  });

  const result = [];

  for (const item of relasi) {
    const plainRelasi = toPlain(item);

    const unit = await getUnitFull(plainRelasi.id_unit);

    if (!unit) continue;

    let kelompok = null;

    if (plainRelasi.id_kelompok) {
      const kelompokData = await KelompokPekerjaan.findByPk(
        plainRelasi.id_kelompok
      );

      kelompok = toPlain(kelompokData);
    }

    result.push({
      ...unit,

      skema_unit: {
        id_skema: safeNumber(plainRelasi.id_skema),
        id_kelompok: safeNumber(plainRelasi.id_kelompok),
        id_unit: safeNumber(plainRelasi.id_unit),
        urutan: safeNumber(plainRelasi.urutan)
      },

      kelompok_pekerjaan: kelompok
        ? {
            id_kelompok: kelompok.id_kelompok,
            id_skema: kelompok.id_skema,
            nama_kelompok: kelompok.nama_kelompok,
            deskripsi: kelompok.deskripsi,
            urutan: kelompok.urutan
          }
        : null
    });
  }

  return result;
};

/*
=====================================
GET FORM
=====================================
*/

exports.getFormApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

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
        message: "Peserta tidak ditemukan"
      });
    }

    const id_skema = peserta.jadwal?.id_skema;

    const persyaratan = await SkemaPersyaratan.findAll({
      where: {
        id_skema
      },

      include: [
        {
          model: Persyaratan,
          as: "persyaratan"
        }
      ]
    });

    const unit_kompetensi = await getUnitKompetensiBySkema(id_skema);

    return res.json({
      peserta,
      persyaratan,
      unit_kompetensi
    });
  } catch (err) {
    console.error("GET FORM APL01 ERROR:", err);

    return res.status(500).json({
      message: "Gagal ambil form",
      error: err.message
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
    const {
      id_peserta,
      tujuan_asesmen,
      tujuan_lainnya
    } = req.body;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_user: req.user.id_user
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
        message: "Peserta tidak ditemukan"
      });
    }

    const existing = await Apl01Asesmen.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.json({
        message: "APL01 sudah ada",
        data: existing
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
  } catch (err) {
    console.error("CREATE APL01 ERROR:", err);

    return res.status(500).json({
      message: "Gagal create",
      error: err.message
    });
  }
};

/*
=====================================
UPLOAD DOKUMEN
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

    const file = req.files?.file_dokumen?.[0];

    if (!file) {
      return res.status(400).json({
        message: "File wajib"
      });
    }

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        message: "APL01 tidak ditemukan"
      });
    }

    if (apl01.status !== "draft") {
      return res.status(400).json({
        message: "APL01 sudah submit"
      });
    }

    const existing = await Apl01Dokumen.findOne({
      where: {
        id_apl01,
        id_persyaratan
      }
    });

    const payload = {
      id_apl01,
      id_persyaratan,

      nomor_dokumen: nomor_dokumen || null,

      tanggal_dokumen: tanggal_dokumen || null,

      file_path: file.path.replace(/\\/g, "/")
    };

    let result;

    if (existing) {
      if (
        existing.file_path &&
        fs.existsSync(path.join(process.cwd(), existing.file_path))
      ) {
        fs.unlinkSync(path.join(process.cwd(), existing.file_path));
      }

      await existing.update(payload);

      await existing.reload();

      result = existing;
    } else {
      result = await Apl01Dokumen.create(payload);
    }

    return res.json({
      message: "Dokumen berhasil disimpan",
      data: result
    });
  } catch (err) {
    console.error("UPLOAD DOKUMEN APL01 ERROR:", err);

    return res.status(500).json({
      message: "Upload gagal",
      error: err.message
    });
  }
};

/*
=====================================
GET APL01
=====================================
*/

exports.getApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

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
        message: "APL01 belum ada"
      });
    }

    const data = apl01.toJSON();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    data.dokumen = (data.dokumen || []).map((x) => ({
      ...x,

      file_url: x.file_path ? `${baseUrl}/${x.file_path}` : null
    }));

    return res.json({
      data
    });
  } catch (err) {
    console.error("GET APL01 ERROR:", err);

    return res.status(500).json({
      message: "Gagal",
      error: err.message
    });
  }
};

/*
=====================================
SUBMIT
=====================================
*/

exports.submitFinalApl01 = async (req, res) => {
  try {
    const { id_apl01 } = req.params;

    const apl01 = await Apl01Asesmen.findByPk(id_apl01);

    if (!apl01) {
      return res.status(404).json({
        message: "APL01 tidak ada"
      });
    }

    if (apl01.status === "submit") {
      return res.status(400).json({
        message: "APL01 sudah submit"
      });
    }

    const wajib = await SkemaPersyaratan.findAll({
      where: {
        id_skema: apl01.id_skema,
        wajib: true
      }
    });

    const uploaded = await Apl01Dokumen.findAll({
      where: {
        id_apl01
      }
    });

    const ids = uploaded.map((x) => x.id_persyaratan);

    const missing = wajib.filter(
      (x) => !ids.includes(x.id_persyaratan)
    );

    if (missing.length) {
      return res.status(400).json({
        message: "Persyaratan belum lengkap",
        missing
      });
    }

    const peserta = await PesertaJadwal.findByPk(apl01.id_peserta);

    const profile = await ProfileAsesi.findByPk(peserta.id_user);

    if (!profile?.ttd_path) {
      return res.status(400).json({
        message: "TTD belum upload"
      });
    }

    await apl01.update({
      status: "submit",

      ttd_asesi_path: profile.ttd_path
    });

    return res.json({
      message: "APL01 berhasil submit"
    });
  } catch (err) {
    console.error("SUBMIT APL01 ERROR:", err);

    return res.status(500).json({
      message: "Submit gagal",
      error: err.message
    });
  }
};

/*
=====================================
PDF
=====================================
*/

exports.generatePdfApl01 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

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
        message: "APL01 tidak ada"
      });
    }

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=APL01_${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 50
    });

    doc.pipe(res);

    doc.fontSize(18).text("FORMULIR APL 01", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(
      `Nama : ${apl01.peserta?.profileAsesi?.nama_lengkap || "-"}`
    );

    doc.text(
      `Skema : ${apl01.peserta?.jadwal?.skema?.judul_skema || "-"}`
    );

    doc.text(
      `TUK : ${apl01.peserta?.jadwal?.tuk?.nama_tuk || "-"}`
    );

    doc.text(
      `Tujuan : ${apl01.tujuan_asesmen || "-"}`
    );

    doc.moveDown();

    doc.text("Dokumen Persyaratan:");

    (apl01.dokumen || []).forEach((x, i) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.text(
        `${i + 1}. ${x.persyaratan?.nama_persyaratan || "-"}`
      );
    });

    doc.moveDown(4);

    if (apl01.ttd_asesi_path) {
      const ttd = path.join(process.cwd(), apl01.ttd_asesi_path);

      if (fs.existsSync(ttd)) {
        doc.image(ttd, 420, doc.y, {
          width: 100
        });
      }
    }

    doc.text("Asesi", {
      align: "right"
    });

    doc.end();
  } catch (err) {
    console.error("PDF APL01 ERROR:", err);

    return res.status(500).json({
      message: "PDF gagal",
      error: err.message
    });
  }
};