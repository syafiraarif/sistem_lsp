// frontend/src/components/sidebar/SidebarAsesi.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Home,
  User,
  BookOpen,
  ClipboardList,
  Key,
  Menu,
  LogOut,
  X,
  AlertTriangle,
  Pin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SidebarAsesi = ({ isOpen = false, setIsOpen = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem("sidebarAsesiPinned") === "true";
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarAsesiPinned", isPinned);
  }, [isPinned]);

  useEffect(() => {
    const loadProfileName = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/asesi/profile");
        const profileData = res.data?.data || null;
        setProfile(profileData);
      } catch (error) {
        console.error("Gagal mengambil nama profile asesi:", error);
      }
    };
    loadProfileName();
  }, []);

  const isExpanded = isOpen || isHovered || isPinned;
  const displayName = profile?.nama_lengkap || "Asesi";
  const displayNik = profile?.nik || profile?.no_ktp || "-";

  const menus = useMemo(
    () => [
      {
        id: "home",
        name: "Home",
        path: "/asesi",
        icon: <Home size={21} />,
      },
      {
        id: "profile",
        name: "Profile",
        path: "/asesi/profile",
        icon: <User size={21} />,
      },
      {
        id: "skema",
        name: "Skema Sertifikasi",
        path: "/asesi/jadwal",
        icon: <BookOpen size={21} />,
      },
      {
        id: "asesmen",
        name: "Asesmen",
        path: "/asesi/jadwal-saya",
        icon: <ClipboardList size={21} />,
      },
      {
        id: "banding",
        name: "Banding",
        path: "/asesi/banding",
        icon: <AlertTriangle size={21} />,
      },
      {
        id: "ubah-password",
        name: "Ubah Password",
        path: "/asesi/ubah-password",
        icon: <Key size={21} />,
      },
    ],
    []
  );

  const isActive = (path) => {
    const currentPath = location.pathname;
    if (path === "/asesi") {
      return currentPath === "/asesi" || currentPath === "/asesi/dashboard";
    }
    if (path === "/asesi/profile") {
      return currentPath === "/asesi/profile" || currentPath.startsWith("/asesi/profile/");
    }
    if (path === "/asesi/jadwal") {
      return currentPath === "/asesi/jadwal" || currentPath.startsWith("/asesi/jadwal/") || currentPath.startsWith("/asesi/pembayaran/");
    }
    if (path === "/asesi/jadwal-saya") {
      return (
        currentPath === "/asesi/jadwal-saya" ||
        currentPath.startsWith("/asesi/jadwal-saya/") ||
        currentPath.startsWith("/asesi/apl01/") ||
        currentPath.startsWith("/asesi/apl02/") ||
        currentPath.startsWith("/asesi/pra-asesmen/") ||
        currentPath.startsWith("/asesi/hasil-saya/")
      );
    }
    if (path === "/asesi/banding") {
      return currentPath === "/asesi/banding" || currentPath.startsWith("/asesi/banding/");
    }
    if (path === "/asesi/ubah-password") {
      return currentPath === "/asesi/ubah-password" || currentPath.startsWith("/asesi/ubah-password/");
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
    localStorage.removeItem("id_peserta");
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
        className="fixed left-5 top-5 z-[55] flex h-11 w-11 items-center justify-center rounded-xl border border-[#071E3D]/10 bg-white text-[#071E3D] shadow-sm transition-all hover:bg-slate-50 lg:hidden"
        aria-label="Buka sidebar"
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
              className="fixed inset-0 z-[60] bg-[#071E3D]/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-80 flex-col overflow-hidden border-r border-[#071E3D]/10 bg-white shadow-2xl lg:hidden"
            >
              <SidebarContent
                menus={menus}
                isActive={isActive}
                handleClick={handleClick}
                handleLogout={() => setShowLogoutModal(true)}
                displayName={displayName}
                displayNik={displayNik}
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
        className={`fixed left-0 top-0 z-[70] hidden h-screen flex-col overflow-hidden border-r border-[#071E3D]/10 bg-white text-[#071E3D] shadow-[16px_0_40px_-30px_rgba(7,30,61,0.35)] transition-[width] duration-200 ease-linear lg:flex ${
          isExpanded ? "w-80" : "w-24"
        }`}
      >
        <SidebarContent
          menus={menus}
          isActive={isActive}
          handleClick={handleClick}
          handleLogout={() => setShowLogoutModal(true)}
          displayName={displayName}
          displayNik={displayNik}
          isExpanded={isExpanded}
          isPinned={isPinned}
          togglePin={togglePin}
        />
      </aside>

      <div
        className={`hidden shrink-0 pointer-events-none transition-[width] duration-200 ease-linear lg:block ${
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm rounded-xl border border-[#071E3D]/10 bg-white p-8 text-center shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <LogOut size={26} />
              </div>
              <h2 className="mb-2 text-xl font-black text-[#071E3D]">
                Keluar dari Sistem?
              </h2>
              <p className="mb-7 text-sm font-medium text-[#182D4A]/70">
                Apakah Anda yakin ingin logout dari dashboard Asesi?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#071E3D] transition-all hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white transition-all hover:bg-red-700"
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
  displayNik,
  isExpanded,
  onClose,
  isPinned,
  togglePin,
  isMobile = false,
}) => {
  const initialName = displayName?.charAt(0)?.toUpperCase() || "A";
  
  return (
    <>
      <div className="h-[120px] shrink-0 border-b border-[#071E3D]/10">
        <div className="flex h-full items-center">
          <button
            type="button"
            onClick={togglePin}
            title={isPinned ? "Buka Kunci Sidebar" : "Kunci Sidebar"}
            className="group flex h-full w-24 shrink-0 cursor-pointer items-center justify-center"
          >
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#071E3D] text-xl font-black text-white transition-all duration-300 ${
                isPinned ? "scale-95 ring-2 ring-[#CC6B27]/40" : "group-hover:scale-105"
              }`}
            >
              {initialName}
              {isPinned && (
                <div className="absolute -right-1.5 -top-1.5 rounded-full bg-[#CC6B27] p-1 text-white">
                  <Pin size={10} className="fill-current" />
                </div>
              )}
            </div>
          </button>
          
          <div
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <h1 className="max-w-[190px] truncate text-xl font-black uppercase leading-tight text-[#071E3D]">
              {displayName}
            </h1>
            <p className="mt-1 max-w-[190px] truncate text-[10px] font-black uppercase tracking-wider text-[#CC6B27]">
              {displayNik}
            </p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#182D4A]/50">
              Dashboard Asesi
            </p>
          </div>
          
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto mr-5 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>
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
                className="group flex min-h-14 w-full items-center"
              >
                <div className="flex h-14 w-24 shrink-0 items-center justify-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-[18px] transition-colors duration-150 ${
                      active
                        ? "border border-[#CC6B27]/20 bg-[#CC6B27]/10 text-[#CC6B27]"
                        : "text-[#182D4A]/60 group-hover:bg-[#CC6B27]/5 group-hover:text-[#CC6B27]"
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>
                <div
                  className={`flex min-h-14 flex-1 items-center overflow-hidden pr-5 transition-opacity duration-150 ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span
                    className={`text-left text-[13px] leading-snug ${
                      active
                        ? "font-bold text-[#CC6B27]"
                        : "font-semibold text-[#182D4A]"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="flex h-24 shrink-0 items-center border-t border-[#071E3D]/10 bg-[#FAFAFA]">
        <div className="flex h-full w-24 shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={handleLogout}
            title={!isExpanded ? "Keluar" : ""}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition-colors duration-150 hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={19} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`mr-5 flex h-12 flex-1 items-center overflow-hidden rounded-lg text-red-500 transition-opacity duration-150 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="whitespace-nowrap text-[13px] font-bold">
            Keluar dari Sistem
          </span>
        </button>
      </div>
    </>
  );
};

export default SidebarAsesi;