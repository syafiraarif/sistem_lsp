// frontend/src/pages/admin/Notifikasi.jsx

import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Bell,
  Mail,
  MessageSquare,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Inbox,
  Send,
  Activity,
  ClipboardList
} from "lucide-react";

const NotifikasiAdmin = () => {
  // --- STATE ---
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- REF UNTUK CEGAH REQUEST DOBEL ---
  const hasFetchedRef = useRef(false);
  const requestRunningRef = useRef(false);

  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (requestRunningRef.current) return;

    requestRunningRef.current = true;
    setLoading(true);

    try {
      const response = await api.get("/admin/notifikasi");
      if (response.data.success) {
        setAllData(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        Swal.fire(
          "Terlalu Banyak Request",
          "Permintaan data notifikasi terlalu sering. Tunggu sebentar lalu coba refresh lagi.",
          "warning"
        );
      } else {
        Swal.fire("Error", "Gagal mengambil data notifikasi", "error");
      }
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchData();
  }, []);

  // --- FILTERING & PAGINATION LOGIC ---
  useEffect(() => {
    let processedData = [...allData];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processedData = processedData.filter(
        (item) =>
          (item.pesan && item.pesan.toLowerCase().includes(lowerSearch)) ||
          (item.tujuan && item.tujuan.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. Filter Type
    if (filterType) {
      processedData = processedData.filter((item) => item.ref_type === filterType);
    }

    // 3. Filter Channel
    if (filterChannel) {
      processedData = processedData.filter((item) => item.channel === filterChannel);
    }

    // 4. Pagination Config
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pagination.limit) || 1;
    const currentPage = pagination.page > totalPages ? totalPages : pagination.page;

    // 5. Slicing
    const startIndex = (currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = processedData.slice(startIndex, endIndex);

    setData(paginatedData);
    setPagination((prev) => ({
      ...prev,
      page: currentPage,
      total: totalItems,
      totalPages: totalPages,
    }));
  }, [allData, searchTerm, filterType, filterChannel, pagination.page, pagination.limit]);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Log?",
      text: "Data notifikasi ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/notifikasi/${id}`);
        Swal.fire("Terhapus!", "Data telah dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  const openDetail = (item) => {
    setSelectedNotif(item);
    setShowDetailModal(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "-", time: "-" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const totalSukses = allData.filter((item) => item.status_kirim === "terkirim").length;
  const totalGagal = allData.filter((item) => item.status_kirim !== "terkirim").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Riwayat Notifikasi</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Monitor status pengiriman notifikasi Email dan WhatsApp Gateway dari seluruh aktivitas sistem.
              </p>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard icon={<Inbox size={22} />} label="Total Riwayat" value={`${allData.length} Data`} tone="navy" />
          <StatCard icon={<CheckCircle size={22} />} label="Sukses Terkirim" value={`${totalSukses} Pesan`} tone="green" />
          <StatCard icon={<XCircle size={22} />} label="Gagal Terkirim" value={`${totalGagal} Pesan`} tone="red" />
          <StatCard icon={<Activity size={22} />} label="Ditampilkan" value={`${data.length} Data`} tone="orange" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          {/* Header & Filters */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <Send size={18} className="text-[#CC6B27]" />
              Log Pengiriman Notifikasi
            </h4>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              
              {/* Filter Type */}
              <div className="relative w-full sm:w-40">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50" />
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                  className="w-full appearance-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-9 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                >
                  <option value="">Semua Kategori</option>
                  <option value="pendaftaran">Pendaftaran</option>
                  <option value="pengaduan">Pengaduan</option>
                  <option value="akun">Akun User</option>
                </select>
              </div>

              {/* Filter Channel */}
              <div className="relative w-full sm:w-40">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50" />
                <select
                  value={filterChannel}
                  onChange={(e) => { setFilterChannel(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                  className="w-full appearance-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-9 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                >
                  <option value="">Semua Channel</option>
                  <option value="email">Email</option>
                  <option value="wa">WhatsApp</option>
                </select>
              </div>

              {/* Search */}
              <div className="group relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
                <input
                  type="text"
                  placeholder="Cari tujuan atau pesan..."
                  className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-9 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                />
              </div>

            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Waktu Kirim</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Kategori</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Tujuan</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Isi Singkat</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="w-24 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat riwayat notifikasi...</p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Bell size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Riwayat notifikasi tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    const { date, time } = formatDateTime(item.waktu_kirim);

                    return (
                      <tr key={item.id_notifikasi || index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                        <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-[13.5px] font-bold text-[#071E3D]">{date}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-[#182D4A]/50">
                            <Clock size={12} /> {time}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                item.channel === "email"
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : "bg-green-50 text-green-600 border-green-200"
                              }`}
                            >
                              {item.channel === "email" ? <Mail size={10} /> : <MessageSquare size={10} />}
                              {item.channel}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/60">
                              {item.ref_type || "General"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#CC6B27] max-w-[200px] truncate" title={item.tujuan}>
                          {item.tujuan}
                        </td>

                        <td className="px-4 py-3">
                          <div className="max-w-[250px] truncate text-[13px] text-[#182D4A]/80 font-medium" title={item.pesan}>
                            {item.pesan}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              item.status_kirim === "terkirim"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status_kirim === "terkirim" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {item.status_kirim === "terkirim" ? "Sukses" : "Gagal"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openDetail(item)}
                              className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id_notifikasi)}
                              className="rounded-lg bg-red-50 p-1.5 text-red-600 border border-red-100 transition-colors hover:bg-red-600 hover:text-white"
                              title="Hapus Data"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          {data.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#071E3D]/10 pt-5 text-[13px] font-medium text-[#182D4A]">
              <span>
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={18}/>
                </button>
                <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL */}
      {showDetailModal && selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Notifikasi</h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Modal */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <div className="space-y-6">
                
                {/* Status Banner */}
                <div className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-[13px] font-bold uppercase tracking-widest ${
                    selectedNotif.status_kirim === "terkirim"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {selectedNotif.status_kirim === "terkirim" ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  Status Pengiriman: {selectedNotif.status_kirim?.toUpperCase()}
                </div>

                {/* Section 1: Informasi Pengiriman */}
                <DetailSection icon={<Mail size={16} />} title="Informasi Pengiriman">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Channel">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                          selectedNotif.channel === "email"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-green-50 text-green-600 border-green-200"
                        }`}
                      >
                        {selectedNotif.channel === "email" ? <Mail size={12} /> : <MessageSquare size={12} />}
                        {selectedNotif.channel}
                      </span>
                    </DetailItem>
                    <DetailItem label="Waktu Kirim">
                      {formatDateTime(selectedNotif.waktu_kirim).date} pukul {formatDateTime(selectedNotif.waktu_kirim).time} WIB
                    </DetailItem>
                    <div className="md:col-span-2">
                      <DetailItem label="Tujuan / Penerima">
                        <span className="font-mono text-[14px] font-bold text-[#CC6B27]">
                          {selectedNotif.tujuan}
                        </span>
                      </DetailItem>
                    </div>
                  </div>
                </DetailSection>

                {/* Section 2: Konteks Referensi */}
                <DetailSection icon={<AlertCircle size={16} />} title="Konteks Referensi">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Kategori Sistem">
                      <span className="capitalize">{selectedNotif.ref_type || "-"}</span>
                    </DetailItem>
                    <DetailItem label="ID Referensi">
                      <span className="font-mono">#{selectedNotif.ref_id || "-"}</span>
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Section 3: Isi Pesan */}
                <div className="rounded-xl border border-[#CC6B27]/20 bg-orange-50/40 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#071E3D]">
                    <MessageSquare size={16} className="text-[#CC6B27]" />
                    Isi Pesan
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg border border-[#071E3D]/10 bg-white p-4 text-[13px] font-medium leading-relaxed text-[#182D4A]">
                    {selectedNotif.pesan}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLBAR CUSTOM */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      ` }} />
    </div>
  );
};

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

function DetailSection({ icon, title, children }) {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 border-b border-[#CC6B27]/20 pb-3 text-[14px] font-bold text-[#CC6B27]">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#071E3D]">
        {label}
      </p>
      <div className="text-[13px] font-medium text-[#182D4A]/80">{children}</div>
    </div>
  );
}

export default NotifikasiAdmin;