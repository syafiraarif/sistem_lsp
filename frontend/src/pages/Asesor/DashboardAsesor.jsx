import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  KeyRound,
  Loader2,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  User,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

const DashboardAsesor = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jadwalUji, setJadwalUji] = useState([]);
  const [jadwalVerifikasi, setJadwalVerifikasi] = useState([]);
  const [jadwalKomite, setJadwalKomite] = useState([]);
  const [jadwalMkva, setJadwalMkva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const fetchDashboardData = async (showSuccess = false) => {
    setLoading(true);

    try {
      const localUser = getUserFromStorage();
      setUser(localUser);

      const [profileRes, jadwalUjiRes, jadwalVerifikasiRes, jadwalKomiteRes, jadwalMkvaRes] = await Promise.allSettled([
        api.get("/asesor/profile"),
        api.get("/asesor/jadwal-uji-kompetensi"),
        api.get("/asesor/jadwal-verifikasi-tuk"),
        api.get("/asesor/jadwal-komite-teknis"),
        api.get("/asesor/mkva/jadwal"),
      ]);

      let failedCount = 0;

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.data || null);
      } else {
        failedCount += 1;
      }

      if (jadwalUjiRes.status === "fulfilled") {
        const data = jadwalUjiRes.value.data?.data || [];
        setJadwalUji(Array.isArray(data) ? data : []);
      } else {
        failedCount += 1;
      }

      if (jadwalVerifikasiRes.status === "fulfilled") {
        const data = jadwalVerifikasiRes.value.data?.data || [];
        setJadwalVerifikasi(Array.isArray(data) ? data : []);
      } else {
        failedCount += 1;
      }

      if (jadwalKomiteRes.status === "fulfilled") {
        const data = jadwalKomiteRes.value.data?.data || [];
        setJadwalKomite(Array.isArray(data) ? data : []);
      } else {
        failedCount += 1;
      }

      if (jadwalMkvaRes.status === "fulfilled") {
        const data = jadwalMkvaRes.value.data?.data || [];
        setJadwalMkva(Array.isArray(data) ? data : []);
      } else {
        failedCount += 1;
      }

      setCurrentPage(1);

      if (failedCount === 0) {
        if (showSuccess) {
          await notifikasi.sukses("Berhasil", "Data dashboard asesor berhasil diperbarui.");
        }
      } else if (failedCount < 5) {
        await notifikasi.peringatan(
          "Data Tidak Lengkap",
          `${failedCount} data gagal dimuat. Silakan coba Refresh kembali.`
        );
      } else {
        await notifikasi.gagal("Gagal", "Data dashboard asesor gagal dimuat.");
      }
    } catch (err) {
      console.error(err);
      await notifikasi.gagal(
        "Gagal",
        err.response?.data?.message || "Gagal memuat dashboard asesor."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const namaAsesor = profile?.nama_lengkap || user?.nama_lengkap || user?.nama || user?.username || "Asesor";

  const totalJadwal = jadwalUji.length + jadwalVerifikasi.length + jadwalKomite.length + jadwalMkva.length;

  const totalMkvaSelesai = jadwalMkva.filter((item) =>
    Boolean(
      item?.id_mkva ||
        item?.mkva?.id_mkva ||
        item?.status_mkva === "selesai" ||
        item?.status_mkva === "sudah"
    )
  ).length;

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

  const totalPages = Math.max(1, Math.ceil(jadwalTerdekat.length / itemsPerPage));

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return jadwalTerdekat.slice(startIndex, startIndex + itemsPerPage);
  }, [jadwalTerdekat, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const menuCards = [
    {
      icon: <User size={20} />,
      title: "Profile",
      desc: "Lengkapi biodata, lisensi, foto profil, dan tanda tangan digital.",
      path: "/asesor/profile",
      tone: "orange",
    },
    {
      icon: <CalendarDays size={20} />,
      title: "Jadwal Uji Kompetensi",
      desc: "Lihat jadwal sebagai asesor penguji dan kelola peserta asesmen.",
      path: "/asesor/jadwal-saya",
      tone: "orange",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Jadwal Verifikasi TUK",
      desc: "Isi form verifikasi tempat uji kompetensi sesuai penugasan.",
      path: "/asesor/verifikasi-tuk",
      tone: "orange",
    },
    {
      icon: <FileSearch size={20} />,
      title: "Jadwal Komite Teknis",
      desc: "Kelola peninjauan instrumen dan formulir FR.IA komite teknis.",
      path: "/asesor/komite-teknis",
      tone: "orange",
    },
    {
      icon: <ClipboardCheck size={20} />,
      title: "Jadwal MKVA",
      desc: "Validasi MKVA dan kelola dokumen validasi asesmen.",
      path: "/asesor/mkva",
      tone: "orange",
    },
    {
      icon: <KeyRound size={20} />,
      title: "Ubah Sandi",
      desc: "Perbarui sandi akun asesor secara aman.",
      path: "/asesor/ubah-password",
      tone: "orange",
    },
  ];

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Dashboard {namaAsesor}
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola profile, penugasan, jadwal asesmen, dan aktivitas asesor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchDashboardData(true)}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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
              <MiniStat
                icon={<CalendarDays size={22} />}
                label="Uji Kompetensi"
                value={`${jadwalUji.length} Jadwal`}
                tone="orange"
              />

              <MiniStat
                icon={<ShieldCheck size={22} />}
                label="Verifikasi TUK"
                value={`${jadwalVerifikasi.length} Jadwal`}
                tone="orange"
              />

              <MiniStat
                icon={<FileSearch size={22} />}
                label="Komite Teknis"
                value={`${jadwalKomite.length} Jadwal`}
                tone="orange"
              />

              <MiniStat
                icon={<ClipboardCheck size={22} />}
                label="MKVA"
                value={`${jadwalMkva.length} Jadwal`}
                tone="orange"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1fr_380px]">
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                  <ClipboardCheck size={17} className="text-[#CC6B27]" />
                  Menu Utama
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

            <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                    <CalendarDays size={17} className="text-[#CC6B27]" />
                    Jadwal Terbaru
                  </h2>

                  <button
                    type="button"
                    onClick={() => navigate("/asesor/jadwal-saya")}
                    className="text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:text-[#CC6B27]"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                {jadwalTerdekat.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="w-full rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-8 text-center">
                      <CalendarDays size={34} className="mx-auto mb-3 text-[#071E3D]/20" />

                      <p className="text-[14px] font-bold text-[#071E3D]">
                        Belum Ada Jadwal
                      </p>

                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                        Jadwal penugasan asesor belum tersedia.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedJadwal.map((item, index) => (
                        <JadwalMiniCard
                          key={`${item.tipe}-${currentPage}-${index}-${getJadwalId(item)}`}
                          item={item}
                          onClick={() => navigate(item.path)}
                        />
                      ))}
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-[#071E3D]/10 pt-4">
                        <button
                          type="button"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="rounded-lg border border-[#071E3D]/20 bg-white px-3 py-2 text-[10px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronLeft size={14} />
                            Sebelumnya
                          </span>
                        </button>

                        <span className="text-[10px] font-bold text-[#182D4A]/60">
                          {currentPage} / {totalPages}
                        </span>

                        <button
                          type="button"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-[#071E3D]/20 bg-white px-3 py-2 text-[10px] font-bold text-[#071E3D] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                        >
                          <span className="flex items-center gap-1.5">
                            Berikutnya
                            <ChevronRight size={14} />
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#071E3D]/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                  <BadgeCheck size={18} className="text-[#CC6B27]" />
                  Informasi Asesor
                </h2>

                <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                  Informasi singkat akun dan aktivitas penugasan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/asesor/profile")}
                className="rounded-lg border border-[#CC6B27]/40 bg-white px-4 py-2.5 text-[12px] font-bold text-[#CC6B27] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
              >
                Kelola Profile
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 md:p-6">
              <InfoCard
                icon={<User size={20} />}
                label="Nama Asesor"
                value={namaAsesor}
              />

              <InfoCard
                icon={<CalendarCheck size={20} />}
                label="Total Penugasan"
                value={`${totalJadwal} Jadwal`}
              />

              <InfoCard
                icon={<ClipboardCheck size={20} />}
                label="MKVA Selesai"
                value={`${totalMkvaSelesai} Dokumen`}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const MiniStat = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
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

const JadwalMiniCard = ({ item, onClick }) => {
  const jadwal = item?.jadwal || item;

  const title = item?.nama_kegiatan || jadwal?.nama_kegiatan || item?.skema || jadwal?.nama_skema || jadwal?.skema?.nama_skema || jadwal?.skema?.judul_skema || item?.tipe || "Jadwal Asesor";

  const tanggal = item?.tanggal || jadwal?.tgl_awal || jadwal?.tanggal || jadwal?.tanggal_uji || jadwal?.created_at;

  const lokasi = item?.tempat || jadwal?.tuk?.nama_tuk || jadwal?.tuk?.nama || jadwal?.nama_tuk || jadwal?.tempat || jadwal?.lokasi || "Lokasi belum tersedia";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 text-left transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-[#CC6B27]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#CC6B27]">
          {item?.tipe}
        </span>

        <ChevronRight
          size={15}
          className="text-[#071E3D]/25 transition-transform group-hover:translate-x-1 group-hover:text-[#CC6B27]"
        />
      </div>

      <h3 className="mt-2 line-clamp-2 text-[13px] font-bold leading-snug text-[#071E3D]">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        <SmallLine
          icon={<CalendarCheck size={13} />}
          text={formatTanggal(tanggal)}
        />

        <SmallLine
          icon={<MapPin size={13} />}
          text={lokasi}
        />
      </div>
    </button>
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

const SmallLine = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-[#182D4A]/60">
      <span className="text-[#CC6B27]">{icon}</span>
      <span className="line-clamp-1">{text || "-"}</span>
    </div>
  );
};

const getJadwalId = (item) => {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
};

const formatTanggal = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default DashboardAsesor;