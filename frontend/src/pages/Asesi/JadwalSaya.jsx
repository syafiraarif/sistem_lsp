// frontend/src/pages/asesi/JadwalSaya.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  FileCheck,
  Loader2,
  Send,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Inbox,
  Building2,
  MonitorCheck,
  BookOpen,
} from "lucide-react";

const JadwalSaya = () => {
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(`${API_BASE}/asesi/jadwal-saya`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJadwalSaya(res.data.data || []);
      } catch (err) {
        console.error("Error fetching jadwal saya:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, [API_BASE, navigate]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-5" size={44} />
          <p className="text-[#071E3D] font-black text-lg">
            Memuat Jadwal Saya
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Dashboard Asesi
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Jadwal Saya
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Pantau jadwal sertifikasi yang sudah Anda daftar dan lanjutkan
                  proses asesmen dari satu halaman.
                </p>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-5 min-w-[230px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />

                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Total Jadwal
                  </p>

                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black">
                      {jadwalSaya.length}
                    </h2>
                    <Calendar className="text-orange-400" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          {jadwalSaya.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-12 lg:p-16 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5">
                <Inbox className="text-slate-300" size={38} />
              </div>

              <h2 className="text-2xl font-black text-[#071E3D] mb-2">
                Belum Ada Jadwal
              </h2>

              <p className="text-slate-500 font-medium mb-7">
                Anda belum terdaftar pada jadwal sertifikasi apa pun.
              </p>

              <button
                onClick={() => navigate("/asesi/jadwal")}
                className="px-7 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2"
              >
                Lihat Skema Sertifikasi
                <ChevronRight size={17} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {jadwalSaya.map((item) => {
                const jadwal = item.jadwal || {};
                const skema = jadwal.skema || {};
                const tuk = jadwal.tuk || {};

                return (
                  <article
                    key={`${item.id_user}-${item.id_jadwal}`}
                    className="bg-white rounded-[30px] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-30px_rgba(7,30,61,0.35)] transition-all overflow-hidden"
                  >
                    <div className="p-5 lg:p-6">
                      <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                        {/* Main */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <BookOpen size={26} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {skema.kode_skema && (
                                  <span className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                    {skema.kode_skema}
                                  </span>
                                )}

                                {jadwal.pelaksanaan_uji && (
                                  <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {jadwal.pelaksanaan_uji}
                                  </span>
                                )}
                              </div>

                              <h2 className="text-xl lg:text-2xl font-black text-[#071E3D] leading-tight">
                                {skema.judul_skema || "Skema Sertifikasi"}
                              </h2>

                              <p className="text-slate-500 text-sm font-medium mt-2">
                                {jadwal.nama_kegiatan || "Jadwal sertifikasi"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <InfoCard label="Tempat Uji Kompetensi">
                              <div className="flex items-start gap-2">
                                <Building2
                                  size={18}
                                  className="text-orange-500 mt-0.5 shrink-0"
                                />
                                <p className="text-sm font-black text-[#071E3D] leading-snug">
                                  {tuk.nama_tuk || "-"}
                                </p>
                              </div>
                            </InfoCard>

                            <InfoCard label="Tanggal Uji">
                              <div className="flex items-start gap-2">
                                <Calendar
                                  size={18}
                                  className="text-orange-500 mt-0.5 shrink-0"
                                />
                                <p className="text-sm font-black text-[#071E3D] leading-snug">
                                  {formatDate(jadwal.tgl_awal)} -{" "}
                                  {formatDate(jadwal.tgl_akhir)}
                                </p>
                              </div>
                            </InfoCard>

                            <InfoCard label="Jenis Pelaksanaan">
                              <div className="flex items-start gap-2">
                                <MonitorCheck
                                  size={18}
                                  className="text-orange-500 mt-0.5 shrink-0"
                                />
                                <p className="text-sm font-black text-[#071E3D] leading-snug capitalize">
                                  {jadwal.pelaksanaan_uji || "-"}
                                </p>
                              </div>
                            </InfoCard>
                          </div>
                        </div>

                        {/* Action Panel */}
                        <div className="xl:w-[270px] shrink-0">
                          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                            <ActionButton
                              onClick={() =>
                                navigate(`/asesi/apl01/${skema.id_skema}`)
                              }
                              icon={<FileCheck size={16} />}
                              label="Kerjakan APL01"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/asesi/pembayaran/${skema.id_skema}`)
                              }
                              icon={<CreditCard size={16} />}
                              label="Bayar Sekarang"
                              className="bg-[#071E3D] hover:bg-[#0B2A55] text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/asesi/apl02/${skema.id_skema}`)
                              }
                              icon={<ClipboardList size={16} />}
                              label="Kerjakan APL02"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/asesi/pra-asesmen/${skema.id_skema}`)
                              }
                              icon={<ShieldCheck size={16} />}
                              label="Pra Asesmen"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(
                                  `/asesi/banding?jadwal=${item.id_jadwal}&skema=${skema.id_skema}`
                                )
                              }
                              icon={<AlertTriangle size={16} />}
                              label="Ajukan Banding"
                              className="bg-red-500 hover:bg-red-600 text-white col-span-2 xl:col-span-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 lg:px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        ID Jadwal: {item.id_jadwal || "-"}
                      </span>

                      <button
                        onClick={() => navigate(`/asesi/jadwal-saya`)}
                        className="text-[10px] text-orange-500 hover:text-[#071E3D] font-black uppercase tracking-widest inline-flex items-center gap-1 transition-colors"
                      >
                        Detail Proses
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const InfoCard = ({ label, children }) => {
  return (
    <div className="rounded-[22px] bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
        {label}
      </p>

      {children}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default JadwalSaya;