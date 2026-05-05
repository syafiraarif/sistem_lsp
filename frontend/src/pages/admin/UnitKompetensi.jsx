import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  Plus,
  Edit,
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
} from "lucide-react";

const UnitKompetensi = () => {
  const [skemaList, setSkemaList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [skkniList, setSkkniList] = useState([]);

  const [selectedSkemaId, setSelectedSkemaId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitDetailMap, setUnitDetailMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    id_skkni: "",
    kode_unit: "",
    judul_unit: "",
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
    const selectedSkema = getSelectedSkema();
    const skkniIds = getSkkniIdsFromSkema(selectedSkema);

    let data = [...unitList];

    if (selectedSkemaId) {
      data = data.filter((unit) => {
        const unitSkkniId = Number(unit.id_skkni || unit.skkni?.id_skkni);
        return skkniIds.includes(unitSkkniId);
      });
    }

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
    const detail = unitDetailMap[getUnitId(unit)] || unit;

    return (
      detail.elemen ||
      detail.UnitElemens ||
      detail.unit_elemen ||
      detail.unit_elemens ||
      detail.elemen_kompetensi ||
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

    if (!unitDetailMap[idUnit]) {
      await fetchUnitDetail(idUnit);
    }
  };

  const fetchUnitDetail = async (idUnit) => {
    setLoadingDetailId(idUnit);

    try {
      const res = await api.get(`/admin/unit-kompetensi/${idUnit}`);
      const detail = res.data?.data || null;

      if (detail) {
        setUnitDetailMap((prev) => ({
          ...prev,
          [idUnit]: detail,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditId(null);

    const selectedSkema = getSelectedSkema();
    const skkniIds = getSkkniIdsFromSkema(selectedSkema);

    setFormData({
      id_skkni: skkniIds[0] || "",
      kode_unit: "",
      judul_unit: "",
    });
  };

  const closeModal = () => {
    setShowModal(false);
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

  const validateForm = () => {
    if (!formData.id_skkni) {
      return "Silakan pilih Standar/SKKNI rujukan terlebih dahulu.";
    }

    const kode = String(formData.kode_unit || "").trim();
    if (!kode || kode.length < 4) {
      return "Kode Unit minimal harus 4 karakter.";
    }

    const judul = String(formData.judul_unit || "").trim();
    if (!judul || judul.length < 4) {
      return "Judul Unit minimal harus 4 karakter.";
    }

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${
        isEditing ? "menyimpan perubahan" : "menambahkan"
      } unit kompetensi ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/admin/unit-kompetensi/${editId}`, formData);
        Swal.fire({
          title: "Berhasil",
          text: "Data unit kompetensi diperbarui",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/admin/unit-kompetensi", formData);
        Swal.fire({
          title: "Berhasil",
          text: "Data unit kompetensi ditambahkan",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      closeModal();
      await fetchUnits();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Terjadi kesalahan saat menyimpan data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (unit) => {
    const id = getUnitId(unit);

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin menghapus data Unit Kompetensi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/unit-kompetensi/${id}`);
      Swal.fire({
        title: "Terhapus",
        text: "Data berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setUnitDetailMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      await fetchUnits();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal menghapus data",
        "error"
      );
    }
  };

  const selectedSkema = getSelectedSkema();
  const selectedSkkniIds = getSkkniIdsFromSkema(selectedSkema);

  const totalElemen = useMemo(() => {
    return filteredUnits.reduce((total, unit) => {
      return total + getElemenList(unit).length;
    }, 0);
  }, [filteredUnits, unitDetailMap]);

  const totalKuk = useMemo(() => {
    return filteredUnits.reduce((total, unit) => {
      const elemenList = getElemenList(unit);
      return (
        total +
        elemenList.reduce((sum, elemen) => sum + getKukList(elemen).length, 0)
      );
    }, 0);
  }, [filteredUnits, unitDetailMap]);

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#071E3D] p-6 md:p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#CC6B27]/20 rounded-full blur-[90px] -mr-32 -mt-32" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-4">
              <BookOpen className="text-[#CC6B27]" size={16} />
              <span className="text-white/70 text-xs font-black uppercase tracking-widest">
                Struktur Kompetensi
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white">
              Unit Kompetensi per Skema
            </h2>

            <p className="text-slate-300 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
              Pilih skema terlebih dahulu, lalu sistem menampilkan unit
              kompetensi, elemen kompetensi, dan KUK / kriteria unjuk kerja.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Unit" value={filteredUnits.length} />
            <StatCard label="Elemen" value={totalElemen} />
            <StatCard label="KUK" value={totalKuk} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#071E3D]/10 rounded-3xl shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
          <div className="xl:col-span-5">
            <label className="text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
              Pilih Skema
            </label>

            <select
              value={selectedSkemaId}
              onChange={(e) => {
                setSelectedSkemaId(e.target.value);
                setExpandedUnits({});
                setSelectedUnitId(null);
              }}
              className="w-full px-4 py-3 rounded-2xl border border-[#071E3D]/15 bg-[#FAFAFA] text-[#071E3D] font-bold text-sm focus:outline-none focus:border-[#CC6B27] focus:ring-4 focus:ring-[#CC6B27]/10"
            >
              <option value="">-- Pilih Skema Sertifikasi --</option>
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

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#182D4A]/50"
              />
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#071E3D]/15 bg-[#FAFAFA] text-[#071E3D] font-bold text-sm focus:outline-none focus:border-[#CC6B27] focus:ring-4 focus:ring-[#CC6B27]/10"
                placeholder="Cari kode, judul unit, atau SKKNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="xl:col-span-3 flex gap-2">
            <button
              onClick={loadInitialData}
              className="px-4 py-3 rounded-2xl border border-[#071E3D]/15 bg-white text-[#071E3D] hover:bg-slate-50 font-black text-sm flex items-center gap-2"
            >
              <RefreshCcw size={17} />
              Refresh
            </button>

            <button
              onClick={openModal}
              className="flex-1 px-5 py-3 rounded-2xl font-black bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Plus size={17} />
              Tambah Unit
            </button>
          </div>
        </div>

        {selectedSkema && (
          <div className="mt-5 rounded-2xl bg-[#071E3D]/5 border border-[#071E3D]/10 p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mb-2">
                  Skema Terpilih
                </p>
                <h3 className="text-lg font-black text-[#071E3D]">
                  {getSkemaTitle(selectedSkema)}
                </h3>
                <p className="text-sm font-bold text-[#182D4A]/70 mt-1">
                  Kode: {getSkemaCode(selectedSkema)}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-[#071E3D]/10 px-4 py-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  SKKNI Terkait
                </p>
                <p className="text-sm font-black text-[#071E3D] mt-1">
                  {selectedSkkniIds.length > 0
                    ? `${selectedSkkniIds.length} SKKNI`
                    : "Belum ada SKKNI"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#182D4A]">
                {isEditing ? (
                  <Edit size={20} className="text-[#CC6B27]" />
                ) : (
                  <Plus size={20} className="text-[#CC6B27]" />
                )}
                <h3 className="font-black text-[16px]">
                  {isEditing ? "Edit Unit Kompetensi" : "Tambah Unit Kompetensi"}
                </h3>
              </div>

              <button
                onClick={closeModal}
                className="text-[#182D4A]/50 hover:text-red-500 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-black text-[#071E3D] mb-1.5 block">
                  Standar Rujukan / SKKNI
                </label>

                <select
                  name="id_skkni"
                  value={formData.id_skkni}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[13px]"
                >
                  <option value="">-- Pilih SKKNI --</option>
                  {skkniList.map((sk) => (
                    <option key={sk.id_skkni} value={sk.id_skkni}>
                      {sk.judul_skkni} {sk.no_skkni ? `(${sk.no_skkni})` : ""}
                    </option>
                  ))}
                </select>

                {selectedSkkniIds.length > 0 && !isEditing && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Tips: skema terpilih memakai SKKNI ID{" "}
                    {selectedSkkniIds.join(", ")}.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[13px] font-black text-[#071E3D] mb-1.5 block">
                  Kode Unit
                </label>

                <input
                  type="text"
                  name="kode_unit"
                  value={formData.kode_unit}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[13px]"
                  placeholder="Contoh: J.620100.004.01"
                />
              </div>

              <div>
                <label className="text-[13px] font-black text-[#071E3D] mb-1.5 block">
                  Judul Unit Kompetensi
                </label>

                <input
                  type="text"
                  name="judul_unit"
                  value={formData.judul_unit}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[13px]"
                  placeholder="Contoh: Menggunakan Struktur Data"
                />
              </div>

              <div className="pt-4 border-t border-[#071E3D]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-xl font-black border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] text-[13px]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl font-black bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isEditing ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#071E3D]/10 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#071E3D]/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-[#071E3D] flex items-center gap-2">
              <Layers className="text-[#CC6B27]" size={22} />
              Struktur Unit Kompetensi
            </h3>
            <p className="text-sm text-[#182D4A]/60 font-medium mt-1">
              Urutan data: Skema → Unit Kompetensi → Elemen → KUK.
            </p>
          </div>

          {!selectedSkemaId && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-700 text-sm font-bold flex items-center gap-2">
              <Info size={17} />
              Pilih skema dulu
            </div>
          )}
        </div>

        <div className="p-5 md:p-6">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={36} />
              <p className="text-[#182D4A] font-bold text-sm">Memuat data...</p>
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
                    className={`rounded-3xl border transition-all overflow-hidden ${
                      selectedUnitId === idUnit
                        ? "border-[#CC6B27]/40 bg-[#CC6B27]/5"
                        : "border-[#071E3D]/10 bg-white"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => toggleUnit(unit)}
                          className="flex items-start gap-4 text-left flex-1"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center shrink-0">
                            {isExpanded ? (
                              <ChevronDown size={22} />
                            ) : (
                              <ChevronRight size={22} />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full bg-[#CC6B27] text-white text-xs font-black">
                                Unit {index + 1}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-[#071E3D] text-xs font-black">
                                {getUnitKode(unit)}
                              </span>
                            </div>

                            <h4 className="text-lg font-black text-[#071E3D] leading-snug">
                              {getUnitJudul(unit)}
                            </h4>

                            <p className="text-xs text-[#182D4A]/60 font-semibold mt-2">
                              Rujukan: {getUnitSkkniTitle(unit)}
                            </p>
                          </div>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <SmallStat
                            icon={<ClipboardList size={15} />}
                            label="Elemen"
                            value={elemenList.length}
                          />

                          <SmallStat
                            icon={<ListChecks size={15} />}
                            label="KUK"
                            value={elemenList.reduce(
                              (sum, elemen) => sum + getKukList(elemen).length,
                              0
                            )}
                          />

                          <button
                            onClick={() => handleEdit(unit)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#182D4A] bg-slate-100 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm text-xs font-black"
                            title="Edit Unit"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(unit)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent text-xs font-black"
                            title="Hapus Unit"
                          >
                            <Trash2 size={15} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                        {loadingDetailId === idUnit ? (
                          <div className="py-8 text-center">
                            <Loader2
                              className="animate-spin mx-auto text-[#CC6B27] mb-2"
                              size={26}
                            />
                            <p className="text-sm font-bold text-[#182D4A]/70">
                              Memuat detail elemen dan KUK...
                            </p>
                          </div>
                        ) : elemenList.length > 0 ? (
                          <div className="space-y-4">
                            {elemenList.map((elemen, elemenIndex) => {
                              const kukList = getKukList(elemen);

                              return (
                                <div
                                  key={getElemenId(elemen) || elemenIndex}
                                  className="rounded-2xl bg-white border border-[#071E3D]/10 p-5"
                                >
                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center font-black shrink-0">
                                      {elemenIndex + 1}
                                    </div>

                                    <div className="flex-1">
                                      <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mb-1">
                                        Elemen Kompetensi
                                      </p>

                                      <h5 className="text-base font-black text-[#071E3D] leading-snug">
                                        {getElemenText(elemen)}
                                      </h5>

                                      <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                          <BadgeCheck size={14} />
                                          KUK / Kriteria Unjuk Kerja
                                        </p>

                                        {kukList.length > 0 ? (
                                          <ol className="space-y-2">
                                            {kukList.map((kuk, kukIndex) => (
                                              <li
                                                key={
                                                  kuk.id_kuk ||
                                                  kuk.id_unit_kuk ||
                                                  kuk.id ||
                                                  kukIndex
                                                }
                                                className="flex gap-3 text-sm font-semibold text-[#182D4A]"
                                              >
                                                <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-[#CC6B27] flex items-center justify-center text-xs font-black shrink-0">
                                                  {kukIndex + 1}
                                                </span>
                                                <span>{getKukText(kuk)}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (
                                          <p className="text-sm text-slate-400 font-semibold">
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
                          <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-8 text-center">
                            <ClipboardList
                              size={44}
                              className="mx-auto text-slate-300 mb-3"
                            />
                            <h4 className="font-black text-[#071E3D] mb-2">
                              Elemen dan KUK belum tampil
                            </h4>
                            <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto">
                              Frontend sudah siap menampilkan Unit → Elemen → KUK.
                              Namun endpoint admin <b>/admin/unit-kompetensi/:id</b>{" "}
                              perlu mengirim relasi elemen dan kuk dari backend.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <BookOpen size={52} className="text-[#071E3D]/20 mx-auto mb-3" />
              <h3 className="text-lg font-black text-[#071E3D]">
                Data Tidak Ditemukan
              </h3>
              <p className="text-[#182D4A]/60 font-medium text-sm mt-2">
                {selectedSkemaId
                  ? "Tidak ada unit kompetensi untuk skema yang dipilih."
                  : "Pilih skema untuk melihat unit kompetensi."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white/10 border border-white/15 p-4 text-white">
      <p className="text-xs text-slate-300 font-bold">{label}</p>
      <h3 className="text-2xl font-black mt-1">{value}</h3>
    </div>
  );
};

const SmallStat = ({ icon, label, value }) => {
  return (
    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[#071E3D] text-xs font-black inline-flex items-center gap-2">
      <span className="text-[#CC6B27]">{icon}</span>
      {label}: {value}
    </div>
  );
};

export default UnitKompetensi;