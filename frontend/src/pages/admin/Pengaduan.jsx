import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, Save, X,
  MessageSquare, User, Mail, Phone, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';

const Pengaduan = () => {
  // --- STATE ---
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusEdit, setStatusEdit] = useState(''); 

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Filter Client-Side (Berdasarkan model database baru)
  useEffect(() => {
    if (!data) return;
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const nama = item.nama_pengadu?.toLowerCase() || '';
      const email = item.email_pengadu?.toLowerCase() || '';
      const isi = item.isi_pengaduan?.toLowerCase() || '';
      
      return nama.includes(lowerTerm) || 
             email.includes(lowerTerm) || 
             isi.includes(lowerTerm);
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pengaduan');
      const result = response.data.data || [];
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching pengaduan:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setStatusEdit(item.status_pengaduan || 'masuk');
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/admin/pengaduan/${selectedItem.id_pengaduan}/status`, {
        status_pengaduan: statusEdit
      });
      
      Swal.fire("Berhasil", "Status pengaduan diperbarui", "success");
      setShowModal(false);
      fetchData(); 
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan saat memperbarui status", "error");
    }
  };

  // Helper Badge Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'selesai': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-200"><CheckCircle size={14}/> Selesai</span>;
      case 'tindak_lanjut': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200"><Clock size={14}/> Diproses</span>;
      default: 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200"><AlertCircle size={14}/> Masuk</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Layanan Pengaduan</h2>
        <p className="text-[14px] text-[#182D4A] m-0">Daftar keluhan dan masukan dari pengguna sistem.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* TOOLBAR & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0">Daftar Laporan</h4>
          
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Nama atau Isi Aduan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
            <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat data pengaduan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full text-left border-collapse min-w-max bg-white">
              <thead>
                <tr>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">No</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Tanggal</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Pengirim</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Isi Singkat</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Status</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id_pengaduan} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                      <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                      <td className="py-4 px-4 text-[#182D4A] text-[13.5px] whitespace-nowrap">{formatDate(item.tanggal_pengaduan)}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#071E3D] text-[13.5px]">{item.nama_pengadu}</span>
                          <span className="text-[12px] font-medium text-[#CC6B27] capitalize">{item.sebagai_siapa}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-xs truncate text-[#182D4A] text-[13.5px]" title={item.isi_pengaduan}>
                          {item.isi_pengaduan}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(item.status_pengaduan)}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          className="inline-flex p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm" 
                          onClick={() => handleDetailClick(item)}
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <MessageSquare size={48} className="text-[#071E3D]/20 mb-3"/>
                        <p className="text-[#182D4A] font-medium text-[14px]">Data tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0">Detail Pengaduan</h3>
              <button 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 flex flex-col px-6 py-5">
              
              {/* INFO PENGIRIM */}
              <div className="bg-[#FAFAFA] p-5 rounded-lg mb-6 border border-[#071E3D]/10">
                <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 flex items-center border-b pb-2 border-[#CC6B27]/20">
                  <User size={16} className="mr-2"/> Informasi Pengirim
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Nama Lengkap</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.nama_pengadu}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Sebagai</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 capitalize">{selectedItem.sebagai_siapa}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1"><Mail size={12}/> Email</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.email_pengadu || '-'}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1"><Phone size={12}/> No HP</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.no_hp_pengadu || '-'}</p>
                  </div>
                </div>
              </div>

              {/* ISI PENGADUAN */}
              <div className="bg-[#CC6B27]/5 border-l-4 border-[#CC6B27] rounded-r-lg p-5 mb-6">
                <h4 className="text-[14px] font-bold text-[#071E3D] mb-3 flex items-center">
                  <MessageSquare size={16} className="mr-2 text-[#CC6B27]"/> Isi Laporan
                </h4>
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-[#CC6B27] flex items-center gap-1"><Clock size={12}/>{formatDate(selectedItem.tanggal_pengaduan)}</span>
                </div>
                <p className="text-[13.5px] text-[#071E3D] leading-relaxed m-0 whitespace-pre-wrap">
                  {selectedItem.isi_pengaduan}
                </p>
              </div>

              {/* UPDATE STATUS */}
              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-2">Update Status Penanganan</label>
                <select 
                  className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                  value={statusEdit} 
                  onChange={(e) => setStatusEdit(e.target.value)}
                >
                  <option value="masuk">Masuk (Belum dibaca)</option>
                  <option value="tindak_lanjut">Sedang Ditindak Lanjuti</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 flex justify-end gap-3 px-6 pb-5">
              <button 
                type="button" 
                className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" 
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
              <button 
                type="button" 
                className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]" 
                onClick={handleStatusChange}
              >
                <Save size={16} /> Simpan Status
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaduan;