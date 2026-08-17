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

export default function FRAK03Asesi() {
  const navigate = useNavigate();
  const { id_peserta } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [jawaban, setJawaban] = useState([]);
  const [catatanLainnya, setCatatanLainnya] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const storageKey = useMemo(() => {
    return id_peserta ? `frak03_asesi_${id_peserta}` : "";
  }, [id_peserta]);

  const normalizeQuestions = (items = []) => {
    return items.map((item, index) => {
      if (typeof item === "string") {
        return {
          kode_pertanyaan: `Q${index + 1}`,
          pertanyaan: item
        };
      }

      return {
        kode_pertanyaan: item?.kode_pertanyaan || `Q${index + 1}`,
        pertanyaan: item?.pertanyaan || item?.question || "-"
      };
    });
  };

  const createEmptyAnswers = (items = []) => {
    return items.map((question) => ({
      kode_pertanyaan: question.kode_pertanyaan,
      pertanyaan: question.pertanyaan,
      jawaban: "",
      catatan: ""
    }));
  };

  const normalizeAnswer = (value) => {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === "ya") {
      return "ya";
    }

    if (normalized === "tidak") {
      return "tidak";
    }

    return "";
  };

  const getLocalDraft = () => {
    if (!storageKey) {
      return null;
    }

    try {
      const saved = localStorage.getItem(storageKey);

      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);

      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveLocalDraft = (answers, note) => {
    if (!storageKey || isSubmitted) {
      return;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        jawaban: answers,
        catatan_lainnya: note || "",
        updated_at: new Date().toISOString()
      })
    );
  };

  const clearLocalDraft = () => {
    if (!storageKey) {
      return;
    }

    localStorage.removeItem(storageKey);
  };

  const mapAnswers = (data, normalizedQuestions) => {
    const details = Array.isArray(data?.detailAk03)
      ? data.detailAk03
      : [];

    return normalizedQuestions.map((question) => {
      const found = details.find(
        (item) =>
          String(item?.kode_pertanyaan || "").trim().toUpperCase() ===
          String(question.kode_pertanyaan || "").trim().toUpperCase()
      );

      return {
        kode_pertanyaan: question.kode_pertanyaan,
        pertanyaan: question.pertanyaan,
        jawaban: normalizeAnswer(found?.jawaban),
        catatan: found?.catatan || ""
      };
    });
  };

  const restoreDraft = (normalizedQuestions) => {
    const draft = getLocalDraft();

    if (!draft) {
      return false;
    }

    const draftAnswers = Array.isArray(draft.jawaban)
      ? draft.jawaban
      : [];

    const mappedAnswers = normalizedQuestions.map((question) => {
      const found = draftAnswers.find(
        (item) =>
          String(item?.kode_pertanyaan || "").trim().toUpperCase() ===
          String(question.kode_pertanyaan || "").trim().toUpperCase()
      );

      return {
        kode_pertanyaan: question.kode_pertanyaan,
        pertanyaan: question.pertanyaan,
        jawaban: normalizeAnswer(found?.jawaban),
        catatan: found?.catatan || ""
      };
    });

    const hasContent =
      mappedAnswers.some(
        (item) =>
          item.jawaban ||
          String(item.catatan || "").trim()
      ) ||
      Boolean(draft.catatan_lainnya);

    if (!hasContent) {
      return false;
    }

    setJawaban(mappedAnswers);
    setCatatanLainnya(draft.catatan_lainnya || "");

    return true;
  };

  const fetchForm = async () => {
    try {
      setError("");

      if (!id_peserta) {
        throw new Error("ID peserta tidak ditemukan.");
      }

      const response = await api.get(
        `/asesi/fr-ak03/form?id_peserta=${id_peserta}`
      );

      const data = response.data?.data || null;

      if (!data) {
        throw new Error("Data FR.AK.03 tidak tersedia.");
      }

      const normalizedQuestions = normalizeQuestions(
        data.questions || []
      );

      setFormData(data);
      setQuestions(normalizedQuestions);

      if (data.existing || data.is_submitted) {
        const existingData = data.existing || data;
        const mappedAnswers = mapAnswers(
          existingData,
          normalizedQuestions
        );

        setJawaban(mappedAnswers);
        setCatatanLainnya(
          existingData.catatan_lainnya || ""
        );
        setIsSubmitted(true);
        clearLocalDraft();

        return;
      }

      try {
        const detailResponse = await api.get(
          `/asesi/fr-ak03/${id_peserta}`
        );

        const detailData = detailResponse.data?.data || null;

        if (
          detailData &&
          (detailData.id_fr_ak03 ||
            detailData.is_submitted)
        ) {
          const mappedAnswers = mapAnswers(
            detailData,
            normalizedQuestions
          );

          setFormData({
            ...data,
            ...detailData,
            questions: normalizedQuestions
          });

          setJawaban(mappedAnswers);
          setCatatanLainnya(
            detailData.catatan_lainnya || ""
          );
          setIsSubmitted(true);
          clearLocalDraft();

          return;
        }
      } catch (detailError) {
        if (detailError.response?.status !== 404) {
          throw detailError;
        }
      }

      setIsSubmitted(false);

      const restored = restoreDraft(
        normalizedQuestions
      );

      if (!restored) {
        setJawaban(
          createEmptyAnswers(
            normalizedQuestions
          )
        );
        setCatatanLainnya("");
      }
    } catch (err) {
      console.error(
        "LOAD FR.AK.03:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal mengambil data FR.AK.03."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [id_peserta]);

  const answeredCount = useMemo(() => {
    return jawaban.filter(
      (item) =>
        item.jawaban === "ya" ||
        item.jawaban === "tidak"
    ).length;
  }, [jawaban]);

  const allAnswered =
    jawaban.length > 0 &&
    answeredCount === jawaban.length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchForm();
  };

  const handleChangeJawaban = (index, value) => {
    if (isSubmitted) {
      return;
    }

    setJawaban((prev) => {
      const updated = prev.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                jawaban: value
              }
            : item
      );

      saveLocalDraft(
        updated,
        catatanLainnya
      );

      return updated;
    });
  };

  const handleChangeCatatan = (index, value) => {
    if (isSubmitted) {
      return;
    }

    setJawaban((prev) => {
      const updated = prev.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                catatan: value
              }
            : item
      );

      saveLocalDraft(
        updated,
        catatanLainnya
      );

      return updated;
    });
  };

  const handleChangeCatatanLainnya = (value) => {
    if (isSubmitted) {
      return;
    }

    setCatatanLainnya(value);

    saveLocalDraft(
      jawaban,
      value
    );
  };

  const handleSubmit = async () => {
    if (isSubmitted) {
      return;
    }

    if (!allAnswered) {
      alert(
        "Semua komponen wajib dijawab Ya atau Tidak."
      );
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menyimpan FR.AK.03? Data yang sudah disimpan tidak dapat diubah."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        "/asesi/fr-ak03",
        {
          id_peserta: Number(id_peserta),
          jawaban: jawaban.map(
            (item) => ({
              kode_pertanyaan:
                item.kode_pertanyaan,
              jawaban:
                item.jawaban,
              catatan:
                item.catatan || ""
            })
          ),
          catatan_lainnya:
            catatanLainnya || ""
        }
      );

      clearLocalDraft();

      await fetchForm();

      alert(
        "FR.AK.03 berhasil disimpan."
      );
    } catch (err) {
      console.error(
        "SUBMIT FR.AK.03:",
        err
      );

      if (
        err.response?.status === 400 ||
        err.response?.status === 409
      ) {
        await fetchForm();
      }

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
      setDownloading(true);

      const response = await api.get(
        `/asesi/fr-ak03/pdf/${id_peserta}`,
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

      const url = window.URL.createObjectURL(
        blob
      );

      const link = document.createElement(
        "a"
      );

      link.href = url;
      link.download =
        `FR-AK-03-${id_peserta}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "DOWNLOAD FR.AK.03:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengunduh PDF FR.AK.03."
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

  const nik =
    formData?.nik ||
    formData?.peserta?.profileAsesi?.nik ||
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
                  Download PDF
                </button>
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
                FR.AK.03. UMPAN BALIK DAN CATATAN ASESMEN
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
                    value={formatTanggal(
                      tanggalAsesmen
                    )}
                  />
                </tbody>
              </table>
            </div>

            <div className="border-b border-slate-300 px-6 py-4">
              <p className="text-[12px] font-bold text-[#071E3D]">
                Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan keputusan):
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="w-[58px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                      No.
                    </th>

                    <th className="border border-slate-300 px-4 py-4 text-left text-[12px] font-black text-[#071E3D]">
                      KOMPONEN
                    </th>

                    <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                      YA
                    </th>

                    <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">
                      TIDAK
                    </th>

                    <th className="w-[330px] border border-slate-300 px-4 py-4 text-center text-[12px] font-black text-[#071E3D]">
                      Catatan / Komentar Asesi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {jawaban.map(
                    (item, index) => (
                      <QuestionRow
                        key={
                          item.kode_pertanyaan ||
                          index
                        }
                        item={item}
                        index={index}
                        disabled={isSubmitted}
                        onChangeJawaban={(value) =>
                          handleChangeJawaban(
                            index,
                            value
                          )
                        }
                        onChangeCatatan={(value) =>
                          handleChangeCatatan(
                            index,
                            value
                          )
                        }
                      />
                    )
                  )}

                  <tr>
                    <td
                      colSpan="5"
                      className="border border-slate-300 p-0"
                    >
                      <div className="px-5 py-4">
                        <p className="text-[12px] font-bold text-[#071E3D]">
                          Catatan / komentar lainnya (apabila ada):
                        </p>

                        <textarea
                          value={catatanLainnya}
                          disabled={isSubmitted}
                          onChange={(e) =>
                            handleChangeCatatanLainnya(
                              e.target.value
                            )
                          }
                          rows={5}
                          placeholder="Opsional"
                          className="mt-3 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-[#071E3D] outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-300 bg-white px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Status Pengisian
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#071E3D]">
                    {answeredCount} dari{" "}
                    {jawaban.length} komponen sudah dijawab
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
                      : "Simpan FR.AK.03"}
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
  item,
  index,
  disabled,
  onChangeJawaban,
  onChangeCatatan
}) {
  return (
    <tr>
      <td className="border border-slate-300 px-3 py-5 text-center align-middle text-[12px] font-black text-[#071E3D]">
        {index + 1}
      </td>

      <td className="border border-slate-300 px-4 py-5 align-middle text-[13px] font-medium leading-relaxed text-[#071E3D]">
        {item.pertanyaan || "-"}
      </td>

      <td
        className={`border border-slate-300 px-3 py-5 text-center align-middle ${
          disabled && item.jawaban === "ya"
            ? "bg-emerald-50"
            : ""
        }`}
      >
        <input
          type="checkbox"
          checked={item.jawaban === "ya"}
          disabled={disabled}
          onChange={() =>
            onChangeJawaban("ya")
          }
          className="h-5 w-5 accent-[#071E3D]"
        />
      </td>

      <td
        className={`border border-slate-300 px-3 py-5 text-center align-middle ${
          disabled && item.jawaban === "tidak"
            ? "bg-red-50"
            : ""
        }`}
      >
        <input
          type="checkbox"
          checked={item.jawaban === "tidak"}
          disabled={disabled}
          onChange={() =>
            onChangeJawaban("tidak")
          }
          className="h-5 w-5 accent-[#071E3D]"
        />
      </td>

      <td className="border border-slate-300 p-3 align-top">
        <textarea
          value={item.catatan || ""}
          disabled={disabled}
          onChange={(e) =>
            onChangeCatatan(
              e.target.value
            )
          }
          rows={4}
          placeholder="Opsional"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-[#071E3D] outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </td>
    </tr>
  );
}

function InfoRow({
  label,
  value
}) {
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

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
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
          Memuat FR.AK.03
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Mengambil data formulir.
        </p>
      </div>
    </div>
  );
}