const {
  Skema,
  Persyaratan,
  SkemaUnit,
  UnitKompetensi,
  UnitElemen,
  BiayaUji,
  Jadwal,
  Tuk,
  KelompokPekerjaan,
} = require("../../models");

exports.getAllPublic = async (req, res) => {
  try {
    const data = await Skema.findAll({
      where: { status: "aktif" },
      include: [
        {
          model: Persyaratan,
          attributes: [
            "id_persyaratan",
            "nama_persyaratan",
            "jenis_persyaratan",
            "keterangan",
          ],
          through: {
            attributes: ["wajib"],
          },
        },
        {
          model: SkemaUnit,
          as: "skemaUnit",
          attributes: ["id_skema", "id_kelompok", "id_unit", "urutan"],
          required: false,
          include: [
            {
              model: UnitKompetensi,
              as: "unit",
              attributes: ["id_unit", "kode_unit", "judul_unit"],
              required: false,
              include: [
                {
                  model: UnitElemen,
                  as: "elemen",
                  attributes: ["id_elemen", "id_unit", "nama_elemen", "urutan"],
                  required: false,
                },
              ],
            },
            {
              model: KelompokPekerjaan,
              as: "kelompok",
              attributes: ["id_kelompok", "nama_kelompok"],
              required: false,
            },
          ],
        },
        {
          model: BiayaUji,
          as: "biayaUji",
          attributes: ["id_biaya", "metode_uji", "nominal", "keterangan"],
          required: false,
        },
        {
          model: Jadwal,
          as: "jadwalList",
          attributes: [
            "id_jadwal",
            "kode_jadwal",
            "id_tuk",
            "nama_kegiatan",
            "tgl_pra_asesmen",
            "tahun",
            "periode_bulan",
            "gelombang",
            "tgl_awal",
            "tgl_akhir",
            "jam",
            "pelaksanaan_uji",
            "url_agenda",
            "status",
          ],
          where: { status: "open" },
          required: false,
          include: [
            {
              model: Tuk,
              as: "tuk",
              attributes: [
                "id_tuk",
                "nama_tuk",
                "alamat",
                "kota",
                "provinsi",
                "kode_pos",
              ],
              required: false,
            },
          ],
        },
      ],
      order: [
        ["judul_skema", "ASC"],
        [{ model: SkemaUnit, as: "skemaUnit" }, "urutan", "ASC"],
        [
          { model: SkemaUnit, as: "skemaUnit" },
          { model: UnitKompetensi, as: "unit" },
          { model: UnitElemen, as: "elemen" },
          "urutan",
          "ASC",
        ],
        [{ model: Jadwal, as: "jadwalList" }, "tgl_awal", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET PUBLIC SKEMA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil informasi skema sertifikasi.",
    });
  }
};
