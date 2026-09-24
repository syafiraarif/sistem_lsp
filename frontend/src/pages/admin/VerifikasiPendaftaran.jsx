// frontend/src/pages/admin/VerifikasiPendaftaran.jsx

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Eye, 
  Trash2, 
  CheckSquare, 
  X, 
  Check, 
  XCircle, 
  User as UserIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Clock,
  AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const VerifikasiPendaftaran = () => {
  // --- STATE ---
  const [pendaftarList, setPendaftarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination Fix 10 Data
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk checkbox multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  // State untuk Modal Detail
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- FETCH DATA ---
  const fetchPendaftar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pendaftaran");
      setPendaftarList(res.data.data || []);
    } catch (error) {
      console.error("Gagal load pendaftar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendaftar();
  }, []);

  // --- FILTER & PAGINATION ---
  const filteredData = pendaftarList.filter((item) =>
    (item.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nik || "").includes(searchQuery) ||
    (item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentData = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]); // Reset checklist saat search/pindah data
  }, [searchQuery]);

  // --- LOGIC CHECKBOX ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = currentData.map((item) => item.id_pendaftaran);
      setSelectedIds(allCurrentIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  // --- LOGIC DETAIL ---
  const handleDetail = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // --- LOGIC APPROVE & REJECT ---
  const handleApprove = async (id, nama) => {
    const confirm = await Swal.fire({
      title: "Terima Pendaftaran?",
      text: `Pendaftaran atas nama ${nama} akan disetujui dan akun akan dibuatkan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981", 
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Terima!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.post(`/admin/pendaftaran/${id}/approve`);
        Swal.fire("Berhasil", "Pendaftaran disetujui dan email telah dikirim.", "success");
        setShowModal(false);
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menyetujui pendaftaran", "error");
      }
    }
  };

  const handleReject = async (id, nama) => {
    const confirm = await Swal.fire({
      title: "Tolak Pendaftaran?",
      text: `Pendaftaran atas nama ${nama} akan ditolak.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", 
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.post(`/admin/pendaftaran/${id}/reject`);
        Swal.fire("Ditolak", "Pendaftaran berhasil ditolak.", "success");
        setShowModal(false);
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menolak pendaftaran", "error");
      }
    }
  };

  // --- LOGIC DELETE SINGLE ---
  const handleDelete = async (id, nama) => {
    const confirm = await Swal.fire({
      title: "Hapus Pendaftar?",
      text: `Data pendaftaran ${nama} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/pendaftaran/${id}`);
        Swal.fire("Terhapus", "Data pendaftar berhasil dihapus", "success");
        setSelectedIds(selectedIds.filter((item) => item !== id));
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data", "error");
      }
    }
  };

  // --- LOGIC BULK DELETE ---
  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({
      title: `Hapus ${selectedIds.length} Pendaftar?`,
      text: "Semua data yang dipilih akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await api.post("/admin/pendaftaran/bulk-delete", { ids: selectedIds });
        Swal.fire("Terhapus", `${selectedIds.length} data berhasil dihapus`, "success");
        setSelectedIds([]);
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data massal", "error");
      }
    }
  };

  // --- STATS CALCULATION ---
  const totalPending = pendaftarList.filter((d) => d.status === "pending").length;
  const totalApproved = pendaftarList.filter((d) => d.status === "approved").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Pendaftar Baru</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Validasi data calon asesi baru yang mendaftar ke sistem.
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-5 py-2.5 text-[13px] font-bold text-red-600 border border-red-200 transition-all hover:bg-red-600 hover:text-white"
              >
                <Trash2 size={16} /> Hapus {selectedIds.length} Data Terpilih
              </button>
            )}
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<ClipboardList size={22} />} label="Total Pendaftar" value={`${pendaftarList.length} Orang`} tone="navy" />
          <StatCard icon={<Clock size={22} />} label="Menunggu Validasi" value={`${totalPending} Orang`} tone="orange" />
          <StatCard icon={<UserCheck size={22} />} label="Telah Disetujui" value={`${totalApproved} Orang`} tone="green" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          {/* Header & Search */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <CheckSquare size={18} className="text-[#CC6B27]" />
              Daftar Antrian Pendaftaran
            </h4>

            <div className="group relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari Nama, NIK, atau Email..."
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1050px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#CC6B27] focus:ring-[#CC6B27]"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === currentData.length && currentData.length > 0}
                    />
                  </th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Identitas Lengkap</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Program / Kompetensi</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Tanggal Daftar</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="w-24 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data pendaftar...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <UserIcon size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Belum ada data pendaftar baru.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id_pendaftaran} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#CC6B27] focus:ring-[#CC6B27]"
                          checked={selectedIds.includes(item.id_pendaftaran)}
                          onChange={(e) => handleSelectOne(e, item.id_pendaftaran)}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_lengkap}</p>
                        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/50">NIK: {item.nik}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[#CC6B27]">{item.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13.5px] font-bold text-[#071E3D]">{item.program_studi}</p>
                        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/70">{item.kompetensi_keahlian}</p>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#182D4A]">
                        {new Date(item.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'pending' ? 'bg-[#CC6B27]/10 text-[#CC6B27] border-[#CC6B27]/20' :
                            item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleDetail(item)}
                            className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white" 
                            title="Detail Verifikasi"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id_pendaftaran, item.nama_lengkap)}
                            className="rounded-lg bg-red-50 p-1.5 text-red-600 border border-red-100 transition-colors hover:bg-red-600 hover:text-white" 
                            title="Hapus Data"
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

      {/* --- MODAL DETAIL VERIFIKASI --- */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Pendaftaran</h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Modal */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <div className="space-y-6">
                
                {/* Section 1: Informasi Pribadi */}
                <DetailSection icon={<UserIcon size={16} />} title="Informasi Pribadi">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="NIK">{selectedItem.nik}</DetailItem>
                    <DetailItem label="Nama Lengkap">{selectedItem.nama_lengkap}</DetailItem>
                    <DetailItem label="Email & No HP">
                      <div className="text-[13px] font-medium text-[#182D4A]/80">{selectedItem.email}</div>
                      <div className="text-[13px] font-medium text-[#182D4A]/80">{selectedItem.no_hp}</div>
                    </DetailItem>
                    <DetailItem label="Pendidikan Terakhir">{selectedItem.pendidikan_terakhir || "-"}</DetailItem>
                  </div>
                </DetailSection>

                {/* Section 2: Alamat & Pekerjaan */}
                <DetailSection icon={<MapPin size={16} />} title="Alamat & Pekerjaan">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <DetailItem label="Alamat Domisili">
                        {selectedItem.alamat_lengkap} <br />
                        Kec. {selectedItem.kecamatan}, {selectedItem.kota}, {selectedItem.provinsi}
                      </DetailItem>
                    </div>
                    <DetailItem label="Pekerjaan & Jabatan">{selectedItem.pekerjaan || "-"} ({selectedItem.jabatan || "-"})</DetailItem>
                    <DetailItem label="Perusahaan / Instansi">{selectedItem.nama_perusahaan || "-"}</DetailItem>
                  </div>
                </DetailSection>

                {/* Section 3: Program Studi */}
                <div className="rounded-xl border border-[#CC6B27]/20 bg-orange-50/40 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#071E3D]">
                    <CheckSquare size={16} className="text-[#CC6B27]" />
                    Program Studi & Kompetensi
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Program Studi">
                      <span className="font-bold text-[#CC6B27]">{selectedItem.program_studi || "-"}</span>
                    </DetailItem>
                    <DetailItem label="Kompetensi Keahlian">
                      <span className="font-bold text-[#CC6B27]">{selectedItem.kompetensi_keahlian || "-"}</span>
                    </DetailItem>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button 
                type="button" 
                className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" 
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
              
              {selectedItem.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleReject(selectedItem.id_pendaftaran, selectedItem.nama_lengkap)}
                    className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-5 py-2.5 text-[13px] font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white"
                  >
                    <XCircle size={16} /> Tolak
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedItem.id_pendaftaran, selectedItem.nama_lengkap)}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-green-600"
                  >
                    <Check size={16} /> Verifikasi & Terima
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />
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

export default VerifikasiPendaftaran;