const {
  PesertaJadwal,
  User,
  Jadwal,
  JadwalAsesor,
  ProfileAsesi,
  Presensi,
  Apl01Asesmen,
  Apl02,
  FrIa01,
  FrIa02,
  FrIa03,
  FrMapa01,
  FrMapa02,
  FrIa05Penilaian,
  HasilKeputusanAsesmen
} = require("../../models");

const normalizeStatusAsesmen = (status) => {
  if (!status) return "belum_dinilai";
  const value = String(status).toLowerCase().trim();
  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten") return "belum_kompeten";
  if (value === "belum_kompeten") return "belum_kompeten";
  if (value === "terdaftar") return "belum_dinilai";
  if (value === "pra_asesmen") return "belum_dinilai";
  if (value === "asesmen") return "belum_dinilai";
  return value;
};

const getNamaAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};
  return (
    profile.nama_lengkap ||
    profile.nama ||
    user.nama_lengkap ||
    user.nama ||
    user.username ||
    "-"
  );
};

const getNikAsesi = (plain) => {
  const profile = plain.profileAsesi || {};
  return (
    profile.nik ||
    profile.no_ktp ||
    profile.nomor_identitas ||
    profile.no_identitas ||
    "-"
  );
};

const getEmailAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};
  return user.email || profile.email || "-";
};

const getNoHpAsesi = (plain) => {
  const user = plain.user || {};
  const profile = plain.profileAsesi || {};
  return (
    user.no_hp ||
    profile.no_hp ||
    profile.nomor_hp ||
    "-"
  );
};

const getKelengkapanPeserta = async (id_peserta) => {
  const emptyResult = {
    presensi: false,
    apl01: false,
    apl02: false,
    fria01: false,
    fria02: false,
    fria03: false,
    mapa01: false,
    mapa02: false,
    fria05: false,
    keputusan: false,
    presensi_data: null,
    apl01_data: null,
    apl02_data: null,
    fria01_data: null,
    fria02_data: null,
    fria03_data: null,
    mapa01_data: null,
    mapa02_data: null,
    fria05_data: null,
    keputusan_data: null,
    formId: {
      mapa01: null,
      mapa02: null,
      fria01: null,
      fria02: null,
      fria03: null
    },
    total_lengkap: 0,
    total_wajib: 9
  };

  if (!id_peserta) {
    return emptyResult;
  }

  const peserta = await PesertaJadwal.findByPk(id_peserta);

  if (!peserta) {
    return emptyResult;
  }

  const id_jadwal = peserta.id_jadwal;
  const id_user = peserta.id_user;

  const [
    presensi,
    apl01,
    apl02,
    fria01,
    fria02,
    fria03,
    mapa01,
    mapa02,
    fria05,
    keputusan
  ] = await Promise.all([
    Presensi.findOne({
      where: {
        id_peserta
      }
    }),
    Apl01Asesmen.findOne({
      where: {
        id_peserta
      }
    }),
    Apl02.findOne({
      where: {
        id_peserta
      }
    }),
    FrIa01.findOne({
      where: {
        id_peserta
      },
      order: [
        ["id_fr_ia_01", "DESC"]
      ]
    }),
    FrIa02.findOne({
      where: {
        id_jadwal
      },
      order: [
        ["id_fr_ia_02", "DESC"]
      ]
    }),
    FrIa03.findOne({
      where: {
        id_jadwal,
        id_asesi: id_user
      },
      order: [
        ["id_fr_ia_03", "DESC"]
      ]
    }),
    FrMapa01.findOne({
      where: {
        id_jadwal
      },
      order: [
        ["id_mapa01", "DESC"]
      ]
    }),
    FrMapa02.findOne({
      where: {
        id_jadwal
      },
      order: [
        ["id_mapa02", "DESC"]
      ]
    }),
    FrIa05Penilaian.findOne({
      where: {
        id_peserta
      },
      order: [
        ["tanggal_penilaian", "DESC"],
        ["id_penilaian", "DESC"]
      ]
    }),
    HasilKeputusanAsesmen.findOne({
      where: {
        id_peserta
      },
      order: [
        ["tanggal_keputusan", "DESC"],
        ["id_keputusan", "DESC"]
      ]
    })
  ]);

  const forms = [
    Boolean(presensi),
    Boolean(apl01),
    Boolean(apl02),
    Boolean(fria01),
    Boolean(fria02),
    Boolean(fria03),
    Boolean(mapa01),
    Boolean(mapa02),
    Boolean(fria05)
  ];

  return {
    presensi: Boolean(presensi),
    apl01: Boolean(apl01),
    apl02: Boolean(apl02),
    fria01: Boolean(fria01),
    fria02: Boolean(fria02),
    fria03: Boolean(fria03),
    mapa01: Boolean(mapa01),
    mapa02: Boolean(mapa02),
    fria05: Boolean(fria05),
    keputusan: Boolean(keputusan),
    presensi_data: presensi,
    apl01_data: apl01,
    apl02_data: apl02,
    fria01_data: fria01,
    fria02_data: fria02,
    fria03_data: fria03,
    mapa01_data: mapa01,
    mapa02_data: mapa02,
    fria05_data: fria05,
    keputusan_data: keputusan,
    formId: {
      mapa01: mapa01?.id_mapa01 || null,
      mapa02: mapa02?.id_mapa02 || null,
      fria01: fria01?.id_fr_ia_01 || null,
      fria02: fria02?.id_fr_ia_02 || null,
      fria03: fria03?.id_fr_ia_03 || null
    },
    total_lengkap: forms.filter(Boolean).length,
    total_wajib: 9
  };
};

const getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        status: "error",
        message: "ID jadwal wajib dikirim"
      });
    }

    const jadwalAsesor = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    if (!jadwalAsesor) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke jadwal ini"
      });
    }

    const data = await PesertaJadwal.findAll({
      where: {
        id_jadwal
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: [
              "password",
              "password_hash"
            ]
          }
        },
        {
          model: ProfileAsesi,
          as: "profileAsesi",
          required: false
        },
        {
          model: Jadwal,
          as: "jadwal",
          required: false
        }
      ],
      order: [
        ["id_peserta", "ASC"]
      ]
    });

    const result = [];

    for (const item of data) {
      const plain = item.toJSON
        ? item.toJSON()
        : item;

      const idPesertaValid =
        plain.id_peserta ||
        plain.id;

      const kelengkapan =
        await getKelengkapanPeserta(
          idPesertaValid
        );

      const nilaiFria05 =
        kelengkapan.fria05_data?.nilai;

      const hasilFria05 =
        kelengkapan.fria05_data?.hasil;

      const keputusan =
        kelengkapan.keputusan_data;

      result.push({
        ...plain,
        id_peserta: idPesertaValid,
        id_jadwal: plain.id_jadwal,
        id_user: plain.id_user,
        nama_lengkap: getNamaAsesi(plain),
        nik: getNikAsesi(plain),
        email: getEmailAsesi(plain),
        no_hp: getNoHpAsesi(plain),
        status_asesmen: normalizeStatusAsesmen(
          keputusan?.hasil ||
            plain.status_asesmen
        ),
        nilai_akhir:
          plain.nilai_akhir !== null &&
          plain.nilai_akhir !== undefined
            ? plain.nilai_akhir
            : nilaiFria05 || "",
        keterangan:
          plain.keterangan ||
          keputusan?.catatan_asesor ||
          "",
        hasil_keputusan:
          keputusan || null,
        fria05_penilaian:
          kelengkapan.fria05_data || null,
        nilai_fria05:
          nilaiFria05 || null,
        hasil_fria05:
          hasilFria05 || null,
        kelengkapan,
        user: plain.user || {},
        profileAsesi:
          plain.profileAsesi || {},
        ttd_path:
          plain.profileAsesi?.ttd_path ||
          null
      });
    }

    return res.json({
      status: "success",
      message:
        "Data peserta jadwal berhasil diambil",
      data: result
    });
  } catch (err) {
    console.error(
      "GET PESERTA BY JADWAL ERROR:",
      err
    );

    return res.status(500).json({
      status: "error",
      message:
        "Terjadi kesalahan server",
      error: err.message
    });
  }
};

const updateNilaiPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const {
      status_asesmen,
      nilai_akhir,
      keterangan
    } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID peserta wajib dikirim"
      });
    }

    const peserta =
      await PesertaJadwal.findByPk(id);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message: "Peserta tidak ditemukan"
      });
    }

    const jadwalAsesor =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal:
            peserta.id_jadwal,
          id_user
        }
      });

    if (!jadwalAsesor) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses untuk menilai peserta pada jadwal ini"
      });
    }

    await peserta.update({
      status_asesmen:
        status_asesmen !== undefined &&
        status_asesmen !== null
          ? normalizeStatusAsesmen(
              status_asesmen
            )
          : peserta.status_asesmen,
      nilai_akhir:
        nilai_akhir !== undefined &&
        nilai_akhir !== null &&
        nilai_akhir !== ""
          ? nilai_akhir
          : peserta.nilai_akhir,
      keterangan:
        keterangan !== undefined
          ? keterangan
          : peserta.keterangan
    });

    await peserta.reload();

    return res.json({
      status: "success",
      message:
        "Nilai peserta berhasil diupdate",
      data: peserta
    });
  } catch (err) {
    console.error(
      "UPDATE NILAI PESERTA ERROR:",
      err
    );

    return res.status(500).json({
      status: "error",
      message:
        "Terjadi kesalahan server",
      error: err.message
    });
  }
};

const getDetailPeserta = async (req, res) => {
  try {
    const { id_peserta } =
      req.params;

    const id_user =
      req.user.id_user;

    const peserta =
      await PesertaJadwal.findOne({
        where: {
          id_peserta
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: {
              exclude: [
                "password",
                "password_hash"
              ]
            }
          },
          {
            model: ProfileAsesi,
            as: "profileAsesi"
          },
          {
            model: Jadwal,
            as: "jadwal"
          }
        ]
      });

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message:
          "Peserta tidak ditemukan"
      });
    }

    const cekAkses =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal:
            peserta.id_jadwal,
          id_user
        }
      });

    if (!cekAkses) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses ke peserta ini"
      });
    }

    const plain =
      peserta.toJSON();

    const kelengkapan =
      await getKelengkapanPeserta(
        plain.id_peserta
      );

    return res.json({
      status: "success",
      data: {
        ...plain,
        nama_lengkap:
          getNamaAsesi(plain),
        nik:
          getNikAsesi(plain),
        email:
          getEmailAsesi(plain),
        no_hp:
          getNoHpAsesi(plain),
        status_asesmen:
          normalizeStatusAsesmen(
            plain.status_asesmen
          ),
        kelengkapan
      }
    });
  } catch (err) {
    console.error(
      "GET DETAIL PESERTA ERROR :",
      err
    );

    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

module.exports = {
  getPesertaByJadwal,
  getDetailPeserta,
  updateNilaiPeserta
};