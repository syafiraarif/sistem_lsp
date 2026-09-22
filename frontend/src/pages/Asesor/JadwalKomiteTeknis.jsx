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
  FileCheck2,
  FileQuestion,
  FileSearch,
  Filter,
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

export default function JadwalKomiteTeknis() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalList, setJadwalList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const fetchJadwal = async (showSuccess = false) => {
    try {
      setLoading(true);

      const res = await api.get("/asesor/jadwal-komite-teknis");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setJadwalList(data);
      setCurrentPage(1);

      if (showSuccess) {
        await notifikasi.sukses("Berhasil", "Data jadwal komite teknis berhasil diperbarui.");
      }
    } catch (err) {
      console.error(err);

      const message = err.response?.data?.message || "Gagal mengambil jadwal komite teknis.";

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
    fetchJadwal(false);
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return jadwalList.filter((item) => {
      const jadwal = item?.jadwal || item || {};

      const text = [
        item?.status,
        item?.catatan,
        item?.nama_kegiatan,
        item?.tempat,
        item?.nama_tuk,
        jadwal?.kode_jadwal,
        jadwal?.nama_kegiatan,
        jadwal?.nama_skema,
        jadwal?.judul_skema,
        jadwal?.skema?.nama_skema,
        jadwal?.skema?.judul_skema,
        jadwal?.nama_tuk,
        jadwal?.tuk?.nama_tuk,
        jadwal?.tuk?.nama,
        jadwal?.tuk?.kecamatan,
        jadwal?.tuk?.kecamatan_tuk,
        jadwal?.tempat,
        jadwal?.lokasi,
        jadwal?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || text.includes(keyword);
      const matchStatus = filterStatus === "semua" || item?.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalList, search, filterStatus]);

  const totalJadwal = jadwalList.length;
  const totalAktif = jadwalList.filter((item) => item?.status === "aktif").length;
  const totalNonaktif = jadwalList.filter((item) => item?.status === "nonaktif").length;

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
                    Jadwal Komite Teknis
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola jadwal komite teknis, tinjau instrumen, dan persiapkan dokumen asesmen sesuai penugasan asesor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchJadwal(true)}
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
              <MiniStat
                icon={<CalendarDays size={22} />}
                label="Jadwal Komite"
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
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <Filter size={17} className="text-[#CC6B27]" />
                Daftar Jadwal Komite Teknis
              </h2>
            </div>

            <div className="border-b border-[#071E3D]/10 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Cari jadwal berdasarkan skema, TUK, lokasi, kegiatan, atau status penugasan.
                </p>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="group relative w-full sm:w-[310px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/45 transition-colors group-focus-within:text-[#CC6B27]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari jadwal, skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-3 text-[12px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3 py-2.5 text-[12px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white sm:w-[180px]"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {loading && jadwalList.length === 0 ? (
              <div className="rounded-xl border border-[#071E3D]/10 bg-white p-12 text-center shadow-sm">
                <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[#CC6B27]" />

                <h3 className="text-[16px] font-bold text-[#071E3D]">
                  Memuat Jadwal
                </h3>

                <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                  Sistem sedang mengambil data jadwal komite teknis.
                </p>
              </div>
            ) : paginatedJadwal.length === 0 ? (
              <EmptyState
                title="Jadwal Tidak Ditemukan"
                description="Belum ada jadwal komite teknis yang sesuai dengan pencarian atau filter."
              />
            ) : (
              <>
                {paginatedJadwal.map((item, index) => (
                  <JadwalKomiteCard
                    key={`${getJadwalId(item)}-${item?.id_user || ""}-${item?.jenis_tugas || ""}-${index}`}
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
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function JadwalKomiteCard({ item, index }) {
  const navigate = useNavigate();

  const jadwal = item?.jadwal || item || {};
  const idJadwal = getJadwalId(item);

  const title = getJadwalTitle(item);
  const tanggal = getJadwalDate(jadwal);
  const tanggalAkhir = jadwal?.tgl_akhir || jadwal?.tanggal_selesai || jadwal?.tanggal_akhir || null;
  const tuk = getJadwalTuk(jadwal);
  const kodeJadwal = jadwal?.kode_jadwal || jadwal?.kode || (idJadwal ? `JDW-${idJadwal}` : `JDW-${index + 1}`);
  const catatan = item?.catatan || "Tidak ada catatan penugasan.";
  const status = item?.status || "aktif";

  const goTo = (path) => {
    if (!idJadwal) {
      return;
    }

    navigate(path);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <FileSearch size={21} />
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

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E3D]/50">
                Komite Teknis
              </span>
            </div>

            <h3 className="mt-1.5 line-clamp-2 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {title}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {catatan}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <DetailItem
            icon={<CalendarCheck size={16} />}
            label="Tanggal"
            value={formatRentangTanggal(tanggal, tanggalAkhir)}
          />

          <DetailItem
            icon={<MapPin size={16} />}
            label="Lokasi / TUK"
            value={tuk}
          />

          <DetailItem
            icon={<FileCheck2 size={16} />}
            label="Jenis Tugas"
            value="Komite Teknis"
          />
        </div>
      </div>

      <div className="bg-[#FAFAFA] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
              Instrumen Komite
            </p>

            <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
              Kelola dokumen FR.IA untuk jadwal ini.
            </p>

            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
              Pilih instrumen yang ingin dibuat atau ditinjau.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionButton
              icon={<FileQuestion size={15} />}
              label="FR.IA.02"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia02`)}
              disabled={!idJadwal}
              primary
            />

            <ActionButton
              icon={<FileQuestion size={15} />}
              label="FR.IA.03"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/fr-ia03`)}
              disabled={!idJadwal}
            />

            <ActionButton
              icon={<ClipboardCheck size={15} />}
              label="Paket Soal FR.IA.05"
              onClick={() => goTo(`/asesor/komite-teknis/${idJadwal}/paket-soal`)}
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
      className={`rounded-lg px-4 py-2.5 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
        primary
          ? "border border-[#CC6B27] bg-[#CC6B27] text-white shadow-sm hover:border-[#A8561F] hover:bg-[#A8561F]"
          : "border border-[#071E3D]/20 bg-white text-[#071E3D] hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
            {label}
          </p>

          <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-snug text-[#071E3D]">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "aktif";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {status || "aktif"}
    </span>
  );
}

function MiniStat({ icon, label, value }) {
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
}

function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
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

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-[#071E3D]/15 bg-white p-12 text-center shadow-sm">
      <FileSearch size={40} className="mx-auto mb-4 text-[#071E3D]/20" />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        {description}
      </p>
    </div>
  );
}

function getDisplayName() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return user?.nama || user?.nama_lengkap || user?.username || user?.name || "Asesor";
  } catch {
    return "Asesor";
  }
}

function getJadwalId(item) {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
}

function getJadwalTitle(item) {
  const jadwal = item?.jadwal || item || {};

  return (
    item?.nama_kegiatan ||
    jadwal?.nama_kegiatan ||
    item?.nama_skema ||
    jadwal?.nama_skema ||
    item?.judul_skema ||
    jadwal?.judul_skema ||
    getSkemaText(item?.skema) ||
    getSkemaText(jadwal?.skema) ||
    jadwal?.kode_jadwal ||
    "Jadwal Komite Teknis"
  );
}

function getSkemaText(skema) {
  if (!skema) {
    return "";
  }

  if (typeof skema === "string") {
    return skema;
  }

  if (typeof skema === "object") {
    return skema?.judul_skema || skema?.nama_skema || skema?.kode_skema || skema?.judul_skema_en || "";
  }

  return String(skema);
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
    jadwal?.tempat ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.lokasi ||
    "Lokasi / TUK belum tersedia"
  );
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