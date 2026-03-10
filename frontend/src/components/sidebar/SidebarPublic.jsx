import { Link } from "react-router-dom";
import { X, ChevronRight, Phone, Home, Info, HelpCircle, Briefcase, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SidebarPublic({ isOpen, onClose, menuLayanan }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP (Overlay Gelap) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071E3D]/50 backdrop-blur-sm z-[60] lg:hidden"
          />

          {/* KONTAINER SIDEBAR (Full Kiri) */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] lg:hidden flex flex-col"
          >
            {/* Header Sidebar */}
            <div className="p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#071E3D] flex items-center justify-center text-white font-black text-lg">
                  L
                </div>
                <div className="leading-tight">
                  <span className="block text-base font-black text-[#071E3D]">SIMLSP</span>
                  <span className="block text-[8px] font-bold text-orange-500 uppercase tracking-widest">Sertifikasi</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Menu Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <SidebarLink to="/" icon={<Home size={20}/>} label="Beranda" onClick={onClose} />
              <SidebarLink to="/profil-kami" icon={<Globe size={20}/>} label="Profil Kami" onClick={onClose} />
              <SidebarLink to="/tentang-aplikasi" icon={<Info size={20}/>} label="Tentang Aplikasi" onClick={onClose} />

              <div className="pt-6 pb-2 px-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Layanan Utama
                </span>
              </div>

              {menuLayanan.map((item, i) => (
                <SidebarLink 
                  key={i} 
                  to={item.href} 
                  label={item.label} 
                  icon={<Briefcase size={20}/>}
                  isSubMenu 
                  onClick={onClose} 
                />
              ))}

              <div className="h-[1px] bg-slate-100 my-4 mx-4" />

              <SidebarLink to="/informasi" icon={<Info size={20}/>} label="Informasi" onClick={onClose} />
              <SidebarLink to="/faq" icon={<HelpCircle size={20}/>} label="FAQ" onClick={onClose} />
            </div>

            {/* Footer Sidebar (Tombol Hubungi Kami) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button className="w-full flex items-center justify-center gap-3 py-4 bg-[#071E3D] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-all duration-300 shadow-lg">
                <Phone size={18} />
                Hubungi Kami
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sub-komponen SidebarLink
function SidebarLink({ to, label, icon, onClick, isSubMenu = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center justify-between p-3.5 rounded-xl transition-all duration-200
        ${isSubMenu ? 'hover:bg-orange-50 text-slate-600' : 'hover:bg-slate-50 text-[#071E3D] font-bold'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={`${isSubMenu ? 'text-orange-500' : 'text-[#071E3D]'} opacity-80 group-hover:opacity-100`}>
          {icon}
        </span>
        <span className="text-[14px]">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}