import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowLeft, Search, Loader2, Users, AlertCircle } from "lucide-react";
import AssessorCard from "../../components/assessors/AssessorCard"; // Pastikan path import benar

const API_URL = "http://localhost:3000/api/public";

export default function AssessorExplore() {
  const [assessors, setAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll ke paling atas saat halaman dibuka
    window.scrollTo(0, 0);
    
    const fetchAllAssessors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/asesor`);
        
        if (response.data.success) {
          // Mapping data agar key-nya sama dengan yang diharapkan AssessorCard
          const formatted = response.data.data.map(item => ({
            id: item.id_user || item.id,
            name: item.nama_lengkap || "Asesor LSP",
            competency: item.kompetensi_teknis || "Asesor Kompetensi",
            institution: item.institusi_induk || "LSP Teknologi Informasi",
            status: item.status || "Aktif",
            image: item.foto_profil || null
          }));
          setAssessors(formatted);
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (err) {
        console.error("Error fetch explore:", err);
        setError("Koneksi ke server terputus.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllAssessors();
  }, []);

  // Logika Pencarian
  const filteredData = assessors.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-5 pb-32">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-white to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <button 
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-[#071E3D] font-black text-[10px] uppercase tracking-widest hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                <Users size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#071E3D] tracking-tight">
                Direktori Lengkap Asesor
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text"
              placeholder="Cari nama, bidang, atau TUK..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 shadow-sm transition-all font-bold text-[#071E3D] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-xs tracking-[0.2em] uppercase">Memuat database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <p className="text-slate-500 font-bold">{error}</p>
          </div>
        ) : filteredData.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { staggerChildren: 0.05 } 
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredData.map(assessor => (
                <AssessorCard key={assessor.id} {...assessor} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-32">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              Tidak ada asesor ditemukan dengan kata kunci "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}