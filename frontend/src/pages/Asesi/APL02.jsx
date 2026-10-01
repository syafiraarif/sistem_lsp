import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck2,
  FileText,
  Inbox,
  Layers,
  Loader2,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import { notifikasi } from "../../components/ui/notifikasi";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const APL02 = () => {
  const { id_skema } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingKey, setSavingKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skema, setSkema] = useState(null);
  const [formUnits, setFormUnits] = useState([]);
  const [apl02, setApl02] = useState(null);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [openUnits, setOpenUnits] = useState({});
  const [idPeserta, setIdPeserta] = useState(
    location.state?.id_peserta ||
      location.state?.idPeserta ||
      localStorage.getItem(`id_peserta_skema_${id_skema}`) ||
      ""
  );

  const loadedRef = useRef(false);

  const token = localStorage.getItem("token");

  const getUnit = (row) => row?.unit || row?.UnitKompetensi || row;

  const getUnitKode = (unit) =>
    unit?.kode_unit ||
    unit?.kode ||
    unit?.kode_kompetensi ||
    unit?.kode_unit_kompetensi ||
    "-";

  const getUnitJudul = (unit) =>
    unit?.judul_unit ||
    unit?.nama_unit ||
    unit?.judul ||
    unit?.nama_unit_kompetensi ||
    "-";

  const getElemenList = (unit) =>
    unit?.elemen ||
    unit?.UnitElemen ||
    unit?.unit_elemen ||
    [];

  const getElemenText = (elemen) =>
    elemen?.nama_elemen ||
    elemen?.elemen_kompetensi ||
    elemen?.judul_elemen ||
    elemen?.elemen ||
    elemen?.deskripsi ||
    "-";

  const getKukList = (elemen) =>
    elemen?.kuk ||
    elemen?.UnitKuk ||
    elemen?.unit_kuk ||
    [];

  const getKukText = (kuk) =>
    kuk?.uraian ||
    kuk?.kriteria_unjuk_kerja ||
    kuk?.kuk ||
    kuk?.deskripsi ||
    kuk?.pertanyaan ||
    kuk?.nama_kuk ||
    "-";

  const getImageSrc = (filePath) => {
    if (!filePath) {
      return "";
    }

    if (String(filePath).startsWith("http")) {
      return filePath;
    }

    return `${APP_BASE}/${String(filePath).replace(/^\/+/, "")}`;
  };

  const formatTanggal = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const resolveIdPeserta = async () => {
    if (idPeserta) {
      return idPeserta;
    }

    try {
      const response = await api.get("/asesi/jadwal-saya");
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const matched = data.find((item) => {
        const jadwal = item?.jadwal || item?.Jadwal || {};
        const skemaData = jadwal?.skema || jadwal?.Skema || {};
        const currentIdSkema =
          item?.id_skema ||
          jadwal?.id_skema ||
          skemaData?.id_skema;

        return Number(currentIdSkema) === Number(id_skema);
      });

      const pesertaId =
        matched?.id_peserta ||
        matched?.id_peserta_jadwal ||
        matched?.id ||
        matched?.id_pendaftaran;

      if (pesertaId) {
        setIdPeserta(pesertaId);
        localStorage.setItem(
          `id_peserta_skema_${id_skema}`,
          pesertaId
        );
      }

      return pesertaId || "";
    } catch (err) {
      console.error("Resolve ID peserta error:", err);
      return "";
    }
  };

  const loadExistingApl02 = async (pesertaId, fallback = null) => {
    if (!pesertaId) {
      return;
    }

    try {
      const response = await api.get(`/asesi/apl02/${pesertaId}`);
      const data = response.data?.data || fallback;

      if (!data) {
        return;
      }

      setApl02(data);

      const mappedAnswers = {};

      (data.detail || []).forEach((item) => {
        mappedAnswers[item.id_elemen] = {
          id_detail: item.id_detail,
          id_elemen: item.id_elemen,
          kompeten: item.kompeten || "",
          catatan: item.catatan || "",
          buktiTambahan: item.buktiTambahan || [],
          fileBukti: null,
        };
      });

      setAnswers(mappedAnswers);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Get APL02 error:", err);
      }
    }
  };

  const loadPage = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const pesertaId = await resolveIdPeserta();

      const [formResult, profileResult, fileResult] =
        await Promise.allSettled([
          api.get(`/asesi/apl02/form/${id_skema}`),
          api.get("/asesi/profile"),
          api.get("/asesi/profile/files"),
        ]);

      if (formResult.status !== "fulfilled") {
        throw formResult.reason;
      }

      const formData = formResult.value.data?.data || {};

      if (formData.skema) {
        setSkema(formData.skema);
      } else if (formData?.judul_skema || formData?.kode_skema) {
        setSkema(formData);
      } else {
        setSkema(null);
      }

      setFormUnits(
        Array.isArray(formData.units)
          ? formData.units
          : Array.isArray(formData)
          ? formData
          : []
      );

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data?.data || null);
      }

      if (fileResult.status === "fulfilled") {
        setFiles(fileResult.value.data?.data || {});
      }

      if (!pesertaId) {
        const message =
          "ID peserta tidak ditemukan. Buka APL.02 dari Jadwal Saya.";

        setError(message);

        await notifikasi.gagal(
          "Data Peserta Tidak Ditemukan",
          message
        );

        return;
      }

      const created = await api.post(
        "/asesi/apl02/create",
        {
          id_peserta: pesertaId,
        }
      );

      const apl02Data = created.data?.data || null;

      if (apl02Data) {
        setApl02(apl02Data);
      }

      await loadExistingApl02(
        pesertaId,
        apl02Data
      );
    } catch (err) {
      console.error("Load APL02 error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();

        await notifikasi.peringatan(
          "Sesi Berakhir",
          "Sesi login Anda telah berakhir. Silakan login kembali."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const message =
        err.response?.data?.message ||
        err.message ||
        "Gagal memuat APL.02.";

      setError(message);

      await notifikasi.gagal(
        "Gagal Memuat APL.02",
        message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (loadedRef.current) {
      return;
    }

    loadedRef.current = true;
    loadPage();
  }, []);

  const handleRefresh = async () => {
    if (loading || refreshing) {
      return;
    }

    await loadPage(true);
  };

  const updateAnswer = (id_elemen, field, value) => {
    if (apl02?.status === "submitted") {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [id_elemen]: {
        ...prev[id_elemen],
        id_elemen,
        [field]: value,
      },
    }));
  };

  const toggleUnit = (index) => {
    setOpenUnits((prev) => ({
      ...prev,
      [index]: prev[index] === undefined ? false : !prev[index],
    }));
  };

  const savePenilaian = async (id_elemen) => {
    if (apl02?.status === "submitted") {
      await notifikasi.peringatan(
        "APL.02 Sudah Disubmit",
        "Data APL.02 tidak dapat diubah lagi."
      );

      return;
    }

    const answer = answers[id_elemen] || {};
    const hasBukti = (answer.buktiTambahan || []).length > 0;

    if (!answer.kompeten) {
      await notifikasi.peringatan(
        "Penilaian Belum Dipilih",
        "Silakan pilih K atau BK terlebih dahulu."
      );

      return;
    }

    if (!answer.fileBukti && !hasBukti) {
      await notifikasi.peringatan(
        "Bukti Belum Ada",
        "Silakan unggah minimal satu bukti."
      );

      return;
    }

    if (!apl02?.id_apl02) {
      await notifikasi.peringatan(
        "APL.02 Belum Siap",
        "Silakan refresh halaman lalu coba kembali."
      );

      return;
    }

    const row = formUnits.find((item) =>
      getElemenList(getUnit(item)).some(
        (elemen) =>
          Number(elemen.id_elemen) ===
          Number(id_elemen)
      )
    );

    const unit = row ? getUnit(row) : null;

    if (!unit?.id_unit) {
      await notifikasi.gagal(
        "Unit Tidak Ditemukan",
        "Unit kompetensi untuk elemen ini tidak ditemukan."
      );

      return;
    }

    try {
      setSavingKey(`penilaian-${id_elemen}`);

      const response = await api.post(
        "/asesi/apl02/penilaian",
        {
          id_apl02: apl02.id_apl02,
          id_unit: unit.id_unit,
          id_elemen,
          kompeten: answer.kompeten,
          catatan: answer.catatan || "",
        }
      );

      const detail = response.data?.data;

      if (answer.fileBukti) {
        const formData = new FormData();
        formData.append(
          "id_detail",
          detail.id_detail
        );
        formData.append(
          "file_bukti",
          answer.fileBukti
        );

        await api.post(
          "/asesi/apl02/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      await loadExistingApl02(
        idPeserta
      );

      await notifikasi.sukses(
        "Berhasil",
        "Penilaian dan bukti berhasil disimpan."
      );
    } catch (err) {
      console.error(
        "Save penilaian error:",
        err
      );

      await notifikasi.gagal(
        "Gagal Menyimpan",
        err.response?.data?.message ||
          "Gagal menyimpan penilaian."
      );
    } finally {
      setSavingKey("");
    }
  };

  const hapusBukti = async (id_bukti) => {
    if (apl02?.status === "submitted") {
      return;
    }

    const result = await notifikasi.konfirmasi(
      "Hapus Bukti?",
      "Bukti yang dihapus tidak dapat dikembalikan.",
      "Ya, Hapus",
      "Batal",
      "warning",
      "danger"
    );

    if (!result?.isConfirmed) {
      return;
    }

    try {
      await api.delete(
        `/asesi/apl02/bukti/${id_bukti}`
      );

      await loadExistingApl02(
        idPeserta
      );

      await notifikasi.sukses(
        "Berhasil",
        "Bukti berhasil dihapus."
      );
    } catch (err) {
      console.error(
        "Delete bukti error:",
        err
      );

      await notifikasi.gagal(
        "Gagal Menghapus",
        err.response?.data?.message ||
          "Gagal menghapus bukti."
      );
    }
  };

  const submitApl02 = async () => {
    if (apl02?.status === "submitted") {
      await notifikasi.peringatan(
        "APL.02 Sudah Disubmit",
        "Dokumen ini sudah dikirim dan tidak dapat diubah."
      );

      return;
    }

    if (!apl02?.id_apl02) {
      await notifikasi.peringatan(
        "APL.02 Belum Siap",
        "Silakan refresh halaman terlebih dahulu."
      );

      return;
    }

    if (totalElemen === 0) {
      await notifikasi.peringatan(
        "Data Kompetensi Kosong",
        "Belum ada elemen kompetensi yang dapat disubmit."
      );

      return;
    }

    if (totalTerisi !== totalElemen) {
      await notifikasi.peringatan(
        "Form Belum Lengkap",
        `Masih ada ${totalElemen - totalTerisi} elemen yang belum dinilai.`
      );

      return;
    }

    if (totalBukti < totalElemen) {
      await notifikasi.peringatan(
        "Bukti Belum Lengkap",
        "Pastikan setiap elemen kompetensi memiliki bukti."
      );

      return;
    }

    const result = await notifikasi.konfirmasi(
      "Submit APL.02?",
      "Setelah disubmit, data asesmen mandiri tidak dapat diubah kembali.",
      "Ya, Submit",
      "Batal",
      "question",
      "primary"
    );

    if (!result?.isConfirmed) {
      return;
    }

    try {
      setSubmitting(true);

      await api.put(
        `/asesi/apl02/submit/${apl02.id_apl02}`,
        {}
      );

      await notifikasi.sukses(
        "APL.02 Berhasil Disubmit",
        "Dokumen asesmen mandiri berhasil dikirim."
      );

      await loadPage();
    } catch (err) {
      console.error(
        "Submit APL02 error:",
        err
      );

      await notifikasi.gagal(
        "Gagal Submit",
        err.response?.data?.message ||
          "Gagal submit APL.02."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async () => {
    if (!idPeserta) {
      await notifikasi.peringatan(
        "ID Peserta Tidak Ditemukan",
        "Data peserta belum tersedia."
      );

      return;
    }

    try {
      const response = await api.get(
        `/asesi/apl02/pdf/${idPeserta}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        `FR.APL.02-${idPeserta}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      await notifikasi.sukses(
        "Berhasil",
        "Dokumen APL.02 berhasil diunduh."
      );
    } catch (err) {
      console.error(
        "Download PDF error:",
        err
      );

      if (
        err.response?.status ===
        401
      ) {
        localStorage.clear();

        await notifikasi.peringatan(
          "Sesi Berakhir",
          "Silakan login kembali."
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      await notifikasi.gagal(
        "Gagal Download PDF",
        "Dokumen APL.02 gagal dibuat."
      );
    }
  };

  const totalElemen = useMemo(
    () =>
      formUnits.reduce(
        (total, row) =>
          total +
          getElemenList(
            getUnit(
              row
            )
          ).length,
        0
      ),
    [
      formUnits,
    ]
  );

  const totalTerisi = useMemo(
    () =>
      Object.values(
        answers
      ).filter(
        (item) =>
          item?.kompeten
      ).length,
    [
      answers,
    ]
  );

  const totalBukti = useMemo(
    () =>
      Object.values(
        answers
      ).reduce(
        (total, item) =>
          total +
          (
            item?.buktiTambahan
              ?.length ||
            0
          ),
        0
      ),
    [
      answers,
    ]
  );

  const progress =
    totalElemen > 0
      ? Math.round(
          (
            totalTerisi /
            totalElemen
          ) *
            100
        )
      : 0;

  const namaAsesi =
    profile?.nama_lengkap ||
    apl02?.peserta
      ?.profileAsesi
      ?.nama_lengkap ||
    "-";

  const namaAsesor =
    apl02?.nama_asesor ||
    apl02?.asesor
      ?.nama_lengkap ||
    "Diisi oleh asesor";

  const nomorRegistrasiAsesor =
    apl02?.nomor_registrasi_asesor ||
    apl02?.asesor
      ?.nomor_registrasi ||
    apl02?.asesor?.no_reg ||
    "Diisi oleh asesor";

  const rekomendasi =
    apl02?.rekomendasi_asesi ||
    "";

  const pendekatan =
    apl02?.pendekatan_rekomendasi ||
    "";

  const tanggalAsesmen =
    apl02?.peserta
      ?.jadwal?.tgl_awal ||
    apl02?.peserta
      ?.jadwal?.tgl_akhir ||
    apl02?.updated_at ||
    new Date();

  const ttdUrl =
    files?.ttd ||
    files?.tanda_tangan ||
    files?.ttd_path ||
    getImageSrc(
      profile?.ttd_path
    );

  const isLocked =
    apl02?.status ===
    "submitted";

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            .apl02-print-hidden {
              display: none !important;
            }

            .apl02-main {
              margin: 0 !important;
              padding: 0 !important;
            }

            .apl02-paper {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              border: 0 !important;
              box-shadow: none !important;
            }

            .apl02-unit {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            table {
              break-inside: auto;
            }

            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="flex min-h-screen bg-[#EEF2F7]">
        <div className="apl02-print-hidden">
          <SidebarAsesi
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
        </div>

        <main className="apl02-main min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="apl02-print-hidden mb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2
                    size={
                      17
                    }
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCcw
                    size={
                      17
                    }
                  />
                )}
                Refresh
              </button>

              <button
                type="button"
                onClick={
                  downloadPdf
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F]"
              >
                <Download
                  size={
                    17
                  }
                />
                Download PDF
              </button>
            </div>

            {error && (
              <div className="apl02-print-hidden mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] font-semibold leading-6 text-red-700">
                <AlertCircle
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {
                    error
                  }
                </span>
              </div>
            )}

            <section className="apl02-paper overflow-hidden border-2 border-black bg-white shadow-xl">
              <DocumentHeader
                skema={
                  skema
                }
              />

              <GuidanceSection />

              <div className="border-b-2 border-black px-5 py-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-[155px] border border-black px-3 py-3 text-[12px] font-bold">
                        Kode & Judul
                      </td>

                      <td className="w-[30px] border border-black px-2 py-3 text-center text-[12px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-3 py-3 text-[12px] font-bold">
                        {skema?.kode_skema ||
                          "-"}{" "}
                        {skema?.judul_skema
                          ? `- ${skema.judul_skema}`
                          : ""}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-black px-3 py-3 text-[12px] font-bold">
                        Nama Asesi
                      </td>

                      <td className="border border-black px-2 py-3 text-center text-[12px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-3 py-3 text-[12px]">
                        {namaAsesi}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-5">
                {formUnits.length ===
                0 ? (
                  <div className="border-2 border-black px-5 py-16 text-center">
                    <Inbox
                      size={
                        40
                      }
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-4 text-[14px] font-bold">
                      Unit kompetensi belum tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formUnits.map(
                      (
                        row,
                        unitIndex
                      ) => {
                        const unit =
                          getUnit(
                            row
                          );

                        const elemenList =
                          getElemenList(
                            unit
                          );

                        const isOpen =
                          openUnits[
                            unitIndex
                          ] !==
                          false;

                        const unitTerisi =
                          elemenList.filter(
                            (
                              elemen
                            ) =>
                              answers[
                                elemen
                                  .id_elemen
                              ]?.kompeten
                          ).length;

                        return (
                          <section
                            key={
                              unit.id_unit ||
                              unitIndex
                            }
                            className="apl02-unit overflow-hidden border-2 border-black bg-white"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleUnit(
                                  unitIndex
                                )
                              }
                              className="apl02-print-hidden flex w-full items-center justify-between gap-4 border-b border-black bg-white px-4 py-4 text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-[14px] font-black text-black">
                                  Unit Kompetensi{" "}
                                  {unitIndex +
                                    1}
                                </p>

                                <p className="mt-1 text-[11px] font-semibold text-slate-600">
                                  {getUnitKode(
                                    unit
                                  )}{" "}
                                  -{" "}
                                  {getUnitJudul(
                                    unit
                                  )}
                                </p>
                              </div>

                              <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-slate-600">
                                {
                                  unitTerisi
                                }
                                /
                                {
                                  elemenList.length
                                }{" "}
                                Elemen
                                {isOpen ? (
                                  <ChevronUp
                                    size={
                                      18
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={
                                      18
                                    }
                                  />
                                )}
                              </span>
                            </button>

                            <table className="w-full border-collapse">
                              <tbody>
                                <tr>
                                  <td className="w-[155px] border-r border-black px-3 py-3 text-[11px] font-bold">
                                    Kode & Judul Unit
                                  </td>

                                  <td className="w-[30px] border-r border-black px-2 py-3 text-center text-[11px] font-bold">
                                    :
                                  </td>

                                  <td className="px-3 py-3 text-[11px] font-bold">
                                    {getUnitKode(
                                      unit
                                    )}{" "}
                                    -{" "}
                                    {getUnitJudul(
                                      unit
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            {isOpen && (
                              <div className="overflow-x-auto border-t border-black">
                                <table className="w-full min-w-[1150px] border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="w-[55px] border-b border-r border-black bg-[#E2F0D9] px-2 py-3 text-center text-[11px] font-bold">
                                        No.
                                      </th>

                                      <th className="border-b border-r border-black bg-[#E2F0D9] px-4 py-3 text-left text-[11px] font-bold">
                                        Elemen / Kriteria Unjuk Kerja
                                      </th>

                                      <th className="w-[65px] border-b border-r border-black bg-[#E2F0D9] px-2 py-3 text-center text-[11px] font-bold">
                                        K
                                      </th>

                                      <th className="w-[65px] border-b border-r border-black bg-[#E2F0D9] px-2 py-3 text-center text-[11px] font-bold">
                                        BK
                                      </th>

                                      <th className="w-[350px] border-b border-black bg-[#E2F0D9] px-4 py-3 text-center text-[11px] font-bold">
                                        Bukti
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {elemenList.length ===
                                    0 ? (
                                      <tr>
                                        <td
                                          colSpan="5"
                                          className="border-b border-black px-5 py-12 text-center text-[12px]"
                                        >
                                          Elemen kompetensi belum tersedia.
                                        </td>
                                      </tr>
                                    ) : (
                                      elemenList.map(
                                        (
                                          elemen,
                                          elemenIndex
                                        ) => {
                                          const idElemen =
                                            elemen.id_elemen;

                                          const answer =
                                            answers[
                                              idElemen
                                            ] ||
                                            {};

                                          const kukList =
                                            getKukList(
                                              elemen
                                            );

                                          const isSaving =
                                            savingKey ===
                                            `penilaian-${idElemen}`;

                                          return (
                                            <React.Fragment
                                              key={
                                                idElemen ||
                                                elemenIndex
                                              }
                                            >
                                              <tr>
                                                <td
                                                  rowSpan={
                                                    kukList.length +
                                                    2
                                                  }
                                                  className="border-b border-r border-black px-2 py-3 text-center align-top text-[11px] font-bold"
                                                >
                                                  {elemenIndex +
                                                    1}
                                                </td>

                                                <td className="border-b border-r border-black px-4 py-3 text-[11px] font-bold leading-6">
                                                  Elemen :{" "}
                                                  {getElemenText(
                                                    elemen
                                                  )}
                                                </td>

                                                <td
                                                  rowSpan={
                                                    kukList.length +
                                                    2
                                                  }
                                                  className="border-b border-r border-black px-2 py-3 align-middle"
                                                >
                                                  <label className="flex cursor-pointer items-center justify-center">
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        answer.kompeten ===
                                                        "K"
                                                      }
                                                      disabled={
                                                        isLocked
                                                      }
                                                      onChange={() =>
                                                        updateAnswer(
                                                          idElemen,
                                                          "kompeten",
                                                          "K"
                                                        )
                                                      }
                                                      className="h-6 w-6 accent-black"
                                                    />
                                                  </label>
                                                </td>

                                                <td
                                                  rowSpan={
                                                    kukList.length +
                                                    2
                                                  }
                                                  className="border-b border-r border-black px-2 py-3 align-middle"
                                                >
                                                  <label className="flex cursor-pointer items-center justify-center">
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        answer.kompeten ===
                                                        "BK"
                                                      }
                                                      disabled={
                                                        isLocked
                                                      }
                                                      onChange={() =>
                                                        updateAnswer(
                                                          idElemen,
                                                          "kompeten",
                                                          "BK"
                                                        )
                                                      }
                                                      className="h-6 w-6 accent-black"
                                                    />
                                                  </label>
                                                </td>

                                                <td
                                                  rowSpan={
                                                    kukList.length +
                                                    2
                                                  }
                                                  className="border-b border-black p-4 align-top"
                                                >
                                                  {answer.buktiTambahan?.length >
                                                    0 && (
                                                    <div className="mb-3 space-y-2">
                                                      {answer.buktiTambahan.map(
                                                        (
                                                          file
                                                        ) => (
                                                          <div
                                                            key={
                                                              file.id_bukti
                                                            }
                                                            className="flex items-center gap-2 border border-black px-3 py-2.5"
                                                          >
                                                            <FileCheck2
                                                              size={
                                                                16
                                                              }
                                                              className="shrink-0"
                                                            />

                                                            <a
                                                              href={
                                                                file.file_url ||
                                                                getImageSrc(
                                                                  file.file_path
                                                                )
                                                              }
                                                              target="_blank"
                                                              rel="noreferrer"
                                                              className="min-w-0 flex-1 truncate text-[10px] font-bold underline"
                                                            >
                                                              {file.nama_dokumen ||
                                                                file.nama_file ||
                                                                "Bukti"}
                                                            </a>

                                                            {!isLocked && (
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  hapusBukti(
                                                                    file.id_bukti
                                                                  )
                                                                }
                                                                className="apl02-print-hidden shrink-0 text-red-600"
                                                              >
                                                                <Trash2
                                                                  size={
                                                                    16
                                                                  }
                                                                />
                                                              </button>
                                                            )}
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  )}

                                                  {!isLocked && (
                                                    <label className="apl02-print-hidden flex min-h-[95px] cursor-pointer flex-col items-center justify-center border border-dashed border-black bg-white px-4 py-4 text-center transition-colors hover:bg-slate-50">
                                                      <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                        onChange={(
                                                          event
                                                        ) => {
                                                          const file =
                                                            event
                                                              .target
                                                              .files?.[0];

                                                          if (
                                                            file
                                                          ) {
                                                            updateAnswer(
                                                              idElemen,
                                                              "fileBukti",
                                                              file
                                                            );
                                                          }
                                                        }}
                                                      />

                                                      <UploadCloud
                                                        size={
                                                          23
                                                        }
                                                      />

                                                      <span className="mt-2 text-[11px] font-bold">
                                                        {answer.fileBukti
                                                          ? "File Dipilih"
                                                          : "Tambah Bukti"}
                                                      </span>

                                                      <span className="mt-1 max-w-full truncate text-[9px] text-slate-500">
                                                        {answer.fileBukti?.name ||
                                                          "PDF / JPG / PNG"}
                                                      </span>
                                                    </label>
                                                  )}

                                                  {answer.fileBukti && (
                                                    <p className="apl02-print-hidden mt-2 truncate text-[10px] font-bold text-[#CC6B27]">
                                                      {answer.fileBukti.name}
                                                    </p>
                                                  )}

                                                  <textarea
                                                    value={
                                                      answer.catatan ||
                                                      ""
                                                    }
                                                    disabled={
                                                      isLocked
                                                    }
                                                    onChange={(
                                                      event
                                                    ) =>
                                                      updateAnswer(
                                                        idElemen,
                                                        "catatan",
                                                        event
                                                          .target
                                                          .value
                                                      )
                                                    }
                                                    rows={
                                                      3
                                                    }
                                                    placeholder="Catatan"
                                                    className="apl02-print-hidden mt-3 w-full resize-none border border-black px-3 py-2.5 text-[10px] leading-5 outline-none focus:border-[#CC6B27] disabled:bg-slate-100"
                                                  />

                                                  {!isLocked && (
                                                    <div className="apl02-print-hidden mt-3 flex justify-end">
                                                      <button
                                                        type="button"
                                                        disabled={
                                                          isSaving
                                                        }
                                                        onClick={() =>
                                                          savePenilaian(
                                                            idElemen
                                                          )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-md bg-[#CC6B27] px-4 py-2.5 text-[10px] font-bold text-white transition-colors hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                                                      >
                                                        {isSaving ? (
                                                          <Loader2
                                                            size={
                                                              14
                                                            }
                                                            className="animate-spin"
                                                          />
                                                        ) : (
                                                          <Save
                                                            size={
                                                              14
                                                            }
                                                          />
                                                        )}
                                                        Simpan
                                                      </button>
                                                    </div>
                                                  )}
                                                </td>
                                              </tr>

                                              <tr>
                                                <td className="border-b border-r border-black px-4 py-2.5 text-[10px] font-bold">
                                                  Kriteria Unjuk Kerja
                                                </td>
                                              </tr>

                                              {kukList.map(
                                                (
                                                  kuk,
                                                  kukIndex
                                                ) => (
                                                  <tr
                                                    key={
                                                      kuk.id_kuk ||
                                                      `${idElemen}-${kukIndex}`
                                                    }
                                                  >
                                                    <td className="border-b border-r border-black px-4 py-2.5 text-[10px] leading-6">
                                                      <span className="font-bold">
                                                        {elemenIndex +
                                                          1}
                                                        .
                                                        {kukIndex +
                                                          1}
                                                      </span>{" "}
                                                      {getKukText(
                                                        kuk
                                                      )}
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </React.Fragment>
                                          );
                                        }
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </section>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              <section className="border-t-[2px] border-black px-5 py-5">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-[46%] border border-black align-top">
                        <div className="px-5 py-5">
                          <p className="text-[14px] font-bold">
                            Rekomendasi Untuk Asesi:
                          </p>

                          <p className="mt-10 whitespace-pre-wrap text-[12px] leading-7">
                            {rekomendasi.trim()
                              ? rekomendasi
                              : "Belum ada rekomendasi dari asesor."}
                          </p>

                          {pendekatan.trim() && (
                            <div className="mt-8">
                              <p className="text-[12px] font-bold">
                                Pendekatan Asesmen:
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-6">
                                {
                                  pendekatan
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr>
                              <td className="w-[140px] border border-black px-3 py-3 text-[10px] font-bold">
                                Asesi
                              </td>

                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Asesi
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Nama
                              </td>

                              <td className="border border-black px-3 py-3 text-[10px]">
                                {namaAsesi}
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Tanda tangan/
                                Tanggal
                              </td>

                              <td className="border border-black px-3 py-4">
                                {ttdUrl ? (
                                  <img
                                    src={
                                      ttdUrl
                                    }
                                    alt="Tanda tangan asesi"
                                    className="max-h-[85px] max-w-[230px] object-contain"
                                  />
                                ) : (
                                  <span className="text-[9px] italic text-slate-400">
                                    Tanda tangan belum tersedia
                                  </span>
                                )}

                                <p className="mt-2 text-[9px]">
                                  {
                                    formatTanggal(
                                      tanggalAsesmen
                                    )
                                  }
                                </p>
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Ditinjau Oleh Asesor :
                              </td>

                              <td className="border border-black px-3 py-3 text-[10px]">
                                {namaAsesor}
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Nama :
                              </td>

                              <td className="border border-black px-3 py-3 text-[10px]">
                                {namaAsesor}
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                No. Reg :
                              </td>

                              <td className="border border-black px-3 py-3 text-[10px]">
                                {
                                  nomorRegistrasiAsesor
                                }
                              </td>
                            </tr>

                            <tr>
                              <td className="border border-black px-3 py-3 text-[10px] font-bold">
                                Tanda tangan/
                                Tanggal
                              </td>

                              <td className="border border-black px-3 py-4 text-[9px] italic text-slate-400">
                                Diisi oleh asesor
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="apl02-print-hidden border-t border-black bg-white px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Status APL.02
                    </p>

                    <p className="mt-1.5 text-[14px] font-black text-[#071E3D]">
                      {isLocked
                        ? "Sudah Disubmit"
                        : "Draft"}{" "}
                      ·{" "}
                      {totalTerisi}/
                      {totalElemen} Elemen
                      ·{" "}
                      {totalBukti} Bukti
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        downloadPdf
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/15 bg-white px-5 py-3 text-[11px] font-bold text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                    >
                      <Download
                        size={
                          16
                        }
                      />
                      Download PDF
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting ||
                        isLocked ||
                        totalElemen ===
                          0
                      }
                      onClick={
                        submitApl02
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[11px] font-bold text-white transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? (
                        <Loader2
                          size={
                            16
                          }
                          className="animate-spin"
                        />
                      ) : isLocked ? (
                        <BadgeCheck
                          size={
                            16
                          }
                        />
                      ) : (
                        <Send
                          size={
                            16
                          }
                        />
                      )}

                      {isLocked
                        ? "Sudah Submit"
                        : "Submit APL.02"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden border border-black bg-white">
                  <div
                    className="h-full bg-[#CC6B27] transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </section>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

const DocumentHeader = ({
  skema,
}) => {
  return (
    <div className="border-b-2 border-black">
      <div className="px-5 py-5 text-center">
        <h1 className="text-[24px] font-black tracking-tight md:text-[28px]">
          FR.APL.02. ASESMEN MANDIRI
        </h1>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td
              rowSpan="2"
              className="w-[25%] border border-black px-4 py-5 text-center text-[11px] font-bold leading-6"
            >
              Skema Sertifikasi
              <br />
              (KKNI/Okupasi/Klaster)
            </td>

            <td className="w-[12%] border border-black px-4 py-5 text-center text-[11px] font-bold">
              Judul
            </td>

            <td className="w-[3%] border border-black px-2 py-5 text-center text-[11px] font-bold">
              :
            </td>

            <td className="border border-black px-4 py-5 text-[12px] font-bold">
              {skema?.judul_skema ||
                "-"}
            </td>
          </tr>

          <tr>
            <td className="border border-black px-4 py-5 text-center text-[11px] font-bold">
              Nomor
            </td>

            <td className="border border-black px-2 py-5 text-center text-[11px] font-bold">
              :
            </td>

            <td className="border border-black px-4 py-5 text-[11px]">
              {skema?.nomor_skema ||
                skema?.nomor ||
                skema?.kode_skema ||
                "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const GuidanceSection = () => {
  return (
    <section className="border-b-2 border-black">
      <div className="border-b border-black px-5 py-4">
        <h2 className="text-[13px] font-black uppercase">
          Panduan Asesmen Mandiri
        </h2>
      </div>

      <div className="px-6 py-4">
        <p className="mb-2 text-[11px] font-bold">
          Instruksi:
        </p>

        <ul className="list-disc space-y-1.5 pl-5 text-[10px] leading-6">
          <li>
            Baca setiap pertanyaan di kolom sebelah kiri.
          </li>

          <li>
            Beri tanda centang (√) pada kotak jika Anda yakin dapat melakukan
            tugas yang dijelaskan.
          </li>

          <li>
            Isi kolom di sebelah kanan dengan bukti yang relevan yang Anda
            miliki untuk menunjukkan bahwa Anda melakukan pekerjaan.
          </li>
        </ul>
      </div>
    </section>
  );
};

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-5">
      <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-9 text-center shadow-lg">
        <Loader2
          size={42}
          className="mx-auto animate-spin text-[#CC6B27]"
        />

        <h2 className="mt-5 text-[20px] font-black text-[#071E3D]">
          Memuat APL.02
        </h2>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Menyiapkan dokumen asesmen mandiri.
        </p>
      </div>
    </div>
  );
};

export default APL02;