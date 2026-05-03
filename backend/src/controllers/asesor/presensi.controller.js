const { PresensiAsesor, JadwalAsesor, Jadwal } = require("../../models");
const response = require("../../utils/response.util");

// ✅ 1. PRESENSI (TTD)
const presensiAsesor = async (req, res) => {
  try {
    const { id_jadwal, ttd_path } = req.body;
    const id_user = req.user.id_user;

    // 🔥 validasi input
    if (!id_jadwal) {
      return res.status(400).json({ message: "id_jadwal wajib diisi" });
    }

    if (!ttd_path) {
      return res.status(400).json({ message: "Tanda tangan wajib diisi" });
    }

    // ✅ cek apakah jadwal ada
    const jadwal = await Jadwal.findByPk(id_jadwal);
    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    // ✅ cek apakah asesor punya tugas di jadwal ini
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    // ✅ cek sudah presensi atau belum
    const existing = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user }
    });

    if (existing) {
      return res.status(400).json({
        message: "Anda sudah melakukan presensi"
      });
    }

    // ✅ simpan presensi
    const presensi = await PresensiAsesor.create({
      id_jadwal,
      id_user,
      waktu_presensi: new Date(),
      ttd_path
    });

    return res.status(201).json({
      message: "Presensi berhasil",
      data: presensi
    });

  } catch (err) {
    console.error("❌ Presensi Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};



// ✅ 2. CEK STATUS PRESENSI (untuk frontend)
const cekPresensi = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const id_user = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        message: "id_jadwal wajib diisi"
      });
    }

    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user }
    });

    return res.json({
      hadir: !!presensi, // 🔥 kunci utama
      data: presensi
    });

  } catch (err) {
    console.error("❌ Cek Presensi Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};



// ✅ 3. GET DETAIL PRESENSI (buat tampil di halaman)
const getDetailPresensi = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;

    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user }
    });

    return res.json({
      data: presensi
    });

  } catch (err) {
    console.error("❌ Get Detail Presensi Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};



// ✅ 4. LIST PRESENSI (optional untuk admin / TUK)
const listPresensi = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PresensiAsesor.findAll({
      where: { id_jadwal },
      order: [["waktu_presensi", "DESC"]]
    });

    return res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error("❌ List Presensi Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


module.exports = {
  presensiAsesor,
  cekPresensi,
  getDetailPresensi,
  listPresensi
};