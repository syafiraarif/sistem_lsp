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

const DEFAULT_ROWS = [
  {
    nomor: "1",
    aspek: "Keterbatasan asesi terhadap persyaratan bahasa, literasi, numerasi.",
    options: [
      "Memerlukan dukungan pembaca, penerjemah, pelayan, penulis, untuk merekam jawaban asesi.",
      "Melakukan asesmen verbal (gunakan pertanyaan lisan/pertanyaan wawancara) dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan hasil produksi.",
      "Menggunakan ceklis observasi/demonstrasi.",
      "Menggunakan daftar instruksi terstruktur.",
      ""
    ]
  },
  {
    nomor: "2",
    aspek: "Penyediaan dukungan pembaca, penerjemah, pelayan, penulis.",
    options: [
      "Menggunakan pertanyaan lisan dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan pertanyaan wawancara dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      ""
    ]
  },
  {
    nomor: "3",
    aspek: "Penggunaan teknologi adaptif atau peralatan khusus. (Tidak dapat menggunakan teknologi adaptif)",
    options: [
      "Ceklis observasi/demonstrasi.",
      "Pertanyaan lisan.",
      "Pertanyaan tertulis.",
      "Pertanyaan wawancara.",
      "Daftar instruksi terstruktur.",
      "Menggunakan ceklis verifikasi portofolio.",
      "Menggunakan dukungan operator komputer.",
      ""
    ]
  },
  {
    nomor: "4",
    aspek: "Pelaksanaan asesmen secara fleksibel karena alasan keletihan atau keperluan pengobatan.",
    options: [
      "Menggunakan juru tulis.",
      "Menggunakan kameramen perekam video/audio.",
      "Memperbolehkan periode waktu yang lebih panjang untuk menyelesaikan tugas pekerjaan dalam asesmen.",
      "Melakukan tugas pekerjaan dalam asesmen dengan waktu lebih pendek.",
      "Menggunakan instruksi-instruksi spesifik pada proyek yang dapat dilakukan pada berbagai tingkatan.",
      ""
    ]
  },
  {
    nomor: "5",
    aspek: "Penyediaan peralatan asesmen berupa braille, audio/video-tape.",
    options: [
      "Menggunakan pertanyaan lisan.",
      "Menggunakan pertanyaan wawancara.",
      ""
    ]
  },
  {
    nomor: "6",
    aspek: "Penyediaan tempat fisik/lingkungan asesmen",
    options: [
      "Pertanyaan lisan.",
      "Pertanyaan tulis.",
      "Pertanyaan wawancara.",
      "Ceklis verifikasi portofolio.",
      "Ceklis reviu produk.",
      "Daftar instruksi terstruktur.",
      ""
    ]
  },
  {
    nomor: "7",
    aspek: "Pertimbangan umur/usia lanjut/gender asesi. (Adanya perbedaan usia dengan asesor yang lebih muda).",
    options: [
      "Menggunakan studi kasus/daftar instruksi terstruktur.",
      "Menggunakan instrumen asesmen dengan huruf normal, jangan terlalu kecil.",
      "Menggunakan asesor dengan jenis kelamin yang sama dengan asesi.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda jenis kelamin (tidak boleh memberi tanda tambahan pada instrumen asesmen yang digunakan dengan tujuan untuk membedakan jenis kelamin).",
      ""
    ]
  },
  {
    nomor: "8",
    aspek: "Pertimbangan budaya/tradisi/agama.",
    options: [
      "Menggunakan studi kasus daftar instruksi terstruktur.",
      "Menggunakan asesor tanpa pertimbangan budaya/tradisi/agama.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda budaya/tradisi/agama.",
      ""
    ]
  }
];

