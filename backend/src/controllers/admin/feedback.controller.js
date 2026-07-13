const Feedback = require("../../models/feedback.model");

// Mengambil semua feedback (aktif maupun tidak aktif)
exports.getAll = async (req, res) => {
  try {
    const data = await Feedback.findAll({
      order: [["created_at", "DESC"]]
    });
    res.status(200).json({ data });
  } catch (err) {
    console.error("GET ALL FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data feedback" });
  }
};

// Mengubah status aktif/tidak aktif
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback tidak ditemukan" });
    }

    // Toggle status
    feedback.status = feedback.status === "aktif" ? "tidak_aktif" : "aktif";
    await feedback.save();

    res.status(200).json({ 
      message: `Status berhasil diubah menjadi ${feedback.status}`,
      data: feedback 
    });
  } catch (err) {
    console.error("TOGGLE STATUS ERROR:", err);
    res.status(500).json({ message: "Gagal mengubah status feedback" });
  }
};

// Menghapus feedback
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.destroy({
      where: { id_feedback: id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Feedback tidak ditemukan" });
    }

    res.status(200).json({ message: "Feedback berhasil dihapus" });
  } catch (err) {
    console.error("DELETE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus feedback" });
  }
};