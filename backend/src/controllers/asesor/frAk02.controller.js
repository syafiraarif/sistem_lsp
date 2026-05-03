const {
  FrAk02,
  FrAk02Detail,
  PresensiAsesor,
  JadwalAsesor,
  PesertaJadwal
} = require("../../models");

const response = require("../../utils/response.util");


// ==========================
// 1. SUBMIT FR.AK.02
// ==========================
const submitFrAk02 = async (req, res) => {
  try {
    const id_asesor = req.user.id_user;

    const {
      id_jadwal,
      id_peserta,
      tanggal_mulai,
      tanggal_selesai,
      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor,
      detail
    } = req.body;

    // 🔥 VALIDASI WAJIB
    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal dan id_peserta wajib diisi"
      });
    }

    if (!ttd_asesor) {
      return res.status(400).json({
        message: "Tanda tangan asesor wajib diisi"
      });
    }

    // ==========================
    // VALIDASI PRESENSI
    // ==========================
    const presensi = await PresensiAsesor.findOne({
      where: { id_jadwal, id_user: id_asesor }
    });

    if (!presensi) {
      return res.status(403).json({
        message: "Harap lakukan presensi terlebih dahulu"
      });
    }

    // ==========================
    // VALIDASI TUGAS
    // ==========================
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    // ==========================
    // VALIDASI PESERTA
    // ==========================
    const peserta = await PesertaJadwal.findOne({
      where: { id_peserta, id_jadwal }
    });

    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal ini"
      });
    }

    // ==========================
    // CEK DUPLIKAT
    // ==========================
    const existing = await FrAk02.findOne({
      where: { id_jadwal, id_peserta }
    });

    if (existing) {
      return res.status(400).json({
        message: "FR.AK.02 sudah diisi untuk peserta ini"
      });
    }

    // ==========================
    // SIMPAN HEADER
    // ==========================
    const header = await FrAk02.create({
      id_jadwal,
      id_peserta,
      id_asesor,
      tanggal_mulai,
      tanggal_selesai,
      rekomendasi,
      tindak_lanjut,
      komentar_asesor,
      ttd_asesor
    });

    // ==========================
    // SIMPAN DETAIL (UNIT)
    // ==========================
    if (detail && Array.isArray(detail)) {
      const detailData = detail.map((d) => ({
        id_fr_ak02: header.id_fr_ak02,
        id_unit: d.id_unit,
        observasi: !!d.observasi,
        portofolio: !!d.portofolio,
        pihak_ketiga: !!d.pihak_ketiga,
        wawancara: !!d.wawancara,
        lisan: !!d.lisan,
        tertulis: !!d.tertulis,
        proyek: !!d.proyek,
        lainnya: !!d.lainnya
      }));

      await FrAk02Detail.bulkCreate(detailData);
    }

    return res.status(201).json({
      message: "FR.AK.02 berhasil disimpan",
      id_fr_ak02: header.id_fr_ak02
    });

  } catch (err) {
    console.error("❌ Submit FR.AK.02 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};



// ==========================
// 2. GET DETAIL FR.AK.02
// ==========================
const getFrAk02 = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.query;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal dan id_peserta wajib"
      });
    }

    const data = await FrAk02.findOne({
      where: { id_jadwal, id_peserta },
      include: [
        {
          model: FrAk02Detail,
          as: "detail",
          include: [
            {
              association: "unit"
            }
          ]
        }
      ]
    });

    return res.json({ data });

  } catch (err) {
    console.error("❌ Get FR.AK.02 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ==========================
// 3. UPDATE FR.AK.02
// ==========================
const updateFrAk02 = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await FrAk02.findByPk(id);

    if (!existing) {
      return res.status(404).json({
        message: "Data FR.AK.02 tidak ditemukan"
      });
    }

    // update header
    await FrAk02.update(req.body, {
      where: { id_fr_ak02: id }
    });

    return res.json({
      message: "FR.AK.02 berhasil diupdate"
    });

  } catch (err) {
    console.error("❌ Update FR.AK.02 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ==========================
// 4. LIST PER JADWAL
// ==========================
const listFrAk02 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await FrAk02.findAll({
      where: { id_jadwal },
      order: [["created_at", "DESC"]]
    });

    return res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error("❌ List FR.AK.02 Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  submitFrAk02,
  getFrAk02,
  updateFrAk02,
  listFrAk02
};