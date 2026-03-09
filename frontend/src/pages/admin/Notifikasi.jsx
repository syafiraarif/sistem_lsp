import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Bell, Mail, MessageSquare, Filter, 
  CheckCircle, XCircle, Clock, Eye, Trash2, 
  Loader2, ChevronLeft, ChevronRight, X, AlertCircle
} from 'lucide-react';

const NotifikasiAdmin = () => {
  // --- STATE ---
  const [allData, setAllData] = useState([]); // Data mentah dari DB
  const [data, setData] = useState([]);       // Data yang ditampilkan (paginated)
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); 
  const [filterChannel, setFilterChannel] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/notifikasi');
      if (response.data.success) {
        setAllData(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal mengambil data notifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERING & PAGINATION LOGIC ---
  useEffect(() => {
    let processedData = [...allData];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processedData = processedData.filter(item => 
        (item.pesan && item.pesan.toLowerCase().includes(lowerSearch)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. Filter Type
    if (filterType) {
      processedData = processedData.filter(item => item.ref_type === filterType);
    }

    // 3. Filter Channel
    if (filterChannel) {
      processedData = processedData.filter(item => item.channel === filterChannel);
    }

    // 4. Pagination Config
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const currentPage = pagination.page > totalPages && totalPages > 0 ? totalPages : pagination.page;

    // 5. Slicing
    const startIndex = (currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = processedData.slice(startIndex, endIndex);

    setData(paginatedData);
    setPagination(prev => ({
      ...prev,
      page: currentPage,
      total: totalItems,
      totalPages: totalPages || 1
    }));

  }, [allData, searchTerm, filterType, filterChannel, pagination.page]);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Log?',
      text: "Data notifikasi ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/notifikasi/${id}`);
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const openDetail = (item) => {
    setSelectedNotif(item);
    setShowDetailModal(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Riwayat Notifikasi</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Monitor status pengiriman Email & WhatsApp Gateway</p>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* TOOLBAR (SEARCH & FILTERS) */}
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          
          {/* Search Box */}
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari tujuan, email, atau isi pesan..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(p => ({...p, page: 1}));
              }}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group min-w-[160px]">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors z-10"/>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] appearance-none"
              >
                <option value="">Semua Kategori</option>
                <option value="pendaftaran">Pendaftaran</option>
                <option value="pengaduan">Pengaduan</option>
                <option value="akun">Akun User</option>
              </select>
            </div>

            <div className="relative group min-w-[160px]">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors z-10"/>
              <select 
                value={filterChannel} 
                onChange={(e) => setFilterChannel(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] appearance-none"
              >
                <option value="">Semua Channel</option>
                <option value="email">Email</option>
                <option value="wa">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[5%] text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[15%]">Waktu Kirim</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[15%]">Channel & Tipe</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[20%]">Tujuan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[25%]">Pesan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[10%]">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[10%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat riwayat...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => {
                  const { date, time } = formatDateTime(item.waktu_kirim);
                  return (
                    <tr key={item.id_notifikasi || index} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                      <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold text-center">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="py-4 px-4 text-[#182D4A]">
                        <div className="flex flex-col">
                          <span className="font-bold text-[13.5px] text-[#071E3D]">{date}</span>
                          <span className="text-[12px] text-[#182D4A]/70 font-medium flex items-center gap-1 mt-0.5">
                            <Clock size={12}/> {time}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                            item.channel === 'email' ? 'bg-[#071E3D]/10 text-[#071E3D]' : 'bg-[#CC6B27]/10 text-[#CC6B27]'
                          }`}>
                            {item.channel === 'email' ? <Mail size={12}/> : <MessageSquare size={12}/>}
                            {item.channel}
                          </span>
                          <span className="text-[11px] text-[#182D4A] capitalize font-semibold border border-[#071E3D]/10 bg-[#FAFAFA] px-2.5 py-0.5 rounded-md">
                            {item.ref_type || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#071E3D] text-[13.5px] break-all">
                        {item.tujuan}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-[13px] text-[#182D4A] font-medium truncate max-w-[250px]" title={item.pesan}>
                          {item.pesan}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-bold ${
                          item.status_kirim === 'terkirim' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.status_kirim === 'terkirim' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                          {item.status_kirim === 'terkirim' ? 'Sukses' : 'Gagal'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors flex flex-col items-center gap-1" 
                            onClick={() => openDetail(item)}
                            title="Lihat Detail Notifikasi"
                          >
                            <Eye size={18}/>
                            <span className="text-[10px] font-bold hidden md:block">Detail</span>
                          </button>
                          <button 
                            className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors flex flex-col items-center gap-1" 
                            onClick={() => handleDelete(item.id_notifikasi)}
                            title="Hapus Data Notifikasi"
                          >
                            <Trash2 size={18}/>
                            <span className="text-[10px] font-bold hidden md:block">Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Bell size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Tidak ada riwayat notifikasi ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {data.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-[13px] text-[#182D4A] font-medium">
            <span>
              Menampilkan {data.length} dari {pagination.total} data
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#182D4A] disabled:hover:border-[#071E3D]/20 transition-all"
                disabled={pagination.page === 1} 
                onClick={() => setPagination(p=>({...p, page: p.page-1}))}
              >
                <ChevronLeft size={18}/>
              </button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button 
                className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] hover:border-[#CC6B27]/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#182D4A] disabled:hover:border-[#071E3D]/20 transition-all"
                disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0} 
                onClick={() => setPagination(p=>({...p, page: p.page+1}))}
              >
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {showDetailModal && selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div>
                <h3 className="text-[18px] font-bold text-[#071E3D] m-0 mb-0.5 flex items-center gap-2">
                  <Bell size={20} className="text-[#CC6B27]"/> Detail Notifikasi
                </h3>
                <p className="text-[12px] text-[#182D4A]/70 font-medium m-0 ml-7">Rincian pesan yang dikirimkan sistem</p>
              </div>
              <button 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-5">
              
              {/* Status Banner */}
              <div className={`p-3 rounded-lg font-bold text-center text-[13px] mb-6 border flex items-center justify-center gap-2 ${
                selectedNotif.status_kirim === 'terkirim' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {selectedNotif.status_kirim === 'terkirim' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                STATUS PENGIRIMAN: {selectedNotif.status_kirim?.toUpperCase()}
              </div>

              <div className="flex flex-col gap-6">
                
                {/* Informasi Pengiriman */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2 flex items-center gap-2">
                    <Mail size={16} className="text-[#CC6B27]"/> Informasi Pengiriman
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Channel</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase w-fit mt-1 ${
                        selectedNotif.channel === 'email' ? 'bg-[#071E3D]/10 text-[#071E3D]' : 'bg-[#CC6B27]/10 text-[#CC6B27]'
                      }`}>
                        {selectedNotif.channel === 'email' ? <Mail size={12}/> : <MessageSquare size={12}/>}
                        {selectedNotif.channel}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Waktu Kirim</span>
                      <span className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">
                        {formatDateTime(selectedNotif.waktu_kirim).date} pukul {formatDateTime(selectedNotif.waktu_kirim).time}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2 mt-2">
                      <span className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Tujuan</span>
                      <span className="font-bold text-[#CC6B27] mt-0.5 m-0 text-[14px] break-all">{selectedNotif.tujuan}</span>
                    </div>
                  </div>
                </div>

                {/* Konteks Referensi */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-[#CC6B27]"/> Konteks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Tipe Referensi</span>
                      <span className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px] capitalize border border-[#071E3D]/10 bg-[#FAFAFA] px-3 py-1 rounded-md w-fit">
                        {selectedNotif.ref_type || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">ID Referensi</span>
                      <span className="font-mono font-bold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">
                        #{selectedNotif.ref_id || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Isi Pesan */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-3 border-b border-[#071E3D]/10 pb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#CC6B27]"/> Isi Pesan
                  </h4>
                  <div className="p-4 bg-[#FAFAFA] border border-[#071E3D]/10 rounded-lg text-[#182D4A] text-[13.5px] leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                    {selectedNotif.pesan}
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button 
                className="px-6 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" 
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotifikasiAdmin;