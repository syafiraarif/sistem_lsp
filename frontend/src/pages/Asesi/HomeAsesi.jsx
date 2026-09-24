import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  User,
  BookOpen,
  ClipboardList,
  KeyRound,
  ChevronRight,
  ShieldCheck,
  FileText,
  CalendarCheck,
  RefreshCcw,
  Loader2,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const HomeAsesi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get("/asesi/profile");
      setProfile(res.data?.data || null);
    } catch (error) {
      console.error("Gagal mengambil profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const displayName = profile?.nama_lengkap || "Asesi";

  const cards = [
    {
      icon: <User size={20} />,
      title: "Profile",
      desc: "Lihat dan lengkapi data pribadi asesi.",
      path: "/asesi/profile",
    },
    {
      icon: <BookOpen size={20} />,
      title: "Skema Sertifikasi",
      desc: "Pilih jadwal dan skema sertifikasi yang tersedia.",
      path: "/asesi/jadwal",
    },
    {
      icon: <ClipboardList size={20} />,
      title: "Asesmen",
      desc: "Pantau proses APL01, APL02, dan asesmen.",
      path: "/asesi/jadwal-saya",
    },
    {
      icon: <KeyRound size={20} />,
      title: "Ubah Password",
      desc: "Perbarui password akun Anda secara aman.",
      path: "/asesi/ubah-password",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Dashboard {displayName}
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola profile, skema sertifikasi, asesmen, dan aktivitas
                    Anda melalui dashboard asesi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadProfile}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw size={15} />
                    )}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
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
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <ClipboardList
                  size={17}
                  className="text-[#CC6B27]"
                />
                Menu Utama
              </h2>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#071E3D]/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                  <ShieldCheck
                    size={18}
                    className="text-[#CC6B27]"
                  />
                  Informasi Asesi
                </h2>

                <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                  Informasi singkat akun dan proses sertifikasi Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/asesi/profile")}
                className="rounded-lg border border-[#CC6B27]/40 bg-white px-4 py-2.5 text-[12px] font-bold text-[#CC6B27] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
              >
                Kelola Profile
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 md:p-6">
              <InfoCard
                icon={<User size={20} />}
                label="Nama Asesi"
                value={displayName}
              />

              <InfoCard
                icon={<BookOpen size={20} />}
                label="Skema"
                value="Pilih Skema"
              />

              <InfoCard
                icon={<CalendarCheck size={20} />}
                label="Asesmen"
                value="Pantau Asesmen"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const MiniStat = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
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

const MenuCard = ({
  icon,
  title,
  desc,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 text-left transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
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

const InfoCard = ({
  icon,
  label,
  value,
}) => {
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

export default HomeAsesi;