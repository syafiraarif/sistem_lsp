// frontend/src/pages/admin/JadwalUji.jsx

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
  Sparkles,
  RefreshCcw,
  Users,
  Building2,
  BadgeCheck,
  ChevronRight,
  Inbox,
} from "lucide-react";

const JadwalUji = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Data Pendukung Dropdown
  const [listSkema, setListSkema] = useState([]);
  const [listTuk, setListTuk] = useState([]);

  // State Form (Disesuaikan dengan field di jadwal.model.js)
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
    kuota: 0,
    pelaksanaan_uji: "luring",
    url_agenda: "",
    status: "draft",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Daftar Bulan Statis
  const listBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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
      } else if (
        !Array.isArray(jadwalData) &&
        Array.isArray(jadwalData.rows)
      ) {
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_jadwal);

    const formatDate = (dateString) =>
      dateString ? dateString.split("T")[0] : "";

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
      kuota: item.kuota || 0,
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

    clean.id_skema = clean.id_skema ? parseInt(clean.id_skema) : null;
    clean.id_tuk = clean.id_tuk ? parseInt(clean.id_tuk) : null;
    clean.tahun = clean.tahun ? parseInt(clean.tahun) : null;
    clean.kuota = clean.kuota ? parseInt(clean.kuota) : 0;

    [
      "tgl_pra_asesmen",
      "tgl_awal",
      "tgl_akhir",
      "jam",
      "kode_jadwal",
      "url_agenda",
      "periode_bulan",
      "gelombang",
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
      Swal.fire(
        "Peringatan",
        "Nama Kegiatan, Skema, dan TUK wajib diisi!",
        "warning"
      );
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

      Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan",
        "error"
      );
    }
  };

  const filteredData = data.filter(
    (item) =>
      (item.nama_kegiatan &&
        item.nama_kegiatan
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (item.kode_jadwal &&
        item.kode_jadwal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalJadwal = data.length;
  const totalOpen = data.filter((item) => item.status === "open").length;
  const totalOngoing = data.filter((item) => item.status === "ongoing").length;
  const totalDraft = data.filter(
    (item) => !item.status || item.status === "draft"
  ).length;

  const inputClass =
    "w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10";
  const labelClass =
    "mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute top-0 right-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <CalendarDays size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Jadwal Uji Kompetensi
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola Jadwal
                <br />
                <span className="text-orange-500">Asesmen</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Atur jadwal pelaksanaan uji kompetensi, relasi skema, TUK,
                periode, kuota, mode pelaksanaan, dan status pendaftaran.
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
                  Buat Jadwal Baru
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
                  Refresh
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
                  Ringkasan Jadwal
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalJadwal} Jadwal Terdata
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Gunakan status open untuk membuka pendaftaran, ongoing untuk
                  jadwal berjalan, dan draft untuk menyembunyikan jadwal.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Open" value={`${totalOpen} Jadwal`} />
                  <HeroPill label="Draft" value={`${totalDraft} Jadwal`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            icon={<CalendarDays size={22} />}
            label="Total Jadwal"
            value={`${totalJadwal} Jadwal`}
          />

          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Status Open"
            value={`${totalOpen} Jadwal`}
          />

          <MiniStat
            icon={<Clock size={22} />}
            label="Sedang Berjalan"
            value={`${totalOngoing} Jadwal`}
          />

          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Draft"
            value={`${totalDraft} Jadwal`}
          />
        </section>

        {/* FILTER */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Search size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Pencarian Data
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D] lg:text-3xl">
                Daftar Jadwal Asesmen
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari berdasarkan kode jadwal atau nama kegiatan.
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
              Tambah Jadwal
            </button>
          </div>

          <div className="p-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />

              <input
                type="text"
                placeholder="Cari kode atau nama kegiatan..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead className="w-16 text-center">No</TableHead>
                  <TableHead>Informasi Kegiatan</TableHead>
                  <TableHead>Skema & TUK</TableHead>
                  <TableHead>Waktu Pelaksanaan</TableHead>
                  <TableHead className="w-24 text-center">Kuota</TableHead>
                  <TableHead className="w-32 text-center">Status</TableHead>
                  <TableHead className="w-44 text-center">Kelola</TableHead>
                  <TableHead className="w-28 text-center">Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="text-lg font-black text-[#071E3D]">
                        Memuat Jadwal
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-400">
                        Mengambil data jadwal uji kompetensi.
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                        <Inbox size={32} />
                      </div>
                      <p className="text-lg font-black text-[#071E3D]">
                        Belum Ada Jadwal
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-400">
                        Data belum tersedia atau tidak cocok dengan pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const skemaName =
                      item.skema?.judul_skema ||
                      item.Skema?.judul_skema || (
                        <span className="italic text-red-500">
                          Skema Terhapus
                        </span>
                      );

                    const tukName =
                      item.tuk?.nama_tuk ||
                      item.Tuk?.nama_tuk ||
                      item.TUK?.nama_tuk || (
                        <span className="italic text-red-500">
                          TUK Terhapus
                        </span>
                      );

                    return (
                      <tr
                        key={item.id_jadwal}
                        className="border-b border-slate-100 transition-all hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-5 text-center text-sm font-black text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-5">
                          <div className="mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                            {item.kode_jadwal || "Tidak Ada Kode"}
                          </div>

                          <h3 className="max-w-[280px] text-sm font-black leading-relaxed text-[#071E3D]">
                            {item.nama_kegiatan || "-"}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Gelombang: {item.gelombang || "-"} •{" "}
                            {item.tahun || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="space-y-3">
                            <SmallLine
                              icon={<Layers size={15} />}
                              text={skemaName}
                            />

                            <SmallLine
                              icon={<MapPin size={15} />}
                              text={tukName}
                              orange
                            />
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#071E3D]">
                              <Calendar size={15} className="text-orange-500" />
                              <span>
                                {formatDate(item.tgl_awal)} -{" "}
                                {formatDate(item.tgl_akhir)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {item.pelaksanaan_uji || "Luring"}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                                <Clock size={12} />
                                {item.jam ? item.jam.slice(0, 5) : "-"} WIB
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-center">
                          <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-slate-50 px-4 text-sm font-black text-[#071E3D]">
                            {item.kuota || 0}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-center">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/jadwal/${item.id_jadwal}/asesor`
                                )
                              }
                              className="inline-flex w-full max-w-[120px] items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                            >
                              <ShieldCheck size={14} />
                              Asesor
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/jadwal/${item.id_jadwal}/peserta`
                                )
                              }
                              className="inline-flex w-full max-w-[120px] items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
                            >
                              <Users size={14} />
                              Peserta
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                              title="Edit Jadwal"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id_jadwal)}
                              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                              title="Hapus Jadwal"
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
        </section>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/55 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-2xl shadow-[#071E3D]/20">
            {/* Modal Header */}
            <div className="relative overflow-hidden border-b border-slate-100 bg-white px-6 py-5">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <CalendarDays size={22} />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#071E3D]">
                      {isEditMode ? "Edit Jadwal Uji" : "Buat Jadwal Baru"}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                      Pengaturan jadwal asesmen dan relasi skema.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
              <form
                id="jadwalForm"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* 1. INFO UMUM */}
                <FormGroup
                  icon={<ClipboardList size={16} />}
                  title="Informasi Kegiatan"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <label className={labelClass}>
                        Nama Kegiatan <span className="text-red-500">*</span>
                      </label>
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
                <FormGroup
                  icon={<MapPin size={16} />}
                  title="Pemilihan Skema & TUK"
                >
                  <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-slate-100 bg-slate-50/70 p-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Pilih Skema Sertifikasi{" "}
                        <span className="text-red-500">*</span>
                      </label>

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
                      <label className={labelClass}>
                        Pilih TUK <span className="text-red-500">*</span>
                      </label>

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
                              {namaTuk}{" "}
                              {t.jenis_tuk ? `(${t.jenis_tuk})` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </FormGroup>

                {/* 3. WAKTU */}
                <FormGroup
                  icon={<Calendar size={16} />}
                  title="Waktu Pelaksanaan"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelClass}>
                        Tanggal Pra-Asesmen
                      </label>
                      <input
                        type="date"
                        name="tgl_pra_asesmen"
                        value={formData.tgl_pra_asesmen}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tanggal Awal Uji</label>
                      <input
                        type="date"
                        name="tgl_awal"
                        value={formData.tgl_awal}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tanggal Akhir Uji</label>
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
                <FormGroup icon={<Layers size={16} />} title="Periode & Kuota">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          <option key={b} value={b}>
                            {b}
                          </option>
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
                        placeholder="Cth: 1"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Maksimal Kuota</label>
                      <input
                        type="number"
                        name="kuota"
                        value={formData.kuota}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Cth: 20"
                      />
                    </div>
                  </div>
                </FormGroup>

                {/* 5. STATUS & MODE */}
                <FormGroup
                  icon={<LinkIcon size={16} />}
                  title="Pengaturan Status"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        <option value="draft">Draft (Disembunyikan)</option>
                        <option value="open">Open (Bisa Mendaftar)</option>
                        <option value="ongoing">
                          Ongoing (Sedang Berjalan)
                        </option>
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
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
              >
                Batal
              </button>

              <button
                type="submit"
                form="jadwalForm"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Save size={16} />
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${className}`}
    >
      {children}
    </th>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate font-black text-[#071E3D]">{value}</p>
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

function StatusBadge({ status }) {
  const normalizedStatus = status || "draft";

  const styles = {
    open: "bg-green-50 text-green-600 border-green-100",
    ongoing: "bg-blue-50 text-blue-600 border-blue-100",
    selesai: "bg-slate-50 text-slate-600 border-slate-100",
    arsip: "bg-slate-100 text-slate-500 border-slate-200",
    draft: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        styles[normalizedStatus] || styles.draft
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

function SmallLine({ icon, text, orange = false }) {
  return (
    <div className="flex items-start gap-2 text-xs font-semibold text-slate-500">
      <span className={`mt-0.5 shrink-0 ${orange ? "text-orange-500" : "text-[#071E3D]"}`}>
        {icon}
      </span>

      <span className="line-clamp-2">{text || "-"}</span>
    </div>
  );
}

function FormGroup({ icon, title, children }) {
  return (
    <section className="rounded-[30px] border border-slate-100 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>

        <h4 className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
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