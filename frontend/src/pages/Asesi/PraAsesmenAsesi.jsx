// frontend/src/pages/asesi/PraAsesmenAsesi.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  PenLine,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
  Pencil,
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  const imageBase = API_BASE.replace("/api", "");

  const getImageSrc = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    return `${imageBase}/${path}`;
  };

  const resolveFileUrl = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    return getImageSrc(path);
  };

  const fetchFormData = async () => {
    const res = await api.get("/asesi/pra-asesmen/form");
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
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPage();
  };

  const ttdUrl = useMemo(() => {
    return (
      resolveFileUrl(files?.ttd) ||
      resolveFileUrl(files?.tanda_tangan) ||
      getImageSrc(profile?.ttd_path) ||
      getImageSrc(profile?.ttd) ||
      ""
    );
  }, [files, profile]);

  const statusSubmit = Boolean(formData?.is_submitted);

  const statusTtd = useMemo(() => {
    return Boolean(formData?.ttd_asesi_ready || ttdUrl);
  }, [formData, ttdUrl]);

  const canSubmit = statusTtd && !statusSubmit && !submitting;

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

    if (formData.is_submitted) {
      alert("Pra asesmen sudah disubmit.");
      return;
    }

    const ok = window.confirm("Yakin ingin submit presensi pra asesmen?");
    if (!ok) return;

    try {
      setSubmitting(true);

      const res = await api.post("/asesi/pra-asesmen/submit", {
        id_peserta: formData.id_peserta,
        catatan: catatan?.trim() || "Hadir",
      });

      alert(res.data?.message || "Pra asesmen berhasil disubmit.");

      setCatatan("");
      await loadPage();
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

  const downloadLink = `${API_BASE}/asesi/pra-asesmen/download`;

  const skemaLabel = useMemo(() => {
    const jenis = formData?.skema_sertifikasi?.jenis;
    const judul = formData?.skema_sertifikasi?.judul;

    if (jenis && judul) return `${jenis} - ${judul}`;
    return judul || "-";
  }, [formData]);

  const tukLabel = useMemo(() => {
    const jenis = formData?.tuk?.jenis;
    const nama = formData?.tuk?.nama;

    if (jenis && nama) return `${jenis} - ${nama}`;
    return nama || "-";
  }, [formData]);

  const jadwalLabel = useMemo(() => {
    const tanggal = formData?.jadwal_pelaksanaan?.hari_tanggal;
    const tempat = formData?.jadwal_pelaksanaan?.tempat;

    if (tanggal && tempat) return `${tanggal} - ${tempat}`;
    return tanggal || tempat || "-";
  }, [formData]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ClipboardCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pra Asesmen
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Presensi
                  <br />
                  <span className="text-orange-500">Pra Asesmen</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Konfirmasi kehadiran sebelum mengikuti asesmen. Pastikan data
                  skema, TUK, asesor, dan tanda tangan sudah sesuai.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {refreshing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Data
                  </button>

                  <a
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Download PDF
                    <Download size={17} />
                  </a>

                  {!statusTtd && (
                    <button
                      type="button"
                      onClick={() => navigate("/asesi/profile")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-orange-600 transition-all hover:bg-orange-500 hover:text-white"
                    >
                      <Pencil size={17} />
                      Isi TTD Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Status Pra Asesmen
                  </p>

                  <h2 className="mb-4 text-2xl font-black">
                    {statusSubmit ? "Sudah Submit" : "Belum Submit"}
                  </h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    {statusSubmit
                      ? "Presensi pra asesmen sudah tercatat di sistem."
                      : statusTtd
                      ? "TTD sudah tersedia. Lengkapi catatan jika diperlukan, lalu submit presensi."
                      : "TTD belum tersedia. Silakan isi tanda tangan digital di halaman profile terlebih dahulu."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <HeroPill
                      label="TTD Asesi"
                      value={statusTtd ? "Ready" : "Belum Ada"}
                    />
                    <HeroPill
                      label="Submit"
                      value={statusSubmit ? "Selesai" : "Draft"}
                    />
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
              <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MiniStat
                  icon={<UserCheck size={22} />}
                  label="Asesi"
                  value={formData.nama_asesi || profile?.nama_lengkap || "-"}
                />

                <MiniStat
                  icon={<ShieldCheck size={22} />}
                  label="TTD Asesi"
                  value={statusTtd ? "Tersedia" : "Belum Ada"}
                />

                <MiniStat
                  icon={<BadgeCheck size={22} />}
                  label="Status Submit"
                  value={statusSubmit ? "Sudah Submit" : "Belum Submit"}
                />
              </section>

              {!statusTtd && (
                <div className="rounded-[24px] border border-orange-100 bg-orange-50 px-5 py-5 text-orange-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={22} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black">TTD Asesi Belum Tersedia</p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed">
                        Anda wajib membuat tanda tangan digital di halaman
                        profile sebelum bisa submit presensi pra asesmen.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/profile")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D]"
                  >
                    Isi TTD Sekarang
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
                <div className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                        <FileText size={15} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                          Data Pra Asesmen
                        </span>
                      </div>

                      <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                        Informasi Asesmen
                      </h2>

                      <p className="mt-2 text-sm font-medium text-slate-400">
                        Periksa kembali data sebelum melakukan submit presensi.
                      </p>
                    </div>

                    <StatusBadge
                      type={statusSubmit ? "success" : "warning"}
                      label={statusSubmit ? "Sudah Submit" : "Belum Submit"}
                    />
                  </div>

                  <div className="p-6 lg:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={<FileText size={20} />}
                        label="Skema Sertifikasi"
                        value={skemaLabel}
                        wide
                      />

                      <InfoCard
                        icon={<MapPin size={20} />}
                        label="TUK"
                        value={tukLabel}
                        wide
                      />

                      <InfoCard
                        icon={<Users size={20} />}
                        label="Nama Asesor"
                        value={formData.nama_asesor || "-"}
                      />

                      <InfoCard
                        icon={<UserCheck size={20} />}
                        label="Nama Asesi"
                        value={
                          formData.nama_asesi || profile?.nama_lengkap || "-"
                        }
                      />

                      <InfoCard
                        icon={<CalendarCheck size={20} />}
                        label="Jadwal Pelaksanaan"
                        value={jadwalLabel}
                        wide
                      />

                      <InfoCard
                        icon={<ShieldCheck size={20} />}
                        label="Pelaksanaan Uji"
                        value={
                          formData.jadwal_pelaksanaan?.pelaksanaan_uji || "-"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatusCard
                        label="Tanda Tangan Asesi"
                        desc={
                          statusTtd
                            ? "TTD sudah tersedia dan siap digunakan."
                            : "TTD belum tersedia. Lengkapi dulu di profil."
                        }
                        status={statusTtd}
                      />

                      <StatusCard
                        label="Status Presensi"
                        desc={
                          statusSubmit
                            ? "Pra asesmen sudah disubmit."
                            : "Pra asesmen belum disubmit."
                        }
                        status={statusSubmit}
                      />
                    </div>

                    {statusTtd && ttdUrl && (
                      <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              TTD Profile
                            </p>
                            <p className="mt-1 text-sm font-black text-emerald-700">
                              Tanda tangan digital sudah terdeteksi dari profile.
                            </p>
                          </div>

                          <BadgeCheck size={24} className="text-emerald-600" />
                        </div>

                        <div className="rounded-2xl bg-white border border-emerald-100 p-4 flex items-center justify-center min-h-[130px]">
                          <img
                            src={ttdUrl}
                            alt="Tanda Tangan Asesi"
                            className="max-h-[110px] object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Catatan / Keterangan
                      </label>

                      <div className="relative">
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          disabled={statusSubmit}
                          rows={4}
                          placeholder="Contoh: Hadir / catatan lainnya"
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </div>

                      {statusSubmit && (
                        <p className="mt-2 text-xs font-semibold text-slate-400">
                          Catatan tidak dapat diubah karena pra asesmen sudah
                          disubmit.
                        </p>
                      )}

                      {!statusSubmit && !statusTtd && (
                        <p className="mt-2 text-xs font-semibold text-orange-600">
                          Submit belum bisa dilakukan karena TTD asesi belum
                          tersedia.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
                    <p className="text-sm font-medium text-slate-500">
                      Pastikan seluruh data sudah benar sebelum submit presensi.
                    </p>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${
                        canSubmit
                          ? "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                          : "bg-slate-300 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : statusSubmit ? (
                        <CheckCircle size={16} />
                      ) : (
                        <ClipboardCheck size={16} />
                      )}

                      {statusSubmit
                        ? "Sudah Submit"
                        : submitting
                        ? "Menyimpan..."
                        : !statusTtd
                        ? "TTD Belum Ada"
                        : "Submit Presensi"}

                      {!submitting && !statusSubmit && statusTtd && (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <PenLine size={22} />
                    </div>

                    <h3 className="text-2xl font-black text-[#071E3D]">
                      Ringkasan
                    </h3>

                    <div className="mt-5 space-y-4">
                      <SummaryRow
                        label="ID Peserta"
                        value={formData.id_peserta || "-"}
                      />
                      <SummaryRow
                        label="ID Jadwal"
                        value={formData.id_jadwal || "-"}
                      />
                      <SummaryRow
                        label="ID Skema"
                        value={formData.id_skema || "-"}
                      />
                      <SummaryRow
                        label="TTD Asesi"
                        value={statusTtd ? "Tersedia" : "Belum Ada"}
                      />
                      <SummaryRow
                        label="Status"
                        value={statusSubmit ? "Sudah Submit" : "Belum Submit"}
                      />
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <ShieldCheck size={22} />
                    </div>

                    <h3 className="text-2xl font-black text-[#071E3D]">
                      Ketentuan
                    </h3>

                    <div className="mt-5 space-y-3">
                      <TipItem text="Pastikan tanda tangan asesi sudah tersedia di profile." />
                      <TipItem text="Submit presensi hanya bisa dilakukan satu kali." />
                      <TipItem text="Catatan dapat diisi dengan keterangan hadir." />
                      <TipItem text="PDF dapat diunduh jika endpoint backend sudah tersedia." />
                    </div>
                  </div>

                  {!statusTtd && (
                    <button
                      type="button"
                      onClick={() => navigate("/asesi/profile")}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#071E3D]"
                    >
                      <Pencil size={16} />
                      Lengkapi TTD Profile
                    </button>
                  )}

                  <a
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </aside>
              </section>
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">
          Memuat Pra Asesmen
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data presensi, profile, tanda tangan, dan jadwal asesmen.
        </p>
      </div>
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-red-600">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-100"
      >
        <RefreshCcw size={14} />
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Inbox size={30} />
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        Data Pra Asesmen Tidak Tersedia
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Pastikan Anda sudah memilih jadwal dan data peserta sudah tersedia di
        sistem.
      </p>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
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

function InfoCard({ icon, label, value, wide }) {
  return (
    <div
      className={`rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-[#071E3D] leading-relaxed break-words">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusCard({ label, desc, status }) {
  return (
    <div
      className={`rounded-[24px] border p-5 flex items-start gap-4 ${
        status
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-red-100 bg-red-50 text-red-600"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {status ? <CheckCircle size={22} /> : <XCircle size={22} />}
      </div>

      <div>
        <h3 className="font-black">{label}</h3>
        <p className="text-sm font-medium mt-1 opacity-80">{desc}</p>
      </div>
    </div>
  );
}

function StatusBadge({ type = "light", label }) {
  const styles = {
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    light: "bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        styles[type] || styles.light
      }`}
    >
      {label}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 font-semibold">{label}</span>
      <span className="text-[#071E3D] font-black text-right">{value}</span>
    </div>
  );
}

function TipItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <CheckCircle size={13} />
      </div>

      <p className="text-sm font-medium leading-relaxed text-slate-500">
        {text}
      </p>
    </div>
  );
}