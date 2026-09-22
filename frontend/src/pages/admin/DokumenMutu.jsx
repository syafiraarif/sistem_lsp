import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search, Plus, Eye, Edit2, Trash2, X, Save, FileText,
  Filter, Loader2, ChevronLeft, ChevronRight,
  ClipboardList, BadgeCheck, FileCheck2, RefreshCcw
} from "lucide-react";

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

const DokumenMutu = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [errors, setErrors] = useState({});

  const initialFormState = {
    jenis_dokumen: "", kategori: "", nama_dokumen: "", deskripsi: "",
    nomor_dokumen: "", nomor_revisi: "", penyusun: "", review: "",
    disahkan_oleh: "", tanggal_dokumen: ""
  };
  const [formData, setFormData] = useState(initialFormState);
  const [files, setFiles] = useState({ file_dokumen: null, file_pendukung: null });
  const [previewUrlUtama, setPreviewUrlUtama] = useState(null);
  const [showFullPreviewUtama, setShowFullPreviewUtama] = useState(false);
  const [previewUrlPendukung, setPreviewUrlPendukung] = useState(null);
  const [showFullPreviewPendukung, setShowFullPreviewPendukung] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/dokumen-mutu");
      const resBody = response.data !== undefined ? response.data : response;
      let listData = [];
      if (Array.isArray(resBody.data)) listData = resBody.data;
      else if (resBody.data?.data && Array.isArray(resBody.data.data)) listData = resBody.data.data;
      else if (Array.isArray(resBody)) listData = resBody;
      setData(listData);
    } catch (error) {
      console.error("Error Fetching:", error);
      notifikasi.gagal("Gagal", error.response?.data?.message || "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.replace(/^(\/?uploads\/|\/)/, "");
    return `http://localhost:3000/uploads/${cleanPath}`;
  };

  const getFileName = (filename, fieldName) => files[fieldName] ? files[fieldName].name : filename || "";
  const getFileExtension = (filename) => {
    const cleanName = String(filename || "").split("?")[0];
    const parts = cleanName.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };
  const isPdfFile = (filename, fieldName) => getFileExtension(getFileName(filename, fieldName)) === "pdf";
  const isImageFile = (filename, fieldName) => ["jpg", "jpeg", "png"].includes(getFileExtension(getFileName(filename, fieldName)));
  const isPreviewable = (filename, fieldName) => isPdfFile(filename, fieldName) || isImageFile(filename, fieldName);

  const validateDocumentFile = (file, label) => {
    if (!file) return null;
    const extension = getFileExtension(file.name);
    const validExtension = ALLOWED_FILE_EXTENSIONS.includes(extension);
    const validMimeType = ALLOWED_FILE_TYPES.includes(file.type);
    if (!validExtension || !validMimeType) return `${label} hanya boleh PDF, JPG, JPEG, atau PNG.`;
    return null;
  };

  const validateInput = (name, value) => {
    let errorMsg = "";
    if (typeof value === "string" && value.trim().length > 0 && value.trim().length <= 3) errorMsg = "Minimal 4 karakter.";
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateInput(name, value);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
      if (fieldName === "file_dokumen") { setPreviewUrlUtama(null); setShowFullPreviewUtama(false); }
      if (fieldName === "file_pendukung") { setPreviewUrlPendukung(null); setShowFullPreviewPendukung(false); }
      return;
    }
    const label = fieldName === "file_dokumen" ? "Dokumen utama" : "Dokumen pendukung";
    const errorMessage = validateDocumentFile(file, label);
    if (errorMessage) {
      e.target.value = "";
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
      notifikasi.peringatan("Format File Tidak Valid", errorMessage);
      return;
    }
    const url = URL.createObjectURL(file);
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    if (fieldName === "file_dokumen") { setPreviewUrlUtama(url); setShowFullPreviewUtama(false); }
    if (fieldName === "file_pendukung") { setPreviewUrlPendukung(url); setShowFullPreviewPendukung(false); }
  };

  const openModal = (type, item = null) => {
    setModalType(type); setSelectedItem(item); setShowModal(true); setErrors({});
    setShowFullPreviewUtama(false); setShowFullPreviewPendukung(false);
    if (type === "create") {
      setFormData(initialFormState); setFiles({ file_dokumen: null, file_pendukung: null });
      setPreviewUrlUtama(null); setPreviewUrlPendukung(null);
      return;
    }
    if (item) {
      setFormData({
        jenis_dokumen: item.jenis_dokumen || "", kategori: item.kategori || "", nama_dokumen: item.nama_dokumen || "",
        deskripsi: item.deskripsi || "", nomor_dokumen: item.nomor_dokumen || "", nomor_revisi: item.nomor_revisi || "",
        penyusun: item.penyusun || "", review: item.review || "", disahkan_oleh: item.disahkan_oleh || "",
        tanggal_dokumen: item.tanggal_dokumen ? item.tanggal_dokumen.split("T")[0] : ""
      });
      setFiles({ file_dokumen: null, file_pendukung: null });
      setPreviewUrlUtama(item.file_dokumen || null); setPreviewUrlPendukung(item.file_pendukung || null);
    }
  };

  const handleDelete = async (id) => {
    const result = await notifikasi.konfirmasi("Hapus Dokumen?", "Data yang dihapus tidak bisa dikembalikan!", "Ya, Hapus!", "Batal", "warning", "danger");
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/dokumen-mutu/${id}`);
      await notifikasi.sukses("Terhapus!", "Dokumen berhasil dihapus.");
      await fetchData();
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Gagal menghapus data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    Object.keys(formData).forEach((key) => { if (!validateInput(key, formData[key])) isValid = false; });
    if (!isValid) return notifikasi.peringatan("Peringatan", "Perbaiki kolom isian yang terlalu pendek!");
    if (!formData.nama_dokumen || !formData.jenis_dokumen) return notifikasi.peringatan("Peringatan", "Nama dan Jenis Dokumen wajib diisi!");

    const docError = validateDocumentFile(files.file_dokumen, "Dokumen utama");
    if (docError) return notifikasi.peringatan("Format File Tidak Valid", docError);
    if (modalType === "create" && !files.file_dokumen) return notifikasi.peringatan("Dokumen Utama Wajib", "Silakan pilih file dokumen utama.");
    
    if (modalType === "edit") {
      const confirm = await notifikasi.konfirmasi("Konfirmasi", "Yakin menyimpan perubahan?", "Ya, Simpan", "Batal");
      if (!confirm.isConfirmed) return;
    }

    const dataPayload = new FormData();
    Object.keys(formData).forEach((key) => { if (formData[key]) dataPayload.append(key, formData[key]); });
    if (files.file_dokumen) dataPayload.append("file_dokumen", files.file_dokumen);
    if (files.file_pendukung) dataPayload.append("file_pendukung", files.file_pendukung);

    try {
      setLoading(true);
      if (modalType === "create") {
        await api.post("/admin/dokumen-mutu", dataPayload, { headers: { "Content-Type": "multipart/form-data" } });
        setShowModal(false); await notifikasi.sukses("Berhasil", "Dokumen berhasil ditambahkan.");
      } else {
        await api.put(`/admin/dokumen-mutu/${selectedItem.id_dokumen}`, dataPayload, { headers: { "Content-Type": "multipart/form-data" } });
        setShowModal(false); await notifikasi.sukses("Berhasil", "Dokumen berhasil diperbarui.");
      }
      await fetchData();
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (jenis) => {
    switch (jenis) {
      case "kebijakan_mutu": return "bg-blue-50 text-blue-600 border-blue-200";
      case "manual_mutu": return "bg-purple-50 text-purple-600 border-purple-200";
      case "standar_mutu": return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "formulir_mutu": return "bg-green-50 text-green-600 border-green-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const inputClass = (name) => `w-full rounded-lg border p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 placeholder:text-slate-300 ${errors[name] ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-[#071E3D]/20 bg-[#FAFAFA] focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"}`;

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = item.nama_dokumen?.toLowerCase().includes(search) || item.nomor_dokumen?.toLowerCase().includes(search);
    const matchJenis = filterJenis ? item.jenis_dokumen === filterJenis : true;
    return matchSearch && matchJenis;
  });

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const paginatedData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Manajemen Dokumen Mutu</h2>
            <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">Kelola dokumen ISO 9001:2015, regulasi LSP, file utama, dan file pendukung.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <button type="button" onClick={fetchData} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Refresh
            </button>
            <button type="button" onClick={() => openModal("create")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#a8561f] md:flex-none">
              <Plus size={16} /> Tambah Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={<ClipboardList size={22} />} label="Total Dokumen" value={`${data.length} Dokumen`} tone="navy" />
        <StatCard icon={<BadgeCheck size={22} />} label="Jenis Dokumen" value={`${new Set(data.map((i) => i.jenis_dokumen).filter(Boolean)).size} Jenis`} tone="orange" />
        <StatCard icon={<FileCheck2 size={22} />} label="File Utama" value={`${data.filter((i) => i.file_dokumen).length} File`} tone="green" />
      </div>

      {/* CARD TABEL */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <FileText size={18} className="text-[#CC6B27]" /> Daftar Dokumen Mutu
          </h4>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px] mb-2">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <input type="text" placeholder="Cari Nama atau No. Dokumen..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all" />
          </div>
          <div className="relative w-full group">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]" />
            <select value={filterJenis} onChange={(e) => { setFilterJenis(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none transition-all">
              <option value="">Semua Jenis Dokumen</option>
              <option value="kebijakan_mutu">Kebijakan Mutu</option><option value="manual_mutu">Manual Mutu</option><option value="standar_mutu">Standar Mutu</option><option value="formulir_mutu">Formulir Mutu</option><option value="referensi">Referensi</option>
            </select>
          </div>
        </div>

        {/* Tabel Terbungkus Border Rounded */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nama Dokumen</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Jenis</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No. Dokumen</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Revisi</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Tanggal</th>
                <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                    <p className="text-[14px] font-medium text-[#182D4A]">Menarik data dari server...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id_dokumen} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                    <td className="px-5 py-4 text-center text-[13.5px] font-semibold text-[#071E3D]">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-[13.5px] font-bold text-[#071E3D]" title={item.nama_dokumen}>{item.nama_dokumen}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(item.jenis_dokumen)}`}>{item.jenis_dokumen?.replace("_", " ")}</span></td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-[#182D4A]/80">{item.nomor_dokumen || "-"}</td>
                    <td className="px-5 py-4 text-center text-[13.5px] font-bold text-[#071E3D]">{item.nomor_revisi || "-"}</td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-[#182D4A]/80">{item.tanggal_dokumen ? new Date(item.tanggal_dokumen).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal("detail", item)} className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] hover:bg-[#182D4A] hover:text-white transition-colors" title="Detail"><Eye size={16} /></button>
                        <button onClick={() => openModal("edit", item)} className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id_dokumen)} className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <FileText size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                    <p className="text-[14px] font-medium text-[#182D4A]">Data dokumen tidak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-[13px] text-[#182D4A] font-medium">
            <span>Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 transition-all" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}><ChevronLeft size={18}/></button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">{pagination.page} / {totalPages}</span>
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 transition-all" disabled={pagination.page >= totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL (Tetap sama) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  {modalType === "create" ? <Plus size={20} /> : modalType === "edit" ? <Edit2 size={20} /> : <Eye size={20} />}
                </div>
                <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">{modalType === "create" ? "Tambah Dokumen Baru" : modalType === "edit" ? "Edit Dokumen Mutu" : "Detail Dokumen"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-[#182D4A] hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-6 px-6 py-6">
                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5"><h4 className="text-[14px] font-bold text-[#071E3D]">Informasi Utama</h4></div>
                  <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2"><Label required>Nama/Judul Dokumen</Label><input className={inputClass("nama_dokumen")} type="text" name="nama_dokumen" value={formData.nama_dokumen} onChange={handleInputChange} disabled={modalType === "detail"} required /><ErrorMessage message={errors.nama_dokumen} /></div>
                    <div>
                      <Label required>Jenis Dokumen</Label>
                      <select className={inputClass("jenis_dokumen")} name="jenis_dokumen" value={formData.jenis_dokumen} onChange={handleInputChange} disabled={modalType === "detail"} required>
                        <option value="" disabled>--Pilih Jenis--</option>
                        <option value="kebijakan_mutu">Kebijakan Mutu</option><option value="manual_mutu">Manual/Panduan Mutu</option><option value="standar_mutu">Standar Mutu</option><option value="formulir_mutu">Formulir Mutu</option><option value="referensi">Referensi/Eksternal</option>
                      </select>
                    </div>
                    <div>
                      <Label>Kategori Dokumen</Label>
                      <select className={inputClass("kategori")} name="kategori" value={formData.kategori} onChange={handleInputChange} disabled={modalType === "detail"}>
                        <option value="" disabled>--Pilih Kategori--</option><option value="Kelembagaan LSP">Kelembagaan LSP</option><option value="Standar Kompetensi">Standar Kompetensi</option><option value="Skema Kompetensi">Skema Kompetensi</option><option value="Asesor Kompetensi">Asesor Kompetensi</option><option value="Asesi">Asesi</option><option value="Tempat Uji Kompetensi">Tempat Uji Kompetensi</option><option value="Jadwal Uji Kompetensi">Jadwal Uji Kompetensi</option><option value="Biaya Uji Kompetensi">Biaya Uji Kompetensi</option><option value="Dokumen dan Administrasi">Dokumen dan Administrasi</option><option value="Referensi / Acuan / undang-undang / perundangan">Referensi / Acuan / perundangan</option><option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>
                    <div className="lg:col-span-4"><Label>Deskripsi Dokumen</Label><textarea className={`${inputClass("deskripsi")} resize-none`} name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} rows="3" disabled={modalType === "detail"} /></div>
                    <div><Label>Nomor Dokumen</Label><input className={inputClass("nomor_dokumen")} type="text" name="nomor_dokumen" value={formData.nomor_dokumen} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                    <div><Label>Nomor Revisi</Label><input className={inputClass("nomor_revisi")} type="text" name="nomor_revisi" value={formData.nomor_revisi} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                    <div className="lg:col-span-2"><Label>Tanggal Dokumen</Label><input className={inputClass("tanggal_dokumen")} type="date" name="tanggal_dokumen" value={formData.tanggal_dokumen} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                    <div className="grid grid-cols-1 gap-5 border-t border-[#071E3D]/10 pt-5 lg:col-span-4 md:grid-cols-3">
                      <div><Label>Penyusun Dokumen</Label><input className={inputClass("penyusun")} type="text" name="penyusun" value={formData.penyusun} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                      <div><Label>Direview Oleh</Label><input className={inputClass("review")} type="text" name="review" value={formData.review} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                      <div><Label>Disahkan Oleh</Label><input className={inputClass("disahkan_oleh")} type="text" name="disahkan_oleh" value={formData.disahkan_oleh} onChange={handleInputChange} disabled={modalType === "detail"} /></div>
                    </div>
                  </div>
                </section>
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FilePreviewPanel title="Berkas Utama" required accent="orange" modalType={modalType} fileName={selectedItem?.file_dokumen} fileObject={files.file_dokumen} previewUrl={previewUrlUtama} showFull={showFullPreviewUtama} onToggleFull={() => setShowFullPreviewUtama(p => !p)} onFileChange={(e) => handleFileChange(e, "file_dokumen")} buildFileUrl={buildFileUrl} isPreviewable={f => isPreviewable(f, "file_dokumen")} isImageFile={f => isImageFile(f, "file_dokumen")} accept={FILE_ACCEPT} />
                  <FilePreviewPanel title="Berkas Pendukung" accent="navy" modalType={modalType} fileName={selectedItem?.file_pendukung} fileObject={files.file_pendukung} previewUrl={previewUrlPendukung} showFull={showFullPreviewPendukung} onToggleFull={() => setShowFullPreviewPendukung(p => !p)} onFileChange={(e) => handleFileChange(e, "file_pendukung")} buildFileUrl={buildFileUrl} isPreviewable={f => isPreviewable(f, "file_pendukung")} isImageFile={f => isImageFile(f, "file_pendukung")} accept={FILE_ACCEPT} />
                </section>
              </div>
              <div className="mt-auto flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] hover:bg-[#E2E8F0]">{modalType === "detail" ? "Tutup" : "Batal"}</button>
                {modalType !== "detail" && (
                  <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#a8561f] disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {loading ? "Menyimpan..." : modalType === "edit" ? "Simpan Perubahan" : "Tambahkan"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }` }} />
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = { navy: "bg-[#071E3D]/10 text-[#071E3D]", orange: "bg-[#CC6B27]/10 text-[#CC6B27]", green: "bg-green-50 text-green-600" };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p><p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p></div>
    </div>
  );
};
function Label({ children, required }) { return <label className="mb-2 block text-[11px] font-bold text-[#071E3D]">{children}{required && <span className="text-red-500 ml-1">*</span>}</label>; }
function ErrorMessage({ message }) { return message ? <p className="mt-1 text-xs font-semibold text-red-500">{message}</p> : null; }
function FilePreviewPanel({ title, required, modalType, fileName, fileObject, previewUrl, showFull, onToggleFull, onFileChange, buildFileUrl, isPreviewable, isImageFile, accept }) {
  const previewSource = fileObject ? previewUrl : fileName; const canPreview = previewSource ? isPreviewable(previewSource) : false;
  return (
    <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5"><h4 className="text-[14px] font-bold text-[#071E3D]">{title} {required && <span className="text-red-500">*</span>}</h4></div>
      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-4 text-center">
          {modalType !== "detail" && (<><p className="mb-3 text-[11px] font-bold text-[#071E3D]">Pilih File Baru</p><input type="file" onChange={onFileChange} accept={accept} className="mx-auto block w-full max-w-xs text-[11px] text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#CC6B27]/10 file:px-4 file:py-2 file:text-[11px] file:font-bold file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white" /></>)}
          {fileName && !fileObject && <div className="mt-3 rounded-lg border border-[#071E3D]/10 bg-white px-4 py-3 text-[12px] font-semibold text-[#182D4A]/80">Tersimpan: <a href={buildFileUrl(fileName)} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:underline">{fileName}</a></div>}
          {fileObject && <div className="mt-3 rounded-lg border border-[#CC6B27]/20 bg-orange-50 px-4 py-3 text-[12px] font-semibold text-[#071E3D]">File dipilih: <span className="text-[#CC6B27]">{fileObject.name}</span></div>}
        </div>
        <div className={`overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] ${showFull ? "min-h-[460px]" : "min-h-[250px]"}`}>
          <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-white px-4 py-3"><span className="text-[11px] font-bold uppercase tracking-wider text-[#071E3D]">Pratinjau</span>{canPreview && <button type="button" onClick={onToggleFull} className="text-[11px] font-bold text-[#CC6B27] hover:text-[#071E3D]">{showFull ? "Perkecil Pratinjau" : "Perbesar Pratinjau"}</button>}</div>
          <div className={`${showFull ? "h-[420px]" : "h-[210px]"} relative bg-[#FAFAFA]`}>
            {previewSource ? (canPreview ? (isImageFile(previewSource) ? <div className="absolute inset-0 flex items-center justify-center p-3"><img src={buildFileUrl(previewUrl || previewSource)} alt="Preview" className="max-h-full max-w-full object-contain" /></div> : <iframe src={`${buildFileUrl(previewUrl || previewSource)}#toolbar=0&navpanes=0`} className="absolute inset-0 h-full w-full border-0" title={`Preview ${title}`} />) : <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"><FileText size={32} className="mb-3 text-[#182D4A]/20" /><p className="text-[13px] font-bold text-[#071E3D]">Pratinjau tidak tersedia</p></div>) : <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"><FileText size={32} className="mb-3 text-[#182D4A]/20" /><p className="text-[12px] font-medium text-[#182D4A]/50">Tidak ada file yang dipilih.</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
export default DokumenMutu;