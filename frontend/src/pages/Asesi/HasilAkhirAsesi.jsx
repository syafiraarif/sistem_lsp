// frontend/src/pages/asesi/HasilAkhirAsesi.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function HasilAkhirAsesi() {
  const navigate = useNavigate();
  const { id_peserta } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchHasil = async () => {
    try {
      setError("");

      const query = id_peserta ? `?id_peserta=${id_peserta}` : "";
      const res = await api.get(`/asesi/hasil-saya/detail${query}`);

      setData(res.data?.data || null);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengambil hasil akhir asesmen."
      );

      setData(err.response?.data?.data || null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHasil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_peserta]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHasil();
  };

  const status = normalizeStatus(data?.status_asesmen || data?.hasil);
  const isKompeten = status === "kompeten";
  const isBelumKompeten = status === "belum_kompeten";
  const belumTersedia = status === "belum_tersedia";

  const kelengkapan = data?.kelengkapan || {};
  const kelengkapanData = kelengkapan?.data || {};

  const nilaiAkhir = useMemo(() => {
    return (
      data?.nilai_akhir ||
      kelengkapanData?.fria05?.nilai ||
      "-"
    );
  }, [data, kelengkapanData]);

  const handleGoFrAk03 = () => {
    if (!data?.id_peserta) {
      alert("ID peserta tidak ditemukan.");
      return;
    }

    navigate(`/asesi/fr-ak03/${data.id_peserta}`);
  };

  const handleGoFrAk04 = () => {
    if (!data?.id_peserta) {
      alert("ID peserta tidak ditemukan.");
      return;
    }

    navigate(`/asesi/fr-ak04/${data.id_peserta}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Trophy size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Hasil Akhir Asesmen
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Hasil Akhir
                  <br />
                  <span className="text-orange-500">Sertifikasi Anda</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Lihat keputusan akhir dari asesor penguji. Jika hasil belum
                  kompeten, sistem akan menampilkan tombol untuk mengisi
                  FR.AK.03 dan FR.AK.04.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Jadwal Saya
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {refreshing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Status Akhir
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {formatStatus(status)}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {isBelumKompeten
                      ? "Anda perlu mengisi FR.AK.03 dan FR.AK.04."
                      : isKompeten
                      ? "Selamat, Anda dinyatakan kompeten."
                      : "Hasil akhir belum tersedia dari asesor."}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Nilai" value={`${nilaiAkhir}`} />
                    <HeroPill label="Status" value={formatStatus(status)} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          {!data || belumTersedia ? (
            <EmptyState />
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MiniStat
                  icon={<UserCheck size={22} />}
                  label="Asesi"
                  value={data.nama_asesi || "-"}
                />

                <MiniStat
                  icon={<FileText size={22} />}
                  label="Skema"
                  value={data.skema?.judul_skema || "-"}
                />

                <MiniStat
                  icon={<BadgeCheck size={22} />}
                  label="Nilai Akhir"
                  value={`${nilaiAkhir}`}
                />

                <MiniStat
                  icon={isKompeten ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                  label="Status"
                  value={formatStatus(status)}
                />
              </section>

              <section
                className={`rounded-[32px] border p-6 shadow-sm ${
                  isKompeten
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-amber-100 bg-amber-50 text-amber-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">
                    {isKompeten ? (
                      <CheckCircle size={28} />
                    ) : (
                      <ShieldAlert size={28} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      {isKompeten
                        ? "Anda Dinyatakan Kompeten"
                        : "Anda Dinyatakan Belum Kompeten"}
                    </h2>

                    <p className="mt-2 text-sm font-bold leading-relaxed">
                      {data.catatan_asesor ||
                        data.keterangan ||
                        (isKompeten
                          ? "Asesi telah memenuhi kriteria asesmen."
                          : "Asesi perlu melengkapi tindak lanjut melalui FR.AK.03 dan FR.AK.04.")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
                <div className="space-y-6">
                  <Card title="Detail Hasil Akhir" icon={<ClipboardCheck size={22} />}>
                    <table className="w-full border-collapse border border-slate-200 text-sm">
                      <tbody>
                        <TableRow label="Nama Asesi" value={data.nama_asesi} />
                        <TableRow label="NIK" value={data.nik} />
                        <TableRow label="Judul Skema" value={data.skema?.judul_skema} />
                        <TableRow label="Kode Skema" value={data.skema?.kode_skema} />
                        <TableRow label="TUK" value={data.tuk?.nama_tuk} />
                        <TableRow label="Jadwal" value={data.jadwal?.nama_kegiatan} />
                        <TableRow label="Tanggal" value={data.jadwal?.tgl_awal} />
                        <TableRow label="Nilai Akhir" value={nilaiAkhir} />
                        <TableRow label="Status" value={formatStatus(status)} />
                        <TableRow
                          label="Catatan Asesor"
                          value={data.catatan_asesor || data.keterangan || "-"}
                        />
                      </tbody>
                    </table>
                  </Card>

                  <Card title="Kelengkapan Dokumen" icon={<FileText size={22} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <KelengkapanBadge label="Presensi" active={kelengkapan.presensi} />
                      <KelengkapanBadge label="APL01" active={kelengkapan.apl01} />
                      <KelengkapanBadge label="APL02" active={kelengkapan.apl02} />
                      <KelengkapanBadge label="FR.IA.05" active={kelengkapan.fria05} />
                      <KelengkapanBadge label="FR.AK.03" active={kelengkapan.fr_ak03} />
                      <KelengkapanBadge label="FR.AK.04" active={kelengkapan.fr_ak04} />
                    </div>
                  </Card>
                </div>

                <aside>
                  <div className="sticky top-6 space-y-6">
                    <Card title="Tindak Lanjut" icon={<ShieldCheck size={22} />}>
                      {isBelumKompeten ? (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                            Karena hasil akhir belum kompeten, Anda perlu
                            mengisi FR.AK.03 dan FR.AK.04.
                          </p>

                          <button
                            type="button"
                            onClick={handleGoFrAk03}
                            className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                          >
                            Isi FR.AK.03
                          </button>

                          <button
                            type="button"
                            onClick={handleGoFrAk04}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                          >
                            Isi FR.AK.04
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 leading-relaxed">
                          Tidak ada tindak lanjut FR.AK.03 dan FR.AK.04 karena
                          Anda dinyatakan kompeten.
                        </div>
                      )}
                    </Card>
                  </div>
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
COMPONENTS
========================= */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">
          Memuat Hasil Akhir
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil keputusan akhir asesmen.
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
          {value || "-"}
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

      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Hasil Akhir Asesi
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function TableRow({ label, value }) {
  return (
    <tr>
      <td className="w-[220px] border border-slate-200 bg-slate-50 px-4 py-3 font-black text-[#071E3D]">
        {label}
      </td>

      <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-600">
        {value || "-"}
      </td>
    </tr>
  );
}

function KelengkapanBadge({ label, active }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
        active
          ? "border-emerald-100 bg-emerald-50 text-emerald-600"
          : "border-slate-100 bg-slate-50 text-slate-400"
      }`}
    >
      {active ? <CheckCircle size={15} /> : <XCircle size={15} />}
      {label}
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-5 text-red-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={22} className="shrink-0 mt-0.5" />

        <div>
          <p className="font-black">Gagal Memuat Data</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600"
      >
        Coba Lagi
        <RefreshCcw size={16} />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Inbox size={30} />
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        Hasil Akhir Belum Tersedia
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Asesor belum menyimpan keputusan akhir asesmen untuk jadwal ini.
      </p>
    </div>
  );
}

/* =========================
HELPERS
========================= */

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase().trim();

  if (value === "kompeten") return "kompeten";
  if (value === "belum kompeten") return "belum_kompeten";
  if (value === "belum_kompeten") return "belum_kompeten";

  return "belum_tersedia";
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "kompeten") return "Kompeten";
  if (normalized === "belum_kompeten") return "Belum Kompeten";

  return "Belum Tersedia";
}