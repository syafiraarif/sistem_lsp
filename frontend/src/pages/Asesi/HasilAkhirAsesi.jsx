import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  XCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE
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
  const location = useLocation();
  const { id_peserta } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [data, setData] = useState(null);
  const [dokumen, setDokumen] = useState([]);
  const [frAk03Exists, setFrAk03Exists] = useState(false);
  const [frAk04Exists, setFrAk04Exists] = useState(false);
  const [error, setError] = useState("");
  const [errorDokumen, setErrorDokumen] = useState("");

  const fetchFrAkStatus = async (pesertaId) => {
    if (!pesertaId) {
      setFrAk03Exists(false);
      setFrAk04Exists(false);
      return;
    }

    const [frAk03Result, frAk04Result] = await Promise.allSettled([
      api.get(`/asesi/fr-ak03/${pesertaId}`),
      api.get(`/asesi/fr-ak04/${pesertaId}`)
    ]);

    const frAk03Data =
      frAk03Result.status === "fulfilled"
        ? frAk03Result.value?.data?.data
        : null;

    const frAk04Data =
      frAk04Result.status === "fulfilled"
        ? frAk04Result.value?.data?.data
        : null;

    setFrAk03Exists(
      Boolean(
        frAk03Data?.is_submitted ||
        frAk03Data?.id_fr_ak03
      )
    );

    setFrAk04Exists(
      Boolean(
        frAk04Data?.is_submitted ||
        frAk04Data?.id_fr_ak04
      )
    );
  };

  const fetchDokumen = async (pesertaId) => {
    try {
      setErrorDokumen("");

      const res = await api.get(
        `/asesi/hasil-saya/dokumen/${pesertaId}`
      );

      setDokumen(
        res.data?.data?.documents || []
      );
    } catch (err) {
      console.error(
        "GET DOKUMEN:",
        err
      );

      setDokumen([]);

      setErrorDokumen(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Daftar dokumen belum dapat dimuat."
      );
    }
  };

  const fetchHasil = async () => {
    try {
      setError("");

      const query = id_peserta
        ? `?id_peserta=${id_peserta}`
        : "";

      const res = await api.get(
        `/asesi/hasil-saya/detail${query}`
      );

      const result =
        res.data?.data || null;

      setData(result);

      const pesertaId =
        result?.id_peserta ||
        id_peserta;

      if (pesertaId) {
        await Promise.all([
          fetchDokumen(pesertaId),
          fetchFrAkStatus(pesertaId)
        ]);
      } else {
        setDokumen([]);
        setFrAk03Exists(false);
        setFrAk04Exists(false);
      }
    } catch (err) {
      console.error(
        "GET HASIL AKHIR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengambil hasil akhir asesmen."
      );

      setData(
        err.response?.data?.data ||
          null
      );

      setDokumen([]);
      setFrAk03Exists(false);
      setFrAk04Exists(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHasil();
  }, [id_peserta, location.key]);

  useEffect(() => {
    const handleFocus = () => {
      if (!loading) {
        fetchHasil();
      }
    };

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        !loading
      ) {
        fetchHasil();
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loading, id_peserta]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHasil();
  };

  const status = normalizeStatus(
    data?.status_asesmen ||
      data?.hasil
  );

  const isKompeten =
    status === "kompeten";

  const isBelumKompeten =
    status === "belum_kompeten";

  const belumTersedia =
    status === "belum_tersedia";

  const kelengkapan =
    data?.kelengkapan || {};

  const kelengkapanData =
    kelengkapan?.data || {};

  const nilaiAkhir = useMemo(() => {
    return (
      data?.nilai_akhir ??
      kelengkapanData?.fria05?.nilai ??
      "-"
    );
  }, [
    data,
    kelengkapanData
  ]);

  const getDocument = (key) => {
    return dokumen.find(
      (item) => item.key === key
    );
  };

  const getFrAkDocument = (key) => {
    const pesertaId =
      data?.id_peserta ||
      id_peserta;

    if (!pesertaId) {
      return null;
    }

    if (
      key === "frak03" &&
      !frAk03Exists
    ) {
      return null;
    }

    if (
      key === "frak04" &&
      !frAk04Exists
    ) {
      return null;
    }

    return {
      key,
      label:
        key === "frak03"
          ? "FR.AK.03"
          : "FR.AK.04",
      available: true,
      endpoint:
        key === "frak03"
          ? `/asesi/fr-ak03/pdf/${pesertaId}`
          : `/asesi/fr-ak04/pdf/${pesertaId}`
    };
  };

  const handleGoFrAk03 = () => {
    const pesertaId =
      data?.id_peserta ||
      id_peserta;

    if (!pesertaId) {
      alert(
        "ID peserta tidak ditemukan."
      );
      return;
    }

    navigate(
      `/asesi/fr-ak03/${pesertaId}`
    );
  };

  const handleGoFrAk04 = () => {
    const pesertaId =
      data?.id_peserta ||
      id_peserta;

    if (!pesertaId) {
      alert(
        "ID peserta tidak ditemukan."
      );
      return;
    }

    navigate(
      `/asesi/fr-ak04/${pesertaId}`
    );
  };

  const handleViewPdf = async (
    documentData
  ) => {
    if (!documentData?.endpoint) {
      alert(
        "Dokumen belum tersedia."
      );
      return;
    }

    try {
      setDownloading(
        `view-${documentData.key}`
      );

      const res = await api.get(
        documentData.endpoint,
        {
          responseType: "blob"
        }
      );

      const blob =
        new Blob(
          [res.data],
          {
            type: "application/pdf"
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const popup =
        window.open(
          url,
          "_blank"
        );

      if (popup) {
        popup.focus();
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (err) {
      console.error(
        "VIEW PDF:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal membuka PDF."
      );
    } finally {
      setDownloading("");
    }
  };

  const handleDownloadPdf = async (
    documentData
  ) => {
    if (!documentData?.endpoint) {
      alert(
        "Dokumen belum tersedia."
      );
      return;
    }

    try {
      setDownloading(
        documentData.key
      );

      const res = await api.get(
        documentData.endpoint,
        {
          responseType: "blob"
        }
      );

      const blob =
        new Blob(
          [res.data],
          {
            type: "application/pdf"
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `${documentData.label.replaceAll(".", "-")}-${data?.id_peserta || "dokumen"}.pdf`
      );

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 1000);
    } catch (err) {
      console.error(
        "DOWNLOAD PDF:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengunduh PDF."
      );
    } finally {
      setDownloading("");
    }
  };

  const dokumenUtama = [
    {
      key: "presensi",
      label: "Presensi",
      description:
        "Dokumen presensi asesmen"
    },
    {
      key: "apl01",
      label: "APL.01",
      description:
        "Formulir permohonan sertifikasi"
    },
    {
      key: "apl02",
      label: "APL.02",
      description:
        "Asesmen mandiri"
    },
    {
      key: "fria01",
      label: "FR.IA.01",
      description:
        "Form penilaian asesmen"
    },
    {
      key: "fria02",
      label: "FR.IA.02",
      description:
        "Form tugas praktik demonstrasi"
    },
    {
      key: "fria03",
      label: "FR.IA.03",
      description:
        "Form pertanyaan untuk observasi"
    },
    {
      key: "fria05",
      label: "FR.IA.05",
      description:
        "Form penilaian kompetensi"
    },
    {
      key: "frak01",
      label: "FR.AK.01",
      description:
        "Persetujuan asesmen dan kerahasiaan"
    },
    {
      key: "frak02",
      label: "FR.AK.02",
      description:
        "Form rekaman asesmen"
    },
    {
      key: "frak05",
      label: "FR.AK.05",
      description:
        "Form umpan balik asesmen"
    },
    {
      key: "frak06",
      label: "FR.AK.06",
      description:
        "Form laporan asesmen"
    },
    {
      key: "frak07",
      label: "FR.AK.07",
      description:
        "Form sertifikasi kompetensi"
    }
  ];

  const dokumenTindakLanjut = [
    {
      key: "frak03",
      label: "FR.AK.03",
      description:
        "Form umpan balik dan catatan asesmen"
    },
    {
      key: "frak04",
      label: "FR.AK.04",
      description:
        "Form permohonan banding asesmen"
    }
  ];

  const dokumenHasil =
    isBelumKompeten
      ? [
          ...dokumenUtama,
          ...dokumenTindakLanjut
        ]
      : dokumenUtama;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi
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
                  <Trophy
                    size={15}
                    className="text-orange-500"
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Hasil Akhir Asesmen
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Hasil Akhir
                  <br />
                  <span className="text-orange-500">
                    Sertifikasi Anda
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Lihat keputusan akhir asesor dan cek kelengkapan dokumen. Semua dokumen yang sudah tersedia dapat dilihat atau diunduh dalam bentuk PDF.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/asesi/jadwal-saya"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Jadwal Saya
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {refreshing ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={17}
                      />
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
                    {formatStatus(
                      status
                    )}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {isBelumKompeten
                      ? "Asesi dapat melanjutkan dengan FR.AK.03 dan FR.AK.04."
                      : isKompeten
                      ? "Selamat, Anda dinyatakan kompeten."
                      : "Hasil akhir belum tersedia dari asesor."}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill
                      label="Nilai"
                      value={`${nilaiAkhir}`}
                    />

                    <HeroPill
                      label="Status"
                      value={formatStatus(
                        status
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <ErrorAlert
              message={error}
              onRetry={handleRefresh}
            />
          )}

          {!data || belumTersedia ? (
            <EmptyState />
          ) : (
            <>
              <section className="w-full">
                <Card
                  title="Detail Hasil Akhir"
                  icon={
                    <Trophy size={22} />
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-sm">
                      <tbody>
                        <TableRow
                          label="Nama Asesi"
                          value={
                            data.nama_asesi
                          }
                        />

                        <TableRow
                          label="NIK"
                          value={data.nik}
                        />

                        <TableRow
                          label="Judul Skema"
                          value={
                            data.skema?.judul_skema
                          }
                        />

                        <TableRow
                          label="Kode Skema"
                          value={
                            data.skema?.kode_skema
                          }
                        />

                        <TableRow
                          label="TUK"
                          value={
                            data.tuk?.nama_tuk
                          }
                        />

                        <TableRow
                          label="Jadwal"
                          value={
                            data.jadwal?.nama_kegiatan
                          }
                        />

                        <TableRow
                          label="Tanggal"
                          value={
                            data.jadwal?.tgl_awal
                          }
                        />

                        <TableRow
                          label="Nilai Akhir"
                          value={nilaiAkhir}
                        />

                        <TableRow
                          label="Status"
                          value={formatStatus(
                            status
                          )}
                        />

                        <TableRow
                          label="Catatan Asesor"
                          value={
                            data.catatan_asesor ||
                            data.keterangan ||
                            "-"
                          }
                        />
                      </tbody>
                    </table>
                  </div>
                </Card>
              </section>

              <section className="w-full">
                <Card
                  title="Kelengkapan Dokumen"
                  icon={
                    <FileText size={22} />
                  }
                >
                  <div className="space-y-5">
                    {errorDokumen && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                        {errorDokumen}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {dokumenHasil.map(
                        (item) => {
                          let documentData =
                            null;

                          if (
                            item.key === "frak03" ||
                            item.key === "frak04"
                          ) {
                            documentData =
                              getFrAkDocument(
                                item.key
                              );
                          } else {
                            documentData =
                              getDocument(
                                item.key
                              );
                          }

                          const isFollowUp =
                            isBelumKompeten &&
                            (
                              item.key === "frak03" ||
                              item.key === "frak04"
                            );

                          const available =
                            isFollowUp
                              ? item.key ===
                                "frak03"
                                ? frAk03Exists
                                : frAk04Exists
                              : Boolean(
                                  documentData?.available
                                );

                          return (
                            <DocumentCard
                              key={item.key}
                              label={
                                item.label
                              }
                              description={
                                item.description
                              }
                              active={
                                available
                              }
                              followUp={
                                isFollowUp
                              }
                              loadingView={
                                downloading ===
                                `view-${item.key}`
                              }
                              loadingDownload={
                                downloading ===
                                item.key
                              }
                              onView={() =>
                                handleViewPdf(
                                  documentData
                                )
                              }
                              onDownload={() =>
                                handleDownloadPdf(
                                  documentData
                                )
                              }
                              onOpen={() => {
                                if (
                                  item.key ===
                                  "frak03"
                                ) {
                                  handleGoFrAk03();
                                }

                                if (
                                  item.key ===
                                  "frak04"
                                ) {
                                  handleGoFrAk04();
                                }
                              }}
                            />
                          );
                        }
                      )}
                    </div>

                    {isKompeten && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <div>
                            <p className="font-black text-emerald-700">
                              Dokumen hasil kompetensi
                            </p>

                            <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-700">
                              Seluruh dokumen hasil yang tersedia dapat dilihat dan diunduh melalui tombol pada masing-masing dokumen.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isBelumKompeten && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldAlert
                            size={20}
                            className="mt-0.5 shrink-0 text-amber-600"
                          />

                          <div>
                            <p className="font-black text-amber-700">
                              Tindak lanjut asesmen
                            </p>

                            <p className="mt-1 text-sm font-semibold leading-relaxed text-amber-700">
                              {frAk03Exists &&
                              frAk04Exists
                                ? "FR.AK.03 dan FR.AK.04 sudah diisi dan dapat dilihat atau diunduh."
                                : frAk03Exists
                                ? "FR.AK.03 sudah diisi. FR.AK.04 masih dapat dilengkapi."
                                : frAk04Exists
                                ? "FR.AK.04 sudah diisi. FR.AK.03 masih dapat dilengkapi."
                                : "FR.AK.03 dan FR.AK.04 tersedia untuk diisi karena hasil asesmen Anda adalah Belum Kompeten."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentCard({
  label,
  description,
  active,
  followUp,
  loadingView,
  loadingDownload,
  onView,
  onDownload,
  onOpen
}) {
  if (
    followUp &&
    !active
  ) {
    return (
      <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4 transition-all hover:border-orange-200 hover:shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500">
            <ShieldAlert size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-black text-amber-700">
              {label}
            </p>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700">
              Belum diisi. Silakan lengkapi form.
            </p>

            <button
              type="button"
              onClick={onOpen}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D]"
            >
              <FileText size={14} />
              Isi {label}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[22px] border p-4 transition-all ${
        active
          ? "border-emerald-100 bg-emerald-50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ${
            active
              ? "text-emerald-600"
              : "text-slate-400"
          }`}
        >
          {active ? (
            <CheckCircle size={19} />
          ) : (
            <XCircle size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-black ${
              active
                ? "text-emerald-700"
                : "text-slate-500"
            }`}
          >
            {label}
          </p>

          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
            {active
              ? description
              : "Dokumen belum tersedia."}
          </p>

          {active ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onView}
                disabled={loadingView}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071E3D] px-2 py-3 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loadingView ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Eye size={13} />
                )}
                Lihat
              </button>

              <button
                type="button"
                onClick={onDownload}
                disabled={loadingDownload}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-[9px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loadingDownload ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Download size={13} />
                )}
                Download
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <FileText size={12} />
                Belum tersedia
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children
}) {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">
            {title}
          </h2>

          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Hasil Akhir Asesi
          </p>
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

function TableRow({
  label,
  value
}) {
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

function HeroPill({
  label,
  value
}) {
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

function ErrorAlert({
  message,
  onRetry
}) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-5 text-red-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle
          size={22}
          className="shrink-0 mt-0.5"
        />

        <div>
          <p className="font-black">
            Gagal Memuat Data
          </p>

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
          Memuat Hasil Akhir
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil keputusan akhir asesmen.
        </p>
      </div>
    </div>
  );
}

function normalizeStatus(status) {
  const value = String(
    status || ""
  )
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

  return "belum_tersedia";
}

function formatStatus(status) {
  const normalized =
    normalizeStatus(status);

  if (
    normalized === "kompeten"
  ) {
    return "Kompeten";
  }

  if (
    normalized ===
    "belum_kompeten"
  ) {
    return "Belum Kompeten";
  }

  return "Belum Tersedia";
}