// frontend/src/pages/admin/ValidasiPembayaran.jsx

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckSquare
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API_BASE.replace("/api", "");

export default function ValidasiPembayaran() {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination Fix 10 Data
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pembayaran");
      setData(res.data?.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal memuat pembayaran", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const approve = async (id) => {
    const confirm = await Swal.fire({
      title: "Terima pembayaran?",
      text: "Status akan diubah menjadi Lunas (Paid).",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Terima",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981", // Emerald
      cancelButtonColor: "#182D4A",
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.put(`/admin/pembayaran/${id}/approve`);
      Swal.fire("Berhasil", "Pembayaran diterima", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat memproses data", "error");
    }
  };

  const reject = async (id) => {
    const result = await Swal.fire({
      title: "Tolak pembayaran?",
      input: "textarea",
      inputPlaceholder: "Berikan catatan alasan penolakan...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444", // Red
      cancelButtonColor: "#182D4A",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.put(`/admin/pembayaran/${id}/reject`, {
        catatan_admin: result.value || "Pembayaran ditolak admin",
      });
      Swal.fire("Ditolak", "Pembayaran berhasil ditolak", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menolak data", "error");
    }
  };

  const openFile = (path) => {
    if (!path) return;
    window.open(`${APP_BASE}/${path}`, "_blank");
  };

  // --- FILTER & PAGINATION ---
  const filteredData = data.filter((item) => {
    const skemaTitle = item.skema?.judul_skema || item.Skema?.judul_skema || "";
    const metode = item.metode_pembayaran || "";
    const searchLower = searchQuery.toLowerCase();

    return (
      skemaTitle.toLowerCase().includes(searchLower) ||
      metode.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentData = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- STATS CALCULATION ---
  const totalPending = data.filter((d) => ["pending", "menunggu_validasi"].includes(d.status)).length;
  const totalPaid = data.filter((d) => d.status === "paid").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] md:text-[28px] font-black text-[#071E3D]">Validasi Pembayaran</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Terima atau tolak bukti pembayaran yang telah diunggah oleh asesi.
              </p>
            </div>
            
            {/* --- TOMBOL REFRESH DIPERBARUI --- */}
            <div className="flex w-full flex-col sm:flex-row gap-3 md:w-auto">
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<ClipboardList size={22} />} label="Total Data" value={`${data.length} Transaksi`} tone="navy" />
          <StatCard icon={<Clock size={22} />} label="Menunggu Validasi" value={`${totalPending} Data`} tone="orange" />
          <StatCard icon={<CheckCircle size={22} />} label="Pembayaran Diterima" value={`${totalPaid} Data`} tone="green" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          {/* Header & Search */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <CreditCard size={18} className="text-[#CC6B27]" />
              Daftar Transaksi Pembayaran
            </h4>

            <div className="group relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari Skema, Metode, atau Status..."
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Skema Sertifikasi</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Metode & Nominal</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Bukti Bayar</th>
                  <th className="w-28 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Validasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data pembayaran...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <CreditCard size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Data transaksi tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => {
                    return (
                      <tr key={item.id_pembayaran} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                        <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13.5px] font-bold text-[#071E3D]">
                            {item.skema?.judul_skema || item.Skema?.judul_skema || "-"}
                          </div>
                          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                            ID: {item.id_skema}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13.5px] font-bold text-green-600">
                            Rp {Number(item.nominal || 0).toLocaleString("id-ID")}
                          </div>
                          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/60">
                            {item.metode_pembayaran?.replace(/_/g, " ") || "-"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.bukti_bayar ? (
                            <button
                              onClick={() => openFile(item.bukti_bayar)}
                              className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-1.5 text-blue-600 border border-blue-100 transition-colors hover:bg-blue-600 hover:text-white"
                              title="Lihat Bukti Bayar"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <span className="text-[12px] font-bold text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {["pending", "menunggu_validasi"].includes(item.status) ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => approve(item.id_pembayaran)}
                                className="rounded-lg bg-green-50 p-1.5 text-green-600 border border-green-200 transition-colors hover:bg-green-600 hover:text-white"
                                title="Terima Pembayaran"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => reject(item.id_pembayaran)}
                                className="rounded-lg bg-red-50 p-1.5 text-red-600 border border-red-200 transition-colors hover:bg-red-600 hover:text-white"
                                title="Tolak Pembayaran"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <CheckSquare size={14} /> Selesai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#071E3D]/10 pt-5 text-[13px] font-medium text-[#182D4A]">
              <span>
                Menampilkan {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, filteredData.length)} dari {filteredData.length} data
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft size={18}/>
                </button>
                <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
    navy: "bg-[#071E3D]/10 text-[#071E3D]"
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
};

function StatusBadge({ status }) {
  const map = {
    menunggu_validasi: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-slate-50 text-[#182D4A]/70 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[status] || map.pending}`}>
      {status === "menunggu_validasi" && <Clock size={12} />}
      {status === "paid" && <CheckCircle size={12} />}
      {status === "rejected" && <XCircle size={12} />}
      {(status || "pending").replace(/_/g, " ")}
    </span>
  );
}