import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import Swal from 'sweetalert2';
import { 
  Search, Download, Eye, CheckCircle, 
  XCircle, Loader2, FileText, Building, Briefcase, User, CalendarClock, ShieldAlert, X
} from 'lucide-react';

const Surveillance = () => {
  const [surveillances, setSurveillances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filters sesuai controller backend
  const [filters, setFilters] = useState({
    search: '',
    status_verifikasi: '',
    sumber_dana: '',
    periode: ''
  });

  // State Modal Detail (Floating Card)
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSurveillance();
  }, [filters.status_verifikasi, filters.sumber_dana, filters.periode]);

  const fetchSurveillance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/surveillance', { params: filters });
      setSurveillances(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching surveillance:", error);
      Swal.fire('Error', 'Gagal memuat data surveillance', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Export ke Excel
  const handleExport = async () => {
    try {
      Swal.fire({ title: 'Mengekspor Data...', text: 'Mohon tunggu', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const response = await api.get('/admin/surveillance/export', {
        responseType: 'blob', 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Surveillance_Asesi.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      Swal.close();
    } catch (error) {
      Swal.fire('Gagal', 'Tidak dapat mengekspor data', 'error');
    }
  };

  // Fungsi Update Status Verifikasi (Sesuai Controller Backend)
  const handleUpdateStatus = async (id, newStatus) => {
    let actionText = newStatus === 'valid' ? 'Terima (Valid)' : newStatus === 'tidak_valid' ? 'Tolak (Tidak Valid)' : 'Set Sedang Direview';
    let btnColor = newStatus === 'valid' ? '#10B981' : newStatus === 'tidak_valid' ? '#EF4444' : '#CC6B27';
    
    const confirm = await Swal.fire({
      title: 'Ubah Status Pengajuan?',
      text: `Status akan diubah menjadi "${actionText}". Lanjutkan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Ubah Status'
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        await api.put(`/admin/surveillance/${id}/status`, { status_verifikasi: newStatus });
        
        Swal.fire('Berhasil', 'Status pengajuan telah diperbarui', 'success');
        setShowModal(false);
        fetchSurveillance(); // Refresh data di tabel
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal mengubah status', 'error');
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSurveillance();
  };

  // Helper Badge Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle size={14}/> VALID</span>;
      case 'tidak_valid': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200"><XCircle size={14}/> TIDAK VALID</span>;
      case 'review': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><Search size={14}/> REVIEW</span>;
      default: // submitted
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200"><CalendarClock size={14}/> MENUNGGU</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Surveillance Asesi</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Pengawasan dan pemeliharaan sertifikat kompetensi.</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-5 py-2.5 rounded-lg font-bold bg-[#182D4A] text-[#FAFAFA] hover:bg-[#071E3D] shadow-sm transition-all flex items-center justify-center gap-2 text-[13px]"
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* FILTER & TABLE CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Toolbar (Search & Filter) */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan periode atau sumber dana..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <select 
            className="p-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] text-[13px] font-medium"
            value={filters.status_verifikasi}
            onChange={(e) => setFilters({...filters, status_verifikasi: e.target.value})}
          >
            <option value="">Semua Status</option>
            <option value="submitted">Menunggu</option>
            <option value="review">Sedang Direview</option>
            <option value="valid">Valid (Diterima)</option>
            <option value="tidak_valid">Tidak Valid (Ditolak)</option>
          </select>

          <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm transition-all text-[13px] hidden md:block">
            Cari
          </button>
        </form>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Asesi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-56">Skema & Sertifikat</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Pekerjaan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-36">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data surveillance...</p>
                  </td>
                </tr>
              ) : surveillances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <ShieldAlert size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Tidak ada data surveillance ditemukan.</p>
                  </td>
                </tr>
              ) : (
                surveillances.map((item, index) => (
                  <tr key={item.id_surveillance} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px] flex items-center gap-2">
                        <User size={14} className="text-[#CC6B27]"/> 
                        {item.User?.username || 'User Dihapus'}
                      </div>
                      <div className="text-[11px] text-[#182D4A]/70 mt-1 pl-5">
                        {item.User?.email || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[12.5px] font-bold text-[#071E3D] line-clamp-2" title={item.Skema?.judul_skema}>
                        {item.Skema?.judul_skema || 'Skema Dihapus'}
                      </div>
                      <div className="text-[11px] font-mono text-[#CC6B27] font-bold mt-1">
                        Sertifikat: {item.nomor_sertifikat || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[13px] font-medium text-[#182D4A]">{item.jabatan_pekerjaan || '-'}</div>
                      <div className="text-[11px] text-[#182D4A]/60 mt-0.5">{item.nama_perusahaan || '-'}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(item.status_verifikasi)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                        className="p-2 bg-[#CC6B27]/10 text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white rounded-lg transition-colors shadow-sm"
                        title="Lihat Detail & Evaluasi"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FLOATING CARD (DETAIL & UPDATE STATUS) */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Floating Card */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2">
                <FileText size={20} className="text-[#CC6B27]" /> 
                Detail Pengajuan Surveillance
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* Isi Detail Floating Card */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white">
              
              {/* Box 1: Info Asesi & Skema */}
              <div className="bg-[#FAFAFA] border border-[#071E3D]/10 rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between shadow-sm">
                <div>
                  <span className="text-[11px] font-bold text-[#182D4A]/70 uppercase tracking-wider block mb-1">Nama Pemohon (Asesi)</span>
                  <div className="text-[15px] font-bold text-[#071E3D]">{selectedItem.User?.username}</div>
                  <div className="text-[12px] text-[#CC6B27] font-medium">{selectedItem.User?.email}</div>
                </div>
                <div className="flex-1 md:border-l-2 md:border-[#071E3D]/10 md:pl-6">
                  <span className="text-[11px] font-bold text-[#182D4A]/70 uppercase tracking-wider block mb-1">Skema Kompetensi</span>
                  <div className="text-[14px] font-bold text-[#071E3D]">{selectedItem.Skema?.judul_skema}</div>
                  <div className="text-[12px] font-mono text-[#182D4A] mt-1 font-bold">No Registrasi: {selectedItem.nomor_registrasi || '-'}</div>
                  <div className="text-[12px] font-mono text-[#182D4A] mt-0.5 font-bold">No Sertifikat: {selectedItem.nomor_sertifikat || '-'}</div>
                </div>
              </div>

              {/* Box 2: Data Perusahaan & Proyek */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#071E3D]/10 p-5 rounded-xl shadow-sm">
                  <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 flex items-center gap-2 border-b border-[#CC6B27]/20 pb-2">
                    <Building size={16}/> Informasi Perusahaan
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Nama Perusahaan</span>
                      <p className="text-[13px] font-bold text-[#071E3D] mt-0.5">{selectedItem.nama_perusahaan || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Jabatan / Posisi</span>
                      <p className="text-[13px] font-bold text-[#071E3D] mt-0.5">{selectedItem.jabatan_pekerjaan || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Alamat Perusahaan</span>
                      <p className="text-[13px] font-medium text-[#071E3D] mt-0.5">{selectedItem.alamat_perusahaan || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#071E3D]/10 p-5 rounded-xl shadow-sm">
                  <h4 className="text-[14px] font-bold text-[#CC6B27] mb-4 flex items-center gap-2 border-b border-[#CC6B27]/20 pb-2">
                    <Briefcase size={16}/> Pekerjaan / Proyek Terkini
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Nama Proyek / Aktivitas</span>
                      <p className="text-[13px] font-bold text-[#071E3D] mt-0.5">{selectedItem.nama_proyek || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Peran dalam Proyek</span>
                      <p className="text-[13px] font-bold text-[#071E3D] mt-0.5">{selectedItem.jabatan_dalam_proyek || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#182D4A]/70 block">Status Kesesuaian Kompetensi</span>
                      <div className="mt-1.5">
                        <span className={`inline-block px-3 py-1 rounded text-[11px] font-bold uppercase border
                          ${selectedItem.kesesuaian_kompetensi === 'sesuai' ? 'bg-green-50 text-green-700 border-green-200' : 
                            selectedItem.kesesuaian_kompetensi === 'tidak_sesuai' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {selectedItem.kesesuaian_kompetensi?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Catatan */}
              {selectedItem.keterangan_lainnya && (
                <div className="bg-[#CC6B27]/5 border border-[#CC6B27]/20 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-[#CC6B27] uppercase tracking-wider block mb-1">Catatan Tambahan Asesi</span>
                  <p className="text-[13px] text-[#071E3D] italic leading-relaxed m-0">"{selectedItem.keterangan_lainnya}"</p>
                </div>
              )}

            </div>

            {/* Footer Modal: Tombol Update Status */}
            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex flex-wrap justify-between items-center gap-4">
              
              <div className="text-[12px] font-bold text-[#182D4A] flex items-center gap-2">
                Status Saat Ini: {getStatusBadge(selectedItem.status_verifikasi)}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Tampilkan tombol aksi jika status belum Valid/Tidak Valid */}
                {selectedItem.status_verifikasi === 'submitted' || selectedItem.status_verifikasi === 'review' ? (
                  <>
                    {selectedItem.status_verifikasi === 'submitted' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedItem.id_surveillance, 'review')}
                        className="px-4 py-2 rounded-lg font-bold bg-[#182D4A] text-[#FAFAFA] hover:bg-[#071E3D] transition text-[13px]"
                      >
                        Set Sedang Review
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id_surveillance, 'tidak_valid')}
                      className="px-4 py-2 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition border border-red-200 hover:border-transparent text-[13px]"
                    >
                      Tolak (Tidak Valid)
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedItem.id_surveillance, 'valid')}
                      className="px-5 py-2 rounded-lg font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-md transition text-[13px] flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Terima (Valid)
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] hover:bg-[#E2E8F0] transition text-[13px]"
                  >
                    Tutup
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Surveillance;