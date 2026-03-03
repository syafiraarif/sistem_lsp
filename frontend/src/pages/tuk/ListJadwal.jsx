// frontend/src/pages/tuk/ListJadwal.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Menu } from 'lucide-react';
import SidebarTUK from '../../components/sidebar/SidebarTuk';

const ListJadwal = () => {
  const navigate = useNavigate();
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil Data Jadwal
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/tuk/jadwal', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJadwal(res.data.data || []);
      } catch (error) {
        console.error("Gagal memuat jadwal", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJadwal();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Filter Data
  const filteredJadwal = jadwal.filter(j => 
    j.nama_kegatan?.toLowerCase().includes(search.toLowerCase()) ||
    j.kode_jadwal?.toLowerCase().includes(search.toLowerCase())
  );

  // Format Tanggal
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Status Badge
  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      open: 'bg-blue-100 text-blue-600',
      ongoing: 'bg-orange-100 text-orange-600',
      selesai: 'bg-green-100 text-green-600',
      arsip: 'bg-slate-100 text-slate-600'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || colors.draft}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <SidebarTUK 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-20 transition-all duration-300 p-4 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg shadow text-[#071E3D]">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#071E3D] flex items-center gap-2">
                <Calendar className="text-orange-500" /> Daftar Jadwal Uji
              </h1>
              <p className="text-slate-500 text-sm">Kelola jadwal sertifikasi kompetensi TUK Anda</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/tuk/jadwal/buat')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
          >
            <Plus size={18} /> Buat Jadwal Baru
          </button>
        </div>

        {/* Pencarian & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kode atau nama kegiatan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Tabel Jadwal */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Memuat data...</div>
          ) : filteredJadwal.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Tidak ada jadwal ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="p-4 font-semibold">Kode</th>
                    <th className="p-4 font-semibold">Nama Kegiatan</th>
                    <th className="p-4 font-semibold">Tanggal</th>
                    <th className="p-4 font-semibold">Kuota</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredJadwal.map((item) => (
                    <tr key={item.id_jadwal} className="hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 font-medium text-[#071E3D]">{item.kode_jadwal || '-'}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{item.nama_kegatan}</div>
                        <div className="text-xs text-slate-500">{item.periode_bulan} {item.tahun}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {formatDate(item.tgl_awal)} - {formatDate(item.tgl_akhir)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">{item.kuota} Orang</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListJadwal;