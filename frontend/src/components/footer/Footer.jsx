import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const menuLinks = [
    { label: "Beranda", href: "/" },
    { label: "Profil Kami", href: "/profil-kami" },
    { label: "Tentang Aplikasi", href: "/tentang-aplikasi" },
    { label: "FAQ", href: "/faq" }
  ];

  const layananLinks = [
    { label: "Pendaftaran", href: "/pendaftaran" },
    { label: "Surveillance", href: "/surveillance" },
    { label: "Pengaduan", href: "/pengaduan" },
    { label: "Feedback", href: "/feedback" }
  ];

  const informasiLinks = [
    {
      label: "Persyaratan",
      tab: "persyaratan"
    },
    {
      label: "Jadwal",
      tab: "jadwal"
    },
    {
      label: "Tempat Uji Kompetensi",
      tab: "tuk"
    },
    {
      label: "Skema Kompetensi",
      tab: "skema"
    }
  ];

  const socialLinks = [
    {
      label: "Instagram",
      icon: Instagram,
      href: "#"
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: "#"
    },
    {
      label: "Twitter",
      icon: Twitter,
      href: "#"
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: "#"
    }
  ];

  const alamatMaps =
    "https://www.bing.com/maps/search?mepi=0%7E%7EEmbedded%7EAddress_Link&ty=18&v=2&sV=1&FORM=MPSRPL&ss=id.ypid%3AYN927CF5A5DB7A045F&q=Kantor+Pusat+Relawan+Jurnal+Indonesia&ppois=-7.831090927124023_110.3165054321289_Kantor+Pusat+Relawan+Jurnal+Indonesia_YN927CF5A5DB7A045F%7E&cp=-7.831091%7E110.316505&lvl=16&style=r";

  const handleInformasiClick = (tab) => {
    navigate("/informasi", {
      state: {
        activeTab: tab
      }
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleWhatsApp = () => {
    const nomor = "6281234567890";
    const pesan = "Halo admin LSP, saya ingin ...";
    const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="relative overflow-hidden bg-dark pt-20 text-gray-400">
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="group flex w-fit items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform duration-300 group-hover:scale-105">
                <span className="text-xl font-black italic text-white">
                  S
                </span>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-white">
                SIM<span className="text-primary">LSP</span>
              </h3>
            </Link>

            <p className="text-sm font-medium leading-relaxed">
              Platform digital terpadu untuk mendukung pelaksanaan sertifikasi
              kompetensi nasional secara profesional, transparan, dan akuntabel.
            </p>

            <div className="flex gap-4 pt-2">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href === "#" ? undefined : "_blank"}
                  rel={href === "#" ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  whileHover={{ y: -4 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-primary hover:text-primary"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">
              Navigation
            </h4>

            <ul className="space-y-4">
              {menuLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
                  >
                    <ArrowRight
                      size={14}
                      className="ml-[-1.25rem] text-primary opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100"
                    />

                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">
              Layanan
            </h4>

            <ul className="space-y-4">
              {layananLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
                  >
                    <ArrowRight
                      size={14}
                      className="ml-[-1.25rem] text-primary opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100"
                    />

                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">
              Informasi
            </h4>

            <ul className="space-y-4">
              {informasiLinks.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleInformasiClick(item.tab)}
                    className="group flex items-center gap-2 text-left text-sm font-semibold transition-colors hover:text-white"
                  >
                    <ArrowRight
                      size={14}
                      className="ml-[-1.25rem] shrink-0 text-primary opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100"
                    />

                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">
              Get In Touch
            </h4>

            <ul className="space-y-5">
              <li>
                <a
                  href={alamatMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4"
                >
                  <div className="mt-1 rounded-lg bg-white/5 p-2 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <MapPin size={16} />
                  </div>

                  <div className="text-sm font-medium leading-relaxed transition-colors group-hover:text-white">
                    Yogyakarta, Special Region
                    <br />
                    of Yogyakarta, Indonesia
                  </div>
                </a>
              </li>

              <li>
                <a
                  href="mailto:support@simlsp.id"
                  className="group flex items-center gap-4"
                >
                  <div className="rounded-lg bg-white/5 p-2 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <Mail size={16} />
                  </div>

                  <span className="text-sm font-medium transition-colors group-hover:text-white">
                    support@simlsp.id
                  </span>
                </a>
              </li>

              <li>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="group flex items-center gap-4 text-left"
                >
                  <div className="rounded-lg bg-white/5 p-2 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <Phone size={16} />
                  </div>

                  <span className="text-sm font-bold transition-colors group-hover:text-white">
                    +62 812-3456-7890
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50">
              © {currentYear} SIM<span className="text-primary">LSP</span> —
              Certified Profession Platform
            </div>

            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
              <button
                type="button"
                onClick={() =>
                  navigate("/informasi", {
                    state: {
                      activeTab: "persyaratan"
                    }
                  })
                }
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/informasi", {
                    state: {
                      activeTab: "persyaratan"
                    }
                  })
                }
                className="transition-colors hover:text-primary"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}