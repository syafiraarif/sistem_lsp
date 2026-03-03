// frontend/src/components/sidebar/SidebarAsesi.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  BookOpen, 
  ClipboardList, 
  CreditCard, 
  Key, 
  Menu, 
  LogOut 
} from 'lucide-react';

const SidebarAsesi = ({ isOpen, setIsOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  const isExpanded = isOpen || isHovered;

  const menus = [
    { id: 'home', name: 'Home', path: '/asesi', icon: <Home size={20} /> },
    { id: 'profile', name: 'Profile Anda', path: '/asesi/profile', icon: <User size={20} /> },
    { id: 'skema', name: 'Lihat Skema Sertifikasi', path: '/asesi/skema', icon: <BookOpen size={20} /> },
    { id: 'asesmen', name: 'Asesmen Anda', path: '/asesi/asesmen', icon: <ClipboardList size={20} /> },
    { id: 'pembayaran', name: 'Konfirmasi Pembayaran', path: '/asesi/pembayaran', icon: <CreditCard size={20} /> },
    { id: 'ubah-password', name: 'Ubah Password', path: '/asesi/ubah-password', icon: <Key size={20} /> },
  ];

  const isActive = (path) => {
    if (path === '/asesi') {
      return location.pathname === '/asesi';
    }
    return location.pathname.startsWith(path);
  };

  const handleClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  /* =========================
     🔐 HANDLE LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("id_user");

    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Overlay Mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Sidebar */}
      <div 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
        className={`fixed left-0 top-0 h-screen bg-[#071E3D] text-white flex flex-col z-[70] border-r border-white/10 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-4 border-b border-white/10 overflow-hidden shrink-0">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`p-2 rounded-lg hover:bg-white/10 text-orange-500 ${!isExpanded ? 'mx-auto' : ''}`}
          >
            <Menu size={24} />
          </button>

          <div className={`ml-4 transition-all ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <h1 className="text-lg font-black text-orange-500 uppercase">
              {userData?.nama || "ASESI PORTAL"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-white/90 uppercase">
                {userData?.username || "Peserta"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'bg-orange-500 text-[#071E3D] font-bold shadow-lg shadow-orange-500/20' 
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <div className="min-w-[32px] flex justify-center shrink-0">
                {item.icon}
              </div>
              <span className={`ml-3 text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
          >
            <div className="min-w-[32px] flex justify-center shrink-0">
              <LogOut size={20} />
            </div>
            <span className={`ml-3 text-sm font-bold ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className={`hidden lg:block transition-all duration-300 shrink-0 pointer-events-none ${isExpanded ? 'w-64' : 'w-20'}`} />
    </>
  );
};

export default SidebarAsesi;