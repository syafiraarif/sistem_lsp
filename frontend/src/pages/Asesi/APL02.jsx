// src/pages/asesi/APL02.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileText,
  Hash,
  Inbox,
  Loader2,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const jenisPortofolioOptions = [
  { value: "hasil_karya_atau_produk", label: "Hasil karya / produk" },
  { value: "pengalaman_pembuatan_laporan", label: "Pembuatan laporan" },
  { value: "pengalaman_magang", label: "Magang" },
  { value: "pengalaman_menjadi_narasumber", label: "Narasumber" },
  { value: "pengalaman_kerja", label: "Kerja" },
  { value: "pengalaman_pendidikan", label: "Pendidikan" },
  { value: "pengalaman_proyek", label: "Proyek" },
  { value: "pengalaman_studi_kasus", label: "Studi kasus" },
];

export default function APL02() {
  const { id_skema } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [idPeserta, setIdPeserta] = useState(
    location.state?.id_peserta ||
      location.state?.idPeserta ||
      localStorage.getItem("id_peserta") ||
      ""
  );

  const [formUnits, setFormUnits] = useState([]);
  const [apl02, setApl02] = useState(null);
  const [detailForm, setDetailForm] = useState({});
  const [error, setError] = useState("");

  const ENDPOINT = {
    getForm: `${API_BASE}/asesi/apl02/form/${id_skema}`,
    create: `${API_BASE}/asesi/apl02/create`,
    savePenilaian: `${API_BASE}/asesi/apl02/penilaian`,
    uploadBukti: `${API_BASE}/asesi/apl02/upload`,
    getApl02: (id_peserta) => `${API_BASE}/asesi/apl02/${id_peserta}`,
    deleteBukti: (id_bukti) => `${API_BASE}/asesi/apl02/bukti/${id_bukti}`,
    submit: (id_apl02) => `${API_BASE}/asesi/apl02/submit/${id_apl02}`,
    jadwalSaya: `${API_BASE}/asesi/jadwal-saya`,
  };

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_skema]);

  const initPage = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      if (!id_skema) {
        alert("ID skema tidak ditemukan.");
        navigate("/asesi/jadwal-saya");
        return;
      }

      const pesertaId = await resolveIdPeserta();

      if (!pesertaId) {
        setError(
          "ID peserta tidak ditemukan. Pastikan tombol APL02 dibuka dari Jadwal Saya."
        );
      }

      await fetchForm();

      if (pesertaId) {
        await fetchExistingApl02(pesertaId, true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal memuat APL02.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resolveIdPeserta = async () => {
    if (idPeserta) return idPeserta;

    try {
      const res = await axios.get(ENDPOINT.jadwalSaya, {
        headers: getHeaders(),
      });

      const data = res.data?.data || [];

      const matched = data.find((item) => {
        const jadwal = item.jadwal || item.Jadwal || {};
        const skema = jadwal.skema || jadwal.Skema || {};

        const currentIdSkema =
          item.id_skema || jadwal.id_skema || skema.id_skema;

        return Number(currentIdSkema) === Number(id_skema);
      });

      const pesertaId =
        matched?.id_peserta ||
        matched?.id_peserta_jadwal ||
        matched?.id ||
        matched?.id_pendaftaran;

      if (pesertaId) {
        setIdPeserta(pesertaId);
        localStorage.setItem("id_peserta", pesertaId);
      }

      return pesertaId || "";
    } catch (err) {
      console.error("Gagal resolve id_peserta:", err);
      return "";
    }
  };

  const fetchForm = async () => {
    const res = await axios.get(ENDPOINT.getForm, {
      headers: getHeaders(),
    });

    setFormUnits(res.data?.data || []);
  };

  const fetchExistingApl02 = async (pesertaId = idPeserta, silent = false) => {
    try {
      const res = await axios.get(ENDPOINT.getApl02(pesertaId), {
        headers: getHeaders(),
      });

      const data = res.data?.data || null;

      setApl02(data);

      if (data) {
        hydrateDetailForm(data);
      }

      return data;
    } catch (err) {
      if (!silent) {
        console.error(err);
      }

      setApl02(null);
      return null;
    }
  };

  const hydrateDetailForm = (dataApl02) => {
    const map = {};

    const detailList = dataApl02?.detail || [];

    detailList.forEach((detail) => {
      const idElemen = Number(detail.id_elemen);

      if (!idElemen) return;

      map[idElemen] = {
        id_detail: detail.id_detail,
        kompeten: detail.kompeten || "",
        catatan: detail.catatan || "",
        jenis_portofolio: "",
        nama_dokumen: "",
        nomor_dokumen: "",
        tanggal_dokumen: "",
        file_dokumen: null,
        bukti:
          detail.bukti ||
          detail.buktiTambahan ||
          detail.apl02_bukti ||
          detail.apl02_buktis ||
          [],
      };
    });

    setDetailForm((prev) => ({
      ...prev,
      ...map,
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initPage();
  };

  const getUnit = (row) => {
    return row.unit || row.Unit || row.unit_kompetensi || row.UnitKompetensi || row;
  };

  const getUnitId = (row) => {
    const unit = getUnit(row);

    return (
      unit.id_unit ||
      unit.id_unit_kompetensi ||
      row.id_unit ||
      row.id_unit_kompetensi ||
      row.id
    );
  };

  const getUnitKode = (row) => {
    const unit = getUnit(row);

    return (
      unit.kode_unit ||
      unit.kode ||
      unit.kode_unit_kompetensi ||
      row.kode_unit ||
      "-"
    );
  };

  const getUnitJudul = (row) => {
    const unit = getUnit(row);

    return (
      unit.judul_unit ||
      unit.nama_unit ||
      unit.nama_unit_kompetensi ||
      unit.judul ||
      row.judul_unit ||
      "-"
    );
  };

  const getElemenList = (row) => {
    const unit = getUnit(row);

    return (
      unit.elemen ||
      unit.UnitElemens ||
      unit.unit_elemen ||
      unit.unit_elemens ||
      []
    );
  };

  const getElemenId = (elemen) => {
    return elemen.id_elemen || elemen.id || elemen.id_unit_elemen;
  };

  const getIdUnitByElemen = (id_elemen) => {
    for (const row of formUnits) {
      const unit = getUnit(row);
      const elemenList = getElemenList(row);

      const found = elemenList.find(
        (elemen) => Number(getElemenId(elemen)) === Number(id_elemen)
      );

      if (found) {
        return (
          unit.id_unit ||
          unit.id_unit_kompetensi ||
          row.id_unit ||
          row.id_unit_kompetensi ||
          row.id ||
          null
        );
      }
    }

    return null;
  };

  const getElemenText = (elemen) => {
    return (
      elemen.elemen_kompetensi ||
      elemen.nama_elemen ||
      elemen.judul_elemen ||
      elemen.elemen ||
      elemen.deskripsi ||
      "-"
    );
  };

  const getKukList = (elemen) => {
    return (
      elemen.kuk ||
      elemen.UnitKuks ||
      elemen.unit_kuk ||
      elemen.unit_kuks ||
      []
    );
  };

  const getKukText = (kuk) => {
    return (
      kuk.kriteria_unjuk_kerja ||
      kuk.kuk ||
      kuk.deskripsi ||
      kuk.pertanyaan ||
      kuk.nama_kuk ||
      "-"
    );
  };

  const updateDetailField = (id_elemen, field, value) => {
    setDetailForm((prev) => ({
      ...prev,
      [id_elemen]: {
        ...prev[id_elemen],
        [field]: value,
      },
    }));
  };

  const ensureApl02 = async () => {
    if (apl02?.id_apl02) return apl02;

    const pesertaId = idPeserta || (await resolveIdPeserta());

    if (!pesertaId) {
      throw new Error("ID peserta tidak ditemukan.");
    }

    try {
      const res = await axios.post(
        ENDPOINT.create,
        {
          id_peserta: Number(pesertaId),
        },
        {
          headers: getHeaders(),
        }
      );

      const created = res.data?.data;

      setApl02(created);

      return created;
    } catch (err) {
      const message = err.response?.data?.message || "";

      if (message.toLowerCase().includes("sudah")) {
        const existing = await fetchExistingApl02(pesertaId, true);

        if (existing?.id_apl02) return existing;
      }

      throw err;
    }
  };

  const savePenilaian = async (id_elemen) => {
    const data = detailForm[id_elemen] || {};

    if (!data.kompeten) {
      alert("Pilih K atau BK terlebih dahulu.");
      return;
    }

    try {
      setSavingKey(`save-${id_elemen}`);

      const currentApl02 = await ensureApl02();
      const idUnit = getIdUnitByElemen(id_elemen);

      const res = await axios.post(
        ENDPOINT.savePenilaian,
        {
          id_apl02: currentApl02.id_apl02,
          id_unit: idUnit,
          id_elemen,
          kompeten: data.kompeten,
          catatan: data.catatan || "",
        },
        {
          headers: getHeaders(),
        }
      );

      const detail = res.data?.data;

      setDetailForm((prev) => ({
        ...prev,
        [id_elemen]: {
          ...prev[id_elemen],
          id_detail: detail?.id_detail || prev[id_elemen]?.id_detail,
        },
      }));

      alert("Penilaian berhasil disimpan.");

      const pesertaId = idPeserta || (await resolveIdPeserta());
      if (pesertaId) {
        await fetchExistingApl02(pesertaId, true);
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan penilaian."
      );
    } finally {
      setSavingKey(null);
    }
  };

  const uploadBukti = async (id_elemen) => {
    const data = detailForm[id_elemen] || {};

    if (!data.id_detail) {
      alert("Simpan penilaian dulu sebelum upload bukti.");
      return;
    }

    if (!data.file_dokumen) {
      alert("File bukti wajib dipilih.");
      return;
    }

    try {
      setSavingKey(`upload-${id_elemen}`);

      const formData = new FormData();

      formData.append("id_detail", data.id_detail);
      formData.append("jenis_portofolio", data.jenis_portofolio || "");
      formData.append("nama_dokumen", data.nama_dokumen || "");
      formData.append("nomor_dokumen", data.nomor_dokumen || "");
      formData.append("tanggal_dokumen", data.tanggal_dokumen || "");
      formData.append("file_dokumen", data.file_dokumen);

      await axios.post(ENDPOINT.uploadBukti, formData, {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Bukti berhasil diupload.");

      await fetchExistingApl02(idPeserta, true);

      setDetailForm((prev) => ({
        ...prev,
        [id_elemen]: {
          ...prev[id_elemen],
          jenis_portofolio: "",
          nama_dokumen: "",
          nomor_dokumen: "",
          tanggal_dokumen: "",
          file_dokumen: null,
        },
      }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal upload bukti.");
    } finally {
      setSavingKey(null);
    }
  };

  const deleteBukti = async (id_bukti) => {
    const ok = window.confirm("Hapus bukti ini?");
    if (!ok) return;

    try {
      await axios.delete(ENDPOINT.deleteBukti(id_bukti), {
        headers: getHeaders(),
      });

      alert("Bukti berhasil dihapus.");
      await fetchExistingApl02(idPeserta, true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal hapus bukti.");
    }
  };

  const submitFinal = async () => {
    try {
      setSubmitting(true);

      const currentApl02 = await ensureApl02();

      const savedDetailCount = Object.values(detailForm).filter(
        (item) => item?.id_detail || item?.kompeten
      ).length;

      const detailCount =
        currentApl02?.detail?.length ||
        apl02?.detail?.length ||
        savedDetailCount ||
        0;

      if (detailCount === 0) {
        alert("Isi dan simpan minimal satu penilaian terlebih dahulu.");
        return;
      }

      await axios.put(
        ENDPOINT.submit(currentApl02.id_apl02),
        {},
        {
          headers: getHeaders(),
        }
      );

      alert("APL02 berhasil disubmit.");

      const pesertaId = idPeserta || (await resolveIdPeserta());
      if (pesertaId) {
        await fetchExistingApl02(pesertaId, true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Gagal submit APL02.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalElemen = useMemo(() => {
    return formUnits.reduce((total, row) => total + getElemenList(row).length, 0);
  }, [formUnits]);

  const totalTerisi = useMemo(() => {
    return Object.values(detailForm).filter((item) => item?.kompeten).length;
  }, [detailForm]);

  const isSubmitted = apl02?.status === "submitted";

  if (loading) {
    return <LoadingScreen title="Memuat APL02" desc="Mengambil data asesmen mandiri." />;
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
                    Formulir APL02
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  APL02
                  <br />
                  <span className="text-orange-500">Asesmen Mandiri</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Isi asesmen mandiri berdasarkan elemen kompetensi, pilih K/BK,
                  tambahkan catatan, dan upload bukti pendukung.
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
                    Progress Elemen
                  </p>

                  <h2 className="text-4xl font-black leading-tight">
                    {totalTerisi}/{totalElemen}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Status APL02: {apl02?.status || "Belum Dibuat"}.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="ID Peserta" value={idPeserta || "-"} />
                    <HeroPill label="ID Skema" value={id_skema || "-"} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} />}

          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <MiniStat label="ID Skema" value={id_skema || "-"} />
            <MiniStat label="ID Peserta" value={idPeserta || "-"} />
            <MiniStat label="ID APL02" value={apl02?.id_apl02 || "-"} />
            <MiniStat label="Status" value={apl02?.status || "Belum Dibuat"} />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
            <section className="space-y-6">
              {formUnits.length === 0 ? (
                <Card title="Unit Kompetensi" icon={<Inbox size={22} />}>
                  <EmptyState
                    icon={<Inbox size={38} />}
                    title="Unit Kompetensi Tidak Ada"
                    desc="Backend belum mengirim unit kompetensi untuk skema ini."
                  />
                </Card>
              ) : (
                formUnits.map((row, unitIndex) => {
                  const unitId = getUnitId(row);
                  const elemenList = getElemenList(row);

                  return (
                    <Card
                      key={unitId || unitIndex}
                      title={`Unit ${unitIndex + 1}: ${getUnitKode(row)}`}
                      icon={<BookOpen size={22} />}
                    >
                      <div className="mb-6 rounded-[24px] bg-[#071E3D] text-white p-5">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                          Judul Unit
                        </p>
                        <h2 className="text-xl font-black leading-snug">
                          {getUnitJudul(row)}
                        </h2>
                      </div>

                      {elemenList.length === 0 ? (
                        <EmptyState
                          icon={<Inbox size={38} />}
                          title="Elemen Tidak Ada"
                          desc="Unit ini belum memiliki elemen kompetensi."
                        />
                      ) : (
                        <div className="space-y-5">
                          {elemenList.map((elemen, elemenIndex) => {
                            const idElemen = Number(getElemenId(elemen));
                            const state = detailForm[idElemen] || {};
                            const kukList = getKukList(elemen);
                            const buktiList = state.bukti || [];
                            const disabled = isSubmitted;

                            return (
                              <div
                                key={idElemen || elemenIndex}
                                className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-5"
                              >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                                  <div>
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">
                                      Elemen {elemenIndex + 1}
                                    </p>
                                    <h3 className="text-lg font-black text-[#071E3D]">
                                      {getElemenText(elemen)}
                                    </h3>
                                  </div>

                                  {state.id_detail && (
                                    <span className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black inline-flex items-center gap-2">
                                      <CheckCircle size={15} />
                                      Tersimpan
                                    </span>
                                  )}
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Kriteria Unjuk Kerja
                                  </p>

                                  {kukList.length > 0 ? (
                                    <ol className="space-y-2">
                                      {kukList.map((kuk, kukIndex) => (
                                        <li
                                          key={kuk.id_kuk || kuk.id || kukIndex}
                                          className="flex gap-3 text-sm font-semibold text-[#071E3D]"
                                        >
                                          <span className="w-7 h-7 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xs font-black shrink-0">
                                            {kukIndex + 1}
                                          </span>
                                          <span>{getKukText(kuk)}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  ) : (
                                    <p className="text-sm text-slate-400 font-medium">
                                      KUK belum tersedia.
                                    </p>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="rounded-2xl bg-white border border-slate-100 p-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                      Penilaian Mandiri
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                      <RadioKompeten
                                        label="Kompeten (K)"
                                        value="K"
                                        checked={state.kompeten === "K"}
                                        disabled={disabled}
                                        onChange={() =>
                                          updateDetailField(idElemen, "kompeten", "K")
                                        }
                                      />

                                      <RadioKompeten
                                        label="Belum Kompeten (BK)"
                                        value="BK"
                                        checked={state.kompeten === "BK"}
                                        disabled={disabled}
                                        onChange={() =>
                                          updateDetailField(idElemen, "kompeten", "BK")
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-2xl bg-white border border-slate-100 p-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                      Catatan
                                    </p>

                                    <textarea
                                      value={state.catatan || ""}
                                      onChange={(e) =>
                                        updateDetailField(idElemen, "catatan", e.target.value)
                                      }
                                      disabled={disabled}
                                      placeholder="Tulis catatan jika diperlukan"
                                      className="w-full min-h-[92px] px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 text-sm font-semibold text-[#071E3D] disabled:opacity-70"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-5">
                                  <button
                                    type="button"
                                    disabled={disabled || savingKey === `save-${idElemen}`}
                                    onClick={() => savePenilaian(idElemen)}
                                    className="px-5 py-3 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {savingKey === `save-${idElemen}` ? (
                                      <Loader2 size={17} className="animate-spin" />
                                    ) : (
                                      <Save size={17} />
                                    )}
                                    Simpan Penilaian
                                  </button>
                                </div>

                                <BuktiBox
                                  buktiList={buktiList}
                                  state={state}
                                  idElemen={idElemen}
                                  isSubmitted={isSubmitted}
                                  savingKey={savingKey}
                                  updateDetailField={updateDetailField}
                                  uploadBukti={uploadBukti}
                                  deleteBukti={deleteBukti}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </section>

            <aside>
              <div className="sticky top-6 space-y-6">
                <Card title="Informasi APL02" icon={<ShieldCheck size={22} />}>
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5 text-orange-600">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={22} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black">Alur Backend</p>
                          <p className="text-sm font-medium mt-1">
                            Buat APL02, simpan penilaian per elemen, upload bukti, lalu submit final.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isSubmitted && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-emerald-600">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={22} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black">Sudah Submitted</p>
                            <p className="text-sm font-medium mt-1">
                              APL02 sudah dikirim final.
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
                    <h3 className="font-black text-xl mb-2">Ringkasan APL02</h3>

                    <div className="space-y-3 mt-5">
                      <SummaryItem label="ID Peserta" value={idPeserta || "-"} />
                      <SummaryItem label="ID Skema" value={id_skema || "-"} />
                      <SummaryItem label="ID APL02" value={apl02?.id_apl02 || "-"} />
                      <SummaryItem label="Elemen Terisi" value={`${totalTerisi}/${totalElemen}`} />
                      <SummaryItem label="Status" value={apl02?.status || "Draft Baru"} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submitting || isSubmitted}
                  onClick={submitFinal}
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
                    : "Submit APL02"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function BuktiBox({
  buktiList,
  state,
  idElemen,
  isSubmitted,
  savingKey,
  updateDetailField,
  uploadBukti,
  deleteBukti,
}) {
  return (
    <div className="rounded-[24px] bg-white border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <Upload size={19} />
        </div>
        <div>
          <h4 className="font-black text-[#071E3D]">Bukti Pendukung</h4>
          <p className="text-xs font-medium text-slate-400">
            Upload bukti setelah penilaian elemen disimpan.
          </p>
        </div>
      </div>

      {buktiList.length > 0 && (
        <div className="space-y-3 mb-5">
          {buktiList.map((bukti) => (
            <div
              key={bukti.id_bukti}
              className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-black text-[#071E3D]">
                  {bukti.nama_dokumen || "Bukti Dokumen"}
                </p>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {bukti.jenis_portofolio || "-"} • {bukti.nomor_dokumen || "-"}
                </p>
              </div>

              {!isSubmitted && (
                <button
                  type="button"
                  onClick={() => deleteBukti(bukti.id_bukti)}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100 text-xs font-black inline-flex items-center gap-2"
                >
                  <Trash2 size={15} />
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isSubmitted && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Jenis Portofolio"
              value={state.jenis_portofolio || ""}
              onChange={(value) =>
                updateDetailField(idElemen, "jenis_portofolio", value)
              }
              options={jenisPortofolioOptions}
            />

            <InputField
              label="Nama Dokumen"
              value={state.nama_dokumen || ""}
              onChange={(value) =>
                updateDetailField(idElemen, "nama_dokumen", value)
              }
              placeholder="Contoh: Sertifikat / Laporan"
            />

            <InputField
              label="Nomor Dokumen"
              value={state.nomor_dokumen || ""}
              onChange={(value) =>
                updateDetailField(idElemen, "nomor_dokumen", value)
              }
              placeholder="Nomor dokumen"
            />

            <InputField
              label="Tanggal Dokumen"
              type="date"
              value={state.tanggal_dokumen || ""}
              onChange={(value) =>
                updateDetailField(idElemen, "tanggal_dokumen", value)
              }
            />
          </div>

          <label className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4 cursor-pointer hover:border-orange-200 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Upload size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-black text-[#071E3D]">
                {state.file_dokumen
                  ? state.file_dokumen.name
                  : "Pilih file bukti"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                File dikirim sebagai file_dokumen.
              </p>
            </div>

            <input
              type="file"
              onChange={(e) =>
                updateDetailField(
                  idElemen,
                  "file_dokumen",
                  e.target.files?.[0] || null
                )
              }
              className="hidden"
            />
          </label>

          <button
            type="button"
            disabled={!state.id_detail || savingKey === `upload-${idElemen}`}
            onClick={() => uploadBukti(idElemen)}
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingKey === `upload-${idElemen}` ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Upload size={17} />
            )}
            Upload Bukti
          </button>
        </div>
      )}
    </div>
  );
}

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
            Asesmen Mandiri
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

const ErrorAlert = ({ message }) => {
  return (
    <div className="rounded-[24px] bg-red-50 border border-red-100 p-5 flex gap-3 items-start shadow-sm">
      <AlertCircle className="text-red-500 shrink-0" size={22} />
      <div>
        <h3 className="font-black text-red-700">Terjadi Kesalahan</h3>
        <p className="text-red-500 text-sm mt-1 font-medium">{message}</p>
      </div>
    </div>
  );
};

const RadioKompeten = ({ label, value, checked, onChange, disabled }) => {
  return (
    <label
      className={`px-4 py-3 rounded-2xl border cursor-pointer transition-all ${
        checked
          ? "bg-orange-50 border-orange-200 text-orange-600"
          : "bg-slate-50 border-slate-100 text-[#071E3D]"
      } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mr-2 accent-orange-500"
      />
      <span className="text-sm font-black">{label}</span>
    </label>
  );
};

const InputField = ({ label, value, onChange, placeholder = "", type = "text" }) => {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
        {label}
      </label>

      <div className="relative">
        {type === "text" && (
          <Hash
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${
            type === "text" ? "pl-11" : "pl-5"
          } pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D]`}
        />
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options }) => {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D]"
      >
        <option value="">Pilih Jenis Portofolio</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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