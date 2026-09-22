import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  FileText,
  Upload,
  BookOpen,
  Eye,
  ArrowRight,
  Filter,
  Sparkles,
  Layers,
  BadgeCheck,
  FileSearch,
  ClipboardList,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCcw
} from "lucide-react";

const Skema = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSkema, setSelectedSkema] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    kode_skema: "",
    judul_skema: "",
    judul_skema_en: "",
    jenis_skema: "kkni",
    level_kkni: "",
    bidang: "",
    jenjang_kualifikasi: "I",
    kode_sektor: "",
    kode_kbli: "",
    kode_kbji: "",
    nomor_revisi: "",
    status_dokumen: "terkendali",
    dokumen: "",
    status: "draft"
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skema");
      setData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      notifikasi.gagal("Error", "Gagal memuat data skema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.replace(/^(\/?uploads\/|\/)/, "");
    return `http://localhost:3000/uploads/${cleanPath}`;
  };

  const isPdfFile = (filename) => {
    const checkName = selectedFile ? selectedFile.name : filename;
    return checkName && /\.(pdf)$/i.test(checkName);
  };

  const isImageFile = (filename) => {
    const checkName = selectedFile ? selectedFile.name : filename;
    return checkName && /\.(jpg|jpeg|png|gif|webp)$/i.test(checkName);
  };

  const isPreviewable = (filename) => isPdfFile(filename) || isImageFile(filename);

  const validateInput = (name, value) => {
    let errorMsg = "";
    const minLengthFields = ["kode_skema", "judul_skema", "judul_skema_en"];

    if (name === "level_kkni") {
      if (value === null || value === "") errorMsg = "Tidak boleh kosong.";
    } else if (minLengthFields.includes(name) && typeof value === "string" && value.trim().length > 0 && value.trim().length <= 3) {
      errorMsg = "Terlalu pendek (minimal 4 karakter).";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateInput(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      notifikasi.peringatan("Format File", "Dokumen skema harus menggunakan format PDF.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDetail = (item) => {
    setSelectedSkema(item);
    setShowFullPreview(false);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_skema);
    setSelectedFile(null);
    setErrors({});
    setShowFullPreview(false);
    setFormData({
      kode_skema: item.kode_skema || "",
      judul_skema: item.judul_skema || "",
      judul_skema_en: item.judul_skema_en || "",
      jenis_skema: item.jenis_skema || "kkni",
      level_kkni: item.level_kkni || "",
      bidang: item.bidang || "",
      jenjang_kualifikasi: item.jenjang_kualifikasi || "I",
      kode_sektor: item.kode_sektor || "",
      kode_kbli: item.kode_kbli || "",
      kode_kbji: item.kode_kbji || "",
      nomor_revisi: item.nomor_revisi || "",
      status_dokumen: item.status_dokumen || "terkendali",
      dokumen: item.dokumen || "",
      status: item.status || "draft"
    });
    setPreviewUrl(item.dokumen || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await notifikasi.konfirmasi(
      "Hapus Skema?",
      "Data skema yang dihapus tidak dapat dikembalikan.",
      "Ya, Hapus!",
      "Batal",
      "warning",
      "danger"
    );

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      await api.delete(`/admin/skema/${id}`);
      await notifikasi.sukses("Terhapus", "Skema telah berhasil dihapus");
      await fetchData();
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) {
      notifikasi.peringatan("Validasi", "Silakan perbaiki isian yang masih kosong/kurang tepat!");
      return;
    }

    const dataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key !== "dokumen" && formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
        dataToSend.append(key, formData[key]);
      }
    });

    if (selectedFile) dataToSend.append("file_dokumen", selectedFile);

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/admin/skema/${currentId}`, dataToSend, config);
        await notifikasi.sukses("Berhasil", "Data skema berhasil diperbarui");
      } else {
        await api.post("/admin/skema", dataToSend, config);
        await notifikasi.sukses("Berhasil", "Skema baru berhasil ditambahkan");
      }

      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowFullPreview(false);
      await fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      notifikasi.gagal("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `w-full rounded-lg border px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-slate-300 ${
      errors[name]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
        : "border-[#071E3D]/20 bg-[#FAFAFA] focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
    }`;

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (item.judul_skema && item.judul_skema.toLowerCase().includes(search)) ||
      (item.kode_skema && item.kode_skema.toLowerCase().includes(search));
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const paginatedData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalAktif = data.filter((item) => item.status === "aktif").length;
  const totalDraft = data.filter((item) => item.status === "draft").length;
  const totalNonaktif = data.filter((item) => item.status === "nonaktif").length;

  const openAddModal = () => {
    setFormData({ ...initialFormState });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowFullPreview(false);
    setErrors({});
    setIsEditMode(false);
    setCurrentId(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                Manajemen Skema LSP
              </h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Atur kode, judul, status, persyaratan, biaya, dokumen, dan instrumen asesmen setiap skema.
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
                onClick={openAddModal}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
              >
                <Plus size={16} />
                Tambah Skema
              </button>
            </div>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard icon={<BookOpen size={22} />} label="Total Skema" value={`${data.length} Data`} tone="navy" />
          <StatCard icon={<BadgeCheck size={22} />} label="Skema Aktif" value={`${totalAktif} Aktif`} tone="green" />
          <StatCard icon={<FileText size={22} />} label="Draft Skema" value={`${totalDraft} Draft`} tone="orange" />
          <StatCard icon={<Layers size={22} />} label="Nonaktif" value={`${totalNonaktif} Nonaktif`} tone="red" />
        </div>

        {/* MERGED CARD: FILTER & TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
          
          {/* Section: Table Header */}
          <div className="flex flex-col gap-4 border-b border-[#071E3D]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <ClipboardList size={18} className="text-[#CC6B27]" />
              Daftar Skema Sertifikasi
            </h4>
          </div>

          {/* Section: Filters */}
          <div className="grid grid-cols-1 gap-4 p-6 bg-[#FAFAFA]/50 border-b border-[#071E3D]/5 lg:grid-cols-[1fr_250px]">
            <div className="relative w-full group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari kode atau judul skema..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full rounded-lg border border-[#071E3D]/20 bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
              />
            </div>

            <div className="relative w-full group">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full rounded-lg border border-[#071E3D]/20 bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Section: Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <TableHead center>No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Judul Skema</TableHead>
                  <TableHead center>Status</TableHead>
                  <TableHead center>Kelola Persyaratan</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat Data Skema...</p>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <BookOpen size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Belum ada data skema ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={item.id_skema} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3.5 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[13px] font-bold text-[#CC6B27]">{item.kode_skema}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="max-w-[420px] text-[13.5px] font-bold text-[#071E3D]">{item.judul_skema}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                          {item.jenis_skema?.toUpperCase()} {item.level_kkni ? `• LEVEL ${item.level_kkni}` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan`)}
                            className="w-[145px] rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3 py-1.5 text-[11px] font-bold text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                          >
                            Persyaratan Dasar
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan-tuk`)}
                            className="w-[145px] rounded-lg border border-[#CC6B27]/30 bg-[#CC6B27]/10 px-3 py-1.5 text-[11px] font-bold text-[#CC6B27] transition-all hover:bg-[#CC6B27] hover:text-white"
                          >
                            Persyaratan TUK
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* BUTTON ATUR BIAYA UJI */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/biaya-uji`)}
                            className="rounded-lg bg-emerald-50/80 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                            title="Atur Biaya Uji"
                          >
                            <DollarSign size={16} />
                          </button>

                          {/* BUTTON DETAIL */}
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                            title="Detail Skema"
                          >
                            <Eye size={16} />
                          </button>

                          {/* BUTTON EDIT */}
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* BUTTON HAPUS */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_skema)}
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

          {/* Section: Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#071E3D]/10 px-6 py-5 text-[13px] font-medium text-[#182D4A] sm:flex-row">
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
      </div>

      {/* MODAL FORM CREATE/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  {isEditMode ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                    {isEditMode ? "Edit Data Skema" : "Tambah Skema Baru"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
              <form id="skemaForm" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <FormSection title="Informasi Skema">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label required>Kode Skema</Label>
                        <input
                          type="text"
                          name="kode_skema"
                          value={formData.kode_skema}
                          onChange={handleInputChange}
                          required
                          className={`${inputClass("kode_skema")} font-mono`}
                        />
                        {errors.kode_skema && <ErrorText>{errors.kode_skema}</ErrorText>}
                      </div>

                      <div>
                        <Label>Status Skema</Label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass("status")}>
                          <option value="draft">Draft</option>
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Non-Aktif</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label required>Judul Skema (Indonesia)</Label>
                      <input type="text" name="judul_skema" value={formData.judul_skema} onChange={handleInputChange} required className={inputClass("judul_skema")} />
                      {errors.judul_skema && <ErrorText>{errors.judul_skema}</ErrorText>}
                    </div>

                    <div>
                      <Label>Judul Skema (Inggris)</Label>
                      <input type="text" name="judul_skema_en" value={formData.judul_skema_en} onChange={handleInputChange} className={inputClass("judul_skema_en")} />
                      {errors.judul_skema_en && <ErrorText>{errors.judul_skema_en}</ErrorText>}
                    </div>
                  </FormSection>

                  <FormSection title="Atribut & Kode Klasifikasi">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label>Jenis Skema</Label>
                        <select name="jenis_skema" value={formData.jenis_skema} onChange={handleInputChange} className={inputClass("jenis_skema")}>
                          <option value="kkni">KKNI</option>
                          <option value="okupasi">Okupasi</option>
                          <option value="klaster">Klaster</option>
                        </select>
                      </div>

                      <div>
                        <Label required>Level KKNI</Label>
                        <select name="level_kkni" value={formData.level_kkni} onChange={handleInputChange} className={inputClass("level_kkni")} required>
                          <option value="">-- Pilih Level --</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <option key={num} value={num}>Level {num}</option>
                          ))}
                        </select>
                        {errors.level_kkni && <ErrorText>{errors.level_kkni}</ErrorText>}
                      </div>
                    </div>

                    <div>
                      <Label>Jenjang Kualifikasi</Label>
                      <select name="jenjang_kualifikasi" value={formData.jenjang_kualifikasi} onChange={handleInputChange} className={inputClass("jenjang_kualifikasi")}>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                        <option value="VI">VI</option>
                        <option value="VII">VII</option>
                        <option value="VIII">VIII</option>
                        <option value="IX">IX</option>
                      </select>
                    </div>

                    <div>
                      <Label>Bidang</Label>
                      <input type="text" name="bidang" value={formData.bidang} onChange={handleInputChange} className={inputClass("bidang")} />
                      {errors.bidang && <ErrorText>{errors.bidang}</ErrorText>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <Label>Kode Sektor</Label>
                        <input type="text" name="kode_sektor" value={formData.kode_sektor} onChange={handleInputChange} className={`${inputClass("kode_sektor")} font-mono`} />
                        {errors.kode_sektor && <ErrorText>{errors.kode_sektor}</ErrorText>}
                      </div>

                      <div>
                        <Label>Kode KBLI</Label>
                        <input type="text" name="kode_kbli" value={formData.kode_kbli} onChange={handleInputChange} className={`${inputClass("kode_kbli")} font-mono`} />
                        {errors.kode_kbli && <ErrorText>{errors.kode_kbli}</ErrorText>}
                      </div>

                      <div>
                        <Label>Kode KBJI</Label>
                        <input type="text" name="kode_kbji" value={formData.kode_kbji} onChange={handleInputChange} className={`${inputClass("kode_kbji")} font-mono`} />
                        {errors.kode_kbji && <ErrorText>{errors.kode_kbji}</ErrorText>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label>Nomor Revisi</Label>
                        <input type="text" name="nomor_revisi" value={formData.nomor_revisi} onChange={handleInputChange} className={inputClass("nomor_revisi")} />
                      </div>

                      <div>
                        <Label>Status Dokumen</Label>
                        <select name="status_dokumen" value={formData.status_dokumen} onChange={handleInputChange} className={inputClass("status_dokumen")}>
                          <option value="terkendali">Terkendali</option>
                          <option value="tidak_terkendali">Tidak Terkendali</option>
                        </select>
                      </div>
                    </div>
                  </FormSection>
                </div>

                <div className="flex flex-col gap-6">
                  <FormSection title="Dokumen Skema">
                    <div className="rounded-xl border border-dashed border-[#CC6B27]/40 bg-[#FAFAFA] p-5 text-center">
                      <Label>
                        <span className="inline-flex items-center gap-2">
                          <Upload size={16} className="text-[#CC6B27]" />
                          Unggah Dokumen (PDF)
                        </span>
                      </Label>

                      <input
                        type="file"
                        name="file_dokumen"
                        onChange={handleFileChange}
                        accept=".pdf,application/pdf"
                        className="mx-auto mt-2 block w-full max-w-xs cursor-pointer rounded-lg border border-[#071E3D]/10 bg-white p-2 text-xs font-semibold text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#CC6B27]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white transition-all"
                      />

                      {isEditMode && formData.dokumen && !selectedFile && (
                        <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-lg border border-[#071E3D]/10 bg-white px-3 py-2 text-xs font-bold text-[#CC6B27]">
                          <FileText size={14} />
                          <span>
                            Tersimpan: <a href={buildFileUrl(formData.dokumen)} target="_blank" rel="noreferrer" className="hover:underline">
                              {formData.dokumen.split("/").pop()}
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </FormSection>

                  <div className="flex min-h-[430px] flex-1 flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white">
                    <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E3D]">Pratinjau Dokumen</span>
                      {previewUrl && isPreviewable(previewUrl) && (
                        <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-[11px] font-bold text-[#CC6B27] hover:text-[#071E3D]">
                          {showFullPreview ? "Perkecil Pratinjau" : "Perbesar Pratinjau"}
                        </button>
                      )}
                    </div>

                    <div className={`relative flex-1 bg-[#FAFAFA] transition-all duration-300 ${showFullPreview ? "h-[540px]" : "h-full"}`}>
                      {previewUrl ? (
                        isPreviewable(previewUrl) ? (
                          isImageFile(previewUrl) ? (
                            <div className="absolute inset-0 flex items-start justify-center overflow-auto p-3">
                              <img src={buildFileUrl(previewUrl)} alt="Preview" className="max-h-full max-w-full object-contain" />
                            </div>
                          ) : (
                            <iframe src={`${buildFileUrl(previewUrl)}#toolbar=0&navpanes=0`} className="absolute inset-0 h-full w-full border-0" title="Preview PDF" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#182D4A]/50">
                            <FileText size={42} className="mb-2 opacity-50" />
                            <p className="mb-1 text-[13px] font-bold text-[#071E3D]">Pratinjau tidak tersedia</p>
                            <p className="text-[12px] font-medium">Format file ini tidak dapat dipratinjau.</p>
                          </div>
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#182D4A]/50">
                          <FileSearch size={46} className="mb-3 opacity-30" />
                          <p className="text-[12px] font-bold">Pilih file skema (PDF) untuk melihat pratinjau.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <button type="button" className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" onClick={() => setShowModal(false)}>
                Batal
              </button>

              <button type="submit" form="skemaForm" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEditMode ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedSkema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <BookOpen size={21} className="text-[#CC6B27]" />
                  Detail Skema Kompetensi
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">Informasi lengkap skema, dokumen, serta pintasan instrumen asesmen.</p>
              </div>

              <button type="button" onClick={closeDetailModal} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                
                <InfoPanel title="Informasi Utama">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Kode Skema">
                      <span className="font-mono text-[#CC6B27]">{selectedSkema.kode_skema}</span>
                    </DetailItem>

                    <DetailItem label="Status">
                      <StatusBadge status={selectedSkema.status} />
                    </DetailItem>

                    <DetailItem label="Judul Skema" wide>
                      <span>{selectedSkema.judul_skema}</span>
                      {selectedSkema.judul_skema_en && <p className="mt-1 text-[13px] font-semibold italic text-[#182D4A]/60">{selectedSkema.judul_skema_en}</p>}
                    </DetailItem>
                  </div>
                </InfoPanel>

                <InfoPanel title="Atribut Skema">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem label="Jenis Skema">{selectedSkema.jenis_skema}</DetailItem>
                    <DetailItem label="Level KKNI">{selectedSkema.level_kkni || "-"}</DetailItem>
                    <DetailItem label="Bidang">{selectedSkema.bidang || "-"}</DetailItem>
                    <DetailItem label="Kode Sektor">{selectedSkema.kode_sektor || "-"}</DetailItem>
                    <DetailItem label="Kode KBLI">{selectedSkema.kode_kbli || "-"}</DetailItem>
                    <DetailItem label="Kode KBJI">{selectedSkema.kode_kbji || "-"}</DetailItem>
                    <DetailItem label="Jenjang Kualifikasi">{selectedSkema.jenjang_kualifikasi || "-"}</DetailItem>
                    <DetailItem label="Nomor Revisi">{selectedSkema.nomor_revisi || "-"}</DetailItem>
                    <DetailItem label="Status Dokumen">{selectedSkema.status_dokumen || "-"}</DetailItem>
                  </div>
                </InfoPanel>

                <InfoPanel title="Navigasi Instrumen & Asesmen">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <NavigationCard title="FR.IA.01" subtitle="Observasi" onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia01`)} tone="blue" />
                    <NavigationCard title="FR.IA.03" subtitle="Pertanyaan" onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia03`)} tone="indigo" />
                    <NavigationCard title="FR.MAPA" subtitle="Manajemen" onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/mapa`)} tone="orange" />
                    <NavigationCard title="Kelompok" subtitle="Pekerjaan" onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/kelompok-pekerjaan`)} tone="navy" />
                  </div>
                </InfoPanel>

                {selectedSkema.dokumen && (
                  <InfoPanel title="Preview Dokumen Skema">
                    <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
                      <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-white px-4 py-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E3D]">File Dokumen</span>
                        {isPreviewable(selectedSkema.dokumen) && (
                          <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-[11px] font-bold text-[#CC6B27] hover:underline">
                            {showFullPreview ? "Perkecil Pratinjau" : "Perbesar Pratinjau"}
                          </button>
                        )}
                      </div>

                      <div className={`relative flex-1 bg-[#FAFAFA] transition-all duration-300 ${showFullPreview ? "h-[620px]" : "h-[380px]"}`}>
                        {isPreviewable(selectedSkema.dokumen) ? (
                          isImageFile(selectedSkema.dokumen) ? (
                            <div className="absolute inset-0 flex items-start justify-center overflow-auto p-3">
                              <img src={buildFileUrl(selectedSkema.dokumen)} alt="Preview" className="max-w-full object-contain" />
                            </div>
                          ) : (
                            <iframe src={`${buildFileUrl(selectedSkema.dokumen)}#toolbar=0&navpanes=0`} className="absolute inset-0 h-full w-full border-0" title="Preview PDF" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-[#182D4A]/50">
                            <FileText size={32} className="mb-2 opacity-50" />
                            <p className="mb-1 text-[13px] font-bold text-[#071E3D]">Preview tidak tersedia</p>
                            <p className="text-[12px] font-medium">Format file ini tidak dapat dipratinjau.</p>
                            <a href={buildFileUrl(selectedSkema.dokumen)} target="_blank" rel="noreferrer" className="mt-4 rounded-lg bg-[#CC6B27]/10 px-4 py-2 text-[12px] font-bold text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white transition-all">Unduh File</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </InfoPanel>
                )}

              </div>
            </div>

            <div className="flex justify-end border-t border-[#071E3D]/10 bg-[#FAFAFA] p-6">
              <button type="button" onClick={closeDetailModal} className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-6 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]">
                Tutup Detail
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

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value, tone = "orange" }) {
  const tones = {
    navy: "bg-[#071E3D]/10 text-[#071E3D]",
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const style = status === "aktif" ? "bg-green-50 text-green-700 border-green-200" : status === "nonaktif" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-[#182D4A]/70 border-[#071E3D]/10";

  return <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>{status || "draft"}</span>;
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <h4 className="mb-4 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
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

function ErrorText({ children }) {
  return <span className="mt-1 block text-xs font-semibold text-red-500">{children}</span>;
}

function InfoPanel({ title, children }) {
  return (
    <section className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <h4 className="mb-4 border-b border-[#071E3D]/10 pb-3 text-[14px] font-bold text-[#071E3D]">{title}</h4>
      {children}
    </section>
  );
}

function DetailItem({ label, children, wide }) {
  return (
    <div className={`rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4 ${wide ? "md:col-span-2" : ""}`}>
      <p className="mb-1.5 text-[11px] font-bold text-[#071E3D]">{label}</p>
      <div className="text-[13.5px] font-medium text-[#182D4A]/80">{children}</div>
    </div>
  );
}

function NavigationCard({ title, subtitle, onClick, tone = "navy" }) {
  const tones = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
    orange: "bg-[#CC6B27]/10 border-[#CC6B27]/20 text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white hover:border-[#CC6B27]",
    navy: "bg-slate-50 border-[#071E3D]/10 text-[#071E3D] hover:bg-[#071E3D] hover:text-white hover:border-[#071E3D]"
  };

  return (
    <button type="button" onClick={onClick} className={`group flex flex-col items-center justify-center rounded-xl border p-4 text-center shadow-sm transition-all ${tones[tone]}`}>
      <span className="mb-1 text-[13px] font-black">{title}</span>
      <span className="mb-3 text-[11px] font-bold opacity-75">{subtitle}</span>
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export default Skema;