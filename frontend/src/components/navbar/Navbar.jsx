import { useState } from "react";
import { Menu, MessageCircle } from "lucide-react";
import NavItem from "./NavItem";
import LoginDropdown from "./LoginDropdown";
import NavDropdown from "./NavDropdown";
import SidebarPublic from "../sidebar/SidebarPublic";
import { Link } from "react-router-dom";
import logoApp from "../../assets/images/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuLayanan = [
    {
      label: "Pendaftaran",
      href: "/pendaftaran",
    },
    {
      label: "Surveillance",
      href: "/surveillance",
    },
    {
      label: "Pengaduan",
      href: "/pengaduan",
    },
    {
      label: "Feedback",
      href: "/feedback",
    },
  ];

  const handleHubungiKami = () => {
    const nomorWhatsApp = "6281234567890";
    const pesan = "Halo admin LSP, saya ingin ...";
    const url = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(
      pesan
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
          {/* Brand / Logo */}
          <Link
            to="/"
            className="group flex shrink-0 cursor-pointer items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <img
                src={logoApp}
                alt="Logo SIMLSP"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <span className="block text-sm font-black tracking-tight text-[#071E3D] sm:text-base xl:text-lg">
                PUSTAKA ILMIAH ELEKTRONIK
              </span>

              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#CC6B27]">
                Lembaga Sertifikasi Profesi
              </span>
            </div>
          </Link>

          {/* Menu Navigasi (Rapi satu baris tanpa wrap) */}
          <nav className="hidden flex-1 items-center justify-center gap-5 whitespace-nowrap px-4 lg:flex xl:gap-7">
            <NavItem label="Beranda" href="/" />
            <NavItem label="Profil Kami" href="/profil-kami" />
            <NavItem label="Tentang Aplikasi" href="/tentang-aplikasi" />
            <NavDropdown label="Layanan" items={menuLayanan} />
            <NavItem label="Sertifikasi" href="/informasi" />
            <NavItem label="FAQ" href="/faq" />
          </nav>

          {/* Tombol Login & Mobile Menu */}
          <div className="flex shrink-0 items-center gap-3">
            <LoginDropdown />

            <button
              type="button"
              aria-label="Buka menu navigasi"
              className="rounded-lg p-2 text-[#071E3D] transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Button Hubungi Kami */}
      <button
        type="button"
        onClick={handleHubungiKami}
        aria-label="Hubungi Kami via WhatsApp"
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_14px_30px_-5px_rgba(37,211,102,0.65)] active:scale-95"
      >
        <MessageCircle className="h-5 w-5 fill-white text-white transition-transform duration-300 group-hover:rotate-12" />
        <span>Hubungi Kami</span>
      </button>

      <SidebarPublic
        isOpen={open}
        onClose={() => setOpen(false)}
        menuLayanan={menuLayanan}
      />
    </>
  );
}