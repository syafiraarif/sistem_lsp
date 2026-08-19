import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

export default function LupaAkses() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await axios.post(
        `${API}/auth/forgot-access`,
        {
          email: email.trim()
        }
      );

      setSuccess(
        res.data?.message ||
          "Link pemulihan akses telah dikirim ke email Anda."
      );
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 404) {
        setError(
          message ||
            "Email tidak terdaftar. Silakan minta admin membuatkan akun terlebih dahulu."
        );
      } else if (status === 403) {
        setError(
          message ||
            "Akun dengan email tersebut tidak aktif. Silakan hubungi admin."
        );
      } else {
        setError(
          message ||
            "Gagal mengirim link pemulihan akses."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#071E3D] font-sans selection:bg-orange-500/30">
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
            alt="SIMLSP"
            className="w-full h-full object-cover opacity-20 scale-105"
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
            className="absolute -top-20 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <ShieldCheck
                className="text-white"
                size={28}
              />
            </div>

            <span className="font-black text-white tracking-tighter text-2xl">
              SIMLSP
            </span>
          </div>

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
              duration: 0.8
            }}
          >
            <h1 className="text-7xl font-black text-white leading-[1.1] mb-8">
              Recover
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Your Access.
              </span>
            </h1>

            <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-light">
              Pulihkan akses akun SIMLSP Anda melalui email yang terdaftar.
            </p>
          </motion.div>
        </div>

        <p className="relative z-10 text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">
          SIMLSP Integrated System • 2026
        </p>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-[#071E3D] lg:bg-white">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </button>

          <div className="mb-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">
              <Mail size={28} />
            </div>

            <h2 className="text-4xl font-black text-white lg:text-[#071E3D] tracking-tight">
              Lupa
              <span className="text-orange-500">
                {" "}Akses?
              </span>
            </h2>

            <p className="mt-3 text-slate-400 font-medium leading-relaxed">
              Masukkan email yang terdaftar untuk memulihkan akses akun Anda.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[11px] font-black text-white lg:text-[#071E3D] uppercase ml-1 tracking-widest opacity-70">
                Email Terdaftar
              </label>

              <div className="relative group">
                <div className="absolute left-0 w-12 h-full flex items-center justify-center text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={20} />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSuccess("");
                    setError("");
                  }}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-500/10 lg:bg-slate-50 border-b-2 border-slate-700 lg:border-slate-100 focus:border-orange-500 focus:bg-white lg:rounded-2xl transition-all font-bold text-white lg:text-[#071E3D] placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-bold flex items-start gap-3"
              >
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <span className="leading-relaxed">
                  {error}
                </span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl text-xs font-bold flex items-start gap-3"
              >
                <CheckCircle2
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <span className="leading-relaxed">
                  {success}
                </span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !!success
              }
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={20}
                />
              ) : (
                <>
                  <span>
                    Kirim Link Pemulihan
                  </span>

                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Link pemulihan hanya berlaku selama 15 menit. Setelah password berhasil diubah, Anda dapat login kembali menggunakan password baru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}