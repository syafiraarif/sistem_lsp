// frontend/src/pages/asesi/JadwalAsesi.jsx

import React, { useEffect, useMemo, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  MapPin,
  MonitorCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Tag,
  Users,
  XCircle,
} from "lucide-react";

export default function JadwalAsesi() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [choosingId, setChoosingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchJadwal(), fetchMyJadwal()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal/tersedia`, authHeader);
      setJadwal(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
      setError("Gagal memuat jadwal tersedia.");
      setJadwal([]);
    }
  };

  const fetchMyJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal-saya`, authHeader);

      const picked = (res.data.data || [])
        .map((item) => item.id_jadwal || item.jadwal?.id_jadwal)
        .filter(Boolean);

      setMyJadwal([...new Set(picked)]);
    } catch (err) {
      console.error("Gagal memuat jadwal saya:", err);
      setMyJadwal([]);
    }
  };

  const pilihJadwal = async (id_jadwal) => {
    setChoosingId(id_jadwal);

    try {
      await axios.post(`${API}/asesi/jadwal/pilih`, { id_jadwal }, authHeader);

      alert("Jadwal berhasil dipilih, tinggal menunggu diterima.");

      setMyJadwal((prev) =>
        prev.includes(id_jadwal) ? prev : [...prev, id_jadwal]
      );
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("sudah terdaftar")) {
        alert("Anda sudah terdaftar pada jadwal ini.");

        setMyJadwal((prev) =>
          prev.includes(id_jadwal) ? prev : [...prev, id_jadwal]
        );
      } else {
        alert(msg || "Gagal memilih jadwal.");
      }
    } finally {
      setChoosingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredJadwal = useMemo(() => {
    return jadwal.filter((item) => {
      const skema = item.skema || {};
      const tuk = item.tuk || {};
      const alreadyPicked = myJadwal.includes(item.id_jadwal);
      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        skema.judul_skema?.toLowerCase().includes(keyword) ||
        skema.kode_skema?.toLowerCase().includes(keyword) ||
        tuk.nama_tuk?.toLowerCase().includes(keyword) ||
        item.nama_kegiatan?.toLowerCase().includes(keyword) ||
        item.pelaksanaan_uji?.toLowerCase().includes(keyword);

      const matchFilter =
        filter === "semua" ||
        (filter === "tersedia" && !alreadyPicked) ||
        (filter === "dipilih" && alreadyPicked);

      return matchSearch && matchFilter;
    });
  }, [jadwal, myJadwal, search, filter]);

  const totalDipilih = jadwal.filter((item) =>
    myJadwal.includes(item.id_jadwal)
  ).length;

  const totalKuota = jadwal.reduce(
    (sum, item) => sum + Number(item.kuota || 0),
    0
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <HeaderSection
            totalJadwal={jadwal.length}
            totalDipilih={totalDipilih}
            totalKuota={totalKuota}
          />

          <FilterSection
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            loadData={loadData}
          />

          {error && <ErrorAlert message={error} />}

          {filteredJadwal.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredJadwal.map((item) => {
                const skema = item.skema || {};
                const tuk = item.tuk || {};
                const alreadyPicked = myJadwal.includes(item.id_jadwal);
                const isChoosing = choosingId === item.id_jadwal;

                return (
                  <ScheduleCard
                    key={item.id_jadwal}
                    item={item}
                    skema={skema}
                    tuk={tuk}
                    alreadyPicked={alreadyPicked}
                    isChoosing={isChoosing}
                    formatDate={formatDate}
                    onChoose={pilihJadwal}
                  />
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center px-5">
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-lg p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-bold text-lg">Memuat Jadwal</h2>

        <p className="text-slate-500 text-sm mt-2">
          Mengambil data jadwal sertifikasi.
        </p>
      </div>
    </div>
  );
};

const HeaderSection = ({ totalJadwal, totalDipilih, totalKuota }) => {
  return (
    <section className="overflow-hidden rounded-[30px] bg-white border border-slate-200 shadow-md">
      <div className="bg-[#071E3D] px-6 lg:px-8 py-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-4">
              <Calendar size={14} className="text-orange-400" />
              <span className="text-white/80 text-xs font-semibold">
                Dashboard Asesi
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Jadwal Sertifikasi
            </h1>

            <p className="text-slate-300 mt-2 text-sm">
              Pilih jadwal uji kompetensi yang tersedia.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Jadwal" value={totalJadwal} />
            <StatCard label="Dipilih" value={totalDipilih} />
            <StatCard label="Kuota" value={totalKuota} />
          </div>
        </div>
      </div>

      <div className="h-2 bg-orange-500" />
    </section>
  );
};

const FilterSection = ({
  search,
  setSearch,
  filter,
  setFilter,
  loadData,
}) => {
  return (
    <section className="bg-white rounded-[28px] border border-slate-200 shadow-md p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari skema, kegiatan, atau TUK..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 outline-none text-sm font-medium text-[#071E3D] placeholder:text-slate-400 focus:bg-white focus:border-[#071E3D] transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "semua"}
            onClick={() => setFilter("semua")}
          >
            Semua
          </FilterButton>

          <FilterButton
            active={filter === "tersedia"}
            onClick={() => setFilter("tersedia")}
          >
            Tersedia
          </FilterButton>

          <FilterButton
            active={filter === "dipilih"}
            onClick={() => setFilter("dipilih")}
          >
            Dipilih
          </FilterButton>

          <button
            onClick={loadData}
            className="px-4 py-3 rounded-2xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition inline-flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
};

const ScheduleCard = ({
  item,
  skema,
  tuk,
  alreadyPicked,
  isChoosing,
  formatDate,
  onChoose,
}) => {
  return (
    <article className="bg-white rounded-[28px] border border-slate-200 shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="bg-[#071E3D] px-5 lg:px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-orange-400 flex items-center justify-center shrink-0">
            <BookOpen size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="code">{skema.kode_skema || "SKEMA"}</Badge>

              {alreadyPicked ? (
                <Badge variant="success">
                  <CheckCircle size={13} />
                  Dipilih
                </Badge>
              ) : (
                <Badge variant="light">
                  <Clock size={13} />
                  Tersedia
                </Badge>
              )}
            </div>

            <h2 className="text-lg lg:text-xl font-bold text-white leading-snug">
              {skema.judul_skema || "Skema tidak tersedia"}
            </h2>

            <p className="text-slate-300 text-sm mt-1">
              {item.nama_kegiatan || "Jadwal uji kompetensi"}
            </p>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-orange-500" />

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoItem
            icon={<MapPin size={17} />}
            label="TUK"
            value={tuk.nama_tuk || "-"}
          />

          <InfoItem
            icon={<MonitorCheck size={17} />}
            label="Pelaksanaan"
            value={item.pelaksanaan_uji || "-"}
          />

          <InfoItem
            icon={<Calendar size={17} />}
            label="Tanggal"
            value={`${formatDate(item.tgl_awal)} - ${formatDate(
              item.tgl_akhir
            )}`}
          />

          <InfoItem
            icon={<Users size={17} />}
            label="Kuota"
            value={`${item.kuota || 0} peserta`}
          />
        </div>
      </div>

      <div className="px-5 lg:px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="text-xs text-slate-500 font-semibold inline-flex items-center gap-2">
          <Tag size={14} />
          ID: {item.id_jadwal || "-"}
        </span>

        <button
          disabled={alreadyPicked || isChoosing}
          onClick={() => onChoose(item.id_jadwal)}
          className={`px-5 py-3 rounded-2xl font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${
            alreadyPicked
              ? "bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-100"
              : "bg-[#071E3D] hover:bg-orange-500 text-white"
          }`}
        >
          {isChoosing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Memilih
            </>
          ) : alreadyPicked ? (
            <>
              <CheckCircle size={17} />
              Sudah Dipilih
            </>
          ) : (
            <>
              <ShieldCheck size={17} />
              Pilih Jadwal
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </article>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white/10 border border-white/15 p-4 text-white">
      <p className="text-xs text-slate-300 font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl font-semibold text-sm transition ${
        active
          ? "bg-[#071E3D] text-white"
          : "bg-[#F8FAFC] text-slate-600 border border-slate-200 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
};

const Badge = ({ variant = "light", children }) => {
  const variants = {
    code: "bg-orange-500 text-white border-orange-500",
    success: "bg-emerald-500 text-white border-emerald-500",
    light: "bg-white/10 text-white border-white/20",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 ${
        variants[variant] || variants.light
      }`}
    >
      {children}
    </span>
  );
};

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#071E3D] flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
          <p className="text-sm font-semibold text-[#071E3D] leading-snug capitalize break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const ErrorAlert = ({ message }) => {
  return (
    <div className="rounded-[24px] bg-red-50 border border-red-100 p-5 flex gap-3 items-start shadow-sm">
      <AlertCircle className="text-red-500 shrink-0" size={22} />

      <div>
        <h3 className="font-bold text-red-700">Terjadi Kesalahan</h3>
        <p className="text-red-500 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};

const EmptyState = ({ search }) => {
  return (
    <section className="bg-white rounded-[28px] border border-slate-200 shadow-md overflow-hidden">
      <div className="bg-[#071E3D] px-6 py-5">
        <h2 className="text-white text-xl font-bold">
          {search ? "Jadwal Tidak Ditemukan" : "Belum Ada Jadwal"}
        </h2>
      </div>

      <div className="h-1.5 bg-orange-500" />

      <div className="p-10 lg:p-14 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-center mx-auto mb-5">
          {search ? (
            <XCircle className="text-slate-400" size={40} />
          ) : (
            <Inbox className="text-slate-400" size={40} />
          )}
        </div>

        <p className="text-slate-500 text-sm max-w-md mx-auto">
          {search
            ? "Coba gunakan kata kunci lain."
            : "Saat ini belum ada jadwal sertifikasi yang tersedia."}
        </p>
      </div>
    </section>
  );
};