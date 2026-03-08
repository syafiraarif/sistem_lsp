import React from 'react';
import {
  FaLayerGroup,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaEllipsisV,
  FaCalendarAlt
} from "react-icons/fa";

const AdminDashboard = () => {
  const currentYear = new Date().getFullYear();

  const stats = [
    { label: "Total Skema", value: "12", icon: <FaLayerGroup />, color: "text-[#CC6B27]", bg: "bg-[#CC6B27]/10" },
    { label: "Total Asesor", value: "45", icon: <FaUserTie />, color: "text-[#182D4A]", bg: "bg-[#182D4A]/10" },
    { label: "Total Asesi", value: "1,250", icon: <FaUsers />, color: "text-green-600", bg: "bg-green-100" },
    { label: "Data TUK", value: "8", icon: <FaBuilding />, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const recentRegistrations = [
    { name: "Budi Santoso", schema: "Pemrograman Web", date: "16 Feb 2026", status: "Menunggu" },
    { name: "Siti Aminah", schema: "Desain Grafis", date: "16 Feb 2026", status: "Verifikasi" },
    { name: "Andi Saputra", schema: "Jaringan Komputer", date: "15 Feb 2026", status: "Diterima" },
    { name: "Dewi Lestari", schema: "Digital Marketing", date: "15 Feb 2026", status: "Ditolak" },
    { name: "Rizky Pratama", schema: "Pemrograman Web", date: "14 Feb 2026", status: "Diterima" },
  ];

  return (
    /* Container Utama dengan padding (p-6) agar tidak dempet dengan sidebar/navbar */
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* 1. STATS CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-[#071E3D]/10 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#071E3D] leading-none mb-1">{item.value}</h3>
              <p className="text-[13px] text-[#182D4A] m-0">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. CHARTS GRID (Tetap bersampingan: Kiri Bar Chart, Kanan Pie Chart) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bar Chart - Kiri (Porsi 2/3) */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 border border-[#071E3D]/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-[#071E3D] text-[16px] m-0">Pendaftar dan Kandidat Tahun {currentYear}</h4>
            <button className="text-[#CC6B27] hover:text-[#071E3D]"><FaEllipsisV /></button>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Web Dev', val: 850, width: '85%' },
              { label: 'Jaringan', val: 600, width: '60%' },
              { label: 'Desain', val: 450, width: '45%' },
              { label: 'Admin', val: 750, width: '75%' }
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px]">
                <span className="w-[70px] font-medium text-[#182D4A]">{bar.label}</span>
                <div className="flex-1 h-2 bg-[#071E3D]/10 rounded overflow-hidden">
                  <div className="h-full bg-[#CC6B27] rounded" style={{ width: bar.width }}></div>
                </div>
                <span className="w-10 text-right font-bold text-[#071E3D]">{bar.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - Kanan (Porsi 1/3) */}
        <div className="md:col-span-1 bg-white rounded-xl p-6 border border-[#071E3D]/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-[#071E3D] text-[16px] m-0">Persentase Kelulusan</h4>
            <button className="text-[#CC6B27] hover:text-[#071E3D]"><FaEllipsisV /></button>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[160px] h-[160px] rounded-full flex items-center justify-center mb-5 relative" 
                 style={{ background: `conic-gradient(#CC6B27 0% 70%, #182D4A 70% 100%)` }}>
              <div className="w-[110px] h-[110px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-[24px] font-extrabold text-[#071E3D]">70%</span>
                <small className="text-[11px] text-[#182D4A]">Kompeten</small>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[12px] text-[#182D4A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CC6B27]"></span> Kompeten
              </div>
              <div className="text-[12px] text-[#182D4A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#182D4A]"></span> Belum Kompeten
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TABLE & SCHEDULE GRID (Tetap bersampingan: Kiri Tabel, Kanan Jadwal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Table - Kiri (Porsi 2/3) */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 border border-[#071E3D]/10 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-[#071E3D] text-[16px] m-0">Pendaftaran Terbaru</h4>
            <a href="#" className="text-[12px] font-semibold text-[#CC6B27] hover:text-[#071E3D] no-underline">Lihat Semua</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[12px] text-[#FAFAFA] bg-[#071E3D] font-semibold pb-3 pt-3 px-3 border-b-4 border-[#CC6B27] uppercase">Nama Asesi</th>
                  <th className="text-left text-[12px] text-[#FAFAFA] bg-[#071E3D] font-semibold pb-3 pt-3 px-3 border-b-4 border-[#CC6B27] uppercase">Skema</th>
                  <th className="text-left text-[12px] text-[#FAFAFA] bg-[#071E3D] font-semibold pb-3 pt-3 px-3 border-b-4 border-[#CC6B27] uppercase">Tanggal</th>
                  <th className="text-left text-[12px] text-[#FAFAFA] bg-[#071E3D] font-semibold pb-3 pt-3 px-3 border-b-4 border-[#CC6B27] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#CC6B27]/5 border-b border-[#071E3D]/10 last:border-0 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[13.5px] text-[#071E3D]">{row.name}</td>
                    <td className="py-3.5 px-3 text-[13.5px] text-[#182D4A]">{row.schema}</td>
                    <td className="py-3.5 px-3 text-[13.5px] text-[#182D4A]">{row.date}</td>
                    <td className="py-3.5 px-3">
                      {row.status === 'Menunggu' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#CC6B27]/10 text-[#CC6B27] border border-[#CC6B27]">Menunggu</span>}
                      {row.status === 'Verifikasi' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#182D4A]/10 text-[#182D4A] border border-[#182D4A]">Verifikasi</span>}
                      {row.status === 'Diterima' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-600 border border-green-500">Diterima</span>}
                      {row.status === 'Ditolak' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-600 border border-red-500">Ditolak</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule - Kanan (Porsi 1/3) */}
        <div className="md:col-span-1 bg-white rounded-xl p-6 border border-[#071E3D]/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-[#071E3D] text-[16px] m-0">Jadwal Asesmen</h4>
            <FaCalendarAlt className="text-[#CC6B27]" />
          </div>
          <div className="flex flex-col gap-4">
            {[
              { day: '18', month: 'FEB', title: 'Uji Kompetensi Web', time: '08:00 WIB • Lab 1' },
              { day: '20', month: 'FEB', title: 'Uji Komp. Jaringan', time: '09:00 WIB • Lab 2' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3.5 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                <div className="bg-[#071E3D] text-[#FAFAFA] rounded-lg py-2 px-3 text-center min-w-[55px] border-2 border-[#CC6B27]">
                  <span className="block text-[18px] font-extrabold leading-none">{item.day}</span>
                  <span className="text-[10px] font-bold text-[#CC6B27]">{item.month}</span>
                </div>
                <div>
                  <h5 className="m-0 mb-1 text-[14px] font-bold text-[#071E3D]">{item.title}</h5>
                  <p className="m-0 text-[12px] text-[#182D4A]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;