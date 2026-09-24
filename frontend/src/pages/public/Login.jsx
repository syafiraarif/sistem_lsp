import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  User,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    description: "Silakan masuk menggunakan akun Administrator.",
    redirect: "/admin"
  },
  asesi: {
    label: "Peserta (Asesi)",
    description: "Silakan masuk menggunakan akun Peserta (Asesi).",
    redirect: "/asesi"
  },
  asesor: {
    label: "Asesor",
    description: "Silakan masuk menggunakan akun Asesor.",
    redirect: "/asesor"
  },
  tuk: {
    label: "TUK",
    description: "Silakan masuk menggunakan akun TUK.",
    redirect: "/tuk"
  }
};

const KomiteTeknis = {
  label: "Komite Teknis",
  description: "Silakan masuk menggunakan akun Asesor yang memiliki akses Komite Teknis.",
  redirect: "/asesor"
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const storedRole = localStorage.getItem("last_login_role");
  const selectedRole = location.state?.role || storedRole || "admin";
  const roleConfig = selectedRole === "komite" ? KomiteTeknis : ROLE_CONFIG[selectedRole] || ROLE_CONFIG.admin;
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const normalizeRole = (role) => {
    return String(role || "").trim().toLowerCase();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        formData
      );
      
      if (!res.data?.success) {
        setError(res.data?.message || "Login gagal");
        return;
      }
      
      const { token, user } = res.data.data || {};
      
      if (!token || !user || !user.id_user) {
        throw new Error("Data user tidak lengkap dari server");
      }
      
      const backendRole = normalizeRole(user.role);
      let expectedRole = selectedRole;
      if (selectedRole === "komite") {
        expectedRole = "asesor";
      }
      expectedRole = normalizeRole(expectedRole);
      
      if (backendRole !== expectedRole) {
        setError(
          `Akun ini merupakan akun ${user.role || "yang berbeda"}. Silakan gunakan form login ${roleConfig.label}.`
        );
        return;
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", backendRole);
      localStorage.setItem("id_tuk", user.id_tuk?.toString() || "");
      localStorage.setItem("last_login_role", selectedRole);
      
      setSuccess(true);
      setTimeout(() => {
        if (selectedRole === "komite") {
          navigate("/asesor");
          return;
        }
        navigate(roleConfig.redirect);
      }, 1000);
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response) {
        setError(
          err.response.data?.message ||
            "Username atau password tidak valid."
        );
      } else if (err.request) {
        setError("Tidak ada respons dari server.");
      } else {
        setError(err.message || "Terjadi kesalahan saat login.");
      }
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
      
      {/* KIRI - BACKGROUND BRANDING (Clean & Solid) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[55%] xl:w-[60%] lg:flex-col lg:justify-between p-16 bg-[#071E3D]">
        {/* Subtle highlight to match the reference image perfectly without being overly flashy */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white opacity-[0.02] blur-[100px]" />
        
        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#CC6B27] shadow-lg shadow-[#CC6B27]/20">
              <ShieldCheck className="text-white" size={26} strokeWidth={2} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              SIMLSP
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-[#CC6B27]/40 px-4 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CC6B27]">
                Portal {roleConfig.label}
              </span>
            </div>
            <h1 className="mb-6 text-5xl xl:text-[64px] font-black leading-[1.1] text-white tracking-tight">
              Expertise
              <br />
              <span className="text-[#CC6B27]">
                Validated.
              </span>
            </h1>
            <p className="max-w-[420px] text-[15px] xl:text-[16px] font-medium leading-relaxed text-slate-300">
              Platform integrasi sertifikasi profesi nasional. Memastikan
              standar kompetensi global untuk tenaga kerja unggul Indonesia.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-3xl font-black text-white tracking-tight">2.5k+</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC6B27] mt-1.5">
              Active Asesi
            </p>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tight">180+</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#CC6B27] mt-1.5">
              Skema Sertifikasi
            </p>
          </div>
        </div>
      </div>

      {/* KANAN - FORM LOGIN */}
      <div className="relative flex w-full items-center justify-center bg-white p-6 sm:p-12 lg:w-[45%] xl:w-[40%]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-[400px] bg-white p-8 sm:p-10 lg:p-0 rounded-3xl shadow-xl shadow-[#071E3D]/5 border border-slate-100 lg:shadow-none lg:border-none"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5">
              <ShieldCheck size={14} className="text-[#CC6B27]" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#CC6B27]">
                {roleConfig.label}
              </span>
            </div>
            <h2 className="mb-2 text-[32px] font-black tracking-tight text-[#071E3D]">
              Selamat <span className="text-[#CC6B27]">Datang.</span>
            </h2>
            <p className="text-[13px] font-medium text-slate-500">
              {roleConfig.description}
            </p>
          </motion.div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="ml-1 mb-2 block text-[11px] font-bold uppercase tracking-widest text-[#071E3D]/70">
                Identitas Pengguna
              </label>
              <div className="group relative flex items-center">
                <div className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-[#CC6B27]">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <input
                  required
                  value={formData.username}
                  placeholder="Username / ID"
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-xl border border-[#DCE4EC] bg-[#F0F4F8] py-3.5 pl-11 pr-4 text-[13px] font-bold text-[#071E3D] transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/10"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="ml-1 mb-2 block text-[11px] font-bold uppercase tracking-widest text-[#071E3D]/70">
                Kata Sandi
              </label>
              <div className="group relative flex items-center">
                <div className="absolute left-4 text-slate-400 transition-colors group-focus-within:text-[#CC6B27]">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-[#DCE4EC] bg-[#F0F4F8] py-3.5 pl-11 pr-12 text-[13px] font-bold text-[#071E3D] transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-slate-400 transition-colors hover:text-[#CC6B27]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("last_login_role");
                  navigate(-1);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[#071E3D]"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => navigate("/lupa-akses", { state: { role: selectedRole } })}
                className="text-[10px] font-black uppercase tracking-widest text-[#CC6B27] hover:underline"
              >
                Lupa Akses?
              </button>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="text-[12px] font-semibold leading-relaxed">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
                >
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span className="text-[12px] font-bold">
                    Autentikasi {roleConfig.label} berhasil
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || success}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#CC6B27] py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#CC6B27]/20 transition-all duration-300 hover:bg-[#b55b1f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1.5" size={16} />
                </>
              )}
            </motion.button>
          </form>
          
          <motion.div variants={itemVariants} className="mt-14 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-300">
              SIMLSP Integrated System &bull; 2026
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}