// frontend/src/pages/admin/Notifikasi.jsx

import React, { useState, useEffect } from "react";
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
  Sparkles,
  Inbox,
  Send,
  Activity,
} from "lucide-react";

const NotifikasiAdmin = () => {
  // --- STATE ---
  const [allData, setAllData] = useState([]); // Data mentah dari DB
  const [data, setData] = useState([]); // Data yang ditampilkan (paginated)
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const response = await api.get("/admin/notifikasi");
      if (response.data.success) {
        setAllData(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data notifikasi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const currentPage =
      pagination.page > totalPages && totalPages > 0 ? totalPages : pagination.page;

    // 5. Slicing
    const startIndex = (currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = processedData.slice(startIndex, endIndex);

    setData(paginatedData);
    setPagination((prev) => ({
      ...prev,
      page: currentPage,
      total: totalItems,
      totalPages: totalPages || 1,
    }));
  }, [allData, searchTerm, filterType, filterChannel, pagination.page]);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Log?",
      text: "Data notifikasi ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444",
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
  const totalEmail = allData.filter((item) => item.channel === "email").length;
  const totalWa = allData.filter((item) => item.channel === "wa").length;

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
                <Bell size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Notifikasi Sistem
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Riwayat
                <br />
                <span className="text-orange-500">Notifikasi</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Monitor status pengiriman notifikasi Email dan WhatsApp Gateway
                dari seluruh aktivitas sistem.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Total Riwayat
                </p>

                <h2 className="mb-4 text-5xl font-black leading-none">
                  {allData.length}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data mencakup notifikasi akun, pendaftaran, pengaduan, dan
                  referensi sistem lainnya.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Email" value={`${totalEmail}`} />
                  <HeroPill label="WhatsApp" value={`${totalWa}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MiniStat icon={<Inbox size={22} />} label="Total Data" value={allData.length} />
          <MiniStat icon={<CheckCircle size={22} />} label="Terkirim" value={totalSukses} />
          <MiniStat icon={<XCircle size={22} />} label="Gagal" value={totalGagal} />
          <MiniStat icon={<Activity size={22} />} label="Ditampilkan" value={data.length} />
        </section>

        {/* CONTENT CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <Send size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Log Pengiriman
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Daftar Riwayat Notifikasi
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Gunakan pencarian dan filter untuk melihat riwayat yang lebih spesifik.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 lg:w-auto lg:grid-cols-[320px_180px_180px]">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Cari tujuan atau isi pesan..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={18}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="pendaftaran">Pendaftaran</option>
                    <option value="pengaduan">Pengaduan</option>
                    <option value="akun">Akun User</option>
                  </select>
                </div>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="">Semua Channel</option>
                    <option value="email">Email</option>
                    <option value="wa">WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Waktu Kirim</TableHead>
                  <TableHead>Channel & Tipe</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
                      <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
                        Memuat Riwayat
                      </p>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item, index) => {
                    const { date, time } = formatDateTime(item.waktu_kirim);

                    return (
                      <tr
                        key={item.id_notifikasi || index}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-black text-[#071E3D]">{date}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400">
                            <Clock size={12} /> {time}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                item.channel === "email"
                                  ? "bg-[#071E3D]/10 text-[#071E3D]"
                                  : "bg-orange-50 text-orange-500"
                              }`}
                            >
                              {item.channel === "email" ? (
                                <Mail size={12} />
                              ) : (
                                <MessageSquare size={12} />
                              )}
                              {item.channel}
                            </span>

                            <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              {item.ref_type || "General"}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-[240px] break-all px-5 py-4 text-sm font-black text-[#071E3D]">
                          {item.tujuan}
                        </td>

                        <td className="px-5 py-4">
                          <div
                            className="max-w-[290px] truncate text-sm font-semibold text-slate-500"
                            title={item.pesan}
                          >
                            {item.pesan}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                              item.status_kirim === "terkirim"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status_kirim === "terkirim" ? (
                              <CheckCircle size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {item.status_kirim === "terkirim" ? "Sukses" : "Gagal"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                              onClick={() => openDetail(item)}
                              title="Lihat Detail Notifikasi"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                              onClick={() => handleDelete(item.id_notifikasi)}
                              title="Hapus Data Notifikasi"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Bell size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-sm font-black text-[#071E3D]">
                        Tidak ada riwayat notifikasi ditemukan.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {data.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-5 text-sm font-bold text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>
                Menampilkan <b className="text-[#071E3D]">{data.length}</b> dari{" "}
                <b className="text-[#071E3D]">{pagination.total}</b> data
              </span>

              <div className="flex items-center gap-2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#071E3D] transition-all hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-sm font-black text-[#071E3D]">
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#071E3D] transition-all hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={
                    pagination.page === pagination.totalPages ||
                    pagination.totalPages === 0
                  }
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* MODAL DETAIL */}
      {showDetailModal && selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Bell size={21} className="text-orange-500" />
                  Detail Notifikasi
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Rincian pesan yang dikirimkan sistem.
                </p>
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Status Banner */}
              <div
                className={`mb-6 flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-black uppercase tracking-widest ${
                  selectedNotif.status_kirim === "terkirim"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {selectedNotif.status_kirim === "terkirim" ? (
                  <CheckCircle size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                Status Pengiriman: {selectedNotif.status_kirim?.toUpperCase()}
              </div>

              <div className="space-y-6">
                {/* Informasi Pengiriman */}
                <DetailSection
                  icon={<Mail size={17} />}
                  title="Informasi Pengiriman"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Channel">
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          selectedNotif.channel === "email"
                            ? "bg-[#071E3D]/10 text-[#071E3D]"
                            : "bg-orange-50 text-orange-500"
                        }`}
                      >
                        {selectedNotif.channel === "email" ? (
                          <Mail size={12} />
                        ) : (
                          <MessageSquare size={12} />
                        )}
                        {selectedNotif.channel}
                      </span>
                    </DetailItem>

                    <DetailItem label="Waktu Kirim">
                      {formatDateTime(selectedNotif.waktu_kirim).date} pukul{" "}
                      {formatDateTime(selectedNotif.waktu_kirim).time}
                    </DetailItem>

                    <DetailItem label="Tujuan" wide>
                      <span className="break-all font-black text-orange-500">
                        {selectedNotif.tujuan}
                      </span>
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Konteks Referensi */}
                <DetailSection icon={<AlertCircle size={17} />} title="Konteks">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Tipe Referensi">
                      <span className="inline-flex w-fit rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {selectedNotif.ref_type || "-"}
                      </span>
                    </DetailItem>

                    <DetailItem label="ID Referensi">
                      <span className="font-mono font-black">
                        #{selectedNotif.ref_id || "-"}
                      </span>
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Isi Pesan */}
                <DetailSection
                  icon={<MessageSquare size={17} />}
                  title="Isi Pesan"
                >
                  <div className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-[#071E3D]">
                    {selectedNotif.pesan}
                  </div>
                </DetailSection>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-6">
              <button
                className="rounded-2xl border border-slate-100 bg-white px-7 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
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

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
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

function DetailSection({ icon, title, children }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black text-[#071E3D]">
        <span className="text-orange-500">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, wide }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <div className="text-sm font-bold text-[#071E3D]">{children}</div>
    </div>
  );
}

export default NotifikasiAdmin;