const { PesertaJadwal, Jadwal, Tuk, Skema, User } = require("../../models");
const { Op } = require("sequelize");

/* ===================================================== */
/* GET SEMUA JADWAL TERSEDIA UNTUK ASESI */
/* ===================================================== */
const getJadwalTersedia = async (req, res) => {
  try {
    const data = await Jadwal.findAll({
      where: { status: { [Op.in]: ["open", "ongoing"] } },
      include: [
        { model: Tuk, as: "tuk", attributes: ["id_tuk", "nama_tuk", "email"] },
        { model: Skema, as: "skema", attributes: ["id_skema", "kode_skema", "judul_skema", "jenis_skema"] },
      ],
      order: [["tgl_awal", "ASC"]],
    });
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memuat jadwal tersedia" });
  }
};

/* ===================================================== */
/* ASESI MEMILIH JADWAL */
/* ===================================================== */
const pilihJadwal = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_jadwal } = req.body;

    if (!id_jadwal) return res.status(400).json({ message: "ID Jadwal wajib diisi" });

    const jadwal = await Jadwal.findOne({ where: { id_jadwal, status: { [Op.in]: ["open", "ongoing"] } } });
    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak tersedia atau sudah ditutup" });

    const sudahTerdaftar = await PesertaJadwal.findOne({ where: { id_user, id_jadwal } });
    if (sudahTerdaftar) return res.status(400).json({ message: "Anda sudah terdaftar pada jadwal ini" });

    const peserta = await PesertaJadwal.create({
      id_user,
      id_jadwal,
      status_asesmen: "terdaftar",
      created_at: new Date(),
    });

    return res.status(201).json({ message: "Jadwal berhasil dipilih", data: peserta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memilih jadwal" });
  }
};

/* ===================================================== */
/* GET JADWAL YANG SUDAH DIPILIH ASESI */
/* ===================================================== */
const getJadwalSaya = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await PesertaJadwal.findAll({
      where: { id_user },
      include: [
        {
          model: Jadwal,
          as: "jadwal",
          include: [
            { model: Tuk, as: "tuk", attributes: ["id_tuk", "nama_tuk"] },
            { model: Skema, as: "skema", attributes: ["id_skema", "kode_skema", "judul_skema"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memuat jadwal Anda" });
  }
};

/* ===================================================== */
/* GET DETAIL JADWAL TERTENTU */
/* ===================================================== */
const getDetailJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id },
      include: [
        { model: Tuk, as: "tuk", attributes: ["id_tuk", "nama_tuk", "email"] },
        { model: Skema, as: "skema", attributes: ["id_skema", "kode_skema", "judul_skema", "jenis_skema"] },
      ],
    });
    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    return res.json({ data: jadwal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memuat detail jadwal" });
  }
};

/* ===================================================== */
/* GET PESERTA DI JADWAL TERTENTU */
/* ===================================================== */
const getPesertaJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const peserta = await PesertaJadwal.findAll({
      where: { id_jadwal: id },
      include: [{ model: User, as: "user", attributes: ["id_user", "nama", "email"] }],
    });

    return res.json({ data: peserta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memuat peserta jadwal" });
  }
};

/* ===================================================== */
/* GET ASESOR DI JADWAL TERTENTU */
/* ===================================================== */
const getAsesorJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    // Asumsi tabel Jadwal punya relasi "asesor" (User/Asesor)
    const jadwal = await Jadwal.findOne({
      where: { id_jadwal: id },
      include: [{ model: User, as: "asesor", attributes: ["id_user", "nama", "email"] }],
    });

    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    return res.json({ data: jadwal.asesor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal memuat asesor jadwal" });
  }
};

module.exports = {
  getJadwalTersedia,
  pilihJadwal,
  getJadwalSaya,
  getDetailJadwal,
  getPesertaJadwal,
  getAsesorJadwal,
};