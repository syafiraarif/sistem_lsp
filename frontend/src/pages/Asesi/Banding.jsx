// src/pages/asesi/Banding.jsx

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const Banding = () => {
  const [isiBanding, setIsiBanding] = useState("");
  const [riwayatBanding, setRiwayatBanding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;

  const fetchBanding = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API_BASE}/asesi/banding-saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRiwayatBanding(res.data?.data || []);
    } catch (err) {
      console.error("Error fetchBanding:", err);
      setMsg({
        type: "error",
        text: "Gagal memuat data banding.",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitBanding = async (e) => {
    e.preventDefault();

    if (!isiBanding.trim()) {
      setMsg({
        type: "error",
        text: "Isi banding wajib diisi!",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });

      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      await axios.post(
        `${API_BASE}/asesi/banding`,
        { isi_banding: isiBanding },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({
        type: "success",
        text: "Banding berhasil diajukan!",
      });

      setIsiBanding("");
      fetchBanding();
    } catch (err) {
      console.error("Error submitBanding:", err);
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Terjadi kesalahan server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBanding();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <AlertTriangle size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Pengajuan Banding
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Ajukan Banding
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Sampaikan alasan banding Anda terkait proses asesmen atau
                  hasil uji kompetensi melalui form di bawah ini.
                </p>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-5 min-w-[230px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />

                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Total Banding
                  </p>

                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black">
                      {riwayatBanding.length}
                    </h2>
                    <ClipboardList className="text-orange-400" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {msg.text && (
            <div
              className={`mb-6 rounded-[24px] border p-5 flex items-start gap-3 ${
                msg.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-red-50 border-red-100 text-red-600"
              }`}
            >
              {msg.type === "success" ? (
                <ShieldCheck size={22} className="shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={22} className="shrink-0 mt-0.5" />
              )}

              <div>
                <p className="font-black">
                  {msg.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
                </p>
                <p className="text-sm font-medium mt-1">{msg.text}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* FORM */}
            <section className="xl:col-span-1">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden sticky top-6">
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
                    <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                      Alasan Banding
                    </label>

                    <textarea
                      value={isiBanding}
                      onChange={(e) => {
                        setIsiBanding(e.target.value);
                        if (msg.text) setMsg({ type: "", text: "" });
                      }}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] placeholder:text-slate-300 resize-none"
                      placeholder="Tulis alasan banding Anda secara jelas..."
                      rows={7}
                    />

                    <p className="text-xs text-slate-400 font-medium mt-2">
                      Jelaskan alasan banding dengan singkat, jelas, dan sesuai
                      kondisi sebenarnya.
                    </p>
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
            </section>

            {/* RIWAYAT */}
            <section className="xl:col-span-2">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
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

                  <span className="px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-xs font-black">
                    {riwayatBanding.length}
                  </span>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-16">
                      <Loader2
                        className="animate-spin text-orange-500 mx-auto mb-4"
                        size={40}
                      />
                      <p className="text-[#071E3D] font-black">
                        Memuat Riwayat Banding
                      </p>
                      <p className="text-slate-400 text-sm mt-1 font-medium">
                        Mohon tunggu sebentar...
                      </p>
                    </div>
                  ) : riwayatBanding.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      {riwayatBanding.map((b, index) => (
                        <article
                          key={b.id || index}
                          className="rounded-[26px] border border-slate-100 bg-slate-50/60 p-5 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <AlertTriangle size={22} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                  <Calendar size={13} />
                                  {formatDate(b.tanggal_ajukan)}
                                </span>

                                {b.jadwal?.pelaksanaan_uji && (
                                  <span className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <MonitorCheck size={13} />
                                    {b.jadwal.pelaksanaan_uji}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
                                Isi Banding
                              </h3>

                              <p className="text-[#071E3D] font-bold leading-relaxed">
                                {b.isi_banding || "-"}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                                <InfoBox label="Skema" icon={<BookOpen size={15} />}>
                                  {b.skema?.judul_skema || "-"}
                                </InfoBox>

                                <InfoBox
                                  label="Jadwal"
                                  icon={<MonitorCheck size={15} />}
                                >
                                  {b.jadwal?.pelaksanaan_uji || "-"}
                                </InfoBox>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoBox = ({ label, icon, children }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className="text-sm font-black text-[#071E3D] leading-relaxed">
        {children}
      </p>
    </div>
  );
};

export default Banding;