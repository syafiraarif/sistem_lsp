import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck
} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function ResetAkses() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(
        "Password minimal 8 karakter."
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/auth/reset-access`,
        {
          token,
          password,
          password_confirmation:
            passwordConfirmation
        }
      );

      setSuccess(
        res.data?.message ||
          "Password berhasil diubah."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Link reset tidak valid atau sudah kedaluwarsa."
      );
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

          <h1 className="text-7xl font-black text-white leading-[1.1]">
            Secure
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              New Access.
            </span>
          </h1>

          <p className="mt-8 text-slate-400 text-xl max-w-lg leading-relaxed font-light">
            Buat password baru untuk mengembalikan akses ke akun SIMLSP Anda.
          </p>
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
              <KeyRound size={28} />
            </div>

            <h2 className="text-4xl font-black text-white lg:text-[#071E3D] tracking-tight">
              Buat Password
              <span className="text-orange-500">
                {" "}Baru.
              </span>
            </h2>

            <p className="mt-3 text-slate-400 font-medium">
              Gunakan password baru minimal 8 karakter.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <PasswordField
              label="Password Baru"
              value={password}
              onChange={setPassword}
              show={showPassword}
              setShow={setShowPassword}
              placeholder="Minimal 8 karakter"
            />

            <PasswordField
              label="Konfirmasi Password"
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              show={showConfirmation}
              setShow={setShowConfirmation}
              placeholder="Ulangi password baru"
            />

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
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
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
                className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3"
              >
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !!success
              }
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={20}
                />
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-white lg:text-[#071E3D] uppercase ml-1 tracking-widest opacity-70">
        {label}
      </label>

      <div className="relative group">
        <div className="absolute left-0 w-12 h-full flex items-center justify-center text-slate-400 group-focus-within:text-orange-500 transition-colors">
          <KeyRound size={20} />
        </div>

        <input
          required
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full pl-12 pr-14 py-4 bg-slate-500/10 lg:bg-slate-50 border-b-2 border-slate-700 lg:border-slate-100 focus:border-orange-500 focus:bg-white lg:rounded-2xl transition-all font-bold text-white lg:text-[#071E3D] placeholder:text-slate-500 outline-none"
        />

        <button
          type="button"
          onClick={() =>
            setShow(!show)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}