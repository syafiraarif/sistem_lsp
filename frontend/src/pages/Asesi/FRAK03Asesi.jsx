// frontend/src/pages/asesi/FRAK03Asesi.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  Save,
  ShieldAlert,
  Sparkles,
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

export default function FRAK03Asesi() {
  const navigate = useNavigate();
  const { id_peserta } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(null);
  const [jawaban, setJawaban] = useState([]);
  const [catatanLainnya, setCatatanLainnya] = useState("");
  const [error, setError] = useState("");

  const fetchForm = async () => {
    try {
      setError("");

      if (!id_peserta) {
        throw new Error("ID peserta tidak ditemukan di URL.");
      }

      const res = await api.get(`/asesi/fr-ak03/form?id_peserta=${id_peserta}`);
      const data = res.data?.data || null;

      if (!data) {
        throw new Error("Data form FR.AK.03 tidak tersedia.");
      }

      setFormData(data);

      if (data.existing) {
        const existingDetail = Array.isArray(data.existing.detailAk03)
          ? data.existing.detailAk03
          : [];

        setJawaban(
          data.questions.map((q, index) => {
            const found = existingDetail.find(
              (item) => item.kode_pertanyaan === q.kode_pertanyaan
            );

            return {
              kode_pertanyaan: q.kode_pertanyaan,
              pertanyaan: q.pertanyaan,
              jawaban: found?.jawaban || "",
              catatan: found?.catatan || "",
            };
          })
        );

        setCatatanLainnya(data.existing.catatan_lainnya || "");
      } else {
        setJawaban(
          data.questions.map((q) => ({
            kode_pertanyaan: q.kode_pertanyaan,
            pertanyaan: q.pertanyaan,
            jawaban: "",
            catatan: "",
          }))
        );

        setCatatanLainnya("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal mengambil form FR.AK.03."
      );

      setFormData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_peserta]);

  const isSubmitted = Boolean(formData?.is_submitted || formData?.existing);
  const canSubmit = Boolean(formData?.can_submit) && !isSubmitted;

  const answeredCount = useMemo(() => {
    return jawaban.filter((item) => item.jawaban === "ya" || item.jawaban === "tidak")
      .length;
  }, [jawaban]);

  const allAnswered = jawaban.length > 0 && answeredCount === jawaban.length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchForm();
  };

  const handleChangeJawaban = (index, value) => {
    if (isSubmitted) return;

    setJawaban((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              jawaban: value,
            }
          : item
      )
    );
  };

  const handleChangeCatatan = (index, value) => {
    if (isSubmitted) return;

    setJawaban((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              catatan: value,
            }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (isSubmitted) {
      alert("FR.AK.03 sudah pernah diisi.");
      return;
    }

    if (!allAnswered) {
      alert("Semua pertanyaan wajib dijawab Ya atau Tidak.");
      return;
    }

    const ok = window.confirm(
      "Yakin ingin menyimpan FR.AK.03? Data yang sudah disimpan tidak bisa dikirim ulang."
    );

    if (!ok) return;

    try {
      setSubmitting(true);

      await api.post("/asesi/fr-ak03", {
        id_peserta: Number(id_peserta),
        jawaban: jawaban.map((item) => ({
          kode_pertanyaan: item.kode_pertanyaan,
          jawaban: item.jawaban,
          catatan: item.catatan || "",
        })),
        catatan_lainnya: catatanLainnya || "",
      });

      alert("FR.AK.03 berhasil disimpan.");
      await fetchForm();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal menyimpan FR.AK.03."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/asesi/fr-ak03/pdf/${id_peserta}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-AK-03-${id_peserta}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengunduh PDF FR.AK.03."
      );
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
                  <ClipboardCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    FR.AK.03 Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Umpan Balik
                  <br />
                  <span className="text-orange-500">dan Catatan Asesmen</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Form ini hanya dapat diisi ketika hasil akhir asesmen adalah
                  Belum Kompeten. Jawab seluruh pertanyaan berdasarkan
                  pengalaman proses asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/asesi/hasil-akhir/${id_peserta}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Hasil Akhir
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
                    Status Pengisian
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {isSubmitted ? "Sudah Diisi" : "Belum Submit"}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {isSubmitted
                      ? "FR.AK.03 sudah tersimpan dan dapat diunduh sebagai PDF."
                      : `${answeredCount} dari ${jawaban.length} pertanyaan sudah dijawab.`}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Pertanyaan" value={`${jawaban.length}`} />
                    <HeroPill
                      label={isSubmitted ? "Status" : "Terjawab"}
                      value={
                        isSubmitted
                          ? "Tersimpan"
                          : `${answeredCount}/${jawaban.length}`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          {!formData ? (
            <EmptyState />
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MiniStat
                  icon={<UserCheck size={22} />}
                  label="Asesi"
                  value={formData.nama_asesi || "-"}
                />

                <MiniStat
                  icon={<FileText size={22} />}
                  label="Skema"
                  value={formData.skema?.judul_skema || "-"}
                />

                <MiniStat
                  icon={<BadgeCheck size={22} />}
                  label="Status"
                  value={isSubmitted ? "Sudah Diisi" : "Belum Submit"}
                />

                <MiniStat
                  icon={<ShieldAlert size={22} />}
                  label="Hasil Akhir"
                  value="Belum Kompeten"
                />
              </section>

              {isSubmitted && (
                <section className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-emerald-700">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
                      <CheckCircle size={24} />
                    </div>

                    <div>
                      <h3 className="text-xl font-black">
                        FR.AK.03 Sudah Tersimpan
                      </h3>

                      <p className="mt-1 text-sm font-semibold leading-relaxed">
                        Data sudah tersimpan. Anda dapat mengunduh PDF atau
                        kembali ke halaman hasil akhir.
                      </p>

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="mt-4 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D] transition-all"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
                <div className="space-y-6">
                  <Card title="Data FR.AK.03" icon={<FileText size={22} />}>
                    <table className="w-full border-collapse border border-slate-200 text-sm">
                      <tbody>
                        <TableRow label="Nama Asesi" value={formData.nama_asesi} />
                        <TableRow label="NIK" value={formData.nik} />
                        <TableRow
                          label="Judul Skema"
                          value={formData.skema?.judul_skema}
                        />
                        <TableRow
                          label="Kode Skema"
                          value={formData.skema?.kode_skema}
                        />
                        <TableRow label="TUK" value={formData.tuk?.nama_tuk} />
                        <TableRow
                          label="Tanggal Asesmen"
                          value={formData.jadwal?.tgl_akhir || formData.jadwal?.tgl_awal}
                        />
                      </tbody>
                    </table>
                  </Card>

                  <Card title="Pertanyaan Umpan Balik" icon={<ClipboardCheck size={22} />}>
                    <div className="space-y-5">
                      {jawaban.map((item, index) => (
                        <QuestionCard
                          key={item.kode_pertanyaan || index}
                          item={item}
                          index={index}
                          disabled={isSubmitted}
                          onChangeJawaban={(value) =>
                            handleChangeJawaban(index, value)
                          }
                          onChangeCatatan={(value) =>
                            handleChangeCatatan(index, value)
                          }
                        />
                      ))}
                    </div>
                  </Card>

                  <Card title="Catatan Lainnya" icon={<FileText size={22} />}>
                    <textarea
                      value={catatanLainnya}
                      disabled={isSubmitted}
                      onChange={(e) => setCatatanLainnya(e.target.value)}
                      rows={5}
                      placeholder="Tuliskan catatan tambahan jika ada..."
                      className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </Card>
                </div>

                <aside>
                  <div className="sticky top-6 space-y-6">
                    <Card title="Ringkasan Submit" icon={<Save size={22} />}>
                      <div className="space-y-4">
                        <StatusCard
                          label="Akses Form"
                          desc="Hasil akhir asesi adalah Belum Kompeten."
                          status
                        />

                        <StatusCard
                          label="Jawaban"
                          desc={`${answeredCount} dari ${jawaban.length} pertanyaan sudah dijawab.`}
                          status={allAnswered}
                        />

                        <StatusCard
                          label="Status"
                          desc={
                            isSubmitted
                              ? "FR.AK.03 sudah tersimpan."
                              : "Belum submit."
                          }
                          status={isSubmitted}
                        />

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canSubmit || !allAnswered || submitting}
                          className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                            !canSubmit || !allAnswered || submitting
                              ? "bg-slate-300 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : isSubmitted ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Save size={18} />
                          )}

                          {isSubmitted
                            ? "Sudah Tersimpan"
                            : submitting
                            ? "Menyimpan..."
                            : "Submit FR.AK.03"}
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
          Memuat FR.AK.03
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data form umpan balik asesmen.
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
            FR.AK.03 Asesi
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

function QuestionCard({
  item,
  index,
  disabled,
  onChangeJawaban,
  onChangeCatatan,
}) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#071E3D] text-sm font-black text-white">
          {index + 1}
        </div>

        <div className="flex-1">
          <p className="text-sm font-black leading-relaxed text-[#071E3D]">
            {item.pertanyaan || "-"}
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                item.jawaban === "ya"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-white hover:border-emerald-100"
              } ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
            >
              <input
                type="radio"
                name={`pertanyaan-${index}`}
                value="ya"
                checked={item.jawaban === "ya"}
                disabled={disabled}
                onChange={() => onChangeJawaban("ya")}
                className="h-4 w-4 accent-emerald-500"
              />

              <span className="text-sm font-black text-[#071E3D]">Ya</span>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                item.jawaban === "tidak"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-100 bg-white hover:border-red-100"
              } ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
            >
              <input
                type="radio"
                name={`pertanyaan-${index}`}
                value="tidak"
                checked={item.jawaban === "tidak"}
                disabled={disabled}
                onChange={() => onChangeJawaban("tidak")}
                className="h-4 w-4 accent-red-500"
              />

              <span className="text-sm font-black text-[#071E3D]">Tidak</span>
            </label>
          </div>

          <textarea
            value={item.catatan || ""}
            disabled={disabled}
            onChange={(e) => onChangeCatatan(e.target.value)}
            rows={3}
            placeholder="Catatan untuk pertanyaan ini jika ada..."
            className="mt-4 w-full resize-none rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      </div>
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
        Form FR.AK.03 Tidak Tersedia
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Form ini hanya tersedia jika hasil akhir asesmen adalah Belum Kompeten.
      </p>
    </div>
  );
}