const { 
  Mkva, 
  MkvaDetail, 
  JadwalAsesor, 
  Jadwal, 
  Skema, 
  Tuk, 
  PesertaJadwal 
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
      where: { id_user, jenis_tugas: "validator_mkva", status: "aktif" },
      include: [{
        model: Jadwal,
        as: "jadwal",
        include: [
          { model: Skema, as: "skema" },
          { model: Tuk, as: "tuk" }
        ]
      }]
    });

    const result = await Promise.all(data.map(async (ja) => {
      const j = ja.jadwal;

      const totalAsesi = await PesertaJadwal.count({
        where: { id_jadwal: j.id_jadwal }
      });

      return {
        id_jadwal: j.id_jadwal,
        nama_kegiatan: j.nama_kegiatan,
        skema: j.skema?.judul_skema,
        tanggal: j.tgl_awal,
        tempat: j.tuk?.nama_tuk,
        total_asesi: totalAsesi,
        boleh_mkva: totalAsesi > 0
      };
    }));

    return response.success(res, "Daftar jadwal MKVA", result);

  } catch (err) {
    return response.error(res, err.message);
  }
};

// ==============================
// GET DETAIL MKVA
// ==============================
exports.getDetailMkva = async (req, res) => {
  try {
    const { id_mkva } = req.params;

    const mkva = await Mkva.findOne({
      where: { id_mkva },
      include: [{ model: MkvaDetail, as: "details" }]
    });

    if (!mkva) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    const safeParse = (val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    };

    return response.success(res, "Detail MKVA", {
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

  } catch (err) {
    return response.error(res, err.message);
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

    // VALIDASI ROLE
    const isValidator = await JadwalAsesor.findOne({
      where: { id_jadwal, id_user, jenis_tugas: "validator_mkva", status: "aktif" }
    });

    if (!isValidator) return response.error(res, "Tidak diizinkan", 403);

    // VALIDASI ADA ASESI
    const totalAsesi = await PesertaJadwal.count({ where: { id_jadwal } });
    if (totalAsesi === 0) return response.error(res, "Tidak ada asesi", 400);

    // CEK SUDAH ADA
    const existing = await Mkva.findOne({ where: { id_jadwal, id_user } });
    if (existing) return response.error(res, "MKVA sudah diisi", 400);

    const mkva = await Mkva.create({
      id_jadwal,
      id_user,
      periode: req.body.periode,

      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),

      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),

      hasil_konfirmasi: req.body.hasil_konfirmasi || null,

      acuan_pembanding: JSON.stringify(req.body.acuan_pembanding || []),
      dokumen_terkait: JSON.stringify(req.body.dokumen_terkait || []),

      keterampilan_komunikasi: JSON.stringify(req.body.keterampilan_komunikasi || []),

      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,

      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, { transaction: t });

    // 🔥 FIX: HANDLE EMPTY ARRAY
    const detailsInput = req.body.detail_penilaian || [];

    const details = detailsInput.map(item => ({
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

    if (details.length > 0) {
      await MkvaDetail.bulkCreate(details, { transaction: t });
    }

    await t.commit();

    return response.success(res, "MKVA berhasil disimpan");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
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

    const mkva = await Mkva.findOne({ where: { id_mkva, id_user } });
    if (!mkva) return response.error(res, "Data tidak ditemukan", 404);

    await mkva.update({
      periode: req.body.periode,

      tujuan_fokus_validasi: JSON.stringify(req.body.tujuan_fokus_validasi || []),
      konteks_validasi: JSON.stringify(req.body.konteks_validasi || []),
      pendekatan_validasi: JSON.stringify(req.body.pendekatan_validasi || []),

      asesor_kompetensi: JSON.stringify(req.body.asesor_kompetensi || []),

      hasil_konfirmasi: req.body.hasil_konfirmasi || null,
      temuan_validasi: req.body.temuan_validasi || null,
      rekomendasi: req.body.rekomendasi || null,

      rencana_implementasi: JSON.stringify(req.body.rencana_implementasi || [])
    }, { transaction: t });

    // 🔥 FIX: destroy harus pakai transaction object
    await MkvaDetail.destroy({
      where: { id_mkva },
      transaction: t
    });

    const detailsInput = req.body.detail_penilaian || [];

    const details = detailsInput.map(item => ({
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

    if (details.length > 0) {
      await MkvaDetail.bulkCreate(details, { transaction: t });
    }

    await t.commit();

    return response.success(res, "MKVA berhasil diupdate");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

// ==============================
// DOWNLOAD PDF
// ==============================
exports.downloadPdf = async (req, res) => {
  try {
    const { id_mkva } = req.params;

    const mkva = await Mkva.findOne({
      where: { id_mkva },
      include: [{ model: MkvaDetail, as: "details" }]
    });

    if (!mkva) return response.error(res, "Data tidak ditemukan", 404);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=MKVA_${id_mkva}.pdf`);

    doc.pipe(res);

    doc.fontSize(16).text("FORM MKVA", { align: "center" });
    doc.moveDown();

    doc.text(`Periode: ${mkva.periode}`);
    doc.moveDown();

    doc.text("Penilaian:");
    mkva.details.forEach(d => {
      doc.text(`${d.aspek} | V:${d.bukti_valid} A:${d.bukti_authentic}`);
    });

    doc.end();

  } catch (err) {
    return response.error(res, err.message);
  }
};