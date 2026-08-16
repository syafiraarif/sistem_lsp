const {
  HasilKeputusanAsesmen,
  PesertaJadwal,
  Presensi,
  Apl01Asesmen,
  Apl02,
  FrIa05Penilaian,
  ProfileAsesi,
  FrAk03,
  FrAk04,
  FrAk06,
  Jadwal,
  Skema,
  Tuk,
} = require("../../models");

const getIdUser = (req) => {
  return req.user?.id_user || req.user?.id || null;
};

const normalizeStatus = (status) => {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "kompeten") {
    return "kompeten";
  }

  if (
    value === "belum kompeten" ||
    value === "belum_kompeten"
  ) {
    return "belum_kompeten";
  }

  return "belum_tersedia";
};

const toPlain = (data) => {
  if (!data) {
    return null;
  }

  return typeof data.toJSON === "function"
    ? data.toJSON()
    : data;
};

const findPesertaSaya = async (req) => {
  const id_user = getIdUser(req);
  const id_peserta =
    req.query.id_peserta ||
    req.params.id_peserta ||
    null;

  if (!id_user) {
    return null;
  }

  const where = {
    id_user,
  };

  if (id_peserta) {
    where.id_peserta = id_peserta;
  }

  return PesertaJadwal.findOne({
    where,
    include: [
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        required: false,
      },
      {
        model: Jadwal,
        as: "jadwal",
        required: false,
        include: [
          {
            model: Skema,
            as: "skema",
            required: false,
          },
          {
            model: Tuk,
            as: "tuk",
            required: false,
          },
        ],
      },
    ],
    order: [["id_peserta", "DESC"]],
  });
};

const findKeputusan = async (id_peserta) => {
  return HasilKeputusanAsesmen.findOne({
    where: {
      id_peserta,
    },
    order: [
      ["tanggal_keputusan", "DESC"],
      ["id_keputusan", "DESC"],
    ],
  });
};

const getKelengkapan = async (
  id_peserta,
  id_jadwal
) => {
  const [
    presensi,
    apl01,
    apl02,
    fria05,
    frAk03,
    frAk04,
    frAk06,
  ] = await Promise.all([
    Presensi.findOne({
      where: {
        id_peserta,
      },
    }),

    Apl01Asesmen.findOne({
      where: {
        id_peserta,
      },
    }),

    Apl02.findOne({
      where: {
        id_peserta,
      },
    }),

    FrIa05Penilaian.findOne({
      where: {
        id_peserta,
      },
      order: [
        ["tanggal_penilaian", "DESC"],
        ["id_penilaian", "DESC"],
      ],
    }),

    FrAk03.findOne({
      where: {
        id_peserta,
      },
      order: [
        ["id_fr_ak03", "DESC"],
      ],
    }),

    FrAk04.findOne({
      where: {
        id_peserta,
      },
      order: [
        ["id_fr_ak04", "DESC"],
      ],
    }),

    FrAk06.findOne({
      where: {
        id_jadwal,
      },
      order: [
        ["id", "DESC"],
      ],
    }),
  ]);

  const wajibAwal = [
    Boolean(presensi),
    Boolean(apl01),
    Boolean(apl02),
    Boolean(fria05),
  ];

  const tindakLanjut = [
    Boolean(frAk03),
    Boolean(frAk04),
  ];

  return {
    presensi: Boolean(presensi),
    apl01: Boolean(apl01),
    apl02: Boolean(apl02),
    fria05: Boolean(fria05),
    fr_ak03: Boolean(frAk03),
    fr_ak04: Boolean(frAk04),
    frak06: Boolean(frAk06),

    total_wajib_awal: 4,
    total_lengkap_awal:
      wajibAwal.filter(Boolean).length,

    total_tindak_lanjut: 2,
    total_lengkap_tindak_lanjut:
      tindakLanjut.filter(Boolean).length,

    data: {
      presensi,
      apl01,
      apl02,
      fria05,
      fr_ak03: frAk03,
      fr_ak04: frAk04,
      frak06: frAk06,
    },
  };
};

