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

const jenisTugasLabel = {
  asesor_penguji: "Asesor Penguji",
  verifikator_tuk: "Verifikator TUK",
  validator_mkva: "Validator MKVA",
  komite_teknis: "Komite Teknis",
};

export default function JadwalSayaAsesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterTugas, setFilterTugas] = useState("semua");

  const fetchJadwalSaya = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/asesor/jadwal-saya");
      const data = res.data?.data || [];

      setJadwalSaya(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data jadwal asesor"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwalSaya();
  }, []);

  const filteredJadwal = useMemo(() => {
    return jadwalSaya.filter((item) => {
      const jadwal = item.jadwal || {};

      const keyword = search.toLowerCase();

      const searchableText = [
        item.jenis_tugas,
        item.status,
        item.catatan,
        jadwal.nama_skema,
        jadwal.skema?.nama_skema,
        jadwal.nama_tuk,
        jadwal.tuk?.nama_tuk,
        jadwal.kode_jadwal,
        jadwal.status,
        jadwal.tempat,
        jadwal.lokasi,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = searchableText.includes(keyword);

      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      const matchTugas =
        filterTugas === "semua" || item.jenis_tugas === filterTugas;

      return matchSearch && matchStatus && matchTugas;
    });
  }, [jadwalSaya, search, filterStatus, filterTugas]);

  const totalJadwal = jadwalSaya.length;
  const totalAktif = jadwalSaya.filter((item) => item.status === "aktif").length;
  const totalNonaktif = jadwalSaya.filter(
    (item) => item.status === "nonaktif"
  ).length;

  const displayName = getDisplayName();

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
                  <CalendarCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Saya
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Jadwal Asesmen
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pantau seluruh jadwal penugasan asesor, status tugas, catatan,
                  dan detail asesmen yang terhubung dengan akun Anda.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={fetchJadwalSaya}
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
                    Ringkasan Jadwal
                  </p>

                  <h2 className="mb-4 text-2xl font-black">
                    {totalJadwal} Jadwal Terhubung
                  </h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Jadwal aktif digunakan untuk mengakses peserta, instrumen
                    asesmen, presensi, dan dokumen terkait.
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
              message="Memuat data jadwal..."
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
                  Daftar Penugasan
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari berdasarkan skema, TUK, status, atau jenis tugas.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchJadwalSaya}
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

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_220px_240px] gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari jadwal, skema, TUK, atau catatan..."
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

              <select
                value={filterTugas}
                onChange={(e) => setFilterTugas(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="semua">Semua Jenis Tugas</option>
                <option value="asesor_penguji">Asesor Penguji</option>
                <option value="verifikator_tuk">Verifikator TUK</option>
                <option value="validator_mkva">Validator MKVA</option>
                <option value="komite_teknis">Komite Teknis</option>
              </select>
            </div>
          </section>

          {/* LIST */}
          <section className="space-y-5">
            {filteredJadwal.length === 0 ? (
              <EmptyState loading={loading} />
            ) : (
              filteredJadwal.map((item, index) => (
                <JadwalCard
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

function JadwalCard({ item, index }) {
  const navigate = useNavigate();

  const jadwal = item.jadwal || {};

  const idJadwal = item.id_jadwal || jadwal.id_jadwal || jadwal.id;
  const namaSkema =
    jadwal.nama_skema ||
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    jadwal.skema ||
    "Skema belum tersedia";

  const namaTuk =
    jadwal.nama_tuk ||
    jadwal.tuk?.nama_tuk ||
    jadwal.tuk?.nama ||
    jadwal.tempat ||
    jadwal.lokasi ||
    "TUK belum tersedia";

  const tanggal =
    jadwal.tanggal ||
    jadwal.tanggal_uji ||
    jadwal.tgl_pelaksanaan ||
    jadwal.tanggal_pelaksanaan ||
    jadwal.created_at;

  const kodeJadwal =
    jadwal.kode_jadwal ||
    jadwal.kode ||
    (idJadwal ? `JDW-${idJadwal}` : `JDW-${index + 1}`);

  const status = item.status || "aktif";
  const jenisTugas = item.jenis_tugas || "-";
  const catatan = item.catatan || "Tidak ada catatan penugasan.";

  const handleLihatPeserta = () => {
    if (!idJadwal) return;
    navigate(`/asesor/jadwal-saya/${idJadwal}/peserta`);
  };

  const handlePresensi = () => {
    if (!idJadwal) return;
    navigate(`/asesor/presensi/${idJadwal}`);
  };

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_290px]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {kodeJadwal}
                </span>

                <StatusBadge status={status} />

                <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D]">
                  {jenisTugasLabel[jenisTugas] || jenisTugas}
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#071E3D]">
                {namaSkema}
              </h3>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                {catatan}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <CalendarDays size={26} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem
              icon={<CalendarCheck size={18} />}
              label="Tanggal"
              value={formatTanggal(tanggal)}
            />
            <DetailItem
              icon={<MapPin size={18} />}
              label="Lokasi / TUK"
              value={namaTuk}
            />
            <DetailItem
              icon={<UserCheck size={18} />}
              label="Jenis Tugas"
              value={jenisTugasLabel[jenisTugas] || jenisTugas}
            />
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
              Buka peserta, presensi, dan formulir terkait jadwal ini.
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

            <button
              type="button"
              disabled={!idJadwal}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
            >
              <FileText size={16} />
              Form Asesmen
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
        isAktif
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-500"
      }`}
    >
      {status}
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
          <CalendarDays size={30} />
        )}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        {loading ? "Memuat Jadwal" : "Belum Ada Jadwal"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {loading
          ? "Sistem sedang mengambil data jadwal penugasan asesor."
          : "Belum ada jadwal yang terhubung dengan akun asesor ini, atau data tidak cocok dengan filter pencarian."}
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