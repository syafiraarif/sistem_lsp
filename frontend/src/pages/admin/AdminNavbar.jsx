import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";

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
    <header className="sticky top-0 z-40 bg-[#FAFAFA] px-6 pb-2 pt-6 md:px-8">
      <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm md:p-6">
        
        <div className="flex min-w-0 flex-col justify-center">
          <h1 className="m-0 truncate text-[20px] font-black leading-tight text-[#071E3D] md:text-[26px]">
            Selamat datang, <span className="text-[#CC6B27]">{userData.name}</span>
          </h1>

          <p className="mt-1.5 hidden text-[13.5px] font-medium text-[#182D4A]/70 sm:block">
            Kelola sistem informasi LSP melalui dashboard admin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/profil-lsp")}
          title="Ke Halaman Profil"
          className="group flex shrink-0 items-center gap-3 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-2 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/5 hover:shadow-sm"
        >
          <div className="hidden min-w-0 flex-col items-end px-2 sm:flex">
            <span className="block max-w-[150px] truncate text-[13px] font-bold text-[#071E3D]">
              {userData.name}
            </span>
            <span className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#182D4A]/50">
              {userData.role}
            </span>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#071E3D] text-[15px] font-bold text-white shadow-sm">
            {initial}
          </div>

          <ChevronRight
            size={16}
            className="mr-1 hidden text-[#182D4A]/30 transition-transform group-hover:translate-x-1 group-hover:text-[#CC6B27] md:block"
          />
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;