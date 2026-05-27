import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  LayoutGrid,
  Search,
  Loader2,
  Info,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import axios from "axios";

// Endpoint target (sesuai yang ada di public.routes.js backendmu)
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

        // Memanggil API Publik Skema
        const response = await axios.get(`${API_URL}/skema`);

        if (response.data.success) {
          setSchemes(response.data.data);
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
    item.judul_skema?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSkema = (idSkema) => {
    setOpenSkemaId((prev) => (prev === idSkema ? null : idSkema));
  };

  const getUnitKompetensi = (scheme) => {
    if (!Array.isArray(scheme.skemaUnit)) return [];

    return scheme.skemaUnit
      .filter((item) => item.unit)
      .map((item) => ({
        id_unit: item.unit.id_unit,
        kode_unit: item.unit.kode_unit,
        judul_unit: item.unit.judul_unit,
        urutan: item.urutan,
      }));
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <LayoutGrid className="text-orange-500" size={24} />
            Skema Sertifikasi{" "}
            <span className="text-orange-500 italic">WHOP</span>
          </h3>

          <p className="text-gray-500 text-sm mt-2 font-medium">
            Kami menyediakan{" "}
            <span className="text-gray-900 font-bold">
              {loading ? "..." : schemes.length} Skema Kompetensi
            </span>{" "}
            yang diakui secara nasional.
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400
                       group-focus-within:text-orange-500 transition-colors"
            size={16}
          />

          <input
            type="text"
            placeholder="Cari skema kompetensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl
                       text-xs font-bold focus:outline-none focus:ring-4
                       focus:ring-orange-500/10 focus:border-orange-500
                       transition-all w-full md:w-[280px]"
          />
        </div>
      </div>

      {/* TAMPILAN LOADING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">
            Memuat Skema...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100">
          <p className="text-red-500 font-bold text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {filteredSchemes.map((scheme, index) => {
              const isOpen = openSkemaId === scheme.id_skema;
              const unitKompetensi = getUnitKompetensi(scheme);

              return (
                <motion.div
                  key={scheme.id_skema || index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`bg-white border rounded-[1.5rem] transition-all duration-300 shadow-sm overflow-hidden ${
                    isOpen
                      ? "border-orange-200 shadow-md"
                      : "border-gray-100 hover:border-orange-200 hover:shadow-md"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSkema(scheme.id_skema)}
                    className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-300 group ${
                      isOpen ? "bg-orange-50" : "bg-white hover:bg-orange-50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl
                                  flex items-center justify-center
                                  transition-all duration-500 ${
                                    isOpen
                                      ? "bg-orange-500 text-white"
                                      : "bg-gray-50 text-gray-400 group-hover:bg-orange-500 group-hover:text-white"
                                  }`}
                    >
                      <Award size={18} />
                    </div>

                    <div className="flex-grow">
                      <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">
                        {scheme.judul_skema}
                      </span>

                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span
                          className="text-[9px] font-black uppercase tracking-widest
                                     text-gray-300 group-hover:text-orange-400"
                        >
                          {scheme.status === "aktif"
                            ? "Tersedia"
                            : "Tidak Aktif"}
                        </span>

                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                          • {unitKompetensi.length} Unit Kompetensi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                          isOpen
                            ? "bg-orange-500 text-white"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {isOpen ? "Tutup" : "Lihat Unit"}
                      </div>

                      <ChevronDown
                        size={18}
                        className={`text-orange-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-orange-100 bg-white"
                      >
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-orange-500" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#071E3D]">
                              Unit Kompetensi
                            </h4>
                          </div>

                          {unitKompetensi.length > 0 ? (
                            <div className="space-y-3">
                              {unitKompetensi.map((unit, unitIndex) => (
                                <motion.div
                                  key={unit.id_unit || unitIndex}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: unitIndex * 0.03 }}
                                  className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/40 transition-all"
                                >
                                  <div className="w-8 h-8 rounded-xl bg-white text-orange-500 flex items-center justify-center font-black text-[10px] border border-orange-100 shrink-0">
                                    {unitIndex + 1}
                                  </div>

                                  <div className="flex-grow">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">
                                      {unit.kode_unit || "Kode Unit Belum Ada"}
                                    </p>

                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                      {unit.judul_unit || "Judul unit belum tersedia"}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                              <Info
                                size={28}
                                className="mx-auto text-slate-300 mb-2"
                              />
                              <p className="text-xs font-bold text-slate-400">
                                Unit kompetensi untuk skema ini belum tersedia.
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
      )}

      {/* JIKA DATA KOSONG */}
      {!loading && !error && filteredSchemes.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <Info size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold text-sm">
            Skema tidak ditemukan.
          </p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fdba74;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </div>
  );
}