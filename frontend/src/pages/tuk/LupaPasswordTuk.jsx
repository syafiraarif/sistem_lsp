// frontend/src/pages/tuk/LupaPasswordTuk.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Key,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import SidebarTuk from "../../components/sidebar/SidebarTuk";
import { notifikasi } from "../../components/ui/notifikasi";

const API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
      return notifikasi.peringatan("Perhatian", "Semua field wajib diisi!");
    }
    if (new_password.length < 6) {
      return notifikasi.peringatan("Perhatian", "Password baru minimal 6 karakter!");
    }
    if (new_password !== confirm_password) {
      return notifikasi.peringatan("Perhatian", "Konfirmasi password tidak cocok!");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/tuk/ubah-password`,
        { old_password, new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      notifikasi.sukses("Berhasil", "Password TUK berhasil diperbarui!");
      setForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error(err);
      notifikasi.gagal(
        "Gagal Menyimpan",
        err.response?.data?.message || "Gagal mengubah password. Pastikan password lama benar."
      );
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
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarTuk
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          
          {/* Header Dashboard */}
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Keamanan Akun
                  </h1>
                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Perbarui password akun secara berkala untuk menjaga akses dashboard TUK tetap aman.
                  </p>
                </div>
                
                <div className="rounded-xl bg-[#071E3D] px-5 py-3 text-white flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-white/10 text-[#CC6B27] flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                      Status Keamanan
                    </p>
                    <p className="text-[12px] font-bold mt-0.5">
                      Password Terenkripsi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] items-start gap-5">
            
            {/* Form Ubah Password */}
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <Lock size={17} className="text-[#CC6B27]" />
                  Form Ubah Password
                </h2>
              </div>
              
              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Isi password lama dan tentukan password baru Anda di bawah ini.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5 p-5 md:p-6">
                  {inputFields.map(({ label, name, keyShow, icon: Icon, hint, placeholder }) => (
                    <div key={name}>
                      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
                        {label} <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Icon size={16} className="text-[#182D4A]/40 group-focus-within:text-[#CC6B27] transition-colors" />
                        </div>
                        <input
                          type={show[keyShow] ? "text" : "password"}
                          name={name}
                          value={form[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 pl-10 pr-10 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePw(keyShow)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#182D4A]/40 hover:text-[#CC6B27] transition-colors"
                        >
                          {show[keyShow] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {hint && (
                        <p className="mt-1.5 text-[11px] font-medium text-[#182D4A]/60">
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                      Simpan Perubahan
                    </p>
                    <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                      Pastikan password baru Anda catat dengan aman.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Simpan Password
                  </button>
                </div>
              </form>
            </section>

            {/* Panel Informasi */}
            <aside className="flex flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm sticky top-6">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <ShieldCheck size={17} className="text-[#CC6B27]" />
                  Tips Keamanan
                </h2>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[12px] leading-relaxed font-medium text-[#182D4A]/70 mb-5">
                  Gunakan kombinasi password yang sulit ditebak dan jangan
                  membagikan akses akun TUK Anda kepada pihak lain.
                </p>
                
                <div className="space-y-3">
                  <SecurityTip text="Minimal menggunakan 6 karakter." />
                  <SecurityTip text="Gunakan kombinasi huruf kapital dan angka." />
                  <SecurityTip text="Hindari menggunakan nama instansi sebagai password." />
                  <SecurityTip text="Ubah secara rutin setiap 3 atau 6 bulan." />
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
};

const SecurityTip = ({ text }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-3.5">
      <div className="mt-0.5 rounded-md bg-[#CC6B27]/10 text-[#CC6B27] p-1 shrink-0">
        <CheckCircle size={14} />
      </div>
      <p className="text-[12px] font-bold leading-snug text-[#071E3D]">{text}</p>
    </div>
  );
};

export default LupaPasswordTuk;