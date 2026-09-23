import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  Loader2,
  AlertTriangle,
  LayoutGrid
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Jadwal() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/jadwal`
        );

        const data = response.data;

        if (!data || data.length === 0) {
          setSchedules([]);
          return;
        }

        const mapped = data.map((item) => ({
          id: item.id_jadwal,
          skema: item.nama_kegiatan,
          tanggal: item.tgl_awal,
          waktu: item.jam,
          jenis: item.pelaksanaan_uji,
          status: item.status,
          tuk: item.tuk?.nama_tuk,
          alamat: `${item.tuk?.kota || ""} ${
            item.tuk?.provinsi || ""
          }`.trim()
        }));

        setSchedules(mapped);
      } catch (err) {
        console.error("Gagal mengambil data jadwal:", err);
        setError("Jadwal asesmen belum tersedia saat ini.");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSchedules = schedules.filter((item) => {
    const keyword = searchTerm.toLowerCase();

    return (
      item.skema?.toLowerCase().includes(keyword) ||
      item.tuk?.toLowerCase().includes(keyword) ||
      item.jenis?.toLowerCase().includes(keyword)
    );
  });

  const formatTanggal = (tgl) => {
    if (!tgl) {
      return "-";
    }

    const date = new Date(tgl);

    if (isNaN(date.getTime())) {
      return tgl;
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatJenis = (jenis) => {
    const map = {
      luring: "Luring",
      daring: "Daring",
      hybrid: "Hybrid",
      onsite: "On-Site"
    };

    return map[jenis] || "Uji Sertifikasi";
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Tersedia";
    }

    const statusMap = {
      open: "Dibuka",
      closed: "Ditutup",
      selesai: "Selesai",
      pending: "Menunggu"
    };

    return (
      statusMap[status?.toLowerCase()] ||
      status
    );
  };

  return (
    <section className="relative overflow-hidden bg-white py-4 lg:py-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-[#CC6B27]/[0.025] blur-[110px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-[#071E3D]/[0.02] blur-[110px]" />

      <div className="relative mx-auto max-w-5xl px-1">
        <header className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{
              opacity: 0,
              y: 12
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.4
            }}
            className="text-2xl font-black tracking-tight text-[#071E3D] sm:text-3xl"
          >
            Jadwal{" "}
            <span className="text-[#CC6B27]">
              Asesmen
            </span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 8
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.4,
              delay: 0.08
            }}
            className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500"
          >
            Temukan jadwal pelaksanaan uji kompetensi
            berdasarkan skema, tempat, dan metode asesmen
            yang tersedia.
          </motion.p>
        </header>

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Cari skema, TUK, atau metode asesmen..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/5"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          {loading ? (
            <div className="rounded-xl border border-slate-100 bg-white py-16 text-center">
              <Loader2
                size={30}
                className="mx-auto mb-3 animate-spin text-[#CC6B27]"
              />

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Memuat Jadwal Asesmen
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
                <AlertTriangle size={18} />
              </div>

              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          ) : filteredSchedules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredSchedules.map((item) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 12
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      y: -8
                    }}
                    transition={{
                      duration: 0.25
                    }}
                    className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_12px_35px_-30px_rgba(7,30,61,0.2)] transition-all duration-300 hover:border-[#CC6B27]/20 hover:shadow-[0_18px_40px_-28px_rgba(204,107,39,0.2)]"
                  >
                    <div className="border-l-4 border-[#CC6B27]">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                              <Calendar size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#CC6B27]">
                                Jadwal Asesmen
                              </p>

                              <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-[#071E3D]">
                                {item.skema || "Uji Kompetensi"}
                              </h3>
                            </div>
                          </div>

                          <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.12em] text-[#CC6B27]">
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                          <ScheduleInfo
                            icon={Calendar}
                            label="Tanggal"
                            value={formatTanggal(item.tanggal)}
                          />

                          <ScheduleInfo
                            icon={Clock}
                            label="Waktu"
                            value={
                              item.waktu ||
                              "08:00 - Selesai"
                            }
                          />

                          <ScheduleInfo
                            icon={MapPin}
                            label="Tempat Uji Kompetensi"
                            value={
                              item.tuk ||
                              "TUK belum tersedia"
                            }
                            secondary={item.alamat}
                          />

                          <ScheduleInfo
                            icon={LayoutGrid}
                            label="Metode"
                            value={formatJenis(item.jenis)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/jadwal-detail/${item.id}`,
                              {
                                state: {
                                  schedule: item
                                }
                              }
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#071E3D] px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#CC6B27]"
                        >
                          Detail Jadwal
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm">
                <Search size={22} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Jadwal tidak ditemukan
              </p>

              <p className="mt-2 text-[10px] font-medium text-slate-400">
                Coba gunakan kata kunci pencarian yang
                berbeda.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ScheduleInfo({
  icon: Icon,
  label,
  value,
  secondary
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#CC6B27]">
        <Icon size={14} />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-[10px] font-semibold leading-4 text-[#071E3D]">
          {value}
        </p>

        {secondary && (
          <p className="mt-0.5 text-[9px] font-medium leading-4 text-slate-400">
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}