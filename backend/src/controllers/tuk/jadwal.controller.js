const {
  Jadwal,
  Tuk,
  Skema,
  TukSkema,
  User,
  ProfileAsesor,
  JadwalAsesor,
  PesertaJadwal
} = require("../../models");

const {
  fn,
  col
} = require("sequelize");

const getTukId = async (req) => {
  let tukId = req.user?.id_tuk;

  if (!tukId) {
    const userId = req.user?.id_user;

    if (!userId) {
      return null;
    }

    const tuk = await Tuk.findOne({
      where: {
        id_penanggung_jawab: userId
      }
    });

    if (tuk) {
      tukId = tuk.id_tuk;
    }
  }

  return tukId;
};

const getTukLogin = async (req) => {
  const tukId = await getTukId(req);

  if (!tukId) {
    return null;
  }

  const tuk = await Tuk.findByPk(tukId);

  if (!tuk) {
    return null;
  }

  return tuk;
};

const getParticipantCountMap = async (jadwalIds) => {
  if (!Array.isArray(jadwalIds) || jadwalIds.length === 0) {
    return new Map();
  }

  const rows = await PesertaJadwal.findAll({
    where: {
      id_jadwal: jadwalIds
    },
    attributes: [
      "id_jadwal",
      [
        fn(
          "COUNT",
          col("id_peserta")
        ),
        "jumlah_peserta"
      ]
    ],
    group: [
      "id_jadwal"
    ],
    raw: true
  });

  const map = new Map();

  rows.forEach((row) => {
    map.set(
      Number(row.id_jadwal),
      Number(row.jumlah_peserta) || 0
    );
  });

  return map;
};

const getAsesorList = (data) => {
  const plain = data.get({
    plain: true
  });

  plain.asesorList =
    Array.isArray(
      plain.jadwal_asesors
    )
      ? plain.jadwal_asesors
      : [];

  delete plain.jadwal_asesors;

  return plain;
};

const buildJadwalInclude = () => {
  return [
    {
      model: Tuk,
      as: "tuk",
      attributes: [
        "id_tuk",
        "nama_tuk",
        "jenis_tuk",
        "email"
      ]
    },
    {
      model: Skema,
      as: "skema",
      attributes: [
        "id_skema",
        "kode_skema",
        "judul_skema",
        "jenis_skema"
      ]
    },
    {
      model: JadwalAsesor,
      required: false,
      include: [
        {
          model: User,
          as: "asesor",
          attributes: [
            "id_user",
            "username",
            "email",
            "no_hp"
          ]
        },
        {
          model: ProfileAsesor,
          as: "profileAsesor",
          attributes: [
            "nama_lengkap",
            "gelar_depan",
            "gelar_belakang",
            "no_reg_asesor",
            "no_lisensi",
            "bidang_keahlian",
            "foto_profil"
          ]
        }
      ]
    }
  ];
};

