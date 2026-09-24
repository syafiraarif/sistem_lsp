import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  PenLine,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  XCircle,
  UploadCloud,
  Layers,
  Inbox
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API.replace("/api", "");

export default function APL02() {
  const { id_skema } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [idPeserta, setIdPeserta] = useState(
    location.state?.id_peserta ||
      location.state?.idPeserta ||
      localStorage.getItem(`id_peserta_skema_${id_skema}`) ||
      ""
  );

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skema, setSkema] = useState(null);
  const [formUnits, setFormUnits] = useState([]);
  const [apl02, setApl02] = useState(null);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [rekomendasi, setRekomendasi] = useState("");
  const [pendekatan, setPendekatan] = useState("");
  const [openUnits, setOpenUnits] = useState({});
  const loadedRef = useRef(false);
  const token = localStorage.getItem("token");
  
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadPage();
  }, []);

  const resolveIdPeserta = async () => {
    if (idPeserta) return idPeserta;
    try {
      const res = await axios.get(`${API}/asesi/jadwal-saya`, { headers });
      const data = res.data?.data || [];
      const matched = data.find((item) => {
        const jadwal = item.jadwal || item.Jadwal || {};
        const skemaData = jadwal.skema || jadwal.Skema || {};
        const currentIdSkema = item.id_skema || jadwal.id_skema || skemaData.id_skema;
        return Number(currentIdSkema) === Number(id_skema);
      });
      const pesertaId = matched?.id_peserta || matched?.id_peserta_jadwal || matched?.id || matched?.id_pendaftaran;
      if (pesertaId) {
        setIdPeserta(pesertaId);
        localStorage.setItem(`id_peserta_skema_${id_skema}`, pesertaId);
      }
      return pesertaId || "";
    } catch (err) {
      console.error("RESOLVE ID PESERTA ERROR:", err);
      return "";
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");
      if (!token) {
        navigate("/login");
        return;
      }
      const pesertaId = await resolveIdPeserta();
      const [formRes, profileRes, fileRes] = await Promise.allSettled([
        axios.get(`${API}/asesi/apl02/form/${id_skema}`, { headers }),
        axios.get(`${API}/asesi/profile`, { headers }),
        axios.get(`${API}/asesi/profile/files`, { headers })
      ]);

      if (formRes.status !== "fulfilled") throw formRes.reason;
      
      setSkema(formRes.value.data?.data?.skema || null);
      setFormUnits(formRes.value.data?.data?.units || []);
      
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data?.data || null);
      if (fileRes.status === "fulfilled") setFiles(fileRes.value.data?.data || {});

      if (!pesertaId) {
        setError("ID peserta tidak ditemukan. Buka APL02 dari halaman Jadwal Saya.");
        return;
      }
      const created = await axios.post(`${API}/asesi/apl02/create`, { id_peserta: pesertaId }, { headers });
      const apl02Data = created.data?.data || null;
      setApl02(apl02Data);
      await loadExistingApl02(pesertaId, apl02Data);
    } catch (err) {
      console.error("LOAD APL02 ERROR:", err);
      setError(err.response?.data?.message || err.message || "Gagal memuat APL02.");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingApl02 = async (pesertaId = idPeserta, fallback = null) => {
    try {
      const res = await axios.get(`${API}/asesi/apl02/${pesertaId}`, { headers });
      const data = res.data?.data || fallback;
      if (!data) return;
      
      setApl02(data);
      setRekomendasi(data.rekomendasi_asesi || "");
      setPendekatan(data.pendekatan_rekomendasi || "");
      
      const mapped = {};
      (data.detail || []).forEach((item) => {
        mapped[item.id_elemen] = {
          id_detail: item.id_detail,
          id_elemen: item.id_elemen,
          kompeten: item.kompeten || "",
          catatan: item.catatan || "",
          buktiTambahan: item.buktiTambahan || []
        };
      });
      setAnswers(mapped);
    } catch (err) {
      if (err.response?.status !== 404) console.error("GET APL02 ERROR:", err);
    }
  };

  const getImageSrc = (filePath) => {
    if (!filePath) return "";
    if (String(filePath).startsWith("http")) return filePath;
    return `${APP_BASE}/${String(filePath).replace(/^\/+/, "")}`;
  };

  const ttdUrl = files.ttd || files.tanda_tangan || files.ttd_path || getImageSrc(profile?.ttd_path);
  const isLocked = apl02?.status === "submitted";

  const getUnit = (row) => row?.unit || row?.UnitKompetensi || row;
  const getUnitKode = (unit) => unit?.kode_unit || unit?.kode || unit?.kode_kompetensi || unit?.kode_unit_kompetensi || "-";
  const getUnitJudul = (unit) => unit?.judul_unit || unit?.nama_unit || unit?.judul || unit?.nama_unit_kompetensi || "-";
  const getElemenList = (unit) => unit?.elemen || unit?.UnitElemen || unit?.unit_elemen || [];
  const getElemenText = (elemen) => elemen?.nama_elemen || elemen?.elemen_kompetensi || elemen?.judul_elemen || elemen?.elemen || elemen?.deskripsi || "-";
  const getKukList = (elemen) => elemen?.kuk || elemen?.UnitKuk || elemen?.unit_kuk || [];
  const getKukText = (kuk) => kuk?.uraian || kuk?.kriteria_unjuk_kerja || kuk?.kuk || kuk?.deskripsi || kuk?.pertanyaan || kuk?.nama_kuk || "-";

  const totalElemen = useMemo(() => {
    return formUnits.reduce((total, row) => total + getElemenList(getUnit(row)).length, 0);
  }, [formUnits]);

  const totalTerisi = useMemo(() => {
    return Object.values(answers).filter((item) => item?.kompeten).length;
  }, [answers]);

  const totalBukti = useMemo(() => {
    return Object.values(answers).reduce((total, item) => total + (item?.buktiTambahan?.length || 0), 0);
  }, [answers]);

  const progress = totalElemen > 0 ? Math.round((totalTerisi / totalElemen) * 100) : 0;

  const updateAnswer = (id_elemen, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id_elemen]: { ...prev[id_elemen], id_elemen, [field]: value }
    }));
  };

  const toggleUnit = (unitIndex) => {
    setOpenUnits((prev) => ({
      ...prev,
      [unitIndex]: prev[unitIndex] === undefined ? false : !prev[unitIndex]
    }));
  };

  const savePenilaian = async (id_elemen) => {
    const answer = answers[id_elemen] || {};
    if (!answer.fileBukti) { alert("Upload bukti terlebih dahulu."); return; }
    if (!answer.kompeten) { alert("Pilih K atau BK dulu."); return; }
    if (!apl02?.id_apl02) { alert("APL02 belum dibuat. Refresh halaman."); return; }
    if (isLocked) { alert("APL02 sudah submit."); return; }
    
    try {
      setSavingKey(`penilaian-${id_elemen}`);
      const unit = formUnits.find((u) => getElemenList(getUnit(u)).some((e) => Number(e.id_elemen) === Number(id_elemen)));
      if (!unit) { alert("Unit kompetensi tidak ditemukan."); return; }
      
      const res = await axios.post(`${API}/asesi/apl02/penilaian`, {
        id_apl02: apl02.id_apl02,
        id_unit: getUnit(unit).id_unit,
        id_elemen,
        kompeten: answer.kompeten,
        catatan: answer.catatan || ""
      }, { headers });
      
      const detail = res.data.data;
      if (answer.fileBukti) {
        const formData = new FormData();
        formData.append("id_detail", detail.id_detail);
        formData.append("file_bukti", answer.fileBukti);
        await axios.post(`${API}/asesi/apl02/upload`, formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" }
        });
        await loadExistingApl02();
      }
      setAnswers((prev) => ({
        ...prev,
        [id_elemen]: { ...prev[id_elemen], id_detail: detail.id_detail, fileBukti: null }
      }));
      alert("Penilaian berhasil disimpan.");
    } catch (err) {
      console.error("SAVE PENILAIAN ERROR:", err);
      alert(err.response?.data?.message || "Gagal menyimpan penilaian.");
    } finally {
      setSavingKey("");
    }
  };

  const hapusBukti = async (id_bukti) => {
    if (!window.confirm("Yakin ingin menghapus bukti ini?")) return;
    try {
      await axios.delete(`${API}/asesi/apl02/bukti/${id_bukti}`, { headers });
      await loadExistingApl02();
      alert("Bukti berhasil dihapus.");
    } catch (err) {
      console.error("HAPUS BUKTI ERROR:", err);
      alert(err.response?.data?.message || "Gagal menghapus bukti.");
    }
  };

  const saveRekomendasi = async (silent = false) => {
    if (!apl02?.id_apl02) {
      if (!silent) alert("APL02 belum dibuat.");
      return false;
    }
    if (isLocked) {
      if (!silent) alert("APL02 sudah submit.");
      return false;
    }
    try {
      setSavingKey("rekomendasi");
      await axios.post(`${API}/asesi/apl02/rekomendasi`, {
        id_apl02: apl02.id_apl02,
        rekomendasi_asesi: rekomendasi,
        pendekatan_rekomendasi: pendekatan
      }, { headers });
      if (!silent) alert("Rekomendasi berhasil disimpan.");
      return true;
    } catch (err) {
      console.error("SAVE REKOMENDASI ERROR:", err);
      if (!silent) alert(err.response?.data?.message || "Gagal menyimpan rekomendasi.");
      return false;
    } finally {
      setSavingKey("");
    }
  };

  const submitApl02 = async () => {
    if (!apl02?.id_apl02) { alert("APL02 belum dibuat."); return; }
    if (totalTerisi !== totalElemen) { alert("Masih ada elemen kompetensi yang belum diisi."); return; }
    try {
      setSubmitting(true);
      const saved = await saveRekomendasi(true);
      if (!saved) return;
      await axios.put(`${API}/asesi/apl02/submit/${apl02.id_apl02}`, {}, { headers });
      alert("APL02 berhasil disubmit.");
      await loadPage();
    } catch (err) {
      console.error("SUBMIT APL02 ERROR:", err);
      alert(err.response?.data?.message || "Gagal submit APL02.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = () => {
    if (!idPeserta) { alert("ID peserta tidak ditemukan."); return; }
    window.open(`${API}/asesi/apl02/pdf/${idPeserta}`, "_blank");
  };

  const formatTanggal = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (loading) {
    return <LoadingScreen title="Memuat APL.02" desc="Menyiapkan formulir asesmen mandiri Anda." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* PENAMBAHAN min-w-0 DI SINI SANGAT PENTING AGAR FLEX-1 BISA MENYUSUT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden min-w-0">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          
          {/* HEADER SECTION */}
          <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm p-6 lg:p-8">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              
              {/* PENAMBAHAN min-w-0 AGAR TEKS BISA WRAPPING SAAT DI ZOOM */}
              <div className="min-w-0">
                <h1 className="text-3xl lg:text-4xl font-black leading-tight text-[#071E3D] break-words">
                  Formulir <span className="text-[#CC6B27]">APL.02</span>
                </h1>
                <p className="mt-2 text-[14px] font-medium text-[#182D4A]/70 max-w-2xl break-words">
                  Asesmen Mandiri: {skema?.judul_skema || "Skema Sertifikasi"} <br/>
                  Lengkapi setiap elemen kompetensi, pilih kompeten atau belum, lalu lampirkan bukti relevan.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={loadPage}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
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

              {/* MENGHAPUS min-w-[320px] DAN MENGGANTINYA DENGAN w-full lg:w-[320px] */}
              <div className="bg-[#FAFAFA] border border-[#071E3D]/10 rounded-xl p-5 w-full lg:w-[320px] xl:w-[360px] shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/50">Status APL.02</p>
                    <p className="text-[14px] font-black text-[#071E3D] capitalize">{apl02?.status === "submitted" ? "Sudah Disubmit" : "Draft"}</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-bold text-[#182D4A]/60 mb-1">
                    <span>Progres Pengisian</span>
                    <span className="text-[#CC6B27]">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#182D4A]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#CC6B27] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#071E3D]/10 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase">Terisi</p>
                    <p className="text-lg font-black text-[#071E3D] mt-1">{totalTerisi} / {totalElemen}</p>
                  </div>
                  <div className="bg-white border border-[#071E3D]/10 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase">Total Bukti</p>
                    <p className="text-lg font-black text-[#CC6B27] mt-1">{totalBukti}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold leading-relaxed text-red-600">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MAIN FORM GRID: DIPERBAIKI DENGAN lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] DAN min-w-0 */}
          <form className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-6 items-start w-full min-w-0">
            
            <section className="space-y-6 min-w-0 w-full">
              
              {/* INFORMASI SKEMA CARD */}
              <Card title="Informasi Asesmen" icon={<BookOpen size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataItem label="Judul Skema" value={skema?.judul_skema || "-"} />
                  <DataItem label="Nomor Skema" value={skema?.kode_skema || "-"} />
                  <DataItem label="ID Peserta" value={idPeserta || "-"} />
                  <DataItem label="ID APL.02" value={apl02?.id_apl02 || "-"} />
                </div>
                <div className="mt-4 rounded-xl border border-[#CC6B27]/20 bg-[#CC6B27]/5 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#CC6B27] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#071E3D]">Panduan Pengisian</h4>
                    <ul className="mt-1 list-disc list-inside text-[12px] font-medium text-[#182D4A]/70 space-y-1">
                      <li>Pilih <strong>K (Kompeten)</strong> atau <strong>BK (Belum Kompeten)</strong> pada tiap elemen.</li>
                      <li>Unggah bukti yang relevan atau tuliskan pengalaman Anda.</li>
                      <li>Simpan setiap elemen yang telah diisi.</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* DAFTAR UNIT KOMPETENSI */}
              {formUnits.length === 0 ? (
                <EmptyState icon={<Inbox size={32} />} title="Unit Kompetensi Kosong" desc="Belum ada data unit, elemen, dan KUK untuk skema ini." />
              ) : (
                <div className="space-y-5 w-full">
                  {formUnits.map((row, unitIndex) => {
                    const unit = getUnit(row);
                    const elemenList = getElemenList(unit);
                    const isUnitOpen = openUnits[unitIndex] !== false;
                    const unitTerisi = elemenList.filter((elemen) => answers[elemen.id_elemen]?.kompeten).length;

                    return (
                      <div key={row.id_unit || unit.id_unit || unitIndex} className="rounded-xl border border-[#071E3D]/10 bg-white shadow-sm overflow-hidden w-full">
                        
                        {/* Unit Header */}
                        <div 
                          onClick={() => toggleUnit(unitIndex)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-[#FAFAFA] border-b border-[#071E3D]/10 cursor-pointer hover:bg-slate-50 transition-colors gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center shrink-0">
                              <Layers size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="bg-[#071E3D] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Unit {unitIndex + 1}</span>
                                <span className="text-[11px] font-bold text-[#182D4A]/50">{unitTerisi}/{elemenList.length} Elemen</span>
                              </div>
                              <h3 className="text-[14px] md:text-[15px] font-bold text-[#071E3D] truncate whitespace-normal">{getUnitJudul(unit)}</h3>
                              <p className="text-[12px] font-semibold text-[#CC6B27] truncate">{getUnitKode(unit)}</p>
                            </div>
                          </div>
                          <div className="self-end sm:self-auto shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#071E3D]/20 text-[#071E3D] hover:bg-[#071E3D]/5">
                            {isUnitOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>

                        {/* Unit Content / Table */}
                        {isUnitOpen && (
                          <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[800px] lg:min-w-[900px] text-left">
                              <thead className="bg-[#071E3D]">
                                <tr>
                                  <th className="p-3 md:p-4 text-center text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12">No</th>
                                  <th className="p-3 md:p-4 text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27]">Elemen & KUK</th>
                                  <th className="p-3 md:p-4 text-center text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-16 md:w-20">K</th>
                                  <th className="p-3 md:p-4 text-center text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-16 md:w-20">BK</th>
                                  <th className="p-3 md:p-4 text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[280px]">Bukti & Catatan</th>
                                  <th className="p-3 md:p-4 text-center text-[11px] font-semibold text-[#FAFAFA] uppercase tracking-wider border-b-4 border-[#CC6B27] w-24">Simpan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {elemenList.length === 0 ? (
                                  <tr>
                                    <td colSpan="6" className="px-5 py-8 text-center text-[13px] font-medium text-[#182D4A]/50">
                                      Elemen belum tersedia.
                                    </td>
                                  </tr>
                                ) : (
                                  elemenList.map((elemen, elemenIndex) => {
                                    const idElemen = elemen.id_elemen;
                                    const answer = answers[idElemen] || {};
                                    const kukList = getKukList(elemen);
                                    const isSaving = savingKey === `penilaian-${idElemen}`;

                                    return (
                                      <tr key={idElemen || elemenIndex} className={`border-b border-[#071E3D]/5 transition-colors align-top ${answer.kompeten ? "bg-white" : "bg-[#CC6B27]/5"}`}>
                                        <td className="p-3 md:p-4 text-center text-[13px] font-bold text-[#071E3D]">{elemenIndex + 1}</td>
                                        <td className="p-3 md:p-4">
                                          <h4 className="font-bold text-[13px] md:text-[14px] text-[#071E3D] mb-3">{getElemenText(elemen)}</h4>
                                          <div className="bg-[#FAFAFA] border border-[#071E3D]/10 rounded-lg p-3 md:p-4">
                                            <p className="text-[10px] font-bold uppercase text-[#182D4A]/50 mb-2">Kriteria Unjuk Kerja</p>
                                            {kukList.length === 0 ? (
                                              <p className="text-[12px] text-[#182D4A]/60 italic">KUK belum tersedia.</p>
                                            ) : (
                                              <ol className="list-decimal list-outside ml-4 space-y-1.5 text-[11px] md:text-[12px] font-medium text-[#182D4A]/80">
                                                {kukList.map((kuk, kukIndex) => (
                                                  <li key={kuk.id_kuk || kukIndex} className="pl-1">
                                                    {getKukText(kuk)}
                                                  </li>
                                                ))}
                                              </ol>
                                            )}
                                          </div>
                                        </td>
                                        
                                        <td className="p-3 md:p-4 text-center">
                                          <label className={`mx-auto flex h-9 w-9 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-lg border-2 transition-all ${
                                            answer.kompeten === "K" ? "border-[#CC6B27] bg-[#CC6B27]/10 text-[#CC6B27]" : "border-slate-200 bg-white text-slate-300 hover:border-[#CC6B27]/50"
                                          } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}>
                                            <input
                                              type="checkbox"
                                              checked={answer.kompeten === "K"}
                                              disabled={isLocked}
                                              onChange={() => updateAnswer(idElemen, "kompeten", "K")}
                                              className="sr-only"
                                            />
                                            <span className="text-[13px] md:text-[14px] font-black">K</span>
                                          </label>
                                        </td>
                                        <td className="p-3 md:p-4 text-center">
                                          <label className={`mx-auto flex h-9 w-9 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-lg border-2 transition-all ${
                                            answer.kompeten === "BK" ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-300 hover:border-red-300"
                                          } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}>
                                            <input
                                              type="checkbox"
                                              checked={answer.kompeten === "BK"}
                                              disabled={isLocked}
                                              onChange={() => updateAnswer(idElemen, "kompeten", "BK")}
                                              className="sr-only"
                                            />
                                            <span className="text-[13px] md:text-[14px] font-black">BK</span>
                                          </label>
                                        </td>

                                        <td className="p-3 md:p-4">
                                          {!isLocked && (
                                            <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-3 cursor-pointer hover:border-[#CC6B27] hover:bg-[#CC6B27]/5 transition-all text-center group mb-3">
                                              <input
                                                type="file"
                                                className="hidden"
                                                disabled={isLocked}
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) updateAnswer(idElemen, "fileBukti", file);
                                                }}
                                              />
                                              <UploadCloud size={18} className="text-[#CC6B27] mb-1.5 group-hover:scale-110 transition-transform" />
                                              <span className="text-[11px] md:text-[12px] font-bold text-[#071E3D]">{answer.fileBukti ? "File Siap" : "Unggah Bukti (Opsional)"}</span>
                                              <span className="text-[10px] text-[#182D4A]/50 mt-1 truncate w-full px-2">{answer.fileBukti ? answer.fileBukti.name : "PDF, JPG, PNG"}</span>
                                            </label>
                                          )}

                                          {answer.buktiTambahan?.length > 0 && (
                                            <div className="mb-3 space-y-2">
                                              {answer.buktiTambahan.map((file) => (
                                                <div key={file.id_bukti} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileCheck2 size={14} className="text-green-600 shrink-0" />
                                                    <span className="text-[10px] font-semibold text-green-800 truncate">{file.nama_file || file.nama_dokumen || "Bukti"}</span>
                                                  </div>
                                                  <div className="flex gap-1 shrink-0">
                                                    <a href={getImageSrc(file.file_path)} target="_blank" rel="noreferrer" className="p-1.5 rounded-md bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors">
                                                      <FileText size={12} />
                                                    </a>
                                                    {!isLocked && (
                                                      <button onClick={() => hapusBukti(file.id_bukti)} className="p-1.5 rounded-md bg-white text-red-600 hover:bg-red-50 border border-red-100 transition-colors">
                                                        <Trash2 size={12} />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          <textarea
                                            value={answer.catatan || ""}
                                            disabled={isLocked}
                                            onChange={(e) => updateAnswer(idElemen, "catatan", e.target.value)}
                                            placeholder="Catatan relevan..."
                                            className="w-full min-h-[70px] p-2.5 text-[11px] md:text-[12px] bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] transition-all disabled:opacity-60"
                                          />
                                        </td>
                                        
                                        <td className="p-3 md:p-4 text-center">
                                          <button
                                            type="button"
                                            disabled={isLocked || isSaving}
                                            onClick={() => savePenilaian(idElemen)}
                                            className="mx-auto flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-[#CC6B27] text-white hover:bg-[#a8561f] transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
                                          >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BAGIAN AKHIR / REKOMENDASI ASESI */}
              <Card title="Bagian Akhir: Rekomendasi Asesi" icon={<PenLine size={18} />}>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#071E3D] mb-1.5">Rekomendasi untuk Asesi</label>
                  <textarea
                    value={rekomendasi}
                    disabled={isLocked}
                    onChange={(e) => setRekomendasi(e.target.value)}
                    placeholder="Tulis rekomendasi untuk asesi..."
                    className="w-full min-h-[120px] p-4 text-[13px] bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] transition-all disabled:opacity-60"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#071E3D] mb-1.5">Pendekatan Asesmen</label>
                  <input
                    type="text"
                    value={pendekatan}
                    disabled={isLocked}
                    onChange={(e) => setPendekatan(e.target.value)}
                    placeholder="Contoh: observasi, portofolio..."
                    className="w-full px-4 py-2.5 text-[13px] bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] transition-all disabled:opacity-60"
                  />
                </div>
                <button
                  type="button"
                  disabled={isLocked || savingKey === "rekomendasi"}
                  onClick={() => saveRekomendasi(false)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-6 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50"
                >
                  {savingKey === "rekomendasi" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan Rekomendasi
                </button>
              </Card>

              {/* DATA ASESI (TTD) */}
              <Card title="Validasi Identitas: Data Asesi" icon={<ShieldCheck size={18} />}>
                <div className="border border-[#071E3D]/10 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] border-b border-[#071E3D]/10">
                    <div className="bg-[#FAFAFA] p-3 sm:p-4 text-[11px] font-bold uppercase tracking-wide text-[#182D4A]/60 flex items-center">Nama</div>
                    <div className="p-3 sm:p-4 text-[12px] sm:text-[13px] font-bold text-[#071E3D] break-words">{profile?.nama_lengkap || "-"}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr]">
                    <div className="bg-[#FAFAFA] p-3 sm:p-4 text-[11px] font-bold uppercase tracking-wide text-[#182D4A]/60">TTD</div>
                    <div className="p-3 sm:p-4 min-h-[120px]">
                      {ttdUrl ? (
                        <img src={ttdUrl} alt="TTD Asesi" className="max-h-[80px] max-w-[200px] object-contain" />
                      ) : (
                        <div className="flex h-[80px] w-full items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50 text-[11px] sm:text-[12px] font-semibold text-red-500 text-center px-2">
                          Tanda tangan asesi belum tersedia.
                        </div>
                      )}
                      <p className="mt-2 text-[10px] sm:text-[11px] font-semibold text-[#182D4A]/50">{formatTanggal(new Date())}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border border-[#071E3D]/10 rounded-lg overflow-hidden">
                  <div className="bg-[#071E3D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white">Ditinjau Oleh Asesor</div>
                  <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] border-b border-[#071E3D]/5">
                    <div className="bg-[#FAFAFA] p-3 sm:p-4 text-[11px] font-bold uppercase tracking-wide text-[#182D4A]/60 flex items-center">Nama</div>
                    <div className="p-3 sm:p-4 text-[12px] sm:text-[13px] font-medium text-[#182D4A]/50 italic">Diisi oleh asesor</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr]">
                    <div className="bg-[#FAFAFA] p-3 sm:p-4 text-[11px] font-bold uppercase tracking-wide text-[#182D4A]/60 flex items-center">No. Reg</div>
                    <div className="p-3 sm:p-4 text-[12px] sm:text-[13px] font-medium text-[#182D4A]/50 italic">Diisi oleh asesor</div>
                  </div>
                </div>
              </Card>

            </section>

            {/* ASIDE - SIDEBAR ACTIONS */}
            <aside className="w-full shrink-0">
              <div className="sticky top-6 space-y-5">
                <div className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-3">
                    <AlertCircle size={16} className="text-[#CC6B27]" /> Info Sistem
                  </h4>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-[12px] text-blue-700 font-medium">
                      Penilaian elemen dan berkas pendukung disimpan pada tabel <code className="font-bold">apl02_detail</code>.
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden">
                  <div className="bg-[#071E3D] p-5 text-white">
                    <h3 className="font-black text-[16px] mb-1">Ringkasan Pengisian</h3>
                    <p className="text-[12px] text-white/70">Cek sebelum submit final.</p>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <SummaryItem label="ID Peserta" value={idPeserta || "-"} />
                    <SummaryItem label="ID Skema" value={id_skema || "-"} />
                    <SummaryItem label="Total Elemen" value={totalElemen} />
                    <SummaryItem label="Elemen Terisi" value={`${totalTerisi} dari ${totalElemen}`} />
                    <SummaryItem label="Total Bukti" value={`${totalBukti} File`} />
                    <SummaryItem label="Status Dokumen" value={apl02?.status || "Draft"} highlight={!isLocked} />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={downloadPdf}
                    className="w-full px-5 py-3 rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-[#071E3D]/5"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                  <button
                    type="button"
                    disabled={submitting || isLocked || totalElemen === 0}
                    onClick={submitApl02}
                    className={`w-full px-5 py-3 rounded-lg text-white font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 ${
                      submitting || isLocked || totalElemen === 0 ? "bg-slate-300 text-slate-500 cursor-not-allowed border-none" : "bg-[#CC6B27] hover:bg-[#a8561f]"
                    }`}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : isLocked ? <BadgeCheck size={16} /> : <Send size={16} />}
                    {isLocked ? "Sudah Submit" : "Submit APL.02"}
                  </button>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}

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
    <section className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden w-full">
      <div className="p-4 md:p-5 border-b border-[#071E3D]/10 flex items-center gap-3 bg-[#FAFAFA]">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-[14px] md:text-[16px] font-bold text-[#071E3D] truncate">{title}</h2>
      </div>
      <div className="p-4 md:p-6 w-full overflow-hidden">{children}</div>
    </section>
  );
};

const DataItem = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-[#FAFAFA] border border-[#071E3D]/10 p-3 md:p-3.5 min-w-0">
      <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase tracking-wide mb-1 truncate">{label}</p>
      <p className="text-[12px] md:text-[13px] font-bold text-[#071E3D] break-words">{value || "-"}</p>
    </div>
  );
};

const SummaryItem = ({ label, value, highlight }) => {
  return (
    <div className="flex justify-between items-center border-b border-[#071E3D]/5 pb-2 last:border-0 last:pb-0 gap-2">
      <span className="text-[11px] md:text-[12px] font-bold text-[#182D4A]/60 uppercase tracking-wide truncate">{label}</span>
      <span className={`text-[12px] md:text-[13px] font-black capitalize whitespace-nowrap ${highlight ? "text-[#CC6B27]" : "text-[#071E3D]"}`}>{value}</span>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => {
  return (
    <div className="text-center py-10 px-6 bg-[#FAFAFA] rounded-xl border border-dashed border-[#071E3D]/20 w-full">
      <div className="mx-auto mb-3 text-[#182D4A]/30 flex justify-center">{icon}</div>
      <h3 className="text-[14px] md:text-[15px] font-bold text-[#071E3D] mb-1">{title}</h3>
      <p className="text-[12px] md:text-[13px] font-medium text-[#182D4A]/60">{desc}</p>
    </div>
  );
};