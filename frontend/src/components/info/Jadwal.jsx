import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Calendar, MapPin, Clock, Search, LayoutGrid, ArrowRight, Loader2, Info } from "lucide-react";

// Endpoint target (sesuai request kamu)
const API_URL = "http://localhost:3000/api/public";

export default function Jadwal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mencoba mengambil data dari endpoint yang seharusnya ada
        const response = await axios.get(`${API_URL}/jadwal`);
        
        if (response.data.success) {
          setSchedules(response.data.data);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        console.error("Gagal load Jadwal:", err);
        // Jika error (misal 404 karena endpoint belum ada), set state error
        setError("Jadwal asesmen belum tersedia saat ini."); 
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSchedules = schedules.filter(item =>
    (item.skema?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
    (item.tuk?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
  );

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    const date = new Date(tgl);
    return isNaN(date.getTime()) ? tgl : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatJenis = (jenis) => {
    if (!jenis) return "Uji Sertifikasi";
    const map = {
      luring: "Uji Sertifikasi Luring (Offline)",
      daring: "Uji Sertifikasi Daring (Online)",
      hybrid: "Uji Sertifikasi Hybrid",
      onsite: "Uji Sertifikasi On-Site"
    };
    return map[jenis.toLowerCase()] || jenis.toUpperCase();
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#071E3D]/[0.02] rounded-full blur-[100px] -ml-64 -mt-64" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-orange-100"
          >
            <LayoutGrid size={14} /> Schedule Events
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-[#071E3D] tracking-tight mb-6">
            Jadwal Pelaksanaan <span className="text-orange-500">Asesmen</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Pantau jadwal uji kompetensi terbaru dan lokasi Tempat Uji Kompetensi (TUK) yang tersedia.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari skema atau lokasi TUK..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-[#071E3D]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-sm">Sedang memuat jadwal terbaru...</p>
          </div>
        ) : error || filteredSchedules.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <Info size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">
              {error || "Jadwal tidak ditemukan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredSchedules.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_15px_45px_-15px_rgba(7,30,61,0.08)] hover:shadow-[0_30px_60px_-20px_rgba(249,115,22,0.15)] transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="px-4 py-1.5 rounded-full bg-[#071E3D]/5 text-[#071E3D] text-[10px] font-black uppercase tracking-widest border border-[#071E3D]/10">
                      {formatJenis(item.jenis)}
                    </span>
                    <div className="text-orange-500 font-black text-[10px] uppercase tracking-widest animate-pulse">
                      ● {item.status || "Segera"}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-[#071E3D] mb-6 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                    {item.skema}
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Tanggal</p>
                        <p className="text-sm font-bold text-slate-700">{formatTanggal(item.tanggal)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Waktu</p>
                        <p className="text-sm font-bold text-slate-700">{item.waktu || "08:00 - Selesai"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Lokasi TUK</p>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1">{item.tuk}</p>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.alamat}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-2xl bg-[#071E3D] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-[#071E3D]/20">
                    Detail Jadwal <ArrowRight size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Jadwal sewaktu-waktu dapat berubah sesuai kebijakan LSP. <br />
            Silakan <button className="text-orange-500 font-black hover:underline">Hubungi Helpdesk</button> jika ada pertanyaan.
          </p>
        </div>
      </div>
    </section>
  );
}