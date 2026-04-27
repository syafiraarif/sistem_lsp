import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Users,
  Bell,
  Clock,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const HomeTUK = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState({ nama: "Admin TUK" });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          nama: parsedUser.nama || parsedUser.name || "Admin TUK",
          email: parsedUser.email,
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const stats = [
    {
      label: "Total Jadwal",
      value: "12",
      icon: <Calendar size={22} />,
      bg: "bg-orange-50",
      text: "text-orange-500",
      desc: "Jadwal uji kompetensi",
    },
    {
      label: "Peserta Terdaftar",
      value: "156",
      icon: <Users size={22} />,
      bg: "bg-[#071E3D]/5",
      text: "text-[#071E3D]",
      desc: "Total peserta masuk",
    },
    {
      label: "Jadwal Aktif",
      value: "3",
      icon: <Clock size={22} />,
      bg: "bg-orange-50",
      text: "text-orange-500",
      desc: "Sedang berlangsung",
    },
    {
      label: "Selesai",
      value: "9",
      icon: <CheckCircle size={22} />,
      bg: "bg-[#071E3D]/5",
      text: "text-[#071E3D]",
      desc: "Telah diselesaikan",
    },
  ];

  const announcements = [
    {
      title: "Penting: Pembaruan Sistem Jadwal",
      date: "20 Jan 2025",
      desc: "Sistem jadwal TUK akan undergo maintenance pada hari Minggu.",
    },
    {
      title: "Reminder: Kelengkapan Data Profil",
      date: "18 Jan 2025",
      desc: "Pastikan data profil TUK Anda sudah lengkap dan valid.",
    },
    {
      title: "Jadwal Uji Kompetensi Bulan Februari",
      date: "15 Jan 2025",
      desc: "Pendaftaran gelombang baru telah dibuka.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex-1 transition-all duration-300 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Dashboard */}
          <div className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(7,30,61,0.18)] p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ShieldCheck size={16} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Dashboard TUK
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Selamat Datang, {user.nama}
                </h1>

                <p className="text-gray-500 text-sm lg:text-base mt-3 max-w-2xl leading-relaxed font-medium">
                  Ringkasan aktivitas Tempat Uji Kompetensi, jadwal aktif,
                  peserta terdaftar, dan informasi terbaru dalam satu halaman.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/tuk/jadwal")}
                  className="group px-6 py-4 rounded-2xl bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  Kelola Jadwal
                  <ChevronRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <button
                  onClick={() => navigate("/tuk/lupa-password")}
                  className="px-6 py-4 rounded-2xl border-2 border-[#071E3D]/10 text-[#071E3D] font-black hover:bg-[#071E3D] hover:text-white transition-all uppercase text-xs tracking-widest"
                >
                  Lupa Password
                </button>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-[26px] border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-20px_rgba(7,30,61,0.2)] transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <h2 className="text-3xl font-black text-[#071E3D] mt-2">
                      {stat.value}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1 font-semibold">
                      {stat.desc}
                    </p>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Konten Bawah */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Cepat */}
            <div className="lg:col-span-2 bg-white rounded-[30px] border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-[#071E3D]">
                    Menu Cepat
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Akses fitur utama TUK
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity size={21} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/tuk/jadwal")}
                  className="group text-left p-5 rounded-[24px] bg-[#F8FAFC] border border-gray-100 hover:border-orange-200 hover:bg-orange-50/60 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-orange-500 shadow-sm flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Calendar size={26} />
                  </div>

                  <h3 className="font-black text-[#071E3D] text-sm uppercase tracking-wide">
                    Kelola Jadwal
                  </h3>

                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Buat, lihat, dan kelola jadwal uji kompetensi yang tersedia.
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-black uppercase tracking-widest">
                    Buka Menu
                    <ChevronRight
                      size={15}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>

                <button
                  onClick={() => navigate("/tuk/lupa-password")}
                  className="group text-left p-5 rounded-[24px] bg-[#F8FAFC] border border-gray-100 hover:border-orange-200 hover:bg-orange-50/60 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-orange-500 shadow-sm flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <FileText size={26} />
                  </div>

                  <h3 className="font-black text-[#071E3D] text-sm uppercase tracking-wide">
                    Lupa Password
                  </h3>

                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Akses halaman bantuan akun untuk proses pemulihan password.
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-black uppercase tracking-widest">
                    Buka Menu
                    <ChevronRight
                      size={15}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Pengumuman */}
            <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-[#071E3D]">
                    Pengumuman
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Informasi terbaru
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Bell size={20} />
                </div>
              </div>

              <div className="space-y-3 max-h-[330px] overflow-y-auto pr-1">
                {announcements.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />

                      <div>
                        <h4 className="font-black text-[#071E3D] text-sm leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>

                        <span className="inline-block mt-3 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Ringkas */}
          <div className="mt-6 bg-[#071E3D] rounded-[28px] p-5 lg:p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-52 h-52 bg-orange-500/20 rounded-full blur-[80px]" />

            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-orange-400">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h3 className="font-black text-lg">
                  Sistem TUK Berjalan Normal
                </h3>
                <p className="text-white/60 text-sm">
                  Semua fitur utama dashboard dapat digunakan.
                </p>
              </div>
            </div>

            <div className="relative px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-widest w-fit">
              Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTUK;