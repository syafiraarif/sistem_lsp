import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertTriangle,
  Send,
  Loader2,
  ClipboardList,
  Calendar,
  BookOpen,
  MonitorCheck,
  Inbox,
  ShieldCheck,
  MessageSquareText,
  ChevronRight,
  RefreshCcw,
  BadgeCheck,
  XCircle,
  FileText,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

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

export default function Banding() {
  const navigate = useNavigate();

  const [isiBanding, setIsiBanding] =
    useState("");

  const [riwayatBanding, setRiwayatBanding] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    fetchBanding();
  }, []);

  const fetchBanding = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res =
        await api.get(
          "/asesi/banding-saya"
        );

      setRiwayatBanding(
        Array.isArray(
          res.data?.data
        )
          ? res.data.data
          : []
      );
    } catch (err) {
      console.error(
        "Error fetchBanding:",
        err
      );

      const message =
        err.response?.data
          ?.message ||
        err.response?.data
          ?.error ||
        "Gagal memuat data banding.";

      await notifikasi.peringatan(
        "Data Banding",
        message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh =
    async () => {
      if (refreshing) {
        return;
      }

      setRefreshing(true);
      await fetchBanding();
    };

  const submitBanding = async (
    e
  ) => {
    e.preventDefault();

    const isi =
      isiBanding.trim();

    if (!isi) {
      await notifikasi.peringatan(
        "Banding Belum Diisi",
        "Silakan tuliskan alasan banding terlebih dahulu."
      );
      return;
    }

    if (isi.length < 10) {
      await notifikasi.peringatan(
        "Alasan Banding Terlalu Singkat",
        "Tuliskan alasan banding dengan lebih jelas dan lengkap."
      );
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await api.post(
        "/asesi/banding",
        {
          isi_banding: isi,
        }
      );

      setIsiBanding("");

      await notifikasi.sukses(
        "Berhasil",
        "Banding berhasil diajukan."
      );

      await fetchBanding();
    } catch (err) {
      console.error(
        "Error submitBanding:",
        err
      );

      const message =
        err.response?.data
          ?.message ||
        err.response?.data
          ?.error ||
        "Terjadi kesalahan server.";

      await notifikasi.gagal(
        "Gagal Mengajukan Banding",
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalBanding =
    riwayatBanding.length;

  const bandingTerakhir =
    useMemo(() => {
      if (
        !Array.isArray(
          riwayatBanding
        ) ||
        riwayatBanding.length ===
          0
      ) {
        return "-";
      }

      const latest = [
        ...riwayatBanding,
      ].sort((a, b) => {
        const dateA =
          new Date(
            a.tanggal_ajukan ||
              a.createdAt ||
              a.created_at ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.tanggal_ajukan ||
              b.createdAt ||
              b.created_at ||
              0
          ).getTime();

        return (
          dateB - dateA
        );
      })[0];

      return formatDate(
        latest?.tanggal_ajukan ||
          latest?.createdAt ||
          latest?.created_at
      );
    }, [
      riwayatBanding,
    ]);

  const scrollToForm = () => {
    document
      .getElementById(
        "form-banding"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 transition-all duration-300 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#CC6B27]" />

                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Pengajuan{" "}
                    <span className="text-[#CC6B27]">
                      Banding
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Ajukan banding terkait proses
                    asesmen atau hasil uji kompetensi
                    melalui formulir yang tersedia.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D]"
                  >
                    <MessageSquareText
                      size={15}
                    />
                    Tulis Banding
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {refreshing ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={15}
                      />
                    )}
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <MiniStat
                icon={
                  <ClipboardList
                    size={22}
                  />
                }
                label="Total Banding"
                value={`${totalBanding} Pengajuan`}
              />

              <MiniStat
                icon={
                  <Calendar
                    size={22}
                  />
                }
                label="Banding Terakhir"
                value={bandingTerakhir}
              />

              <MiniStat
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                label="Status Fitur"
                value="Tersedia"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <AlertTriangle
                  size={17}
                  className="text-[#CC6B27]"
                />
                Informasi Pengajuan Banding
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <InfoCard
                icon={
                  <FileText
                    size={18}
                  />
                }
                title="Isi Banding"
                text="Sampaikan alasan banding secara jelas, singkat, dan sesuai kondisi sebenarnya."
              />

              <InfoCard
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                title="Pengajuan"
                text="Pastikan alasan yang disampaikan berkaitan dengan proses atau hasil asesmen."
              />

              <InfoCard
                icon={
                  <ClipboardList
                    size={18}
                  />
                }
                title="Riwayat"
                text="Setiap pengajuan banding yang berhasil akan tercatat pada riwayat banding Anda."
              />
            </div>
          </section>

          <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[430px_1fr]">
            <div
              id="form-banding"
              className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm xl:sticky xl:top-6"
            >
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
                    <MessageSquareText
                      size={20}
                    />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-black text-white">
                      Form Banding
                    </h2>

                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Ajukan keberatan
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={
                  submitBanding
                }
                className="space-y-5 p-5 md:p-6"
              >
                <div>
                  <label
                    htmlFor="isi-banding"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60"
                  >
                    Alasan Banding
                  </label>

                  <textarea
                    id="isi-banding"
                    value={
                      isiBanding
                    }
                    onChange={(
                      e
                    ) =>
                      setIsiBanding(
                        e.target.value
                      )
                    }
                    placeholder="Tulis alasan banding Anda secara jelas..."
                    rows={9}
                    disabled={
                      submitting
                    }
                    className="w-full resize-none rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] px-4 py-3.5 text-[13px] font-medium leading-6 text-[#071E3D] outline-none transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] font-medium leading-5 text-[#182D4A]/55">
                      Gunakan bahasa yang jelas,
                      singkat, dan sopan.
                    </p>

                    <span className="text-[10px] font-bold text-[#182D4A]/40">
                      {isiBanding.length} karakter
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-[#CC6B27]/15 bg-[#CC6B27]/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                      <AlertTriangle
                        size={16}
                      />
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-[#071E3D]">
                        Catatan Pengajuan
                      </p>

                      <p className="mt-1 text-[11px] font-medium leading-5 text-[#182D4A]/65">
                        Pastikan alasan banding
                        sesuai dengan kondisi
                        sebenarnya sebelum
                        mengirimkan pengajuan.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-[#CC6B27]/50"
                >
                  {submitting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={16}
                    />
                  )}

                  {submitting
                    ? "Mengirim..."
                    : "Ajukan Banding"}

                  {!submitting && (
                    <ChevronRight
                      size={16}
                    />
                  )}
                </button>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
                      <ClipboardList
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="text-[15px] font-black text-white">
                        Riwayat Banding Saya
                      </h2>

                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                        Data pengajuan
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {refreshing ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={14}
                      />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="p-5 md:p-6">
                {loading ? (
                  <LoadingHistory />
                ) : riwayatBanding.length ===
                  0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {riwayatBanding.map(
                      (
                        item,
                        index
                      ) => (
                        <BandingItem
                          key={
                            item.id_banding ||
                            item.id ||
                            index
                          }
                          item={item}
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function BandingItem({
  item,
  index,
}) {
  const tanggal =
    item.tanggal_ajukan ||
    item.createdAt ||
    item.created_at;

  const status =
    item.status_banding ||
    item.status ||
    "";

  const isSuccessStatus = [
    "selesai",
    "diterima",
    "disetujui",
    "approved",
  ].includes(
    String(status).toLowerCase()
  );

  const isRejectedStatus = [
    "ditolak",
    "rejected",
  ].includes(
    String(status).toLowerCase()
  );

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white">
      <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            <AlertTriangle
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#071E3D]/10 bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#182D4A]/60">
                <Calendar
                  size={12}
                />
                {formatDate(
                  tanggal
                )}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CC6B27]/15 bg-[#CC6B27]/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#CC6B27]">
                <FileText
                  size={12}
                />
                Banding #
                {index + 1}
              </span>

              {item.jadwal
                ?.pelaksanaan_uji && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#071E3D]/10 bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#182D4A]/60">
                  <MonitorCheck
                    size={12}
                  />
                  {
                    item
                      .jadwal
                      .pelaksanaan_uji
                  }
                </span>
              )}

              {status && (
                <StatusBadge
                  status={
                    status
                  }
                  isSuccess={
                    isSuccessStatus
                  }
                  isRejected={
                    isRejectedStatus
                  }
                />
              )}
            </div>

            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/45">
              Isi Banding
            </p>

            <p className="mt-1 text-[14px] font-bold leading-6 text-[#071E3D]">
              {item.isi_banding ||
                "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 md:p-5">
        <InfoBox
          label="Skema"
          icon={
            <BookOpen
              size={15}
            />
          }
        >
          {item.skema
            ?.judul_skema ||
            item.skema
              ?.nama_skema ||
            item.judul_skema ||
            "-"}
        </InfoBox>

        <InfoBox
          label="Jadwal"
          icon={
            <MonitorCheck
              size={15}
            />
          }
        >
          {item.jadwal
            ?.pelaksanaan_uji ||
            item.jadwal
              ?.nama_jadwal ||
            item.pelaksanaan_uji ||
            "-"}
        </InfoBox>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  isSuccess,
  isRejected,
}) {
  let className =
    "border-amber-200 bg-amber-50 text-amber-600";

  if (isSuccess) {
    className =
      "border-green-200 bg-green-50 text-green-600";
  }

  if (isRejected) {
    className =
      "border-red-200 bg-red-50 text-red-600";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider ${className}`}
    >
      {isSuccess ? (
        <BadgeCheck
          size={12}
        />
      ) : isRejected ? (
        <XCircle
          size={12}
        />
      ) : (
        <ShieldCheck
          size={12}
        />
      )}
      {status}
    </span>
  );
}

function InfoBox({
  label,
  icon,
  children,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="mb-2 flex items-center gap-2 text-[#182D4A]/50">
        {icon}

        <p className="text-[9px] font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className="text-[12px] font-bold leading-5 text-[#071E3D]">
        {children}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-bold text-[#071E3D]">
          {title}
        </p>

        <p className="mt-1 text-[10px] font-medium leading-5 text-[#182D4A]/60">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p className="mt-1 truncate text-[17px] font-black text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}

function LoadingHistory() {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <Loader2
          size={24}
          className="animate-spin"
        />
      </div>

      <h3 className="text-[15px] font-bold text-[#071E3D]">
        Memuat Riwayat Banding
      </h3>

      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/55">
        Sistem sedang mengambil data pengajuan Anda.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-[#071E3D]/20">
        <Inbox
          size={30}
        />
      </div>

      <h3 className="text-[16px] font-black text-[#071E3D]">
        Belum Ada Banding
      </h3>

      <p className="mx-auto mt-1 max-w-md text-[11px] font-medium leading-5 text-[#182D4A]/55">
        Anda belum pernah mengajukan
        banding. Pengajuan yang berhasil
        akan tampil di bagian ini.
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}