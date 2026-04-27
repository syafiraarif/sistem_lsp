// frontend/src/components/sidebar/SidebarAsesi.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  BookOpen,
  ClipboardList,
  Key,
  Menu,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarAsesi = ({ isOpen, setIsOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  const isExpanded = isOpen || isHovered;

  const displayName =
    userData?.nama || userData?.username || "Asesi";

  const menus = [
    { name: "Home", path: "/asesi", icon: <Home size={21} /> },
    { name: "Profile Anda", path: "/asesi/profile", icon: <User size={21} /> },
    { name: "Skema Sertifikasi", path: "/asesi/jadwal", icon: <BookOpen size={21} /> },
    { name: "Asesmen Anda", path: "/asesi/jadwal-saya", icon: <ClipboardList size={21} /> },
    { name: "Ubah Password", path: "/asesi/ubah-password", icon: <Key size={21} /> },
  ];

  const isActive = (path) => {
    if (path === "/asesi") return location.pathname === "/asesi";
    return location.pathname.startsWith(path);
  };

  const handleClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-[55] lg:hidden w-11 h-11 rounded-2xl bg-white border shadow text-[#071E3D] flex items-center justify-center"
      >
        <Menu size={22} />
      </button>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#071E3D]/50 backdrop-blur-sm z-[60]"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70]"
            >
              <SidebarContent
                menus={menus}
                isActive={isActive}
                handleClick={handleClick}
                displayName={displayName}
                isExpanded={true}
                onClose={() => setIsOpen(false)}
                handleLogout={() => setShowLogoutModal(true)}
                isMobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white flex-col z-[70] border-r transition-all duration-200 ${
          isExpanded ? "w-72" : "w-24"
        }`}
      >
        <SidebarContent
          menus={menus}
          isActive={isActive}
          handleClick={handleClick}
          displayName={displayName}
          isExpanded={isExpanded}
          handleLogout={() => setShowLogoutModal(true)}
        />
      </aside>

      <div className={`hidden lg:block ${isExpanded ? "w-72" : "w-24"}`} />

      {/* MODAL LOGOUT */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center"
          >
            <div className="bg-white p-8 rounded-3xl text-center w-full max-w-sm">
              <LogOut size={32} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Yakin logout?</h2>
              <p className="text-gray-500 mb-6">
                Kamu akan keluar dari akun ini
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 border p-3 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-500 text-white p-3 rounded-xl"
                >
                  Keluar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ================= CONTENT ================= */
const SidebarContent = ({
  menus,
  isActive,
  handleClick,
  displayName,
  isExpanded,
  onClose,
  handleLogout,
  isMobile = false,
}) => {
  return (
    <>
      {/* HEADER */}
      <div className="h-[110px] flex items-center border-b">
        <div className="w-24 flex justify-center">
          <div className="w-14 h-14 bg-[#071E3D] text-white rounded-2xl flex items-center justify-center font-bold text-xl">
            {displayName.charAt(0)}
          </div>
        </div>

        <div className={`${isExpanded ? "opacity-100" : "opacity-0"}`}>
          <h1 className="font-bold text-[#071E3D]">{displayName}</h1>
          <p className="text-xs text-orange-500">Dashboard Asesi</p>
        </div>

        {isMobile && (
          <button onClick={onClose} className="ml-auto mr-4">
            <X />
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 py-4">
        {menus.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.name}
              onClick={() => handleClick(item.path)}
              className="w-full h-16 flex items-center"
            >
              <div className="w-24 flex justify-center">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl ${
                    active ? "bg-orange-100 text-orange-500" : "text-gray-600"
                  }`}
                >
                  {item.icon}
                </div>
              </div>

              <div className={`${isExpanded ? "opacity-100" : "opacity-0"} flex-1 flex justify-between pr-4`}>
                <span>{item.name}</span>
                <ChevronRight size={16} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="h-24 flex items-center border-t">
        <div className="w-24 flex justify-center">
          <button
            onClick={handleLogout}
            className="w-14 h-14 rounded-2xl bg-red-100 text-red-500"
          >
            <LogOut />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className={`${isExpanded ? "opacity-100" : "opacity-0"} flex-1 text-red-500`}
        >
          Keluar
        </button>
      </div>
    </>
  );
};

export default SidebarAsesi;