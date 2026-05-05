// src/pages/asesi/APL01.jsx

import React, { useEffect, useState } from "react";
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
  ChevronRight,
  Inbox,
} from "lucide-react";

const APL01 = () => {
  const { id_peserta } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [peserta, setPeserta] = useState(null);
  const [persyaratan, setPersyaratan] = useState([]);
  const [apl01, setApl01] = useState(null);

  const [selectedPersyaratan, setSelectedPersyaratan] = useState([]);
  const [dokumenTambahan, setDokumenTambahan] = useState({});
  const [nomorDokumen, setNomorDokumen] = useState({});
  const [tanggalDokumen, setTanggalDokumen] = useState({});

  const [tujuan, setTujuan] = useState("");
  const [tujuanLainnya, setTujuanLainnya] = useState("");

  const ENDPOINT = {
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

      setPeserta(formRes.data?.peserta || null);
      setPersyaratan(formRes.data?.persyaratan || []);

      try {
        const apl01Res = await axios.get(ENDPOINT.getApl01, {
          headers: getHeaders(),
        });

        const existingApl01 = apl01Res.data?.data || null;

        if (existingApl01) {
          setApl01(existingApl01);
          setTujuan(existingApl01.tujuan_asesmen || "");
          setTujuanLainnya(existingApl01.tujuan_lainnya || "");

          const dokumenList =
            existingApl01.dokumen ||
            existingApl01.Apl01Dokumens ||
            existingApl01.Apl01Dokumen ||
            existingApl01.apl01_dokumen ||
            existingApl01.apl01_dokumens ||
            [];

          const uploadedPersyaratanIds = dokumenList
            .map((d) => d.id_persyaratan)
            .filter(Boolean);

          setSelectedPersyaratan(uploadedPersyaratanIds);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengambil data APL01.");
    } finally {
      setLoading(false);
    }
  };

  const getPersyaratanInfo = (item) => {
    const dataPersyaratan =
      item.Persyaratan ||
      item.persyaratan ||
      item.persyaratan_data ||
      item;

    return {
      id_persyaratan:
        item.id_persyaratan ||
        dataPersyaratan.id_persyaratan ||
        dataPersyaratan.id,

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

  const handlePersyaratanChange = (e) => {
    const id = parseInt(e.target.value, 10);
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
      [id_persyaratan]: file,
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
    if (apl01?.status === "submit") {
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
      if (!apl01 && !dokumenTambahan[id]) {
        alert("Semua persyaratan yang dipilih wajib upload dokumen.");
        return false;
      }
    }

    return true;
  };

  const createAPL01 = async () => {
    const res = await axios.post(
      ENDPOINT.createApl01,
      {
        id_peserta,
        tujuan_asesmen: tujuan,
        tujuan_lainnya: tujuan === "lainnya" ? tujuanLainnya : null,
      },
      {
        headers: getHeaders(),
      }
    );

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

        if (!currentApl01 || !currentApl01.id_apl01) {
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
      alert(err.response?.data?.message || "Gagal submit APL01.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = selectedPersyaratan.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-5" size={44} />
          <p className="text-[#071E3D] font-black text-lg">Memuat APL01</p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Formulir APL01
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  APL01 - Aplikasi Asesmen
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Lengkapi tujuan asesmen, pilih persyaratan, upload dokumen,
                  lalu submit aplikasi asesmen.
                </p>

                {peserta && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <InfoBadge label="ID Peserta" value={peserta.id_peserta} />
                    <InfoBadge label="ID Jadwal" value={peserta.id_jadwal} />
                    <InfoBadge
                      label="ID Skema"
                      value={
                        peserta.id_skema ||
                        peserta.jadwal?.id_skema ||
                        peserta.Jadwal?.id_skema ||
                        "-"
                      }
                    />
                    <InfoBadge
                      label="Status APL01"
                      value={apl01?.status || "Belum Dibuat"}
                    />
                  </div>
                )}
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-5 min-w-[240px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />

                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Persyaratan Dipilih
                  </p>

                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black">{selectedCount}</h2>
                    <FileText className="text-orange-400" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 space-y-6">
              <Card title="Tujuan Asesmen" icon={<ShieldCheck size={22} />}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                      Pilih Tujuan Asesmen
                    </label>

                    <div className="relative">
                      <select
                        value={tujuan}
                        onChange={(e) => setTujuan(e.target.value)}
                        required
                        disabled={apl01?.status === "submit"}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="">Pilih Tujuan</option>
                        <option value="sertifikasi">Sertifikasi</option>
                        <option value="sertifikasi_ulang">Sertifikasi Ulang</option>
                        <option value="pkk">Pengakuan Kompetensi Terkini</option>
                        <option value="rpl">Rekognisi Pembelajaran Lampau</option>
                        <option value="lainnya">Lainnya</option>
                      </select>

                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  {tujuan === "lainnya" && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                        Tujuan Lainnya
                      </label>

                      <input
                        type="text"
                        placeholder="Tuliskan tujuan asesmen lainnya"
                        value={tujuanLainnya}
                        onChange={(e) => setTujuanLainnya(e.target.value)}
                        disabled={apl01?.status === "submit"}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] disabled:opacity-70 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Persyaratan Skema" icon={<FileText size={22} />}>
                {persyaratan.length > 0 ? (
                  <div className="space-y-4">
                    {persyaratan.map((item, index) => {
                      const p = getPersyaratanInfo(item);
                      const id = p.id_persyaratan;

                      if (!id) return null;

                      const checked = selectedPersyaratan.includes(id);
                      const uploadedFile = dokumenTambahan[id];

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
                              disabled={apl01?.status === "submit"}
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

                                {checked && uploadedFile && (
                                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <CheckCircle size={13} />
                                    File siap
                                  </span>
                                )}

                                {checked && !uploadedFile && apl01 && (
                                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                    <CheckCircle size={13} />
                                    Sudah tersimpan
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
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                                    Nomor Dokumen
                                  </label>

                                  <input
                                    type="text"
                                    placeholder="Masukkan nomor dokumen"
                                    value={nomorDokumen[id] || ""}
                                    onChange={(e) =>
                                      handleNomorDokumenChange(id, e.target.value)
                                    }
                                    disabled={apl01?.status === "submit"}
                                    className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D] disabled:opacity-70 disabled:cursor-not-allowed"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50 mb-3">
                                    Tanggal Dokumen
                                  </label>

                                  <input
                                    type="date"
                                    value={tanggalDokumen[id] || ""}
                                    onChange={(e) =>
                                      handleTanggalDokumenChange(id, e.target.value)
                                    }
                                    disabled={apl01?.status === "submit"}
                                    className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D] disabled:opacity-70 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>

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
                                        : apl01
                                        ? "Pilih file baru jika ingin upload ulang"
                                        : "Pilih file dokumen"}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                      File dikirim ke backend sebagai file_dokumen.
                                    </p>
                                  </div>

                                  <input
                                    type="file"
                                    onChange={(e) =>
                                      handleDokumenChange(id, e.target.files[0])
                                    }
                                    disabled={apl01?.status === "submit"}
                                    className="hidden"
                                    required={!apl01}
                                  />
                                </label>
                              </div>
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

            <aside className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                <Card title="Informasi Submit" icon={<PenLine size={22} />}>
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5 text-orange-600">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={22} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black">Alur Backend</p>
                          <p className="text-sm font-medium mt-1">
                            Sistem akan membuat APL01, upload dokumen satu per satu,
                            lalu submit final.
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

                <div className="bg-[#071E3D] rounded-[30px] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2">Ringkasan APL01</h3>

                    <div className="space-y-3 mt-5">
                      <SummaryItem label="ID Peserta" value={id_peserta || "-"} />
                      <SummaryItem label="Persyaratan Dipilih" value={selectedCount} />
                      <SummaryItem label="Tujuan Asesmen" value={tujuan || "-"} />
                      <SummaryItem label="Status" value={apl01?.status || "Draft Baru"} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || apl01?.status === "submit"}
                  className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                    submitting || apl01?.status === "submit"
                      ? "bg-orange-300 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}

                  {apl01?.status === "submit"
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

const Card = ({ title, icon, children }) => {
  return (
    <section className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
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

const InfoBadge = ({ label, value }) => {
  return (
    <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-black text-[#071E3D] mt-1">{value || "-"}</p>
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