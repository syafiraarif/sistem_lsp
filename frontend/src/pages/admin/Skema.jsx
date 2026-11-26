// frontend/src/pages/admin/Skema.jsx
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
  BookOpen,
  Eye,
  Filter,
  Layers,
  BadgeCheck,
  ClipboardList,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ALLOWED_FILE_TYPES = ["application/pdf"];
const ALLOWED_FILE_EXTENSIONS = ["pdf"];
const FILE_ACCEPT = ".pdf,application/pdf";

const Skema = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Unified Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "create" | "edit" | "detail"
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    kode_skema: "",
    judul_skema: "",
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
    status: "draft",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skema");
      const resBody = response.data !== undefined ? response.data : response;
      let listData = [];
      if (Array.isArray(resBody.data)) listData = resBody.data;
      else if (resBody.data?.data && Array.isArray(resBody.data.data)) listData = resBody.data.data;
      else if (Array.isArray(resBody)) listData = resBody;
      setData(listData);
    } catch (error) {
      console.error("Error fetching data:", error);
      notifikasi.gagal("Error", error.response?.data?.message || "Gagal memuat data skema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildFileUrl = (path) => {
    if (!path) return null;
    const strPath = String(path);
    if (strPath.startsWith("blob:") || strPath.startsWith("http")) return strPath;

    const baseUrl = (
      api.defaults.baseURL ||
      import.meta.env.VITE_API_BASE ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:3000/api"
    ).replace(/\/api\/?$/, "");

    const cleanPath = strPath.replace(/^(\/?uploads\/|\/)/, "");
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const getFileName = (filename) => (selectedFile ? selectedFile.name : filename || "");
  const getFileExtension = (filename) => {
    const cleanName = String(filename || "").split("?")[0];
    const parts = cleanName.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };
  const isPdfFile = (filename) => getFileExtension(getFileName(filename)) === "pdf";
  const isImageFile = (filename) =>
    ["jpg", "jpeg", "png", "gif", "webp"].includes(getFileExtension(getFileName(filename)));
  const isPreviewable = (filename) => isPdfFile(filename) || isImageFile(filename);

  const validateDocumentFile = (file) => {
    if (!file) return null;
    const extension = getFileExtension(file.name);
    const validExtension = ALLOWED_FILE_EXTENSIONS.includes(extension);
    const validMimeType = ALLOWED_FILE_TYPES.includes(file.type) || extension === "pdf";
    if (!validExtension || !validMimeType) return "Dokumen skema hanya boleh menggunakan format PDF.";
    return null;
  };

  const validateInput = (name, value) => {
    let errorMsg = "";
    const minLengthFields = ["kode_skema", "judul_skema"];

    if (name === "level_kkni") {
      if (value === null || value === "") errorMsg = "Level KKNI wajib dipilih.";
    } else if (
      minLengthFields.includes(name) &&
      typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length <= 3
    ) {
      errorMsg = "Minimal 4 karakter.";
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
      setPreviewUrl(selectedItem?.dokumen || null);
      setShowFullPreview(false);
      return;
    }

    const errorMessage = validateDocumentFile(file);
    if (errorMessage) {
      e.target.value = "";
      setSelectedFile(null);
      notifikasi.peringatan("Format File Tidak Valid", errorMessage);
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setShowFullPreview(false);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    setErrors({});
    setShowFullPreview(false);

    if (type === "create") {
      setFormData(initialFormState);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (item) {
      setFormData({
        kode_skema: item.kode_skema || "",
        judul_skema: item.judul_skema || "",
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
        status: item.status || "draft",
      });
      setSelectedFile(null);
      setPreviewUrl(item.dokumen || null);
    }
  };

  const handleDelete = async (id) => {
    const result = await notifikasi.konfirmasi(
      "Hapus Skema?",
      "Data skema yang dihapus tidak dapat dikembalikan!",
      "Ya, Hapus!",
      "Batal",
      "warning",
      "danger"
    );

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin/skema/${id}`);
      await notifikasi.sukses("Terhapus!", "Skema berhasil dihapus.");
      await fetchData();
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Gagal menghapus data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) {
      return notifikasi.peringatan("Peringatan", "Perbaiki kolom isian yang masih kosong atau terlalu pendek!");
    }

    if (!formData.kode_skema || !formData.judul_skema) {
      return notifikasi.peringatan("Peringatan", "Kode dan Judul Skema wajib diisi!");
    }

    const docError = validateDocumentFile(selectedFile);
    if (docError) {
      return notifikasi.peringatan("Format File Tidak Valid", docError);
    }

    if (modalType === "edit") {
      const confirm = await notifikasi.konfirmasi(
        "Konfirmasi",
        "Yakin menyimpan perubahan pada skema ini?",
        "Ya, Simpan",
        "Batal"
      );
      if (!confirm.isConfirmed) return;
    }

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (
        key !== "dokumen" &&
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        dataToSend.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      dataToSend.append("file_dokumen", selectedFile);
    }

    try {
      setLoading(true);
      if (modalType === "create") {
        await api.post("/admin/skema", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setShowModal(false);
        await notifikasi.sukses("Berhasil", "Skema baru berhasil ditambahkan.");
      } else {
        await api.put(`/admin/skema/${selectedItem.id_skema}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setShowModal(false);
        await notifikasi.sukses("Berhasil", "Data skema berhasil diperbarui.");
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowFullPreview(false);
      await fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      notifikasi.gagal("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `w-full rounded-lg border p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 placeholder:text-slate-300 ${
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<BookOpen size={22} />} label="Total Skema" value={`${data.length} Data`} tone="navy" />
        <StatCard icon={<BadgeCheck size={22} />} label="Skema Aktif" value={`${totalAktif} Aktif`} tone="green" />
        <StatCard icon={<FileText size={22} />} label="Draft Skema" value={`${totalDraft} Draft`} tone="orange" />
        <StatCard icon={<Layers size={22} />} label="Nonaktif" value={`${totalNonaktif} Nonaktif`} tone="red" />
      </div>

      {/* CARD TABEL */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
        {/* Header Tabel */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <ClipboardList size={18} className="text-[#CC6B27]" />
            Daftar Skema Sertifikasi
          </h4>
          <button
            type="button"
            onClick={() => openModal("create")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
          >
            <Plus size={16} />
            Tambah Skema
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_250px] mb-2">
          <div className="relative w-full group">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
            />
            <input
              type="text"
              placeholder="Cari kode atau judul skema..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
            />
          </div>
          <div className="relative w-full group">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
            />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Tabel Terbungkus Border Rounded (Scrollbar abu-abu tua bawaan browser sama seperti Pengaduan) */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full min-w-[1250px] border-collapse bg-white text-left">
            <thead>
              <tr>
                <TableHead center>No</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Judul Skema</TableHead>
                <TableHead center>Status</TableHead>
                <TableHead center>Kelola Persyaratan & Instrumen</TableHead>
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
                      <div className="max-w-[320px] text-[13.5px] font-bold text-[#071E3D]">{item.judul_skema}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                        {item.jenis_skema?.toUpperCase()} {item.level_kkni ? `• LEVEL ${item.level_kkni}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {/* Persyaratan */}
                        <div className="flex gap-2 w-full justify-center">
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

                        {/* Instrumen Uji FR.IA */}
                        <div className="flex gap-2 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/fr-ia-02`)}
                            className="w-[145px] rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white"
                          >
                            Praktik (FR.IA.02)
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/fr-ia-03`)}
                            className="w-[145px] rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 transition-all hover:bg-purple-600 hover:text-white"
                          >
                            Observasi (FR.IA.03)
                          </button>
                        </div>

                        <div className="flex gap-2 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/bank-soal`)}
                            className="w-[298px] flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 transition-all hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
                          >
                            Bank Soal Ujian Tulis (FR.IA.05)
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/skema/${item.id_skema}/biaya-uji`)}
                          className="rounded-lg bg-emerald-50/80 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                          title="Atur Biaya Uji"
                        >
                          <DollarSign size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal("detail", item)}
                          className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                          title="Detail Skema"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal("edit", item)}
                          className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
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

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-4 text-[13px] font-medium text-[#182D4A] sm:flex-row">
            <span>
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
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

      {/* UNIFIED MODAL (CREATE, EDIT, DETAIL) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  {modalType === "create" ? (
                    <Plus size={20} />
                  ) : modalType === "edit" ? (
                    <Edit2 size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </div>
                <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                  {modalType === "create"
                    ? "Tambah Skema Baru"
                    : modalType === "edit"
                    ? "Edit Skema Kompetensi"
                    : "Detail Skema Kompetensi"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-[#182D4A] hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Form Modal */}
            <form onSubmit={handleSubmit} className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-6 px-6 py-6">
                {/* SECTION 1: INFORMASI UTAMA & ATRIBUT */}
                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                    <h4 className="text-[14px] font-bold text-[#071E3D]">Informasi Utama & Atribut Skema</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label required>Kode Skema</Label>
                      <input
                        className={`${inputClass("kode_skema")} font-mono`}
                        type="text"
                        name="kode_skema"
                        value={formData.kode_skema}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                        required
                      />
                      <ErrorMessage message={errors.kode_skema} />
                    </div>

                    <div className="lg:col-span-2">
                      <Label required>Judul Skema</Label>
                      <input
                        className={inputClass("judul_skema")}
                        type="text"
                        name="judul_skema"
                        value={formData.judul_skema}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                        required
                      />
                      <ErrorMessage message={errors.judul_skema} />
                    </div>

                    <div>
                      <Label>Status Skema</Label>
                      <select
                        className={inputClass("status")}
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      >
                        <option value="draft">Draft</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-Aktif</option>
                      </select>
                    </div>

                    <div>
                      <Label>Jenis Skema</Label>
                      <select
                        className={inputClass("jenis_skema")}
                        name="jenis_skema"
                        value={formData.jenis_skema}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      >
                        <option value="kkni">KKNI</option>
                        <option value="okupasi">Okupasi</option>
                        <option value="klaster">Klaster</option>
                      </select>
                    </div>

                    <div>
                      <Label required>Level KKNI</Label>
                      <select
                        className={inputClass("level_kkni")}
                        name="level_kkni"
                        value={formData.level_kkni}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                        required
                      >
                        <option value="" disabled>
                          -- Pilih Level --
                        </option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <option key={num} value={num}>
                            Level {num}
                          </option>
                        ))}
                      </select>
                      <ErrorMessage message={errors.level_kkni} />
                    </div>

                    <div>
                      <Label>Jenjang Kualifikasi</Label>
                      <select
                        className={inputClass("jenjang_kualifikasi")}
                        name="jenjang_kualifikasi"
                        value={formData.jenjang_kualifikasi}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      >
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
                      <input
                        className={inputClass("bidang")}
                        type="text"
                        name="bidang"
                        value={formData.bidang}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      />
                    </div>

                    {/* Sub-group Klasifikasi */}
                    <div className="grid grid-cols-1 gap-5 border-t border-[#071E3D]/10 pt-5 lg:col-span-4 md:grid-cols-5">
                      <div>
                        <Label>Kode Sektor</Label>
                        <input
                          className={`${inputClass("kode_sektor")} font-mono`}
                          type="text"
                          name="kode_sektor"
                          value={formData.kode_sektor}
                          onChange={handleInputChange}
                          disabled={modalType === "detail"}
                        />
                      </div>
                      <div>
                        <Label>Kode KBLI</Label>
                        <input
                          className={`${inputClass("kode_kbli")} font-mono`}
                          type="text"
                          name="kode_kbli"
                          value={formData.kode_kbli}
                          onChange={handleInputChange}
                          disabled={modalType === "detail"}
                        />
                      </div>
                      <div>
                        <Label>Kode KBJI</Label>
                        <input
                          className={`${inputClass("kode_kbji")} font-mono`}
                          type="text"
                          name="kode_kbji"
                          value={formData.kode_kbji}
                          onChange={handleInputChange}
                          disabled={modalType === "detail"}
                        />
                      </div>
                      <div>
                        <Label>Nomor Revisi</Label>
                        <input
                          className={inputClass("nomor_revisi")}
                          type="text"
                          name="nomor_revisi"
                          value={formData.nomor_revisi}
                          onChange={handleInputChange}
                          disabled={modalType === "detail"}
                        />
                      </div>
                      <div>
                        <Label>Status Dokumen</Label>
                        <select
                          className={inputClass("status_dokumen")}
                          name="status_dokumen"
                          value={formData.status_dokumen}
                          onChange={handleInputChange}
                          disabled={modalType === "detail"}
                        >
                          <option value="terkendali">Terkendali</option>
                          <option value="tidak_terkendali">Tidak Terkendali</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: BERKAS DOKUMEN SKEMA (NAMA/UNGGAH & PRATINJAU SAMPING-SAMPINGAN) */}
                <section>
                  <FilePreviewPanel
                    title="Berkas Dokumen Skema (PDF)"
                    modalType={modalType}
                    fileName={selectedItem?.dokumen}
                    fileObject={selectedFile}
                    previewUrl={previewUrl}
                    showFull={showFullPreview}
                    onToggleFull={() => setShowFullPreview((p) => !p)}
                    onFileChange={handleFileChange}
                    buildFileUrl={buildFileUrl}
                    isPreviewable={(f) => isPreviewable(f)}
                    isImageFile={(f) => isImageFile(f)}
                    accept={FILE_ACCEPT}
                  />
                </section>
              </div>

              {/* Footer Modal */}
              <div className="mt-auto flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] hover:bg-[#E2E8F0] transition-colors"
                >
                  {modalType === "detail" ? "Tutup" : "Batal"}
                </button>
                {modalType !== "detail" && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#a8561f] disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {loading ? "Menyimpan..." : modalType === "edit" ? "Simpan Perubahan" : "Tambahkan"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCROLLBAR CUSTOM (Khusus untuk scroll vertikal dalam modal) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `,
        }}
      />
    </div>
  );
};

