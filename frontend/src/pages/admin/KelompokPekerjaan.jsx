import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, ArrowLeft, Briefcase 
} from 'lucide-react';

const KelompokPekerjaan = () => {
  const { id } = useParams(); // Mendapatkan id_skema dari URL
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // State Form
  const initialFormState = {
    id_skema: id,
    nama_kelompok: '',
    deskripsi: '',
    urutan: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Menyesuaikan dengan controller getBySkema
      const response = await api.get(`/admin/kelompok-pekerjaan/skema/${id}`);
      setData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Gagal memuat data kelompok pekerjaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_kelompok);
    setFormData({
      id_skema: item.id_skema,
      nama_kelompok: item.nama_kelompok || '',
      deskripsi: item.deskripsi || '',
      urutan: item.urutan || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id_kelompok) => {
    const result = await Swal.fire({
      title: 'Hapus Kelompok Pekerjaan?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/kelompok-pekerjaan/${id_kelompok}`);
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: "Memproses...", text: "Mohon tunggu", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (isEditMode) {
        await api.put(`/admin/kelompok-pekerjaan/${currentId}`, formData);
        Swal.fire('Berhasil', 'Data berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/kelompok-pekerjaan', formData);
        Swal.fire('Berhasil', 'Data baru ditambahkan', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    }
  };

  // --- FILTER ---
  const filteredData = data.filter(item => 
    item.nama_kelompok && item.nama_kelompok.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/skema')}
            className="p-2 bg-[#FAFAFA] hover:bg-[#E2E8F0] border border-[#071E3D]/10 rounded-lg text-[#182D4A] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Kelompok Pekerjaan</h2>
            <p className="text-[14px] text-[#182D4A] m-0">Kelola pemetaan kelompok pekerjaan pada skema.</p>
          </div>
        </div>
        <button 
          className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
          onClick={() => {
            setFormData(initialFormState);
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Tambah Kelompok
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <Briefcase size={18} className="text-[#CC6B27]"/> Daftar Kelompok Pekerjaan
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari nama kelompok..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-16 text-center">Urutan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Kelompok</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-1/3">Deskripsi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <Briefcase size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada kelompok pekerjaan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id_kelompok} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-[#CC6B27]">{item.urutan || '-'}</td>
                    <td className="py-4 px-4 font-bold text-[#071E3D] text-[13.5px]">{item.nama_kelompok}</td>
                    <td className="py-4 px-4 text-[#182D4A]/80 text-[13px]">{item.deskripsi || '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="inline-flex items-center justify-center p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm h-[34px] w-[34px]" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id_kelompok)} 
                          className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent h-[34px] w-[34px]" 
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
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
                {isEditMode ? <Edit2 size={18} className="text-[#CC6B27]"/> : <Plus size={18} className="text-[#CC6B27]"/>}
                {isEditMode ? 'Edit Kelompok Pekerjaan' : 'Tambah Kelompok Pekerjaan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6">
              <form id="kelompokForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                <div>
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Urutan <span className="text-red-500">*</span></label>
                  <input type="number" name="urutan" value={formData.urutan} onChange={handleInputChange} required 
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Nama Kelompok <span className="text-red-500">*</span></label>
                  <input type="text" name="nama_kelompok" value={formData.nama_kelompok} onChange={handleInputChange} required 
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"/>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Deskripsi</label>
                  <textarea name="deskripsi" rows="3" value={formData.deskripsi} onChange={handleInputChange} 
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] resize-none"></textarea>
                </div>

              </form>
            </div>

            <div className="border-t border-[#071E3D]/10 px-6 py-4 flex justify-end gap-3 bg-[#FAFAFA]">
              <button 
                type="button" 
                className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" 
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="kelompokForm" 
                className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
              >
                <Save size={16}/> Simpan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KelompokPekerjaan;