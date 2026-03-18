import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  MapPin,
  User,
  Search,
  Briefcase,
  Info,
  Navigation,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function TUK() {

  const [searchTerm, setSearchTerm] = useState("");
  const [tukData, setTukData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const response = await axios.get(`${API_URL}/tuk`);

        // Backend langsung kirim array
        setTukData(response.data);

      } catch (err) {

        console.error("Gagal load TUK:", err);

        setError("Gagal memuat data TUK. Pastikan server menyala.");

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  /* ================= SEARCH FILTER ================= */

  const filteredTUK = tukData.filter(item => {

    const search = searchTerm.toLowerCase();

    const fullAddress =
      `${item.alamat || ""} ${item.kota || ""} ${item.provinsi || ""}`.toLowerCase();

    return (
      item.nama_tuk?.toLowerCase().includes(search) ||
      fullAddress.includes(search)
    );

  });

  /* ================= FORMAT JENIS ================= */

  const formatJenis = (jenis) => {

    if (!jenis) return "Standar";

    return jenis
      .charAt(0)
      .toUpperCase() +
      jenis.slice(1).replace("_", " ");

  };

  /* ================= UI ================= */

  return (

    <section className="py-24 bg-white relative overflow-hidden">

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* HEADER */}

        <div className="text-center mb-16">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-orange-100">
            <Navigation size={14} /> TUK Directory
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[#071E3D] mb-6">
            Tempat Uji <span className="text-orange-500">Kompetensi</span>
          </h2>

          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Daftar lokasi resmi pelaksanaan Asesmen Uji Kompetensi.
          </p>

        </div>

        {/* SEARCH */}

        <div className="max-w-xl mx-auto mb-16 relative">

          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

          <input
            type="text"
            placeholder="Cari TUK atau Kota..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

        {/* CONTENT */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20">

            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />

            <p className="text-slate-400 font-bold text-sm">
              Sedang memuat data TUK...
            </p>

          </div>

        ) : error ? (

          <div className="text-center py-20 bg-red-50 rounded-[3rem] border border-red-100">

            <p className="text-red-500 font-bold">{error}</p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <AnimatePresence>

              {filteredTUK.map((tuk, index) => (

                <motion.div
                  key={tuk.id_tuk || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow"
                >

                  {/* LABEL */}

                  <div className="flex justify-between mb-6">

                    <div className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600">

                      TUK {formatJenis(tuk.jenis_tuk)}

                    </div>

                  </div>

                  {/* TITLE */}

                  <h3 className="text-lg font-black text-[#071E3D] mb-6">

                    {tuk.nama_tuk}

                  </h3>

                  {/* ADDRESS */}

                  <div className="flex gap-3 text-slate-500 mb-6">

                    <MapPin className="text-orange-500" size={18} />

                    <div className="text-[11px] font-bold">

                      <p>{tuk.alamat}</p>

                      <p className="opacity-70 uppercase">
                        {tuk.kota}, {tuk.provinsi}
                      </p>

                    </div>

                  </div>

                  {/* PENANGGUNG JAWAB */}

                  <div className="flex gap-3 text-slate-500 border-t pt-4">

                    <User size={16} />

                    <div>

                      <p className="text-[9px] font-black uppercase text-slate-400">
                        Penanggungjawab
                      </p>

                      <p className="text-[11px] font-bold text-slate-700">

                        {tuk.penanggung_jawab || "Tim Teknis LSP"}

                      </p>

                    </div>

                  </div>

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

        )}

        {!loading && filteredTUK.length === 0 && !error && (

          <div className="text-center py-20">

            <Info size={48} className="mx-auto text-slate-300 mb-4" />

            <p className="text-slate-500 font-bold">
              Data TUK tidak ditemukan
            </p>

          </div>

        )}

      </div>

    </section>

  );

}