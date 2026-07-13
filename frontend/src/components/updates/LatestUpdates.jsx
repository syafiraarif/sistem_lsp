import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Camera, ArrowRight, Sparkles } from "lucide-react";
import api from "../../services/api";

export default function LatestUpdates() {
  const [testimonials, setTestimonials] = useState([]);
  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/public/feedback/active");
        setTestimonials(res.data.data);
      } catch (err) { console.error("Gagal memuat feedback:", err); }

      try {
        const resJadwal = await api.get("/public/jadwal");
        setJadwal(resJadwal.data.data || []); 
      } catch (err) { console.error("Gagal memuat jadwal:", err); }
    };
    
    fetchData();
  }, []);

  const activities = [
    { id: 1, title: "Pelaksanaan Uji Kompetensi Batch Feb 2026", date: "15 Feb 2026", tag: "Event" },
    { id: 2, title: "MOU LSP dengan Universitas Gadjah Mada", date: "10 Feb 2026", tag: "News" },
  ];

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-orange-500 rounded-[3.5rem] p-10 md:p-16 shadow-[0_30px_100px_-20px_rgba(249,115,22,0.3)]"
          >
            <Quote className="absolute top-10 right-10 text-white opacity-10" size={120} strokeWidth={3} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <Sparkles size={12} /> Testimonials
              </div>
              <h3 className="text-white text-3xl md:text-4xl font-black mb-12 tracking-tight">
                Kepercayaan <br /> Para Profesional
              </h3>
              <div className="space-y-6">
                {testimonials.length > 0 ? (
                  testimonials.map((testi) => (
                    <motion.div key={testi.id_feedback} whileHover={{ x: 10 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] transition-all duration-300">
                      <div className="flex gap-1 mb-5">
                        {[...Array(testi.rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-300" fill="currentColor" />)}
                      </div>
                      <p className="text-white font-medium mb-8 text-base leading-relaxed opacity-90">“{testi.pesan}”</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white font-black flex items-center justify-center text-xl shadow-inner">
                          {testi.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-white font-bold text-sm leading-none mb-1.5">{testi.nama_lengkap}</h5>
                          <p className="text-orange-100/60 text-[10px] uppercase font-black tracking-widest leading-none">{testi.peran.replace("_", " ")}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : <p className="text-white/70 italic">Belum ada ulasan tersedia.</p>}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-[#071E3D]/[0.03] border border-[#071E3D]/5 text-[#071E3D] text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Camera size={14} className="text-orange-500" /> LSP Bulletin
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#071E3D] mb-10 leading-tight tracking-tight">
              Informasi & <br />
              <span className="text-orange-500 relative inline-block">
                Aktivitas Terkini
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 5C20 2 40 2 60 5C80 8 100 8 100 5" stroke="#F97316" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <div className="space-y-5 mb-12">
              {(jadwal.length > 0 ? jadwal.slice(0, 3) : activities).map((act, index) => (
                <motion.div
                  key={act.id_jadwal || act.id || index}
                  whileHover={{ x: 15 }}
                  className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_15px_40px_-15px_rgba(7,30,61,0.05)] hover:shadow-[0_25px_50px_-15px_rgba(7,30,61,0.1)] transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {act.date || (act.tanggal ? new Date(act.tanggal).toLocaleDateString('id-ID') : '-')}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-500 text-[9px] font-black uppercase tracking-wider">
                      {act.tag || "Jadwal"}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[#071E3D] group-hover:text-orange-500 transition-colors leading-snug">
                    {act.title || act.nama_kegiatan || act.skema?.nama_skema || "Jadwal Asesmen"}
                  </h4>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}