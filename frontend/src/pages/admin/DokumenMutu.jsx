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

  // Error state untuk validasi manual
  const [errors, setErrors] = useState({});

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

  // State Khusus File & Preview
  const [files, setFiles] = useState({
    file_dokumen: null,
    file_pendukung: null
  });
  
  const [previewUrlUtama, setPreviewUrlUtama] = useState(null);
  const [showFullPreviewUtama, setShowFullPreviewUtama] = useState(false);
  
  const [previewUrlPendukung, setPreviewUrlPendukung] = useState(null);
  const [showFullPreviewPendukung, setShowFullPreviewPendukung] = useState(false);

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

  // --- HELPER UNTUK URL DAN TIPE FILE ---
  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    const cleanPath = path.replace(/^(\/?uploads\/|\/)/, '');
    return `http://localhost:3000/uploads/${cleanPath}`;
  };

  // PERBAIKAN: Baca ektensi dari file fisik (jika ada) saat upload baru (blob)
  const isPdfFile = (filename, fieldName) => {
    const checkName = files[fieldName] ? files[fieldName].name : filename;
    return checkName && /\.(pdf)$/i.test(checkName);
  };
  
  const isImageFile = (filename, fieldName) => {
    const checkName = files[fieldName] ? files[fieldName].name : filename;
    return checkName && /\.(jpg|jpeg|png|gif|webp)$/i.test(checkName);
  };

  const isPreviewable = (filename, fieldName) => isPdfFile(filename, fieldName) || isImageFile(filename, fieldName);

  // --- VALIDASI MANUAL ---
  const validateInput = (name, value) => {
    let errorMsg = '';
    if (typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 3) {
      errorMsg = 'Terlalu pendek (minimal 4 karakter).';
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateInput(name, value);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      
      if (fieldName === 'file_dokumen') {
        setPreviewUrlUtama(url);
      } else if (fieldName === 'file_pendukung') {
        setPreviewUrlPendukung(url);
      }
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    setErrors({});
    setShowFullPreviewUtama(false);
    setShowFullPreviewPendukung(false);

    if (type === 'create') {
      setFormData(initialFormState);
      setFiles({ file_dokumen: null, file_pendukung: null });
      setPreviewUrlUtama(null);
      setPreviewUrlPendukung(null);
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
      
      setPreviewUrlUtama(item.file_dokumen || null);
      setPreviewUrlPendukung(item.file_pendukung || null);
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
        Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/dokumen-mutu/${id}`);
        Swal.fire('Terhapus!', 'Dokumen berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) {
      Swal.fire('Peringatan', 'Silakan perbaiki kolom isian yang terlalu pendek!', 'warning');
      return;
    }

    if (!formData.nama_dokumen || !formData.jenis_dokumen) {
      Swal.fire('Peringatan', 'Nama Dokumen dan Jenis Dokumen wajib diisi!', 'warning');
      return;
    }

    const actionText = modalType === 'create' ? 'menambahkan' : 'menyimpan perubahan pada';
    const confirm = await Swal.fire({
      title: 'Konfirmasi',
      text: `Apakah Anda yakin ingin ${actionText} dokumen mutu ini?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Simpan'
    });

    if (!confirm.isConfirmed) return;

    const dataPayload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        dataPayload.append(key, formData[key]);
      }
    });

    if (files.file_dokumen) dataPayload.append('file_dokumen', files.file_dokumen);
    if (files.file_pendukung) dataPayload.append('file_pendukung', files.file_pendukung);

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

  const inputClass = (name) => `w-full p-2.5 border rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 placeholder:text-[#182D4A]/40
    ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10'}
  `;

  // Filter & Pagination
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
        
        {/* TOOLBAR */}
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

      {/* --- MODAL FORM & DETAIL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {modalType === 'create' && <><Plus size={20} className="text-[#CC6B27]"/> Tambah Dokumen Baru</>}
                {modalType === 'edit' && <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Dokumen Mutu</>}
                {modalType === 'detail' && <><Eye size={20} className="text-[#CC6B27]"/> Detail Dokumen</>}
              </h3>
              <button 
                type="button"
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-5 space-y-6">
                
                {/* Bagian Form: Full Width */}
                <div>
                    <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-2">Informasi Utama</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5 lg:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Nama Dokumen <span className="text-red-500">*</span></label>
                            <input className={inputClass('nama_dokumen')} type="text" name="nama_dokumen" value={formData.nama_dokumen} onChange={handleInputChange} placeholder="Nama dokumen lengkap" disabled={modalType === 'detail'} required />
                            {errors.nama_dokumen && <span className="text-[11px] text-red-500 font-medium">{errors.nama_dokumen}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Jenis Dokumen <span className="text-red-500">*</span></label>
                            <select className={inputClass('jenis_dokumen')} name="jenis_dokumen" value={formData.jenis_dokumen} onChange={handleInputChange} disabled={modalType === 'detail'}>
                                <option value="kebijakan_mutu">Kebijakan Mutu</option>
                                <option value="manual_mutu">Manual Mutu</option>
                                <option value="standar_mutu">Standar Mutu</option>
                                <option value="formulir_mutu">Formulir Mutu</option>
                                <option value="referensi">Referensi</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Kategori</label>
                            <input className={inputClass('kategori')} type="text" name="kategori" value={formData.kategori} onChange={handleInputChange} placeholder="Internal / Eksternal" disabled={modalType === 'detail'} />
                            {errors.kategori && <span className="text-[11px] text-red-500 font-medium">{errors.kategori}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5 lg:col-span-4">
                            <label className="text-[13px] font-bold text-[#071E3D]">Deskripsi</label>
                            <textarea className={`${inputClass('deskripsi')} resize-none`} name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} rows="2" disabled={modalType === 'detail'}></textarea>
                            {errors.deskripsi && <span className="text-[11px] text-red-500 font-medium">{errors.deskripsi}</span>}
                        </div>

                        {/* Baris Kedua form */}
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Nomor Dokumen</label>
                            <input className={inputClass('nomor_dokumen')} type="text" name="nomor_dokumen" value={formData.nomor_dokumen} onChange={handleInputChange} disabled={modalType === 'detail'} />
                            {errors.nomor_dokumen && <span className="text-[11px] text-red-500 font-medium">{errors.nomor_dokumen}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Nomor Revisi</label>
                            <input className={inputClass('nomor_revisi')} type="text" name="nomor_revisi" value={formData.nomor_revisi} onChange={handleInputChange} disabled={modalType === 'detail'} />
                            {errors.nomor_revisi && <span className="text-[11px] text-red-500 font-medium">{errors.nomor_revisi}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Penyusun</label>
                            <input className={inputClass('penyusun')} type="text" name="penyusun" value={formData.penyusun} onChange={handleInputChange} disabled={modalType === 'detail'} />
                            {errors.penyusun && <span className="text-[11px] text-red-500 font-medium">{errors.penyusun}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                            <label className="text-[13px] font-bold text-[#071E3D]">Disahkan Oleh</label>
                            <input className={inputClass('disahkan_oleh')} type="text" name="disahkan_oleh" value={formData.disahkan_oleh} onChange={handleInputChange} disabled={modalType === 'detail'} />
                            {errors.disahkan_oleh && <span className="text-[11px] text-red-500 font-medium">{errors.disahkan_oleh}</span>}
                        </div>
                    </div>
                </div>

                {/* Bagian File Upload & Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#071E3D]/10">
                    
                    {/* Kolom 1: File Utama */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 m-0 pb-2 border-b border-[#CC6B27]/20">
                            <FileText size={16}/> Dokumen Utama
                        </h4>
                        
                        <div className="bg-[#FAFAFA] p-4 rounded-lg border border-dashed border-[#071E3D]/30">
                            <label className="block text-[13px] font-bold text-[#071E3D] mb-2">Upload Dokumen Utama (PDF) <span className="text-red-500">*</span></label>
                            {modalType !== 'detail' && (
                                <input 
                                  type="file" name="file_dokumen" accept=".pdf" onChange={(e) => handleFileChange(e, 'file_dokumen')} 
                                  className="block w-full text-[12px] text-[#182D4A] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27] hover:file:text-white cursor-pointer transition-colors border border-[#071E3D]/20 rounded-lg bg-white p-1"
                                />
                            )}
                            {selectedItem?.file_dokumen && !files.file_dokumen && (
                                <div className="mt-2 text-[12px] font-medium text-[#182D4A] bg-[#E2E8F0] px-3 py-2 rounded border border-[#071E3D]/10 break-all">
                                    Tersimpan: <a href={buildFileUrl(selectedItem.file_dokumen)} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:underline">{selectedItem.file_dokumen}</a>
                                </div>
                            )}
                        </div>

                        {/* Preview Dokumen Utama */}
                        <div className="border border-[#071E3D]/20 rounded-lg flex flex-col overflow-hidden min-h-[300px]">
                            <div className="bg-gray-100 px-3 py-2 text-[11px] font-bold text-[#182D4A] flex justify-between items-center border-b border-[#071E3D]/20">
                                <span>Preview Dokumen Utama</span>
                                {previewUrlUtama && isPreviewable(previewUrlUtama, 'file_dokumen') && (
                                <button type="button" onClick={() => setShowFullPreviewUtama(!showFullPreviewUtama)} className="text-[#CC6B27] hover:underline">
                                    {showFullPreviewUtama ? 'Perkecil' : 'Tampilkan Lebih Banyak'}
                                </button>
                                )}
                            </div>
                            
                            <div className={`relative flex-1 transition-all duration-300 ${showFullPreviewUtama ? 'h-[500px]' : 'h-full bg-white'}`}>
                                {previewUrlUtama ? (
                                    isPreviewable(previewUrlUtama, 'file_dokumen') ? (
                                        isImageFile(previewUrlUtama, 'file_dokumen') ? (
                                            <div className="w-full h-full overflow-auto absolute inset-0 flex justify-center items-start bg-gray-50 p-2">
                                                <img src={buildFileUrl(previewUrlUtama)} alt="Preview" className="max-w-full object-contain" />
                                            </div>
                                        ) : (
                                            <iframe src={`${buildFileUrl(previewUrlUtama)}#toolbar=0&navpanes=0`} className="w-full h-full border-0 absolute inset-0" title="Preview PDF" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center absolute inset-0 bg-gray-50">
                                            <FileText size={42} className="mb-2 text-blue-400" />
                                            <p className="text-[12px] font-bold mb-1">Preview tidak tersedia</p>
                                            <p className="text-[11px]">Format file ini (.doc/.xls dsb) tidak dapat dipratinjau langsung di browser.</p>
                                            <a href={buildFileUrl(previewUrlUtama)} target="_blank" rel="noreferrer" className="mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold hover:bg-blue-200">Unduh File</a>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center absolute inset-0">
                                        <FileText size={42} className="mb-2 opacity-30" />
                                        <p className="text-[11px]">Pilih file utama untuk melihat pratinjau.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kolom 2: File Pendukung */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 m-0 pb-2 border-b border-[#CC6B27]/20">
                            <FileText size={16}/> Dokumen Pendukung (Opsional)
                        </h4>
                        
                        <div className="bg-[#FAFAFA] p-4 rounded-lg border border-dashed border-[#071E3D]/30">
                            <label className="block text-[13px] font-bold text-[#071E3D] mb-2">Upload File Pendukung</label>
                            {modalType !== 'detail' && (
                                <input 
                                  type="file" name="file_pendukung" onChange={(e) => handleFileChange(e, 'file_pendukung')} 
                                  className="block w-full text-[12px] text-[#182D4A] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-[#182D4A]/10 file:text-[#182D4A] hover:file:bg-[#182D4A] hover:file:text-white cursor-pointer transition-colors border border-[#071E3D]/20 rounded-lg bg-white p-1"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                            )}
                            {selectedItem?.file_pendukung && !files.file_pendukung && (
                                <div className="mt-2 text-[12px] font-medium text-[#182D4A] bg-[#E2E8F0] px-3 py-2 rounded border border-[#071E3D]/10 break-all">
                                    Tersimpan: <a href={buildFileUrl(selectedItem.file_pendukung)} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:underline">{selectedItem.file_pendukung}</a>
                                </div>
                            )}
                        </div>

                        {/* Preview Dokumen Pendukung */}
                        <div className="border border-[#071E3D]/20 rounded-lg flex flex-col overflow-hidden min-h-[300px]">
                            <div className="bg-gray-100 px-3 py-2 text-[11px] font-bold text-[#182D4A] flex justify-between items-center border-b border-[#071E3D]/20">
                                <span>Preview Dokumen Pendukung</span>
                                {previewUrlPendukung && isPreviewable(previewUrlPendukung, 'file_pendukung') && (
                                <button type="button" onClick={() => setShowFullPreviewPendukung(!showFullPreviewPendukung)} className="text-[#CC6B27] hover:underline">
                                    {showFullPreviewPendukung ? 'Perkecil' : 'Tampilkan Lebih Banyak'}
                                </button>
                                )}
                            </div>
                            
                            <div className={`relative flex-1 transition-all duration-300 ${showFullPreviewPendukung ? 'h-[500px]' : 'h-full bg-white'}`}>
                                {previewUrlPendukung ? (
                                    isPreviewable(previewUrlPendukung, 'file_pendukung') ? (
                                        isImageFile(previewUrlPendukung, 'file_pendukung') ? (
                                            <div className="w-full h-full overflow-auto absolute inset-0 flex justify-center items-start bg-gray-50 p-2">
                                                <img src={buildFileUrl(previewUrlPendukung)} alt="Preview" className="max-w-full object-contain" />
                                            </div>
                                        ) : (
                                            <iframe src={`${buildFileUrl(previewUrlPendukung)}#toolbar=0&navpanes=0`} className="w-full h-full border-0 absolute inset-0" title="Preview PDF" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center absolute inset-0 bg-gray-50">
                                            <FileText size={42} className="mb-2 text-blue-400" />
                                            <p className="text-[12px] font-bold mb-1">Preview tidak tersedia</p>
                                            <p className="text-[11px]">Format file ini (.doc/.xls dsb) tidak dapat dipratinjau langsung di browser.</p>
                                            <a href={buildFileUrl(previewUrlPendukung)} target="_blank" rel="noreferrer" className="mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold hover:bg-blue-200">Unduh File</a>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center absolute inset-0">
                                        <FileText size={42} className="mb-2 opacity-30" />
                                        <p className="text-[11px]">Pilih file pendukung untuk melihat pratinjau.</p>
                                    </div>
                                )}
                            </div>
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