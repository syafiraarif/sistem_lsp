// frontend/src/pages/asesi/HomeAsesi.jsx

import React, { useState, useEffect } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  User,
  BookOpen,
  ClipboardList,
  CreditCard
} from "lucide-react";

const HomeAsesi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">

      {/* SIDEBAR */}
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* CONTENT */}
      <div className="flex-1 lg:ml-24 p-6 lg:p-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D]">
            Dashboard Asesi
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola sertifikasi dan asesmen Anda dengan mudah
          </p>
        </div>

        {/* HERO CARD */}
        <div className="relative mb-10 rounded-[32px] overflow-hidden bg-gradient-to-r from-[#071E3D] to-blue-600 text-white p-8 shadow-2xl">

          <div className="absolute right-0 top-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

          <h2 className="text-2xl lg:text-3xl font-black mb-2">
            Selamat Datang, {userData?.nama || "Asesi"} 👋
          </h2>

          <p className="text-white/80 text-sm max-w-lg">
            Akses semua fitur sertifikasi Anda dalam satu dashboard modern dan terintegrasi.
          </p>

        </div>

        {/* MENU CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <Card
            icon={<User />}
            title="Profile Anda"
            desc="Kelola dan perbarui data pribadi Anda"
            color="blue"
          />

          <Card
            icon={<BookOpen />}
            title="Skema Sertifikasi"
            desc="Lihat dan pilih skema yang tersedia"
            color="green"
          />

          <Card
            icon={<ClipboardList />}
            title="Asesmen Anda"
            desc="Pantau progres asesmen Anda"
            color="purple"
          />

          <Card
            icon={<CreditCard />}
            title="Pembayaran"
            desc="Upload bukti pembayaran sertifikasi"
            color="red"
          />

        </div>

      </div>
    </div>
  );
};

/* ================= COMPONENT CARD ================= */

const Card = ({ icon, title, desc, color }) => {

  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colorMap[color]}`}>
        {icon}
      </div>

      <h3 className="font-black text-[#071E3D] text-lg mb-1">
        {title}
      </h3>

      <p className="text-sm text-slate-500">
        {desc}
      </p>

    </div>
  );
};

export default HomeAsesi;