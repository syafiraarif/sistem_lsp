// frontend/src/pages/asesi/PraAsesmenAsesi.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  Pencil,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
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

export default function PraAsesmenAsesi() {
  const navigate = useNavigate();
  const { id_skema } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
    siap: false,
    syarat: false,
    perangkat: false,
    aturan: false,
    jujur: false,
  });
  const [error, setError] = useState("");
  const imageBase = API_BASE.replace("/api", "");

  const getImageSrc = (filePath) => {
    if (!filePath) return "";
    if (String(filePath).startsWith("http")) return filePath;
    return `${imageBase}/${String(filePath).replace(/^\/+/, "")}`;
  };

  const fetchFormData = async () => {
    const query = id_skema ? `?id_skema=${id_skema}` : "";
    const res = await api.get(`/asesi/pra-asesmen/form${query}`);
    const data = res.data?.data || null;
    if (!data) {
      throw new Error("Data pra asesmen tidak tersedia.");
    }
    return data;
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/asesi/profile");
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal mengambil profile:", err);
      return null;
    }
  };

  const fetchProfileFiles = async () => {
    try {
      const res = await api.get("/asesi/profile/files");
      return res.data?.data || {};
    } catch (err) {
      console.error("Gagal mengambil file profile:", err);
      return {};
    }
  };

  const loadPage = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const [formResult, profileResult, filesResult] = await Promise.allSettled([
        fetchFormData(),
        fetchProfile(),
        fetchProfileFiles(),
      ]);
      if (formResult.status !== "fulfilled") {
        throw formResult.reason;
      }
      setFormData(formResult.value);
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        setProfile(null);
      }
      if (filesResult.status === "fulfilled") {
        setFiles(filesResult.value || {});
      } else {
        setFiles({});
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal memuat data pra asesmen."
      );
      setFormData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_skema]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPage();
  };

  const ttdUrl = useMemo(() => {
    return (
      formData?.ttd_asesi_url ||
      getImageSrc(formData?.ttd_asesi_path) ||
      getImageSrc(files?.ttd) ||
      getImageSrc(files?.tanda_tangan) ||
      getImageSrc(profile?.ttd_path) ||
      getImageSrc(profile?.ttd) ||
      ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, files, profile]);

  const statusSubmit = Boolean(formData?.is_submitted);
  const statusTtd = useMemo(() => {
    return Boolean(formData?.ttd_asesi_ready || ttdUrl);
  }, [formData, ttdUrl]);
  const semuaChecklist = Object.values(checklist).every(Boolean);
  
  const canSubmit =
    Boolean(formData?.can_submit) &&
    statusTtd &&
    semuaChecklist &&
    !statusSubmit &&
    !submitting;

  const downloadLink = useMemo(() => {
    const query = id_skema ? `?id_skema=${id_skema}` : "";
    return `${API_BASE}/asesi/pra-asesmen/download${query}`;
  }, [id_skema]);

  const skemaLabel = useMemo(() => {
    const jenis = formData?.skema_sertifikasi?.jenis;
    const judul = formData?.skema_sertifikasi?.judul;
    if (jenis && judul && jenis !== "-") return `${jenis} - ${judul}`;
    return judul || "-";
  }, [formData]);

  const tukLabel = useMemo(() => {
    const jenis = formData?.tuk?.jenis;
    const nama = formData?.tuk?.nama;
    if (jenis && nama && jenis !== "-") return `${jenis} - ${nama}`;
    return nama || "-";
  }, [formData]);

  const jadwalLabel = useMemo(() => {
    const tanggal =
      formData?.jadwal_pelaksanaan?.tanggal_pra_asesmen ||
      formData?.jadwal_pelaksanaan?.hari_tanggal;
    const jam = formData?.jadwal_pelaksanaan?.jam;
    const tempat = formData?.jadwal_pelaksanaan?.tempat;
    const bagian = [tanggal, jam, tempat].filter(Boolean).filter((x) => x !== "-");
    return bagian.length ? bagian.join(" - ") : "-";
  }, [formData]);

  const handleSubmit = async () => {
    if (!formData?.id_peserta) {
      alert("ID peserta tidak ditemukan.");
      return;
    }
    if (!statusTtd) {
      alert("TTD asesi belum tersedia. Silakan lengkapi tanda tangan di profil.");
      navigate("/asesi/profile");
      return;
    }
    if (statusSubmit) {
      alert("Pra asesmen sudah disubmit.");
      return;
    }
    if (!formData?.can_submit) {
      alert(formData?.message || "Presensi belum bisa dilakukan.");
      return;
    }
    const ok = window.confirm(
      "Pastikan seluruh data sudah benar.\nSetelah presensi berhasil, Anda akan diarahkan menuju halaman ujian.\nApakah Anda yakin?"
    );
    if (!ok) return;
    try {
      setSubmitting(true);
      const res = await api.post("/asesi/pra-asesmen/submit", {
        id_peserta: formData.id_peserta,
      });
      alert(res.data?.message || "Pra asesmen berhasil disubmit.");
      await loadPage();
      setTimeout(() => {
        navigate("/asesi/jadwal-saya");
      }, 1000);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal submit pra asesmen."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* PENAMBAHAN min-w-0 AGAR GRID/FLEX BISA MENYUSUT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden min-w-0">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          
          {/* HEADER SECTION (Match APL01/APL02 Style) */}
          <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm p-6 lg:p-8 min-w-0 w-full">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center w-full min-w-0">
              
              <div className="min-w-0 w-full">
                <h1 className="text-3xl lg:text-4xl font-black leading-tight text-[#071E3D] break-words">
                  Presensi <span className="text-[#CC6B27]">Pra Asesmen</span>
                </h1>
                <p className="mt-2 text-[14px] font-medium text-[#182D4A]/70 max-w-2xl break-words whitespace-normal">
                  Konfirmasi kehadiran sebelum mengikuti asesmen. Presensi hanya bisa dilakukan saat tanggal pra asesmen atau jadwal sudah dimulai.
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
                  {statusSubmit && (
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5"
                    >
                      Download PDF <Download size={16} />
                    </a>
                  )}
                  {!statusTtd && (
                    <button
                      type="button"
                      onClick={() => navigate("/asesi/profile")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-100 border border-orange-200 px-5 py-2.5 text-[13px] font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-200"
                    >
                      <Pencil size={16} /> Isi TTD Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Status Ringkasan Header */}
              <div className="relative overflow-hidden rounded-xl bg-[#071E3D] p-5 w-full lg:w-[320px] xl:w-[360px] shrink-0 border border-[#071E3D]/10">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#CC6B27]/30 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Status Akses</p>
                      <p className="text-[16px] font-black text-white capitalize truncate">
                        {statusSubmit ? "Sudah Submit" : canSubmit ? "Presensi Dibuka" : "Belum Bisa Submit"}
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed text-white/70 mb-4 h-[36px] line-clamp-2">
                    {formData?.message || "-"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 border border-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-white/50 uppercase">TTD Asesi</p>
                      <p className={`text-sm font-black mt-0.5 ${statusTtd ? "text-emerald-400" : "text-amber-400"}`}>
                        {statusTtd ? "Tersedia" : "Belum Ada"}
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Status</p>
                      <p className={`text-sm font-black mt-0.5 ${statusSubmit ? "text-emerald-400" : "text-white"}`}>
                        {statusSubmit ? "Selesai" : "Draft"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          {!formData ? (
            <EmptyState />
          ) : (
            <>
              {/* ALERTS SECTION */}
              <div className="space-y-4 w-full min-w-0">
                {!canSubmit && !statusSubmit && (
                  <InfoAlert
                    message={formData?.message || "Presensi belum bisa dilakukan."}
                    subMessage={`Waktu buka: ${formData?.waktu_buka_presensi || "-"}`}
                  />
                )}
                
                {!statusTtd && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-[14px]">TTD Asesi Belum Tersedia</p>
                        <p className="mt-1 text-[12px] font-medium leading-relaxed truncate whitespace-normal">
                          Anda wajib membuat tanda tangan digital di halaman profile sebelum bisa submit presensi pra asesmen.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/asesi/profile")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition-all hover:bg-amber-700 shrink-0"
                    >
                      Isi TTD Sekarang <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* MAIN CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 items-start w-full min-w-0">
                
                {/* KIRI - INFORMASI ASESMEN */}
                <section className="space-y-6 min-w-0 w-full">
                  <Card title="Informasi Asesmen" icon={<FileText size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DataItem label="Skema Sertifikasi" value={skemaLabel} />
                      <DataItem label="Tempat Uji Kompetensi (TUK)" value={tukLabel} />
                      <DataItem label="Nama Asesor" value={formData.nama_asesor} />
                      <DataItem label="Nama Asesi" value={formData.nama_asesi || profile?.nama_lengkap} />
                      <DataItem label="Jadwal Pelaksanaan" value={jadwalLabel} />
                      <DataItem label="Pelaksanaan Uji" value={formData.jadwal_pelaksanaan?.pelaksanaan_uji} />
                      <DataItem label="Waktu Buka Presensi" value={formData.waktu_buka_presensi} />
                      <DataItem label="Waktu Presensi Tercatat" value={formData.presensi?.waktu_presensi} />
                    </div>

                    {statusTtd && ttdUrl && (
                      <div className="mt-6 border border-[#071E3D]/10 rounded-xl overflow-hidden">
                        <div className="bg-[#FAFAFA] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#182D4A]/60 flex items-center border-b border-[#071E3D]/10">
                          Tanda Tangan Digital Asesi (Otomatis)
                        </div>
                        <div className="p-4 bg-white flex justify-center">
                          <img src={ttdUrl} alt="TTD Asesi" className="max-h-24 object-contain" />
                        </div>
                      </div>
                    )}
                  </Card>
                </section>

                {/* KANAN - KONFIRMASI & SUBMIT */}
                <aside className="w-full shrink-0">
                  <div className="sticky top-6 space-y-6">
                    
                    <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden w-full min-w-0">
                      <div className="bg-[#071E3D] p-4 md:p-5 text-white">
                        <h3 className="font-black text-[15px] mb-1">Konfirmasi Presensi</h3>
                        <p className="text-[11px] text-white/70">Checklist persiapan dan submit form</p>
                      </div>
                      
                      <div className="p-4 md:p-5 space-y-4">
                        <StatusCard label="TTD Asesi" desc={statusTtd ? "Tersedia dari profile." : "Belum tersedia."} status={statusTtd} />
                        <StatusCard label="Waktu Presensi" desc={formData.message || "-"} status={Boolean(formData.can_submit || statusSubmit)} />
                        <StatusCard label="Status Presensi" desc={statusSubmit ? "Presensi tercatat." : "Belum submit presensi."} status={statusSubmit} />

                        {/* Checklist Persiapan */}
                        <div className="mt-5 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                          <h4 className="font-bold text-[13px] text-[#071E3D] mb-3">Pernyataan Kesiapan</h4>
                          <div className="space-y-2.5">
                            {[
                              { id: 'siap', text: 'Saya siap mengikuti asesmen kompetensi secara online.' },
                              { id: 'syarat', text: 'Saya telah memenuhi seluruh persyaratan asesmen.' },
                              { id: 'perangkat', text: 'Perangkat, kamera, dan koneksi internet saya siap digunakan.' },
                              { id: 'aturan', text: 'Saya memahami tata tertib asesmen dan bersedia mematuhinya.' },
                              { id: 'jujur', text: 'Saya akan mengerjakan asesmen secara mandiri tanpa bantuan pihak lain.' },
                            ].map((item) => (
                              <label key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checklist[item.id] ? 'bg-[#CC6B27]/5 border-[#CC6B27]/30' : 'bg-white border-[#071E3D]/10 hover:border-[#CC6B27]/40'}`}>
                                <input
                                  type="checkbox"
                                  checked={checklist[item.id]}
                                  disabled={statusSubmit}
                                  onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                                  className="mt-0.5 w-4 h-4 text-[#CC6B27] border-gray-300 rounded focus:ring-[#CC6B27] disabled:opacity-50"
                                />
                                <span className="text-[12px] font-semibold text-[#071E3D] leading-relaxed select-none">{item.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className={`w-full mt-2 py-3.5 rounded-lg font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm ${
                            canSubmit
                              ? "bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-[#CC6B27]/20"
                              : "bg-slate-200 text-slate-500 cursor-not-allowed border-none"
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : statusSubmit ? (
                            <CheckCircle size={16} />
                          ) : (
                            <ClipboardCheck size={16} />
                          )}
                          {statusSubmit ? "Sudah Presensi" : submitting ? "Memproses..." : "Submit Presensi"}
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-lg p-8 text-center max-w-sm w-full">
        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-4" size={36} />
        <h2 className="text-[#071E3D] font-black text-lg">Memuat Pra Asesmen</h2>
        <p className="text-[#182D4A]/70 text-sm mt-1 font-medium">Mengambil data presensi pra asesmen.</p>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden w-full min-w-0">
      <div className="p-4 md:p-5 border-b border-[#071E3D]/10 flex items-center gap-3 bg-[#FAFAFA]">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-[14px] md:text-[16px] font-bold text-[#071E3D] truncate">{title}</h2>
      </div>
      <div className="p-4 md:p-6 w-full min-w-0 overflow-hidden">{children}</div>
    </div>
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

function StatusCard({ label, desc, status }) {
  return (
    <div className={`rounded-xl border p-3.5 flex items-start gap-3 w-full min-w-0 ${status ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
      {status ? (
        <CheckCircle size={18} className="shrink-0 text-emerald-600 mt-0.5" />
      ) : (
        <XCircle size={18} className="shrink-0 text-slate-400 mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-bold text-[13px] truncate ${status ? "text-emerald-800" : "text-[#071E3D]"}`}>{label}</p>
        <p className={`text-[11px] font-medium mt-0.5 leading-relaxed truncate whitespace-normal ${status ? "text-emerald-700/80" : "text-slate-500"}`}>{desc}</p>
      </div>
    </div>
  );
}

function InfoAlert({ message, subMessage }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3 w-full min-w-0">
      <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[14px] text-amber-800">{message}</p>
        <p className="mt-1 text-[12px] font-medium text-amber-700/80 leading-relaxed truncate whitespace-normal">{subMessage}</p>
      </div>
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
          <p className="mt-1 text-[12px] font-medium text-red-600/80 leading-relaxed truncate whitespace-normal">{message}</p>
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
      <h3 className="text-[16px] font-bold text-[#071E3D] mb-1">Data Pra Asesmen Tidak Ada</h3>
      <p className="mx-auto max-w-sm text-[13px] font-medium text-[#182D4A]/60">
        Sistem belum menemukan data jadwal atau peserta untuk presensi pra asesmen ini.
      </p>
    </div>
  );
}