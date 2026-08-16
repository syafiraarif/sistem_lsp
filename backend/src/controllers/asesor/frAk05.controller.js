const sequelize = require("../../config/database");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const {
  FrAk05,
  PresensiAsesor,
  JadwalAsesor,
  PesertaJadwal,
  ProfileAsesor,
  ProfileAsesi,
  Jadwal,
  Skema,
  Tuk,
  User
} = require("../../models");

const getNamaAsesi = (profile, user) => {
  return (
    profile?.nama_lengkap ||
    profile?.nama ||
    user?.nama_lengkap ||
    user?.nama ||
    user?.username ||
    "-"
  );
};

const getNamaAsesor = (profile) => {
  return (
    profile?.nama_lengkap ||
    profile?.nama ||
    "-"
  );
};

const getTukType = (tuk) => {
  const value = String(
    tuk?.jenis_tuk ||
    tuk?.jenis ||
    ""
  )
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  if (value.includes("sewaktu")) {
    return "sewaktu";
  }

  if (value.includes("tempat")) {
    return "tempat_kerja";
  }

  if (value.includes("mandiri")) {
    return "mandiri";
  }

  return "";
};

const getTanggalJadwal = (jadwal) => {
  return (
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tgl_asesmen ||
    jadwal?.tgl_mulai ||
    null
  );
};

