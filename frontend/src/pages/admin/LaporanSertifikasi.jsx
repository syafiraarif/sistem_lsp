import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search, Loader2, Download, Filter, Calendar, FileText,
  CheckCircle, XCircle, Users, Clock, ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";

const FIRST_YEAR = 2024;

const getDateParts = (value) => {
  if (!value) return { year: "", month: "" };
  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return { year: dateOnly[1], month: dateOnly[2] };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { year: "", month: "" };
  return {
    year: String(parsed.getFullYear()),
    month: String(parsed.getMonth() + 1).padStart(2, "0"),
  };
};

const formatDate = (value) => {
  if (!value) return "";
  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (startLabel && endLabel && startLabel !== endLabel) {
    return `${startLabel} - ${endLabel}`;
  }
  return startLabel || endLabel || "Tanggal belum ditentukan";
};

const getSchemaKey = (item) =>
  item.id_skema !== null && item.id_skema !== undefined
    ? `skema-${item.id_skema}`
    : `nama-${item.nama_skema || "Tanpa Skema"}`;

const groupSchedulesBySchema = (items) => {
  const groups = new Map();

  items.forEach((item) => {
    const key = getSchemaKey(item);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        nama_skema: item.nama_skema || "Tanpa Skema",
        schedules: [],
      });
    }

    groups.get(key).schedules.push(item);
  });

  return Array.from(groups.values());
};

