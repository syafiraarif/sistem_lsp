import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from '../../services/api';
import { 
  User, 
  MessageSquare, 
  ChevronRight, 
  HelpCircle,
  CheckCircle2,
  Send,
  AlertTriangle,
  Star,
  HeartHandshake,
  ThumbsUp
} from "lucide-react";

export default function FeedbackPublic() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    peran: "",
    pesan: "",
    rating: 5
  });

  // --- LOGIKA VALIDASI FORM ---
  const validateForm = () => {
    let newErrors = {};
    const { nama_lengkap, peran, pesan } = formData;

    if (!nama_lengkap.trim()) newErrors.nama_lengkap = "Nama wajib diisi";
    if (!peran) newErrors.peran = "Pilih kategori Anda";
    if (!pesan || pesan.trim().length < 10) {
      newErrors.pesan = "Isi ulasan/feedback terlalu singkat (minimal 10 karakter).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/public/feedback', formData);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ Terima kasih! Feedback Anda berhasil dikirim.");
        setFormData({
          nama_lengkap: "",
          peran: "",
          pesan: "",
          rating: 5
        });
        setErrors({});
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengirim feedback.";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#071E3D]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Bagian Kiri: Form */}
          <div className="lg:col-span-8">
            <header className="mb-10">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-[#071E3D] mb-4 tracking-tight"
              >
                Layanan <span className="text-orange-500">Feedback & Ulasan</span>
              </motion.h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Suara Anda sangat berarti. Bagikan pengalaman Anda selama menggunakan layanan SIMLSP.
              </p>
            </header>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-14 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-black text-[#071E3D]">Kirim Ulasan & Feedback Anda</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputGroup 
                      label="Nama Lengkap*" 
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap Anda" 
                      error={errors.nama_lengkap}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <SelectGroup 
                      label="Bertindak Sebagai*" 
                      name="peran"
                      value={formData.peran}
                      onChange={handleChange}
                      error={errors.peran}
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="asesi">Asesi (Peserta Sertifikasi)</option>
                      <option value="asesor">Asesor (Penguji)</option>
                      <option value="masyarakat_umum">Masyarakat Umum</option>
                    </SelectGroup>
                  </div>
                </div>

                {/* Interactive Star Rating */}
                <div className="flex flex-col gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 items-center justify-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">Tingkat Kepuasan Anda</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={40} 
                          className={`transition-colors duration-300 ${
                            (hoveredRating || formData.rating) >= star 
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-md" 
                              : "text-slate-300 fill-transparent"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-1">
                    {formData.rating === 1 && "Sangat Kurang"}
                    {formData.rating === 2 && "Kurang"}
                    {formData.rating === 3 && "Cukup"}
                    {formData.rating === 4 && "Baik"}
                    {formData.rating === 5 && "Sangat Baik, Terima Kasih!"}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">Pesan / Ulasan*</label>
                  <textarea 
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Berikan kritik, saran, atau pujian Anda mengenai layanan kami..."
                    className={`px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-bold text-[#071E3D] resize-none ${
                      errors.pesan ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
                    }`}
                  />
                  {errors.pesan && (
                    <div className="mt-1 flex items-center gap-1.5 px-1">
                      <AlertTriangle size={12} className="text-red-500" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.pesan}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl bg-[#071E3D] text-white hover:bg-orange-500 shadow-[#071E3D]/20 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Mengirim..." : (
                      <span className="flex items-center gap-2">Kirim Feedback <Send size={16} /></span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Bagian Kanan: Sidebar Info */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-orange-600">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                  <span className="animate-pulse"><HeartHandshake size={20} /></span>
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs">Pusat Feedback</h3>
              </div>
              <div className="space-y-6">
                <InfoItem icon={ThumbsUp} text="Saran Anda membantu kami meningkatkan kualitas sistem dan layanan." />
                <InfoItem icon={MessageSquare} text="Kritik yang membangun sangat kami hargai untuk evaluasi kedepan." />
                <InfoItem icon={CheckCircle2} text="Ulasan Anda akan dipertimbangkan untuk ditampilkan pada beranda website." />
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
        <div className="mt-1 flex items-center gap-1.5 px-1">
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
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{error}</span>
        </div>
      )}
    </div>
  );
}