import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaLayerGroup,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaEllipsisV,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BarChart3,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  PieChart,
  ShieldCheck,
  Sparkles,
  Loader2
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // State untuk menyimpan data dinamis
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ skema: 0, asesor: 0, asesi: 0, tuk: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [passRate, setPassRate] = useState({ kompeten: 0, belum: 0 });

  // Fungsi Pembantu
  const extractData = (res) => {
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const extractTotal = (res) => {
    if (res.data?.pagination?.totalItems !== undefined) return res.data.pagination.totalItems;
    return extractData(res).length;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          resSkema,
          resAsesor,
          resAsesi,
          resTuk,
          resDaftar,
          resJadwal
        ] = await Promise.all([
          api.get("/admin/skema?limit=1"),
          api.get("/admin/asesor?limit=1"),
          api.get("/admin/asesi?limit=1"),
          api.get("/admin/tuk?limit=1"),
          api.get("/admin/pendaftaran?limit=50"), 
          api.get("/admin/jadwal?limit=5") 
        ]);

        // 1. Set Statistik
        setStatsData({
          skema: extractTotal(resSkema),
          asesor: extractTotal(resAsesor),
          asesi: extractTotal(resAsesi),
          tuk: extractTotal(resTuk),
        });

        const allRegs = extractData(resDaftar);

        // 2. Set Pendaftaran Terbaru
        const formattedRegs = allRegs.slice(0, 5).map((reg) => ({
          name: reg.asesi?.nama_lengkap || reg.user?.profile_asesi?.nama_lengkap || "Nama Tidak Diketahui",
          schema: reg.skema?.nama_skema || "Skema Umum",
          date: new Date(reg.createdAt || reg.tanggal_daftar || new Date()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          status: reg.status || "Menunggu",
        }));
        setRecentRegistrations(formattedRegs);

        // 3. Set Grafik
        const schemaCounts = {};
        allRegs.forEach((reg) => {
          const schemaName = reg.skema?.nama_skema || "Skema Lainnya";
          schemaCounts[schemaName] = (schemaCounts[schemaName] || 0) + 1;
        });

        const sortedChart = Object.entries(schemaCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([label, val]) => {
            const max = Math.max(...Object.values(schemaCounts), 1);
            const width = `${Math.round((val / max) * 100)}%`;
            return { label: label.length > 15 ? label.substring(0, 15) + "..." : label, val, width };
          });

        if (sortedChart.length === 0) {
          sortedChart.push({ label: "Belum ada pendaftar", val: 0, width: "0%" });
        }
        setChartData(sortedChart);

        // 4. Set Pie Chart
        let kompeten = 0;
        let belum = 0;
        allRegs.forEach((reg) => {
          const st = reg.status?.toLowerCase() || "";
          if (st.includes("terima") || st.includes("kompeten") || st.includes("lulus")) kompeten++;
          else if (st.includes("tolak") || st.includes("belum")) belum++;
        });

        const totalLulus = kompeten + belum;
        let pKomp = 0;
        let pBelum = 0;
        if (totalLulus > 0) {
          pKomp = Math.round((kompeten / totalLulus) * 100);
          pBelum = 100 - pKomp;
        } else if (allRegs.length > 0) {
          pKomp = 100;
        }
        setPassRate({ kompeten: pKomp, belum: pBelum });

        // 5. Set Jadwal Terdekat
        const allJadwal = extractData(resJadwal);
        const formattedSchedules = allJadwal.slice(0, 5).map((j) => {
          const d = new Date(j.tanggal || j.waktu_mulai || new Date());
          return {
            day: d.getDate().toString().padStart(2, "0"),
            month: d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
            title: j.nama_jadwal || "Uji Kompetensi",
            time: `${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB • ${j.tuk?.nama_tuk || "TUK"}`,
          };
        });
        setScheduleData(formattedSchedules);

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ PENYESUAIAN LINK NAVIGASI DENGAN ADMINROUTES.JSX
  const stats = [
    { label: "Total Skema", value: statsData.skema, icon: <FaLayerGroup />, color: "text-orange-500", bg: "bg-orange-50", link: "/admin/skema" },
    { label: "Total Asesor", value: statsData.asesor, icon: <FaUserTie />, color: "text-[#071E3D]", bg: "bg-slate-50", link: "/admin/asesor" },
    { label: "Total Asesi", value: statsData.asesi, icon: <FaUsers />, color: "text-green-600", bg: "bg-green-50", link: "/admin/asesi/tambah" },
    { label: "Data TUK", value: statsData.tuk, icon: <FaBuilding />, color: "text-purple-600", bg: "bg-purple-50", link: "/admin/tuk" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="font-bold text-[#071E3D]">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <ShieldCheck size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Dashboard Admin</span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Selamat Datang,<br /><span className="text-orange-500">Administrator</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Pantau ringkasan sertifikasi, statistik pendaftaran, jadwal asesmen, data asesor, asesi, skema, dan TUK dalam satu halaman dashboard yang Real-Time.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => navigate("/admin/verifikasi-pendaftaran")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]">
                  Lihat Pendaftaran <ChevronRight size={17} />
                </button>
                <button onClick={() => navigate("/admin/laporan-sertifikasi")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white">
                  Laporan Sertifikasi <ChevronRight size={17} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">Ringkasan Tahun {currentYear}</p>
                <h2 className="mb-4 text-2xl font-black">Sistem Sertifikasi Aktif</h2>
                <p className="text-sm font-medium leading-relaxed text-white/60">Data dashboard menampilkan gambaran umum proses sertifikasi dan kelulusan secara real-time.</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Kompeten" value={`${passRate.kompeten}%`} />
                  <HeroPill label="Pendaftar" value={statsData.asesi.toLocaleString()} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <div 
              key={index} 
              onClick={() => navigate(item.link)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <MiniStat icon={item.icon} label={item.label} value={item.value.toLocaleString()} color={item.color} bg={item.bg} />
            </div>
          ))}
        </section>

        {/* CHARTS GRID */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Bar Chart */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm xl:col-span-2">
            <CardHeader icon={<BarChart3 size={22} />} badge="Statistik Pendaftaran" title={`Pendaftar per Skema`} desc="Ringkasan jumlah kandidat berdasarkan skema sertifikasi." />
            <div className="space-y-5 p-6">
              {chartData.map((bar, index) => (
                <div key={index} className="grid grid-cols-[110px_1fr_54px] items-center gap-4">
                  <span className="text-xs font-black text-[#071E3D] line-clamp-1">{bar.label}</span>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-orange-500 transition-all duration-1000" style={{ width: bar.width }} />
                  </div>
                  <span className="text-right text-sm font-black text-[#071E3D]">{bar.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <CardHeader icon={<PieChart size={22} />} badge="Kelulusan" title="Persentase Lulus" desc="Perbandingan kompeten dan belum kompeten." />
            <div className="flex flex-col items-center p-6 pt-2">
              <div
                className="relative mb-6 flex h-[180px] w-[180px] items-center justify-center rounded-full transition-all duration-1000"
                style={{ background: `conic-gradient(#f97316 0% ${passRate.kompeten}%, #071E3D ${passRate.kompeten}% 100%)` }}
              >
                <div className="flex h-[122px] w-[122px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-3xl font-black text-[#071E3D]">{passRate.kompeten}%</span>
                  <small className="mt-1 text-[11px] font-bold text-slate-400">Kompeten</small>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <LegendDot color="bg-orange-500" label="Kompeten" />
                <LegendDot color="bg-[#071E3D]" label="Belum Kompeten" />
              </div>
            </div>
          </div>
        </section>

        {/* TABLE & SCHEDULE GRID */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* Recent Registrations Table */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Pendaftaran Terbaru</span>
                </div>
                <h2 className="text-2xl font-black text-[#071E3D]">Pendaftaran Masuk</h2>
                <p className="mt-2 text-sm font-medium text-slate-400">Daftar pendaftar teratas yang masuk ke sistem.</p>
              </div>
              <button onClick={() => navigate("/admin/verifikasi-pendaftaran")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white">
                Lihat Semua <ChevronRight size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#071E3D]">
                    <TableHead>Nama Asesi</TableHead>
                    <TableHead>Skema</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-sm font-bold text-slate-400">Belum ada data pendaftaran</td></tr>
                  ) : (
                    recentRegistrations.map((row, index) => (
                      <tr key={index} className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30">
                        <td className="px-5 py-4 text-sm font-black text-[#071E3D]">{row.name}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">{row.schema}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">{row.date}</td>
                        <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <CalendarCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Agenda</span>
                </div>
                <h2 className="text-2xl font-black text-[#071E3D]">Jadwal Terdekat</h2>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {scheduleData.length === 0 ? (
                 <p className="text-center text-sm font-bold text-slate-400 py-6">Belum ada jadwal asesmen</p>
              ) : (
                scheduleData.map((item, index) => (
                  <div key={index} className="group flex items-center gap-4 rounded-[26px] border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-orange-100 hover:bg-white hover:shadow-sm cursor-pointer" onClick={() => navigate("/admin/jadwal/uji-kompetensi")}>
                    <div className="flex min-w-[68px] flex-col items-center justify-center rounded-2xl bg-[#071E3D] px-4 py-3 text-white shadow-sm">
                      <span className="text-2xl font-black leading-none">{item.day}</span>
                      <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-orange-400">{item.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-sm font-black text-[#071E3D]">{item.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-400 line-clamp-1">{item.time}</p>
                    </div>
                    <ChevronRight size={17} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-orange-500" />
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-100">
               <button onClick={() => navigate("/admin/jadwal/uji-kompetensi")} className="w-full rounded-2xl bg-orange-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500 hover:text-white transition-all">Lihat Semua Jadwal</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

/* --- SUB COMPONENTS --- */

function MiniStat({ icon, label, value, color, bg }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-xl ${bg} ${color}`}>{icon}</div>
      <div className="min-w-0">
        <h3 className="text-2xl font-black leading-none text-[#071E3D]">{value}</h3>
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function CardHeader({ icon, badge, title, desc }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
          <span className="text-orange-500">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{badge}</span>
        </div>
        <h2 className="text-2xl font-black text-[#071E3D]">{title}</h2>
        <p className="mt-2 text-sm font-medium text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function TableHead({ children }) {
  return <th className="border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white">{children}</th>;
}

function StatusBadge({ status }) {
  const styles = {
    Menunggu: "border-orange-100 bg-orange-50 text-orange-500",
    Verifikasi: "border-blue-100 bg-blue-50 text-blue-600",
    Diterima: "border-green-100 bg-green-50 text-green-600",
    Ditolak: "border-red-100 bg-red-50 text-red-500",
  };
  
  let badgeStyle = styles[status];
  if (!badgeStyle) {
    if (status.toLowerCase().includes("terima") || status.toLowerCase().includes("kompeten")) badgeStyle = styles.Diterima;
    else if (status.toLowerCase().includes("tolak") || status.toLowerCase().includes("belum")) badgeStyle = styles.Ditolak;
    else badgeStyle = styles.Menunggu;
  }

  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${badgeStyle}`}>
      {status}
    </span>
  );
}

export default AdminDashboard;