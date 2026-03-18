import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome, FaBullhorn, FaGavel, FaChartBar, FaUniversity, FaBook, FaAward,
  FaLayerGroup, FaMoneyBillWave, FaCalendarAlt, FaBuilding, FaUserGraduate,
  FaUserTie, FaCommentDots, FaEnvelopeOpenText, FaEye, FaLock, FaSignOutAlt,
  FaChevronDown, FaChevronRight
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarContentRef = useRef(null);

  // State untuk Dropdown Menu
  const [openMenus, setOpenMenus] = useState({
    standar: false,
    asesi: false,
    asesor: false
  });

  // 1. AUTO-OPEN MENU INDUK JIKA ANAKNYA SEDANG AKTIF
  useEffect(() => {
    const path = location.pathname;
    setOpenMenus((prev) => {
      const newState = { ...prev };
      const isPathActive = (pathsArray) => pathsArray.some(p => path.startsWith(p));

      // '/admin/bank-soal' & '/admin/bank-soal-pg' tetap dipertahankan di sini agar menu Standar Kompetensi 
      // tetap terbuka & menyala (highlight) ketika user sedang mengelola soal dari halaman unit kompetensi
      newState.standar = isPathActive(['/admin/unit-kompetensi', '/admin/skkni', '/admin/bank-soal', '/admin/bank-soal-pg']);
      newState.asesi = isPathActive(['/admin/asesi', '/admin/verifikasi-pendaftaran', '/admin/asesi/belum-kompeten']);
      newState.asesor = isPathActive(['/admin/asesor']);

      return newState;
    });
  }, [location.pathname]);

  // 2. KEMBALIKAN POSISI SCROLL SIDEBAR SETIAP RENDER
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("sidebarScrollPosition");
    if (sidebarContentRef.current && savedScrollPos) {
      sidebarContentRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }
  }, []);

  // 3. SIMPAN POSISI SCROLL SETIAP KALI USER MENGGESER SIDEBAR
  const handleScroll = (e) => {
    sessionStorage.setItem("sidebarScrollPosition", e.target.scrollTop);
  };

  // FUNGSI TOGGLE MENU (ACCORDION STYLE)
  const toggleMenu = (key) => {
    setOpenMenus((prev) => {
      const newState = {
        standar: false,
        asesi: false,
        asesor: false
      };
      newState[key] = !prev[key];
      return newState;
    });
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNav = (path) => navigate(path);

  const handleLogout = () => {
    const isConfirm = window.confirm("Yakin mau keluar dari sistem?");
    if (isConfirm) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate('/login');
    }
  };

  // --- HELPER UNTUK KELAS TAILWIND ---
  
  const getNavItemClass = (active) =>
    `w-full flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg text-sm transition-all duration-200 outline-none ${
      active
        ? "bg-[#CC6B27] text-[#FAFAFA] font-semibold shadow-md"
        : "text-[#FAFAFA] hover:bg-[#182D4A]"
    }`;

  const getSubItemClass = (active) =>
    `w-full flex items-center pl-10 pr-3 py-2 mb-1 rounded-lg text-sm transition-all duration-200 outline-none ${
      active 
        ? "bg-[#182D4A] text-[#CC6B27] font-medium shadow-sm" 
        : "text-[#FAFAFA] opacity-80 hover:bg-[#182D4A] hover:opacity-100"
    }`;

  const SectionLabel = ({ children }) => (
    <div className="px-3 pt-5 pb-2 text-xs font-bold text-[#FAFAFA]/50 uppercase tracking-wider">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-64 bg-[#071E3D] text-[#FAFAFA] shadow-xl flex-shrink-0 relative">
      
      {/* STYLE MINIMAL UNTUK CUSTOM SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #182D4A; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CC6B27; }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#182D4A] mb-2 bg-[#071E3D]">
        <div className="text-3xl text-[#CC6B27]">
          <FaUniversity />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-[#FAFAFA]">S.I.LSP</h1>
          <p className="text-xs text-[#FAFAFA]/70">Sistem Informasi LSP</p>
        </div>
      </div>

      {/* CONTENT (SCROLLABLE) */}
      <div 
        className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar" 
        ref={sidebarContentRef} 
        onScroll={handleScroll}
      >
        {/* UTAMA */}
        <SectionLabel>Utama</SectionLabel>

        <button className={getNavItemClass(location.pathname === '/admin/dashboard')} onClick={() => handleNav('/admin/dashboard')}>
          <div className="flex items-center flex-1">
            <FaHome className="text-lg mr-3" />
            <span className="text-left">Home / Dashboard</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/pengaduan'))} onClick={() => handleNav('/admin/pengaduan')}>
          <div className="flex items-center flex-1">
            <FaBullhorn className="text-lg mr-3" />
            <span className="text-left">Layanan Pengaduan</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/banding'))} onClick={() => handleNav('/admin/banding')}>
          <div className="flex items-center flex-1">
            <FaGavel className="text-lg mr-3" />
            <span className="text-left">Layanan Banding</span>
          </div>
        </button>

        {/* REPORTING */}
        <SectionLabel>Reporting</SectionLabel>
        
        {/* MENU LAPORAN SERTIFIKASI (PATH DIUBAH DI SINI) */}
        <button className={getNavItemClass(isActive('/admin/laporan-sertifikasi'))} onClick={() => handleNav('/admin/laporan-sertifikasi')}>
          <div className="flex items-center flex-1">
            <FaChartBar className="text-lg mr-3" />
            <span className="text-left">Laporan Sertifikasi</span>
          </div>
        </button>

        {/* MASTER DATA */}
        <SectionLabel>Master Data</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/dokumen-mutu'))} onClick={() => handleNav('/admin/dokumen-mutu')}>
          <div className="flex items-center flex-1">
            <FaBook className="text-lg mr-3" />
            <span className="text-left">Dokumen Mutu</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/unit-kompetensi') || isActive('/admin/skkni') || isActive('/admin/bank-soal') || isActive('/admin/bank-soal-pg'))} onClick={() => toggleMenu('standar')}>
          <div className="flex items-center flex-1">
            <FaAward className="text-lg mr-3" />
            <span className="text-left">Standar Kompetensi</span>
          </div>
          {openMenus.standar ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.standar && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/unit-kompetensi'))} onClick={() => handleNav('/admin/unit-kompetensi')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/unit-kompetensi') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Unit Kompetensi
            </button>
            <button className={getSubItemClass(isActive('/admin/skkni'))} onClick={() => handleNav('/admin/skkni')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/skkni') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Data SKKNI
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/skema'))} onClick={() => handleNav('/admin/skema')}>
          <div className="flex items-center flex-1">
            <FaLayerGroup className="text-lg mr-3" />
            <span className="text-left">Skema Sertifikasi</span>
          </div>
        </button>

        {/* OPERASIONAL */}
        <SectionLabel>Operasional</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/jadwal/uji-kompetensi'))} onClick={() => handleNav('/admin/jadwal/uji-kompetensi')}>
          <div className="flex items-center flex-1">
            <FaCalendarAlt className="text-lg mr-3" />
            <span className="text-left">Jadwal Uji Kompetensi</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/tuk'))} onClick={() => handleNav('/admin/tuk')}>
          <div className="flex items-center flex-1">
            <FaBuilding className="text-lg mr-3" />
            <span className="text-left">Tempat Uji Kompetensi</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/asesi') || isActive('/admin/verifikasi-pendaftaran'))} onClick={() => toggleMenu('asesi')}>
          <div className="flex items-center flex-1">
            <FaUserGraduate className="text-lg mr-3" />
            <span className="text-left">Data Asesi</span>
          </div>
          {openMenus.asesi ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.asesi && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/asesi/tambah'))} onClick={() => handleNav('/admin/asesi/tambah')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/tambah') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Tambah Asesi
            </button>
            <button className={getSubItemClass(isActive('/admin/verifikasi-pendaftaran'))} onClick={() => handleNav('/admin/verifikasi-pendaftaran')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/verifikasi-pendaftaran') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Pendaftar Baru
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/terjadwal'))} onClick={() => handleNav('/admin/asesi/terjadwal')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/terjadwal') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Terjadwal
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/kompeten'))} onClick={() => handleNav('/admin/asesi/kompeten')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/kompeten') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Kompeten
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/belum-kompeten'))} onClick={() => handleNav('/admin/asesi/belum-kompeten')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/belum-kompeten') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Belum Kompeten
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/asesor'))} onClick={() => toggleMenu('asesor')}>
          <div className="flex items-center flex-1">
            <FaUserTie className="text-lg mr-3" />
            <span className="text-left">Data Asesor</span>
          </div>
          {openMenus.asesor ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.asesor && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(location.pathname === '/admin/asesor')} onClick={() => handleNav('/admin/asesor')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${location.pathname === '/admin/asesor' ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Daftar Asesor
            </button>
            <button className={getSubItemClass(isActive('/admin/asesor/statistik'))} onClick={() => handleNav('/admin/asesor/statistik')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesor/statistik') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Statistik Wilayah
            </button>
          </div>
        )}

        {/* SISTEM & WEB */}
        <SectionLabel>Sistem & Web</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/notifikasi'))} onClick={() => handleNav('/admin/notifikasi')}>
          <div className="flex items-center flex-1">
            <FaCommentDots className="text-lg mr-3" />
            <span className="text-left">Notifikasi</span>
          </div>
        </button>

        {/* KEUANGAN & ADMIN */}
        <SectionLabel>Keuangan & Admin</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/surveillance'))} onClick={() => handleNav('/admin/surveillance')}>
          <div className="flex items-center flex-1">
            <FaEye className="text-lg mr-3" />
            <span className="text-left">Surveillance</span>
          </div>
        </button>

      </div>

      {/* FOOTER: LOGOUT */}
      <div className="p-4 border-t border-[#182D4A] mt-auto bg-[#071E3D]">
        <button
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#FAFAFA] hover:bg-red-600 transition-all duration-200"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="text-lg mr-3 text-[#CC6B27] group-hover:text-white" />
          <span className="flex-1 text-left">Keluar</span>
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;