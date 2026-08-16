const {
  FrAk07,
  FrAk07DetailA,
  FrAk07DetailB,
  FrAk07Hasil,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor,
  PresensiAsesor
} = require("../../models");

const sequelize = require("../../config/database");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getFrAk07 = async (req, res) => {
  try {
    const { id, id_jadwal, id_asesi } = req.query;
    const id_asesor = Number(req.user.id_user);

    if (!id && (!id_jadwal || !id_asesi)) {
      return res.status(400).json({
        message: "id atau id_jadwal dan id_asesi wajib diisi"
      });
    }

    let frAk07 = null;

    if (id) {
      frAk07 = await FrAk07.findOne({
        where: {
          id_fr_ak07: id,
          id_asesor
        }
      });
    } else {
      const tugas = await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor,
          status: "aktif"
        }
      });

      if (!tugas) {
        return res.status(403).json({
          message: "Anda bukan asesor pada jadwal ini."
        });
      }

      const peserta = await PesertaJadwal.findOne({
        where: {
          id_peserta: id_asesi,
          id_jadwal
        }
      });

      if (!peserta) {
        return res.status(404).json({
          message: "Peserta tidak ditemukan."
        });
      }

      frAk07 = await FrAk07.findOne({
        where: {
          id_jadwal,
          id_asesi: peserta.id_user,
          id_asesor
        }
      });
    }

    if (frAk07) {
      const [
        detailsA,
        detailsB,
        results,
        peserta,
        jadwal,
        asesor
      ] = await Promise.all([
        FrAk07DetailA.findAll({
          where: {
            id_fr_ak07: frAk07.id_fr_ak07
          },
          order: [
            ["nomor", "ASC"]
          ]
        }),
        FrAk07DetailB.findAll({
          where: {
            id_fr_ak07: frAk07.id_fr_ak07
          },
          order: [
            ["nomor", "ASC"]
          ]
        }),
        FrAk07Hasil.findAll({
            where: {
                id_fr_ak07: frAk07.id_fr_ak07
            },
            order: [["id", "ASC"]]
        }),
        PesertaJadwal.findOne({
          where: {
            id_jadwal: frAk07.id_jadwal,
            id_user: frAk07.id_asesi
          }
        }),
        Jadwal.findByPk(frAk07.id_jadwal),
        ProfileAsesor.findByPk(frAk07.id_asesor, {
          attributes: [
            "id_user",
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
          ]
        })
      ]);

      if (!peserta) {
        return res.status(404).json({
          message: "Data peserta pada FR.AK.07 tidak ditemukan."
        });
      }

      const [
        profileAsesi,
        skema,
        tuk
      ] = await Promise.all([
        peserta.id_user
          ? ProfileAsesi.findByPk(
              peserta.id_user,
              {
                attributes: [
                  "id_user",
                  "nama_lengkap",
                  "ttd_path"
                ]
              }
            )
          : null,
        jadwal?.id_skema
          ? Skema.findByPk(
              jadwal.id_skema,
              {
                attributes: [
                  "id_skema",
                  "kode_skema",
                  "judul_skema",
                  "jenis_skema"
                ]
              }
            )
          : null,
        jadwal?.id_tuk
          ? Tuk.findByPk(
              jadwal.id_tuk,
              {
                attributes: [
                  "id_tuk",
                  "nama_tuk",
                  "jenis_tuk"
                ]
              }
            )
          : null
      ]);

      const plain = frAk07.toJSON
        ? frAk07.toJSON()
        : frAk07;

      return res.status(200).json({
        message: "Berhasil mengambil data FR.AK.07",
        data: {
          ...plain,
          exists: true,
          id_fr_ak07: frAk07.id_fr_ak07,
          id_jadwal: frAk07.id_jadwal,
          id_asesor: frAk07.id_asesor,
          id_asesi: frAk07.id_asesi,
          id_peserta: peserta.id_peserta,
          potensi_asesi: frAk07.potensi_asesi,
          ttd_asesor:
            frAk07.ttd_asesor ||
            asesor?.ttd_path ||
            "",
          detailsA,
          detailsB,
          results,
          jadwal: jadwal?.toJSON
            ? jadwal.toJSON()
            : jadwal || {},
          skema: skema?.toJSON
            ? skema.toJSON()
            : skema || {},
          tuk: tuk?.toJSON
            ? tuk.toJSON()
            : tuk || {},
          asesi: {
            ...(profileAsesi?.toJSON
              ? profileAsesi.toJSON()
              : profileAsesi || {}),
            id_peserta: peserta.id_peserta,
            id_user: peserta.id_user,
            nama_lengkap:
              profileAsesi?.nama_lengkap ||
              "-",
            ttd_path:
              profileAsesi?.ttd_path ||
              ""
          },
          asesor: {
            ...(asesor?.toJSON
              ? asesor.toJSON()
              : asesor || {}),
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
          tanggal:
            jadwal?.tgl_awal ||
            ""
        }
      });
    }

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda bukan asesor pada jadwal ini."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta: id_asesi
      }
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan."
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan."
      });
    }

    const [
      profileAsesi,
      asesor,
      skema,
      tuk
    ] = await Promise.all([
      peserta.id_user
        ? ProfileAsesi.findByPk(
            peserta.id_user,
            {
              attributes: [
                "id_user",
                "nama_lengkap",
                "ttd_path"
              ]
            }
          )
        : null,
      ProfileAsesor.findByPk(
        id_asesor,
        {
          attributes: [
            "id_user",
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
          ]
        }
      ),
      jadwal.id_skema
        ? Skema.findByPk(
            jadwal.id_skema,
            {
              attributes: [
                "id_skema",
                "kode_skema",
                "judul_skema",
                "jenis_skema"
              ]
            }
          )
        : null,
      jadwal.id_tuk
        ? Tuk.findByPk(
            jadwal.id_tuk,
            {
              attributes: [
                "id_tuk",
                "nama_tuk",
                "jenis_tuk"
              ]
            }
          )
        : null
    ]);

    return res.status(200).json({
      message: "Data awal FR.AK.07 berhasil diambil",
      data: {
        id_fr_ak07: null,
        id_jadwal: Number(id_jadwal),
        id_asesi: Number(peserta.id_user),
        id_peserta: Number(peserta.id_peserta),
        id_asesor,
        exists: false,
        potensi_asesi: [],
        ttd_asesor:
          asesor?.ttd_path ||
          "",
        detailsA: [],
        detailsB: [],
        results: [],
        jadwal:
          jadwal?.toJSON
            ? jadwal.toJSON()
            : jadwal || {},
        skema:
          skema?.toJSON
            ? skema.toJSON()
            : skema || {},
        tuk:
          tuk?.toJSON
            ? tuk.toJSON()
            : tuk || {},
        asesi: {
          ...(profileAsesi?.toJSON
            ? profileAsesi.toJSON()
            : profileAsesi || {}),
          id_peserta:
            peserta.id_peserta,
          id_user:
            peserta.id_user,
          nama_lengkap:
            profileAsesi?.nama_lengkap ||
            "-",
          ttd_path:
            profileAsesi?.ttd_path ||
            ""
        },
        asesor: {
          ...(asesor?.toJSON
            ? asesor.toJSON()
            : asesor || {}),
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
        tanggal:
          jadwal?.tgl_awal ||
          ""
      }
    });
  } catch (error) {
    console.error("GET FR.AK.07 ERROR :", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

const submitFrAk07 = async (req, res) => {
  let t;

  try {
    t = await sequelize.transaction();

    const id_asesor = Number(req.user.id_user);

    const {
      id_jadwal,
      id_asesi,
      potensi_asesi,
      ttd_asesor,
      detailsA = [],
      detailsB = [],
      results = []
    } = req.body;

    if (!id_jadwal || !id_asesi) {
      await t.rollback();

      return res.status(400).json({
        message: "id_jadwal dan id_asesi wajib diisi"
      });
    }

    if (!ttd_asesor) {
      await t.rollback();

      return res.status(400).json({
        message: "Tanda tangan asesor wajib diisi"
      });
    }

    if (!Array.isArray(detailsA) || detailsA.length === 0) {
      await t.rollback();

      return res.status(400).json({
        message: "Detail A wajib tersedia"
      });
    }

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor
      },
      transaction: t
    });

    if (!presensi) {
      await t.rollback();

      return res.status(403).json({
        message: "Asesor belum melakukan presensi."
      });
    }

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      },
      transaction: t
    });

    if (!tugas) {
      await t.rollback();

      return res.status(403).json({
        message: "Anda bukan asesor pada jadwal ini."
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta: Number(id_asesi),
        id_jadwal: Number(id_jadwal)
      },
      transaction: t
    });

    if (!peserta) {
      await t.rollback();

      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal ini."
      });
    }

    if (!peserta.id_user) {
      await t.rollback();

      return res.status(400).json({
        message: "Peserta belum memiliki id_user."
      });
    }

    const profileAsesi = await ProfileAsesi.findByPk(
      peserta.id_user,
      {
        transaction: t
      }
    );

    if (!profileAsesi) {
      await t.rollback();

      return res.status(404).json({
        message: "Profile asesi tidak ditemukan."
      });
    }

    const existing = await FrAk07.findOne({
      where: {
        id_jadwal: Number(id_jadwal),
        id_asesi: Number(peserta.id_user),
        id_asesor
      },
      transaction: t
    });

    if (existing) {
      await t.rollback();

      return res.status(400).json({
        message: "FR.AK.07 sudah pernah dibuat."
      });
    }

    const frAk07 = await FrAk07.create(
      {
        id_jadwal: Number(id_jadwal),
        id_asesor,
        id_asesi: Number(peserta.id_user),
        potensi_asesi:
          Array.isArray(potensi_asesi)
            ? JSON.stringify(potensi_asesi)
            : potensi_asesi || "[]",
        ttd_asesor
      },
      {
        transaction: t
      }
    );

    for (const item of detailsA) {
      await FrAk07DetailA.create(
        {
          id_fr_ak07: frAk07.id_fr_ak07,
          nomor: item.nomor,
          aspek: item.aspek,
          butuh_penyesuaian:
            item.butuh_penyesuaian ||
            null,
          keterangan:
            Array.isArray(item.keterangan)
              ? JSON.stringify(item.keterangan)
              : item.keterangan ||
                null
        },
        {
          transaction: t
        }
      );
    }

    for (const item of detailsB) {
      await FrAk07DetailB.create(
        {
          id_fr_ak07: frAk07.id_fr_ak07,
          nomor: item.nomor,
          pertanyaan: item.pertanyaan,
          jawaban:
            item.jawaban ||
            null,
          standar_industri:
            item.standar_industri ||
            null,
          sop:
            item.sop ||
            null,
          regulasi_teknik:
            item.regulasi_teknik ||
            null,
          metode_asesmen:
            item.metode_asesmen ||
            null,
          instrumen_asesmen:
            item.instrumen_asesmen ||
            null
        },
        {
          transaction: t
        }
      );
    }

    for (const item of results) {
      await FrAk07Hasil.create(
        {
          id_fr_ak07:
            frAk07.id_fr_ak07,
          bagian:
            item.bagian,
          acuan_pembanding:
            item.acuan_pembanding ||
            null,
          metode_asesmen:
            item.metode_asesmen ||
            null,
          instrumen_asesmen:
            item.instrumen_asesmen ||
            null
        },
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return res.status(201).json({
      message: "FR.AK.07 berhasil disimpan",
      data: {
        id_fr_ak07:
          frAk07.id_fr_ak07,
        id_jadwal:
          frAk07.id_jadwal,
        id_asesi:
          frAk07.id_asesi,
        id_peserta:
          peserta.id_peserta,
        id_asesor:
          frAk07.id_asesor
      }
    });
  } catch (error) {
    if (t) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK FR.AK.07 ERROR :",
          rollbackError
        );
      }
    }

    console.error(
      "SUBMIT FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};

const updateFrAk07 = async (req, res) => {
  let t;

  try {
    t = await sequelize.transaction();

    const { id } = req.params;
    const id_asesor =
      Number(req.user.id_user);

    const {
      potensi_asesi,
      ttd_asesor,
      detailsA = [],
      detailsB = [],
      results = []
    } = req.body;

    const frAk07 =
      await FrAk07.findOne({
        where: {
          id_fr_ak07: id,
          id_asesor
        },
        transaction: t
      });

    if (!frAk07) {
      await t.rollback();

      return res.status(404).json({
        message:
          "FR.AK.07 tidak ditemukan"
      });
    }

    await frAk07.update(
      {
        potensi_asesi:
          Array.isArray(potensi_asesi)
            ? JSON.stringify(
                potensi_asesi
              )
            : potensi_asesi ||
              "[]",
        ttd_asesor:
          ttd_asesor ||
          frAk07.ttd_asesor
      },
      {
        transaction: t
      }
    );

    await FrAk07DetailA.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    await FrAk07DetailB.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    await FrAk07Hasil.destroy({
      where: {
        id_fr_ak07: id
      },
      transaction: t
    });

    for (const item of detailsA) {
      await FrAk07DetailA.create(
        {
          id_fr_ak07: id,
          nomor: item.nomor,
          aspek: item.aspek,
          butuh_penyesuaian:
            item.butuh_penyesuaian ||
            null,
          keterangan:
            Array.isArray(item.keterangan)
              ? JSON.stringify(
                  item.keterangan
                )
              : item.keterangan ||
                null
        },
        {
          transaction: t
        }
      );
    }

    for (const item of detailsB) {
      await FrAk07DetailB.create(
        {
          id_fr_ak07: id,
          nomor: item.nomor,
          pertanyaan: item.pertanyaan,
          jawaban:
            item.jawaban ||
            null,
          standar_industri:
            item.standar_industri ||
            null,
          sop:
            item.sop ||
            null,
          regulasi_teknik:
            item.regulasi_teknik ||
            null,
          metode_asesmen:
            item.metode_asesmen ||
            null,
          instrumen_asesmen:
            item.instrumen_asesmen ||
            null
        },
        {
          transaction: t
        }
      );
    }

    for (const item of results) {
      await FrAk07Hasil.create(
        {
          id_fr_ak07: id,
          bagian:
            item.bagian,
          acuan_pembanding:
            item.acuan_pembanding ||
            null,
          metode_asesmen:
            item.metode_asesmen ||
            null,
          instrumen_asesmen:
            item.instrumen_asesmen ||
            null
        },
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return res.status(200).json({
      message:
        "FR.AK.07 berhasil diperbarui",
      data: {
        id_fr_ak07:
          frAk07.id_fr_ak07,
        id_jadwal:
          frAk07.id_jadwal,
        id_asesi:
          frAk07.id_asesi,
        id_asesor:
          frAk07.id_asesor
      }
    });
  } catch (error) {
    if (t) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK UPDATE FR.AK.07 ERROR :",
          rollbackError
        );
      }
    }

    console.error(
      "UPDATE FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};

const listFrAk07 = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.params;

    const id_asesor =
      Number(req.user.id_user);

    if (!id_jadwal) {
      return res.status(400).json({
        message:
          "id_jadwal wajib diisi"
      });
    }

    const data =
      await FrAk07.findAll({
        where: {
          id_jadwal,
          id_asesor
        },
        order: [
          [
            "id_fr_ak07",
            "DESC"
          ]
        ]
      });

    return res.status(200).json({
      total: data.length,
      data
    });
  } catch (error) {
    console.error(
      "LIST FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};

const downloadPdfFrAk07 = async (
  req,
  res
) => {
  try {
    const {
      id
    } = req.params;

    const id_asesor =
      Number(req.user.id_user);

    const data =
      await FrAk07.findOne({
        where: {
          id_fr_ak07: id,
          id_asesor
        }
      });

    if (!data) {
      return res.status(404).json({
        message:
          "FR.AK.07 tidak ditemukan"
      });
    }

    const [
      peserta,
      jadwal,
      asesor,
      detailsA,
      detailsB,
      results
    ] = await Promise.all([
      PesertaJadwal.findOne({
        where: {
          id_jadwal:
            data.id_jadwal,
          id_user:
            data.id_asesi
        }
      }),
      Jadwal.findByPk(
        data.id_jadwal
      ),
      ProfileAsesor.findByPk(
        data.id_asesor,
        {
          attributes: [
            "nama_lengkap",
            "no_reg_asesor",
            "ttd_path"
          ]
        }
      ),
      FrAk07DetailA.findAll({
        where: {
          id_fr_ak07:
            data.id_fr_ak07
        },
        order: [
          ["nomor", "ASC"]
        ]
      }),
      FrAk07DetailB.findAll({
        where: {
          id_fr_ak07:
            data.id_fr_ak07
        },
        order: [
          ["nomor", "ASC"]
        ]
      }),
      FrAk07Hasil.findAll({
        where: {
          id_fr_ak07:
            data.id_fr_ak07
        },
        order: [
          [
            "id_fr_ak07_hasil",
            "ASC"
          ]
        ]
      })
    ]);

    const [
      profileAsesi,
      skema,
      tuk
    ] = await Promise.all([
      peserta?.id_user
        ? ProfileAsesi.findByPk(
            peserta.id_user,
            {
              attributes: [
                "nama_lengkap",
                "ttd_path"
              ]
            }
          )
        : null,
      jadwal?.id_skema
        ? Skema.findByPk(
            jadwal.id_skema,
            {
              attributes: [
                "kode_skema",
                "judul_skema"
              ]
            }
          )
        : null,
      jadwal?.id_tuk
        ? Tuk.findByPk(
            jadwal.id_tuk,
            {
              attributes: [
                "nama_tuk"
              ]
            }
          )
        : null
    ]);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR_AK07_${data.id_fr_ak07}.pdf`
    );

    const doc =
      new PDFDocument({
        margin: 40,
        size: "A4"
      });

    doc.pipe(res);

    doc
      .fontSize(16)
      .text(
        "FR.AK.07",
        {
          align: "center"
        }
      );

    doc
      .fontSize(13)
      .text(
        "PENINJAUAN PROSES ASESMEN",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc.fontSize(10);

    doc.text(
      `Nama Asesi : ${
        profileAsesi?.nama_lengkap ||
        "-"
      }`
    );

    doc.text(
      `Nama Asesor : ${
        asesor?.nama_lengkap ||
        "-"
      }`
    );

    doc.text(
      `No. Registrasi Asesor : ${
        asesor?.no_reg_asesor ||
        "-"
      }`
    );

    doc.text(
      `Skema : ${
        skema?.judul_skema ||
        "-"
      }`
    );

    doc.text(
      `Kode Skema : ${
        skema?.kode_skema ||
        "-"
      }`
    );

    doc.text(
      `TUK : ${
        tuk?.nama_tuk ||
        "-"
      }`
    );

    doc.text(
      `Tanggal : ${
        jadwal?.tgl_awal
          ? new Date(
              jadwal.tgl_awal
            ).toLocaleDateString(
              "id-ID"
            )
          : "-"
      }`
    );

    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        "Potensi Asesi"
      );

    doc.moveDown(0.3);

    let potensi =
      data.potensi_asesi ||
      "";

    try {
      const parsed =
        JSON.parse(
          potensi
        );

      if (
        Array.isArray(
          parsed
        )
      ) {
        potensi =
          parsed.join(
            ", "
          );
      }
    } catch (error) {}

    doc
      .fontSize(10)
      .text(
        potensi ||
        "-"
      );

    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        "Bagian A"
      );

    doc.moveDown(0.3);

    detailsA.forEach(
      (item) => {
        let keterangan =
          item.keterangan ||
          "";

        try {
          const parsed =
            JSON.parse(
              keterangan
            );

          if (
            Array.isArray(
              parsed
            )
          ) {
            keterangan =
              parsed.join(
                ", "
              );
          }
        } catch (error) {}

        doc
          .fontSize(10)
          .text(
            `${item.nomor}. ${item.aspek}`
          );

        doc.text(
          `Penyesuaian : ${
            item.butuh_penyesuaian ||
            "-"
          }`
        );

        doc.text(
          `Keterangan : ${
            keterangan ||
            "-"
          }`
        );

        doc.moveDown(
          0.5
        );
      }
    );

    if (
      detailsB.length
    ) {
      doc
        .fontSize(12)
        .text(
          "Bagian B"
        );

      doc.moveDown(
        0.3
      );

      detailsB.forEach(
        (item) => {
          doc
            .fontSize(10)
            .text(
              `${item.nomor}. ${item.pertanyaan}`
            )
            .text(
              `Jawaban : ${
                item.jawaban ||
                "-"
              }`
            )
            .text(
              `Standar Industri : ${
                item.standar_industri ||
                "-"
              }`
            )
            .text(
              `SOP : ${
                item.sop ||
                "-"
              }`
            )
            .text(
              `Regulasi Teknik : ${
                item.regulasi_teknik ||
                "-"
              }`
            )
            .text(
              `Metode Asesmen : ${
                item.metode_asesmen ||
                "-"
              }`
            )
            .text(
              `Instrumen Asesmen : ${
                item.instrumen_asesmen ||
                "-"
              }`
            );

          doc.moveDown(
            0.5
          );
        }
      );
    }

    doc
      .fontSize(12)
      .text(
        "Hasil Penyesuaian"
      );

    doc.moveDown(
      0.3
    );

    results.forEach(
      (item) => {
        doc
          .fontSize(10)
          .text(
            item.bagian ||
            "-"
          )
          .text(
            `Acuan Pembanding : ${
              item.acuan_pembanding ||
              "-"
            }`
          )
          .text(
            `Metode Asesmen : ${
              item.metode_asesmen ||
              "-"
            }`
          )
          .text(
            `Instrumen Asesmen : ${
              item.instrumen_asesmen ||
              "-"
            }`
          );

        doc.moveDown(
          0.5
        );
      }
    );

    doc.moveDown(
      1.5
    );

    doc
      .fontSize(10)
      .text(
        "Tanda Tangan Asesor"
      );

    if (
      asesor?.ttd_path
    ) {
      try {
        const ttdPath =
          String(
            asesor.ttd_path
          ).replace(
            /^\/+/,
            ""
          );

        const absolutePath =
          path.join(
            process.cwd(),
            ttdPath
          );

        if (
          fs.existsSync(
            absolutePath
          )
        ) {
          doc.image(
            absolutePath,
            {
              width: 100
            }
          );
        } else {
          doc.text("-");
        }
      } catch (error) {
        doc.text("-");
      }
    } else {
      doc.text("-");
    }

    doc.moveDown(
      0.3
    );

    doc.text(
      asesor?.nama_lengkap ||
        "-"
    );

    doc.end();
  } catch (error) {
    console.error(
      "DOWNLOAD FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getFrAk07,
  submitFrAk07,
  updateFrAk07,
  listFrAk07,
  downloadPdfFrAk07
};