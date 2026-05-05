// frontend/src/pages/asesor/JadwalKomiteTeknis.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileQuestion,
  FileSearch,
  Filter,
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

export default function JadwalKomiteTeknis() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalList, setJadwalList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = getDisplayName();

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/asesor/jadwal-komite-teknis");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setJadwalList(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil jadwal komite teknis"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase();

    return jadwalList.filter((item) => {
      const jadwal = item.jadwal || {};

      const text = [
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

      const matchSearch = text.includes(keyword);
      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalList, search, filterStatus]);

  const totalJadwal = jadwalList.length;
  const totalAktif = jadwalList.filter((item) => item.status === "aktif").length;
  const totalNonaktif = jadwalList.filter(
    (item) => item.status === "nonaktif"
  ).length;

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
                  <FileSearch size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Komite Teknis
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Peninjauan Instrumen
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Kelola jadwal komite teknis untuk meninjau, menyusun, dan
                  mengelola instrumen asesmen sesuai skema yang ditugaskan.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={fetchJadwal}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
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

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Komite
                  </p>

                  <h2 className="mb-4 text-2xl font-black">
                    {totalJadwal} Jadwal Komite
                  </h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Jadwal ini khusus untuk tugas komite teknis dalam
                    pengelolaan instrumen asesmen.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
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
              message="Memuat jadwal komite teknis..."
            />
          )}

          {/* STATS */}
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

          {/* FILTER */}
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
                  Daftar Jadwal Komite Teknis
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari berdasarkan skema, TUK, lokasi, kegiatan, atau status.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchJadwal}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
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
                  placeholder="Cari skema, TUK, lokasi, atau catatan..."
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

          {/* LIST */}
          <section className="space-y-5">
            {filteredJadwal.length === 0 ? (
              <EmptyState loading={loading} />
            ) : (
              filteredJadwal.map((item, index) => (
                <JadwalKomiteCard
                  key={`${item.id_jadwal}-${item.id_user}-${item.jenis_tugas}-${index}`}
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

function JadwalKomiteCard({ item, index }) {
  const navigate = useNavigate();

  const jadwal = item.jadwal || {};
  const idJadwal = getJadwalId(item);

  const title = getJadwalTitle(item);
  const tanggal = getJadwalDate(jadwal);
  const tanggalAkhir = jadwal.tgl_akhir || jadwal.tanggal_selesai || null;
  const tuk = getJadwalTuk(jadwal);
  const kodeJadwal =
    jadwal.kode_jadwal ||
    jadwal.kode ||
    (idJadwal ? `JDW-${idJadwal}` : `JDW-${index + 1}`);

  const catatan = item.catatan || "Tidak ada catatan penugasan.";
  const status = item.status || "aktif";

  const goTo = (path) => {
    if (!idJadwal) return;
    navigate(path);
  };

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {kodeJadwal}
                </span>

                <StatusBadge status={status} />

                <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D]">
                  Komite Teknis
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#071E3D]">{title}</h3>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                {catatan}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <FileSearch size={26} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem
              icon={<CalendarCheck size={18} />}
              label="Tanggal"
              value={formatRentangTanggal(tanggal, tanggalAkhir)}
            />
            <DetailItem
              icon={<MapPin size={18} />}
              label="Lokasi / TUK"
              value={tuk}
            />
            <DetailItem
              icon={<FileCheck2 size={18} />}
              label="Jenis Tugas"
              value="Komite Teknis"
            />
          </div>
        </div>

        <div className="border-t xl:border-t-0 xl:border-l border-slate-100 bg-slate-50/60 p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Instrumen Komite
            </p>

            <h4 className="mt-2 text-lg font-black text-[#071E3D]">
              Kelola FR.IA
            </h4>

            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Pilih instrumen yang ingin dibuat atau ditinjau untuk jadwal ini.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <ActionButton
              icon={<FileQuestion size={16} />}
              label="FR.IA.02"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia02`)}
              disabled={!idJadwal}
              primary
            />

            <ActionButton
              icon={<FileQuestion size={16} />}
              label="FR.IA.03"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia03`)}
              disabled={!idJadwal}
            />

            <ActionButton
              icon={<FileQuestion size={16} />}
              label="FR.IA.04A"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia04a`)}
              disabled={!idJadwal}
            />

            <ActionButton
              icon={<FileQuestion size={16} />}
              label="FR.IA.04B"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia04b`)}
              disabled={!idJadwal}
            />

            <ActionButton
              icon={<ClipboardCheck size={16} />}
              label="Paket Soal FR.IA.05 - 08"
              onClick={() =>
                goTo(`/asesor/komite-teknis/${idJadwal}/paket-soal`)
              }
              disabled={!idJadwal}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionButton({ icon, label, onClick, disabled, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:bg-slate-300 ${
        primary
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-[#071E3D]"
          : "border border-slate-100 bg-white text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
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
  const active = status === "aktif";

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}
    >
      {status || "aktif"}
    </span>
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

function EmptyState({ loading }) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {loading ? (
          <Loader2 size={30} className="animate-spin" />
        ) : (
          <FileSearch size={30} />
        )}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        {loading ? "Memuat Jadwal" : "Belum Ada Jadwal Komite Teknis"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {loading
          ? "Sistem sedang mengambil data jadwal komite teknis."
          : "Belum ada jadwal dengan tugas komite teknis, atau data tidak cocok dengan filter pencarian."}
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

function getJadwalTitle(item) {
  const jadwal = item?.jadwal || {};

  return (
    jadwal.nama_kegiatan ||
    jadwal.nama_skema ||
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    jadwal.kode_jadwal ||
    "Jadwal Komite Teknis"
  );
}

function getJadwalDate(jadwal) {
  return (
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    jadwal?.tgl_pelaksanaan ||
    jadwal?.tanggal_pelaksanaan ||
    jadwal?.created_at
  );
}

function getJadwalTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    "Lokasi / TUK belum tersedia"
  );
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

function formatRentangTanggal(start, end) {
  if (!start && !end) return "-";
  if (start && !end) return formatTanggal(start);
  if (!start && end) return formatTanggal(end);

  if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
    return formatTanggal(start);
  }

  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}