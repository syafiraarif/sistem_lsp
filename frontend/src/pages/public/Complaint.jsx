import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
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
  Sparkles,
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
    nik_pengadu: "", // Tambahan NIK
    email_pengadu: "",
    no_hp_pengadu: "08", // Default prefix 08
    sebagai_siapa: "",
    isi_pengaduan: "",
    captchaToken: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // --- LOGIKA VALIDASI ---
  const validateStep1 = () => {
    let newErrors = {};
    const { nama_pengadu, nik_pengadu, email_pengadu, no_hp_pengadu, sebagai_siapa } = formData;

    if (!nama_pengadu.trim()) newErrors.nama_pengadu = "Nama wajib diisi";
    
    // Validasi NIK Hard-Locked 16 Digit
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

    // Validasi No HP (Minimal 10 digit termasuk 08)
    if (no_hp_pengadu === "08") {
      newErrors.no_hp_pengadu = "Nomor WhatsApp wajib diisi";
    } else if (no_hp_pengadu.length < 10) {
      newErrors.no_hp_pengadu = "Nomor tidak valid (terlalu pendek)";
    }

    if (!sebagai_siapa) newErrors.sebagai_siapa = "Pilih kategori pelapor";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "nik_pengadu") {
      // Hanya angka & Maksimal 16 Digit
      const sanitized = value.replace(/[^0-9]/g, "").slice(0, 16);
      setFormData({ ...formData, [name]: sanitized });
    } 
    else if (name === "no_hp_pengadu") {
      // Proteksi Prefix 08
      let val = value.replace(/[^0-9]/g, "");
      if (!val.startsWith("08")) {
        val = "08";
      }
      setFormData({ ...formData, [name]: val });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const onCaptchaChange = (token) => {
    setFormData({ ...formData, captchaToken: token });
    if (token) setErrors({ ...errors, captchaToken: null });
  };

  const nextStep = () => {
    if (validateStep1()) setStep(step + 1);
  };
  
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.isi_pengaduan || formData.isi_pengaduan.trim().length < 10) {
      setErrors(prev => ({ ...prev, isi_pengaduan: "Isi pengaduan terlalu singkat (minimal 10 karakter)." }));
      return;
    }
    
    if (!formData.captchaToken) {
      alert("Silakan selesaikan verifikasi Captcha.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tanggal_pengaduan: new Date().toISOString()
      };

      const response = await axios.post(`${API_URL}/pengaduan`, payload);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ Pengaduan Anda berhasil dikirim!");
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
        if (recaptchaRef.current) recaptchaRef.current.reset();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengirim pengaduan.";
      alert(`❌ Error: ${errorMsg}`);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setFormData(prev => ({ ...prev, captchaToken: "" }));
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
                Layanan <span className="text-orange-500">Pengaduan Masyarakat</span>
              </motion.h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Sampaikan keluhan atau ketidaksesuaian pelayanan LSP melalui kanal resmi SIMLSP.
              </p>
            </header>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12">
              {[1, 2].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                    step === num ? "bg-[#071E3D] text-white shadow-xl shadow-[#071E3D]/20 scale-110" : 
                    step > num ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {step > num ? <CheckCircle2 size={22} /> : num}
                  </div>
                  {num < 2 && <div className="w-10 h-[2px] bg-slate-100" />}
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-14 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                        <User size={24} />
                      </div>
                      <h2 className="text-xl font-black text-[#071E3D]">Data Pelapor</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup 
                        label="Nama Lengkap*" 
                        name="nama_pengadu"
                        value={formData.nama_pengadu}
                        onChange={handleChange}
                        placeholder="Masukkan nama sesuai KTP" 
                        error={errors.nama_pengadu}
                      />
                      
                      <InputGroup 
                        label="NIK KTP* (16 Digit)" 
                        name="nik_pengadu"
                        value={formData.nik_pengadu}
                        onChange={handleChange}
                        placeholder="Contoh: 3201xxxxxxxxxxxx" 
                        error={errors.nik_pengadu}
                        maxLength={16}
                      />

                      <InputGroup 
                        label="Alamat Email*" 
                        name="email_pengadu"
                        value={formData.email_pengadu}
                        onChange={handleChange}
                        placeholder="nama@email.com" 
                        type="email" 
                        error={errors.email_pengadu}
                      />

                      <InputGroup 
                        label="Nomor WhatsApp* (Awalan 08)" 
                        name="no_hp_pengadu"
                        value={formData.no_hp_pengadu}
                        onChange={handleChange}
                        placeholder="08xxxxxxxx" 
                        error={errors.no_hp_pengadu}
                      />

                      <div className="md:col-span-2">
                        <SelectGroup 
                          label="Bertindak Sebagai*" 
                          name="sebagai_siapa"
                          value={formData.sebagai_siapa}
                          onChange={handleChange}
                          error={errors.sebagai_siapa}
                        >
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
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                        <MessageSquare size={24} />
                      </div>
                      <h2 className="text-xl font-black text-[#071E3D]">Detail Aduan</h2>
                    </div>
                    
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">Isi Pengaduan* (Minimal 10 Karakter)</label>
                      <textarea 
                        name="isi_pengaduan"
                        value={formData.isi_pengaduan}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Ceritakan keluhan Anda secara mendetail agar kami dapat memproses lebih cepat..."
                        className={`px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-bold text-[#071E3D] resize-none ${
                          errors.isi_pengaduan ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
                        }`}
                      />
                      {errors.isi_pengaduan && (
                        <div className="mt-1 flex items-center gap-1.5 px-1 animate-shake">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.isi_pengaduan}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                           <ShieldCheck size={16} className="text-orange-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifikasi Keamanan</span>
                        </div>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6LdSGX4sAAAAAA7BAt1iY8OVxtnx_EFunFBQV-QF" 
                          onChange={onCaptchaChange}
                        />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-14 flex justify-between items-center">
                {step > 1 ? (
                  <button onClick={prevStep} className="font-black uppercase tracking-widest text-xs text-slate-400 hover:text-[#071E3D] flex items-center gap-2 transition-all">
                    <ChevronLeft size={18} /> Kembali
                  </button>
                ) : <div />}
                
                <button 
                  onClick={step === 2 ? handleSubmit : nextStep}
                  disabled={loading}
                  className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl ${
                    step === 2 ? "bg-orange-500 text-white hover:bg-[#071E3D] shadow-orange-500/20" : "bg-[#071E3D] text-white hover:bg-orange-600 shadow-[#071E3D]/20"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Mengirim..." : step === 2 ? (
                    <span className="flex items-center gap-2">Kirim Pengaduan <Send size={16} /></span>
                  ) : "Lanjut ke Pesan"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-orange-600">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                  <span className="animate-pulse"><Info size={20} /></span>
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs">Penting</h3>
              </div>
              <div className="space-y-6">
                <InfoItem icon={Fingerprint} text="Siapkan NIK KTP valid untuk keperluan verifikasi data pelapor." />
                <InfoItem icon={Mail} text="Pastikan email aktif untuk koordinasi lebih lanjut." />
                <InfoItem icon={AlertCircle} text="Layanan ini hanya untuk keluhan terkait sertifikasi." />
                <InfoItem icon={CheckCircle2} text="Identitas pelapor dijamin kerahasiaannya." />
              </div>
            </div>

            <Link to="/faq" className="group block relative">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="overflow-hidden bg-[#071E3D] rounded-[2.5rem] p-1 shadow-2xl shadow-[#071E3D]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#071E3D] rounded-[2.3rem] p-8 border border-white/5 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <HelpCircle size={32} strokeWidth={2.5} />
                    </div>
                  </div>
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-3">Pusat Bantuan</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-8 px-4 font-medium">Bingung alur pengaduan? Klik untuk panduan lengkap & FAQ.</p>
                  <div className="w-full py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 group-hover:bg-orange-500 transition-all duration-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Buka FAQ</span>
                    <ChevronRight size={16} className="text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
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

// ================= HELPER COMPONENTS =================
function InfoItem({ icon: Icon, text }) {
  return (
    <div className="flex gap-4 group/item">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-300 text-orange-500 shadow-sm">
        <Icon size={16} />
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed font-bold">{text}</p>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", error, maxLength }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">{label}</label>
      </div>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-bold text-[#071E3D] ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:ring-orange-500/5 focus:bg-white"
        }`}
      />
      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1 animate-shake">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{error}</span>
        </div>
      )}
    </div>
  );
}

function SelectGroup({ label, children, onChange, value, name, error }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">{label}</label>
      </div>
      <div className="relative">
        <select 
          name={name} 
          value={value} 
          onChange={onChange}
          className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all text-sm font-bold text-[#071E3D] appearance-none ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
          }`}
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1 animate-shake">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{error}</span>
        </div>
      )}
    </div>
  );
}