// frontend/src/pages/asesi/HomeAsesi.jsx

import React, { useState, useEffect } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import { Menu, User, BookOpen, ClipboardList, CreditCard } from "lucide-react";

const HomeAsesi = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-lg font-bold text-gray-700">
            Dashboard Asesi
          </h1>

          <div className="text-sm font-semibold text-gray-600">
            {userData?.nama || "Peserta"}
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Selamat Datang, {userData?.nama || "Asesi"} 👋
            </h2>
            <p className="text-sm opacity-90">
              Silakan kelola data sertifikasi dan asesmen Anda melalui dashboard ini.
            </p>
          </div>

          {/* Statistik / Menu Cepat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <User className="text-blue-600" size={28} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-700">
                Profile Anda
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Lihat dan edit data pribadi Anda
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
              <BookOpen className="text-green-600" size={28} />
              <h3 className="mt-4 font-semibold text-gray-700">
                Skema Sertifikasi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Lihat daftar skema yang tersedia
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
              <ClipboardList className="text-purple-600" size={28} />
              <h3 className="mt-4 font-semibold text-gray-700">
                Asesmen Anda
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pantau status asesmen Anda
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
              <CreditCard className="text-red-600" size={28} />
              <h3 className="mt-4 font-semibold text-gray-700">
                Konfirmasi Pembayaran
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload bukti pembayaran Anda
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeAsesi;