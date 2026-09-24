import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
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
import { notifikasi } from "../../components/ui/notifikasi";

export default function JadwalAsesi() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [choosingId, setChoosingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    loadData(false);
  }, []);

  const normalizePesertaJadwal = (item) => {
    const jadwalItem = item?.jadwal || item?.Jadwal || {};

    return {
      id_peserta:
        item?.id_peserta ||
        item?.id_peserta_jadwal ||
        item?.id ||
        item?.id_pendaftaran,
      id_jadwal: item?.id_jadwal || jadwalItem?.id_jadwal,
      id_skema:
        item?.id_skema ||
        jadwalItem?.id_skema ||
        jadwalItem?.skema?.id_skema ||
        jadwalItem?.Skema?.id_skema,
      status:
        item?.status ||
        item?.status_peserta ||
        item?.status_pendaftaran ||
        "menunggu",
      raw: item,
    };
  };

  const loadData = async (showSuccess = false) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const [jadwalRes, sayaRes] = await Promise.all([
        axios.get(`${API}/asesi/jadwal/tersedia`, {
          headers: getHeaders(),
        }),
        axios.get(`${API}/asesi/jadwal-saya`, {
          headers: getHeaders(),
        }),
      ]);

      const jadwalData = Array.isArray(jadwalRes.data?.data)
        ? jadwalRes.data.data
        : [];
      const sayaData = Array.isArray(sayaRes.data?.data)
        ? sayaRes.data.data
        : [];

      const selected = sayaData
        .map(normalizePesertaJadwal)
        .filter((item) => item.id_jadwal);

      setJadwal(jadwalData);
      setMyJadwal(selected);

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data jadwal asesmen berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || "Gagal memuat jadwal tersedia.";

      setError(message);
      setJadwal([]);
      setMyJadwal([]);

      if (showSuccess) {
        await notifikasi.gagal("Gagal", message);
      } else {
        await notifikasi.peringatan("Data Tidak Tersedia", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getIdSkema = (item) => {
    return (
      item?.id_skema ||
      item?.skema?.id_skema ||
      item?.Skema?.id_skema ||
      item?.jadwal?.id_skema ||
      item?.Jadwal?.id_skema
    );
  };

  const getSelectedJadwal = (idJadwal) => {
    return myJadwal.find(
      (item) => Number(item.id_jadwal) === Number(idJadwal)
    );
  };

  const getIdPesertaByJadwal = (idJadwal) => {
    const selected = getSelectedJadwal(idJadwal);

    return (
      selected?.id_peserta ||
      selected?.raw?.id_peserta ||
      selected?.raw?.id_peserta_jadwal ||
      selected?.raw?.id ||
      selected?.raw?.id_pendaftaran
    );
  };

  const isSudahDipilih = (idJadwal) => {
    return myJadwal.some(
      (item) => Number(item.id_jadwal) === Number(idJadwal)
    );
  };

  const pilihJadwal = async (idJadwal) => {
    try {
      setChoosingId(idJadwal);

      const res = await axios.post(
        `${API}/asesi/jadwal/pilih`,
        { id_jadwal: idJadwal },
        { headers: getHeaders() }
      );

      const data = res.data?.data || {};

      setMyJadwal((prev) =>
        prev.some(
          (item) => Number(item.id_jadwal) === Number(idJadwal)
        )
          ? prev
          : [
              ...prev,
              {
                id_peserta:
                  data.id_peserta ||
                  data.id_peserta_jadwal ||
                  data.id ||
                  data.id_pendaftaran,
                id_jadwal: idJadwal,
                id_skema: data.id_skema,
                status: data.status || "menunggu",
                raw: data,
              },
            ]
      );

      await notifikasi.sukses(
        "Jadwal Berhasil Dipilih",
        "Jadwal asesmen berhasil ditambahkan ke Jadwal Saya."
      );

      await loadData(false);
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal memilih jadwal.";

      if (message.toLowerCase().includes("sudah terdaftar")) {
        await notifikasi.peringatan(
          "Jadwal Sudah Dipilih",
          "Anda sudah terdaftar pada jadwal ini."
        );
        await loadData(false);
      } else {
        await notifikasi.gagal("Gagal Memilih Jadwal", message);
      }
    } finally {
      setChoosingId(null);
    }
  };

  const filteredJadwal = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return jadwal.filter((item) => {
      const skema = item?.skema || item?.Skema || {};
      const tuk = item?.tuk || item?.Tuk || {};
      const sudahDipilih = isSudahDipilih(item?.id_jadwal);

      const searchableText = [
        skema?.judul_skema,
        skema?.kode_skema,
        tuk?.nama_tuk,
        item?.nama_kegiatan,
        item?.pelaksanaan_uji,
        item?.status,
        item?.lokasi,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !keyword || searchableText.includes(keyword);

      const matchStatus =
        filterStatus === "semua" ||
        (filterStatus === "tersedia" && !sudahDipilih) ||
        (filterStatus === "dipilih" && sudahDipilih);

      return matchSearch && matchStatus;
    });
  }, [jadwal, myJadwal, search, filterStatus]);

  const totalJadwal = jadwal.length;
  const totalDipilih = myJadwal.length;
  const totalBelumDipilih = jadwal.filter(
    (item) => !isSudahDipilih(item?.id_jadwal)
  ).length;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#CC6B27]" />
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Jadwal <span className="text-[#CC6B27]">Asesmen</span>
                  </h1>
                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Temukan dan pilih jadwal uji kompetensi yang sesuai dengan
                    skema sertifikasi Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
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

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <StatCard
                icon={<CalendarDays size={22} />}
                label="Total Jadwal"
                value={`${totalJadwal} Jadwal`}
                tone="orange"
              />
              <StatCard
                icon={<BadgeCheck size={22} />}
                label="Jadwal Dipilih"
                value={`${totalDipilih} Dipilih`}
                tone="green"
              />
              <StatCard
                icon={<Clock size={22} />}
                label="Belum Dipilih"
                value={`${totalBelumDipilih} Tersedia`}
                tone="orange"
              />
            </div>
          </section>

          {error && <ErrorAlert message={error} />}

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <CalendarCheck size={17} className="text-[#CC6B27]" />
                Daftar Jadwal Uji Kompetensi
              </h2>
            </div>

            <div className="border-b border-[#071E3D]/10 bg-white px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#182D4A]/60">
                    Cari berdasarkan skema, kegiatan, TUK, lokasi, atau status.
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/40">
                    {filteredJadwal.length} jadwal ditemukan
                  </p>
                </div>

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
                      placeholder="Cari jadwal, skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="tersedia">Belum Dipilih</option>
                    <option value="dipilih">Sudah Dipilih</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {loading && jadwal.length === 0 ? (
                <LoadingState />
              ) : filteredJadwal.length === 0 ? (
                <EmptyState search={search} />
              ) : (
                <div className="space-y-3">
                  {filteredJadwal.map((item, index) => {
                    const skema = item?.skema || item?.Skema || {};
                    const tuk = item?.tuk || item?.Tuk || {};
                    const idSkema = getIdSkema(item);
                    const idPeserta = getIdPesertaByJadwal(
                      item?.id_jadwal
                    );
                    const sudahDipilih = isSudahDipilih(
                      item?.id_jadwal
                    );
                    const sedangMemilih =
                      choosingId === item?.id_jadwal;

                    return (
                      <JadwalCard
                        key={item?.id_jadwal || index}
                        item={item}
                        skema={skema}
                        tuk={tuk}
                        idSkema={idSkema}
                        idPeserta={idPeserta}
                        sudahDipilih={sudahDipilih}
                        sedangMemilih={sedangMemilih}
                        onPilih={() =>
                          pilihJadwal(item?.id_jadwal)
                        }
                        navigate={navigate}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function JadwalCard({
  item,
  skema,
  tuk,
  idSkema,
  idPeserta,
  sudahDipilih,
  sedangMemilih,
  onPilih,
  navigate,
}) {
  const idJadwal = item?.id_jadwal;
  const namaSkema =
    skema?.judul_skema || "Skema tidak tersedia";
  const kodeSkema =
    skema?.kode_skema || "SKEMA";
  const namaKegiatan =
    item?.nama_kegiatan || "Jadwal Uji Kompetensi";
  const namaTuk =
    tuk?.nama_tuk ||
    tuk?.nama ||
    "TUK belum tersedia";
  const pelaksanaan =
    item?.pelaksanaan_uji || "-";
  const tanggal = formatRentangTanggal(
    item?.tgl_awal,
    item?.tgl_akhir
  );
  const kuota = item?.kuota || 0;

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <BookOpen size={21} />
            </div>
          </div>

          <div className="w-px self-stretch shrink-0 bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                {kodeSkema}
              </span>

              <span className="text-[#071E3D]/20">•</span>

              <StatusBadge
                type={sudahDipilih ? "success" : "available"}
                label={sudahDipilih ? "Sudah Dipilih" : "Tersedia"}
              />

              <span className="text-[#071E3D]/20">•</span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E3D]/55">
                Uji Kompetensi
              </span>
            </div>

            <h3 className="mt-1.5 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {namaSkema}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {namaKegiatan}
            </p>
          </div>

          <div className="hidden shrink-0 sm:block">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag size={13} className="text-[#CC6B27]" />
              ID {idJadwal || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
        <DetailItem
          icon={<CalendarCheck size={18} />}
          label="Tanggal"
          value={tanggal}
        />

        <DetailItem
          icon={<MapPin size={18} />}
          label="Tempat Uji Kompetensi"
          value={namaTuk}
        />

        <DetailItem
          icon={<MonitorCheck size={18} />}
          label="Pelaksanaan Uji"
          value={pelaksanaan}
        />

        <DetailItem
          icon={<Users size={18} />}
          label="Kuota"
          value={`${kuota} peserta`}
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
              Informasi Jadwal
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {idSkema && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
                  <Tag size={13} />
                  ID Skema: {idSkema}
                </span>
              )}

              {sudahDipilih && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
                  <Tag size={13} />
                  ID Peserta: {idPeserta || "-"}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            {!sudahDipilih ? (
              <button
                type="button"
                onClick={onPilih}
                disabled={sedangMemilih || !idJadwal}
                className="rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:border-[#A8561F] hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
              >
                <span className="flex items-center justify-center gap-2">
                  {sedangMemilih ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {sedangMemilih
                    ? "Memilih..."
                    : "Pilih Jadwal"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-lg border border-green-200 bg-green-50 px-5 py-2.5 text-[12px] font-bold text-green-600"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Jadwal Dipilih
                </span>
              </button>
            )}

            {sudahDipilih && (
              <button
                type="button"
                onClick={() =>
                  navigate("/asesi/jadwal-saya")
                }
                className="rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
              >
                <span className="flex items-center justify-center gap-2">
                  Lihat Jadwal Saya
                  <ChevronRight size={16} />
                </span>
              </button>
            )}
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

      <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
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
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          tones[tone] || tones.orange
        }`}
      >
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

function StatusBadge({ type = "available", label }) {
  const styles = {
    success:
      "border-green-200 bg-green-50 text-green-600",
    available:
      "border-[#CC6B27]/20 bg-[#CC6B27]/5 text-[#CC6B27]",
    warning:
      "border-amber-200 bg-amber-50 text-amber-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
        styles[type] || styles.available
      }`}
    >
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-12 text-center">
      <Loader2
        size={32}
        className="mx-auto mb-3 animate-spin text-[#CC6B27]"
      />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        Memuat Jadwal
      </h3>

      <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
        Sistem sedang mengambil data jadwal uji kompetensi.
      </p>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-[12px] font-semibold text-red-600">
      <AlertCircle size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      {search ? (
        <XCircle
          size={42}
          className="mx-auto mb-4 text-[#CC6B27]/50"
        />
      ) : (
        <Inbox
          size={42}
          className="mx-auto mb-4 text-[#071E3D]/20"
        />
      )}

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        {search
          ? "Jadwal Tidak Ditemukan"
          : "Belum Ada Jadwal"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        {search
          ? "Coba gunakan kata kunci lain untuk mencari jadwal sertifikasi."
          : "Saat ini belum ada jadwal sertifikasi yang tersedia."}
      </p>
    </div>
  );
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
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