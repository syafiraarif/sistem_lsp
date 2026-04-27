// frontend/src/pages/asesi/JadwalAsesi.jsx

import React, { useEffect, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  BookOpen,
  Calendar,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Inbox,
  Loader2,
  MonitorCheck,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";

export default function JadwalAsesi() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const API = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJadwal();
    fetchMyJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal/tersedia`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJadwal(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat jadwal tersedia");
      setJadwal([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal-saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const picked = (res.data.data || []).map(
        (item) => item.id_jadwal || item.jadwal?.id_jadwal
      );

      setMyJadwal(picked);
    } catch (err) {
      console.error(err);
      setMyJadwal([]);
    }
  };

  const pilihJadwal = async (id_jadwal) => {
    try {
      await axios.post(
        `${API}/asesi/jadwal/pilih`,
        { id_jadwal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Jadwal berhasil dipilih, tinggal menunggu diterima");
      setMyJadwal((prev) => [...prev, id_jadwal]);
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.includes("sudah terdaftar")) {
        alert("Anda sudah terdaftar pada jadwal ini, tinggal menunggu diterima");
      } else {
        alert(msg || "Gagal memilih jadwal");
      }
    }
  };

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
          <Loader2
            className="animate-spin text-orange-500 mx-auto mb-5"
            size={44}
          />
          <p className="text-[#071E3D] font-black text-lg">
            Memuat Jadwal Sertifikasi
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
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

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
                  Jadwal Sertifikasi
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Pilih jadwal uji kompetensi yang tersedia sesuai skema
                  sertifikasi yang ingin Anda ikuti.
                </p>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-5 min-w-[230px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />

                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Jadwal Tersedia
                  </p>

                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black">{jadwal.length}</h2>
                    <Calendar className="text-orange-400" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          {jadwal.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-12 lg:p-16 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5">
                <Inbox className="text-slate-300" size={38} />
              </div>

              <h2 className="text-2xl font-black text-[#071E3D] mb-2">
                Belum Ada Jadwal Tersedia
              </h2>

              <p className="text-slate-500 font-medium">
                Saat ini belum ada jadwal sertifikasi yang dapat dipilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {jadwal.map((item) => {
                const alreadyPicked = myJadwal.includes(item.id_jadwal);
                const skema = item.skema || {};
                const tuk = item.tuk || {};

                return (
                  <article
                    key={item.id_jadwal}
                    className="bg-white rounded-[30px] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-30px_rgba(7,30,61,0.35)] transition-all overflow-hidden"
                  >
                    <div className="p-5 lg:p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                          <BookOpen size={26} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {skema.kode_skema && (
                              <span className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                {skema.kode_skema}
                              </span>
                            )}

                            {skema.jenis_skema && (
                              <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                {skema.jenis_skema}
                              </span>
                            )}

                            {alreadyPicked && (
                              <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                <CheckCircle size={13} />
                                Sudah Dipilih
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl lg:text-2xl font-black text-[#071E3D] leading-tight">
                            {skema.judul_skema || "Skema tidak tersedia"}
                          </h2>

                          <p className="text-slate-500 text-sm font-medium mt-2">
                            {item.nama_kegiatan || "Jadwal uji kompetensi"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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

                        <InfoCard label="Jenis Pelaksanaan">
                          <div className="flex items-start gap-2">
                            <MonitorCheck
                              size={18}
                              className="text-orange-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-black text-[#071E3D] leading-snug capitalize">
                              {item.pelaksanaan_uji || "-"}
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
                              {formatDate(item.tgl_awal)} -{" "}
                              {formatDate(item.tgl_akhir)}
                            </p>
                          </div>
                        </InfoCard>

                        <InfoCard label="Kuota">
                          <div className="flex items-start gap-2">
                            <Users
                              size={18}
                              className="text-orange-500 mt-0.5 shrink-0"
                            />
                            <p className="text-sm font-black text-[#071E3D] leading-snug">
                              {item.kuota || 0} peserta
                            </p>
                          </div>
                        </InfoCard>
                      </div>
                    </div>

                    <div className="px-5 lg:px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest inline-flex items-center gap-2">
                        <Tag size={13} />
                        ID Jadwal: {item.id_jadwal || "-"}
                      </span>

                      <button
                        disabled={alreadyPicked}
                        onClick={() => pilihJadwal(item.id_jadwal)}
                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 ${
                          alreadyPicked
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-[#071E3D] text-white shadow-lg shadow-orange-500/20"
                        }`}
                      >
                        {alreadyPicked ? (
                          <>
                            <CheckCircle size={17} />
                            Sudah Dipilih
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={17} />
                            Pilih Jadwal
                            <ChevronRight size={16} />
                          </>
                        )}
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
}

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