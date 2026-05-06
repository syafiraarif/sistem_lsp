// frontend/src/components/navbar/AdminNavbar.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "Admin",
    role: "Administrator",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUserData({
          name:
            parsedUser.name ||
            parsedUser.nama ||
            parsedUser.nama_lengkap ||
            parsedUser.username ||
            "Admin",
          role: parsedUser.role || "Administrator",
        });
      } catch (e) {
        console.error("Gagal parsing data user", e);
      }
    }
  }, []);

  const initial = userData.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFC]/85 backdrop-blur-xl border-b border-slate-100">
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-20 h-44 w-44 rounded-full bg-[#071E3D]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4 px-5 md:px-6 py-4">
            {/* BAGIAN KIRI */}
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
                <ShieldCheck size={14} className="text-orange-500" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Dashboard Admin
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-[#071E3D] leading-tight truncate">
                Selamat datang,{" "}
                <span className="text-orange-500">{userData.name}</span>
              </h3>

              <p className="hidden sm:block text-xs md:text-sm text-slate-500 font-semibold mt-1">
                Kelola sistem informasi LSP melalui dashboard admin.
              </p>
            </div>

            {/* BAGIAN KANAN */}
            <button
              type="button"
              onClick={() => navigate("/admin/profil-lsp")}
              title="Ke Halaman Profil"
              className="group flex items-center gap-3 rounded-[22px] border border-slate-100 bg-slate-50/70 px-3 md:px-4 py-3 transition-all hover:bg-white hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/5 shrink-0"
            >
              <div className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-100 text-orange-500">
                <Sparkles size={21} />
              </div>

              <div className="hidden sm:block text-right min-w-0">
                <span className="block max-w-[160px] truncate text-sm font-black text-[#071E3D] leading-tight">
                  {userData.name}
                </span>

                <span className="mt-1 inline-flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {userData.role}
                </span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071E3D] text-white text-lg font-black shadow-sm">
                {initial}
              </div>

              <ChevronRight
                size={16}
                className="hidden md:block text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-orange-500"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;