import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search,
  Eye,
  X,
  Save,
  Gavel,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  ShieldCheck,
  Inbox,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Banding = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formUpdate, setFormUpdate] = useState({
    status_progress: "diajukan",
    keputusan: "belum_diputuskan",
    catatan_komite: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Reset Pagination saat pencarian
  useEffect(() => {
    if (!data) return;

    const lowerTerm = searchTerm.toLowerCase();

    const filtered = data.filter((item) => {
      const ket = item.isi_banding?.toLowerCase() || "";
      const emailUser = item.user?.email?.toLowerCase() || "";
      const namaUser = item.user?.username?.toLowerCase() || "";

      return (
        emailUser.includes(lowerTerm) ||
        namaUser.includes(lowerTerm) ||
        ket.includes(lowerTerm)
      );
    });

    setFilteredData(filtered);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/banding");
      const result = response.data.data || [];
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching banding:", error);
      notifikasi.gagal("Error", "Gagal memuat data banding");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setFormUpdate({
      status_progress: item.status_progress || "diajukan",
      keputusan: item.keputusan || "belum_diputuskan",
      catatan_komite: item.catatan_komite || "",
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      await api.put(`/admin/banding/${selectedItem.id_banding}`, formUpdate);

      await notifikasi.sukses("Berhasil", "Status banding telah diperbarui");
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
      notifikasi.gagal("Gagal", "Terjadi kesalahan saat update status");
    }
  };

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "selesai":
        return (
          <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600">
            Selesai
          </span>
        );
      case "pleno_komite":
        return (
          <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
            Pleno Komite
          </span>
        );
      case "tindak_lanjut":
        return (
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Tindak Lanjut
          </span>
        );
      case "diajukan":
      default:
        return (
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
            Diajukan
          </span>
        );
    }
  };

  const getKeputusanBadge = (keputusan) => {
    if (keputusan === "diterima") {
      return (
        <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600">
          Diterima
        </span>
      );
    }

    if (keputusan === "ditolak") {
      return (
        <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
          Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Belum Diputus
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalDiajukan = data.filter((item) => item.status_progress === "diajukan").length;
  const totalSelesai = data.filter((item) => item.status_progress === "selesai").length;
  const totalDiterima = data.filter((item) => item.keputusan === "diterima").length;

  // Pagination Calculation
  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Data Banding Asesmen</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Kelola pengajuan banding asesi, proses tindak lanjut, pleno komite, dan keputusan akhir asesmen.
              </p>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard icon={<Inbox size={22} />} label="Total Pengajuan" value={`${data.length} Data`} tone="navy" />
          <StatCard icon={<Clock size={22} />} label="Baru Diajukan" value={`${totalDiajukan} Data`} tone="orange" />
          <StatCard icon={<CheckCircle size={22} />} label="Selesai Diproses" value={`${totalSelesai} Selesai`} tone="blue" />
          <StatCard icon={<BadgeCheck size={22} />} label="Banding Diterima" value={`${totalDiterima} Diterima`} tone="green" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <ClipboardList size={18} className="text-[#CC6B27]" />
              Daftar Pengajuan Banding
            </h4>

            <div className="group relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari email atau alasan banding..."
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Tanggal</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Asesi</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Alasan Banding</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Keputusan</th>
                  <th className="w-24 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data banding...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Gavel size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Data pengajuan tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id_banding} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] font-semibold text-[#182D4A]/80">
                        {formatDate(item.tanggal_ajukan)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13.5px] font-bold text-[#071E3D]">
                          {item.user?.username || "User"}
                        </div>
                        <div className="mt-0.5 text-[11px] font-bold text-[#182D4A]/50">
                          {item.user?.email || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[220px] truncate text-[13px] text-[#182D4A]/80" title={item.isi_banding}>
                          {item.isi_banding || "-"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        {getStatusBadge(item.status_progress)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        {getKeputusanBadge(item.keputusan)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDetailClick(item)}
                          className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          {filteredData.length > 0 && (
            <div className="flex justify-between items-center mt-6 border-t border-[#071E3D]/10 pt-5 text-[13px] font-medium text-[#182D4A]">
              <span>
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="p-1.5 rounded-md border border-[#071E3D]/20 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={18}/>
                </button>
                <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                  {pagination.page} / {totalPages}
                </span>
                <button 
                  className="p-1.5 rounded-md border border-[#071E3D]/20 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={pagination.page >= totalPages}
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
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <Gavel size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Proses Banding Asesmen</h3>
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
            <form id="formUpdateBanding" onSubmit={handleUpdate} className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <div className="space-y-6">
                
                {/* INFO PENGAJUAN */}
                <DetailSection icon={<FileText size={16} />} title="Informasi Pengajuan">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Asesi">
                      {selectedItem.user?.username || "User"} ({selectedItem.user?.email || "-"})
                    </DetailItem>
                    <DetailItem label="Tanggal Pengajuan">
                      {formatDate(selectedItem.tanggal_ajukan)}
                    </DetailItem>
                    <div className="md:col-span-2">
                      <DetailItem label="Alasan Banding">
                        <span className="whitespace-pre-wrap">{selectedItem.isi_banding || "-"}</span>
                      </DetailItem>
                    </div>
                    {selectedItem.file_bukti && (
                      <div className="md:col-span-2 mt-2">
                        <p className="mb-2 text-[11px] font-bold text-[#071E3D]">File Bukti Pendukung</p>
                        <a
                          href={`http://localhost:3000/uploads/${selectedItem.file_bukti}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27]/10 px-4 py-2 text-[12px] font-bold text-[#CC6B27] transition-all hover:bg-[#CC6B27] hover:text-white"
                        >
                          <Eye size={16} /> Buka Lampiran Bukti
                        </a>
                      </div>
                    )}
                  </div>
                </DetailSection>

                {/* UPDATE STATUS */}
                <DetailSection icon={<ShieldCheck size={16} />} title="Update Keputusan Pleno">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-bold text-[#071E3D]">
                        Status Progress
                      </label>
                      <select
                        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                        value={formUpdate.status_progress}
                        onChange={(e) => setFormUpdate((p) => ({ ...p, status_progress: e.target.value }))}
                      >
                        <option value="diajukan">Diajukan</option>
                        <option value="tindak_lanjut">Tindak Lanjut</option>
                        <option value="pleno_komite">Pleno Komite</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold text-[#071E3D]">
                        Keputusan Akhir
                      </label>
                      <select
                        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                        value={formUpdate.keputusan}
                        onChange={(e) => setFormUpdate((p) => ({ ...p, keputusan: e.target.value }))}
                      >
                        <option value="belum_diputuskan">-- Belum Diputuskan --</option>
                        <option value="diterima">Banding Diterima (Kompeten)</option>
                        <option value="ditolak">Banding Ditolak (Tetap BK)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <label className="mb-2 block text-[11px] font-bold text-[#071E3D]">
                        Catatan Komite / Hasil Pleno
                      </label>
                      <textarea
                        rows="4"
                        className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                        placeholder="Masukkan catatan detail hasil rapat pleno komite di sini..."
                        value={formUpdate.catatan_komite}
                        onChange={(e) => setFormUpdate((p) => ({ ...p, catatan_komite: e.target.value }))}
                      />
                    </div>
                  </div>
                </DetailSection>

              </div>
            </form>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                form="formUpdateBanding"
                className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f]"
              >
                <Save size={16} />
                Simpan Keputusan
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
    navy: "bg-[#071E3D]/10 text-[#071E3D]",
    yellow: "bg-yellow-50 text-yellow-600"
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
        <span className="text-[#CC6B27]">{icon}</span> {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, icon }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#071E3D]">
        {icon}
        {label}
      </p>
      <div className="text-[13px] font-medium text-[#182D4A]/80">{children}</div>
    </div>
  );
}

export default Banding;