// --- SUB COMPONENTS ---

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
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "aktif"
      ? "bg-green-50 text-green-700 border-green-200"
      : status === "nonaktif"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-100 text-[#182D4A]/70 border-[#071E3D]/10";
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status || "draft"}
    </span>
  );
}

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-[11px] font-bold text-[#071E3D]">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function ErrorMessage({ message }) {
  return message ? <p className="mt-1 text-xs font-semibold text-red-500">{message}</p> : null;
}

function FilePreviewPanel({
  title,
  required,
  modalType,
  fileName,
  fileObject,
  previewUrl,
  showFull,
  onToggleFull,
  onFileChange,
  buildFileUrl,
  isPreviewable,
  isImageFile,
  accept,
}) {
  const previewSource = fileObject ? previewUrl : fileName;
  const canPreview = previewSource ? isPreviewable(previewSource) : false;

  return (
    <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5">
        <h4 className="text-[14px] font-bold text-[#071E3D]">
          {title} {required && <span className="text-red-500">*</span>}
        </h4>
      </div>

      {/* GRID SAMPING-SAMPINGAN (Kiri: Upload & Nama File, Kanan: Pratinjau Dokumen) */}
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-12">
        {/* KOLOM KIRI: INPUT FILE & INFO NAMA FILE (5 Kolom) */}
        <div className="flex flex-col justify-center rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-5 text-center lg:col-span-5">
          {modalType !== "detail" && (
            <>
              <p className="mb-3 text-[12px] font-bold text-[#071E3D]">Pilih File Baru (PDF)</p>
              <input
                type="file"
                onChange={onFileChange}
                accept={accept}
                className="mx-auto block w-full max-w-xs text-[11px] text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#CC6B27]/10 file:px-4 file:py-2 file:text-[11px] file:font-bold file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white transition-all"
              />
            </>
          )}

          {fileName && !fileObject && (
            <div className={`${modalType !== "detail" ? "mt-4" : ""} rounded-lg border border-[#071E3D]/10 bg-white px-4 py-3 text-[12px] font-semibold text-[#182D4A]/80 break-all`}>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50 mb-1">
                Dokumen Tersimpan:
              </span>
              <a href={buildFileUrl(fileName)} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:underline">
                {String(fileName).split("/").pop()}
              </a>
            </div>
          )}

          {fileObject && (
            <div className="mt-4 rounded-lg border border-[#CC6B27]/20 bg-orange-50 px-4 py-3 text-[12px] font-semibold text-[#071E3D] break-all">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#CC6B27] mb-1">
                File Baru Dipilih:
              </span>
              {fileObject.name}
            </div>
          )}

          {modalType === "detail" && !fileName && (
            <div className="py-4 text-center">
              <FileText size={32} className="mx-auto mb-2 text-[#182D4A]/20" />
              <p className="text-[12px] font-medium text-[#182D4A]/50">Belum ada dokumen yang diunggah.</p>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: PRATINJAU DOKUMEN (7 Kolom) */}
        <div className={`flex flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] lg:col-span-7 ${showFull ? "min-h-[500px]" : "min-h-[280px]"}`}>
          <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-white px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E3D]">Pratinjau Dokumen</span>
            {canPreview && (
              <button
                type="button"
                onClick={onToggleFull}
                className="text-[11px] font-bold text-[#CC6B27] hover:text-[#071E3D]"
              >
                {showFull ? "Perkecil Pratinjau" : "Perbesar Pratinjau"}
              </button>
            )}
          </div>
          <div className={`${showFull ? "h-[460px]" : "h-[240px]"} relative flex-1 bg-[#FAFAFA]`}>
            {previewSource ? (
              canPreview ? (
                isImageFile(previewSource) ? (
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <img
                      src={buildFileUrl(previewUrl || previewSource)}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={`${buildFileUrl(previewUrl || previewSource)}#toolbar=0&navpanes=0`}
                    className="absolute inset-0 h-full w-full border-0"
                    title={`Preview ${title}`}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <FileText size={32} className="mb-3 text-[#182D4A]/20" />
                  <p className="text-[13px] font-bold text-[#071E3D]">Pratinjau tidak tersedia</p>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <FileText size={32} className="mb-3 text-[#182D4A]/20" />
                <p className="text-[12px] font-medium text-[#182D4A]/50">Tidak ada file dokumen skema.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skema;