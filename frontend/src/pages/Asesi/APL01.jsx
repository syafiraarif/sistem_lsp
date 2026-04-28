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
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [skema, setSkema] = useState(null);
  const [persyaratan, setPersyaratan] = useState([]);
  const [selectedPersyaratan, setSelectedPersyaratan] = useState([]);
  const [dokumenTambahan, setDokumenTambahan] = useState({});
  const [tujuan, setTujuan] = useState("");
  const [tujuanLainnya, setTujuanLainnya] = useState("");
  const [useTTD, setUseTTD] = useState(false);
  const [profileTTD, setProfileTTD] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const skemaRes = await axios.get(
          `${API_BASE}/asesi/skema/${id_skema}/persyaratan`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPersyaratan(skemaRes.data.data || []);
        setSkema({ id_skema });

        const ttdRes = await axios.get(`${API_BASE}/asesi/profile/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ttdData = ttdRes.data?.data?.ttd || null;
        setProfileTTD(ttdData);

        if (ttdData) setUseTTD(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, id_skema, navigate]);

  const handlePersyaratanChange = (e) => {
    const id = parseInt(e.target.value);

    setSelectedPersyaratan((prev) =>
      e.target.checked ? [...prev, id] : prev.filter((v) => v !== id)
    );

    if (e.target.checked && !dokumenTambahan[id]) {
      setDokumenTambahan((prev) => ({ ...prev, [id]: null }));
    }

    if (!e.target.checked) {
      setDokumenTambahan((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDokumenChange = (id, file) => {
    setDokumenTambahan((prev) => ({ ...prev, [id]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const id of selectedPersyaratan) {
      if (!dokumenTambahan[id]) {
        alert("Semua persyaratan yang dicentang harus dilengkapi dengan dokumen!");
        return;
      }
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("id_skema", skema.id_skema);
      formData.append("selected_persyaratan", JSON.stringify(selectedPersyaratan));
      formData.append("tujuan_asesmen", tujuan);

      if (tujuan === "lainnya") {
        formData.append("tujuan_asesmen_lainnya", tujuanLainnya);
      }

      selectedPersyaratan.forEach((id) => {
        formData.append(`dokumen_tambahan[${id}]`, dokumenTambahan[id]);
      });

      if (useTTD && profileTTD) {
        formData.append("tanda_tangan", profileTTD);
      }

      await axios.post(`${API_BASE}/asesi/aplikasi`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Aplikasi APL01 berhasil disubmit!");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat submit.");
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
                  Lengkapi tujuan asesmen, pilih persyaratan skema, unggah
                  dokumen pendukung, lalu submit aplikasi asesmen Anda.
                </p>
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
              <Card title="Persyaratan Skema" icon={<FileText size={22} />}>
                {persyaratan.length > 0 ? (
                  <div className="space-y-4">
                    {persyaratan.map((p) => {
                      const id = p.id_persyaratan;
                      const checked = selectedPersyaratan.includes(id);
                      const uploadedFile = dokumenTambahan[id];

                      return (
                        <div
                          key={id}
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
                              onChange={handlePersyaratanChange}
                              checked={checked}
                              className="mt-1 w-5 h-5 accent-orange-500"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-black text-[#071E3D]">
                                  {p.nama_persyaratan ||
                                    `Persyaratan ${p.id_persyaratan}`}
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
                              </div>

                              <p className="text-slate-400 text-xs font-medium">
                                Centang persyaratan lalu unggah dokumen
                                pendukung yang sesuai.
                              </p>
                            </div>
                          </label>

                          {checked && (
                            <div className="mt-5 ml-0 md:ml-9">
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
                                      : "Pilih file dokumen"}
                                  </p>
                                  <p className="text-xs text-slate-400 font-medium mt-1">
                                    Upload file persyaratan sesuai ketentuan.
                                  </p>
                                </div>

                                <input
                                  type="file"
                                  onChange={(e) =>
                                    handleDokumenChange(id, e.target.files[0])
                                  }
                                  className="hidden"
                                  required
                                />
                              </label>
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Tujuan</option>
                        <option value="sertifikasi">Sertifikasi</option>
                        <option value="sertifikasi_ulang">Sertifikasi Ulang</option>
                        <option value="pengakuan_kompetensi_terkini">
                          Pengakuan Kompetensi Terkini
                        </option>
                        <option value="rekognisi_pembelajaran_lampau">
                          Rekognisi Pembelajaran Lampau
                        </option>
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D]"
                        required
                      />
                    </div>
                  )}
                </div>
              </Card>
            </section>

            <aside className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                <Card title="Tanda Tangan" icon={<PenLine size={22} />}>
                  {profileTTD ? (
                    <div className="space-y-5">
                      <label
                        className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all ${
                          useTTD
                            ? "bg-orange-50 border-orange-200"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={useTTD}
                          onChange={(e) => setUseTTD(e.target.checked)}
                          className="w-5 h-5 accent-orange-500"
                        />

                        <div>
                          <p className="font-black text-[#071E3D]">
                            Gunakan TTD Profil
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            Tanda tangan akan dilampirkan pada APL01.
                          </p>
                        </div>
                      </label>

                      {useTTD && (
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Preview TTD
                          </p>
                          <img
                            src={profileTTD}
                            alt="TTD Profil"
                            className="w-full max-h-40 object-contain bg-white border border-slate-100 rounded-xl p-3"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-red-600">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={22} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black">TTD Belum Tersedia</p>
                          <p className="text-sm font-medium mt-1">
                            Silakan upload tanda tangan terlebih dahulu di menu
                            Profile Dokumen.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <div className="bg-[#071E3D] rounded-[30px] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2">
                      Ringkasan APL01
                    </h3>

                    <div className="space-y-3 mt-5">
                      <SummaryItem label="Persyaratan Dipilih" value={selectedCount} />
                      <SummaryItem
                        label="Tujuan Asesmen"
                        value={tujuan || "-"}
                      />
                      <SummaryItem
                        label="Status TTD"
                        value={useTTD && profileTTD ? "Digunakan" : "Belum digunakan"}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                    submitting
                      ? "bg-orange-300 cursor-wait"
                      : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? "Mengirim..." : "Submit APL01"}
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