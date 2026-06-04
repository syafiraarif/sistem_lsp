// frontend/src/pages/asesor/IsiMKVA.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck,
  Hash,
  Info,
  Loader2,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const TUJUAN_OPTIONS = [
  {
    value: "bagian_penjaminan_mutu",
    label: "Bagian dari proses penjaminan mutu organisasi",
  },
  {
    value: "mengantisipasi_risiko",
    label: "Mengantisipasi risiko",
  },
  {
    value: "memenuhi_persyaratan_bnsp",
    label: "Memenuhi persyaratan BNSP",
  },
  {
    value: "memastikan_kesesuaian_bukti",
    label: "Memastikan kesesuaian bukti-bukti",
  },
  {
    value: "meningkatkan_kualitas_asesmen",
    label: "Meningkatkan kualitas asesmen",
  },
  {
    value: "mengevaluasi_kualitas_perangkat_asesmen",
    label: "Mengevaluasi kualitas perangkat asesmen",
  },
];

const KONTEKS_OPTIONS = [
  {
    value: "internal_organisasi",
    label: "Internal organisasi",
  },
  {
    value: "eksternal_organisasi",
    label: "Eksternal organisasi",
  },
  {
    value: "proses_lisensi_relisensi",
    label: "Proses lisensi/re lisensi",
  },
  {
    value: "dengan_kolega_asesor",
    label: "Dengan kolega asesor",
  },
  {
    value: "kolega_organisasi_pelatihan_atau_asesmen",
    label: "Kolega dari organisasi pelatihan atau asesmen",
  },
];

const PENDEKATAN_OPTIONS = [
  {
    value: "panel_asesmen",
    label: "Panel asesmen",
  },
  {
    value: "pertemuan_moderasi",
    label: "Pertemuan moderasi",
  },
  {
    value: "mengkaji_perangkat_asesmen",
    label: "Mengkaji perangkat asesmen",
  },
  {
    value: "acuan_pembanding",
    label: "Acuan pembanding",
  },
  {
    value: "pengujian_lapangan_uji_coba_perangkat_asesmen",
    label: "Pengujian lapangan dan uji coba perangkat asesmen",
  },
  {
    value: "umpan_balik_klien",
    label: "Umpan balik dari klien",
  },
];

const ORANG_RELEVAN_OPTIONS = [
  {
    value: "asesor_kompetensi",
    label: "Asesor kompetensi (wajib)",
  },
  {
    value: "lead_asesor",
    label: "Lead Asesor",
  },
  {
    value: "manager_supervisor",
    label: "Manager, supervisor",
  },
  {
    value: "tenaga_ahli",
    label: "Tenaga ahli di bidangnya",
  },
  {
    value: "koord_pelatihan",
    label: "Koord. Pelatihan",
  },
  {
    value: "anggota_asosiasi",
    label: "Anggota asosiasi industry/profesi",
  },
];

const ACUAN_OPTIONS = [
  {
    value: "standar_kompetensi",
    label: "Standar kompetensi",
  },
  {
    value: "skema_sertifikasi",
    label: "Skema sertifikasi",
  },
  {
    value: "sop_asesmen",
    label: "SOP asesmen",
  },
  {
    value: "persyaratan_bnsp",
    label: "Persyaratan BNSP",
  },
];

const DOKUMEN_OPTIONS = [
  {
    value: "perangkat_asesmen",
    label: "Perangkat asesmen",
  },
  {
    value: "rekaman_hasil_asesmen",
    label: "Rekaman hasil asesmen",
  },
  {
    value: "laporan_asesmen",
    label: "Laporan asesmen",
  },
  {
    value: "umpan_balik_asesi",
    label: "Umpan balik asesi",
  },
];

const KOMUNIKASI_OPTIONS = [
  {
    value: "komunikasi_lisan",
    label: "Komunikasi lisan",
  },
  {
    value: "komunikasi_tertulis",
    label: "Komunikasi tertulis",
  },
  {
    value: "diskusi_validasi",
    label: "Diskusi validasi",
  },
  {
    value: "klarifikasi_dengan_pihak_terkait",
    label: "Klarifikasi dengan pihak terkait",
  },
];

