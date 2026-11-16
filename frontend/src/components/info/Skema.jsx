import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  AlertTriangle,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileCheck,
  Layers3,
  Loader2,
  MapPin,
  Monitor,
  Search,
  Wallet,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return "Belum tersedia";
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) return "Belum tersedia";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return "Belum ditentukan";

  const normalized = String(value).slice(0, 10);
  const date = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatDateRange = (start, end) => {
  if (start && end && String(start).slice(0, 10) === String(end).slice(0, 10)) {
    return formatDate(start);
  }

  if (start && end) return `${formatDate(start)} sampai ${formatDate(end)}`;
  if (start) return `Mulai ${formatDate(start)}`;
  if (end) return `Sampai ${formatDate(end)}`;
  return "Tanggal belum ditentukan";
};

const formatTime = (value) => {
  if (!value) return "Belum ditentukan";
  return String(value).slice(0, 5);
};

const getMethod = (method) => {
  const value = String(method || "").toLowerCase();

  if (value === "daring" || value === "online") {
    return { label: "Online", detail: "Daring", online: true };
  }

  if (value === "luring" || value === "offline") {
    return { label: "Offline", detail: "Luring", online: false };
  }

  return {
    label: "Belum ditentukan",
    detail: "Metode pelaksanaan",
    online: false,
  };
};

const getRequirements = (scheme) =>
  Array.isArray(scheme.persyaratans) ? scheme.persyaratans : [];

const getFees = (scheme) => {
  if (Array.isArray(scheme.biayaUji)) return scheme.biayaUji;
  if (Array.isArray(scheme.biaya_uji)) return scheme.biaya_uji;
  return [];
};

const getSchedules = (scheme) => {
  if (Array.isArray(scheme.jadwalList)) return scheme.jadwalList;
  if (Array.isArray(scheme.jadwals)) return scheme.jadwals;
  return [];
};

const getUnits = (scheme) => {
  if (!Array.isArray(scheme.skemaUnit)) return [];

  return scheme.skemaUnit
    .filter((item) => item.unit)
    .slice()
    .sort(
      (a, b) =>
        (a.urutan ?? Number.MAX_SAFE_INTEGER) -
        (b.urutan ?? Number.MAX_SAFE_INTEGER)
    );
};

const getElements = (unit) => {
  if (!Array.isArray(unit?.elemen)) return [];

  return unit.elemen
    .slice()
    .sort(
      (a, b) =>
        (a.urutan ?? Number.MAX_SAFE_INTEGER) -
        (b.urutan ?? Number.MAX_SAFE_INTEGER)
    );
};

const getIsRequired = (requirement) => {
  const relation =
    requirement.skema_persyaratan || requirement.SkemaPersyaratan || {};
  const value = relation.wajib ?? requirement.wajib;

  if (value === undefined || value === null) return true;
  return value === true || value === 1 || value === "1";
};

