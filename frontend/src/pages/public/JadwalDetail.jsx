import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UserCheck
} from "lucide-react";

export default function JadwalDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mengambil data yang dikirim lewat state
  const { schedule } = location.state || {};

  // Jika data tidak ditemukan
  if (!schedule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100"
        >
          <AlertCircle size={64} className="mx-auto text-orange-500 mb-6" />
          <h2 className="text-2xl font-black text-[#071E3D] mb-2">Opps! Data Hilang</h2>
          <p className="text-slate-500 mb-8 font-medium">Data jadwal tidak tersedia.</p>
          <button 
            onClick={() => navigate("/jadwal")}
            className="px-8 py-4 bg-[#071E3D] text-white rounded-2xl font-black uppercase text-[11px] hover:bg-orange-600 transition-all"
          >
            Kembali ke Jadwal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Dekorasi Background - Diperhalus */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-100/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100/20 rounded-full blur-[80px]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Tombol Back - Lebih mepet ke konten */}
        <motion.button 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2 text-[#071E3D] font-black uppercase text-[10px] tracking-widest hover:text-orange-500 transition-all"
        >
          <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
            <ArrowLeft size={14} />
          </div>
          Kembali
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* KONTEN UTAMA (KIRI - 8 Kolom) */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={14} /> Detail Sertifikasi
                </div>
                <span className="text-[10px] font-bold text-slate-300">ID: #{schedule.id || "00"}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-[#071E3D] mb-8 leading-tight">
                {schedule.skema}
              </h1>

              {/* Grid Info Kecil */}
              <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-50 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-orange-500" /> Tanggal
                  </p>
                  <p className="text-lg font-bold text-[#071E3D]">{schedule.tanggal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-orange-500" /> Waktu
                  </p>
                  <p className="text-lg font-bold text-[#071E3D]">{schedule.waktu || "10:00:00"}</p>
                </div>
              </div>

              {/* Lokasi TUK - Lebih compact */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-orange-500" /> Lokasi Uji Kompetensi (TUK)
                </p>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-md font-black text-[#071E3D] leading-none mb-1">{schedule.tuk}</p>
                    <p className="text-xs text-slate-500 font-medium">{schedule.alamat}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* SIDEBAR (KANAN - 4 Kolom) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kartu Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#071E3D] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-[-20px] right-[-20px] p-8 opacity-5 group-hover:rotate-12 transition-transform">
                <UserCheck size={140} />
              </div>
              
              <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
              <h4 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">{schedule.status || "OPEN"}</h4>
              
              <button 
                onClick={() => navigate("/pendaftaran")}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                Ikuti Asesmen
              </button>
            </motion.div>

            {/* Kartu Panduan - List lebih rapat */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
            >
              <h4 className="font-black text-[#071E3D] mb-5 flex items-center gap-2 text-xs uppercase tracking-widest">
                <FileText size={16} className="text-orange-500" /> Panduan
              </h4>
              <ul className="space-y-3">
                {[
                  "Kartu Identitas (KTP)",
                  "Hadir 30 menit awal",
                  "Kemeja Rapi (Putih)",
                  "Alat Tulis & Laptop"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}