// frontend/src/pages/asesor/DashboardAsesor.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FileText,
  KeyRound,
  Loader2,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import api from "../../services/api";

export default function DashboardAsesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [jadwalUji, setJadwalUji] = useState([]);
  const [jadwalVerifikasi, setJadwalVerifikasi] = useState([]);
  const [jadwalKomite, setJadwalKomite] = useState([]);
  const [jadwalMkva, setJadwalMkva] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const localUser = getUserFromStorage();
      setUser(localUser);

      const [
        profileRes,
        jadwalUjiRes,
        jadwalVerifikasiRes,
        jadwalKomiteRes,
        jadwalMkvaRes,
      ] = await Promise.allSettled([
        api.get("/asesor/profile"),
        api.get("/asesor/jadwal-uji-kompetensi"),
        api.get("/asesor/jadwal-verifikasi-tuk"),
        api.get("/asesor/jadwal-komite-teknis"),
        api.get("/asesor/mkva/jadwal"),
      ]);

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.data || null);
      }

      if (jadwalUjiRes.status === "fulfilled") {
        const data = jadwalUjiRes.value.data?.data || [];
        setJadwalUji(Array.isArray(data) ? data : []);
      }

      if (jadwalVerifikasiRes.status === "fulfilled") {
        const data = jadwalVerifikasiRes.value.data?.data || [];
        setJadwalVerifikasi(Array.isArray(data) ? data : []);
      }

      if (jadwalKomiteRes.status === "fulfilled") {
        const data = jadwalKomiteRes.value.data?.data || [];
        setJadwalKomite(Array.isArray(data) ? data : []);
      }

      if (jadwalMkvaRes.status === "fulfilled") {
        const data = jadwalMkvaRes.value.data?.data || [];
        setJadwalMkva(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat dashboard asesor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const namaAsesor =
    profile?.nama_lengkap ||
    user?.nama_lengkap ||
    user?.nama ||
    user?.username ||
    "Asesor";

  const totalJadwal =
    jadwalUji.length +
    jadwalVerifikasi.length +
    jadwalKomite.length +
    jadwalMkva.length;

  const jadwalTerdekat = useMemo(() => {
    const merged = [
      ...jadwalUji.map((item) => ({
        ...item,
        tipe: "Uji Kompetensi",
        path: "/asesor/jadwal-saya",
      })),
      ...jadwalVerifikasi.map((item) => ({
        ...item,
        tipe: "Verifikasi TUK",
        path: "/asesor/verifikasi-tuk",
      })),
      ...jadwalKomite.map((item) => ({
        ...item,
        tipe: "Komite Teknis",
        path: "/asesor/komite-teknis",
      })),
      ...jadwalMkva.map((item) => ({
        ...item,
        tipe: "MKVA",
        path: "/asesor/mkva",
      })),
    ];

    return merged.slice(0, 5);
  }, [jadwalUji, jadwalVerifikasi, jadwalKomite, jadwalMkva]);

  const isProfileComplete =
    profile?.nama_lengkap &&
    profile?.no_reg_asesor &&
    profile?.foto_profil &&
    profile?.ttd_path;

  const menuCards = [
    {
      icon: <User size={24} />,
      title: "Profile",
      desc: "Lengkapi biodata, lisensi, foto profil, dan tanda tangan digital.",
      path: "/asesor/profile",
    },
    {
      icon: <CalendarDays size={24} />,
      title: "Jadwal Uji Kompetensi",
      desc: "Lihat jadwal sebagai asesor penguji dan kelola peserta asesmen.",
      path: "/asesor/jadwal-saya",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Jadwal Verifikasi TUK",
      desc: "Isi form verifikasi tempat uji kompetensi sesuai penugasan.",
      path: "/asesor/verifikasi-tuk",
    },
    {
      icon: <FileSearch size={24} />,
      title: "Jadwal Komite Teknis",
      desc: "Kelola peninjauan instrumen dan formulir FR.IA komite teknis.",
      path: "/asesor/komite-teknis",
    },
    {
      icon: <ClipboardCheck size={24} />,
      title: "Jadwal MKVA",
      desc: "Validasi MKVA dan kelola dokumen validasi asesmen.",
      path: "/asesor/mkva",
    },
    {
      icon: <KeyRound size={24} />,
      title: "Ubah Sandi",
      desc: "Perbarui sandi akun asesor secara aman.",
      path: "/asesor/ubah-password",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Dashboard Asesor
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Selamat Datang,
                  <br />
                  <span className="text-orange-500">{namaAsesor}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Kelola jadwal uji kompetensi, verifikasi TUK, komite teknis,
                  MKVA, profile, dan keamanan akun dalam satu dashboard asesor.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/asesor/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Lihat Jadwal
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Akun
                  </p>

                  <h2 className="mb-4 text-2xl font-black">
                    {isProfileComplete ? "Profile Siap" : "Profile Perlu Dilengkapi"}
                  </h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Pastikan profile, tanda tangan digital, dan data lisensi
                    sudah lengkap sebelum menjalankan proses asesmen.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Total Jadwal" value={`${totalJadwal}`} />
                    <HeroPill
                      label="Profile"
                      value={isProfileComplete ? "Lengkap" : "Belum Lengkap"}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/asesor/profile")}
                    className="mt-5 w-full rounded-2xl bg-white/10 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                  >
                    Kelola Profile
                  </button>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <AlertBox
              type="error"
              icon={<ShieldCheck size={20} />}
              message={error}
            />
          )}

          {loading && (
            <AlertBox
              type="loading"
              icon={<Loader2 size={20} className="animate-spin" />}
              message="Memuat dashboard asesor..."
            />
          )}

          {/* STATS */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <MiniStat
              icon={<CalendarDays size={22} />}
              label="Uji Kompetensi"
              value={`${jadwalUji.length} Jadwal`}
            />
            <MiniStat
              icon={<ShieldCheck size={22} />}
              label="Verifikasi TUK"
              value={`${jadwalVerifikasi.length} Jadwal`}
            />
            <MiniStat
              icon={<FileSearch size={22} />}
              label="Komite Teknis"
              value={`${jadwalKomite.length} Jadwal`}
            />
            <MiniStat
              icon={<ClipboardCheck size={22} />}
              label="MKVA"
              value={`${jadwalMkva.length} Jadwal`}
            />
          </section>

          {/* CONTENT */}
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
            {/* MENU */}
            <div className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <FileText size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Menu Utama
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                  Akses Cepat Asesor
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Pilih menu sesuai proses kerja asesor.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {menuCards.map((item) => (
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

            {/* JADWAL TERDEKAT */}
            <aside className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <CalendarCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Terbaru
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Penugasan Saya
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Lima jadwal terbaru dari seluruh jenis tugas.
                </p>
              </div>

              <div className="p-5 space-y-3">
                {jadwalTerdekat.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                    <CalendarDays
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="text-sm font-black text-[#071E3D]">
                      Belum Ada Jadwal
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Jadwal penugasan asesor belum tersedia.
                    </p>
                  </div>
                ) : (
                  jadwalTerdekat.map((item, index) => (
                    <JadwalMiniCard
                      key={`${item.tipe}-${index}-${getJadwalId(item)}`}
                      item={item}
                      onClick={() => navigate(item.path)}
                    />
                  ))
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function MenuCard({ icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-[28px] border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 p-5 transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-orange-50 text-[#071E3D] group-hover:text-orange-500 border border-slate-100 group-hover:border-orange-100 flex items-center justify-center mb-5 transition-all">
        {icon}
      </div>

      <h3 className="font-black text-[#071E3D] text-lg mb-2">{title}</h3>

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
}

function JadwalMiniCard({ item, onClick }) {
  const jadwal = item.jadwal || item;
  const title =
    item.nama_kegiatan ||
    jadwal.nama_kegiatan ||
    item.skema ||
    jadwal.nama_skema ||
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    item.tipe ||
    "Jadwal Asesor";

  const tanggal =
    item.tanggal ||
    jadwal.tgl_awal ||
    jadwal.tanggal ||
    jadwal.tanggal_uji ||
    jadwal.created_at;

  const lokasi =
    item.tempat ||
    jadwal.tuk?.nama_tuk ||
    jadwal.tuk?.nama ||
    jadwal.nama_tuk ||
    jadwal.tempat ||
    jadwal.lokasi ||
    "Lokasi belum tersedia";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[24px] border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-orange-50 hover:border-orange-100"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-orange-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-orange-500">
          {item.tipe}
        </span>

        <ChevronRight size={16} className="text-slate-300" />
      </div>

      <h3 className="text-sm font-black text-[#071E3D] line-clamp-2">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        <SmallLine
          icon={<CalendarCheck size={14} />}
          text={formatTanggal(tanggal)}
        />
        <SmallLine icon={<MapPin size={14} />} text={lokasi} />
      </div>
    </button>
  );
}

function MiniStat({ icon, label, value }) {
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
}

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

function AlertBox({ type, icon, message }) {
  const styles = {
    error: "border-red-100 bg-red-50 text-red-600",
    loading: "border-blue-100 bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
        styles[type] || styles.loading
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{message}</span>
    </div>
  );
}

function SmallLine({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span className="text-orange-500">{icon}</span>
      <span className="line-clamp-1">{text || "-"}</span>
    </div>
  );
}

function getJadwalId(item) {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
}

function formatTanggal(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (err) {
    return value;
  }
}