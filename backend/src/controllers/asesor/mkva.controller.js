const {
  Mkva,
  MkvaDetail,
  JadwalAsesor,
  Jadwal,
  Skema,
  Tuk
} = require("../../models");

const response = require("../../utils/response.util");
const PDFDocument = require("pdfkit");

// ==============================
// GET JADWAL MKVA
// ==============================
exports.getJadwalMkva = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await JadwalAsesor.findAll({
      where: {
        id_user,
        jenis_tugas: "validator_mkva",
        status: "aktif"
      },
      include: [{
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
      }]
    });

    const result = data.map((ja) => {
    const j = ja.jadwal;

    return {
      id_jadwal: j.id_jadwal,
      nama_kegiatan: j.nama_kegiatan,
      skema: j.skema?.judul_skema,
      kode_skema: j.skema?.kode_skema,
      tanggal: j.tgl_awal,
      tempat: j.tuk?.nama_tuk,
      boleh_mkva: true
    };
  });

    return response.success(
      res,
      "Daftar jadwal MKVA",
      result
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};

// ==============================
// HELPER PARSE JSON
// ==============================
const safeParse = (val) => {
  try {
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

const formatMkvaResponse = (mkva) => ({
  ...mkva.toJSON(),
  tujuan_fokus_validasi: safeParse(mkva.tujuan_fokus_validasi),
  konteks_validasi: safeParse(mkva.konteks_validasi),
  pendekatan_validasi: safeParse(mkva.pendekatan_validasi),
  asesor_kompetensi: safeParse(mkva.asesor_kompetensi),
  acuan_pembanding: safeParse(mkva.acuan_pembanding),
  dokumen_terkait: safeParse(mkva.dokumen_terkait),
  keterampilan_komunikasi: safeParse(mkva.keterampilan_komunikasi),
  rencana_implementasi: safeParse(mkva.rencana_implementasi)
});

// ==============================
// GET DETAIL MKVA
// ==============================
exports.getDetailMkva = async (req, res) => {
  try {
    const { id_mkva } = req.params;

    const mkva = await Mkva.findOne({
      where: { id_mkva },
      include: [{
        model: MkvaDetail,
        as: "details"
      }]
    });

    if (!mkva) {
      return response.error(
        res,
        "Data tidak ditemukan",
        404
      );
    }

    return response.success(
      res,
      "Detail MKVA",
      formatMkvaResponse(mkva)
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};

// ==============================
// SUBMIT MKVA
// ==============================
exports.submitMkva = async (req, res) => {
  const t = await Mkva.sequelize.transaction();

  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.params;

    const isValidator = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        jenis_tugas: "validator_mkva",
        status: "aktif"
      }
    });

    if (!isValidator) {
      await t.rollback();

      return response.error(
        res,
        "Tidak diizinkan",
        403
      );
    }

    const existing = await Mkva.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    if (existing) {
      await t.rollback();

      return response.error(
        res,
        "MKVA sudah diisi",
        400
      );
    }

    const mkva = await Mkva.create({
      id_jadwal,
      id_user,

      periode: req.body.periode,

      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),

      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),
      lead_asesor: req.body.lead_asesor || null,
      manajer_supervisor: req.body.manajer_supervisor || null,
      tenaga_ahli: req.body.tenaga_ahli || null,
      koord_pelatihan: req.body.koord_pelatihan || null,
      anggota_asosiasi: req.body.anggota_asosiasi || null,

      hasil_konfirmasi: req.body.hasil_konfirmasi || null,

      acuan_pembanding: JSON.stringify(req.body.acuan_pembanding || []),
      dokumen_terkait: JSON.stringify(req.body.dokumen_terkait || []),
      keterampilan_komunikasi: JSON.stringify(req.body.keterampilan_komunikasi || []),

      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,
      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, {
      transaction: t
    });

    const detailsInput = req.body.detail_penilaian || [];

    const details = detailsInput.map((item) => ({
      id_mkva: mkva.id_mkva,
      aspek: item.aspek || "",
      bukti_valid: item.V || false,
      bukti_authentic: item.A || false,
      bukti_terkini: item.T || false,
      bukti_memadai: item.M || false,
      prinsip_valid: item.Vp || false,
      prinsip_reliable: item.R || false,
      prinsip_fair: item.F || false,
      prinsip_flexible: item.FL || false
    }));

    if (details.length) {
      await MkvaDetail.bulkCreate(details, {
        transaction: t
      });
    }

    await t.commit();

    return response.success(
      res,
      "MKVA berhasil disimpan",
      {
        id_mkva: mkva.id_mkva
      }
    );
  } catch (err) {
    await t.rollback();

    return response.error(
      res,
      err.message
    );
  }
};

