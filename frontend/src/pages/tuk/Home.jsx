import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Users, Bell, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarTUK from '../../components/sidebar/SidebarTuk'; // Sesuaikan path import

const HomeTUK = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Ambil data user dari localStorage (disimpan saat login)
  const [user, setUser] = useState({ nama: "Admin TUK" });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Sesuaikan dengan struktur data API login Anda
        setUser({ 
          nama: parsedUser.nama || parsedUser.name || "Admin TUK",
          email: parsedUser.email 
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  // Contoh statistik
  const stats = [
    { label: 'Total Jadwal', value: '12', icon: <Calendar className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Peserta Terdaftar', value: '156', icon: <Users className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Jadwal Aktif', value: '3', icon: <Clock className="text-yellow-500" />, color: 'bg-yellow-50' },
    { label: 'Selesai', value: '9', icon: <CheckCircle className="text-purple-500" />, color: 'bg-purple-50' },
  ];

  // Contoh pengumuman
  const announcements = [
    { title: 'Penting: Pembaruan Sistem Jadwal', date: '20 Jan 2025', desc: 'Sistem jadwal TUK akan undergo maintenance pada hari Minggu.' },
    { title: 'Reminder: Kelengkapan Data Profil', date: '18 Jan 2025', desc: 'Pastikan data profil TUK Anda sudah lengkap dan valid.' },
    { title: 'Jadwal Uji Kompetensi Bulan Februari', date: '15 Jan 2025', desc: 'Pendaftaran gelombang baru telah dibuka.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarTUK 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onLogout={handleLogout}
        user={user}
      />

      {/* Konten Utama */}
      <div className="flex-1 ml-0 lg:ml-20 transition-all duration-300 p-4 lg:p-8">
        
        {/* Judul Halaman */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard TUK</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas dan informasi terbaru</p>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Cepat & Pengumuman */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Menu Cepat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Menu Cepat</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/tuk/jadwal')}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 group"
              >
                <Calendar size={32} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-blue-700">Kelola Jadwal</span>
              </button>
              <button 
                onClick={() => navigate('/tuk/lupa-password')}
                className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200 group"
              >
                <FileText size={32} className="text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-red-700">Lupa Password</span>
              </button>
            </div>
          </div>

          {/* Pengumuman */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Pengumuman</h2>
              <Bell size={20} className="text-gray-400" />
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {announcements.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 bg-green-500 rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.desc}</p>
                      <span className="text-gray-400 text-[10px] mt-2 block">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeTUK;