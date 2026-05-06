// src/pages/asesi/Banding.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertTriangle,
  Send,
  Loader2,
  ClipboardList,
  Calendar,
  BookOpen,
  MonitorCheck,
  Inbox,
  ShieldCheck,
  MessageSquareText,
  ChevronRight,
  RefreshCcw,
  Sparkles,
  BadgeCheck,
  XCircle,
  FileText,
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

export default function Banding() {
  const navigate = useNavigate();

  const [isiBanding, setIsiBanding] = useState("");
  const [riwayatBanding, setRiwayatBanding] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchBanding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBanding = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get("/asesi/banding-saya");
      setRiwayatBanding(res.data?.data || []);
    } catch (err) {
      console.error("Error fetchBanding:", err);

      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal memuat data banding.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBanding();
  };

  const submitBanding = async (e) => {
    e.preventDefault();

    if (!isiBanding.trim()) {
      setMsg({
        type: "error",
        text: "Isi banding wajib diisi.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await api.post("/asesi/banding", {
        isi_banding: isiBanding.trim(),
      });

      setMsg({
        type: "success",
        text: "Banding berhasil diajukan.",
      });

      setIsiBanding("");
      await fetchBanding();
    } catch (err) {
      console.error("Error submitBanding:", err);

      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Terjadi kesalahan server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalBanding = riwayatBanding.length;

  const bandingTerakhir = useMemo(() => {
    if (!Array.isArray(riwayatBanding) || riwayatBanding.length === 0) {
      return "-";
    }

    const latest = [...riwayatBanding].sort((a, b) => {
      const dateA = new Date(a.tanggal_ajukan || a.createdAt || 0).getTime();
      const dateB = new Date(b.tanggal_ajukan || b.createdAt || 0).getTime();

      return dateB - dateA;
    })[0];

    return formatDate(latest?.tanggal_ajukan || latest?.createdAt);
  }, [riwayatBanding]);

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
                  <AlertTriangle size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pengajuan Banding
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Ajukan
                  <br />
                  <span className="text-orange-500">Banding</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Sampaikan alasan banding terkait proses asesmen atau hasil uji
                  kompetensi. Gunakan bahasa yang jelas, singkat, dan sesuai
                  kondisi sebenarnya.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("form-banding")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Tulis Banding
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-orange-500 hover:text-white disabled:opacity-60"
                  >
                    {refreshing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Banding
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalBanding} Pengajuan
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Riwayat banding akan tampil di halaman ini setelah berhasil
                    diajukan.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Total" value={String(totalBanding)} />
                    <HeroPill label="Status" value="Aktif" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {msg.text && <AlertMessage type={msg.type} text={msg.text} />}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<ClipboardList size={22} />}
              label="Total Banding"
              value={`${totalBanding} Pengajuan`}
            />

            <MiniStat
              icon={<Calendar size={22} />}
              label="Banding Terakhir"
              value={bandingTerakhir}
            />

            <MiniStat
              icon={<ShieldCheck size={22} />}
              label="Status Fitur"
              value="Tersedia"
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6 items-start">
            <div
              id="form-banding"
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden xl:sticky xl:top-6"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <MessageSquareText size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#071E3D]">
                    Form Banding
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Tulis alasan
                  </p>
                </div>
              </div>

              <form onSubmit={submitBanding} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                    Alasan Banding
                  </label>

                  <textarea
                    value={isiBanding}
                    onChange={(e) => {
                      setIsiBanding(e.target.value);

                      if (msg.text) {
                        setMsg({ type: "", text: "" });
                      }
                    }}
                    className="w-full px-5 py-4 bg-slate-50/70 border border-slate-100 rounded-[22px] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 focus:bg-white transition-all text-sm font-black text-[#071E3D] placeholder:text-slate-300 resize-none"
                    placeholder="Tulis alasan banding Anda secara jelas..."
                    rows={8}
                    disabled={submitting}
                  />

                  <p className="text-xs text-slate-400 font-medium mt-3 leading-relaxed">
                    Jelaskan alasan banding dengan singkat, jelas, sopan, dan
                    sesuai kondisi sebenarnya.
                  </p>
                </div>

                <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5 text-orange-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm">Catatan</p>
                      <p className="text-xs font-semibold mt-1 leading-relaxed">
                        Pastikan banding hanya diajukan jika ada alasan yang
                        jelas terkait proses atau hasil asesmen.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                    submitting
                      ? "bg-orange-300 cursor-wait"
                      : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}

                  {submitting ? "Mengirim..." : "Ajukan Banding"}

                  {!submitting && <ChevronRight size={17} />}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <ClipboardList size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-[#071E3D]">
                      Riwayat Banding Saya
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                      Data pengajuan
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-orange-500 hover:text-white disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={15} />
                  )}
                  Refresh
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <LoadingHistory />
                ) : riwayatBanding.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {riwayatBanding.map((item, index) => (
                      <BandingItem
                        key={item.id_banding || item.id || index}
                        item={item}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function BandingItem({ item, index }) {
  const tanggal = item.tanggal_ajukan || item.createdAt || item.created_at;

  return (
    <article className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-white hover:shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(tanggal)}
            </span>

            <span className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase tracking-widest">
              Banding #{index + 1}
            </span>

            {item.jadwal?.pelaksanaan_uji && (
              <span className="px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                <MonitorCheck size={13} />
                {item.jadwal.pelaksanaan_uji}
              </span>
            )}
          </div>

          <div className="rounded-[24px] bg-white border border-slate-100 p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Isi Banding
            </p>

            <p className="text-sm lg:text-base text-[#071E3D] font-bold leading-relaxed break-words">
              {item.isi_banding || "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <InfoBox label="Skema" icon={<BookOpen size={15} />}>
              {item.skema?.judul_skema ||
                item.skema?.nama_skema ||
                item.judul_skema ||
                "-"}
            </InfoBox>

            <InfoBox label="Jadwal" icon={<MonitorCheck size={15} />}>
              {item.jadwal?.pelaksanaan_uji ||
                item.jadwal?.nama_jadwal ||
                item.pelaksanaan_uji ||
                "-"}
            </InfoBox>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingHistory() {
  return (
    <div className="text-center py-16">
      <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={40} />

      <p className="text-[#071E3D] font-black">Memuat Riwayat Banding</p>

      <p className="text-slate-400 text-sm mt-1 font-medium">
        Mohon tunggu sebentar...
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
      <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center mx-auto mb-5">
        <Inbox className="text-slate-300" size={38} />
      </div>

      <h3 className="text-xl font-black text-[#071E3D] mb-2">
        Belum Ada Banding
      </h3>

      <p className="text-slate-500 font-medium">
        Anda belum pernah mengajukan banding.
      </p>
    </div>
  );
}

function AlertMessage({ type, text }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-start gap-3 ${
        isSuccess
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-red-50 border-red-100 text-red-600"
      }`}
    >
      {isSuccess ? (
        <BadgeCheck size={20} className="shrink-0 mt-0.5" />
      ) : (
        <XCircle size={20} className="shrink-0 mt-0.5" />
      )}

      <div>
        <p className="font-black">
          {isSuccess ? "Berhasil" : "Terjadi Kesalahan"}
        </p>
        <p className="mt-1 font-medium">{text}</p>
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

function InfoBox({ label, icon, children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className="text-sm font-black text-[#071E3D] leading-relaxed break-words">
        {children}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}