const POTENSI_OPTIONS = [
  "Hasil pelatihan dan / atau pendidikan, dimana Kurikulum dan fasilitas praktik mampu telusur terhadap standar kompetensi.",
  "Hasil pelatihan dan / atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
  "Pelatihan / belajar mandiri atau otodidak."
];

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
          order: [["nomor", "ASC"]]
        }),
        FrAk07DetailB.findAll({
          where: {
            id_fr_ak07: frAk07.id_fr_ak07
          },
          order: [["nomor", "ASC"]]
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

      const [profileAsesi, skema, tuk] =
        await Promise.all([
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

      const plain =
        frAk07.toJSON
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

    const idAsesiNumber = Number(id_asesi);

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal: Number(id_jadwal),
        id_peserta: idAsesiNumber
      }
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan."
      });
    }

    const jadwal = await Jadwal.findByPk(
      Number(id_jadwal)
    );

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
    console.error(
      "GET FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};

const submitFrAk07 = async (
  req,
  res
) => {
  let t;

  try {
    t = await sequelize.transaction();

    const id_asesor =
      Number(req.user.id_user);

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
        message:
          "id_jadwal dan id_asesi wajib diisi"
      });
    }

    if (!ttd_asesor) {
      await t.rollback();

      return res.status(400).json({
        message:
          "Tanda tangan asesor wajib diisi"
      });
    }

    if (
      !Array.isArray(detailsA) ||
      detailsA.length === 0
    ) {
      await t.rollback();

      return res.status(400).json({
        message:
          "Detail A wajib tersedia"
      });
    }

    const presensi =
      await PresensiAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor
        },
        transaction: t
      });

    if (!presensi) {
      await t.rollback();

      return res.status(403).json({
        message:
          "Asesor belum melakukan presensi."
      });
    }

    const tugas =
      await JadwalAsesor.findOne({
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
        message:
          "Anda bukan asesor pada jadwal ini."
      });
    }

    const peserta =
      await PesertaJadwal.findOne({
        where: {
          id_peserta:
            Number(id_asesi),
          id_jadwal:
            Number(id_jadwal)
        },
        transaction: t
      });

    if (!peserta) {
      await t.rollback();

      return res.status(404).json({
        message:
          "Peserta tidak ditemukan pada jadwal ini."
      });
    }

    if (!peserta.id_user) {
      await t.rollback();

      return res.status(400).json({
        message:
          "Peserta belum memiliki id_user."
      });
    }

    const profileAsesi =
      await ProfileAsesi.findByPk(
        peserta.id_user,
        {
          transaction: t
        }
      );

    if (!profileAsesi) {
      await t.rollback();

      return res.status(404).json({
        message:
          "Profile asesi tidak ditemukan."
      });
    }

    const existing =
      await FrAk07.findOne({
        where: {
          id_jadwal:
            Number(id_jadwal),
          id_asesi:
            Number(
              peserta.id_user
            ),
          id_asesor
        },
        transaction: t
      });

    if (existing) {
      await t.rollback();

      return res.status(400).json({
        message:
          "FR.AK.07 sudah pernah dibuat."
      });
    }

    const frAk07 =
      await FrAk07.create(
        {
          id_jadwal:
            Number(id_jadwal),
          id_asesor,
          id_asesi:
            Number(
              peserta.id_user
            ),
          potensi_asesi:
            Array.isArray(
              potensi_asesi
            )
              ? JSON.stringify(
                  potensi_asesi
                )
              : potensi_asesi ||
                "[]",
          ttd_asesor
        },
        {
          transaction: t
        }
      );

    for (
      const item of detailsA
    ) {
      await FrAk07DetailA.create(
        {
          id_fr_ak07:
            frAk07.id_fr_ak07,
          nomor:
            item.nomor,
          aspek:
            item.aspek,
          butuh_penyesuaian:
            item.butuh_penyesuaian ||
            null,
          keterangan:
            Array.isArray(
              item.keterangan
            )
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

    for (
      const item of detailsB
    ) {
      await FrAk07DetailB.create(
        {
          id_fr_ak07:
            frAk07.id_fr_ak07,
          nomor:
            item.nomor,
          pertanyaan:
            item.pertanyaan,
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

    for (
      const item of results
    ) {
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
      message:
        "FR.AK.07 berhasil disimpan",
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
      } catch (
        rollbackError
      ) {
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
      message:
        error.message
    });
  }
};

const updateFrAk07 = async (
  req,
  res
) => {
  let t;

  try {
    t = await sequelize.transaction();

    const { id } =
      req.params;

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
          id_fr_ak07:
            id,
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
          Array.isArray(
            potensi_asesi
          )
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
        id_fr_ak07:
          id
      },
      transaction: t
    });

    await FrAk07DetailB.destroy({
      where: {
        id_fr_ak07:
          id
      },
      transaction: t
    });

    await FrAk07Hasil.destroy({
      where: {
        id_fr_ak07:
          id
      },
      transaction: t
    });

    for (
      const item of detailsA
    ) {
      await FrAk07DetailA.create(
        {
          id_fr_ak07:
            id,
          nomor:
            item.nomor,
          aspek:
            item.aspek,
          butuh_penyesuaian:
            item.butuh_penyesuaian ||
            null,
          keterangan:
            Array.isArray(
              item.keterangan
            )
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

    for (
      const item of detailsB
    ) {
      await FrAk07DetailB.create(
        {
          id_fr_ak07:
            id,
          nomor:
            item.nomor,
          pertanyaan:
            item.pertanyaan,
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

    for (
      const item of results
    ) {
      await FrAk07Hasil.create(
        {
          id_fr_ak07:
            id,
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
      } catch (
        rollbackError
      ) {
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
      message:
        error.message
    });
  }
};

const listFrAk07 = async (
  req,
  res
) => {
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
      total:
        data.length,
      data
    });
  } catch (error) {
    console.error(
      "LIST FR.AK.07 ERROR :",
      error
    );

    return res.status(500).json({
      message:
        error.message
    });
  }
};

const downloadPdfFrAk07 =
  async (req, res) => {
    try {
      const { id } =
        req.params;

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
            ["id", "ASC"]
          ]
        })
      ]);

      if (!peserta) {
        return res.status(404).json({
          message:
            "Data peserta FR.AK.07 tidak ditemukan"
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
                  "nama_tuk",
                  "jenis_tuk"
                ]
              }
            )
          : null
      ]);

      const PAGE_WIDTH = 595.28;
      const PAGE_HEIGHT = 841.89;
      const MARGIN_LEFT = 25;
      const MARGIN_RIGHT = 25;
      const MARGIN_TOP = 25;
      const CONTENT_WIDTH =
        PAGE_WIDTH -
        MARGIN_LEFT -
        MARGIN_RIGHT;

      const doc =
        new PDFDocument({
          size: "A4",
          margin: 0,
          bufferPages: true
        });

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename=FR_AK07_${data.id_fr_ak07}.pdf`
      );

      doc.pipe(res);

      const safe = (
        value
      ) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return "-";
        }

        return String(value);
      };

      const formatTanggal = (
        value
      ) => {
        if (!value) {
          return "-";
        }

        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return String(value);
        }

        return date.toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "long",
            year: "numeric"
          }
        );
      };

      const getTukType = () => {
        const value =
          tuk?.jenis_tuk ||
          jadwal?.tuk?.jenis_tuk ||
          "";

        const normalized =
          String(value)
            .toLowerCase()
            .trim();

        if (
          normalized.includes(
            "sewaktu"
          )
        ) {
          return "sewaktu";
        }

        if (
          normalized.includes(
            "tempat"
          ) ||
          normalized.includes(
            "kerja"
          )
        ) {
          return "tempat_kerja";
        }

        if (
          normalized.includes(
            "mandiri"
          )
        ) {
          return "mandiri";
        }

        return "";
      };

      const normalizeSignaturePath = (
        value
      ) => {
        if (!value) {
          return "";
        }

        const stringValue =
          String(value);

        if (
          path.isAbsolute(
            stringValue
          ) &&
          fs.existsSync(
            stringValue
          )
        ) {
          return stringValue;
        }

        const cleaned =
          stringValue.replace(
            /^[/\\]+/,
            ""
          );

        const candidates = [
          path.join(
            process.cwd(),
            cleaned
          ),
          path.join(
            process.cwd(),
            "uploads",
            cleaned.replace(
              /^uploads[/\\]/,
              ""
            )
          ),
          path.join(
            process.cwd(),
            "public",
            cleaned
          )
        ];

        return (
          candidates.find(
            (item) =>
              fs.existsSync(
                item
              )
          ) || ""
        );
      };

      const parseArray = (
        value
      ) => {
        if (
          Array.isArray(value)
        ) {
          return value;
        }

        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return [];
        }

        try {
          const parsed =
            JSON.parse(
              value
            );

          return Array.isArray(
            parsed
          )
            ? parsed
            : [];
        } catch (
          error
        ) {
          return String(value)
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean);
        }
      };

      const parsedPotensi =
        parseArray(
          data.potensi_asesi
        ).map(String);

      const detailMap =
        new Map();

      detailsA.forEach(
        (item) => {
          detailMap.set(
            String(item.nomor),
            item
          );
        }
      );

      const normalizedDetailsA =
        DEFAULT_ROWS.map(
          (row) => {
            const saved =
              detailMap.get(
                String(row.nomor)
              );

            const keterangan =
              parseArray(
                saved?.keterangan
              );

            return {
              ...row,
              ...(saved
                ? saved.toJSON
                  ? saved.toJSON()
                  : saved
                : {}),
              keterangan
            };
          }
        );

      const resultMap =
        new Map();

      results.forEach(
        (item) => {
          resultMap.set(
            item.bagian,
            item.toJSON
              ? item.toJSON()
              : item
          );
        }
      );

      const getResult = (
        bagian
      ) => {
        return (
          resultMap.get(
            bagian
          ) || {
            bagian,
            acuan_pembanding:
              "",
            metode_asesmen:
              "",
            instrumen_asesmen:
              ""
          }
        );
      };

      const drawPageNumber =
        () => {
          const range =
            doc.bufferedPageRange();

          if (
            !range ||
            range.count <= 1
          ) {
            return;
          }

          for (
            let pageIndex =
              range.start;
            pageIndex <
            range.start +
              range.count;
            pageIndex++
          ) {
            doc.switchToPage(
              pageIndex
            );

            doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor("#555555")
              .text(
                `Halaman ${
                  pageIndex -
                  range.start +
                  1
                } dari ${
                  range.count
                }`,
                MARGIN_LEFT,
                PAGE_HEIGHT - 15,
                {
                  width:
                    CONTENT_WIDTH,
                  align:
                    "center",
                  lineBreak:
                    false
                }
              );

            doc.fillColor(
              "#000000"
            );
          }
        };

      const drawCell = (
        x,
        y,
        width,
        height,
        text,
        options = {}
      ) => {
        const {
          fontSize = 7,
          bold = false,
          align = "left",
          valign = "center",
          padding = 4,
          fill = null
        } = options;

        if (fill) {
          doc
            .save()
            .fillColor(fill)
            .rect(
              x,
              y,
              width,
              height
            )
            .fill()
            .restore();
        }

        doc
          .save()
          .lineWidth(0.7)
          .strokeColor(
            "#000000"
          )
          .rect(
            x,
            y,
            width,
            height
          )
          .stroke()
          .restore();

        doc
          .font(
            bold
              ? "Helvetica-Bold"
              : "Helvetica"
          )
          .fontSize(fontSize)
          .fillColor(
            "#000000"
          );

        const textValue =
          safe(text);

        const textHeight =
          doc.heightOfString(
            textValue,
            {
              width:
                Math.max(
                  width -
                    padding *
                      2,
                  5
                ),
              align
            }
          );

        let textY =
          y + padding;

        if (
          valign === "center"
        ) {
          textY =
            y +
            Math.max(
              padding,
              (height -
                textHeight) /
                2
            );
        }

        if (
          valign === "bottom"
        ) {
          textY =
            y +
            height -
            textHeight -
            padding;
        }

        doc.text(
          textValue,
          x + padding,
          textY,
          {
            width:
              Math.max(
                width -
                  padding *
                    2,
                5
              ),
            align,
            height:
              Math.max(
                height -
                  padding *
                    2,
                5
              )
          }
        );
      };

      const drawCheckbox = (
        x,
        y,
        width,
        height,
        checked,
        boxSize = 9
      ) => {
        const boxX =
          x +
          (width -
            boxSize) /
            2;

        const boxY =
          y +
          (height -
            boxSize) /
            2;

        doc
          .save()
          .lineWidth(0.8)
          .strokeColor(
            "#000000"
          )
          .rect(
            boxX,
            boxY,
            boxSize,
            boxSize
          )
          .stroke()
          .restore();

        if (checked) {
          doc
            .save()
            .lineWidth(1.25)
            .lineCap(
              "round"
            )
            .lineJoin(
              "round"
            )
            .strokeColor(
              "#000000"
            )
            .moveTo(
              boxX + 1.5,
              boxY +
                boxSize *
                  0.5
            )
            .lineTo(
              boxX +
                boxSize *
                  0.42,
              boxY +
                boxSize *
                  0.8
            )
            .lineTo(
              boxX +
                boxSize *
                  0.86,
              boxY +
                boxSize *
                  0.2
            )
            .stroke()
            .restore();
        }
      };

      const drawTukOption = (
        x,
        centerY,
        checked,
        label,
        optionWidth
      ) => {
        const boxSize = 9;
        const labelGap = 4;
        const labelWidth =
          optionWidth -
          boxSize -
          labelGap;

        const groupWidth =
          boxSize +
          labelGap +
          labelWidth;

        const groupX =
          x +
          (optionWidth -
            groupWidth) /
            2;

        const boxY =
          centerY -
          boxSize / 2;

        doc
          .save()
          .lineWidth(0.8)
          .strokeColor(
            "#000000"
          )
          .rect(
            groupX,
            boxY,
            boxSize,
            boxSize
          )
          .stroke()
          .restore();

        if (checked) {
          doc
            .save()
            .lineWidth(1.25)
            .lineCap(
              "round"
            )
            .lineJoin(
              "round"
            )
            .strokeColor(
              "#000000"
            )
            .moveTo(
              groupX + 1.5,
              boxY + 4.5
            )
            .lineTo(
              groupX + 4,
              boxY + 7
            )
            .lineTo(
              groupX + 7.5,
              boxY + 2
            )
            .stroke()
            .restore();
        }

        doc
          .font("Helvetica")
          .fontSize(7)
          .text(
            label,
            groupX +
              boxSize +
              labelGap,
            boxY - 1,
            {
              width:
                labelWidth,
              align:
                "left",
              lineBreak:
                false
            }
          );
      };

      doc
        .font(
          "Helvetica-Bold"
        )
        .fontSize(13)
        .text(
          "FR.AK.07. CEKLIS PENYESUAIAN YANG WAJAR DAN BERALASAN",
          MARGIN_LEFT,
          MARGIN_TOP,
          {
            width:
              CONTENT_WIDTH,
            align:
              "center"
          }
        );

      let currentY =
        MARGIN_TOP + 24;

      const headerCol1 = 145;
      const headerCol2 = 55;
      const headerCol3 = 18;
      const headerCol4 =
        CONTENT_WIDTH -
        headerCol1 -
        headerCol2 -
        headerCol3;

      const headerRows = [
        30,
        30,
        28,
        28,
        28,
        28
      ];

      const headerTotal =
        headerRows.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      let headerY =
        currentY;

      drawCell(
        MARGIN_LEFT,
        headerY,
        headerCol1,
        headerRows[0] +
          headerRows[1],
        "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
        {
          valign:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1,
        headerY,
        headerCol2,
        headerRows[0],
        "Judul",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY,
        headerCol3,
        headerRows[0],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY,
        headerCol4,
        headerRows[0],
        skema?.judul_skema ||
          "-",
        {}
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1,
        headerY +
          headerRows[0],
        headerCol2,
        headerRows[1],
        "Nomor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY +
          headerRows[0],
        headerCol3,
        headerRows[1],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY +
          headerRows[0],
        headerCol4,
        headerRows[1],
        skema?.kode_skema ||
          "-",
        {}
      );

      headerY +=
        headerRows[0] +
        headerRows[1];

      drawCell(
        MARGIN_LEFT,
        headerY,
        headerCol1 +
          headerCol2,
        headerRows[2],
        "TUK",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY,
        headerCol3,
        headerRows[2],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY,
        headerCol4,
        headerRows[2],
        "",
        {
          padding: 0
        }
      );

      const tukType =
        getTukType();

      const tukContentWidth =
        headerCol4 - 20;

      const tukOptionWidth =
        tukContentWidth / 3;

      const tukStartX =
        MARGIN_LEFT +
        headerCol1 +
        headerCol2 +
        headerCol3 +
        10;

      const tukCenterY =
        headerY +
        headerRows[2] /
          2;

      drawTukOption(
        tukStartX,
        tukCenterY,
        tukType ===
          "sewaktu",
        "Sewaktu",
        tukOptionWidth
      );

      drawTukOption(
        tukStartX +
          tukOptionWidth,
        tukCenterY,
        tukType ===
          "tempat_kerja",
        "Tempat Kerja",
        tukOptionWidth
      );

      drawTukOption(
        tukStartX +
          tukOptionWidth *
            2,
        tukCenterY,
        tukType ===
          "mandiri",
        "Mandiri",
        tukOptionWidth
      );

      headerY +=
        headerRows[2];

      drawCell(
        MARGIN_LEFT,
        headerY,
        headerCol1 +
          headerCol2,
        headerRows[3],
        "Nama Asesor",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY,
        headerCol3,
        headerRows[3],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY,
        headerCol4,
        headerRows[3],
        asesor?.nama_lengkap ||
          "-",
        {}
      );

      headerY +=
        headerRows[3];

      drawCell(
        MARGIN_LEFT,
        headerY,
        headerCol1 +
          headerCol2,
        headerRows[4],
        "Nama Asesi",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY,
        headerCol3,
        headerRows[4],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY,
        headerCol4,
        headerRows[4],
        profileAsesi?.nama_lengkap ||
          "-",
        {}
      );

      headerY +=
        headerRows[4];

      drawCell(
        MARGIN_LEFT,
        headerY,
        headerCol1 +
          headerCol2,
        headerRows[5],
        "Tanggal",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2,
        headerY,
        headerCol3,
        headerRows[5],
        ":",
        {
          align:
            "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          headerCol1 +
          headerCol2 +
          headerCol3,
        headerY,
        headerCol4,
        headerRows[5],
        formatTanggal(
          jadwal?.tgl_awal
        ),
        {}
      );

      currentY +=
        headerTotal +
        4;

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .text(
          "*Coret yang tidak perlu",
          MARGIN_LEFT,
          currentY
        );

      currentY += 17;

      const guideText = [
        "• Formulir ini dapat digunakan (sebelum pra asesmen, saat pelaksanaan pra asesmen, setelah pra asesmen)* jika ada asesi yang mempunyai keterbatasan sesuai karakteristik yang dimilikinya sehingga diperlukan penyesuaian yang wajar dan beralasan, jika rencana asesmen dan perangkat asesmen tidak sesuai dengan acuan pembanding, potensi asesi dan konteks asesmen.",
        "• Coretlah pada tanda (*) yang tidak sesuai.",
        "• Berilah tanda centang pada kotak pada kolom potensi asesi.",
        "• Berilah tanda Ya atau Tidak pada pilihan, jika jawaban Ya selanjutnya pada kolom keterangan berilah tanda centang di kotak yang tersedia, pilihlah lebih dari satu."
      ].join("\n");

      const guideHeight =
        Math.max(
          80,
          doc.heightOfString(
            guideText,
            {
              width:
                CONTENT_WIDTH - 14,
              fontSize: 6.6,
              lineGap: 1
            }
          ) + 12
        );

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        22,
        "PANDUAN BAGI ASESOR",
        {
          bold: true
        }
      );

      drawCell(
        MARGIN_LEFT,
        currentY + 22,
        CONTENT_WIDTH,
        guideHeight,
        guideText,
        {
          fontSize: 6.6,
          valign: "top",
          padding: 7
        }
      );

      currentY +=
        22 +
        guideHeight +
        10;

      const potensiLabelWidth =
        175;

      const potensiRowHeight =
        28;

      const potensiHeight =
        potensiRowHeight *
        POTENSI_OPTIONS.length;

      drawCell(
        MARGIN_LEFT,
        currentY,
        potensiLabelWidth,
        potensiHeight,
        "Potensi Asesi",
        {
          bold: true,
          align: "center",
          valign: "center"
        }
      );

      POTENSI_OPTIONS.forEach(
        (
          option,
          index
        ) => {
          const y =
            currentY +
            potensiRowHeight *
              index;

          drawCell(
            MARGIN_LEFT +
              potensiLabelWidth,
            y,
            CONTENT_WIDTH -
              potensiLabelWidth,
            potensiRowHeight,
            "",
            {
              padding: 0
            }
          );

          drawCheckbox(
            MARGIN_LEFT +
              potensiLabelWidth +
              6,
            y,
            15,
            potensiRowHeight,
            parsedPotensi.includes(
              String(index)
            ),
            9
          );

          doc
            .font("Helvetica")
            .fontSize(6.5)
            .text(
              option,
              MARGIN_LEFT +
                potensiLabelWidth +
                22,
              y + 6,
              {
                width:
                  CONTENT_WIDTH -
                  potensiLabelWidth -
                  28,
                height:
                  potensiRowHeight -
                  8
              }
            );
        }
      );

      currentY +=
        potensiHeight +
        10;

      if (
        currentY >
        PAGE_HEIGHT -
          250
      ) {
        doc.addPage();
        currentY =
          MARGIN_TOP;
      }

      const noCol = 25;
      const aspectCol = 175;
      const yesNoCol = 32;
      const yesNoCol2 = 32;
      const noteCol =
        CONTENT_WIDTH -
        noCol -
        aspectCol -
        yesNoCol -
        yesNoCol2;

      drawCell(
        MARGIN_LEFT,
        currentY,
        noCol,
        43,
        "No",
        {
          bold: true,
          align: "center"
        }
      );

      drawCell(
        MARGIN_LEFT +
          noCol,
        currentY,
        aspectCol,
        43,
        "Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi\n(karakteristik asesi)",
        {
          bold: true,
          align: "center",
          fontSize: 6.4
        }
      );

      drawCell(
        MARGIN_LEFT +
          noCol +
          aspectCol,
        currentY,
        yesNoCol +
          yesNoCol2,
        43,
        "Diperlukan penyesuaian\nYa / Tidak",
        {
          bold: true,
          align: "center",
          fontSize: 6.4
        }
      );

      drawCell(
        MARGIN_LEFT +
          noCol +
          aspectCol +
          yesNoCol +
          yesNoCol2,
        currentY,
        noteCol,
        43,
        "Keterangan",
        {
          bold: true,
          align: "center"
        }
      );

      currentY += 43;

      normalizedDetailsA.forEach(
        (item) => {
          const keterangan =
            parseArray(
              item.keterangan
            );

          const selectedTexts =
            keterangan.filter(
              (entry) =>
                !String(
                  entry
                ).startsWith(
                  "__manual_"
                )
            );

          const manualTexts =
            keterangan
              .filter(
                (entry) =>
                  String(
                    entry
                  ).startsWith(
                    "__manual_"
                  )
              )
              .map(
                (entry) =>
                  String(
                    entry
                  ).replace(
                    /^__manual_\d+__/,
                    ""
                  )
              )
              .filter(Boolean);

          const optionRows =
            [];

          item.options.forEach(
            (option) => {
              if (!option) {
                return;
              }

              optionRows.push({
                text: option,
                checked:
                  selectedTexts.includes(
                    option
                  )
              });
            }
          );

          manualTexts.forEach(
            (value) => {
              optionRows.push({
                text: value,
                checked: true
              });
            }
          );

          if (
            optionRows.length ===
            0
          ) {
            optionRows.push({
              text: "-",
              checked: false
            });
          }

          const lineHeight =
            11;

          const textHeight =
            optionRows.length *
            lineHeight;

          const aspectHeight =
            doc.heightOfString(
              item.aspek || "-",
              {
                width:
                  aspectCol - 10,
                fontSize: 6.1
              }
            );

          const rowHeight =
            Math.max(
              64,
              textHeight + 12,
              aspectHeight + 10
            );

          drawCell(
            MARGIN_LEFT,
            currentY,
            noCol,
            rowHeight,
            item.nomor,
            {
              align: "center",
              valign: "top",
              fontSize: 6.5
            }
          );

          drawCell(
            MARGIN_LEFT +
              noCol,
            currentY,
            aspectCol,
            rowHeight,
            item.aspek || "-",
            {
              valign: "top",
              fontSize: 6.1,
              padding: 5
            }
          );

          drawCell(
            MARGIN_LEFT +
              noCol +
              aspectCol,
            currentY,
            yesNoCol,
            rowHeight,
            "",
            {
              padding: 0
            }
          );

          drawCheckbox(
            MARGIN_LEFT +
              noCol +
              aspectCol,
            currentY,
            yesNoCol,
            rowHeight,
            item.butuh_penyesuaian ===
              "ya",
            8
          );

          drawCell(
            MARGIN_LEFT +
              noCol +
              aspectCol +
              yesNoCol,
            currentY,
            yesNoCol2,
            rowHeight,
            "",
            {
              padding: 0
            }
          );

          drawCheckbox(
            MARGIN_LEFT +
              noCol +
              aspectCol +
              yesNoCol,
            currentY,
            yesNoCol2,
            rowHeight,
            item.butuh_penyesuaian ===
              "tidak",
            8
          );

          const noteX =
            MARGIN_LEFT +
            noCol +
            aspectCol +
            yesNoCol +
            yesNoCol2;

          drawCell(
            noteX,
            currentY,
            noteCol,
            rowHeight,
            "",
            {
              padding: 0
            }
          );

          optionRows.forEach(
            (
              optionRow,
              optionIndex
            ) => {
              const optionY =
                currentY +
                5 +
                optionIndex *
                  lineHeight;

              drawCheckbox(
                noteX + 5,
                optionY,
                10,
                lineHeight,
                optionRow.checked,
                7
              );

              doc
                .font("Helvetica")
                .fontSize(5.8)
                .fillColor(
                  "#000000"
                )
                .text(
                  optionRow.text,
                  noteX + 19,
                  optionY + 1,
                  {
                    width:
                      noteCol - 24,
                    height:
                      lineHeight
                  }
                );
            }
          );

          currentY +=
            rowHeight;

          if (
            currentY >
            PAGE_HEIGHT - 90
          ) {
            doc.addPage();
            currentY =
              MARGIN_TOP;
          }
        }
      );

      currentY += 10;

      drawCell(
        MARGIN_LEFT,
        currentY,
        CONTENT_WIDTH,
        26,
        "Hasil Penyesuaian yang wajar dan beralasan disepakati menggunakan:",
        {
          bold: true
        }
      );

      currentY += 26;

      const resultRows = [
        {
          nomor: "1)",
          label:
            "Acuan Pembanding:",
          value:
            getResult(
              "Acuan Pembanding"
            ).acuan_pembanding
        },
        {
          nomor: "2)",
          label:
            "Metode Asesmen:",
          value:
            getResult(
              "Metode Asesmen"
            ).metode_asesmen
        },
        {
          nomor: "3)",
          label:
            "Instrumen Asesmen:",
          value:
            getResult(
              "Instrumen Asesmen"
            ).instrumen_asesmen
        }
      ];

      resultRows.forEach(
        (row) => {
          const text =
            `${row.nomor} ${row.label} ${
              row.value || "-"
            }`;

          const rowHeight =
            Math.max(
              30,
              doc.heightOfString(
                text,
                {
                  width:
                    CONTENT_WIDTH - 12,
                  fontSize: 6.4
                }
              ) + 10
            );

          drawCell(
            MARGIN_LEFT,
            currentY,
            CONTENT_WIDTH,
            rowHeight,
            text,
            {
              fontSize: 6.4,
              valign: "center"
            }
          );

          currentY +=
            rowHeight;
        }
      );

      currentY += 10;

      if (
        currentY >
        PAGE_HEIGHT - 250
      ) {
        doc.addPage();
        currentY =
          MARGIN_TOP;
      }

      const signCol =
        CONTENT_WIDTH / 2;

      const signHeader =
        25;

      const signBody =
        90;

      drawCell(
        MARGIN_LEFT,
        currentY,
        signCol,
        signHeader,
        "Nama Asesi:",
        {}
      );

      drawCell(
        MARGIN_LEFT +
          signCol,
        currentY,
        signCol,
        signHeader,
        "Tanggal dan tandatangan asesi",
        {
          align: "center"
        }
      );

      currentY +=
        signHeader;

      drawCell(
        MARGIN_LEFT,
        currentY,
        signCol,
        signBody,
        profileAsesi?.nama_lengkap ||
          "-",
        {
          valign: "top"
        }
      );

      drawCell(
        MARGIN_LEFT +
          signCol,
        currentY,
        signCol,
        signBody,
        "",
        {
          padding: 0
        }
      );

      const ttdAsesiPath =
        normalizeSignaturePath(
          profileAsesi?.ttd_path
        );

      if (
        ttdAsesiPath &&
        fs.existsSync(
          ttdAsesiPath
        )
      ) {
        try {
          const signatureWidth =
            120;

          const signatureHeight =
            55;

          const signatureX =
            MARGIN_LEFT +
            signCol +
            (signCol -
              signatureWidth) /
              2;

          const signatureY =
            currentY +
            8;

          doc.image(
            ttdAsesiPath,
            signatureX,
            signatureY,
            {
              fit: [
                signatureWidth,
                signatureHeight
              ],
              align: "center",
              valign: "center"
            }
          );
        } catch (
          error
        ) {}
      }

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .text(
          formatTanggal(
            jadwal?.tgl_awal
          ),
          MARGIN_LEFT +
            signCol +
            8,
          currentY + 69,
          {
            width:
              signCol - 16,
            align: "center"
          }
        );

      currentY +=
        signBody;

      drawCell(
        MARGIN_LEFT,
        currentY,
        signCol,
        signHeader,
        `Nama Asesor: ${
          asesor?.nama_lengkap ||
          "-"
        }`,
        {}
      );

      drawCell(
        MARGIN_LEFT +
          signCol,
        currentY,
        signCol,
        signHeader,
        "Tanggal dan tandatangan asesor",
        {
          align: "center"
        }
      );

      currentY +=
        signHeader;

      drawCell(
        MARGIN_LEFT,
        currentY,
        signCol,
        signBody,
        asesor?.nama_lengkap ||
          "-",
        {
          valign: "top"
        }
      );

      drawCell(
        MARGIN_LEFT +
          signCol,
        currentY,
        signCol,
        signBody,
        "",
        {
          padding: 0
        }
      );

      const ttdAsesorPath =
        normalizeSignaturePath(
          asesor?.ttd_path ||
            data.ttd_asesor
        );

      if (
        ttdAsesorPath &&
        fs.existsSync(
          ttdAsesorPath
        )
      ) {
        try {
          const signatureWidth =
            120;

          const signatureHeight =
            55;

          const signatureX =
            MARGIN_LEFT +
            signCol +
            (signCol -
              signatureWidth) /
              2;

          const signatureY =
            currentY +
            8;

          doc.image(
            ttdAsesorPath,
            signatureX,
            signatureY,
            {
              fit: [
                signatureWidth,
                signatureHeight
              ],
              align: "center",
              valign: "center"
            }
          );
        } catch (
          error
        ) {}
      }

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .text(
          formatTanggal(
            jadwal?.tgl_awal
          ),
          MARGIN_LEFT +
            signCol +
            8,
          currentY + 69,
          {
            width:
              signCol - 16,
            align: "center"
          }
        );

      drawPageNumber();

      doc.end();
    } catch (error) {
      console.error(
        "DOWNLOAD FR.AK.07 ERROR :",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          message:
            error.message
        });
      }
    }
  };

module.exports = {
  getFrAk07,
  submitFrAk07,
  updateFrAk07,
  listFrAk07,
  downloadPdfFrAk07
};