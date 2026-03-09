import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Edit2, Trash2, X, Save, FileText, 
  Loader2, Settings, User, BookOpen, ExternalLink, CheckCircle, Clock
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

      // Fetch MAPA (Sudah include Skema dan User/Creator dari Backend)
      const response = await api.get('/admin/mapa');
      const mapaData = response.data?.data || response.data || [];
      setData(mapaData);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire('Error', 'Gagal memuat data MAPA', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
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
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/mapa/${id}`);
        Swal.fire('Terhapus!', 'Dokumen MAPA berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_skema || !formData.versi || !formData.jenis) {
      return Swal.fire('Peringatan', 'Harap lengkapi Skema, Versi, dan Jenis MAPA!', 'warning');
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const payload = {
        ...formData,
        id_skema: parseInt(formData.id_skema)
      };

      if (isEditMode) {
        await api.put(`/admin/mapa/${currentId}`, payload);
        Swal.fire('Berhasil', 'Data MAPA diperbarui', 'success');
      } else {
        await api.post('/admin/mapa', payload);
        Swal.fire('Berhasil', 'Dokumen MAPA baru dibuat', 'success');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    }
  };

  // Navigasi ke Detail Pengisian MAPA
  const handleOpenMapa = (item) => {
    if (item.jenis === 'MAPA-01') {
      navigate(`/admin/mapa01/${item.id_mapa}`);
    } else if (item.jenis === 'MAPA-02') {
      navigate(`/admin/mapa02/${item.id_mapa}`);
    }
  };

  // Pencarian
  const filteredData = data.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.skema?.judul_skema?.toLowerCase().includes(term) ||
      item.versi?.toLowerCase().includes(term) ||
      item.jenis?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Manajemen Dokumen MAPA</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola master dokumen Merencanakan Aktivitas dan Proses Asesmen.</p>
        </div>
        <button 
          className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[13px]"
          onClick={() => {
            setFormData(initialFormState);
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Buat MAPA Baru
        </button>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Toolbar & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <FileText size={18} className="text-[#CC6B27]"/> Daftar Dokumen MAPA
          </h4>
          
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Skema, Jenis, atau Versi..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Informasi Dokumen</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Penyusun</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-32 text-center">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-48 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data MAPA...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <FileText size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada dokumen MAPA ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_mapa} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                    
                    {/* Informasi Dokumen */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-[#071E3D] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                          {item.jenis}
                        </span>
                        <span className="text-[11px] font-bold text-[#CC6B27] border border-[#CC6B27]/30 px-2 py-0.5 rounded bg-[#CC6B27]/5">
                          Versi: {item.versi}
                        </span>
                      </div>
                      <div className="font-bold text-[#071E3D] text-[13.5px] leading-snug flex items-start gap-1.5 mt-2">
                        <BookOpen size={14} className="text-[#182D4A] mt-0.5 shrink-0"/> 
                        <span className="line-clamp-2" title={item.skema?.judul_skema}>
                          {item.skema?.judul_skema || <span className="italic text-red-500">Skema Terhapus</span>}
                        </span>
                      </div>
                    </td>

                    {/* Penyusun / Creator */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[#182D4A] text-[13px] font-medium">
                        <User size={14} className="text-[#CC6B27]" />
                        {item.creator?.username || '-'}
                      </div>
                      <div className="text-[10px] text-[#182D4A]/60 mt-1 ml-5">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {item.status === 'final' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-200">
                          <CheckCircle size={12}/> FINAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200">
                          <Clock size={12}/> DRAFT
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => handleOpenMapa(item)} 
                          className="px-3 py-1.5 bg-[#182D4A]/10 text-[#182D4A] hover:bg-[#071E3D] hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 border border-[#182D4A]/20"
                          title="Buka / Isi Dokumen MAPA"
                        >
                          <ExternalLink size={14} /> Buka Form
                        </button>
                        
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white rounded-lg transition-colors shadow-sm" title="Edit Master Data">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id_mapa)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg border border-red-100 transition-colors shadow-sm" title="Hapus MAPA">
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
      </div>

      {/* --- MODAL FORM MASTER MAPA --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D] flex items-center gap-2">
                {isEditMode ? <Edit2 size={18} className="text-[#CC6B27]"/> : <Plus size={18} className="text-[#CC6B27]"/>}
                {isEditMode ? 'Edit Master MAPA' : 'Buat Master MAPA Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Pilih Skema <span className="text-red-500">*</span></label>
                <select name="id_skema" value={formData.id_skema} onChange={handleInputChange} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                  <option value="">-- Pilih Skema Sertifikasi --</option>
                  {skemaList.map(s => (
                    <option key={s.id_skema} value={s.id_skema}>{s.judul_skema}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Versi Dokumen <span className="text-red-500">*</span></label>
                  <input type="text" name="versi" value={formData.versi} onChange={handleInputChange} required placeholder="Cth: 1.0 / 2024" className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Jenis MAPA <span className="text-red-500">*</span></label>
                  <select name="jenis" value={formData.jenis} onChange={handleInputChange} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                    <option value="MAPA-01">MAPA-01</option>
                    <option value="MAPA-02">MAPA-02</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#071E3D]">Status Penyusunan</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                  <option value="draft">Draft (Sedang Disusun)</option>
                  <option value="final">Final (Selesai)</option>
                </select>
              </div>

              <div className="pt-5 border-t border-[#071E3D]/10 mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                  <Save size={16}/> Simpan Data
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