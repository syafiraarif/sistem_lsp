import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Search,
  FileCheck,
  ChevronDown,
  BookOpen,
  ClipboardList,
  Loader2,
  AlertTriangle,
  Inbox,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Persyaratan() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/skema`);
      const finalData = res.data.data || [];

      setSkemaList(finalData);
    } catch (err) {
      console.error("Gagal mengambil data persyaratan:", err);

      setError(
        "Daftar persyaratan sedang dalam proses update oleh sistem."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredData = skemaList.filter((item) =>
    (item.judul_skema || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="relative overflow-hidden bg-white py-4 lg:py-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-[#CC6B27]/[0.025] blur-[110px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-[#071E3D]/[0.02] blur-[110px]" />

      <div className="relative mx-auto max-w-5xl px-1">
        <header className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.4,
            }}
            className="text-2xl font-black tracking-tight text-[#071E3D] sm:text-3xl"
          >
            Persyaratan{" "}
            <span className="text-[#CC6B27]">
              Calon Asesi
            </span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 8,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.4,
              delay: 0.08,
            }}
            className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500"
          >
            Daftar dokumen yang perlu dipersiapkan peserta
            uji kompetensi sesuai dengan skema sertifikasi
            yang dipilih.
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenIndex(null);
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
                Memuat Data Skema & Syarat
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
          ) : filteredData.length > 0 ? (
            <div className="space-y-3">
              {filteredData.map((item, index) => {
                const listPersyaratan = item.persyaratans || [];
                const isOpen = openIndex === index;

                return (
                  <div
                    key={item.id_skema || index}
                    className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                      isOpen
                        ? "border-[#CC6B27]/30 shadow-[0_16px_40px_-28px_rgba(204,107,39,0.32)]"
                        : "border-slate-100 hover:border-[#CC6B27]/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
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
                          <BookOpen size={17} />
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
                            {item.judul_skema}
                          </h3>
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
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">
                            {listPersyaratan.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {listPersyaratan.map(
                                  (syarat, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-[#CC6B27]/20 hover:bg-white"
                                    >
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                                        <FileCheck size={15} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase leading-4 text-[#071E3D] sm:text-[11px]">
                                          {
                                            syarat.nama_persyaratan
                                          }
                                        </p>

                                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                          Wajib Dilampirkan
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                                <Inbox
                                  size={30}
                                  className="mx-auto mb-3 text-slate-300"
                                />

                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                  Belum ada data persyaratan
                                  untuk skema ini.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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
                Coba gunakan kata kunci pencarian yang berbeda.
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-slate-100 bg-[#071E3D] shadow-[0_20px_45px_-30px_rgba(7,30,61,0.3)]">
          <div className="relative px-6 py-6 md:px-8">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#CC6B27]/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="mb-2 flex items-center gap-2">
                  <ClipboardList
                    size={15}
                    className="text-[#CC6B27]"
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#CC6B27]">
                    Langkah Selanjutnya
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">
                  Sudah siap mengikuti uji kompetensi?
                </h3>

                <p className="mt-1.5 text-xs font-medium leading-5 text-slate-400">
                  Pastikan seluruh dokumen persyaratan telah
                  dipersiapkan sebelum melakukan pendaftaran.
                </p>
              </div>

              <Link
                to="/pendaftaran"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-white hover:text-[#071E3D]"
              >
                Mulai Pendaftaran
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}