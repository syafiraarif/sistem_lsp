import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Info,
  FileText,
  Briefcase,
  CheckCircle2,
  Search,
  HelpCircle,
  Database,
  Calendar,
  ClipboardList,
  AlertCircle,
  AlertTriangle, // Pastikan ini terimport
  X,
  Send,
  Loader2
} from "lucide-react";

import { createSurveillance } from "../../services/surveillance.service";
import { getSkema } from "../../services/skema.service";

export default function SurveillancePage() {
  const [step, setStep] = useState(1);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [apiMessage, setApiMessage] = useState("");
  const recaptchaRef = useRef(null);

  // State Form
  const [form, setForm] = useState({
    nik: "",
    id_skema: "",
    periode_surveillance: "",
    nomor_sertifikat: "",
    nomor_registrasi: "",
    sumber_dana: "",
    nama_perusahaan: "",
    alamat_perusahaan: "",
    jabatan_pekerjaan: "",
    nama_proyek: "",
    jabatan_dalam_proyek: "",
    kesesuaian_kompetensi: "",
    keterangan_lainnya: "",
    captchaToken: "", 
  });

  // 1. Mencegah data hilang saat refresh tidak sengaja
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step > 1 || form.nik) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, form.nik]);

  // 2. Load Skema
  useEffect(() => {
    const fetchSkema = async () => {
      try {
        const data = await getSkema();
        setSkemaList(data);
      } catch (err) {
        console.error("Gagal load skema:", err);
      }
    };
    fetchSkema();
  }, []);

  // 3. Scroll to top saat ganti step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "nik") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 16) {
        setForm(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }

    if (name === "nomor_sertifikat" || name === "nomor_registrasi") {
      setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }

    const textFields = ["nama_perusahaan", "jabatan_pekerjaan", "nama_proyek", "jabatan_dalam_proyek"];
    if (textFields.includes(name)) {
      const cleanValue = value.replace(/[^a-zA-Z0-9\s.,-]/g, "");
      setForm(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onCaptchaChange = (token) => {
    setForm(prev => ({ ...prev, captchaToken: token }));
    if (token) setErrors(prev => ({ ...prev, captchaToken: null }));
  };

  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!form.nik || form.nik.length !== 16) newErrors.nik = "NIK harus 16 digit";
      if (!form.id_skema) newErrors.id_skema = "Pilih skema sertifikasi";
      if (!form.periode_surveillance) newErrors.periode_surveillance = "Pilih periode";
      if (!form.nomor_sertifikat) newErrors.nomor_sertifikat = "Nomor sertifikat wajib diisi";
    } 
    else if (step === 2) {
      if (!form.sumber_dana) newErrors.sumber_dana = "Pilih sumber dana";
      if (!form.nama_perusahaan || form.nama_perusahaan.length < 3) newErrors.nama_perusahaan = "Nama perusahaan tidak valid";
      if (!form.jabatan_pekerjaan) newErrors.jabatan_pekerjaan = "Jabatan wajib diisi";
      if (!form.nomor_registrasi) newErrors.nomor_registrasi = "Nomor registrasi BNSP wajib diisi";
      if (!form.alamat_perusahaan) newErrors.alamat_perusahaan = "Alamat kantor wajib diisi";
    }
    else if (step === 3) {
      if (!form.nama_proyek) newErrors.nama_proyek = "Nama proyek wajib diisi";
      if (!form.kesesuaian_kompetensi) newErrors.kesesuaian_kompetensi = "Pilih status kesesuaian";
      if (!form.captchaToken) newErrors.captchaToken = "Verifikasi Captcha diperlukan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setSubmitStatus(null);

    try {
      await createSurveillance(form);
      setSubmitStatus("success");
      setApiMessage("Laporan Surveillance berhasil dikirim ke sistem LSP!");
      
      setForm({
        nik: "", id_skema: "", periode_surveillance: "", nomor_sertifikat: "",
        nomor_registrasi: "", sumber_dana: "", nama_perusahaan: "",
        alamat_perusahaan: "", jabatan_pekerjaan: "", nama_proyek: "",
        jabatan_dalam_proyek: "", kesesuaian_kompetensi: "", keterangan_lainnya: "",
        captchaToken: ""
      });
      setStep(1);
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (err) {
      setSubmitStatus("error");
      setApiMessage(err.response?.data?.message || "Gagal mengirim laporan. Cek koneksi Anda.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setForm(prev => ({ ...prev, captchaToken: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#071E3D]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8">
            <header className="mb-10">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-[#071E3D] mb-4 tracking-tight"
              >
                Formulir <span className="text-orange-500">Surveillance</span>
              </motion.h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Pemantauan berkala pemegang sertifikat kompetensi untuk memastikan pemeliharaan kompetensi tetap sesuai standar BNSP.
              </p>
            </header>

            <AnimatePresence>
              {submitStatus && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={`overflow-hidden rounded-[2rem] border flex gap-4 p-6 ${
                    submitStatus === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-white shadow-sm shrink-0 ${submitStatus === "success" ? "text-emerald-500" : "text-red-500"}`}>
                    {submitStatus === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-relaxed">{apiMessage}</p>
                    <button 
                      onClick={() => setSubmitStatus(null)} 
                      className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-1"
                    >
                      Tutup Notifikasi <X size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                    step === num ? "bg-[#071E3D] text-white shadow-xl shadow-[#071E3D]/20 scale-110" : 
                    step > num ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {step > num ? <CheckCircle2 size={22} /> : num}
                  </div>
                  {num < 3 && <div className="w-10 h-[2px] bg-slate-100" />}
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-14 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><FileText size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Data Sertifikasi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="NIK Sesuai Sertifikat*" name="nik" value={form.nik} onChange={handleChange} placeholder="Masukkan 16 digit NIK" error={errors.nik} maxLength={16} />
                      <SelectGroup label="Periode Surveillance*" name="periode_surveillance" value={form.periode_surveillance} onChange={handleChange} error={errors.periode_surveillance}>
                        <option value="">Pilih Tahun</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </SelectGroup>
                      <SelectGroup label="Pilih Skema Sertifikasi*" name="id_skema" value={form.id_skema} onChange={handleChange} error={errors.id_skema}>
                        <option value="">Pilih Skema</option>
                        {skemaList.map(s => <option key={s.id_skema} value={s.id_skema}>{s.judul_skema}</option>)}
                      </SelectGroup>
                      <InputGroup label="Nomor Sertifikat*" name="nomor_sertifikat" value={form.nomor_sertifikat} onChange={handleChange} placeholder="Contoh: LSP/RJI/..." error={errors.nomor_sertifikat} />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><Briefcase size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Data Pekerjaan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectGroup label="Sumber Dana*" name="sumber_dana" value={form.sumber_dana} onChange={handleChange} error={errors.sumber_dana}>
                        <option value="">Pilih Sumber Dana</option>
                        <option value="apbn">APBN</option>
                        <option value="apbd">APBD</option>
                        <option value="perusahaan">Instansi / Perusahaan</option>
                        <option value="mandiri">Mandiri / Pribadi</option>
                      </SelectGroup>
                      <InputGroup label="Nama Instansi/Perusahaan*" name="nama_perusahaan" value={form.nama_perusahaan} onChange={handleChange} placeholder="Nama Tempat Kerja" error={errors.nama_perusahaan} />
                      <InputGroup label="Jabatan Struktural*" name="jabatan_pekerjaan" value={form.jabatan_pekerjaan} onChange={handleChange} placeholder="Jabatan Saat Ini" error={errors.jabatan_pekerjaan} />
                      <InputGroup label="Nomor Registrasi BNSP*" name="nomor_registrasi" value={form.nomor_registrasi} onChange={handleChange} placeholder="MET.000.XXX..." error={errors.nomor_registrasi} />
                      <div className="md:col-span-2">
                        <InputGroup label="Alamat Perusahaan*" name="alamat_perusahaan" value={form.alamat_perusahaan} onChange={handleChange} placeholder="Alamat lengkap lokasi kerja" error={errors.alamat_perusahaan} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><ClipboardList size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Aktivitas & Keamanan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Nama Proyek/Pekerjaan*" name="nama_proyek" value={form.nama_proyek} onChange={handleChange} placeholder="Proyek yang sedang ditangani" error={errors.nama_proyek} />
                      <InputGroup label="Jabatan Dalam Proyek*" name="jabatan_dalam_proyek" value={form.jabatan_dalam_proyek} onChange={handleChange} placeholder="Contoh: Supervisor / Lead" />
                      <div className="md:col-span-2">
                        <SelectGroup label="Kesesuaian Kompetensi*" name="kesesuaian_kompetensi" value={form.kesesuaian_kompetensi} onChange={handleChange} error={errors.kesesuaian_kompetensi}>
                          <option value="">Apakah pekerjaan sesuai skema sertifikasi?</option>
                          <option value="sesuai">Ya, Sangat Sesuai</option>
                          <option value="tidak_sesuai">Tidak Sesuai</option>
                          <option value="lainnya">Lainnya (Jelaskan di bawah)</option>
                        </SelectGroup>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">Keterangan Tambahan</label>
                        <textarea 
                          name="keterangan_lainnya"
                          value={form.keterangan_lainnya}
                          onChange={handleChange}
                          placeholder="Berikan catatan tambahan mengenai relevansi pekerjaan Anda dengan sertifikat"
                          className="w-full mt-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D] min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 py-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <ShieldCheck size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verifikasi Keamanan</span>
                      </div>
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="YOUR_RECAPTCHA_SITE_KEY" 
                        onChange={onCaptchaChange}
                      />
                      {errors.captchaToken && (
                        <div className="flex items-center gap-1.5 animate-shake">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-[10px] font-bold text-red-500 uppercase">{errors.captchaToken}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-14 flex justify-between items-center">
                {step > 1 ? (
                  <button onClick={prevStep} className="font-black uppercase tracking-widest text-xs text-slate-400 hover:text-[#071E3D] flex items-center gap-2 transition-all group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                  </button>
                ) : <div />}
                
                <button 
                  onClick={step === 3 ? handleSubmit : nextStep} 
                  disabled={loading}
                  className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl ${
                    step === 3 
                      ? "bg-orange-500 text-white hover:bg-[#071E3D] shadow-orange-500/20" 
                      : "bg-[#071E3D] text-white hover:bg-orange-600 shadow-[#071E3D]/20"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Memproses...</span>
                  ) : step === 3 ? (
                    <span className="flex items-center gap-2">Kirim Laporan <Send size={16} /></span>
                  ) : "Langkah Selanjutnya"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-orange-600">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm"><Info size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-xs">Informasi Penting</h3>
              </div>
              <div className="space-y-6">
                <SidebarInfo icon={Calendar} text="Surveillance dilakukan minimal setahun sekali." />
                <SidebarInfo icon={Search} text="Memastikan sertifikat tetap aktif di BNSP." />
                <SidebarInfo icon={Database} text="Data akan divalidasi dengan sistem LSP." />
              </div>
            </div>

            <Link to="/faq" className="group block relative">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="overflow-hidden bg-[#071E3D] rounded-[2.5rem] p-1 shadow-2xl shadow-[#071E3D]/20"
              >
                <div className="relative bg-[#071E3D] rounded-[2.3rem] p-8 border border-white/5 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <HelpCircle size={32} strokeWidth={2.5} />
                    </div>
                  </div>
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-3">Pusat Bantuan</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-8 px-4 font-medium">Butuh bantuan mengisi form? Klik untuk panduan Surveillance.</p>
                  <div className="w-full py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all duration-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-[#071E3D]">Buka FAQ</span>
                    <ChevronRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarInfo({ icon: Icon, text }) {
  return (
    <div className="flex gap-4 group/item">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-300 text-orange-500 shadow-sm">
        <Icon size={16} />
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed font-bold">{text}</p>
    </div>
  );
}

// Komponen Input dengan Icon AlertTriangle
function InputGroup({ label, name, value, onChange, placeholder, type = "text", error, maxLength }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <div className="relative group">
        <input 
          type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
          className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] ${
            error ? "border-red-500 bg-red-50/50" : "border-slate-100"
          }`}
        />
      </div>
      {error && (
        <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 ml-1 animate-shake">
          <AlertTriangle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

// Komponen Select dengan Icon AlertTriangle
function SelectGroup({ label, children, onChange, value, name, error }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <div className="relative group">
        <select name={name} value={value} onChange={onChange}
          className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] appearance-none cursor-pointer ${
            error ? "border-red-500 bg-red-50/50" : "border-slate-100"
          }`}
        >
          {children}
        </select>
        <div className="absolute top-1/2 -translate-y-1/2 right-6 flex items-center pointer-events-none transition-all">
            <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {error && (
        <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 ml-1 animate-shake">
          <AlertTriangle size={12} /> {error}
        </span>
      )}
    </div>
  );
}