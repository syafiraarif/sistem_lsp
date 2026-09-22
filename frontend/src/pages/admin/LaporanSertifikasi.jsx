import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search, Loader2, Download, Filter, Calendar, FileText,
  CheckCircle, XCircle, Users, Clock, RefreshCcw, ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";

const LaporanSertifikasi = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const currentYear = new Date().getFullYear();

  const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [resJadwal, resPeserta] = await Promise.all([
        api.get("/admin/jadwal"),
        api.get("/admin/peserta-jadwal/global"),
      ]);
      const jadwals = resJadwal.data?.data || resJadwal.data?.rows || [];
      const pesertas = resPeserta.data?.data || resPeserta.data?.rows || [];
      
      const aggregatedData = jadwals.map((jadwal) => {
        const pesertaJadwalIni = pesertas.filter(p => p.id_jadwal === jadwal.id_jadwal);
        let countTerjadwal = 0, countK = 0, countBK = 0;
        pesertaJadwalIni.forEach((p) => {
          const status = (p.status_asesmen || p.status_kelulusan || "").toLowerCase();
          if (status === "kompeten" || status === "k") countK++;
          else if (status === "belum_kompeten" || status === "belum kompeten" || status === "bk") countBK++;
          else countTerjadwal++;
        });
        return {
          id: jadwal.id_jadwal,
          nama_skema: jadwal.skema?.nama_skema || jadwal.nama_kegiatan || "Tanpa Skema",
          tanggal: jadwal.tanggal_waktu || jadwal.tanggal_mulai || jadwal.tanggal || "",
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
      notifikasi.gagal("Gagal", "Gagal memuat data laporan dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters(dataList, searchTerm, filterMonth, filterYear);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, filterMonth, filterYear, dataList]);

  const applyFilters = (data, search, month, year) => {
    let result = data;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(item => (item.nama_skema || "").toLowerCase().includes(lowerSearch) || (item.tuk || "").toLowerCase().includes(lowerSearch));
    }
    if (year) result = result.filter(item => item.tanggal && String(new Date(item.tanggal).getFullYear()) === year);
    if (month) result = result.filter(item => item.tanggal && String(new Date(item.tanggal).getMonth() + 1).padStart(2, "0") === month);
    setFilteredData(result);
  };

  const sumAsesi = filteredData.reduce((sum, item) => sum + (item.total_asesi || 0), 0);
  const sumTerjadwal = filteredData.reduce((sum, item) => sum + (item.terjadwal || 0), 0);
  const sumK = filteredData.reduce((sum, item) => sum + (item.kompeten || 0), 0);
  const sumBK = filteredData.reduce((sum, item) => sum + (item.belum_kompeten || 0), 0);
  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  const handleExportExcel = () => {
    if (filteredData.length === 0) return notifikasi.peringatan("Kosong", "Tidak ada data untuk diekspor");
    const excelData = filteredData.map((item, idx) => ({
      No: idx + 1, "Nama Skema": item.nama_skema, "Tanggal Pelaksanaan": item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "-",
      "Tempat Uji Kompetensi (TUK)": item.tuk, "Total Asesi": item.total_asesi, "Terjadwal (Belum Dinilai)": item.terjadwal, "Kompeten (K)": item.kompeten, "Belum Kompeten (BK)": item.belum_kompeten,
    }));
    excelData.push({
      No: "", "Nama Skema": "TOTAL KESELURUHAN", "Tanggal Pelaksanaan": "", "Tempat Uji Kompetensi (TUK)": "",
      "Total Asesi": sumAsesi, "Terjadwal (Belum Dinilai)": sumTerjadwal, "Kompeten (K)": sumK, "Belum Kompeten (BK)": sumBK,
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sertifikasi");
    worksheet["!cols"] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 }];
    XLSX.writeFile(workbook, `Laporan_Sertifikasi_${filterMonth ? months.find((m) => m.value === filterMonth)?.label + "_" : ""}${filterYear || "Semua"}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="m-0 mb-1 text-[24px] md:text-[28px] font-black text-[#071E3D]">Rekapitulasi Hasil Uji Kompetensi</h2>
            <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">Pantau total asesi, status terjadwal, kompeten, dan belum kompeten berdasarkan pelaksanaan.</p>
          </div>
          <div className="flex w-full sm:flex-row flex-col gap-3 md:w-auto">
            <button onClick={fetchRealData} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Refresh 
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<Users size={22} />} label="Total Asesi" value={sumAsesi} tone="navy" />
        <StatCard icon={<Clock size={22} />} label="Terjadwal / Proses" value={sumTerjadwal} tone="orange" />
        <StatCard icon={<CheckCircle size={22} />} label="Kompeten (K)" value={sumK} tone="green" />
        <StatCard icon={<XCircle size={22} />} label="Belum Kompeten (BK)" value={sumBK} tone="red" />
      </div>

      {/* CARD TABEL */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <FileText size={18} className="text-[#CC6B27]" /> Daftar Laporan Sertifikasi
          </h4>
          <button onClick={handleExportExcel} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#CC6B27]/50 bg-white px-4 py-2.5 text-[13px] font-bold text-[#CC6B27] shadow-sm hover:border-[#CC6B27] hover:bg-[#CC6B27]/10">
            <Download size={16} /> Download Data
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_210px_180px] mb-2">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <input type="text" placeholder="Cari berdasarkan Skema atau TUK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all" />
          </div>
          <div className="relative w-full group">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Bulan</option>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="relative w-full group">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Tahun</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Tabel Terbungkus Border Rounded */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Skema & Pelaksanaan</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Total Asesi</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Terjadwal</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Kompeten</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Belum Kompeten</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                    <p className="text-[14px] font-medium text-[#182D4A]">Menarik data dari server...</p>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                    <td className="px-4 py-3.5 text-center text-[13.5px] font-semibold text-[#071E3D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_skema}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#182D4A]/70">
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#071E3D]/10 bg-white px-2 py-0.5">
                          <Calendar size={12} className="text-[#CC6B27]" />
                          {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}
                        </span>
                        <span className="inline-flex rounded-md border border-[#CC6B27]/20 bg-orange-50 px-2 py-0.5 text-[#CC6B27]">{item.tuk}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center"><NumberBadge value={item.total_asesi} tone="navy" /></td>
                    <td className="px-4 py-3.5 text-center"><NumberBadge value={item.terjadwal} tone="orange" /></td>
                    <td className="px-4 py-3.5 text-center"><NumberBadge value={item.kompeten} tone="green" /></td>
                    <td className="px-4 py-3.5 text-center"><NumberBadge value={item.belum_kompeten} tone="red" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                    <p className="text-[14px] font-medium text-[#182D4A]">Data tidak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {!loading && filteredData.length > 0 && (
              <tfoot className="bg-[#FAFAFA]">
                <tr>
                  <td colSpan="2" className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-right text-[12px] font-black uppercase tracking-wider text-[#071E3D]">Total Keseluruhan:</td>
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-[#071E3D]">{sumAsesi}</td>
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-[#CC6B27]">{sumTerjadwal}</td>
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-green-600">{sumK}</td>
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-red-600">{sumBK}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-[13px] text-[#182D4A] font-medium">
            <span>Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 transition-all" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}><ChevronLeft size={18}/></button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">{pagination.page} / {totalPages}</span>
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 transition-all" disabled={pagination.page >= totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      ` }} />
    </div>
  );
};

// --- SUB COMPONENTS ---
const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = { navy: "bg-[#071E3D]/10 text-[#071E3D]", orange: "bg-[#CC6B27]/10 text-[#CC6B27]", green: "bg-green-50 text-green-600", red: "bg-red-50 text-red-500" };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p><p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p></div>
    </div>
  );
};

function NumberBadge({ value, tone = "navy" }) {
  const tones = { navy: "bg-[#071E3D]/5 text-[#071E3D] border-[#071E3D]/10", orange: "bg-[#CC6B27]/10 text-[#CC6B27] border-[#CC6B27]/20", green: "bg-green-50 text-green-600 border-green-200", red: "bg-red-50 text-red-600 border-red-200" };
  return <span className={`inline-flex min-w-[36px] items-center justify-center rounded-lg border px-3 py-1.5 text-[13px] font-bold ${tones[tone] || tones.navy}`}>{value}</span>;
}
export default LaporanSertifikasi;