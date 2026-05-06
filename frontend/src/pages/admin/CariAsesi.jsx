// frontend/src/pages/admin/CariAsesi.jsx

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Users,
  BadgeCheck,
  CalendarDays,
  Eye,
  FileSearch,
} from "lucide-react";

const CariAsesi = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  // Dummy fetch - Nanti diganti dengan axios.get('/api/admin/asesi?status=...')
  useEffect(() => {
    // Simulasi pengambilan data dari backend
    // fetchAsesi(searchQuery, filterStatus);
  }, [searchQuery, filterStatus]);

  const dummyData = [
    {
      nik: "3401123456780001",
      nama: "Budi Santoso",
      skema: "Web Developer",
      status: "Kompeten",
    },
  ];

  const totalAsesi = dummyData.length;
  const totalKompeten = dummyData.filter((item) => item.status === "Kompeten").length;
  const totalFilterAktif = filterStatus === "semua" ? "Semua" : filterStatus;

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
                <FileSearch size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Pencarian Data Asesi
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Cari & Filter
                <br />
                <span className="text-orange-500">Data Asesi</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Cari data asesi berdasarkan NIK atau nama, lalu filter sesuai
                status sertifikasi dan jadwal asesmen.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Search size={17} />
                  Mulai Cari
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("semua");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Reset Filter
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
                  Ringkasan Pencarian
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalAsesi} Data Asesi
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Gunakan pencarian dan filter untuk menemukan data asesi secara
                  lebih cepat.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Kompeten" value={`${totalKompeten}`} />
                  <HeroPill label="Filter" value={`${totalFilterAktif}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Users size={22} />}
            label="Total Asesi"
            value={`${totalAsesi} Data`}
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Kompeten"
            value={`${totalKompeten} Asesi`}
            tone="green"
          />
          <MiniStat
            icon={<CalendarDays size={22} />}
            label="Filter Aktif"
            value={totalFilterAktif}
            tone="navy"
          />
        </section>

        {/* FILTER */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Filter size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Asesi
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Pencarian Data
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari NIK, nama asesi, atau pilih status asesmen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Cari NIK atau Nama Asesi..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <select
                className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="pendaftar_baru">Pendaftar Baru (Pending)</option>
                <option value="terjadwal">Terjadwal (Belum Asesmen)</option>
                <option value="kompeten">Kompeten</option>
                <option value="belum_kompeten">Belum Kompeten</option>
                <option value="diblokir">Diblokir (Nonaktif)</option>
              </select>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <Users size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Daftar Asesi
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#071E3D]">
              Hasil Pencarian
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-400">
              Data asesi yang sesuai dengan pencarian dan filter.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Jadwal / Skema</TableHead>
                  <TableHead>Status Asesmen</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {dummyData.map((item, index) => (
                  <tr
                    key={`${item.nik}-${index}`}
                    className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                  >
                    <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm font-black text-orange-500">
                      {item.nik}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#071E3D]">
                      {item.nama}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                      {item.skema}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]">
                        <Eye size={15} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

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

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    navy: "bg-slate-50 text-[#071E3D]",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export default CariAsesi;