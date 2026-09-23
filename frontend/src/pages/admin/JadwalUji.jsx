import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  Loader2,
  Clock,
  MapPin,
  Layers,
  Link as LinkIcon,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  RefreshCcw,
  Users,
  BadgeCheck,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const JadwalUji = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Data Pendukung Dropdown
  const [listSkema, setListSkema] = useState([]);
  const [listTuk, setListTuk] = useState([]);

  // State Form
  const initialFormState = {
    kode_jadwal: "",
    id_skema: "",
    id_tuk: "",
    nama_kegiatan: "",
    tahun: new Date().getFullYear(),
    periode_bulan: "",
    gelombang: "",
    tgl_pra_asesmen: "",
    tgl_awal: "",
    tgl_akhir: "",
    jam: "",
    pelaksanaan_uji: "luring",
    url_agenda: "",
    status: "draft",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Daftar Bulan Statis
  const listBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Jadwal Utama
    try {
      const response = await api.get("/admin/jadwal");
      let jadwalData = response.data?.data || response.data || [];
      if (!Array.isArray(jadwalData) && Array.isArray(jadwalData.data)) {
        jadwalData = jadwalData.data;
      } else if (!Array.isArray(jadwalData) && Array.isArray(jadwalData.rows)) {
        jadwalData = jadwalData.rows;
      }
      setData(Array.isArray(jadwalData) ? jadwalData : []);
    } catch (error) {
      console.error("Error fetching Jadwal:", error);
      Swal.fire("Error", "Gagal memuat data jadwal utama", "error");
    }

    // 2. Fetch Skema (Dropdown)
    try {
      const skemaRes = await api.get("/admin/skema");
      let skemaData = skemaRes.data?.data || skemaRes.data || [];
      if (!Array.isArray(skemaData) && Array.isArray(skemaData.data)) {
        skemaData = skemaData.data;
      } else if (!Array.isArray(skemaData) && Array.isArray(skemaData.rows)) {
        skemaData = skemaData.rows;
      }
      setListSkema(Array.isArray(skemaData) ? skemaData : []);
    } catch (error) {
      console.error("Error fetching Skema:", error);
    }

    // 3. Fetch TUK (Dropdown)
    try {
      const tukRes = await api.get("/admin/tuk");
      let tukData = tukRes.data?.data || tukRes.data || [];
      if (!Array.isArray(tukData) && Array.isArray(tukData.data)) {
        tukData = tukData.data;
      } else if (!Array.isArray(tukData) && Array.isArray(tukData.rows)) {
        tukData = tukData.rows;
      }
      setListTuk(Array.isArray(tukData) ? tukData : []);
    } catch (error) {
      console.error("Error fetching TUK:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_jadwal);
    const formatDate = (dateString) => dateString ? dateString.split("T")[0] : "";
    
    setFormData({
      kode_jadwal: item.kode_jadwal || "",
      id_skema: item.id_skema || "",
      id_tuk: item.id_tuk || "",
      nama_kegiatan: item.nama_kegiatan || "",
      tahun: item.tahun || new Date().getFullYear(),
      periode_bulan: item.periode_bulan || "",
      gelombang: item.gelombang || "",
      tgl_pra_asesmen: formatDate(item.tgl_pra_asesmen),
      tgl_awal: formatDate(item.tgl_awal),
      tgl_akhir: formatDate(item.tgl_akhir),
      jam: item.jam || "",
      pelaksanaan_uji: item.pelaksanaan_uji || "luring",
      url_agenda: item.url_agenda || "",
      status: item.status || "draft",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Jadwal?",
      icon: "warning",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        await api.delete(`/admin/jadwal/${id}`);
        Swal.fire("Terhapus!", "Data jadwal berhasil dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire(
          "Gagal!",
          error.response?.data?.message || "Gagal hapus data",
          "error"
        );
      }
    }
  };

  const sanitizeData = (data) => {
    const clean = { ...data };
    delete clean.kuota;
    clean.id_skema = clean.id_skema ? parseInt(clean.id_skema) : null;
    clean.id_tuk = clean.id_tuk ? parseInt(clean.id_tuk) : null;
    clean.tahun = clean.tahun ? parseInt(clean.tahun) : null;
    
    [
      "tgl_pra_asesmen", "tgl_awal", "tgl_akhir", "jam", "kode_jadwal", "url_agenda", "periode_bulan", "gelombang",
    ].forEach((field) => {
      if (!clean[field] || clean[field] === "") {
        clean[field] = null;
      }
    });

    if (clean.jam && clean.jam.length === 5) {
      clean.jam = `${clean.jam}:00`;
    }
    return clean;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_skema || !formData.id_tuk || !formData.nama_kegiatan) {
      Swal.fire("Peringatan", "Nama Kegiatan, Skema, dan TUK wajib diisi!", "warning");
      return;
    }

    const dataToSend = sanitizeData(formData);
    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      if (isEditMode) {
        await api.put(`/admin/jadwal/${currentId}`, dataToSend);
        Swal.fire("Sukses", "Jadwal berhasil diperbarui", "success");
      } else {
        await api.post("/admin/jadwal", dataToSend);
        Swal.fire("Sukses", "Jadwal baru berhasil dibuat", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan saat menyimpan", "error");
    }
  };

  const filteredData = data.filter(
    (item) =>
      (item.nama_kegiatan && item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.kode_jadwal && item.kode_jadwal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const paginatedData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const totalJadwal = data.length;
  const totalOpen = data.filter((item) => item.status === "open").length;
  const totalOngoing = data.filter((item) => item.status === "ongoing").length;
  const totalDraft = data.filter((item) => !item.status || item.status === "draft").length;

  const inputClass = "w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10";
  const labelClass = "mb-1.5 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8 flex flex-col gap-6">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
              Manajemen Jadwal Asesmen
            </h2>
            <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
              Atur jadwal pelaksanaan uji kompetensi, relasi skema, TUK, periode, mode pelaksanaan, dan status.
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
              onClick={() => {
                setFormData(initialFormState);
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
            >
              <Plus size={16} />
              Tambah Jadwal
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<CalendarDays size={22} />} label="Total Jadwal" value={`${totalJadwal} Data`} tone="navy" />
        <StatCard icon={<BadgeCheck size={22} />} label="Status Open" value={`${totalOpen} Open`} tone="green" />
        <StatCard icon={<Clock size={22} />} label="Sedang Berjalan" value={`${totalOngoing} Proses`} tone="blue" />
        <StatCard icon={<ClipboardList size={22} />} label="Draft" value={`${totalDraft} Draft`} tone="orange" />
      </div>

      {/* CARD TABEL - Disesuaikan dengan Skema */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
        
        {/* Header Tabel */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
            <CalendarDays size={18} className="text-[#CC6B27]" />
            Daftar Jadwal Asesmen
          </h4>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[400px] mb-2">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
            <input
              type="text"
              placeholder="Cari nama atau kode jadwal..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
            />
          </div>
        </div>

        {/* Tabel Terbungkus Border Rounded */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
            <thead>
              <tr>
                <TableHead center>No</TableHead>
                <TableHead>Informasi Kegiatan</TableHead>
                <TableHead>Skema & TUK</TableHead>
                <TableHead>Waktu Pelaksanaan</TableHead>
                <TableHead center>Status</TableHead>
                <TableHead center>Kelola</TableHead>
                <TableHead center>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                    <p className="text-[14px] font-medium text-[#182D4A]">Memuat Jadwal...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Inbox size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                    <p className="text-[14px] font-medium text-[#182D4A]">Jadwal belum tersedia atau tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const skemaName =
                    item.skema?.judul_skema ||
                    item.Skema?.judul_skema || (
                      <span className="italic text-red-500">Skema Terhapus</span>
                    );
                  const tukName =
                    item.tuk?.nama_tuk ||
                    item.Tuk?.nama_tuk ||
                    item.TUK?.nama_tuk || (
                      <span className="italic text-red-500">TUK Terhapus</span>
                    );
                  
                  return (
                    <tr key={item.id_jadwal} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3.5 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="mb-1.5 inline-flex rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                          {item.kode_jadwal || "Tidak Ada Kode"}
                        </div>
                        <h3 className="max-w-[280px] text-[13.5px] font-bold text-[#071E3D]">
                          {item.nama_kegiatan || "-"}
                        </h3>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          Gelombang: {item.gelombang || "-"} • {item.tahun || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <SmallLine icon={<Layers size={14} />} text={skemaName} />
                          <SmallLine icon={<MapPin size={14} />} text={tukName} orange />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#071E3D]">
                            <Calendar size={14} className="text-[#CC6B27]" />
                            <span>
                              {formatDate(item.tgl_awal)} - {formatDate(item.tgl_akhir)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {item.pelaksanaan_uji || "Luring"}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                              <Clock size={12} />
                              {item.jam ? item.jam.slice(0, 5) : "-"} WIB
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jadwal/${item.id_jadwal}/asesor`)}
                            className="inline-flex w-full max-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-[#182D4A]/10 px-3 py-1.5 text-[11px] font-bold text-[#182D4A] transition-all hover:bg-[#182D4A] hover:text-white"
                          >
                            <ShieldCheck size={14} /> Asesor
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jadwal/${item.id_jadwal}/peserta`)}
                            className="inline-flex w-full max-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-[#CC6B27]/10 px-3 py-1.5 text-[11px] font-bold text-[#CC6B27] transition-all hover:bg-[#CC6B27] hover:text-white"
                          >
                            <Users size={14} /> Peserta
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_jadwal)}
                            className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white flex items-center justify-center"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Section: Pagination */}
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

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#CC6B27]/10 p-2 rounded-lg text-[#CC6B27]">
                  {isEditMode ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                    {isEditMode ? "Edit Jadwal Uji" : "Buat Jadwal Baru"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
              <form id="jadwalForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. INFO UMUM */}
                <FormGroup icon={<ClipboardList size={16} />} title="Informasi Kegiatan">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Kode Jadwal</label>
                      <input
                        type="text"
                        name="kode_jadwal"
                        value={formData.kode_jadwal}
                        onChange={handleInputChange}
                        placeholder="Kosongkan jika auto-generate"
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nama Kegiatan <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="nama_kegiatan"
                        value={formData.nama_kegiatan}
                        onChange={handleInputChange}
                        required
                        placeholder="Contoh: Sertifikasi Batch 1 2026"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* 2. SKEMA & TUK */}
                <FormGroup icon={<MapPin size={16} />} title="Pemilihan Skema & TUK">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Skema Sertifikasi <span className="text-red-500">*</span></label>
                      <select
                        name="id_skema"
                        value={formData.id_skema}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      >
                        <option value="">-- Pilih Skema --</option>
                        {listSkema.map((s) => {
                          const idSkema = s.id_skema || s.id;
                          const judul = s.judul_skema || s.judul;
                          const kode = s.kode_skema || s.kode;
                          return (
                            <option key={idSkema} value={idSkema}>
                              {judul} ({kode})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Tempat Uji Kompetensi (TUK) <span className="text-red-500">*</span></label>
                      <select
                        name="id_tuk"
                        value={formData.id_tuk}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      >
                        <option value="">-- Pilih Tempat Uji --</option>
                        {listTuk.map((t) => {
                          const idTuk = t.id_tuk || t.id;
                          const namaTuk = t.nama_tuk || t.nama;
                          return (
                            <option key={idTuk} value={idTuk}>
                              {namaTuk} {t.jenis_tuk ? `(${t.jenis_tuk})` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </FormGroup>

                {/* 3. WAKTU */}
                <FormGroup icon={<Calendar size={16} />} title="Waktu Pelaksanaan">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelClass}>Tgl Pra-Asesmen</label>
                      <input
                        type="date"
                        name="tgl_pra_asesmen"
                        value={formData.tgl_pra_asesmen}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tgl Awal Uji</label>
                      <input
                        type="date"
                        name="tgl_awal"
                        value={formData.tgl_awal}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tgl Akhir Uji</label>
                      <input
                        type="date"
                        name="tgl_akhir"
                        value={formData.tgl_akhir}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Jam Pelaksanaan</label>
                      <input
                        type="time"
                        name="jam"
                        value={formData.jam}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* 4. DETAIL */}
                <FormGroup icon={<Layers size={16} />} title="Periode Jadwal">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className={labelClass}>Tahun</label>
                      <input
                        type="number"
                        name="tahun"
                        value={formData.tahun}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Bulan</label>
                      <select
                        name="periode_bulan"
                        value={formData.periode_bulan}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">-- Pilih --</option>
                        {listBulan.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Gelombang</label>
                      <input
                        type="text"
                        name="gelombang"
                        value={formData.gelombang}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Contoh: 1"
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* 5. STATUS & MODE */}
                <FormGroup icon={<LinkIcon size={16} />} title="Pengaturan Status">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>Mode Uji</label>
                      <select
                        name="pelaksanaan_uji"
                        value={formData.pelaksanaan_uji}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="luring">Luring (Offline)</option>
                        <option value="daring">Daring (Online)</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status Pendaftaran</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="draft">Draft / Menunggu Verifikasi</option>
                        <option value="disetujui">Disetujui Admin</option>
                        <option value="ditolak">Ditolak Admin</option>
                        <option value="open">Open (Bisa Mendaftar)</option>
                        <option value="ongoing">Ongoing (Sedang Berjalan)</option>
                        <option value="selesai">Selesai</option>
                        <option value="arsip">Arsip</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>URL Meeting / Group</label>
                      <input
                        type="text"
                        name="url_agenda"
                        value={formData.url_agenda}
                        onChange={handleInputChange}
                        placeholder="https://zoom.us/..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </FormGroup>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="pt-5 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[13px] font-bold transition-all"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                form="jadwalForm"
                className="px-5 py-2.5 rounded-lg bg-[#CC6B27] text-white hover:bg-[#a8561f] font-bold flex items-center gap-2 text-[13px] transition-all"
              >
                <Save size={16} />
                Simpan Jadwal
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
};

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "draft";
  const styles = {
    open: "bg-green-50 text-green-600 border-green-200",
    disetujui: "bg-emerald-50 text-emerald-600 border-emerald-200",
    ditolak: "bg-red-50 text-red-600 border-red-200",
    ongoing: "bg-blue-50 text-blue-600 border-blue-200",
    selesai: "bg-slate-100 text-slate-600 border-slate-200",
    arsip: "bg-slate-100 text-slate-500 border-slate-200",
    draft: "bg-amber-50 text-amber-600 border-amber-200",
  };
  const labels = {
    draft: "Draft",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    open: "Open",
    ongoing: "Ongoing",
    selesai: "Selesai",
    arsip: "Arsip",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
        styles[normalizedStatus] || styles.draft
      }`}
    >
      {labels[normalizedStatus] || normalizedStatus}
    </span>
  );
}

function SmallLine({ icon, text, orange = false }) {
  return (
    <div className="flex items-start gap-2 text-[12px] font-medium text-slate-500">
      <span className={`mt-0.5 shrink-0 ${orange ? "text-[#CC6B27]" : "text-[#071E3D]"}`}>
        {icon}
      </span>
      <span className="line-clamp-2">{text || "-"}</span>
    </div>
  );
}

function FormGroup({ icon, title, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-4 flex items-center gap-3">
        <div className="text-[#CC6B27]">
          {icon}
        </div>
        <h4 className="text-[14px] font-bold text-[#071E3D]">
          {title}
        </h4>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "?";
  return String(value).split("T")[0];
}

export default JadwalUji;