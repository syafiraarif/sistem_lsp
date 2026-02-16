import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Briefcase, 
  Home,
  Bell,
  CreditCard,
  Settings,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      console.log("Akses ditolak: Tidak ada session.");
      navigate("/login");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside className="w-72 bg-[#071E3D] text-white flex flex-col hidden lg:flex border-r border-white/5 shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black shadow-lg shadow-orange-500/20">L</div>
          <span className="font-black tracking-tighter text-2xl uppercase">SIMLSP</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="flex items-center gap-4 px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          
          <div className="flex items-center gap-4 px-6 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer group">
            <Briefcase size={20} className="group-hover:text-orange-500" /> Sertifikasi
          </div>
          
          <div className="flex items-center gap-4 px-6 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer group">
            <CreditCard size={20} className="group-hover:text-orange-500" /> Pembayaran
          </div>

          <div className="h-[1px] bg-white/5 my-6" />

          <div className="flex items-center gap-4 px-6 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer group">
            <Settings size={20} className="group-hover:text-orange-500" /> Pengaturan
          </div>
        </nav>

        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 border border-red-500/20"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <Home size={14} /> / <span className="text-[#071E3D]">Overview</span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative cursor-pointer text-slate-400 hover:text-[#071E3D]">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
             </div>
             <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-black text-[#071E3D] uppercase tracking-tight">{user.username}</p>
                   <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#071E3D]">
                   <UserIcon size={20} />
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          <header className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-[#071E3D] uppercase tracking-tighter leading-none"
            >
              Hi, <span className="text-orange-500">{user.username}!</span>
            </motion.h1>
            <p className="text-slate-400 font-medium mt-3 text-lg">Selamat datang kembali di sistem LSP.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Status Verifikasi", val: "Aktif", icon: ShieldCheck, color: "blue" },
              { label: "Role Pengguna", val: user.role, icon: UserIcon, color: "orange" },
              { label: "Sertifikasi Anda", val: "02", icon: Briefcase, color: "emerald" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-${item.color}-50 text-${item.color}-500 group-hover:scale-110 transition-transform`}>
                  <item.icon size={28} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-2xl font-black text-[#071E3D] uppercase tracking-tight`}>{item.val}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#071E3D] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#071E3D]/20"
          >
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="max-w-md">
                   <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Kelengkapan Profil</h2>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed">Profil Anda baru mencapai 60%. Lengkapi data diri untuk memudahkan proses verifikasi skema sertifikasi.</p>
                </div>
                <button className="px-8 py-4 bg-orange-500 hover:bg-white hover:text-[#071E3D] transition-all duration-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
                   Lengkapi Sekarang <ChevronRight size={18} />
                </button>
             </div>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}