import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api"; 
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Eye, Edit2, Trash2, X, Save, 
  User as UserIcon, Loader2, Upload, FileSpreadsheet,
  GraduationCap, MapPin, Mail, Briefcase, Users, Key
} from 'lucide-react';

const TambahAsesi = () => {
  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // --- STATE WILAYAH ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const [selectedProvinsiId, setSelectedProvinsiId] = useState('');
  const [selectedKotaId, setSelectedKotaId] = useState('');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState('');

  // Validasi Error State
  const [errors, setErrors] = useState({});

  // Form State
  const initialFormState = {
    nik: '', nama_lengkap: '', email: '', no_hp: '', jenis_kelamin: 'laki-laki',
    tempat_lahir: '', tanggal_lahir: '', kebangsaan: 'Indonesia',
    alamat: '', rt: '', rw: '', provinsi: '', kota: '', kecamatan: '', kelurahan: '', kode_pos: '',
    pendidikan_terakhir: 'SMA/SMK', universitas: '', jurusan: '', tahun_lulus: '',
    pekerjaan: '', jabatan: '', nama_perusahaan: '', alamat_perusahaan: '',
    telp_perusahaan: '', fax_perusahaan: '', email_perusahaan: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [fileExcel, setFileExcel] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/asesi?page=${page}&limit=${pagination.limit}&search=${search}`);
      const resBody = response.data !== undefined ? response.data : response;

      let listData = [];
      let pag = null;

      if (Array.isArray(resBody.data)) {
          listData = resBody.data;
      } else if (resBody.data?.data && Array.isArray(resBody.data.data)) {
          listData = resBody.data.data;
          pag = resBody.data.pagination;
      } else if (Array.isArray(resBody)) {
          listData = resBody;
      }

      setData(listData); 
      setPagination(prev => ({
        ...prev,
        page: pag?.currentPage || page,
        total: pag?.totalItems || listData.length,
        totalPages: pag?.totalPages || 1
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, searchTerm);
    loadProvinsi();
  }, [pagination.page, searchTerm]);

  // --- WILAYAH FETCHERS ---
  const loadProvinsi = async () => {
    try {
      const res = await getProvinsi();
      setProvinsiList(res.data || res);
    } catch (err) { console.error("Gagal load provinsi", err); }
  };

  const handleProvinsiChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text; 

    setSelectedProvinsiId(id);
    setFormData({ ...formData, provinsi: id ? text : '', kota: '', kecamatan: '', kelurahan: '' });
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    setSelectedKotaId(''); setSelectedKecamatanId('');

    if (id) {
      try {
        const res = await getKota(id);
        setKotaList(res.data || res);
      } catch (err) { console.error(err); }
    }
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKotaId(id);
    setFormData({ ...formData, kota: id ? text : '', kecamatan: '', kelurahan: '' });
    setKecamatanList([]); setKelurahanList([]); setSelectedKecamatanId('');

    if (id) {
      try {
        const res = await getKecamatan(id);
        setKecamatanList(res.data || res);
      } catch (err) { console.error(err); }
    }
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKecamatanId(id);
    setFormData({ ...formData, kecamatan: id ? text : '', kelurahan: '' });
    setKelurahanList([]);

    if (id) {
      try {
        const res = await getKelurahan(id);
        setKelurahanList(res.data || res);
      } catch (err) { console.error(err); }
    }
  };

  const handleKelurahanChange = (e) => {
    const text = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, kelurahan: e.target.value ? text : '' });
  };

  // --- FUNGSI VALIDASI ---
  const validateInput = (name, value) => {
    let errorMsg = '';
    
    if (name === 'nik') {
      if (!value) errorMsg = 'NIK tidak boleh kosong.';
      else if (value.length !== 16) errorMsg = 'NIK harus tepat 16 digit.';
    } else if (name === 'no_hp') {
      if (!value) errorMsg = 'No HP tidak boleh kosong.';
      else if (value.length < 12 || value.length > 13) errorMsg = 'No HP harus 12-13 digit.';
    } else if (name === 'email') {
      if (!value) errorMsg = 'Email tidak boleh kosong.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Format email tidak valid.';
    } else if (name === 'nama_lengkap') {
      if (!value || value.trim() === '') errorMsg = 'Nama Lengkap wajib diisi.';
    } else if (name === 'tahun_lulus' && value) {
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();
      
      if (value.length !== 4) {
        errorMsg = 'Tahun lulus harus 4 digit angka (misal: 2022).';
      } else if (year < 1950) {
        errorMsg = 'Tahun lulus tidak valid (minimal 1950).';
      } else if (year > currentYear) {
        errorMsg = 'Tahun lulus tidak boleh dimasa depan.';
      }
    } else if (name === 'tanggal_lahir' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date('1945-12-31');
      if (selectedDate > today) {
        errorMsg = 'Tanggal lahir tidak boleh di masa depan.';
      } else if (selectedDate <= minDate) {
        errorMsg = 'Tanggal lahir tidak valid (harus setelah 1945).';
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    
    // 1. Auto hapus huruf untuk form yang WAJIB ANGKA
    if (['nik', 'no_hp', 'rt', 'rw', 'kode_pos', 'telp_perusahaan', 'tahun_lulus'].includes(name)) {
      finalValue = value.replace(/\D/g, ''); // \D berarti karakter selain angka dihapus
    }
    // 2. Auto hapus angka untuk form yang WAJIB HURUF (Nama, Jabatan, Pendidikan, dll)
    else if (['nama_lengkap', 'jabatan', 'pekerjaan', 'universitas', 'jurusan', 'tempat_lahir', 'kebangsaan'].includes(name)) {
      finalValue = value.replace(/[0-9]/g, ''); // Hapus jika ada inputan angka 0-9
    }

    // Batasi input tahun lulus maksimal 4 digit
    if (name === 'tahun_lulus' && finalValue.length > 4) {
      finalValue = finalValue.slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    validateInput(name, finalValue);
  };

  // --- HANDLERS SUBMIT & DELETE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cek semua validasi sebelum memproses
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (['email', 'no_hp', 'nik'].includes(key) && isEditMode) return; 
      if (!validateInput(key, formData[key])) {
        isValid = false;
      }
    });

    if (!isValid) {
      return Swal.fire('Peringatan', 'Silakan perbaiki isian yang masih kosong atau ada peringatan merah!', 'warning');
    }

    if (!isEditMode) return;

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const payload = { ...formData };
      if (payload.tanggal_lahir === "") payload.tanggal_lahir = null;
      payload.tahun_lulus = payload.tahun_lulus ? parseInt(payload.tahun_lulus) : null;

      delete payload.email;
      delete payload.no_hp;

      await api.put(`/admin/asesi/${currentId}`, payload);
      Swal.fire('Sukses!', 'Data asesi berhasil diperbarui', 'success');
      
      setShowModal(false);
      fetchData(pagination.page);
      resetForm();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan saat memperbarui', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Asesi?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/asesi/${id}`);
          Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
          fetchData(pagination.page);
        } catch (error) {
          Swal.fire('Error', 'Gagal menghapus data', 'error');
        }
      }
    });
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!fileExcel) return Swal.fire('Peringatan', 'Pilih file Excel terlebih dahulu', 'warning');

    const formUpload = new FormData();
    formUpload.append("file", fileExcel);

    try {
      Swal.fire({ title: 'Proses Import...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const response = await api.post('/admin/import-asesi', formUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resData = response.data || response;
      const message = resData.message || 'Import diproses';

      if (message.includes('Gagal:') && !message.includes('Gagal: 0')) {
        if (message.includes('Berhasil: 0')) {
          Swal.fire('Import Gagal', message + '<br><br><small>Pastikan NIK/Email belum terdaftar di sistem.</small>', 'error');
        } else {
          Swal.fire('Import Selesai (Ada Catatan)', message, 'warning');
        }
      } else {
        Swal.fire('Sukses', message, 'success');
      }

      setShowImportModal(false);
      setFileExcel(null);
      fetchData(pagination.page);

    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal import excel', 'error');
    }
  };

  const handleResetPassword = async (id_user, email) => {
    const confirm = await Swal.fire({
      title: 'Reset Password?',
      text: `Sandi untuk akun ${email || 'ini'} akan direset ulang dan dikirimkan ke email asesi.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Reset & Kirim'
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const response = await api.post(`/admin/asesi/${id_user}/reset-password`); 
        const resData = response.data !== undefined ? response.data : response;
        
        const { username } = resData.data;

        Swal.fire({
            title: 'Berhasil Reset!',
            html: `Sandi untuk NIK <b>${username}</b> berhasil diatur ulang.<br><br>Sandi yang baru telah otomatis dikirimkan ke email asesi dan tercatat dalam sistem notifikasi.`,
            icon: 'success'
        });
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal mereset password', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedProvinsiId(''); setSelectedKotaId(''); setSelectedKecamatanId('');
    setIsEditMode(false); setIsDetailMode(false); setCurrentId(null);
    setErrors({});
  };

  const handleEdit = async (item) => {
    resetForm();
    setIsEditMode(true);
    setCurrentId(item.id_user || item.id);
    
    setFormData({
        nik: item.nik || '', email: item.user?.email || item.email || '', no_hp: item.user?.no_hp || item.no_hp || '',
        nama_lengkap: item.nama_lengkap || '', jenis_kelamin: item.jenis_kelamin || 'laki-laki', 
        tempat_lahir: item.tempat_lahir || '', tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '', 
        kebangsaan: item.kebangsaan || 'Indonesia', pendidikan_terakhir: item.pendidikan_terakhir || 'SMA/SMK', 
        universitas: item.universitas || '', jurusan: item.jurusan || '', tahun_lulus: item.tahun_lulus || '',
        alamat: item.alamat || '', rt: item.rt || '', rw: item.rw || '', provinsi: item.provinsi || '', 
        kota: item.kota || '', kecamatan: item.kecamatan || '', kelurahan: item.kelurahan || '', kode_pos: item.kode_pos || '',
        pekerjaan: item.pekerjaan || '', jabatan: item.jabatan || '', nama_perusahaan: item.nama_perusahaan || '',
        alamat_perusahaan: item.alamat_perusahaan || '', telp_perusahaan: item.telp_perusahaan || '',
        fax_perusahaan: item.fax_perusahaan || '', email_perusahaan: item.email_perusahaan || ''
    });
    setShowModal(true);
  };

  const filteredData = data.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nik?.includes(searchTerm)
  );

  const inputClass = (name) => `w-full p-2.5 border rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium placeholder:text-[#182D4A]/40
    ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10'}
  `;

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data Asesi</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola data profil dan akun asesi.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[13px]"
            onClick={() => setShowImportModal(true)}
          >
            <FileSpreadsheet size={18} /> Import Data Asesi (Excel)
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <Users size={18} className="text-[#CC6B27]"/> Daftar Asesi
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Nama atau NIK..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">NIK</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Lengkap</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Kontak</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-56">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data asesi...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <UserIcon size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data asesi ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_user || item.id || index} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="py-3 px-4 font-mono text-[13px] font-bold text-[#CC6B27]">{item.nik || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px]">{item.nama_lengkap}</div>
                      <div className="text-[11px] text-[#182D4A]/70 mt-0.5 capitalize">{item.jenis_kelamin}</div>
                    </td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px]">
                      <div className="flex items-center gap-1.5"><Mail size={14} className="text-[#CC6B27]"/> {item.user?.email || item.email || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        
                        <button 
                          onClick={() => handleResetPassword(item.id_user || item.id, item.user?.email || item.email)}
                          className="px-2 py-1.5 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all border bg-[#182D4A]/5 text-[#182D4A] border-[#182D4A]/20 hover:bg-[#182D4A]/10"
                          title="Reset Password Asesi"
                        >
                          <Key size={14} /> Reset Sandi
                        </button>

                        <button onClick={() => { handleEdit(item); setIsDetailMode(true); }} className="p-1.5 text-[#182D4A] bg-[#182D4A]/10 rounded hover:bg-[#182D4A] hover:text-white transition-colors" title="Detail"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#CC6B27] bg-[#CC6B27]/10 rounded hover:bg-[#CC6B27] hover:text-white transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id_user || item.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-600 hover:text-white border border-red-100 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#CC6B27]/10 rounded-lg text-[#CC6B27]">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#071E3D] m-0">
                    {isDetailMode ? 'Detail Data Asesi' : 'Edit Data Asesi'}
                  </h3>
                  <p className="text-[12px] text-[#182D4A]/70 m-0">Informasi data diri, alamat, dan pendidikan asesi.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="asesiForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. Identitas */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <UserIcon size={16}/> Identitas Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">NIK <span className="text-red-500">*</span></label>
                      <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} maxLength="16" required disabled={isDetailMode} placeholder="16 Digit Angka" className={inputClass('nik')}/>
                      {errors.nik && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.nik}</span>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required disabled={isDetailMode} placeholder="Nama lengkap tanpa angka" className={inputClass('nama_lengkap')}/>
                      {errors.nama_lengkap && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.nama_lengkap}</span>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Email Login <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={isDetailMode || isEditMode} placeholder="Email aktif" className={inputClass('email')}/>
                      {errors.email && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.email}</span>}
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">No HP / WhatsApp <span className="text-red-500">*</span></label>
                      <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} maxLength="13" required disabled={isDetailMode || isEditMode} placeholder="08xxxxxxxx" className={inputClass('no_hp')}/>
                      {errors.no_hp && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.no_hp}</span>}
                    </div>
                    
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tempat Lahir</label><input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('tempat_lahir')}/></div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tanggal Lahir</label>
                      <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('tanggal_lahir')}/>
                      {errors.tanggal_lahir && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.tanggal_lahir}</span>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Jenis Kelamin</label>
                      <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('jenis_kelamin')}>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kebangsaan</label><input type="text" name="kebangsaan" value={formData.kebangsaan} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('kebangsaan')}/></div>
                  </div>
                </div>

                {/* 2. Alamat */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <MapPin size={16}/> Alamat & Domisili
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Alamat Lengkap</label>
                      <textarea name="alamat" rows="2" value={formData.alamat} onChange={handleInputChange} disabled={isDetailMode} placeholder="Nama jalan, perumahan, gang..." className={`${inputClass('alamat')} resize-none`}></textarea>
                    </div>
                    
                    {isDetailMode ? (
                      <>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Provinsi</label>
                          <input type="text" value={formData.provinsi || '-'} disabled className={inputClass('provinsi')} />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kota / Kabupaten</label>
                          <input type="text" value={formData.kota || '-'} disabled className={inputClass('kota')} />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kecamatan</label>
                          <input type="text" value={formData.kecamatan || '-'} disabled className={inputClass('kecamatan')} />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kelurahan</label>
                          <input type="text" value={formData.kelurahan || '-'} disabled className={inputClass('kelurahan')} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Provinsi</label>
                          <select onChange={handleProvinsiChange} value={selectedProvinsiId} className={inputClass('provinsi')}>
                            <option value="">{formData.provinsi ? `[Tersimpan] ${formData.provinsi}` : 'Pilih Provinsi'}</option>
                            {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kota / Kabupaten</label>
                          <select onChange={handleKotaChange} value={selectedKotaId} disabled={!selectedProvinsiId && !formData.kota} className={inputClass('kota')}>
                            <option value="">{formData.kota && !selectedProvinsiId ? `[Tersimpan] ${formData.kota}` : 'Pilih Kota'}</option>
                            {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kecamatan</label>
                          <select onChange={handleKecamatanChange} value={selectedKecamatanId} disabled={!selectedKotaId && !formData.kecamatan} className={inputClass('kecamatan')}>
                            <option value="">{formData.kecamatan && !selectedKotaId ? `[Tersimpan] ${formData.kecamatan}` : 'Pilih Kecamatan'}</option>
                            {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kelurahan</label>
                          <select onChange={handleKelurahanChange} disabled={!selectedKecamatanId && !formData.kelurahan} className={inputClass('kelurahan')}>
                            <option value="">{formData.kelurahan && !selectedKecamatanId ? `[Tersimpan] ${formData.kelurahan}` : 'Pilih Kelurahan'}</option>
                            {kelurahanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-3 gap-3 md:col-span-2">
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">RT</label><input type="text" name="rt" value={formData.rt} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('rt')}/></div>
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">RW</label><input type="text" name="rw" value={formData.rw} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('rw')}/></div>
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kode Pos</label><input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('kode_pos')}/></div>
                    </div>
                  </div>
                </div>

                {/* 3. Pendidikan & Pekerjaan */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <GraduationCap size={16}/> Pendidikan & Pekerjaan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Pendidikan Terakhir</label>
                      <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('pendidikan_terakhir')}>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="D4">D4</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tahun Lulus</label>
                      <input type="text" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleInputChange} disabled={isDetailMode} placeholder="YYYY (Misal: 2020)" className={inputClass('tahun_lulus')}/>
                      {errors.tahun_lulus && <span className="text-[11px] text-red-500 font-medium block mt-1">{errors.tahun_lulus}</span>}
                    </div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Institusi / Universitas</label><input type="text" name="universitas" value={formData.universitas} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('universitas')}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Jurusan</label><input type="text" name="jurusan" value={formData.jurusan} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('jurusan')}/></div>
                    <div className="border-t border-[#071E3D]/10 col-span-2 my-2"></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1 flex items-center gap-1"><Briefcase size={12}/>Pekerjaan Saat Ini</label><input type="text" name="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('pekerjaan')}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Jabatan</label><input type="text" name="jabatan" value={formData.jabatan} onChange={handleInputChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('jabatan')}/></div>
                    <div className="md:col-span-2"><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Nama Perusahaan / Instansi</label><input type="text" name="nama_perusahaan" value={formData.nama_perusahaan} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('nama_perusahaan')}/></div>
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Alamat Perusahaan</label>
                      <textarea name="alamat_perusahaan" rows="2" value={formData.alamat_perusahaan} onChange={handleInputChange} disabled={isDetailMode} className={`${inputClass('alamat_perusahaan')} resize-none`}></textarea>
                    </div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Telp. Perusahaan</label><input type="text" name="telp_perusahaan" value={formData.telp_perusahaan} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('telp_perusahaan')}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Email Perusahaan</label><input type="email" name="email_perusahaan" value={formData.email_perusahaan} onChange={handleInputChange} disabled={isDetailMode} className={inputClass('email_perusahaan')}/></div>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
              {isDetailMode ? (
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>Tutup</button>
              ) : (
                <>
                  <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" form="asesiForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                    <Save size={16} /> Simpan Perubahan
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- IMPORT MODAL --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D]">Import Data Asesi Excel</h3>
              <button onClick={() => setShowImportModal(false)} className="text-[#182D4A] hover:text-[#CC6B27]"><X size={20}/></button>
            </div>
            <form onSubmit={handleImportExcel}>
              <div className="p-6 bg-white">
                <div className="border-2 border-dashed border-[#CC6B27]/30 rounded-xl p-8 text-center bg-[#CC6B27]/5">
                  <Upload className="mx-auto text-[#CC6B27] mb-3" size={36} />
                  <p className="text-[13px] font-bold text-[#071E3D] mb-4">Upload file Excel Asesi (.xlsx)</p>
                  <input type="file" accept=".xlsx, .xls" onChange={(e) => setFileExcel(e.target.files[0])} className="block w-full text-[12px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-bold file:bg-[#071E3D] file:text-white hover:file:bg-[#182D4A] file:cursor-pointer cursor-pointer transition-colors"/>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowImportModal(false)}>Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                  <Upload size={16}/> Upload Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahAsesi;