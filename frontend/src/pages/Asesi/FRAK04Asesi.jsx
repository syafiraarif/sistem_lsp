  import React, { useEffect, useMemo, useState } from "react";
  import axios from "axios";
  import { useNavigate, useParams } from "react-router-dom";
  import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
  import {
    ArrowLeft,
    CheckCircle,
    Download,
    Loader2,
    Printer,
    RefreshCcw,
    Save
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

  const PERTANYAAN = [
    {
      key: "proses_banding_dijelaskan",
      label: "Apakah Proses Banding telah dijelaskan kepada Anda?"
    },
    {
      key: "diskusi_dengan_asesor",
      label: "Apakah Anda telah mendiskusikan Banding dengan Asesor?"
    },
    {
      key: "melibatkan_orang_lain",
      label: "Apakah Anda mau melibatkan orang lain membantu Anda dalam Proses Banding?"
    }
  ];

  export default function FRAK04Asesi() {
    const navigate = useNavigate();
    const { id_peserta } = useParams();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [formData, setFormData] = useState(null);
    const [form, setForm] = useState({
      proses_banding_dijelaskan: "",
      diskusi_dengan_asesor: "",
      melibatkan_orang_lain: "",
      alasan_banding: ""
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const storageKey = useMemo(() => {
      return id_peserta ? `frak04_asesi_${id_peserta}` : "";
    }, [id_peserta]);

    const getLocalState = () => {
      if (!storageKey) {
        return null;
      }

      try {
        const value = localStorage.getItem(storageKey);

        if (!value) {
          return null;
        }

        const parsed = JSON.parse(value);

        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    };

    const saveLocalState = (nextForm, submitted) => {
      if (!storageKey) {
        return;
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...nextForm,
          is_submitted: Boolean(submitted),
          updated_at: new Date().toISOString()
        })
      );
    };

    const normalizeValue = (value) => {
      const normalized = String(value || "").trim().toLowerCase();

      if (normalized === "ya") {
        return "ya";
      }

      if (normalized === "tidak") {
        return "tidak";
      }

      return "";
    };

    const buildEmptyForm = () => ({
      proses_banding_dijelaskan: "",
      diskusi_dengan_asesor: "",
      melibatkan_orang_lain: "",
      alasan_banding: ""
    });

    const mapServerForm = (data) => ({
      proses_banding_dijelaskan: normalizeValue(
        data?.proses_banding_dijelaskan
      ),
      diskusi_dengan_asesor: normalizeValue(
        data?.diskusi_dengan_asesor
      ),
      melibatkan_orang_lain: normalizeValue(
        data?.melibatkan_orang_lain
      ),
      alasan_banding: data?.alasan_banding || ""
    });

    const fetchFallbackData = async () => {
      try {
        const result = await api.get(
          `/asesi/hasil-saya/detail?id_peserta=${id_peserta}`
        );

        const data = result.data?.data || {};

        return {
          nama_asesi: data.nama_asesi || data.asesi?.nama_lengkap || "-",
          nik: data.nik || data.asesi?.nik || "-",
          nama_asesor:
            data.asesor?.nama_lengkap ||
            data.nama_asesor ||
            "-",
          skema: data.skema || {},
          tuk: data.tuk || {},
          jadwal: data.jadwal || {}
        };
      } catch {
        return null;
      }
    };

    const fetchData = async () => {
      try {
        setError("");

        if (!id_peserta) {
          throw new Error("ID peserta tidak ditemukan.");
        }

        let serverData = null;

        try {
          const response = await api.get(
            `/asesi/fr-ak04/${id_peserta}`
          );

          serverData = response.data?.data || null;
        } catch (detailError) {
          if (detailError.response?.status !== 404) {
            throw detailError;
          }
        }

        if (serverData) {
          setFormData(serverData);
          setForm(mapServerForm(serverData));
          setIsSubmitted(
            Boolean(
              serverData.id_fr_ak04
            )
          );
          saveLocalState(
            mapServerForm(serverData),
            Boolean(serverData.id_fr_ak04)
          );
          return;
        }

        const fallback = await fetchFallbackData();

        const localState = getLocalState();

        setFormData(
          fallback || {
            nama_asesi: "-",
            nik: "-",
            nama_asesor: "-",
            skema: {},
            tuk: {},
            jadwal: {}
          }
        );

        if (localState) {
          const localForm = {
            proses_banding_dijelaskan:
              normalizeValue(
                localState.proses_banding_dijelaskan
              ),
            diskusi_dengan_asesor:
              normalizeValue(
                localState.diskusi_dengan_asesor
              ),
            melibatkan_orang_lain:
              normalizeValue(
                localState.melibatkan_orang_lain
              ),
            alasan_banding:
              localState.alasan_banding || ""
          };

          setForm(localForm);
          setIsSubmitted(
            Boolean(localState.is_submitted)
          );
        } else {
          setForm(buildEmptyForm());
          setIsSubmitted(false);
        }
      } catch (err) {
        console.error("LOAD FR.AK.04:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Gagal mengambil data FR.AK.04."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [id_peserta]);

    const answeredCount = useMemo(() => {
      return PERTANYAAN.filter((item) => {
        const value = form[item.key];

        return value === "ya" || value === "tidak";
      }).length;
    }, [form]);

    const allAnswered =
      answeredCount === PERTANYAAN.length &&
      Boolean(form.alasan_banding.trim());

    const handleRefresh = async () => {
      setRefreshing(true);
      await fetchData();
    };

    const handleChange = (field, value) => {
      if (isSubmitted) {
        return;
      }

      const updated = {
        ...form,
        [field]: value
      };

      setForm(updated);
      saveLocalState(updated, false);
    };

    const handleSubmit = async () => {
      if (isSubmitted) {
        alert("FR.AK.04 sudah pernah diisi.");
        return;
      }

      if (!allAnswered) {
        alert("Semua pertanyaan dan alasan banding wajib diisi.");
        return;
      }

      const confirmed = window.confirm(
        "Yakin ingin menyimpan FR.AK.04? Data yang sudah disimpan tidak dapat diubah."
      );

      if (!confirmed) {
        return;
      }

      try {
        setSubmitting(true);

        await api.post("/asesi/fr-ak04", {
          id_peserta: Number(id_peserta),
          proses_banding_dijelaskan:
            form.proses_banding_dijelaskan,
          diskusi_dengan_asesor:
            form.diskusi_dengan_asesor,
          melibatkan_orang_lain:
            form.melibatkan_orang_lain,
          alasan_banding:
            form.alasan_banding
        });

        setIsSubmitted(true);
        saveLocalState(form, true);

        await fetchData();

        alert("FR.AK.04 berhasil disimpan.");
      } catch (err) {
        console.error("SUBMIT FR.AK.04:", err);

        alert(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Gagal menyimpan FR.AK.04."
        );
      } finally {
        setSubmitting(false);
      }
    };

    const handleDownloadPdf = async () => {
      try {
        setDownloading(true);

        const response = await api.get(
          `/asesi/fr-ak04/pdf/${id_peserta}`,
          {
            responseType: "blob"
          }
        );

        const blob = new Blob(
          [response.data],
          {
            type: "application/pdf"
          }
        );

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `FR-AK-04-${id_peserta}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("DOWNLOAD FR.AK.04:", err);

        alert(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Gagal mengunduh PDF FR.AK.04."
        );
      } finally {
        setDownloading(false);
      }
    };

    const handlePrint = () => {
      window.print();
    };

    const tanggalAsesmen =
      formData?.tanggal_asesmen ||
      formData?.jadwal?.tgl_akhir ||
      formData?.jadwal?.tgl_awal ||
      "-";

    const namaAsesi =
      formData?.nama_asesi ||
      formData?.peserta?.profileAsesi?.nama_lengkap ||
      "-";

    const namaAsesor =
      formData?.nama_asesor ||
      "-";

    const judulSkema =
      formData?.nama_skema ||
      formData?.skema?.judul_skema ||
      "-";

    const kodeSkema =
      formData?.kode_skema ||
      formData?.skema?.kode_skema ||
      "-";

    const namaTuk =
      formData?.nama_tuk ||
      formData?.tuk?.nama_tuk ||
      "-";

    if (loading) {
      return <LoadingScreen />;
    }

    return (
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <SidebarAsesi
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1480px]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/asesi/hasil-akhir/${id_peserta}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D] hover:text-white"
              >
                <ArrowLeft size={17} />
                Kembali
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#071E3D] shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCcw size={16} />
                  )}
                  Refresh
                </button>

                {isSubmitted && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-500"
                    >
                      <Printer size={16} />
                      Cetak
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {downloading ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={16} />
                      )}
                      <span className="hidden sm:inline">
                        Cetak / PDF
                      </span>
                      <span className="sm:hidden">
                        PDF
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm print:shadow-none">
              <div className="border-b border-slate-300 bg-slate-100 px-6 py-5 text-center">
                <h1 className="text-[18px] font-black text-[#071E3D]">
                  FR.AK.04. BANDING ASESMEN
                </h1>
              </div>

              <div className="border-b border-slate-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <InfoRow
                      label="Nama Asesi"
                      value={namaAsesi}
                    />
                    <InfoRow
                      label="Nama Asesor"
                      value={namaAsesor}
                    />
                    <InfoRow
                      label="Tanggal Asesmen"
                      value={formatTanggal(tanggalAsesmen)}
                    />
                  </tbody>
                </table>
              </div>

              <div className="border-b border-slate-300 px-6 py-4">
                <p className="text-[12px] font-bold text-[#071E3D]">
                  Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini:
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="w-[58px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                        No.
                      </th>
                      <th className="border border-slate-300 px-4 py-4 text-left text-[12px] font-black text-[#071E3D]">
                        Pertanyaan
                      </th>
                      <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                        YA
                      </th>
                      <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                        TIDAK
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {PERTANYAAN.map((item, index) => (
                      <QuestionRow
                        key={item.key}
                        index={index}
                        label={item.label}
                        value={form[item.key]}
                        disabled={isSubmitted}
                        onChange={(value) =>
                          handleChange(item.key, value)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="border-t border-slate-300">
                <div className="border-b border-slate-300 px-5 py-4">
                  <p className="text-[12px] font-bold leading-relaxed text-[#071E3D]">
                    Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap Skema Sertifikasi berikut:
                  </p>

                  <div className="mt-3 overflow-hidden rounded-sm border border-slate-300">
                    <table className="w-full border-collapse">
                      <tbody>
                        <InfoRow
                          label="Skema Sertifikasi"
                          value={judulSkema}
                        />
                        <InfoRow
                          label="No. Skema Sertifikasi"
                          value={kodeSkema}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-b border-slate-300 px-5 py-4">
                  <p className="text-[12px] font-bold text-[#071E3D]">
                    Banding ini diajukan atas alasan sebagai berikut:
                  </p>

                  <textarea
                    value={form.alasan_banding}
                    disabled={isSubmitted}
                    onChange={(e) =>
                      handleChange(
                        "alasan_banding",
                        e.target.value
                      )
                    }
                    rows={7}
                    placeholder="Tuliskan alasan banding asesmen..."
                    className="mt-3 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-[#071E3D] outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 disabled:bg-slate-100"
                  />
                </div>

                <div className="px-5 py-5">
                  <p className="text-[11px] font-semibold leading-relaxed text-[#071E3D]">
                    Anda mempunyai hak mengajukan banding jika Anda menilai Proses Asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.
                  </p>

                  <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <p className="text-[11px] font-black text-[#071E3D]">
                        Tanda Tangan Asesi
                      </p>

                      <div className="mt-5 flex min-h-[80px] items-center justify-center border-b border-dotted border-slate-400">
                        {formData?.ttd_asesi ? (
                          <img
                            src={buildFileUrl(
                              formData.ttd_asesi
                            )}
                            alt="Tanda tangan asesi"
                            className="max-h-[60px] max-w-[180px] object-contain"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Tanda tangan mengikuti profile asesi
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-center text-xs font-bold text-[#071E3D]">
                        {namaAsesi}
                      </p>
                    </div>

                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <p className="text-[11px] font-black text-[#071E3D]">
                        Tanggal
                      </p>

                      <div className="mt-5 flex min-h-[80px] items-center justify-center border-b border-dotted border-slate-400">
                        <span className="text-sm font-semibold text-[#071E3D]">
                          {formatTanggal(tanggalAsesmen)}
                        </span>
                      </div>

                      <p className="mt-3 text-center text-xs font-bold text-slate-400">
                        Tanggal pengajuan banding
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-300 bg-white px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Status Pengisian
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#071E3D]">
                      {answeredCount} dari {PERTANYAAN.length} pertanyaan sudah dijawab
                    </p>
                  </div>

                  {isSubmitted ? (
                    <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">
                      <CheckCircle size={17} />
                      Sudah Tersimpan
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        submitting ||
                        !allAnswered
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={16} />
                      )}

                      {submitting
                        ? "Menyimpan..."
                        : "Simpan FR.AK.04"}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  function QuestionRow({
    index,
    label,
    value,
    disabled,
    onChange
  }) {
    return (
      <tr>
        <td className="border border-slate-300 px-3 py-5 text-center align-middle text-[12px] font-black text-[#071E3D]">
          {index + 1}
        </td>

        <td className="border border-slate-300 px-4 py-5 align-middle text-[13px] font-medium leading-relaxed text-[#071E3D]">
          {label}
        </td>

        <td className="border border-slate-300 px-3 py-5 text-center align-middle">
          <input
            type="checkbox"
            checked={value === "ya"}
            disabled={disabled}
            onChange={() => onChange("ya")}
            className="h-5 w-5 accent-[#071E3D]"
          />
        </td>

        <td className="border border-slate-300 px-3 py-5 text-center align-middle">
          <input
            type="checkbox"
            checked={value === "tidak"}
            disabled={disabled}
            onChange={() => onChange("tidak")}
            className="h-5 w-5 accent-[#071E3D]"
          />
        </td>
      </tr>
    );
  }

  function InfoRow({ label, value }) {
    return (
      <tr>
        <td className="w-[230px] border border-slate-300 bg-slate-50 px-3 py-3 text-[11px] font-black text-[#071E3D]">
          {label}
        </td>

        <td className="border border-slate-300 px-3 py-3 text-[11px] font-semibold text-[#071E3D]">
          {value || "-"}
        </td>
      </tr>
    );
  }

  function buildFileUrl(filePath) {
    if (!filePath) {
      return "";
    }

    if (String(filePath).startsWith("http")) {
      return filePath;
    }

    const appBase = API_BASE.replace(/\/api\/?$/, "");

    return `${appBase}/${String(filePath).replace(/^[/\\]+/, "").replace(/\\/g, "/")}`;
  }

  function formatTanggal(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function LoadingScreen() {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#071E3D]"
          />

          <h2 className="mt-4 text-lg font-black text-[#071E3D]">
            Memuat FR.AK.04
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Mengambil data formulir banding asesmen.
          </p>
        </div>
      </div>
    );
  }