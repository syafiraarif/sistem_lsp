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
  Clock,
  Loader2,
  ClipboardList,
  BadgeCheck,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  User,
  Edit
} from "lucide-react";

const Banding = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Modal Preview Form FR.AK.04 & FR.AK.03
  const [showFormModal, setShowFormModal] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formDetailData, setFormDetailData] = useState(null);
  
  const [formUpdate, setFormUpdate] = useState({
    status_progress: "diajukan",
    keputusan: "belum_diputuskan",
    catatan_komite: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter((item) => {
      const ket = item.isi_banding?.toLowerCase() || "";
      const emailUser = item.user?.email?.toLowerCase() || "";
      const namaUser = (item.user?.profileAsesi?.nama_lengkap || item.user?.username || "").toLowerCase();
      return (
        emailUser.includes(lowerTerm) ||
        namaUser.includes(lowerTerm) ||
        ket.includes(lowerTerm)
      );
    });
    setFilteredData(filtered);
    setPagination((prev) => ({ ...prev, page: 1 }));
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
      notifikasi.sukses("Berhasil", "Keputusan banding telah diperbarui");
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
      notifikasi.gagal("Gagal", error.response?.data?.message || "Terjadi kesalahan saat update status");
    }
  };

  const handleViewFormDetail = async () => {
    const targetId = selectedItem?.id_peserta || selectedItem?.id_user;
    if (!targetId) {
      notifikasi.info("Info", "Asesi belum terdaftar pada jadwal asesmen.");
      return;
    }

    setLoadingForm(true);
    setShowFormModal(true);
    setFormDetailData(null);
    try {
      const res = await api.get(`/admin/fr-ak04/${targetId}`);
      setFormDetailData(res.data?.data || null);
    } catch (error) {
      console.error("Get detail form error:", error);
      setShowFormModal(false);
      notifikasi.info(
        "Dokumen Belum Tersedia",
        error.response?.data?.message || "Asesi belum mengisi formulir FR.AK.04 pada jadwal asesmen."
      );
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDownloadPdf = async () => {
    const targetId = selectedItem?.id_peserta || selectedItem?.id_user;
    if (!targetId) {
      notifikasi.info("Info", "Data referensi peserta tidak ditemukan untuk pengajuan ini.");
      return;
    }

    setDownloadingPdf(true);
    try {
      const response = await api.get(`/admin/fr-ak04/pdf/${targetId}`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FR-AK-04-${targetId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download PDF error:", error);
      notifikasi.info(
        "Dokumen Belum Tersedia",
        "Asesi mengajukan banding melalui menu banding tanpa mengisi formulir FR.AK.04."
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

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

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">

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
                          {item.user?.profileAsesi?.nama_lengkap || item.user?.username || "User"}
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
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetailClick(item)}
                            className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                            title="Detail & Keputusan Pleno"
                          >
                            <Eye size={16} />
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
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                  {pagination.page} / {totalPages}
                </span>
                <button
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL SPLIT-VIEW SEIMBANG KIRI & KANAN */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Pengajuan & Keputusan Banding</h3>
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

            {/* Content Modal Split View */}
            <form id="formUpdateBanding" onSubmit={handleUpdate} className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                
                {/* KOLOM KIRI: INFORMASI READ-ONLY (7 KOLOM) */}
                <div className="flex flex-col gap-5 lg:col-span-7">
                  <DetailSection icon={<User size={16} />} title="Informasi Pengajuan (Read-Only)">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailItem label="Asesi">
                        <div>{selectedItem.user?.profileAsesi?.nama_lengkap || selectedItem.user?.username || "User"}</div>
                        <div className="text-[11px] font-normal text-[#182D4A]/60">{selectedItem.user?.email || "-"}</div>
                      </DetailItem>
                      <DetailItem label="Tanggal Pengajuan">
                        {formatDate(selectedItem.tanggal_ajukan)}
                      </DetailItem>
                      <div className="sm:col-span-2">
                        <DetailItem label="Alasan Banding">
                          <div className="custom-scrollbar mt-1 max-h-44 overflow-y-auto rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-3 text-[13px] font-normal leading-relaxed text-[#182D4A]">
                            <span className="whitespace-pre-wrap">{selectedItem.isi_banding || "-"}</span>
                          </div>
                        </DetailItem>
                      </div>
                      {selectedItem.file_bukti && (
                        <div className="sm:col-span-2">
                          <p className="mb-2 text-[11px] font-bold text-[#182D4A]/60">File Bukti Pendukung</p>
                          <a
                            href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${selectedItem.file_bukti}`}
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

                  <DetailSection icon={<FileText size={16} />} title="Formulir FR.AK.03 & FR.AK.04 Asesmen" className="flex-1">
                    <p className="text-[12px] font-medium text-[#182D4A]/70">
                      Dokumen pendukung proses asesmen & banding yang diisi asesi pada jadwal terkait:
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleViewFormDetail}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-4 py-2 text-[12px] font-bold text-white transition-all hover:bg-[#CC6B27]"
                      >
                        <Eye size={15} /> Lihat Detail Form
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2 text-[12px] font-bold text-[#071E3D] transition-all hover:bg-slate-50 disabled:opacity-60"
                      >
                        {downloadingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} 
                        {downloadingPdf ? "Mengunduh PDF..." : "Unduh PDF FR.AK.04"}
                      </button>
                    </div>
                  </DetailSection>
                </div>

                {/* KOLOM KANAN: PANEL TINDAKAN ADMIN (5 KOLOM) */}
                <div className="lg:col-span-5">
                  <div className="flex h-full flex-col rounded-xl border-2 border-[#CC6B27]/30 bg-orange-50/40 p-5">
                    <div className="mb-4 flex items-center justify-between border-b border-[#CC6B27]/20 pb-3">
                      <h4 className="m-0 flex items-center gap-2 text-[14px] font-bold text-[#071E3D]">
                        <Edit size={16} className="text-[#CC6B27]" />
                        Tindakan Admin
                      </h4>
                      <span className="rounded bg-[#CC6B27] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Dapat Diubah
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">
                          1. Status Progress
                        </label>
                        <select
                          className="w-full rounded-lg border border-[#071E3D]/20 bg-white p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/20"
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
                        <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">
                          2. Keputusan Akhir
                        </label>
                        <select
                          className="w-full rounded-lg border border-[#071E3D]/20 bg-white p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/20"
                          value={formUpdate.keputusan}
                          onChange={(e) => setFormUpdate((p) => ({ ...p, keputusan: e.target.value }))}
                        >
                          <option value="belum_diputuskan">-- Belum Diputuskan --</option>
                          <option value="diterima">Banding Diterima (Kompeten)</option>
                          <option value="ditolak">Banding Ditolak (Tetap BK)</option>
                        </select>
                      </div>

                      <div className="flex flex-1 flex-col">
                        <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">
                          3. Catatan Komite / Hasil Pleno
                        </label>
                        <textarea
                          rows="4"
                          className="min-h-[110px] w-full flex-1 resize-none rounded-lg border border-[#071E3D]/20 bg-white p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/20"
                          placeholder="Masukkan catatan hasil rapat pleno komite di sini..."
                          value={formUpdate.catatan_komite}
                          onChange={(e) => setFormUpdate((p) => ({ ...p, catatan_komite: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
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

      {/* MODAL PREVIEW DETAIL FORM FR.AK.04 & FR.AK.03 */}
      {showFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#071E3D]/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#071E3D] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-[#CC6B27]" />
                <h3 className="m-0 text-[15px] font-bold">Detail Formulir FR.AK.04 & FR.AK.03</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              {loadingForm ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={32} />
                  <p className="text-[13px] font-medium text-[#182D4A]">Memuat rincian formulir...</p>
                </div>
              ) : formDetailData ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4 sm:grid-cols-2">
                    <DetailItem label="Nama Asesi">{formDetailData.nama_asesi}</DetailItem>
                    <DetailItem label="Nama Asesor">{formDetailData.nama_asesor}</DetailItem>
                    <DetailItem label="Skema Sertifikasi">{formDetailData.nama_skema}</DetailItem>
                    <DetailItem label="Tanggal Asesmen">{formatDate(formDetailData.tanggal_asesmen)}</DetailItem>
                  </div>

                  <div className="rounded-xl border border-[#071E3D]/10 p-4">
                    <h4 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-[#071E3D]">
                      Pertanyaan Banding (FR.AK.04)
                    </h4>
                    <div className="space-y-2.5 text-[13px]">
                      <div className="flex items-center justify-between border-b border-[#071E3D]/5 pb-2">
                        <span>1. Apakah Proses Banding telah dijelaskan kepada Anda?</span>
                        <span className="rounded bg-[#071E3D]/10 px-2.5 py-0.5 font-bold uppercase text-[#071E3D]">
                          {formDetailData.proses_banding_dijelaskan || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#071E3D]/5 pb-2">
                        <span>2. Apakah Anda telah mendiskusikan Banding dengan Asesor?</span>
                        <span className="rounded bg-[#071E3D]/10 px-2.5 py-0.5 font-bold uppercase text-[#071E3D]">
                          {formDetailData.diskusi_dengan_asesor || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>3. Apakah Anda mau melibatkan orang lain membantu Proses Banding?</span>
                        <span className="rounded bg-[#071E3D]/10 px-2.5 py-0.5 font-bold uppercase text-[#071E3D]">
                          {formDetailData.melibatkan_orang_lain || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#071E3D]/10 p-4">
                    <h4 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-[#071E3D]">
                      Alasan Banding di FR.AK.04
                    </h4>
                    <p className="whitespace-pre-wrap text-[13px] text-[#182D4A]">
                      {formDetailData.alasan_banding || "-"}
                    </p>
                  </div>

                  {formDetailData.fr_ak03 && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                      <h4 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-[#071E3D]">
                        Catatan Umpan Balik Asesi (FR.AK.03)
                      </h4>
                      <p className="text-[13px] text-[#182D4A]">
                        {formDetailData.fr_ak03.catatan_tambahan || "Asesi telah mengisi FR.AK.03 pada jadwal ini."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-[#182D4A]/70">
                  <AlertCircle size={36} className="mx-auto mb-2 text-[#CC6B27]" />
                  <p className="text-[13px] font-semibold">Data FR.AK.04 tidak ditemukan.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-3.5">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#a8561f]"
              >
                <Download size={15} /> Unduh PDF FR.AK.04
              </button>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2 text-[12px] font-bold text-[#182D4A]"
              >
                Tutup
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

function DetailSection({ icon, title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm ${className}`}>
      <h4 className="mb-4 flex items-center gap-2 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">
        <span className="text-[#CC6B27]">{icon}</span> {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, icon }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#182D4A]/60">
        {icon}
        {label}
      </p>
      <div className="text-[13px] font-semibold text-[#071E3D]">{children}</div>
    </div>
  );
}

export default Banding;