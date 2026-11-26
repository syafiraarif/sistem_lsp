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
    const PesertaJadwal = db.PesertaJadwal || db.pesertaJadwal;
    const HasilKeputusan = db.HasilKeputusanAsesmen || db.hasil_keputusan_asesmen;

    // 1. FILTER ASESI REJECT
    const rejectedPendaftar = Pendaftaran ? await Pendaftaran.findAll({
      where: { status: { [Op.like]: '%reject%' } },
      attributes: ['nik']
    }).catch(() => []) : [];
    
    const rejectedNiks = rejectedPendaftar.map(p => p.nik).filter(Boolean);

    const totalAsesi = ProfileAsesi ? await ProfileAsesi.count({
      where: rejectedNiks.length > 0 ? {
        nik: { [Op.notIn]: rejectedNiks }
      } : {}
    }).catch(() => ProfileAsesi.count()) : 0;

    // 2. STATISTIK DASAR
    const totalSkema = Skema ? await Skema.count().catch(() => 0) : 0;
    const totalAsesor = ProfileAsesor ? await ProfileAsesor.count().catch(() => 0) : 0;
    const totalTuk = Tuk ? await Tuk.count().catch(() => 0) : 0;

    // 3. PERSENTASE KELULUSAN
    let kompeten = 0;
    let belum = 0;

    if (HasilKeputusan) {
      belum = await HasilKeputusan.count({ 
        where: { hasil: { [Op.like]: '%belum%' } } 
      }).catch(() => 0);

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

    // 4. GRAFIK PENDAFTAR PER SKEMA (Ambil dari PesertaJadwal -> Jadwal -> Skema)
    const allSkema = Skema ? await Skema.findAll({
      attributes: ['id_skema', 'judul_skema']
    }).catch(() => []) : [];

    const pesertaList = PesertaJadwal ? await PesertaJadwal.findAll({
      include: [
        {
          model: Jadwal,
          as: 'jadwal',
          required: true,
          include: [
            {
              model: Skema,
              as: 'skema',
              required: true,
              attributes: ['id_skema', 'judul_skema']
            }
          ]
        }
      ]
    }).catch((err) => {
      console.error("Error fetch peserta per skema:", err.message);
      return [];
    }) : [];

    // Inisialisasi semua skema yang ada agar tetap tampil meski 0 pendaftar (opsional)
    const schemaCounts = {};
    allSkema.forEach((s) => {
      if (s.judul_skema) schemaCounts[s.judul_skema] = 0;
    });

    pesertaList.forEach((p) => {
      const judulSkema = p.jadwal?.skema?.judul_skema;
      if (judulSkema) {
        schemaCounts[judulSkema] = (schemaCounts[judulSkema] || 0) + 1;
      }
    });

    const maxCount = Math.max(...Object.values(schemaCounts), 1);
    const sortedChart = Object.entries(schemaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, val]) => {
        const width = val === 0 ? "0%" : `${Math.round((val / maxCount) * 100)}%`;
        return {
          label: label.length > 28 ? label.substring(0, 28) + "..." : label,
          val,
          width
        };
      });

    // 5. PENDAFTARAN & JADWAL TERBARU
    // Ambil dari PesertaJadwal terbaru supaya kolom Skema terisi, atau fallback ke PendaftaranAsesi
    const recentPeserta = PesertaJadwal ? await PesertaJadwal.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: ProfileAsesi, as: 'profileAsesi', attributes: ['nama_lengkap'] },
        {
          model: Jadwal,
          as: 'jadwal',
          include: [{ model: Skema, as: 'skema', attributes: ['judul_skema'] }]
        }
      ]
    }).catch(() => []) : [];

    const recentRegistrations = recentPeserta.length > 0
      ? recentPeserta.map((item) => ({
          nama_lengkap: item.profileAsesi?.nama_lengkap || "Asesi",
          kompetensi_keahlian: item.jadwal?.skema?.judul_skema || "Skema Tidak Diketahui",
          tanggal_daftar: item.created_at,
          status: item.status_asesmen || "terdaftar"
        }))
      : (Pendaftaran ? await Pendaftaran.findAll({
          limit: 5,
          order: [['tanggal_daftar', 'DESC']]
        }).catch(() => []) : []);

    const schedules = Jadwal ? await Jadwal.findAll({
      limit: 5,
      where: { tgl_awal: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } },
      order: [['tgl_awal', 'ASC']]
    }).catch(() => []) : [];

    // 6. KIRIM RESPONSE
    res.json({
      success: true,
      data: {
        stats: { skema: totalSkema, asesor: totalAsesor, asesi: totalAsesi, tuk: totalTuk },
        recentRegistrations,
        chartData: sortedChart,
        passRate: {
          kompeten: pKomp,
          belum: pBelum,
          jumlahKompeten: kompeten, // Kirim angka real dari HasilKeputusan
          jumlahBelum: belum
        },
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