const DEFAULT_ASPEK = [
  "Perencanaan asesmen",
  "Perangkat asesmen",
  "Pelaksanaan asesmen",
  "Pengambilan keputusan asesmen",
  "Rekaman dan pelaporan asesmen",
];

const createDefaultDetail = () =>
  DEFAULT_ASPEK.map((aspek) => ({
    aspek,
    V: false,
    A: false,
    T: false,
    M: false,
    Vp: false,
    R: false,
    F: false,
    FL: false,
  }));

const defaultForm = {
  periode: "sebelum_asesmen",
  tujuan_fokus_validasi: [],
  konteks_validasi: [],
  pendekatan_validasi: [],
  orang_relevan: ["asesor_kompetensi"],
  asesor_kompetensi: [],
  hasil_konfirmasi: "",
  acuan_pembanding: [],
  dokumen_terkait: [],
  keterampilan_komunikasi: [],
  temuan_validasi: "",
  rekomendasi: "",
  rencana_implementasi: [
    {
      rencana: "",
      penanggung_jawab: "",
      target_waktu: "",
    },
  ],
  detail_penilaian: createDefaultDetail(),
};

const IsiMKVA = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const routeId =
    params.id_jadwal || params.idJadwal || params.id_mkva || params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [jadwal, setJadwal] = useState(location.state?.item || null);
  const [profile, setProfile] = useState(null);
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

  const currentJadwalId = useMemo(() => {
    return (
      jadwal?.id_jadwal ||
      location.state?.item?.id_jadwal ||
      (!params.id_mkva ? routeId : null)
    );
  }, [jadwal, location.state, params.id_mkva, routeId]);

  const namaAsesor = useMemo(() => {
    return (
      profile?.nama_lengkap ||
      profile?.profileAsesor?.nama_lengkap ||
      profile?.user?.username ||
      profile?.username ||
      "-"
    );
  }, [profile]);

  const getDataPayload = (res) => res?.data?.data || res?.data || null;

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value ? [value] : [];
      }
    }

    return [];
  };

  const normalizeDetail = (details = []) => {
    if (!Array.isArray(details) || details.length === 0) {
      return createDefaultDetail();
    }

    return details.map((item) => ({
      aspek: item.aspek || "",
      V: Boolean(item.V ?? item.bukti_valid),
      A: Boolean(item.A ?? item.bukti_authentic),
      T: Boolean(item.T ?? item.bukti_terkini),
      M: Boolean(item.M ?? item.bukti_memadai),
      Vp: Boolean(item.Vp ?? item.prinsip_valid),
      R: Boolean(item.R ?? item.prinsip_reliable),
      F: Boolean(item.F ?? item.prinsip_fair),
      FL: Boolean(item.FL ?? item.prinsip_flexible),
    }));
  };

  const fillFormFromMkva = (mkva) => {
    if (!mkva) return;

    setIdMkva(mkva.id_mkva || null);

    setForm((prev) => ({
      ...prev,
      periode: mkva.periode || "sebelum_asesmen",
      tujuan_fokus_validasi: safeArray(mkva.tujuan_fokus_validasi),
      konteks_validasi: safeArray(mkva.konteks_validasi),
      pendekatan_validasi: safeArray(mkva.pendekatan_validasi),
      asesor_kompetensi: safeArray(mkva.asesor_kompetensi),
      hasil_konfirmasi: mkva.hasil_konfirmasi || "",
      acuan_pembanding: safeArray(mkva.acuan_pembanding),
      dokumen_terkait: safeArray(mkva.dokumen_terkait),
      keterampilan_komunikasi: safeArray(mkva.keterampilan_komunikasi),
      temuan_validasi: mkva.temuan_validasi || "",
      rekomendasi: mkva.rekomendasi || "",
      rencana_implementasi:
        safeArray(mkva.rencana_implementasi).length > 0
          ? safeArray(mkva.rencana_implementasi)
          : prev.rencana_implementasi,
      detail_penilaian: normalizeDetail(mkva.details || mkva.detail_penilaian),
    }));
  };

  const fetchExistingMkvaByJadwal = useCallback(
    async (idJadwal) => {
      if (!idJadwal) return null;

      const tryUrls = [
        `${API_BASE}/asesor/mkva/jadwal/${idJadwal}`,
        `${API_BASE}/asesor/mkva-by-jadwal/${idJadwal}`,
      ];

      for (const url of tryUrls) {
        try {
          const res = await axios.get(url, authHeader);
          return getDataPayload(res);
        } catch {
          // endpoint ini optional, lanjut coba URL berikutnya
        }
      }

      return null;
    },
    [authHeader]
  );

  const fetchDetailByIdMkva = useCallback(
    async (mkvaId) => {
      if (!mkvaId) return null;

      try {
        const res = await axios.get(`${API_BASE}/asesor/mkva/${mkvaId}`, authHeader);
        return getDataPayload(res);
      } catch {
        return null;
      }
    },
    [authHeader]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [profileRes, jadwalRes] = await Promise.all([
        axios.get(`${API_BASE}/asesor/profile`, authHeader).catch(() => null),
        axios.get(`${API_BASE}/asesor/mkva/jadwal`, authHeader),
      ]);

      const profileData = getDataPayload(profileRes);
      const jadwalList = getDataPayload(jadwalRes) || [];

      setProfile(profileData);

      const fromList =
        Array.isArray(jadwalList) &&
        jadwalList.find((item) => {
          return (
            String(item.id_jadwal) === String(routeId) ||
            String(item.id_mkva) === String(routeId)
          );
        });

      const mergedJadwal = {
        ...(location.state?.item || {}),
        ...(fromList || {}),
      };

      setJadwal(mergedJadwal);

      const possibleIdMkva =
        location.state?.item?.id_mkva || fromList?.id_mkva || params.id_mkva;

      let mkvaDetail = null;

      if (possibleIdMkva) {
        mkvaDetail = await fetchDetailByIdMkva(possibleIdMkva);
      }

      if (!mkvaDetail && mergedJadwal?.id_jadwal) {
        mkvaDetail = await fetchExistingMkvaByJadwal(mergedJadwal.id_jadwal);
      }

      if (mkvaDetail?.id_mkva) {
        fillFormFromMkva(mkvaDetail);
      } else {
        setForm((prev) => ({
          ...prev,
          asesor_kompetensi:
            prev.asesor_kompetensi.length > 0
              ? prev.asesor_kompetensi
              : [profileData?.nama_lengkap || profileData?.user?.username || ""].filter(
                  Boolean
                ),
          hasil_konfirmasi:
            prev.hasil_konfirmasi ||
            "Disetujui oleh Ketua LSP\nMengevaluasi kualitas perangkat asesmen\nDengan kolega asesor\nMengkaji perangkat asesmen",
        }));
      }
    } catch (err) {
      console.error("Gagal memuat data MKVA:", err);

      if (err.response?.status === 401) {
        alert("Session habis, silakan login kembali");
        localStorage.clear();
        navigate("/login");
        return;
      }

      alert(err.response?.data?.message || "Gagal memuat data MKVA");
    } finally {
      setLoading(false);
    }
  }, [
    authHeader,
    routeId,
    location.state,
    params.id_mkva,
    navigate,
    fetchDetailByIdMkva,
    fetchExistingMkvaByJadwal,
  ]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [token, navigate, fetchData]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const toggleArrayValue = (field, value) => {
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

  const handleTextChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDetailChange = (index, field) => {
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

  const handleAspekChange = (index, value) => {
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

  const addDetailRow = () => {
    setForm((prev) => ({
      ...prev,
      detail_penilaian: [
        ...prev.detail_penilaian,
        {
          aspek: "",
          V: false,
          A: false,
          T: false,
          M: false,
          Vp: false,
          R: false,
          F: false,
          FL: false,
        },
      ],
    }));
  };

  const removeDetailRow = (index) => {
    setForm((prev) => ({
      ...prev,
      detail_penilaian: prev.detail_penilaian.filter((_, itemIndex) => {
        return itemIndex !== index;
      }),
    }));
  };

  const handleRencanaChange = (index, field, value) => {
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

  const addRencana = () => {
    setForm((prev) => ({
      ...prev,
      rencana_implementasi: [
        ...prev.rencana_implementasi,
        {
          rencana: "",
          penanggung_jawab: "",
          target_waktu: "",
        },
      ],
    }));
  };

  const removeRencana = (index) => {
    setForm((prev) => ({
      ...prev,
      rencana_implementasi: prev.rencana_implementasi.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const buildPayload = () => {
    return {
      periode: form.periode,
      tujuan_fokus_validasi: form.tujuan_fokus_validasi,
      konteks_validasi: form.konteks_validasi,
      pendekatan_validasi: form.pendekatan_validasi,
      asesor_kompetensi:
        form.asesor_kompetensi.length > 0
          ? form.asesor_kompetensi
          : [namaAsesor].filter((item) => item && item !== "-"),
      hasil_konfirmasi: form.hasil_konfirmasi,
      acuan_pembanding: form.acuan_pembanding,
      dokumen_terkait: form.dokumen_terkait,
      keterampilan_komunikasi: form.keterampilan_komunikasi,
      temuan_validasi: form.temuan_validasi,
      rekomendasi: form.rekomendasi,
      rencana_implementasi: form.rencana_implementasi.filter((item) => {
        return item.rencana || item.penanggung_jawab || item.target_waktu;
      }),
      detail_penilaian: form.detail_penilaian.filter((item) => item.aspek),
    };
  };

  const validateForm = () => {
    if (!form.periode) {
      alert("Periode wajib dipilih");
      return false;
    }

    if (form.tujuan_fokus_validasi.length === 0) {
      alert("Pilih minimal 1 tujuan dan fokus validasi");
      return false;
    }

    if (form.konteks_validasi.length === 0) {
      alert("Pilih minimal 1 konteks validasi");
      return false;
    }

    if (form.pendekatan_validasi.length === 0) {
      alert("Pilih minimal 1 pendekatan validasi");
      return false;
    }

    if (!form.hasil_konfirmasi.trim()) {
      alert("Hasil konfirmasi/diskusi wajib diisi");
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const idJadwal = currentJadwalId || routeId;

    if (!idJadwal && !idMkva) {
      alert("ID jadwal / ID MKVA tidak ditemukan");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      if (idMkva) {
        await axios.put(`${API_BASE}/asesor/mkva/${idMkva}/update`, payload, authHeader);
        alert("MKVA berhasil diperbarui");
      } else {
        await axios.post(
          `${API_BASE}/asesor/mkva/${idJadwal}/submit`,
          payload,
          authHeader
        );
        alert("MKVA berhasil disimpan");
      }

      await fetchData();
    } catch (err) {
      console.error("Gagal menyimpan MKVA:", err);
      alert(err.response?.data?.message || "Gagal menyimpan MKVA");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!idMkva) {
      alert("PDF belum bisa diunduh karena MKVA belum disimpan");
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
      console.error("Gagal download PDF:", err);
      alert(err.response?.data?.message || "Gagal download PDF MKVA");
    } finally {
      setDownloading(false);
    }
  };

  const displaySkema = jadwal?.skema?.judul_skema || jadwal?.skema || "-";
  const displayNomorSkema =
    jadwal?.skema?.kode_skema ||
    jadwal?.kode_skema ||
    jadwal?.nomor_skema ||
    jadwal?.skema?.nomor_skema ||
    "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2
            size={44}
            className="animate-spin text-orange-500 mx-auto mb-5"
          />
          <h2 className="text-xl font-black text-[#071E3D]">
            Memuat Form MKVA
          </h2>
          <p className="text-slate-400 font-bold text-sm mt-1">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-xs uppercase tracking-widest transition-colors"
              >
                <ArrowLeft size={17} />
                Kembali
              </button>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                <FileCheck size={15} className="text-orange-500" />
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                  FR.VA
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                Memberikan Kontribusi dalam Validasi Asesmen
              </h1>

              <p className="text-slate-500 mt-3 max-w-3xl font-medium leading-relaxed">
                Data tim validasi, tanggal, tempat, nama skema, dan nomor skema
                diambil otomatis dari jadwal. Kamu tinggal mengisi periode dan
                bagian validasinya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[420px]">
              <HeaderStat
                label="Status"
                value={idMkva ? "Sudah MKVA" : "Belum MKVA"}
                icon={<ShieldCheck size={20} />}
                active={Boolean(idMkva)}
              />

              <HeaderStat
                label="ID Jadwal"
                value={currentJadwalId || routeId || "-"}
                icon={<Hash size={20} />}
              />
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<ClipboardList size={22} />}
              title="Data Utama"
              subtitle="Terisi otomatis dari jadwal"
            />

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoBox label="Tim Validasi">
                  <div className="flex items-center gap-2">
                    <UserCheck size={17} className="text-orange-500" />
                    <span>{namaAsesor}</span>
                  </div>
                </InfoBox>

                <InfoBox label="Hari / Tanggal">
                  <div className="flex items-center gap-2">
                    <Calendar size={17} className="text-orange-500" />
                    <span>{formatDate(jadwal?.tanggal || jadwal?.tgl_awal)}</span>
                  </div>
                </InfoBox>

                <InfoBox label="Tempat">
                  <div className="flex items-center gap-2">
                    <MapPin size={17} className="text-orange-500" />
                    <span>
                      {jadwal?.tempat ||
                        jadwal?.lokasi ||
                        jadwal?.tuk?.nama_tuk ||
                        jadwal?.nama_tuk ||
                        "-"}
                    </span>
                  </div>
                </InfoBox>

                <InfoBox label="Total Asesi">
                  <div className="flex items-center gap-2">
                    <Users size={17} className="text-orange-500" />
                    <span>{jadwal?.total_asesi ?? "-"} Asesi</span>
                  </div>
                </InfoBox>

                <InfoBox label="Nama Skema">
                  <div className="flex items-center gap-2">
                    <Award size={17} className="text-orange-500" />
                    <span>{displaySkema}</span>
                  </div>
                </InfoBox>

                <InfoBox label="Nomor Skema">
                  <div className="flex items-center gap-2">
                    <Hash size={17} className="text-orange-500" />
                    <span>{displayNomorSkema}</span>
                  </div>
                </InfoBox>
              </div>

              <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Periode <span className="text-red-500">*</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <RadioBox
                    label="Sebelum Asesmen"
                    checked={form.periode === "sebelum_asesmen"}
                    onChange={() => handleTextChange("periode", "sebelum_asesmen")}
                  />
                  <RadioBox
                    label="Pada Saat Asesmen"
                    checked={form.periode === "pada_saat_asesmen"}
                    onChange={() =>
                      handleTextChange("periode", "pada_saat_asesmen")
                    }
                  />
                  <RadioBox
                    label="Setelah Asesmen"
                    checked={form.periode === "setelah_asesmen"}
                    onChange={() => handleTextChange("periode", "setelah_asesmen")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<ClipboardCheck size={22} />}
              title="1. Menyiapkan Proses Validasi"
              subtitle="Tujuan, konteks, pendekatan, dan orang yang relevan"
            />

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <CheckboxPanel
                  title="Tujuan dan Fokus Validasi"
                  options={TUJUAN_OPTIONS}
                  values={form.tujuan_fokus_validasi}
                  onToggle={(value) =>
                    toggleArrayValue("tujuan_fokus_validasi", value)
                  }
                />

                <CheckboxPanel
                  title="Konteks Validasi"
                  options={KONTEKS_OPTIONS}
                  values={form.konteks_validasi}
                  onToggle={(value) => toggleArrayValue("konteks_validasi", value)}
                />

                <CheckboxPanel
                  title="Pendekatan Validasi"
                  options={PENDEKATAN_OPTIONS}
                  values={form.pendekatan_validasi}
                  onToggle={(value) =>
                    toggleArrayValue("pendekatan_validasi", value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
                <CheckboxPanel
                  title="Orang yang Relevan"
                  options={ORANG_RELEVAN_OPTIONS}
                  values={form.orang_relevan}
                  onToggle={(value) => toggleArrayValue("orang_relevan", value)}
                />

                <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Hasil Konfirmasi / Diskusi Tujuan, Fokus & Konteks
                  </p>

                  <textarea
                    value={form.hasil_konfirmasi}
                    onChange={(e) =>
                      handleTextChange("hasil_konfirmasi", e.target.value)
                    }
                    rows={9}
                    placeholder="Contoh: Disetujui oleh Ketua LSP, Mengevaluasi kualitas perangkat asesmen, Dengan kolega asesor, Mengkaji perangkat asesmen..."
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 text-[#071E3D] font-semibold leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<FileCheck size={22} />}
              title="2. Mengkaji Acuan dan Dokumen"
              subtitle="Acuan pembanding, dokumen terkait, dan komunikasi"
            />

            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
              <CheckboxPanel
                title="Acuan Pembanding"
                options={ACUAN_OPTIONS}
                values={form.acuan_pembanding}
                onToggle={(value) => toggleArrayValue("acuan_pembanding", value)}
              />

              <CheckboxPanel
                title="Dokumen Terkait"
                options={DOKUMEN_OPTIONS}
                values={form.dokumen_terkait}
                onToggle={(value) => toggleArrayValue("dokumen_terkait", value)}
              />

              <CheckboxPanel
                title="Keterampilan Komunikasi"
                options={KOMUNIKASI_OPTIONS}
                values={form.keterampilan_komunikasi}
                onToggle={(value) =>
                  toggleArrayValue("keterampilan_komunikasi", value)
                }
              />
            </div>
          </section>

          <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<CheckCircle size={22} />}
              title="3. Detail Penilaian Validasi"
              subtitle="Aturan bukti dan prinsip asesmen"
            />

            <div className="p-6 overflow-x-auto">
              <table className="w-full min-w-[900px] border border-slate-200 rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                      Aspek
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      V
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      A
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      T
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      M
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      Valid
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      Reliable
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      Fair
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      Flexible
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {form.detail_penilaian.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="border border-slate-200 px-3 py-3">
                        <input
                          type="text"
                          value={item.aspek}
                          onChange={(e) => handleAspekChange(index, e.target.value)}
                          placeholder="Nama aspek"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 text-[#071E3D] font-bold"
                        />
                      </td>

                      {["V", "A", "T", "M", "Vp", "R", "F", "FL"].map((field) => (
                        <td
                          key={field}
                          className="border border-slate-200 px-3 py-3 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item[field])}
                            onChange={() => handleDetailChange(index, field)}
                            className="w-5 h-5 accent-orange-500"
                          />
                        </td>
                      ))}

                      <td className="border border-slate-200 px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center"
                          disabled={form.detail_penilaian.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={addDetailRow}
                className="mt-4 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071E3D] font-black text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16} />
                Tambah Aspek
              </button>

              <p className="mt-4 text-sm text-slate-400 font-semibold">
                Keterangan aturan bukti: V = Valid, A = Authentic, T = Terkini,
                M = Memadai.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-[34px] border border-slate-100 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Info size={22} />}
              title="4. Temuan, Rekomendasi, dan Rencana Implementasi"
              subtitle="Hasil akhir validasi"
            />

            <div className="p-6 space-y-5">
              <TextArea
                label="Temuan Validasi"
                value={form.temuan_validasi}
                onChange={(value) => handleTextChange("temuan_validasi", value)}
                placeholder="Tuliskan temuan validasi..."
              />

              <TextArea
                label="Rekomendasi"
                value={form.rekomendasi}
                onChange={(value) => handleTextChange("rekomendasi", value)}
                placeholder="Tuliskan rekomendasi tindak lanjut..."
              />

              <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Rencana Implementasi
                    </p>
                    <p className="text-sm text-slate-500 font-semibold mt-1">
                      Isi rencana tindak lanjut jika ada.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addRencana}
                    className="px-4 py-3 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    <Plus size={15} />
                    Tambah
                  </button>
                </div>

                <div className="space-y-3">
                  {form.rencana_implementasi.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_220px_180px_48px] gap-3"
                    >
                      <input
                        type="text"
                        value={item.rencana}
                        onChange={(e) =>
                          handleRencanaChange(index, "rencana", e.target.value)
                        }
                        placeholder="Rencana tindak lanjut"
                        className="px-4 py-3 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-orange-500 text-[#071E3D] font-semibold"
                      />

                      <input
                        type="text"
                        value={item.penanggung_jawab}
                        onChange={(e) =>
                          handleRencanaChange(
                            index,
                            "penanggung_jawab",
                            e.target.value
                          )
                        }
                        placeholder="Penanggung jawab"
                        className="px-4 py-3 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-orange-500 text-[#071E3D] font-semibold"
                      />

                      <input
                        type="date"
                        value={item.target_waktu}
                        onChange={(e) =>
                          handleRencanaChange(
                            index,
                            "target_waktu",
                            e.target.value
                          )
                        }
                        className="px-4 py-3 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-orange-500 text-[#071E3D] font-semibold"
                      />

                      <button
                        type="button"
                        onClick={() => removeRencana(index)}
                        className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                        disabled={form.rencana_implementasi.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/80 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-20">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Aksi Dokumen
              </p>
              <h3 className="text-xl font-black text-[#071E3D] mt-1">
                {idMkva ? "Update Data MKVA" : "Simpan Data MKVA"}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading || !idMkva}
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#071E3D] disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Download PDF
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white disabled:opacity-60 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Menyimpan..." : idMkva ? "Update MKVA" : "Simpan MKVA"}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
};

const SectionHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="p-6 border-b border-slate-100 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

const InfoBox = ({ label, children }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="text-[#071E3D] font-black text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
};

const HeaderStat = ({ label, value, icon, active = false }) => {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        active
          ? "bg-orange-50 border-orange-100 text-orange-500"
          : "bg-white border-slate-100 text-[#071E3D]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <h3 className="text-lg font-black mt-1">{value}</h3>
        </div>

        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

const RadioBox = ({ label, checked, onChange }) => {
  return (
    <label
      className={`rounded-2xl border px-4 py-4 cursor-pointer transition-all flex items-center gap-3 ${
        checked
          ? "bg-orange-50 border-orange-200 text-orange-600"
          : "bg-white border-slate-100 text-[#071E3D] hover:border-orange-200"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-orange-500"
      />
      <span className="text-sm font-black">{label}</span>
    </label>
  );
};

const CheckboxPanel = ({ title, options, values, onToggle }) => {
  return (
    <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5 h-full">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </p>

      <div className="space-y-3">
        {options.map((option) => {
          const checked = values.includes(option.value);

          return (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                checked
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-slate-100 hover:border-orange-200"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.value)}
                className="w-5 h-5 accent-orange-500 mt-0.5 shrink-0"
              />
              <span className="text-sm font-bold text-[#071E3D] leading-relaxed">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const TextArea = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 text-[#071E3D] font-semibold transition-all resize-none leading-relaxed"
      />
    </div>
  );
};

export default IsiMKVA;