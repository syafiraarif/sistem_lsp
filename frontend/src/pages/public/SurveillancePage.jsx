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
  ClipboardList
} from "lucide-react";

import { createSurveillance } from "../../services/surveillance.service";
import { getSkema } from "../../services/skema.service";

export default function SurveillancePage() {
  const [step, setStep] = useState(1);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);

  // State Form selaras dengan Surveillance.model.js
  const [form, setForm] = useState({
    nik: "", // Akan dikonversi ke id_user di backend berdasarkan NIK
    id_skema: "",
    periode_surveillance: "",
    nomor_sertifikat: "",
    nomor_registrasi: "",
    sumber_dana: "", // Match model: 'apbn', 'apbd', 'perusahaan', 'mandiri'
    nama_perusahaan: "",
    alamat_perusahaan: "",
    jabatan_pekerjaan: "",
    nama_proyek: "",
    jabatan_dalam_proyek: "",
    kesesuaian_kompetensi: "", // Match model: 'sesuai', 'tidak_sesuai', 'lainnya'
    keterangan_lainnya: "",
    captchaToken: "", 
  });

  useEffect(() => {
    getSkema()
      .then(setSkemaList)
      .catch(err => console.error("Gagal load skema:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onCaptchaChange = (token) => {
    setForm({ ...form, captchaToken: token });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!form.captchaToken) {
      alert("Silakan centang Captcha terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      await createSurveillance(form);
      alert("Laporan Surveillance berhasil dikirim!");
      
      setStep(1);
      setForm({
        nik: "", id_skema: "", periode_surveillance: "", nomor_sertifikat: "",
        nomor_registrasi: "", sumber_dana: "", nama_perusahaan: "",
        alamat_perusahaan: "", jabatan_pekerjaan: "", nama_proyek: "",
        jabatan_dalam_proyek: "", kesesuaian_kompetensi: "", keterangan_lainnya: "",
        captchaToken: ""
      });
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengirim laporan. Pastikan NIK terdaftar.";
      alert(errorMsg);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setForm({ ...form, captchaToken: "" });
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
                Pemantauan berkala pemegang sertifikat kompetensi untuk memastikan pemeliharaan kompetensi tetap sesuai standar.
              </p>
            </header>

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
                      <InputGroup label="NIK Pemegang Sertifikat*" name="nik" value={form.nik} onChange={handleChange} placeholder="Masukkan NIK Anda" />
                      <SelectGroup label="Periode Surveillance*" name="periode_surveillance" value={form.periode_surveillance} onChange={handleChange}>
                        <option value="">Pilih Tahun</option>
                        {/* Value disesuaikan dengan tipe Integer di model */}
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </SelectGroup>
                      <SelectGroup label="Pilih Skema Sertifikasi*" name="id_skema" value={form.id_skema} onChange={handleChange}>
                        <option value="">Pilih Skema</option>
                        {skemaList.map(s => <option key={s.id_skema} value={s.id_skema}>{s.judul_skema}</option>)}
                      </SelectGroup>
                      <InputGroup label="Nomor Sertifikat*" name="nomor_sertifikat" value={form.nomor_sertifikat} onChange={handleChange} placeholder="LSP/RJI/XXX" />
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
                      <SelectGroup label="Sumber Dana*" name="sumber_dana" value={form.sumber_dana} onChange={handleChange}>
                        <option value="">Pilih Sumber Dana</option>
                        <option value="apbn">APBN</option>
                        <option value="apbd">APBD</option>
                        <option value="perusahaan">Instansi / Perusahaan</option>
                        <option value="mandiri">Mandiri / Pribadi</option>
                      </SelectGroup>
                      <InputGroup label="Nama Perusahaan*" name="nama_perusahaan" value={form.nama_perusahaan} onChange={handleChange} placeholder="Nama Kantor" />
                      <InputGroup label="Jabatan Struktural*" name="jabatan_pekerjaan" value={form.jabatan_pekerjaan} onChange={handleChange} placeholder="Contoh: Manager" />
                      <InputGroup label="Nomor Registrasi BNSP*" name="nomor_registrasi" value={form.nomor_registrasi} onChange={handleChange} placeholder="MET.000.XXX" />
                      <div className="md:col-span-2">
                        <InputGroup label="Alamat Perusahaan*" name="alamat_perusahaan" value={form.alamat_perusahaan} onChange={handleChange} placeholder="Alamat lengkap kantor" />
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
                      <h2 className="text-xl font-black text-[#071E3D]">Aktivitas Proyek & Keamanan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Nama Proyek*" name="nama_proyek" value={form.nama_proyek} onChange={handleChange} placeholder="Nama Proyek" />
                      <InputGroup label="Jabatan Proyek*" name="jabatan_dalam_proyek" value={form.jabatan_dalam_proyek} onChange={handleChange} placeholder="Contoh: Lead" />
                      <div className="md:col-span-2">
                        <SelectGroup label="Kesesuaian Kompetensi*" name="kesesuaian_kompetensi" value={form.kesesuaian_kompetensi} onChange={handleChange}>
                          <option value="">Apakah pekerjaan sesuai skema sertifikasi?</option>
                          <option value="sesuai">Sesuai</option>
                          <option value="tidak_sesuai">Tidak Sesuai</option>
                          <option value="lainnya">Lainnya</option>
                        </SelectGroup>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">Keterangan Lainnya</label>
                        <textarea 
                          name="keterangan_lainnya"
                          value={form.keterangan_lainnya}
                          onChange={handleChange}
                          placeholder="Jelaskan jika memilih opsi Lainnya atau berikan catatan tambahan"
                          className="w-full mt-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 transition-all text-sm font-bold text-[#071E3D] min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 py-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifikasi Keamanan</span>
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
                  onClick={step === 3 ? handleSubmit : nextStep} 
                  disabled={loading}
                  className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl ${
                    step === 3 ? "bg-orange-500 text-white hover:bg-[#071E3D] shadow-orange-500/20" : "bg-[#071E3D] text-white hover:bg-orange-600 shadow-[#071E3D]/20"
                  }`}
                >
                  {loading ? "Mengirim..." : step === 3 ? "Kirim Laporan Surveillance" : "Langkah Berikutnya"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-orange-600">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm"><Info size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-xs">Informasi Penting</h3>
              </div>
              <div className="space-y-6">
                <SidebarInfo icon={Calendar} text="Surveillance dilakukan setiap tahun." />
                <SidebarInfo icon={Search} text="Sertifikat harus dalam masa berlaku." />
                <SidebarInfo icon={Database} text="Sinkronisasi otomatis dengan BNSP." />
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
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-8 px-4 font-medium">Bingung alur pendaftaran? Klik untuk panduan lengkap & FAQ.</p>
                  <div className="w-full py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 group-hover:bg-orange-50 transition-all duration-500">
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

// ================= HELPER COMPONENTS (Unchanged) =================
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

function InputGroup({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D]"
      />
    </div>
  );
}

function SelectGroup({ label, children, onChange, value, name }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">{label}</label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange}
          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] appearance-none"
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  );
}