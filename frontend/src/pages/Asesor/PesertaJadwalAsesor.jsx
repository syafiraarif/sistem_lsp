import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

export default function PesertaJadwalAsesor() {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = getDisplayName();

  const fetchPeserta = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/asesor/jadwal/${id_jadwal}/peserta`
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setPesertaList(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data peserta jadwal"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, [id_jadwal]);

  const filteredPeserta = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return pesertaList.filter((item) => {
      const user = getUserObject(item);
      const kelengkapan = item.kelengkapan || {};
      const status = normalizeStatusAsesmen(
        item.status_asesmen
      );

      const text = [
        user.nama,
        user.nama_lengkap,
        user.username,
        user.email,
        item.nama_lengkap,
        item.email,
        item.nik,
        status,
        item.nilai_akhir,
        item.keterangan,
        item.status,
        kelengkapan.fria05_data?.nilai,
        kelengkapan.fria05_data?.hasil,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !keyword || text.includes(keyword);

      const matchStatus =
        filterStatus === "semua" ||
        status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [pesertaList, search, filterStatus]);

  const totalPeserta = pesertaList.length;

  const totalKompeten = pesertaList.filter(
    (item) =>
      normalizeStatusAsesmen(item.status_asesmen) ===
      "kompeten"
  ).length;

  const totalBelumKompeten = pesertaList.filter(
    (item) =>
      normalizeStatusAsesmen(item.status_asesmen) ===
      "belum_kompeten"
  ).length;

  const totalBelumDinilai = pesertaList.filter(
    (item) =>
      normalizeStatusAsesmen(item.status_asesmen) ===
      "belum_dinilai"
  ).length;

  const jadwalInfo =
    pesertaList[0]?.jadwal || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Users
                    size={15}
                    className="text-orange-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Hasil Keputusan Asesmen
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Peserta Uji
                  <br />
                  <span className="text-orange-500">
                    {displayName}
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Tetapkan hasil akhir peserta berdasarkan
                  hasil asesmen dan kelengkapan formulir
                  asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/asesor/jadwal-saya")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={fetchPeserta}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Peserta
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
                    Ringkasan Peserta
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalPeserta} Peserta
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Kelengkapan formulir asesmen terdiri
                    dari 11 formulir yang dapat diperiksa
                    melalui menu Kelola Asesmen.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill
                      label="Kompeten"
                      value={`${totalKompeten} Peserta`}
                    />
                    <HeroPill
                      label="Belum Kompeten"
                      value={`${totalBelumKompeten} Peserta`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <AlertBox
              type="error"
              icon={<XCircle size={20} />}
              message={error}
            />
          )}

          {loading && (
            <AlertBox
              type="loading"
              icon={
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              }
              message="Memuat data peserta..."
            />
          )}

          {jadwalInfo && (
            <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox
                  icon={<CalendarCheck size={18} />}
                  label="Jadwal"
                  value={
                    jadwalInfo.nama_kegiatan ||
                    jadwalInfo.nama_skema ||
                    "Jadwal Uji Kompetensi"
                  }
                />

                <InfoBox
                  icon={<FileText size={18} />}
                  label="Skema"
                  value={
                    jadwalInfo.skema?.nama_skema ||
                    jadwalInfo.skema?.judul_skema ||
                    jadwalInfo.nama_skema ||
                    "-"
                  }
                />

                <InfoBox
                  icon={<Info size={18} />}
                  label="Status Jadwal"
                  value={jadwalInfo.status || "-"}
                />
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <MiniStat
              icon={<Users size={22} />}
              label="Total Peserta"
              value={`${totalPeserta} Peserta`}
            />

            <MiniStat
              icon={<CheckCircle2 size={22} />}
              label="Kompeten"
              value={`${totalKompeten} Peserta`}
            />

            <MiniStat
              icon={<ShieldCheck size={22} />}
              label="Belum Kompeten"
              value={`${totalBelumKompeten} Peserta`}
            />

            <MiniStat
              icon={<Info size={22} />}
              label="Belum Dinilai"
              value={`${totalBelumDinilai} Peserta`}
            />
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Search
                    size={15}
                    className="text-orange-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Filter Peserta
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                  Daftar Peserta Uji
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari peserta berdasarkan nama, email,
                  status asesmen, nilai, atau keterangan.
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nama peserta, email, status, nilai, atau keterangan..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="semua">
                  Semua Status
                </option>
                <option value="kompeten">
                  Kompeten
                </option>
                <option value="belum_kompeten">
                  Belum Kompeten
                </option>
                <option value="belum_dinilai">
                  Belum Dinilai
                </option>
              </select>
            </div>
          </section>

          <section className="space-y-5">
            {filteredPeserta.length === 0 ? (
              <EmptyState loading={loading} />
            ) : (
              filteredPeserta.map((peserta, index) => (
                <PesertaCard
                  key={`${getPesertaJadwalId(
                    peserta
                  )}-${index}`}
                  peserta={peserta}
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

function PesertaCard({ peserta, index }) {
  const nama = getNamaPeserta(peserta);
  const email =
    peserta.email ||
    getUserObject(peserta).email ||
    "-";
  const nik =
    peserta.nik ||
    peserta.no_identitas ||
    "-";

  const kelengkapan =
    peserta.kelengkapan || {};

  const fria05 =
    peserta.fria05_penilaian ||
    kelengkapan.fria05_data ||
    null;

  const keputusan =
    peserta.hasil_keputusan ||
    kelengkapan.keputusan_data ||
    null;

  const daftarForm = [
    "mapa01",
    "mapa02",
    "fria01",
    "fria02",
    "fria03",
    "fria05",
    "frak01",
    "frak02",
    "frak05",
    "frak06",
    "frak07",
  ];

  const totalForm = daftarForm.length;

  const totalSelesai = daftarForm.filter(
    (key) => Boolean(kelengkapan[key])
  ).length;

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/5">
      <div className="p-6">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Users size={25} />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Peserta #{index + 1}
                </span>

                <StatusAsesmenBadge
                  status={
                    keputusan?.hasil ||
                    peserta.status_asesmen
                  }
                />

                {keputusan && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                    Keputusan Tersimpan
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-[#071E3D] leading-tight">
                {nama}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                window.location.href = `/asesor/jadwal-saya/${peserta.id_jadwal}/peserta/${peserta.id_peserta}`
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
            >
              <FileText size={17} />
              Kelola Asesmen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <InfoBox
            icon={<UserCheck size={18} />}
            label="ID Peserta"
            value={
              getPesertaJadwalId(peserta) || "-"
            }
          />

          <InfoBox
            icon={<Info size={18} />}
            label="NIK"
            value={nik}
          />

          <InfoBox
            icon={<Star size={18} />}
            label="Nilai FR.IA.05"
            value={
              fria05
                ? `${fria05.nilai || 0} (${formatStatus(
                    fria05.hasil
                  )})`
                : "Belum Ada"
            }
          />

          <InfoBox
            icon={<ClipboardCheck size={18} />}
            label="Kelengkapan"
            value={`${totalSelesai}/${totalForm}`}
          />
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <KelengkapanBadge
            label="MAPA01"
            active={kelengkapan.mapa01}
          />

          <KelengkapanBadge
            label="MAPA02"
            active={kelengkapan.mapa02}
          />

          <KelengkapanBadge
            label="FR.IA.01"
            active={kelengkapan.fria01}
          />

          <KelengkapanBadge
            label="FR.IA.02"
            active={kelengkapan.fria02}
          />

          <KelengkapanBadge
            label="FR.IA.03"
            active={kelengkapan.fria03}
          />

          <KelengkapanBadge
            label="FR.IA.05"
            active={kelengkapan.fria05}
          />

          <KelengkapanBadge
            label="FR.AK.01"
            active={kelengkapan.frak01}
          />

          <KelengkapanBadge
            label="FR.AK.02"
            active={kelengkapan.frak02}
          />

          <KelengkapanBadge
            label="FR.AK.05"
            active={kelengkapan.frak05}
          />

          <KelengkapanBadge
            label="FR.AK.06"
            active={kelengkapan.frak06}
          />

          <KelengkapanBadge
            label="FR.AK.07"
            active={kelengkapan.frak07}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[240px_200px_1fr] gap-4">
          <InfoBox
            icon={<BadgeCheck size={18} />}
            label="Hasil Keputusan"
            value={formatStatus(
              keputusan?.hasil ||
                peserta.status_asesmen
            )}
          />

          <InfoBox
            icon={<Star size={18} />}
            label="Nilai Akhir"
            value={
              keputusan?.nilai_akhir !== null &&
              keputusan?.nilai_akhir !== undefined &&
              keputusan?.nilai_akhir !== ""
                ? keputusan.nilai_akhir
                : peserta.nilai_akhir || "-"
            }
          />

          <InfoBox
            icon={<FileText size={18} />}
            label="Catatan Asesor"
            value={
              keputusan?.catatan_asesor ||
              peserta.keterangan ||
              "-"
            }
          />
        </div>
      </div>
    </article>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2
            className="animate-spin text-white"
            size={34}
          />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">
          Memuat Peserta
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data peserta uji kompetensi.
        </p>
      </div>
    </div>
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

        <p className="text-[#071E3D] font-black mt-1 truncate">
          {value}
        </p>
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

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function AlertBox({ type, icon, message }) {
  const styles = {
    success:
      "bg-green-50 border-green-100 text-green-600",
    error:
      "bg-red-50 border-red-100 text-red-600",
    loading:
      "bg-orange-50 border-orange-100 text-orange-600",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
        styles[type] || styles.loading
      }`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
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

function KelengkapanBadge({ label, active }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
        active
          ? "border-green-100 bg-green-50 text-green-600"
          : "border-slate-100 bg-slate-50 text-slate-400"
      }`}
    >
      {active ? (
        <CheckCircle2 size={15} />
      ) : (
        <XCircle size={15} />
      )}
      {label}
    </div>
  );
}

function StatusAsesmenBadge({ status }) {
  const normalized =
    normalizeStatusAsesmen(status);

  if (normalized === "kompeten") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
        Kompeten
      </span>
    );
  }

  if (normalized === "belum_kompeten") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600">
        Belum Kompeten
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
      Belum Dinilai
    </span>
  );
}

function EmptyState({ loading }) {
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Users size={30} />
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        Peserta Tidak Ditemukan
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Belum ada peserta pada jadwal ini atau data
        tidak sesuai filter.
      </p>
    </div>
  );
}

function getDisplayName() {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      "Asesor"
    );
  } catch (err) {
    return "Asesor";
  }
}

function getUserObject(peserta) {
  return (
    peserta?.user ||
    peserta?.User ||
    peserta?.profileAsesi?.user ||
    {}
  );
}

function getPesertaJadwalId(peserta) {
  return (
    peserta?.id_peserta ||
    peserta?.id_peserta_jadwal ||
    peserta?.id ||
    peserta?.id_pendaftaran ||
    null
  );
}

function getNamaPeserta(peserta) {
  const user = getUserObject(peserta);
  const profile =
    peserta?.profileAsesi ||
    peserta?.asesi ||
    {};

  return (
    peserta?.nama_lengkap ||
    peserta?.nama ||
    profile?.nama_lengkap ||
    profile?.nama ||
    user?.nama_lengkap ||
    user?.nama ||
    user?.username ||
    "Nama peserta belum tersedia"
  );
}

function normalizeStatusAsesmen(status) {
  if (!status) {
    return "belum_dinilai";
  }

  const value = String(status)
    .toLowerCase()
    .trim();

  if (value === "kompeten") {
    return "kompeten";
  }

  if (
    value === "belum kompeten" ||
    value === "belum_kompeten"
  ) {
    return "belum_kompeten";
  }

  if (
    value === "terdaftar" ||
    value === "pra_asesmen" ||
    value === "asesmen"
  ) {
    return "belum_dinilai";
  }

  return value;
}

function formatStatus(status) {
  if (!status) {
    return "-";
  }

  const normalized =
    normalizeStatusAsesmen(status);

  if (normalized === "kompeten") {
    return "Kompeten";
  }

  if (normalized === "belum_kompeten") {
    return "Belum Kompeten";
  }

  return "Belum Dinilai";
}