import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Import aset sesuai Navbar dan About
import logoApp from "../../assets/images/logo.png";
import bgLogin from "../../assets/images/about/about-1.jpg";

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
  description:
    "Silakan masuk menggunakan akun Asesor yang memiliki akses Komite Teknis.",
  redirect: "/asesor"
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedRole = localStorage.getItem("last_login_role");
  const selectedRole = location.state?.role || storedRole || "admin";

  const roleConfig =
    selectedRole === "komite"
      ? KomiteTeknis
      : ROLE_CONFIG[selectedRole] || ROLE_CONFIG.admin;

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
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <div className="flex min-h-screen w-full bg-white font-sans selection:bg-[#CC6B27]/30">

      {/* KIRI - BACKGROUND IMAGE & BRANDING */}
      <div className="relative hidden overflow-hidden bg-[#071E3D] p-14 lg:flex lg:w-[55%] lg:flex-col lg:justify-center xl:w-[60%] xl:p-20">

        <img
          src={bgLogin}
          alt="LSP Pustaka Ilmiah Elektronik"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-[#071E3D]/80" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#071E3D] via-[#071E3D]/75 to-[#CC6B27]/20" />

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

          <motion.div
            initial={{
              opacity: 0,
              x: -40
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

            {/* GARIS ORANGE DI ATAS KOMPETENSI DIHAPUS */}

            <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight text-white xl:text-[60px]">
              Kompetensi
              <br />
              <span className="text-[#CC6B27]">
                Tervalidasi.
              </span>
            </h1>

            <p className="max-w-[460px] text-[15px] font-medium leading-relaxed text-slate-200/90 xl:text-[16px]">
              Sistem Informasi Manajemen LSP Pustaka Ilmiah Elektronik.
              Memastikan standar kompetensi nasional berlisensi BNSP untuk
              profesional pengelolaan pustaka dan terbitan ilmiah.
            </p>
          </motion.div>
        </div>
      </div>

      {/* KANAN - FORM LOGIN */}
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

          <motion.div
            variants={itemVariants}
            className="mb-10 text-center lg:text-left"
          >

            {/* IKON SHIELDCHECK DIHAPUS */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#CC6B27]">
                {roleConfig.label}
              </span>
            </div>

            <h2 className="mb-2 text-[32px] font-black tracking-tight text-[#071E3D]">
              Selamat{" "}
              <span className="text-[#CC6B27]">
                Datang.
              </span>
            </h2>

            <p className="text-[13px] font-medium text-slate-500">
              {roleConfig.description}
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">

            <motion.div variants={itemVariants}>
              <label className="mb-2 ml-1 block text-[11px] font-bold uppercase tracking-widest text-[#071E3D]/70">
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4EC] bg-[#F0F4F8] py-3.5 pl-11 pr-4 text-[13px] font-bold text-[#071E3D] transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/10"
                />

              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="mb-2 ml-1 block text-[11px] font-bold uppercase tracking-widest text-[#071E3D]/70">
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4EC] bg-[#F0F4F8] py-3.5 pl-11 pr-12 text-[13px] font-bold text-[#071E3D] transition-all placeholder:text-slate-400 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 text-slate-400 transition-colors hover:text-[#CC6B27]"
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
              className="flex items-center justify-between pt-2"
            >

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
                onClick={() =>
                  navigate("/lupa-akses", {
                    state: {
                      role: selectedRole
                    }
                  })
                }
                className="text-[10px] font-black uppercase tracking-widest text-[#CC6B27] hover:underline"
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
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="text-[12px] font-semibold leading-relaxed">
                    {error}
                  </span>
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
                  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />

                  <span className="text-[12px] font-bold">
                    Autentikasi {roleConfig.label} berhasil
                  </span>
                </motion.div>
              )}

            </AnimatePresence>

            <motion.button
              variants={itemVariants}
              whileHover={{
                x: 3
              }}
              whileTap={{
                scale: 0.98
              }}
              disabled={loading || success}
              className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#CC6B27] py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#CC6B27]/20 transition-all duration-300 hover:bg-[#b55b1f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >

              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <>
                  <span>
                    Masuk Sistem
                  </span>

                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1.5"
                    size={16}
                  />
                </>
              )}

            </motion.button>

          </form>

          <motion.div
            variants={itemVariants}
            className="mt-14 text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-300">
              LSP Pustaka Ilmiah Elektronik &bull; 2026
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}