import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, FileText, 
  Filter, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';

const DokumenMutu = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState(''); 
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'detail'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Pagination (Client Side)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Form State
  const initialFormState = {
    jenis_dokumen: 'kebijakan_mutu',
    kategori: '',
    nama_dokumen: '',
    deskripsi: '',
    nomor_dokumen: '',
    nomor_revisi: '',
    penyusun: '',
    disahkan_oleh: '',
    tanggal_dokumen: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // State Khusus File
  const [files, setFiles] = useState({
    file_dokumen: null,
    file_pendukung: null
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dokumen-mutu');
      
      const resBody = response.data !== undefined ? response.data : response;

      let listData = [];
      if (Array.isArray(resBody.data)) {
          listData = resBody.data;
      } else if (resBody.data?.data && Array.isArray(resBody.data.data)) {
          listData = resBody.data.data;
      } else if (Array.isArray(resBody)) {
          listData = resBody;
      }

      setData(listData);

    } catch (error) {
      console.error("Error Fetching:", error);
      Swal.fire({
        title: 'Gagal', 
        text: error.response?.data?.message || 'Gagal mengambil data dari server.', 
        icon: 'error'
      });
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);

    if (type === 'create') {
      setFormData(initialFormState);
      setFiles({ file_dokumen: null, file_pendukung: null });
    } else if (item) {
      setFormData({
        jenis_dokumen: item.jenis_dokumen || 'kebijakan_mutu',
        kategori: item.kategori || '',
        nama_dokumen: item.nama_dokumen || '',
        deskripsi: item.deskripsi || '',
        nomor_dokumen: item.nomor_dokumen || '',
        nomor_revisi: item.nomor_revisi || '',
        penyusun: item.penyusun || '',
        disahkan_oleh: item.disahkan_oleh || '',
        tanggal_dokumen: item.tanggal_dokumen ? item.tanggal_dokumen.split('T')[0] : ''
      });
      setFiles({ file_dokumen: null, file_pendukung: null });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Dokumen?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/dokumen-mutu/${id}`);
        Swal.fire('Terhapus!', 'Dokumen berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  // --- SUBMIT HANDLE (CREATE & UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_dokumen || !formData.jenis_dokumen) {
      Swal.fire('Peringatan', 'Nama Dokumen dan Jenis Dokumen wajib diisi!', 'warning');
      return;
    }

    const dataPayload = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        dataPayload.append(key, formData[key]);
      }
    });

    if (files.file_dokumen) {
      dataPayload.append('file_dokumen', files.file_dokumen);
    }
    if (files.file_pendukung) {
      dataPayload.append('file_pendukung', files.file_pendukung);
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (modalType === 'create') {
        await api.post('/admin/dokumen-mutu', dataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Berhasil', 'Dokumen mutu berhasil ditambahkan', 'success');
      } else {
        await api.put(`/admin/dokumen-mutu/${selectedItem.id_dokumen}`, dataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Berhasil', 'Dokumen mutu berhasil diperbarui', 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    }
  };

  // Helper Warna Badge
  const getBadgeColor = (jenis) => {
    switch(jenis) {
      case 'kebijakan_mutu': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'manual_mutu': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'standar_mutu': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'formulir_mutu': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // --- FILTER & PAGINATION ---
  const filteredData = data.filter(item => {
    const matchSearch = item.nama_dokumen?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.nomor_dokumen?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJenis = filterJenis ? item.jenis_dokumen === filterJenis : true;
    return matchSearch && matchJenis;
  });

  const totalPages = Math.ceil(filteredData.length / pagination.limit) || 1;
  const paginatedData = filteredData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Dokumen Mutu</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Manajemen dokumen ISO 9001:2015 & regulasi LSP</p>
        </div>
        <button 
          className="px-4 py-2 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2 text-[13px]" 
          onClick={() => openModal('create')}
        >
          <Plus size={18}/> Tambah Dokumen
        </button>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* TOOLBAR (SEARCH & FILTER) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Nama / No. Dokumen..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          
          <div className="relative group w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors z-10"/>
              <select 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] appearance-none"
                value={filterJenis} 
                onChange={(e) => {
                  setFilterJenis(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                  <option value="">Semua Jenis Dokumen</option>
                  <option value="kebijakan_mutu">Kebijakan Mutu</option>
                  <option value="manual_mutu">Manual Mutu</option>
                  <option value="standar_mutu">Standar Mutu</option>
                  <option value="formulir_mutu">Formulir Mutu</option>
                  <option value="referensi">Referensi</option>
              </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Dokumen</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Jenis</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">No. Dokumen</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Revisi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Tanggal</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Sedang memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id_dokumen} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold text-center">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="py-4 px-4 text-[#071E3D] font-bold text-[13.5px] max-w-xs truncate" title={item.nama_dokumen}>{item.nama_dokumen}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 text-[11px] rounded-full border font-bold capitalize ${getBadgeColor(item.jenis_dokumen)}`}>
                        {item.jenis_dokumen?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13.5px] font-medium">{item.nomor_dokumen || '-'}</td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13.5px] text-center font-bold">{item.nomor_revisi || '-'}</td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13.5px]">{item.tanggal_dokumen ? new Date(item.tanggal_dokumen).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors" 
                          title="Detail" 
                          onClick={() => openModal('detail', item)}
                        >
                          <Eye size={18}/>
                        </button>
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" 
                          title="Edit" 
                          onClick={() => openModal('edit', item)}
                        >
                          <Edit2 size={18}/>
                        </button>
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" 
                          title="Hapus" 
                          onClick={() => handleDelete(item.id_dokumen)}
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Data tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-[13px] text-[#182D4A] font-medium">
              <span>
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, filteredData.length)} dari {filteredData.length} data
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

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {modalType === 'create' && <><Plus size={20} className="text-[#CC6B27]"/> Tambah Dokumen Baru</>}
                {modalType === 'edit' && <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Dokumen Mutu</>}
                {modalType === 'detail' && <><Eye size={20} className="text-[#CC6B27]"/> Detail Dokumen</>}
              </h3>
              <button 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-5 space-y-6">
                
                {/* Section 1: Info Utama */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2">Informasi Utama</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Jenis Dokumen <span className="text-red-500">*</span></label>
                          <select 
                              className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                              name="jenis_dokumen" 
                              value={formData.jenis_dokumen} 
                              onChange={handleInputChange}
                              disabled={modalType === 'detail'}
                          >
                              <option value="kebijakan_mutu">Kebijakan Mutu</option>
                              <option value="manual_mutu">Manual Mutu</option>
                              <option value="standar_mutu">Standar Mutu</option>
                              <option value="formulir_mutu">Formulir Mutu</option>
                              <option value="referensi">Referensi</option>
                          </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Kategori</label>
                          <input 
                              className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40 disabled:opacity-70 disabled:bg-gray-100"
                              type="text" 
                              name="kategori" 
                              value={formData.kategori} 
                              onChange={handleInputChange} 
                              placeholder="Contoh: Internal / Eksternal"
                              disabled={modalType === 'detail'}
                          />
                      </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-4">
                      <label className="text-[13px] font-bold text-[#071E3D]">Nama Dokumen <span className="text-red-500">*</span></label>
                      <input 
                          className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40 disabled:opacity-70 disabled:bg-gray-100"
                          type="text" 
                          name="nama_dokumen" 
                          value={formData.nama_dokumen} 
                          onChange={handleInputChange} 
                          placeholder="Nama dokumen lengkap"
                          disabled={modalType === 'detail'}
                          required
                      />
                  </div>

                  <div className="flex flex-col gap-1.5 mt-4">
                      <label className="text-[13px] font-bold text-[#071E3D]">Deskripsi</label>
                      <textarea 
                          className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all resize-none font-medium text-[13px] placeholder:text-[#182D4A]/40 disabled:opacity-70 disabled:bg-gray-100"
                          name="deskripsi" 
                          value={formData.deskripsi} 
                          onChange={handleInputChange} 
                          rows="3"
                          disabled={modalType === 'detail'}
                      ></textarea>
                  </div>
                </div>

                {/* Section 2: Detail Teknis */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2">Detail Teknis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Nomor Dokumen</label>
                          <input 
                            className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                            type="text" name="nomor_dokumen" value={formData.nomor_dokumen} onChange={handleInputChange} disabled={modalType === 'detail'} 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Nomor Revisi</label>
                          <input 
                            className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                            type="text" name="nomor_revisi" value={formData.nomor_revisi} onChange={handleInputChange} disabled={modalType === 'detail'} 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Tanggal Dokumen</label>
                          <input 
                            className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                            type="date" name="tanggal_dokumen" value={formData.tanggal_dokumen} onChange={handleInputChange} disabled={modalType === 'detail'} 
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Penyusun</label>
                          <input 
                            className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                            type="text" name="penyusun" value={formData.penyusun} onChange={handleInputChange} disabled={modalType === 'detail'} 
                          />
                      </div>
                      <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-bold text-[#071E3D]">Disahkan Oleh</label>
                          <input 
                            className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"
                            type="text" name="disahkan_oleh" value={formData.disahkan_oleh} onChange={handleInputChange} disabled={modalType === 'detail'} 
                          />
                      </div>
                  </div>
                </div>

                {/* Section 3: File Upload */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2">Upload File</h4>
                  <div className="space-y-4 bg-[#FAFAFA] p-5 rounded-lg border border-dashed border-[#071E3D]/30">
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-[#071E3D]">File Dokumen Utama (PDF/Docx)</label>
                        {modalType !== 'detail' && (
                            <input 
                                type="file" 
                                onChange={(e) => handleFileChange(e, 'file_dokumen')} 
                                className="block w-full text-[13px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-bold file:bg-[#071E3D]/10 file:text-[#071E3D] hover:file:bg-[#071E3D]/20 transition-all cursor-pointer" 
                                accept=".pdf,.doc,.docx"
                            />
                        )}
                        {selectedItem?.file_dokumen && (
                            <div className="flex items-center gap-2 mt-1.5 text-[13px] bg-white px-3 py-2 border border-[#071E3D]/10 rounded-lg shadow-sm w-fit font-medium">
                                <FileText size={16} className="text-[#CC6B27]"/>
                                <a href={`http://localhost:3000/uploads/${selectedItem.file_dokumen}`} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:text-[#071E3D] transition-colors">
                                  {selectedItem.file_dokumen}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-[#071E3D]/20">
                        <label className="text-[13px] font-bold text-[#071E3D]">File Pendukung / Lampiran</label>
                        {modalType !== 'detail' && (
                            <input 
                                type="file" 
                                onChange={(e) => handleFileChange(e, 'file_pendukung')} 
                                className="block w-full text-[13px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-bold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27]/20 transition-all cursor-pointer"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                            />
                        )}
                        {selectedItem?.file_pendukung && (
                            <div className="flex items-center gap-2 mt-1.5 text-[13px] bg-white px-3 py-2 border border-[#071E3D]/10 rounded-lg shadow-sm w-fit font-medium">
                                <FileText size={16} className="text-[#CC6B27]"/>
                                <a href={`http://localhost:3000/uploads/${selectedItem.file_pendukung}`} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:text-[#071E3D] transition-colors">
                                  {selectedItem.file_pendukung}
                                </a>
                            </div>
                        )}
                    </div>

                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" 
                  onClick={() => setShowModal(false)}
                >
                  {modalType === 'detail' ? 'Tutup' : 'Batal'}
                </button>
                {modalType !== 'detail' && (
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
                  >
                    <Save size={16} /> Simpan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DokumenMutu;