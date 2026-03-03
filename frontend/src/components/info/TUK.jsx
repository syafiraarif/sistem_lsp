import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { MapPin, User, Search, Briefcase, Info, Navigation, Loader2 } from "lucide-react";

// Ganti sesuai port backend temanmu
const API_URL = "http://localhost:3000/api/public";

export default function TUK() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tukData, setTukData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Memanggil endpoint public yang baru kita buat
        const response = await axios.get(`${API_URL}/tuk`);
        
        if (response.data.success) {
          setTukData(response.data.data);
        }
      } catch (err) {
        console.error("Gagal load TUK:", err);
        setError("Gagal memuat data TUK. Pastikan server menyala.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic (Client Side Filtering)
  const filteredTUK = tukData.filter(item => {
    const search = searchTerm.toLowerCase();
    const fullAddress = `${item.alamat || ''} ${item.kota || ''} ${item.provinsi || ''}`.toLowerCase();
    return (
      item.nama.toLowerCase().includes(search) ||
      fullAddress.includes(search)
    );
  });

  // Helper untuk format jenis TUK (kapitalisasi)
  const formatJenis = (jenis) => {
    if (!jenis) return "Standar";
    return jenis.charAt(0).toUpperCase() + jenis.slice(1).replace("_", " ");
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[120px] -mr-48 -mt-48" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-orange-100"
          >
            <Navigation size={14} /> TUK Directory
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-[#071E3D] tracking-tight mb-6">
            Tempat Uji <span className="text-orange-500">Kompetensi</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Daftar lokasi resmi pelaksanaan Asesmen Uji Kompetensi yang telah terverifikasi oleh LSP.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto mb-16 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari TUK atau Kota (Sorong, Blitar, Jakarta)..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-[#071E3D]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-sm">Sedang memuat data TUK...</p>
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
                  key={tuk.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-[0_15px_45px_-15px_rgba(7,30,61,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(249,115,22,0.12)] transition-all duration-500 group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      tuk.jenis === "mandiri" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                    }`}>
                      TUK {formatJenis(tuk.jenis)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                      <Briefcase size={12} /> {tuk.asesmen || 0} Asesmen
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-[#071E3D] mb-6 leading-tight group-hover:text-orange-600 transition-colors h-12 overflow-hidden line-clamp-2">
                    {tuk.nama}
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex gap-3 text-slate-500">
                      <MapPin className="shrink-0 text-orange-500" size={18} />
                      <div className="text-[11px] font-bold leading-relaxed">
                        {/* Mapping Data Alamat dari Backend */}
                        <p className="text-[#071E3D]">{tuk.alamat}</p>
                        <p className="opacity-70 uppercase">
                          {tuk.kota ? `${tuk.kota}, ` : ""} 
                          {tuk.provinsi || ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 text-slate-500 border-t border-slate-50 pt-4">
                      <User className="shrink-0 text-[#071E3D]" size={16} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Penanggungjawab</p>
                        <p className="text-[11px] font-bold text-slate-700">
                          {tuk.penanggungjawab || "Tim Teknis LSP"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-2xl bg-slate-50 text-[#071E3D] text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-[#071E3D] group-hover:text-white transition-all">
                    Lihat Detail Lokasi
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredTUK.length === 0 && !error && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <Info size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">Data TUK tidak ditemukan.</p>
          </div>
        )}
      </div>
    </section>
  );
}