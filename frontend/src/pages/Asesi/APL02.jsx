import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  PenLine,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  XCircle
} from "lucide-react";

const API =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const APP_BASE = API.replace("/api", "");

export default function APL02() {
  const { id_skema } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [idPeserta, setIdPeserta] = useState(
    location.state?.id_peserta ||
      location.state?.idPeserta ||
      localStorage.getItem(
        `id_peserta_skema_${id_skema}`
      ) ||
      ""
  );
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skema, setSkema] = useState(null);
  const [formUnits, setFormUnits] = useState([]);
  const [apl02, setApl02] = useState(null);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [rekomendasi, setRekomendasi] = useState("");
  const [pendekatan, setPendekatan] = useState("");
  const [openUnits, setOpenUnits] = useState({});
  const loadedRef = useRef(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (loadedRef.current) return;

    loadedRef.current = true;
    loadPage();
  }, []);

  const resolveIdPeserta = async () => {
    if (idPeserta) return idPeserta;

    try {
      const res = await axios.get(
        `${API}/asesi/jadwal-saya`,
        { headers }
      );

      const data = res.data?.data || [];

      const matched = data.find((item) => {
        const jadwal =
          item.jadwal ||
          item.Jadwal ||
          {};

        const skemaData =
          jadwal.skema ||
          jadwal.Skema ||
          {};

        const currentIdSkema =
          item.id_skema ||
          jadwal.id_skema ||
          skemaData.id_skema;

        return (
          Number(currentIdSkema) ===
          Number(id_skema)
        );
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
      console.error(
        "RESOLVE ID PESERTA ERROR:",
        err
      );

      return "";
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const pesertaId =
        await resolveIdPeserta();

      const [
        formRes,
        profileRes,
        fileRes
      ] = await Promise.allSettled([
        axios.get(
          `${API}/asesi/apl02/form/${id_skema}`,
          { headers }
        ),
        axios.get(
          `${API}/asesi/profile`,
          { headers }
        ),
        axios.get(
          `${API}/asesi/profile/files`,
          { headers }
        )
      ]);

      if (formRes.status !== "fulfilled") {
        throw formRes.reason;
      }

      setSkema(
        formRes.value.data?.data?.skema ||
          null
      );

      const units =
        formRes.value.data?.data?.units ||
        [];

      setFormUnits(units);

      if (profileRes.status === "fulfilled") {
        setProfile(
          profileRes.value.data?.data ||
            null
        );
      }

      if (fileRes.status === "fulfilled") {
        setFiles(
          fileRes.value.data?.data ||
            {}
        );
      }

      if (!pesertaId) {
        setError(
          "ID peserta tidak ditemukan. Buka APL02 dari halaman Jadwal Saya."
        );
        return;
      }

      const created =
        await axios.post(
          `${API}/asesi/apl02/create`,
          {
            id_peserta: pesertaId
          },
          { headers }
        );

      const apl02Data =
        created.data?.data ||
        null;

      setApl02(apl02Data);

      await loadExistingApl02(
        pesertaId,
        apl02Data
      );
    } catch (err) {
      console.error(
        "LOAD APL02 ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat APL02."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadExistingApl02 = async (
    pesertaId = idPeserta,
    fallback = null
  ) => {
    try {
      const res =
        await axios.get(
          `${API}/asesi/apl02/${pesertaId}`,
          { headers }
        );

      const data =
        res.data?.data ||
        fallback;

      if (!data) return;

      setApl02(data);

      setRekomendasi(
        data.rekomendasi_asesi ||
          ""
      );

      setPendekatan(
        data.pendekatan_rekomendasi ||
          ""
      );

      const mapped = {};

      (data.detail || []).forEach(
        (item) => {
          mapped[item.id_elemen] = {
            id_detail:
              item.id_detail,
            id_elemen:
              item.id_elemen,
            kompeten:
              item.kompeten ||
              "",
            catatan:
              item.catatan ||
              "",
            buktiTambahan:
              item.buktiTambahan ||
              []
          };
        }
      );

      setAnswers(mapped);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(
          "GET APL02 ERROR:",
          err
        );
      }
    }
  };

  const getImageSrc = (filePath) => {
    if (!filePath) return "";

    if (
      String(filePath).startsWith(
        "http"
      )
    ) {
      return filePath;
    }

    return `${APP_BASE}/${String(
      filePath
    ).replace(/^\/+/, "")}`;
  };

  const ttdUrl =
    files.ttd ||
    files.tanda_tangan ||
    files.ttd_path ||
    getImageSrc(
      profile?.ttd_path
    );

  const isLocked =
    apl02?.status === "submitted";

  const getUnit = (row) => {
    return (
      row?.unit ||
      row?.UnitKompetensi ||
      row
    );
  };

  const getUnitKode = (unit) => {
    return (
      unit?.kode_unit ||
      unit?.kode ||
      unit?.kode_kompetensi ||
      unit?.kode_unit_kompetensi ||
      "-"
    );
  };

  const getUnitJudul = (unit) => {
    return (
      unit?.judul_unit ||
      unit?.nama_unit ||
      unit?.judul ||
      unit?.nama_unit_kompetensi ||
      "-"
    );
  };

  const getElemenList = (unit) => {
    return (
      unit?.elemen ||
      unit?.UnitElemen ||
      unit?.unit_elemen ||
      []
    );
  };

  const getElemenText = (elemen) => {
    return (
      elemen?.nama_elemen ||
      elemen?.elemen_kompetensi ||
      elemen?.judul_elemen ||
      elemen?.elemen ||
      elemen?.deskripsi ||
      "-"
    );
  };

  const getKukList = (elemen) => {
    return (
      elemen?.kuk ||
      elemen?.UnitKuk ||
      elemen?.unit_kuk ||
      []
    );
  };

  const getKukText = (kuk) => {
    return (
      kuk?.uraian ||
      kuk?.kriteria_unjuk_kerja ||
      kuk?.kuk ||
      kuk?.deskripsi ||
      kuk?.pertanyaan ||
      kuk?.nama_kuk ||
      "-"
    );
  };

  const totalElemen = useMemo(() => {
    return formUnits.reduce(
      (total, row) => {
        const unit =
          getUnit(row);

        return (
          total +
          getElemenList(unit)
            .length
        );
      },
      0
    );
  }, [formUnits]);

  const totalTerisi = useMemo(() => {
    return Object.values(
      answers
    ).filter(
      (item) =>
        item?.kompeten
    ).length;
  }, [answers]);

  const totalBukti = useMemo(() => {
    return Object.values(
      answers
    ).reduce(
      (total, item) =>
        total +
        (item?.buktiTambahan
          ?.length || 0),
      0
    );
  }, [answers]);

  const progress =
    totalElemen > 0
      ? Math.round(
          (totalTerisi /
            totalElemen) *
            100
        )
      : 0;

  const updateAnswer = (
    id_elemen,
    field,
    value
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [id_elemen]: {
        ...prev[id_elemen],
        id_elemen,
        [field]: value
      }
    }));
  };

  const toggleUnit = (unitIndex) => {
    setOpenUnits((prev) => ({
      ...prev,
      [unitIndex]:
        prev[unitIndex] === undefined
          ? false
          : !prev[unitIndex]
    }));
  };

  const savePenilaian = async (
    id_elemen
  ) => {
    const answer =
      answers[id_elemen] || {};

    if (!answer.fileBukti) {
      alert(
        "Upload bukti terlebih dahulu."
      );
      return;
    }

    if (!answer.kompeten) {
      alert(
        "Pilih K atau BK dulu."
      );
      return;
    }

    if (!apl02?.id_apl02) {
      alert(
        "APL02 belum dibuat. Refresh halaman."
      );
      return;
    }

    if (isLocked) {
      alert(
        "APL02 sudah submit."
      );
      return;
    }

    try {
      setSavingKey(
        `penilaian-${id_elemen}`
      );

      const unit =
        formUnits.find((u) =>
          getElemenList(
            getUnit(u)
          ).some(
            (e) =>
              Number(
                e.id_elemen
              ) ===
              Number(
                id_elemen
              )
          )
        );

      if (!unit) {
        alert(
          "Unit kompetensi tidak ditemukan."
        );
        return;
      }

      const res =
        await axios.post(
          `${API}/asesi/apl02/penilaian`,
          {
            id_apl02:
              apl02.id_apl02,
            id_unit:
              getUnit(unit)
                .id_unit,
            id_elemen,
            kompeten:
              answer.kompeten,
            catatan:
              answer.catatan ||
              ""
          },
          { headers }
        );

      const detail =
        res.data.data;

      if (
        answer.fileBukti
      ) {
        const formData =
          new FormData();

        formData.append(
          "id_detail",
          detail.id_detail
        );

        formData.append(
          "file_bukti",
          answer.fileBukti
        );

        await axios.post(
          `${API}/asesi/apl02/upload`,
          formData,
          {
            headers: {
              ...headers,
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

        await loadExistingApl02();
      }

      setAnswers((prev) => ({
        ...prev,
        [id_elemen]: {
          ...prev[id_elemen],
          id_detail:
            detail.id_detail,
          fileBukti: null
        }
      }));

      alert(
        "Penilaian berhasil disimpan."
      );
    } catch (err) {
      console.error(
        "SAVE PENILAIAN ERROR:",
        err
      );

      alert(
        err.response?.data
          ?.message ||
          "Gagal menyimpan penilaian."
      );
    } finally {
      setSavingKey("");
    }
  };

  const hapusBukti = async (
    id_bukti
  ) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus bukti ini?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API}/asesi/apl02/bukti/${id_bukti}`,
        { headers }
      );

      await loadExistingApl02();

      alert(
        "Bukti berhasil dihapus."
      );
    } catch (err) {
      console.error(
        "HAPUS BUKTI ERROR:",
        err
      );

      alert(
        err.response?.data
          ?.message ||
          "Gagal menghapus bukti."
      );
    }
  };

  const saveRekomendasi = async (
    silent = false
  ) => {
    if (!apl02?.id_apl02) {
      if (!silent) {
        alert(
          "APL02 belum dibuat."
        );
      }

      return false;
    }

    if (isLocked) {
      if (!silent) {
        alert(
          "APL02 sudah submit."
        );
      }

      return false;
    }

    try {
      setSavingKey(
        "rekomendasi"
      );

      await axios.post(
        `${API}/asesi/apl02/rekomendasi`,
        {
          id_apl02:
            apl02.id_apl02,
          rekomendasi_asesi:
            rekomendasi,
          pendekatan_rekomendasi:
            pendekatan
        },
        { headers }
      );

      if (!silent) {
        alert(
          "Rekomendasi berhasil disimpan."
        );
      }

      return true;
    } catch (err) {
      console.error(
        "SAVE REKOMENDASI ERROR:",
        err
      );

      if (!silent) {
        alert(
          err.response?.data
            ?.message ||
            "Gagal menyimpan rekomendasi."
        );
      }

      return false;
    } finally {
      setSavingKey("");
    }
  };

  const submitApl02 = async () => {
    if (!apl02?.id_apl02) {
      alert(
        "APL02 belum dibuat."
      );
      return;
    }

    if (
      totalTerisi !==
      totalElemen
    ) {
      alert(
        "Masih ada elemen kompetensi yang belum diisi."
      );
      return;
    }

    try {
      setSubmitting(true);

      const saved =
        await saveRekomendasi(
          true
        );

      if (!saved) {
        return;
      }

      await axios.put(
        `${API}/asesi/apl02/submit/${apl02.id_apl02}`,
        {},
        { headers }
      );

      alert(
        "APL02 berhasil disubmit."
      );

      await loadPage();
    } catch (err) {
      console.error(
        "SUBMIT APL02 ERROR:",
        err
      );

      alert(
        err.response?.data
          ?.message ||
          "Gagal submit APL02."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = () => {
    if (!idPeserta) {
      alert(
        "ID peserta tidak ditemukan."
      );
      return;
    }

    window.open(
      `${API}/asesi/apl02/pdf/${idPeserta}`,
      "_blank"
    );
  };

  const formatTanggal = (
    date
  ) => {
    if (!date) return "-";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#071E3D]">
              <Loader2
                size={26}
                className="animate-spin text-orange-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#071E3D]">
                Memuat APL.02
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Menyiapkan formulir asesmen mandiri Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex">
      <SidebarAsesi
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          <section className="relative overflow-hidden rounded-[36px] bg-[#071E3D] text-white shadow-xl">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 p-6 lg:p-9">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/asesi/jadwal-saya"
                  )
                }
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white hover:text-[#071E3D]"
              >
                <ArrowLeft
                  size={15}
                />
                Kembali ke Jadwal
              </button>

              <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_390px] xl:items-end">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-orange-200">
                    <BookOpen
                      size={15}
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                      FR.APL.02
                    </span>
                  </div>

                  <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">
                    Asesmen Mandiri
                    <span className="block text-orange-400">
                      {skema?.judul_skema ||
                        "Skema Sertifikasi"}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-white/65 md:text-base">
                    Lengkapi setiap elemen kompetensi,
                    pilih kompeten atau belum kompeten,
                    lalu lampirkan bukti yang relevan
                    dengan pengalaman Anda.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <HeaderPill
                      icon={
                        <ShieldCheck
                          size={15}
                        />
                      }
                      text={
                        apl02?.status ===
                        "submitted"
                          ? "Sudah Disubmit"
                          : "Draft"
                      }
                    />

                    <HeaderPill
                      icon={
                        <UserRound
                          size={15}
                        />
                      }
                      text={`Peserta ${idPeserta || "-"}`}
                    />

                    <HeaderPill
                      icon={
                        <FileCheck2
                          size={15}
                        />
                      }
                      text={`${totalBukti} Bukti`}
                    />
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                        Progress Pengisian
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white/70">
                        {totalTerisi} dari{" "}
                        {totalElemen} elemen
                      </p>
                    </div>

                    <span className="text-3xl font-black text-orange-400">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{
                        width: `${progress}%`
                      }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <ProgressStat
                      value={totalElemen}
                      label="Elemen"
                    />

                    <ProgressStat
                      value={totalTerisi}
                      label="Terisi"
                    />

                    <ProgressStat
                      value={
                        Math.max(
                          totalElemen -
                            totalTerisi,
                          0
                        )
                      }
                      label="Tersisa"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-[26px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold leading-relaxed text-red-600">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />
              <span>
                {error}
              </span>
            </div>
          )}

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_390px]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6 lg:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-orange-500">
                      <BookOpen
                        size={14}
                      />
                      <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                        Informasi Skema
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-[#071E3D]">
                      Informasi Asesmen
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                      Pastikan skema dan identitas
                      berikut sudah sesuai.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Kode Skema
                    </p>

                    <p className="mt-1 text-sm font-black text-[#071E3D]">
                      {skema?.kode_skema ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px bg-slate-100 md:grid-cols-2">
                <InfoPanel
                  label="Judul Skema"
                  value={
                    skema?.judul_skema ||
                    "-"
                  }
                />

                <InfoPanel
                  label="Nomor Skema"
                  value={
                    skema?.kode_skema ||
                    "-"
                  }
                />

                <InfoPanel
                  label="ID Peserta"
                  value={
                    idPeserta || "-"
                  }
                />

                <InfoPanel
                  label="ID APL.02"
                  value={
                    apl02?.id_apl02 ||
                    "-"
                  }
                />
              </div>

              <div className="p-6 lg:p-7">
                <div className="rounded-[24px] border border-orange-100 bg-orange-50/60 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <FileText
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="font-black text-[#071E3D]">
                        Panduan Pengisian
                      </h3>

                      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                        Lengkapi penilaian berdasarkan
                        kemampuan yang Anda miliki dan
                        sertakan bukti yang dapat mendukung
                        pernyataan tersebut.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <GuideItem
                      number="01"
                      text="Pilih K atau BK"
                    />

                    <GuideItem
                      number="02"
                      text="Isi bukti relevan"
                    />

                    <GuideItem
                      number="03"
                      text="Simpan setiap elemen"
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Status Pengisian
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#071E3D]">
                    Ringkasan
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isLocked
                      ? "bg-green-50 text-green-600"
                      : "bg-orange-50 text-orange-500"
                  }`}
                >
                  {isLocked ? (
                    <BadgeCheck
                      size={22}
                    />
                  ) : (
                    <PenLine
                      size={22}
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SummaryCard
                  label="Elemen"
                  value={totalElemen}
                />

                <SummaryCard
                  label="Terisi"
                  value={totalTerisi}
                />

                <SummaryCard
                  label="Bukti"
                  value={totalBukti}
                />

                <SummaryCard
                  label="Status"
                  value={
                    isLocked
                      ? "Selesai"
                      : "Draft"
                  }
                />
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={
                    loadPage
                  }
                  disabled={
                    loading
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <RefreshCcw
                    size={16}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={
                    downloadPdf
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <Download
                    size={16}
                  />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={
                    submitApl02
                  }
                  disabled={
                    submitting ||
                    isLocked ||
                    totalElemen ===
                      0
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : isLocked ? (
                    <BadgeCheck
                      size={16}
                    />
                  ) : (
                    <Send
                      size={16}
                    />
                  )}

                  {isLocked
                    ? "Sudah Submit"
                    : "Submit APL.02"}
                </button>
              </div>
            </aside>
          </section>

          {formUnits.length === 0 ? (
            <section className="rounded-[32px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <FileText
                  size={28}
                />
              </div>

              <h3 className="mt-5 text-2xl font-black text-[#071E3D]">
                Unit Kompetensi Belum Tersedia
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-400">
                Belum ada data unit, elemen,
                dan KUK untuk skema ini.
              </p>
            </section>
          ) : (
            <section className="space-y-5">
              {formUnits.map(
                (
                  row,
                  unitIndex
                ) => {
                  const unit =
                    getUnit(row);

                  const elemenList =
                    getElemenList(
                      unit
                    );

                  const isUnitOpen =
                    openUnits[
                      unitIndex
                    ] !== false;

                  const unitTerisi =
                    elemenList.filter(
                      (elemen) =>
                        answers[
                          elemen.id_elemen
                        ]?.kompeten
                    ).length;

                  return (
                    <section
                      key={
                        row.id_unit ||
                        unit.id_unit ||
                        unitIndex
                      }
                      className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleUnit(
                            unitIndex
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex flex-col gap-5 p-6 lg:p-7 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                              <FileCheck2
                                size={22}
                              />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#071E3D] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                                  Unit{" "}
                                  {unitIndex +
                                    1}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {unitTerisi}/
                                  {
                                    elemenList.length
                                  } Elemen
                                </span>
                              </div>

                              <h2 className="mt-3 text-xl font-black text-[#071E3D] lg:text-2xl">
                                {getUnitJudul(
                                  unit
                                )}
                              </h2>

                              <p className="mt-1 text-sm font-semibold text-slate-400">
                                Kode Unit:{" "}
                                {getUnitKode(
                                  unit
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start md:self-auto">
                            <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right md:block">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                Progres
                              </p>

                              <p className="mt-1 text-sm font-black text-[#071E3D]">
                                {elemenList.length
                                  ? Math.round(
                                      (unitTerisi /
                                        elemenList.length) *
                                        100
                                    )
                                  : 0}
                                %
                              </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                              {isUnitOpen ? (
                                <ChevronUp
                                  size={18}
                                />
                              ) : (
                                <ChevronDown
                                  size={18}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {isUnitOpen && (
                        <div className="border-t border-slate-100">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] border-collapse">
                              <thead>
                                <tr className="bg-[#071E3D] text-white">
                                  <th className="w-[70px] border-r border-white/10 px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                                    No.
                                  </th>

                                  <th className="min-w-[460px] border-r border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                                    Elemen & Kriteria Unjuk Kerja
                                  </th>

                                  <th className="w-[80px] border-r border-white/10 px-3 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                                    K
                                  </th>

                                  <th className="w-[80px] border-r border-white/10 px-3 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                                    BK
                                  </th>

                                  <th className="min-w-[330px] border-r border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                                    Bukti & Catatan
                                  </th>

                                  <th className="w-[100px] px-3 py-4 text-center text-[10px] font-black uppercase tracking-widest">
                                    Simpan
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {elemenList.length ===
                                0 ? (
                                  <tr>
                                    <td
                                      colSpan="6"
                                      className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                                    >
                                      Elemen belum tersedia.
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
                                        <tr
                                          key={
                                            idElemen ||
                                            elemenIndex
                                          }
                                          className={`border-b border-slate-100 align-top transition-colors ${
                                            answer.kompeten
                                              ? "bg-white"
                                              : "bg-orange-50/20"
                                          }`}
                                        >
                                          <td className="border-r border-slate-100 px-4 py-5 text-center">
                                            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-[#071E3D]">
                                              {elemenIndex +
                                                1}
                                            </div>
                                          </td>

                                          <td className="border-r border-slate-100 px-5 py-5">
                                            <div className="flex items-start gap-3">
                                              <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />

                                              <div className="min-w-0">
                                                <h4 className="font-black leading-6 text-[#071E3D]">
                                                  {getElemenText(
                                                    elemen
                                                  )}
                                                </h4>

                                                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Kriteria Unjuk Kerja
                                                  </p>

                                                  {kukList.length ===
                                                  0 ? (
                                                    <p className="mt-2 text-sm font-semibold text-slate-400">
                                                      KUK belum tersedia.
                                                    </p>
                                                  ) : (
                                                    <ol className="mt-3 space-y-2 pl-5 text-sm font-semibold leading-6 text-slate-600">
                                                      {kukList.map(
                                                        (
                                                          kuk,
                                                          kukIndex
                                                        ) => (
                                                          <li
                                                            key={
                                                              kuk.id_kuk ||
                                                              kukIndex
                                                            }
                                                          >
                                                            {getKukText(
                                                              kuk
                                                            )}
                                                          </li>
                                                        )
                                                      )}
                                                    </ol>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </td>

                                          <td className="border-r border-slate-100 px-3 py-6 text-center">
                                            <label
                                              className={`mx-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-2 transition-all ${
                                                answer.kompeten ===
                                                "K"
                                                  ? "border-green-500 bg-green-50 text-green-600"
                                                  : "border-slate-200 bg-white text-slate-300 hover:border-green-300 hover:bg-green-50"
                                              } ${
                                                isLocked
                                                  ? "cursor-not-allowed opacity-60"
                                                  : ""
                                              }`}
                                            >
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
                                                className="sr-only"
                                              />

                                              {answer.kompeten ===
                                              "K" ? (
                                                <CheckCircle
                                                  size={22}
                                                />
                                              ) : (
                                                <span className="text-lg font-black">
                                                  K
                                                </span>
                                              )}
                                            </label>
                                          </td>

                                          <td className="border-r border-slate-100 px-3 py-6 text-center">
                                            <label
                                              className={`mx-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-2 transition-all ${
                                                answer.kompeten ===
                                                "BK"
                                                  ? "border-red-500 bg-red-50 text-red-600"
                                                  : "border-slate-200 bg-white text-slate-300 hover:border-red-300 hover:bg-red-50"
                                              } ${
                                                isLocked
                                                  ? "cursor-not-allowed opacity-60"
                                                  : ""
                                              }`}
                                            >
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
                                                className="sr-only"
                                              />

                                              {answer.kompeten ===
                                              "BK" ? (
                                                <XCircle
                                                  size={22}
                                                />
                                              ) : (
                                                <span className="text-lg font-black">
                                                  BK
                                                </span>
                                              )}
                                            </label>
                                          </td>

                                          <td className="border-r border-slate-100 px-5 py-5">
                                            {!isLocked && (
                                              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 px-4 py-6 text-center transition-all hover:border-orange-400 hover:bg-orange-50">
                                                <input
                                                  type="file"
                                                  className="hidden"
                                                  disabled={
                                                    isLocked
                                                  }
                                                  onChange={(
                                                    e
                                                  ) => {
                                                    const file =
                                                      e
                                                        .target
                                                        .files?.[0];

                                                    if (
                                                      !file
                                                    ) {
                                                      return;
                                                    }

                                                    setAnswers(
                                                      (
                                                        prev
                                                      ) => ({
                                                        ...prev,
                                                        [idElemen]:
                                                          {
                                                            ...prev[
                                                              idElemen
                                                            ],
                                                            fileBukti:
                                                              file
                                                          }
                                                      })
                                                    );
                                                  }}
                                                />

                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm transition-transform group-hover:scale-105">
                                                  <Upload
                                                    size={
                                                      20
                                                    }
                                                  />
                                                </div>

                                                <p className="mt-3 text-sm font-black text-[#071E3D]">
                                                  {answer.fileBukti
                                                    ? "File siap disimpan"
                                                    : "Tambah bukti"}
                                                </p>

                                                <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-slate-400">
                                                  {answer.fileBukti
                                                    ? answer.fileBukti
                                                        .name
                                                    : "PDF, JPG, PNG"}
                                                </p>
                                              </label>
                                            )}

                                            {answer.fileBukti && (
                                              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500">
                                                  <FileText
                                                    size={
                                                      17
                                                    }
                                                  />
                                                </div>

                                                <div className="min-w-0">
                                                  <p className="truncate text-xs font-black text-[#071E3D]">
                                                    {
                                                      answer
                                                        .fileBukti
                                                        .name
                                                    }
                                                  </p>

                                                  <p className="mt-0.5 text-[10px] font-semibold text-orange-600">
                                                    File baru
                                                  </p>
                                                </div>
                                              </div>
                                            )}

                                            {answer.buktiTambahan?.length >
                                              0 && (
                                              <div className="mt-4 space-y-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                  Bukti tersimpan
                                                </p>

                                                {answer.buktiTambahan.map(
                                                  (
                                                    file
                                                  ) => (
                                                    <div
                                                      key={
                                                        file.id_bukti
                                                      }
                                                      className="rounded-2xl border border-slate-200 bg-white p-3"
                                                    >
                                                      <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                                          <FileCheck2
                                                            size={
                                                              17
                                                            }
                                                          />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                          <p className="truncate text-xs font-black text-[#071E3D]">
                                                            {file.nama_file ||
                                                              file.nama_dokumen ||
                                                              "Bukti tersimpan"}
                                                          </p>

                                                          <p className="mt-0.5 text-[10px] font-semibold text-green-600">
                                                            Berhasil diupload
                                                          </p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                          <a
                                                            href={getImageSrc(
                                                              file.file_path
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-100"
                                                          >
                                                            <Eye
                                                              size={
                                                                16
                                                              }
                                                            />
                                                          </a>

                                                          {!isLocked && (
                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                hapusBukti(
                                                                  file.id_bukti
                                                                )
                                                              }
                                                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-100"
                                                            >
                                                              <Trash2
                                                                size={
                                                                  16
                                                                }
                                                              />
                                                            </button>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}

                                            <div className="mt-4">
                                              <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Catatan / Bukti Pendukung
                                              </label>

                                              <textarea
                                                value={
                                                  answer.catatan ||
                                                  ""
                                                }
                                                disabled={
                                                  isLocked
                                                }
                                                onChange={(
                                                  e
                                                ) =>
                                                  updateAnswer(
                                                    idElemen,
                                                    "catatan",
                                                    e
                                                      .target
                                                      .value
                                                  )
                                                }
                                                placeholder="Tulis bukti atau pengalaman yang relevan..."
                                                className="min-h-[120px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                              />
                                            </div>
                                          </td>

                                          <td className="px-3 py-6 text-center">
                                            <button
                                              type="button"
                                              disabled={
                                                isLocked ||
                                                isSaving
                                              }
                                              onClick={() =>
                                                savePenilaian(
                                                  idElemen
                                                )
                                              }
                                              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                            >
                                              {isSaving ? (
                                                <Loader2
                                                  size={
                                                    18
                                                  }
                                                  className="animate-spin"
                                                />
                                              ) : (
                                                <Save
                                                  size={
                                                    18
                                                  }
                                                />
                                              )}
                                            </button>

                                            <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                              Simpan
                                            </p>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </section>
                  );
                }
              )}
            </section>
          )}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <PenLine
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Bagian Akhir
                    </p>

                    <h2 className="text-xl font-black text-[#071E3D]">
                      Rekomendasi Asesi
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Rekomendasi untuk Asesi
                </label>

                <textarea
                  value={
                    rekomendasi
                  }
                  disabled={
                    isLocked
                  }
                  onChange={(e) =>
                    setRekomendasi(
                      e.target.value
                    )
                  }
                  placeholder="Tulis rekomendasi untuk asesi..."
                  className="min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold leading-6 text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-5">
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Pendekatan Asesmen
                  </label>

                  <input
                    type="text"
                    value={
                      pendekatan
                    }
                    disabled={
                      isLocked
                    }
                    onChange={(e) =>
                      setPendekatan(
                        e.target.value
                      )
                    }
                    placeholder="Contoh: observasi, portofolio, wawancara..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="button"
                  disabled={
                    isLocked ||
                    savingKey ===
                      "rekomendasi"
                  }
                  onClick={() =>
                    saveRekomendasi(
                      false
                    )
                  }
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingKey ===
                  "rekomendasi" ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={16}
                    />
                  )}

                  Simpan Rekomendasi
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <ShieldCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Validasi Identitas
                    </p>

                    <h2 className="text-xl font-black text-[#071E3D]">
                      Data Asesi
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                  <div className="grid grid-cols-[120px_1fr] border-b border-slate-100">
                    <div className="bg-white p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Nama
                    </div>

                    <div className="p-4 text-sm font-black text-[#071E3D]">
                      {profile?.nama_lengkap ||
                        "-"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="bg-white p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      TTD
                    </div>

                    <div className="min-h-[150px] p-4">
                      {ttdUrl ? (
                        <img
                          src={
                            ttdUrl
                          }
                          alt="TTD Asesi"
                          className="max-h-[90px] max-w-[240px] object-contain"
                        />
                      ) : (
                        <div className="flex h-full min-h-[110px] items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 text-center text-xs font-semibold text-red-500">
                          Tanda tangan asesi belum tersedia.
                        </div>
                      )}

                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {formatTanggal(
                          new Date()
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-[#071E3D] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white">
                    Ditinjau Oleh Asesor
                  </div>

                  <div className="grid grid-cols-[120px_1fr] border-b border-slate-100">
                    <div className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Nama
                    </div>

                    <div className="p-4 text-sm font-semibold text-slate-400">
                      Diisi oleh asesor
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      No. Reg
                    </div>

                    <div className="p-4 text-sm font-semibold text-slate-400">
                      Diisi oleh asesor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Finalisasi
                </p>

                <h3 className="mt-1 text-xl font-black text-[#071E3D]">
                  Pastikan seluruh elemen telah lengkap
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Anda hanya dapat melakukan submit setelah semua elemen terisi.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    downloadPdf
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                >
                  <Download
                    size={16}
                  />
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={
                    submitApl02
                  }
                  disabled={
                    submitting ||
                    isLocked ||
                    totalElemen ===
                      0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : isLocked ? (
                    <BadgeCheck
                      size={16}
                    />
                  ) : (
                    <CheckCircle
                      size={16}
                    />
                  )}

                  {isLocked
                    ? "Sudah Submit"
                    : "Submit APL.02"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function HeaderPill({
  icon,
  text
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70">
      <span className="text-orange-400">
        {icon}
      </span>
      {text}
    </div>
  );
}

function ProgressStat({
  value,
  label
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-lg font-black text-white">
        {value}
      </p>

      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
    </div>
  );
}

function InfoPanel({
  label,
  value
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black leading-6 text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-[#071E3D]">
        {value}
      </p>
    </div>
  );
}

function GuideItem({
  number,
  text
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-[10px] font-black text-white">
        {number}
      </span>

      <span className="text-xs font-bold leading-5 text-slate-600">
        {text}
      </span>
    </div>
  );
}