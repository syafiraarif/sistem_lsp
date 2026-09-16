import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LogIn,
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
  const selectedRole = location.state?.role || "admin";
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
          `Akun ini merupakan akun ${user.role || "yang berbeda"}. Silakan gunakan akun ${roleConfig.label}.`
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", backendRole);
      localStorage.setItem("id_tuk", user.id_tuk?.toString() || "");

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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#071E3D] font-sans selection:bg-orange-500/30">
      <div className="relative hidden overflow-hidden p-16 lg:flex lg:w-3/5 lg:flex-col lg:justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
            alt="office"
            className="h-full w-full scale-105 object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#071E3D] via-[#071E3D]/90 to-transparent" />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity
            }}
            className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <ShieldCheck
                className="text-white"
                size={28}
              />
            </div>

            <span className="text-2xl font-black tracking-tighter text-white">
              SIMLSP
            </span>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              x: -50
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <div className="mb-5 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                Login {roleConfig.label}
              </span>
            </div>

            <h1 className="mb-8 text-6xl font-black leading-[1.1] text-white">
              Expertise
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Validated.
              </span>
            </h1>

            <p className="max-w-lg text-xl font-light leading-relaxed text-slate-400">
              Platform integrasi sertifikasi profesi nasional. Memastikan
              standar kompetensi global untuk tenaga kerja unggul Indonesia.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex gap-10">
          <div>
            <p className="text-2xl font-black text-white">
              2.5k+
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Active Asesi
            </p>
          </div>

          <div>
            <p className="text-2xl font-black text-white">
              180+
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Skema Sertifikasi
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center bg-[#071E3D] p-8 lg:w-2/5 lg:bg-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md"
        >
          <motion.div
            variants={itemVariants}
            className="mb-10 text-center lg:text-left"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 lg:bg-orange-50">
              <ShieldCheck
                size={14}
                className="text-orange-500"
              />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                {roleConfig.label}
              </span>
            </div>

            <h2 className="mb-3 text-4xl font-black tracking-tight text-white lg:text-[#071E3D]">
              Selamat
              <span className="text-orange-500">
                {" "}Datang.
              </span>
            </h2>

            <p className="font-medium text-slate-400">
              {roleConfig.description}
            </p>
          </motion.div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-white opacity-70 lg:text-[#071E3D]">
                Identitas Pengguna
              </label>

              <div className="group relative">
                <div className="absolute left-0 flex h-full w-12 items-center justify-center text-slate-400 transition-colors group-focus-within:text-orange-500">
                  <User
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>

                <input
                  required
                  value={formData.username}
                  placeholder="Username / ID"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value
                    }))
                  }
                  className="w-full rounded-2xl border-b-2 border-slate-700 bg-slate-500/10 py-4 pl-12 pr-6 font-bold text-white transition-all placeholder:text-slate-500 focus:border-orange-500 focus:bg-white focus:outline-none lg:border-slate-100 lg:bg-slate-50 lg:text-[#071E3D]"
                />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="space-y-2"
            >
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-white opacity-70 lg:text-[#071E3D]">
                Kata Sandi
              </label>

              <div className="group relative">
                <div className="absolute left-0 flex h-full w-12 items-center justify-center text-slate-400 transition-colors group-focus-within:text-orange-500">
                  <Lock
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value
                    }))
                  }
                  className="w-full rounded-2xl border-b-2 border-slate-700 bg-slate-500/10 py-4 pl-12 pr-14 font-bold text-white transition-all placeholder:text-slate-500 focus:border-orange-500 focus:bg-white focus:outline-none lg:border-slate-100 lg:bg-slate-50 lg:text-[#071E3D]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-orange-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-between"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[#071E3D]"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={() => navigate("/lupa-akses", {
                  state: {
                    role: selectedRole
                  }
                })}
                className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:underline"
              >
                Lupa Akses?
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95
                  }}
                  className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-500"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="flex items-center justify-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-xs font-bold text-green-500"
                >
                  <CheckCircle2 size={18} />
                  <span>
                    Autentikasi {roleConfig.label} berhasil
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              variants={itemVariants}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || success}
              className="group flex w-full items-center justify-center gap-4 rounded-2xl bg-orange-500 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={20}
                />
              ) : (
                <>
                  <span>
                    Masuk sebagai {roleConfig.label}
                  </span>

                  <ArrowRight
                    className="transition-transform group-hover:translate-x-2"
                    size={18}
                  />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            variants={itemVariants}
            className="mt-16 text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
              SIMLSP Integrated System &bull; 2026
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}