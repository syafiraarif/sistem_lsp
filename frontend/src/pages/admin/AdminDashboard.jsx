import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaLayerGroup,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import {
  ChevronRight,
  ClipboardList,
  CalendarCheck,
  Sparkles,
  Loader2,
  PieChart,
  BarChart3
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ skema: 0, asesor: 0, asesi: 0, tuk: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [passRate, setPassRate] = useState({ kompeten: 0, belum: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard-summary");
        const dashboard = response.data?.data;

        if (dashboard) {
          setStatsData(dashboard.stats || { skema: 0, asesor: 0, asesi: 0, tuk: 0 });
          setChartData(dashboard.chartData || []);
          setPassRate(dashboard.passRate || { kompeten: 0, belum: 0 });

          // Mapping Pendaftaran
          const formattedRegs = (dashboard.recentRegistrations || []).map((reg) => ({
            name: reg.nama_lengkap || "Nama Tidak Diketahui",
            schema: reg.kompetensi_keahlian || "Skema Tidak Diketahui",
            date: new Date(reg.tanggal_daftar || reg.createdAt || new Date()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: reg.status || "Menunggu",
          }));
          setRecentRegistrations(formattedRegs);

          // Mapping Jadwal
          const formattedSchedules = (dashboard.schedules || []).map((j) => {
            const d = new Date(j.tgl_awal || new Date());
            return {
              day: d.getDate().toString().padStart(2, "0"),
              month: d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
              title: j.nama_kegiatan || "Uji Kompetensi",
              time: j.pelaksanaan_uji ? j.pelaksanaan_uji.toUpperCase() : "TUK",
            };
          });
          setScheduleData(formattedSchedules);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hitung jumlah riil asesi kompeten & belum kompeten
  const totalAsesi = statsData.asesi || 0;
  const persenKompeten = Number(passRate.kompeten || 0);
  const persenBelum = Number(passRate.belum || (100 - persenKompeten));
  const jumlahKompeten = Math.round((persenKompeten / 100) * totalAsesi);
  const jumlahBelum = Math.max(0, totalAsesi - jumlahKompeten);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
          <p className="text-[14px] font-bold text-[#071E3D]">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">

        {/* HEADER SECTION (Gaya Modul Asesor) */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                Ringkasan Sertifikasi
              </h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Pantau statistik pendaftaran, skema, asesor, serta status kelulusan asesi secara terpusat.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <button
                type="button"
                onClick={() => navigate("/admin/verifikasi-pendaftaran")}
                className="flex-1 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 md:flex-none"
              >
                Verifikasi Pendaftaran
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/laporan-sertifikasi")}
                className="flex-1 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] hover:shadow-md md:flex-none"
              >
                Laporan Sertifikasi
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARD KOTAK-KOTAK ANGKA */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<FaLayerGroup size={20} />}
            label="Total Skema"
            value={`${statsData.skema} Skema`}
            tone="orange"
            onClick={() => navigate("/admin/skema")}
          />
          <StatCard
            icon={<FaUserTie size={20} />}
            label="Total Asesor"
            value={`${statsData.asesor} Asesor`}
            tone="navy"
            onClick={() => navigate("/admin/asesor")}
          />
          <StatCard
            icon={<FaUsers size={20} />}
            label="Total Asesi"
            value={`${statsData.asesi} Asesi`}
            tone="green"
            onClick={() => navigate("/admin/asesi/tambah")}
          />
          <StatCard
            icon={<FaBuilding size={20} />}
            label="Data TUK"
            value={`${statsData.tuk} Lokasi`}
            tone="orange"
            onClick={() => navigate("/admin/tuk")}
          />
        </div>

        {/* SECTION: PENDAFTAR PER SKEMA & TABEL KELULUSAN */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Pendaftar per Skema */}
          <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4">
              <BarChart3 size={18} className="text-[#CC6B27]" />
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#FAFAFA]">
                Pendaftar per Skema
              </h2>
            </div>
            
            <div className="p-5 max-h-[380px] overflow-y-auto custom-scrollbar">
              {chartData.length === 0 ? (
                <div className="py-12 text-center text-[13.5px] font-medium text-[#182D4A]/50">
                  Belum ada data pendaftar per skema
                </div>
              ) : (
                <div className="space-y-4">
                  {chartData.map((bar, index) => (
                    <div key={index} className="rounded-xl border border-[#071E3D]/5 bg-[#FAFAFA] p-3.5 transition-all hover:border-[#CC6B27]/20 hover:bg-[#CC6B27]/5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-[#071E3D] truncate max-w-[70%]">
                          {index + 1}. {bar.label}
                        </span>
                        <span className="font-black text-[#182D4A] whitespace-nowrap">
                          {bar.val} Asesi
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#071E3D]/10">
                        <div
                          className="h-full rounded-full bg-[#CC6B27] transition-all duration-500"
                          style={{ width: bar.width || "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabel Kelulusan Asesi (Pengganti Diagram Bulat) */}
          <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4">
              <PieChart size={18} className="text-[#CC6B27]" />
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#FAFAFA]">
                Rekap Hasil Uji Kompetensi
              </h2>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Mini cards kompeten & belum kompeten */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-green-200 bg-green-50/70 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <FaCheckCircle size={16} />
                    <span className="text-[11px] font-black uppercase tracking-wider">Kompeten</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-green-700">{jumlahKompeten} <span className="text-xs font-semibold text-green-600">Asesi</span></p>
                  <p className="mt-0.5 text-xs font-bold text-green-700/80">{persenKompeten}% dari total asesi</p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <FaTimesCircle size={16} />
                    <span className="text-[11px] font-black uppercase tracking-wider">Belum Kompeten</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-red-600">{jumlahBelum} <span className="text-xs font-semibold text-red-500">Asesi</span></p>
                  <p className="mt-0.5 text-xs font-bold text-red-600/80">{persenBelum}% dari total asesi</p>
                </div>
              </div>

              {/* Tabel perincian */}
              <div className="overflow-hidden rounded-lg border border-[#071E3D]/10">
                <table className="w-full border-collapse bg-white text-left">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#071E3D]/10 text-[12px] font-bold uppercase tracking-wider text-[#071E3D]">
                      <th className="px-4 py-3">Status Keputusan</th>
                      <th className="px-4 py-3 text-center">Jumlah Asesi</th>
                      <th className="px-4 py-3 text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#071E3D]/5 text-[13px]">
                    <tr className="hover:bg-green-50/30">
                      <td className="px-4 py-3 font-bold text-green-700 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        Kompeten (K)
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-[#071E3D]">{jumlahKompeten}</td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">{persenKompeten}%</td>
                    </tr>
                    <tr className="hover:bg-red-50/30">
                      <td className="px-4 py-3 font-bold text-red-600 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        Belum Kompeten (BK)
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-[#071E3D]">{jumlahBelum}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-600">{persenBelum}%</td>
                    </tr>
                    <tr className="bg-[#FAFAFA] font-black text-[#071E3D]">
                      <td className="px-4 py-3">Total Peserta</td>
                      <td className="px-4 py-3 text-center">{totalAsesi}</td>
                      <td className="px-4 py-3 text-center">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: PENDAFTARAN TERBARU & JADWAL TERDEKAT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Tabel Pendaftaran Terbaru (2 Kolom) */}
          <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-3 border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-[#FAFAFA]">
                <ClipboardList size={18} className="text-[#CC6B27]" />
                Pendaftaran Masuk Terbaru
              </h2>
              <button
                onClick={() => navigate("/admin/verifikasi-pendaftaran")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FAFAFA] hover:text-[#CC6B27] transition-colors"
              >
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse bg-white text-left">
                <thead>
                  <tr className="border-b border-[#071E3D]/10 bg-[#FAFAFA] text-[12px] font-bold uppercase tracking-wider text-[#071E3D]">
                    <th className="px-4 py-3.5">Nama Asesi</th>
                    <th className="px-4 py-3.5">Skema</th>
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-[13.5px] font-medium text-[#182D4A]/50">
                        Belum ada data pendaftaran masuk
                      </td>
                    </tr>
                  ) : (
                    recentRegistrations.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                        <td className="px-4 py-3.5 text-[13.5px] font-bold text-[#071E3D]">{row.name}</td>
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[#182D4A]/80">{row.schema}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#182D4A]/70">{row.date}</td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agenda Jadwal Terdekat (1 Kolom) */}
          <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4">
              <CalendarCheck size={18} className="text-[#CC6B27]" />
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#FAFAFA]">
                Jadwal Terdekat
              </h2>
            </div>

            <div className="space-y-3 p-5 max-h-[380px] overflow-y-auto custom-scrollbar">
              {scheduleData.length === 0 ? (
                <p className="py-12 text-center text-[13.5px] font-medium text-[#182D4A]/50">
                  Belum ada jadwal asesmen terdekat
                </p>
              ) : (
                scheduleData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => navigate("/admin/jadwal/uji-kompetensi")}
                    className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-3 transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5"
                  >
                    <div className="flex min-w-[54px] flex-col items-center justify-center rounded-lg bg-[#071E3D] px-2 py-2 text-white">
                      <span className="text-lg font-black leading-none">{item.day}</span>
                      <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-[#CC6B27]">
                        {item.month}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-[#071E3D]">{item.title}</p>
                      <p className="text-[11px] font-semibold text-[#182D4A]/60">{item.time}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#182D4A]/40" />
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#071E3D]/10 p-4">
              <button
                type="button"
                onClick={() => navigate("/admin/jadwal/uji-kompetensi")}
                className="w-full rounded-lg bg-[#CC6B27]/10 px-4 py-2.5 text-[12px] font-black uppercase tracking-wider text-[#CC6B27] transition-all hover:bg-[#CC6B27] hover:text-white"
              >
                Lihat Semua Jadwal
              </button>
            </div>
          </div>
        </div>

        {/* SCROLLBAR CUSTOM */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
        ` }} />

      </div>
    </div>
  );
};

/* --- STAT CARD KOTAK (PERSIS SEPERTI DI MODUL ASESOR) --- */
const StatCard = ({ icon, label, value, tone = "orange", onClick }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    navy: "bg-[#071E3D]/10 text-[#071E3D]"
  };

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#CC6B27]/30"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p>
      </div>
    </div>
  );
};

/* --- STATUS BADGE (KONSISTEN DENGAN ASESOR) --- */
function StatusBadge({ status }) {
  const s = status?.toLowerCase() || "";
  let badgeStyle = "border-orange-200 bg-orange-50 text-[#CC6B27]";

  if (s.includes("terima") || s.includes("kompeten") || s.includes("aktif")) {
    badgeStyle = "border-green-200 bg-green-50 text-green-600";
  } else if (s.includes("tolak") || s.includes("belum") || s.includes("nonaktif")) {
    badgeStyle = "border-red-200 bg-red-50 text-red-600";
  } else if (s.includes("verifikasi") || s.includes("proses")) {
    badgeStyle = "border-blue-200 bg-blue-50 text-blue-600";
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
      {status}
    </span>
  );
}

export default AdminDashboard;