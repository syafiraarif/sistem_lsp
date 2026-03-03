// frontend/src/pages/tuk/LupaPasswordTuk.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Key, Shield, AlertCircle, CheckCircle, Loader2, Menu } from "lucide-react";
import SidebarTuk from "../../components/sidebar/SidebarTuk";

const LupaPasswordTuk = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Fallback URL jika .env tidak terbaca
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/tuk";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const togglePw = (f) => setShow({ ...show, [f]: !show[f] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { old_password, new_password, confirm_password } = form;
    
    if (!old_password || !new_password || !confirm_password) 
      return setMsg({ type: "error", text: "Semua field wajib diisi!" });
    if (new_password.length < 6) 
      return setMsg({ type: "error", text: "Password minimal 6 karakter!" });
    if (new_password !== confirm_password) 
      return setMsg({ type: "error", text: "Konfirmasi password tidak cocok!" });

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Sekarang pakai variabel API_URL
      await axios.post(`${API_URL}/ubah-password`, 
        { old_password, new_password }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: "success", text: "Password berhasil diperbarui!" });
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Gagal mengubah password." });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { label: "Password Lama", name: "old_password", icon: Key },
    { label: "Password Baru", name: "new_password", icon: Lock, hint: "Minimal 6 karakter" },
    { label: "Konfirmasi Password", name: "confirm_password", icon: Lock },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <SidebarTuk isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={() => { localStorage.clear(); navigate("/login"); }} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <Menu size={24} />
          </button>
          <span className="ml-3 font-bold text-lg">Ubah Password</span>
        </div>

        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Ubah Password</h1>
                <p className="text-slate-500 text-sm">Kelola keamanan akun Anda</p>
              </div>
            </div>

            {/* Alert */}
            {msg.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {msg.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {msg.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-5">
              {inputFields.map(({ label, name, icon: Icon, hint }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="text-slate-400 w-5 h-5" />
                    </div>
                    <input
                      type={show[name.split('_')[0]] ? "text" : "password"}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border-b-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all rounded-lg text-slate-700"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => togglePw(name.split('_')[0])} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600">
                      {show[name.split('_')[0]] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 ${loading ? "bg-indigo-400 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                  {loading && <Loader2 className="animate-spin w-4 h-4" />}
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LupaPasswordTuk;