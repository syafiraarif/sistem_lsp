import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  Plus, Edit, Trash2, Save, X, BookOpen, Search, Loader2, Layers,
  ChevronDown, ChevronRight, ClipboardList, ListChecks, BadgeCheck,
  RefreshCcw, Info, Sparkles,
} from "lucide-react";

const UnitKompetensi = () => {
  const [skemaList, setSkemaList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [skkniList, setSkkniList] = useState([]);

  const [selectedSkemaId, setSelectedSkemaId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [expandedUnits, setExpandedUnits] = useState({});

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    id_skkni: "",
    kode_unit: "",
    judul_unit: "",
  });

  // Elemen State
  const [showElemenModal, setShowElemenModal] = useState(false);
  const [isEditingElemen, setIsEditingElemen] = useState(false);
  const [editElemenId, setEditElemenId] = useState(null);
  const [formElemen, setFormElemen] = useState({
    id_unit: "",
    nama_elemen: "",
    urutan: ""
  });

  // KUK State
  const [showKukModal, setShowKukModal] = useState(false);
  const [isEditingKuk, setIsEditingKuk] = useState(false);
  const [editKukId, setEditKukId] = useState(null);
  const [formKuk, setFormKuk] = useState({
    id_elemen: "",
    kuk: "",
    urutan: ""
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkemaId, unitList, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);

    try {
      await Promise.all([fetchSkema(), fetchUnits(), fetchSkkni()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkema = async () => {
    try {
      const res = await api.get("/admin/skema");
      setSkemaList(res.data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data skema", "error");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get("/admin/unit-kompetensi");
      setUnitList(res.data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data unit kompetensi", "error");
    }
  };

  const fetchSkkni = async () => {
    try {
      const res = await api.get("/admin/skkni");
      setSkkniList(res.data?.data || []);
    } catch (error) {
      console.error("Gagal memuat daftar SKKNI:", error);
    }
  };

  const applyFilter = () => {
    const keyword = searchTerm.trim().toLowerCase();

    // HIDE ALL UNITS JIKA SKEMA BELUM DIPILIH
    if (!selectedSkemaId) {
      setFilteredUnits([]);
      return;
    }

    let data = [...unitList];

    // Filter unit berdasarkan skema_unit
    data = data.filter((unit) => {
      if (!unit.skemaList) return false;
      return unit.skemaList.some((s) => String(s.id_skema) === String(selectedSkemaId));
    });

    if (keyword) {
      data = data.filter((unit) => {
        const kode = String(unit.kode_unit || "").toLowerCase();
        const judul = String(unit.judul_unit || "").toLowerCase();
        const skkni = String(
          unit.skkni?.judul_skkni ||
          unit.Skkni?.judul_skkni ||
          unit.skkni?.no_skkni ||
          ""
        ).toLowerCase();

        return (
          kode.includes(keyword) ||
          judul.includes(keyword) ||
          skkni.includes(keyword)
        );
      });
    }

    setFilteredUnits(data);
  };

  const getSelectedSkema = () => {
    return skemaList.find(
      (skema) => Number(skema.id_skema) === Number(selectedSkemaId)
    );
  };

  const getSkkniIdsFromSkema = (skema) => {
    if (!skema) return [];

    const possibleLists = [
      skema.Skknis,
      skema.skknis,
      skema.SKKNI,
      skema.skkni,
      skema.skkni_list,
      skema.skkniList,
    ];

    for (const list of possibleLists) {
      if (Array.isArray(list)) {
        return list
          .map((item) => Number(item.id_skkni || item.SkemaSkkni?.id_skkni))
          .filter(Boolean);
      }
    }

    if (skema.id_skkni) return [Number(skema.id_skkni)];

    return [];
  };

  const getSkemaTitle = (skema) => {
    return (
      skema?.judul_skema ||
      skema?.nama_skema ||
      skema?.judul ||
      "Skema Sertifikasi"
    );
  };

  const getSkemaCode = (skema) => {
    return skema?.kode_skema || skema?.nomor_skema || skema?.kode || "-";
  };

  const getUnitId = (unit) => {
    return unit.id_unit || unit.id_unit_kompetensi || unit.id;
  };

  const getUnitKode = (unit) => {
    return unit.kode_unit || unit.kode || unit.kode_unit_kompetensi || "-";
  };

  const getUnitJudul = (unit) => {
    return (
      unit.judul_unit ||
      unit.nama_unit ||
      unit.nama_unit_kompetensi ||
      unit.judul ||
      "-"
    );
  };

  const getUnitSkkniTitle = (unit) => {
    return (
      unit.skkni?.judul_skkni ||
      unit.Skkni?.judul_skkni ||
      unit.skkni?.no_skkni ||
      unit.Skkni?.no_skkni ||
      "Tidak ada rujukan"
    );
  };

  const getElemenList = (unit) => {
    return (
      unit.elemen ||
      unit.UnitElemens ||
      unit.unit_elemen ||
      unit.unit_elemens ||
      unit.elemen_kompetensi ||
      []
    );
  };

  const getElemenId = (elemen) => {
    return elemen.id_elemen || elemen.id_unit_elemen || elemen.id;
  };

  const getElemenText = (elemen) => {
    return (
      elemen.elemen_kompetensi ||
      elemen.nama_elemen ||
      elemen.judul_elemen ||
      elemen.elemen ||
      elemen.deskripsi ||
      "-"
    );
  };

  const getKukList = (elemen) => {
    return (
      elemen.kuk ||
      elemen.UnitKuks ||
      elemen.unit_kuk ||
      elemen.unit_kuks ||
      elemen.kriteria_unjuk_kerja ||
      []
    );
  };

  const getKukText = (kuk) => {
    return (
      kuk.kriteria_unjuk_kerja ||
      kuk.kuk ||
      kuk.deskripsi ||
      kuk.pertanyaan ||
      kuk.nama_kuk ||
      "-"
    );
  };

  const toggleUnit = async (unit) => {
    const idUnit = getUnitId(unit);

    setExpandedUnits((prev) => ({
      ...prev,
      [idUnit]: !prev[idUnit],
    }));

    setSelectedUnitId(idUnit);
  };

  // HANDLERS FOR UNIT
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openModal = () => {
    if (!selectedSkemaId) {
      Swal.fire("Informasi", "Silakan pilih skema sertifikasi terlebih dahulu dari dropdown sebelum menambah unit.", "info");
      return;
    }

    setShowModal(true);
    setIsEditing(false);
    setEditId(null);

    setFormData({
      id_skkni: "",
      kode_unit: "",
      judul_unit: "",
    });
  };

  const handleEdit = (unit) => {
    setIsEditing(true);
    setEditId(getUnitId(unit));
    setFormData({
      id_skkni: unit.id_skkni || unit.skkni?.id_skkni || "",
      kode_unit: unit.kode_unit || "",
      judul_unit: unit.judul_unit || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.id_skkni) return Swal.fire("Validasi Gagal", "Silakan pilih Standar/SKKNI", "warning");

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${isEditing ? "menyimpan" : "menambahkan"} unit kompetensi ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        id_skema: selectedSkemaId
      };

      if (isEditing) {
        await api.put(`/admin/unit-kompetensi/${editId}`, payload);
        Swal.fire({ title: "Berhasil", text: "Unit diperbarui", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/admin/unit-kompetensi", payload);
        Swal.fire({ title: "Berhasil", text: "Unit ditambahkan", icon: "success", timer: 1500, showConfirmButton: false });
      }

      setShowModal(false);
      await fetchUnits();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (unit) => {
    const id = getUnitId(unit);
    const confirmResult = await Swal.fire({
      title: "Hapus Unit?",
      text: "Data yang dihapus tidak bisa kembali!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/unit-kompetensi/${id}`);
      Swal.fire({ title: "Terhapus", text: "Unit dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  // HANDLERS FOR ELEMEN
  const handleInputElemenChange = (e) => {
    setFormElemen(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleAddElemen = (unit) => {
    const list = getElemenList(unit);
    setFormElemen({ id_unit: getUnitId(unit), nama_elemen: "", urutan: list.length + 1 });
    setIsEditingElemen(false);
    setEditElemenId(null);
    setShowElemenModal(true);
  };

  const handleEditElemen = (unit, elemen) => {
    setFormElemen({ id_unit: getUnitId(unit), nama_elemen: getElemenText(elemen), urutan: elemen.urutan });
    setIsEditingElemen(true);
    setEditElemenId(getElemenId(elemen));
    setShowElemenModal(true);
  };

  const handleSaveElemen = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingElemen) {
        await api.put(`/admin/unit-elemen/${editElemenId}`, formElemen);
        Swal.fire({ title: "Berhasil", text: "Elemen diperbarui", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/admin/unit-elemen", formElemen);
        Swal.fire({ title: "Berhasil", text: "Elemen ditambahkan", icon: "success", timer: 1500, showConfirmButton: false });
      }
      setShowElemenModal(false);
      await fetchUnits();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElemen = async (elemen) => {
    const confirmResult = await Swal.fire({
      title: "Hapus Elemen?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
    });
    if (!confirmResult.isConfirmed) return;
    try {
      await api.delete(`/admin/unit-elemen/${getElemenId(elemen)}`);
      Swal.fire({ title: "Terhapus", icon: "success", timer: 1500, showConfirmButton: false });
      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  // HANDLERS FOR KUK
  const handleInputKukChange = (e) => {
    setFormKuk(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleAddKuk = (elemen) => {
    const list = getKukList(elemen);
    setFormKuk({ id_elemen: getElemenId(elemen), kuk: "", urutan: list.length + 1 });
    setIsEditingKuk(false);
    setEditKukId(null);
    setShowKukModal(true);
  };

  const handleEditKuk = (elemen, kuk) => {
    setFormKuk({ id_elemen: getElemenId(elemen), kuk: getKukText(kuk), urutan: kuk.urutan });
    setIsEditingKuk(true);
    setEditKukId(kuk.id_kuk || kuk.id_unit_kuk || kuk.id);
    setShowKukModal(true);
  };

  const handleSaveKuk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingKuk) {
        await api.put(`/admin/unit-kuk/${editKukId}`, formKuk);
        Swal.fire({ title: "Berhasil", text: "KUK diperbarui", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/admin/unit-kuk", formKuk);
        Swal.fire({ title: "Berhasil", text: "KUK ditambahkan", icon: "success", timer: 1500, showConfirmButton: false });
      }
      setShowKukModal(false);
      await fetchUnits();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKuk = async (kuk) => {
    const confirmResult = await Swal.fire({
      title: "Hapus KUK?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
    });
    if (!confirmResult.isConfirmed) return;
    try {
      await api.delete(`/admin/unit-kuk/${kuk.id_kuk || kuk.id_unit_kuk || kuk.id}`);
      Swal.fire({ title: "Terhapus", icon: "success", timer: 1500, showConfirmButton: false });
      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  const selectedSkema = getSelectedSkema();
  const selectedSkkniIds = getSkkniIdsFromSkema(selectedSkema);

  const totalElemen = useMemo(() => {
    return filteredUnits.reduce((total, unit) => {
      return total + getElemenList(unit).length;
    }, 0);
  }, [filteredUnits]);

  const totalKuk = useMemo(() => {
    return filteredUnits.reduce((total, unit) => {
      const elemenList = getElemenList(unit);
      return (
        total +
        elemenList.reduce((sum, elemen) => sum + getKukList(elemen).length, 0)
      );
    }, 0);
  }, [filteredUnits]);

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="relative overflow-hidden bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#CC6B27]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              Struktur Kompetensi
            </div>

            <h2 className="text-[24px] md:text-[28px] font-black text-[#071E3D] m-0 mb-1">
              Unit Kompetensi per Skema
            </h2>

            <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium max-w-2xl">
              Pilih skema terlebih dahulu, lalu sistem menampilkan unit kompetensi, elemen kompetensi, dan KUK / kriteria unjuk kerja.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <StatCard label="Unit" value={filteredUnits.length} />
            <StatCard label="Elemen" value={totalElemen} />
            <StatCard label="KUK" value={totalKuk} />
          </div>
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
          <div className="xl:col-span-5">
            <label className="text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
              Pilih Skema Terlebih Dahulu
            </label>

            <select
              value={selectedSkemaId}
              onChange={(e) => {
                setSelectedSkemaId(e.target.value);
                setExpandedUnits({});
                setSelectedUnitId(null);
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] text-[#071E3D] font-bold text-[13px] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
            >
              <option value="">-- Silakan Pilih Skema Sertifikasi --</option>
              {skemaList.map((skema) => (
                <option key={skema.id_skema} value={skema.id_skema}>
                  {getSkemaCode(skema)} - {getSkemaTitle(skema)}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-4">
            <label className="text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
              Cari Unit
            </label>

            <div className="relative group">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]"
              />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] text-[#071E3D] font-medium text-[13px] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 disabled:opacity-50"
                placeholder="Cari kode atau judul unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedSkemaId}
              />
            </div>
          </div>

          <div className="xl:col-span-3 flex gap-2">
            <button
              onClick={loadInitialData}
              className="px-4 py-2.5 rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] hover:bg-[#E2E8F0] font-bold text-[13px] flex items-center gap-2 transition-colors"
            >
              <RefreshCcw size={17} />
              Refresh
            </button>

            <button
              onClick={openModal}
              className="flex-1 px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-[13px] transition-all"
            >
              <Plus size={17} />
              Tambah Unit
            </button>
          </div>
        </div>

        {selectedSkema && (
          <div className="mt-5 rounded-xl bg-[#FAFAFA] border border-[#071E3D]/10 p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mb-2">
                  Skema Terpilih
                </p>
                <h3 className="text-[16px] font-black text-[#071E3D]">
                  {getSkemaTitle(selectedSkema)}
                </h3>
                <p className="text-[13px] font-bold text-[#182D4A]/70 mt-1">
                  Kode: {getSkemaCode(selectedSkema)}
                </p>
              </div>

              <div className="rounded-xl bg-white border border-[#071E3D]/10 px-4 py-3">
                <p className="text-[10px] font-black text-[#182D4A]/50 uppercase tracking-widest">
                  SKKNI Terkait
                </p>
                <p className="text-[13px] font-black text-[#071E3D] mt-1">
                  {selectedSkkniIds.length > 0
                    ? `${selectedSkkniIds.length} SKKNI`
                    : "Belum ada SKKNI"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#071E3D]/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-black text-[#071E3D] flex items-center gap-2">
              <Layers className="text-[#CC6B27]" size={22} />
              Daftar Unit Kompetensi
            </h3>
            <p className="text-[13px] text-[#182D4A]/60 font-medium mt-1">
              Urutan data: Skema → Unit Kompetensi → Elemen → KUK.
            </p>
          </div>

          {!selectedSkemaId && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5 text-amber-700 text-[13px] font-bold flex items-center gap-2">
              <Info size={17} />
              Menunggu Pilihan Skema
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 bg-[#FAFAFA]">
          {!selectedSkemaId ? (
            <div className="py-16 text-center">
              <BookOpen size={52} className="text-[#071E3D]/20 mx-auto mb-3" />
              <h3 className="text-lg font-black text-[#071E3D]">
                Silakan Pilih Skema
              </h3>
              <p className="text-[#182D4A]/60 font-medium text-sm mt-2 max-w-md mx-auto">
                Pilih Skema Sertifikasi dari dropdown di atas terlebih dahulu untuk melihat dan mengelola daftar Unit Kompetensi yang dimilikinya.
              </p>
            </div>
          ) : loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={36} />
              <p className="text-[#182D4A] font-bold text-sm">Memuat data unit...</p>
            </div>
          ) : filteredUnits.length > 0 ? (
            <div className="space-y-4">
              {filteredUnits.map((unit, index) => {
                const idUnit = getUnitId(unit);
                const isExpanded = !!expandedUnits[idUnit];
                const elemenList = getElemenList(unit);

                return (
                  <div
                    key={idUnit || index}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      selectedUnitId === idUnit
                        ? "border-[#CC6B27]/40 bg-[#CC6B27]/5"
                        : "border-[#071E3D]/10 bg-white hover:border-[#071E3D]/30"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => toggleUnit(unit)}
                          className="flex items-start gap-4 text-left flex-1"
                        >
                          <div className="w-11 h-11 rounded-xl bg-[#071E3D] text-white flex items-center justify-center shrink-0 shadow-sm">
                            {isExpanded ? (
                              <ChevronDown size={22} />
                            ) : (
                              <ChevronRight size={22} />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full bg-[#CC6B27] text-white text-[11px] font-black">
                                Unit {index + 1}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-[#071E3D]/10 text-[#071E3D] text-[11px] font-black border border-[#071E3D]/5">
                                {getUnitKode(unit)}
                              </span>
                            </div>

                            <h4 className="text-[16px] font-black text-[#071E3D] leading-snug">
                              {getUnitJudul(unit)}
                            </h4>

                            <p className="text-[12px] text-[#182D4A]/60 font-semibold mt-2">
                              Rujukan: {getUnitSkkniTitle(unit)}
                            </p>
                          </div>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <SmallStat icon={<ClipboardList size={15} />} label="Elemen" value={elemenList.length} />
                          <SmallStat icon={<ListChecks size={15} />} label="KUK" value={elemenList.reduce((sum, el) => sum + getKukList(el).length, 0)} />

                          <button onClick={() => handleEdit(unit)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#182D4A] bg-white border border-[#071E3D]/10 hover:bg-[#CC6B27] hover:text-white hover:border-[#CC6B27] transition-all shadow-sm text-[12px] font-black" title="Edit Unit">
                            <Edit size={14} /> Edit
                          </button>

                          <button onClick={() => handleDelete(unit)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent text-[12px] font-black" title="Hapus Unit">
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#071E3D]/10 bg-white p-5">
                        <div className="flex justify-between items-center mb-4">
                           <h5 className="font-black text-[#071E3D] text-sm flex items-center gap-2">
                               <Layers size={18} className="text-[#CC6B27]"/>
                               Daftar Elemen Kompetensi
                           </h5>
                           <button onClick={() => handleAddElemen(unit)} className="px-3 py-1.5 bg-[#071E3D] text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-[#CC6B27] flex items-center gap-1.5 transition-colors shadow-sm">
                               <Plus size={14}/> Tambah Elemen
                           </button>
                        </div>

                        {elemenList.length > 0 ? (
                          <div className="space-y-4">
                            {elemenList.map((elemen, elemenIndex) => {
                              const kukList = getKukList(elemen);
                              return (
                                <div key={getElemenId(elemen) || elemenIndex} className="rounded-xl bg-[#FAFAFA] border border-[#071E3D]/10 p-5 shadow-sm">
                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-[#CC6B27]/20 text-[#CC6B27] flex items-center justify-center font-black shrink-0 shadow-sm">
                                      {elemen.urutan || elemenIndex + 1}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest">Elemen Kompetensi</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditElemen(unit, elemen)} className="text-[#182D4A] hover:text-[#CC6B27] bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm transition-colors" title="Edit Elemen"><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteElemen(elemen)} className="text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-lg p-1.5 shadow-sm transition-colors" title="Hapus Elemen"><Trash2 size={14}/></button>
                                        </div>
                                      </div>

                                      <h5 className="text-[15px] font-black text-[#071E3D] leading-snug bg-white p-3 rounded-xl border border-slate-100 mt-2 shadow-sm">
                                        {getElemenText(elemen)}
                                      </h5>

                                      <div className="mt-4 rounded-xl bg-white border border-[#071E3D]/10 p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-black text-[#182D4A]/50 uppercase tracking-widest flex items-center gap-2">
                                            <BadgeCheck size={14} /> KUK / Kriteria Unjuk Kerja
                                            </p>
                                            <button onClick={() => handleAddKuk(elemen)} className="text-[11px] font-black uppercase text-[#071E3D] hover:text-[#CC6B27] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm"><Plus size={12}/> Tambah KUK</button>
                                        </div>

                                        {kukList.length > 0 ? (
                                          <ol className="space-y-2">
                                            {kukList.map((kuk, kukIndex) => (
                                              <li key={kuk.id_kuk || kuk.id_unit_kuk || kuk.id || kukIndex} className="flex gap-3 text-[13px] font-semibold text-[#182D4A] items-center group bg-[#FAFAFA] p-2 rounded-lg border border-transparent hover:border-slate-200">
                                                <span className="w-7 h-7 rounded-lg bg-white border border-[#071E3D]/10 text-[#CC6B27] flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                                                  {kuk.urutan || kukIndex + 1}
                                                </span>
                                                <span className="flex-1">{getKukText(kuk)}</span>
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                    <button onClick={() => handleEditKuk(elemen, kuk)} className="p-1.5 text-[#182D4A] bg-white rounded-md border border-slate-200 hover:text-[#CC6B27] shadow-sm"><Edit size={13}/></button>
                                                    <button onClick={() => handleDeleteKuk(kuk)} className="p-1.5 text-red-500 bg-white rounded-md border border-red-100 hover:text-red-700 shadow-sm"><Trash2 size={13}/></button>
                                                </div>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (
                                          <p className="text-[13px] text-[#182D4A]/50 font-semibold italic">
                                            Belum ada KUK untuk elemen ini.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-white border border-dashed border-[#071E3D]/20 p-8 text-center shadow-sm">
                            <ClipboardList size={44} className="mx-auto text-[#071E3D]/20 mb-3" />
                            <h4 className="font-black text-[#071E3D] mb-2">Belum ada Elemen Kompetensi</h4>
                            <button onClick={() => handleAddElemen(unit)} className="inline-flex px-4 py-2 mt-2 bg-[#CC6B27] text-white rounded-lg text-[12px] font-black items-center gap-2 shadow-md hover:bg-[#a8561f] transition-all">
                                <Plus size={14}/> Tambah Elemen Pertama
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Layers size={52} className="text-[#071E3D]/20 mx-auto mb-3" />
              <h3 className="text-lg font-black text-[#071E3D]">
                Daftar Unit Kosong
              </h3>
              <p className="text-[#182D4A]/60 font-medium text-sm mt-2 max-w-md mx-auto">
                Belum ada Unit Kompetensi yang terdaftar untuk skema ini. Silakan klik tombol <span className="font-bold text-[#071E3D]">"Tambah Unit"</span> di atas untuk memasukkan data baru.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL UNIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#182D4A]">
                <div className="bg-orange-50 p-2 rounded-xl">
                    {isEditing ? <Edit size={20} className="text-[#CC6B27]" /> : <Plus size={20} className="text-[#CC6B27]" />}
                </div>
                <h3 className="font-black text-[18px] text-[#071E3D]">{isEditing ? "Edit Unit Kompetensi" : "Tambah Unit Kompetensi"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] bg-white border border-slate-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all shadow-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Standar Rujukan / SKKNI <span className="text-red-500">*</span></label>
                <select name="id_skkni" value={formData.id_skkni} onChange={handleInputChange} className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[14px]">
                  <option value="">-- Pilih SKKNI --</option>
                  {/* Menampilkan SEMUA SKKNI dari database biar kamu nggak terblokir kalau belum nge-link skema ke SKKNI */}
                  {skkniList.map((sk) => (
                      <option key={sk.id_skkni} value={sk.id_skkni}>{sk.judul_skkni} {sk.no_skkni ? `(${sk.no_skkni})` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Judul Unit Kompetensi <span className="text-red-500">*</span></label>
                    <input type="text" name="judul_unit" value={formData.judul_unit} onChange={handleInputChange} className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[14px]" placeholder="Contoh: Menggunakan Struktur Data" required/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Kode Unit <span className="text-red-500">*</span></label>
                    <input type="text" name="kode_unit" value={formData.kode_unit} onChange={handleInputChange} className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[14px]" placeholder="Contoh: J.620100.004.01" required/>
                  </div>
              </div>

              <div className="pt-5 border-t border-[#071E3D]/10 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-black border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-slate-50 text-[13px] uppercase tracking-wider transition-all shadow-sm">Batal</button>
                <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-black bg-[#CC6B27] text-white hover:bg-[#071E3D] shadow-md flex items-center gap-2 text-[13px] uppercase tracking-wider transition-all disabled:opacity-70">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isEditing ? "Simpan Perubahan" : "Simpan Data Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELEMEN */}
      {showElemenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#182D4A]">
                <div className="bg-orange-50 p-2 rounded-xl">
                    <Layers size={20} className="text-[#CC6B27]" />
                </div>
                <h3 className="font-black text-[18px] text-[#071E3D]">{isEditingElemen ? "Edit Elemen" : "Tambah Elemen Baru"}</h3>
              </div>
              <button onClick={() => setShowElemenModal(false)} className="text-[#182D4A] bg-white border border-slate-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all shadow-sm"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveElemen} className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Urutan Elemen</label>
                <input type="number" name="urutan" value={formElemen.urutan} onChange={handleInputElemenChange} className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10" required/>
              </div>
              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Elemen Kompetensi</label>
                <textarea name="nama_elemen" rows="4" value={formElemen.nama_elemen} onChange={handleInputElemenChange} required className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 resize-none" placeholder="Deskripsikan elemen kompetensi..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t border-[#071E3D]/10 mt-2">
                <button type="button" onClick={() => setShowElemenModal(false)} className="px-6 py-3 rounded-xl font-black border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-slate-50 text-[13px] uppercase tracking-wider transition-all shadow-sm">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-black bg-[#CC6B27] text-white hover:bg-[#071E3D] shadow-md flex items-center gap-2 text-[13px] uppercase tracking-wider transition-all">
                    <Save size={16}/> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KUK */}
      {showKukModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#182D4A]">
                <div className="bg-orange-50 p-2 rounded-xl">
                    <BadgeCheck size={20} className="text-[#CC6B27]" />
                </div>
                <h3 className="font-black text-[18px] text-[#071E3D]">{isEditingKuk ? "Edit KUK" : "Tambah KUK Baru"}</h3>
              </div>
              <button onClick={() => setShowKukModal(false)} className="text-[#182D4A] bg-white border border-slate-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all shadow-sm"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveKuk} className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Urutan KUK</label>
                <input type="number" name="urutan" value={formKuk.urutan} onChange={handleInputKukChange} className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10" required/>
              </div>
              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">Kriteria Unjuk Kerja</label>
                <textarea name="kuk" rows="4" value={formKuk.kuk} onChange={handleInputKukChange} required className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 resize-none" placeholder="Tuliskan detail KUK..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t border-[#071E3D]/10 mt-2">
                <button type="button" onClick={() => setShowKukModal(false)} className="px-6 py-3 rounded-xl font-black border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-slate-50 text-[13px] uppercase tracking-wider transition-all shadow-sm">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-black bg-[#CC6B27] text-white hover:bg-[#071E3D] shadow-md flex items-center gap-2 text-[13px] uppercase tracking-wider transition-all">
                    <Save size={16}/> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white shadow-sm border border-[#071E3D]/10 p-5 text-[#071E3D] flex flex-col justify-center">
      <p className="text-[11px] text-[#182D4A]/60 font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black mt-1 leading-none text-[#CC6B27]">{value}</h3>
    </div>
  );
};

const SmallStat = ({ icon, label, value }) => {
  return (
    <div className="px-3 py-2 rounded-xl bg-white border border-[#071E3D]/10 text-[#071E3D] text-[12px] font-black inline-flex items-center gap-2 shadow-sm">
      <span className="text-[#CC6B27] bg-orange-50 p-1 rounded-md">{icon}</span>
      {label}: {value}
    </div>
  );
};

export default UnitKompetensi;