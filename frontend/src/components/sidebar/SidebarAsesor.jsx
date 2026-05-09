// frontend/src/components/sidebar/SidebarAsesor.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  CalendarDays,
  ShieldCheck,
  ClipboardCheck,
  FileSearch,
  Key,
  Menu,
  LogOut,
  X,
  Pin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarAsesor = ({ isOpen, setIsOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem("sidebarAsesorPinned") === "true";
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarAsesorPinned", isPinned);
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

  const isExpanded = isOpen || isHovered || isPinned;

  const displayName =
    userData?.nama ||
    userData?.nama_lengkap ||
    userData?.username ||
    userData?.name ||
    "Asesor";

  const menus = useMemo(
    () => [
      {
        id: "home",
        name: "Home",
        path: "/asesor",
        icon: <Home size={21} />,
      },
      {
        id: "profile",
        name: "Profile",
        path: "/asesor/profile",
        icon: <User size={21} />,
      },
      {
        id: "jadwal-uji-kompetensi",
        name: "Jadwal Uji Kompetensi",
        path: "/asesor/jadwal-saya",
        icon: <CalendarDays size={21} />,
      },
      {
        id: "jadwal-verifikasi-tuk",
        name: "Jadwal Verifikasi TUK",
        path: "/asesor/verifikasi-tuk",
        icon: <ShieldCheck size={21} />,
      },
      {
        id: "jadwal-komite-teknis",
        name: "Jadwal Komite Teknis",
        path: "/asesor/komite-teknis",
        icon: <FileSearch size={21} />,
      },
      {
        id: "jadwal-mkva",
        name: "Jadwal MKVA",
        path: "/asesor/mkva",
        icon: <ClipboardCheck size={21} />,
      },
      {
        id: "ubah-sandi",
        name: "Ubah Sandi",
        path: "/asesor/ubah-password",
        icon: <Key size={21} />,
      },
    ],
    []
  );

  const isActive = (path) => {
    const currentPath = location.pathname;

    if (path === "/asesor") {
      return currentPath === "/asesor" || currentPath === "/asesor/dashboard";
    }

    if (path === "/asesor/jadwal-saya") {
      return (
        currentPath === "/asesor/jadwal-saya" ||
        currentPath.startsWith("/asesor/jadwal-saya/")
      );
    }

    if (path === "/asesor/verifikasi-tuk") {
      return (
        currentPath === "/asesor/verifikasi-tuk" ||
        currentPath.startsWith("/asesor/verifikasi-tuk/")
      );
    }

    if (path === "/asesor/komite-teknis") {
      return (
        currentPath === "/asesor/komite-teknis" ||
        currentPath.startsWith("/asesor/komite-teknis/")
      );
    }

    if (path === "/asesor/mkva") {
      return (
        currentPath === "/asesor/mkva" ||
        currentPath.startsWith("/asesor/mkva/")
      );
    }

    if (path === "/asesor/ubah-password") {
      return (
        currentPath === "/asesor/ubah-password" ||
        currentPath.startsWith("/asesor/ubah-password/")
      );
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleClick = (path) => {
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
                menus={menus}
                isActive={isActive}
                handleClick={handleClick}
                handleLogout={() => setShowLogoutModal(true)}
                displayName={displayName}
                isExpanded={true}
                onClose={() => setIsOpen(false)}
                isPinned={false}
                togglePin={() => {}}
                isMobile
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
          menus={menus}
          isActive={isActive}
          handleClick={handleClick}
          handleLogout={() => setShowLogoutModal(true)}
          displayName={displayName}
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
                Keluar dari Akun?
              </h2>

              <p className="text-slate-500 font-medium mb-7">
                Apakah Anda yakin ingin logout dari dashboard Asesor?
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
  menus,
  isActive,
  handleClick,
  handleLogout,
  displayName,
  isExpanded,
  onClose,
  isPinned,
  togglePin,
  isMobile = false,
}) => {
  const initialName = displayName?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      <div className="h-[120px] border-b border-slate-100 flex items-center shrink-0">
        <button
          type="button"
          onClick={togglePin}
          title={isPinned ? "Buka Kunci Sidebar" : "Kunci Sidebar"}
          className="w-24 h-full flex items-center justify-center shrink-0 cursor-pointer group"
        >
          <div
            className={`relative w-14 h-14 rounded-2xl bg-[#071E3D] text-white flex items-center justify-center font-black text-xl transition-all duration-300 ${
              isPinned ? "ring-4 ring-orange-500/30 scale-95" : "group-hover:scale-105"
            }`}
          >
            {initialName}
            {isPinned && (
              <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 text-white">
                <Pin size={10} className="fill-current" />
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

          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">
            Dashboard Asesor
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

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {menus.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item.path)}
                title={!isExpanded ? item.name : ""}
                className="group w-full min-h-16 flex items-center"
              >
                <div className="w-24 h-16 flex items-center justify-center shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-150 ${
                      active
                        ? "bg-orange-50 border border-orange-100 text-orange-500"
                        : "text-[#071E3D]/80 group-hover:bg-slate-50 group-hover:text-orange-500"
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>

                <div
                  className={`min-h-16 flex-1 pr-5 flex items-center justify-between gap-3 overflow-hidden transition-opacity duration-150 ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span
                    className={`text-[14px] text-left leading-snug ${
                      active
                        ? "font-black text-orange-500"
                        : "font-medium text-slate-600"
                    }`}
                  >
                    {item.name}
                  </span>
                  {/* Panah dihilangkan karena tidak ada anakan */}
                </div>
              </button>
            );
          })}
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
            <LogOut size={20} />
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

export default SidebarAsesor;