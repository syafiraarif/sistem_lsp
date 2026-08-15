const {
  FrAk01,
  Jadwal,
  JadwalAsesor,
  PesertaJadwal,
  Skema,
  Tuk,
  User,
  ProfileAsesor,
  ProfileAsesi
} = require("../../models");

const PDFDocument = require("pdfkit");

const getNama = (obj) => {
  return (
    obj?.nama_lengkap ||
    obj?.nama ||
    obj?.username ||
    "-"
  );
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

const getWaktuJadwal = (jadwal) => {
  const mulai =
    jadwal?.waktu_mulai ||
    jadwal?.jam_mulai ||
    jadwal?.start_time ||
    "";

  const selesai =
    jadwal?.waktu_selesai ||
    jadwal?.jam_selesai ||
    jadwal?.end_time ||
    "";

  if (mulai && selesai) {
    return `${mulai} - ${selesai}`;
  }

  return mulai || selesai || "";
};

const toBoolean = (value) => {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "ya" ||
    value === "YA" ||
    value === "yes" ||
    value === "checked"
  );
};

const normalizeWaktu = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const stringValue = String(value).replace(/[^0-9]/g, "");

  if (!stringValue) {
    return null;
  }

  const numberValue = Number(stringValue);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
};

const submitFrAk01 = async (req, res) => {
  try {
    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      id_peserta,
      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      t_lainnya,
      bukti_lainnya,
      waktu,
      persetujuan,
      ttd_asesor
    } = req.body;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan pada jadwal tersebut."
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

    const existing = await FrAk01.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FR.AK.01 sudah tersedia.",
        id_fr_ak01: existing.id_fr_ak01
      });
    }

    const asesor = await ProfileAsesor.findByPk(id_asesor);
    const waktuMenit = normalizeWaktu(waktu);

    const data = await FrAk01.create({
      id_jadwal,
      id_peserta,
      id_asesor,
      bukti_portofolio: Boolean(bukti_portofolio),
      bukti_observasi: Boolean(bukti_observasi),
      bukti_tertulis: Boolean(bukti_tertulis),
      bukti_wawancara: Boolean(bukti_wawancara),
      bukti_review_produk: Boolean(bukti_review_produk),
      bukti_kegiatan_terstruktur: Boolean(bukti_kegiatan_terstruktur),
      bukti_lisan: Boolean(bukti_lisan),
      t_lainnya: Boolean(t_lainnya),
      bukti_lainnya:
        bukti_lainnya &&
        String(bukti_lainnya).trim() !== ""
          ? String(bukti_lainnya).trim()
          : null,
      waktu: waktuMenit,
      persetujuan:
        persetujuan !== undefined
          ? Boolean(persetujuan)
          : true,
      ttd_asesor:
        ttd_asesor ||
        asesor?.ttd_path ||
        null
    });

    return res.status(201).json({
      success: true,
      message: "FR.AK.01 berhasil disimpan.",
      data
    });
  } catch (err) {
    console.error("SUBMIT FR.AK.01 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getFrAk01 = async (req, res) => {
  try {
    const {
      id_jadwal,
      id_peserta
    } = req.query;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal dan ID Peserta wajib diisi."
      });
    }

    const data = await FrAk01.findOne({
      where: {
        id_jadwal,
        id_peserta
      },
      order: [
        ["created_at", "DESC"]
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET FR.AK.01 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const updateFrAk01 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_asesor = req.user.id_user;

    const {
      bukti_portofolio,
      bukti_observasi,
      bukti_tertulis,
      bukti_wawancara,
      bukti_review_produk,
      bukti_kegiatan_terstruktur,
      bukti_lisan,
      t_lainnya,
      bukti_lainnya,
      waktu,
      persetujuan,
      ttd_asesor
    } = req.body;

    const existing = await FrAk01.findByPk(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    const akses = await JadwalAsesor.findOne({
      where: {
        id_jadwal: existing.id_jadwal,
        id_user: id_asesor
      }
    });

    if (!akses) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah FR.AK.01 ini."
      });
    }

    const waktuUpdate =
      waktu !== undefined
        ? normalizeWaktu(waktu)
        : existing.waktu;

    await existing.update({
      bukti_portofolio:
        bukti_portofolio !== undefined
          ? Boolean(bukti_portofolio)
          : existing.bukti_portofolio,

      bukti_observasi:
        bukti_observasi !== undefined
          ? Boolean(bukti_observasi)
          : existing.bukti_observasi,

      bukti_tertulis:
        bukti_tertulis !== undefined
          ? Boolean(bukti_tertulis)
          : existing.bukti_tertulis,

      bukti_wawancara:
        bukti_wawancara !== undefined
          ? Boolean(bukti_wawancara)
          : existing.bukti_wawancara,

      bukti_review_produk:
        bukti_review_produk !== undefined
          ? Boolean(bukti_review_produk)
          : existing.bukti_review_produk,

      bukti_kegiatan_terstruktur:
        bukti_kegiatan_terstruktur !== undefined
          ? Boolean(bukti_kegiatan_terstruktur)
          : existing.bukti_kegiatan_terstruktur,

      bukti_lisan:
        bukti_lisan !== undefined
          ? Boolean(bukti_lisan)
          : existing.bukti_lisan,

      t_lainnya:
        t_lainnya !== undefined
          ? Boolean(t_lainnya)
          : existing.t_lainnya,

      bukti_lainnya:
        bukti_lainnya !== undefined
          ? (
              String(bukti_lainnya).trim() !== ""
                ? String(bukti_lainnya).trim()
                : null
            )
          : existing.bukti_lainnya,

      waktu: waktuUpdate,

      persetujuan:
        persetujuan !== undefined
          ? Boolean(persetujuan)
          : existing.persetujuan,

      ttd_asesor:
        ttd_asesor ||
        existing.ttd_asesor
    });

    await existing.reload();

    return res.json({
      success: true,
      message: "FR.AK.01 berhasil diperbarui.",
      data: existing
    });
  } catch (err) {
    console.error("UPDATE FR.AK.01 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const listFrAk01 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "ID Jadwal wajib diisi."
      });
    }

    const data = await FrAk01.findAll({
      where: {
        id_jadwal
      },
      order: [
        ["created_at", "DESC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error("LIST FR.AK.01 ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const downloadPdfFrAk01 = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await FrAk01.findByPk(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.AK.01 tidak ditemukan."
      });
    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK01-${data.id_fr_ak01}.pdf`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 40
    });

    doc.pipe(res);

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("FR.AK.01", {
        align: "center"
      });

    doc
      .fontSize(14)
      .text(
        "PERSETUJUAN ASESMEN DAN KERAHASIAAN",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(10);

    doc.text(
      `ID Jadwal : ${data.id_jadwal}`
    );

    doc.text(
      `ID Peserta : ${data.id_peserta}`
    );

    doc.text(
      `ID Asesor : ${data.id_asesor}`
    );

    doc.text(
      `Waktu : ${
        data.waktu !== null &&
        data.waktu !== undefined &&
        data.waktu !== ""
          ? `${data.waktu} Menit`
          : "-"
      }`
    );

    doc.moveDown();

    const list = [
      [
        "TL : Verifikasi Portofolio",
        data.bukti_portofolio
      ],
      [
        "TL : Hasil Reviu Produk",
        data.bukti_review_produk
      ],
      [
        "L : Observasi Langsung",
        data.bukti_observasi
      ],
      [
        "L : Hasil Kegiatan Terstruktur",
        data.bukti_kegiatan_terstruktur
      ],
      [
        "T : Daftar Pertanyaan Tulis / Pilihan Ganda",
        data.bukti_tertulis
      ],
      [
        "T : Daftar Pertanyaan Lisan",
        data.bukti_lisan
      ],
      [
        "T : Pertanyaan Wawancara",
        data.bukti_wawancara
      ],
      [
        "T : Lainnya",
        data.t_lainnya
      ]
    ];

    list.forEach((item) => {
      doc.text(
        `${item[1] ? "☑" : "☐"} ${item[0]}`
      );
    });

    doc.moveDown();

    doc.text(
      `Keterangan Lainnya : ${
        data.bukti_lainnya || "-"
      }`
    );

    doc.moveDown();

    doc.text(
      `Persetujuan : ${
        data.persetujuan
          ? "YA"
          : "TIDAK"
      }`
    );

    doc.end();
  } catch (err) {
    console.error(
      "PDF FR.AK.01 ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getFrAk01Asesor = async (
  req,
  res
) => {
  try {
    const {
      id_jadwal,
      id_peserta
    } = req.params;

    const id_asesor =
      req.user.id_user;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        status: "error",
        message:
          "ID jadwal dan ID peserta wajib dikirim."
      });
    }

    const akses =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor
        }
      });

    if (!akses) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses ke jadwal ini."
      });
    }

    const jadwal =
      await Jadwal.findByPk(
        id_jadwal
      );

    if (!jadwal) {
      return res.status(404).json({
        status: "error",
        message:
          "Jadwal tidak ditemukan."
      });
    }

    const peserta =
      await PesertaJadwal.findOne({
        where: {
          id_peserta,
          id_jadwal
        }
      });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message:
          "Peserta tidak ditemukan."
      });
    }

    const [
      skema,
      tuk,
      user,
      profileAsesi,
      asesor
    ] = await Promise.all([
      Skema.findByPk(
        jadwal.id_skema
      ),
      Tuk.findByPk(
        jadwal.id_tuk
      ),
      User.findByPk(
        peserta.id_user
      ),
      ProfileAsesi.findByPk(
        peserta.id_user
      ),
      ProfileAsesor.findByPk(
        id_asesor
      )
    ]);

    const existing =
      await FrAk01.findOne({
        where: {
          id_jadwal,
          id_peserta
        },
        order: [
          ["created_at", "DESC"]
        ]
      });

    const fr = existing
      ? (
          existing.toJSON
            ? existing.toJSON()
            : existing
        )
      : {};

    return res.json({
      status: "success",
      data: {
        id_fr_ak01:
          fr.id_fr_ak01 ||
          null,

        id_jadwal:
          Number(id_jadwal),

        id_peserta:
          Number(id_peserta),

        id_asesor:
          Number(id_asesor),

        exists:
          Boolean(existing),

        tanggal:
          fr.tanggal ||
          fr.tanggal_persetujuan ||
          fr.created_at ||
          getTanggalJadwal(jadwal) ||
          null,

        skema:
          skema?.toJSON?.() ||
          skema ||
          {},

        tuk:
          tuk?.toJSON?.() ||
          tuk ||
          {},

        asesor: {
          ...(asesor?.toJSON?.() ||
            asesor ||
            {}),
          nama_lengkap:
            asesor?.nama_lengkap ||
            "",
          no_reg_asesor:
            asesor?.no_reg_asesor ||
            "",
          ttd_path:
            asesor?.ttd_path ||
            ""
        },

        asesi: {
          ...(profileAsesi?.toJSON?.() ||
            profileAsesi ||
            {}),
          nama_lengkap:
            profileAsesi?.nama_lengkap ||
            user?.nama_lengkap ||
            user?.nama ||
            user?.username ||
            "",
          ttd_path:
            profileAsesi?.ttd_path ||
            "",
          tanggal:
            fr.tanggal_asesi ||
            fr.tanggal ||
            fr.created_at ||
            getTanggalJadwal(jadwal) ||
            null
        },

        jadwal:
          jadwal?.toJSON?.() ||
          jadwal ||
          {},

        bukti: {
          tl_verifikasi_portofolio:
            toBoolean(
              fr.bukti_portofolio
            ),

          tl_hasil_reviu_produk:
            toBoolean(
              fr.bukti_review_produk
            ),

          l_observasi_langsung:
            toBoolean(
              fr.bukti_observasi
            ),

          l_hasil_kegiatan_terstruktur:
            toBoolean(
              fr.bukti_kegiatan_terstruktur
            ),

          t_daftar_pertanyaan_tulis:
            toBoolean(
              fr.bukti_tertulis
            ),

          t_daftar_pertanyaan_lisan:
            toBoolean(
              fr.bukti_lisan
            ),

          t_pertanyaan_wawancara:
            toBoolean(
              fr.bukti_wawancara
            ),

          t_lainnya:
            toBoolean(
              fr.t_lainnya
            ),

          lainnya:
            fr.bukti_lainnya ||
            ""
        },

        pelaksanaan: {
          hari_tanggal:
            fr.hari_tanggal ||
            fr.tanggal_pelaksanaan ||
            fr.tanggal ||
            getTanggalJadwal(jadwal) ||
            null,

          waktu:
            fr.waktu !== undefined &&
            fr.waktu !== null
              ? String(fr.waktu)
              : "",

          tuk:
            fr.tuk_pelaksanaan ||
            tuk?.nama_tuk ||
            ""
        },

        persetujuan:
          fr.persetujuan !== undefined
            ? Boolean(fr.persetujuan)
            : true,

        ttd_asesor:
          fr.ttd_asesor ||
          asesor?.ttd_path ||
          "",

        raw: fr
      }
    });
  } catch (err) {
    console.error(
      "GET FR.AK.01 ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      status: "error",
      message:
        "Terjadi kesalahan server.",
      error: err.message
    });
  }
};

module.exports = {
  submitFrAk01,
  getFrAk01,
  updateFrAk01,
  listFrAk01,
  downloadPdfFrAk01,
  getFrAk01Asesor
};