const buildBelumTersediaResponse = async (
  peserta
) => {
  const plainPeserta = toPlain(peserta);
  const jadwal =
    plainPeserta?.jadwal || {};
  const skema =
    jadwal?.skema || {};
  const tuk =
    jadwal?.tuk || {};
  const profile =
    plainPeserta?.profileAsesi || {};

  const kelengkapan =
    await getKelengkapan(
      plainPeserta.id_peserta,
      plainPeserta.id_jadwal
    );

  return {
    id_peserta:
      plainPeserta.id_peserta,

    id_jadwal:
      plainPeserta.id_jadwal,

    id_user:
      plainPeserta.id_user,

    nama_asesi:
      profile.nama_lengkap ||
      profile.nama ||
      "-",

    nik:
      profile.nik ||
      profile.no_ktp ||
      profile.nomor_identitas ||
      profile.no_identitas ||
      "-",

    status_asesmen:
      "belum_tersedia",

    hasil:
      "belum_tersedia",

    is_kompeten:
      false,

    is_belum_kompeten:
      false,

    nilai_akhir:
      plainPeserta.nilai_akhir ||
      kelengkapan.data.fria05?.nilai ||
      null,

    keterangan:
      plainPeserta.keterangan || "",

    catatan_asesor:
      "",

    tanggal_keputusan:
      null,

    keputusan:
      null,

    jadwal: {
      id_jadwal:
        jadwal.id_jadwal ||
        plainPeserta.id_jadwal,

      kode_jadwal:
        jadwal.kode_jadwal ||
        "-",

      nama_kegiatan:
        jadwal.nama_kegiatan ||
        "Jadwal Uji Kompetensi",

      tgl_pra_asesmen:
        jadwal.tgl_pra_asesmen ||
        null,

      tgl_awal:
        jadwal.tgl_awal ||
        null,

      tgl_akhir:
        jadwal.tgl_akhir ||
        null,

      jam:
        jadwal.jam ||
        "-",

      status:
        jadwal.status ||
        "-",
    },

    skema: {
      id_skema:
        skema.id_skema ||
        jadwal.id_skema ||
        null,

      kode_skema:
        skema.kode_skema ||
        "-",

      judul_skema:
        skema.judul_skema ||
        skema.nama_skema ||
        "-",
    },

    tuk: {
      id_tuk:
        tuk.id_tuk ||
        jadwal.id_tuk ||
        null,

      nama_tuk:
        tuk.nama_tuk ||
        tuk.nama ||
        "-",

      alamat:
        tuk.alamat ||
        "-",
    },

    kelengkapan,

    redirect: [],

    can_fill_frak03:
      false,

    can_fill_frak04:
      false,

    can_view_frak03:
      false,

    can_view_frak04:
      false,

    can_view_frak06:
      Boolean(kelengkapan.frak06),

    tindak_lanjut_selesai:
      false,
  };
};

