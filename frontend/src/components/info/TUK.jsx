import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  MapPin,
  User,
  Search,
  Navigation,
  Loader2,
  Info
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function TUK() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tukData, setTukData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/tuk`);

        setTukData(response.data || []);
      } catch (err) {
        console.error("Gagal load TUK:", err);

        setError(
          "Gagal memuat data TUK. Pastikan server menyala."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTUK = tukData.filter((item) => {
    const search = searchTerm.toLowerCase();

    const fullAddress = `${item.alamat || ""} ${
      item.kota || ""
    } ${item.provinsi || ""}`.toLowerCase();

    return (
      item.nama_tuk
        ?.toLowerCase()
        .includes(search) ||
      fullAddress.includes(search) ||
      item.jenis_tuk
        ?.toLowerCase()
        .includes(search)
    );
  });

  const formatJenis = (jenis) => {
    if (!jenis) {
      return "Standar";
    }

    return (
      jenis.charAt(0).toUpperCase() +
      jenis.slice(1).replace("_", " ")
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
            Tempat Uji{" "}
            <span className="text-[#CC6B27]">
              Kompetensi
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
            Daftar lokasi resmi pelaksanaan uji kompetensi
            yang dapat digunakan peserta sesuai jadwal dan
            wilayah pelaksanaan.
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
              placeholder="Cari TUK atau kota..."
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
                Memuat Data TUK
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
                <Info size={18} />
              </div>

              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          ) : filteredTUK.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredTUK.map((tuk, index) => (
                  <motion.article
                    key={tuk.id_tuk || index}
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
                    className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_12px_35px_-30px_rgba(7,30,61,0.2)] transition-all duration-300 hover:border-[#CC6B27]/25 hover:shadow-[0_18px_40px_-28px_rgba(204,107,39,0.18)]"
                  >
                    <div className="border-l-4 border-[#CC6B27]">
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                            <Navigation size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#CC6B27]">
                              TUK
                            </p>

                            <h3 className="mt-1 text-sm font-black leading-5 text-[#071E3D]">
                              {tuk.nama_tuk}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-5 rounded-lg bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-[#CC6B27]"
                            />

                            <div className="min-w-0">
                              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Lokasi
                              </p>

                              <p className="mt-1 text-[10px] font-semibold leading-4 text-[#071E3D]">
                                {tuk.alamat || "-"}
                              </p>

                              {(tuk.kota ||
                                tuk.provinsi) && (
                                <p className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
                                  {[
                                    tuk.kota,
                                    tuk.provinsi
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#071E3D]/5 text-[#071E3D]">
                              <User size={14} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Penanggungjawab
                              </p>

                              <p className="mt-0.5 truncate text-[10px] font-semibold text-[#071E3D]">
                                {tuk.penanggung_jawab ||
                                  "Tim Teknis LSP"}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-lg bg-[#CC6B27]/10 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#CC6B27]">
                            {formatJenis(tuk.jenis_tuk)}
                          </span>
                        </div>
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
                Data TUK tidak ditemukan
              </p>

              <p className="mt-2 text-[10px] font-medium text-slate-400">
                Coba gunakan nama TUK atau kota yang berbeda.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}