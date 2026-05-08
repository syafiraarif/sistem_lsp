// frontend/src/pages/admin/DokumenMutu.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  FileCheck2,
} from "lucide-react";

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

  // UPDATE: Mengubah default state menjadi string kosong agar placeholder "--Pilih--" muncul
  const initialFormState = {
    jenis_dokumen: "", 
    kategori: "",
    nama_dokumen: "",
    deskripsi: "",
    nomor_dokumen: "",
    nomor_revisi: "",
    penyusun: "",
    disahkan_oleh: "",
    tanggal_dokumen: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const [files, setFiles] = useState({
    file_dokumen: null,
    file_pendukung: null,
  });

  const [previewUrlUtama, setPreviewUrlUtama] = useState(null);
  const [showFullPreviewUtama, setShowFullPreviewUtama] = useState(false);

  const [previewUrlPendukung, setPreviewUrlPendukung] = useState(null);
  const [showFullPreviewPendukung, setShowFullPreviewPendukung] =
    useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/dokumen-mutu");
      const resBody = response.data !== undefined ? response.data : response;

      let listData = [];

      if (Array.isArray(resBody.data)) {
        listData = resBody.data;
      } else if (resBody.data?.data && Array.isArray(resBody.data.data)) {
        listData = resBody.data.data;
      } else if (Array.isArray(resBody)) {
        listData = resBody;
      }

      setData(listData);
    } catch (error) {
      console.error("Error Fetching:", error);
      Swal.fire({
        title: "Gagal",
        text:
          error.response?.data?.message ||
          "Gagal mengambil data dari server.",
        icon: "error",
      });
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

  const isPdfFile = (filename, fieldName) => {
    const checkName = files[fieldName] ? files[fieldName].name : filename;
    return checkName && /\.(pdf)$/i.test(checkName);
  };

  const isImageFile = (filename, fieldName) => {
    const checkName = files[fieldName] ? files[fieldName].name : filename;
    return checkName && /\.(jpg|jpeg|png|gif|webp)$/i.test(checkName);
  };

  const isPreviewable = (filename, fieldName) =>
    isPdfFile(filename, fieldName) || isImageFile(filename, fieldName);

  const validateInput = (name, value) => {
    let errorMsg = "";

    if (
      typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length <= 3
    ) {
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (file) {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));

      const url = URL.createObjectURL(file);

      if (fieldName === "file_dokumen") {
        setPreviewUrlUtama(url);
      } else if (fieldName === "file_pendukung") {
        setPreviewUrlPendukung(url);
      }
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    setErrors({});
    setShowFullPreviewUtama(false);
    setShowFullPreviewPendukung(false);

    if (type === "create") {
      setFormData(initialFormState);
      setFiles({ file_dokumen: null, file_pendukung: null });
      setPreviewUrlUtama(null);
      setPreviewUrlPendukung(null);
    } else if (item) {
      setFormData({
        jenis_dokumen: item.jenis_dokumen || "",
        kategori: item.kategori || "",
        nama_dokumen: item.nama_dokumen || "",
        deskripsi: item.deskripsi || "",
        nomor_dokumen: item.nomor_dokumen || "",
        nomor_revisi: item.nomor_revisi || "",
        penyusun: item.penyusun || "",
        disahkan_oleh: item.disahkan_oleh || "",
        tanggal_dokumen: item.tanggal_dokumen
          ? item.tanggal_dokumen.split("T")[0]
          : "",
      });

      setFiles({ file_dokumen: null, file_pendukung: null });

      setPreviewUrlUtama(item.file_dokumen || null);
      setPreviewUrlPendukung(item.file_pendukung || null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Dokumen?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await api.delete(`/admin/dokumen-mutu/${id}`);

        Swal.fire("Terhapus!", "Dokumen berhasil dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire(
          "Gagal",
          error.response?.data?.message || "Gagal menghapus data",
          "error"
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) {
      Swal.fire(
        "Peringatan",
        "Silakan perbaiki kolom isian yang terlalu pendek!",
        "warning"
      );
      return;
    }

    if (!formData.nama_dokumen || !formData.jenis_dokumen) {
      Swal.fire(
        "Peringatan",
        "Nama Dokumen dan Jenis Dokumen wajib diisi!",
        "warning"
      );
      return;
    }

    const actionText =
      modalType === "create" ? "menambahkan" : "menyimpan perubahan pada";

    const confirm = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin ${actionText} dokumen mutu ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan",
    });

    if (!confirm.isConfirmed) return;

    const dataPayload = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        dataPayload.append(key, formData[key]);
      }
    });

    if (files.file_dokumen) dataPayload.append("file_dokumen", files.file_dokumen);
    if (files.file_pendukung)
      dataPayload.append("file_pendukung", files.file_pendukung);

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (modalType === "create") {
        await api.post("/admin/dokumen-mutu", dataPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire("Berhasil", "Dokumen mutu berhasil ditambahkan", "success");
      } else {
        await api.put(`/admin/dokumen-mutu/${selectedItem.id_dokumen}`, dataPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire("Berhasil", "Dokumen mutu berhasil diperbarui", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan",
        "error"
      );
    }
  };

  const getBadgeColor = (jenis) => {
    switch (jenis) {
      case "kebijakan_mutu":
        return "bg-blue-50 text-blue-600";
      case "manual_mutu":
        return "bg-purple-50 text-purple-600";
      case "standar_mutu":
        return "bg-yellow-50 text-yellow-600";
      case "formulir_mutu":
        return "bg-green-50 text-green-600";
      default:
        return "bg-slate-50 text-slate-500";
    }
  };

  const inputClass = (name) =>
    `w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 placeholder:text-slate-300 ${
      errors[name]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-100 bg-slate-50 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
    }`;

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nama_dokumen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_dokumen?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchJenis = filterJenis ? item.jenis_dokumen === filterJenis : true;

    return matchSearch && matchJenis;
  });

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;

  const paginatedData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalDokumen = data.length;
  const totalJenis = new Set(data.map((item) => item.jenis_dokumen).filter(Boolean)).size;
  const totalDenganFile = data.filter((item) => item.file_dokumen).length;

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
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Dokumen Mutu
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Manajemen
                <br />
                <span className="text-orange-500">Dokumen Mutu</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola dokumen ISO 9001:2015, regulasi LSP, file utama, dan
                file pendukung dalam satu halaman yang rapi.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openModal("create")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Dokumen
                </button>

                <button
                  type="button"
                  onClick={fetchData}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <FileCheck2 size={17} />
                  )}
                  Muat Ulang
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Dokumen
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalDokumen} Dokumen Mutu
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data dokumen dapat difilter berdasarkan jenis dokumen dan kata
                  kunci pencarian.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Jenis" value={`${totalJenis}`} />
                  <HeroPill label="File" value={`${totalDenganFile}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Total Dokumen"
            value={`${totalDokumen} Dokumen`}
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Jenis Dokumen"
            value={`${totalJenis} Jenis`}
            tone="navy"
          />
          <MiniStat
            icon={<FileCheck2 size={22} />}
            label="File Utama"
            value={`${totalDenganFile} File`}
            tone="green"
          />
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Filter size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Dokumen
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Dokumen Mutu
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari berdasarkan nama dokumen atau nomor dokumen.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openModal("create")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Tambah Dokumen
            </button>
          </div>

          {/* TOOLBAR */}
          <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                placeholder="Cari Nama / No. Dokumen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-300"
              />
              <select
                className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={filterJenis}
                onChange={(e) => {
                  setFilterJenis(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">Semua Jenis Dokumen</option>
                <option value="kebijakan_mutu">Kebijakan Mutu</option>
                <option value="manual_mutu">Manual Mutu</option>
                <option value="standar_mutu">Standar Mutu</option>
                <option value="formulir_mutu">Formulir Mutu</option>
                <option value="referensi">Referensi</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Nama Dokumen</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>No. Dokumen</TableHead>
                  <TableHead center>Revisi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Sedang memuat data...
                      </p>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id_dokumen}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td
                        className="max-w-xs truncate px-5 py-4 text-sm font-black text-[#071E3D]"
                        title={item.nama_dokumen}
                      >
                        {item.nama_dokumen}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${getBadgeColor(
                            item.jenis_dokumen
                          )}`}
                        >
                          {item.jenis_dokumen?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {item.nomor_dokumen || "-"}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {item.nomor_revisi || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {item.tanggal_dokumen
                          ? new Date(item.tanggal_dokumen).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            className="rounded-xl bg-slate-50 p-2 text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                            title="Detail"
                            onClick={() => openModal("detail", item)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="rounded-xl bg-orange-50 p-2 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                            title="Edit"
                            onClick={() => openModal("edit", item)}
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            className="rounded-xl bg-red-50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus"
                            onClick={() => handleDelete(item.id_dokumen)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-16 text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        Data tidak ditemukan.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredData.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 p-6 text-sm font-semibold text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, filteredData.length)}{" "}
                dari {filteredData.length} data
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#071E3D] transition-all hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-2 font-black text-[#071E3D]">
                  {pagination.page} / {totalPages}
                </span>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#071E3D] transition-all hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pagination.page >= totalPages}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  {modalType === "create" && (
                    <>
                      <Plus size={20} className="text-orange-500" />
                      Tambah Dokumen Baru
                    </>
                  )}
                  {modalType === "edit" && (
                    <>
                      <Edit2 size={20} className="text-orange-500" />
                      Edit Dokumen Mutu
                    </>
                  )}
                  {modalType === "detail" && (
                    <>
                      <Eye size={20} className="text-orange-500" />
                      Detail Dokumen
                    </>
                  )}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Kelola informasi dokumen, file utama, dan file pendukung.
                </p>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="space-y-6 overflow-y-auto px-6 py-5">
                {/* INFORMASI */}
                <section className="overflow-hidden rounded-[30px] border border-slate-100 bg-slate-50/50">
                  <div className="border-b border-slate-100 bg-white p-5">
                    <h4 className="text-lg font-black text-[#071E3D]">
                      Informasi Utama
                    </h4>
                    <p className="mt-1 text-sm font-medium text-slate-400">
                      Lengkapi identitas dan metadata dokumen mutu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
                    {/* UPDATE: Nama Dokumen Placeholder */}
                    <div className="lg:col-span-2">
                      <Label required>Nama/Judul Dokumen</Label>
                      <input
                        className={inputClass("nama_dokumen")}
                        type="text"
                        name="nama_dokumen"
                        value={formData.nama_dokumen}
                        onChange={handleInputChange}
                        placeholder="Nama/ Judul Dokumen"
                        disabled={modalType === "detail"}
                        required
                      />
                      <ErrorMessage message={errors.nama_dokumen} />
                    </div>

                    {/* UPDATE: Jenis Dokumen Dropdown Label */}
                    <div className="lg:col-span-1">
                      <Label required>Jenis Dokumen</Label>
                      <select
                        className={inputClass("jenis_dokumen")}
                        name="jenis_dokumen"
                        value={formData.jenis_dokumen}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                        required
                      >
                        <option value="" disabled>--Pilih Jenis Dokumen--</option>
                        <option value="kebijakan_mutu">Kebijakan Mutu</option>
                        <option value="manual_mutu">Manual/Panduan Mutu</option>
                        <option value="standar_mutu">Standar Mutu</option>
                        <option value="formulir_mutu">Formulir Mutu</option>
                        <option value="referensi">Referensi/Dokumen Ekternal</option>
                      </select>
                    </div>

                    {/* UPDATE: Kategori Dropdown sesuai gambar referensi */}
                    <div className="lg:col-span-1">
                      <Label>Kategori Dokumen</Label>
                      <select
                        className={inputClass("kategori")}
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      >
                        <option value="" disabled>--Pilih Kategori Dokumen--</option>
                        <option value="Kelembagaan LSP">Kelembagaan LSP</option>
                        <option value="Standar Kompetensi">Standar Kompetensi</option>
                        <option value="Skema Kompetensi">Skema Kompetensi</option>
                        <option value="Asesor Kompetensi">Asesor Kompetensi</option>
                        <option value="Asesi">Asesi</option>
                        <option value="Tempat Uji Kompetensi">Tempat Uji Kompetensi</option>
                        <option value="Jadwal Uji Kompetensi">Jadwal Uji Kompetensi</option>
                        <option value="Biaya Uji Kompetensi">Biaya Uji Kompetensi</option>
                        <option value="Dokumen dan Administrasi">Dokumen dan Administrasi</option>
                        <option value="Referensi/ Acuan">Referensi/ Acuan</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                      <ErrorMessage message={errors.kategori} />
                    </div>

                    {/* UPDATE: Deskripsi Placeholder */}
                    <div className="lg:col-span-4">
                      <Label>Deskripsi Dokumen</Label>
                      <textarea
                        className={`${inputClass("deskripsi")} resize-none`}
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        placeholder="Deskripsi Lengkap Dokumen"
                        rows="3"
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.deskripsi} />
                    </div>

                    {/* UPDATE: Nomor Dokumen Placeholder */}
                    <div>
                      <Label>Nomor Dokumen</Label>
                      <input
                        className={inputClass("nomor_dokumen")}
                        type="text"
                        name="nomor_dokumen"
                        value={formData.nomor_dokumen}
                        onChange={handleInputChange}
                        placeholder="Nomor Dokumen"
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.nomor_dokumen} />
                    </div>

                    {/* UPDATE: Nomor Revisi Placeholder */}
                    <div>
                      <Label>Nomor Revisi</Label>
                      <input
                        className={inputClass("nomor_revisi")}
                        type="text"
                        name="nomor_revisi"
                        value={formData.nomor_revisi}
                        onChange={handleInputChange}
                        placeholder="0"
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.nomor_revisi} />
                    </div>

                    {/* UPDATE: Penyusun Placeholder */}
                    <div>
                      <Label>Penyusun Dokumen</Label>
                      <input
                        className={inputClass("penyusun")}
                        type="text"
                        name="penyusun"
                        value={formData.penyusun}
                        onChange={handleInputChange}
                        placeholder="Nama dan Gelar Penyusun"
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.penyusun} />
                    </div>

                    {/* UPDATE: Disahkan Oleh Placeholder */}
                    <div>
                      <Label>Disahkan Oleh</Label>
                      <input
                        className={inputClass("disahkan_oleh")}
                        type="text"
                        name="disahkan_oleh"
                        value={formData.disahkan_oleh}
                        onChange={handleInputChange}
                        placeholder="Nama dan Gelar Pengesah Dokumen"
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.disahkan_oleh} />
                    </div>
                    
                    {/* Input Tanggal */}
                    <div>
                      <Label>Tanggal Dokumen</Label>
                      <input
                        className={inputClass("tanggal_dokumen")}
                        type="date"
                        name="tanggal_dokumen"
                        value={formData.tanggal_dokumen}
                        onChange={handleInputChange}
                        disabled={modalType === "detail"}
                      />
                      <ErrorMessage message={errors.tanggal_dokumen} />
                    </div>
                  </div>
                </section>

                {/* FILES */}
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FilePreviewPanel
                    title="Berkas (File) Dokumen Utama"
                    required
                    accent="orange"
                    modalType={modalType}
                    fileName={selectedItem?.file_dokumen}
                    fileObject={files.file_dokumen}
                    previewUrl={previewUrlUtama}
                    showFull={showFullPreviewUtama}
                    onToggleFull={() =>
                      setShowFullPreviewUtama(!showFullPreviewUtama)
                    }
                    onFileChange={(e) => handleFileChange(e, "file_dokumen")}
                    buildFileUrl={buildFileUrl}
                    isPreviewable={(file) =>
                      isPreviewable(file, "file_dokumen")
                    }
                    isImageFile={(file) => isImageFile(file, "file_dokumen")}
                    accept=".pdf"
                  />

                  <FilePreviewPanel
                    title="Dokumen Pendukung"
                    accent="navy"
                    modalType={modalType}
                    fileName={selectedItem?.file_pendukung}
                    fileObject={files.file_pendukung}
                    previewUrl={previewUrlPendukung}
                    showFull={showFullPreviewPendukung}
                    onToggleFull={() =>
                      setShowFullPreviewPendukung(!showFullPreviewPendukung)
                    }
                    onFileChange={(e) =>
                      handleFileChange(e, "file_pendukung")
                    }
                    buildFileUrl={buildFileUrl}
                    isPreviewable={(file) =>
                      isPreviewable(file, "file_pendukung")
                    }
                    isImageFile={(file) =>
                      isImageFile(file, "file_pendukung")
                    }
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </section>
              </div>

              {/* FOOTER */}
              <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  {modalType === "detail" ? "Tutup" : "Batal"}
                </button>

                {modalType !== "detail" && (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    <Save size={16} />
                    Tambahkan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function FilePreviewPanel({
  title,
  required,
  accent,
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
  const accentClass =
    accent === "orange"
      ? "text-orange-500 border-orange-100 bg-orange-50"
      : "text-[#071E3D] border-slate-100 bg-slate-50";

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div
          className={`mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${accentClass}`}
        >
          <FileText size={15} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {title}
          </span>
        </div>

        <h4 className="text-lg font-black text-[#071E3D]">
          {title} {required && <span className="text-red-500">*</span>}
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Upload File
          </label>

          {modalType !== "detail" && (
            <input
              type="file"
              onChange={onFileChange}
              className="block w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-2 text-xs font-semibold text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-black file:text-orange-500 hover:file:bg-orange-500 hover:file:text-white"
              accept={accept}
            />
          )}

          {fileName && !fileObject && (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
              Tersimpan:{" "}
              <a
                href={buildFileUrl(fileName)}
                target="_blank"
                rel="noreferrer"
                className="font-black text-orange-500 hover:underline"
              >
                {fileName}
              </a>
            </div>
          )}
        </div>

        <div
          className={`overflow-hidden rounded-[24px] border border-slate-100 bg-white ${
            showFull ? "min-h-[560px]" : "min-h-[330px]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Preview
            </span>

            {previewUrl && isPreviewable(previewUrl) && (
              <button
                type="button"
                onClick={onToggleFull}
                className="text-xs font-black text-orange-500 hover:text-[#071E3D]"
              >
                {showFull ? "Perkecil" : "Tampilkan Lebih Banyak"}
              </button>
            )}
          </div>

          <div className={`${showFull ? "h-[520px]" : "h-[300px]"} relative`}>
            {previewUrl ? (
              isPreviewable(previewUrl) ? (
                isImageFile(previewUrl) ? (
                  <div className="absolute inset-0 flex items-start justify-center overflow-auto bg-slate-50 p-3">
                    <img
                      src={buildFileUrl(previewUrl)}
                      alt="Preview"
                      className="max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={`${buildFileUrl(previewUrl)}#toolbar=0&navpanes=0`}
                    className="absolute inset-0 h-full w-full border-0"
                    title={`Preview ${title}`}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                  <FileText size={42} className="mb-3 text-blue-400" />
                  <p className="text-sm font-black text-[#071E3D]">
                    Preview tidak tersedia
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Format file ini tidak dapat dipratinjau langsung di browser.
                  </p>
                  <a
                    href={buildFileUrl(previewUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 rounded-2xl bg-blue-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100"
                  >
                    Unduh File
                  </a>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <FileText size={42} className="mb-3 text-slate-300" />
                <p className="text-xs font-semibold text-slate-400">
                  Pilih file untuk melihat pratinjau.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    navy: "bg-slate-50 text-[#071E3D]",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
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

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function ErrorMessage({ message }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-semibold text-red-500">{message}</p>;
}

export default DokumenMutu;