const buildResponse = async ({
  peserta,
  keputusan,
}) => {
  const plainPeserta =
    toPlain(peserta);

  const plainKeputusan =
    toPlain(keputusan);

  const statusAkhir =
    normalizeStatus(
      plainKeputusan?.hasil ||
        plainPeserta?.status_asesmen
    );

  const kelengkapan =
    await getKelengkapan(
      plainPeserta.id_peserta,
      plainPeserta.id_jadwal
    );

  const isBelumKompeten =
    statusAkhir === "belum_kompeten";

  const isKompeten =
    statusAkhir === "kompeten";

  const redirect =
    isBelumKompeten
      ? ["FRAK03", "FRAK04"]
      : [];

  const jadwal =
    plainPeserta?.jadwal || {};

  const skema =
    jadwal?.skema || {};

  const tuk =
    jadwal?.tuk || {};

  const profile =
    plainPeserta?.profileAsesi || {};

  const nilaiAkhir =
    plainPeserta.nilai_akhir !== undefined &&
    plainPeserta.nilai_akhir !== null &&
    plainPeserta.nilai_akhir !== ""
      ? plainPeserta.nilai_akhir
      : kelengkapan.data.fria05?.nilai ??
        null;

  return {
    id_peserta:
      plainPeserta.id_peserta,

    id_jadwal:
      plainPeserta.id_jadwal,

    id_user:
      plainPeserta.id_user,

    nama_asesi:
      profile.nama_lengkap ||
      profile.nama ||
      "-",

    nik:
      profile.nik ||
      profile.no_ktp ||
      profile.nomor_identitas ||
      profile.no_identitas ||
      "-",

    status_asesmen:
      statusAkhir,

    hasil:
      statusAkhir,

    is_kompeten:
      isKompeten,

    is_belum_kompeten:
      isBelumKompeten,

    nilai_akhir:
      nilaiAkhir,

    keterangan:
      plainPeserta.keterangan ||
      plainKeputusan?.catatan_asesor ||
      "",

    catatan_asesor:
      plainKeputusan?.catatan_asesor ||
      plainPeserta.keterangan ||
      "",

    tanggal_keputusan:
      plainKeputusan?.tanggal_keputusan ||
      null,

    keputusan:
      plainKeputusan ||
      null,

    jadwal: {
      id_jadwal:
        jadwal.id_jadwal ||
        plainPeserta.id_jadwal,

      kode_jadwal:
        jadwal.kode_jadwal ||
        "-",

      nama_kegiatan:
        jadwal.nama_kegiatan ||
        "Jadwal Uji Kompetensi",

      tgl_pra_asesmen:
        jadwal.tgl_pra_asesmen ||
        null,

      tgl_awal:
        jadwal.tgl_awal ||
        null,

      tgl_akhir:
        jadwal.tgl_akhir ||
        null,

      jam:
        jadwal.jam ||
        "-",

      status:
        jadwal.status ||
        "-",
    },

    skema: {
      id_skema:
        skema.id_skema ||
        jadwal.id_skema ||
        null,

      kode_skema:
        skema.kode_skema ||
        "-",

      judul_skema:
        skema.judul_skema ||
        skema.nama_skema ||
        "-",
    },

    tuk: {
      id_tuk:
        tuk.id_tuk ||
        jadwal.id_tuk ||
        null,

      nama_tuk:
        tuk.nama_tuk ||
        tuk.nama ||
        "-",

      alamat:
        tuk.alamat ||
        "-",
    },

    kelengkapan,

    redirect,

    can_fill_frak03:
      isBelumKompeten &&
      !kelengkapan.fr_ak03,

    can_fill_frak04:
      isBelumKompeten &&
      !kelengkapan.fr_ak04,

    can_view_frak03:
      isBelumKompeten &&
      kelengkapan.fr_ak03,

    can_view_frak04:
      isBelumKompeten &&
      kelengkapan.fr_ak04,

    can_view_frak06:
      Boolean(kelengkapan.frak06),

    tindak_lanjut_selesai:
      isBelumKompeten &&
      kelengkapan.fr_ak03 &&
      kelengkapan.fr_ak04,
  };
};

exports.getStatusSaya = async (
  req,
  res
) => {
  try {
    const peserta =
      await findPesertaSaya(req);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message:
          "Peserta tidak ditemukan untuk akun ini",
      });
    }

    const keputusan =
      await findKeputusan(
        peserta.id_peserta
      );

    if (!keputusan) {
      const data =
        await buildBelumTersediaResponse(
          peserta
        );

      return res.json({
        status: "success",
        message:
          "Hasil asesmen belum tersedia",
        data,
      });
    }

    const data =
      await buildResponse({
        peserta,
        keputusan,
      });

    return res.json({
      status: "success",
      message:
        "Status hasil asesmen berhasil diambil",
      data,
    });
  } catch (err) {
    console.error(
      "GET STATUS HASIL SAYA ERROR:",
      err
    );

    return res.status(500).json({
      status: "error",
      message:
        "Gagal mengambil status hasil asesmen",
      error: err.message,
    });
  }
};

exports.getHasilSaya = async (
  req,
  res
) => {
  try {
    const peserta =
      await findPesertaSaya(req);

    if (!peserta) {
      return res.status(404).json({
        status: "error",
        message:
          "Peserta tidak ditemukan untuk akun ini",
      });
    }

    const keputusan =
      await findKeputusan(
        peserta.id_peserta
      );

    if (!keputusan) {
      const data =
        await buildBelumTersediaResponse(
          peserta
        );

      return res.json({
        status: "success",
        message:
          "Hasil asesmen belum tersedia",
        data,
      });
    }

    const data =
      await buildResponse({
        peserta,
        keputusan,
      });

    return res.json({
      status: "success",
      message:
        "Detail hasil asesmen berhasil diambil",
      data,
    });
  } catch (err) {
    console.error(
      "GET HASIL SAYA ERROR:",
      err
    );

    return res.status(500).json({
      status: "error",
      message:
        "Gagal mengambil detail hasil asesmen",
      error: err.message,
    });
  }
};