// frontend/src/pages/admin/LaporanSertifikasi.jsx

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  Search,
  Loader2,
  Download,
  Filter,
  Calendar,
  FileText,
  BarChart2,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import * as XLSX from "xlsx";

const LaporanSertifikasi = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Default Filter: Kosong = Tampilkan Semua
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const currentYear = new Date().getFullYear();
  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

  // --- FETCH REAL DATA ---
  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      // TRIK: Tarik data Jadwal DAN Peserta secara bersamaan
      const [resJadwal, resPeserta] = await Promise.all([
        api.get("/admin/jadwal"),
        api.get("/admin/peserta-jadwal/global"),
      ]);

      const jadwals = resJadwal.data?.data || resJadwal.data?.rows || [];
      const pesertas = resPeserta.data?.data || resPeserta.data?.rows || [];

      // 1. Lakukan Pencocokan Data & Perhitungan secara Manual
      const aggregatedData = jadwals.map((jadwal) => {
        // Cari semua asesi yang masuk ke dalam jadwal ini
        const pesertaJadwalIni = pesertas.filter(
          (p) => p.id_jadwal === jadwal.id_jadwal
        );

        let countTerjadwal = 0;
        let countK = 0;
        let countBK = 0;

        // PERBAIKAN: Mengecek field status_asesmen dari Backend
        pesertaJadwalIni.forEach((p) => {
          const status = (
            p.status_asesmen ||
            p.status_kelulusan ||
            ""
          ).toLowerCase();

          if (status === "kompeten" || status === "k") {
            countK++;
          } else if (
            status === "belum_kompeten" ||
            status === "belum kompeten" ||
            status === "bk"
          ) {
            countBK++;
          } else {
            // Jika statusnya terdaftar, pra_asesmen, asesmen, atau lainnya, berarti masih Terjadwal/Proses
            countTerjadwal++;
          }
        });

        return {
          id: jadwal.id_jadwal,
          nama_skema:
            jadwal.skema?.nama_skema ||
            jadwal.nama_kegiatan ||
            "Tanpa Skema",
          tanggal:
            jadwal.tanggal_waktu ||
            jadwal.tanggal_mulai ||
            jadwal.tanggal ||
            "",
          tuk: jadwal.tuk?.nama_tuk || "TUK Belum Ditentukan",
          total_asesi: pesertaJadwalIni.length,
          terjadwal: countTerjadwal,
          kompeten: countK,
          belum_kompeten: countBK,
        };
      });

      setDataList(aggregatedData);
      applyFilters(aggregatedData, searchTerm, filterMonth, filterYear);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Gagal", "Gagal memuat data laporan dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER & SEARCH ---
  useEffect(() => {
    applyFilters(dataList, searchTerm, filterMonth, filterYear);
  }, [searchTerm, filterMonth, filterYear, dataList]);

  const applyFilters = (data, search, month, year) => {
    let result = data;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item.nama_skema || "").toLowerCase().includes(lowerSearch) ||
          (item.tuk || "").toLowerCase().includes(lowerSearch)
      );
    }

    if (year) {
      result = result.filter((item) => {
        if (!item.tanggal) return false;
        const dateObj = new Date(item.tanggal);
        return String(dateObj.getFullYear()) === year;
      });
    }

    if (month) {
      result = result.filter((item) => {
        if (!item.tanggal) return false;
        const dateObj = new Date(item.tanggal);
        const itemMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
        return itemMonth === month;
      });
    }

    setFilteredData(result);
  };

  // --- CALCULATE TOTALS ---
  const sumAsesi = filteredData.reduce(
    (sum, item) => sum + (item.total_asesi || 0),
    0
  );
  const sumTerjadwal = filteredData.reduce(
    (sum, item) => sum + (item.terjadwal || 0),
    0
  );
  const sumK = filteredData.reduce(
    (sum, item) => sum + (item.kompeten || 0),
    0
  );
  const sumBK = filteredData.reduce(
    (sum, item) => sum + (item.belum_kompeten || 0),
    0
  );

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      return Swal.fire("Kosong", "Tidak ada data untuk diekspor", "info");
    }

    const excelData = filteredData.map((item, idx) => ({
      No: idx + 1,
      "Nama Skema": item.nama_skema,
      "Tanggal Pelaksanaan": item.tanggal
        ? new Date(item.tanggal).toLocaleDateString("id-ID")
        : "-",
      "Tempat Uji Kompetensi (TUK)": item.tuk,
      "Total Asesi": item.total_asesi,
      "Terjadwal (Belum Dinilai)": item.terjadwal,
      "Kompeten (K)": item.kompeten,
      "Belum Kompeten (BK)": item.belum_kompeten,
    }));

    excelData.push({
      No: "",
      "Nama Skema": "TOTAL KESELURUHAN",
      "Tanggal Pelaksanaan": "",
      "Tempat Uji Kompetensi (TUK)": "",
      "Total Asesi": sumAsesi,
      "Terjadwal (Belum Dinilai)": sumTerjadwal,
      "Kompeten (K)": sumK,
      "Belum Kompeten (BK)": sumBK,
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sertifikasi");

    // Perlebar kolom Excel
    const wscols = [
      { wch: 5 },
      { wch: 40 },
      { wch: 20 },
      { wch: 35 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
    ];
    worksheet["!cols"] = wscols;

    const fileName = `Laporan_Sertifikasi_${
      filterMonth ? months.find((m) => m.value === filterMonth)?.label + "_" : ""
    }${filterYear || "Semua"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
                <BarChart2 size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Laporan Sertifikasi
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Rekapitulasi Hasil
                <br />
                <span className="text-orange-500">Uji Kompetensi</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Pantau total asesi, status terjadwal, kompeten, dan belum
                kompeten berdasarkan skema, TUK, bulan, serta tahun pelaksanaan.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-green-600/20 transition-all hover:bg-[#071E3D]"
                >
                  <Download size={17} />
                  Export Excel
                </button>

                <button
                  type="button"
                  onClick={fetchRealData}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={17} />
                  )}
                  Refresh Data
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
                  Ringkasan Laporan
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {sumAsesi} Total Asesi
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data laporan dihitung dari jadwal dan peserta yang tersimpan
                  pada sistem.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Kompeten" value={`${sumK}`} />
                  <HeroPill label="Belum Kompeten" value={`${sumBK}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users size={24} />}
            label="Total Asesi"
            value={sumAsesi}
            tone="blue"
          />
          <StatCard
            icon={<Clock size={24} />}
            label="Terjadwal / Proses"
            value={sumTerjadwal}
            tone="orange"
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            label="Kompeten (K)"
            value={sumK}
            tone="green"
          />
          <StatCard
            icon={<XCircle size={24} />}
            label="Belum Kompeten (BK)"
            value={sumBK}
            tone="red"
          />
        </section>

        {/* FILTER PANEL */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Filter size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Laporan
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Pencarian & Periode
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari data berdasarkan skema, TUK, bulan, atau tahun.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_210px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Cari berdasarkan Skema atau TUK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-300"
              />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-300"
              />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Data Laporan
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Laporan Sertifikasi
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Menampilkan {filteredData.length} jadwal sesuai filter aktif.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-green-600/20 transition-all hover:bg-[#071E3D]"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Skema & Pelaksanaan</TableHead>
                  <TableHead center>Total Asesi</TableHead>
                  <TableHead center>Terjadwal</TableHead>
                  <TableHead center>Kompeten</TableHead>
                  <TableHead center>Belum Kompeten</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Menarik data dari server...
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-[#071E3D]">
                          {item.nama_skema}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
                            <Calendar size={13} />
                            {item.tanggal
                              ? new Date(item.tanggal).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </span>

                          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-black text-orange-500">
                            {item.tuk}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <NumberBadge value={item.total_asesi} tone="navy" />
                      </td>

                      <td className="px-5 py-4 text-center">
                        <NumberBadge value={item.terjadwal} tone="orange" />
                      </td>

                      <td className="px-5 py-4 text-center">
                        <NumberBadge value={item.kompeten} tone="green" />
                      </td>

                      <td className="px-5 py-4 text-center">
                        <NumberBadge value={item.belum_kompeten} tone="red" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                        <FileText size={34} />
                      </div>
                      <p className="text-lg font-black text-[#071E3D]">
                        Data Tidak Ditemukan
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Tidak ada jadwal atau data laporan yang cocok.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              {!loading && filteredData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50">
                    <td
                      colSpan="2"
                      className="border-t border-slate-100 px-5 py-5 text-right text-xs font-black uppercase tracking-widest text-[#071E3D]"
                    >
                      Total Keseluruhan:
                    </td>
                    <td className="border-t border-slate-100 px-5 py-5 text-center text-lg font-black text-[#071E3D]">
                      {sumAsesi}
                    </td>
                    <td className="border-t border-slate-100 px-5 py-5 text-center text-lg font-black text-orange-500">
                      {sumTerjadwal}
                    </td>
                    <td className="border-t border-slate-100 px-5 py-5 text-center text-lg font-black text-green-600">
                      {sumK}
                    </td>
                    <td className="border-t border-slate-100 px-5 py-5 text-center text-lg font-black text-red-600">
                      {sumBK}
                    </td>
                  </tr>
                </tfoot>
              )}
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

function StatCard({ icon, label, value, tone = "orange" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-[#071E3D]">{value}</p>
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

function NumberBadge({ value, tone = "navy" }) {
  const tones = {
    navy: "bg-slate-50 text-[#071E3D] border-slate-100",
    orange: "bg-orange-50 text-orange-500 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`inline-flex min-w-[42px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-black ${
        tones[tone] || tones.navy
      }`}
    >
      {value}
    </span>
  );
}

export default LaporanSertifikasi;