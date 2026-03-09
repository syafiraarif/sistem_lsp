import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome, FaBullhorn, FaGavel, FaChartBar, FaUniversity, FaBook, FaAward,
  FaLayerGroup, FaMoneyBillWave, FaCalendarAlt, FaBuilding, FaUserGraduate,
  FaUserTie, FaUsersCog, FaCommentDots, FaGlobe, FaCogs, FaCalculator,
  FaCreditCard, FaEnvelopeOpenText, FaEye, FaLock, FaSignOutAlt,
  FaChevronDown, FaChevronRight
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarContentRef = useRef(null);

  // State untuk Dropdown Menu
  const [openMenus, setOpenMenus] = useState({
    laporan: false,
    standar: false,
    biaya: false,
    event: false,
    tuk: false,
    asesi: false,
    asesor: false,
    manajemen: false,
    pembayaran: false,
    persuratan: false
  });

  // 1. AUTO-OPEN MENU INDUK JIKA ANAKNYA SEDANG AKTIF
  useEffect(() => {
    const path = location.pathname;
    setOpenMenus((prev) => {
      const newState = { ...prev };
      const isPathActive = (pathsArray) => pathsArray.some(p => path.startsWith(p));

      newState.laporan = isPathActive(['/admin/laporan']);
      newState.standar = isPathActive(['/admin/unit-kompetensi', '/admin/skkni']);
      newState.biaya = isPathActive(['/admin/biaya']);
      newState.event = isPathActive(['/admin/jadwal']);
      newState.tuk = isPathActive(['/admin/tuk']);
      newState.asesi = isPathActive(['/admin/asesi', '/admin/verifikasi-pendaftaran']);
      newState.asesor = isPathActive(['/admin/asesor']);
      newState.manajemen = isPathActive(['/admin/manajemen']);
      newState.pembayaran = isPathActive(['/admin/pembayaran']);
      newState.persuratan = isPathActive(['/admin/surat']);

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

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
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
  // Menggunakan #071E3D (Background Utama), #182D4A (Secondary), #CC6B27 (Highlight), #FAFAFA (Text)
  
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
        
        <button className={getNavItemClass(isActive('/admin/laporan'))} onClick={() => toggleMenu('laporan')}>
          <div className="flex items-center flex-1">
            <FaChartBar className="text-lg mr-3" />
            <span className="text-left">Laporan Sertifikasi</span>
          </div>
          {openMenus.laporan ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.laporan && (
          <div className="flex flex-col mb-1 mt-1 bg-[#071E3D]">
            <button className={getSubItemClass(isActive('/admin/laporan/umum'))} onClick={() => handleNav('/admin/laporan/umum')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/umum') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Laporan Umum
            </button>
            <button className={getSubItemClass(isActive('/admin/laporan/bulanan'))} onClick={() => handleNav('/admin/laporan/bulanan')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/bulanan') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Laporan Bulanan
            </button>
            <button className={getSubItemClass(isActive('/admin/laporan/tahunan'))} onClick={() => handleNav('/admin/laporan/tahunan')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/tahunan') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Laporan Tahunan
            </button>
            <button className={getSubItemClass(isActive('/admin/laporan/kinerja-asesor'))} onClick={() => handleNav('/admin/laporan/kinerja-asesor')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/kinerja-asesor') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Kinerja Asesor
            </button>
            <button className={getSubItemClass(isActive('/admin/laporan/kinerja-tuk'))} onClick={() => handleNav('/admin/laporan/kinerja-tuk')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/kinerja-tuk') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Kinerja TUK
            </button>
            <button className={getSubItemClass(isActive('/admin/laporan/feedback'))} onClick={() => handleNav('/admin/laporan/feedback')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/laporan/feedback') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Umpan Balik
            </button>
          </div>
        )}

        {/* MASTER DATA */}
        <SectionLabel>Master Data</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/profil-lsp'))} onClick={() => handleNav('/admin/profil-lsp')}>
          <div className="flex items-center flex-1">
            <FaUniversity className="text-lg mr-3" />
            <span className="text-left">Profil LSP</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/dokumen-mutu'))} onClick={() => handleNav('/admin/dokumen-mutu')}>
          <div className="flex items-center flex-1">
            <FaBook className="text-lg mr-3" />
            <span className="text-left">Dokumen Mutu</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/unit-kompetensi') || isActive('/admin/skkni'))} onClick={() => toggleMenu('standar')}>
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
            <button className={getSubItemClass(isActive('/admin/bank-soal'))} onClick={() => handleNav('/admin/bank-soal')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/bank-soal') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Bank Soal
            </button>
            <button className={getSubItemClass(isActive('/admin/bank-soal-pg'))} onClick={() => handleNav('/admin/bank-soal-pg')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/bank-soal-pg') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Bank Soal PG
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/skema'))} onClick={() => handleNav('/admin/skema')}>
          <div className="flex items-center flex-1">
            <FaLayerGroup className="text-lg mr-3" />
            <span className="text-left">Skema Sertifikasi</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/biaya'))} onClick={() => toggleMenu('biaya')}>
          <div className="flex items-center flex-1">
            <FaMoneyBillWave className="text-lg mr-3" />
            <span className="text-left">Biaya & Rekening</span>
          </div>
          {openMenus.biaya ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.biaya && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/biaya/rekening'))} onClick={() => handleNav('/admin/biaya/rekening')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/biaya/rekening') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Rekening Bank
            </button>
            <button className={getSubItemClass(isActive('/admin/biaya/komponen'))} onClick={() => handleNav('/admin/biaya/komponen')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/biaya/komponen') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Komponen Biaya
            </button>
            <button className={getSubItemClass(isActive('/admin/biaya/uji'))} onClick={() => handleNav('/admin/biaya/uji')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/biaya/uji') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Biaya Uji
            </button>
          </div>
        )}

        {/* OPERASIONAL */}
        <SectionLabel>Operasional</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/jadwal'))} onClick={() => toggleMenu('event')}>
          <div className="flex items-center flex-1">
            <FaCalendarAlt className="text-lg mr-3" />
            <span className="text-left">Event & Jadwal</span>
          </div>
          {openMenus.event ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.event && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/jadwal/cari'))} onClick={() => handleNav('/admin/jadwal/cari')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/jadwal/cari') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Cari Jadwal
            </button>
            <button className={getSubItemClass(isActive('/admin/jadwal/uji-kompetensi'))} onClick={() => handleNav('/admin/jadwal/uji-kompetensi')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/jadwal/uji-kompetensi') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Jadwal Uji Kompetensi
            </button>
            <button className={getSubItemClass(isActive('/admin/jadwal/event-uji'))} onClick={() => handleNav('/admin/jadwal/event-uji')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/jadwal/event-uji') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Event Uji Kompetensi
            </button>
            <button className={getSubItemClass(isActive('/admin/jadwal/arsip'))} onClick={() => handleNav('/admin/jadwal/arsip')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/jadwal/arsip') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Arsip Jadwal
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/tuk'))} onClick={() => toggleMenu('tuk')}>
          <div className="flex items-center flex-1">
            <FaBuilding className="text-lg mr-3" />
            <span className="text-left">Tempat Uji (TUK)</span>
          </div>
          {openMenus.tuk ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.tuk && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(location.pathname === '/admin/tuk')} onClick={() => handleNav('/admin/tuk')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${location.pathname === '/admin/tuk' ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Daftar TUK
            </button>
            <button className={getSubItemClass(isActive('/admin/tuk/persyaratan'))} onClick={() => handleNav('/admin/tuk/persyaratan')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/tuk/persyaratan') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Persyaratan TUK
            </button>
          </div>
        )}

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
            <button className={getSubItemClass(isActive('/admin/asesi/cari'))} onClick={() => handleNav('/admin/asesi/cari')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/cari') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Pencarian Asesi
            </button>
            <button className={getSubItemClass(isActive('/admin/verifikasi-pendaftaran'))} onClick={() => handleNav('/admin/verifikasi-pendaftaran')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/verifikasi-pendaftaran') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Pendaftar Baru
            </button>
            
            <button className={getSubItemClass(isActive('/admin/asesi/mapa') && !location.pathname.includes('/m01') && !location.pathname.includes('/m02'))} onClick={() => handleNav('/admin/asesi/mapa')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/mapa') && !location.pathname.includes('/m01') && !location.pathname.includes('/m02') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>MAPA
            </button>
            <button className={getSubItemClass(location.pathname.includes('/m01'))} onClick={() => handleNav('/admin/asesi/mapa')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${location.pathname.includes('/m01') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>MAPA-01
            </button>
            <button className={getSubItemClass(location.pathname.includes('/m02'))} onClick={() => handleNav('/admin/asesi/mapa')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${location.pathname.includes('/m02') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>MAPA-02
            </button>

            <button className={getSubItemClass(isActive('/admin/asesi/ia01-observasi'))} onClick={() => handleNav('/admin/asesi/ia01-observasi')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/ia01-observasi') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>IA.01 Observasi
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/ia03-pertanyaan'))} onClick={() => handleNav('/admin/asesi/ia03-pertanyaan')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/ia03-pertanyaan') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>IA.03 Pertanyaan
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/terjadwal'))} onClick={() => handleNav('/admin/asesi/terjadwal')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/terjadwal') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Terjadwal
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/kompeten'))} onClick={() => handleNav('/admin/asesi/kompeten')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/kompeten') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Kompeten
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/belum-sertifikat'))} onClick={() => handleNav('/admin/asesi/belum-sertifikat')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/belum-sertifikat') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Belum Sertifikat
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/arsip'))} onClick={() => handleNav('/admin/asesi/arsip')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/arsip') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Arsip
            </button>
            <button className={getSubItemClass(isActive('/admin/asesi/blokir'))} onClick={() => handleNav('/admin/asesi/blokir')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesi/blokir') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Diblokir
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
            <button className={getSubItemClass(isActive('/admin/asesor/jadwal'))} onClick={() => handleNav('/admin/asesor/jadwal')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/asesor/jadwal') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Jadwal Asesor
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/komite'))} onClick={() => handleNav('/admin/komite')}>
          <div className="flex items-center flex-1">
            <FaUsersCog className="text-lg mr-3" />
            <span className="text-left">Komite Teknis</span>
          </div>
        </button>

        {/* SISTEM & WEB */}
        <SectionLabel>Sistem & Web</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/notifikasi'))} onClick={() => handleNav('/admin/notifikasi')}>
          <div className="flex items-center flex-1">
            <FaCommentDots className="text-lg mr-3" />
            <span className="text-left">Notifikasi</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/website'))} onClick={() => handleNav('/admin/website')}>
          <div className="flex items-center flex-1">
            <FaGlobe className="text-lg mr-3" />
            <span className="text-left">Konten Website</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/manajemen'))} onClick={() => toggleMenu('manajemen')}>
          <div className="flex items-center flex-1">
            <FaCogs className="text-lg mr-3" />
            <span className="text-left">Manajemen Sistem</span>
          </div>
          {openMenus.manajemen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.manajemen && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/manajemen/users'))} onClick={() => handleNav('/admin/manajemen/users')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/manajemen/users') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Users
            </button>
            <button className={getSubItemClass(isActive('/admin/manajemen/pengusul'))} onClick={() => handleNav('/admin/manajemen/pengusul')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/manajemen/pengusul') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Pengusul
            </button>
            <button className={getSubItemClass(isActive('/admin/manajemen/wa'))} onClick={() => handleNav('/admin/manajemen/wa')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/manajemen/wa') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>WhatsApp API
            </button>
            <button className={getSubItemClass(isActive('/admin/manajemen/bnsp'))} onClick={() => handleNav('/admin/manajemen/bnsp')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/manajemen/bnsp') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Integrasi BNSP
            </button>
          </div>
        )}

        {/* KEUANGAN & ADMIN */}
        <SectionLabel>Keuangan & Admin</SectionLabel>

        <button className={getNavItemClass(isActive('/admin/keuangan'))} onClick={() => handleNav('/admin/keuangan')}>
          <div className="flex items-center flex-1">
            <FaCalculator className="text-lg mr-3" />
            <span className="text-left">Keuangan</span>
          </div>
        </button>

        <button className={getNavItemClass(isActive('/admin/pembayaran'))} onClick={() => toggleMenu('pembayaran')}>
          <div className="flex items-center flex-1">
            <FaCreditCard className="text-lg mr-3" />
            <span className="text-left">Pembayaran</span>
          </div>
          {openMenus.pembayaran ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.pembayaran && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/pembayaran/cari'))} onClick={() => handleNav('/admin/pembayaran/cari')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/pembayaran/cari') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Cari Pembayaran
            </button>
            <button className={getSubItemClass(isActive('/admin/pembayaran/validasi'))} onClick={() => handleNav('/admin/pembayaran/validasi')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/pembayaran/validasi') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Validasi
            </button>
            <button className={getSubItemClass(isActive('/admin/pembayaran/lunas'))} onClick={() => handleNav('/admin/pembayaran/lunas')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/pembayaran/lunas') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Tervalidasi
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/surat'))} onClick={() => toggleMenu('persuratan')}>
          <div className="flex items-center flex-1">
            <FaEnvelopeOpenText className="text-lg mr-3" />
            <span className="text-left">Persuratan</span>
          </div>
          {openMenus.persuratan ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>
        {openMenus.persuratan && (
          <div className="flex flex-col mb-1 mt-1">
            <button className={getSubItemClass(isActive('/admin/surat/sk'))} onClick={() => handleNav('/admin/surat/sk')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/surat/sk') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>SK & Tugas
            </button>
            <button className={getSubItemClass(isActive('/admin/surat/masuk'))} onClick={() => handleNav('/admin/surat/masuk')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/surat/masuk') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Surat Masuk
            </button>
            <button className={getSubItemClass(isActive('/admin/surat/keluar'))} onClick={() => handleNav('/admin/surat/keluar')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/surat/keluar') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>Surat Keluar
            </button>
            <button className={getSubItemClass(isActive('/admin/surat/mou'))} onClick={() => handleNav('/admin/surat/mou')}>
              <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive('/admin/surat/mou') ? 'bg-[#CC6B27]' : 'bg-[#FAFAFA]/40'}`}></span>MoU / MoA
            </button>
          </div>
        )}

        <button className={getNavItemClass(isActive('/admin/surveillance'))} onClick={() => handleNav('/admin/surveillance')}>
          <div className="flex items-center flex-1">
            <FaEye className="text-lg mr-3" />
            <span className="text-left">Surveillance</span>
          </div>
        </button>

        {/* AKUN */}
        <SectionLabel>Akun</SectionLabel>
        
        <button className={getNavItemClass(isActive('/admin/ubah-sandi'))} onClick={() => handleNav('/admin/ubah-sandi')}>
          <div className="flex items-center flex-1">
            <FaLock className="text-lg mr-3" />
            <span className="text-left">Ubah Sandi</span>
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