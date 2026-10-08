import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileQuestion,
  FileSearch,
  Filter,
  Info,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

export default function SkemaAsesor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skemaList, setSkemaList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const fetchSkema = async (showSuccess = false) => {
    try {
      setLoading(true);

      const res = await api.get("/asesor/skema");
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      setSkemaList(data);
      setCurrentPage(1);

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data skema berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        "Gagal mengambil data skema.";

      setSkemaList([]);

      if (showSuccess) {
        await notifikasi.gagal("Gagal", message);
      } else {
        await notifikasi.peringatan(
          "Data Tidak Tersedia",
          message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkema(false);
  }, []);

  const filteredSkema = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return skemaList.filter((item) => {
      const skema = getSkemaData(item);

      const text = [
        skema.kode_skema,
        skema.judul_skema,
        skema.jenis_skema,
        skema.level_kkni,
        skema.bidang,
        skema.jenjang_kualifikasi,
        skema.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || text.includes(keyword);

      const matchStatus =
        filterStatus === "semua" ||
        String(skema.status).toLowerCase() === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [skemaList, search, filterStatus]);

  const totalSkema = skemaList.length;

  const totalAktif = skemaList.filter((item) => {
    const skema = getSkemaData(item);
    return String(skema.status).toLowerCase() === "aktif";
  }).length;

  const totalNonaktif = skemaList.filter((item) => {
    const skema = getSkemaData(item);
    return String(skema.status).toLowerCase() === "nonaktif";
  }).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSkema.length / itemsPerPage)
  );

  const paginatedSkema = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredSkema.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredSkema, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor
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
                    Skema
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Pilih skema sertifikasi untuk mengelola
                    instrumen FR.IA.02, FR.IA.03, dan Paket Soal
                    FR.IA.05.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchSkema(true)}
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
                icon={<BookOpenCheck size={22} />}
                label="Total Skema"
                value={`${totalSkema} Skema`}
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
                <Filter
                  size={17}
                  className="text-[#CC6B27]"
                />
                Daftar Skema Sertifikasi
              </h2>
            </div>

            <div className="border-b border-[#071E3D]/10 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Cari skema berdasarkan kode, judul, jenis,
                  level KKNI, bidang, atau status.
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
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari skema..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-3 text-[12px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value)
                    }
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3 py-2.5 text-[12px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white sm:w-[180px]"
                  >
                    <option value="semua">
                      Semua Status
                    </option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">
                      Nonaktif
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {loading && skemaList.length === 0 ? (
              <div className="rounded-xl border border-[#071E3D]/10 bg-white p-12 text-center shadow-sm">
                <Loader2
                  size={32}
                  className="mx-auto mb-3 animate-spin text-[#CC6B27]"
                />

                <h3 className="text-[16px] font-bold text-[#071E3D]">
                  Memuat Skema
                </h3>

                <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                  Sistem sedang mengambil data skema
                  sertifikasi.
                </p>
              </div>
            ) : paginatedSkema.length === 0 ? (
              <EmptyState
                title="Skema Tidak Ditemukan"
                description="Belum ada skema yang sesuai dengan pencarian atau filter."
              />
            ) : (
              <>
                {paginatedSkema.map((item, index) => (
                  <SkemaCard
                    key={`${getSkemaId(item)}-${index}`}
                    item={item}
                    index={
                      (currentPage - 1) *
                        itemsPerPage +
                      index
                    }
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

function SkemaCard({ item, index }) {
  const navigate = useNavigate();
  const skema = getSkemaData(item);
  const idSkema = getSkemaId(item);

  const kodeSkema =
    skema.kode_skema ||
    (idSkema
      ? `SKM-${idSkema}`
      : `SKM-${index + 1}`);

  const judulSkema =
    skema.judul_skema ||
    "Skema Sertifikasi";

  const jenisSkema =
    skema.jenis_skema ||
    "Skema Sertifikasi";

  const levelKkni =
    skema.level_kkni ||
    skema.jenjang_kualifikasi ||
    "-";

  const bidang = skema.bidang || "-";

  const status =
    String(skema.status || "aktif").toLowerCase();

  const goTo = (path) => {
    if (!idSkema) {
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
                {kodeSkema}
              </span>

              <span className="text-[#071E3D]/20">
                •
              </span>

              <StatusBadge status={status} />

              <span className="text-[#071E3D]/20">
                •
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E3D]/50">
                {jenisSkema}
              </span>
            </div>

            <h3 className="mt-1.5 line-clamp-2 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {judulSkema}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              Kelola instrumen asesmen berdasarkan skema
              sertifikasi ini.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <DetailItem
            icon={<BookOpenCheck size={16} />}
            label="Kode Skema"
            value={kodeSkema}
          />

          <DetailItem
            icon={<BadgeCheck size={16} />}
            label="Level / Jenjang"
            value={levelKkni}
          />

          <DetailItem
            icon={<FileCheck2 size={16} />}
            label="Bidang"
            value={bidang}
          />
        </div>
      </div>

      <div className="bg-[#FAFAFA] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
              Instrumen Skema
            </p>

            <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
              Kelola dokumen FR.IA pada skema ini.
            </p>

            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
              Pilih instrumen yang ingin dibuat atau
              ditinjau.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionButton
              icon={<FileQuestion size={15} />}
              label="FR.IA.02"
              onClick={() =>
                goTo(
                  `/asesor/skema/${idSkema}/fr-ia02`
                )
              }
              disabled={!idSkema}
              primary
            />

            <ActionButton
              icon={<FileQuestion size={15} />}
              label="FR.IA.03"
              onClick={() =>
                goTo(
                  `/asesor/skema/${idSkema}/fr-ia03`
                )
              }
              disabled={!idSkema}
            />

            <ActionButton
              icon={<ClipboardCheck size={15} />}
              label="Paket Soal FR.IA.05"
              onClick={() =>
                goTo(
                  `/asesor/skema/${idSkema}/paket-soal`
                )
              }
              disabled={!idSkema}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  primary = false,
}) {
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
      <FileSearch
        size={40}
        className="mx-auto mb-4 text-[#071E3D]/20"
      />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        {description}
      </p>
    </div>
  );
}

function getSkemaId(item) {
  return (
    item?.id_skema ||
    item?.skema?.id_skema ||
    item?.Skema?.id_skema ||
    item?.id
  );
}

function getSkemaData(item) {
  const skema =
    item?.skema ||
    item?.Skema ||
    item ||
    {};

  return {
    id_skema:
      skema?.id_skema ||
      item?.id_skema ||
      item?.id ||
      null,

    kode_skema:
      skema?.kode_skema ||
      skema?.nomor_skema ||
      item?.kode_skema ||
      item?.nomor_skema ||
      "",

    judul_skema:
      skema?.judul_skema ||
      skema?.nama_skema ||
      item?.judul_skema ||
      item?.nama_skema ||
      "",

    jenis_skema:
      skema?.jenis_skema ||
      item?.jenis_skema ||
      "",

    level_kkni:
      skema?.level_kkni ||
      item?.level_kkni ||
      "",

    bidang:
      skema?.bidang ||
      item?.bidang ||
      "",

    jenjang_kualifikasi:
      skema?.jenjang_kualifikasi ||
      item?.jenjang_kualifikasi ||
      "",

    status:
      skema?.status ||
      item?.status ||
      "aktif",
  };
}