export default function Skema() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openSchemeId, setOpenSchemeId] = useState(null);
  const [openUnitByScheme, setOpenUnitByScheme] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/skema`);
        const result =
          response.data?.success && Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (isMounted) setSchemes(result);
      } catch (err) {
        console.error("Gagal mengambil data skema:", err);
        if (isMounted) {
          setError("Daftar skema belum dapat dimuat. Silakan coba kembali.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSchemes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSchemes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return schemes;

    return schemes.filter((scheme) => {
      const searchable = [
        scheme.kode_skema,
        scheme.judul_skema,
        scheme.jenis_skema,
        scheme.bidang,
        scheme.level_kkni,
        scheme.jenjang_kualifikasi,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [schemes, search]);

  const toggleScheme = (id) => {
    setOpenSchemeId((current) => (current === id ? null : id));
  };

  const toggleUnit = (schemeId, unitId) => {
    setOpenUnitByScheme((current) => ({
      ...current,
      [schemeId]: current[schemeId] === unitId ? null : unitId,
    }));
  };

  return (
    <section className="relative">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-[3px] w-7 bg-[#CC6B27]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#CC6B27]">
              Daftar Sertifikasi
            </p>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#071E3D] sm:text-3xl">
            Skema Sertifikasi
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Pilih skema untuk melihat persyaratan asesi, unit kompetensi,
            elemen, dan jadwal pelaksanaannya.
          </p>
        </div>

        <div className="w-full lg:max-w-[380px]">
          <label
            htmlFor="search-skema"
            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500"
          >
            Cari Skema
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="search-skema"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenSchemeId(null);
              }}
              placeholder="Nama, kode, atau bidang skema..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#071E3D] shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#CC6B27]"
            />
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="mb-5 flex items-center justify-between border-b border-[#071E3D]/10 pb-3">
          <p className="text-xs font-bold text-[#071E3D]">Semua Skema</p>
          <p className="text-[11px] font-medium text-slate-400">
            {filteredSchemes.length} dari {schemes.length} skema
          </p>
        </div>
      )}

      {loading ? (
        <div className="border border-slate-200 bg-white py-16 text-center">
          <Loader2
            size={32}
            className="mx-auto mb-3 animate-spin text-[#CC6B27]"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Memuat Data Skema
          </p>
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-white px-6 py-12 text-center">
          <AlertTriangle size={30} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#071E3D] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
          >
            Muat Ulang
          </button>
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredSchemes.map((scheme) => {
              const isOpen = openSchemeId === scheme.id_skema;
              const units = getUnits(scheme);
              const requirements = getRequirements(scheme);
              const fees = getFees(scheme);
              const schedules = getSchedules(scheme);
              const openUnitId = openUnitByScheme[scheme.id_skema];

              return (
                <motion.article
                  key={scheme.id_skema}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24 }}
                  className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                    isOpen
                      ? "border-[#CC6B27]/35 shadow-md"
                      : "border-slate-200 shadow-sm hover:border-[#CC6B27]/30"
                  }`}
                >
                  <div className="flex flex-col gap-4 p-5 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4 lg:flex-1">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                          isOpen
                            ? "bg-[#071E3D] text-[#CC6B27]"
                            : "bg-[#CC6B27]/10 text-[#CC6B27]"
                        }`}
                      >
                        <Award size={19} />
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          {scheme.kode_skema && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#CC6B27]">
                              {scheme.kode_skema}
                            </span>
                          )}
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                            {scheme.jenis_skema || "Skema Sertifikasi"}
                          </span>
                        </div>

                        <h3 className="text-sm font-black leading-6 text-[#071E3D] sm:text-base">
                          {scheme.judul_skema}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2
                              size={11}
                              className="text-emerald-500"
                            />
                            Tersedia
                          </span>
                          <span>{units.length} Unit Kompetensi</span>
                          {scheme.bidang && <span>{scheme.bidang}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch lg:w-[390px] lg:shrink-0">
                      <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#F8F9FB] px-3.5 py-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Wallet size={14} className="text-[#CC6B27]" />
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                            Biaya Sertifikasi
                          </p>
                        </div>

                        {fees.length > 0 ? (
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {fees.map((fee) => {
                              const method = getMethod(fee.metode_uji);

                              return (
                                <div key={fee.id_biaya} className="min-w-[105px]">
                                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                    {method.label}
                                  </p>
                                  <p className="mt-0.5 text-xs font-black text-[#071E3D]">
                                    {formatCurrency(fee.nominal)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-400">
                            Belum tersedia
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`scheme-detail-${scheme.id_skema}`}
                        onClick={() => toggleScheme(scheme.id_skema)}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-lg px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors sm:self-center lg:self-stretch ${
                          isOpen
                            ? "bg-[#071E3D] text-white"
                            : "bg-[#CC6B27]/10 text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                        }`}
                      >
                        <ClipboardList size={14} />
                        {isOpen ? "Tutup Detail" : "Detail Skema"}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`scheme-detail-${scheme.id_skema}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-200 bg-[#FAFBFC] p-4 sm:p-6 lg:p-7">
                          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#CC6B27]">
                                Detail Skema
                              </p>
                              <h4 className="mt-1 text-base font-black text-[#071E3D]">
                                {scheme.judul_skema}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[9px] font-semibold text-slate-500">
                              {scheme.level_kkni && (
                                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                                  Level KKNI {scheme.level_kkni}
                                </span>
                              )}
                              {scheme.jenjang_kualifikasi && (
                                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                                  Jenjang {scheme.jenjang_kualifikasi}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
                            <DetailPanel
                              icon={<FileCheck size={17} />}
                              title="Persyaratan Asesi"
                              description="Dokumen yang perlu disiapkan untuk mengikuti sertifikasi"
                              count={`${requirements.length} persyaratan`}
                            >
                              {requirements.length > 0 ? (
                                <div className="space-y-2.5">
                                  {requirements.map((requirement, index) => {
                                    const required = getIsRequired(requirement);

                                    return (
                                      <div
                                        key={
                                          requirement.id_persyaratan || index
                                        }
                                        className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5"
                                      >
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#CC6B27]/10 text-[#CC6B27]">
                                          <FileCheck size={14} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[11px] font-bold leading-5 text-[#071E3D]">
                                            {requirement.nama_persyaratan ||
                                              "Persyaratan"}
                                          </p>
                                          <div className="mt-1.5 flex flex-wrap gap-2">
                                            {requirement.jenis_persyaratan && (
                                              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                                {requirement.jenis_persyaratan}
                                              </span>
                                            )}
                                            <span
                                              className={`text-[8px] font-bold uppercase tracking-wider ${
                                                required
                                                  ? "text-emerald-700"
                                                  : "text-slate-400"
                                              }`}
                                            >
                                              {required ? "Wajib" : "Opsional"}
                                            </span>
                                          </div>
                                          {requirement.keterangan && (
                                            <p className="mt-2 text-[10px] leading-5 text-slate-500">
                                              {requirement.keterangan}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <EmptyDetail text="Persyaratan untuk skema ini belum tersedia." />
                              )}
                            </DetailPanel>

                            <DetailPanel
                              icon={<Layers3 size={17} />}
                              title="Unit Kompetensi"
                              description="Pilih unit untuk melihat elemen kompetensinya"
                              count={`${units.length} unit`}
                            >
                              {units.length > 0 ? (
                                <div className="space-y-2.5">
                                  {units.map((link, unitIndex) => {
                                    const unit = link.unit;
                                    const unitId = link.id_unit || unit.id_unit;
                                    const elements = getElements(unit);
                                    const isUnitOpen = openUnitId === unitId;

                                    return (
                                      <div
                                        key={unitId || unitIndex}
                                        className={`overflow-hidden rounded-lg border bg-white transition-colors ${
                                          isUnitOpen
                                            ? "border-[#CC6B27]/40"
                                            : "border-slate-200"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          aria-expanded={isUnitOpen}
                                          onClick={() =>
                                            toggleUnit(scheme.id_skema, unitId)
                                          }
                                          className="flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-[#FAFBFC]"
                                        >
                                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#071E3D] text-[10px] font-black text-white">
                                            {unitIndex + 1}
                                          </span>

                                          <span className="min-w-0 flex-1">
                                            <span className="flex flex-wrap items-center gap-2">
                                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#CC6B27]">
                                                {unit.kode_unit ||
                                                  "Kode unit belum tersedia"}
                                              </span>
                                              {link.kelompok?.nama_kelompok && (
                                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                                                  {link.kelompok.nama_kelompok}
                                                </span>
                                              )}
                                            </span>
                                            <span className="mt-1 block text-[11px] font-bold leading-5 text-[#071E3D]">
                                              {unit.judul_unit ||
                                                "Judul unit belum tersedia"}
                                            </span>
                                            <span className="mt-1 block text-[9px] font-medium text-slate-400">
                                              {elements.length} elemen kompetensi
                                            </span>
                                          </span>

                                          <ChevronRight
                                            size={16}
                                            className={`mt-1 shrink-0 text-[#CC6B27] transition-transform ${
                                              isUnitOpen ? "rotate-90" : ""
                                            }`}
                                          />
                                        </button>

                                        <AnimatePresence initial={false}>
                                          {isUnitOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="border-t border-slate-100 bg-[#F8F9FB] px-4 py-3 pl-14">
                                                <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                                  Elemen Kompetensi
                                                </p>
                                                {elements.length > 0 ? (
                                                  <ol className="space-y-2">
                                                    {elements.map(
                                                      (element, elementIndex) => (
                                                        <li
                                                          key={
                                                            element.id_elemen ||
                                                            elementIndex
                                                          }
                                                          className="flex items-start gap-2 text-[10px] leading-5 text-slate-600"
                                                        >
                                                          <span className="shrink-0 font-bold text-[#CC6B27]">
                                                            {element.urutan ||
                                                              elementIndex + 1}.
                                                          </span>
                                                          <span>
                                                            {element.nama_elemen}
                                                          </span>
                                                        </li>
                                                      )
                                                    )}
                                                  </ol>
                                                ) : (
                                                  <p className="text-[10px] text-slate-400">
                                                    Elemen untuk unit ini belum tersedia.
                                                  </p>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <EmptyDetail text="Unit kompetensi untuk skema ini belum tersedia." />
                              )}
                            </DetailPanel>
                          </div>

                          <div className="mt-5">
                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <div className="flex items-center gap-3 border-b border-slate-200 bg-[#F8F9FB] px-5 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#071E3D] text-[#CC6B27]">
                                  <CalendarDays size={17} />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-[#071E3D] sm:text-sm">
                                    Jadwal Pelaksanaan
                                  </h4>
                                  <p className="mt-1 text-[9px] leading-4 text-slate-400">
                                    Jadwal uji kompetensi yang sedang dibuka untuk skema ini
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 sm:p-5">
                                {schedules.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    {schedules.map((schedule) => {
                                      const method = getMethod(
                                        schedule.pelaksanaan_uji
                                      );
                                      const tuk = schedule.tuk || {};
                                      const validAgendaUrl = /^https?:\/\//i.test(
                                        schedule.url_agenda || ""
                                      );

                                      return (
                                        <article
                                          key={schedule.id_jadwal}
                                          className="rounded-lg border border-slate-200 bg-white p-4"
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span
                                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider ${
                                                method.online
                                                  ? "bg-blue-50 text-blue-700"
                                                  : "bg-[#CC6B27]/10 text-[#CC6B27]"
                                              }`}
                                            >
                                              {method.online ? (
                                                <Monitor size={12} />
                                              ) : (
                                                <MapPin size={12} />
                                              )}
                                              {method.label}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-700">
                                              Pendaftaran Dibuka
                                            </span>
                                          </div>

                                          <h5 className="mt-3 text-sm font-bold leading-5 text-[#071E3D]">
                                            {schedule.nama_kegiatan ||
                                              "Jadwal Uji Kompetensi"}
                                          </h5>

                                          {schedule.kode_jadwal && (
                                            <p className="mt-1 text-[9px] font-semibold text-slate-400">
                                              {schedule.kode_jadwal}
                                            </p>
                                          )}

                                          <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                                            <ScheduleInfo
                                              icon={<CalendarDays size={14} />}
                                              label="Tanggal Uji"
                                              value={formatDateRange(
                                                schedule.tgl_awal,
                                                schedule.tgl_akhir
                                              )}
                                            />
                                            {schedule.tgl_pra_asesmen && (
                                              <ScheduleInfo
                                                icon={<ClipboardList size={14} />}
                                                label="Pra-Asesmen"
                                                value={formatDate(
                                                  schedule.tgl_pra_asesmen
                                                )}
                                              />
                                            )}
                                            <ScheduleInfo
                                              icon={<Clock3 size={14} />}
                                              label="Waktu"
                                              value={formatTime(schedule.jam)}
                                            />

                                            {method.online ? (
                                              <ScheduleInfo
                                                icon={<Monitor size={14} />}
                                                label="Metode Pelaksanaan"
                                                value="Dilaksanakan secara online"
                                              />
                                            ) : (
                                              <ScheduleInfo
                                                icon={<MapPin size={14} />}
                                                label="Lokasi TUK"
                                                value={[
                                                  tuk.nama_tuk,
                                                  tuk.alamat,
                                                  tuk.kota,
                                                  tuk.provinsi,
                                                ]
                                                  .filter(Boolean)
                                                  .join(", ") ||
                                                  "Lokasi TUK belum dicantumkan"}
                                              />
                                            )}
                                          </div>

                                          {validAgendaUrl && (
                                            <a
                                              href={schedule.url_agenda}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27] transition-colors hover:text-[#071E3D]"
                                            >
                                              Buka Informasi Jadwal
                                              <ExternalLink size={12} />
                                            </a>
                                          )}
                                        </article>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <EmptyDetail text="Belum ada jadwal yang dibuka untuk skema ini." />
                                )}
                              </div>
                            </section>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <Search size={26} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-[#071E3D]">
            Skema sertifikasi tidak ditemukan
          </h3>
          <p className="mt-2 text-xs text-slate-400">
            Coba gunakan kata kunci pencarian yang berbeda.
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg bg-[#071E3D] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
            >
              Hapus Pencarian
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function DetailPanel({ icon, title, description, count, children }) {
  return (
    <section className="flex h-[420px] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:h-[440px]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-[#F8F9FB] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#CC6B27]/10 text-[#CC6B27]">
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#071E3D] sm:text-sm">
              {title}
            </h4>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              {description}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[8px] font-bold text-slate-500">
          {count}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

function EmptyDetail({ text }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-[#FAFBFC] px-4 py-7 text-center">
      <p className="text-[10px] font-medium text-slate-400">{text}</p>
    </div>
  );
}

function ScheduleInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[#CC6B27]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[10px] font-semibold leading-5 text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}
