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
  Download,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  Loader2,
  PenLine,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API.replace("/api", "");

export default function APL02() {
  const { id_skema } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [idPeserta, setIdPeserta] = useState(
    location.state?.id_peserta ||
      location.state?.idPeserta ||
      localStorage.getItem(`id_peserta_skema_${id_skema}`) ||
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

  const loadedRef = useRef(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (loadedRef.current) return;

    loadedRef.current = true;
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveIdPeserta = async () => {
    if (idPeserta) return idPeserta;

    try {
      const res = await axios.get(`${API}/asesi/jadwal-saya`, {
        headers
      });

      const data = res.data?.data || [];

      const matched = data.find((item) => {
        const jadwal = item.jadwal || item.Jadwal || {};
        const skemaData = jadwal.skema || jadwal.Skema || {};

        const currentIdSkema =
          item.id_skema || jadwal.id_skema || skemaData.id_skema;

        return Number(currentIdSkema) === Number(id_skema);
      });

      const pesertaId =
        matched?.id_peserta ||
        matched?.id_peserta_jadwal ||
        matched?.id ||
        matched?.id_pendaftaran;

      if (pesertaId) {
        setIdPeserta(pesertaId);
        localStorage.setItem(`id_peserta_skema_${id_skema}`, pesertaId);
      }

      return pesertaId || "";
    } catch (err) {
      console.error("RESOLVE ID PESERTA ERROR:", err);
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

    const pesertaId = await resolveIdPeserta();

    const [formRes, profileRes, fileRes] = await Promise.allSettled([
      axios.get(`${API}/asesi/apl02/form/${id_skema}`, {
        headers
      }),
      axios.get(`${API}/asesi/profile`, {
        headers
      }),
      axios.get(`${API}/asesi/profile/files`, {
        headers
      })
    ]);

    if (formRes.status !== "fulfilled") {
      throw formRes.reason;
    }

    console.log("FORM RES =", formRes.value.data);

    setSkema(formRes.value.data?.data?.skema || null);

    const units = formRes.value.data?.data?.units || [];

    console.log("UNITS =", units);
    console.log("IS ARRAY =", Array.isArray(units));

    setFormUnits(units);

    if (profileRes.status === "fulfilled") {
      setProfile(profileRes.value.data?.data || null);
    }

    if (fileRes.status === "fulfilled") {
      setFiles(fileRes.value.data?.data || {});
    }

    if (!pesertaId) {
      setError(
        "ID peserta tidak ditemukan. Buka APL02 dari halaman Jadwal Saya."
      );
      return;
    }

    const created = await axios.post(
      `${API}/asesi/apl02/create`,
      {
        id_peserta: pesertaId
      },
      {
        headers
      }
    );

    const apl02Data = created.data?.data || null;

    setApl02(apl02Data);

    await loadExistingApl02(pesertaId, apl02Data);

  } catch (err) {
    console.error("LOAD APL02 ERROR:", err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Gagal memuat APL02."
    );
  } finally {
    setLoading(false);
  }
};

  const loadExistingApl02 = async (pesertaId = idPeserta, fallback = null) => {
    try {
      const res = await axios.get(`${API}/asesi/apl02/${pesertaId}`, {
        headers
      });

      const data = res.data?.data || fallback;

      if (!data) return;

      setApl02(data);
      setRekomendasi(data.rekomendasi_asesi || "");
      setPendekatan(data.pendekatan_rekomendasi || "");

      const mapped = {};

      (data.detail || []).forEach((item) => {
        mapped[item.id_elemen] = {
          id_detail: item.id_detail,
          id_elemen: item.id_elemen,
          kompeten: item.kompeten || "",
          catatan: item.catatan || "",
          buktiTambahan: item.buktiTambahan || []
        };
      });

      setAnswers(mapped);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("GET APL02 ERROR:", err);
      }
    }
  };

  const getImageSrc = (filePath) => {
    if (!filePath) return "";
    if (String(filePath).startsWith("http")) return filePath;

    return `${APP_BASE}/${String(filePath).replace(/^\/+/, "")}`;
  };

  const ttdUrl =
    files.ttd ||
    files.tanda_tangan ||
    files.ttd_path ||
    getImageSrc(profile?.ttd_path);

  const isLocked = apl02?.status === "submitted";

  const getUnit = (row) => {
    return row.unit || row.UnitKompetensi || row;
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
    return unit?.elemen || unit?.UnitElemen || unit?.unit_elemen || [];
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
    return elemen?.kuk || elemen?.UnitKuk || elemen?.unit_kuk || [];
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
    return formUnits.reduce((total, row) => {
      const unit = getUnit(row);
      return total + getElemenList(unit).length;
    }, 0);
  }, [formUnits]);

  const totalTerisi = useMemo(() => {
    return Object.values(answers).filter((item) => item?.kompeten).length;
  }, [answers]);

  const progress = totalElemen > 0 ? Math.round((totalTerisi / totalElemen) * 100) : 0;

  const updateAnswer = (id_elemen, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id_elemen]: {
        ...prev[id_elemen],
        id_elemen,
        [field]: value
      }
    }));
  };

  const savePenilaian = async (id_elemen) => {
  const answer = answers[id_elemen] || {};
  if (!answer.fileBukti) {
    alert("Upload bukti terlebih dahulu.");
    return;
}

  if (!answer.kompeten) {
    alert("Pilih K atau BK dulu.");
    return;
  }

  if (!apl02?.id_apl02) {
    alert("APL02 belum dibuat. Refresh halaman.");
    return;
  }

  if (isLocked) {
    alert("APL02 sudah submit.");
    return;
  }

  try {
    setSavingKey(`penilaian-${id_elemen}`);

    const unit = formUnits.find((u) =>
      getElemenList(getUnit(u)).some(
        (e) => e.id_elemen === id_elemen
      )
    );

    const res = await axios.post(
      `${API}/asesi/apl02/penilaian`,
      {
        id_apl02: apl02.id_apl02,
        id_unit: getUnit(unit).id_unit,
        id_elemen,
        kompeten: answer.kompeten,
        catatan: answer.catatan || ""
      },
      {
        headers
      }
    );

    const detail = res.data.data;

    if (answer.fileBukti) {
        const formData = new FormData();

        formData.append("id_detail", detail.id_detail);
        formData.append("file_bukti", answer.fileBukti);

        await axios.post(
            `${API}/asesi/apl02/upload`,
            formData,
            {
                headers: {
                    ...headers,
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        await loadExistingApl02();
    }

    setAnswers((prev) => ({
        ...prev,
        [id_elemen]: {
            ...prev[id_elemen],
            id_detail: detail.id_detail
        }
    }));

    alert("Penilaian berhasil disimpan.");
  } catch (err) {
    console.error("SAVE PENILAIAN ERROR:", err);

    alert(
      err.response?.data?.message ||
      "Gagal menyimpan penilaian."
    );
  } finally {
    setSavingKey("");
  }
};

const hapusBukti = async (id_bukti) => {
  if (!window.confirm("Yakin ingin menghapus bukti ini?")) return;

  try {
    await axios.delete(
      `${API}/asesi/apl02/bukti/${id_bukti}`,
      {
        headers,
      }
    );

    await loadExistingApl02();

    alert("Bukti berhasil dihapus.");
  } catch (err) {
    console.error("HAPUS BUKTI ERROR:", err);

    alert(
      err.response?.data?.message ||
      "Gagal menghapus bukti."
    );
  }
};

const saveRekomendasi = async (silent = false) => {
  if (!apl02?.id_apl02) {
    if (!silent) {
      alert("APL02 belum dibuat.");
    }
    return false;
  }

  if (isLocked) {
    if (!silent) {
      alert("APL02 sudah submit.");
    }
    return false;
  }

  try {
    setSavingKey("rekomendasi");

    await axios.post(
      `${API}/asesi/apl02/rekomendasi`,
      {
        id_apl02: apl02.id_apl02,
        rekomendasi_asesi: rekomendasi,
        pendekatan_rekomendasi: pendekatan
      },
      {
        headers
      }
    );

    if (!silent) {
      alert("Rekomendasi berhasil disimpan.");
    }

    return true;
  } catch (err) {
    console.error("SAVE REKOMENDASI ERROR:", err);

    if (!silent) {
      alert(
        err.response?.data?.message ||
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
      alert("APL02 belum dibuat.");
      return;
    }

    if (totalTerisi !== totalElemen) {
      alert("Masih ada elemen kompetensi yang belum diisi.");
      return;
    }

    try {
      setSubmitting(true);

      const saved = await saveRekomendasi(true);

        if (!saved) {
          return;
        }

        await axios.put(
          `${API}/asesi/apl02/submit/${apl02.id_apl02}`,
          {},
          {
            headers
          }
        );

      alert("APL02 berhasil disubmit.");

      await loadPage();
    } catch (err) {
      console.error("SUBMIT APL02 ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Gagal submit APL02."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = () => {
    if (!idPeserta) {
      alert("ID peserta tidak ditemukan.");
      return;
    }

    window.open(`${API}/asesi/apl02/pdf/${idPeserta}`, "_blank");
  };

  const formatTanggal = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 flex items-center gap-4">
          <Loader2 size={28} className="animate-spin text-orange-500" />
          <div>
            <h2 className="font-black text-[#071E3D]">Memuat APL02</h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-[1350px] mx-auto space-y-6">
          <section className="relative overflow-hidden bg-[#071E3D] rounded-[34px] shadow-sm p-6 lg:p-8 text-white">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/20" />
            <div className="absolute right-32 -bottom-24 h-64 w-64 rounded-full bg-white/5" />

            <button
              type="button"
              onClick={() => navigate("/asesi/jadwal-saya")}
              className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white hover:text-[#071E3D]"
            >
              <ArrowLeft size={15} />
              Kembali
            </button>

            <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-400/20 px-4 py-2">
                  <BookOpen size={15} className="text-orange-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">
                    FR.APL.02 Asesmen Mandiri
                  </span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black leading-tight">
                  Asesmen Mandiri
                </h1>

                <p className="mt-3 max-w-2xl text-white/70 font-semibold leading-relaxed">
                  Pilih K atau BK pada setiap elemen, lalu tuliskan bukti yang relevan sesuai kemampuan dan pengalaman.
                </p>
              </div>

              <div className="rounded-[28px] bg-white/10 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">
                    Progress
                  </span>
                  <span className="text-2xl font-black">{progress}%</span>
                </div>

                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-white/70">
                  {totalTerisi} dari {totalElemen} elemen sudah diisi.
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 flex gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] border-b border-slate-100">
                <div className="p-5 bg-slate-50">
                  <h3 className="font-black text-[#071E3D]">
                    Skema Sertifikasi
                  </h3>
                  <p className="text-sm font-semibold text-slate-400 mt-1">
                    KKNI / Okupasi / Klaster
                  </p>
                </div>

                <div className="grid grid-cols-[160px_1fr]">
                  <div className="p-4 border-b border-r border-slate-100 bg-slate-50 font-black text-slate-400 uppercase tracking-widest text-xs">
                    Judul
                  </div>
                  <div className="p-4 border-b border-slate-100 font-black text-[#071E3D]">
                    {skema?.judul_skema || "-"}
                  </div>

                  <div className="p-4 border-r border-slate-100 bg-slate-50 font-black text-slate-400 uppercase tracking-widest text-xs">
                    Nomor
                  </div>
                  <div className="p-4 font-black text-[#071E3D]">
                    {skema?.kode_skema || "-"}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-200 px-4 py-2 font-black text-[#071E3D]">
                    PANDUAN ASESMEN MANDIRI:
                  </div>

                  <div className="p-4 text-sm font-semibold text-[#071E3D] leading-relaxed">
                    <p className="font-black mb-2">Instruksi:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Baca setiap pertanyaan di kolom sebelah kiri.</li>
                      <li>
                        Beri tanda centang pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan.
                      </li>
                      <li>
                        Isi kolom bukti yang relevan untuk menunjukkan bahwa Anda melakukan pekerjaan.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <aside className="bg-white border border-slate-100 rounded-[32px] shadow-sm p-5">
              <h3 className="font-black text-[#071E3D] mb-4">
                Ringkasan APL02
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <InfoBox label="ID Peserta" value={idPeserta || "-"} />
                <InfoBox label="ID APL02" value={apl02?.id_apl02 || "-"} />
                <InfoBox label="Status" value={apl02?.status || "draft"} />
                <InfoBox label="Progress" value={`${totalTerisi}/${totalElemen}`} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={loadPage}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] hover:bg-orange-500 hover:text-white"
                >
                  <Download size={16} />
                  PDF
                </button>

                <button
                  type="button"
                  onClick={submitApl02}
                  disabled={submitting || isLocked}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D] disabled:bg-slate-300"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isLocked ? (
                    <BadgeCheck size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  {isLocked ? "Sudah Submit" : "Submit"}
                </button>
              </div>
            </aside>
          </section>

          {formUnits.length === 0 ? (
            <section className="bg-white rounded-[32px] border border-dashed border-slate-200 p-10 text-center">
              <FileText size={40} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-[#071E3D]">
                Unit Kompetensi Belum Ada
              </h3>
              <p className="text-slate-400 font-semibold mt-2">
                Belum ada data unit, elemen, dan KUK untuk skema ini.
              </p>
            </section>
          ) : (
            formUnits.map((row, unitIndex) => {
              const unit = getUnit(row);
              const elemenList = getElemenList(unit);

              return (
                <section
                  key={`${row.id_unit || unit.id_unit || unitIndex}`}
                  className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] border-b border-slate-100">
                    <div className="bg-orange-50 p-5 font-black text-orange-600 flex items-center gap-2">
                      <FileCheck2 size={18} />
                      Unit {unitIndex + 1}
                    </div>

                    <div>
                      <div className="grid grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                          Kode Unit
                        </div>
                        <div className="p-3 font-black text-[#071E3D]">
                          {getUnitKode(unit)}
                        </div>
                      </div>

                      <div className="grid grid-cols-[140px_1fr]">
                        <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                          Judul Unit
                        </div>
                        <div className="p-3 font-black text-[#071E3D]">
                          {getUnitJudul(unit)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 px-3 py-3 text-left w-[70px] font-black text-[#071E3D]">
                            No.
                          </th>
                          <th className="border border-slate-200 px-3 py-3 text-left font-black text-[#071E3D]">
                            Dapatkah Saya ..................?
                          </th>
                          <th className="border border-slate-200 px-3 py-3 text-center w-[70px] font-black text-[#071E3D]">
                            K
                          </th>
                          <th className="border border-slate-200 px-3 py-3 text-center w-[70px] font-black text-[#071E3D]">
                            BK
                          </th>
                          <th className="border border-slate-200 px-3 py-3 text-left w-[300px] font-black text-[#071E3D]">
                            Bukti yang relevan
                          </th>
                          <th className="border border-slate-200 px-3 py-3 text-center w-[100px] font-black text-[#071E3D]">
                            Simpan
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {elemenList.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="border border-slate-200 px-4 py-8 text-center text-slate-400 font-semibold"
                            >
                              Elemen belum tersedia.
                            </td>
                          </tr>
                        ) : (
                          elemenList.map((elemen, elemenIndex) => {
                            const idElemen = elemen.id_elemen;
                            const answer = answers[idElemen] || {};
                            const kukList = getKukList(elemen);
                            const isSaving = savingKey === `penilaian-${idElemen}`;

                            return (
                              <tr
                                key={idElemen || elemenIndex}
                                className={answer.kompeten ? "bg-white" : "bg-orange-50/20"}
                              >
                                <td className="border border-slate-200 px-3 py-4 align-top font-black text-[#071E3D]">
                                  {elemenIndex + 1}.
                                </td>

                                <td className="border border-slate-200 px-3 py-4 align-top">
                                  <h4 className="font-black text-[#071E3D]">
                                    Elemen: {getElemenText(elemen)}
                                  </h4>

                                  <p className="mt-3 font-black text-sm text-[#071E3D]">
                                    Kriteria Unjuk Kerja:
                                  </p>

                                  <ol className="mt-2 space-y-2 text-sm font-semibold text-[#071E3D] pl-5 list-decimal">
                                    {kukList.length === 0 ? (
                                      <li>KUK belum tersedia.</li>
                                    ) : (
                                      kukList.map((kuk, kukIndex) => (
                                        <li key={kuk.id_kuk || kukIndex}>
                                          {getKukText(kuk)}
                                        </li>
                                      ))
                                    )}
                                  </ol>
                                </td>

                                <td className="border border-slate-200 px-3 py-4 align-top text-center">
                                  <input
                                    type="checkbox"
                                    checked={answer.kompeten === "K"}
                                    disabled={isLocked}
                                    onChange={() => updateAnswer(idElemen, "kompeten", "K")}
                                    className="h-6 w-6 accent-orange-500"
                                  />
                                </td>

                                <td className="border border-slate-200 px-3 py-4 align-top text-center">
                                  <input
                                    type="checkbox"
                                    checked={answer.kompeten === "BK"}
                                    disabled={isLocked}
                                    onChange={() => updateAnswer(idElemen, "kompeten", "BK")}
                                    className="h-6 w-6 accent-orange-500"
                                  />
                                </td>

                                

                                <td className="border border-slate-200 px-3 py-4 align-top">

                                {answer.fileBukti && (
                                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <FileCheck2 size={20} className="text-green-500" />
                                      <div>
                                        <p className="font-semibold text-[#071E3D]">
                                          {answer.fileBukti.name}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                          Siap disimpan
                                        </p>
                                      </div>
                                    </div>
                                    <CheckCircle size={18} className="text-green-500" />
                                  </div>
                                </div>
                              )}

                                {answer.buktiTambahan?.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    <p className="text-sm font-bold text-[#071E3D]">Bukti yang sudah diupload</p>

                                    {answer.buktiTambahan.map((file) => (
                                      <div key={file.id_bukti} className="rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2">
                                            <FileCheck2 size={18} className="text-green-500" />
                                            <p className="font-semibold text-[#071E3D]">
                                              {file.nama_file}
                                            </p>
                                          </div>
                                            <p className="text-xs text-green-600">✔ Berhasil diupload</p>
                                          </div>

                                          <div className="flex items-center gap-2">
                                          <a
                                            href={getImageSrc(file.file_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                                          >
                                            <Eye size={18} />
                                          </a>

                                          {!isLocked && (
                                          <button
                                            type="button"
                                            onClick={() => hapusBukti(file.id_bukti)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                          >
                                            <Trash2 size={18}/>
                                          </button>
                                          )}

                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                                                {!isLocked && (
                                <label className="block cursor-pointer rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4 hover:bg-orange-100 transition">
                                <input
                                  type="file"
                                  className="hidden"
                                  disabled={isLocked}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setAnswers(prev => ({
                                      ...prev,
                                      [idElemen]: {
                                        ...prev[idElemen],
                                        fileBukti: file
                                      }
                                    }));
                                  }}
                                />

                                <div className="flex flex-col items-center gap-2">
                                  <Upload size={34} className="text-orange-500" />
                                  <p className="font-bold text-[#071E3D]">
                                  {answer.fileBukti
                                    ? "File berhasil dipilih"
                                    : answer.buktiTambahan?.length > 0
                                    ? "Tambah Bukti"
                                    : "Klik untuk memilih file"}
                                </p>
                                  <p className="text-xs text-slate-500">
                                    {answer.fileBukti
                                      ? answer.fileBukti.name
                                      : answer.buktiTambahan?.length > 0
                                      ? "Tambahkan bukti pendukung lainnya"
                                      : "PDF, JPG, PNG"}
                                  </p>
                                </div>
                              </label>
                              )}

                                <label className="mb-2 mt-4 block text-sm font-bold text-[#071E3D]">
                                  Catatan / Bukti Pendukung
                                </label>

                                <textarea
                                  value={answer.catatan || ""}
                                  disabled={isLocked}
                                  onChange={(e) =>
                                    updateAnswer(idElemen, "catatan", e.target.value)
                                  }
                                  placeholder="Tulis bukti yang relevan..."
                                  className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-[#071E3D] outline-none focus:border-orange-300 focus:bg-white disabled:opacity-70"
                                />
                              </td>

                                <td className="border border-slate-200 px-3 py-4 align-top text-center">
                                  <button
                                    type="button"
                                    disabled={isLocked || isSaving}
                                    onClick={() => savePenilaian(idElemen)}
                                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-3 py-3 text-white hover:bg-[#071E3D] disabled:bg-slate-300"
                                  >
                                    {isSaving ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Save size={16} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })
          )}

          <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <PenLine size={20} className="text-orange-500" />
                  <h3 className="font-black text-[#071E3D] text-xl">
                    Rekomendasi untuk Asesi
                  </h3>
                </div>

                <textarea
                  value={rekomendasi}
                  disabled={isLocked}
                  onChange={(e) => setRekomendasi(e.target.value)}
                  placeholder="Tulis rekomendasi untuk asesi..."
                  className="min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none focus:border-orange-300 focus:bg-white disabled:opacity-70"
                />

                <div className="mt-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Asesmen dapat / tidak dapat dilanjutkan melalui pendekatan
                  </label>

                  <input
                    type="text"
                    value={pendekatan}
                    disabled={isLocked}
                    onChange={(e) => setPendekatan(e.target.value)}
                    placeholder="Contoh: observasi, portofolio, wawancara..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none focus:border-orange-300 focus:bg-white disabled:opacity-70"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLocked || savingKey === "rekomendasi"}
                  onClick={() => saveRekomendasi(false)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D] disabled:bg-slate-300"
                >
                  {savingKey === "rekomendasi" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Simpan Rekomendasi
                </button>
              </div>

              <div className="p-6 bg-slate-50/60">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={20} className="text-orange-500" />
                  <h3 className="font-black text-[#071E3D] text-xl">
                    Validasi Asesi
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                  <div className="grid grid-cols-[130px_1fr] border-b border-slate-100">
                    <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                      Nama
                    </div>
                    <div className="p-3 font-bold text-[#071E3D]">
                      {profile?.nama_lengkap || "-"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[130px_1fr]">
                    <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                      Tanda tangan / Tanggal
                    </div>
                    <div className="p-3 min-h-[130px]">
                      {ttdUrl ? (
                        <img
                          src={ttdUrl}
                          alt="TTD Asesi"
                          className="max-h-[90px] object-contain"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-red-500">
                          TTD asesi belum tersedia di profile.
                        </div>
                      )}

                      <p className="text-sm font-semibold text-slate-500 mt-2">
                        {formatTanggal(new Date())}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-white overflow-hidden">
                  <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                    Ditinjau Oleh Asesor
                  </div>

                  <div className="grid grid-cols-[130px_1fr] border-b border-slate-100">
                    <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                      Nama
                    </div>
                    <div className="p-3 text-slate-400 font-semibold">
                      Diisi oleh asesor
                    </div>
                  </div>

                  <div className="grid grid-cols-[130px_1fr]">
                    <div className="p-3 bg-slate-50 font-black text-[#071E3D]">
                      No. Reg
                    </div>
                    <div className="p-3 text-slate-400 font-semibold">
                      Diisi oleh asesor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
            >
              <Download size={16} />
              Download PDF
            </button>

            <button
              type="button"
              onClick={submitApl02}
              disabled={submitting || isLocked}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D] disabled:bg-slate-300"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isLocked ? (
                <BadgeCheck size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              {isLocked ? "Sudah Submit" : "Submit APL02"}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-black text-[#071E3D]">{value}</p>
    </div>
  );
}