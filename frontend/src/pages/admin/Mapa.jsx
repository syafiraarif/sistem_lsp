// frontend/src/pages/admin/Mapa.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  Loader2,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  List,
  ArrowLeft,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  RefreshCcw,
} from "lucide-react";

const Mapa = () => {
  const navigate = useNavigate();
  // MENANGKAP ID SKEMA DARI URL (Contoh: /admin/skema/2/mapa -> id = 2)
  const { id } = useParams();

  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skemaInfo, setSkemaInfo] = useState(null); // Simpan info skema untuk judul

  // State Modal Master MAPA
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- FORM STATE MASTER MAPA ---
  const initialFormState = {
    id_skema: id ? parseInt(id) : "", // Otomatis terisi Skema tsb jika ada ID di URL
    versi: "",
    jenis: "MAPA-01",
    status: "draft",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA MASTER ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Skema untuk Dropdown
      const skemaRes = await api.get("/admin/skema");
      const skemaData = skemaRes.data?.data || skemaRes.data || [];
      setSkemaList(skemaData);

      // Cari nama skema untuk ditampilkan di Header (jika diakses dari dalam Skema)
      if (id) {
        const currentSkema = skemaData.find(
          (s) => s.id_skema === parseInt(id)
        );
        if (currentSkema) setSkemaInfo(currentSkema);
      }

      // --- PERBAIKAN CACHE CHROME DI SINI ---
      const response = await api.get(
        `/admin/mapa?timestamp=${new Date().getTime()}`
      );
      let mapaData = response.data?.data || response.data || [];

      // --- FILTERING UTAMA ---
      if (id) {
        mapaData = mapaData.filter((item) => item.id_skema === parseInt(id));
      }

      setData(mapaData);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire("Error", "Gagal memuat data MAPA", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_mapa);
    setFormData({
      id_skema: item.id_skema || "",
      versi: item.versi || "",
      jenis: item.jenis || "MAPA-01",
      status: item.status || "draft",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Dokumen MAPA?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        await api.delete(`/admin/mapa/${id}`);
        Swal.fire("Terhapus!", "Dokumen MAPA berhasil dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire(
          "Gagal!",
          error.response?.data?.message || "Gagal menghapus data",
          "error"
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_skema || !formData.versi || !formData.jenis) {
      return Swal.fire(
        "Peringatan",
        "Harap lengkapi Skema, Versi, dan Jenis MAPA!",
        "warning"
      );
    }

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        ...formData,
        id_skema: parseInt(formData.id_skema),
      };

      if (isEditMode) {
        await api.put(`/admin/mapa/${currentId}`, payload);
        Swal.fire("Berhasil", "Data MAPA diperbarui", "success");
      } else {
        await api.post("/admin/mapa", payload);
        Swal.fire("Berhasil", "Dokumen MAPA baru dibuat", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan",
        "error"
      );
    }
  };

  // Navigasi ke Detail Pengisian MAPA
  const handleOpenMapa = (item) => {
    if (item.jenis === "MAPA-01") {
      navigate(`/admin/mapa01/${item.id_mapa}`);
    } else if (item.jenis === "MAPA-02") {
      navigate(`/admin/mapa02/${item.id_skema}`);
    }
  };

  // Pencarian (Anti Crash)
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const judul = item.skema?.judul_skema || "";
    const versi = item.versi || "";
    const jenis = item.jenis || "";

    return (
      judul.toLowerCase().includes(term) ||
      versi.toLowerCase().includes(term) ||
      jenis.toLowerCase().includes(term)
    );
  });

  const totalMapa = data.length;
  const totalDraft = data.filter((item) => item.status !== "final").length;
  const totalFinal = data.filter((item) => item.status === "final").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              {id && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/skema")}
                  className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Kembali ke Detail Skema
                </button>
              )}

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Dokumen MAPA
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                {id ? "Dokumen MAPA" : "Manajemen Dokumen"}
                <br />
                <span className="text-orange-500">
                  {id ? skemaInfo?.judul_skema || "Memuat..." : "MAPA"}
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola master dokumen Merencanakan Aktivitas dan Proses
                Asesmen, termasuk versi, jenis MAPA, status draft, dan final.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormState);
                    setIsEditMode(false);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Buat MAPA Baru
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
                    <RefreshCcw size={17} />
                  )}
                  Refresh Data
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
                  Ringkasan MAPA
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalMapa} Dokumen
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  MAPA digunakan untuk mengatur perencanaan aktivitas dan proses
                  asesmen pada setiap skema.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Draft" value={`${totalDraft}`} />
                  <HeroPill label="Final" value={`${totalFinal}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<FileText size={22} />}
            label="Total MAPA"
            value={`${totalMapa} Dokumen`}
          />
          <MiniStat
            icon={<Clock size={22} />}
            label="Draft"
            value={`${totalDraft} Dokumen`}
            tone="orange"
          />
          <MiniStat
            icon={<CheckCircle size={22} />}
            label="Final"
            value={`${totalFinal} Dokumen`}
            tone="green"
          />
        </section>

        {/* CONTENT CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <ClipboardList size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Daftar Dokumen
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Dokumen MAPA
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari, edit, hapus, atau buka pengisian dokumen MAPA.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData(initialFormState);
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Buat MAPA Baru
            </button>
          </div>

          {/* SEARCH */}
          <div className="p-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Cari berdasarkan Skema, Jenis, atau Versi..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABEL DATA */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Informasi Dokumen</TableHead>
                  <TableHead>Penyusun</TableHead>
                  <TableHead center>Status</TableHead>
                  <TableHead center>Aksi / Pengisian</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data MAPA...
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        {id
                          ? "Dokumen MAPA untuk skema ini belum ada."
                          : "Belum ada dokumen MAPA ditemukan."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id_mapa}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {index + 1}
                      </td>

                      {/* Informasi Dokumen */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-[#071E3D] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                            {item.jenis}
                          </span>

                          <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                            Versi: {item.versi}
                          </span>
                        </div>

                        <div className="mt-3 flex items-start gap-2 text-sm font-black leading-snug text-[#071E3D]">
                          <BookOpen
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <span
                            className="line-clamp-2"
                            title={item.skema?.judul_skema}
                          >
                            {item.skema?.judul_skema || (
                              <span className="italic text-red-500">
                                Skema Terhapus
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Penyusun / Creator */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-black text-[#071E3D]">
                          <User size={15} className="text-orange-500" />
                          {item.creator?.username || "-"}
                        </div>

                        <div className="ml-6 mt-1 text-xs font-semibold text-slate-400">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        {item.status === "final" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                            <CheckCircle size={12} />
                            Final
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-600">
                            <Clock size={12} />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-center">
                            {item.jenis === "MAPA-01" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenMapa(item)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                                title="Buka / Isi Form MAPA-01"
                              >
                                <FileText size={14} />
                                Isi MAPA-01
                              </button>
                            ) : item.jenis === "MAPA-02" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenMapa(item)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                                title="Buka / Isi Form MAPA-02"
                              >
                                <List size={14} />
                                Isi MAPA-02
                              </button>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                              title="Edit Master Data"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id_mapa)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                              title="Hapus MAPA"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAL FORM MASTER MAPA --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  {isEditMode ? (
                    <Edit2 size={20} className="text-orange-500" />
                  ) : (
                    <Plus size={20} className="text-orange-500" />
                  )}
                  {isEditMode ? "Edit Master MAPA" : "Buat Master MAPA Baru"}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Lengkapi skema, versi, jenis MAPA, dan status dokumen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto p-6">
              <div>
                <Label required>Pilih Skema</Label>
                <select
                  name="id_skema"
                  value={formData.id_skema}
                  onChange={handleInputChange}
                  required
                  disabled={!!id}
                  className={`w-full rounded-2xl border px-4 py-4 text-sm font-semibold outline-none transition-all ${
                    id
                      ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                      : "border-slate-100 bg-slate-50 text-[#071E3D] focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  }`}
                >
                  <option value="">-- Pilih Skema Sertifikasi --</option>
                  {skemaList.map((s) => (
                    <option key={s.id_skema} value={s.id_skema}>
                      {s.judul_skema}
                    </option>
                  ))}
                </select>

                {id && (
                  <p className="mt-2 text-xs font-bold text-orange-500">
                    *Skema otomatis terkunci sesuai halaman detail.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Versi Dokumen</Label>
                  <input
                    type="text"
                    name="versi"
                    value={formData.versi}
                    onChange={handleInputChange}
                    required
                    placeholder="Cth: 1.0 / 2024"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <Label required>Jenis MAPA</Label>
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="MAPA-01">MAPA-01</option>
                    <option value="MAPA-02">MAPA-02</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Status Penyusunan</Label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="draft">Draft (Sedang Disusun)</option>
                  <option value="final">Final (Selesai)</option>
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Save size={16} />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default Mapa;