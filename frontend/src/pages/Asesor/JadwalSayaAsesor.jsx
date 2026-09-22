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
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

export default function JadwalSayaAsesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const fetchJadwalSaya = async (showSuccess = false) => {
    try {
      setLoading(true);

      const res = await api.get("/asesor/jadwal-uji-kompetensi");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setJadwalSaya(data);
      setCurrentPage(1);

      if (showSuccess) {
        await notifikasi.sukses("Berhasil", "Data jadwal uji kompetensi berhasil diperbarui.");
      }
    } catch (err) {
      console.error(err);

      const message = err.response?.data?.message || "Gagal mengambil jadwal uji kompetensi.";

      if (showSuccess) {
        await notifikasi.gagal("Gagal", message);
      } else {
        await notifikasi.peringatan("Data Tidak Tersedia", message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwalSaya(false);
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return jadwalSaya.filter((item) => {
      const jadwal = item?.jadwal || {};

      const searchableText = [
        item?.status,
        item?.catatan,
        item?.keputusan,
        item?.nama_kegiatan,
        item?.skema,
        item?.tempat,
        item?.jam,
        jadwal?.kode_jadwal,
        jadwal?.nama_kegiatan,
        jadwal?.nama_skema,
        jadwal?.skema?.nama_skema,
        jadwal?.skema?.judul_skema,
        jadwal?.nama_tuk,
        jadwal?.tuk?.nama_tuk,
        jadwal?.tuk?.nama,
        jadwal?.tempat,
        jadwal?.lokasi,
        jadwal?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || searchableText.includes(keyword);
      const matchStatus = filterStatus === "semua" || item?.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalSaya, search, filterStatus]);

  const totalJadwal = jadwalSaya.length;
  const totalAktif = jadwalSaya.filter((item) => item?.status === "aktif").length;
  const totalNonaktif = jadwalSaya.filter((item) => item?.status === "nonaktif").length;

  const totalPages = Math.max(1, Math.ceil(filteredJadwal.length / itemsPerPage));

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJadwal.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJadwal, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
                    Jadwal Asesmen
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Pantau jadwal uji kompetensi yang ditugaskan kepada Anda sebagai asesor penguji.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchJadwalSaya(true)}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <StatCard
                icon={<CalendarDays size={22} />}
                label="Total Jadwal"
                value={`${totalJadwal} Jadwal`}
                tone="orange"
              />

              <StatCard
                icon={<BadgeCheck size={22} />}
                label="Status Aktif"
                value={`${totalAktif} Aktif`}
                tone="green"
              />

              <StatCard
                icon={<Info size={22} />}
                label="Status Nonaktif"
                value={`${totalNonaktif} Nonaktif`}
                tone="red"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <CalendarCheck size={17} className="text-[#CC6B27]" />
                Daftar Jadwal Uji Kompetensi
              </h2>
            </div>

            <div className="border-b border-[#071E3D]/10 bg-white px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Cari berdasarkan skema, TUK, lokasi, kegiatan, atau status jadwal.
                </p>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="group relative w-full sm:w-[310px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari Jadwal, Skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {loading && jadwalSaya.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-12 text-center">
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[#CC6B27]" />

                  <h3 className="text-[16px] font-bold text-[#071E3D]">
                    Memuat Jadwal
                  </h3>

                  <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                    Sistem sedang mengambil data jadwal uji kompetensi.
                  </p>
                </div>
              ) : filteredJadwal.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">
                  {paginatedJadwal.map((item, index) => (
                    <JadwalCard
                      key={`${getJadwalId(item) || index}-${index}`}
                      item={item}
                      index={(currentPage - 1) * itemsPerPage + index}
                    />
                  ))}

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPrevious={handlePreviousPage}
                      onNext={handleNextPage}
                    />
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function JadwalCard({ item, index }) {
  const navigate = useNavigate();

  const jadwal = item?.jadwal || {};
  const idJadwal = getJadwalId(item);

  const namaKegiatan =
    item?.nama_kegiatan ||
    jadwal?.nama_kegiatan ||
    jadwal?.nama_skema ||
    jadwal?.skema?.nama_skema ||
    jadwal?.skema?.judul_skema ||
    "Jadwal Uji Kompetensi";

  const namaSkema =
    item?.skema ||
    jadwal?.nama_skema ||
    jadwal?.skema?.nama_skema ||
    jadwal?.skema?.judul_skema ||
    "-";

  const namaTuk =
    item?.tempat ||
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    "TUK belum tersedia";

  const tanggal =
    item?.tanggal ||
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    jadwal?.tgl_pelaksanaan ||
    jadwal?.tanggal_pelaksanaan ||
    jadwal?.created_at;

  const tanggalAkhir =
    item?.tanggal_akhir ||
    jadwal?.tgl_akhir ||
    jadwal?.tanggal_selesai ||
    jadwal?.tanggal_akhir ||
    null;

  const jam = item?.jam || jadwal?.jam || jadwal?.waktu || "-";

  const kodeJadwal =
    jadwal?.kode_jadwal ||
    jadwal?.kode ||
    (idJadwal ? `JDW-${idJadwal}` : `JDW-${index + 1}`);

  const status = item?.status || "aktif";
  const catatan = item?.catatan || "Tidak ada catatan penugasan.";

  const handleLihatPeserta = () => {
    if (!idJadwal) {
      return;
    }

    navigate(`/asesor/jadwal-saya/${idJadwal}/peserta`);
  };

  const handlePresensi = () => {
    if (!idJadwal) {
      return;
    }

    navigate(`/asesor/presensi/${idJadwal}`);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <CalendarDays size={21} />
            </div>
          </div>

          <div className="w-px self-stretch shrink-0 bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                {kodeJadwal}
              </span>

              <span className="text-[#071E3D]/20">
                •
              </span>

              <StatusBadge status={status} />

              <span className="text-[#071E3D]/20">
                •
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E3D]/55">
                Asesor Penguji
              </span>
            </div>

            <h3 className="mt-1.5 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {namaKegiatan}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {catatan}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
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

        <DetailItem
          icon={<Info size={18} />}
          label="Jam"
          value={jam}
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
              Aksi Jadwal
            </p>

            <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
              Kelola peserta dan presensi asesmen.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <button
              type="button"
              onClick={handleLihatPeserta}
              disabled={!idJadwal}
              className="rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:border-[#A8561F] hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Users size={16} />
                Lihat Peserta
              </span>
            </button>

            <button
              type="button"
              onClick={handlePresensi}
              disabled={!idJadwal}
              className="rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <span className="flex items-center justify-center gap-2">
                <ClipboardCheck size={16} />
                Presensi
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#CC6B27]">
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-[13px] font-bold text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isAktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
        isAktif
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {status || "aktif"}
    </span>
  );
}

function StatCard({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
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
}

function Pagination({ currentPage, totalPages, onPrevious, onNext }) {
  return (
    <div className="flex items-center justify-center gap-3 border-t border-[#071E3D]/10 pt-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="rounded-lg border border-[#071E3D]/20 bg-white px-3.5 py-2 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
      >
        <span className="flex items-center gap-1.5">
          <ChevronLeft size={14} />
          Sebelumnya
        </span>
      </button>

      <span className="rounded-lg bg-[#CC6B27]/10 px-3.5 py-2 text-[11px] font-bold text-[#CC6B27]">
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-[#071E3D]/20 bg-white px-3.5 py-2 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
      >
        <span className="flex items-center gap-1.5">
          Berikutnya
          <ChevronRight size={14} />
        </span>
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      <CalendarDays size={42} className="mx-auto mb-4 text-[#071E3D]/20" />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        Belum Ada Jadwal
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        Belum ada jadwal uji kompetensi yang ditugaskan kepada akun asesor ini atau data tidak sesuai dengan filter pencarian.
      </p>
    </div>
  );
}

function getJadwalId(item) {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

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
  if (!start && !end) {
    return "-";
  }

  if (start && !end) {
    return formatTanggal(start);
  }

  if (!start && end) {
    return formatTanggal(end);
  }

  if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
    return formatTanggal(start);
  }

  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}