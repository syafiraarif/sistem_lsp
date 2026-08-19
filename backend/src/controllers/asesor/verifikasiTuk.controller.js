const {
  VerifikasiTuk,
  VerifikasiTukDetail,
  PersyaratanTuk,
  ProfileAsesor,
  JadwalAsesor,
  Jadwal,
  Skema,
  Tuk
} = require("../../models");

const response = require("../../utils/response.util");

const formatDateOnly = (date) => {
  if (!date) return null;

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d;
};

const buildDefaultDetail = (persyaratan = []) => {
  return persyaratan.map((item) => ({
    id_persyaratan_tuk: item.id_persyaratan_tuk,
    nama_perlengkapan:
      item.nama_perlengkapan || "",
    spesifikasi:
      item.spesifikasi || "",
    jumlah_total: 0,
    jumlah_baik: 0,
    jumlah_rusak: 0,
    keterangan: ""
  }));
};

const normalizeDetail = (item, persyaratan = null) => {
  return {
    id_detail:
      item?.id_detail || null,
    id_verifikasi_detail:
      item?.id_verifikasi_detail || null,
    id_persyaratan_tuk:
      item?.id_persyaratan_tuk ||
      persyaratan?.id_persyaratan_tuk ||
      null,
    nama_perlengkapan:
      persyaratan?.nama_perlengkapan ||
      item?.nama_perlengkapan ||
      "",
    spesifikasi:
      item?.spesifikasi ??
      persyaratan?.spesifikasi ??
      "",
    jumlah_total:
      item?.jumlah_total ?? 0,
    jumlah_baik:
      item?.jumlah_baik ?? 0,
    jumlah_rusak:
      item?.jumlah_rusak ?? 0,
    keterangan:
      item?.keterangan || ""
  };
};

