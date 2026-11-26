import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Star,
  Eye,
  EyeOff,
  FileText,
  X,
  Save,
  User,
  Inbox,
  CheckCircle,
  Edit
} from "lucide-react";

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusEdit, setStatusEdit] = useState("tidak_aktif");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/feedback");
      setFeedbacks(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setStatusEdit(item.status || "tidak_aktif");
    setShowModal(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/admin/feedback/${selectedItem.id_feedback}/toggle-status`, {
        status: statusEdit,
      });
      await notifikasi.sukses("Berhasil", "Visibilitas ulasan berhasil diperbarui");
      setShowModal(false);
      fetchFeedbacks();
    } catch (err) {
      console.error("Update error:", err);
      notifikasi.gagal("Gagal", err.response?.data?.message || "Gagal mengubah visibilitas ulasan");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Feedback?",
      text: "Data ulasan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/feedback/${id}`);
          await notifikasi.sukses("Terhapus", "Feedback berhasil dihapus.");
          if (selectedItem?.id_feedback === id) setShowModal(false);
          fetchFeedbacks();
        } catch (err) {
          notifikasi.gagal("Error", "Gagal menghapus feedback");
        }
      }
    });
  };

  const filteredData =
    feedbacks?.filter(
      (item) =>
        item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pesan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.peran?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalDitampilkan = feedbacks.filter((item) => item.status === "aktif").length;
  const totalDisembunyikan = feedbacks.filter((item) => item.status !== "aktif").length;
  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, cur) => acc + Number(cur.rating || 0), 0) / feedbacks.length).toFixed(1)
      : "0.0";

  const renderStars = (rating, size = 14) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={`${i <= rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300"}`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[#FAFAFA] p-6 md:p-8">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<Inbox size={22} />} label="Total Ulasan" value={`${feedbacks.length} Data`} tone="navy" />
        <StatCard icon={<CheckCircle size={22} />} label="Ditampilkan Publik" value={`${totalDitampilkan} Aktif`} tone="green" />
        <StatCard icon={<EyeOff size={22} />} label="Disembunyikan" value={`${totalDisembunyikan} Arsip`} tone="orange" />
        <StatCard icon={<Star size={22} />} label="Rata-Rata Rating" value={`${avgRating} / 5.0`} tone="blue" />
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <FileText size={18} className="text-[#CC6B27]" /> Daftar Ulasan
          </h4>
          <div className="group relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
            <input
              type="text"
              placeholder="Cari nama, peran, atau isi ulasan..."
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>

        {/* Scrollbar horizontal abu-abu tua bawaan sama seperti Pengaduan & Banding */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full min-w-[950px] border-collapse bg-white text-left">
            <thead>
              <tr>
                <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Pengirim</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Isi Singkat Ulasan</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Rating</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Visibilitas</th>
                <th className="w-28 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                    <p className="text-[14px] font-medium text-[#182D4A]">Memuat data feedback...</p>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <MessageSquare size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                    <p className="text-[14px] font-medium text-[#182D4A]">Belum ada feedback yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.id_feedback} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                    <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_lengkap}</div>
                      <div className="mt-0.5 text-[11px] font-semibold capitalize text-[#CC6B27]">
                        {item.peran?.replace("_", " ")}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-[13px] text-[#182D4A]" title={item.pesan}>
                      {item.pesan}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">{renderStars(item.rating)}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "aktif"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.status === "aktif" ? "Ditampilkan" : "Disembunyikan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDetailClick(item)}
                          className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                          title="Detail & Atur Visibilitas"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id_feedback)}
                          className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-[#071E3D]/10 pt-5 text-[13px] font-medium text-[#182D4A]">
            <span>
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
            </span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                {pagination.page} / {totalPages}
              </span>
              <button
                className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50"
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL & TINDAKAN ADMIN */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Ulasan & Visibilitas Publik</h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Modal */}
            <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto bg-white p-6">
              {/* BARIS 1: INFORMASI PENGIRIM (KIRI) & TINDAKAN ADMIN (KANAN) SEJAJAR */}
              <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-12">
                {/* KIRI: Informasi Pengirim (7 Kolom) */}
                <div className="flex flex-col justify-between rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm md:col-span-7">
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">
                      <User size={16} className="text-[#CC6B27]" /> Informasi Pengirim (Read-Only)
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-[11px] font-bold text-[#182D4A]/60">Nama Lengkap</p>
                        <p className="text-[13px] font-semibold text-[#071E3D]">{selectedItem.nama_lengkap}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-bold text-[#182D4A]/60">Peran</p>
                        <p className="text-[13px] font-semibold capitalize text-[#071E3D]">
                          {selectedItem.peran?.replace("_", " ") || "-"}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-[11px] font-bold text-[#182D4A]/60">Penilaian Bintang</p>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedItem.rating, 18)}
                          <span className="text-[12px] font-bold text-[#071E3D]">({selectedItem.rating} / 5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KANAN: Tindakan Admin (5 Kolom) */}
                <div className="flex flex-col justify-between rounded-xl border-2 border-[#CC6B27]/30 bg-orange-50/40 p-5 md:col-span-5">
                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-[#CC6B27]/20 pb-3">
                      <h4 className="m-0 flex items-center gap-2 text-[14px] font-bold text-[#071E3D]">
                        <Edit size={16} className="text-[#CC6B27]" />
                        Tindakan Admin
                      </h4>
                      <span className="rounded bg-[#CC6B27] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Dapat Diubah
                      </span>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-bold text-[#071E3D]">
                        Status Tampil di Beranda
                      </label>
                      <select
                        className="w-full rounded-lg border border-[#071E3D]/20 bg-white p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/20"
                        value={statusEdit}
                        onChange={(e) => setStatusEdit(e.target.value)}
                      >
                        <option value="aktif">Ditampilkan ke Publik</option>
                        <option value="tidak_aktif">Disembunyikan (Arsip Internal)</option>
                      </select>
                    </div>
                  </div>

                  <p className="mb-0 mt-4 text-[11px] leading-relaxed text-[#182D4A]/70">
                    Admin hanya mengatur status tampilan ulasan tanpa mengubah isi ulasan pengguna.
                  </p>
                </div>
              </div>

              {/* BARIS 2: ISI ULASAN LENGKAP */}
              <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                <h4 className="mb-3 flex items-center gap-2 border-b border-[#071E3D]/10 pb-2.5 text-[14px] font-bold text-[#071E3D]">
                  <MessageSquare size={16} className="text-[#CC6B27]" />
                  Isi Ulasan Lengkap
                </h4>
                <p className="m-0 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-[#182D4A]">
                  {selectedItem.pesan}
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f]"
                onClick={handleSaveStatus}
              >
                <Save size={16} />
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
      ` }} />
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
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

export default FeedbackAdmin;