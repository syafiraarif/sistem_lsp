import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, X, Save, 
  Gavel, FileText, CheckCircle, XCircle, Clock, Loader2
} from 'lucide-react';

const Banding = () => {
  // --- STATE ---
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State untuk Update (Disinkronkan dengan ENUM Model Database)
  const [formUpdate, setFormUpdate] = useState({
    status_progress: 'diajukan',
    keputusan: 'belum_diputuskan',
    catatan_komite: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data setiap kali search term atau data berubah
  useEffect(() => {
    if (!data) return;
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      // Menggunakan isi_banding sesuai model backend
      const ket = item.isi_banding?.toLowerCase() || '';
      const emailUser = item.user?.email?.toLowerCase() || '';
      const namaUser = item.user?.username?.toLowerCase() || '';
      
      return emailUser.includes(lowerTerm) || 
             namaUser.includes(lowerTerm) || 
             ket.includes(lowerTerm);
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banding');
      const result = response.data.data || [];
      
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching banding:", error);
      Swal.fire("Error", "Gagal memuat data banding", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setFormUpdate({
      status_progress: item.status_progress || 'diajukan',
      keputusan: item.keputusan || 'belum_diputuskan',
      catatan_komite: item.catatan_komite || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.put(`/admin/banding/${selectedItem.id_banding}`, formUpdate);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status banding telah diperbarui',
        timer: 1500
      });
      
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire('Gagal', 'Terjadi kesalahan saat update', 'error');
    }
  };

  // Helper untuk warna badge status (Sesuai ENUM Model)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'diajukan': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'tindak_lanjut': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'pleno_komite': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'selesai': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Helper untuk warna badge keputusan (Sesuai ENUM Model)
  const getKeputusanBadge = (keputusan) => {
    if (keputusan === 'diterima') return <span className="flex items-center text-green-600 gap-1.5 font-bold text-[13px]"><CheckCircle size={16}/> Diterima</span>;
    if (keputusan === 'ditolak') return <span className="flex items-center text-red-600 gap-1.5 font-bold text-[13px]"><XCircle size={16}/> Ditolak</span>;
    return <span className="flex items-center text-gray-400 gap-1.5 font-bold text-[13px]"><Clock size={16}/> Belum Diputus</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data Banding Asesmen</h2>
        <p className="text-[14px] text-[#182D4A] m-0">Kelola pengajuan banding dan keputusan pleno.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* --- TOOLBAR (SEARCH & TITLE) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0">Daftar Pengajuan</h4>
          
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Email atau Alasan Banding..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
            <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Sedang memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full text-left border-collapse min-w-max bg-white">
              <thead>
                <tr>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">No</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Tanggal</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Asesi</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Alasan Banding</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Status</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Keputusan</th>
                  <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id_banding} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                      <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                      <td className="py-4 px-4 text-[#182D4A] text-[13.5px] whitespace-nowrap">{formatDate(item.tanggal_ajukan)}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#071E3D] text-[13.5px]">{item.user?.username || 'User'}</span>
                          <span className="text-[12px] font-medium text-[#182D4A]/70">{item.user?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-xs truncate text-[#182D4A] text-[13.5px]" title={item.isi_banding}>
                          {item.isi_banding}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] border font-bold ${getStatusBadge(item.status_progress)}`}>
                          {item.status_progress?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">{getKeputusanBadge(item.keputusan)}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          className="inline-flex p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm" 
                          onClick={() => handleDetailClick(item)}
                          title="Proses & Detail"
                        >
                          <Gavel size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                        <p className="text-[#182D4A] font-medium text-[14px]">Tidak ada data banding ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PROSES BANDING */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center m-0">
                <Gavel size={20} className="mr-2 text-[#CC6B27]"/> Proses Banding Asesmen
              </h3>
              <button 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="overflow-y-auto flex-1 flex flex-col px-6 py-5">
              
              {/* INFO DETAIL */}
              <div className="bg-[#FAFAFA] p-5 rounded-lg mb-6 border border-[#071E3D]/10">
                <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 flex items-center border-b pb-2 border-[#071E3D]/10">
                  <FileText size={16} className="mr-2 text-[#CC6B27]"/> Detail Pengajuan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Asesi</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.user?.username} ({selectedItem.user?.email})</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Tanggal Pengajuan</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{formatDate(selectedItem.tanggal_ajukan)}</p>
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Alasan Banding</label>
                    <div className="bg-white p-3 border border-[#071E3D]/10 rounded-lg mt-1.5 text-[#071E3D] leading-relaxed shadow-sm">
                      {selectedItem.isi_banding}
                    </div>
                  </div>
                  
                  {/* Link Bukti (Jika Ada Kolom file_bukti di Backend nantinya) */}
                  {selectedItem.file_bukti && (
                    <div className="md:col-span-2 mt-2">
                      <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">File Bukti Pendukung</label>
                      <a 
                        href={`http://localhost:3000/uploads/${selectedItem.file_bukti}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#CC6B27] hover:text-[#182D4A] flex items-center gap-2 mt-1.5 font-bold bg-[#CC6B27]/10 w-fit px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye size={16}/> Buka Lampiran Bukti
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* FORM UPDATE */}
              <div>
                <h4 className="text-[15px] font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2">Update Keputusan Pleno</h4>
                
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Status Progress</label>
                    <select 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                      value={formUpdate.status_progress}
                      onChange={(e) => setFormUpdate(p => ({...p, status_progress: e.target.value}))}
                    >
                      <option value="diajukan">Diajukan</option>
                      <option value="tindak_lanjut">Tindak Lanjut</option>
                      <option value="pleno_komite">Pleno Komite</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Keputusan Akhir</label>
                    <select 
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium text-[13px] ${
                        formUpdate.keputusan === 'diterima' ? 'bg-green-50 text-green-700 border-green-300 focus:border-green-500 focus:ring-green-200' : 
                        formUpdate.keputusan === 'ditolak' ? 'bg-red-50 text-red-700 border-red-300 focus:border-red-500 focus:ring-red-200' : 
                        'border-[#071E3D]/20 text-[#071E3D] bg-white focus:border-[#CC6B27] focus:ring-[#CC6B27]/10'
                      }`}
                      value={formUpdate.keputusan}
                      onChange={(e) => setFormUpdate(p => ({...p, keputusan: e.target.value}))}
                    >
                      <option value="belum_diputuskan">-- Belum Diputuskan --</option>
                      <option value="diterima">✅ Banding Diterima (Kompeten)</option>
                      <option value="ditolak">❌ Banding Ditolak (Tetap BK)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Catatan Komite / Hasil Pleno</label>
                  <textarea 
                    rows="4" 
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all resize-none font-medium text-[13px] placeholder:text-[#182D4A]/40"
                    placeholder="Masukkan catatan detail hasil rapat pleno komite di sini..."
                    value={formUpdate.catatan_komite}
                    onChange={(e) => setFormUpdate(p => ({...p, catatan_komite: e.target.value}))}
                  ></textarea>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="mt-8 pt-4 border-t border-[#071E3D]/10 flex justify-end gap-3 pb-2">
                <button 
                  type="button" 
                  className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" 
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
                >
                  <Save size={16} /> Simpan Keputusan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banding;