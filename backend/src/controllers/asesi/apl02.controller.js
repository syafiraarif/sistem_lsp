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
  Tuk,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* =================================
HELPER
================================= */

const toPlain = (data) => {
  if (!data) return null;
  return typeof data.toJSON === "function" ? data.toJSON() : data;
};

const getUnitKode = (unit) => {
  return (
    unit?.kode_unit ||
    unit?.kode ||
    unit?.kode_kompetensi ||
    unit?.kode_unit_kompetensi ||
    "-"
  );
};

const getUnitJudul = (unit) => {
  return (
    unit?.judul_unit ||
    unit?.nama_unit ||
    unit?.judul ||
    unit?.nama_unit_kompetensi ||
    "-"
  );
};

const getElemenText = (elemen) => {
  return (
    elemen?.nama_elemen ||
    elemen?.elemen_kompetensi ||
    elemen?.judul_elemen ||
    elemen?.elemen ||
    elemen?.deskripsi ||
    "-"
  );
};

const getKukText = (kuk) => {
  return (
    kuk?.uraian ||
    kuk?.kriteria_unjuk_kerja ||
    kuk?.kuk ||
    kuk?.deskripsi ||
    kuk?.pertanyaan ||
    kuk?.nama_kuk ||
    "-"
  );
};

const safeDate = () => new Date();

const getFormBySkema = async (id_skema) => {
  const skemaUnitRows = await SkemaUnit.findAll({
    where: {
      id_skema
    },
    order: [["urutan", "ASC"]]
  });

  const result = [];

  for (const row of skemaUnitRows) {
    const plainRow = toPlain(row);

    const unit = await UnitKompetensi.findByPk(plainRow.id_unit);

    if (!unit) {
      result.push({
        ...plainRow,
        unit: null
      });
      continue;
    }

    const plainUnit = toPlain(unit);

    const elemenRows = await UnitElemen.findAll({
      where: {
        id_unit: plainUnit.id_unit
      },
      order: [["urutan", "ASC"]]
    });

    const elemen = [];

    for (const elemenRow of elemenRows) {
      const plainElemen = toPlain(elemenRow);

      const kukRows = await UnitKuk.findAll({
        where: {
          id_elemen: plainElemen.id_elemen
        },
        order: [["urutan", "ASC"]]
      });

      elemen.push({
        ...plainElemen,
        kuk: kukRows.map((kuk) => toPlain(kuk))
      });
    }

    result.push({
      ...plainRow,
      unit: {
        ...plainUnit,
        elemen
      }
    });
  }

  return result;
};

const getPesertaFull = async (id_peserta, id_user = null) => {
  const where = {
    id_peserta
  };

  if (id_user) {
    where.id_user = id_user;
  }

  return await PesertaJadwal.findOne({
    where,
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        required: false,
        include: [
          {
            model: Skema,
            as: "skema",
            required: false
          },
          {
            model: Tuk,
            as: "tuk",
            required: false
          }
        ]
      }
    ]
  });
};

const buildApl02Detail = async (apl02, req) => {
  const plainApl02 = toPlain(apl02);
  const base = `${req.protocol}://${req.get("host")}`;

  const detailRows = await Apl02Detail.findAll({
    where: {
      id_apl02: plainApl02.id_apl02
    },
    order: [["id_detail", "ASC"]]
  });

  const detail = [];

  for (const detailRow of detailRows) {
    const plainDetail = toPlain(detailRow);

    const elemen = await UnitElemen.findByPk(plainDetail.id_elemen);

    const buktiRows = await Apl02Bukti.findAll({
      where: {
        id_detail: plainDetail.id_detail
      },
      order: [["id_bukti", "ASC"]]
    });

    const buktiTambahan = buktiRows.map((bukti) => {
      const plainBukti = toPlain(bukti);

      return {
        ...plainBukti,
        file_url: plainBukti.file_path
          ? `${base}/${plainBukti.file_path}`
          : null
      };
    });

    detail.push({
      ...plainDetail,
      elemen: elemen ? toPlain(elemen) : null,
      buktiTambahan
    });
  }

  return {
    ...plainApl02,
    detail
  };
};

