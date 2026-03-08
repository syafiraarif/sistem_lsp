import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'Admin', role: 'Administrator' });

  // 1. Ambil Data User dari LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || parsedUser.username || 'Admin',
          role: parsedUser.role || 'Administrator'
        });
      } catch (e) {
        console.error("Gagal parsing data user", e);
      }
    }
  }, []);

  return (
    <header className="h-[72px] md:h-20 px-6 md:px-8 flex justify-between items-center sticky top-0 z-40 bg-[#CC6B27] shadow-md border-b-[3px] border-[#071E3D]/20">
      
      {/* BAGIAN KIRI: SAPAAN */}
      <div>
        <h3 className="text-lg md:text-[22px] font-black text-[#071E3D] leading-tight m-0 tracking-wide">
          Selamat datang, {userData.name}!
        </h3>
        <p className="text-xs md:text-[13.5px] text-[#182D4A] font-bold m-0 mt-1">
          Semoga harimu menyenangkan di sistem ini.
        </p>
      </div>
      
      {/* BAGIAN KANAN: PROFIL ONLY */}
      <div className="flex items-center">
        
        {/* Area Profil (Klik langsung ke halaman profil) */}
        <div 
          className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#071E3D]/10 transition-all duration-200 border border-transparent hover:border-[#071E3D]/20" 
          onClick={() => navigate('/admin/profil')}
          title="Ke Halaman Profil"
        >
          <div className="text-right hidden sm:block">
            <span className="block font-extrabold text-[14.5px] text-[#071E3D] leading-tight">
              {userData.name}
            </span>
            <span className="block text-[12px] text-[#182D4A] font-bold mt-0.5">
              {userData.role}
            </span>
          </div>
          
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAFAFA] text-[#071E3D] text-[18px] font-black shadow-md border-2 border-[#071E3D]">
            {userData.name.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminNavbar;