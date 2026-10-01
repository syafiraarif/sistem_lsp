const {
  Jadwal,
  User,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor,
  PesertaJadwal
} = require("../../models");

const { Op } = require("sequelize");

const JENIS_TUGAS_RULE = {
  asesor_penguji: {
    min: 1
  },
  verifikator_tuk: {
    min: 2,
    max: 2
  },
  validator_mkva: {
    min: 2,
    max: 3
  },
  komite_teknis: {
    min: 1,
    max: 3
  }
};

const getJumlahAsesiDanAsesor = async (
  idJadwal,
  transaction
) => {
  const jumlahAsesi = await PesertaJadwal.count({
    where: {
      id_jadwal: idJadwal
    },
    transaction
  });

  const minimalAsesorPenguji = Math.max(
    1,
    Math.ceil(jumlahAsesi / 10)
  );

  return {
    jumlahAsesi,
    minimalAsesorPenguji
  };
};

const manageAsesor = async (req, res) => {
  const transaction =
    await JadwalAsesor.sequelize.transaction();

  try {
    const { id, jenisTugas } =
      req.params;

    const { listAsesor } =
      req.body;

    const idJadwal =
      parseInt(id, 10);

    if (
      !JENIS_TUGAS_RULE[jenisTugas]
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Jenis tugas tidak valid"
      });
    }

    if (
      !Array.isArray(listAsesor) ||
      listAsesor.length === 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Pilih minimal satu asesor"
      });
    }

    const jadwal =
      await Jadwal.findOne({
        where: {
          id_jadwal: idJadwal,
          id_tuk:
            req.user.id_tuk
        },
        transaction
      });

    if (!jadwal) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Jadwal tidak ditemukan"
      });
    }

    if (
      jadwal.status !== "open"
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Asesor hanya bisa ditambahkan pada jadwal yang sudah dibuka"
      });
    }

    const incomingAsesorIds =
      listAsesor.map((item) =>
        parseInt(
          item.id_user,
          10
        )
      );

    if (
      incomingAsesorIds.some(
        (idUser) =>
          Number.isNaN(idUser)
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Data asesor tidak valid"
      });
    }

    const uniqueIncomingIds =
      [...new Set(incomingAsesorIds)];

    if (
      uniqueIncomingIds.length !==
      incomingAsesorIds.length
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Ada asesor yang dipilih lebih dari satu kali"
      });
    }

    const existingAssignments =
      await JadwalAsesor.findAll({
        where: {
          id_jadwal: idJadwal,
          jenis_tugas:
            jenisTugas,
          status: {
            [Op.in]: [
              "aktif",
              "nonaktif"
            ]
          }
        },
        transaction
      });

    const existingActiveIds =
      existingAssignments
        .filter(
          (item) =>
            item.status ===
            "aktif"
        )
        .map(
          (item) =>
            Number(
              item.id_user
            )
        );

    const existingInactiveIds =
      existingAssignments
        .filter(
          (item) =>
            item.status ===
            "nonaktif"
        )
        .map(
          (item) =>
            Number(
              item.id_user
            )
        );

    const existingAllIds =
      [
        ...new Set([
          ...existingActiveIds,
          ...existingInactiveIds
        ])
      ];

    const reactivationIds =
      uniqueIncomingIds.filter(
        (idUser) =>
          existingInactiveIds.includes(
            idUser
          )
      );

    const newAsesorIds =
      uniqueIncomingIds.filter(
        (idUser) =>
          !existingAllIds.includes(
            idUser
          )
      );

    const allActiveAfterSave =
      [
        ...new Set([
          ...existingActiveIds,
          ...reactivationIds,
          ...newAsesorIds
        ])
      ];

    const rule =
      JENIS_TUGAS_RULE[
        jenisTugas
      ];

    const {
      jumlahAsesi,
      minimalAsesorPenguji
    } =
      await getJumlahAsesiDanAsesor(
        idJadwal,
        transaction
      );

    if (
      jenisTugas ===
      "asesor_penguji"
    ) {
      if (
        allActiveAfterSave.length <
        minimalAsesorPenguji
      ) {
        const kekurangan =
          minimalAsesorPenguji -
          allActiveAfterSave.length;

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Jadwal ini memiliki ${jumlahAsesi} asesi. Minimal ${minimalAsesorPenguji} asesor penguji diperlukan. Tambahkan ${kekurangan} asesor lagi.`,
          jumlah_asesi:
            jumlahAsesi,
          minimal_asesor:
            minimalAsesorPenguji,
          asesor_saat_ini:
            allActiveAfterSave.length,
          kekurangan
        });
      }
    } else {
      if (
        allActiveAfterSave.length <
        rule.min
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Minimal ${rule.min} asesor diperlukan`
        });
      }

      if (
        allActiveAfterSave.length >
        rule.max
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Maksimal ${rule.max} asesor dapat ditugaskan`
        });
      }
    }

    const asesorValid =
      await ProfileAsesor.findAll({
        where: {
          id_user: {
            [Op.in]:
              uniqueIncomingIds
          },
          status_asesor:
            "aktif"
        },
        include: [
          {
            model: User,
            as: "user",
            required: true,
            where: {
              status_user:
                "aktif"
            },
            attributes: [
              "id_user",
              "username",
              "email",
              "no_hp"
            ]
          }
        ],
        transaction
      });

    if (
      asesorValid.length !==
      uniqueIncomingIds.length
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Ada asesor yang tidak aktif atau tidak tersedia"
      });
    }

    const idsToCheckConflict =
      uniqueIncomingIds.filter(
        (idUser) =>
          !existingActiveIds.includes(
            idUser
          )
      );

    if (
      idsToCheckConflict.length >
        0 &&
      jadwal.tgl_awal &&
      jadwal.jam
    ) {
      const tglAwal =
        jadwal.tgl_awal;

      const tglAkhir =
        jadwal.tgl_akhir ||
        jadwal.tgl_awal;

      const bentrok =
        await JadwalAsesor.findAll({
          where: {
            id_user: {
              [Op.in]:
                idsToCheckConflict
            },
            status:
              "aktif",
            id_jadwal: {
              [Op.ne]:
                idJadwal
            }
          },
          include: [
            {
              model: Jadwal,
              required: true,
              where: {
                status: {
                  [Op.in]: [
                    "open",
                    "ongoing"
                  ]
                },
                jam:
                  jadwal.jam,
                [Op.and]: [
                  {
                    tgl_awal: {
                      [Op.lte]:
                        tglAkhir
                    }
                  },
                  {
                    [Op.or]: [
                      {
                        tgl_akhir: {
                          [Op.gte]:
                            tglAwal
                        }
                      },
                      {
                        tgl_akhir: {
                          [Op.is]:
                            null
                        }
                      }
                    ]
                  }
                ]
              },
              attributes: [
                "id_jadwal",
                "nama_kegiatan",
                "tgl_awal",
                "tgl_akhir",
                "jam",
                "status"
              ]
            }
          ],
          transaction
        });

      if (
        bentrok.length >
        0
      ) {
        const asesorBentrok =
          bentrok[0];

        const jadwalBentrok =
          asesorBentrok.jadwal;

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Asesor tidak bisa dipilih karena sudah memiliki jadwal lain pada hari dan jam yang sama",
          data: {
            id_user:
              asesorBentrok.id_user,
            jadwal:
              jadwalBentrok
                ? {
                    id_jadwal:
                      jadwalBentrok.id_jadwal,
                    nama_kegiatan:
                      jadwalBentrok.nama_kegiatan,
                    tgl_awal:
                      jadwalBentrok.tgl_awal,
                    tgl_akhir:
                      jadwalBentrok.tgl_akhir,
                    jam:
                      jadwalBentrok.jam
                  }
                : null
          }
        });
      }
    }

    for (
      const idUser
      of reactivationIds
    ) {
      const assignment =
        existingAssignments.find(
          (item) =>
            Number(
              item.id_user
            ) === idUser
        );

      if (assignment) {
        await assignment.update(
          {
            status: "aktif",
            assigned_by:
              req.user.id_user
          },
          {
            transaction
          }
        );
      }
    }

    const payload =
      newAsesorIds.map(
        (idUser) => ({
          id_jadwal:
            idJadwal,
          id_user:
            idUser,
          jenis_tugas:
            jenisTugas,
          status:
            "aktif",
          assigned_by:
            req.user.id_user,
          created_at:
            new Date()
        })
      );

    if (
      payload.length >
      0
    ) {
      await JadwalAsesor.bulkCreate(
        payload,
        {
          transaction
        }
      );
    }

    await transaction.commit();

    const totalTersimpan =
      allActiveAfterSave.length;

    return res.json({
      success: true,
      message:
        jenisTugas ===
        "asesor_penguji"
          ? "Asesor penguji berhasil disimpan"
          : "Asesor berhasil disimpan",
      total:
        totalTersimpan,
      baru:
        newAsesorIds.length,
      sudah_ada:
        uniqueIncomingIds.length -
        newAsesorIds.length,
      jumlah_asesi:
        jumlahAsesi,
      minimal_asesor:
        jenisTugas ===
        "asesor_penguji"
          ? minimalAsesorPenguji
          : null,
      data: payload
    });
  } catch (err) {
    await transaction.rollback();

    console.error(
      "MANAGE ASESOR ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan saat menyimpan asesor"
    });
  }
};

const listAsesorJadwal =
  async (req, res) => {
    try {
      const {
        id,
        jenisTugas
      } = req.params;

      const idJadwal =
        parseInt(id, 10);

      if (
        !JENIS_TUGAS_RULE[
          jenisTugas
        ]
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Jenis tugas tidak valid"
        });
      }

      const jadwal =
        await Jadwal.findOne({
          where: {
            id_jadwal:
              idJadwal,
            id_tuk:
              req.user.id_tuk
          }
        });

      if (!jadwal) {
        return res.status(404).json({
          success: false,
          message:
            "Jadwal tidak ditemukan"
        });
      }

      const data =
        await JadwalAsesor.findAll({
          where: {
            id_jadwal:
              idJadwal,
            jenis_tugas:
              jenisTugas,
            status:
              "aktif"
          },
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
              as:
                "profileAsesor",
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
          ],
          order: [
            [
              "created_at",
              "DESC"
            ]
          ]
        });

      return res.json({
        success: true,
        total:
          data.length,
        data
      });
    } catch (err) {
      console.error(
        "LIST ASESOR ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Data asesor gagal dimuat"
      });
    }
  };

const removeAsesor =
  async (req, res) => {
    const transaction =
      await JadwalAsesor.sequelize.transaction();

    try {
      const {
        id,
        jenisTugas,
        idUser
      } = req.params;

      const idJadwal =
        parseInt(id, 10);

      const idAsesor =
        parseInt(idUser, 10);

      if (
        !JENIS_TUGAS_RULE[
          jenisTugas
        ]
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Jenis tugas tidak valid"
        });
      }

      const jadwal =
        await Jadwal.findOne({
          where: {
            id_jadwal:
              idJadwal,
            id_tuk:
              req.user.id_tuk
          },
          transaction
        });

      if (!jadwal) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message:
            "Jadwal tidak ditemukan"
        });
      }

      if (
        !["draft", "open"].includes(
          jadwal.status
        )
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Asesor tidak dapat dihapus pada jadwal ini"
        });
      }

      const deleted =
        await JadwalAsesor.destroy({
          where: {
            id_jadwal:
              idJadwal,
            id_user:
              idAsesor,
            jenis_tugas:
              jenisTugas
          },
          transaction
        });

      if (!deleted) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message:
            "Asesor tidak ditemukan"
        });
      }

      await transaction.commit();

      return res.json({
        success: true,
        message:
          "Asesor berhasil dihapus"
      });
    } catch (err) {
      await transaction.rollback();

      console.error(
        "REMOVE ASESOR ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Asesor gagal dihapus"
      });
    }
  };

const getAsesorTuk =
  async (req, res) => {
    try {
      const idJadwal =
        parseInt(
          req.query.id_jadwal,
          10
        );

      let jumlahAsesi = 0;
      let minimalAsesorPenguji = 1;
      const conflictMap =
        new Map();

      if (
        !Number.isNaN(
          idJadwal
        )
      ) {
        const jadwal =
          await Jadwal.findOne({
            where: {
              id_jadwal:
                idJadwal,
              id_tuk:
                req.user.id_tuk
            }
          });

        if (jadwal) {
          const hasil =
            await getJumlahAsesiDanAsesor(
              idJadwal
            );

          jumlahAsesi =
            hasil.jumlahAsesi;

          minimalAsesorPenguji =
            hasil.minimalAsesorPenguji;

          if (
            jadwal.tgl_awal &&
            jadwal.jam
          ) {
            const tglAwal =
              jadwal.tgl_awal;

            const tglAkhir =
              jadwal.tgl_akhir ||
              jadwal.tgl_awal;

            const bentrok =
              await JadwalAsesor.findAll({
                where: {
                  status:
                    "aktif",
                  id_jadwal: {
                    [Op.ne]:
                      idJadwal
                  }
                },
                include: [
                  {
                    model: Jadwal,
                    required:
                      true,
                    where: {
                      status: {
                        [Op.in]: [
                          "open",
                          "ongoing"
                        ]
                      },
                      jam:
                        jadwal.jam,
                      [Op.and]: [
                        {
                          tgl_awal: {
                            [Op.lte]:
                              tglAkhir
                          }
                        },
                        {
                          [Op.or]: [
                            {
                              tgl_akhir: {
                                [Op.gte]:
                                  tglAwal
                              }
                            },
                            {
                              tgl_akhir: {
                                [Op.is]:
                                  null
                              }
                            }
                          ]
                        }
                      ]
                    },
                    attributes: [
                      "id_jadwal",
                      "nama_kegiatan",
                      "tgl_awal",
                      "tgl_akhir",
                      "jam",
                      "status"
                    ]
                  }
                ]
              });

            bentrok.forEach(
              (item) => {
                if (
                  !conflictMap.has(
                    Number(
                      item.id_user
                    )
                  )
                ) {
                  conflictMap.set(
                    Number(
                      item.id_user
                    ),
                    item.jadwal
                      ? item.jadwal.toJSON()
                      : null
                  );
                }
              }
            );
          }
        }
      }

      const data =
        await ProfileAsesor.findAll({
          where: {
            status_asesor:
              "aktif"
          },
          include: [
            {
              model: User,
              as: "user",
              required: true,
              where: {
                status_user:
                  "aktif"
              },
              attributes: [
                "id_user",
                "username",
                "email",
                "no_hp"
              ]
            }
          ],
          attributes: [
            "id_user",
            "nama_lengkap",
            "gelar_depan",
            "gelar_belakang",
            "no_reg_asesor",
            "no_lisensi",
            "bidang_keahlian",
            "foto_profil"
          ],
          order: [
            [
              "nama_lengkap",
              "ASC"
            ]
          ]
        });

      const result =
        data.map((item) => {
          const dataAsesor =
            item.toJSON();

          const jadwalBentrok =
            conflictMap.get(
              Number(
                dataAsesor.id_user
              )
            );

          return {
            ...dataAsesor,
            tersedia:
              !jadwalBentrok,
            jadwal_bentrok:
              jadwalBentrok ||
              null
          };
        });

      return res.json({
        success: true,
        total:
          result.length,
        jumlah_asesi:
          jumlahAsesi,
        minimal_asesor_penguji:
          minimalAsesorPenguji,
        data: result
      });
    } catch (err) {
      console.error(
        "GET ASESOR ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Data asesor gagal dimuat"
      });
    }
  };

const getJenisTugasAvailable =
  async (req, res) => {
    try {
      return res.json({
        success: true,
        data: [
          {
            jenis_tugas:
              "asesor_penguji",
            keterangan:
              "1 asesor menangani maksimal 10 asesi"
          },
          {
            jenis_tugas:
              "verifikator_tuk",
            minimal: 2,
            maksimal: 2
          },
          {
            jenis_tugas:
              "validator_mkva",
            minimal: 2,
            maksimal: 3
          },
          {
            jenis_tugas:
              "komite_teknis",
            minimal: 1,
            maksimal: 3
          }
        ]
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message:
          "Data jenis tugas gagal dimuat"
      });
    }
  };

module.exports = {
  manageAsesor,
  listAsesorJadwal,
  removeAsesor,
  getAsesorTuk,
  getJenisTugasAvailable
};