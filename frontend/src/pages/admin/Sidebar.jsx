// frontend/src/pages/admin/Sidebar.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBullhorn,
  FaGavel,
  FaChartBar,
  FaUniversity,
  FaBook,
  FaAward,
  FaLayerGroup,
  FaCalendarAlt,
  FaBuilding,
  FaUserGraduate,
  FaUserTie,
  FaCommentDots,
  FaEye,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaThumbtack,
} from "react-icons/fa";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarContentRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem("sidebarPinned") === "true";
  });

  const [openMenus, setOpenMenus] = useState({
    standar: false,
    asesi: false,
    asesor: false,
  });

  useEffect(() => {
    localStorage.setItem("sidebarPinned", isPinned);
  }, [isPinned]);

  useEffect(() => {
    const path = location.pathname;

    setOpenMenus((prev) => {
      const newState = { ...prev };

      const isPathActive = (pathsArray) =>
        pathsArray.some((p) => path.startsWith(p));

      newState.standar = isPathActive([
        "/admin/unit-kompetensi",
        "/admin/skkni",
        "/admin/bank-soal",
        "/admin/bank-soal-pg",
      ]);

      newState.asesi = isPathActive([
        "/admin/asesi",
        "/admin/verifikasi-pendaftaran",
        "/admin/asesi/belum-kompeten",
      ]);

      newState.asesor = isPathActive(["/admin/asesor"]);

      return newState;
    });
  }, [location.pathname]);

  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("sidebarScrollPosition");

    if (sidebarContentRef.current && savedScrollPos) {
      sidebarContentRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }
  }, []);

  const isExpanded = isOpen || isHovered || isPinned;

  const handleScroll = (e) => {
    sessionStorage.setItem("sidebarScrollPosition", e.target.scrollTop);
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => {
      const newState = {
        standar: false,
        asesi: false,
        asesor: false,
      };

      newState[key] = !prev[key];

      return newState;
    });
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNav = (path) => {
    navigate(path);

    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("id_user");
    localStorage.removeItem("id_tuk");

    navigate("/login", { replace: true });
  };

  const togglePin = () => {
    setIsPinned((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-[55] lg:hidden w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-lg text-[#071E3D] flex items-center justify-center"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#071E3D]/50 backdrop-blur-sm z-[60] lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] lg:hidden flex flex-col overflow-hidden"
            >
              <SidebarContent
                location={location}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                isActive={isActive}
                handleNav={handleNav}
                handleLogout={() => setShowLogoutModal(true)}
                sidebarContentRef={sidebarContentRef}
                handleScroll={handleScroll}
                isExpanded={true}
                isMobile
                onClose={() => setIsOpen(false)}
                isPinned={false}
                togglePin={() => {}}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white text-[#071E3D] flex-col z-[70] border-r border-slate-100 shadow-[16px_0_40px_-30px_rgba(7,30,61,0.35)] overflow-hidden transition-[width] duration-200 ease-linear ${
          isExpanded ? "w-80" : "w-24"
        }`}
      >
        <SidebarContent
          location={location}
          openMenus={openMenus}
          toggleMenu={toggleMenu}
          isActive={isActive}
          handleNav={handleNav}
          handleLogout={() => setShowLogoutModal(true)}
          sidebarContentRef={sidebarContentRef}
          handleScroll={handleScroll}
          isExpanded={isExpanded}
          isPinned={isPinned}
          togglePin={togglePin}
        />
      </aside>

      <div
        className={`hidden lg:block shrink-0 pointer-events-none transition-[width] duration-200 ease-linear ${
          isExpanded ? "w-80" : "w-24"
        }`}
      />

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#071E3D]/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md bg-white rounded-[30px] border border-slate-100 shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <LogOut size={30} />
              </div>

              <h2 className="text-2xl font-black text-[#071E3D] mb-2">
                Keluar dari Sistem?
              </h2>

              <p className="text-slate-500 font-medium mb-7">
                Apakah Anda yakin ingin logout dari dashboard Admin?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-4 rounded-2xl border border-slate-200 text-[#071E3D] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmLogout}
                  className="px-5 py-4 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarContent = ({
  location,
  openMenus,
  toggleMenu,
  isActive,
  handleNav,
  handleLogout,
  sidebarContentRef,
  handleScroll,
  isExpanded,
  isMobile = false,
  onClose,
  isPinned,
  togglePin,
}) => {
  const parentActive = {
    standar:
      isActive("/admin/unit-kompetensi") ||
      isActive("/admin/skkni") ||
      isActive("/admin/bank-soal") ||
      isActive("/admin/bank-soal-pg"),

    asesi:
      isActive("/admin/asesi") ||
      isActive("/admin/verifikasi-pendaftaran"),

    asesor: isActive("/admin/asesor"),
  };

  return (
    <>
      <style>{`
        .admin-sidebar-scrollbar::-webkit-scrollbar { width: 6px; }
        .admin-sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 999px; }
        .admin-sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background: #F97316; }
      `}</style>

      <div className="h-[120px] border-b border-slate-100 flex items-center shrink-0">
        <button
          type="button"
          onClick={togglePin}
          title={isPinned ? "Buka Kunci Sidebar" : "Kunci Sidebar"}
          className="w-24 h-full flex items-center justify-center shrink-0 cursor-pointer group"
        >
          <div
            className={`relative w-14 h-14 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center text-2xl transition-all duration-300 ${
              isPinned ? "ring-4 ring-orange-500/30 scale-95" : "group-hover:scale-105"
            }`}
          >
            <FaUniversity />
            {isPinned && (
              <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 text-[8px]">
                <FaThumbtack />
              </div>
            )}
          </div>
        </button>

        <div
          className={`overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-xl font-black text-[#071E3D] uppercase truncate max-w-[190px] leading-tight">
            S.I.LSP
          </h1>

          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">
            Dashboard Admin
          </p>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto mr-5 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <nav
        ref={sidebarContentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 admin-sidebar-scrollbar"
      >
        <div className="space-y-1">
          <SectionLabel isExpanded={isExpanded}>Utama</SectionLabel>

          <NavItem
            icon={<FaHome />}
            label="Home / Dashboard"
            active={location.pathname === "/admin/dashboard"}
            onClick={() => handleNav("/admin/dashboard")}
            isExpanded={isExpanded}
          />

          <NavItem
            icon={<FaBullhorn />}
            label="Layanan Pengaduan"
            active={isActive("/admin/pengaduan")}
            onClick={() => handleNav("/admin/pengaduan")}
            isExpanded={isExpanded}
          />

          <NavItem
            icon={<FaGavel />}
            label="Layanan Banding"
            active={isActive("/admin/banding")}
            onClick={() => handleNav("/admin/banding")}
            isExpanded={isExpanded}
          />

          <SectionLabel isExpanded={isExpanded}>Reporting</SectionLabel>

          <NavItem
            icon={<FaChartBar />}
            label="Laporan Sertifikasi"
            active={isActive("/admin/laporan-sertifikasi")}
            onClick={() => handleNav("/admin/laporan-sertifikasi")}
            isExpanded={isExpanded}
          />

          <SectionLabel isExpanded={isExpanded}>Master Data</SectionLabel>

          <NavItem
            icon={<FaBook />}
            label="Dokumen Mutu"
            active={isActive("/admin/dokumen-mutu")}
            onClick={() => handleNav("/admin/dokumen-mutu")}
            isExpanded={isExpanded}
          />

          <DropdownItem
            icon={<FaAward />}
            label="Standar Kompetensi"
            active={parentActive.standar}
            open={openMenus.standar}
            onClick={() => toggleMenu("standar")}
            isExpanded={isExpanded}
          />

          {openMenus.standar && isExpanded && (
            <SubMenu>
              <SubItem
                label="Data SKKNI"
                active={isActive("/admin/skkni")}
                onClick={() => handleNav("/admin/skkni")}
              />

              <SubItem
                label="Unit Kompetensi"
                active={isActive("/admin/unit-kompetensi")}
                onClick={() => handleNav("/admin/unit-kompetensi")}
              />
            </SubMenu>
          )}

          <NavItem
            icon={<FaLayerGroup />}
            label="Skema Sertifikasi"
            active={isActive("/admin/skema")}
            onClick={() => handleNav("/admin/skema")}
            isExpanded={isExpanded}
          />

          <SectionLabel isExpanded={isExpanded}>Operasional</SectionLabel>

          <NavItem
            icon={<FaCalendarAlt />}
            label="Jadwal Uji Kompetensi"
            active={isActive("/admin/jadwal/uji-kompetensi")}
            onClick={() => handleNav("/admin/jadwal/uji-kompetensi")}
            isExpanded={isExpanded}
          />

          <NavItem
            icon={<FaBuilding />}
            label="Tempat Uji Kompetensi"
            active={isActive("/admin/tuk")}
            onClick={() => handleNav("/admin/tuk")}
            isExpanded={isExpanded}
          />

          <DropdownItem
            icon={<FaUserGraduate />}
            label="Data Asesi"
            active={parentActive.asesi}
            open={openMenus.asesi}
            onClick={() => toggleMenu("asesi")}
            isExpanded={isExpanded}
          />

          {openMenus.asesi && isExpanded && (
            <SubMenu>
              <SubItem
                label="Tambah Asesi"
                active={isActive("/admin/asesi/tambah")}
                onClick={() => handleNav("/admin/asesi/tambah")}
              />

              <SubItem
                label="Pendaftar Baru"
                active={isActive("/admin/verifikasi-pendaftaran")}
                onClick={() => handleNav("/admin/verifikasi-pendaftaran")}
              />

              <SubItem
                label="Terjadwal"
                active={isActive("/admin/asesi/terjadwal")}
                onClick={() => handleNav("/admin/asesi/terjadwal")}
              />

              <SubItem
                label="Kompeten"
                active={isActive("/admin/asesi/kompeten")}
                onClick={() => handleNav("/admin/asesi/kompeten")}
              />

              <SubItem
                label="Belum Kompeten"
                active={isActive("/admin/asesi/belum-kompeten")}
                onClick={() => handleNav("/admin/asesi/belum-kompeten")}
              />
            </SubMenu>
          )}

          <DropdownItem
            icon={<FaUserTie />}
            label="Data Asesor"
            active={parentActive.asesor}
            open={openMenus.asesor}
            onClick={() => toggleMenu("asesor")}
            isExpanded={isExpanded}
          />

          {openMenus.asesor && isExpanded && (
            <SubMenu>
              <SubItem
                label="Daftar Asesor"
                active={location.pathname === "/admin/asesor"}
                onClick={() => handleNav("/admin/asesor")}
              />

              <SubItem
                label="Statistik Wilayah"
                active={isActive("/admin/asesor/statistik")}
                onClick={() => handleNav("/admin/asesor/statistik")}
              />
            </SubMenu>
          )}

          <SectionLabel isExpanded={isExpanded}>Sistem & Web</SectionLabel>

          <NavItem
            icon={<FaCommentDots />}
            label="Notifikasi"
            active={isActive("/admin/notifikasi")}
            onClick={() => handleNav("/admin/notifikasi")}
            isExpanded={isExpanded}
          />

          <SectionLabel isExpanded={isExpanded}>Keuangan & Admin</SectionLabel>

          <NavItem
            icon={<FaEye />}
            label="Surveillance"
            active={isActive("/admin/surveillance")}
            onClick={() => handleNav("/admin/surveillance")}
            isExpanded={isExpanded}
          />
        </div>
      </nav>

      <div className="h-28 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center">
        <div className="w-24 h-full flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            title={!isExpanded ? "Keluar" : ""}
            className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm flex items-center justify-center transition-colors duration-150"
          >
            <FaSignOutAlt className="text-lg" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`h-14 flex-1 mr-5 rounded-2xl flex items-center justify-between overflow-hidden text-red-500 transition-opacity duration-150 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-sm font-black whitespace-nowrap">Keluar</span>
          {/* Panah dihilangkan karena tidak ada anakan */}
        </button>
      </div>
    </>
  );
};

function SectionLabel({ children, isExpanded }) {
  return (
    <div
      className={`px-8 pt-5 pb-2 overflow-hidden transition-opacity duration-150 ${
        isExpanded ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {children}
      </p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isExpanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpanded ? label : ""}
      className="group w-full min-h-16 flex items-center"
    >
      <div className="w-24 h-16 flex items-center justify-center shrink-0">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-150 text-[20px] ${
            active
              ? "bg-orange-50 border border-orange-100 text-orange-500"
              : "text-[#071E3D]/80 group-hover:bg-slate-50 group-hover:text-orange-500"
          }`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`min-h-16 flex-1 pr-5 flex items-center justify-between gap-3 overflow-hidden transition-opacity duration-150 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          className={`text-[14px] text-left leading-snug ${
            active ? "font-black text-orange-500" : "font-medium text-slate-600"
          }`}
        >
          {label}
        </span>
        {/* Panah dihilangkan karena bukan menu anakan */}
      </div>
    </button>
  );
}

function DropdownItem({
  icon,
  label,
  active,
  open,
  onClick,
  isExpanded,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpanded ? label : ""}
      className="group w-full min-h-16 flex items-center"
    >
      <div className="w-24 h-16 flex items-center justify-center shrink-0">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-150 text-[20px] ${
            active
              ? "bg-orange-50 border border-orange-100 text-orange-500"
              : "text-[#071E3D]/80 group-hover:bg-slate-50 group-hover:text-orange-500"
          }`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`min-h-16 flex-1 pr-5 flex items-center justify-between gap-3 overflow-hidden transition-opacity duration-150 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          className={`text-[14px] text-left leading-snug ${
            active ? "font-black text-orange-500" : "font-medium text-slate-600"
          }`}
        >
          {label}
        </span>

        {/* Panah tetap ada karena ini menu dropdown (punya anakan) */}
        {open ? (
          <FaChevronDown
            className={`text-xs shrink-0 ${
              active ? "text-orange-500" : "text-slate-300"
            }`}
          />
        ) : (
          <FaChevronRight
            className={`text-xs shrink-0 ${
              active ? "text-orange-500" : "text-slate-300 group-hover:text-orange-500"
            }`}
          />
        )}
      </div>
    </button>
  );
}

function SubMenu({ children }) {
  return <div className="ml-24 mr-5 mb-2 space-y-1">{children}</div>;
}

function SubItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full min-h-11 rounded-2xl flex items-center gap-3 px-4 text-left transition-all duration-150 ${
        active
          ? "bg-orange-50 border border-orange-100 text-orange-500"
          : "bg-slate-50/70 border border-transparent text-slate-500 hover:bg-white hover:border-orange-100 hover:text-orange-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          active ? "bg-orange-500" : "bg-slate-300 group-hover:bg-orange-500"
        }`}
      />

      <span
        className={`text-xs leading-snug ${
          active ? "font-black" : "font-semibold"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default Sidebar;