const getSkemaTuk = async (req, res) => {
  try {
    const tuk = await getTukLogin(req);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message: "TUK tidak ditemukan"
      });
    }

    if (tuk.jenis_tuk !== "mandiri") {
      return res.status(403).json({
        success: false,
        message:
          "Hanya TUK mandiri yang boleh mengelola jadwal"
      });
    }

    const data = await Skema.findAll({
      where: {
        status: "aktif"
      },
      order: [
        [
          "judul_skema",
          "ASC"
        ]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error(
      "GET SKEMA ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const createJadwal = async (req, res) => {
  const transaction =
    await Jadwal.sequelize.transaction();

  try {
    const tuk =
      await getTukLogin(req);

    if (!tuk) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "TUK tidak ditemukan"
      });
    }

    if (tuk.jenis_tuk !== "mandiri") {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message:
          "Hanya TUK mandiri yang boleh membuat jadwal"
      });
    }

    const tukId =
      tuk.id_tuk;

    const idSkema =
      parseInt(
        req.body.id_skema,
        10
      );

    if (
      !idSkema ||
      Number.isNaN(idSkema)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "ID Skema tidak valid"
      });
    }

    const skema =
      await Skema.findOne({
        where: {
          id_skema: idSkema,
          status: "aktif"
        }
      });

    if (!skema) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Skema tidak ditemukan / tidak diperbolehkan"
      });
    }

    if (!req.body.nama_kegiatan) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Nama kegiatan wajib diisi"
      });
    }

    if (
      req.body.tgl_awal &&
      req.body.tgl_akhir &&
      req.body.tgl_awal >
        req.body.tgl_akhir
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Tanggal awal tidak boleh melebihi tanggal akhir"
      });
    }

    const allowedPelaksanaan = [
      "luring",
      "daring",
      "hybrid",
      "onsite"
    ];

    const data =
      await Jadwal.create(
        {
          kode_jadwal:
            req.body.kode_jadwal || null,

          id_skema:
            idSkema,

          id_tuk:
            tukId,

          nama_kegiatan:
            req.body.nama_kegiatan,

          tgl_pra_asesmen:
            req.body.tgl_pra_asesmen ||
            null,

          tahun:
            req.body.tahun
              ? parseInt(
                  req.body.tahun,
                  10
                )
              : new Date().getFullYear(),

          periode_bulan:
            req.body.periode_bulan ||
            null,

          gelombang:
            req.body.gelombang ||
            null,

          tgl_awal:
            req.body.tgl_awal ||
            null,

          tgl_akhir:
            req.body.tgl_akhir ||
            null,

          jam:
            req.body.jam ||
            null,

          pelaksanaan_uji:
            allowedPelaksanaan.includes(
              req.body.pelaksanaan_uji
            )
              ? req.body.pelaksanaan_uji
              : "luring",

          url_agenda:
            req.body.url_agenda ||
            null,

          status: "draft",

          created_by:
            req.user.id_user,

          created_at:
            new Date(),

          updated_at:
            new Date()
        },
        {
          transaction
        }
      );

    await TukSkema.findOrCreate({
      where: {
        id_tuk: tukId,
        id_skema: idSkema
      },
      defaults: {
        id_tuk: tukId,
        id_skema: idSkema
      },
      transaction
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        "Jadwal berhasil dibuat dan menunggu verifikasi admin",
      data
    });
  } catch (err) {
    await transaction.rollback();

    console.error(
      "CREATE JADWAL ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getAllJadwal = async (req, res) => {
  try {
    const tuk =
      await getTukLogin(req);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message:
          "TUK tidak ditemukan"
      });
    }

    const data =
      await Jadwal.findAll({
        where: {
          id_tuk:
            tuk.id_tuk
        },

        include:
          buildJadwalInclude(),

        order: [
          [
            "created_at",
            "DESC"
          ]
        ]
      });

    const jadwalIds =
      data.map(
        (item) =>
          Number(
            item.id_jadwal
          )
      );

    const participantCountMap =
      await getParticipantCountMap(
        jadwalIds
      );

    const result =
      data.map(
        (item) => {
          const plain =
            getAsesorList(
              item
            );

          plain.kuota =
            participantCountMap.get(
              Number(
                item.id_jadwal
              )
            ) || 0;

          return plain;
        }
      );

    return res.json({
      success: true,
      total: result.length,
      jenis_tuk:
        tuk.jenis_tuk,
      data: result
    });
  } catch (err) {
    console.error(
      "GET ALL JADWAL ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message
    });
  }
};

const getJadwalById = async (
  req,
  res
) => {
  try {
    const tuk =
      await getTukLogin(req);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message:
          "TUK tidak ditemukan"
      });
    }

    const { id } =
      req.params;

    const data =
      await Jadwal.findOne({
        where: {
          id_jadwal:
            parseInt(
              id,
              10
            ),
          id_tuk:
            tuk.id_tuk
        },

        include:
          buildJadwalInclude()
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    const totalPeserta =
      await PesertaJadwal.count({
        where: {
          id_jadwal:
            parseInt(
              id,
              10
            )
        }
      });

    const result =
      getAsesorList(
        data
      );

    result.kuota =
      totalPeserta;

    return res.json({
      success: true,
      jenis_tuk:
        tuk.jenis_tuk,
      data: result
    });
  } catch (err) {
    console.error(
      "GET JADWAL BY ID ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message
    });
  }
};