exports.getJadwalVerifikasi = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await JadwalAsesor.findAll({
      where: {
        id_user,
        jenis_tugas: "verifikator_tuk",
        status: "aktif"
      },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
          required: true,
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
      ],
      order: [
        ["created_at", "DESC"]
      ]
    });

    const result = data.map((item) => {
      const jadwal = item.jadwal;

      return {
        id_jadwal:
          jadwal?.id_jadwal,
        nama_kegiatan:
          jadwal?.nama_kegiatan,
        tanggal:
          jadwal?.tgl_awal,
        tgl_awal:
          jadwal?.tgl_awal,
        tgl_akhir:
          jadwal?.tgl_akhir,
        skema:
          jadwal?.skema?.judul_skema ||
          "-",
        kode_skema:
          jadwal?.skema?.kode_skema ||
          "-",
        tempat:
          jadwal?.tuk?.nama_tuk ||
          "-",
        nama_tuk:
          jadwal?.tuk?.nama_tuk ||
          "-",
        metode_asesmen:
          "Observasi/Demonstrasi/Praktek/Tes Tulis/Wawancara",
        boleh_verifikasi: true
      };
    });

    return response.success(
      res,
      "Jadwal Verifikasi",
      result
    );
  } catch (err) {
    console.error(
      "GET JADWAL VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};

exports.getForm = async (req, res) => {
  try {
    const data =
      await PersyaratanTuk.findAll({
        order: [
          ["id_persyaratan_tuk", "ASC"]
        ]
      });

    return response.success(
      res,
      "Form Verifikasi",
      data
    );
  } catch (err) {
    console.error(
      "GET FORM VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const tugas =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user,
          jenis_tugas:
            "verifikator_tuk",
          status: "aktif"
        },
        include: [
          {
            model: Jadwal,
            as: "jadwal",
            required: true,
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

    if (
      !tugas ||
      !tugas.jadwal
    ) {
      return response.error(
        res,
        "Jadwal verifikasi TUK tidak ditemukan",
        404
      );
    }

    const jadwal =
      tugas.jadwal;

    const persyaratan =
      await PersyaratanTuk.findAll({
        order: [
          ["id_persyaratan_tuk", "ASC"]
        ]
      });

    const existing =
      await VerifikasiTuk.findOne({
        where: {
          id_jadwal,
          id_user
        },
        include: [
          {
            model: VerifikasiTukDetail,
            as: "details",
            required: false,
            include: [
              {
                model: PersyaratanTuk,
                as: "persyaratan",
                required: false
              }
            ]
          }
        ]
      });

    let detail =
      buildDefaultDetail(
        persyaratan
      );

    if (
      existing &&
      Array.isArray(
        existing.details
      )
    ) {
      const existingMap =
        new Map();

      existing.details.forEach(
        (item) => {
          existingMap.set(
            Number(
              item.id_persyaratan_tuk
            ),
            item
          );
        }
      );

      detail =
        persyaratan.map(
          (item) => {
            const saved =
              existingMap.get(
                Number(
                  item.id_persyaratan_tuk
                )
              );

            return normalizeDetail(
              saved,
              item
            );
          }
        );
    }

    const result = {
      id_jadwal:
        jadwal.id_jadwal,
      nama_kegiatan:
        jadwal.nama_kegiatan,
      nama_tuk:
        jadwal.tuk?.nama_tuk ||
        "-",
      tempat:
        jadwal.tuk?.nama_tuk ||
        "-",
      tgl_awal:
        formatDateOnly(
          jadwal.tgl_awal
        ),
      tgl_akhir:
        formatDateOnly(
          jadwal.tgl_akhir
        ),
      tanggal:
        jadwal.tgl_awal,
      metode_asesmen:
        "Observasi/Demonstrasi/Praktek/Tes Tulis/Wawancara",
      skema:
        jadwal.skema?.judul_skema ||
        "-",
      kode_skema:
        jadwal.skema?.kode_skema ||
        "-",
      id_verifikasi:
        existing?.id_verifikasi ||
        null,
      keputusan:
        existing?.keputusan ||
        "Sesuai persyaratan teknis Tempat Uji Kompetensi (TUK)",
      ttd_asesor:
        existing?.ttd_asesor ||
        null,
      detail
    };

    return response.success(
      res,
      existing
        ? "Detail Verifikasi"
        : "Form Verifikasi Baru",
      result
    );
  } catch (err) {
    console.error(
      "GET DETAIL VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};

exports.submit = async (req, res) => {
  const t =
    await VerifikasiTuk.sequelize.transaction();

  try {
    const id_user =
      req.user.id_user;

    const { id_jadwal } =
      req.params;

    const tugas =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user,
          jenis_tugas:
            "verifikator_tuk",
          status: "aktif"
        }
      });

    if (!tugas) {
      await t.rollback();

      return response.error(
        res,
        "Tidak diizinkan",
        403
      );
    }

    const exist =
      await VerifikasiTuk.findOne({
        where: {
          id_jadwal,
          id_user
        }
      });

    if (exist) {
      await t.rollback();

      return response.error(
        res,
        "Sudah mengisi"
      );
    }

    const profile =
      await ProfileAsesor.findOne({
        where: {
          id_user
        }
      });

    const verifikasi =
      await VerifikasiTuk.create(
        {
          id_jadwal,
          id_user,
          keputusan:
            req.body.keputusan ||
            "Sesuai persyaratan teknis Tempat Uji Kompetensi (TUK)",
          ttd_asesor:
            profile?.ttd_path ||
            null
        },
        {
          transaction: t
        }
      );

    const detailData =
      Array.isArray(
        req.body.detail
      )
        ? req.body.detail.map(
            (item) => ({
              id_verifikasi:
                verifikasi.id_verifikasi,
              id_persyaratan_tuk:
                item.id_persyaratan_tuk,
              spesifikasi:
                item.spesifikasi ||
                "",
              jumlah_total:
                Number(
                  item.jumlah_total ||
                    0
                ),
              jumlah_baik:
                Number(
                  item.jumlah_baik ||
                    0
                ),
              jumlah_rusak:
                Number(
                  item.jumlah_rusak ||
                    0
                ),
              keterangan:
                item.keterangan ||
                ""
            })
          )
        : [];

    if (
      detailData.length
    ) {
      await VerifikasiTukDetail.bulkCreate(
        detailData,
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return response.success(
      res,
      "Verifikasi berhasil",
      {
        id_verifikasi:
          verifikasi.id_verifikasi
      }
    );
  } catch (err) {
    await t.rollback();

    console.error(
      "SUBMIT VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};

exports.update = async (req, res) => {
  const t =
    await VerifikasiTuk.sequelize.transaction();

  try {
    const {
      id_verifikasi
    } = req.params;

    const id_user =
      req.user.id_user;

    const data =
      await VerifikasiTuk.findOne({
        where: {
          id_verifikasi,
          id_user
        }
      });

    if (!data) {
      await t.rollback();

      return response.error(
        res,
        "Data tidak ditemukan",
        404
      );
    }

    await data.update(
      {
        keputusan:
          req.body.keputusan ||
          "Sesuai persyaratan teknis Tempat Uji Kompetensi (TUK)"
      },
      {
        transaction: t
      }
    );

    await VerifikasiTukDetail.destroy(
      {
        where: {
          id_verifikasi
        },
        transaction: t
      }
    );

    const details =
      Array.isArray(
        req.body.detail
      )
        ? req.body.detail.map(
            (item) => ({
              id_verifikasi,
              id_persyaratan_tuk:
                item.id_persyaratan_tuk,
              spesifikasi:
                item.spesifikasi ||
                "",
              jumlah_total:
                Number(
                  item.jumlah_total ||
                    0
                ),
              jumlah_baik:
                Number(
                  item.jumlah_baik ||
                    0
                ),
              jumlah_rusak:
                Number(
                  item.jumlah_rusak ||
                    0
                ),
              keterangan:
                item.keterangan ||
                ""
            })
          )
        : [];

    if (
      details.length
    ) {
      await VerifikasiTukDetail.bulkCreate(
        details,
        {
          transaction: t
        }
      );
    }

    await t.commit();

    return response.success(
      res,
      "Update berhasil"
    );
  } catch (err) {
    await t.rollback();

    console.error(
      "UPDATE VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};

exports.downloadPdf = async (
  req,
  res
) => {
  try {
    const {
      id_verifikasi
    } = req.params;

    const data =
      await VerifikasiTuk.findOne({
        where: {
          id_verifikasi
        },
        include: [
          {
            model: VerifikasiTukDetail,
            as: "details",
            required: false,
            include: [
              {
                model: PersyaratanTuk,
                as: "persyaratan",
                required: false
              }
            ]
          }
        ]
      });

    if (!data) {
      return response.error(
        res,
        "Data tidak ditemukan",
        404
      );
    }

    return response.success(
      res,
      "PDF belum tersedia",
      data
    );
  } catch (err) {
    console.error(
      "DOWNLOAD PDF VERIFIKASI TUK ERROR:",
      err
    );

    return response.error(
      res,
      err.message
    );
  }
};