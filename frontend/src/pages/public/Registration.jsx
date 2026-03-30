import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  Info,
  CheckCircle2,
  Mail,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";

import { submitPendaftaran } from "../../services/pendaftaran.service";

const API_URL = "http://localhost:3000/api/public";

export default function Registration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [apiMessage, setApiMessage] = useState("");
  
  const recaptchaRef = useRef(null);
  const formTopRef = useRef(null);

  // --- List Data Tetap ---
  const listWilayahRJI = [
    "KAB.ACEH SELATAN", "KAB.TOBA SAMOSIR", "KOTA PADANG", "KOTA PEKANBARU", 
    "KOTA ADM. JAKARTA PUSAT", "KOTA ADM. JAKARTA SELATAN", "KAB.PURWOREJO", 
    "KAB. KUDUS", "KOTA SEMARANG", "KAB. BANTUL", "KAB. BLITAR", 
    "KAB. MALANG", "KOTA PALOPO", "KOTA SORONG"
  ];

  const listProgramStudi = [
    "Pendidikan PKN", "Pendidikan Ekonomi", "Pendidikan Geografi", 
    "Pendidikan Sejarah", "Pendidikan Vokasional Teknik Mesin"
  ];

  // --- States ---
  const [formData, setFormData] = useState({
    nik: "",
    nama_lengkap: "",
    email: "",
    no_hp: "08",
    provinsi_id: "",
    provinsi_nama: "",
    kota_id: "",
    kota_nama: "",
    kecamatan_id: "",
    kecamatan_nama: "",
    kelurahan_id: "",
    kelurahan_nama: "",
    alamat_lengkap: "",
    wilayah_rji: "",
    program_studi: "",
    kompetensi_keahlian: "",
    captchaToken: ""
  });

  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);

  // --- Effects ---
  useEffect(() => {
    axios.get(`${API_URL}/provinsi`)
      .then(res => setProvinsi(res.data))
      .catch(err => console.error("Gagal load provinsi:", err));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // --- Handlers Wilayah ---
  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.provinsi_nama) setErrors(prev => ({ ...prev, provinsi_nama: null }));

    setFormData(prev => ({ 
      ...prev, 
      provinsi_id: id, provinsi_nama: name, 
      kota_id: "", kota_nama: "", kecamatan_id: "", kecamatan_nama: "", kelurahan_id: "", kelurahan_nama: "" 
    }));
    
    if (id) {
      try {
        const res = await axios.get(`${API_URL}/kota/${id}`);
        setKota(res.data);
      } catch (err) { console.error(err); }
    }
    setKecamatan([]);
    setKelurahan([]);
  };

  const handleKotaChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.kota_nama) setErrors(prev => ({ ...prev, kota_nama: null }));

    setFormData(prev => ({ 
      ...prev, 
      kota_id: id, kota_nama: name, 
      kecamatan_id: "", kecamatan_nama: "", kelurahan_id: "", kelurahan_nama: "" 
    }));
    
    if (id) {
      try {
        const res = await axios.get(`${API_URL}/kecamatan/${id}`);
        setKecamatan(res.data);
      } catch (err) { console.error(err); }
    }
    setKelurahan([]);
  };

  const handleKecamatanChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    setFormData(prev => ({ 
      ...prev, 
      kecamatan_id: id, kecamatan_nama: name, 
      kelurahan_id: "", kelurahan_nama: "" 
    }));
    
    if (id) {
      try {
        const res = await axios.get(`${API_URL}/kelurahan/${id}`);
        setKelurahan(res.data);
      } catch (err) { console.error(err); }
    }
  };

  const handleKelurahanChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;
    setFormData(prev => ({ ...prev, kelurahan_id: id, kelurahan_nama: name }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "nik") {
      val = value.replace(/[^0-9]/g, "").slice(0, 16);
    } 
    else if (name === "no_hp") {
      val = value.replace(/[^0-9]/g, "");
      if (!val.startsWith("08")) val = "08";
      if (val.length > 14) return;
    } 

    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const onCaptchaChange = (token) => {
    setFormData(prev => ({ ...prev, captchaToken: token }));
    if (token) setErrors(prev => ({ ...prev, captchaToken: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.nama_lengkap.trim()) newErrors.nama_lengkap = "Nama wajib diisi";
      if (formData.nik.length !== 16) newErrors.nik = "NIK harus tepat 16 digit";
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Format email tidak valid";
      if (formData.no_hp.length < 10) newErrors.no_hp = "Nomor WhatsApp tidak valid";
    } 
    else if (step === 2) {
      if (!formData.provinsi_id) newErrors.provinsi_nama = "Pilih provinsi";
      if (!formData.kota_id) newErrors.kota_nama = "Pilih kota/kabupaten";
      if (!formData.alamat_lengkap.trim()) newErrors.alamat_lengkap = "Alamat lengkap wajib diisi";
    }
    else if (step === 3) {
      if (!formData.wilayah_rji) newErrors.wilayah_rji = "Pilih wilayah RJI";
      if (!formData.program_studi) newErrors.program_studi = "Pilih program studi";
      if (!formData.kompetensi_keahlian.trim()) newErrors.kompetensi_keahlian = "Kompetensi wajib diisi";
      if (!formData.captchaToken) newErrors.captchaToken = "Verifikasi Captcha diperlukan";
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
      const payload = {
        ...formData,
        provinsi: formData.provinsi_nama,
        kota: formData.kota_nama,
        kecamatan: formData.kecamatan_nama,
        kelurahan: formData.kelurahan_nama,
      };

      await submitPendaftaran(payload);
      
      setSubmitStatus("success");
      setApiMessage("Pendaftaran Akun Asesi Berhasil! Silakan cek email Anda untuk langkah aktivasi selanjutnya.");
      
      // Reset Form
      setFormData({
        nik: "", nama_lengkap: "", email: "", no_hp: "08",
        provinsi_id: "", provinsi_nama: "", kota_id: "", kota_nama: "",
        kecamatan_id: "", kecamatan_nama: "", kelurahan_id: "", kelurahan_nama: "",
        alamat_lengkap: "", wilayah_rji: "", program_studi: "", kompetensi_keahlian: "",
        captchaToken: ""
      });
      setStep(1);
      if (recaptchaRef.current) recaptchaRef.current.reset();

    } catch (err) {
      setSubmitStatus("error");
      setApiMessage(err.response?.data?.message || "Gagal melakukan pendaftaran. Silakan coba lagi nanti.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setFormData(prev => ({ ...prev, captchaToken: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={formTopRef} className="relative py-20 bg-white overflow-hidden min-h-screen">
      {/* Background Ornaments */}
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
                Pendaftaran <span className="text-orange-500">Akun Asesi</span>
              </motion.h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Silakan lengkapi data diri Anda untuk mengikuti uji kompetensi sertifikasi profesi melalui SIMLSP.
              </p>
            </header>

            {/* Status Alert Custom (Ganti Alert Browser) */}
            <AnimatePresence>
              {submitStatus && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-8 p-6 rounded-[2rem] border flex gap-4 items-start ${
                    submitStatus === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-white shadow-sm ${submitStatus === "success" ? "text-emerald-500" : "text-red-500"}`}>
                    {submitStatus === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-relaxed">{apiMessage}</p>
                    <button onClick={() => setSubmitStatus(null)} className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">Tutup Notifikasi</button>
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
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><User size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Informasi Akun & Pribadi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Nama Lengkap*" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Nama sesuai KTP" error={errors.nama_lengkap} />
                      <InputGroup label="Nomor KTP/NIK* (16 Digit)" name="nik" value={formData.nik} onChange={handleChange} placeholder="Contoh: 3201..." error={errors.nik} maxLength={16} />
                      <InputGroup label="Alamat Email*" name="email" value={formData.email} onChange={handleChange} placeholder="nama@domain.com" type="email" error={errors.email} />
                      <InputGroup label="Nomor HP / WhatsApp*" name="no_hp" value={formData.no_hp} onChange={handleChange} placeholder="08xxxxxxxx" error={errors.no_hp} />
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
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><MapPin size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Domisili & Lokasi Uji</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectGroup label="Provinsi*" onChange={handleProvinsiChange} value={formData.provinsi_nama} error={errors.provinsi_nama}>
                        <option value="">Pilih Provinsi</option>
                        {provinsi.map(p => <option key={p.id} data-id={p.id} value={p.name}>{p.name}</option>)}
                      </SelectGroup>
                      <SelectGroup label="Kota / Kabupaten*" onChange={handleKotaChange} value={formData.kota_nama} disabled={!formData.provinsi_id} error={errors.kota_nama}>
                        <option value="">Pilih Kota</option>
                        {kota.map(k => <option key={k.id} data-id={k.id} value={k.name}>{k.name}</option>)}
                      </SelectGroup>
                      <div className="md:col-span-2">
                         <InputGroup label="Alamat Lengkap (Sesuai KTP)*" name="alamat_lengkap" value={formData.alamat_lengkap} onChange={handleChange} placeholder="Jl. Raya No. 123..." error={errors.alamat_lengkap} />
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
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><GraduationCap size={24} /></div>
                      <h2 className="text-xl font-black text-[#071E3D]">Data Kompetensi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectGroup label="Wilayah RJI*" name="wilayah_rji" value={formData.wilayah_rji} onChange={handleChange} error={errors.wilayah_rji}>
                        <option value="">Pilih Wilayah</option>
                        {listWilayahRJI.map(w => <option key={w} value={w}>{w}</option>)}
                      </SelectGroup>
                      <SelectGroup label="Program Studi*" name="program_studi" value={formData.program_studi} onChange={handleChange} error={errors.program_studi}>
                        <option value="">Pilih Program Studi</option>
                        {listProgramStudi.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                      </SelectGroup>
                      <div className="md:col-span-2">
                        <InputGroup label="Kompetensi Keahlian*" name="kompetensi_keahlian" value={formData.kompetensi_keahlian} onChange={handleChange} placeholder="Contoh: Pemrograman Web / Desain Grafis" error={errors.kompetensi_keahlian} />
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                           <ShieldCheck size={16} className="text-orange-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifikasi Keamanan</span>
                        </div>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6LdSGX4sAAAAAA7BAt1iY8OVxtnx_EFunFBQV-QF" 
                          onChange={onCaptchaChange}
                        />
                        {errors.captchaToken && (
                          <div className="mt-4 flex items-center gap-1.5 animate-shake">
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
                  <button onClick={prevStep} className="font-black uppercase tracking-widest text-xs text-slate-400 hover:text-[#071E3D] flex items-center gap-2 transition-all">
                    <ChevronLeft size={18} /> Kembali
                  </button>
                ) : <div />}
                
                <button 
                  onClick={step === 3 ? handleSubmit : nextStep}
                  disabled={loading}
                  className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl ${
                    step === 3 ? "bg-orange-500 text-white hover:bg-[#071E3D] shadow-orange-500/20" : "bg-[#071E3D] text-white hover:bg-orange-600 shadow-[#071E3D]/20"
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Memproses...</span>
                  ) : step === 3 ? (
                    <span className="flex items-center gap-2">Daftar Sekarang <Send size={16} /></span>
                  ) : "Lanjut ke Lokasi"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info (Tetap sama) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-orange-600">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                  <span className="animate-pulse"><Info size={20} /></span>
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs">Informasi Penting</h3>
              </div>
              <div className="space-y-6">
                <InfoItem icon={CreditCard} text="Pastikan NIK sesuai dengan KTP asli untuk validasi sertifikat." />
                <InfoItem icon={Mail} text="Gunakan email aktif (Gmail disarankan) untuk menerima kartu ujian." />
                <InfoItem icon={FileText} text="Data yang sudah dikirim tidak dapat diubah secara mandiri." />
                <InfoItem icon={ShieldCheck} text="Seluruh data dilindungi sesuai kebijakan privasi LSP." />
              </div>
            </div>
            
            <Link to="/faq" className="group block">
              {/* FAQ Card (Kodenya sama seperti sebelumnya) */}
              <div className="bg-[#071E3D] rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                 <HelpCircle className="mx-auto text-orange-500 mb-4" size={40} />
                 <h4 className="text-white font-black text-sm uppercase tracking-widest">Butuh Bantuan?</h4>
                 <p className="text-slate-400 text-[11px] mt-2 mb-6">Klik untuk melihat panduan pendaftaran asesi.</p>
                 <div className="py-3 bg-white/5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest group-hover:bg-orange-500 transition-all">Lihat FAQ</div>
              </div>
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
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-orange-500 shadow-sm transition-all group-hover/item:bg-orange-500 group-hover/item:text-white">
        <Icon size={16} />
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed font-bold">{text}</p>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", error, maxLength }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
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

function SelectGroup({ label, children, onChange, value, name, error, disabled }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <div className="relative">
        <select 
          name={name} value={value} onChange={onChange} disabled={disabled}
          className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all text-sm font-bold text-[#071E3D] appearance-none ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
          }`}
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
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