const LaporanSertifikasi = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterSchema, setFilterSchema] = useState("");
  const currentYear = new Date().getFullYear();
  const firstAvailableYear = Math.max(FIRST_YEAR, currentYear - 10);
  const years = Array.from(
    { length: Math.max(0, currentYear - firstAvailableYear + 1) },
    (_, index) => String(firstAvailableYear + index)
  );

  const months = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
  ];

  const schemaOptions = Array.from(
    new Map(
      dataList.map((item) => [
        getSchemaKey(item),
        { value: getSchemaKey(item), label: item.nama_skema || "Tanpa Skema" },
      ])
    ).values()
  ).sort((a, b) => a.label.localeCompare(b.label, "id"));

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
        const pesertaJadwalIni = pesertas.filter(
          (peserta) => String(peserta.id_jadwal) === String(jadwal.id_jadwal)
        );
        let countTerjadwal = 0;
        let countKompeten = 0;
        let countBelumKompeten = 0;

        pesertaJadwalIni.forEach((peserta) => {
          const status = String(
            peserta.status_asesmen || peserta.status_kelulusan || ""
          ).toLowerCase();

          if (status === "kompeten" || status === "k") countKompeten++;
          else if (
            status === "belum_kompeten" ||
            status === "belum kompeten" ||
            status === "bk"
          ) countBelumKompeten++;
          else countTerjadwal++;
        });

        const tanggal = jadwal.tgl_awal || jadwal.tanggal_waktu || jadwal.tanggal_mulai || jadwal.tanggal || "";

        return {
          id: jadwal.id_jadwal,
          id_skema: jadwal.id_skema ?? jadwal.skema?.id_skema ?? jadwal.skema?.id ?? null,
          nama_skema: jadwal.skema?.judul_skema || jadwal.skema?.nama_skema || jadwal.skema?.nama || jadwal.nama_skema || "Tanpa Skema",
          nama_pelaksanaan: jadwal.nama_kegiatan || "Judul pelaksanaan belum diisi",
          tanggal,
          tanggal_akhir: jadwal.tgl_akhir || "",
          tahun: jadwal.tahun || getDateParts(tanggal).year,
          periode_bulan: jadwal.periode_bulan || "",
          tuk: jadwal.tuk?.nama_tuk || jadwal.nama_tuk || "TUK Belum Ditentukan",
          total_asesi: pesertaJadwalIni.length,
          terjadwal: countTerjadwal,
          kompeten: countKompeten,
          belum_kompeten: countBelumKompeten,
        };
      });

      setDataList(aggregatedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      notifikasi.gagal("Gagal", "Gagal memuat data laporan dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters(dataList, searchTerm, filterMonth, filterYear, filterSchema);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, filterMonth, filterYear, filterSchema, dataList]);

  const applyFilters = (data, search, month, year, schema) => {
    let result = data;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) =>
        (item.nama_skema || "").toLowerCase().includes(lowerSearch) ||
        (item.nama_pelaksanaan || "").toLowerCase().includes(lowerSearch) ||
        (item.tuk || "").toLowerCase().includes(lowerSearch)
      );
    }

    if (schema) {
      result = result.filter((item) => getSchemaKey(item) === schema);
    }

    if (year) {
      result = result.filter((item) => {
        const dateYear = getDateParts(item.tanggal).year;
        return String(dateYear || item.tahun || "") === year;
      });
    }

    if (month) {
      result = result.filter((item) => {
        const dateMonth = getDateParts(item.tanggal).month;
        if (dateMonth) return dateMonth === month;
        const monthIndex = months.findIndex(
          (monthItem) => monthItem.label.toLowerCase() === String(item.periode_bulan || "").toLowerCase()
        );
        return monthIndex >= 0 && String(monthIndex + 1).padStart(2, "0") === month;
      });
    }

    setFilteredData(result);
  };

  const sumAsesi = filteredData.reduce((sum, item) => sum + (item.total_asesi || 0), 0);
  const sumTerjadwal = filteredData.reduce((sum, item) => sum + (item.terjadwal || 0), 0);
  const sumKompeten = filteredData.reduce((sum, item) => sum + (item.kompeten || 0), 0);
  const sumBelumKompeten = filteredData.reduce((sum, item) => sum + (item.belum_kompeten || 0), 0);

  const groupedData = groupSchedulesBySchema(filteredData);
  const totalPages = Math.ceil(groupedData.length / pagination.limit) || 1;
  const currentGroups = groupedData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      return notifikasi.peringatan("Kosong", "Tidak ada data untuk diekspor");
    }

    const excelData = filteredData.map((item) => ({
      "Nama Skema": item.nama_skema,
      "Judul Pelaksanaan": item.nama_pelaksanaan,
      "Tanggal Pelaksanaan": formatDateRange(item.tanggal, item.tanggal_akhir),
      "Tempat Uji Kompetensi (TUK)": item.tuk,
      "Total Asesi": item.total_asesi,
      "Terjadwal (Belum Dinilai)": item.terjadwal,
      "Kompeten (K)": item.kompeten,
      "Belum Kompeten (BK)": item.belum_kompeten,
    }));

    excelData.push({
      "Nama Skema": "TOTAL KESELURUHAN",
      "Judul Pelaksanaan": "",
      "Tanggal Pelaksanaan": "",
      "Tempat Uji Kompetensi (TUK)": "",
      "Total Asesi": sumAsesi,
      "Terjadwal (Belum Dinilai)": sumTerjadwal,
      "Kompeten (K)": sumKompeten,
      "Belum Kompeten (BK)": sumBelumKompeten,
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Sertifikasi");
    worksheet["!cols"] = [
      { wch: 35 }, { wch: 40 }, { wch: 30 }, { wch: 35 },
      { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
    ];
    XLSX.writeFile(
      workbook,
      `Laporan_Sertifikasi_${filterMonth ? months.find((month) => month.value === filterMonth)?.label + "_" : ""}${filterYear || "Semua"}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<Users size={22} />} label="Total Asesi" value={sumAsesi} tone="navy" />
        <StatCard icon={<Clock size={22} />} label="Terjadwal / Proses" value={sumTerjadwal} tone="orange" />
        <StatCard icon={<CheckCircle size={22} />} label="Kompeten (K)" value={sumKompeten} tone="green" />
        <StatCard icon={<XCircle size={22} />} label="Belum Kompeten (BK)" value={sumBelumKompeten} tone="red" />
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

        {/* FILTER */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_200px_240px_180px] mb-2">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <input type="text" placeholder="Cari berdasarkan Skema, Pelaksanaan, atau TUK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all" />
          </div>
          <div className="relative w-full group">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Bulan</option>
              {months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </div>
          <div className="relative w-full group">
            <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterSchema} onChange={(e) => setFilterSchema(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Skema</option>
              {schemaOptions.map((schema) => (
                <option key={schema.value} value={schema.value}>{schema.label}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full group">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Tahun</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        {/* TABEL LAPORAN DENGAN PENGELOMPOKAN SKEMA */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-[1120px] bg-white">
            <thead>
              <tr>
                <th className="min-w-[220px] border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Skema</th>
                <th className="min-w-[330px] border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Jadwal Pelaksanaan</th>
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
              ) : currentGroups.length > 0 ? (
                (() => {
                  return currentGroups.map((group) => (
                    <React.Fragment key={group.key}>
                      {group.schedules.map((item, scheduleIndex) => {
                        return (
                          <tr key={item.id || `${group.key}-${scheduleIndex}`} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                            {scheduleIndex === 0 && (
                              <td rowSpan={group.schedules.length} className="min-w-[220px] align-middle border-r border-[#071E3D]/5 bg-white px-5 py-4">
                                <div className="text-[14px] font-black leading-relaxed text-[#071E3D]">{group.nama_skema}</div>
                              </td>
                            )}
                            <td className="px-4 py-3.5">
                              <div className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_pelaksanaan}</div>
                              <div className="mt-2 flex flex-col items-start gap-1.5 text-[11px] font-semibold text-[#182D4A]/75">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#071E3D]/10 bg-white px-2 py-1">
                                  <Calendar size={12} className="shrink-0 text-[#CC6B27]" />
                                  {formatDateRange(item.tanggal, item.tanggal_akhir)}
                                </span>
                                <span className="inline-flex rounded-md border border-[#CC6B27]/20 bg-orange-50 px-2 py-1 text-[#CC6B27]">{item.tuk}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center"><NumberBadge value={item.total_asesi} tone="navy" /></td>
                            <td className="px-4 py-3.5 text-center"><NumberBadge value={item.terjadwal} tone="orange" /></td>
                            <td className="px-4 py-3.5 text-center"><NumberBadge value={item.kompeten} tone="green" /></td>
                            <td className="px-4 py-3.5 text-center"><NumberBadge value={item.belum_kompeten} tone="red" /></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()
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
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-green-600">{sumKompeten}</td>
                  <td className="border-t-2 border-[#071E3D]/10 px-5 py-4 text-center text-[16px] font-black text-red-600">{sumBelumKompeten}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION BERDASARKAN KELOMPOK SKEMA */}
        {groupedData.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-[13px] text-[#182D4A] font-medium">
            <span>Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, groupedData.length)} dari {groupedData.length} skema</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 transition-all" disabled={pagination.page === 1} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}><ChevronLeft size={18}/></button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">{pagination.page} / {totalPages}</span>
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 transition-all" disabled={pagination.page >= totalPages} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    navy: "bg-[#071E3D]/10 text-[#071E3D]",
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p>
      </div>
    </div>
  );
};

function NumberBadge({ value, tone = "navy" }) {
  const tones = {
    navy: "bg-[#071E3D]/5 text-[#071E3D] border-[#071E3D]/10",
    orange: "bg-[#CC6B27]/10 text-[#CC6B27] border-[#CC6B27]/20",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <span className={`inline-flex min-w-[36px] items-center justify-center rounded-lg border px-3 py-1.5 text-[13px] font-bold ${tones[tone] || tones.navy}`}>
      {value}
    </span>
  );
}

export default LaporanSertifikasi;
