import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api"; 
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, 
  User as UserIcon, Loader2, Upload, FileSpreadsheet,
  Briefcase, GraduationCap, MapPin, Mail, Users
} from 'lucide-react';

const Asesor = () => {
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

  // --- FORM DATA ---
  const initialFormState = {
    nik: '', email: '', no_hp: '', gelar_depan: '', nama_lengkap: '', gelar_belakang: '',
    jenis_kelamin: 'laki-laki', tempat_lahir: '', tanggal_lahir: '', kebangsaan: 'Indonesia',
    pendidikan_terakhir: 'S1', tahun_lulus: '', institut_asal: '', alamat: '', rt: '', rw: '',
    provinsi: '', kota: '', kecamatan: '', kelurahan: '', kode_pos: '', bidang_keahlian: '',
    no_reg_asesor: '', no_lisensi: '', masa_berlaku: '', status_asesor: 'aktif'
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA LIST ---
  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/asesor?page=${page}&limit=${pagination.limit}&search=${search}`);
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
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, searchTerm);
  }, [pagination.page, searchTerm]);

  // --- LOAD PROVINSI AWAL ---
  useEffect(() => {
    const loadProvinsi = async () => {
      try {
        const res = await getProvinsi();
        setProvinsiList(res.data || res);
      } catch (err) {
        console.error("Gagal load provinsi", err);
      }
    };
    loadProvinsi();
  }, []);

  // --- HANDLERS WILAYAH ---
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.nik || !formData.email || !formData.nama_lengkap) {
        return Swal.fire('Peringatan', 'NIK, Email, dan Nama Lengkap wajib diisi!', 'warning');
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const payload = { ...formData };
      if (payload.tanggal_lahir === "") payload.tanggal_lahir = null;
      if (payload.masa_berlaku === "") payload.masa_berlaku = null;
      payload.tahun_lulus = payload.tahun_lulus ? parseInt(payload.tahun_lulus) : null;
      payload.nik = String(payload.nik).trim();
      payload.no_hp = String(payload.no_hp).trim();

      if (isEditMode) {
        await api.put(`/admin/asesor/${currentId}`, payload);
        Swal.fire('Berhasil', 'Data asesor diperbarui', 'success');
      } else {
        await api.post('/admin/asesor', payload);
        Swal.fire('Berhasil', 'Asesor baru ditambahkan', 'success');
      }

      setShowModal(false);
      fetchData(pagination.page); 
      resetForm();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data. Cek inputan Anda.';
      Swal.fire('Gagal', msg, 'error');
    }
  };

  const handleSendAccount = async (id_user) => {
    if (!id_user) return Swal.fire('Error', 'Data User (Akun) tidak ditemukan untuk asesor ini.', 'error');
    const confirm = await Swal.fire({
      title: 'Kirim Informasi Akun?',
      text: "Sistem akan mengirimkan email berisi Username dan Password ke alamat email Asesor tersebut.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#CC6B27',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Kirim Email'
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: 'Mengirim Email...', text: 'Harap tunggu sebentar', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.post(`/admin/send-email/${id_user}`);
        Swal.fire('Terkirim!', 'Informasi akun berhasil dikirim ke email asesor.', 'success');
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengirim email.', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedProvinsiId(''); setSelectedKotaId(''); setSelectedKecamatanId('');
    setIsEditMode(false); setIsDetailMode(false); setCurrentId(null);
  };

  const handleAdd = () => { resetForm(); setShowModal(true); };

  const handleEdit = async (item) => {
    resetForm();
    setIsEditMode(true);
    setCurrentId(item.id_user || item.id);
    
    setFormData({
        nik: item.nik, email: item.user?.email || item.email || '', no_hp: item.user?.no_hp || item.no_hp || '',
        gelar_depan: item.gelar_depan || '', nama_lengkap: item.nama_lengkap, gelar_belakang: item.gelar_belakang || '',
        jenis_kelamin: item.jenis_kelamin || 'laki-laki', tempat_lahir: item.tempat_lahir || '',
        tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '', kebangsaan: item.kebangsaan || 'Indonesia',
        pendidikan_terakhir: item.pendidikan_terakhir || 'S1', tahun_lulus: item.tahun_lulus || '', institut_asal: item.institut_asal || '',
        alamat: item.alamat || '', rt: item.rt || '', rw: item.rw || '', provinsi: item.provinsi || '', kota: item.kota || '',
        kecamatan: item.kecamatan || '', kelurahan: item.kelurahan || '', kode_pos: item.kode_pos || '', bidang_keahlian: item.bidang_keahlian || '',
        no_reg_asesor: item.no_reg_asesor || '', no_lisensi: item.no_lisensi || '',
        masa_berlaku: item.masa_berlaku ? item.masa_berlaku.split('T')[0] : '', status_asesor: item.status_asesor || 'aktif'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Hapus Data?', text: "Data yang dihapus tidak dapat dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!' });
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/asesor/${id}`);
        Swal.fire('Terhapus!', 'Data asesor telah dihapus.', 'success');
        fetchData(pagination.page);
      } catch (error) {
        Swal.fire('Gagal', 'Tidak bisa menghapus data.', 'error');
      }
    }
  };

  // Helper Input Class
  const inputClass = "w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all disabled:opacity-60 disabled:bg-gray-100 font-medium";

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data Asesor</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola data asesor kompetensi LSP</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-[#FAFAFA] text-[#182D4A] border border-[#071E3D]/20 hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2 text-[13px]"
            onClick={() => setShowImportModal(true)}
          >
            <FileSpreadsheet size={18} /> Import Excel
          </button>
          <button 
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[13px]"
            onClick={handleAdd}
          >
            <Plus size={18} /> Tambah Asesor
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <Users size={18} className="text-[#CC6B27]"/> Daftar Asesor
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari Nama atau NIK..." 
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
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Bidang Keahlian</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">No. MET</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data asesor...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <UserIcon size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data asesor ditemukan.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_user || item.id || index} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="py-3 px-4 font-mono text-[13px] font-bold text-[#CC6B27]">{item.nik}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px]">
                        {item.gelar_depan} {item.nama_lengkap} {item.gelar_belakang}
                      </div>
                      <div className="text-[11px] text-[#182D4A]/70 mt-0.5">{item.user?.email || item.email}</div>
                    </td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px]">{item.bidang_keahlian || '-'}</td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px] font-medium">{item.no_reg_asesor || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border capitalize
                        ${item.status_asesor === 'aktif' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {item.status_asesor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleSendAccount(item.id_user)} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-600 hover:text-white border border-green-100 transition-colors" title="Kirim Akun via Email"><Mail size={16} /></button>
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
                    {isDetailMode ? 'Detail Data Asesor' : isEditMode ? 'Edit Data Asesor' : 'Tambah Asesor Baru'}
                  </h3>
                  <p className="text-[12px] text-[#182D4A]/70 m-0">Lengkapi informasi data diri, alamat, dan sertifikasi asesor.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="asesorForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. Identitas */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <UserIcon size={16}/> Identitas Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">NIK <span className="text-red-500">*</span></label><input type="text" name="nik" value={formData.nik} onChange={handleChange} maxLength="16" required disabled={isDetailMode} placeholder="16 Digit Angka" className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Nama Lengkap <span className="text-red-500">*</span></label><input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required disabled={isDetailMode} placeholder="Nama tanpa gelar" className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Gelar Depan</label><input type="text" name="gelar_depan" value={formData.gelar_depan} onChange={handleChange} disabled={isDetailMode} placeholder="Dr., Ir." className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Gelar Belakang</label><input type="text" name="gelar_belakang" value={formData.gelar_belakang} onChange={handleChange} disabled={isDetailMode} placeholder="S.Kom, M.T" className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Email Login <span className="text-red-500">*</span></label><input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isDetailMode || isEditMode} placeholder="Email aktif" className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">No HP / WhatsApp <span className="text-red-500">*</span></label><input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} required disabled={isDetailMode} placeholder="08xxxxxxxx" className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tempat Lahir</label><input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tanggal Lahir</label><input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Jenis Kelamin</label>
                      <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} disabled={isDetailMode} className={inputClass}>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kebangsaan</label><input type="text" name="kebangsaan" value={formData.kebangsaan} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
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
                      <textarea name="alamat" rows="2" value={formData.alamat} onChange={handleChange} disabled={isDetailMode} placeholder="Nama jalan, perumahan, gang..." className={`${inputClass} resize-none`}></textarea>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Provinsi</label>
                      <select onChange={handleProvinsiChange} value={selectedProvinsiId} disabled={isDetailMode} className={inputClass}>
                        <option value="">Pilih Provinsi</option>
                        {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {!selectedProvinsiId && formData.provinsi && <small className="text-[#CC6B27] text-[10px] font-bold mt-1 block">Tersimpan: {formData.provinsi}</small>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kota / Kabupaten</label>
                      <select onChange={handleKotaChange} value={selectedKotaId} disabled={!selectedProvinsiId || isDetailMode} className={inputClass}>
                        <option value="">Pilih Kota</option>
                        {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                      {!selectedKotaId && formData.kota && <small className="text-[#CC6B27] text-[10px] font-bold mt-1 block">Tersimpan: {formData.kota}</small>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kecamatan</label>
                      <select onChange={handleKecamatanChange} value={selectedKecamatanId} disabled={!selectedKotaId || isDetailMode} className={inputClass}>
                        <option value="">Pilih Kecamatan</option>
                        {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                      {!selectedKecamatanId && formData.kecamatan && <small className="text-[#CC6B27] text-[10px] font-bold mt-1 block">Tersimpan: {formData.kecamatan}</small>}
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kelurahan</label>
                      <select onChange={handleKelurahanChange} disabled={!selectedKecamatanId || isDetailMode} className={inputClass}>
                        <option value="">Pilih Kelurahan</option>
                        {kelurahanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                      {formData.kelurahan && <small className="text-[#CC6B27] text-[10px] font-bold mt-1 block">Tersimpan: {formData.kelurahan}</small>}
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:col-span-2">
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">RT</label><input type="text" name="rt" value={formData.rt} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">RW</label><input type="text" name="rw" value={formData.rw} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                      <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Kode Pos</label><input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    </div>
                  </div>
                </div>

                {/* 3. Pendidikan */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <GraduationCap size={16}/> Pendidikan & Keahlian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Pendidikan Terakhir</label>
                      <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} disabled={isDetailMode} className={inputClass}>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="D4">D4</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Tahun Lulus</label><input type="number" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div className="md:col-span-2"><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Nama Institusi / Universitas</label><input type="text" name="institut_asal" value={formData.institut_asal} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div className="md:col-span-2"><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Bidang Keahlian <span className="text-red-500">*</span></label><input type="text" name="bidang_keahlian" value={formData.bidang_keahlian} onChange={handleChange} required disabled={isDetailMode} placeholder="Contoh: Pemrograman Web, Jaringan" className={inputClass}/></div>
                  </div>
                </div>

                {/* 4. Sertifikasi */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <Briefcase size={16}/> Data Sertifikasi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">No. Registrasi (MET)</label><input type="text" name="no_reg_asesor" value={formData.no_reg_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">No. Lisensi</label><input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div><label className="block text-[12px] font-bold text-[#071E3D] mb-1">Masa Berlaku Sertifikat</label><input type="date" name="masa_berlaku" value={formData.masa_berlaku} onChange={handleChange} disabled={isDetailMode} className={inputClass}/></div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#071E3D] mb-1">Status Asesor</label>
                      <select name="status_asesor" value={formData.status_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass}>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-Aktif</option>
                      </select>
                    </div>
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
                  <button type="submit" form="asesorForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                    <Save size={16} /> Simpan Data
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D]">Import Data Excel</h3>
              <button onClick={() => setShowImportModal(false)} className="text-[#182D4A] hover:text-[#CC6B27]"><X size={20}/></button>
            </div>
            <div className="p-6 bg-white">
              <div className="border-2 border-dashed border-[#CC6B27]/30 rounded-xl p-8 text-center bg-[#CC6B27]/5">
                <Upload className="mx-auto text-[#CC6B27] mb-3" size={36} />
                <p className="text-[13px] font-bold text-[#071E3D] mb-4">Upload file template Excel (.xlsx)</p>
                <input type="file" className="block w-full text-[12px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-bold file:bg-[#071E3D] file:text-white hover:file:bg-[#182D4A] file:cursor-pointer cursor-pointer transition-colors"/>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
              <button className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowImportModal(false)}>Batal</button>
              <button className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm text-[13px]">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asesor;