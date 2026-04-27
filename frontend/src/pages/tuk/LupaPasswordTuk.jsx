// frontend/src/pages/tuk/LupaPasswordTuk.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Menu,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import SidebarTuk from "../../components/sidebar/SidebarTuk";

const LupaPasswordTuk = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/tuk";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePw = (f) => {
    setShow({ ...show, [f]: !show[f] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { old_password, new_password, confirm_password } = form;

    if (!old_password || !new_password || !confirm_password) {
      return setMsg({ type: "error", text: "Semua field wajib diisi!" });
    }

    if (new_password.length < 6) {
      return setMsg({
        type: "error",
        text: "Password minimal 6 karakter!",
      });
    }

    if (new_password !== confirm_password) {
      return setMsg({
        type: "error",
        text: "Konfirmasi password tidak cocok!",
      });
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/ubah-password`,
        { old_password, new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({ type: "success", text: "Password berhasil diperbarui!" });
      setForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Gagal mengubah password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    {
      label: "Password Lama",
      name: "old_password",
      keyShow: "old",
      icon: Key,
      placeholder: "Masukkan password lama",
    },
    {
      label: "Password Baru",
      name: "new_password",
      keyShow: "new",
      icon: Lock,
      placeholder: "Masukkan password baru",
      hint: "Gunakan minimal 6 karakter untuk keamanan akun.",
    },
    {
      label: "Konfirmasi Password",
      name: "confirm_password",
      keyShow: "confirm",
      icon: Lock,
      placeholder: "Ulangi password baru",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">
      <SidebarTuk
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <main className="flex-1 transition-all duration-300 p-4 lg:p-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-5 flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-50 text-[#071E3D] flex items-center justify-center"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="font-black text-[#071E3D]">Ubah Password</h1>
            <p className="text-xs text-slate-400 font-medium">
              Keamanan akun TUK
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Hero Header */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <Shield size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Keamanan Akun
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Ubah Password TUK
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Perbarui password akun secara berkala untuk menjaga akses
                  dashboard TUK tetap aman.
                </p>
              </div>

              <div className="w-full lg:w-auto">
                <div className="rounded-[26px] bg-[#071E3D] text-white p-5 min-w-[260px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-orange-400 flex items-center justify-center">
                      <Sparkles size={23} />
                    </div>

                    <div>
                      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
                        Status Keamanan
                      </p>
                      <p className="text-sm font-black mt-1">
                        Password Terenkripsi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Info Panel */}
            <aside className="xl:col-span-1">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm p-6 sticky top-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
                  <Shield size={28} />
                </div>

                <h2 className="text-xl font-black text-[#071E3D] mb-3">
                  Tips Password Aman
                </h2>

                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-5">
                  Gunakan kombinasi password yang sulit ditebak dan jangan
                  membagikan akses akun kepada pihak lain.
                </p>

                <div className="space-y-3">
                  <SecurityTip text="Minimal 6 karakter." />
                  <SecurityTip text="Gunakan kombinasi huruf dan angka." />
                  <SecurityTip text="Hindari memakai password lama." />
                  <SecurityTip text="Pastikan konfirmasi password sesuai." />
                </div>
              </div>
            </aside>

            {/* Form Card */}
            <section className="xl:col-span-2">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center">
                      <Lock size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-[#071E3D]">
                        Form Ubah Password
                      </h2>
                      <p className="text-slate-400 text-sm font-medium mt-1">
                        Isi password lama dan password baru Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-8">
                  {msg.text && (
                    <div
                      className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm border ${
                        msg.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {msg.type === "success" ? (
                        <CheckCircle size={20} className="shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      )}
                      <span className="font-bold">{msg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {inputFields.map(
                      ({ label, name, keyShow, icon: Icon, hint, placeholder }) => (
                        <div key={name}>
                          <label className="block text-[11px] font-black text-[#071E3D] uppercase tracking-widest mb-2">
                            {label}
                          </label>

                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                              <Icon className="text-slate-400 group-focus-within:text-orange-500 w-5 h-5 transition-colors" />
                            </div>

                            <input
                              type={show[keyShow] ? "text" : "password"}
                              name={name}
                              value={form[name]}
                              onChange={handleChange}
                              className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-[#071E3D] font-bold placeholder:text-slate-300"
                              placeholder={placeholder}
                            />

                            <button
                              type="button"
                              onClick={() => togglePw(keyShow)}
                              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              {show[keyShow] ? (
                                <EyeOff size={19} />
                              ) : (
                                <Eye size={19} />
                              )}
                            </button>
                          </div>

                          {hint && (
                            <p className="mt-2 text-xs text-slate-400 font-medium">
                              {hint}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-xs text-slate-400 font-medium">
                        Pastikan password baru mudah Anda ingat namun sulit
                        ditebak.
                      </p>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                          loading
                            ? "bg-orange-300 cursor-wait"
                            : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                        }`}
                      >
                        {loading && <Loader2 className="animate-spin w-4 h-4" />}
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        {!loading && <ChevronRight size={17} />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const SecurityTip = ({ text }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        <CheckCircle size={16} />
      </div>

      <p className="text-sm text-slate-600 font-bold">{text}</p>
    </div>
  );
};

export default LupaPasswordTuk;