/* =================================
GET FORM APL02
GET /api/asesi/apl02/form/:id_skema
================================= */

exports.getFormApl02 = async (req, res) => {
  try {
    const { id_skema } = req.params;

    const skema = await Skema.findByPk(id_skema);

    if (!skema) {
      return res.status(404).json({
        success: false,
        message: "Skema tidak ditemukan"
      });
    }

    const data = await getFormBySkema(id_skema);

    return res.json({
      success: true,
      message: "Form APL02 berhasil diambil",
      skema: {
        id_skema: skema.id_skema,
        kode_skema: skema.kode_skema,
        judul_skema: skema.judul_skema,
        jenis_skema: skema.jenis_skema,
        jenjang_kualifikasi: skema.jenjang_kualifikasi
      },
      data
    });
  } catch (err) {
    console.error("GET FORM APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
CREATE APL02
POST /api/asesi/apl02/create
================================= */

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
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const existing = await Apl02.findOne({
      where: {
        id_peserta
      }
    });

    if (existing) {
      return res.json({
        success: true,
        message: "APL02 sudah ada",
        data: existing
      });
    }

    const apl02 = await Apl02.create({
      id_peserta,
      status: "draft",
      rekomendasi_asesi: "",
      pendekatan_rekomendasi: "",
      created_at: safeDate(),
      updated_at: safeDate()
    });

    return res.json({
      success: true,
      message: "APL02 berhasil dibuat",
      data: apl02
    });
  } catch (err) {
    console.error("CREATE APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
SAVE PENILAIAN
POST /api/asesi/apl02/penilaian

DB apl02_detail:
id_detail, id_apl02, id_elemen, kompeten, catatan, created_at
================================= */

exports.savePenilaian = async (req, res) => {
  try {
    const { id_apl02, id_elemen, kompeten, catatan } = req.body;

    if (!id_apl02 || !id_elemen || !kompeten) {
      return res.status(400).json({
        success: false,
        message: "id_apl02, id_elemen, dan kompeten wajib diisi"
      });
    }

    if (!["K", "BK"].includes(kompeten)) {
      return res.status(400).json({
        success: false,
        message: "Kompeten harus bernilai K atau BK"
      });
    }

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL02 tidak ditemukan"
      });
    }

    if (apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL02 sudah submit dan tidak dapat diubah"
      });
    }

    const elemen = await UnitElemen.findByPk(id_elemen);

    if (!elemen) {
      return res.status(404).json({
        success: false,
        message: "Elemen tidak ditemukan"
      });
    }

    let detail = await Apl02Detail.findOne({
      where: {
        id_apl02,
        id_elemen
      }
    });

    if (detail) {
      await detail.update({
        kompeten,
        catatan: catatan || ""
      });

      await detail.reload();
    } else {
      detail = await Apl02Detail.create({
        id_apl02,
        id_elemen,
        kompeten,
        catatan: catatan || "",
        created_at: safeDate()
      });
    }

    await apl02.update({
      updated_at: safeDate()
    });

    return res.json({
      success: true,
      message: "Penilaian berhasil disimpan",
      data: detail
    });
  } catch (err) {
    console.error("SAVE PENILAIAN APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
SAVE REKOMENDASI
POST /api/asesi/apl02/rekomendasi
================================= */

exports.saveRekomendasi = async (req, res) => {
  try {
    const {
      id_apl02,
      rekomendasi_asesi,
      pendekatan_rekomendasi
    } = req.body;

    if (!id_apl02) {
      return res.status(400).json({
        success: false,
        message: "ID APL02 wajib diisi"
      });
    }

    const apl02 = await Apl02.findByPk(id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL02 tidak ditemukan"
      });
    }

    if (apl02.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "APL02 sudah submit dan tidak dapat diubah"
      });
    }

    await apl02.update({
      rekomendasi_asesi: rekomendasi_asesi || "",
      pendekatan_rekomendasi: pendekatan_rekomendasi || "",
      updated_at: safeDate()
    });

    await apl02.reload();

    return res.json({
      success: true,
      message: "Rekomendasi berhasil disimpan",
      data: apl02
    });
  } catch (err) {
    console.error("SAVE REKOMENDASI APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
UPLOAD BUKTI
POST /api/asesi/apl02/upload
================================= */

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
        message: "ID detail wajib diisi"
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File wajib"
      });
    }

    const detail = await Apl02Detail.findByPk(id_detail);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Detail APL02 tidak ditemukan"
      });
    }

    const bukti = await Apl02Bukti.create({
      id_detail,
      jenis_portofolio: jenis_portofolio || "",
      nama_dokumen: nama_dokumen || "",
      nomor_dokumen: nomor_dokumen || "",
      tanggal_dokumen: tanggal_dokumen || null,
      file_path: file.path.replace(/\\/g, "/"),
      created_at: safeDate()
    });

    return res.json({
      success: true,
      message: "Bukti berhasil diupload",
      data: bukti
    });
  } catch (err) {
    console.error("UPLOAD BUKTI APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
GET APL02
GET /api/asesi/apl02/:id_peserta

Versi aman:
Tidak pakai include Apl02Detail supaya tidak error relasi id_unit lama.
================================= */

exports.getApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const apl02 = await Apl02.findOne({
      where: {
        id_peserta
      }
    });

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL02 belum ada"
      });
    }

    const data = await buildApl02Detail(apl02, req);

    return res.json({
      success: true,
      message: "Detail APL02 berhasil diambil",
      data
    });
  } catch (err) {
    console.error("GET APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
DELETE BUKTI
DELETE /api/asesi/apl02/bukti/:id_bukti
================================= */

exports.deleteBukti = async (req, res) => {
  try {
    const bukti = await Apl02Bukti.findByPk(req.params.id_bukti);

    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: "Bukti tidak ditemukan"
      });
    }

    if (
      bukti.file_path &&
      fs.existsSync(path.join(process.cwd(), bukti.file_path))
    ) {
      fs.unlinkSync(path.join(process.cwd(), bukti.file_path));
    }

    await bukti.destroy();

    return res.json({
      success: true,
      message: "Bukti berhasil dihapus"
    });
  } catch (err) {
    console.error("DELETE BUKTI APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
SUBMIT APL02
PUT /api/asesi/apl02/submit/:id_apl02
================================= */

exports.submitApl02 = async (req, res) => {
  try {
    const apl02 = await Apl02.findByPk(req.params.id_apl02);

    if (!apl02) {
      return res.status(404).json({
        success: false,
        message: "APL02 tidak ditemukan"
      });
    }

    if (apl02.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "APL02 sudah submit"
      });
    }

    const total = await Apl02Detail.count({
      where: {
        id_apl02: apl02.id_apl02
      }
    });

    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi penilaian dulu"
      });
    }

    await apl02.update({
      status: "submitted",
      updated_at: safeDate()
    });

    return res.json({
      success: true,
      message: "Submit berhasil"
    });
  } catch (err) {
    console.error("SUBMIT APL02 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =================================
GENERATE PDF
GET /api/asesi/apl02/pdf/:id_peserta
================================= */

exports.generatePdfApl02 = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const apl02 = await Apl02.findOne({
      where: {
        id_peserta
      }
    });

    if (!apl02) {
      return res.status(404).json({
        message: "APL02 tidak ada"
      });
    }

    const peserta = await PesertaJadwal.findByPk(id_peserta, {
      include: [
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          required: false
        },
        {
          model: Jadwal,
          as: "jadwal",
          required: false,
          include: [
            {
              model: Skema,
              as: "skema",
              required: false
            },
            {
              model: Tuk,
              as: "tuk",
              required: false
            }
          ]
        }
      ]
    });

    const skema = peserta?.jadwal?.skema || {};
    const profile = peserta?.profileAsesi || {};
    const idSkema = skema.id_skema || peserta?.jadwal?.id_skema;

    const formUnits = idSkema ? await getFormBySkema(idSkema) : [];

    const detailRows = await Apl02Detail.findAll({
      where: {
        id_apl02: apl02.id_apl02
      }
    });

    const detailMap = {};

    detailRows.forEach((detail) => {
      detailMap[detail.id_elemen] = detail;
    });

    const doc = new PDFDocument({
      margin: 35,
      size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=APL02-${id_peserta}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(13).font("Helvetica-Bold").text("FR.APL.02. ASESMEN MANDIRI");
    doc.moveDown();

    doc.fontSize(9).font("Helvetica");
    doc.text("Skema Sertifikasi (KKNI/Okupasi/Klaster)");
    doc.text(`Judul  : ${skema.judul_skema || "-"}`);
    doc.text(`Nomor  : ${skema.kode_skema || "-"}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("PANDUAN ASESMEN MANDIRI:");
    doc.font("Helvetica").text("Instruksi:");
    doc.text("• Baca setiap pertanyaan di kolom sebelah kiri");
    doc.text("• Beri tanda centang pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan");
    doc.text("• Isi kolom bukti yang relevan untuk menunjukkan bahwa Anda melakukan pekerjaan.");
    doc.moveDown();

    formUnits.forEach((row, unitIndex) => {
      const plainRow = toPlain(row);
      const unit = plainRow.unit || {};

      if (doc.y > 690) {
        doc.addPage();
      }

      doc.font("Helvetica-Bold").fontSize(9);
      doc.text(`Unit Kompetensi ${unitIndex + 1}`);
      doc.text(`Kode Unit : ${getUnitKode(unit)}`);
      doc.text(`Judul Unit : ${getUnitJudul(unit)}`);
      doc.moveDown(0.5);

      const elemenList = unit.elemen || [];

      elemenList.forEach((elemen, elemenIndex) => {
        if (doc.y > 670) {
          doc.addPage();
        }

        const detail = detailMap[elemen.id_elemen];

        doc.font("Helvetica-Bold").fontSize(9);
        doc.text(`${elemenIndex + 1}. Elemen: ${getElemenText(elemen)}`);

        doc.font("Helvetica").fontSize(8);
        doc.text(`K/BK: ${detail?.kompeten || "-"}`);
        doc.text(`Bukti yang relevan: ${detail?.catatan || "-"}`);

        const kukList = elemen.kuk || [];

        if (kukList.length) {
          doc.font("Helvetica-Bold").text("Kriteria Unjuk Kerja:");
          doc.font("Helvetica");

          kukList.forEach((kuk, kukIndex) => {
            doc.text(`${kukIndex + 1}. ${getKukText(kuk)}`);
          });
        }

        doc.moveDown(0.8);
      });
    });

    if (doc.y > 610) {
      doc.addPage();
    }

    doc.moveDown();
    doc.font("Helvetica-Bold").text("Rekomendasi untuk Asesi:");
    doc.font("Helvetica").text(apl02.rekomendasi_asesi || "-");
    doc.text(
      `Asesmen dapat / tidak dapat dilanjutkan melalui pendekatan ${
        apl02.pendekatan_rekomendasi || "...................."
      }`
    );

    doc.moveDown(2);

    const ttd = profile?.ttd_path;

    if (ttd) {
      const ttdPath = path.join(process.cwd(), ttd);

      if (fs.existsSync(ttdPath)) {
        doc.image(ttdPath, 400, doc.y, {
          width: 100
        });
      }
    }

    doc.moveDown(4);

    doc.text(`Asesi: ${profile?.nama_lengkap || "-"}`, {
      align: "right"
    });

    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, {
      align: "right"
    });

    doc.end();
  } catch (err) {
    console.error("PDF APL02 ERROR:", err);

    return res.status(500).json({
      message: err.message
    });
  }
};