import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function HasilAkhirAsesi() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_peserta } = useParams();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [data, setData] = useState(null);
  const [dokumen, setDokumen] = useState([]);
  const [frAk03Exists, setFrAk03Exists] = useState(false);
  const [frAk04Exists, setFrAk04Exists] = useState(false);
  const [error, setError] = useState("");
  const [errorDokumen, setErrorDokumen] = useState("");

  const fetchFrAkStatus = async (pesertaId) => {
    if (!pesertaId) {
      setFrAk03Exists(false);
      setFrAk04Exists(false);
      return;
    }
    const [frAk03Result, frAk04Result] = await Promise.allSettled([
      api.get(`/asesi/fr-ak03/${pesertaId}`),
      api.get(`/asesi/fr-ak04/${pesertaId}`),
    ]);
    
    const frAk03Data = frAk03Result.status === "fulfilled" ? frAk03Result.value?.data?.data : null;
    const frAk04Data = frAk04Result.status === "fulfilled" ? frAk04Result.value?.data?.data : null;
    
    setFrAk03Exists(Boolean(frAk03Data?.is_submitted || frAk03Data?.id_fr_ak03));
    setFrAk04Exists(Boolean(frAk04Data?.is_submitted || frAk04Data?.id_fr_ak04));
  };

  const fetchDokumen = async (pesertaId) => {
    try {
      setErrorDokumen("");
      const res = await api.get(`/asesi/hasil-saya/dokumen/${pesertaId}`);
      setDokumen(res.data?.data?.documents || []);
    } catch (err) {
      console.error("GET DOKUMEN:", err);
      setDokumen([]);
      setErrorDokumen(
        err.response?.data?.message || err.response?.data?.error || "Daftar dokumen belum dapat dimuat."
      );
    }
  };

  const fetchHasil = async () => {
    try {
      setError("");
      const query = id_peserta ? `?id_peserta=${id_peserta}` : "";
      const res = await api.get(`/asesi/hasil-saya/detail${query}`);
      const result = res.data?.data || null;
      setData(result);
      
      const pesertaId = result?.id_peserta || id_peserta;
      if (pesertaId) {
        await Promise.all([fetchDokumen(pesertaId), fetchFrAkStatus(pesertaId)]);
      } else {
        setDokumen([]);
        setFrAk03Exists(false);
        setFrAk04Exists(false);
      }
    } catch (err) {
      console.error("GET HASIL AKHIR:", err);
      setError(
        err.response?.data?.message || err.response?.data?.error || "Gagal mengambil hasil akhir asesmen."
      );
      setData(err.response?.data?.data || null);
      setDokumen([]);
      setFrAk03Exists(false);
      setFrAk04Exists(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHasil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_peserta, location.key]);

  useEffect(() => {
    const handleFocus = () => { if (!loading) fetchHasil(); };
    const handleVisibility = () => { if (document.visibilityState === "visible" && !loading) fetchHasil(); };
    
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loading, id_peserta]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHasil();
  };

  const status = normalizeStatus(data?.status_asesmen || data?.hasil);
  const isKompeten = status === "kompeten";
  const isBelumKompeten = status === "belum_kompeten";
  const belumTersedia = status === "belum_tersedia";
  
  const kelengkapan = data?.kelengkapan || {};
  const kelengkapanData = kelengkapan?.data || {};
  
  const nilaiAkhir = useMemo(() => {
    return data?.nilai_akhir ?? kelengkapanData?.fria05?.nilai ?? "-";
  }, [data, kelengkapanData]);

  const getDocument = (key) => dokumen.find((item) => item.key === key);
  
  const getFrAkDocument = (key) => {
    const pesertaId = data?.id_peserta || id_peserta;
    if (!pesertaId) return null;
    if (key === "frak03" && !frAk03Exists) return null;
    if (key === "frak04" && !frAk04Exists) return null;
    
    return {
      key,
      label: key === "frak03" ? "FR.AK.03" : "FR.AK.04",
      available: true,
      endpoint: key === "frak03" ? `/asesi/fr-ak03/pdf/${pesertaId}` : `/asesi/fr-ak04/pdf/${pesertaId}`,
    };
  };

  const handleGoFrAk03 = () => {
    const pesertaId = data?.id_peserta || id_peserta;
    if (!pesertaId) { alert("ID peserta tidak ditemukan."); return; }
    navigate(`/asesi/fr-ak03/${pesertaId}`);
  };

  const handleGoFrAk04 = () => {
    const pesertaId = data?.id_peserta || id_peserta;
    if (!pesertaId) { alert("ID peserta tidak ditemukan."); return; }
    navigate(`/asesi/fr-ak04/${pesertaId}`);
  };

  const handleViewPdf = async (documentData) => {
    if (!documentData?.endpoint) { alert("Dokumen belum tersedia."); return; }
    try {
      setDownloading(`view-${documentData.key}`);
      const res = await api.get(documentData.endpoint, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const popup = window.open(url, "_blank");
      if (popup) popup.focus();
      setTimeout(() => { window.URL.revokeObjectURL(url); }, 60000);
    } catch (err) {
      console.error("VIEW PDF:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Gagal membuka PDF.");
    } finally {
      setDownloading("");
    }
  };

  const handleDownloadPdf = async (documentData) => {
    if (!documentData?.endpoint) { alert("Dokumen belum tersedia."); return; }
    try {
      setDownloading(documentData.key);
      const res = await api.get(documentData.endpoint, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${documentData.label.replaceAll(".", "-")}-${data?.id_peserta || "dokumen"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => { window.URL.revokeObjectURL(url); }, 1000);
    } catch (err) {
      console.error("DOWNLOAD PDF:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Gagal mengunduh PDF.");
    } finally {
      setDownloading("");
    }
  };

  const dokumenUtama = [
    { key: "presensi", label: "Presensi", description: "Dokumen presensi asesmen" },
    { key: "apl01", label: "APL.01", description: "Formulir permohonan sertifikasi" },
    { key: "apl02", label: "APL.02", description: "Asesmen mandiri" },
    { key: "fria01", label: "FR.IA.01", description: "Form penilaian asesmen" },
    { key: "fria02", label: "FR.IA.02", description: "Form tugas praktik demonstrasi" },
    { key: "fria03", label: "FR.IA.03", description: "Form pertanyaan untuk observasi" },
    { key: "fria05", label: "FR.IA.05", description: "Form penilaian kompetensi" },
    { key: "frak01", label: "FR.AK.01", description: "Persetujuan asesmen dan kerahasiaan" },
    { key: "frak02", label: "FR.AK.02", description: "Form rekaman asesmen" },
    { key: "frak05", label: "FR.AK.05", description: "Form umpan balik asesmen" },
    { key: "frak06", label: "FR.AK.06", description: "Form laporan asesmen" },
    { key: "frak07", label: "FR.AK.07", description: "Form sertifikasi kompetensi" },
  ];

  const dokumenTindakLanjut = [
    { key: "frak03", label: "FR.AK.03", description: "Form umpan balik dan catatan asesmen" },
    { key: "frak04", label: "FR.AK.04", description: "Form permohonan banding asesmen" },
  ];

  const dokumenHasil = isBelumKompeten ? [...dokumenUtama, ...dokumenTindakLanjut] : dokumenUtama;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* PENAMBAHAN min-w-0 SANGAT PENTING DISINI */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden min-w-0">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          
          {/* HEADER SECTION (Match APL01/APL02 Style) */}
          <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm p-6 lg:p-8 min-w-0 w-full">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center w-full min-w-0">
              
              <div className="min-w-0 w-full">
                <h1 className="text-3xl lg:text-4xl font-black leading-tight text-[#071E3D] break-words">
                  Hasil Akhir <span className="text-[#CC6B27]">Sertifikasi Anda</span>
                </h1>
                <p className="mt-2 text-[14px] font-medium text-[#182D4A]/70 max-w-2xl break-words whitespace-normal">
                  Lihat keputusan akhir asesor dan cek kelengkapan dokumen. Semua dokumen yang sudah tersedia dapat dilihat atau diunduh dalam bentuk PDF.
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
              <div className="relative overflow-hidden rounded-xl bg-[#071E3D] p-5 w-full lg:w-[320px] xl:w-[360px] shrink-0 border border-[#071E3D]/10">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#CC6B27]/30 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Status Akhir</p>
                      <p className="text-[16px] font-black text-white capitalize truncate">{formatStatus(status)}</p>
                    </div>
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed text-white/70 mb-4 h-[36px] line-clamp-2">
                    {isBelumKompeten
                      ? "Asesi dapat melanjutkan dengan FR.AK.03 dan FR.AK.04."
                      : isKompeten
                      ? "Selamat, Anda dinyatakan kompeten."
                      : "Hasil akhir belum tersedia dari asesor."}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 border border-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Nilai Akhir</p>
                      <p className="text-lg font-black text-white mt-0.5">{nilaiAkhir}</p>
                    </div>
                    <div className="bg-white/10 border border-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Dokumen</p>
                      <p className="text-lg font-black text-[#CC6B27] mt-0.5">{dokumen.length}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          {!data || belumTersedia ? (
            <EmptyState />
          ) : (
            <div className="space-y-6 min-w-0 w-full">
              
              {/* DETAIL HASIL AKHIR (Ubah tabel jadi Grid Card agar responsif penuh) */}
              <section className="w-full min-w-0">
                <Card title="Detail Hasil Akhir" icon={<Trophy size={18} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DataItem label="Nama Asesi" value={data.nama_asesi} />
                    <DataItem label="NIK" value={data.nik} />
                    <DataItem label="Judul Skema" value={data.skema?.judul_skema} />
                    <DataItem label="Kode Skema" value={data.skema?.kode_skema} />
                    <DataItem label="TUK" value={data.tuk?.nama_tuk} />
                    <DataItem label="Jadwal" value={data.jadwal?.nama_kegiatan} />
                    <DataItem label="Tanggal" value={data.jadwal?.tgl_awal} />
                    <DataItem label="Nilai Akhir" value={nilaiAkhir} />
                    <DataItem label="Status" value={formatStatus(status)} />
                    <div className="md:col-span-2 lg:col-span-3">
                      <DataItem label="Catatan Asesor" value={data.catatan_asesor || data.keterangan || "-"} />
                    </div>
                  </div>
                </Card>
              </section>

              {/* KELENGKAPAN DOKUMEN */}
              <section className="w-full min-w-0">
                <Card title="Kelengkapan Dokumen" icon={<FileText size={18} />}>
                  <div className="space-y-5">
                    {errorDokumen && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center gap-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{errorDokumen}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                      {dokumenHasil.map((item) => {
                        let documentData = null;
                        if (item.key === "frak03" || item.key === "frak04") {
                          documentData = getFrAkDocument(item.key);
                        } else {
                          documentData = getDocument(item.key);
                        }
                        
                        const isFollowUp = isBelumKompeten && (item.key === "frak03" || item.key === "frak04");
                        const available = isFollowUp
                          ? item.key === "frak03"
                            ? frAk03Exists
                            : frAk04Exists
                          : Boolean(documentData?.available);
                          
                        return (
                          <DocumentCard
                            key={item.key}
                            label={item.label}
                            description={item.description}
                            active={available}
                            followUp={isFollowUp}
                            loadingView={downloading === `view-${item.key}`}
                            loadingDownload={downloading === item.key}
                            onView={() => handleViewPdf(documentData)}
                            onDownload={() => handleDownloadPdf(documentData)}
                            onOpen={() => {
                              if (item.key === "frak03") handleGoFrAk03();
                              if (item.key === "frak04") handleGoFrAk04();
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Informasi Info Boxes Bawah */}
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {isKompeten && (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div className="min-w-0">
                              <p className="font-black text-emerald-700">Dokumen hasil kompetensi</p>
                              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-emerald-700/80">
                                Seluruh dokumen hasil yang tersedia dapat dilihat dan diunduh melalui tombol pada masing-masing dokumen.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isBelumKompeten && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
                            <div className="min-w-0">
                              <p className="font-black text-amber-700">Tindak lanjut asesmen</p>
                              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-amber-700/80">
                                {frAk03Exists && frAk04Exists
                                  ? "FR.AK.03 dan FR.AK.04 sudah diisi dan dapat dilihat atau diunduh."
                                  : frAk03Exists
                                  ? "FR.AK.03 sudah diisi. FR.AK.04 masih dapat dilengkapi."
                                  : frAk04Exists
                                  ? "FR.AK.04 sudah diisi. FR.AK.03 masih dapat dilengkapi."
                                  : "FR.AK.03 dan FR.AK.04 tersedia untuk diisi karena hasil asesmen Anda adalah Belum Kompeten."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function DocumentCard({
  label,
  description,
  active,
  followUp,
  loadingView,
  loadingDownload,
  onView,
  onDownload,
  onOpen,
}) {
  if (followUp && !active) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 transition-all hover:border-amber-200 hover:shadow-sm w-full min-w-0 flex flex-col h-full">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldAlert size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-[13px] text-amber-800 truncate">{label}</p>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-700/80 line-clamp-2">
              Belum diisi. Silakan lengkapi form.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-3 py-2.5 text-[11px] font-bold tracking-wide text-white transition-all hover:bg-[#a8561f]"
        >
          <FileText size={14} />
          Isi {label}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 transition-all w-full min-w-0 flex flex-col h-full ${active ? "border-[#071E3D]/10 bg-white shadow-sm" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-emerald-50 text-emerald-600" : "bg-white text-slate-300 border border-slate-200"}`}>
          {active ? <CheckCircle size={18} /> : <XCircle size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-black text-[13px] truncate ${active ? "text-[#071E3D]" : "text-slate-400"}`}>
            {label}
          </p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed line-clamp-2 text-slate-500">
            {active ? description : "Dokumen belum tersedia."}
          </p>
        </div>
      </div>
      
      {active ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onView}
            disabled={loadingView}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#071E3D] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white transition-all hover:bg-[#CC6B27] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loadingView ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
            Lihat
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={loadingDownload}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#071E3D]/20 bg-white px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#071E3D] transition-all hover:bg-[#071E3D]/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {loadingDownload ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Unduh
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <FileText size={12} />
            Kosong
          </span>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <section className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden w-full min-w-0">
      <div className="p-4 md:p-5 border-b border-[#071E3D]/10 flex items-center gap-3 bg-[#FAFAFA]">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-[14px] md:text-[16px] font-bold text-[#071E3D] truncate">{title}</h2>
      </div>
      <div className="p-4 md:p-6 w-full min-w-0 overflow-hidden">{children}</div>
    </section>
  );
}

function DataItem({ label, value }) {
  return (
    <div className="rounded-lg bg-[#FAFAFA] border border-[#071E3D]/10 p-3 md:p-3.5 min-w-0 w-full">
      <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase tracking-wide mb-1 truncate">{label}</p>
      <p className="text-[12px] md:text-[13px] font-bold text-[#071E3D] break-words whitespace-normal">{value || "-"}</p>
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
      <div className="flex items-start gap-3 min-w-0">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-bold text-[14px]">Gagal Memuat Data</p>
          <p className="mt-1 text-[12px] font-medium text-red-600/80 leading-relaxed truncate whitespace-normal">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-[11px] font-bold tracking-wide text-white transition-all hover:bg-red-600 shrink-0"
      >
        <RefreshCcw size={14} /> Coba Lagi
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-xl border border-dashed border-[#071E3D]/20 w-full min-w-0">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <Inbox size={26} />
      </div>
      <h3 className="text-[16px] font-bold text-[#071E3D] mb-1">Hasil Belum Tersedia</h3>
      <p className="mx-auto max-w-sm text-[13px] font-medium text-[#182D4A]/60">
        Asesor belum menyimpan keputusan akhir asesmen untuk jadwal ini.
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-lg p-8 text-center max-w-sm w-full">
        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-4" size={36} />
        <h2 className="text-[#071E3D] font-black text-lg">Memuat Hasil Akhir</h2>
        <p className="text-[#182D4A]/70 text-sm mt-1 font-medium">Mengambil keputusan akhir asesmen.</p>
      </div>
    </div>
  );
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase().trim();
  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten" || value === "belum_kompeten") return "belum_kompeten";
  return "belum_tersedia";
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "kompeten") return "Kompeten";
  if (normalized === "belum_kompeten") return "Belum Kompeten";
  return "Belum Tersedia";
}