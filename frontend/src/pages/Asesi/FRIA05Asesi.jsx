// frontend/src/pages/asesi/FRIA05Asesi.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  ClipboardList,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
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

export default function FRIA05Asesi() {
  const navigate = useNavigate();
  const params = useParams();

  const { id_jadwal, id_fr_ia_05, id_peserta } = params;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [payload, setPayload] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");

  const imageBase = API_BASE.replace("/api", "");

  const getImageSrc = (filePath) => {
    if (!filePath) return "";
    if (String(filePath).startsWith("http")) return filePath;

    return `${imageBase}/${String(filePath).replace(/^\/+/, "")}`;
  };

  const fetchData = async () => {
    try {
      setError("");

      if (!id_peserta) {
        throw new Error("ID peserta tidak ditemukan di URL.");
      }

      let res;

      if (id_jadwal) {
        res = await api.get(
          `/asesi/fr-ia05/paket-jadwal/${id_jadwal}/${id_peserta}`
        );
      } else if (id_fr_ia_05) {
        res = await api.get(`/asesi/fr-ia05/${id_fr_ia_05}/${id_peserta}`);
      } else {
        throw new Error("ID jadwal atau ID FR.IA.05 tidak ditemukan.");
      }

      const data = res.data?.data || null;

      if (!data) {
        throw new Error("Data FR.IA.05 tidak tersedia.");
      }

      setPayload(data);
      setHasil(normalizeHasilFrontend(data.hasil));

      const initialAnswers = {};

      (data.paket?.soal || []).forEach((soal) => {
        initialAnswers[soal.id_soal] = "";
      });

      setSelectedAnswers(initialAnswers);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal memuat FR.IA.05."
      );

      setPayload(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_jadwal, id_fr_ia_05, id_peserta]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const paket = payload?.paket || {};
  const soalList = Array.isArray(paket?.soal) ? paket.soal : [];
  const profile = payload?.profile || {};
  const skema = payload?.skema || {};
  const jadwal = payload?.jadwal || {};
  const tuk = payload?.tuk || {};

  const normalizedHasil = normalizeHasilFrontend(hasil);
  const alreadySubmitted = Boolean(payload?.already_submitted || normalizedHasil);

  const answeredCount = useMemo(() => {
    return Object.values(selectedAnswers).filter(Boolean).length;
  }, [selectedAnswers]);

  const allAnswered = soalList.length > 0 && answeredCount === soalList.length;

  const ttdUrl = profile?.ttd_url || getImageSrc(profile?.ttd_path);

  const handleSelectAnswer = (id_soal, id_opsi) => {
    if (alreadySubmitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [id_soal]: id_opsi,
    }));
  };

  const validateSubmit = () => {
    if (alreadySubmitted) {
      alert("FR.IA.05 sudah pernah dikerjakan dan tidak bisa diulang.");
      return false;
    }

    if (soalList.length === 0) {
      alert("Soal FR.IA.05 belum tersedia.");
      return false;
    }

    if (!allAnswered) {
      alert("Semua soal wajib dijawab.");
      return false;
    }

    if (!ttdUrl) {
      alert("TTD asesi belum tersedia. Silakan upload TTD di profile.");
      navigate("/asesi/profile");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmit()) return;

    const ok = window.confirm(
      "Yakin ingin submit FR.IA.05? Jawaban akan dikunci dan tidak bisa diulang."
    );

    if (!ok) return;

    try {
      setSubmitting(true);

      const jawaban = soalList.map((soal) => ({
        id_soal: Number(soal.id_soal),
        id_opsi: Number(selectedAnswers[soal.id_soal]),
      }));

      const submitRes = await api.post("/asesi/fr-ia05/submit", {
        id_peserta: Number(id_peserta),
        id_fr_ia_05: Number(paket.id_fr_ia_05),
        jawaban,
      });

      const hasilSubmit = normalizeHasilFrontend(
        submitRes.data?.data || submitRes.data?.hasil
      );

      setHasil(hasilSubmit);

      alert(
        `FR.IA.05 berhasil disubmit.\nNilai: ${
          hasilSubmit?.nilai ?? "-"
        }\nStatus: ${formatStatus(hasilSubmit?.hasil || hasilSubmit?.status)}`
      );

      try {
        const hasilRes = await api.get(
          `/asesi/fr-ia05/hasil/${paket.id_fr_ia_05}/${id_peserta}`
        );

        setHasil(normalizeHasilFrontend(hasilRes.data?.data));
      } catch (hasilErr) {
        setHasil(hasilSubmit);
      }

      await fetchData();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal submit FR.IA.05."
      );
    } finally {
      setSubmitting(false);
    }
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
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    FR.IA.05 Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Pertanyaan Tertulis
                  <br />
                  <span className="text-orange-500">Pilihan Ganda</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Jawab soal pilihan ganda sesuai paket yang dibuat oleh komite
                  teknis. Jawaban benar tidak ditampilkan dan soal hanya bisa
                  dikerjakan satu kali.
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
                    Status Pengerjaan
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {alreadySubmitted ? "Sudah Dikerjakan" : "Belum Submit"}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {alreadySubmitted
                      ? `Nilai: ${normalizedHasil?.nilai ?? "-"} | Status: ${formatStatus(
                          normalizedHasil?.hasil || normalizedHasil?.status
                        )}`
                      : `${answeredCount} dari ${soalList.length} soal sudah dijawab.`}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Soal" value={`${soalList.length}`} />
                    <HeroPill
                      label={alreadySubmitted ? "Nilai" : "Terjawab"}
                      value={
                        alreadySubmitted
                          ? `${normalizedHasil?.nilai ?? "-"}`
                          : `${answeredCount}/${soalList.length}`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          {!payload ? (
            <EmptyState />
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MiniStat
                  icon={<FileText size={22} />}
                  label="Paket"
                  value={paket.kode_paket || "-"}
                />

                <MiniStat
                  icon={<BadgeCheck size={22} />}
                  label="Passing Grade"
                  value={`${paket.passing_grade || 70}`}
                />

                <MiniStat
                  icon={<ShieldCheck size={22} />}
                  label="TTD Asesi"
                  value={ttdUrl ? "Tersedia" : "Belum Ada"}
                />

                <MiniStat
                  icon={<Trophy size={22} />}
                  label="Hasil"
                  value={formatStatus(normalizedHasil?.hasil || normalizedHasil?.status)}
                />
              </section>

              {alreadySubmitted && <HasilCard hasil={normalizedHasil} />}

              {!ttdUrl && !alreadySubmitted && (
                <InfoAlert message="TTD asesi belum tersedia. Silakan upload TTD di profile sebelum submit." />
              )}

              <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
                <div className="space-y-6">
                  <Card title="Data FR.IA.05" icon={<FileText size={22} />}>
                    <table className="w-full border-collapse border border-slate-200 text-sm">
                      <tbody>
                        <TableRow label="Judul Skema" value={skema.judul_skema} />
                        <TableRow label="Nomor Skema" value={skema.kode_skema} />
                        <TableRow label="TUK" value={tuk.nama_tuk} />
                        <TableRow label="Nama Asesi" value={profile.nama_lengkap} />
                        <TableRow label="NIK Asesi" value={profile.nik} />
                        <TableRow label="Tanggal" value={jadwal.tgl_awal || "-"} />
                        <TableRow label="Waktu" value={jadwal.jam || "-"} />
                      </tbody>
                    </table>
                  </Card>

                  <Card
                    title="Daftar Soal Pilihan Ganda"
                    icon={<ClipboardList size={22} />}
                  >
                    {soalList.length === 0 ? (
                      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <Inbox size={34} className="mx-auto text-slate-300" />
                        <h3 className="mt-4 text-lg font-black text-[#071E3D]">
                          Soal Belum Tersedia
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-slate-400">
                          Komite teknis belum membuat soal FR.IA.05.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {soalList.map((soal, index) => (
                          <SoalCard
                            key={soal.id_soal}
                            soal={soal}
                            index={index}
                            selected={selectedAnswers[soal.id_soal]}
                            disabled={alreadySubmitted}
                            onSelect={handleSelectAnswer}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <aside>
                  <div className="sticky top-6 space-y-6">
                    <Card title="Ringkasan Submit" icon={<Send size={22} />}>
                      <div className="space-y-4">
                        <StatusCard
                          label="Jawaban"
                          desc={
                            alreadySubmitted
                              ? "Jawaban sudah dikunci."
                              : `${answeredCount} dari ${soalList.length} soal terjawab.`
                          }
                          status={alreadySubmitted || allAnswered}
                        />

                        <StatusCard
                          label="TTD Asesi"
                          desc={
                            ttdUrl
                              ? "TTD tersedia dari profile."
                              : "TTD belum tersedia."
                          }
                          status={Boolean(ttdUrl)}
                        />

                        <StatusCard
                          label="Status"
                          desc={
                            alreadySubmitted
                              ? "FR.IA.05 sudah dikerjakan dan terkunci."
                              : "Belum submit."
                          }
                          status={alreadySubmitted}
                        />

                        {ttdUrl && (
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                              TTD Asesi dari Profile
                            </p>

                            <div className="rounded-xl bg-white border border-slate-100 p-4">
                              <img
                                src={ttdUrl}
                                alt="TTD Asesi"
                                className="max-h-24 object-contain"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={
                            !allAnswered || !ttdUrl || submitting || alreadySubmitted
                          }
                          className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                            !allAnswered || !ttdUrl || submitting || alreadySubmitted
                              ? "bg-slate-300 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : alreadySubmitted ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Send size={18} />
                          )}

                          {alreadySubmitted
                            ? "Sudah Dikerjakan"
                            : submitting
                            ? "Mengirim..."
                            : "Submit Jawaban"}
                        </button>
                      </div>
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
          Memuat FR.IA.05
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data soal pilihan ganda.
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

        <p className="text-[#071E3D] font-black mt-1 truncate capitalize">
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
            FR.IA.05 Asesi
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

function SoalCard({ soal, index, selected, disabled, onSelect }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#071E3D] text-sm font-black text-white">
          {index + 1}
        </div>

        <div className="flex-1">
          <p className="text-sm font-black leading-relaxed text-[#071E3D]">
            {soal.pertanyaan || "-"}
          </p>

          {soal.gambar_url && (
            <img
              src={soal.gambar_url}
              alt={`Gambar soal ${index + 1}`}
              className="mt-4 max-h-60 rounded-2xl border border-slate-100 object-contain"
            />
          )}

          <div className="mt-5 space-y-3">
            {(soal.opsi || []).map((opsi) => {
              const checked = Number(selected) === Number(opsi.id_opsi);

              return (
                <label
                  key={opsi.id_opsi}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                    checked
                      ? "border-orange-200 bg-orange-50"
                      : "border-slate-100 bg-white hover:border-orange-100"
                  } ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
                >
                  <input
                    type="radio"
                    name={`soal-${soal.id_soal}`}
                    value={opsi.id_opsi}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onSelect(soal.id_soal, opsi.id_opsi)}
                    className="mt-1 h-4 w-4 accent-orange-500"
                  />

                  <div>
                    <p className="text-sm font-black text-[#071E3D]">
                      {opsi.kode_opsi}. {opsi.jawaban}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HasilCard({ hasil }) {
  const nilai = hasil?.nilai ?? "-";
  const benar = hasil?.jumlah_benar ?? hasil?.benar ?? "-";
  const salah = hasil?.jumlah_salah ?? hasil?.salah ?? "-";
  const status = hasil?.hasil || hasil?.status || "-";

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-emerald-700">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
          <Trophy size={24} />
        </div>

        <div className="w-full">
          <h3 className="text-xl font-black">Hasil FR.IA.05</h3>

          <p className="mt-1 text-sm font-semibold">
            Soal sudah dikerjakan dan tidak bisa diulang.
          </p>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultPill label="Nilai" value={nilai} />
            <ResultPill label="Benar" value={benar} />
            <ResultPill label="Salah" value={salah} />
            <ResultPill label="Status" value={formatStatus(status)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#071E3D] capitalize">
        {value}
      </p>
    </div>
  );
}

function StatusCard({ label, desc, status }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        status
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-slate-50 border-slate-100 text-slate-500"
      }`}
    >
      <div className="flex items-start gap-3">
        {status ? (
          <CheckCircle size={20} className="shrink-0 mt-0.5" />
        ) : (
          <XCircle size={20} className="shrink-0 mt-0.5" />
        )}

        <div>
          <p className="font-black">{label}</p>
          <p className="text-xs font-semibold mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function InfoAlert({ message }) {
  return (
    <div className="rounded-[24px] border border-amber-100 bg-amber-50 px-5 py-5 text-amber-700 flex items-start gap-3">
      <AlertCircle size={22} className="shrink-0 mt-0.5" />

      <div>
        <p className="font-black">{message}</p>
      </div>
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
        Data FR.IA.05 Tidak Ada
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Paket soal belum dibuat oleh komite teknis atau data peserta tidak cocok
        dengan jadwal.
      </p>
    </div>
  );
}

/* =========================
HELPER FRONTEND
========================= */

function normalizeHasilFrontend(data) {
  if (!data) return null;

  return {
    id_penilaian: data.id_penilaian || null,
    id_peserta: data.id_peserta || null,
    id_fr_ia_05: data.id_fr_ia_05 || null,
    jumlah_benar: Number(data.jumlah_benar ?? data.benar ?? 0),
    jumlah_salah: Number(data.jumlah_salah ?? data.salah ?? 0),
    nilai: Number(data.nilai ?? 0),
    hasil: data.hasil || data.status || "-",
    status: data.status || data.hasil || "-",
    tanggal_penilaian: data.tanggal_penilaian || null,
  };
}

function formatStatus(status) {
  if (!status || status === "-") return "-";

  return String(status).replace("_", " ");
}