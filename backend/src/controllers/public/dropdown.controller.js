const axios = require("axios");
const { Jadwal, Tuk, Skema } = require("../../models");

exports.getWilayahUjiDropdown = async (req, res) => {
  try {
    const data = await Jadwal.findAll({
      where: { status: "open" },
      attributes: ["id_jadwal", "nama_kegiatan"],
      include: [
        {
          model: Tuk,
          as: "tuk",
          attributes: ["id_tuk", "nama_tuk", "kota", "provinsi"],
        },
      ],
      order: [["tgl_awal", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil wilayah uji" });
  }
};


exports.getSkemaDropdown = async (req, res) => {
  try {
    const data = await Skema.findAll({
      where: { status: "aktif" },
      attributes: ["id_skema", "judul_skema"],
      order: [["judul_skema", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil skema" });
  }
};

exports.getKebangsaanDropdown = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.restcountries.com/v3.1/all?fields=name,translations"
    );

    const data = response.data
      .map((item) => {
        const nama =
          item.translations?.ind?.common ||
          item.name?.common;

        return {
          value: nama,
          label: nama,
        };
      })
      .filter((item) => item.value)
      .sort((a, b) => a.label.localeCompare(b.label));

    res.json(data);
  } catch (err) {
    console.error("GET KEBANGSAAN ERROR:", err.message);
    res.status(500).json({
      message: "Gagal mengambil data kebangsaan",
    });
  }
};
