import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  BookOpen,
  Search,
  Loader2,
  Layers,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ListChecks,
  BadgeCheck,
  RefreshCcw,
  Info,
  Sparkles,
  Briefcase,
} from "lucide-react";

const UnitKompetensi = () => {
  const [skemaList, setSkemaList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [skkniList, setSkkniList] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  
  const [selectedSkemaId, setSelectedSkemaId] = useState("");
  const [expandedUnits, setExpandedUnits] = useState({});
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [showKelompokModal, setShowKelompokModal] = useState(false);
  const [isEditingKelompok, setIsEditingKelompok] = useState(false);
  const [editKelompokId, setEditKelompokId] = useState(null);
  const [formKelompok, setFormKelompok] = useState({ nama_kelompok: "", deskripsi: "", urutan: "" });

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editUnitId, setEditUnitId] = useState(null);
  const [activeKelompok, setActiveKelompok] = useState(null);
  const [formUnit, setFormUnit] = useState({ id_kelompok: "", id_skkni: "", kode_unit: "", judul_unit: "", urutan: "" });

  const [showElemenModal, setShowElemenModal] = useState(false);
  const [isEditingElemen, setIsEditingElemen] = useState(false);
  const [editElemenId, setEditElemenId] = useState(null);
  const [formElemen, setFormElemen] = useState({ id_unit: "", nama_elemen: "", urutan: "" });

  const [showKukModal, setShowKukModal] = useState(false);
  const [isEditingKuk, setIsEditingKuk] = useState(false);
  const [editKukId, setEditKukId] = useState(null);
  const [formKuk, setFormKuk] = useState({ id_elemen: "", kuk: "", urutan: "" });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSkemaId) {
      fetchKelompokBySkema(selectedSkemaId);
    } else {
      setKelompokList([]);
    }
    setExpandedUnits({});
    setSelectedUnitId(null);
  }, [selectedSkemaId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSkema(), fetchUnits(), fetchSkkni()]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUnits(), fetchKelompokBySkema(selectedSkemaId)]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkema = async () => {
    try {
      const res = await api.get("/admin/skema");
      setSkemaList(res.data?.data || []);
    } catch (error) {
      notifikasi.gagal("Gagal memuat data skema");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get("/admin/unit-kompetensi");
      setUnitList(res.data?.data || []);
    } catch (error) {
      notifikasi.gagal("Gagal memuat data unit kompetensi");
    }
  };

  const fetchSkkni = async () => {
    try {
      const res = await api.get("/admin/skkni");
      setSkkniList(res.data?.data || []);
    } catch (error) {
      notifikasi.gagal("Gagal memuat data SKKNI");
    }
  };

  const fetchKelompokBySkema = async (idSkema) => {
    if (!idSkema) {
      setKelompokList([]);
      return;
    }
    try {
      const res = await api.get(`/admin/kelompok-pekerjaan/skema/${idSkema}`);
      setKelompokList(res.data?.data || []);
    } catch (error) {
      setKelompokList([]);
    }
  };

  // --- HELPERS ---
  const getSelectedSkema = () => skemaList.find((s) => Number(s.id_skema) === Number(selectedSkemaId));
  const getSkemaTitle = (s) => s?.judul_skema || s?.nama_skema || "Skema Sertifikasi";
  const getSkemaCode = (s) => s?.kode_skema || s?.nomor_skema || "-";
  
  const getUnitId = (u) => u.id_unit || u.id_unit_kompetensi || u.id;
  const getUnitKode = (u) => u.kode_unit || u.kode || "-";
  const getUnitJudul = (u) => u.judul_unit || u.nama_unit || "-";
  const getUnitSkkniId = (u) => u.id_skkni || u.skkni?.id_skkni || "";
  const getUnitSkkniTitle = (u) => u.skkni?.judul_skkni || u.skkni?.no_skkni || "Tidak ada rujukan";
  const getUnitKelompokId = (u) => u.skemaList?.find(s => String(s.id_skema) === String(selectedSkemaId))?.id_kelompok || u.id_kelompok || "";
  const getUnitUrutan = (u) => u.skemaList?.find(s => String(s.id_skema) === String(selectedSkemaId))?.urutan || u.urutan || "";

  const getElemenList = (u) => u.elemen || u.unit_elemen || [];
  const getElemenId = (e) => e.id_elemen || e.id;
  const getElemenText = (e) => e.elemen_kompetensi || e.nama_elemen || "-";

  const getKukList = (e) => e.kuk || e.unit_kuk || [];
  const getKukText = (k) => k.kriteria_unjuk_kerja || k.kuk || "-";

  const getUnitsByKelompok = (idKelompok) => {
    const keyword = searchTerm.trim().toLowerCase();
    let data = unitList.filter((unit) => {
      const isSkemaMatch = (unit.skemaList || []).some(s => String(s.id_skema) === String(selectedSkemaId));
      const isKelompokMatch = String(getUnitKelompokId(unit)) === String(idKelompok);
      return isSkemaMatch && isKelompokMatch;
    });

    if (keyword) {
      data = data.filter(u => getUnitKode(u).toLowerCase().includes(keyword) || getUnitJudul(u).toLowerCase().includes(keyword));
    }

    return data.sort((a, b) => Number(getUnitUrutan(a) || 9999) - Number(getUnitUrutan(b) || 9999));
  };

  const displayedKelompokList = useMemo(() => {
    const sorted = [...kelompokList].sort((a, b) => Number(a.urutan || 9999) - Number(b.urutan || 9999));
    if (!searchTerm.trim()) return sorted;
    return sorted.filter((k) => k.nama_kelompok?.toLowerCase().includes(searchTerm.toLowerCase()) || getUnitsByKelompok(k.id_kelompok).length > 0);
  }, [kelompokList, unitList, selectedSkemaId, searchTerm]);

  // Kalkulasi statistik untuk hero section
  const filteredUnitCount = displayedKelompokList.reduce((acc, k) => acc + getUnitsByKelompok(k.id_kelompok).length, 0);
  const totalElemen = displayedKelompokList.reduce((acc, k) => acc + getUnitsByKelompok(k.id_kelompok).reduce((s, u) => s + getElemenList(u).length, 0), 0);
  const totalKuk = displayedKelompokList.reduce((acc, k) => acc + getUnitsByKelompok(k.id_kelompok).reduce((s, u) => s + getElemenList(u).reduce((ss, e) => ss + getKukList(e).length, 0), 0), 0);

  const toggleUnit = (unit) => {
    const idUnit = getUnitId(unit);
    setExpandedUnits((prev) => ({ ...prev, [idUnit]: !prev[idUnit] }));
    setSelectedUnitId(idUnit);
  };

  const handleKelompokInputChange = (e) => setFormKelompok((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUnitInputChange = (e) => setFormUnit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleInputElemenChange = (e) => setFormElemen((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleInputKukChange = (e) => setFormKuk((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // --- MODALS FUNCTIONS ---
  const closeKelompokModal = () => setShowKelompokModal(false);
  const closeUnitModal = () => setShowUnitModal(false);

  // --- KELOMPOK ---
  const openKelompokModal = () => {
    if (!selectedSkemaId) return notifikasi.peringatan("Silakan pilih skema terlebih dahulu.");
    setIsEditingKelompok(false);
    setFormKelompok({ nama_kelompok: "", deskripsi: "", urutan: kelompokList.length + 1 });
    setShowKelompokModal(true);
  };
  const openEditKelompokModal = (kelompok) => {
    setIsEditingKelompok(true);
    setEditKelompokId(kelompok.id_kelompok);
    setFormKelompok({ nama_kelompok: kelompok.nama_kelompok || "", deskripsi: kelompok.deskripsi || "", urutan: kelompok.urutan || "" });
    setShowKelompokModal(true);
  };
  const handleSaveKelompok = async (e) => {
    e.preventDefault();
    if (!formKelompok.nama_kelompok.trim()) return notifikasi.peringatan("Nama kelompok wajib diisi");
    setLoading(true);
    try {
      const payload = { id_skema: selectedSkemaId, ...formKelompok, urutan: formKelompok.urutan || kelompokList.length + 1 };
      if (isEditingKelompok) await api.put(`/admin/kelompok-pekerjaan/${editKelompokId}`, payload);
      else await api.post("/admin/kelompok-pekerjaan", payload);
      await notifikasi.sukses(isEditingKelompok ? "Diperbarui" : "Ditambahkan");
      setShowKelompokModal(false);
      await fetchKelompokBySkema(selectedSkemaId);
    } catch (error) {
      notifikasi.gagal("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteKelompok = async (kelompok) => {
    if (getUnitsByKelompok(kelompok.id_kelompok).length > 0) return notifikasi.peringatan("Hapus/pindahkan unit di dalam kelompok ini terlebih dahulu.");
    const confirmed = await notifikasi.konfirmasi("Hapus kelompok pekerjaan ini?");
    if (!confirmed.isConfirmed) return;
    setLoading(true);
    try {
      await api.delete(`/admin/kelompok-pekerjaan/${kelompok.id_kelompok}`);
      notifikasi.sukses("Terhapus");
      fetchKelompokBySkema(selectedSkemaId);
    } catch (error) {
      notifikasi.gagal("Gagal menghapus");
    } finally {
      setLoading(false);
    }
  };

  // --- UNIT ---
  const openAddUnitModal = (kelompok) => {
    setActiveKelompok(kelompok);
    setIsEditingUnit(false);
    setFormUnit({ id_kelompok: kelompok.id_kelompok, id_skkni: "", kode_unit: "", judul_unit: "", urutan: getUnitsByKelompok(kelompok.id_kelompok).length + 1 });
    setShowUnitModal(true);
  };
  const openEditUnitModal = (kelompok, unit) => {
    setActiveKelompok(kelompok);
    setIsEditingUnit(true);
    setEditUnitId(getUnitId(unit));
    setFormUnit({ id_kelompok: getUnitKelompokId(unit) || kelompok.id_kelompok, id_skkni: getUnitSkkniId(unit), kode_unit: unit.kode_unit || "", judul_unit: unit.judul_unit || "", urutan: getUnitUrutan(unit) || "" });
    setShowUnitModal(true);
  };
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!formUnit.id_skkni) return notifikasi.peringatan("Pilih Standar/SKKNI");
    if (!formUnit.kode_unit || !formUnit.judul_unit) return notifikasi.peringatan("Lengkapi kode & judul");
    
    setLoading(true);
    try {
      const payload = { id_skema: selectedSkemaId, ...formUnit, judul_unit: formUnit.judul_unit.trim(), kode_unit: formUnit.kode_unit.trim() };
      if (isEditingUnit) await api.put(`/admin/unit-kompetensi/${editUnitId}`, payload);
      else await api.post("/admin/unit-kompetensi", payload);
      await notifikasi.sukses("Berhasil");
      setShowUnitModal(false);
      await fetchUnits();
    } catch (error) {
      notifikasi.gagal(error.response?.data?.message || "Gagal");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteUnit = async (unit) => {
    const confirmed = await notifikasi.konfirmasi("Hapus Unit ini beserta Elemen & KUK di dalamnya?");
    if (!confirmed.isConfirmed) return;
    try {
      await api.delete(`/admin/unit-kompetensi/${getUnitId(unit)}`);
      notifikasi.sukses("Terhapus");
      fetchUnits();
    } catch (error) {
      notifikasi.gagal("Gagal");
    }
  };

  // --- ELEMEN ---
  const handleAddElemen = (unit) => {
    setFormElemen({ id_unit: getUnitId(unit), nama_elemen: "", urutan: getElemenList(unit).length + 1 });
    setIsEditingElemen(false);
    setShowElemenModal(true);
  };
  const handleEditElemen = (unit, elemen) => {
    setFormElemen({ id_unit: getUnitId(unit), nama_elemen: getElemenText(elemen), urutan: elemen.urutan || "" });
    setIsEditingElemen(true);
    setEditElemenId(getElemenId(elemen));
    setShowElemenModal(true);
  };
  const handleSaveElemen = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingElemen) await api.put(`/admin/unit-elemen/${editElemenId}`, formElemen);
      else await api.post("/admin/unit-elemen", formElemen);
      notifikasi.sukses("Berhasil");
      setShowElemenModal(false);
      fetchUnits();
    } catch (error) {
      notifikasi.gagal("Gagal");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteElemen = async (elemen) => {
    const confirmed = await notifikasi.konfirmasi("Hapus Elemen?");
    if (!confirmed.isConfirmed) return;
    try {
      await api.delete(`/admin/unit-elemen/${getElemenId(elemen)}`);
      notifikasi.sukses("Terhapus");
      fetchUnits();
    } catch (error) {
      notifikasi.gagal("Gagal");
    }
  };

  // --- KUK ---
  const handleAddKuk = (elemen) => {
    setFormKuk({ id_elemen: getElemenId(elemen), kuk: "", urutan: getKukList(elemen).length + 1 });
    setIsEditingKuk(false);
    setShowKukModal(true);
  };
  const handleEditKuk = (elemen, kuk) => {
    setFormKuk({ id_elemen: getElemenId(elemen), kuk: getKukText(kuk), urutan: kuk.urutan || "" });
    setIsEditingKuk(true);
    setEditKukId(kuk.id_kuk || kuk.id);
    setShowKukModal(true);
  };
  const handleSaveKuk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingKuk) await api.put(`/admin/unit-kuk/${editKukId}`, formKuk);
      else await api.post("/admin/unit-kuk", formKuk);
      notifikasi.sukses("Berhasil");
      setShowKukModal(false);
      fetchUnits();
    } catch (error) {
      notifikasi.gagal("Gagal");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteKuk = async (kuk) => {
    const confirmed = await notifikasi.konfirmasi("Hapus KUK?");
    if (!confirmed.isConfirmed) return;
    try {
      await api.delete(`/admin/unit-kuk/${kuk.id_kuk || kuk.id}`);
      notifikasi.sukses("Terhapus");
      fetchUnits();
    } catch (error) {
      notifikasi.gagal("Gagal");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* HEADER HERO */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                Unit Kompetensi per Kelompok
              </h2>
              <p className="m-0 max-w-2xl text-[14px] font-medium text-[#182D4A]/70">
                Kelola Kelompok Pekerjaan, Unit Kompetensi, Elemen, hingga Kriteria Unjuk Kerja (KUK) untuk setiap skema.
              </p>
            </div>
          </div>
        </div>

        {/* --- DATA DINAMIS (STATISTIK) DIBUAT 1 BARIS --- */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Kelompok" value={kelompokList.length} icon={<Briefcase size={20} />} />
          <StatCard label="Unit" value={filteredUnitCount} icon={<BookOpen size={20} />} />
          <StatCard label="Elemen" value={totalElemen} icon={<Layers size={20} />} />
          <StatCard label="KUK" value={totalKuk} icon={<ListChecks size={20} />} />
        </div>

        {/* --- BAGIAN FILTER & INFO SKEMA --- */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider">
                Pilih Skema Terlebih Dahulu
              </label>
              <select
                value={selectedSkemaId}
                onChange={(e) => setSelectedSkemaId(e.target.value)}
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
              >
                <option value="">-- Silakan Pilih Skema Sertifikasi --</option>
                {skemaList.map((skema) => (
                  <option key={skema.id_skema} value={skema.id_skema}>
                    {getSkemaCode(skema)} - {getSkemaTitle(skema)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider">
                Cari Unit / Kelompok
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50" />
                <input
                  type="text"
                  placeholder="Ketik kata kunci..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedSkemaId}
                  className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={refreshCurrentData}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] transition-colors hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCcw size={16} />
              </button>
              <button
                type="button"
                onClick={openKelompokModal}
                className="flex h-10 items-center gap-2 rounded-lg bg-[#CC6B27] px-4 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f]"
              >
                <Plus size={16} />
                Kelompok
              </button>
            </div>
          </div>
          
          {/* Info Skema Aktif */}
          {selectedSkemaId ? (
            <div className="mt-2 flex flex-col md:flex-row gap-4 rounded-xl border border-[#CC6B27]/20 bg-orange-50/50 p-4">
              <div className="flex-1 border-b md:border-b-0 md:border-r border-[#CC6B27]/20 pb-3 md:pb-0 md:pr-4">
                <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mb-1">Skema Aktif</p>
                <p className="text-[13px] font-bold text-[#071E3D]">{getSkemaCode(getSelectedSkema())} - {getSkemaTitle(getSelectedSkema())}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mb-1">Status</p>
                <p className="text-[13px] font-bold text-[#071E3D]">{kelompokList.length} Kelompok Pekerjaan Ditemukan</p>
              </div>
            </div>
          ) : (
            <div className="mt-2 rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-5 text-center text-[13px] font-medium text-[#182D4A]/50">
              Data akan muncul setelah Anda memilih skema.
            </div>
          )}
        </div>

        {/* DAFTAR KELOMPOK & UNIT */}
        <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#071E3D]/10 p-6 sm:flex-row sm:items-center sm:justify-between bg-[#FAFAFA]/50">
            <div>
              <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                <ClipboardList size={18} className="text-[#CC6B27]" />
                Hierarki Kompetensi
              </h4>
            </div>
          </div>

          <div className="p-6 bg-[#FAFAFA]">
            {!selectedSkemaId ? (
              <div className="py-16 text-center">
                <BookOpen size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                <h3 className="text-[16px] font-bold text-[#071E3D]">Pilih Skema Dahulu</h3>
                <p className="mt-1 text-[13px] font-medium text-[#182D4A]/60">Pilih skema pada filter di atas untuk mengelola unit.</p>
              </div>
            ) : loading ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                <p className="text-[13px] font-bold text-[#071E3D]">Memuat data...</p>
              </div>
            ) : displayedKelompokList.length > 0 ? (
              <div className="space-y-6">
                {displayedKelompokList.map((kelompok) => (
                  <KelompokCard
                    key={kelompok.id_kelompok}
                    kelompok={kelompok}
                    units={getUnitsByKelompok(kelompok.id_kelompok)}
                    expandedUnits={expandedUnits}
                    selectedUnitId={selectedUnitId}
                    toggleUnit={toggleUnit}
                    openAddUnitModal={openAddUnitModal}
                    openEditUnitModal={openEditUnitModal}
                    openEditKelompokModal={openEditKelompokModal}
                    handleDeleteKelompok={handleDeleteKelompok}
                    handleDeleteUnit={handleDeleteUnit}
                    handleAddElemen={handleAddElemen}
                    getUnitId={getUnitId}
                    getUnitKode={getUnitKode}
                    getUnitJudul={getUnitJudul}
                    getUnitUrutan={getUnitUrutan}
                    getUnitSkkniTitle={getUnitSkkniTitle}
                    getElemenList={getElemenList}
                    getElemenId={getElemenId}
                    getElemenText={getElemenText}
                    getKukList={getKukList}
                    getKukText={getKukText}
                    handleEditElemen={handleEditElemen}
                    handleDeleteElemen={handleDeleteElemen}
                    handleAddKuk={handleAddKuk}
                    handleEditKuk={handleEditKuk}
                    handleDeleteKuk={handleDeleteKuk}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Briefcase size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                <h3 className="text-[16px] font-bold text-[#071E3D]">Belum Ada Kelompok Pekerjaan</h3>
                <button
                  type="button"
                  onClick={openKelompokModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#a8561f]"
                >
                  <Plus size={16} /> Tambah Kelompok
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}
      {showKelompokModal && (
        <ModalWrapper onClose={closeKelompokModal}>
          <ModalHeader title={isEditingKelompok ? "Edit Kelompok" : "Tambah Kelompok"} icon={<Briefcase size={20} />} onClose={closeKelompokModal} />
          <form onSubmit={handleSaveKelompok} className="p-6 flex flex-col gap-5">
            <FormInput label="Nama Kelompok Pekerjaan" name="nama_kelompok" value={formKelompok.nama_kelompok} onChange={handleKelompokInputChange} required />
            <FormTextarea label="Deskripsi" name="deskripsi" value={formKelompok.deskripsi} onChange={handleKelompokInputChange} />
            <FormInput label="Urutan" name="urutan" type="number" value={formKelompok.urutan} onChange={handleKelompokInputChange} />
            <ModalFooter loading={loading} onCancel={closeKelompokModal} submitText="Simpan Kelompok" />
          </form>
        </ModalWrapper>
      )}

      {showUnitModal && (
        <ModalWrapper onClose={closeUnitModal}>
          <ModalHeader title={isEditingUnit ? "Edit Unit" : "Tambah Unit Kompetensi"} icon={<BookOpen size={20} />} onClose={closeUnitModal} />
          <form onSubmit={handleSaveUnit} className="p-6 flex flex-col gap-5">
            <div className="rounded-lg border border-[#CC6B27]/20 bg-orange-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">Kelompok Pekerjaan</p>
              <p className="text-[13px] font-bold text-[#071E3D]">{activeKelompok?.nama_kelompok || "-"}</p>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider">Standar Rujukan / SKKNI <span className="text-red-500">*</span></label>
              <select name="id_skkni" value={formUnit.id_skkni} onChange={handleUnitInputChange} required className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10">
                <option value="">-- Pilih SKKNI --</option>
                {skkniList.map((sk) => <option key={sk.id_skkni} value={sk.id_skkni}>{sk.judul_skkni} ({sk.no_skkni})</option>)}
              </select>
            </div>
            <FormInput label="Judul Unit" name="judul_unit" value={formUnit.judul_unit} onChange={handleUnitInputChange} required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Kode Unit" name="kode_unit" value={formUnit.kode_unit} onChange={handleUnitInputChange} required />
              <FormInput label="Urutan" name="urutan" type="number" value={formUnit.urutan} onChange={handleUnitInputChange} />
            </div>
            <ModalFooter loading={loading} onCancel={closeUnitModal} submitText="Simpan Unit" />
          </form>
        </ModalWrapper>
      )}

      {showElemenModal && (
        <ModalWrapper onClose={() => setShowElemenModal(false)}>
          <ModalHeader title={isEditingElemen ? "Edit Elemen" : "Tambah Elemen"} icon={<Layers size={20} />} onClose={() => setShowElemenModal(false)} />
          <form onSubmit={handleSaveElemen} className="p-6 flex flex-col gap-5">
            <FormInput label="Urutan" name="urutan" type="number" value={formElemen.urutan} onChange={handleInputElemenChange} required />
            <FormTextarea label="Nama Elemen" name="nama_elemen" value={formElemen.nama_elemen} onChange={handleInputElemenChange} required />
            <ModalFooter loading={loading} onCancel={() => setShowElemenModal(false)} submitText="Simpan Elemen" />
          </form>
        </ModalWrapper>
      )}

      {showKukModal && (
        <ModalWrapper onClose={() => setShowKukModal(false)}>
          <ModalHeader title={isEditingKuk ? "Edit KUK" : "Tambah KUK"} icon={<ListChecks size={20} />} onClose={() => setShowKukModal(false)} />
          <form onSubmit={handleSaveKuk} className="p-6 flex flex-col gap-5">
            <FormInput label="Urutan KUK" name="urutan" type="number" value={formKuk.urutan} onChange={handleInputKukChange} required />
            <FormTextarea label="Kriteria Unjuk Kerja" name="kuk" value={formKuk.kuk} onChange={handleInputKukChange} required />
            <ModalFooter loading={loading} onCancel={() => setShowKukModal(false)} submitText="Simpan KUK" />
          </form>
        </ModalWrapper>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const KelompokCard = ({
  kelompok,
  units,
  expandedUnits,
  selectedUnitId,
  toggleUnit,
  openAddUnitModal,
  openEditUnitModal,
  openEditKelompokModal,
  handleDeleteKelompok,
  handleDeleteUnit,
  handleAddElemen,
  getUnitId,
  getUnitKode,
  getUnitJudul,
  getUnitUrutan,
  getUnitSkkniTitle,
  getElemenList,
  getElemenId,
  getElemenText,
  getKukList,
  getKukText,
  handleEditElemen,
  handleDeleteElemen,
  handleAddKuk,
  handleEditKuk,
  handleDeleteKuk,
}) => {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-white overflow-hidden shadow-sm">
      {/* HEADER KELOMPOK */}
      <div className="border-b border-[#071E3D]/10 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC6B27] mb-1">
            Kelompok Pekerjaan
          </p>
          <h3 className="text-[16px] font-black text-[#071E3D]">
            {kelompok.urutan ? `${kelompok.urutan}. ` : ""}{kelompok.nama_kelompok}
          </h3>
          <p className="text-[12px] font-medium text-[#182D4A]/60 mt-0.5">
            {kelompok.deskripsi || "Tanpa deskripsi"} • {units.length} Unit Kompetensi
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => openAddUnitModal(kelompok)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#CC6B27] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#a8561f] transition-all">
            <Plus size={14} /> Tambah Unit
          </button>
          <button onClick={() => openEditKelompokModal(kelompok)} className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white flex items-center justify-center" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDeleteKelompok(kelompok)} className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white flex items-center justify-center" title="Hapus">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 bg-[#FAFAFA]/50 space-y-4">
        {units.length > 0 ? (
          units.map((unit, index) => {
            const idUnit = getUnitId(unit);
            const isExpanded = !!expandedUnits[idUnit];
            const elemenList = getElemenList(unit);
            
            return (
              <div key={idUnit || index} className={`rounded-lg border bg-white overflow-hidden transition-all ${isExpanded ? "border-[#CC6B27] shadow-sm" : "border-[#071E3D]/10 hover:border-[#CC6B27]/40"}`}>
                <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => toggleUnit(unit)}>
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isExpanded ? "bg-[#CC6B27] text-white" : "bg-slate-100 text-slate-500"}`}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">Unit {getUnitUrutan(unit) || index + 1}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold font-mono text-[#071E3D]">{getUnitKode(unit)}</span>
                      </div>
                      <h4 className="text-[14px] font-bold text-[#071E3D]">{getUnitJudul(unit)}</h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">Ref: {getUnitSkkniTitle(unit)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500">{elemenList.length} Elemen</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-[11px] font-bold text-slate-500">{elemenList.reduce((sum, el) => sum + getKukList(el).length, 0)} KUK</span>
                    </div>
                    <button onClick={() => openEditUnitModal(kelompok, unit)} className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white" title="Edit Unit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteUnit(unit)} className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white" title="Hapus Unit">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <UnitDetail
                    unit={unit}
                    getElemenList={getElemenList}
                    getElemenId={getElemenId}
                    getElemenText={getElemenText}
                    getKukList={getKukList}
                    getKukText={getKukText}
                    handleAddElemen={handleAddElemen}
                    handleEditElemen={handleEditElemen}
                    handleDeleteElemen={handleDeleteElemen}
                    handleAddKuk={handleAddKuk}
                    handleEditKuk={handleEditKuk}
                    handleDeleteKuk={handleDeleteKuk}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#071E3D]/20 p-6 text-center">
            <p className="text-[13px] font-medium text-slate-500">Belum ada unit. Tambahkan melalui tombol Tambah Unit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const UnitDetail = ({
  unit,
  getElemenList,
  getElemenId,
  getElemenText,
  getKukList,
  getKukText,
  handleAddElemen,
  handleEditElemen,
  handleDeleteElemen,
  handleAddKuk,
  handleEditKuk,
  handleDeleteKuk,
}) => {
  const elemenList = getElemenList(unit);
  return (
    <div className="border-t border-[#071E3D]/10 bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-[#071E3D] text-[13px] flex items-center gap-2">
          <Layers size={16} className="text-[#CC6B27]" />
          Daftar Elemen & KUK
        </h5>
        <button onClick={() => handleAddElemen(unit)} className="px-3 py-1.5 bg-[#071E3D] text-white rounded-lg text-[11px] font-bold hover:bg-[#CC6B27] flex items-center gap-1.5 transition-colors">
          <Plus size={14} /> Elemen Baru
        </button>
      </div>

      {elemenList.length > 0 ? (
        <div className="space-y-4">
          {elemenList.map((elemen, elemenIndex) => {
            const kukList = getKukList(elemen);
            return (
              <div key={getElemenId(elemen) || elemenIndex} className="rounded-lg bg-white border border-[#071E3D]/10 p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {elemen.urutan || elemenIndex + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-[13px] font-bold text-[#071E3D] leading-snug pr-4">
                        {getElemenText(elemen)}
                      </h5>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleEditElemen(unit, elemen)} className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteElemen(elemen)} className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white"><Trash2 size={16}/></button>
                      </div>
                    </div>

                    <div className="mt-3 bg-[#FAFAFA] border border-slate-100 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kriteria Unjuk Kerja (KUK)</p>
                        <button onClick={() => handleAddKuk(elemen)} className="text-[11px] font-bold text-[#CC6B27] hover:underline flex items-center gap-1">
                          <Plus size={12} /> KUK
                        </button>
                      </div>
                      
                      {kukList.length > 0 ? (
                        <div className="space-y-2">
                          {kukList.map((kuk, kukIndex) => (
                            <div key={kuk.id_kuk || kuk.id} className="flex gap-2 text-[12px] text-[#182D4A] items-start group">
                              <span className="font-bold text-[#CC6B27] shrink-0 min-w-[20px]">{kuk.urutan || kukIndex + 1}.</span>
                              <span className="flex-1">{getKukText(kuk)}</span>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-2 shrink-0 transition-opacity ml-2">
                                <button onClick={() => handleEditKuk(elemen, kuk)} className="rounded-lg bg-[#CC6B27]/10 p-1 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"><Edit2 size={14}/></button>
                                <button onClick={() => handleDeleteKuk(kuk)} className="rounded-lg border border-red-100 bg-red-50 p-1 text-red-600 transition-colors hover:bg-red-600 hover:text-white"><Trash2 size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Belum ada KUK.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 text-[13px]">
          Belum ada elemen. Klik tombol "Elemen Baru" untuk menambah.
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN KECIL LAINNYA ---

const StatCard = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#CC6B27]">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60 truncate">{label}</p>
      <p className="mt-0.5 text-xl font-black text-[#071E3D] leading-none truncate">{value}</p>
    </div>
  </div>
);

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, icon, onClose }) => (
  <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className="bg-[#CC6B27]/10 p-2 rounded-lg text-[#CC6B27]">
        {icon}
      </div>
      <h3 className="font-bold text-[16px] text-[#071E3D]">{title}</h3>
    </div>
    <button type="button" onClick={onClose} className="text-[#182D4A] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
      <X size={20} />
    </button>
  </div>
);

const ModalFooter = ({ loading, onCancel, submitText }) => (
  <div className="pt-5 border-t border-[#071E3D]/10 flex justify-end gap-3 mt-2">
    <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[13px] font-bold transition-all">
      Batal
    </button>
    <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-[#CC6B27] text-white hover:bg-[#a8561f] font-bold flex items-center gap-2 text-[13px] transition-all disabled:opacity-50">
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {submitText}
    </button>
  </div>
);

const FormInput = ({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div>
    <label className="text-[11px] font-bold text-[#071E3D] mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
    />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder, required = false }) => (
  <div>
    <label className="text-[11px] font-bold text-[#071E3D] mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      rows="3"
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
    />
  </div>
);

export default UnitKompetensi;