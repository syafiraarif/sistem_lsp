const { Tuk } = require("../../models");

exports.getAllPublic = async (req, res) => {
  try {
    const data = await Tuk.findAll({
      where: { status: "aktif" },
      attributes: [
        "id_tuk",
        "kode_tuk",
        "nama_tuk",
        "jenis_tuk",
        "institusi_induk",
        "nama_penanggung_jawab",
        "alamat",
        "kelurahan",
        "kecamatan",
        "kota",
        "provinsi",
        "kode_pos",
        "no_lisensi",
        "masa_berlaku_lisensi",
      ],
      order: [["nama_tuk", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    console.error("Gagal mengambil data TUK publik:", err);
    res.status(500).json({ message: "Gagal ambil data TUK" });
  }
};
