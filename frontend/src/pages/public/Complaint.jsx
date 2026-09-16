import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  User,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Info,
  CheckCircle2,
  Mail,
  Send,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  AlertTriangle
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Complaint() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    nama_pengadu: "",
    nik_pengadu: "",
    email_pengadu: "",
    no_hp_pengadu: "08",
    sebagai_siapa: "",
    isi_pengaduan: "",
    captchaToken: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const validateStep1 = () => {
    const newErrors = {};
    const { nama_pengadu, nik_pengadu, email_pengadu, no_hp_pengadu, sebagai_siapa } = formData;

    if (!nama_pengadu.trim()) {
      newErrors.nama_pengadu = "Nama wajib diisi";
    }

    if (!nik_pengadu) {
      newErrors.nik_pengadu = "NIK wajib diisi";
    } else if (nik_pengadu.length !== 16) {
      newErrors.nik_pengadu = "NIK harus tepat 16 digit";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email_pengadu) {
      newErrors.email_pengadu = "Email wajib diisi";
    } else if (!emailRegex.test(email_pengadu)) {
      newErrors.email_pengadu = "Format email tidak valid";
    }

    if (no_hp_pengadu === "08") {
      newErrors.no_hp_pengadu = "Nomor WhatsApp wajib diisi";
    } else if (no_hp_pengadu.length !== 13) {
      newErrors.no_hp_pengadu = "Nomor WhatsApp harus tepat 13 digit";
    }

    if (!sebagai_siapa) {
      newErrors.sebagai_siapa = "Pilih kategori pelapor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_pengadu") {
      const sanitized = value.replace(/[0-9]/g, "");
      setFormData({ ...formData, [name]: sanitized });
    } else if (name === "nik_pengadu") {
      const sanitized = value.replace(/[^0-9]/g, "").slice(0, 16);
      setFormData({ ...formData, [name]: sanitized });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);

    setFormData({ ...formData, no_hp_pengadu: `08${digits}` });

    if (errors.no_hp_pengadu) {
      setErrors({ ...errors, no_hp_pengadu: null });
    }
  };

  const onCaptchaChange = (token) => {
    setFormData({ ...formData, captchaToken: token });

    if (token) {
      setErrors({ ...errors, captchaToken: null });
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const resetForm = () => {
    setStep(1);
    setFormData({
      nama_pengadu: "",
      nik_pengadu: "",
      email_pengadu: "",
      no_hp_pengadu: "08",
      sebagai_siapa: "",
      isi_pengaduan: "",
      captchaToken: ""
    });
    setErrors({});

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async () => {
    if (!formData.isi_pengaduan || formData.isi_pengaduan.trim().length < 10) {
      setErrors((prev) => ({ ...prev, isi_pengaduan: "Isi pengaduan terlalu singkat (minimal 10 karakter)." }));
      return;
    }

    if (!formData.captchaToken) {
      await notifikasi.peringatan("Captcha Belum Diisi", "Silakan selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData, tanggal_pengaduan: new Date().toISOString() };
      const response = await axios.post(`${API_URL}/pengaduan`, payload);

      if (response.status === 200 || response.status === 201) {
        await notifikasi.sukses("Pengaduan Berhasil Dikirim", "Pengaduan Anda telah berhasil dikirim dan akan diproses oleh petugas.");

        resetForm();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengirim pengaduan.";

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setFormData((prev) => ({ ...prev, captchaToken: "" }));

      await notifikasi.gagal("Pengaduan Gagal Dikirim", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-orange-500/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#071E3D]/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <header className="mb-10">
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 text-4xl font-black tracking-tight text-[#071E3D]">
                Layanan <span className="text-orange-500">Pengaduan Masyarakat</span>
              </motion.h1>

              <p className="font-medium leading-relaxed text-slate-500">
                Sampaikan keluhan atau ketidaksesuaian pelayanan LSP melalui kanal resmi SIMLSP.
              </p>
            </header>

            <div className="mb-12 flex items-center gap-4">
              {[1, 2].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold transition-all duration-500 ${step === num ? "scale-110 bg-[#071E3D] text-white shadow-xl shadow-[#071E3D]/20" : step > num ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {step > num ? <CheckCircle2 size={22} /> : num}
                  </div>

                  {num < 2 && <div className="h-[2px] w-10 bg-slate-100" />}
                </div>
              ))}
            </div>

            <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)] md:p-14">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                        <User size={24} />
                      </div>

                      <h2 className="text-xl font-black text-[#071E3D]">
                        Data Pelapor
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <InputGroup label="Nama Lengkap*" name="nama_pengadu" value={formData.nama_pengadu} onChange={handleChange} placeholder="Masukkan nama sesuai KTP" error={errors.nama_pengadu} />

                      <InputGroup label="NIK KTP* (16 Digit)" name="nik_pengadu" value={formData.nik_pengadu} onChange={handleChange} placeholder="Contoh: 3201xxxxxxxxxxxx" error={errors.nik_pengadu} maxLength={16} />

                      <InputGroup label="Alamat Email*" name="email_pengadu" value={formData.email_pengadu} onChange={handleChange} placeholder="nama@email.com" type="email" error={errors.email_pengadu} />

                      <PhoneInputGroup label="Nomor WhatsApp* (13 Digit)" value={formData.no_hp_pengadu.slice(2)} onChange={handlePhoneChange} placeholder="12345678901" error={errors.no_hp_pengadu} />

                      <div className="md:col-span-2">
                        <SelectGroup label="Bertindak Sebagai*" name="sebagai_siapa" value={formData.sebagai_siapa} onChange={handleChange} error={errors.sebagai_siapa}>
                          <option value="">Pilih Kategori</option>
                          <option value="asesi">Asesi (Peserta Sertifikasi)</option>
                          <option value="asesor">Asesor (Penguji)</option>
                          <option value="masyarakat">Masyarakat Umum</option>
                        </SelectGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                        <MessageSquare size={24} />
                      </div>

                      <h2 className="text-xl font-black text-[#071E3D]">
                        Detail Aduan
                      </h2>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
                        Isi Pengaduan* (Minimal 10 Karakter)
                      </label>

                      <textarea name="isi_pengaduan" value={formData.isi_pengaduan} onChange={handleChange} rows="6" placeholder="Ceritakan keluhan Anda secara mendetail agar kami dapat memproses lebih cepat..." className={`resize-none rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none focus:ring-4 ${errors.isi_pengaduan ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"}`} />

                      {errors.isi_pengaduan && (
                        <div className="mt-1 flex items-center gap-1.5 px-1">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
                            {errors.isi_pengaduan}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Verifikasi Keamanan
                        </span>
                      </div>

                      <ReCAPTCHA ref={recaptchaRef} sitekey="6LdSGX4sAAAAAA7BAt1iY8OVxtnx_EFunFBQV-QF" onChange={onCaptchaChange} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-14 flex items-center justify-between">
                {step > 1 ? (
                  <button onClick={prevStep} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-[#071E3D]">
                    <ChevronLeft size={18} />
                    Kembali
                  </button>
                ) : (
                  <div />
                )}

                <button onClick={step === 2 ? handleSubmit : nextStep} disabled={loading} className={`rounded-2xl px-10 py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-300 ${step === 2 ? "bg-orange-500 text-white shadow-orange-500/20 hover:bg-[#071E3D]" : "bg-[#071E3D] text-white shadow-[#071E3D]/20 hover:bg-orange-600"} ${loading ? "cursor-not-allowed opacity-70" : ""}`}>
                  {loading ? (
                    "Mengirim..."
                  ) : step === 2 ? (
                    <span className="flex items-center gap-2">
                      Kirim Pengaduan
                      <Send size={16} />
                    </span>
                  ) : (
                    "Lanjut ke Pesan"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-32 lg:col-span-4">
            <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 text-orange-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                  <span className="animate-pulse">
                    <Info size={20} />
                  </span>
                </div>

                <h3 className="text-xs font-black uppercase tracking-widest">
                  Penting
                </h3>
              </div>

              <div className="space-y-6">
                <InfoItem icon={Fingerprint} text="Siapkan NIK KTP valid untuk keperluan verifikasi data pelapor." />
                <InfoItem icon={Mail} text="Pastikan email aktif untuk koordinasi lebih lanjut." />
                <InfoItem icon={AlertCircle} text="Layanan ini hanya untuk keluhan terkait sertifikasi." />
                <InfoItem icon={CheckCircle2} text="Identitas pelapor dijamin kerahasiaannya." />
              </div>
            </div>

            <Link to="/faq" className="group relative block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="overflow-hidden rounded-[2.5rem] bg-[#071E3D] p-1 shadow-2xl shadow-[#071E3D]/20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col items-center rounded-[2.3rem] border border-white/5 bg-[#071E3D] p-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 transition-opacity group-hover:opacity-40" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg transition-transform duration-500 group-hover:rotate-12">
                      <HelpCircle size={32} strokeWidth={2.5} />
                    </div>
                  </div>

                  <h4 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-white">
                    Pusat Bantuan
                  </h4>

                  <p className="mb-8 px-4 text-[11px] font-medium leading-relaxed text-slate-400">
                    Bingung alur pengaduan? Klik untuk panduan lengkap & FAQ.
                  </p>

                  <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-4 transition-all duration-500 group-hover:bg-orange-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                      Buka FAQ
                    </span>

                    <ChevronRight size={16} className="text-orange-400 transition-all group-hover:translate-x-1 group-hover:text-white" />
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

function InfoItem({ icon: Icon, text }) {
  return (
    <div className="group/item flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm transition-all duration-300 group-hover/item:bg-orange-500 group-hover/item:text-white">
        <Icon size={16} />
      </div>

      <p className="text-[11px] font-bold leading-relaxed text-slate-600">
        {text}
      </p>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", error, maxLength }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ml-1 flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
          {label}
        </label>
      </div>

      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} className={`rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none focus:ring-4 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"}`} />

      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

function PhoneInputGroup({ label, value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ml-1 flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
          {label}
        </label>
      </div>

      <div className={`flex items-center overflow-hidden rounded-2xl border bg-slate-50 transition-all focus-within:ring-4 ${error ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/5" : "border-slate-100 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-orange-500/5"}`}>
        <span className="select-none border-r border-slate-200 bg-slate-100 px-5 py-4 text-sm font-black text-[#071E3D]">
          08
        </span>

        <input type="tel" value={value} onChange={onChange} placeholder={placeholder} maxLength={11} inputMode="numeric" className="w-full border-0 bg-transparent px-5 py-4 text-sm font-bold text-[#071E3D] focus:outline-none focus:ring-0" />
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

function SelectGroup({ label, children, onChange, value, name, error }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ml-1 flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
          {label}
        </label>
      </div>

      <div className="relative">
        <select name={name} value={value} onChange={onChange} className={`w-full appearance-none rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none ${error ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5"}`}>
          {children}
        </select>

        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}