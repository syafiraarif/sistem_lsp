import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { 
  Search, Trash2, Loader2, Sparkles, ChevronLeft, ChevronRight, 
  MessageSquare, Star, Eye, EyeOff
} from 'lucide-react';

const FeedbackAdmin = () => {
  // --- STATE ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State (Client-side)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // --- FETCH DATA ---
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/feedback');
      setFeedbacks(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setFeedbacks([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // --- HANDLERS ---
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // Tampilkan loading sebentar
      Swal.fire({ title: 'Memperbarui...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      await api.put(`/admin/feedback/${id}/toggle-status`);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Status berhasil diubah!`,
        showConfirmButton: false,
        timer: 1500
      });
      fetchFeedbacks(); 
    } catch (err) {
      Swal.fire('Gagal', 'Gagal mengubah status', 'error');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Feedback?',
      text: "Data ulasan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/feedback/${id}`);
          Swal.fire('Terhapus!', 'Feedback berhasil dihapus.', 'success');
          fetchFeedbacks();
        } catch (err) {
          Swal.fire('Error', 'Gagal menghapus feedback', 'error');
          console.error(err);
        }
      }
    });
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredData = feedbacks?.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.pesan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.peran?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const currentData = filteredData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  // Helper render rating stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={`${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-transparent'}`} 
        />
      );
    }
    return <div className="flex items-center justify-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative overflow-hidden bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#CC6B27]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              Manajemen Layanan
            </div>
            <h2 className="text-[24px] md:text-[28px] font-black text-[#071E3D] m-0 mb-1">Data Feedback & Ulasan</h2>
            <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium">Kelola dan tampilkan ulasan dari asesi, asesor, atau masyarakat umum.</p>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#CC6B27]"/> Daftar Ulasan Masuk
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari nama, peran, atau isi ulasan..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset ke halaman 1 saat mencari
              }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Pengirim</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Isi Ulasan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Rating</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data feedback...</p>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <MessageSquare size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada feedback yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={item.id_feedback} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px]">{item.nama_lengkap}</div>
                      <div className="text-[11px] text-[#CC6B27] mt-0.5 capitalize font-medium">
                        {item.peran?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px] max-w-xs truncate" title={item.pesan}>
                      {item.pesan}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderStars(item.rating)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 inline-flex text-[11px] leading-5 font-black uppercase tracking-wider rounded-full border ${
                        item.status === 'aktif' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {item.status === 'aktif' ? 'Ditampilkan' : 'Disembunyikan'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(item.id_feedback, item.status)} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.status === 'aktif' 
                              ? 'text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700' 
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                          title={item.status === 'aktif' ? "Sembunyikan dari Publik" : "Tampilkan ke Publik"}
                        >
                          {item.status === 'aktif' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(item.id_feedback)}
                          className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white border border-red-100 transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-[13px] text-[#182D4A] font-medium">
            <span>
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#182D4A] disabled:hover:border-[#071E3D]/20 transition-all"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={18}/>
              </button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">
                {pagination.page} / {totalPages}
              </span>
              <button 
                className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#182D4A] disabled:hover:border-[#071E3D]/20 transition-all"
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />
    </div>
  );
};

export default FeedbackAdmin;