// frontend/src/pages/Asesor/IsiMKVA.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

const MANUAL_PREFIX = "manual:";

const tujuanOptions = [
  ["bagian_penjaminan_mutu", "Bagian dari proses penjaminan mutu organisasi"],
  ["mengantisipasi_risiko", "Mengantisipasi risiko"],
  ["memenuhi_persyaratan_bnsp", "Memenuhi persyaratan BNSP"],
  ["memastikan_kesesuaian_bukti", "Memastikan kesesuaian bukti-bukti"],
  ["meningkatkan_kualitas_asesmen", "Meningkatkan kualitas asesmen"],
  ["mengevaluasi_kualitas_perangkat_asesmen", "Mengevaluasi kualitas perangkat asesmen"],
  ["manual_tujuan", ""],
];

const konteksOptions = [
  ["internal_organisasi", "Internal organisasi"],
  ["eksternal_organisasi", "Eksternal organisasi"],
  ["proses_lisensi_relisensi", "Proses lisensi/re lisensi"],
  ["dengan_kolega_asesor", "Dengan kolega asesor"],
  ["kolega_organisasi_pelatihan_atau_asesmen", "Kolega dari organisasi pelatihan atau asesmen"],
  ["manual_konteks", ""],
];

const pendekatanOptions = [
  ["panel_asesmen", "Panel asesmen"],
  ["pertemuan_moderasi", "Pertemuan moderasi"],
  ["mengkaji_perangkat_asesmen", "Mengkaji perangkat asesmen"],
  ["acuan_pembanding", "Acuan pembanding"],
  ["pengujian_lapangan_uji_coba_perangkat_asesmen", "Pengujian lapangan dan uji coba perangkat asesmen"],
  ["umpan_balik_klien", "Umpan balik dari klien"],
  ["manual_pendekatan", ""],
];

const acuanOptions = [
  ["standar_kompetensi", "Standar kompetensi"],
  ["sop_ik", "SOP/IK"],
  ["manual_instruction_book", "Manual Instruction/book"],
  ["standar_kinerja", "Standar Kinerja"],
  ["manual_acuan", ""],
];

const dokumenOptions = [
  ["skema_sertifikasi", "Skema sertifikasi"],
  ["skkni_sk3_ski", "SKKNI/SK3/SKI"],
  ["perangkat_asesmen", "Perangkat asesmen"],
  ["peraturan_pedoman", "Peraturan/Pedoman"],
  ["manual_dokumen", ""],
];

const komunikasiOptions = [
  ["pro_aktif", "PRO AKTIF"],
  ["active_listening", "ACTIVE LISTENING"],
  ["komunikasi_lisan_tertulis_visual", "Komunikasi lisan, tertulis dan Visual"],
  ["manual_komunikasi", ""],
];

const defaultDetail = [
  {
    aspek: "Proses asesmen",
    V: false,
    A: false,
    T: false,
    M: false,
    Vp: false,
    R: false,
    F: false,
    FL: false,
  },
  {
    aspek: "Rencana asesmen",
    V: true,
    A: false,
    T: false,
    M: true,
    Vp: true,
    R: true,
    F: true,
    FL: false,
  },
  {
    aspek: "Interpretasi standar kompetensi",
    V: true,
    A: false,
    T: false,
    M: true,
    Vp: true,
    R: true,
    F: true,
    FL: false,
  },
  {
    aspek: "Interpretasi acuan pembanding lainnya",
    V: true,
    A: false,
    T: false,
    M: true,
    Vp: true,
    R: true,
    F: true,
    FL: false,
  },
  {
    aspek: "Penyeleksian dan penerapan metode asesmen",
    V: true,
    A: false,
    T: false,
    M: true,
    Vp: true,
    R: true,
    F: true,
    FL: false,
  },
  {
    aspek: "Penyeleksian dan penerapan perangkat asesmen",
    V: true,
    A: false,
    T: false,
    M: true,
    Vp: true,
    R: true,
    F: true,
    FL: false,
  },
  {
    aspek: "Bukti-bukti yang dikumpulkan",
    V: false,
    A: false,
    T: false,
    M: false,
    Vp: false,
    R: false,
    F: false,
    FL: false,
  },
  {
    aspek: "Proses pengambilan keputusan",
    V: false,
    A: false,
    T: false,
    M: false,
    Vp: false,
    R: false,
    F: false,
    FL: false,
  },
];

