const Feedback = require("../../models/feedback.model");

exports.getAll = async (req, res) => {
  try {
    const data = await Feedback.findAll({
      order: [["created_at", "DESC"]]
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("GET ALL FEEDBACK ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data feedback" });
  }
};

// Mengubah status aktif/tidak aktif (mendukung body { status } dari modal maupun toggle langsung)
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback tidak ditemukan" });
    }

    if (status) {
      if (!["aktif", "tidak_aktif"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status tidak valid" });
      }
      feedback.status = status;
    } else {
      feedback.status = feedback.status === "aktif" ? "tidak_aktif" : "aktif";
    }

    await feedback.save();

    res.status(200).json({ 
      success: true,
      message: `Visibilitas ulasan berhasil diubah menjadi ${feedback.status === "aktif" ? "Ditampilkan" : "Disembunyikan"}`,
      data: feedback 
    });
  } catch (err) {
    console.error("TOGGLE STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengubah status feedback" });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.destroy({
      where: { id_feedback: id }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Feedback tidak ditemukan" });
    }

    res.status(200).json({ success: true, message: "Feedback berhasil dihapus" });
  } catch (err) {
    console.error("DELETE FEEDBACK ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus feedback" });
  }
};