import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search,
  Eye,
  Save,
  X,
  MessageSquare,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Inbox,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Edit
} from "lucide-react";

const Pengaduan = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusEdit, setStatusEdit] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter((item) => {
      const nama = item.nama_pengadu?.toLowerCase() || "";
      const email = item.email_pengadu?.toLowerCase() || "";
      const isi = item.isi_pengaduan?.toLowerCase() || "";
      return (
        nama.includes(lowerTerm) ||
        email.includes(lowerTerm) ||
        isi.includes(lowerTerm)
      );
    });
    setFilteredData(filtered);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/pengaduan");
      const result = response.data.data || [];
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching pengaduan:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setStatusEdit(item.status_pengaduan || "masuk");
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/admin/pengaduan/${selectedItem.id_pengaduan}/status`, {
        status_pengaduan: statusEdit,
      });
      await notifikasi.sukses("Berhasil", "Status pengaduan berhasil diperbarui");
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
      notifikasi.gagal(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat memperbarui status"
      );
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
      case "tindak_lanjut":
        return (
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
            Masuk
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalMasuk = data.filter((item) => !item.status_pengaduan || item.status_pengaduan === "masuk").length;
  const totalDiproses = data.filter((item) => item.status_pengaduan === "tindak_lanjut").length;
  const totalSelesai = data.filter((item) => item.status_pengaduan === "selesai").length;

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard icon={<Inbox size={22} />} label="Total Laporan" value={`${data.length} Data`} tone="navy" />
          <StatCard icon={<AlertCircle size={22} />} label="Laporan Masuk" value={`${totalMasuk} Baru`} tone="orange" />
          <StatCard icon={<Clock size={22} />} label="Sedang Diproses" value={`${totalDiproses} Proses`} tone="blue" />
          <StatCard icon={<CheckCircle size={22} />} label="Telah Selesai" value={`${totalSelesai} Selesai`} tone="green" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <ClipboardList size={18} className="text-[#CC6B27]" />
              Daftar Pengaduan
            </h4>

            <div className="group relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari nama, email, atau isi aduan..."
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
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Pengirim</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Isi Singkat</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="w-24 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data pengaduan...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <MessageSquare size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Data pengaduan tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id_pengaduan} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] font-semibold text-[#182D4A]/80">
                        {formatDate(item.tanggal_pengaduan)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13.5px] font-bold text-[#071E3D]">
                          {item.nama_pengadu}
                        </div>
                        <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                          {item.sebagai_siapa}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[280px] truncate text-[13px] text-[#182D4A]/80" title={item.isi_pengaduan}>
                          {item.isi_pengaduan}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        {getStatusBadge(item.status_pengaduan)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetailClick(item)}
                            className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                            title="Detail & Update Status"
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
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail & Tindak Lanjut Pengaduan</h3>
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
                      <DetailItem label="Nama Lengkap">{selectedItem.nama_pengadu}</DetailItem>
                      <DetailItem label="Sebagai">
                        <span className="capitalize">{selectedItem.sebagai_siapa}</span>
                      </DetailItem>
                      <DetailItem label="Email" icon={<Mail size={12} />}>
                        {selectedItem.email_pengadu || "-"}
                      </DetailItem>
                      <DetailItem label="No HP" icon={<Phone size={12} />}>
                        {selectedItem.no_hp_pengadu || "-"}
                      </DetailItem>
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
                        Status Penanganan
                      </label>
                      <select
                        className="w-full rounded-lg border border-[#071E3D]/20 bg-white p-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/20"
                        value={statusEdit}
                        onChange={(e) => setStatusEdit(e.target.value)}
                      >
                        <option value="masuk">Masuk (Belum dibaca)</option>
                        <option value="tindak_lanjut">Sedang Ditindak Lanjuti</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <p className="mb-0 mt-4 text-[11px] leading-relaxed text-[#182D4A]/70">
                    Admin hanya berwenang memperbarui status penanganan tanpa mengubah isi laporan.
                  </p>
                </div>
              </div>

              {/* BARIS 2: ISI LAPORAN PENGADUAN */}
              <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#071E3D]/10 pb-2.5">
                  <h4 className="m-0 flex items-center gap-2 text-[14px] font-bold text-[#071E3D]">
                    <MessageSquare size={16} className="text-[#CC6B27]" />
                    Isi Laporan Pengaduan
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#071E3D]/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/70">
                    <Clock size={12} />
                    {formatDate(selectedItem.tanggal_pengaduan)}
                  </span>
                </div>
                <p className="m-0 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-[#182D4A]">
                  {selectedItem.isi_pengaduan}
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
                onClick={handleStatusChange}
              >
                <Save size={16} />
                Simpan Status
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

export default Pengaduan;