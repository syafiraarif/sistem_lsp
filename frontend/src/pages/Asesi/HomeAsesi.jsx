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

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Dashboard Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Selamat Datang,
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Kelola proses sertifikasi, lengkapi profile, pilih skema, dan
                  pantau asesmen Anda melalui satu dashboard yang rapi.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/asesi/jadwal")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Pilih Skema
                    <ChevronRight size={17} />
                  </button>

                  <button
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Lihat Asesmen
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Status Akun
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    Siap Mengikuti Sertifikasi
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Pastikan profile dan dokumen Anda sudah lengkap sebelum
                    mengajukan asesmen.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Role" value="Asesi" />
                    <HeroPill label="Status" value="Aktif" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MINI STATS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <h2 className="text-xl font-black text-[#071E3D]">Menu Utama</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Akses fitur utama dashboard asesi
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
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 border border-slate-100 transition-all group-hover:bg-orange-50 group-hover:border-orange-100">
        {icon}
      </div>

      <h3 className="text-base font-black text-[#071E3D] mb-2">{title}</h3>

      <p className="text-sm font-medium leading-relaxed text-slate-500 min-h-[44px]">
        {desc}
      </p>

      <div className="mt-5 flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
        Buka Menu
        <ChevronRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

export default HomeAsesi;