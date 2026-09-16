const response = require("../../utils/response.util");
const db = require('../../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    response.success(res, "Dashboard Admin");
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const Skema = db.Skema || db.skema;
    const ProfileAsesor = db.ProfileAsesor || db.profileAsesor;
    const ProfileAsesi = db.ProfileAsesi || db.profileAsesi;
    const Tuk = db.Tuk || db.tuk;
    const Pendaftaran = db.PendaftaranAsesi || db.pendaftaranAsesi;
    const Jadwal = db.Jadwal || db.jadwal;
    const HasilKeputusan = db.HasilKeputusanAsesmen || db.hasil_keputusan_asesmen;

    // ==========================================
    // 1. FILTER ASESI REJECT (Arif Royani dkk)
    // ==========================================
    const rejectedPendaftar = Pendaftaran ? await Pendaftaran.findAll({
      where: { status: { [Op.like]: '%reject%' } },
      attributes: ['nik'] // Ambil NIK yang ditolak
    }).catch(() => []) : [];
    
    const rejectedNiks = rejectedPendaftar.map(p => p.nik).filter(Boolean);

    const totalAsesi = ProfileAsesi ? await ProfileAsesi.count({
      where: rejectedNiks.length > 0 ? {
        nik: { [Op.notIn]: rejectedNiks } // Exclude NIK yang ditolak dari total profil
      } : {}
    }).catch((err) => {
      console.log("Fallback Asesi Count:", err.message);
      return ProfileAsesi.count(); // Jika tabel profile tidak pakai 'nik', hitung semua
    }) : 0;

    // ==========================================
    // 2. HITUNG STATISTIK DASAR LAINNYA
    // ==========================================
    const totalSkema = Skema ? await Skema.count().catch(() => 0) : 0;
    const totalAsesor = ProfileAsesor ? await ProfileAsesor.count().catch(() => 0) : 0;
    const totalTuk = Tuk ? await Tuk.count().catch(() => 0) : 0;

    // ==========================================
    // 3. PERSENTASE KELULUSAN (FOOLPROOF ENUM)
    // ==========================================
    let kompeten = 0;
    let belum = 0;

    if (HasilKeputusan) {
      // Hitung semua yang mengandung kata 'belum'
      belum = await HasilKeputusan.count({ 
        where: { hasil: { [Op.like]: '%belum%' } } 
      }).catch(() => 0);

      // Hitung semua yang mengandung kata 'kompeten' TAPI BUKAN 'belum'
      kompeten = await HasilKeputusan.count({ 
        where: { 
          hasil: { [Op.like]: '%kompeten%' },
          [Op.and]: { hasil: { [Op.notLike]: '%belum%' } }
        } 
      }).catch(() => 0);
    }

    const totalLulus = kompeten + belum;
    let pKomp = 0;
    let pBelum = 0;
    
    if (totalLulus > 0) {
      pKomp = Math.round((kompeten / totalLulus) * 100);
      pBelum = 100 - pKomp;
    }

    // ==========================================
    // 4. GRAFIK PENDAFTAR PER SKEMA
    // ==========================================
    const validRegs = Pendaftaran ? await Pendaftaran.findAll({
      where: { status: { [Op.notLike]: '%tolak%' } } // Jangan hitung yang ditolak
    }).catch(() => []) : [];

    const schemaCounts = {};
    validRegs.forEach((reg) => {
      // Langsung ambil dari kompetensi_keahlian yang ada di pendaftaran
      if (reg.kompetensi_keahlian) {
        schemaCounts[reg.kompetensi_keahlian] = (schemaCounts[reg.kompetensi_keahlian] || 0) + 1;
      }
    });

    const sortedChart = Object.entries(schemaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, val]) => {
        const max = Math.max(...Object.values(schemaCounts), 1);
        const width = `${Math.round((val / max) * 100)}%`;
        return { label: label.length > 20 ? label.substring(0, 20) + "..." : label, val, width };
      });

    // ==========================================
    // 5. PENDAFTARAN & JADWAL TERBARU
    // ==========================================
    const recentRegistrations = Pendaftaran ? await Pendaftaran.findAll({
      limit: 5,
      order: [['tanggal_daftar', 'DESC']]
    }).catch(() => []) : [];

    const schedules = Jadwal ? await Jadwal.findAll({
      limit: 5,
      where: { tgl_awal: { [Op.gte]: new Date(new Date().setHours(0,0,0,0)) } },
      order: [['tgl_awal', 'ASC']]
    }).catch(() => []) : [];

    // ==========================================
    // 6. KIRIM RESPONSE
    // ==========================================
    res.json({
      success: true,
      data: {
        stats: { skema: totalSkema, asesor: totalAsesor, asesi: totalAsesi, tuk: totalTuk },
        recentRegistrations,
        chartData: sortedChart,
        passRate: { kompeten: pKomp, belum: pBelum },
        schedules
      }
    });

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data dashboard", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user)
      return response.error(res, "User tidak ditemukan", 404);

    const rawPassword = await resetUserPassword(user);

    return response.success(res, "Password berhasil direset", {
      username: user.username,
      password: rawPassword
    });

  } catch (err) {
    return response.error(res, err.message);
  }
};
