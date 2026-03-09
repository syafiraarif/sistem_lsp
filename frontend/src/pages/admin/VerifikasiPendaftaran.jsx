import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api"; 
import { 
  Search, Eye, CheckCircle, XCircle, 
  User, MapPin, Phone, Mail, School, 
  Loader2, Clock, FileText, X
} from 'lucide-react';

const VerifikasiPendaftaran = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pendaftaran');
      const resultData = response.data.data || []; 
      setData(resultData);
      setFilteredData(resultData);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status !== 500) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: error.response?.data?.message || 'Terjadi kesalahan koneksi.',
          confirmButtonColor: '#CC6B27'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. SEARCH & FILTER ---
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => 
      (item.nama_lengkap && item.nama_lengkap.toLowerCase().includes(lowerTerm)) ||
      (item.email && item.email.toLowerCase().includes(lowerTerm)) ||
      (item.nik && item.nik.includes(lowerTerm))
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  // --- 3. ACTIONS ---
  
  // Handle Verifikasi (Approve)
  const handleApprove = async (item) => {
    // Konfirmasi Awal
    const result = await Swal.fire({
      title: 'Verifikasi Pendaftaran?',
      html: `
        <div class="text-[14px] text-[#182D4A] mt-2">
            <p>Sistem akan membuat akun ASESI untuk:</p>
            <p class="font-bold text-[16px] text-[#071E3D] my-2">${item.nama_lengkap}</p>
            <p class="text-[12px] opacity-80 border-t pt-2 mt-2">Notifikasi berisi Password akan dikirim otomatis ke email pendaftar.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Verifikasi',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.post(`/admin/pendaftaran/${item.id_pendaftaran}/approve`);
        
        await Swal.fire({
          icon: 'success',
          title: 'Akun Berhasil Dibuat!',
          html: `
            <div class="text-left text-[14px] text-[#182D4A]">
              <p class="mb-2">Akun asesi telah aktif.</p>
              <p><strong>Username:</strong> <span class="text-[#CC6B27]">${item.nik}</span></p>
              <p class="text-[12px] opacity-80 mt-3 pt-3 border-t">
                *Password telah dikirim ke email: <strong>${item.email}</strong>
              </p>
            </div>
          `,
          confirmButtonColor: '#CC6B27',
          confirmButtonText: 'Oke, Mengerti'
        });

        setShowModal(false);
        fetchData(); 
      } catch (error) {
        console.error("Approve error:", error);
        let errorMessage = 'Gagal memverifikasi pendaftaran.';
        if (error.response?.status === 500) {
          errorMessage = 'Terjadi kesalahan pada server (kemungkinan konfigurasi email). Namun, cek apakah status user sudah berubah.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        Swal.fire({ title: 'Gagal!', text: errorMessage, icon: 'error', confirmButtonColor: '#CC6B27' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle Tolak (Reject)
  const handleReject = async (id_pendaftaran) => {
    const result = await Swal.fire({
      title: 'Tolak Pendaftaran?',
      text: "Pendaftar akan menerima email penolakan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.post(`/admin/pendaftaran/${id_pendaftaran}/reject`);
        Swal.fire({ title: 'Ditolak!', text: 'Pendaftaran telah ditolak.', icon: 'success', confirmButtonColor: '#CC6B27' });
        setShowModal(false);
        fetchData();
      } catch (error) {
        console.error("Reject error:", error);
        Swal.fire({ title: 'Gagal!', text: error.response?.data?.message || 'Gagal menolak pendaftaran.', icon: 'error', confirmButtonColor: '#CC6B27' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // --- 4. UI HELPERS ---
  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    if(!actionLoading) {
        setShowModal(false);
        setSelectedItem(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-bold bg-green-50 text-green-700 border-green-200"><CheckCircle size={14}/> Verified</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-bold bg-red-50 text-red-700 border-red-200"><XCircle size={14}/> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-bold bg-yellow-50 text-yellow-600 border-yellow-200"><Clock size={14}/> Pending</span>;
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Verifikasi Pendaftaran</h1>
          <p className="text-[14px] text-[#182D4A] m-0">Validasi data calon asesi baru</p>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* TOOLBAR (SEARCH) */}
        <div className="w-full md:w-80 relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
          <input 
            type="text" 
            placeholder="Cari Nama, NIK, atau Email..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[50px] text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Identitas</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Program / Kompetensi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Tanggal Daftar</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Tidak ada data pendaftaran ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_pendaftaran} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold text-center">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#071E3D] text-[13.5px]">{item.nama_lengkap}</span>
                          <span className="text-[12px] text-[#182D4A]/70 font-mono font-medium">NIK: {item.nik}</span>
                          <span className="text-[12px] text-[#CC6B27] font-medium">{item.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                          <span className="text-[#071E3D] font-bold text-[13px]">{item.program_studi}</span>
                          <span className="text-[12px] text-[#182D4A]/70 font-medium">{item.kompetensi_keahlian || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13px] font-medium">
                      {item.tanggal_daftar ? new Date(item.tanggal_daftar).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => openDetailModal(item)}
                        className="p-2 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors inline-flex justify-center"
                        title="Lihat Detail"
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

      {/* MODAL DETAIL */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#CC6B27]/10 text-[#CC6B27] rounded-lg">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#071E3D] m-0">Detail Pendaftar</h3>
                  <p className="text-[12px] text-[#182D4A]/70 font-medium font-mono m-0 mt-0.5">ID: #{selectedItem.id_pendaftaran}</p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Info Pribadi */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                    <User size={16} className="text-[#CC6B27]"/> Data Diri
                  </h4>
                  <div className="flex flex-col gap-3">
                    <DetailRow label="Nama Lengkap" value={selectedItem.nama_lengkap} />
                    <DetailRow label="NIK" value={selectedItem.nik} />
                    <DetailRow label="Email" value={selectedItem.email} />
                    <DetailRow label="No HP" value={selectedItem.no_hp} />
                  </div>
                </div>

                {/* Alamat & Wilayah */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                    <MapPin size={16} className="text-[#CC6B27]"/> Domisili & Wilayah
                  </h4>
                  <div className="bg-[#FAFAFA] p-3.5 rounded-lg border border-[#071E3D]/10 text-[13px] shadow-sm">
                    <p className="font-bold text-[#071E3D] mb-1 leading-relaxed">{selectedItem.alamat_lengkap}</p>
                    <p className="text-[#182D4A] font-medium leading-relaxed">
                      {selectedItem.kelurahan}, {selectedItem.kecamatan}, {selectedItem.kota}, {selectedItem.provinsi}
                    </p>
                  </div>
                  <div className="mt-1">
                      <DetailRow label="Wilayah RJI" value={selectedItem.wilayah_rji} />
                  </div>
                </div>

                {/* Akademik */}
                <div className="md:col-span-2 pt-2 border-t border-[#071E3D]/10 flex flex-col gap-4">
                   <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                    <School size={16} className="text-[#CC6B27]"/> Data Akademik
                  </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                      <DetailRow label="Program Studi" value={selectedItem.program_studi} />
                      <DetailRow label="Kompetensi Keahlian" value={selectedItem.kompetensi_keahlian} />
                   </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button 
                className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px] disabled:opacity-50" 
                onClick={closeModal}
                disabled={actionLoading}
              >
                Tutup
              </button>
              
              {/* Tombol Aksi HANYA jika status Pending */}
              {selectedItem.status === 'pending' && (
                <>
                  <button 
                    className="px-5 py-2.5 rounded-lg font-bold border border-red-500 text-red-600 bg-white hover:bg-red-50 transition-colors flex items-center gap-2 text-[13px] disabled:opacity-50"
                    onClick={() => handleReject(selectedItem.id_pendaftaran)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin"/> : <XCircle size={16}/>}
                    Tolak
                  </button>
                  <button 
                    className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px] disabled:opacity-50"
                    onClick={() => handleApprove(selectedItem)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>}
                    Verifikasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen Kecil untuk Baris Detail
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-[#071E3D]/5 pb-1.5 last:border-0 gap-1 sm:gap-4">
    <span className="text-[#182D4A]/70 text-[12px] font-bold uppercase tracking-wider">{label}</span>
    <span className="text-[#071E3D] font-bold text-[13.5px] sm:text-right break-words">{value || '-'}</span>
  </div>
);

export default VerifikasiPendaftaran;