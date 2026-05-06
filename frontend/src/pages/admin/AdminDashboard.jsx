// frontend/src/pages/admin/AdminDashboard.jsx

import React from "react";
import {
  FaLayerGroup,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaEllipsisV,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  PieChart,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const currentYear = new Date().getFullYear();

  const stats = [
    {
      label: "Total Skema",
      value: "12",
      icon: <FaLayerGroup />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Total Asesor",
      value: "45",
      icon: <FaUserTie />,
      color: "text-[#071E3D]",
      bg: "bg-slate-50",
    },
    {
      label: "Total Asesi",
      value: "1,250",
      icon: <FaUsers />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Data TUK",
      value: "8",
      icon: <FaBuilding />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const recentRegistrations = [
    {
      name: "Budi Santoso",
      schema: "Pemrograman Web",
      date: "16 Feb 2026",
      status: "Menunggu",
    },
    {
      name: "Siti Aminah",
      schema: "Desain Grafis",
      date: "16 Feb 2026",
      status: "Verifikasi",
    },
    {
      name: "Andi Saputra",
      schema: "Jaringan Komputer",
      date: "15 Feb 2026",
      status: "Diterima",
    },
    {
      name: "Dewi Lestari",
      schema: "Digital Marketing",
      date: "15 Feb 2026",
      status: "Ditolak",
    },
    {
      name: "Rizky Pratama",
      schema: "Pemrograman Web",
      date: "14 Feb 2026",
      status: "Diterima",
    },
  ];

  const chartData = [
    { label: "Web Dev", val: 850, width: "85%" },
    { label: "Jaringan", val: 600, width: "60%" },
    { label: "Desain", val: 450, width: "45%" },
    { label: "Admin", val: 750, width: "75%" },
  ];

  const scheduleData = [
    {
      day: "18",
      month: "FEB",
      title: "Uji Kompetensi Web",
      time: "08:00 WIB • Lab 1",
    },
    {
      day: "20",
      month: "FEB",
      title: "Uji Komp. Jaringan",
      time: "09:00 WIB • Lab 2",
    },
  ];

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
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Dashboard Admin
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Selamat Datang,
                <br />
                <span className="text-orange-500">Administrator</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Pantau ringkasan sertifikasi, statistik pendaftaran, jadwal
                asesmen, data asesor, asesi, skema, dan TUK dalam satu halaman
                dashboard.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  Lihat Pendaftaran
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Laporan Sertifikasi
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Tahun {currentYear}
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  Sistem Sertifikasi Aktif
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data dashboard menampilkan gambaran umum proses sertifikasi,
                  tren pendaftar, kelulusan, dan agenda asesmen terbaru.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Kompeten" value="70%" />
                  <HeroPill label="Pendaftar" value="1,250" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <MiniStat
              key={index}
              icon={item.icon}
              label={item.label}
              value={item.value}
              color={item.color}
              bg={item.bg}
            />
          ))}
        </section>

        {/* CHARTS GRID */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Bar Chart */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm xl:col-span-2">
            <CardHeader
              icon={<BarChart3 size={22} />}
              badge="Statistik Pendaftaran"
              title={`Pendaftar dan Kandidat Tahun ${currentYear}`}
              desc="Ringkasan jumlah kandidat berdasarkan kelompok skema."
              action
            />

            <div className="space-y-5 p-6">
              {chartData.map((bar, index) => (
                <div key={index} className="grid grid-cols-[90px_1fr_54px] items-center gap-4">
                  <span className="text-sm font-black text-[#071E3D]">
                    {bar.label}
                  </span>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: bar.width }}
                    />
                  </div>

                  <span className="text-right text-sm font-black text-[#071E3D]">
                    {bar.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <CardHeader
              icon={<PieChart size={22} />}
              badge="Kelulusan"
              title="Persentase Kelulusan"
              desc="Perbandingan kompeten dan belum kompeten."
              action
            />

            <div className="flex flex-col items-center p-6 pt-2">
              <div
                className="relative mb-6 flex h-[180px] w-[180px] items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#f97316 0% 70%, #071E3D 70% 100%)",
                }}
              >
                <div className="flex h-[122px] w-[122px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-3xl font-black text-[#071E3D]">
                    70%
                  </span>
                  <small className="mt-1 text-[11px] font-bold text-slate-400">
                    Kompeten
                  </small>
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
          {/* Table */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pendaftaran
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Pendaftaran Terbaru
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Daftar pendaftar terbaru yang masuk ke sistem.
                </p>
              </div>

              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] no-underline transition-all hover:bg-[#071E3D] hover:text-white"
              >
                Lihat Semua
                <ChevronRight size={15} />
              </a>
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
                  {recentRegistrations.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-sm font-black text-[#071E3D]">
                        {row.name}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {row.schema}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {row.date}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <CalendarCheck size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Agenda
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#071E3D]">
                    Jadwal Asesmen
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-400">
                    Agenda asesmen terdekat.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <FaCalendarAlt />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {scheduleData.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 rounded-[26px] border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-orange-100 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex min-w-[68px] flex-col items-center justify-center rounded-2xl bg-[#071E3D] px-4 py-3 text-white shadow-sm">
                    <span className="text-2xl font-black leading-none">
                      {item.day}
                    </span>
                    <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-orange-400">
                      {item.month}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-black text-[#071E3D]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {item.time}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

function MiniStat({ icon, label, value, color, bg }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-xl ${bg} ${color}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-2xl font-black leading-none text-[#071E3D]">
          {value}
        </h3>

        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function CardHeader({ icon, badge, title, desc, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
          <span className="text-orange-500">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
            {badge}
          </span>
        </div>

        <h2 className="text-2xl font-black text-[#071E3D]">{title}</h2>

        <p className="mt-2 text-sm font-medium text-slate-400">{desc}</p>
      </div>

      {action && (
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-500"
        >
          <FaEllipsisV />
        </button>
      )}
    </div>
  );
}

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>

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
  return (
    <th className="border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white">
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Menunggu: "border-orange-100 bg-orange-50 text-orange-500",
    Verifikasi: "border-blue-100 bg-blue-50 text-blue-600",
    Diterima: "border-green-100 bg-green-50 text-green-600",
    Ditolak: "border-red-100 bg-red-50 text-red-500",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        styles[status] || "border-slate-100 bg-slate-50 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

export default AdminDashboard;