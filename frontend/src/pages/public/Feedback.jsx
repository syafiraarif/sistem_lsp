import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
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

  const validateForm = () => {
    const newErrors = {};
    const { nama_lengkap, peran, pesan } = formData;

    if (!nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama wajib diisi";
    }

    if (!peran) {
      newErrors.peran = "Pilih kategori Anda";
    }

    if (!pesan || pesan.trim().length < 10) {
      newErrors.pesan = "Isi ulasan/feedback terlalu singkat (minimal 10 karakter).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_lengkap") {
      const sanitized = value.replace(/[0-9]/g, "");
      setFormData({ ...formData, [name]: sanitized });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return notifikasi.peringatan(
        "Validasi Gagal",
        "Periksa kembali data feedback yang Anda masukkan."
      );
    }

    setLoading(true);

    try {
      const response = await api.post("/public/feedback", formData);

      if (response.status === 200 || response.status === 201) {
        await notifikasi.sukses(
          "Feedback Berhasil Dikirim",
          "Terima kasih telah memberikan feedback untuk layanan SIMLSP."
        );

        setFormData({
          nama_lengkap: "",
          peran: "",
          pesan: "",
          rating: 5
        });

        setErrors({});
        setHoveredRating(0);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengirim feedback.";

      await notifikasi.gagal(
        "Feedback Gagal Dikirim",
        errorMsg
      );
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
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 text-4xl font-black tracking-tight text-[#071E3D]"
              >
                Layanan <span className="text-orange-500">Feedback & Ulasan</span>
              </motion.h1>

              <p className="font-medium leading-relaxed text-slate-500">
                Suara Anda sangat berarti. Bagikan pengalaman Anda selama menggunakan layanan SIMLSP.
              </p>
            </header>

            <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)] md:p-14">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                    <User size={24} />
                  </div>

                  <h2 className="text-xl font-black text-[#071E3D]">
                    Kirim Ulasan & Feedback Anda
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                <div className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
                    Tingkat Kepuasan Anda
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform focus:outline-none hover:scale-110"
                      >
                        <Star
                          size={40}
                          className={`transition-colors duration-300 ${
                            (hoveredRating || formData.rating) >= star
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                              : "fill-transparent text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <span className="mt-1 text-xs font-bold text-slate-500">
                    {formData.rating === 1 && "Sangat Kurang"}
                    {formData.rating === 2 && "Kurang"}
                    {formData.rating === 3 && "Cukup"}
                    {formData.rating === 4 && "Baik"}
                    {formData.rating === 5 && "Sangat Baik, Terima Kasih!"}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
                    Pesan / Ulasan*
                  </label>

                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Berikan kritik, saran, atau pujian Anda mengenai layanan kami..."
                    className={`resize-none rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none focus:ring-4 ${
                      errors.pesan
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/5"
                        : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
                    }`}
                  />

                  {errors.pesan && (
                    <div className="mt-1 flex items-center gap-1.5 px-1">
                      <AlertTriangle size={12} className="text-red-500" />

                      <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
                        {errors.pesan}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-2xl bg-[#071E3D] px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#071E3D]/20 transition-all duration-300 hover:bg-orange-500 ${
                      loading ? "cursor-not-allowed opacity-70" : ""
                    }`}
                  >
                    {loading ? (
                      "Mengirim..."
                    ) : (
                      <span className="flex items-center gap-2">
                        Kirim Feedback
                        <Send size={16} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-32 lg:col-span-4">
            <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 text-orange-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                  <span className="animate-pulse">
                    <HeartHandshake size={20} />
                  </span>
                </div>

                <h3 className="text-xs font-black uppercase tracking-widest">
                  Pusat Feedback
                </h3>
              </div>

              <div className="space-y-6">
                <InfoItem
                  icon={ThumbsUp}
                  text="Saran Anda membantu kami meningkatkan kualitas sistem dan layanan."
                />

                <InfoItem
                  icon={MessageSquare}
                  text="Kritik yang membangun sangat kami hargai untuk evaluasi kedepan."
                />

                <InfoItem
                  icon={CheckCircle2}
                  text="Ulasan Anda akan dipertimbangkan untuk ditampilkan pada beranda website."
                />
              </div>
            </div>

            <Link to="/faq" className="group relative block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="overflow-hidden rounded-[2.5rem] bg-[#071E3D] p-1 shadow-2xl shadow-[#071E3D]/20"
              >
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

                    <ChevronRight
                      size={16}
                      className="text-orange-400 transition-all group-hover:translate-x-1 group-hover:text-white"
                    />
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

function InputGroup({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  maxLength
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ml-1 flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
          {label}
        </label>
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/5"
            : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"
        }`}
      />

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
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/5"
              : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5"
          }`}
        >
          {children}
        </select>

        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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