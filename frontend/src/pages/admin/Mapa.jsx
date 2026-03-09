import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Edit2, Trash2, X, Save, FileText, 
  Loader2, Settings 
} from 'lucide-react';

const Mapa = () => {
  const navigate = useNavigate();

  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Modal Master MAPA
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- FORM STATE MASTER MAPA ---
  const initialFormState = {
    id_skema: '',
    versi: '',
    jenis: 'MAPA-01',
    status: 'draft'
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA MASTER ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Skema untuk Dropdown
      const skemaRes = await api.get('/admin/skema');
      const skemaData = skemaRes.data?.data || skemaRes.data || [];
      setSkemaList(skemaData);

      // Fetch MAPA
      const response = await api.get('/admin/mapa');
      const resBody = response.data !== undefined ? response.data : response;
      let listData = [];
      if (Array.isArray(resBody.data)) listData = resBody.data;
      else if (resBody.data?.data && Array.isArray(resBody.data.data)) listData = resBody.data.data;
      else if (Array.isArray(resBody)) listData = resBody;

      setData(listData);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire({
          title: 'Gagal', 
          text: 'Gagal memuat data MAPA. Pastikan Anda login dengan Role yang sesuai (Admin/Asesor).', 
          icon: 'error',
          confirmButtonColor: '#CC6B27'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS MASTER MAPA ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_mapa);
    setFormData({
      id_skema: item.id_skema || '',
      versi: item.versi || '',
      jenis: item.jenis || 'MAPA-01',
      status: item.status || 'draft'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Dokumen MAPA?',
      text: "Semua data turunan (MAPA-01/02) terkait akan ikut terhapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/mapa/${id}`);
        Swal.fire({title: 'Terhapus!', text: 'Data MAPA telah dihapus.', icon: 'success', confirmButtonColor: '#CC6B27'});
        fetchData();
      } catch (error) {
        Swal.fire({title: 'Gagal!', text: 'Gagal menghapus data', icon: 'error', confirmButtonColor: '#CC6B27'});
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/admin/mapa/${currentId}`, formData);
        Swal.fire({title: 'Berhasil', text: 'Dokumen MAPA diperbarui', icon: 'success', confirmButtonColor: '#CC6B27'});
      } else {
        await api.post('/admin/mapa', formData);
        Swal.fire({title: 'Berhasil', text: 'Dokumen MAPA baru dibuat', icon: 'success', confirmButtonColor: '#CC6B27'});
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire({title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan server', icon: 'error', confirmButtonColor: '#CC6B27'});
    }
  };

  // --- FILTER ---
  const filteredData = data.filter(item => 
    (item.versi && item.versi.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.skema?.judul_skema && item.skema.judul_skema.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Perencanaan Asesmen (MAPA)</h1>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola dokumen MAPA-01 dan MAPA-02</p>
        </div>
        <button 
          onClick={() => {
            setFormData(initialFormState);
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="bg-[#CC6B27] text-white px-4 py-2 rounded-lg hover:bg-[#a8561f] shadow-sm transition-all font-bold flex items-center gap-2 text-[13px]"
        >
          <Plus size={18} /> Buat Dokumen MAPA
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* Toolbar */}
        <div className="w-full md:w-80 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan versi atau judul skema..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Skema Terkait</th>
                <th className="px-4 py-3.5 text-center">Versi</th>
                <th className="px-4 py-3.5 text-center">Jenis MAPA</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center w-48">Aksi / Pengisian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27]" size={36}/>
                    <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-[#182D4A]/50 font-medium text-[14px]">
                    Belum ada dokumen MAPA
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_mapa} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="px-4 py-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px] max-w-sm truncate" title={item.skema?.judul_skema || `ID Skema: ${item.id_skema}`}>
                        {item.skema?.judul_skema || `ID Skema: ${item.id_skema}`}
                      </div>
                      <div className="text-[12px] text-[#182D4A]/70 font-mono mt-0.5 font-medium">Kode: {item.skema?.kode_skema || '-'}</div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-[#182D4A] text-[13.5px]">{item.versi}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold ${
                        item.jenis === 'MAPA-01' ? 'bg-[#071E3D]/10 text-[#071E3D]' : 'bg-[#CC6B27]/10 text-[#CC6B27]'
                      }`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                        item.status === 'final' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-2">
                        {item.jenis === 'MAPA-01' ? (
                            <button onClick={() => navigate(`/admin/asesi/mapa/${item.id_mapa}/m01`)} className="w-full justify-center px-3 py-2 bg-[#FAFAFA] text-[#071E3D] rounded-lg border border-[#071E3D]/20 hover:bg-[#071E3D]/10 hover:border-[#071E3D]/30 text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-sm">
                              <FileText size={14} className="text-[#CC6B27]"/> Isi Rencana (M01)
                            </button>
                        ) : (
                            <button onClick={() => navigate(`/admin/asesi/mapa/${item.id_mapa}/m02`)} className="w-full justify-center px-3 py-2 bg-[#FAFAFA] text-[#071E3D] rounded-lg border border-[#071E3D]/20 hover:bg-[#071E3D]/10 hover:border-[#071E3D]/30 text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-sm">
                              <Settings size={14} className="text-[#CC6B27]"/> Isi Mapping (M02)
                            </button>
                        )}
                        
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Edit Master"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id_mapa)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL 1: MASTER MAPA (CREATE/EDIT)
      ========================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {isEditMode ? <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Master MAPA</> : <><Plus size={20} className="text-[#CC6B27]"/> Buat Master MAPA Baru</>}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Pilih Skema Sertifikasi <span className="text-red-500">*</span></label>
                <select name="id_skema" value={formData.id_skema} onChange={handleInputChange} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="">-- Pilih Skema --</option>
                  {skemaList.map(skema => (
                    <option key={skema.id_skema} value={skema.id_skema}>{skema.kode_skema} - {skema.judul_skema}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Versi / Tahun <span className="text-red-500">*</span></label>
                  <input type="text" name="versi" value={formData.versi} onChange={handleInputChange} placeholder="Contoh: 2024.1" required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Jenis Dokumen</label>
                  <select name="jenis" value={formData.jenis} onChange={handleInputChange} disabled={isEditMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none disabled:opacity-70 disabled:bg-gray-100">
                    <option value="MAPA-01">MAPA-01 (Rencana)</option>
                    <option value="MAPA-02">MAPA-02 (Mapping)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Status Penyusunan</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                  <option value="draft">Draft (Sedang Disusun)</option>
                  <option value="final">Final (Selesai)</option>
                </select>
              </div>

              <div className="pt-5 border-t border-[#071E3D]/10 mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                  <Save size={16}/> Simpan Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Mapa;