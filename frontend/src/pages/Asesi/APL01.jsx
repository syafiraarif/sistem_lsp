// src/pages/asesi/APL01.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  Loader2,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ClipboardList,
  PenLine,
  Send,
  Inbox,
  CalendarDays,
  Hash,
  RefreshCcw,
  User,
  BriefcaseBusiness,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const APL01 = () => {
  const { id_peserta } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [peserta, setPeserta] = useState(null);
  const [profile, setProfile] = useState(null);
  const [persyaratan, setPersyaratan] = useState([]);
  const [unitKompetensi, setUnitKompetensi] = useState([]);
  const [apl01, setApl01] = useState(null);

  const [selectedPersyaratan, setSelectedPersyaratan] = useState([]);
  const [dokumenTambahan, setDokumenTambahan] = useState({});
  const [nomorDokumen, setNomorDokumen] = useState({});
  const [tanggalDokumen, setTanggalDokumen] = useState({});

  const [tujuan, setTujuan] = useState("");
  const [tujuanLainnya, setTujuanLainnya] = useState("");

  const ENDPOINT = {
    getProfile: `${API_BASE}/asesi/profile`,
    getForm: `${API_BASE}/asesi/apl01/form/${id_peserta}`,
    getApl01: `${API_BASE}/asesi/apl01/${id_peserta}`,
    createApl01: `${API_BASE}/asesi/apl01/create`,
    uploadDokumen: `${API_BASE}/asesi/apl01/upload`,
    submitFinal: (id_apl01) => `${API_BASE}/asesi/apl01/submit/${id_apl01}`,
  };

  useEffect(() => {
    fetchAPL01Data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_peserta]);

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchAPL01Data = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      if (!id_peserta) {
        alert("ID peserta tidak ditemukan di URL.");
        navigate("/asesi/jadwal-saya");
        return;
      }

      const formRes = await axios.get(ENDPOINT.getForm, {
        headers: getHeaders(),
      });

      const pesertaData = formRes.data?.peserta || null;
      const profileFromForm = formRes.data?.profile || null;
      const persyaratanData = formRes.data?.persyaratan || [];
      const unitKompetensiData =
        formRes.data?.unit_kompetensi ||
        formRes.data?.unitKompetensi ||
        formRes.data?.unit ||
        formRes.data?.units ||
        [];

      setPeserta(pesertaData);
      setProfile(profileFromForm);
      setPersyaratan(persyaratanData);
      setUnitKompetensi(unitKompetensiData);

      if (!profileFromForm) {
        try {
          const profileRes = await axios.get(ENDPOINT.getProfile, {
            headers: getHeaders(),
          });

          setProfile(profileRes.data?.data || profileRes.data || null);
        } catch (profileErr) {
          console.error("Gagal mengambil profile asesi:", profileErr);
        }
      }

      try {
        const apl01Res = await axios.get(ENDPOINT.getApl01, {
          headers: getHeaders(),
        });

        const existingApl01 = apl01Res.data?.data || null;

        if (existingApl01) {
          setApl01(existingApl01);
          setTujuan(existingApl01.tujuan_asesmen || "");
          setTujuanLainnya(existingApl01.tujuan_lainnya || "");

          const dokumenList = getDokumenList(existingApl01);

          const uploadedPersyaratanIds = dokumenList
            .map((dokumen) => Number(dokumen.id_persyaratan))
            .filter(Boolean);

          setSelectedPersyaratan(uploadedPersyaratanIds);

          const nomorMap = {};
          const tanggalMap = {};

          dokumenList.forEach((dokumen) => {
            if (dokumen.id_persyaratan) {
              nomorMap[dokumen.id_persyaratan] = dokumen.nomor_dokumen || "";
              tanggalMap[dokumen.id_persyaratan] =
                dokumen.tanggal_dokumen || "";
            }
          });

          setNomorDokumen(nomorMap);
          setTanggalDokumen(tanggalMap);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }

        setApl01(null);
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal mengambil data APL01."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAPL01Data();
  };

  const getDokumenList = (dataApl01) => {
    return (
      dataApl01?.dokumen ||
      dataApl01?.Apl01Dokumens ||
      dataApl01?.Apl01Dokumen ||
      dataApl01?.apl01_dokumen ||
      dataApl01?.apl01_dokumens ||
      []
    );
  };

  const getPersyaratanInfo = (item) => {
    const dataPersyaratan =
      item.persyaratan ||
      item.Persyaratan ||
      item.persyaratan_data ||
      item;

    return {
      id_persyaratan:
        Number(item.id_persyaratan) ||
        Number(dataPersyaratan.id_persyaratan) ||
        Number(dataPersyaratan.id),

      nama_persyaratan:
        dataPersyaratan.nama_persyaratan ||
        dataPersyaratan.nama ||
        item.nama_persyaratan ||
        "Persyaratan",

      wajib:
        item.wajib === true ||
        item.wajib === 1 ||
        item.wajib === "1" ||
        dataPersyaratan.wajib === true ||
        dataPersyaratan.wajib === 1 ||
        dataPersyaratan.wajib === "1",
    };
  };

  const uploadedDokumenIds = useMemo(() => {
    const dokumenList = getDokumenList(apl01);

    return dokumenList
      .map((dokumen) => Number(dokumen.id_persyaratan))
      .filter(Boolean);
  }, [apl01]);

  const isSubmitted = apl01?.status === "submit";

  const getSkemaData = () => {
    return (
      peserta?.jadwal?.skema ||
      peserta?.Jadwal?.skema ||
      peserta?.Jadwal?.Skema ||
      peserta?.skema ||
      apl01?.skema ||
      {}
    );
  };

  const getIdSkema = () => {
    return (
      peserta?.id_skema ||
      peserta?.jadwal?.id_skema ||
      peserta?.Jadwal?.id_skema ||
      apl01?.id_skema ||
      "-"
    );
  };

  const getIdJadwal = () => {
    return peserta?.id_jadwal || apl01?.id_jadwal || "-";
  };

  const getJudulSkema = () => {
    const skema = getSkemaData();

    return (
      skema.judul_skema ||
      skema.nama_skema ||
      skema.judul ||
      peserta?.jadwal?.skema?.judul_skema ||
      "-"
    );
  };

  const getNomorSkema = () => {
    const skema = getSkemaData();

    return (
      skema.kode_skema ||
      skema.nomor_skema ||
      skema.nomor ||
      peserta?.jadwal?.skema?.kode_skema ||
      "-"
    );
  };

  const getUnitKode = (unit) => {
    return (
      unit.kode_unit ||
      unit.kode ||
      unit.kode_unit_kompetensi ||
      unit.kode_uk ||
      "-"
    );
  };

  const getUnitJudul = (unit) => {
    return (
      unit.judul_unit ||
      unit.nama_unit ||
      unit.nama_unit_kompetensi ||
      unit.judul ||
      unit.nama ||
      "-"
    );
  };

  const getUnitStandar = (unit) => {
    return (
      unit.jenis_standar ||
      unit.standar ||
      unit.nama_skkni ||
      unit.no_skkni ||
      unit.nomor_skkni ||
      unit.skkni?.judul_skkni ||
      unit.skkni?.nomor_skkni ||
      unit.Skkni?.judul_skkni ||
      unit.Skkni?.nomor_skkni ||
      "-"
    );
  };

  const getProfileValue = (...keys) => {
    for (const key of keys) {
      if (
        profile?.[key] !== undefined &&
        profile?.[key] !== null &&
        profile?.[key] !== ""
      ) {
        return profile[key];
      }
    }

    return "-";
  };

  const formatTanggal = (date) => {
    if (!date || date === "-") return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePersyaratanChange = (e) => {
    const id = Number(e.target.value);
    const checked = e.target.checked;

    if (checked) {
      setSelectedPersyaratan((prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });

      setDokumenTambahan((prev) => ({
        ...prev,
        [id]: prev[id] || null,
      }));
    } else {
      setSelectedPersyaratan((prev) => prev.filter((value) => value !== id));

      setDokumenTambahan((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setNomorDokumen((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setTanggalDokumen((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDokumenChange = (id_persyaratan, file) => {
    setDokumenTambahan((prev) => ({
      ...prev,
      [id_persyaratan]: file || null,
    }));
  };

  const handleNomorDokumenChange = (id_persyaratan, value) => {
    setNomorDokumen((prev) => ({
      ...prev,
      [id_persyaratan]: value,
    }));
  };

  const handleTanggalDokumenChange = (id_persyaratan, value) => {
    setTanggalDokumen((prev) => ({
      ...prev,
      [id_persyaratan]: value,
    }));
  };

  const validateForm = () => {
    if (isSubmitted) {
      alert("APL01 sudah disubmit.");
      return false;
    }

    if (!tujuan) {
      alert("Tujuan asesmen wajib dipilih.");
      return false;
    }

    if (tujuan === "lainnya" && !tujuanLainnya.trim()) {
      alert("Tujuan lainnya wajib diisi.");
      return false;
    }

    if (selectedPersyaratan.length === 0) {
      alert("Pilih minimal satu persyaratan.");
      return false;
    }

    for (const id of selectedPersyaratan) {
      const alreadyUploaded = uploadedDokumenIds.includes(Number(id));
      const newFile = dokumenTambahan[id];

      if (!alreadyUploaded && !newFile) {
        alert("Semua persyaratan yang dipilih wajib upload dokumen.");
        return false;
      }
    }

    return true;
  };

  const createAPL01 = async () => {
    const payload = {
      id_peserta: Number(id_peserta),
      tujuan_asesmen: tujuan,
      tujuan_lainnya: tujuan === "lainnya" ? tujuanLainnya : null,
    };

    const res = await axios.post(ENDPOINT.createApl01, payload, {
      headers: getHeaders(),
    });

    return res.data?.data;
  };

  const uploadDokumen = async (id_apl01) => {
    for (const id_persyaratan of selectedPersyaratan) {
      const file = dokumenTambahan[id_persyaratan];

      if (!file) continue;

      const formData = new FormData();

      formData.append("id_apl01", id_apl01);
      formData.append("id_persyaratan", id_persyaratan);
      formData.append("nomor_dokumen", nomorDokumen[id_persyaratan] || "");
      formData.append("tanggal_dokumen", tanggalDokumen[id_persyaratan] || "");
      formData.append("file_dokumen", file);

      await axios.post(ENDPOINT.uploadDokumen, formData, {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
    }
  };

  const submitFinalAPL01 = async (id_apl01) => {
    await axios.put(
      ENDPOINT.submitFinal(id_apl01),
      {},
      {
        headers: getHeaders(),
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      let currentApl01 = apl01;

      if (!currentApl01) {
        currentApl01 = await createAPL01();

        if (!currentApl01?.id_apl01) {
          alert("APL01 berhasil dibuat, tapi ID APL01 tidak ditemukan.");
          return;
        }

        setApl01(currentApl01);
      }

      await uploadDokumen(currentApl01.id_apl01);
      await submitFinalAPL01(currentApl01.id_apl01);

      alert("APL01 berhasil disubmit.");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal submit APL01."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = selectedPersyaratan.length;

  if (loading) {
    return <LoadingScreen title="Memuat APL01" desc="Mengambil data formulir aplikasi asesmen." />;
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
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Formulir APL01
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  APL01
                  <br />
                  <span className="text-orange-500">Aplikasi Asesmen</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Lengkapi tujuan asesmen, data persyaratan, dan dokumen
                  pendukung sesuai kebutuhan aplikasi asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
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

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Jadwal Saya
                    <ChevronRight size={17} />
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
                    Persyaratan Dipilih
                  </p>

                  <h2 className="text-4xl font-black leading-tight">
                    {selectedCount}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Status APL01: {apl01?.status || "Belum Dibuat"}.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="ID Peserta" value={id_peserta || "-"} />
                    <HeroPill label="ID Skema" value={getIdSkema()} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <MiniStat label="ID Peserta" value={id_peserta || "-"} />
            <MiniStat label="ID Jadwal" value={getIdJadwal()} />
            <MiniStat label="ID Skema" value={getIdSkema()} />
            <MiniStat label="Status" value={apl01?.status || "Belum Dibuat"} />
          </section>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start"
          >
            <section className="space-y-6">
              <Card title="Data Pribadi Asesi" icon={<User size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataItem
                    label="Nama Lengkap"
                    value={getProfileValue("nama_lengkap", "nama", "nama_asesi")}
                  />
                  <DataItem label="Tempat Lahir" value={getProfileValue("tempat_lahir")} />
                  <DataItem
                    label="Tanggal Lahir"
                    value={formatTanggal(getProfileValue("tanggal_lahir", "tgl_lahir"))}
                  />
                  <DataItem label="Jenis Kelamin" value={getProfileValue("jenis_kelamin", "gender")} />
                  <DataItem
                    label="Kebangsaan"
                    value={getProfileValue("kebangsaan", "kewarganegaraan", "warga_negara")}
                  />
                  <DataItem
                    label="Pendidikan Terakhir"
                    value={getProfileValue("pendidikan_terakhir", "pendidikan")}
                  />
                  <div className="md:col-span-2">
                    <DataItem label="Alamat Rumah" value={getProfileValue("alamat_rumah", "alamat")} />
                  </div>
                </div>
              </Card>

              <Card title="Data Pekerjaan / Perusahaan" icon={<BriefcaseBusiness size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataItem label="Jabatan" value={getProfileValue("jabatan", "pekerjaan")} />
                  <DataItem
                    label="Nama Lembaga / Perusahaan"
                    value={getProfileValue("nama_lembaga", "nama_perusahaan", "lembaga", "perusahaan")}
                  />
                  <div className="md:col-span-2">
                    <DataItem
                      label="Alamat Perusahaan"
                      value={getProfileValue("alamat_perusahaan", "alamat_kantor")}
                    />
                  </div>
                  <DataItem
                    label="No. Telp Perusahaan"
                    value={getProfileValue(
                      "no_telp_perusahaan",
                      "telp_perusahaan",
                      "no_telp_kantor",
                      "telepon_perusahaan"
                    )}
                  />
                  <DataItem
                    label="Fax Perusahaan"
                    value={getProfileValue("fax", "no_fax", "fax_perusahaan", "no_fax_perusahaan")}
                  />
                  <DataItem
                    label="Email Perusahaan"
                    value={getProfileValue("email_perusahaan", "email_kantor", "email_lembaga")}
                  />
                </div>
              </Card>

              <Card title="Bagian 2: Data Sertifikasi" icon={<ShieldCheck size={22} />}>
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-100">
                      <div className="lg:col-span-4 bg-slate-50 p-4">
                        <p className="text-sm font-black text-[#071E3D]">
                          Skema Sertifikasi
                        </p>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          KKNI / Okupasi / Klaster
                        </p>
                      </div>

                      <div className="lg:col-span-8 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100">
                          <div className="md:col-span-1 bg-slate-50/60 p-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Judul
                            </p>
                          </div>
                          <div className="md:col-span-3 p-4">
                            <p className="text-sm font-black text-[#071E3D]">
                              {getJudulSkema()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4">
                          <div className="md:col-span-1 bg-slate-50/60 p-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Nomor
                            </p>
                          </div>
                          <div className="md:col-span-3 p-4">
                            <p className="text-sm font-black text-[#071E3D]">
                              {getNomorSkema()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      <div className="lg:col-span-4 bg-slate-50 p-4">
                        <p className="text-sm font-black text-[#071E3D]">
                          Tujuan Asesmen
                        </p>
                      </div>

                      <div className="lg:col-span-8 bg-white p-4">
                        <div className="space-y-3">
                          <RadioTujuan label="Sertifikasi" value="sertifikasi" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                          <RadioTujuan label="Sertifikasi Ulang" value="sertifikasi_ulang" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                          <RadioTujuan label="Pengakuan Kompetensi Terkini (PKT)" value="pkk" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                          <RadioTujuan label="Rekognisi Pembelajaran Lampau" value="rpl" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />
                          <RadioTujuan label="Lainnya" value="lainnya" tujuan={tujuan} setTujuan={setTujuan} disabled={isSubmitted} />

                          {tujuan === "lainnya" && (
                            <input
                              type="text"
                              placeholder="Tuliskan tujuan asesmen lainnya"
                              value={tujuanLainnya}
                              onChange={(e) => setTujuanLainnya(e.target.value)}
                              disabled={isSubmitted}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 text-sm font-bold text-[#071E3D] disabled:opacity-70 disabled:cursor-not-allowed"
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#071E3D] mb-4">
                      Daftar Unit Kompetensi sesuai kemasan:
                    </h3>

                    {unitKompetensi.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full min-w-[760px] text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="p-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                No
                              </th>
                              <th className="p-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                Kode Unit
                              </th>
                              <th className="p-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                Judul Unit
                              </th>
                              <th className="p-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                Jenis Standar
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {unitKompetensi.map((unit, index) => (
                              <tr
                                key={unit.id_unit || unit.id_unit_kompetensi || index}
                                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                              >
                                <td className="p-4 border-b border-slate-100 font-bold text-slate-500">
                                  {index + 1}
                                </td>
                                <td className="p-4 border-b border-slate-100 font-black text-[#071E3D]">
                                  {getUnitKode(unit)}
                                </td>
                                <td className="p-4 border-b border-slate-100 font-bold text-[#071E3D]">
                                  {getUnitJudul(unit)}
                                  <span className="ml-2 text-red-500">✅</span>
                                </td>
                                <td className="p-4 border-b border-slate-100 font-medium text-slate-500">
                                  {getUnitStandar(unit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<Inbox size={38} />}
                        title="Unit Kompetensi Belum Ada"
                        desc="Backend belum mengirim data unit_kompetensi untuk skema ini."
                      />
                    )}
                  </div>
                </div>
              </Card>

              <Card title="Persyaratan Skema" icon={<FileText size={22} />}>
                {persyaratan.length > 0 ? (
                  <div className="space-y-4">
                    {persyaratan.map((item, index) => {
                      const p = getPersyaratanInfo(item);
                      const id = Number(p.id_persyaratan);

                      if (!id) return null;

                      const checked = selectedPersyaratan.includes(id);
                      const uploadedFile = dokumenTambahan[id];
                      const alreadyUploaded = uploadedDokumenIds.includes(id);

                      return (
                        <div
                          key={`${id}-${index}`}
                          className={`rounded-[26px] border p-5 transition-all ${
                            checked
                              ? "bg-orange-50/60 border-orange-200"
                              : "bg-slate-50 border-slate-100 hover:bg-white"
                          }`}
                        >
                          <label className="flex items-start gap-4 cursor-pointer">
                            <input
                              type="checkbox"
                              value={id}
                              checked={checked}
                              onChange={handlePersyaratanChange}
                              disabled={isSubmitted}
                              className="mt-1 w-5 h-5 accent-orange-500 disabled:cursor-not-allowed"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-black text-[#071E3D]">
                                  {p.nama_persyaratan || `Persyaratan ${id}`}
                                </h3>

                                {p.wajib && (
                                  <span className="px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                    Wajib
                                  </span>
                                )}

                                {alreadyUploaded && (
                                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <CheckCircle size={13} />
                                    Sudah Upload
                                  </span>
                                )}

                                {checked && uploadedFile && (
                                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <CheckCircle size={13} />
                                    File Siap
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-400 text-xs font-medium">
                                Centang persyaratan lalu upload dokumen pendukung.
                              </p>
                            </div>
                          </label>

                          {checked && (
                            <div className="mt-5 ml-0 md:ml-9 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FieldWithIcon
                                  label="Nomor Dokumen"
                                  icon={<Hash size={16} />}
                                  type="text"
                                  placeholder="Masukkan nomor dokumen"
                                  value={nomorDokumen[id] || ""}
                                  onChange={(value) => handleNomorDokumenChange(id, value)}
                                  disabled={isSubmitted}
                                />

                                <FieldWithIcon
                                  label="Tanggal Dokumen"
                                  icon={<CalendarDays size={16} />}
                                  type="date"
                                  value={tanggalDokumen[id] || ""}
                                  onChange={(value) => handleTanggalDokumenChange(id, value)}
                                  disabled={isSubmitted}
                                />
                              </div>

                              {!isSubmitted && (
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                                    Upload Dokumen
                                  </label>

                                  <label className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-white border border-slate-100 p-4 cursor-pointer hover:border-orange-200 transition-all">
                                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                      <Upload size={20} />
                                    </div>

                                    <div className="flex-1">
                                      <p className="text-sm font-black text-[#071E3D]">
                                        {uploadedFile
                                          ? uploadedFile.name
                                          : alreadyUploaded
                                          ? "Pilih file baru jika ingin upload ulang"
                                          : "Pilih file dokumen"}
                                      </p>
                                      <p className="text-xs text-slate-400 font-medium mt-1">
                                        File akan dikirim sebagai field file_dokumen.
                                      </p>
                                    </div>

                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        handleDokumenChange(id, e.target.files?.[0] || null)
                                      }
                                      className="hidden"
                                      required={!alreadyUploaded}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Inbox size={38} />}
                    title="Tidak Ada Persyaratan"
                    desc="Tidak ada persyaratan untuk skema ini."
                  />
                )}
              </Card>
            </section>

            <aside>
              <div className="sticky top-6 space-y-6">
                <Card title="Informasi Submit" icon={<PenLine size={22} />}>
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5 text-orange-600">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={22} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black">Sesuai Model Database</p>
                          <p className="text-sm font-medium mt-1">
                            Data asesmen masuk ke apl01_asesmen. Dokumen masuk ke apl01_dokumen.
                          </p>
                        </div>
                      </div>
                    </div>

                    {apl01 && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-emerald-600">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={22} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black">APL01 Sudah Dibuat</p>
                            <p className="text-sm font-medium mt-1">
                              ID APL01: {apl01.id_apl01}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              Status: {apl01.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="bg-[#071E3D] rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-[#071E3D]/15">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2">Ringkasan APL01</h3>

                    <div className="space-y-3 mt-5">
                      <SummaryItem label="ID Peserta" value={id_peserta || "-"} />
                      <SummaryItem label="ID Jadwal" value={getIdJadwal()} />
                      <SummaryItem label="ID Skema" value={getIdSkema()} />
                      <SummaryItem label="Persyaratan Dipilih" value={selectedCount} />
                      <SummaryItem label="Tujuan Asesmen" value={tujuan || "-"} />
                      <SummaryItem label="Status" value={apl01?.status || "Draft Baru"} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isSubmitted}
                  className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                    submitting || isSubmitted
                      ? "bg-orange-300 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                  }`}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}

                  {isSubmitted
                    ? "Sudah Submit"
                    : submitting
                    ? "Mengirim..."
                    : "Submit APL01"}
                </button>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
};

function LoadingScreen({ title, desc }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">{title}</h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">{desc}</p>
      </div>
    </div>
  );
}

const Card = ({ title, icon, children }) => {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Aplikasi Asesmen
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
};

const MiniStat = ({ label, value }) => {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
    </div>
  );
};

const HeroPill = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
};

const RadioTujuan = ({ label, value, tujuan, setTujuan, disabled }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="tujuan_asesmen"
        value={value}
        checked={tujuan === value}
        onChange={(e) => setTujuan(e.target.value)}
        disabled={disabled}
        className="w-4 h-4 accent-orange-500 disabled:cursor-not-allowed"
      />

      <span className="text-sm font-bold text-[#071E3D]">{label}</span>
    </label>
  );
};

const DataItem = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-sm font-black text-[#071E3D] break-words">
        {value || "-"}
      </p>
    </div>
  );
};

const FieldWithIcon = ({
  label,
  icon,
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-11 pr-5 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D] disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="font-black text-white text-sm capitalize">{value}</p>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => {
  return (
    <div className="text-center py-14 px-6 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
      <div className="mx-auto mb-4 text-slate-300 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-black text-[#071E3D] mb-2">{title}</h3>
      <p className="text-slate-400 font-medium">{desc}</p>
    </div>
  );
};

export default APL01;