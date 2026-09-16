import { useState } from "react";
import { Menu } from "lucide-react";
import NavItem from "./NavItem";
import LoginDropdown from "./LoginDropdown";
import NavDropdown from "./NavDropdown";
import SidebarPublic from "../sidebar/SidebarPublic";
import { Link } from "react-router-dom";
import logoApp from "../../assets/images/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuLayanan = [
    { label: "Pendaftaran", href: "/pendaftaran" },
    { label: "Surveillance", href: "/surveillance" },
    { label: "Pengaduan", href: "/pengaduan" },
    { label: "Feedback", href: "/feedback" }
  ];

  const handleHubungiKami = () => {
    const nomorWhatsApp = "6281234567890";
    const pesan = "Halo admin LSP, saya ingin ...";
    const url = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="group flex shrink-0 cursor-pointer items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <img src={logoApp} alt="Logo SIMLSP" className="h-full w-full object-contain" />
            </div>

            <div className="leading-tight">
              <span className="block text-lg font-black text-[#071E3D]">
                SIMLSP
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-500">
                Sertifikasi Profesi
              </span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 px-10 lg:flex">
            <NavItem label="Beranda" href="/" />
            <NavItem label="Profil Kami" href="/profil-kami" />
            <NavItem label="Tentang Aplikasi" href="/tentang-aplikasi" />
            <NavDropdown label="Layanan" items={menuLayanan} />
            <NavItem label="Informasi" href="/informasi" />
            <NavItem label="FAQ" href="/faq" />
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={handleHubungiKami}
              className="hidden items-center rounded-xl border-2 border-[#071E3D] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all duration-300 hover:bg-[#071E3D] hover:text-white md:inline-flex"
            >
              Hubungi Kami
            </button>

            <LoginDropdown />

            <button
              type="button"
              className="rounded-lg p-2 text-[#071E3D] transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      <SidebarPublic
        isOpen={open}
        onClose={() => setOpen(false)}
        menuLayanan={menuLayanan}
      />
    </>
  );
}