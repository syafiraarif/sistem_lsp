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

  const canSubmit = Boolean(formData?.can_submit) && statusTtd && !statusSubmit && !submitting;

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

    const ok = window.confirm("Yakin ingin submit presensi pra asesmen?");
    if (!ok) return;

    try {
      setSubmitting(true);

      const res = await api.post("/asesi/pra-asesmen/submit", {
        id_peserta: formData.id_peserta,
      });

      alert(res.data?.message || "Pra asesmen berhasil disubmit.");

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
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
                  Konfirmasi kehadiran sebelum mengikuti asesmen. Presensi hanya
                  bisa dilakukan saat tanggal pra asesmen atau jadwal sudah
                  dimulai.
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

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Jadwal Saya
                    <ChevronRight size={17} />
                  </button>

                  {statusSubmit && (
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                    >
                      Download PDF
                      <Download size={17} />
                    </a>
                  )}

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

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Status Pra Asesmen
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {statusSubmit
                      ? "Sudah Submit"
                      : canSubmit
                      ? "Presensi Dibuka"
                      : "Belum Bisa Submit"}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {formData?.message || "-"}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
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

              {!canSubmit && !statusSubmit && (
                <InfoAlert
                  message={formData?.message || "Presensi belum bisa dilakukan."}
                  subMessage={`Waktu buka: ${
                    formData?.waktu_buka_presensi || "-"
                  }`}
                />
              )}

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
                <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                        <FileText size={15} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                          Data Pra Asesmen
                        </span>
                      </div>

                      <h2 className="text-xl font-black text-[#071E3D]">
                        Informasi Asesmen
                      </h2>

                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Periksa kembali data sebelum submit presensi
                      </p>
                    </div>

                    <StatusBadge
                      type={statusSubmit ? "success" : canSubmit ? "success" : "warning"}
                      label={
                        statusSubmit
                          ? "Sudah Submit"
                          : canSubmit
                          ? "Bisa Submit"
                          : "Belum Dibuka"
                      }
                    />
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={<FileText size={20} />}
                        label="Skema Sertifikasi"
                        value={skemaLabel}
                      />

                      <InfoCard
                        icon={<MapPin size={20} />}
                        label="TUK"
                        value={tukLabel}
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
                      />

                      <InfoCard
                        icon={<ShieldCheck size={20} />}
                        label="Pelaksanaan Uji"
                        value={
                          formData.jadwal_pelaksanaan?.pelaksanaan_uji || "-"
                        }
                      />

                      <InfoCard
                        icon={<CalendarCheck size={20} />}
                        label="Waktu Buka Presensi"
                        value={String(formData.waktu_buka_presensi || "-")}
                      />

                      <InfoCard
                        icon={<CalendarCheck size={20} />}
                        label="Waktu Presensi"
                        value={String(
                          formData.presensi?.waktu_presensi || "-"
                        )}
                      />
                    </div>

                    {statusTtd && ttdUrl && (
                      <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          Tanda Tangan Asesi dari Profile
                        </p>

                        <div className="rounded-2xl bg-white border border-slate-100 p-5">
                          <img
                            src={ttdUrl}
                            alt="TTD Asesi"
                            className="max-h-28 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <aside>
                  <div className="sticky top-6 space-y-6">
                    <div className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h3 className="text-xl font-black text-[#071E3D]">
                          Konfirmasi Presensi
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-400">
                          Sistem otomatis memakai TTD dari profile asesi.
                        </p>
                      </div>

                      <div className="p-6 space-y-4">
                        <StatusCard
                          label="TTD Asesi"
                          desc={
                            statusTtd
                              ? "TTD sudah tersedia di profile."
                              : "TTD belum tersedia."
                          }
                          status={statusTtd}
                        />

                        <StatusCard
                          label="Waktu Presensi"
                          desc={formData.message || "-"}
                          status={Boolean(formData.can_submit || statusSubmit)}
                        />

                        <StatusCard
                          label="Status Presensi"
                          desc={
                            statusSubmit
                              ? "Presensi sudah tercatat."
                              : "Belum presensi."
                          }
                          status={statusSubmit}
                        />

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                            canSubmit
                              ? "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                              : "bg-slate-300 cursor-not-allowed"
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : statusSubmit ? (
                            <CheckCircle size={18} />
                          ) : (
                            <ClipboardCheck size={18} />
                          )}

                          {statusSubmit
                            ? "Sudah Presensi"
                            : submitting
                            ? "Menyimpan..."
                            : "Submit Presensi"}
                        </button>
                      </div>
                    </div>
                  </div>
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
          Mengambil data presensi pra asesmen.
        </p>
      </div>
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

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-[#071E3D] break-words">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusCard({ label, desc, status }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        status
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-slate-50 border-slate-100 text-slate-500"
      }`}
    >
      <div className="flex items-start gap-3">
        {status ? (
          <CheckCircle size={20} className="shrink-0 mt-0.5" />
        ) : (
          <XCircle size={20} className="shrink-0 mt-0.5" />
        )}

        <div>
          <p className="font-black">{label}</p>
          <p className="text-xs font-semibold mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ type, label }) {
  const style =
    type === "success"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-amber-50 text-amber-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${style}`}
    >
      {label}
    </span>
  );
}

function InfoAlert({ message, subMessage }) {
  return (
    <div className="rounded-[24px] border border-amber-100 bg-amber-50 px-5 py-5 text-amber-700 flex items-start gap-3">
      <AlertCircle size={22} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-black">{message}</p>
        <p className="mt-1 text-sm font-semibold">{subMessage}</p>
      </div>
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-5 text-red-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={22} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-black">Gagal Memuat Data</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600"
      >
        Coba Lagi
        <RefreshCcw size={16} />
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
        Data Pra Asesmen Tidak Ada
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Sistem belum menemukan data jadwal atau peserta untuk presensi pra
        asesmen ini.
      </p>
    </div>
  );
}