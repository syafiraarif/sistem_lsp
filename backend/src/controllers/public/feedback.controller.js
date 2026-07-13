const Feedback = require("../../models/feedback.model");

// Fungsi untuk submit feedback dari public
exports.create = async (req, res) => {
  try {
    const { nama_lengkap, peran, pesan, rating } = req.body;

    if (!nama_lengkap || !peran || !pesan || !rating) {
      return res.status(400).json({ message: "Semua kolom wajib diisi!" });
    }

    const data = await Feedback.create({
      nama_lengkap,
      peran,
      pesan,
      rating
    });

    res.status(201).json({
      message: "Terima kasih, feedback Anda berhasil dikirim!",
      data,
    });
  } catch (err) {
    console.error("FEEDBACK CREATE ERROR:", err);
    res.status(500).json({ message: "Gagal mengirim feedback" });
  }
};

// Fungsi untuk mengambil feedback yang statusnya 'aktif' (ditampilkan di home)
exports.getActiveFeedback = async (req, res) => {
  try {
    const data = await Feedback.findAll({
      where: { status: "aktif" },
      order: [["created_at", "DESC"]],
      limit: 10 // Batasi jumlah yang tampil di home misalnya 10 terbaru
    });

    res.status(200).json({
      message: "Berhasil mengambil data feedback",
      data,
    });
  } catch (err) {
    console.error("GET ACTIVE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data feedback" });
  }
};