const updateJadwal = async (
  req,
  res
) => {
  try {
    const tuk =
      await getTukLogin(req);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message:
          "TUK tidak ditemukan"
      });
    }

    if (
      tuk.jenis_tuk !==
      "mandiri"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya TUK mandiri yang boleh mengubah jadwal"
      });
    }

    const { id } =
      req.params;

    const jadwal =
      await Jadwal.findOne({
        where: {
          id_jadwal:
            parseInt(
              id,
              10
            ),
          id_tuk:
            tuk.id_tuk
        }
      });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    if (
      jadwal.status !==
      "draft"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hanya jadwal draft yang boleh diubah"
      });
    }

    const tglAwal =
      req.body.tgl_awal ||
      jadwal.tgl_awal;

    const tglAkhir =
      req.body.tgl_akhir ||
      jadwal.tgl_akhir;

    if (
      tglAwal &&
      tglAkhir &&
      tglAwal >
        tglAkhir
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal awal tidak boleh melebihi tanggal akhir"
      });
    }

    const allowedPelaksanaan = [
      "luring",
      "daring",
      "hybrid",
      "onsite"
    ];

    const payload = {
      ...req.body
    };

    delete payload.kuota;
    delete payload.status;
    delete payload.id_tuk;
    delete payload.created_by;
    delete payload.created_at;
    delete payload.updated_at;

    await jadwal.update({
      ...payload,

      pelaksanaan_uji:
        allowedPelaksanaan.includes(
          req.body.pelaksanaan_uji
        )
          ? req.body.pelaksanaan_uji
          : jadwal.pelaksanaan_uji,

      status:
        jadwal.status,

      updated_at:
        new Date()
    });

    return res.json({
      success: true,
      message:
        "Jadwal berhasil diupdate",
      data: jadwal
    });
  } catch (err) {
    console.error(
      "UPDATE JADWAL ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message
    });
  }
};

const deleteJadwal = async (
  req,
  res
) => {
  try {
    const tuk =
      await getTukLogin(req);

    if (!tuk) {
      return res.status(404).json({
        success: false,
        message:
          "TUK tidak ditemukan"
      });
    }

    if (
      tuk.jenis_tuk !==
      "mandiri"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya TUK mandiri yang boleh menghapus jadwal"
      });
    }

    const { id } =
      req.params;

    const jadwal =
      await Jadwal.findOne({
        where: {
          id_jadwal:
            parseInt(
              id,
              10
            ),
          id_tuk:
            tuk.id_tuk
        }
      });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    if (
      jadwal.status !==
      "draft"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hanya jadwal draft yang boleh dihapus"
      });
    }

    await JadwalAsesor.destroy({
      where: {
        id_jadwal:
          parseInt(
            id,
            10
          )
      }
    });

    await jadwal.destroy();

    return res.json({
      success: true,
      message:
        "Jadwal berhasil dihapus"
    });
  } catch (err) {
    console.error(
      "DELETE JADWAL ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        err.message
    });
  }
};

const getDetailJadwalLengkap =
  async (req, res) => {
    try {
      const tuk =
        await getTukLogin(req);

      if (!tuk) {
        return res.status(404).json({
          success: false,
          message:
            "TUK tidak ditemukan"
        });
      }

      const { id } =
        req.params;

      const data =
        await Jadwal.findOne({
          where: {
            id_jadwal:
              parseInt(
                id,
                10
              ),
            id_tuk:
              tuk.id_tuk
          },

          include: [
            {
              model: Skema,
              as: "skema",
              attributes: [
                "id_skema",
                "kode_skema",
                "judul_skema",
                "jenis_skema"
              ]
            },
            {
              model: Tuk,
              as: "tuk",
              attributes: [
                "id_tuk",
                "nama_tuk",
                "email",
                "jenis_tuk"
              ]
            },
            {
              model: JadwalAsesor,
              required: false,
              include: [
                {
                  model: User,
                  as: "asesor",
                  attributes: [
                    "id_user",
                    "username",
                    "email",
                    "no_hp"
                  ]
                },
                {
                  model: ProfileAsesor,
                  as: "profileAsesor",
                  attributes: [
                    "nama_lengkap",
                    "gelar_depan",
                    "gelar_belakang",
                    "no_reg_asesor",
                    "no_lisensi",
                    "bidang_keahlian",
                    "foto_profil"
                  ]
                }
              ]
            }
          ]
        });

      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Jadwal tidak ditemukan"
        });
      }

      const totalPeserta =
        await PesertaJadwal.count({
          where: {
            id_jadwal:
              parseInt(
                id,
                10
              )
          }
        });

      const result =
        getAsesorList(
          data
        );

      result.kuota =
        totalPeserta;

      return res.json({
        success: true,
        jenis_tuk:
          tuk.jenis_tuk,
        data: result
      });
    } catch (err) {
      console.error(
        "DETAIL JADWAL ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          err.message
      });
    }
  };

module.exports = {
  getDetailJadwalLengkap,
  getSkemaTuk,
  createJadwal,
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
};