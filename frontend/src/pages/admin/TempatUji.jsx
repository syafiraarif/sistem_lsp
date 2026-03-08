import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, Upload, FileSpreadsheet,
  MapPin, User, Building2, Loader2, FileText, Home
} from 'lucide-react';

const TempatUji = () => {
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

  // --- FORM DATA ---
  const initialFormState = {
    // Data Akun (User)
    email: '',
    no_hp: '',

    // Data Profile TUK
    kode_tuk: '',
    nama_tuk: '',
    jenis_tuk: 'sewaktu',
    profil_singkat: '',
    
    // Alamat
    alamat: '',
    rt: '',
    rw: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    kode_pos: '',
    
    // Legalitas
    no_lisensi: '',
    masa_berlaku_lisensi: '',
    status_tuk: 'aktif'
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- LOAD DATA ---
  useEffect(() => {
    fetchData();
    fetchProvinsi();
  }, [pagination.page, searchTerm]);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/tuk', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
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

  const fetchProvinsi = async () => {
    try {
      const res = await getProvinsi();
      setProvinsiList(res);
    } catch (err) { console.error("Gagal load provinsi", err); }
  };

  // --- HANDLER WILAYAH ---
  const handleProvinsiChange = async (e) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, provinsi: name, kota: '', kecamatan: '', kelurahan: '' });
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    if (id) setKotaList(await getKota(id));
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, kota: name, kecamatan: '', kelurahan: '' });
    setKecamatanList([]); setKelurahanList([]);
    if (id) setKecamatanList(await getKecamatan(id));
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, kecamatan: name, kelurahan: '' });
    setKelurahanList([]);
    if (id) setKelurahanList(await getKelurahan(id));
  };

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
        email: item.User?.email || '',
        no_hp: item.User?.no_hp || '',
        kode_tuk: item.kode_tuk,
        nama_tuk: item.nama_tuk,
        jenis_tuk: item.jenis_tuk || 'sewaktu',
        profil_singkat: item.profil_singkat || '',
        alamat: item.alamat || '',
        rt: item.rt || '',
        rw: item.rw || '',
        provinsi: item.provinsi || '',
        kota: item.kota || '',
        kecamatan: item.kecamatan || '',
        kelurahan: item.kelurahan || '',
        kode_pos: item.kode_pos || '',
        no_lisensi: item.no_lisensi || '',
        masa_berlaku_lisensi: toDateInput(item.masa_berlaku_lisensi),
        status_tuk: item.status_tuk || 'aktif'
      });
      return true;
    } catch (error) {
      Swal.fire({title: 'Error', text: 'Gagal mengambil detail TUK', icon: 'error', confirmButtonColor: '#CC6B27'});
      return false;
    }
  };

  const openEditModal = async (id) => {
    resetForm();
    const success = await fetchDetail(id);
    if (success) {
      setCurrentId(id);
      setIsEditMode(true);
      setShowModal(true);
    }
  };

  const openDetailModal = async (id) => {
    resetForm();
    const success = await fetchDetail(id);
    if (success) {
      setIsDetailMode(true);
      setShowModal(true);
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
        await api.post('/admin/tuk-akun', payload);
        Swal.fire({title: 'Sukses', text: 'TUK baru berhasil dibuat.', icon: 'success', confirmButtonColor: '#CC6B27'});
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
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

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.elements[0].files[0];
    if (!file) return Swal.fire({title: 'Peringatan', text: 'Pilih file excel dulu', icon: 'warning', confirmButtonColor: '#CC6B27'});

    const form = new FormData();
    form.append('file', file);

    try {
      await api.post('/admin/import-tuk', form);
      Swal.fire({title: 'Sukses', text: 'Import berhasil', icon: 'success', confirmButtonColor: '#CC6B27'});
      setShowImportModal(false);
      fetchData();
    } catch (err) {
      Swal.fire({title: 'Gagal', text: err.response?.data?.message || 'Import gagal', icon: 'error', confirmButtonColor: '#CC6B27'});
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
            onClick={() => setShowImportModal(true)}
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
        
        {/* Search */}
        <div className="w-full md:w-80 relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
            placeholder="Cari Kode atau Nama TUK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <th className="py-3.5 px-4 text-center w-32">Aksi</th>
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
                  <tr key={item.id_user || idx} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-[#071E3D] text-[13.5px]">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                    <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md font-mono font-medium text-[13px] text-[#182D4A]">{item.kode_tuk}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px] max-w-sm truncate">{item.nama_tuk}</div>
                      <div className="text-[12px] text-[#182D4A]/70 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={12}/> {item.kota}, {item.provinsi}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <span className="text-[12px] font-bold text-[#182D4A] capitalize bg-[#071E3D]/5 px-2.5 py-1 rounded-md border border-[#071E3D]/10">{item.jenis_tuk?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                        item.status_tuk === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.status_tuk}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => openDetailModal(item.id_user)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors" title="Detail"><Eye size={18}/></button>
                        <button onClick={() => openEditModal(item.id_user)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Edit"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(item.id_user)} className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={18}/></button>
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
            
            <div className="overflow-y-auto px-6 py-5">
                <form id="tukForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* AKUN */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-bold text-[#071E3D] border-b border-[#071E3D]/10 pb-2 flex items-center gap-2 m-0">
                        <User size={16} className="text-[#CC6B27]"/> Informasi Akun & Kontak
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">Email {isEditMode && <span className="text-red-500 font-normal">(Tidak bisa diubah)</span>}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isEditMode || isDetailMode} required={!isEditMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" placeholder="Email login TUK..."/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-[#071E3D]">No Handphone / Telp</label>
                            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} disabled={isEditMode || isDetailMode} required={!isEditMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100" placeholder="08..."/>
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
                            <label className="text-[13px] font-bold text-[#071E3D]">Profil Singkat</label>
                            <textarea name="profil_singkat" rows="2" value={formData.profil_singkat} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 resize-none"></textarea>
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
                                <select onChange={handleProvinsiChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none">
                                    <option value="">{formData.provinsi || "Pilih Provinsi"}</option>
                                    {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kota/Kab</label>
                                <select onChange={handleKotaChange} disabled={!kotaList.length} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">{formData.kota || "Pilih Kota"}</option>
                                    {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kecamatan</label>
                                <select onChange={handleKecamatanChange} disabled={!kecamatanList.length} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">{formData.kecamatan || "Pilih Kecamatan"}</option>
                                    {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kelurahan</label>
                                <select onChange={(e) => setFormData({...formData, kelurahan: e.target.options[e.target.selectedIndex].text})} disabled={!kelurahanList.length} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
                                    <option value="">{formData.kelurahan || "Pilih Kelurahan"}</option>
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
                        
                        <div className="grid grid-cols-3 gap-5 md:col-span-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">RT</label>
                                <input type="text" name="rt" value={formData.rt} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">RW</label>
                                <input type="text" name="rw" value={formData.rw} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#071E3D]">Kode Pos</label>
                                <input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100"/>
                            </div>
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
                            <select name="status_tuk" value={formData.status_tuk} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] disabled:opacity-70 disabled:bg-gray-100 appearance-none">
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

      {/* MODAL IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] m-0 flex items-center gap-2"><Upload size={20} className="text-[#CC6B27]"/> Import Data TUK</h3>
              <button onClick={() => setShowImportModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="p-6">
              <div className="border-2 border-dashed border-[#071E3D]/30 rounded-xl p-8 text-center bg-[#FAFAFA] hover:bg-white transition-colors cursor-pointer relative">
                <Upload className="mx-auto text-[#CC6B27] mb-3" size={40} />
                <p className="text-[13px] font-bold text-[#071E3D] mb-1">Pilih atau letakkan file Excel di sini</p>
                <p className="text-[12px] font-medium text-[#182D4A]/70">Format yang didukung: .xls, .xlsx</p>
                <input type="file" accept=".xlsx, .xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required/>
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