// ==============================
// UPDATE MKVA
// ==============================
exports.updateMkva = async (req, res) => {
  const t = await Mkva.sequelize.transaction();

  try {
    const { id_mkva } = req.params;
    const id_user = req.user.id_user;

    const mkva = await Mkva.findOne({
      where: {
        id_mkva,
        id_user
      }
    });

    if (!mkva) {
      await t.rollback();

      return response.error(
        res,
        "Data tidak ditemukan",
        404
      );
    }

    await mkva.update({
      periode: req.body.periode,

      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),

      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),
      lead_asesor: req.body.lead_asesor || null,
      manajer_supervisor: req.body.manajer_supervisor || null,
      tenaga_ahli: req.body.tenaga_ahli || null,
      koord_pelatihan: req.body.koord_pelatihan || null,
      anggota_asosiasi: req.body.anggota_asosiasi || null,

      hasil_konfirmasi: req.body.hasil_konfirmasi || null,

      acuan_pembanding: JSON.stringify(req.body.acuan_pembanding || []),
      dokumen_terkait: JSON.stringify(req.body.dokumen_terkait || []),
      keterampilan_komunikasi: JSON.stringify(req.body.keterampilan_komunikasi || []),

      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,
      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, {
      transaction: t
    });

    await MkvaDetail.destroy({
      where: {
        id_mkva
      },
      transaction: t
    });

    const details = (req.body.detail_penilaian || []).map((item) => ({
      id_mkva,
      aspek: item.aspek || "",
      bukti_valid: item.V || false,
      bukti_authentic: item.A || false,
      bukti_terkini: item.T || false,
      bukti_memadai: item.M || false,
      prinsip_valid: item.Vp || false,
      prinsip_reliable: item.R || false,
      prinsip_fair: item.F || false,
      prinsip_flexible: item.FL || false
    }));

    if (details.length) {
      await MkvaDetail.bulkCreate(details, {
        transaction: t
      });
    }

    await t.commit();

    return response.success(
      res,
      "MKVA berhasil diupdate"
    );
  } catch (err) {
    await t.rollback();

    return response.error(
      res,
      err.message
    );
  }
};

// ==============================
// GET MKVA BY JADWAL
// ==============================
exports.getMkvaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const mkva = await Mkva.findOne({
      where: {
        id_jadwal,
        id_user
      },
      include: [{
        model: MkvaDetail,
        as: "details",
        required: false
      }]
    });

    if (!mkva) {
      return response.success(
        res,
        "Belum ada MKVA",
        null
      );
    }

    return response.success(
      res,
      "Detail MKVA",
      formatMkvaResponse(mkva)
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};

// ==============================
// DOWNLOAD PDF
// ==============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id_mkva } = req.params;

    const mkva = await Mkva.findOne({
      where: {
        id_mkva
      },
      include: [{
        model: MkvaDetail,
        as: "details"
      }]
    });

    if (!mkva) {
      return response.error(
        res,
        "Data tidak ditemukan",
        404
      );
    }

    const doc = new PDFDocument({
      margin: 40
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MKVA_${id_mkva}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(16).text("FORM MKVA", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(11).text(`Periode: ${mkva.periode || "-"}`);
    doc.text(`Lead Asesor: ${mkva.lead_asesor || "-"}`);
    doc.text(`Manajer/Supervisor: ${mkva.manajer_supervisor || "-"}`);
    doc.text(`Tenaga Ahli: ${mkva.tenaga_ahli || "-"}`);
    doc.text(`Koord. Pelatihan: ${mkva.koord_pelatihan || "-"}`);
    doc.text(`Anggota Asosiasi: ${mkva.anggota_asosiasi || "-"}`);

    doc.moveDown();

    doc.fontSize(13).text("Detail Penilaian", {
      underline: true
    });

    doc.moveDown(0.5);

    if (mkva.details && mkva.details.length) {
      mkva.details.forEach((d, index) => {
        doc.fontSize(10).text(`${index + 1}. ${d.aspek || "-"}`);
        doc.text(
          `Aturan Bukti: V=${d.bukti_valid ? "Ya" : "Tidak"}, A=${d.bukti_authentic ? "Ya" : "Tidak"}, T=${d.bukti_terkini ? "Ya" : "Tidak"}, M=${d.bukti_memadai ? "Ya" : "Tidak"}`
        );
        doc.text(
          `Prinsip Asesmen: V=${d.prinsip_valid ? "Ya" : "Tidak"}, R=${d.prinsip_reliable ? "Ya" : "Tidak"}, F=${d.prinsip_fair ? "Ya" : "Tidak"}, FL=${d.prinsip_flexible ? "Ya" : "Tidak"}`
        );
        doc.moveDown(0.5);
      });
    } else {
      doc.text("Belum ada detail penilaian.");
    }

    doc.moveDown();

    doc.fontSize(13).text("Temuan Validasi", {
      underline: true
    });

    doc.fontSize(10).text(mkva.temuan_validasi || "-");

    doc.moveDown();

    doc.fontSize(13).text("Rekomendasi", {
      underline: true
    });

    doc.fontSize(10).text(mkva.rekomendasi || "-");

    doc.end();
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
};