import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Search,
  Award,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Loader2,
  AlertTriangle,
  Info,
  LayoutGrid
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Skema() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openSkemaId, setOpenSkemaId] = useState(null);

  useEffect(() => {
    const fetchSkema = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/skema`
        );

        if (response.data.success) {
          setSchemes(response.data.data || []);
        } else {
          setSchemes([]);
        }
      } catch (err) {
        console.error("Gagal ambil skema:", err);
        setError("Gagal memuat daftar skema.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkema();
  }, []);

  const filteredSchemes = schemes.filter((item) =>
    (item.judul_skema || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleSkema = (idSkema) => {
    setOpenSkemaId((prev) =>
      prev === idSkema ? null : idSkema
    );
  };

  const getUnitKompetensi = (scheme) => {
    if (!Array.isArray(scheme.skemaUnit)) {
      return [];
    }

    return scheme.skemaUnit
      .filter((item) => item.unit)
      .map((item) => ({
        id_unit: item.unit.id_unit,
        kode_unit: item.unit.kode_unit,
        judul_unit: item.unit.judul_unit,
        urutan: item.urutan
      }))
      .sort((a, b) => {
        if (
          a.urutan === null ||
          a.urutan === undefined
        ) {
          return 1;
        }

        if (
          b.urutan === null ||
          b.urutan === undefined
        ) {
          return -1;
        }

        return a.urutan - b.urutan;
      });
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
            Skema{" "}
            <span className="text-[#CC6B27]">
              Sertifikasi
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
            Daftar skema sertifikasi yang tersedia beserta
            unit kompetensi yang menjadi bagian dari setiap
            skema.
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenSkemaId(null);
              }}
              placeholder="Cari skema sertifikasi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/5"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-4xl">
          {loading ? (
            <div className="rounded-xl border border-slate-100 bg-white py-16 text-center">
              <Loader2
                size={30}
                className="mx-auto mb-3 animate-spin text-[#CC6B27]"
              />

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Memuat Data Skema
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
          ) : filteredSchemes.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredSchemes.map((scheme, index) => {
                  const isOpen =
                    openSkemaId === scheme.id_skema;

                  const unitKompetensi =
                    getUnitKompetensi(scheme);

                  return (
                    <motion.div
                      key={scheme.id_skema || index}
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
                        duration: 0.25,
                        delay: index * 0.02
                      }}
                      className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                        isOpen
                          ? "border-[#CC6B27]/30 shadow-[0_16px_40px_-28px_rgba(204,107,39,0.32)]"
                          : "border-slate-100 hover:border-[#CC6B27]/20"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSkema(
                            scheme.id_skema
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                              isOpen
                                ? "bg-[#071E3D] text-[#CC6B27]"
                                : "bg-[#CC6B27]/10 text-[#CC6B27]"
                            }`}
                          >
                            <Award size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#CC6B27]">
                              Skema Sertifikasi
                            </p>

                            <h3
                              className={`mt-1 text-xs font-black leading-5 sm:text-sm ${
                                isOpen
                                  ? "text-[#071E3D]"
                                  : "text-slate-700"
                              }`}
                            >
                              {scheme.judul_skema}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                <CheckCircle2
                                  size={11}
                                  className={
                                    scheme.status ===
                                    "aktif"
                                      ? "text-emerald-500"
                                      : "text-slate-300"
                                  }
                                />

                                {scheme.status === "aktif"
                                  ? "Tersedia"
                                  : "Tidak Aktif"}
                              </span>

                              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                {unitKompetensi.length} Unit
                                Kompetensi
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                            isOpen
                              ? "bg-[#071E3D] text-white"
                              : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1
                            }}
                            exit={{
                              height: 0,
                              opacity: 0
                            }}
                            transition={{
                              duration: 0.25
                            }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">
                              <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                                  <BookOpen size={15} />
                                </div>

                                <div>
                                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#CC6B27]">
                                    Detail Skema
                                  </p>

                                  <h4 className="mt-1 text-xs font-black text-[#071E3D]">
                                    Unit Kompetensi
                                  </h4>
                                </div>
                              </div>

                              {unitKompetensi.length > 0 ? (
                                <div className="space-y-3">
                                  {unitKompetensi.map(
                                    (
                                      unit,
                                      unitIndex
                                    ) => (
                                      <motion.div
                                        key={
                                          unit.id_unit ||
                                          unitIndex
                                        }
                                        initial={{
                                          opacity: 0,
                                          y: 6
                                        }}
                                        animate={{
                                          opacity: 1,
                                          y: 0
                                        }}
                                        transition={{
                                          delay:
                                            unitIndex *
                                            0.03
                                        }}
                                        className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:border-[#CC6B27]/20 hover:bg-white"
                                      >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-black text-[#CC6B27] shadow-sm">
                                          {unitIndex + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#CC6B27]">
                                            {unit.kode_unit ||
                                              "Kode Unit Belum Ada"}
                                          </p>

                                          <p className="mt-1 text-[10px] font-bold leading-5 text-[#071E3D] sm:text-[11px]">
                                            {unit.judul_unit ||
                                              "Judul unit belum tersedia"}
                                          </p>
                                        </div>
                                      </motion.div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-300">
                                    <LayoutGrid size={20} />
                                  </div>

                                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                    Unit kompetensi untuk
                                    skema ini belum tersedia.
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm">
                <Search size={22} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Skema sertifikasi tidak ditemukan.
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