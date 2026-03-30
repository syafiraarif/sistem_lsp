import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Award, 
  Building2, 
  Mail, 
  Briefcase, 
  Globe,
  CheckCircle2
} from "lucide-react";

export default function AssessorProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const data = state || {
    name: "Asesor LSP",
    competency: "Sertifikasi Kompetensi",
    institution: "LSP Teknologi Informasi",
    status: "Aktif"
  };

  const isActive = data.status === "Aktif";

  return (
    <div className="min-h-screen bg-white pb-24 overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-50 to-transparent -z-10" />
      
      {/* Container Utama - Nilai pt diubah dari 28 ke 20 agar naik mendekati navbar */}
      <div className="max-w-7xl mx-auto px-6 pt-5">
        
        {/* TOMBOL KEMBALI - Margin bottom dikurangi sedikit agar lebih compact */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-[#071E3D] font-black text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-orange-500 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:bg-orange-500 group-hover:text-white transition-all">
            <ArrowLeft size={16} />
          </div>
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-start">
          
          {/* KOLOM KIRI (STICKY) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 lg:sticky lg:top-24"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#071E3D]/5 border border-slate-100 relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-20 bg-[#071E3D]" />
              
              <div className="relative mt-2 mb-6 inline-block">
                <div className="w-36 h-36 rounded-[2rem] bg-white p-2 shadow-lg">
                  <div className="w-full h-full rounded-[1.7rem] bg-slate-50 flex items-center justify-center border-4 border-white overflow-hidden">
                     <span className="text-5xl font-black text-[#071E3D]">{data.name.charAt(0)}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-2.5 rounded-xl border-4 border-white shadow-md">
                    <ShieldCheck size={20} strokeWidth={3} />
                  </div>
                )}
              </div>

              <h1 className="text-xl font-black text-[#071E3D] mb-2">{data.name}</h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest mb-8">
                REG. NO: LSP-7492-2024
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Email Resmi</p>
                    <p className="text-sm font-bold text-[#071E3D]">asesor@simlsp.id</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Domisili</p>
                    <p className="text-sm font-bold text-[#071E3D]">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KOLOM KANAN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-[#071E3D] mb-6 flex items-center gap-4">
                <Award className="text-orange-500" size={24} />
                Profil Profesional
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm md:text-base">
                Asesor kompetensi yang memiliki pengalaman luas dalam pengujian sertifikasi profesi skala nasional. 
                Telah memverifikasi lebih dari 500+ asesi di berbagai bidang teknologi dan manajemen. 
                Berdedikasi untuk menjaga kualitas sumber daya manusia unggul sesuai standar BNSP.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                  <Briefcase className="text-orange-500 mb-3" size={22} />
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bidang Spesialisasi</h4>
                  <p className="text-base font-black text-[#071E3D]">{data.competency}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-[#071E3D] border border-[#071E3D]">
                  <Building2 className="text-orange-400 mb-3" size={22} />
                  <h4 className="text-[9px] font-black text-slate-400/50 uppercase tracking-widest mb-1">Institusi / TUK</h4>
                  <p className="text-base font-black text-white">{data.institution}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-[#071E3D] mb-6 flex items-center gap-4">
                <CheckCircle2 className="text-orange-500" size={24} />
                Skema yang Diampu
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {["Software Development", "Data Analysis", "Project Management", "Cyber Security", "UI/UX Design"].map((skill, index) => (
                  <span 
                    key={index}
                    className="px-5 py-2.5 rounded-xl bg-slate-50 text-[#071E3D] text-[13px] font-bold border border-slate-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}