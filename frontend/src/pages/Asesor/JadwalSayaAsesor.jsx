// frontend/src/pages/asesor/JadwalSayaAsesor.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Filter,
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import api from "../../services/api";

export default function JadwalSayaAsesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const displayName = getDisplayName();

  const fetchJadwalSaya = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/asesor/jadwal-uji-kompetensi");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setJadwalSaya(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengambil jadwal uji kompetensi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwalSaya();
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase();

    return jadwalSaya.filter((item) => {
      const jadwal = item.jadwal || {};

      const searchableText = [
        item.status,
        item.catatan,
        jadwal.kode_jadwal,
        jadwal.nama_kegiatan,
        jadwal.nama_skema,
        jadwal.skema?.nama_skema,
        jadwal.skema?.judul_skema,
        jadwal.nama_tuk,
        jadwal.tuk?.nama_tuk,
        jadwal.tuk?.nama,
        jadwal.tempat,
        jadwal.lokasi,
        jadwal.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = searchableText.includes(keyword);
      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalSaya, search, filterStatus]);

  const totalJadwal = jadwalSaya.length;
  const totalAktif = jadwalSaya.filter((item) => item.status === "aktif").length;
  const totalNonaktif = jadwalSaya.filter(
    (item) => item.status === "nonaktif"
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <CalendarCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Uji Kompetensi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Jadwal Asesmen
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pantau jadwal uji kompetensi yang ditugaskan kepada Anda
                  sebagai asesor penguji, lalu kelola peserta, presensi, dan
                  formulir asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={fetchJadwalSaya}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Jadwal
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesor/dashboard")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Dashboard
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Jadwal
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalJadwal} Jadwal Uji
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Jadwal aktif dapat digunakan untuk melihat peserta,
                    mengelola presensi, dan membuka formulir asesmen.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Aktif" value={`${totalAktif} Jadwal`} />
                    <HeroPill
                      label="Nonaktif"
                      value={`${totalNonaktif} Jadwal`}
                    />
                  </div>
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
              message="Memuat jadwal uji kompetensi..."
            />
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<CalendarDays size={22} />}
              label="Total Jadwal"
              value={`${totalJadwal} Jadwal`}
            />

            <MiniStat
              icon={<BadgeCheck size={22} />}
              label="Status Aktif"
              value={`${totalAktif} Aktif`}
            />

            <MiniStat
              icon={<Info size={22} />}
              label="Status Nonaktif"
              value={`${totalNonaktif} Nonaktif`}
            />
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Filter size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Filter Jadwal
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                  Daftar Jadwal Uji Kompetensi
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari berdasarkan skema, TUK, lokasi, kegiatan, atau status
                  jadwal.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchJadwalSaya}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                Muat Ulang
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari jadwal, skema, TUK, lokasi, atau catatan..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </section>

          <section className="space-y-5">
            {filteredJadwal.length === 0 ? (
              <EmptyState loading={loading} />
            ) : (
              filteredJadwal.map((item, index) => (
                <JadwalCard
                  key={`${getJadwalId(item) || index}-${item.id_user || index}`}
                  item={item}
                  index={index}
                />
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function JadwalCard({ item, index }) {
  const navigate = useNavigate();

  const jadwal = item.jadwal || {};
  const idJadwal = getJadwalId(item);
  const idFrIa03 = getFrIa03Id(item);

  const namaKegiatan =
    jadwal.nama_kegiatan ||
    jadwal.nama_skema ||
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    "Jadwal Uji Kompetensi";

  const namaSkema =
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    jadwal.nama_skema ||
    "-";

  const namaTuk =
    jadwal.tuk?.nama_tuk ||
    jadwal.tuk?.nama ||
    jadwal.nama_tuk ||
    jadwal.tempat ||
    jadwal.lokasi ||
    "TUK belum tersedia";

  const tanggal =
    jadwal.tgl_awal ||
    jadwal.tanggal ||
    jadwal.tanggal_uji ||
    jadwal.tgl_pelaksanaan ||
    jadwal.tanggal_pelaksanaan ||
    jadwal.created_at;

  const tanggalAkhir =
    jadwal.tgl_akhir ||
    jadwal.tanggal_selesai ||
    jadwal.tanggal_akhir ||
    null;

  const jam = jadwal.jam || jadwal.waktu || "-";

  const kodeJadwal =
    jadwal.kode_jadwal ||
    jadwal.kode ||
    (idJadwal ? `JDW-${idJadwal}` : `JDW-${index + 1}`);

  const status = item.status || "aktif";
  const catatan = item.catatan || "Tidak ada catatan penugasan.";

  const handleLihatPeserta = () => {
    if (!idJadwal) {
      alert("ID jadwal tidak ditemukan.");
      return;
    }

    navigate(`/asesor/jadwal-saya/${idJadwal}/peserta`);
  };

  const handlePresensi = () => {
    if (!idJadwal) {
      alert("ID jadwal tidak ditemukan.");
      return;
    }

    navigate(`/asesor/presensi/${idJadwal}`);
  };

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {kodeJadwal}
                </span>

                <StatusBadge status={status} />

                <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D]">
                  Asesor Penguji
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#071E3D] leading-tight">
                {namaKegiatan}
              </h3>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                {catatan}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <CalendarDays size={26} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <DetailItem
              icon={<CalendarCheck size={18} />}
              label="Tanggal"
              value={formatRentangTanggal(tanggal, tanggalAkhir)}
            />

            <DetailItem
              icon={<MapPin size={18} />}
              label="Lokasi / TUK"
              value={namaTuk}
            />

            <DetailItem
              icon={<UserCheck size={18} />}
              label="Skema"
              value={namaSkema}
            />

            <DetailItem icon={<Info size={18} />} label="Jam" value={jam} />
          </div>
        </div>

        <div className="border-t xl:border-t-0 xl:border-l border-slate-100 bg-slate-50/60 p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Aksi Jadwal
            </p>

            <h4 className="mt-2 text-lg font-black text-[#071E3D]">
              Kelola Asesmen
            </h4>

            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Kelola peserta asesmen dan presensi pada jadwal uji kompetensi ini.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleLihatPeserta}
              disabled={!idJadwal}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Users size={16} />
              Lihat Peserta
            </button>

            <button
              type="button"
              onClick={handlePresensi}
              disabled={!idJadwal}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
            >
              <ClipboardCheck size={16} />
              Presensi
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#071E3D] line-clamp-2">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isAktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        isAktif ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}
    >
      {status || "aktif"}
    </span>
  );
}

function MiniStat({ icon, label, value }) {
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

function EmptyState({ loading }) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {loading ? (
          <Loader2 size={30} className="animate-spin" />
        ) : (
          <CalendarDays size={30} />
        )}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        {loading ? "Memuat Jadwal" : "Belum Ada Jadwal Uji Kompetensi"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {loading
          ? "Sistem sedang mengambil data jadwal uji kompetensi."
          : "Belum ada jadwal uji kompetensi yang ditugaskan kepada akun asesor ini, atau data tidak cocok dengan filter pencarian."}
      </p>
    </div>
  );
}

function getDisplayName() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      user?.name ||
      "Asesor"
    );
  } catch (err) {
    return "Asesor";
  }
}

function getJadwalId(item) {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
}

function getFrIa03Id(item) {
  return (
    item?.id_fr_ia_03 ||
    item?.frIa03?.id_fr_ia_03 ||
    item?.fr_ia_03?.id_fr_ia_03 ||
    item?.jadwal?.id_fr_ia_03 ||
    item?.jadwal?.frIa03?.id_fr_ia_03 ||
    item?.jadwal?.fr_ia_03?.id_fr_ia_03 ||
    item?.jadwal?.frIa03?.[0]?.id_fr_ia_03 ||
    item?.jadwal?.fr_ia_03?.[0]?.id_fr_ia_03 ||
    null
  );
}

function formatTanggal(value) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRentangTanggal(start, end) {
  if (!start && !end) return "-";
  if (start && !end) return formatTanggal(start);
  if (!start && end) return formatTanggal(end);

  if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
    return formatTanggal(start);
  }

  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}