const defaultTemuan = [
  {
    temuan:
      "Validitas perangkat asesmen belum dapat dipastikan terbukti pada FR.IA-01 tidak ada SOP Industri/lembaga tidak sesuai dengan SKKNI Unit P85ASM00.001.2",
    rekomendasi:
      "Dilakukan perbaikan pada FR.IA.01 pada Kolom SOP perlu dituliskan Industri",
  },
  {
    temuan:
      "Validitas perangkat asesmen belum dapat dipastikan terbukti FR.IA-06 belum memenuhi 5 dimensi kompetensi. Tidak sesuai dengan SKKNI Unit P85ASM00.001.2,",
    rekomendasi:
      "Dilakukan perbaikan pada FR.IA.06 untuk memenuhi dimensi CMS dan TRS",
  },
  {
    temuan:
      "Validitas perangkat Asesmen MAPA 1 belum dapat dipastikan terbukti belum divalidasi. Tidak sesuai dengan SKKNI unit P85ASM00.001.2,",
    rekomendasi:
      "Dilakukan perbaikan pada MAPA 01 dengan memvalidasi perangkat tersebut",
  },
  {
    temuan: "",
    rekomendasi: "",
  },
];

const defaultRencana = [
  {
    rencana:
      "Dilakukan perbaikan pada FR.IA.01 pada Kolom SOP harus dituliskan dan dilampirkan",
    target_waktu: "60 menit",
    penanggung_jawab: "Manajer sertifikasi\nDitulis Pemilik berkas",
  },
  {
    rencana:
      "Dilakukan perbaikan pada FR.IA.06 untuk memenuhi dimensi CMS dan TRS",
    target_waktu: "60 menit",
    penanggung_jawab: "",
  },
  {
    rencana:
      "Dilakukan perbaikan pada MAPA 01 dengan memvalidasi perangkat tersebut",
    target_waktu: "60 menit",
    penanggung_jawab: "",
  },
  {
    rencana: "",
    target_waktu: "",
    penanggung_jawab: "",
  },
];

const defaultForm = {
  periode: "sebelum_asesmen",

  tujuan_fokus_validasi: ["mengevaluasi_kualitas_perangkat_asesmen"],
  konteks_validasi: ["dengan_kolega_asesor"],
  pendekatan_validasi: ["mengkaji_perangkat_asesmen"],

  manual_tujuan: "",
  manual_konteks: "",
  manual_pendekatan: "",
  manual_acuan: "",
  manual_dokumen: "",
  manual_komunikasi: "",

  asesor_kompetensi: [],
  lead_asesor: "",
  manajer_supervisor: "",
  tenaga_ahli: "",
  koord_pelatihan: "",
  anggota_asosiasi: "",

  hasil_konfirmasi:
    "Disetujui oleh Ketua LSP\nMengevaluasi kualitas perangkat asesmen\nDengan kolega asesor\nMengkaji perangkat asesmen",

  acuan_pembanding: ["standar_kompetensi", "sop_ik", "manual_instruction_book"],
  dokumen_terkait: [
    "skema_sertifikasi",
    "skkni_sk3_ski",
    "perangkat_asesmen",
    "peraturan_pedoman",
  ],
  keterampilan_komunikasi: [
    "pro_aktif",
    "active_listening",
    "komunikasi_lisan_tertulis_visual",
  ],

  detail_penilaian: defaultDetail,
  temuan_rekomendasi: defaultTemuan,
  rencana_implementasi: defaultRencana,
};

export default function IsiMKVA() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const routeId =
    params.id_jadwal || params.idJadwal || params.id_mkva || params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [profile, setProfile] = useState(null);
  const [jadwal, setJadwal] = useState(location.state?.item || null);
  const [idMkva, setIdMkva] = useState(location.state?.item?.id_mkva || null);
  const [form, setForm] = useState(defaultForm);

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const currentJadwalId =
    jadwal?.id_jadwal || location.state?.item?.id_jadwal || routeId;

  const namaAsesor =
    profile?.nama_lengkap ||
    profile?.profileAsesor?.nama_lengkap ||
    profile?.user?.username ||
    profile?.username ||
    "Bambang";

  const namaSkema =
    jadwal?.skema?.judul_skema ||
    jadwal?.judul_skema ||
    jadwal?.skema ||
    "OPERATOR FORKLIFT";

  const kodeSkema =
  jadwal?.kode_skema ||
  jadwal?.skema?.kode_skema ||
  "-";

  const tempat =
    jadwal?.tempat ||
    jadwal?.lokasi ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.nama_tuk ||
    "LSP – A3 I";

  const tanggal = jadwal?.tanggal || jadwal?.tgl_awal || "2021-04-06";

  const getPayload = (res) => res?.data?.data ?? res?.data ?? null;

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const splitRows = (text) => {
    if (!text) return [];
    return String(text)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const extractManual = (arrayValue) => {
    const arr = safeArray(arrayValue);
    const found = arr.find((item) => String(item).startsWith(MANUAL_PREFIX));
    return found ? String(found).replace(MANUAL_PREFIX, "") : "";
  };

  const cleanOptionArray = (arrayValue) => {
    return safeArray(arrayValue).filter(
      (item) => !String(item).startsWith(MANUAL_PREFIX)
    );
  };

  const combineManual = (arrayValue, manualValue) => {
    const clean = (Array.isArray(arrayValue) ? arrayValue : []).filter(
      (item) => !String(item).startsWith(MANUAL_PREFIX)
    );

    const manual = String(manualValue || "").trim();

    if (manual) {
      return [...clean, `${MANUAL_PREFIX}${manual}`];
    }

    return clean;
  };

  const normalizeDetail = (details) => {
    if (!Array.isArray(details) || details.length === 0) {
      return defaultDetail;
    }

    const mapped = details.map((item, index) => ({
      aspek: item.aspek || defaultDetail[index]?.aspek || "",
      V: Boolean(item.V ?? item.bukti_valid),
      A: Boolean(item.A ?? item.bukti_authentic),
      T: Boolean(item.T ?? item.bukti_terkini),
      M: Boolean(item.M ?? item.bukti_memadai),
      Vp: Boolean(item.Vp ?? item.prinsip_valid),
      R: Boolean(item.R ?? item.prinsip_reliable),
      F: Boolean(item.F ?? item.prinsip_fair),
      FL: Boolean(item.FL ?? item.prinsip_flexible),
    }));

    if (mapped.length < defaultDetail.length) {
      return [
        ...mapped,
        ...defaultDetail.slice(mapped.length),
      ];
    }

    return mapped;
  };

  const normalizeTemuan = (temuanText, rekomendasiText) => {
    const temuan = splitRows(temuanText);
    const rekomendasi = splitRows(rekomendasiText);
    const length = Math.max(temuan.length, rekomendasi.length);

    if (length === 0) return defaultTemuan;

    const rows = Array.from({ length }).map((_, index) => ({
      temuan: temuan[index] || "",
      rekomendasi: rekomendasi[index] || "",
    }));

    while (rows.length < 4) {
      rows.push({ temuan: "", rekomendasi: "" });
    }

    return rows;
  };

  const fillForm = (mkva) => {
    if (!mkva) return;

    setIdMkva(mkva.id_mkva);

    setForm((prev) => ({
      ...prev,

      periode: mkva.periode || prev.periode,

      tujuan_fokus_validasi:
        cleanOptionArray(mkva.tujuan_fokus_validasi).length > 0
          ? cleanOptionArray(mkva.tujuan_fokus_validasi)
          : prev.tujuan_fokus_validasi,
      konteks_validasi:
        cleanOptionArray(mkva.konteks_validasi).length > 0
          ? cleanOptionArray(mkva.konteks_validasi)
          : prev.konteks_validasi,
      pendekatan_validasi:
        cleanOptionArray(mkva.pendekatan_validasi).length > 0
          ? cleanOptionArray(mkva.pendekatan_validasi)
          : prev.pendekatan_validasi,

      manual_tujuan: extractManual(mkva.tujuan_fokus_validasi),
      manual_konteks: extractManual(mkva.konteks_validasi),
      manual_pendekatan: extractManual(mkva.pendekatan_validasi),
      manual_acuan: extractManual(mkva.acuan_pembanding),
      manual_dokumen: extractManual(mkva.dokumen_terkait),
      manual_komunikasi: extractManual(mkva.keterampilan_komunikasi),

      asesor_kompetensi:
        safeArray(mkva.asesor_kompetensi).length > 0
          ? safeArray(mkva.asesor_kompetensi)
          : prev.asesor_kompetensi,

      lead_asesor: mkva.lead_asesor || "",
      manajer_supervisor: mkva.manajer_supervisor || "",
      tenaga_ahli: mkva.tenaga_ahli || "",
      koord_pelatihan: mkva.koord_pelatihan || "",
      anggota_asosiasi: mkva.anggota_asosiasi || "",

      hasil_konfirmasi: mkva.hasil_konfirmasi || prev.hasil_konfirmasi,

      acuan_pembanding:
        cleanOptionArray(mkva.acuan_pembanding).length > 0
          ? cleanOptionArray(mkva.acuan_pembanding)
          : prev.acuan_pembanding,
      dokumen_terkait:
        cleanOptionArray(mkva.dokumen_terkait).length > 0
          ? cleanOptionArray(mkva.dokumen_terkait)
          : prev.dokumen_terkait,
      keterampilan_komunikasi:
        cleanOptionArray(mkva.keterampilan_komunikasi).length > 0
          ? cleanOptionArray(mkva.keterampilan_komunikasi)
          : prev.keterampilan_komunikasi,

      detail_penilaian: normalizeDetail(mkva.details || mkva.detail_penilaian),

      temuan_rekomendasi: normalizeTemuan(
        mkva.temuan_validasi,
        mkva.rekomendasi
      ),

      rencana_implementasi:
        safeArray(mkva.rencana_implementasi).length > 0
          ? safeArray(mkva.rencana_implementasi)
          : prev.rencana_implementasi,
    }));
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);

        const [profileRes, jadwalRes] = await Promise.all([
          axios.get(`${API_BASE}/asesor/profile`, authHeader).catch(() => null),
          axios.get(`${API_BASE}/asesor/mkva/jadwal`, authHeader),
        ]);

        if (cancelled) return;

        const profileData = getPayload(profileRes);
        const jadwalList = getPayload(jadwalRes) || [];

        setProfile(profileData);

        const foundJadwal =
          Array.isArray(jadwalList) &&
          jadwalList.find(
            (item) =>
              String(item.id_jadwal) === String(routeId) ||
              String(item.id_mkva) === String(routeId)
          );

        const mergedJadwal = {
          ...(location.state?.item || {}),
          ...(foundJadwal || {}),
        };

        setJadwal(mergedJadwal);

        const possibleMkvaId =
          location.state?.item?.id_mkva ||
          foundJadwal?.id_mkva ||
          params.id_mkva;

        let mkvaDetail = null;

        if (possibleMkvaId) {
          try {
            const detailRes = await axios.get(
              `${API_BASE}/asesor/mkva/${possibleMkvaId}`,
              authHeader
            );
            mkvaDetail = getPayload(detailRes);
          } catch {
            mkvaDetail = null;
          }
        }

        if (!mkvaDetail && mergedJadwal?.id_jadwal) {
          try {
            const byJadwalRes = await axios.get(
              `${API_BASE}/asesor/mkva/jadwal/${mergedJadwal.id_jadwal}`,
              authHeader
            );
            mkvaDetail = getPayload(byJadwalRes);
          } catch {
            mkvaDetail = null;
          }
        }

        if (mkvaDetail?.id_mkva) {
          fillForm(mkvaDetail);
        } else {
          const asesorName =
            profileData?.nama_lengkap ||
            profileData?.profileAsesor?.nama_lengkap ||
            profileData?.user?.username ||
            "Bambang";

          setForm((prev) => ({
            ...prev,
            asesor_kompetensi:
              prev.asesor_kompetensi.length > 0
                ? prev.asesor_kompetensi
                : [asesorName],
          }));
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data MKVA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, routeId]);

  const formatTanggal = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleArray = (field, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateDetailCheck = (index, field) => {
    setForm((prev) => ({
      ...prev,
      detail_penilaian: prev.detail_penilaian.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: !item[field],
            }
          : item
      ),
    }));
  };

  const updateDetailAspek = (index, value) => {
    setForm((prev) => ({
      ...prev,
      detail_penilaian: prev.detail_penilaian.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              aspek: value,
            }
          : item
      ),
    }));
  };

  const updateTemuan = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      temuan_rekomendasi: prev.temuan_rekomendasi.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const updateRencana = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      rencana_implementasi: prev.rencana_implementasi.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const buildPayload = () => ({
    periode: form.periode,

    tujuan_fokus_validasi: combineManual(
      form.tujuan_fokus_validasi,
      form.manual_tujuan
    ),
    konteks_validasi: combineManual(
      form.konteks_validasi,
      form.manual_konteks
    ),
    pendekatan_validasi: combineManual(
      form.pendekatan_validasi,
      form.manual_pendekatan
    ),

    asesor_kompetensi:
  form.asesor_kompetensi.filter((item) => String(item || "").trim()).length > 0
    ? form.asesor_kompetensi.filter((item) => String(item || "").trim())
    : [namaAsesor],
    lead_asesor: form.lead_asesor,
    manajer_supervisor: form.manajer_supervisor,
    tenaga_ahli: form.tenaga_ahli,
    koord_pelatihan: form.koord_pelatihan,
    anggota_asosiasi: form.anggota_asosiasi,

    hasil_konfirmasi: form.hasil_konfirmasi,

    acuan_pembanding: combineManual(form.acuan_pembanding, form.manual_acuan),
    dokumen_terkait: combineManual(form.dokumen_terkait, form.manual_dokumen),
    keterampilan_komunikasi: combineManual(
      form.keterampilan_komunikasi,
      form.manual_komunikasi
    ),

    detail_penilaian: form.detail_penilaian,

    temuan_validasi: form.temuan_rekomendasi
      .map((item) => item.temuan?.trim())
      .filter(Boolean)
      .join("\n"),
    rekomendasi: form.temuan_rekomendasi
      .map((item) => item.rekomendasi?.trim())
      .filter(Boolean)
      .join("\n"),

    rencana_implementasi: form.rencana_implementasi.filter(
      (item) => item.rencana || item.target_waktu || item.penanggung_jawab
    ),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.periode) {
      alert("Periode wajib dipilih");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      if (idMkva) {
        await axios.put(
          `${API_BASE}/asesor/mkva/${idMkva}/update`,
          payload,
          authHeader
        );
        alert("MKVA berhasil diperbarui");
      } else {
        await axios.post(
          `${API_BASE}/asesor/mkva/${currentJadwalId}/submit`,
          payload,
          authHeader
        );
        alert("MKVA berhasil disimpan");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan MKVA");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!idMkva) {
      alert("Simpan MKVA dulu sebelum download PDF");
      return;
    }

    try {
      setDownloading(true);

      const res = await axios.get(`${API_BASE}/asesor/mkva/${idMkva}/pdf`, {
        ...authHeader,
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `MKVA-${idMkva}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal download PDF MKVA");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-bold text-gray-700">Memuat form MKVA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 overflow-x-auto">
      <form
        onSubmit={handleSubmit}
        className="w-[820px] mx-auto text-[14px] text-black"
      >
        <div className="flex justify-between mb-4 print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded font-bold"
          >
            Kembali
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!idMkva || downloading}
              className="px-4 py-2 bg-blue-700 text-white rounded font-bold disabled:opacity-50"
            >
              {downloading ? "Mengunduh..." : "Download PDF"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-red-700 text-white rounded font-bold disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : idMkva ? "Update MKVA" : "Simpan MKVA"}
            </button>
          </div>
        </div>

        <h1 className="font-bold mb-3">
          FR.VA. MEMBERIKAN KONTRIBUSI DALAM VALIDASI ASESMEN
        </h1>

        <table className="w-full border-collapse border-2 border-black">
          <tbody>
            <tr>
              <td rowSpan="2" className="border border-black px-2 py-1 w-[150px]">
                Tim Validasi
              </td>

              <td className="border border-black px-2 py-1 red">
                1. {namaAsesor}
              </td>

              <td className="border border-black px-2 py-1 w-[110px]">
                Hari/Tanggal
              </td>

              <td className="border border-black px-2 py-1 red">
                : {formatTanggal(tanggal)}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 red"></td>
              <td className="border border-black px-2 py-1">Tempat</td>
              <td className="border border-black px-2 py-1 red">: {tempat}</td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1">Periode</td>

              <td colSpan="3" className="border border-black px-2 py-1">
                <Radio
                  checked={form.periode === "sebelum_asesmen"}
                  onChange={() => updateField("periode", "sebelum_asesmen")}
                  label="Sebelum Asessmen"
                />

                <Radio
                  checked={form.periode === "pada_saat_asesmen"}
                  onChange={() => updateField("periode", "pada_saat_asesmen")}
                  label="Pada saat Asesmen"
                />

                <Radio
                  checked={form.periode === "setelah_asesmen"}
                  onChange={() => updateField("periode", "setelah_asesmen")}
                  label="Setelah Asessmen"
                />
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1">Nama Skema</td>
              <td colSpan="3" className="border border-black px-2 py-1 red">
                : {namaSkema}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1">Kode Skema</td>
              <td colSpan="3" className="border border-black px-2 py-1 red">
                : {kodeSkema}
              </td>
            </tr>
          </tbody>
        </table>

        <SectionTitle number="1" title="Menyiapkan proses validasi" />

        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr>
              <th className="border border-black px-2 py-2 text-left w-1/3">
                Tujuan dan fokus validasi
              </th>
              <th className="border border-black px-2 py-2 text-left w-1/3">
                Konteks validasi
              </th>
              <th className="border border-black px-2 py-2 text-left w-1/3">
                Pendekatan validasi
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 7 }).map((_, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-2 align-top">
                  {tujuanOptions[index] && (
                    <Check
                      checked={
                        tujuanOptions[index][0] === "manual_tujuan"
                          ? Boolean(form.manual_tujuan)
                          : form.tujuan_fokus_validasi.includes(
                              tujuanOptions[index][0]
                            )
                      }
                      onChange={() => {
                        if (tujuanOptions[index][0] !== "manual_tujuan") {
                          toggleArray("tujuan_fokus_validasi", tujuanOptions[index][0]);
                        }
                      }}
                      label={
                        tujuanOptions[index][0] === "manual_tujuan" ? (
                          <ManualInput
                            value={form.manual_tujuan}
                            onChange={(value) => updateField("manual_tujuan", value)}
                            placeholder="...................................."
                          />
                        ) : (
                          tujuanOptions[index][1]
                        )
                      }
                      bold={[
                        "memenuhi_persyaratan_bnsp",
                        "mengevaluasi_kualitas_perangkat_asesmen",
                      ].includes(tujuanOptions[index][0])}
                    />
                  )}
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  {konteksOptions[index] && (
                    <Check
                      checked={
                        konteksOptions[index][0] === "manual_konteks"
                          ? Boolean(form.manual_konteks)
                          : form.konteks_validasi.includes(konteksOptions[index][0])
                      }
                      onChange={() => {
                        if (konteksOptions[index][0] !== "manual_konteks") {
                          toggleArray("konteks_validasi", konteksOptions[index][0]);
                        }
                      }}
                      label={
                        konteksOptions[index][0] === "manual_konteks" ? (
                          <ManualInput
                            value={form.manual_konteks}
                            onChange={(value) => updateField("manual_konteks", value)}
                            placeholder="...................................."
                          />
                        ) : (
                          konteksOptions[index][1]
                        )
                      }
                      bold={[
                        "internal_organisasi",
                        "proses_lisensi_relisensi",
                      ].includes(konteksOptions[index][0])}
                    />
                  )}
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  {pendekatanOptions[index] && (
                    <Check
                      checked={
                        pendekatanOptions[index][0] === "manual_pendekatan"
                          ? Boolean(form.manual_pendekatan)
                          : form.pendekatan_validasi.includes(
                              pendekatanOptions[index][0]
                            )
                      }
                      onChange={() => {
                        if (pendekatanOptions[index][0] !== "manual_pendekatan") {
                          toggleArray("pendekatan_validasi", pendekatanOptions[index][0]);
                        }
                      }}
                      label={
                        pendekatanOptions[index][0] === "manual_pendekatan" ? (
                          <ManualInput
                            value={form.manual_pendekatan}
                            onChange={(value) =>
                              updateField("manual_pendekatan", value)
                            }
                            placeholder="...................................."
                          />
                        ) : (
                          pendekatanOptions[index][1]
                        )
                      }
                      bold={[
                        "mengkaji_perangkat_asesmen",
                        "pengujian_lapangan_uji_coba_perangkat_asesmen",
                      ].includes(pendekatanOptions[index][0])}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse border-2 border-black border-t-0">
          <tbody>
            <tr>
              <th className="border border-black px-2 py-2 w-[190px]">
                Orang yang relevan
              </th>
              <th className="border border-black px-2 py-2 w-[200px] text-left">
                Nama
              </th>
              <th className="border border-black px-2 py-2 text-left">
                Hasil konfirmasi/diskusi tujuan, fokus & konteks
              </th>
            </tr>

            <tr>
              <td className="border border-black px-2 py-2 align-top">
                <Check
                  checked={true}
                  readOnly
                  label="Asesor kompetensi (wajib)"
                  bold
                />
              </td>

              <td className="border border-black px-2 py-2 align-top">
                <input
                  value={form.asesor_kompetensi[0] || namaAsesor}
                  onChange={(e) => updateField("asesor_kompetensi", [e.target.value])}
                  className="w-full red outline-none bg-transparent"
                />
              </td>

              <td rowSpan="6" className="border border-black px-2 py-2 align-top">
                <textarea
                  value={form.hasil_konfirmasi}
                  onChange={(e) => updateField("hasil_konfirmasi", e.target.value)}
                  className="w-full h-[175px] red italic outline-none resize-none bg-transparent"
                />
              </td>
            </tr>

            {[
              ["lead_asesor", "Lead Asesor"],
              ["manajer_supervisor", "Manager, supervisor"],
              ["tenaga_ahli", "Tenaga ahli di bidangnya"],
              ["koord_pelatihan", "Koord. Pelatihan"],
              ["anggota_asosiasi", "Anggota asosiasi industry/profesi"],
            ].map(([field, label]) => (
              <tr key={field}>
                <td className="border border-black px-2 py-2">
                  <Check checked={Boolean(form[field])} readOnly label={label} />
                </td>

                <td className="border border-black px-2 py-2">
                  <input
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-full red outline-none bg-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse border-2 border-black mt-10">
          <tbody>
            <tr>
              <th className="border border-black px-2 py-2 text-left w-1/2">
                Acuan Pembanding :
              </th>

              <th className="border border-black px-2 py-2 text-left w-1/2">
                Dokumen terkait dan bahan-bahan :
              </th>
            </tr>

            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-2">
                  {acuanOptions[index] && (
                    <Check
                      checked={
                        acuanOptions[index][0] === "manual_acuan"
                          ? Boolean(form.manual_acuan)
                          : form.acuan_pembanding.includes(acuanOptions[index][0])
                      }
                      onChange={() => {
                        if (acuanOptions[index][0] !== "manual_acuan") {
                          toggleArray("acuan_pembanding", acuanOptions[index][0]);
                        }
                      }}
                      label={
                        acuanOptions[index][0] === "manual_acuan" ? (
                          <ManualInput
                            value={form.manual_acuan}
                            onChange={(value) => updateField("manual_acuan", value)}
                            placeholder="................................"
                          />
                        ) : (
                          acuanOptions[index][1]
                        )
                      }
                      bold={index < 3}
                    />
                  )}
                </td>

                <td className="border border-black px-2 py-2">
                  {dokumenOptions[index] && (
                    <Check
                      checked={
                        dokumenOptions[index][0] === "manual_dokumen"
                          ? Boolean(form.manual_dokumen)
                          : form.dokumen_terkait.includes(dokumenOptions[index][0])
                      }
                      onChange={() => {
                        if (dokumenOptions[index][0] !== "manual_dokumen") {
                          toggleArray("dokumen_terkait", dokumenOptions[index][0]);
                        }
                      }}
                      label={
                        dokumenOptions[index][0] === "manual_dokumen" ? (
                          <ManualInput
                            value={form.manual_dokumen}
                            onChange={(value) => updateField("manual_dokumen", value)}
                            placeholder="................................"
                          />
                        ) : (
                          dokumenOptions[index][1]
                        )
                      }
                      bold={index < 4}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle number="2" title="Memberikan kontribusi dalam proses validasi" />

        <table className="w-full border-collapse border-2 border-black">
          <tbody>
            <tr>
              <td
                rowSpan="4"
                className="border border-black px-2 py-2 w-[380px] align-top"
              >
                Keterampilan komunikasi yang <br />
                digunakan dalam kegiatan validasi :
              </td>

              <td className="border border-black px-2 py-2">
                <Check
                  checked={form.keterampilan_komunikasi.includes("pro_aktif")}
                  onChange={() => toggleArray("keterampilan_komunikasi", "pro_aktif")}
                  label="PRO AKTIF"
                />
              </td>
            </tr>

            {komunikasiOptions.slice(1).map(([value, label]) => (
              <tr key={value}>
                <td className="border border-black px-2 py-2">
                  <Check
                    checked={
                      value === "manual_komunikasi"
                        ? Boolean(form.manual_komunikasi)
                        : form.keterampilan_komunikasi.includes(value)
                    }
                    onChange={() => {
                      if (value !== "manual_komunikasi") {
                        toggleArray("keterampilan_komunikasi", value);
                      }
                    }}
                    label={
                      value === "manual_komunikasi" ? (
                        <ManualInput
                          value={form.manual_komunikasi}
                          onChange={(val) => updateField("manual_komunikasi", val)}
                          placeholder=""
                        />
                      ) : (
                        label
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse border-2 border-black mt-10">
          <thead>
            <tr>
              <th rowSpan="3" className="border border-black px-2 py-2 w-[40px]">
                No.
              </th>

              <th rowSpan="3" className="border border-black px-2 py-2 w-[360px]">
                Aspek-Aspek Dalam Kegiatan Validasi
                <div className="font-normal mt-1">
                  (Meninjau, Membandingkan, Mengevaluasi)
                </div>
              </th>

              <th colSpan="8" className="border border-black px-2 py-2">
                Pemenuhan Terhadap :
              </th>
            </tr>

            <tr>
              <th colSpan="4" className="border border-black px-2 py-1">
                Aturan Bukti
              </th>
              <th colSpan="4" className="border border-black px-2 py-1">
                Prinsip Asesmen
              </th>
            </tr>

            <tr>
              {["V", "A", "T", "M", "V", "R", "F", "F"].map((head, index) => (
                <th key={index} className="border border-black px-2 py-1 w-[35px]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {form.detail_penilaian.map((item, index) => (
              <tr key={index}>
                <td className="border border-black text-center py-2">
                  {index + 1}.
                </td>

                <td className="border border-black px-2 py-2">
                  <input
                    value={item.aspek}
                    onChange={(e) => updateDetailAspek(index, e.target.value)}
                    className="w-full text-black outline-none bg-transparent"
                  />
                </td>

                {["V", "A", "T", "M", "Vp", "R", "F", "FL"].map((field) => (
                  <td key={field} className="border border-black text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(item[field])}
                      onChange={() => updateDetailCheck(index, field)}
                      className="w-4 h-4 accent-red-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle number="3" title="Memberikan kontribusi untuk hasil asesmen" />

        <table className="w-full border-collapse border-2 border-black">
          <tbody>
            <tr>
              <td className="border border-black px-2 py-2 w-[360px]">
                Temuan-temuan validasi :
              </td>

              <td className="border border-black px-2 py-2">
                Rekomendasi-rekomendasi untuk <br />
                meningkatkan praktek asesmen
              </td>
            </tr>

            {form.temuan_rekomendasi.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-2 align-top">
                  <div className="flex gap-2">
                    <span>{index + 1}.</span>

                    <textarea
                      value={item.temuan}
                      onChange={(e) => updateTemuan(index, "temuan", e.target.value)}
                      className="w-full min-h-[90px] red font-bold outline-none resize-none bg-transparent"
                    />
                  </div>
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <textarea
                    value={item.rekomendasi}
                    onChange={(e) =>
                      updateTemuan(index, "rekomendasi", e.target.value)
                    }
                    className="w-full min-h-[90px] red font-bold outline-none resize-none bg-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse border-2 border-black border-t-0">
          <tbody>
            <tr>
              <td colSpan="4" className="border border-black px-2 py-3 font-bold">
                Rencana Implementasi perubahan/perbaikan pelaksanaan asesmen :
              </td>
            </tr>

            <tr>
              <th className="border border-black px-2 py-2 w-[50px]">No.</th>

              <th className="border border-black px-2 py-2">
                Kegiatan Perbaikan sesuai <br />
                Rekomendasi
              </th>

              <th className="border border-black px-2 py-2 w-[150px]">
                Waktu <br />
                Penyelesaian
              </th>

              <th className="border border-black px-2 py-2 w-[180px]">
                Penanggungjawab
              </th>
            </tr>

            {form.rencana_implementasi.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-2 align-top">
                  {index + 1}.
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <textarea
                    value={item.rencana}
                    onChange={(e) => updateRencana(index, "rencana", e.target.value)}
                    className="w-full min-h-[70px] red font-bold outline-none resize-none bg-transparent"
                  />
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <input
                    value={item.target_waktu}
                    onChange={(e) =>
                      updateRencana(index, "target_waktu", e.target.value)
                    }
                    className="w-full red outline-none bg-transparent"
                  />
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <textarea
                    value={item.penanggung_jawab}
                    onChange={(e) =>
                      updateRencana(index, "penanggung_jawab", e.target.value)
                    }
                    className="w-full min-h-[70px] red outline-none resize-none bg-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <style>{`
          .red {
            color: #c1272d;
          }

          textarea,
          input {
            background: transparent;
          }

          textarea:focus,
          input:focus {
            outline: none;
          }

          th {
            font-weight: 700;
          }

          @media print {
            body {
              background: white;
            }
          }
        `}</style>
      </form>
    </div>
  );
}

function SectionTitle({ number, title }) {
  return (
    <table className="w-full border-collapse border-2 border-black mt-6">
      <tbody>
        <tr className="bg-[#f4b183]">
          <td className="border border-black px-2 py-2 w-[35px] font-bold text-center">
            {number}
          </td>

          <td className="border border-black px-2 py-2 font-bold">
            {title}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Check({ checked, onChange, label, bold = false, readOnly = false }) {
  return (
    <label className="inline-flex items-start gap-2 leading-snug w-full">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        className="w-4 h-4 accent-red-600 mt-[2px] shrink-0"
      />

      <span className={`${bold ? "font-bold" : ""} w-full`}>
        {label}
      </span>
    </label>
  );
}

function Radio({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 mr-5">
      <input
        type="radio"
        checked={Boolean(checked)}
        onChange={onChange}
        className="w-4 h-4 accent-red-600"
      />

      <span>{label}</span>
    </label>
  );
}

function ManualInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full red outline-none bg-transparent"
    />
  );
}