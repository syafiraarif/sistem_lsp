import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { 
  Search, Loader2, Download, Filter, 
  Calendar, FileText, BarChart2, CheckCircle, XCircle, Users, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx'; 

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
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // --- FETCH REAL DATA ---
  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      // TRIK: Tarik data Jadwal DAN Peserta secara bersamaan
      const [resJadwal, resPeserta] = await Promise.all([
        api.get('/admin/jadwal'),
        api.get('/admin/peserta-jadwal/global')
      ]);

      const jadwals = resJadwal.data?.data || resJadwal.data?.rows || [];
      const pesertas = resPeserta.data?.data || resPeserta.data?.rows || [];

      // 1. Lakukan Pencocokan Data & Perhitungan secara Manual
      const aggregatedData = jadwals.map(jadwal => {
        // Cari semua asesi yang masuk ke dalam jadwal ini
        const pesertaJadwalIni = pesertas.filter(p => p.id_jadwal === jadwal.id_jadwal);
        
        let countTerjadwal = 0;
        let countK = 0;
        let countBK = 0;

        // PERBAIKAN: Mengecek field status_asesmen dari Backend
        pesertaJadwalIni.forEach(p => {
          const status = (p.status_asesmen || p.status_kelulusan || "").toLowerCase();
          
          if (status === 'kompeten' || status === 'k') {
            countK++;
          } else if (status === 'belum_kompeten' || status === 'belum kompeten' || status === 'bk') {
            countBK++;
          } else {
            // Jika statusnya terdaftar, pra_asesmen, asesmen, atau lainnya, berarti masih Terjadwal/Proses
            countTerjadwal++;
          }
        });

        return {
          id: jadwal.id_jadwal,
          nama_skema: jadwal.skema?.nama_skema || jadwal.nama_kegiatan || 'Tanpa Skema',
          tanggal: jadwal.tanggal_waktu || jadwal.tanggal_mulai || jadwal.tanggal || '',
          tuk: jadwal.tuk?.nama_tuk || 'TUK Belum Ditentukan',
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
      Swal.fire('Gagal', 'Gagal memuat data laporan dari server.', 'error');
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
      result = result.filter(item => 
        (item.nama_skema || '').toLowerCase().includes(lowerSearch) ||
        (item.tuk || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (year) {
      result = result.filter(item => {
        if (!item.tanggal) return false;
        const dateObj = new Date(item.tanggal);
        return String(dateObj.getFullYear()) === year;
      });
    }

    if (month) {
      result = result.filter(item => {
        if (!item.tanggal) return false;
        const dateObj = new Date(item.tanggal);
        const itemMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
        return itemMonth === month;
      });
    }

    setFilteredData(result);
  };

  // --- CALCULATE TOTALS ---
  const sumAsesi = filteredData.reduce((sum, item) => sum + (item.total_asesi || 0), 0);
  const sumTerjadwal = filteredData.reduce((sum, item) => sum + (item.terjadwal || 0), 0);
  const sumK = filteredData.reduce((sum, item) => sum + (item.kompeten || 0), 0);
  const sumBK = filteredData.reduce((sum, item) => sum + (item.belum_kompeten || 0), 0);

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      return Swal.fire('Kosong', 'Tidak ada data untuk diekspor', 'info');
    }

    const excelData = filteredData.map((item, idx) => ({
      'No': idx + 1,
      'Nama Skema': item.nama_skema,
      'Tanggal Pelaksanaan': item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
      'Tempat Uji Kompetensi (TUK)': item.tuk,
      'Total Asesi': item.total_asesi,
      'Terjadwal (Belum Dinilai)': item.terjadwal,
      'Kompeten (K)': item.kompeten,
      'Belum Kompeten (BK)': item.belum_kompeten
    }));

    excelData.push({
      'No': '',
      'Nama Skema': 'TOTAL KESELURUHAN',
      'Tanggal Pelaksanaan': '',
      'Tempat Uji Kompetensi (TUK)': '',
      'Total Asesi': sumAsesi,
      'Terjadwal (Belum Dinilai)': sumTerjadwal,
      'Kompeten (K)': sumK,
      'Belum Kompeten (BK)': sumBK
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sertifikasi");
    
    // Perlebar kolom Excel
    const wscols = [{wch:5}, {wch:40}, {wch:20}, {wch:35}, {wch:12}, {wch:18}, {wch:15}, {wch:20}];
    worksheet['!cols'] = wscols;

    const fileName = `Laporan_Sertifikasi_${filterMonth ? months.find(m => m.value === filterMonth)?.label + '_' : ''}${filterYear || 'Semua'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            <BarChart2 size={26} className="text-[#CC6B27]" /> 
            Laporan Sertifikasi
          </h2>
          <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium">Rekapitulasi hasil uji kompetensi asesi berdasarkan skema dan jadwal.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex-1 md:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 text-[13.5px]"
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* STATISTIK SINGKAT (SEKARANG 4 KOLOM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#071E3D]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="text-blue-600" size={24}/>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#182D4A]/60 uppercase mb-0.5">Total Asesi</p>
            <h3 className="text-[24px] font-extrabold text-[#071E3D] leading-none">{sumAsesi}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#071E3D]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <Clock className="text-[#CC6B27]" size={24}/>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#182D4A]/60 uppercase mb-0.5">Terjadwal / Proses</p>
            <h3 className="text-[24px] font-extrabold text-[#CC6B27] leading-none">{sumTerjadwal}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#071E3D]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle className="text-green-600" size={24}/>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#182D4A]/60 uppercase mb-0.5">Kompeten (K)</p>
            <h3 className="text-[24px] font-extrabold text-green-600 leading-none">{sumK}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#071E3D]/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="text-red-600" size={24}/>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#182D4A]/60 uppercase mb-0.5">Belum Kompeten (BK)</p>
            <h3 className="text-[24px] font-extrabold text-red-600 leading-none">{sumBK}</h3>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          
          <div className="w-full md:flex-1 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/40 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Skema atau TUK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-4 focus:ring-[#CC6B27]/10 transition-all text-[13.5px] font-medium" 
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-40 group">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/40 group-focus-within:text-[#CC6B27] z-10" />
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-4 focus:ring-[#CC6B27]/10 transition-all text-[13.5px] font-bold text-[#071E3D] appearance-none cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-32 group">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/40 group-focus-within:text-[#CC6B27] z-10" />
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-4 focus:ring-[#CC6B27]/10 transition-all text-[13.5px] font-bold text-[#071E3D] appearance-none cursor-pointer"
              >
                <option value="">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-[#182D4A] text-[#FAFAFA] font-bold text-[12.5px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="py-4 px-5 text-center w-12 rounded-tl-xl">No</th>
                <th className="py-4 px-5">Skema & Pelaksanaan</th>
                <th className="py-4 px-5 text-center w-28">Total Asesi</th>
                <th className="py-4 px-5 text-center w-32">Terjadwal</th>
                <th className="py-4 px-5 text-center w-32">Kompeten</th>
                <th className="py-4 px-5 text-center w-36">Belum Kompeten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Menarik data dari server...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#CC6B27]/5 transition-colors group">
                    <td className="py-4 px-5 text-center font-extrabold text-[#071E3D] text-[13px]">{idx + 1}</td>
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-[#071E3D] text-[14px] mb-1">{item.nama_skema}</div>
                      <div className="flex items-center gap-3 text-[12px] font-medium text-[#182D4A]/70">
                        <span className="flex items-center gap-1"><Calendar size={13}/> {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : '-'}</span>
                        <span className="w-1 h-1 rounded-full bg-[#CC6B27]/50"></span>
                        <span className="flex items-center gap-1 font-bold text-[#CC6B27] bg-[#CC6B27]/10 px-2 py-0.5 rounded-md">{item.tuk}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center font-extrabold text-[15px] text-[#071E3D] bg-gray-50/50">{item.total_asesi}</td>
                    <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2.5 h-8 rounded-lg bg-orange-100 text-[#CC6B27] font-extrabold text-[14px] border border-orange-200">{item.terjadwal}</span>
                    </td>
                    <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2.5 h-8 rounded-lg bg-green-100 text-green-700 font-extrabold text-[14px] border border-green-200">{item.kompeten}</span>
                    </td>
                    <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2.5 h-8 rounded-lg bg-red-100 text-red-700 font-extrabold text-[14px] border border-red-200">{item.belum_kompeten}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FileText size={32} className="text-[#071E3D]/30"/>
                      </div>
                      <p className="text-[#182D4A] font-bold text-[15px] mb-1">Data Tidak Ditemukan</p>
                      <p className="text-[#182D4A]/60 text-[13px]">Tidak ada jadwal atau data laporan yang cocok.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* ROW TOTAL KESELURUHAN */}
            {!loading && filteredData.length > 0 && (
              <tfoot className="sticky bottom-0">
                <tr className="bg-[#E2E8F0] text-[#071E3D]">
                  <td colSpan="2" className="py-4 px-5 text-right font-extrabold uppercase text-[12px] tracking-wider border-t-2 border-[#182D4A]/20">Total Keseluruhan :</td>
                  <td className="py-4 px-5 text-center font-black text-[16px] text-[#071E3D] border-t-2 border-[#182D4A]/20">{sumAsesi}</td>
                  <td className="py-4 px-5 text-center font-black text-[16px] text-[#CC6B27] border-t-2 border-[#182D4A]/20">{sumTerjadwal}</td>
                  <td className="py-4 px-5 text-center font-black text-[16px] text-green-700 border-t-2 border-[#182D4A]/20">{sumK}</td>
                  <td className="py-4 px-5 text-center font-black text-[16px] text-red-700 border-t-2 border-[#182D4A]/20">{sumBK}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanSertifikasi;