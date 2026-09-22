import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search, Plus, Eye, Edit2, Trash2, X, Save, FileText, Loader2,
  Filter, Sparkles, ClipboardList, Layers, BookOpen, Upload, FileSearch,
  RefreshCcw, ChevronLeft, ChevronRight,
} from "lucide-react";

const Skkni = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  
  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    jenis_standar: "SKKNI",
    no_skkni: "",
    judul_skkni: "",
    legalitas: "",
    sektor: "",
    sub_sektor: "",
    penerbit: "",
  });
  const [dokumenFile, setDokumenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = dataList.filter((item) => {
      const no = item.no_skkni?.toLowerCase() || "";
      const judul = item.judul_skkni?.toLowerCase() || "";
      const matchSearch = no.includes(lowerTerm) || judul.includes(lowerTerm);
      const matchJenis = filterJenis ? item.jenis_standar === filterJenis : true;
      return matchSearch && matchJenis;
    });
    setFilteredData(filtered);
  }, [searchTerm, filterJenis, dataList]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skkni");
      const result = response.data?.data || [];
      setDataList(result);
      setFilteredData(result);
    } catch (error) {
      console.error(error);
      notifikasi.gagal("Error", "Gagal memuat data SKKNI");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
        notifikasi.peringatan("Format file harus PDF.");
        e.target.value = "";
        setDokumenFile(null);
        setPreviewUrl(null);
        return;
      }
      setDokumenFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setDokumenFile(null);
      setPreviewUrl(null);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditId(null);
    setDokumenFile(null);
    setPreviewUrl(null);
    setSelectedItem(null);
    setFormData({
      jenis_standar: "SKKNI",
      no_skkni: "",
      judul_skkni: "",
      legalitas: "",
      sektor: "",
      sub_sektor: "",
      penerbit: "",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setPreviewUrl(null);
    setDokumenFile(null);
    setIsEditing(false);
    setEditId(null);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id_skkni);
    setSelectedItem(item);
    setDokumenFile(null);
    setPreviewUrl(null);
    setFormData({
      jenis_standar: item.jenis_standar || "SKKNI",
      no_skkni: item.no_skkni || "",
      judul_skkni: item.judul_skkni || "",
      legalitas: item.legalitas || "",
      sektor: item.sektor || "",
      sub_sektor: item.sub_sektor || "",
      penerbit: item.penerbit || "",
    });
    setShowModal(true);
  };

  const validateForm = () => {
    const fieldsToCheck = [
      { key: "no_skkni", name: "Nomor SKKNI" },
      { key: "judul_skkni", name: "Judul SKKNI" },
      { key: "legalitas", name: "Legalitas" },
      { key: "sektor", name: "Sektor" },
      { key: "sub_sektor", name: "Sub Sektor" },
      { key: "penerbit", name: "Penerbit" },
    ];
    for (const field of fieldsToCheck) {
      const value = String(formData[field.key] || "").trim();
      if (value.length > 0 && value.length < 4) {
        return `Inputan pada kolom "${field.name}" terlalu pendek ("${value}"). Minimal harus 4 karakter!`;
      }
    }
    if (!String(formData.no_skkni || "").trim()) return "Nomor SKKNI wajib diisi.";
    if (!String(formData.judul_skkni || "").trim()) return "Judul SKKNI wajib diisi.";
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      notifikasi.peringatan("Validasi Gagal", errorMsg);
      return;
    }
    setLoading(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, formData[key] ?? "");
      });
      if (dokumenFile) dataToSend.append("file_dokumen", dokumenFile);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      if (isEditing) {
        await api.put(`/admin/skkni/${editId}`, dataToSend, config);
        closeModal();
        await notifikasi.sukses("Berhasil", "Data Standar diperbarui");
      } else {
        await api.post("/admin/skkni", dataToSend, config);
        closeModal();
        await notifikasi.sukses("Berhasil", "Data Standar ditambahkan");
      }
      await fetchData();
    } catch (error) {
      console.error(error);
      notifikasi.gagal(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await notifikasi.konfirmasi(
      "Hapus Data?",
      "Yakin ingin menghapus data Standar ini? Data yang terkait mungkin akan terpengaruh!",
      "Ya, Hapus Data!",
      "Batal",
      "warning",
      "danger"
    );
    if (!confirmResult?.isConfirmed) return;
    setLoading(true);
    try {
      await api.delete(`/admin/skkni/${id}`);
      await notifikasi.sukses("Terhapus!", "Data berhasil dihapus.");
      await fetchData();
    } catch (error) {
      console.error(error);
      notifikasi.gagal("Error", error.response?.data?.message || "Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  };

  const totalSkkni = dataList.filter((item) => item.jenis_standar === "SKKNI").length;
  const totalSkk = dataList.filter((item) => item.jenis_standar === "SKK").length;
  const totalSi = dataList.filter((item) => item.jenis_standar === "SI").length;
  
  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const paginatedData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const getBadgeColor = (jenis) => {
    switch (jenis) {
      case "SKKNI":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "SKK":
        return "bg-green-50 text-green-600 border-green-200";
      case "SI":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
              Manajemen SKKNI
            </h2>
            <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
              Kelola master data SKKNI, Standar Khusus (SKK), Standar Internasional (SI), dan dokumen pendukungnya.
            </p>
          </div>
          
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              Refresh
            </button>
            <button
              type="button"
              onClick={openModal}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
            >
              <Plus size={16} />
              Tambah Standar
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<BookOpen size={22} />} label="Total Standar" value={`${dataList.length} Data`} tone="navy" />
        <StatCard icon={<FileText size={22} />} label="SKKNI" value={`${totalSkkni} Standar`} tone="orange" />
        <StatCard icon={<Layers size={22} />} label="SKK" value={`${totalSkk} Khusus`} tone="green" />
        <StatCard icon={<ClipboardList size={22} />} label="SI" value={`${totalSi} Internasional`} tone="blue" />
      </div>

      {/* CARD TABEL */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
        
        {/* Header Tabel */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <FileText size={18} className="text-[#CC6B27]" />
            Daftar Standar Kompetensi
          </h4>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_250px] mb-2">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
            <input
              type="text"
              placeholder="Cari Nomor atau Judul Standar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
            />
          </div>
          <div className="relative w-full group">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none"
            >
              <option value="">Semua Jenis</option>
              <option value="SKKNI">SKKNI (Standar Nasional)</option>
              <option value="SKK">SKK (Standar Khusus)</option>
              <option value="SI">SI (Standar Internasional)</option>
            </select>
          </div>
        </div>

        {/* Tabel Terbungkus Border Rounded */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10 custom-scrollbar">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
            <thead>
              <tr>
                <TableHead center>No</TableHead>
                <TableHead>Nomor SKKNI</TableHead>
                <TableHead>Judul SKKNI</TableHead>
                <TableHead center>Jenis</TableHead>
                <TableHead center>Dokumen</TableHead>
                <TableHead center>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                    <p className="text-[14px] font-medium text-[#182D4A]">Memuat Data Standar...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id_skkni} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                    <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-bold text-[#CC6B27]">
                        {item.no_skkni}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[380px] text-[13.5px] font-bold text-[#071E3D]">
                        {item.judul_skkni}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(item.jenis_standar)}`}>
                        {item.jenis_standar}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.dokumen ? (
                        <a
                          href={`http://localhost:3000/uploads/${item.dokumen}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#071E3D]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#071E3D] transition-all hover:bg-[#CC6B27] hover:text-white"
                        >
                          <FileText size={14} />
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-[11px] font-bold italic text-slate-300">Tidak Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                          title="Detail"
                          onClick={() => openDetailModal(item)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                          title="Hapus"
                          onClick={() => handleDelete(item.id_skkni)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                    <p className="text-[14px] font-medium text-[#182D4A]">Data SKKNI tidak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-4 text-[13px] font-medium text-[#182D4A] sm:flex-row">
            <span>
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
            </span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                {pagination.page} / {totalPages}
              </span>
              <button
                className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM (CREATE/EDIT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                    {isEditing ? "Edit Data Standar" : "Tambah Standar Baru"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <form id="skkniForm" onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                      <h4 className="text-[14px] font-bold text-[#071E3D]">Informasi Standar</h4>
                    </div>
                    
                    <div className="space-y-4 p-5">
                      <div>
                        <Label required>Judul Standar</Label>
                        <input
                          required
                          type="text"
                          name="judul_skkni"
                          value={formData.judul_skkni}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Masukkan Judul Standar"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label required>Nomor Standar</Label>
                          <input
                            required
                            type="text"
                            name="no_skkni"
                            value={formData.no_skkni}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Contoh: KEP/123/2023"
                          />
                        </div>
                        <div>
                          <Label required>Jenis Standar</Label>
                          <select
                            name="jenis_standar"
                            value={formData.jenis_standar}
                            onChange={handleInputChange}
                            className={inputClass}
                          >
                            <option value="SKKNI">SKKNI</option>
                            <option value="SKK">Standar Khusus (SKK)</option>
                            <option value="SI">Standar Internasional (SI)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Sektor</Label>
                          <input
                            type="text"
                            name="sektor"
                            value={formData.sektor}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Opsional"
                          />
                        </div>
                        <div>
                          <Label>Sub Sektor</Label>
                          <input
                            type="text"
                            name="sub_sektor"
                            value={formData.sub_sektor}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Opsional"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Tahun Terbit / Legalitas</Label>
                          <input
                            type="text"
                            name="legalitas"
                            value={formData.legalitas}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Contoh: 2026"
                          />
                        </div>
                        <div>
                          <Label>Lembaga Penerbit</Label>
                          <input
                            type="text"
                            name="penerbit"
                            value={formData.penerbit}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Opsional"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                      <h4 className="text-[14px] font-bold text-[#071E3D]">Dokumen Pendukung</h4>
                    </div>
                    <div className="p-5">
                      <div className="rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-4 text-center">
                        <Label>
                          <span className="inline-flex items-center gap-2">
                            <Upload size={16} className="text-[#CC6B27]" />
                            Upload Dokumen (PDF)
                          </span>
                        </Label>
                        <input
                          type="file"
                          name="file_dokumen"
                          accept="application/pdf,.pdf"
                          onChange={handleFileChange}
                          className="mx-auto mt-2 block w-full max-w-xs cursor-pointer rounded-lg border border-slate-100 bg-white p-2 text-xs font-semibold text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#CC6B27]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white transition-all"
                        />
                        <p className="mt-2 text-[10px] font-medium text-slate-400">
                          Format yang diperbolehkan: PDF.
                        </p>
                        {isEditing && !dokumenFile && selectedItem?.dokumen && (
                          <div className="mt-3 rounded-lg border border-[#071E3D]/10 bg-white px-4 py-3 text-[12px] font-semibold text-[#182D4A]/80">
                            Tersimpan: <span className="font-bold text-[#CC6B27]">{selectedItem.dokumen}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
                        <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-white px-4 py-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E3D]">Pratinjau PDF</span>
                        </div>
                        <div className="relative flex-1 bg-[#FAFAFA]">
                          {previewUrl ? (
                            <div className="absolute inset-0">
                              <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="h-full w-full border-0" title="Preview Baru" />
                            </div>
                          ) : isEditing && selectedItem?.dokumen ? (
                            <div className="absolute inset-0">
                              <iframe src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0&navpanes=0&scrollbar=0`} className="h-full w-full border-0" title="Preview Current" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#182D4A]/50">
                              <FileSearch size={32} className="mb-3 opacity-50" />
                              <p className="text-[12px] font-medium">Pilih file PDF untuk melihat pratinjau.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
              >
                Batal
              </button>
              <button
                type="submit"
                form="skkniForm"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditing ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DETAIL */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Data Standar</h3>
                </div>
              </div>
              <button type="button" onClick={closeDetailModal} className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                <section className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">Informasi Standar</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Judul Standar" value={selectedItem.judul_skkni} />
                    <DetailItem label="Nomor Standar">
                      <span className="inline-flex rounded-lg bg-[#CC6B27]/10 px-3 py-1.5 font-mono text-[13px] font-bold text-[#CC6B27]">{selectedItem.no_skkni}</span>
                    </DetailItem>
                    <DetailItem label="Jenis Standar" value={selectedItem.jenis_standar} />
                    <DetailItem label="Legalitas" value={selectedItem.legalitas || "-"} />
                    <DetailItem label="Sektor / Sub Sektor" value={`${selectedItem.sektor || "-"} / ${selectedItem.sub_sektor || "-"}`} />
                    <DetailItem label="Penerbit" value={selectedItem.penerbit || "-"} />
                  </div>
                </section>
                <section className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 flex items-center gap-2 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">
                    <Eye className="text-[#CC6B27]" size={16} />
                    Pratinjau Dokumen
                  </h4>
                  {selectedItem.dokumen ? (
                    <div className="group relative mt-2 h-[500px] overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
                      <iframe src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0`} className="h-full w-full border-0" title="Detail PDF" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-[12px] font-bold text-[#071E3D] shadow-xl transition-transform hover:scale-105">
                          <Eye size={16} />
                          Buka Dokumen Penuh
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-8 text-center">
                      <p className="text-[13px] font-medium text-[#182D4A]/50">Tidak ada dokumen yang dilampirkan.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
            <div className="flex justify-end border-t border-[#071E3D]/10 bg-[#FAFAFA] p-6">
              <button type="button" onClick={closeDetailModal} className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-6 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SCROLLBAR CUSTOM */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      ` }} />
    </div>
  );
};

// --- SUB COMPONENTS ---
const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    navy: "bg-[#071E3D]/10 text-[#071E3D]",
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p>
      </div>
    </div>
  );
};

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function DetailItem({ label, value, children }) {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <p className="mb-1.5 text-[11px] font-bold text-[#071E3D]">{label}</p>
      <div className="text-[13.5px] font-medium text-[#182D4A]/80">{children || value}</div>
    </div>
  );
}

export default Skkni;