const submitFrAk05 = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const id_asesor = Number(req.user.id_user);

    const {
      id_jadwal,
      id_peserta,
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;

    if (!id_jadwal || !id_peserta) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });
    }

    if (!rekomendasi) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Rekomendasi wajib dipilih."
      });
    }

    if (!["kompeten", "belum_kompeten"].includes(rekomendasi)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Rekomendasi tidak valid."
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      },
      transaction
    });

    if (!akses) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      transaction
    });

    if (!peserta) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan pada jadwal ini."
      });
    }

    const existing = await FrAk05.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      transaction
    });

    if (existing) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "FR.AK.05 sudah pernah dibuat untuk peserta ini.",
        data: {
          id_fr_ak05: existing.id_fr_ak05
        }
      });
    }

    const profileAsesor = await ProfileAsesor.findByPk(
      id_asesor,
      { transaction }
    );

    const signature =
      ttd_asesor ||
      profileAsesor?.ttd_path ||
      "";

    if (!signature) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanda tangan asesor belum tersedia."
      });
    }

    const data = await FrAk05.create(
      {
        id_jadwal: Number(id_jadwal),
        id_peserta: Number(id_peserta),
        id_asesor,
        rekomendasi,
        keterangan:
          keterangan !== undefined && keterangan !== null
            ? String(keterangan).trim() || null
            : null,
        aspek_positif_negatif:
          aspek_positif_negatif !== undefined &&
          aspek_positif_negatif !== null
            ? String(aspek_positif_negatif).trim() || null
            : null,
        penolakan_hasil:
          penolakan_hasil !== undefined &&
          penolakan_hasil !== null
            ? String(penolakan_hasil).trim() || null
            : null,
        saran_perbaikan:
          saran_perbaikan !== undefined &&
          saran_perbaikan !== null
            ? String(saran_perbaikan).trim() || null
            : null,
        catatan:
          catatan !== undefined && catatan !== null
            ? String(catatan).trim() || null
            : null,
        ttd_asesor: signature
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "FR.AK.05 berhasil disimpan.",
      data: {
        id_fr_ak05: data.id_fr_ak05,
        id_jadwal: data.id_jadwal,
        id_peserta: data.id_peserta,
        id_asesor: data.id_asesor,
        rekomendasi: data.rekomendasi,
        keterangan: data.keterangan,
        aspek_positif_negatif: data.aspek_positif_negatif,
        penolakan_hasil: data.penolakan_hasil,
        saran_perbaikan: data.saran_perbaikan,
        catatan: data.catatan,
        ttd_asesor: data.ttd_asesor,
        created_at: data.created_at
      }
    });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("SUBMIT FR.AK.05 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const updateFrAk05 = async (req, res) => {
  try {
    const { id_fr_ak05 } = req.params;
    const id_asesor = Number(req.user.id_user);

    if (!id_fr_ak05) {
      return res.status(400).json({
        success: false,
        message: "ID FR.AK.05 wajib diisi."
      });
    }

    const {
      rekomendasi,
      keterangan,
      aspek_positif_negatif,
      penolakan_hasil,
      saran_perbaikan,
      catatan,
      ttd_asesor
    } = req.body;

    if (
      rekomendasi !== undefined &&
      !["kompeten", "belum_kompeten"].includes(rekomendasi)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rekomendasi tidak valid."
      });
    }

    const data = await FrAk05.findOne({
      where: {
        id_fr_ak05: Number(id_fr_ak05),
        id_asesor
      }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.05 tidak ditemukan."
      });
    }

    const profileAsesor = await ProfileAsesor.findByPk(id_asesor);

    await data.update({
      rekomendasi:
        rekomendasi !== undefined
          ? rekomendasi
          : data.rekomendasi,
      keterangan:
        keterangan !== undefined
          ? String(keterangan).trim() || null
          : data.keterangan,
      aspek_positif_negatif:
        aspek_positif_negatif !== undefined
          ? String(aspek_positif_negatif).trim() || null
          : data.aspek_positif_negatif,
      penolakan_hasil:
        penolakan_hasil !== undefined
          ? String(penolakan_hasil).trim() || null
          : data.penolakan_hasil,
      saran_perbaikan:
        saran_perbaikan !== undefined
          ? String(saran_perbaikan).trim() || null
          : data.saran_perbaikan,
      catatan:
        catatan !== undefined
          ? String(catatan).trim() || null
          : data.catatan,
      ttd_asesor:
        ttd_asesor ||
        data.ttd_asesor ||
        profileAsesor?.ttd_path ||
        ""
    });

    await data.reload();

    return res.status(200).json({
      success: true,
      message: "FR.AK.05 berhasil diperbarui.",
      data: {
        id_fr_ak05: data.id_fr_ak05,
        id_jadwal: data.id_jadwal,
        id_peserta: data.id_peserta,
        id_asesor: data.id_asesor,
        rekomendasi: data.rekomendasi,
        keterangan: data.keterangan,
        aspek_positif_negatif: data.aspek_positif_negatif,
        penolakan_hasil: data.penolakan_hasil,
        saran_perbaikan: data.saran_perbaikan,
        catatan: data.catatan,
        ttd_asesor: data.ttd_asesor,
        created_at: data.created_at
      }
    });
  } catch (err) {
    console.error("UPDATE FR.AK.05 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getFrAk05 = async (req, res) => {
  try {
    const id_asesor = Number(req.user.id_user);
    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      include: [
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          required: false
        },
        {
          model: User,
          as: "user",
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

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan pada jadwal ini."
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke jadwal ini."
      });
    }

    const jadwal =
      peserta.jadwal ||
      await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan."
      });
    }

    const skema =
      jadwal.skema ||
      await Skema.findByPk(jadwal.id_skema);

    const tuk =
      jadwal.tuk ||
      await Tuk.findByPk(jadwal.id_tuk);

    const user =
      peserta.user ||
      await User.findByPk(peserta.id_user);

    const profileAsesor =
      await ProfileAsesor.findByPk(id_asesor);

    const existing = await FrAk05.findOne({
      where: {
        id_jadwal,
        id_peserta,
        id_asesor
      }
    });

    const profileAsesi =
      peserta.profileAsesi || {};

    if (!existing) {
      return res.status(200).json({
        success: true,
        message: "FR.AK.05 belum dibuat.",
        data: {
          id_fr_ak05: null,
          id_jadwal: Number(id_jadwal),
          id_peserta: Number(id_peserta),
          id_asesor,
          exists: false,
          skema:
            skema?.toJSON?.() ||
            skema ||
            {},
          tuk:
            tuk?.toJSON?.() ||
            tuk ||
            {},
          jadwal:
            jadwal?.toJSON?.() ||
            jadwal ||
            {},
          asesi: {
            ...(profileAsesi?.toJSON?.() || profileAsesi || {}),
            nama_lengkap:
              profileAsesi?.nama_lengkap ||
              user?.nama_lengkap ||
              user?.nama ||
              user?.username ||
              "-",
            ttd_path:
              profileAsesi?.ttd_path ||
              ""
          },
          asesor: {
            ...(profileAsesor?.toJSON?.() || profileAsesor || {}),
            nama_lengkap:
              profileAsesor?.nama_lengkap ||
              "",
            no_reg_asesor:
              profileAsesor?.no_reg_asesor ||
              "",
            ttd_path:
              profileAsesor?.ttd_path ||
              ""
          },
          tanggal:
            getTanggalJadwal(jadwal) ||
            ""
        }
      });
    }

    const plain =
      existing.toJSON
        ? existing.toJSON()
        : existing;

    return res.status(200).json({
      success: true,
      data: {
        ...plain,
        id_fr_ak05:
          plain.id_fr_ak05 ||
          null,
        id_jadwal:
          plain.id_jadwal ||
          Number(id_jadwal),
        id_peserta:
          plain.id_peserta ||
          Number(id_peserta),
        id_asesor:
          plain.id_asesor ||
          id_asesor,
        exists: true,
        skema:
          skema?.toJSON?.() ||
          skema ||
          {},
        tuk:
          tuk?.toJSON?.() ||
          tuk ||
          {},
        jadwal:
          jadwal?.toJSON?.() ||
          jadwal ||
          {},
        asesi: {
          ...(profileAsesi?.toJSON?.() || profileAsesi || {}),
          nama_lengkap:
            profileAsesi?.nama_lengkap ||
            user?.nama_lengkap ||
            user?.nama ||
            user?.username ||
            "-",
          ttd_path:
            profileAsesi?.ttd_path ||
            ""
        },
        asesor: {
          ...(
            profileAsesor?.toJSON?.() ||
            profileAsesor ||
            {}
          ),
          nama_lengkap:
            profileAsesor?.nama_lengkap ||
            "",
          no_reg_asesor:
            profileAsesor?.no_reg_asesor ||
            "",
          ttd_path:
            profileAsesor?.ttd_path ||
            ""
        },
        tanggal:
          plain.created_at ||
          getTanggalJadwal(jadwal) ||
          ""
      }
    });
  } catch (err) {
    console.error("GET FR.AK.05 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const listFrAk05 = async (req, res) => {
  try {
    const id_asesor = Number(req.user.id_user);
    const { id_jadwal } = req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    const data = await FrAk05.findAll({
      where: {
        id_jadwal,
        id_asesor
      },
      order: [
        ["created_at", "DESC"]
      ]
    });

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error("LIST FR.AK.05 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const downloadPdfFrAk05 = async (req, res) => {
  try {
    const { id_fr_ak05 } = req.params;
    const id_asesor = Number(req.user.id_user);

    const data = await FrAk05.findOne({
      where: {
        id_fr_ak05: Number(id_fr_ak05),
        id_asesor
      }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.05 tidak ditemukan."
      });
    }

    const [
      peserta,
      asesor,
      jadwal
    ] = await Promise.all([
      PesertaJadwal.findOne({
        where: {
          id_peserta: data.id_peserta,
          id_jadwal: data.id_jadwal
        },
        include: [
          {
            model: ProfileAsesi,
            as: "profileAsesi",
            required: false
          },
          {
            model: User,
            as: "user",
            required: false
          }
        ]
      }),
      ProfileAsesor.findByPk(data.id_asesor),
      Jadwal.findByPk(data.id_jadwal)
    ]);

    const skema =
      jadwal
        ? await Skema.findByPk(jadwal.id_skema)
        : null;

    const tuk =
      jadwal
        ? await Tuk.findByPk(jadwal.id_tuk)
        : null;

    const doc = new PDFDocument({
      size: "A4",
      margin: 40
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK05-${data.id_fr_ak05}.pdf`
    );

    doc.pipe(res);

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(
        "FR.AK.05. LAPORAN ASESMEN",
        { align: "center" }
      );

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Judul Skema : ${skema?.judul_skema || "-"}`
      )
      .text(
        `Kode Skema : ${skema?.kode_skema || "-"}`
      )
      .text(
        `TUK : ${tuk?.nama_tuk || "-"}`
      )
      .text(
        `Nama Asesor : ${getNamaAsesor(asesor)}`
      )
      .text(
        `No. Registrasi : ${asesor?.no_reg_asesor || "-"}`
      )
      .text(
        `Tanggal : ${
          data.created_at
            ? new Date(data.created_at).toLocaleDateString("id-ID")
            : "-"
        }`
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Hasil Asesmen");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Nama Asesi : ${getNamaAsesi(
          peserta?.profileAsesi,
          peserta?.user
        )}`
      )
      .text(
        `Rekomendasi : ${
          data.rekomendasi === "kompeten"
            ? "[X] Kompeten    [ ] Belum Kompeten"
            : "[ ] Kompeten    [X] Belum Kompeten"
        }`
      )
      .text(
        `Keterangan : ${data.keterangan || "-"}`
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Aspek Positif dan Negatif dalam Asesmen");

    doc
      .font("Helvetica")
      .text(
        data.aspek_positif_negatif || "-"
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Pencatatan Penolakan Hasil Asesmen");

    doc
      .font("Helvetica")
      .text(
        data.penolakan_hasil || "-"
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Saran Perbaikan");

    doc
      .font("Helvetica")
      .text(
        data.saran_perbaikan || "-"
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Catatan");

    doc
      .font("Helvetica")
      .text(
        data.catatan || "-"
      );

    doc.moveDown(2);

    doc
      .font("Helvetica-Bold")
      .text("Asesor");

    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .text(
        `Nama : ${getNamaAsesor(asesor)}`
      )
      .text(
        `No. Registrasi : ${
          asesor?.no_reg_asesor || "-"
        }`
      );

    doc.moveDown();

    if (
      data.ttd_asesor &&
      !String(data.ttd_asesor).startsWith("data:image")
    ) {
      let filePath = String(
        data.ttd_asesor
      );

      if (
        !path.isAbsolute(filePath)
      ) {
        filePath = path.join(
          process.cwd(),
          filePath.replace(/^[/\\]+/, "")
        );
      }

      if (fs.existsSync(filePath)) {
        doc.image(
          filePath,
          {
            width: 120
          }
        );
        doc.moveDown();
      }
    }

    doc.text(
      `Tanggal : ${
        data.created_at
          ? new Date(data.created_at).toLocaleDateString("id-ID")
          : "-"
      }`
    );

    doc.end();
  } catch (err) {
    console.error(
      "DOWNLOAD PDF FR.AK.05 ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  submitFrAk05,
  updateFrAk05,
  getFrAk05,
  listFrAk05,
  downloadPdfFrAk05
};