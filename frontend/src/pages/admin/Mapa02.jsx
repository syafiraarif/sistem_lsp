// frontend/src/pages/admin/Mapa02.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckSquare,
  Square,
  List,
  Briefcase,
  BookOpen,
  Sparkles,
  ClipboardList,
  Layers,
  RefreshCcw,
} from "lucide-react";

const METODE_OPTIONS = [
  { id: "IA01", name: "IA01 - Observasi Langsung" },
  { id: "IA02", name: "IA02 - Tugas Praktik Demonstrasi" },
  { id: "IA03", name: "IA03 - Pertanyaan Lisan" },
  { id: "IA04A", name: "IA04A - Pertanyaan Tertulis (PG)" },
  { id: "IA04B", name: "IA04B - Pertanyaan Tertulis (Esai)" },
  { id: "IA05", name: "IA05 - Pertanyaan Wawancara" },
  { id: "IA06", name: "IA06 - Wawancara Berbasis Portofolio" },
  { id: "IA07", name: "IA07 - Wawancara Berbasis Jurnal" },
  { id: "IA09", name: "IA09 - Cek Portofolio" },
];

const Mapa02 = () => {
  const { id } = useParams(); // Ingat: di route ini "id" adalah id_skema!
  const navigate = useNavigate();

  // --- STATE UTAMA ---
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState(null); // Info MAPA & Skema
  const [listMapping, setListMapping] = useState([]);

  // State Data Dropdown
  const [listKelompokPekerjaan, setListKelompokPekerjaan] = useState([]);
  const [listUnitKompetensi, setListUnitKompetensi] = useState([]);

  // State Modal Mapping
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id_unit: "",
    id_kelompok: "",
  });

  // State Modal Metode
  const [showMetodeModal, setShowMetodeModal] = useState(false);
  const [activeMappingId, setActiveMappingId] = useState(null);
  const [activeMetodes, setActiveMetodes] = useState([]);

  // --- FUNGSI FETCH DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const idSkema = parseInt(id); // Langsung pakai ID dari URL
      let idMapa = null;

      // 1. Cari Master MAPA-02 berdasarkan id_skema
      try {
        const resMapa = await api.get(`/admin/mapa`);
        const allMapa = resMapa.data?.data || resMapa.data || [];

        // Temukan record MAPA-02 milik skema ini
        const currentMapa = allMapa.find(
          (m) => m.id_skema === idSkema && m.jenis === "MAPA-02"
        );

        if (currentMapa) {
          idMapa = currentMapa.id_mapa;
          setMasterData(currentMapa);
        } else {
          Swal.fire(
            "Info",
            "Dokumen Master MAPA-02 untuk skema ini belum ada. Anda mungkin harus membuatnya terlebih dahulu di menu MAPA.",
            "info"
          );
        }
      } catch (e) {
        console.error("Gagal load info MAPA:", e);
      }

      // 2. Ambil Daftar Mapping MAPA-02
      if (idMapa) {
        try {
          const resMapping = await api.get(`/admin/mapa02/mapping/${idMapa}`);
          let mappingData = resMapping.data?.data || resMapping.data || [];
          if (!Array.isArray(mappingData) && mappingData.rows)
            mappingData = mappingData.rows;
          setListMapping(Array.isArray(mappingData) ? mappingData : []);
        } catch (e) {
          console.error("Gagal memuat mapping MAPA-02:", e);
        }
      } else {
        setListMapping([]);
      }

      // 3. Ambil Dropdown Kelompok Pekerjaan (Pasti jalan karena idSkema sudah valid)
      try {
        const resPekerjaan = await api.get(
          `/admin/kelompok-pekerjaan/skema/${idSkema}`
        );
        let pekerjaandata = resPekerjaan.data?.data || resPekerjaan.data || [];
        if (!Array.isArray(pekerjaandata) && pekerjaandata.rows)
          pekerjaandata = pekerjaandata.rows;

        setListKelompokPekerjaan(
          Array.isArray(pekerjaandata) ? pekerjaandata : []
        );
      } catch (e) {
        console.error("Gagal load kelompok pekerjaan:", e);
        setListKelompokPekerjaan([]);
      }

      // 4. Ambil Dropdown Unit Kompetensi
      try {
        const resUnit = await api.get("/admin/unit-kompetensi");
        let unitData = resUnit.data?.data || resUnit.data || [];
        if (!Array.isArray(unitData) && unitData.rows) unitData = unitData.rows;
        setListUnitKompetensi(Array.isArray(unitData) ? unitData : []);
      } catch (e) {
        console.error("Gagal load unit kompetensi:", e);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Terjadi kesalahan saat memuat data MAPA-02", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  // --- HANDLER MAPPING (UNIT & PEKERJAAN) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitMapping = async (e) => {
    e.preventDefault();
    if (!formData.id_unit || !formData.id_kelompok) {
      return Swal.fire(
        "Peringatan",
        "Silakan pilih Unit dan Pekerjaan",
        "warning"
      );
    }

    // Perbaikan: gunakan id_mapa asli yang di-fetch dari masterData, BUKAN id dari url
    if (!masterData || !masterData.id_mapa) {
      return Swal.fire(
        "Gagal",
        "Master MAPA-02 tidak ditemukan. Pastikan Anda sudah membuat dokumen MAPA-02 untuk skema ini di menu MAPA utama.",
        "error"
      );
    }

    setSubmitting(true);
    try {
      await api.post("/admin/mapa02/mapping", {
        id_mapa: parseInt(masterData.id_mapa),
        id_unit: parseInt(formData.id_unit),
        id_kelompok: parseInt(formData.id_kelompok),
      });
      Swal.fire("Berhasil", "Mapping berhasil ditambahkan", "success");
      setShowModal(false);
      setFormData({ id_unit: "", id_kelompok: "" });
      fetchAllData();
    } catch (error) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Gagal menyimpan mapping",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMapping = async (id_mapping) => {
    const confirm = await Swal.fire({
      title: "Hapus Mapping?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/mapa02/mapping/${id_mapping}`);
        Swal.fire("Terhapus!", "Mapping berhasil dihapus.", "success");
        fetchAllData();
      } catch (error) {
        Swal.fire(
          "Gagal!",
          error.response?.data?.message || "Gagal menghapus data",
          "error"
        );
      }
    }
  };

  // --- HANDLER METODE (IA01, IA02, dll) ---
  const handleOpenMetode = async (id_mapping) => {
    setActiveMappingId(id_mapping);
    setShowMetodeModal(true);

    try {
      const res = await api.get(`/admin/mapa02/metode/${id_mapping}`);
      const metodes = res.data?.data || res.data || [];
      setActiveMetodes(metodes.map((m) => m.metode));
    } catch (error) {
      console.error("Gagal memuat metode:", error);
      setActiveMetodes([]);
    }
  };

  const toggleMetode = async (metodeCode) => {
    const isCurrentlyActive = activeMetodes.includes(metodeCode);

    try {
      if (isCurrentlyActive) {
        Swal.fire(
          "Info",
          "Fitur hapus metode spesifik memerlukan penyesuaian API DELETE backend",
          "info"
        );
      } else {
        await api.post("/admin/mapa02/metode", {
          id_mapping: activeMappingId,
          metode: metodeCode,
          digunakan: true,
        });

        setActiveMetodes((prev) => [...prev, metodeCode]);
      }
    } catch (error) {
      console.error("Gagal toggle metode", error);
      Swal.fire("Error", "Gagal memperbarui metode", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="rounded-[32px] border border-slate-100 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-orange-500" size={42} />
          <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
            Memuat MAPA-02
          </p>
        </div>
      </div>
    );
  }

  const skemaTitle =
    masterData?.skema?.judul_skema ||
    masterData?.Skema?.judul_skema ||
    "Info Skema Belum Diload";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#071E3D] hover:text-white"
              >
                <ArrowLeft size={14} />
                Kembali
              </button>

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <List size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  MAPA-02
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Mapping Unit
                <br />
                <span className="text-orange-500">& Metode Asesmen</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Tentukan kelompok pekerjaan dan metode uji untuk setiap unit
                kompetensi pada dokumen MAPA-02.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Mapping
                </button>

                <button
                  type="button"
                  onClick={fetchAllData}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <RefreshCcw size={17} />
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
                  Skema Sertifikasi
                </p>

                <h2 className="mb-4 text-2xl font-black leading-snug">
                  {skemaTitle}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Mapping MAPA-02 memastikan setiap unit kompetensi terhubung
                  dengan pekerjaan dan metode asesmen yang tepat.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Mapping" value={`${listMapping.length}`} />
                  <HeroPill
                    label="Metode IA"
                    value={`${METODE_OPTIONS.length}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Layers size={22} />}
            label="Total Mapping"
            value={`${listMapping.length} Mapping`}
          />
          <MiniStat
            icon={<Briefcase size={22} />}
            label="Kelompok Pekerjaan"
            value={`${listKelompokPekerjaan.length} Data`}
          />
          <MiniStat
            icon={<BookOpen size={22} />}
            label="Unit Kompetensi"
            value={`${listUnitKompetensi.length} Unit`}
          />
        </section>

        {/* CONTENT SECTION */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <ClipboardList size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Mapping Unit
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Mapping Unit & Metode Asesmen
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Tentukan kelompok pekerjaan dan metode uji untuk tiap unit
                kompetensi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Tambah Mapping
            </button>
          </div>

          {listMapping.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <List size={34} />
              </div>
              <p className="text-lg font-black text-[#071E3D]">
                Belum Ada Mapping
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Tambahkan mapping unit kompetensi untuk mulai mengatur MAPA-02.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#071E3D]">
                    <TableHead center>No</TableHead>
                    <TableHead>Unit Kompetensi</TableHead>
                    <TableHead>Kelompok Pekerjaan</TableHead>
                    <TableHead center>Pengaturan Metode</TableHead>
                    <TableHead center>Aksi</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {listMapping.map((item, index) => {
                    // PERBAIKAN ALIAS (Mencegah tampilan minus/strip)
                    const unitObj =
                      item.UnitKompetensi ||
                      item.unit_kompetensi ||
                      item.unit ||
                      item.Unit ||
                      {};
                    const unitName =
                      unitObj.judul_unit || unitObj.nama_unit || "-";
                    const unitCode = unitObj.kode_unit || "";

                    const pekerjaObj =
                      item.KelompokPekerjaan ||
                      item.kelompok_pekerjaan ||
                      item.kelompok ||
                      item.pekerjaan ||
                      item.Pekerjaan ||
                      {};
                    const pekerjaanName =
                      pekerjaObj.nama_kelompok ||
                      pekerjaObj.nama_pekerjaan ||
                      "-";

                    return (
                      <tr
                        key={item.id_mapping}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="mb-1 text-xs font-black uppercase tracking-widest text-orange-500">
                            {unitCode || "Unit"}
                          </div>
                          <div className="line-clamp-2 text-sm font-black text-[#071E3D]">
                            {unitName}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                            <Briefcase size={13} />
                            {pekerjaanName}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenMetode(item.id_mapping)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                          >
                            <Settings size={14} />
                            Atur Metode
                          </button>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteMapping(item.id_mapping)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus Mapping"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* --- MODAL TAMBAH MAPPING --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Plus size={20} className="text-orange-500" />
                  Tambah Mapping Unit
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Pilih unit kompetensi dan kelompok pekerjaan.
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

            <form onSubmit={handleSubmitMapping} className="space-y-5 p-6">
              <div>
                <Label required icon={<BookOpen size={14} />}>
                  Pilih Unit Kompetensi
                </Label>
                <select
                  name="id_unit"
                  value={formData.id_unit}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  required
                >
                  <option value="">-- Pilih Unit Kompetensi --</option>
                  {listUnitKompetensi.map((item, index) => {
                    const idUnit = item.id_unit || item.id;
                    const judulUnit =
                      item.judul_unit || item.nama_unit || "Tanpa Judul";
                    const kodeUnit = item.kode_unit
                      ? `[${item.kode_unit}] `
                      : "";
                    if (!idUnit) return null;
                    return (
                      <option key={index} value={idUnit}>
                        {kodeUnit}
                        {judulUnit}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <Label required icon={<Briefcase size={14} />}>
                  Pilih Kelompok Pekerjaan
                </Label>
                <select
                  name="id_kelompok"
                  value={formData.id_kelompok}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  required
                >
                  <option value="">-- Pilih Pekerjaan / Kelompok --</option>
                  {listKelompokPekerjaan.map((item, index) => {
                    const idKelompok = item.id_kelompok || item.id;
                    const namaKelompok =
                      item.nama_kelompok ||
                      item.nama_pekerjaan ||
                      item.pekerjaan ||
                      "Tanpa Nama";

                    if (!idKelompok) return null;
                    return (
                      <option key={index} value={idKelompok}>
                        {namaKelompok}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Simpan Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PENGATURAN METODE --- */}
      {showMetodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Settings size={20} className="text-orange-500" />
                  Atur Metode Asesmen
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Pilih metode ujian yang akan digunakan untuk unit ini.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMetodeModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {METODE_OPTIONS.map((opt) => {
                  const isActive = activeMetodes.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleMetode(opt.id)}
                      className={`flex cursor-pointer select-none items-start gap-3 rounded-2xl border-2 p-4 transition-all ${
                        isActive
                          ? "border-orange-400 bg-orange-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-orange-200"
                      }`}
                    >
                      <div
                        className={`mt-0.5 ${
                          isActive ? "text-orange-500" : "text-slate-300"
                        }`}
                      >
                        {isActive ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </div>

                      <span
                        className={`text-sm font-black leading-tight ${
                          isActive ? "text-[#071E3D]" : "text-slate-600"
                        }`}
                      >
                        {opt.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-100 bg-white p-6">
              <button
                type="button"
                onClick={() => setShowMetodeModal(false)}
                className="rounded-2xl bg-orange-500 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                Selesai & Tutup
              </button>
            </div>
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

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
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

function Label({ children, required, icon }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
      {icon}
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export default Mapa02;