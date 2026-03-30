import { useState } from "react";
import { Menu } from "lucide-react";
import NavItem from "./NavItem";
import LoginDropdown from "./LoginDropdown";
import NavDropdown from "./NavDropdown";
import SidebarPublic from "../sidebar/SidebarPublic"; // Sesuaikan path folder sidebar kamu
import { Link } from "react-router-dom";

// IMPORT LOGO ANDA DI SINI
import logoApp from "../../assets/images/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuLayanan = [
    { label: "Pendaftaran", href: "/pendaftaran" },
    { label: "Surveillance", href: "/surveillance" },
    { label: "Pengaduan", href: "/pengaduan" },
  ];

  return (
    <>
      {/* HEADER UTAMA */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* SISI KIRI: LOGO */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            {/* CONTAINER LOGO BARU */}
            <div className="w-12 h-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <img 
                src={logoApp} 
                alt="Logo SIMLSP" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <span className="block text-lg font-black text-[#071E3D]">
                SIMLSP
              </span>
              <span className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                Sertifikasi Profesi
              </span>
            </div>
          </Link>

          {/* TENGAH: MENU DESKTOP (Hidden on half screen/mobile) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-8 px-10">
            <NavItem label="Beranda" href="/" />
            <NavItem label="Profil Kami" href="/profil-kami" />
            <NavItem label="Tentang Aplikasi" href="/tentang-aplikasi" />
            <NavDropdown label="Layanan" items={menuLayanan} />
            <NavItem label="Informasi" href="/informasi" />
            <NavItem label="FAQ" href="/faq" />
          </nav>

          {/* SISI KANAN: ACTIONS */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              className="hidden md:inline-flex items-center px-6 py-2.5
                         rounded-xl border-2 border-[#071E3D]
                         text-[#071E3D] font-black text-xs uppercase tracking-widest
                         hover:bg-[#071E3D] hover:text-white
                         transition-all duration-300"
            >
              Hubungi Kami
            </button>

            <LoginDropdown />

            {/* HAMBURGER BUTTON (Muncul saat layar kecil/setengah) */}
            <button
              className="lg:hidden p-2 text-[#071E3D] hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR DITARUH DI LUAR HEADER SUPAYA FULL SCREEN */}
      <SidebarPublic 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        menuLayanan={menuLayanan} 
      />
    </>
  );
}