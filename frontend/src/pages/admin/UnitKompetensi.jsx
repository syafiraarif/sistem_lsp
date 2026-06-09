// frontend/src/pages/admin/UnitKompetensi.jsx

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

  const [showKelompokModal, setShowKelompokModal] = useState(false);
  const [isEditingKelompok, setIsEditingKelompok] = useState(false);
  const [editKelompokId, setEditKelompokId] = useState(null);
  const [formKelompok, setFormKelompok] = useState({
    nama_kelompok: "",
    deskripsi: "",
    urutan: "",
  });

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editUnitId, setEditUnitId] = useState(null);
  const [activeKelompok, setActiveKelompok] = useState(null);
  const [formUnit, setFormUnit] = useState({
    id_kelompok: "",
    id_skkni: "",
    kode_unit: "",
    judul_unit: "",
    urutan: "",
  });

  const [showElemenModal, setShowElemenModal] = useState(false);
  const [isEditingElemen, setIsEditingElemen] = useState(false);
  const [editElemenId, setEditElemenId] = useState(null);
  const [formElemen, setFormElemen] = useState({
    id_unit: "",
    nama_elemen: "",
    urutan: "",
  });

  const [showKukModal, setShowKukModal] = useState(false);
  const [isEditingKuk, setIsEditingKuk] = useState(false);
  const [editKukId, setEditKukId] = useState(null);
  const [formKuk, setFormKuk] = useState({
    id_elemen: "",
    kuk: "",
    urutan: "",
  });

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
      console.error(error);
      Swal.fire("Error", "Gagal memuat data SKKNI", "error");
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
      console.error(error);
      setKelompokList([]);
      Swal.fire("Error", "Gagal memuat kelompok pekerjaan", "error");
    }
  };

  const getSelectedSkema = () => {
    return skemaList.find(
      (skema) => Number(skema.id_skema) === Number(selectedSkemaId)
    );
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

  const getUnitSkemaList = (unit) => {
    return unit.skemaList || unit.skema_list || unit.SkemaList || [];
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

  const getUnitSkkniId = (unit) => {
    return unit.id_skkni || unit.skkni?.id_skkni || unit.Skkni?.id_skkni || "";
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

  const getUnitRelBySelectedSkema = (unit) => {
    const skemaListUnit = getUnitSkemaList(unit);

    return skemaListUnit.find(
      (item) => String(item.id_skema) === String(selectedSkemaId)
    );
  };

  const getUnitKelompokId = (unit) => {
    const rel = getUnitRelBySelectedSkema(unit);
    return rel?.id_kelompok || unit.id_kelompok || "";
  };

  const getUnitUrutan = (unit) => {
    const rel = getUnitRelBySelectedSkema(unit);
    return rel?.urutan || unit.urutan_skema_unit || unit.urutan || "";
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

  const getUnitsByKelompok = (idKelompok) => {
    const keyword = searchTerm.trim().toLowerCase();

    let data = unitList.filter((unit) => {
      const skemaListUnit = getUnitSkemaList(unit);

      const matchSkema = skemaListUnit.some(
        (s) => String(s.id_skema) === String(selectedSkemaId)
      );

      const matchKelompok =
        String(getUnitKelompokId(unit)) === String(idKelompok);

      return matchSkema && matchKelompok;
    });

    if (keyword) {
      data = data.filter((unit) => {
        const kode = String(getUnitKode(unit)).toLowerCase();
        const judul = String(getUnitJudul(unit)).toLowerCase();
        const skkni = String(getUnitSkkniTitle(unit)).toLowerCase();

        return (
          kode.includes(keyword) ||
          judul.includes(keyword) ||
          skkni.includes(keyword)
        );
      });
    }

    return data.sort((a, b) => {
      const urutanA = Number(getUnitUrutan(a) || 999999);
      const urutanB = Number(getUnitUrutan(b) || 999999);
      return urutanA - urutanB;
    });
  };

  const selectedSkema = getSelectedSkema();

  const displayedKelompokList = useMemo(() => {
    const sorted = [...kelompokList].sort((a, b) => {
      const urutanA = Number(a.urutan || 999999);
      const urutanB = Number(b.urutan || 999999);
      return urutanA - urutanB;
    });

    if (!searchTerm.trim()) return sorted;

    return sorted.filter((kelompok) => {
      const units = getUnitsByKelompok(kelompok.id_kelompok);
      const nama = String(kelompok.nama_kelompok || "").toLowerCase();
      return nama.includes(searchTerm.trim().toLowerCase()) || units.length > 0;
    });
  }, [kelompokList, unitList, selectedSkemaId, searchTerm]);

  const filteredUnitCount = useMemo(() => {
    return displayedKelompokList.reduce((total, kelompok) => {
      return total + getUnitsByKelompok(kelompok.id_kelompok).length;
    }, 0);
  }, [displayedKelompokList, unitList, selectedSkemaId, searchTerm]);

  const totalElemen = useMemo(() => {
    return displayedKelompokList.reduce((total, kelompok) => {
      const units = getUnitsByKelompok(kelompok.id_kelompok);
      return (
        total +
        units.reduce((sum, unit) => sum + getElemenList(unit).length, 0)
      );
    }, 0);
  }, [displayedKelompokList, unitList, selectedSkemaId, searchTerm]);

  const totalKuk = useMemo(() => {
    return displayedKelompokList.reduce((total, kelompok) => {
      const units = getUnitsByKelompok(kelompok.id_kelompok);

      return (
        total +
        units.reduce((sumUnit, unit) => {
          const elemenList = getElemenList(unit);

          return (
            sumUnit +
            elemenList.reduce((sumElemen, elemen) => {
              return sumElemen + getKukList(elemen).length;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }, [displayedKelompokList, unitList, selectedSkemaId, searchTerm]);

  const toggleUnit = (unit) => {
    const idUnit = getUnitId(unit);

    setExpandedUnits((prev) => ({
      ...prev,
      [idUnit]: !prev[idUnit],
    }));

    setSelectedUnitId(idUnit);
  };

  const handleKelompokInputChange = (e) => {
    setFormKelompok((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUnitInputChange = (e) => {
    setFormUnit((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openKelompokModal = () => {
    if (!selectedSkemaId) {
      Swal.fire("Informasi", "Silakan pilih skema terlebih dahulu.", "info");
      return;
    }

    setIsEditingKelompok(false);
    setEditKelompokId(null);
    setFormKelompok({
      nama_kelompok: "",
      deskripsi: "",
      urutan: kelompokList.length + 1,
    });
    setShowKelompokModal(true);
  };

  const openEditKelompokModal = (kelompok) => {
    setIsEditingKelompok(true);
    setEditKelompokId(kelompok.id_kelompok);
    setFormKelompok({
      nama_kelompok: kelompok.nama_kelompok || "",
      deskripsi: kelompok.deskripsi || "",
      urutan: kelompok.urutan || "",
    });
    setShowKelompokModal(true);
  };

  const closeKelompokModal = () => {
    setShowKelompokModal(false);
    setIsEditingKelompok(false);
    setEditKelompokId(null);
  };

  const handleSaveKelompok = async (e) => {
    e.preventDefault();

    if (!selectedSkemaId) {
      return Swal.fire("Validasi Gagal", "Skema wajib dipilih", "warning");
    }

    if (!formKelompok.nama_kelompok.trim()) {
      return Swal.fire(
        "Validasi Gagal",
        "Nama kelompok pekerjaan wajib diisi",
        "warning"
      );
    }

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${
        isEditingKelompok ? "menyimpan perubahan" : "menambahkan"
      } kelompok pekerjaan ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        id_skema: selectedSkemaId,
        nama_kelompok: formKelompok.nama_kelompok.trim(),
        deskripsi: formKelompok.deskripsi,
        urutan: formKelompok.urutan || kelompokList.length + 1,
      };

      if (isEditingKelompok) {
        await api.put(`/admin/kelompok-pekerjaan/${editKelompokId}`, payload);
      } else {
        await api.post("/admin/kelompok-pekerjaan", payload);
      }

      Swal.fire({
        title: "Berhasil",
        text: isEditingKelompok
          ? "Kelompok pekerjaan diperbarui"
          : "Kelompok pekerjaan ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      closeKelompokModal();
      await fetchKelompokBySkema(selectedSkemaId);
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKelompok = async (kelompok) => {
    const units = getUnitsByKelompok(kelompok.id_kelompok);

    if (units.length > 0) {
      return Swal.fire(
        "Tidak Bisa Dihapus",
        "Kelompok ini masih memiliki unit kompetensi. Hapus atau pindahkan unitnya terlebih dahulu.",
        "warning"
      );
    }

    const confirmResult = await Swal.fire({
      title: "Hapus Kelompok?",
      text: "Data kelompok pekerjaan yang dihapus tidak bisa kembali.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, Hapus",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      await api.delete(`/admin/kelompok-pekerjaan/${kelompok.id_kelompok}`);

      Swal.fire({
        title: "Terhapus",
        text: "Kelompok pekerjaan dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchKelompokBySkema(selectedSkemaId);
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal menghapus kelompok pekerjaan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddUnitModal = (kelompok) => {
    if (!selectedSkemaId) {
      Swal.fire("Informasi", "Silakan pilih skema terlebih dahulu.", "info");
      return;
    }

    setActiveKelompok(kelompok);
    setIsEditingUnit(false);
    setEditUnitId(null);
    setFormUnit({
      id_kelompok: kelompok.id_kelompok,
      id_skkni: "",
      kode_unit: "",
      judul_unit: "",
      urutan: getUnitsByKelompok(kelompok.id_kelompok).length + 1,
    });
    setShowUnitModal(true);
  };

  const openEditUnitModal = (kelompok, unit) => {
    setActiveKelompok(kelompok);
    setIsEditingUnit(true);
    setEditUnitId(getUnitId(unit));
    setFormUnit({
      id_kelompok: getUnitKelompokId(unit) || kelompok.id_kelompok,
      id_skkni: getUnitSkkniId(unit),
      kode_unit: unit.kode_unit || "",
      judul_unit: unit.judul_unit || "",
      urutan: getUnitUrutan(unit) || "",
    });
    setShowUnitModal(true);
  };

  const closeUnitModal = () => {
    setShowUnitModal(false);
    setIsEditingUnit(false);
    setEditUnitId(null);
    setActiveKelompok(null);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();

    if (!selectedSkemaId) {
      return Swal.fire("Validasi Gagal", "Skema wajib dipilih", "warning");
    }

    if (!formUnit.id_kelompok) {
      return Swal.fire(
        "Validasi Gagal",
        "Kelompok pekerjaan wajib dipilih",
        "warning"
      );
    }

    if (!formUnit.id_skkni) {
      return Swal.fire(
        "Validasi Gagal",
        "Silakan pilih Standar/SKKNI",
        "warning"
      );
    }

    if (!formUnit.kode_unit || !formUnit.judul_unit) {
      return Swal.fire(
        "Validasi Gagal",
        "Kode unit dan judul unit wajib diisi",
        "warning"
      );
    }

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${
        isEditingUnit ? "menyimpan perubahan" : "menambahkan"
      } unit kompetensi ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        id_skema: selectedSkemaId,
        id_kelompok: formUnit.id_kelompok,
        id_skkni: formUnit.id_skkni,
        kode_unit: formUnit.kode_unit,
        judul_unit: formUnit.judul_unit,
        urutan: formUnit.urutan,
      };

      if (isEditingUnit) {
        await api.put(`/admin/unit-kompetensi/${editUnitId}`, payload);
      } else {
        await api.post("/admin/unit-kompetensi", payload);
      }

      Swal.fire({
        title: "Berhasil",
        text: isEditingUnit
          ? "Unit kompetensi diperbarui"
          : "Unit kompetensi ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      closeUnitModal();
      await fetchUnits();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    const id = getUnitId(unit);

    const confirmResult = await Swal.fire({
      title: "Hapus Unit?",
      text: "Data unit, elemen, dan KUK terkait bisa ikut terpengaruh.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, Hapus",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/unit-kompetensi/${id}`);

      Swal.fire({
        title: "Terhapus",
        text: "Unit kompetensi dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus unit kompetensi", "error");
    }
  };

  const handleInputElemenChange = (e) => {
    setFormElemen((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddElemen = (unit) => {
    const list = getElemenList(unit);

    setFormElemen({
      id_unit: getUnitId(unit),
      nama_elemen: "",
      urutan: list.length + 1,
    });

    setIsEditingElemen(false);
    setEditElemenId(null);
    setShowElemenModal(true);
  };

  const handleEditElemen = (unit, elemen) => {
    setFormElemen({
      id_unit: getUnitId(unit),
      nama_elemen: getElemenText(elemen),
      urutan: elemen.urutan || "",
    });

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
      } else {
        await api.post("/admin/unit-elemen", formElemen);
      }

      Swal.fire({
        title: "Berhasil",
        text: isEditingElemen ? "Elemen diperbarui" : "Elemen ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

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

      Swal.fire({
        title: "Terhapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus elemen", "error");
    }
  };

  const handleInputKukChange = (e) => {
    setFormKuk((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddKuk = (elemen) => {
    const list = getKukList(elemen);

    setFormKuk({
      id_elemen: getElemenId(elemen),
      kuk: "",
      urutan: list.length + 1,
    });

    setIsEditingKuk(false);
    setEditKukId(null);
    setShowKukModal(true);
  };

  const handleEditKuk = (elemen, kuk) => {
    setFormKuk({
      id_elemen: getElemenId(elemen),
      kuk: getKukText(kuk),
      urutan: kuk.urutan || "",
    });

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
      } else {
        await api.post("/admin/unit-kuk", formKuk);
      }

      Swal.fire({
        title: "Berhasil",
        text: isEditingKuk ? "KUK diperbarui" : "KUK ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

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
      await api.delete(
        `/admin/unit-kuk/${kuk.id_kuk || kuk.id_unit_kuk || kuk.id}`
      );

      Swal.fire({
        title: "Terhapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchUnits();
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus KUK", "error");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      <section className="relative overflow-hidden bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#CC6B27]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              Struktur Kompetensi
            </div>

            <h2 className="text-[24px] md:text-[28px] font-black text-[#071E3D] m-0 mb-1">
              Unit Kompetensi per Kelompok Pekerjaan
            </h2>

            <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium max-w-2xl">
              Urutan data: Skema → Kelompok Pekerjaan → Unit Kompetensi →
              Elemen → KUK. Kelompok pekerjaan wajib minimal satu dan dapat
              dibuat lebih dari satu dalam satu skema.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <StatCard label="Kelompok" value={kelompokList.length} />
            <StatCard label="Unit" value={filteredUnitCount} />
            <StatCard label="KUK" value={totalKuk} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
          <div className="xl:col-span-5">
            <label className="text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
              Pilih Skema Terlebih Dahulu
            </label>

            <select
              value={selectedSkemaId}
              onChange={(e) => setSelectedSkemaId(e.target.value)}
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

          <div className="xl:col-span-5">
            <label className="text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
              Cari Unit / Kelompok
            </label>

            <div className="relative group">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27]"
              />

              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] text-[#071E3D] font-medium text-[13px] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 disabled:opacity-50"
                placeholder="Cari kode, judul, SKKNI, atau kelompok..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedSkemaId}
              />
            </div>
          </div>

          <div className="xl:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={loadInitialData}
              className="px-4 py-2.5 rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] hover:bg-[#E2E8F0] font-bold text-[13px] flex items-center gap-2 transition-colors"
            >
              <RefreshCcw size={17} />
            </button>

            <button
              type="button"
              onClick={openKelompokModal}
              disabled={!selectedSkemaId}
              className="flex-1 px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-[13px] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Plus size={17} />
              Kelompok
            </button>
          </div>
        </div>

        {selectedSkema && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoBox
              icon={<BadgeCheck size={18} />}
              label="Skema Terpilih"
              value={`${getSkemaCode(selectedSkema)} - ${getSkemaTitle(
                selectedSkema
              )}`}
            />

            <InfoBox
              icon={<Briefcase size={18} />}
              label="Kelompok Pekerjaan"
              value={`${kelompokList.length} kelompok tersedia pada skema ini`}
            />
          </div>
        )}
      </section>

      <section className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#071E3D]/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-black text-[#071E3D] flex items-center gap-2">
              <Layers className="text-[#CC6B27]" size={22} />
              Daftar Kelompok Pekerjaan & Unit Kompetensi
            </h3>

            <p className="text-[13px] text-[#182D4A]/60 font-medium mt-1">
              Tambahkan kelompok pekerjaan terlebih dahulu, lalu tambahkan unit
              kompetensi pada masing-masing kelompok.
            </p>
          </div>

          {selectedSkemaId && (
            <button
              type="button"
              onClick={openKelompokModal}
              className="inline-flex px-4 py-2.5 bg-[#071E3D] text-white rounded-lg text-[12px] font-black items-center gap-2 shadow-sm hover:bg-[#CC6B27] transition-all"
            >
              <Plus size={15} />
              Tambah Kelompok
            </button>
          )}

          {!selectedSkemaId && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5 text-amber-700 text-[13px] font-bold flex items-center gap-2">
              <Info size={17} />
              Menunggu Pilihan Skema
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 bg-[#FAFAFA]">
          {!selectedSkemaId ? (
            <EmptyBig
              icon={<BookOpen size={52} />}
              title="Silakan Pilih Skema"
              description="Pilih skema sertifikasi terlebih dahulu untuk mengelola kelompok pekerjaan dan unit kompetensi."
            />
          ) : loading ? (
            <div className="py-20 text-center">
              <Loader2
                className="animate-spin mx-auto text-[#CC6B27] mb-3"
                size={36}
              />

              <p className="text-[#182D4A] font-bold text-sm">
                Memuat data...
              </p>
            </div>
          ) : displayedKelompokList.length > 0 ? (
            <div className="space-y-5">
              {displayedKelompokList.map((kelompok) => {
                const units = getUnitsByKelompok(kelompok.id_kelompok);

                return (
                  <KelompokCard
                    key={kelompok.id_kelompok}
                    kelompok={kelompok}
                    units={units}
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
                );
              })}
            </div>
          ) : (
            <EmptyBig
              icon={<Layers size={52} />}
              title="Belum Ada Kelompok Pekerjaan"
              description="Minimal harus ada satu kelompok pekerjaan sebelum menambahkan unit kompetensi."
            >
              <button
                type="button"
                onClick={openKelompokModal}
                className="mt-5 inline-flex px-5 py-3 bg-[#CC6B27] text-white rounded-xl text-[13px] font-black items-center gap-2 shadow-md hover:bg-[#071E3D] transition-all"
              >
                <Plus size={16} /> Tambah Kelompok Pertama
              </button>
            </EmptyBig>
          )}
        </div>
      </section>

      {showKelompokModal && (
        <ModalWrapper>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <ModalHeader
              title={
                isEditingKelompok
                  ? "Edit Kelompok Pekerjaan"
                  : "Tambah Kelompok Pekerjaan"
              }
              icon={<Briefcase size={20} />}
              onClose={closeKelompokModal}
            />

            <form onSubmit={handleSaveKelompok} className="p-6 flex flex-col gap-5">
              <FormInput
                label="Nama Kelompok Pekerjaan"
                name="nama_kelompok"
                value={formKelompok.nama_kelompok}
                onChange={handleKelompokInputChange}
                placeholder="Contoh: Kelompok Pekerjaan Backend Development"
                required
              />

              <FormTextarea
                label="Deskripsi Kelompok"
                name="deskripsi"
                value={formKelompok.deskripsi}
                onChange={handleKelompokInputChange}
                placeholder="Opsional, isi deskripsi kelompok pekerjaan..."
              />

              <FormInput
                label="Urutan Kelompok"
                name="urutan"
                type="number"
                value={formKelompok.urutan}
                onChange={handleKelompokInputChange}
                placeholder="Contoh: 1"
              />

              <ModalFooter
                loading={loading}
                onCancel={closeKelompokModal}
                submitText={isEditingKelompok ? "Simpan Perubahan" : "Simpan"}
              />
            </form>
          </div>
        </ModalWrapper>
      )}

      {showUnitModal && (
        <ModalWrapper>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <ModalHeader
              title={isEditingUnit ? "Edit Unit Kompetensi" : "Tambah Unit Kompetensi"}
              icon={<Layers size={20} />}
              onClose={closeUnitModal}
            />

            <form onSubmit={handleSaveUnit} className="p-6 flex flex-col gap-5">
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CC6B27]">
                  Kelompok Pekerjaan
                </p>

                <p className="mt-1 text-sm font-black text-[#071E3D]">
                  {activeKelompok?.nama_kelompok || "-"}
                </p>
              </div>

              <input
                type="hidden"
                name="id_kelompok"
                value={formUnit.id_kelompok}
              />

              <div>
                <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
                  Standar Rujukan / SKKNI <span className="text-red-500">*</span>
                </label>

                <select
                  name="id_skkni"
                  value={formUnit.id_skkni}
                  onChange={handleUnitInputChange}
                  className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 font-bold text-[14px]"
                  required
                >
                  <option value="">-- Pilih SKKNI --</option>
                  {skkniList.map((sk) => (
                    <option key={sk.id_skkni} value={sk.id_skkni}>
                      {sk.judul_skkni} {sk.no_skkni ? `(${sk.no_skkni})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Judul Unit Kompetensi"
                name="judul_unit"
                value={formUnit.judul_unit}
                onChange={handleUnitInputChange}
                placeholder="Contoh: Menggunakan Struktur Data"
                required
              />

              <FormInput
                label="Kode Unit"
                name="kode_unit"
                value={formUnit.kode_unit}
                onChange={handleUnitInputChange}
                placeholder="Contoh: J.620100.004.01"
                required
              />

              <FormInput
                label="Urutan Unit"
                name="urutan"
                type="number"
                value={formUnit.urutan}
                onChange={handleUnitInputChange}
                placeholder="Contoh: 1"
              />

              <ModalFooter
                loading={loading}
                onCancel={closeUnitModal}
                submitText={isEditingUnit ? "Simpan Perubahan" : "Simpan Unit"}
              />
            </form>
          </div>
        </ModalWrapper>
      )}

      {showElemenModal && (
        <ModalWrapper>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <ModalHeader
              title={isEditingElemen ? "Edit Elemen" : "Tambah Elemen Baru"}
              icon={<Layers size={20} />}
              onClose={() => setShowElemenModal(false)}
            />

            <form onSubmit={handleSaveElemen} className="p-6 flex flex-col gap-5">
              <FormInput
                label="Urutan Elemen"
                name="urutan"
                type="number"
                value={formElemen.urutan}
                onChange={handleInputElemenChange}
                required
              />

              <FormTextarea
                label="Elemen Kompetensi"
                name="nama_elemen"
                value={formElemen.nama_elemen}
                onChange={handleInputElemenChange}
                placeholder="Deskripsikan elemen kompetensi..."
                required
              />

              <ModalFooter
                loading={loading}
                onCancel={() => setShowElemenModal(false)}
                submitText="Simpan"
              />
            </form>
          </div>
        </ModalWrapper>
      )}

      {showKukModal && (
        <ModalWrapper>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <ModalHeader
              title={isEditingKuk ? "Edit KUK" : "Tambah KUK Baru"}
              icon={<BadgeCheck size={20} />}
              onClose={() => setShowKukModal(false)}
            />

            <form onSubmit={handleSaveKuk} className="p-6 flex flex-col gap-5">
              <FormInput
                label="Urutan KUK"
                name="urutan"
                type="number"
                value={formKuk.urutan}
                onChange={handleInputKukChange}
                required
              />

              <FormTextarea
                label="Kriteria Unjuk Kerja"
                name="kuk"
                value={formKuk.kuk}
                onChange={handleInputKukChange}
                placeholder="Tuliskan detail KUK..."
                required
              />

              <ModalFooter
                loading={loading}
                onCancel={() => setShowKukModal(false)}
                submitText="Simpan"
              />
            </form>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

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
    <div className="rounded-xl border border-[#071E3D]/10 bg-white overflow-hidden">
      <div className="bg-[#071E3D] text-white px-5 py-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
            Kelompok Pekerjaan
          </p>

          <h3 className="mt-1 text-lg font-black">
            {kelompok.urutan ? `${kelompok.urutan}. ` : ""}
            {kelompok.nama_kelompok}
          </h3>

          <p className="mt-1 text-xs font-semibold text-white/60">
            {kelompok.deskripsi || "Tidak ada deskripsi"} • {units.length} unit
            kompetensi
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openAddUnitModal(kelompok)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-[#071E3D] transition-all"
          >
            <Plus size={14} />
            Tambah Unit
          </button>

          <button
            type="button"
            onClick={() => openEditKelompokModal(kelompok)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-[#071E3D] transition-all"
          >
            <Edit size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDeleteKelompok(kelompok)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-red-600 transition-all"
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {units.length > 0 ? (
          units.map((unit, index) => {
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
                            Unit {getUnitUrutan(unit) || index + 1}
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
                      <SmallStat
                        icon={<ClipboardList size={15} />}
                        label="Elemen"
                        value={elemenList.length}
                      />

                      <SmallStat
                        icon={<ListChecks size={15} />}
                        label="KUK"
                        value={elemenList.reduce(
                          (sum, el) => sum + getKukList(el).length,
                          0
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => openEditUnitModal(kelompok, unit)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#182D4A] bg-white border border-[#071E3D]/10 hover:bg-[#CC6B27] hover:text-white hover:border-[#CC6B27] transition-all shadow-sm text-[12px] font-black"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent text-[12px] font-black"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
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
          <div className="rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-8 text-center">
            <Layers size={44} className="mx-auto text-[#071E3D]/20 mb-3" />

            <h4 className="font-black text-[#071E3D] mb-2">
              Belum Ada Unit Kompetensi
            </h4>

            <p className="text-sm text-[#182D4A]/60 font-medium mb-4">
              Tambahkan unit kompetensi untuk kelompok pekerjaan ini.
            </p>

            <button
              type="button"
              onClick={() => openAddUnitModal(kelompok)}
              className="inline-flex px-4 py-2 bg-[#CC6B27] text-white rounded-lg text-[12px] font-black items-center gap-2 shadow-md hover:bg-[#071E3D] transition-all"
            >
              <Plus size={14} /> Tambah Unit
            </button>
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
    <div className="border-t border-[#071E3D]/10 bg-white p-5">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-black text-[#071E3D] text-sm flex items-center gap-2">
          <Layers size={18} className="text-[#CC6B27]" />
          Daftar Elemen Kompetensi
        </h5>

        <button
          type="button"
          onClick={() => handleAddElemen(unit)}
          className="px-3 py-1.5 bg-[#071E3D] text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-[#CC6B27] flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus size={14} /> Tambah Elemen
        </button>
      </div>

      {elemenList.length > 0 ? (
        <div className="space-y-4">
          {elemenList.map((elemen, elemenIndex) => {
            const kukList = getKukList(elemen);

            return (
              <div
                key={getElemenId(elemen) || elemenIndex}
                className="rounded-xl bg-[#FAFAFA] border border-[#071E3D]/10 p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#CC6B27]/20 text-[#CC6B27] flex items-center justify-center font-black shrink-0 shadow-sm">
                    {elemen.urutan || elemenIndex + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest">
                        Elemen Kompetensi
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditElemen(unit, elemen)}
                          className="text-[#182D4A] hover:text-[#CC6B27] bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm transition-colors"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteElemen(elemen)}
                          className="text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-lg p-1.5 shadow-sm transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
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

                        <button
                          type="button"
                          onClick={() => handleAddKuk(elemen)}
                          className="text-[11px] font-black uppercase text-[#071E3D] hover:text-[#CC6B27] bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm"
                        >
                          <Plus size={12} /> Tambah KUK
                        </button>
                      </div>

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
                              className="flex gap-3 text-[13px] font-semibold text-[#182D4A] items-center group bg-[#FAFAFA] p-2 rounded-lg border border-transparent hover:border-slate-200"
                            >
                              <span className="w-7 h-7 rounded-lg bg-white border border-[#071E3D]/10 text-[#CC6B27] flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                                {kuk.urutan || kukIndex + 1}
                              </span>

                              <span className="flex-1">{getKukText(kuk)}</span>

                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleEditKuk(elemen, kuk)}
                                  className="p-1.5 text-[#182D4A] bg-white rounded-md border border-slate-200 hover:text-[#CC6B27] shadow-sm"
                                >
                                  <Edit size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteKuk(kuk)}
                                  className="p-1.5 text-red-500 bg-white rounded-md border border-red-100 hover:text-red-700 shadow-sm"
                                >
                                  <Trash2 size={13} />
                                </button>
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

          <h4 className="font-black text-[#071E3D] mb-2">
            Belum ada Elemen Kompetensi
          </h4>

          <button
            type="button"
            onClick={() => handleAddElemen(unit)}
            className="inline-flex px-4 py-2 mt-2 bg-[#CC6B27] text-white rounded-lg text-[12px] font-black items-center gap-2 shadow-md hover:bg-[#a8561f] transition-all"
          >
            <Plus size={14} /> Tambah Elemen Pertama
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white shadow-sm border border-[#071E3D]/10 p-5 text-[#071E3D] flex flex-col justify-center">
      <p className="text-[11px] text-[#182D4A]/60 font-black uppercase tracking-widest">
        {label}
      </p>

      <h3 className="text-3xl font-black mt-1 leading-none text-[#CC6B27]">
        {value}
      </h3>
    </div>
  );
};

const InfoBox = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl bg-[#FAFAFA] border border-[#071E3D]/10 p-5">
      <div className="flex items-center gap-2 text-[#CC6B27] mb-2">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className="font-black text-[#071E3D] text-sm">{value}</p>
    </div>
  );
};

const SmallStat = ({ icon, label, value }) => {
  return (
    <div className="px-3 py-2 rounded-xl bg-white border border-[#071E3D]/10 text-[#071E3D] text-[12px] font-black inline-flex items-center gap-2 shadow-sm">
      <span className="text-[#CC6B27] bg-orange-50 p-1 rounded-md">
        {icon}
      </span>
      {label}: {value}
    </div>
  );
};

const EmptyBig = ({ icon, title, description, children }) => {
  return (
    <div className="py-16 text-center">
      <div className="text-[#071E3D]/20 mx-auto mb-3 flex justify-center">
        {icon}
      </div>

      <h3 className="text-lg font-black text-[#071E3D]">{title}</h3>

      <p className="text-[#182D4A]/60 font-medium text-sm mt-2 max-w-md mx-auto">
        {description}
      </p>

      {children}
    </div>
  );
};

const ModalWrapper = ({ children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
      {children}
    </div>
  );
};

const ModalHeader = ({ title, icon, onClose }) => {
  return (
    <div className="px-6 py-5 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
      <div className="flex items-center gap-3 text-[#182D4A]">
        <div className="bg-orange-50 p-2 rounded-xl text-[#CC6B27]">
          {icon}
        </div>

        <h3 className="font-black text-[18px] text-[#071E3D]">{title}</h3>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-[#182D4A] bg-white border border-slate-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all shadow-sm"
      >
        <X size={18} />
      </button>
    </div>
  );
};

const ModalFooter = ({ loading, onCancel, submitText }) => {
  return (
    <div className="pt-5 border-t border-[#071E3D]/10 flex justify-end gap-3 mt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 rounded-xl font-black border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-slate-50 text-[13px] uppercase tracking-wider transition-all shadow-sm"
      >
        Batal
      </button>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-xl font-black bg-[#CC6B27] text-white hover:bg-[#071E3D] shadow-md flex items-center gap-2 text-[13px] uppercase tracking-wider transition-all disabled:opacity-70"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {submitText}
      </button>
    </div>
  );
};

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) => {
  return (
    <div>
      <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10"
      />
    </div>
  );
};

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div>
      <label className="text-[12px] font-black text-[#071E3D] uppercase tracking-widest mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <textarea
        name={name}
        rows="4"
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3.5 border border-[#071E3D]/20 rounded-xl text-[#071E3D] bg-[#FAFAFA] font-bold text-[14px] focus:border-[#CC6B27] focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 resize-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default UnitKompetensi;