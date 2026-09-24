// frontend/src/pages/Asesi/APL01.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  Loader2,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ClipboardList,
  PenLine,
  Send,
  Inbox,
  CalendarDays,
  Hash,
  RefreshCcw,
  User,
  BriefcaseBusiness,
  Sparkles,
  ChevronRight,
  UploadCloud,
  ArrowLeft,
  Layers
} from "lucide-react";

const APL01 = () => {
  const { id_peserta } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [peserta, setPeserta] = useState(null);
  const [profile, setProfile] = useState(null);
  const [persyaratan, setPersyaratan] = useState([]);
  const [unitKompetensi, setUnitKompetensi] = useState([]);
  const [apl01, setApl01] = useState(null);
  const [selectedPersyaratan, setSelectedPersyaratan] = useState([]);
  const [dokumenTambahan, setDokumenTambahan] = useState({});
  const [nomorDokumen, setNomorDokumen] = useState({});
  const [tanggalDokumen, setTanggalDokumen] = useState({});
  const [tujuan, setTujuan] = useState("");
  const [tujuanLainnya, setTujuanLainnya] = useState("");

  const ENDPOINT = {
    getProfile: `${API_BASE}/asesi/profile`,
    getForm: `${API_BASE}/asesi/apl01/form/${id_peserta}`,
    getApl01: `${API_BASE}/asesi/apl01/${id_peserta}`,
    createApl01: `${API_BASE}/asesi/apl01/create`,
    uploadDokumen: `${API_BASE}/asesi/apl01/upload`,
    submitFinal: (id_apl01) => `${API_BASE}/asesi/apl01/submit/${id_apl01}`,
  };

  useEffect(() => {
    fetchAPL01Data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_peserta]);

  const getToken = () => localStorage.getItem("token");
  
  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchAPL01Data = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      if (!id_peserta) {
        alert("ID peserta tidak ditemukan di URL.");
        navigate("/asesi/jadwal-saya");
        return;
      }
      const formRes = await axios.get(ENDPOINT.getForm, { headers: getHeaders() });
      const formPayload = formRes.data?.data || formRes.data || {};
      const pesertaData = formPayload.peserta || null;
      const profileFromForm = formPayload.profile || null;
      
      const persyaratanData = [
        ...(formPayload.persyaratan || []),
        ...(formPayload.persyaratanDasar || []),
        ...(formPayload.persyaratanAdministratif || [])
      ];
      const unitKompetensiData =
        formPayload.unit_kompetensi ||
        formPayload.unitKompetensi ||
        formPayload.unit ||
        formPayload.units ||
        [];
        
      setPeserta(pesertaData);
      setProfile(profileFromForm);
      setPersyaratan(persyaratanData);
      setUnitKompetensi(unitKompetensiData);

      if (!profileFromForm) {
        try {
          const profileRes = await axios.get(ENDPOINT.getProfile, { headers: getHeaders() });
          setProfile(profileRes.data?.data || profileRes.data || null);
        } catch (profileErr) {
          console.error("Gagal mengambil profile asesi:", profileErr);
        }
      }

      try {
        const apl01Res = await axios.get(ENDPOINT.getApl01, { headers: getHeaders() });
        const response = apl01Res.data?.data || null;
        const existingApl01 = response?.apl01 || null;
        
        if (existingApl01) {
          setApl01(existingApl01);
          setTujuan(existingApl01.tujuan_asesmen || "");
          setTujuanLainnya(existingApl01.tujuan_lainnya || "");
          
          const dokumenList = getDokumenList(existingApl01);
          const uploadedPersyaratanIds = dokumenList.map((dokumen) => Number(dokumen.id_persyaratan)).filter(Boolean);
          
          setSelectedPersyaratan(uploadedPersyaratanIds);
          
          const nomorMap = {};
          const tanggalMap = {};
          dokumenList.forEach((dokumen) => {
            if (dokumen.id_persyaratan) {
              nomorMap[dokumen.id_persyaratan] = dokumen.nomor_dokumen || "";
              tanggalMap[dokumen.id_persyaratan] = dokumen.tanggal_dokumen || "";
            }
          });
          
          setNomorDokumen(nomorMap);
          setTanggalDokumen(tanggalMap);
        } else {
          setApl01(null);
          setSelectedPersyaratan([]);
          setDokumenTambahan({});
          setNomorDokumen({});
          setTanggalDokumen({});
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("GET APL01 ERROR:", err);
        }
        setApl01(null);
        setSelectedPersyaratan([]);
        setDokumenTambahan({});
        setNomorDokumen({});
        setTanggalDokumen({});
      }
    } catch (err) {
      console.error("GET FORM APL01 ERROR:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Gagal mengambil data APL01.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAPL01Data();
  };

  const getDokumenList = (dataApl01) => {
    return (
      dataApl01?.dokumen ||
      dataApl01?.Apl01Dokumens ||
      dataApl01?.Apl01Dokumen ||
      dataApl01?.apl01_dokumen ||
      dataApl01?.apl01_dokumens ||
      []
    );
  };

  const getPersyaratanInfo = (item) => {
    const dataPersyaratan = item.persyaratan || item.Persyaratan || item.persyaratan_data || item;
    return {
      id_persyaratan: Number(item.id_persyaratan) || Number(dataPersyaratan.id_persyaratan) || Number(dataPersyaratan.id),
      nama_persyaratan: dataPersyaratan.nama_persyaratan || dataPersyaratan.nama || item.nama_persyaratan || "Persyaratan",
      keterangan: dataPersyaratan.keterangan || item.keterangan || item.skema_persyaratan?.keterangan || item.SkemaPersyaratan?.keterangan || "",
      wajib: item.wajib === true || item.wajib === 1 || item.wajib === "1" || item.skema_persyaratan?.wajib === true || item.skema_persyaratan?.wajib === 1 || item.skema_persyaratan?.wajib === "1" || dataPersyaratan.wajib === true || dataPersyaratan.wajib === 1 || dataPersyaratan.wajib === "1",
    };
  };

  const uploadedDokumenIds = useMemo(() => {
    const dokumenList = getDokumenList(apl01);
    return dokumenList.map((dokumen) => Number(dokumen.id_persyaratan)).filter(Boolean);
  }, [apl01]);

  const isSubmitted = apl01?.status === "submit";

  const getSkemaData = () => {
    return (
      peserta?.jadwal?.skema ||
      peserta?.Jadwal?.skema ||
      peserta?.Jadwal?.Skema ||
      peserta?.skema ||
      apl01?.skema ||
      {}
    );
  };

  const getIdSkema = () => peserta?.id_skema || peserta?.jadwal?.id_skema || peserta?.Jadwal?.id_skema || apl01?.id_skema || "-";
  const getIdJadwal = () => peserta?.id_jadwal || apl01?.id_jadwal || "-";
  
  const getJudulSkema = () => {
    const skema = getSkemaData();
    return skema.judul_skema || skema.nama_skema || skema.judul || peserta?.jadwal?.skema?.judul_skema || "-";
  };

  const getNomorSkema = () => {
    const skema = getSkemaData();
    return skema.kode_skema || skema.nomor_skema || skema.nomor || peserta?.jadwal?.skema?.kode_skema || "-";
  };

  const getUnitKode = (unit) => unit.kode_unit || unit.kode || unit.kode_unit_kompetensi || unit.kode_uk || "-";
  const getUnitJudul = (unit) => unit.judul_unit || unit.nama_unit || unit.nama_unit_kompetensi || unit.judul || unit.nama || "-";
  const getUnitStandar = (unit) => unit.jenis_standar || unit.standar || unit.nama_skkni || unit.no_skkni || unit.nomor_skkni || unit.skkni?.judul_skkni || unit.skkni?.nomor_skkni || unit.Skkni?.judul_skkni || unit.Skkni?.nomor_skkni || "-";

  const getProfileValue = (...keys) => {
    for (const key of keys) {
      if (profile?.[key] !== undefined && profile?.[key] !== null && profile?.[key] !== "") {
        return profile[key];
      }
    }
    return "-";
  };

  const formatTanggal = (date) => {
    if (!date || date === "-") return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const handlePersyaratanChange = (e) => {
    const id = Number(e.target.value);
    const checked = e.target.checked;
    if (checked) {
      setSelectedPersyaratan((prev) => prev.includes(id) ? prev : [...prev, id]);
      setDokumenTambahan((prev) => ({ ...prev, [id]: prev[id] || null }));
    } else {
      setSelectedPersyaratan((prev) => prev.filter((value) => value !== id));
      setDokumenTambahan((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      setNomorDokumen((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      setTanggalDokumen((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
    }
  };

  const handleDokumenChange = (id_persyaratan, file) => {
    setDokumenTambahan((prev) => ({ ...prev, [id_persyaratan]: file || null }));
  };
  const handleNomorDokumenChange = (id_persyaratan, value) => {
    setNomorDokumen((prev) => ({ ...prev, [id_persyaratan]: value }));
  };
  const handleTanggalDokumenChange = (id_persyaratan, value) => {
    setTanggalDokumen((prev) => ({ ...prev, [id_persyaratan]: value }));
  };

  const validateForm = () => {
    if (isSubmitted) {
      alert("APL01 sudah disubmit.");
      return false;
    }
    if (!tujuan) {
      alert("Tujuan asesmen wajib dipilih.");
      return false;
    }
    if (tujuan === "lainnya" && !tujuanLainnya.trim()) {
      alert("Tujuan lainnya wajib diisi.");
      return false;
    }
    if (selectedPersyaratan.length === 0) {
      alert("Pilih minimal satu persyaratan.");
      return false;
    }
    for (const id of selectedPersyaratan) {
      const alreadyUploaded = uploadedDokumenIds.includes(Number(id));
      const newFile = dokumenTambahan[id];
      if (!alreadyUploaded && !newFile) {
        alert("Semua persyaratan yang dipilih wajib upload dokumen.");
        return false;
      }
    }
    return true;
  };

  const createAPL01 = async () => {
    const payload = {
      id_peserta: Number(id_peserta),
      tujuan_asesmen: tujuan,
      tujuan_lainnya: tujuan === "lainnya" ? tujuanLainnya : null,
    };
    const res = await axios.post(ENDPOINT.createApl01, payload, { headers: getHeaders() });
    return res.data.data;
  };

  const uploadDokumen = async (id_apl01) => { 
    for (const id_persyaratan of selectedPersyaratan) {
      const file = dokumenTambahan[id_persyaratan];
      if (!file) continue;
      const formData = new FormData();
      formData.append("id_apl01", id_apl01);
      formData.append("id_persyaratan", id_persyaratan);
      formData.append("nomor_dokumen", nomorDokumen[id_persyaratan] || "");
      formData.append("tanggal_dokumen", tanggalDokumen[id_persyaratan] || "");
      formData.append("file_dokumen", file);
      await axios.post(ENDPOINT.uploadDokumen, formData, {
        headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
      });
    }
  };

  const submitFinalAPL01 = async (id_apl01) => {
    await axios.put(ENDPOINT.submitFinal(id_apl01), {}, { headers: getHeaders() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      let currentApl01 = apl01;
      if (!currentApl01) {
        currentApl01 = await createAPL01();
        if (!currentApl01?.id_apl01) {
          alert("APL01 berhasil dibuat, tapi ID APL01 tidak ditemukan.");
          return;
        }
        setApl01(currentApl01);
      }
      const idApl01 = currentApl01.id_apl01 || currentApl01.apl01?.id_apl01;
      await uploadDokumen(idApl01);
      await submitFinalAPL01(idApl01);
      alert("APL01 berhasil disubmit.");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Gagal submit APL01.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = selectedPersyaratan.length;

  if (loading) return <LoadingScreen title="Memuat APL01" desc="Mengambil data formulir aplikasi asesmen." />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 p-6 md:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          
          {/* HEADER SECTION */}
          <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm p-6 lg:p-8">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black leading-tight text-[#071E3D]">
                  Formulir <span className="text-[#CC6B27]">APL.01</span>
                </h1>
                <p className="mt-2 text-[14px] font-medium text-[#182D4A]/70 max-w-2xl">
                  Lengkapi tujuan asesmen, data persyaratan, dan dokumen pendukung sesuai kebutuhan skema sertifikasi Anda.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50"
                  >
                    {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5"
                  >
                    <ArrowLeft size={16} /> Jadwal Saya
                  </button>
                </div>
              </div>

              {/* Status Ringkasan Header */}
              <div className="bg-[#FAFAFA] border border-[#071E3D]/10 rounded-xl p-5 min-w-[280px]">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/50">Status APL.01</p>
                    <p className="text-[14px] font-black text-[#071E3D] capitalize">{apl01?.status || "Belum Dibuat"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#071E3D]/10 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase">Syarat Terpilih</p>
                    <p className="text-lg font-black text-[#071E3D] mt-1">{selectedCount}</p>
                  </div>
                  <div className="bg-white border border-[#071E3D]/10 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase">ID Peserta</p>
                    <p className="text-lg font-black text-[#CC6B27] mt-1">{id_peserta || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            <section className="space-y-6">
              
              {/* DATA PRIBADI */}
              <Card title="Data Pribadi Asesi" icon={<User size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataItem label="Nama Lengkap" value={getProfileValue("nama_lengkap", "nama", "nama_asesi")} />
                  <DataItem label="Tempat Lahir" value={getProfileValue("tempat_lahir")} />
                  <DataItem label="Tanggal Lahir" value={formatTanggal(getProfileValue("tanggal_lahir", "tgl_lahir"))} />
                  <DataItem label="Jenis Kelamin" value={getProfileValue("jenis_kelamin", "gender")} />
                  <DataItem label="Kebangsaan" value={getProfileValue("kebangsaan", "kewarganegaraan", "warga_negara")} />
                  <DataItem label="Pendidikan Terakhir" value={getProfileValue("pendidikan_terakhir", "pendidikan")} />
                  <div className="md:col-span-2">
                    <DataItem label="Alamat Rumah" value={getProfileValue("alamat_rumah", "alamat")} />
                  </div>
                </div>
              </Card>

              {/* DATA PEKERJAAN */}
              <Card title="Data Pekerjaan / Perusahaan" icon={<BriefcaseBusiness size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataItem label="Jabatan" value={getProfileValue("jabatan", "pekerjaan")} />
                  <DataItem label="Lembaga / Perusahaan" value={getProfileValue("nama_lembaga", "nama_perusahaan", "lembaga", "perusahaan")} />
                  <div className="md:col-span-2">
                    <DataItem label="Alamat Perusahaan" value={getProfileValue("alamat_perusahaan", "alamat_kantor")} />
                  </div>
                  <DataItem label="No. Telp Perusahaan" value={getProfileValue("no_telp_perusahaan", "telp_perusahaan", "no_telp_kantor", "telepon_perusahaan")} />
                  <DataItem label="Fax Perusahaan" value={getProfileValue("fax", "no_fax", "fax_perusahaan", "no_fax_perusahaan")} />
                  <DataItem label="Email Perusahaan" value={getProfileValue("email_perusahaan", "email_kantor", "email_lembaga")} />
                </div>
              </Card>

              {/* DATA SERTIFIKASI & TUJUAN */}
              <Card title="Data Sertifikasi & Tujuan" icon={<ShieldCheck size={18} />}>
                <div className="space-y-6">
                  {/* Skema Info */}
                  <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#071E3D]/10">
                      <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-[#071E3D]/10">
                        <p className="text-[13px] font-bold text-[#071E3D]">Skema Sertifikasi</p>
                        <p className="text-[11px] text-[#182D4A]/50 font-semibold mt-1 uppercase tracking-wider">KKNI / Okupasi / Klaster</p>
                      </div>
                      <div className="lg:col-span-8 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#071E3D]/10">
                          <div className="md:col-span-1 bg-[#FAFAFA] p-4 flex items-center"><p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wide">Judul</p></div>
                          <div className="md:col-span-3 p-4"><p className="text-[13px] font-bold text-[#071E3D]">{getJudulSkema()}</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4">
                          <div className="md:col-span-1 bg-[#FAFAFA] p-4 flex items-center"><p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wide">Nomor</p></div>
                          <div className="md:col-span-3 p-4"><p className="text-[13px] font-mono font-bold text-[#CC6B27]">{getNomorSkema()}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tujuan Asesmen */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-[#071E3D]/10 overflow-hidden bg-[#FAFAFA]">
                    <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-[#071E3D]/10 flex items-center">
                      <p className="text-[13px] font-bold text-[#071E3D]">Tujuan Asesmen</p>
                    </div>
                    <div className="lg:col-span-8 bg-white p-5">
                      <div className="flex flex-col gap-3">
                        <RadioTujuan label="Sertifikasi" value="sertifikasi" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                        <RadioTujuan label="Sertifikasi Ulang" value="sertifikasi_ulang" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                        <RadioTujuan label="Pengakuan Kompetensi Terkini (PKT)" value="pkk" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                        <RadioTujuan label="Rekognisi Pembelajaran Lampau" value="rpl" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                        <RadioTujuan label="Lainnya" value="lainnya" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                        {tujuan === "lainnya" && (
                          <input
                            type="text"
                            placeholder="Tuliskan tujuan asesmen lainnya"
                            value={tujuanLainnya}
                            onChange={(e) => setTujuanLainnya(e.target.value)}
                            disabled={isSubmitted}
                            className="mt-2 w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] text-[13px] text-[#071E3D] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            required
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unit Kompetensi */}
                  <div>
                    <h3 className="text-[14px] font-bold text-[#071E3D] mb-3 flex items-center gap-2 border-b border-[#071E3D]/10 pb-2">
                      <Layers size={16} className="text-[#CC6B27]"/> Daftar Unit Kompetensi 
                    </h3>
                    {unitKompetensi.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
                        <table className="w-full min-w-[760px] text-left bg-white">
                          <thead className="bg-[#071E3D]">
                            <tr>
                              <th className="p-3.5 text-center text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12">No</th>
                              <th className="p-3.5 text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27]">Kode Unit</th>
                              <th className="p-3.5 text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul Unit</th>
                              <th className="p-3.5 text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27]">Jenis Standar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unitKompetensi.map((unit, index) => (
                              <tr key={unit.id_unit || unit.id_unit_kompetensi || index} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                                <td className="p-3 text-center text-[13.5px] font-semibold text-[#071E3D]">{index + 1}</td>
                                <td className="p-3 font-mono text-[13px] font-bold text-[#CC6B27]">{getUnitKode(unit)}</td>
                                <td className="p-3 text-[13px] font-bold text-[#071E3D]">
                                  {getUnitJudul(unit)} <CheckCircle size={14} className="inline text-green-500 ml-1 mb-0.5" />
                                </td>
                                <td className="p-3 text-[12px] font-medium text-[#182D4A]/80">{getUnitStandar(unit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState icon={<Inbox size={32} />} title="Unit Kompetensi Kosong" desc="Backend belum mengirim data unit_kompetensi untuk skema ini." />
                    )}
                  </div>
                </div>
              </Card>

              {/* PERSYARATAN */}
              <Card title="Persyaratan & Dokumen Skema" icon={<FileText size={18} />}>
                {persyaratan.length > 0 ? (
                  <div className="space-y-4">
                    {persyaratan.map((item, index) => {
                      const p = getPersyaratanInfo(item);
                      const id = Number(p.id_persyaratan);
                      if (!id) return null;
                      const checked = selectedPersyaratan.includes(id);
                      const uploadedFile = dokumenTambahan[id];
                      const alreadyUploaded = uploadedDokumenIds.includes(id);
                      return (
                        <div key={`${id}-${index}`} className={`rounded-xl border transition-all ${checked ? "bg-[#CC6B27]/5 border-[#CC6B27]/30" : "bg-white border-[#071E3D]/10 hover:bg-slate-50"} p-5`}>
                          <label className="flex items-start gap-4 cursor-pointer">
                            <input
                              type="checkbox"
                              value={id}
                              checked={checked}
                              onChange={handlePersyaratanChange}
                              disabled={isSubmitted}
                              className="mt-1 w-4 h-4 text-[#CC6B27] border-gray-300 rounded focus:ring-[#CC6B27] disabled:opacity-50"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h3 className="text-[14px] font-bold text-[#071E3D]">{p.nama_persyaratan || `Persyaratan ${id}`}</h3>
                                {p.wajib && <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider">Wajib</span>}
                                {alreadyUploaded && <span className="px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12} />Tersimpan</span>}
                                {checked && uploadedFile && <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><UploadCloud size={12} />File Baru Siap</span>}
                              </div>
                              {p.keterangan ? (
                                <p className="text-[12px] font-medium text-[#182D4A]/70">{p.keterangan}</p>
                              ) : (
                                <p className="text-[12px] font-medium text-[#182D4A]/50 italic">Centang dan unggah dokumen pendukung yang sesuai.</p>
                              )}
                            </div>
                          </label>

                          {checked && (
                            <div className="mt-5 ml-0 md:ml-8 space-y-4 border-t border-[#071E3D]/10 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldWithIcon
                                  label="Nomor Dokumen"
                                  icon={<Hash size={16} />}
                                  type="text"
                                  placeholder="Masukkan nomor (opsional)"
                                  value={nomorDokumen[id] || ""}
                                  onChange={(value) => handleNomorDokumenChange(id, value)}
                                  disabled={isSubmitted}
                                />
                                <FieldWithIcon
                                  label="Tanggal Dokumen"
                                  icon={<CalendarDays size={16} />}
                                  type="date"
                                  value={tanggalDokumen[id] || ""}
                                  onChange={(value) => handleTanggalDokumenChange(id, value)}
                                  disabled={isSubmitted}
                                />
                              </div>
                              {!isSubmitted && (
                                <div>
                                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#071E3D] mb-1.5">Upload Dokumen</label>
                                  <label className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-white border border-[#071E3D]/20 p-4 cursor-pointer hover:border-[#CC6B27] hover:bg-[#FAFAFA] transition-all group">
                                    <div className="w-10 h-10 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                      <Upload size={18} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[13px] font-bold text-[#071E3D]">
                                        {uploadedFile ? uploadedFile.name : alreadyUploaded ? "Pilih file untuk memperbarui dokumen" : "Klik untuk memilih file"}
                                      </p>
                                      <p className="text-[11px] text-[#182D4A]/50 font-medium mt-0.5">Format didukung: PDF, JPG, PNG.</p>
                                    </div>
                                    <input
                                      type="file"
                                      onChange={(e) => handleDokumenChange(id, e.target.files?.[0] || null)}
                                      className="hidden"
                                      required={!alreadyUploaded}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState icon={<Inbox size={32} />} title="Tidak Ada Persyaratan" desc="Tidak ada persyaratan administratif untuk skema ini." />
                )}
              </Card>
            </section>

            {/* ASIDE - SIDEBAR ACTIONS */}
            <aside>
              <div className="sticky top-6 space-y-5">
                
                <div className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-3">
                    <AlertCircle size={16} className="text-[#CC6B27]" /> Info Sistem
                  </h4>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-[12px] text-blue-700 font-medium">
                      Data asesi disimpan ke <code className="font-bold">apl01_asesmen</code> dan berkas ke <code className="font-bold">apl01_dokumen</code>.
                    </div>
                    {apl01 && (
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-[12px] text-green-700 font-medium flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1"><CheckCircle size={14}/> Form Telah Tersimpan</span>
                        <span>ID Dokumen: {apl01.id_apl01}</span>
                        <span className="capitalize">Status: {apl01.status}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden">
                  <div className="bg-[#071E3D] p-5 text-white">
                    <h3 className="font-black text-[16px] mb-1">Ringkasan Form</h3>
                    <p className="text-[12px] text-white/70">Periksa kembali data Anda</p>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <SummaryItem label="ID Peserta" value={id_peserta || "-"} />
                    <SummaryItem label="ID Jadwal" value={getIdJadwal()} />
                    <SummaryItem label="ID Skema" value={getIdSkema()} />
                    <SummaryItem label="Syarat Tercentang" value={`${selectedCount} Berkas`} />
                    <SummaryItem label="Tujuan Asesmen" value={tujuan ? tujuan.replace(/_/g, " ") : "-"} />
                    <SummaryItem label="Status Dokumen" value={apl01?.status || "Draft Baru"} highlight />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isSubmitted}
                  className={`w-full px-5 py-3 rounded-lg text-white font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 ${
                    submitting || isSubmitted ? "bg-slate-300 text-slate-500 cursor-not-allowed border-none" : "bg-[#CC6B27] hover:bg-[#a8561f]"
                  }`}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : isSubmitted ? <CheckCircle size={16} /> : <Send size={16} />}
                  {isSubmitted ? "Form Telah Disubmit" : submitting ? "Menyimpan Data..." : "Submit APL.01"}
                </button>

              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

function LoadingScreen({ title, desc }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-lg p-8 text-center max-w-sm w-full">
        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-4" size={36} />
        <h2 className="text-[#071E3D] font-black text-lg">{title}</h2>
        <p className="text-[#182D4A]/70 text-sm mt-1 font-medium">{desc}</p>
      </div>
    </div>
  );
}

const Card = ({ title, icon, children }) => {
  return (
    <section className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-[#071E3D]/10 flex items-center gap-3 bg-[#FAFAFA]">
        <div className="w-9 h-9 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-[16px] font-bold text-[#071E3D]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
};

const RadioTujuan = ({ label, value, tujuan, setTujuan, disabled }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-[#071E3D]/10 transition-colors">
      <input
        type="radio"
        name="tujuan_asesmen"
        value={value}
        checked={tujuan === value}
        onChange={(e) => setTujuan(e.target.value)}
        disabled={disabled}
        className="w-4 h-4 text-[#CC6B27] border-gray-300 focus:ring-[#CC6B27] disabled:opacity-50"
      />
      <span className="text-[13px] font-semibold text-[#071E3D]">{label}</span>
    </label>
  );
};

const DataItem = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-[#FAFAFA] border border-[#071E3D]/10 p-3.5">
      <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[13px] font-bold text-[#071E3D] break-words">{value || "-"}</p>
    </div>
  );
};

const FieldWithIcon = ({ label, icon, type = "text", placeholder = "", value, onChange, disabled }) => {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#071E3D] mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] transition-all text-[13px] text-[#071E3D] font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, highlight }) => {
  return (
    <div className="flex justify-between items-center border-b border-[#071E3D]/5 pb-2 last:border-0 last:pb-0">
      <span className="text-[12px] font-bold text-[#182D4A]/60 uppercase tracking-wide">{label}</span>
      <span className={`text-[13px] font-black capitalize ${highlight ? "text-[#CC6B27]" : "text-[#071E3D]"}`}>{value}</span>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => {
  return (
    <div className="text-center py-10 px-6 bg-[#FAFAFA] rounded-xl border border-dashed border-[#071E3D]/20">
      <div className="mx-auto mb-3 text-[#182D4A]/30 flex justify-center">{icon}</div>
      <h3 className="text-[15px] font-bold text-[#071E3D] mb-1">{title}</h3>
      <p className="text-[13px] font-medium text-[#182D4A]/60">{desc}</p>
    </div>
  );
};

export default APL01;