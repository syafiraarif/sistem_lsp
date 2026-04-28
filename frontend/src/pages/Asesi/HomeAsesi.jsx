// frontend/src/pages/asesi/HomeAsesi.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  User,
  BookOpen,
  ClipboardList,
  Key,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  FileText,
  CalendarCheck,
} from "lucide-react";

const HomeAsesi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Gagal membaca data user:", error);
      }
    }
  }, []);

  const displayName =
    userData?.nama ||
    userData?.nama_lengkap ||
    userData?.username ||
    "Asesi";

  const cards = [
    {
      icon: <User size={24} />,
      title: "Profile Anda",
      desc: "Lihat dan lengkapi data pribadi asesi.",
      path: "/asesi/profile",
    },
    {
      icon: <BookOpen size={24} />,
      title: "Skema Sertifikasi",
      desc: "Pilih jadwal dan skema sertifikasi tersedia.",
      path: "/asesi/jadwal",
    },
    {
      icon: <ClipboardList size={24} />,
      title: "Asesmen Anda",
      desc: "Pantau proses APL01, APL02, dan asesmen.",
      path: "/asesi/jadwal-saya",
    },
    {
      icon: <Key size={24} />,
      title: "Ubah Password",
      desc: "Perbarui password akun Anda secara aman.",
      path: "/asesi/ubah-password",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* HERO */}
          <section className="relative overflow-hidden bg-white rounded-[36px] border border-slate-100 shadow-sm p-6 lg:p-9 mb-6">
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-500/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-[#071E3D]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-5">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Dashboard Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-[#071E3D] leading-tight">
                  Selamat Datang,
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="text-slate-500 mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed">
                  Kelola proses sertifikasi, lengkapi profile, pilih skema,
                  dan pantau asesmen Anda melalui satu dashboard yang rapi.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/asesi/jadwal")}
                    className="px-7 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    Pilih Skema
                    <ChevronRight size={17} />
                  </button>

                  <button
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="px-7 py-4 rounded-2xl bg-slate-50 hover:bg-[#071E3D] border border-slate-100 text-[#071E3D] hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    Lihat Asesmen
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-[#071E3D] rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-[#071E3D]/15">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-orange-400 flex items-center justify-center mb-6">
                      <Sparkles size={28} />
                    </div>

                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                      Status Akun
                    </p>

                    <h2 className="text-2xl font-black mb-4">
                      Siap Mengikuti Sertifikasi
                    </h2>

                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                      Pastikan profile dan dokumen Anda sudah lengkap sebelum
                      mengajukan asesmen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MINI STATS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <MiniStat
              icon={<FileText size={22} />}
              label="APL01 & APL02"
              value="Form Asesmen"
            />
            <MiniStat
              icon={<CalendarCheck size={22} />}
              label="Jadwal"
              value="Pantau Sertifikasi"
            />
            <MiniStat
              icon={<ShieldCheck size={22} />}
              label="Keamanan"
              value="Akun Terproteksi"
            />
          </section>

          {/* MENU */}
          <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-[#071E3D]">
                Menu Utama
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Akses fitur utama dashboard asesi.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {cards.map((item) => (
                <MenuCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const MiniStat = ({ icon, label, value }) => {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-13 h-13 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1">{value}</p>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-[28px] border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 p-5 transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-orange-50 text-[#071E3D] group-hover:text-orange-500 border border-slate-100 group-hover:border-orange-100 flex items-center justify-center mb-5 transition-all">
        {icon}
      </div>

      <h3 className="font-black text-[#071E3D] text-lg mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 font-medium leading-relaxed min-h-[44px]">
        {desc}
      </p>

      <div className="mt-5 flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
        Buka Menu
        <ChevronRight
          size={15}
          className="group-hover:translate-x-1 transition-transform"
        />
      </div>
    </button>
  );
};

export default HomeAsesi;