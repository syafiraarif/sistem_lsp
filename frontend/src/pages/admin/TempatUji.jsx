import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, Upload, FileSpreadsheet,
  MapPin, User, Building2, Loader2, FileText, Home, Mail, Key, CheckCircle
} from 'lucide-react';

const TempatUji = () => {
  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE FILTER & SEARCH
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); 
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState(null); // Menampung file Excel yg dipilih
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

  // --- FORM DATA ---
  const initialFormState = {
    email: '',
    telepon: '',
    kode_tuk: '',
    nama_tuk: '',
    jenis_tuk: 'sewaktu',
    institusi_induk: '',
    alamat: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    kode_pos: '',
    no_lisensi: '',
    masa_berlaku_lisensi: '',
    status: 'aktif'
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- LOAD DATA ---
  useEffect(() => {
    fetchData();
    fetchProvinsiInit();
  }, [pagination.page, searchTerm, filterStatus]);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/tuk', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: filterStatus 
        }
      });

      const result = response.data.data || response.data;
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.rows) {
        setData(result.rows);
        setPagination(prev => ({ ...prev, total: result.count }));
      }
    } catch (error) {
      console.error("Error fetching TUK:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinsiInit = async () => {
    try {
      const res = await getProvinsi();
      setProvinsiList(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) { console.error("Gagal load provinsi", err); }
  };

  // --- HANDLER WILAYAH ---
  const handleProvinsiChange = async (e) => {
    const id = e.target.value;
    const name = id ? provinsiList.find(p => String(p.id) === String(id))?.name : '';
    
    setFormData(prev => ({ ...prev, provinsi: name || '', kota: '', kecamatan: '', kelurahan: '' }));
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    
    if (id) {
      try {
        const res = await getKota(id);
        setKotaList(Array.isArray(res) ? res : (res?.data || []));
      } catch(err) { console.error(err) }
    }
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const name = id ? kotaList.find(p => String(p.id) === String(id))?.name : '';
    
    setFormData(prev => ({ ...prev, kota: name || '', kecamatan: '', kelurahan: '' }));
    setKecamatanList([]); setKelurahanList([]);
    
    if (id) {
      try {
        const res = await getKecamatan(id);
        setKecamatanList(Array.isArray(res) ? res : (res?.data || []));
      } catch(err) { console.error(err) }
    }
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const name = id ? kecamatanList.find(p => String(p.id) === String(id))?.name : '';
    
    setFormData(prev => ({ ...prev, kecamatan: name || '', kelurahan: '' }));
    setKelurahanList([]);
    
    if (id) {
      try {
        const res = await getKelurahan(id);
        setKelurahanList(Array.isArray(res) ? res : (res?.data || []));
      } catch(err) { console.error(err) }
    }
  };

  const handleKelurahanChange = (e) => {
    const id = e.target.value;
    const name = id ? kelurahanList.find(k => String(k.id) === String(id))?.name : '';
    setFormData(prev => ({ ...prev, kelurahan: name || '' }));
  };

  const selectedProvinsiId = provinsiList.find(p => p.name === formData.provinsi)?.id || "";
  const selectedKotaId = kotaList.find(k => k.name === formData.kota)?.id || "";
  const selectedKecamatanId = kecamatanList.find(k => k.name === formData.kecamatan)?.id || "";
  const selectedKelurahanId = kelurahanList.find(k => k.name === formData.kelurahan)?.id || "";

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    setIsEditMode(false); setIsDetailMode(false); setCurrentId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/admin/tuk/${id}`);
      const item = res.data.data || res.data;
      
      const toDateInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

      setFormData({
        email: item.email || '',
        telepon: item.telepon || '',
        kode_tuk: item.kode_tuk || '',
        nama_tuk: item.nama_tuk || '',
        jenis_tuk: item.jenis_tuk || 'sewaktu',
        institusi_induk: item.institusi_induk || '',
        alamat: item.alamat || '',
        provinsi: item.provinsi || '',
        kota: item.kota || '',
        kecamatan: item.kecamatan || '',
        kelurahan: item.kelurahan || '',
        kode_pos: item.kode_pos || '',
        no_lisensi: item.no_lisensi || '',
        masa_berlaku_lisensi: toDateInput(item.masa_berlaku_lisensi),
        status: item.status || 'aktif'
      });
      return item;
    } catch (error) {
      Swal.fire({title: 'Error', text: 'Gagal mengambil detail TUK', icon: 'error', confirmButtonColor: '#CC6B27'});
      return null;
    }
  };

  const fetchDependentRegions = async (item) => {
    if (!item.provinsi) return;
    const provMatch = provinsiList.find(p => p.name === item.provinsi);
    if (!provMatch) return;

    try {
        const kotaRes = await getKota(provMatch.id);
        const kList = Array.isArray(kotaRes) ? kotaRes : (kotaRes?.data || []);
        setKotaList(kList);

        if (item.kota) {
            const kotaMatch = kList.find(k => k.name === item.kota);
            if (kotaMatch) {
                const kecRes = await getKecamatan(kotaMatch.id);
                const kecList = Array.isArray(kecRes) ? kecRes : (kecRes?.data || []);
                setKecamatanList(kecList);

                if (item.kecamatan) {
                    const kecMatch = kecList.find(k => k.name === item.kecamatan);
                    if (kecMatch) {
                        const kelRes = await getKelurahan(kecMatch.id);
                        const kelList = Array.isArray(kelRes) ? kelRes : (kelRes?.data || []);
                        setKelurahanList(kelList);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Gagal meload child wilayah", e);
    }
  };

  const openEditModal = async (id) => {
    resetForm();
    const item = await fetchDetail(id);
    if (item) {
      setCurrentId(id);
      setIsEditMode(true);
      setShowModal(true);
      await fetchDependentRegions(item);
    }
  };

  const openDetailModal = async (id) => {
    resetForm();
    const item = await fetchDetail(id);
    if (item) {
      setIsDetailMode(true);
      setShowModal(true);
    }
  };

  // --- ACTIONS ---
  const handleSendEmail = async (tukId, hasAccount) => {
    if (!tukId || hasAccount) return; 
    
    const confirm = await Swal.fire({
      title: 'Buat & Kirim Akun?',
      text: "Akun penanggung jawab untuk TUK ini belum ada. Sistem akan membuatkan akun dan mengirimkannya via email. Lanjutkan?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: 'Memproses...',
        text: 'Sedang membuat akun dan mengirim email...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const resGenerate = await api.post(`/admin/tuk/${tukId}/generate-account`);
        const targetUserId = resGenerate.data.data.id_user; 
        await api.post(`/admin/send-email/${targetUserId}`);
        
        Swal.fire({
          title: 'Sukses', 
          text: 'Akun berhasil dibuat & email informasi login telah dikirim.', 
          icon: 'success', 
          confirmButtonColor: '#CC6B27'
        });
        
        fetchData(); 
      } catch (error) {
        Swal.fire({
          title: 'Gagal', 
          text: error.response?.data?.message || 'Gagal memproses akun/email', 
          icon: 'error', 
          confirmButtonColor: '#CC6B27'
        });
      }
    }
  };

  const handleResetPassword = async (id_user) => {
    if (!id_user) {
      return Swal.fire({title: 'Peringatan', text: 'ID User (Penanggung Jawab) tidak ditemukan untuk TUK ini.', icon: 'warning', confirmButtonColor: '#CC6B27'});
    }
    const confirm = await Swal.fire({
      title: 'Reset Password?',
      text: "Password akan direset dan dikirimkan ke email TUK. Lanjutkan?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await api.put(`/admin/tuk/${id_user}/reset-password`);
        Swal.fire({title: 'Sukses', text: 'Password berhasil direset dan dikirim ke email.', icon: 'success', confirmButtonColor: '#CC6B27'});
      } catch (error) {
        Swal.fire({title: 'Gagal', text: error.response?.data?.message || 'Gagal mereset password', icon: 'error', confirmButtonColor: '#CC6B27'});
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.masa_berlaku_lisensi) payload.masa_berlaku_lisensi = null;
    
    if (!payload.kode_tuk || !payload.nama_tuk) {
      Swal.fire({title: 'Peringatan', text: 'Kode TUK dan Nama TUK wajib diisi!', icon: 'warning', confirmButtonColor: '#CC6B27'});
      return;
    }

    try {
      if (isEditMode) {
        await api.put(`/admin/tuk/${currentId}`, payload);
        Swal.fire({title: 'Sukses', text: 'Data TUK berhasil diperbarui', icon: 'success', confirmButtonColor: '#CC6B27'});
      } else {
<<<<<<< HEAD
        // Create akun user & TUK
        await api.post('/admin/tuk', payload);
        Swal.fire({title: 'Sukses', text: 'TUK baru berhasil dibuat.', icon: 'success', confirmButtonColor: '#CC6B27'});
=======
        await api.post('/admin/tuk', payload);
        Swal.fire({title: 'Sukses', text: 'TUK baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#CC6B27'});
>>>>>>> 80010cdc8138b371dcd978cf1d54fe2b48eeab22
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire({title: 'Gagal', text: error.response?.data?.message || 'Gagal menyimpan data', icon: 'error', confirmButtonColor: '#CC6B27'});
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus TUK?',
      text: "Data akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/tuk/${id}`);
        Swal.fire({title: 'Terhapus', text: 'Data TUK telah dihapus', icon: 'success', confirmButtonColor: '#CC6B27'});
        fetchData();
      } catch (error) {
        Swal.fire({title: 'Gagal', text: 'Gagal menghapus data', icon: 'error', confirmButtonColor: '#CC6B27'});
      }
    }
  };

  // ==========================================
  // FUNGSI IMPORT EXCEL DENGAN LOADING & STATE FILE
  // ==========================================
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImportFile) {
        return Swal.fire({title: 'Peringatan', text: 'Pilih file excel terlebih dahulu', icon: 'warning', confirmButtonColor: '#CC6B27'});
    }

    const form = new FormData();
    form.append('file', selectedImportFile);

    // Tampilkan animasi Loading karena pengiriman banyak email memakan waktu lama
    Swal.fire({
      title: 'Memproses Import...',
      text: 'Sistem sedang membaca file, membuat akun, dan mengirimkan email. Harap jangan tutup halaman ini.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const response = await api.post('/admin/import-tuk', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Swal.fire({
        title: 'Import Selesai', 
        text: response.data.message || 'Data berhasil diimport dan email telah dikirim!', 
        icon: 'success', 
        confirmButtonColor: '#CC6B27'
      });

      setShowImportModal(false);
      setSelectedImportFile(null); // Reset form
      fetchData();
    } catch (err) {
      Swal.fire({
        title: 'Gagal Import', 
        text: err.response?.data?.message || 'Gagal membaca atau memproses file Excel', 
        icon: 'error', 
        confirmButtonColor: '#CC6B27'
      });
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data Tempat Uji Kompetensi (TUK)</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola data TUK, lokasi, dan status lisensi.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-[#071E3D]/20 text-[#182D4A] rounded-lg hover:bg-[#E2E8F0] shadow-sm transition-all font-bold flex items-center justify-center gap-2 text-[13px]" 
            onClick={() => {
              setSelectedImportFile(null); // Reset setiap kali modal dibuka
              setShowImportModal(true);
            }}
          >
            <FileSpreadsheet size={18} /> Import
          </button>
          <button 
            className="flex-1 md:flex-none px-4 py-2 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 text-[13px]" 
            onClick={openCreateModal}
          >
            <Plus size={18} /> Tambah TUK
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* --- PENCARIAN & FILTER --- */}
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Kode atau Nama TUK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({...prev, page: 1})); 
              }}
            />
          </div>

          <select 
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(prev => ({...prev, page: 1})); 
            }}
            className="w-full md:w-48 px-3 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-medium appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Status: Aktif</option>
            <option value="nonaktif">Status: Nonaktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Kode TUK</th>
                <th className="py-3.5 px-4">Nama TUK</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data TUK...</p>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={item.id_tuk || idx} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-[#071E3D] text-[13.5px]">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                    <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md font-mono font-medium text-[13px] text-[#182D4A]">{item.kode_tuk}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px] max-w-sm truncate">{item.nama_tuk}</div>
                      <div className="text-[12px] text-[#182D4A]/70 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={12}/> {item.kota || '-'}, {item.provinsi || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <span className="text-[12px] font-bold text-[#182D4A] capitalize bg-[#071E3D]/5 px-2.5 py-1 rounded-md border border-[#071E3D]/10">{item.jenis_tuk?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                        item.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        
                        <button 
                          onClick={() => handleSendEmail(item.id_tuk, !!item.penanggungJawab)} 
                          disabled={!!item.penanggungJawab}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.penanggungJawab 
                              ? "text-[#182D4A]/30 bg-[#071E3D]/5 cursor-not-allowed" 
                              : "text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10"
                          }`} 
                          title={item.penanggungJawab ? "Akun sudah dibuat" : "Buat Akun & Kirim Email"}
                        >
                          <Mail size={18}/>
                        </button>
                        
                        <button onClick={() => handleResetPassword(item.penanggungJawab?.id_user)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Reset Password"><Key size={18}/></button>
                        <button onClick={() => openDetailModal(item.id_tuk)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors" title="Detail"><Eye size={18}/></button>
                        <button onClick={() => openEditModal(item.id_tuk)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Edit"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(item.id_tuk)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="6" className="text-center py-16 text-[#182D4A]/50 font-medium text-[14px]">Data TUK tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM UTAMA --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {isDetailMode ? <><Eye size={20} className="text-[#CC6B27]"/> Detail TUK</> : isEditMode ? <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Data TUK</> : <><Plus size={20} className="text-[#CC6B27]"/> Tambah TUK Baru</>}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <div className="overflow-y-auto px-6 py-5 custom-scrollbar">
                <form id="tukForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* AKUN */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                        <User size={16} className="text-[#CC6B27]"/> Informasi Akun & Kontak
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Email {isEditMode && <span className="text-[#182D4A]/50 font-normal">(Tidak bisa diubah)</span>}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isEditMode || isDetailMode} required={!isEditMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" placeholder="Email login TUK..."/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">No Handphone / Telp</label>
                            <input type="text" name="telepon" value={formData.telepon} onChange={handleInputChange} disabled={isDetailMode} required={!isEditMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" placeholder="08..."/>
                        </div>
                    </div>
                </div>

                {/* PROFIL TUK */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                        <Building2 size={16} className="text-[#CC6B27]"/> Profil TUK
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Kode TUK <span className="text-red-500">*</span></label>
                            <input type="text" name="kode_tuk" value={formData.kode_tuk} onChange={handleInputChange} disabled={isDetailMode} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Nama TUK <span className="text-red-500">*</span></label>
                            <input type="text" name="nama_tuk" value={formData.nama_tuk} onChange={handleInputChange} disabled={isDetailMode} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Jenis TUK</label>
                            <select name="jenis_tuk" value={formData.jenis_tuk} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                <option value="sewaktu">TUK Sewaktu</option>
                                <option value="tempat_kerja">TUK Tempat Kerja</option>
                                <option value="mandiri">TUK Mandiri</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Institusi Induk</label>
                            <input type="text" name="institusi_induk" value={formData.institusi_induk} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" placeholder="Nama instansi/perusahaan..."/>
                        </div>
                    </div>
                </div>

                {/* ALAMAT */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                        <Home size={16} className="text-[#CC6B27]"/> Alamat & Lokasi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Alamat Lengkap</label>
                            <textarea name="alamat" rows="2" value={formData.alamat} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 resize-none"></textarea>
                        </div>
                        
                        {!isDetailMode ? (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Provinsi</label>
                                <select value={selectedProvinsiId} onChange={handleProvinsiChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                                    <option value="">Pilih Provinsi</option>
                                    {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kota/Kab</label>
                                <select value={selectedKotaId} onChange={handleKotaChange} disabled={kotaList.length === 0} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">Pilih Kota/Kab</option>
                                    {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kecamatan</label>
                                <select value={selectedKecamatanId} onChange={handleKecamatanChange} disabled={kecamatanList.length === 0} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">Pilih Kecamatan</option>
                                    {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kelurahan</label>
                                <select value={selectedKelurahanId} onChange={handleKelurahanChange} disabled={kelurahanList.length === 0} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">Pilih Kelurahan</option>
                                    {kelurahanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                        </>
                        ) : (
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Wilayah</label>
                            <input value={`${formData.kelurahan || '-'}, ${formData.kecamatan || '-'}, ${formData.kota || '-'}, ${formData.provinsi || '-'}`} disabled className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" />
                        </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[13px] font-bold text-[#071E3D]">Kode Pos</label>
                            <input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 w-full md:w-1/2"/>
                        </div>
                    </div>
                </div>

                {/* LEGALITAS */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                        <FileText size={16} className="text-[#CC6B27]"/> Legalitas & Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">No. Lisensi</label>
                            <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Masa Berlaku Lisensi</label>
                            <input type="date" name="masa_berlaku_lisensi" value={formData.masa_berlaku_lisensi} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Status TUK</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>
                </form>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>
                {isDetailMode ? 'Tutup' : 'Batal'}
              </button>
              {!isDetailMode && (
                <button type="submit" form="tukForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                  <Save size={16}/> Simpan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL IMPORT DENGAN FEEDBACK VISUAL NAMA FILE --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0 flex items-center gap-2"><Upload size={20} className="text-[#CC6B27]"/> Import Data TUK</h3>
              <button onClick={() => setShowImportModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="p-6">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative ${
                selectedImportFile ? 'border-green-500/50 bg-green-50' : 'border-[#071E3D]/30 bg-[#FAFAFA] hover:bg-white'
              }`}>
                
                {selectedImportFile ? (
                  <>
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
                    <p className="text-[14px] font-bold text-green-700 mb-1 truncate px-4">{selectedImportFile.name}</p>
                    <p className="text-[12px] font-medium text-green-600/70">Klik untuk mengganti file</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto text-[#CC6B27] mb-3" size={40} />
                    <p className="text-[13px] font-bold text-[#071E3D] mb-1">Pilih atau letakkan file Excel di sini</p>
                    <p className="text-[12px] font-medium text-[#182D4A]/70">Format yang didukung: .xls, .xlsx</p>
                  </>
                )}

                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  required
                  onChange={(e) => setSelectedImportFile(e.target.files[0])} // Update state ketika file dipilih
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowImportModal(false)}>Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all text-[13px]">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempatUji;