// frontend/src/pages/tuk/HomeTUK.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  RefreshCcw,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
  Bell,
  KeyRound,
  FileText,
  Activity,
  Server,
  Building
} from "lucide-react";

const HomeTUK = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ nama: "Admin TUK" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          nama: parsedUser.nama_tuk || parsedUser.nama || parsedUser.name || parsedUser.username || "Admin TUK",
          email: parsedUser.email,
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulasi refresh data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const stats = [
    {
      label: "Total Jadwal",
      value: "12",
      icon: <CalendarDays size={22} />,
      tone: "orange",
    },
    {
      label: "Peserta Terdaftar",
      value: "156",
      icon: <Users size={22} />,
      tone: "blue",
    },
    {
      label: "Jadwal Aktif",
      value: "3",
      icon: <Clock size={22} />,
      tone: "orange",
    },
    {
      label: "Jadwal Selesai",
      value: "9",
      icon: <CheckCircle size={22} />,
      tone: "green",
    },
  ];

  const announcements = [
    {
      title: "Penting: Pembaruan Sistem Jadwal",
      date: "20 Jan 2025",
      desc: "Sistem jadwal TUK akan mengalami maintenance rutin pada hari Minggu.",
    },
    {
      title: "Reminder: Kelengkapan Data Profil",
      date: "18 Jan 2025",
      desc: "Pastikan data profil TUK Anda sudah lengkap dan valid untuk verifikasi.",
    },
    {
      title: "Jadwal Uji Kompetensi Bulan Februari",
      date: "15 Jan 2025",
      desc: "Pendaftaran gelombang baru telah dibuka untuk peserta umum.",
    },
  ];

  const menuCards = [
    {
      icon: <CalendarDays size={20} />,
      title: "Kelola Jadwal",
      desc: "Buat, lihat, dan kelola jadwal uji kompetensi yang tersedia.",
      path: "/tuk/jadwal",
      tone: "orange",
    },
    {
      icon: <Building size={20} />,
      title: "Profile TUK",
      desc: "Lengkapi dan perbarui data profil Tempat Uji Kompetensi Anda.",
      path: "/tuk/profile",
      tone: "orange",
    },
    {
      icon: <KeyRound size={20} />,
      title: "Lupa Password",
      desc: "Akses halaman bantuan akun untuk proses pemulihan password.",
      path: "/tuk/lupa-password",
      tone: "orange",
    },
    {
      icon: <FileText size={20} />,
      title: "Dokumen & Panduan",
      desc: "Unduh format dokumen kelengkapan pelaksanaan asesmen.",
      path: "/tuk/dokumen", // Sesuaikan dengan route jika ada
      tone: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarTUK isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          
          {/* Section 1: Header & Stats */}
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Selamat Datang, {user.nama}
                  </h1>
                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Ringkasan aktivitas Tempat Uji Kompetensi, jadwal aktif, peserta terdaftar, dan informasi terbaru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 shrink-0"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={15} />
                    )}
                    Refresh 
                  </span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
              {stats.map((stat, idx) => (
                <MiniStat
                  key={idx}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  tone={stat.tone}
                />
              ))}
            </div>
          </section>

          {/* Section 2: Menu Utama & Pengumuman */}
          <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1fr_380px]">
            {/* Kiri: Menu Utama */}
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                  <ClipboardCheck size={17} className="text-[#CC6B27]" />
                  Menu Cepat TUK
                </h2>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {menuCards.map((item) => (
                    <MenuCard
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      desc={item.desc}
                      tone={item.tone}
                      onClick={() => navigate(item.path)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Kanan: Pengumuman */}
            <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                    <Bell size={17} className="text-[#CC6B27]" />
                    Pengumuman
                  </h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {announcements.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="w-full rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-8 text-center">
                      <Bell size={34} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-bold text-[#071E3D]">
                        Belum Ada Pengumuman
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((item, index) => (
                      <AnnouncementCard key={index} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </section>

          {/* Section 3: Status Sistem */}
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#071E3D]/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                  <Activity size={18} className="text-[#CC6B27]" />
                  Status Sistem
                </h2>
                <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                  Pemantauan operasional sistem dashboard TUK.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Operational
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 md:p-6">
              <InfoCard
                icon={<ShieldCheck size={20} />}
                label="Koneksi Server"
                value="Sistem Berjalan Normal"
              />
              <InfoCard
                icon={<Server size={20} />}
                label="Maintenance Terjadwal"
                value="Tidak ada jadwal maintenance"
              />
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const MiniStat = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-slate-100 text-slate-500",
  };
  
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>
        <p className="mt-1 truncate text-[19px] font-black text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, tone = "orange", onClick }) => {
  const toneClass = tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-[#CC6B27]/10 text-[#CC6B27]";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 text-left transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          {icon}
        </div>
        <ChevronRight
          size={16}
          className="mt-1 text-[#071E3D]/25 transition-transform group-hover:translate-x-1 group-hover:text-[#CC6B27]"
        />
      </div>
      <h3 className="mt-3 text-[13px] font-bold text-[#071E3D]">
        {title}
      </h3>
      <p className="mt-1.5 min-h-[42px] text-[11px] font-medium leading-relaxed text-[#182D4A]/65">
        {desc}
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
        Buka Menu
        <ChevronRight size={13} />
      </div>
    </button>
  );
};

const AnnouncementCard = ({ item }) => {
  return (
    <div className="group w-full rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 text-left transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-[#CC6B27]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#CC6B27]">
          {item.date}
        </span>
      </div>
      <h3 className="mt-2 text-[13px] font-bold leading-snug text-[#071E3D]">
        {item.title}
      </h3>
      <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[#182D4A]/60 line-clamp-2">
        {item.desc}
      </p>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>
        <p className="mt-1 truncate text-[13px] font-bold text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
};

export default HomeTUK;