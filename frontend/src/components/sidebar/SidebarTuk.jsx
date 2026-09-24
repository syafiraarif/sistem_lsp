// frontend/src/components/sidebar/SidebarTuk.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUser,
  FaKey,
  FaBuilding,
  FaSignOutAlt,
  FaThumbtack,
} from "react-icons/fa";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarTUK = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarContentRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem("sidebarTukPinned") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarTukPinned", isPinned);
  }, [isPinned]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
  }, []);

  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("sidebarTukScrollPosition");
    if (sidebarContentRef.current && savedScrollPos) {
      sidebarContentRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }
  }, []);

  const isExpanded = isOpen || isHovered || isPinned;
  
  const displayName =
    userData?.nama_tuk ||
    userData?.username ||
    userData?.nama ||
    "TUK Portal";

  const handleScroll = (e) => {
    sessionStorage.setItem("sidebarTukScrollPosition", e.target.scrollTop);
  };

  const isActive = (path) => {
    if (path === "/tuk") return location.pathname === "/tuk";
    return location.pathname.startsWith(path);
  };

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
    localStorage.removeItem("id_tuk");
    navigate("/login", { replace: true });
  };

  const togglePin = () => {
    setIsPinned((prev) => !prev);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 z-[55] lg:hidden w-11 h-11 rounded-xl bg-white border border-[#071E3D]/10 shadow-sm text-[#071E3D] flex items-center justify-center transition-all hover:bg-slate-50"
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
                displayName={displayName}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white text-[#071E3D] flex-col z-[70] border-r border-[#071E3D]/10 overflow-hidden transition-[width] duration-200 ease-linear ${
          isExpanded ? "w-80" : "w-24"
        }`}
      >
        <SidebarContent
          location={location}
          isActive={isActive}
          handleNav={handleNav}
          handleLogout={() => setShowLogoutModal(true)}
          sidebarContentRef={sidebarContentRef}
          handleScroll={handleScroll}
          isExpanded={isExpanded}
          isPinned={isPinned}
          togglePin={togglePin}
          displayName={displayName}
        />
      </aside>
      
      {/* Spacer for layout */}
      <div
        className={`hidden lg:block shrink-0 pointer-events-none transition-[width] duration-200 ease-linear ${
          isExpanded ? "w-80" : "w-24"
        }`}
      />

      {/* Logout Modal */}
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
              className="w-full max-w-sm bg-white rounded-xl border border-[#071E3D]/10 shadow-xl p-8 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <LogOut size={26} />
              </div>
              <h2 className="text-xl font-black text-[#071E3D] mb-2">
                Keluar dari Akun?
              </h2>
              <p className="text-[#182D4A]/70 text-sm font-medium mb-7">
                Apakah Anda yakin ingin logout dari dashboard TUK?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] text-[#071E3D] font-bold text-[12px] uppercase tracking-wider hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold text-[12px] uppercase tracking-wider hover:bg-red-700 transition-all"
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
  displayName,
}) => {
  return (
    <>
      {/* HEADER LOGO */}
      <div className="h-[100px] border-b border-[#071E3D]/10 flex items-center shrink-0">
        <button
          type="button"
          onClick={togglePin}
          title={isPinned ? "Buka Kunci Sidebar" : "Kunci Sidebar"}
          className="w-24 h-full flex items-center justify-center shrink-0 cursor-pointer group"
        >
          <div
            className={`relative w-12 h-12 rounded-xl bg-[#071E3D] text-white flex items-center justify-center text-xl transition-all duration-300 ${
              isPinned ? "ring-2 ring-[#CC6B27]/40 scale-95" : "group-hover:scale-105"
            }`}
          >
            <FaBuilding />
            {isPinned && (
              <div className="absolute -top-1.5 -right-1.5 bg-[#CC6B27] rounded-full p-1 text-[8px]">
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
            {displayName}
          </h1>
          <p className="text-[10px] font-black text-[#CC6B27] uppercase tracking-widest mt-0.5">
            Dashboard TUK
          </p>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto mr-5 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* NAVIGATION MENUS */}
      <nav
        ref={sidebarContentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden py-4"
      >
        <div className="space-y-1">
          <NavItem
            icon={<FaHome />}
            label="Home / Dashboard"
            active={isActive("/tuk") && location.pathname === "/tuk"}
            onClick={() => handleNav("/tuk")}
            isExpanded={isExpanded}
          />
          <NavItem
            icon={<FaCalendarAlt />}
            label="Jadwal Uji Kompetensi"
            active={isActive("/tuk/jadwal")}
            onClick={() => handleNav("/tuk/jadwal")}
            isExpanded={isExpanded}
          />
          <NavItem
            icon={<FaUser />}
            label="Profile TUK"
            active={isActive("/tuk/profile")}
            onClick={() => handleNav("/tuk/profile")}
            isExpanded={isExpanded}
          />
          <NavItem
            icon={<FaKey />}
            label="Lupa Password"
            active={isActive("/tuk/lupa-password")}
            onClick={() => handleNav("/tuk/lupa-password")}
            isExpanded={isExpanded}
          />
        </div>
      </nav>

      {/* FOOTER LOGOUT */}
      <div className="h-24 border-t border-[#071E3D]/10 bg-[#FAFAFA] shrink-0 flex items-center">
        <div className="w-24 h-full flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            title={!isExpanded ? "Keluar" : ""}
            className="w-12 h-12 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm flex items-center justify-center transition-colors duration-150"
          >
            <FaSignOutAlt className="text-[18px]" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`h-12 flex-1 mr-5 rounded-lg flex items-center text-red-500 hover:text-red-600 transition-opacity duration-150 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-[13px] font-bold whitespace-nowrap">
            Keluar dari Akun
          </span>
        </button>
      </div>
    </>
  );
};

/* --- SUB COMPONENTS --- */
function NavItem({ icon, label, active, onClick, isExpanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpanded ? label : ""}
      className="group w-full min-h-14 flex items-center"
    >
      <div className="w-24 h-14 flex items-center justify-center shrink-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-150 text-[18px] ${
            active
              ? "bg-[#CC6B27]/10 border border-[#CC6B27]/20 text-[#CC6B27]"
              : "text-[#182D4A]/60 group-hover:bg-[#CC6B27]/5 group-hover:text-[#CC6B27]"
          }`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`min-h-14 flex-1 pr-5 flex items-center justify-between gap-3 overflow-hidden transition-opacity duration-150 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          className={`text-[13px] text-left leading-snug ${
            active ? "font-bold text-[#CC6B27]" : "font-semibold text-[#182D4A]"
          }`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

export default SidebarTUK;