const { DokumenMutu } = require("../../models");

const createDokumen = async (req, res) => {
  try {
    const data = await DokumenMutu.create(req.body);
    res.status(201).json({ message: "Dokumen berhasil ditambah", data });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const getAllDokumen = async (req, res) => {
  try {
    const data = await DokumenMutu.findAll({
      order: [["created_at", "DESC"]]
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const updateDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const dok = await DokumenMutu.findByPk(id);

    if (!dok) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    await dok.update(req.body);
    res.json({ message: "Dokumen berhasil diupdate", data: dok });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const dok = await DokumenMutu.findByPk(id);

    if (!dok) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    await dok.destroy();
    res.json({ message: "Dokumen berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  createDokumen,
  getAllDokumen,
  updateDokumen,
  deleteDokumen
};
