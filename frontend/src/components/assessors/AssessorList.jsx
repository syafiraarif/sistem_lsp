import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowRight, Loader2, Info } from "lucide-react";
import AssessorCard from "./AssessorCard";

const API_URL = "http://localhost:3000/api/public";

export default function AssessorList() {
  const [assessors, setAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/asesor`);
        if (response.data.success && response.data.data.length > 0) {
          const formattedData = response.data.data.map(item => ({
            id: item.id_user || item.id,
            name: item.nama_lengkap || item.username || "Asesor LSP",
            competency: item.kompetensi_teknis || "Asesor Kompetensi", 
            institution: item.institusi_induk || "LSP Teknologi Informasi",
            status: item.status || "Aktif",
            image: item.foto_profil || null 
          }));
          setAssessors(formattedData);
        } else {
          setAssessors([]);
        }
      } catch (err) {
        setError("Data asesor belum tersedia saat ini.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessors();
  }, []);

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Ornamen Background (Sesuai kode awalmu) */}
      <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-orange-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-[#071E3D]/[0.03] backdrop-blur-sm border border-[#071E3D]/5 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            LSP Expert Panel
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-[#071E3D] leading-tight tracking-tight"
          >
            Tim Asesor <span className="text-orange-500 relative inline-block">Profesional</span>
          </motion.h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Sinkronisasi Data...</p>
          </div>
        ) : error || assessors.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-[3rem] border border-dashed border-slate-200">
            <Info size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">{error || "Data belum tersedia."}</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          >
            <AnimatePresence>
              {/* BATASI HANYA 6 DATA */}
              {assessors.slice(0, 6).map((assessor) => (
                <AssessorCard key={assessor.id} {...assessor} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div className="mt-24 text-center">
          <button
            onClick={() => navigate("/explore-assessors")}
            className="group relative inline-flex items-center gap-4 px-12 py-5 bg-[#071E3D] text-white overflow-hidden rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 shadow-2xl shadow-[#071E3D]/20 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-4">
              Eksplor Seluruh Asesor
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}