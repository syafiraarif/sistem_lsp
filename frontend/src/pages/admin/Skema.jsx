import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, FileText, Upload, BookOpen
} from 'lucide-react';

const Skema = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- STATE KHUSUS FILE ---
  const [selectedFile, setSelectedFile] = useState(null);

  // State Form (Default)
  const initialFormState = {
    kode_skema: '',
    judul_skema: '',
    judul_skema_en: '',
    jenis_skema: 'kkni',
    level_kkni: '', 
    bidang_okupasi: '',
    kode_sektor: '',
    kode_kbli: '',
    kode_kbji: '',
    keterangan_bukti: '',
    skor_min_ai05: '',
    kedalaman_bukti: 'elemen_kompetensi',
    dokumen: '', // Hanya untuk menyimpan nama file lama saat edit
    status: 'draft'
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/skema');
      const resultData = response.data.data || [];
      setData(resultData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Gagal memuat data skema', 'error');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_skema);
    setSelectedFile(null); 
    
    setFormData({
      kode_skema: item.kode_skema || '',
      judul_skema: item.judul_skema || '',
      judul_skema_en: item.judul_skema_en || '',
      jenis_skema: item.jenis_skema || 'kkni',
      level_kkni: item.level_kkni || '',
      bidang_okupasi: item.bidang_okupasi || '',
      kode_sektor: item.kode_sektor || '',
      kode_kbli: item.kode_kbli || '',
      kode_kbji: item.kode_kbji || '',
      keterangan_bukti: item.keterangan_bukti || '',
      skor_min_ai05: item.skor_min_ai05 || '',
      kedalaman_bukti: item.kedalaman_bukti || 'elemen_kompetensi',
      dokumen: item.dokumen || '', 
      status: item.status || 'draft'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Skema?',
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
        await api.delete(`/admin/skema/${id}`);
        Swal.fire('Terhapus!', 'Skema telah dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      if (key !== 'dokumen' && formData[key] !== null && formData[key] !== undefined) {
        dataToSend.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      dataToSend.append('dokumen', selectedFile);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    try {
      Swal.fire({ title: "Memproses...", text: "Mohon tunggu", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (isEditMode) {
        await api.put(`/admin/skema/${currentId}`, dataToSend, config);
        Swal.fire('Berhasil', 'Data skema diperbarui', 'success');
      } else {
        await api.post('/admin/skema', dataToSend, config);
        Swal.fire('Berhasil', 'Skema baru ditambahkan', 'success');
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
    (item.judul_skema && item.judul_skema.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.kode_skema && item.kode_skema.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data Skema Sertifikasi</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola daftar skema kompetensi LSP</p>
        </div>
        <button 
          className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
          onClick={() => {
            setFormData(initialFormState);
            setSelectedFile(null);
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Tambah Skema
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <BookOpen size={18} className="text-[#CC6B27]"/> Daftar Skema
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari kode atau judul skema..." 
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
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-32">Kode</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul Skema</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-24 text-center">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-56">Kelola Persyaratan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <BookOpen size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data skema ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_skema} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                    <td className="py-4 px-4 font-mono text-[13px] font-bold text-[#CC6B27]">{item.kode_skema}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px]">{item.judul_skema}</div>
                      <div className="text-[11px] font-bold text-[#182D4A]/60 mt-1 tracking-wide">
                        {item.jenis_skema.toUpperCase()} {item.level_kkni ? `• LEVEL ${item.level_kkni}` : ''}
                      </div>
                      
                      {item.dokumen && (
                        <div className="mt-2">
                           <a 
                             href={`${import.meta.env.VITE_API_URL}${item.dokumen}`} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#182D4A]/5 text-[#182D4A] hover:bg-[#182D4A]/10 rounded border border-[#182D4A]/20 text-[11px] font-bold transition-colors"
                           >
                             <FileText size={12} /> Buka Dokumen Skema
                           </a>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border capitalize
                        ${item.status === 'aktif' ? 'bg-green-50 text-green-600 border-green-200' : 
                          item.status === 'nonaktif' ? 'bg-red-50 text-red-600 border-red-200' : 
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <button 
                          onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan`)}
                          className="w-full max-w-[140px] px-3 py-1.5 bg-[#FAFAFA] text-[#182D4A] rounded-md border border-[#071E3D]/20 hover:bg-[#182D4A]/5 text-[11px] font-bold transition-colors"
                        >
                          Persyaratan Dasar
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan-tuk`)}
                          className="w-full max-w-[140px] px-3 py-1.5 bg-[#CC6B27]/5 text-[#CC6B27] rounded-md border border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 text-[11px] font-bold transition-colors"
                        >
                          Persyaratan TUK
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="inline-flex p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id_skema)} className="inline-flex p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent" title="Hapus">
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
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
                {isEditMode ? <Edit2 size={18} className="text-[#CC6B27]"/> : <Plus size={18} className="text-[#CC6B27]"/>}
                {isEditMode ? 'Edit Data Skema' : 'Tambah Skema Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="skemaForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode Skema</label>
                    <input type="text" name="kode_skema" value={formData.kode_skema} onChange={handleInputChange} required 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Status Skema</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                      <option value="draft">Draft</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Judul Skema (Indonesia)</label>
                    <input type="text" name="judul_skema" value={formData.judul_skema} onChange={handleInputChange} required 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"/>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Judul Skema (Inggris)</label>
                    <input type="text" name="judul_skema_en" value={formData.judul_skema_en} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#071E3D]/10 pt-4 mt-2">
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Jenis Skema</label>
                    <select name="jenis_skema" value={formData.jenis_skema} onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                      <option value="kkni">KKNI</option>
                      <option value="okupasi">Okupasi</option>
                      <option value="klaster">Klaster</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Level KKNI</label>
                    <select name="level_kkni" value={formData.level_kkni} onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                      <option value="">-- Pilih Level --</option>
                      {[1,2,3,4,5,6,7,8,9].map(num => <option key={num} value={num}>Level {num}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Bidang Okupasi</label>
                    <input type="text" name="bidang_okupasi" value={formData.bidang_okupasi} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode Sektor</label>
                    <input type="text" name="kode_sektor" value={formData.kode_sektor} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode KBLI</label>
                    <input type="text" name="kode_kbli" value={formData.kode_kbli} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode KBJI</label>
                    <input type="text" name="kode_kbji" value={formData.kode_kbji} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#071E3D]/10 pt-4 mt-2">
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kedalaman Bukti</label>
                    <select name="kedalaman_bukti" value={formData.kedalaman_bukti} onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                      <option value="elemen_kompetensi">Elemen Kompetensi</option>
                      <option value="kriteria_unjuk_kerja">Kriteria Unjuk Kerja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Skor Min. Penilaian (AI 05)</label>
                    <input type="number" name="skor_min_ai05" value={formData.skor_min_ai05} onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Keterangan Bukti</label>
                  <textarea name="keterangan_bukti" rows="2" value={formData.keterangan_bukti} onChange={handleInputChange} 
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] resize-none"></textarea>
                </div>
                
                {/* --- INPUT FILE DOKUMEN --- */}
                <div className="bg-[#182D4A]/5 p-5 rounded-lg border border-[#182D4A]/20 mt-2">
                  <label className="block text-[13px] font-bold text-[#071E3D] mb-2 flex items-center gap-2">
                    <Upload size={16} className="text-[#CC6B27]"/> Unggah Dokumen Skema (PDF/DOC)
                  </label>
                  
                  <input 
                    type="file" 
                    name="dokumen" 
                    onChange={handleFileChange} 
                    accept=".pdf,.doc,.docx"
                    className="block w-full text-[12px] text-[#182D4A]
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-[12px] file:font-bold
                      file:bg-[#071E3D] file:text-white
                      hover:file:bg-[#182D4A] file:cursor-pointer file:transition-colors
                      cursor-pointer"
                  />
                  
                  {isEditMode && formData.dokumen && !selectedFile && (
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-[#CC6B27] font-bold bg-[#CC6B27]/10 p-2 rounded-md w-fit border border-[#CC6B27]/20">
                      <FileText size={14} />
                      <span>File Tersimpan: {formData.dokumen.split('/').pop()}</span>
                    </div>
                  )}
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
                form="skemaForm" 
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

export default Skema;