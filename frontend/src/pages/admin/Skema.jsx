import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, FileText, Upload, BookOpen, Eye, ArrowRight, Filter
} from 'lucide-react';

const Skema = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Tambahan State Filter Status
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSkema, setSelectedSkema] = useState(null);

  // --- STATE KHUSUS FILE & VALIDASI ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [errors, setErrors] = useState({});

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

  // --- HELPER UNTUK URL DAN PREVIEW FILE ---
  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    const cleanPath = path.replace(/^(\/?uploads\/|\/)/, '');
    return `http://localhost:3000/uploads/${cleanPath}`;
  };

  const isPdfFile = (filename) => {
    const checkName = selectedFile ? selectedFile.name : filename;
    return checkName && /\.(pdf)$/i.test(checkName);
  };
  
  const isImageFile = (filename) => {
    const checkName = selectedFile ? selectedFile.name : filename;
    return checkName && /\.(jpg|jpeg|png|gif|webp)$/i.test(checkName);
  };

  const isPreviewable = (filename) => isPdfFile(filename) || isImageFile(filename);

  // --- VALIDASI MANUAL ---
  const validateInput = (name, value) => {
    let errorMsg = '';
    
    // Pengecualian karakter untuk Level KKNI & Skor (Hanya wajib diisi)
    if (name === 'level_kkni' || name === 'skor_min_ai05') {
      if (value === null || value === '') {
        errorMsg = 'Tidak boleh kosong.';
      }
    } else if (['kode_sektor', 'kode_kbli', 'kode_kbji'].includes(name)) {
      // Abaikan aturan 4 karakter untuk kode angka yang pendek
    } else {
      // Aturan default: minimal 4 karakter
      if (typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 3) {
        errorMsg = 'Terlalu pendek (minimal 4 karakter).';
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDetail = (item) => {
    setSelectedSkema(item);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_skema);
    setSelectedFile(null); 
    setErrors({});
    setShowFullPreview(false);
    
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

    setPreviewUrl(item.dokumen || null);
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
    
    // Pengecekan Validasi Keseluruhan
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) {
      Swal.fire('Peringatan', 'Silakan perbaiki isian yang masih kosong/kurang tepat!', 'warning');
      return;
    }

    const actionText = isEditMode ? 'menyimpan perubahan pada' : 'menambahkan';
    const confirm = await Swal.fire({
      title: 'Konfirmasi',
      text: `Apakah Anda yakin ingin ${actionText} skema ini?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Simpan'
    });

    if (!confirm.isConfirmed) return;

    const dataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      if (key !== 'dokumen' && formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        dataToSend.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      dataToSend.append('file_dokumen', selectedFile);
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

  // Helper Input Class
  const inputClass = (name) => `w-full p-2.5 border rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 placeholder:text-[#182D4A]/40
    ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10'}
  `;

  // --- FILTER ---
  const filteredData = data.filter(item => {
    const matchSearch = (item.judul_skema && item.judul_skema.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.kode_skema && item.kode_skema.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

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
            setPreviewUrl(null);
            setShowFullPreview(false);
            setErrors({});
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Tambah Skema
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <BookOpen size={18} className="text-[#CC6B27]"/> Daftar Skema
          </h4>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
              <input 
                type="text" 
                placeholder="Cari kode atau judul skema..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* MODIFIKASI: Tambahan dropdown filter status */}
            <div className="relative w-full md:w-48">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors z-10" />
              <select 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-medium appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
                <option value="draft">Draft</option>
              </select>
            </div>
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
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-52">Aksi</th>
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
                      <div className="flex items-center justify-center gap-2">
                        {/* TOMBOL BIAYA */}
                        <button 
                          onClick={() => navigate(`/admin/skema/${item.id_skema}/biaya-uji`)} 
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 hover:border-transparent text-[11px] font-bold h-[34px]" 
                          title="Atur Biaya Uji"
                        >
                          Biaya
                        </button>

                        {/* TOMBOL DETAIL */}
                        <button 
                          onClick={() => handleDetail(item)} 
                          className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 hover:border-transparent h-[34px] w-[34px]" 
                          title="Detail Skema"
                        >
                          <Eye size={16} />
                        </button>

                        <button 
                          onClick={() => handleEdit(item)} 
                          className="inline-flex items-center justify-center p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm h-[34px] w-[34px]" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(item.id_skema)} 
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

      {/* MODAL DETAIL SKEMA */}
      {showDetailModal && selectedSkema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Header Detail */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
                <BookOpen size={20} className="text-[#CC6B27]"/> Detail Skema Kompetensi
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            {/* Body Detail */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Informasi Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                  <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wider mb-1">Kode Skema</p>
                  <p className="text-[14px] font-mono font-bold text-[#CC6B27]">{selectedSkema.kode_skema}</p>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                  <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold border capitalize mt-1
                    ${selectedSkema.status === 'aktif' ? 'bg-green-50 text-green-600 border-green-200' : 
                      selectedSkema.status === 'nonaktif' ? 'bg-red-50 text-red-600 border-red-200' : 
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                    {selectedSkema.status}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10 md:col-span-2">
                  <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wider mb-1">Judul Skema</p>
                  <p className="text-[15px] font-bold text-[#071E3D]">{selectedSkema.judul_skema}</p>
                  {selectedSkema.judul_skema_en && (
                    <p className="text-[13px] font-medium text-[#182D4A]/80 mt-1 italic">{selectedSkema.judul_skema_en}</p>
                  )}
                </div>
              </div>

              {/* Atribut Lengkap */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Jenis Skema</p>
                  <p className="text-[13px] font-semibold text-[#071E3D] capitalize">{selectedSkema.jenis_skema}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Level KKNI</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.level_kkni || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Bidang Okupasi</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.bidang_okupasi || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Kedalaman Bukti</p>
                  <p className="text-[13px] font-semibold text-[#071E3D] capitalize">{selectedSkema.kedalaman_bukti?.replace(/_/g, ' ') || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Kode Sektor</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.kode_sektor || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Kode KBLI</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.kode_kbli || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Kode KBJI</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.kode_kbji || '-'}</p>
                </div>
                <div className="border border-[#071E3D]/5 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-[#182D4A]/50 uppercase mb-1">Skor Min AI 05</p>
                  <p className="text-[13px] font-semibold text-[#071E3D]">{selectedSkema.skor_min_ai05 || '-'}</p>
                </div>
              </div>

              {selectedSkema.keterangan_bukti && (
                <div className="border border-[#071E3D]/5 p-4 rounded-lg bg-[#FAFAFA]/50">
                  <p className="text-[11px] font-bold text-[#182D4A]/60 uppercase mb-2">Keterangan Bukti</p>
                  <p className="text-[13px] text-[#071E3D] leading-relaxed">{selectedSkema.keterangan_bukti}</p>
                </div>
              )}

              {/* TAMPILAN PREVIEW PDF DI DETAIL MODAL */}
              {selectedSkema.dokumen && (
                  <div className="border border-[#071E3D]/20 rounded-lg flex flex-col overflow-hidden min-h-[350px]">
                      <div className="bg-gray-100 px-3 py-2 text-[11px] font-bold text-[#182D4A] flex justify-between items-center border-b border-[#071E3D]/20">
                          <span>Preview Dokumen Skema</span>
                          {isPreviewable(selectedSkema.dokumen) && (
                          <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-[#CC6B27] hover:underline cursor-pointer">
                              {showFullPreview ? 'Perkecil' : 'Perbesar Tampilan'}
                          </button>
                          )}
                      </div>
                      
                      <div className={`relative flex-1 transition-all duration-300 ${showFullPreview ? 'h-[600px]' : 'h-full bg-white'}`}>
                          {isPreviewable(selectedSkema.dokumen) ? (
                              isImageFile(selectedSkema.dokumen) ? (
                                  <div className="w-full h-full overflow-auto absolute inset-0 flex justify-center items-start bg-gray-50 p-2">
                                      <img src={buildFileUrl(selectedSkema.dokumen)} alt="Preview" className="max-w-full object-contain" />
                                  </div>
                              ) : (
                                  <iframe src={`${buildFileUrl(selectedSkema.dokumen)}#toolbar=0&navpanes=0`} className="w-full h-full border-0 absolute inset-0" title="Preview PDF" />
                              )
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center absolute inset-0 bg-gray-50">
                                  <FileText size={42} className="mb-2 text-blue-400" />
                                  <p className="text-[12px] font-bold mb-1">Preview tidak tersedia</p>
                                  <p className="text-[11px]">Format file ini tidak dapat dipratinjau.</p>
                                  <a href={buildFileUrl(selectedSkema.dokumen)} target="_blank" rel="noreferrer" className="mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold hover:bg-blue-200">Unduh File</a>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* SEPARATOR KHUSUS NAVIGASI FORMULIR */}
              <div className="border-t border-[#071E3D]/10 pt-6 mt-2">
                <h4 className="text-[14px] font-bold text-[#071E3D] mb-4 flex items-center gap-2">
                  Navigasi Instrumen & Asesmen
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button 
                    onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia01`)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                  >
                    <span className="text-[12px] font-bold mb-1">FR.IA.01</span>
                    <span className="text-[10px] font-medium opacity-80 mb-2">Observasi</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia03`)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                  >
                    <span className="text-[12px] font-bold mb-1">FR.IA.03</span>
                    <span className="text-[10px] font-medium opacity-80 mb-2">Pertanyaan</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {/* TOMBOL PINTAR: Mengarah ke route /admin/skema/:id/mapa */}
                  <button 
                    onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/mapa`)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#CC6B27]/30 bg-[#CC6B27]/5 text-[#CC6B27] hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm group"
                  >
                    <span className="text-[12px] font-bold mb-1">FR.MAPA</span>
                    <span className="text-[10px] font-medium opacity-80 mb-2">Manajemen</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/kelompok-pekerjaan`)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white transition-all shadow-sm group"
                  >
                    <span className="text-[12px] font-bold mb-1">Kelompok</span>
                    <span className="text-[10px] font-medium opacity-80 mb-2">Pekerjaan</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* MODAL FORM TAMBAH/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
                {isEditMode ? <Edit2 size={18} className="text-[#CC6B27]"/> : <Plus size={18} className="text-[#CC6B27]"/>}
                {isEditMode ? 'Edit Data Skema' : 'Tambah Skema Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="skemaForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Form Inputs (Dibuat Grid Kiri Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Kolom Kiri */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode Skema <span className="text-red-500">*</span></label>
                        <input type="text" name="kode_skema" value={formData.kode_skema} onChange={handleInputChange} required 
                          className={inputClass('kode_skema') + " font-mono"} />
                          {errors.kode_skema && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.kode_skema}</span>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Status Skema</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass('status')}>
                          <option value="draft">Draft</option>
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Non-Aktif</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Judul Skema (Indonesia) <span className="text-red-500">*</span></label>
                      <input type="text" name="judul_skema" value={formData.judul_skema} onChange={handleInputChange} required className={inputClass('judul_skema')}/>
                      {errors.judul_skema && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.judul_skema}</span>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Judul Skema (Inggris)</label>
                      <input type="text" name="judul_skema_en" value={formData.judul_skema_en} onChange={handleInputChange} className={inputClass('judul_skema_en')}/>
                      {errors.judul_skema_en && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.judul_skema_en}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Jenis Skema</label>
                            <select name="jenis_skema" value={formData.jenis_skema} onChange={handleInputChange} className={inputClass('jenis_skema')}>
                            <option value="kkni">KKNI</option>
                            <option value="okupasi">Okupasi</option>
                            <option value="klaster">Klaster</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Level KKNI <span className="text-red-500">*</span></label>
                            <select name="level_kkni" value={formData.level_kkni} onChange={handleInputChange} className={inputClass('level_kkni')} required>
                            <option value="">-- Pilih Level --</option>
                            {[1,2,3,4,5,6,7,8,9].map(num => <option key={num} value={num}>Level {num}</option>)}
                            </select>
                            {errors.level_kkni && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.level_kkni}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Bidang Okupasi</label>
                        <input type="text" name="bidang_okupasi" value={formData.bidang_okupasi} onChange={handleInputChange} className={inputClass('bidang_okupasi')} />
                        {errors.bidang_okupasi && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.bidang_okupasi}</span>}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode Sektor</label>
                        <input type="text" name="kode_sektor" value={formData.kode_sektor} onChange={handleInputChange} className={inputClass('kode_sektor') + " font-mono"} />
                        {errors.kode_sektor && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.kode_sektor}</span>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode KBLI</label>
                        <input type="text" name="kode_kbli" value={formData.kode_kbli} onChange={handleInputChange} className={inputClass('kode_kbli') + " font-mono"} />
                        {errors.kode_kbli && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.kode_kbli}</span>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode KBJI</label>
                        <input type="text" name="kode_kbji" value={formData.kode_kbji} onChange={handleInputChange} className={inputClass('kode_kbji') + " font-mono"} />
                        {errors.kode_kbji && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.kode_kbji}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kedalaman Bukti</label>
                        <select name="kedalaman_bukti" value={formData.kedalaman_bukti} onChange={handleInputChange} className={inputClass('kedalaman_bukti')}>
                          <option value="elemen_kompetensi">Elemen Kompetensi</option>
                          <option value="kriteria_unjuk_kerja">Kriteria Unjuk Kerja</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Skor Min. (AI 05) <span className="text-red-500">*</span></label>
                        <input type="number" name="skor_min_ai05" value={formData.skor_min_ai05} onChange={handleInputChange} className={inputClass('skor_min_ai05')} required />
                        {errors.skor_min_ai05 && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.skor_min_ai05}</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Keterangan Bukti</label>
                      <textarea name="keterangan_bukti" rows="2" value={formData.keterangan_bukti} onChange={handleInputChange} className={inputClass('keterangan_bukti') + " resize-none"}></textarea>
                      {errors.keterangan_bukti && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.keterangan_bukti}</span>}
                    </div>
                  </div>

                  {/* Kolom Kanan: File & Preview */}
                  <div className="flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#071E3D]/10 pt-4 lg:pt-0 lg:pl-6">
                      <div className="bg-[#182D4A]/5 p-5 rounded-lg border border-[#182D4A]/20">
                          <label className="block text-[13px] font-bold text-[#071E3D] mb-2 flex items-center gap-2">
                              <Upload size={16} className="text-[#CC6B27]"/> Unggah Dokumen Skema (PDF)
                          </label>
                          
                          {/* MODIFIKASI: accept input file hanya mengizinkan PDF */}
                          <input 
                              type="file" 
                              name="file_dokumen" 
                              onChange={handleFileChange} 
                              accept=".pdf"
                              className="block w-full text-[12px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-bold file:bg-[#071E3D] file:text-white hover:file:bg-[#182D4A] file:cursor-pointer file:transition-colors cursor-pointer bg-white border border-[#071E3D]/20 rounded-lg p-1"
                          />
                          
                          {isEditMode && formData.dokumen && !selectedFile && (
                              <div className="flex items-center gap-2 mt-3 text-[11px] text-[#CC6B27] font-bold bg-[#CC6B27]/10 p-2 rounded-md w-fit border border-[#CC6B27]/20">
                              <FileText size={14} />
                              <span>Tersimpan: <a href={buildFileUrl(formData.dokumen)} target="_blank" rel="noreferrer" className="hover:underline">{formData.dokumen.split('/').pop()}</a></span>
                              </div>
                          )}
                      </div>

                      {/* AREA PREVIEW PDF */}
                      <div className="border border-[#071E3D]/20 rounded-lg flex flex-col flex-1 overflow-hidden min-h-[350px]">
                          <div className="bg-gray-100 px-3 py-2 text-[11px] font-bold text-[#182D4A] flex justify-between items-center border-b border-[#071E3D]/20">
                              <span>Pratinjau Dokumen</span>
                              {previewUrl && isPreviewable(previewUrl) && (
                              <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-[#CC6B27] hover:underline cursor-pointer">
                                  {showFullPreview ? 'Perkecil' : 'Perbesar Tampilan'}
                              </button>
                              )}
                          </div>
                          
                          <div className={`relative flex-1 transition-all duration-300 ${showFullPreview ? 'h-[500px]' : 'h-full bg-white'}`}>
                              {previewUrl ? (
                                  isPreviewable(previewUrl) ? (
                                      isImageFile(previewUrl) ? (
                                          <div className="w-full h-full overflow-auto absolute inset-0 flex justify-center items-start bg-gray-50 p-2">
                                              <img src={buildFileUrl(previewUrl)} alt="Preview" className="max-w-full object-contain" />
                                          </div>
                                      ) : (
                                          <iframe src={`${buildFileUrl(previewUrl)}#toolbar=0&navpanes=0`} className="w-full h-full border-0 absolute inset-0" title="Preview PDF" />
                                      )
                                  ) : (
                                      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center absolute inset-0 bg-gray-50">
                                          <FileText size={42} className="mb-2 text-blue-400" />
                                          <p className="text-[12px] font-bold mb-1">Preview tidak tersedia</p>
                                          <p className="text-[11px]">Format file ini tidak dapat dipratinjau.</p>
                                      </div>
                                  )
                              ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center absolute inset-0">
                                      <FileText size={42} className="mb-2 opacity-30" />
                                      <p className="text-[11px]">Pilih file skema (PDF) untuk melihat pratinjau.</p>
                                  </div>
                              )}
                          </div>
                      </div>

                  </div>
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