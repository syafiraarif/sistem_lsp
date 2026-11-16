import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Import aset yang sama dengan halaman Login
import logoApp from "../../assets/images/logo.png";
import bgLogin from "../../assets/images/about/about-1.jpg";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function LupaAkses() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || localStorage.getItem("last_login_role");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Silakan masukkan alamat email yang terdaftar.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/auth/forgot-access`, {
        email: email.trim(),
        role: selectedRole
      });

      setSuccess(
        res.data?.message ||
          "Link pemulihan telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Email tidak terdaftar atau terjadi kesalahan pada server."
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans selection:bg-[#CC6B27]/30">
      {/* KIRI - BACKGROUND IMAGE & BRANDING (SERAGAM DENGAN LOGIN) */}
      <div className="relative hidden overflow-hidden bg-[#071E3D] p-14 lg:flex lg:w-[55%] lg:flex-col lg:justify-center xl:w-[60%] xl:p-20">
        {/* Foto Background */}
        <img
          src={bgLogin}
          alt="LSP Pustaka Ilmiah Elektronik"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Overlay Gelap & Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[#071E3D]/80" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#071E3D] via-[#071E3D]/75 to-[#CC6B27]/20" />

        {/* Konten Utama di Tengah Vertikal & Rata Kiri */}
        <div className="relative z-10 max-w-[540px]">
          <Link
            to="/"
            className="group mb-12 inline-flex items-center gap-3.5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoApp}
                alt="Logo LSP Pustaka Ilmiah Elektronik"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <span className="block text-base font-black tracking-tight text-white xl:text-lg">
                PUSTAKA ILMIAH ELEKTRONIK
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-[#CC6B27]">
                Lembaga Sertifikasi Profesi
              </span>
            </div>
          </Link>

          {/* Headline Utama */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 h-1 w-12 bg-[#CC6B27]" />

            <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight text-white xl:text-[60px]">
              Pulihkan
              <br />
              <span className="text-[#CC6B27]">Akses Anda.</span>
            </h1>

            <p className="max-w-[460px] text-[15px] font-medium leading-relaxed text-slate-200/90 xl:text-[16px]">
              Pulihkan akses akun Sistem Informasi Manajemen LSP Pustaka Ilmiah
              Elektronik Anda melalui alamat email yang terdaftar.
            </p>
          </motion.div>
        </div>
      </div>

      {/* KANAN - FORM LUPA AKSES (EMAIL) */}
      <div className="relative flex w-full items-center justify-center bg-white p-6 sm:p-12 lg:w-[45%] xl:w-[40%]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-[400px] rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-[#071E3D]/5 sm:p-10 lg:border-none lg:p-0 lg:shadow-none"
        >
          {/* Logo versi mobile */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img
              src={logoApp}
              alt="Logo LSP"
              className="h-10 w-10 object-contain"
            />
            <div className="text-left leading-tight">
              <span className="block text-xs font-black text-[#071E3D]">
                PUSTAKA ILMIAH ELEKTRONIK
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-widest text-[#CC6B27]">
                Lembaga Sertifikasi Profesi
              </span>
            </div>
          </div>

          {/* Tombol Kembali ke Login */}
          <motion.div variants={itemVariants} className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[#CC6B27]"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Kembali ke Login
            </button>
          </motion.div>

          {/* Header Form */}
          <motion.div
            variants={itemVariants}
            className="mb-9 text-center lg:text-left"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5">
              <Mail size={14} className="text-[#CC6B27]" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#CC6B27]">
                Pemulihan Akses
              </span>
            </div>

            <h2 className="mb-2 text-[32px] font-black tracking-tight text-[#071E3D]">
              Lupa <span className="text-[#CC6B27]">Akses?</span>
            </h2>

            <p className="text-[13px] font-medium text-slate-500">
              Masukkan email yang terdaftar untuk memulihkan akses akun Anda.
            </p>
          </motion.div>

          {/* Form Input Email */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="mb-2 ml-1 block text-[11px] font-bold uppercase tracking-widest text-[#071E3D]/70">
                Email Terdaftar
              </label>

              <div className="group relative flex items-center">
                <div className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-[#CC6B27]">
                  <Mail size={18} strokeWidth={2.5} />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  placeholder="nama@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE4EC] bg-[#F0F4F8] py-3.5 pl-11 pr-4 text-[13px] font-bold text-[#071E3D] transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/10"
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="text-[12px] font-semibold leading-relaxed">
                    {error}
                  </span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <span className="text-[12px] font-bold leading-relaxed">
                    {success}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              variants={itemVariants}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !!success}
              className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#CC6B27] py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#CC6B27]/20 transition-all duration-300 hover:bg-[#b55b1f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Kirim Link Pemulihan</span>
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1.5"
                    size={16}
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* Kotak Info Masa Berlaku Link (sama seperti di screenshot) */}
          <motion.div
            variants={itemVariants}
            className="mt-7 rounded-xl border border-[#DCE4EC] bg-[#F0F4F8]/70 p-4"
          >
            <p className="text-[12px] font-medium leading-relaxed text-slate-500">
              Link pemulihan hanya berlaku selama{" "}
              <span className="font-bold text-[#071E3D]">15 menit</span>.
              Setelah password berhasil diubah, Anda dapat login kembali
              menggunakan password baru.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-300">
              LSP Pustaka Ilmiah Elektronik &bull; 2026
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}