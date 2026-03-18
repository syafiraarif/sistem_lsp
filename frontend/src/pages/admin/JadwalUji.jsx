import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Edit2, Trash2, X, Save, 
  Calendar, Loader2, Clock, MapPin, Layers, Link as LinkIcon, CalendarDays, ClipboardList
} from 'lucide-react';

const JadwalUji = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Data Pendukung Dropdown
  const [listSkema, setListSkema] = useState([]);
  const [listTuk, setListTuk] = useState([]);

  // State Form (Disesuaikan dengan field di jadwal.model.js)
  const initialFormState = {
    kode_jadwal: '',
    id_skema: '',
    id_tuk: '',
    nama_kegiatan: '',
    tahun: new Date().getFullYear(),
    periode_bulan: '',
    gelombang: '',
    tgl_pra_asesmen: '',
    tgl_awal: '',
    tgl_akhir: '',
    jam: '',
    kuota: 0,
    pelaksanaan_uji: 'luring', 
    url_agenda: '',
    status: 'draft' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // Daftar Bulan Statis
  const listBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Jadwal Utama
    try {
      const response = await api.get('/admin/jadwal');
      let jadwalData = response.data?.data || response.data || [];
      if (!Array.isArray(jadwalData) && Array.isArray(jadwalData.data)) jadwalData = jadwalData.data;
      else if (!Array.isArray(jadwalData) && Array.isArray(jadwalData.rows)) jadwalData = jadwalData.rows;
      setData(Array.isArray(jadwalData) ? jadwalData : []);
    } catch (error) {
      console.error("Error fetching Jadwal:", error);
      Swal.fire('Error', 'Gagal memuat data jadwal utama', 'error');
    }

    // 2. Fetch Skema (Dropdown)
    try {
      const skemaRes = await api.get('/admin/skema');
      let skemaData = skemaRes.data?.data || skemaRes.data || [];
      if (!Array.isArray(skemaData) && Array.isArray(skemaData.data)) skemaData = skemaData.data;
      else if (!Array.isArray(skemaData) && Array.isArray(skemaData.rows)) skemaData = skemaData.rows;
      setListSkema(Array.isArray(skemaData) ? skemaData : []);
    } catch (error) {
      console.error("Error fetching Skema:", error);
    }

    // 3. Fetch TUK (Dropdown)
    try {
      const tukRes = await api.get('/admin/tuk');
      let tukData = tukRes.data?.data || tukRes.data || [];
      if (!Array.isArray(tukData) && Array.isArray(tukData.data)) tukData = tukData.data;
      else if (!Array.isArray(tukData) && Array.isArray(tukData.rows)) tukData = tukData.rows;
      setListTuk(Array.isArray(tukData) ? tukData : []);
    } catch (error) {
      console.error("Error fetching TUK:", error);
    }

    setLoading(false);
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
    setCurrentId(item.id_jadwal);
    
    const formatDate = (dateString) => dateString ? dateString.split('T')[0] : '';

    setFormData({
      kode_jadwal: item.kode_jadwal || '',
      id_skema: item.id_skema || '',
      id_tuk: item.id_tuk || '',
      nama_kegiatan: item.nama_kegiatan || '',
      tahun: item.tahun || new Date().getFullYear(),
      periode_bulan: item.periode_bulan || '',
      gelombang: item.gelombang || '',
      tgl_pra_asesmen: formatDate(item.tgl_pra_asesmen),
      tgl_awal: formatDate(item.tgl_awal),
      tgl_akhir: formatDate(item.tgl_akhir),
      jam: item.jam || '',
      kuota: item.kuota || 0,
      pelaksanaan_uji: item.pelaksanaan_uji || 'luring',
      url_agenda: item.url_agenda || '',
      status: item.status || 'draft'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Jadwal?',
      icon: 'warning',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/jadwal/${id}`);
        Swal.fire('Terhapus!', 'Data jadwal berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal hapus data', 'error');
      }
    }
  };

  const sanitizeData = (data) => {
    const clean = { ...data };
    clean.id_skema = clean.id_skema ? parseInt(clean.id_skema) : null;
    clean.id_tuk = clean.id_tuk ? parseInt(clean.id_tuk) : null;
    clean.tahun = clean.tahun ? parseInt(clean.tahun) : null;
    clean.kuota = clean.kuota ? parseInt(clean.kuota) : 0;

    ['tgl_pra_asesmen', 'tgl_awal', 'tgl_akhir', 'jam', 'kode_jadwal', 'url_agenda', 'periode_bulan', 'gelombang'].forEach(field => {
      if (!clean[field] || clean[field] === "") {
        clean[field] = null;
      }
    });

    if (clean.jam && clean.jam.length === 5) {
      clean.jam = `${clean.jam}:00`;
    }
    return clean;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_skema || !formData.id_tuk || !formData.nama_kegiatan) {
      Swal.fire('Peringatan', 'Nama Kegiatan, Skema, dan TUK wajib diisi!', 'warning');
      return;
    }

    const dataToSend = sanitizeData(formData);

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      if (isEditMode) {
        await api.put(`/admin/jadwal/${currentId}`, dataToSend);
        Swal.fire('Sukses', 'Jadwal berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/jadwal', dataToSend);
        Swal.fire('Sukses', 'Jadwal baru berhasil dibuat', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    }
  };

  const filteredData = data.filter(item => 
    (item.nama_kegiatan && item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.kode_jadwal && item.kode_jadwal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputClass = "w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium";
  const labelClass = "block text-[12px] font-bold text-[#071E3D] mb-1.5";

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Jadwal Uji Kompetensi</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola jadwal pelaksanaan asesmen dan penempatan TUK.</p>
        </div>
        <button 
          className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[13px]"
          onClick={() => {
            setFormData(initialFormState);
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Buat Jadwal Baru
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <CalendarDays size={18} className="text-[#CC6B27]"/> Daftar Jadwal Asesmen
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari kode atau nama kegiatan..." 
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
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Informasi Kegiatan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Skema & TUK</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-48">Waktu Pelaksanaan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-20">Kuota</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-28">Status</th>
                {/* Kolom Baru untuk Kelola Asesor & Peserta */}
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-44">Kelola</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat jadwal...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <CalendarDays size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada jadwal uji kompetensi.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const skemaName = item.skema?.judul_skema || item.Skema?.judul_skema || <span className="italic text-red-500">Skema Terhapus</span>;
                  const tukName = item.tuk?.nama_tuk || item.Tuk?.nama_tuk || item.TUK?.nama_tuk || <span className="italic text-red-500">TUK Terhapus</span>;
                  
                  return (
                    <tr key={item.id_jadwal} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                      <td className="py-4 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                      
                      {/* Kegiatan */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-[12px] font-bold text-[#CC6B27] mb-1">{item.kode_jadwal || 'TIDAK ADA KODE'}</div>
                        <div className="font-bold text-[#071E3D] text-[13.5px] leading-snug">{item.nama_kegiatan}</div>
                        <div className="text-[11px] text-[#182D4A]/70 font-medium mt-1">
                          Gelombang: {item.gelombang || '-'} ({item.tahun || '-'})
                        </div>
                      </td>
                      
                      {/* Skema & TUK */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-1.5 text-[12px] font-medium text-[#182D4A]">
                            <Layers size={14} className="text-[#071E3D] shrink-0 mt-0.5"/> 
                            <span className="line-clamp-2" title={typeof skemaName === 'string' ? skemaName : ''}>
                              {skemaName}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 text-[12px] font-medium text-[#182D4A]">
                            <MapPin size={14} className="text-[#CC6B27] shrink-0 mt-0.5"/>
                            <span className="line-clamp-2" title={typeof tukName === 'string' ? tukName : ''}>
                              {tukName}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Waktu */}
                      <td className="py-4 px-4">
                        <div className="text-[12px] font-medium text-[#182D4A] flex items-center gap-1.5 mb-1.5">
                          <Calendar size={14} className="text-[#071E3D]"/> 
                          {item.tgl_awal ? item.tgl_awal.split('T')[0] : '?'} <span className="text-[#CC6B27] font-bold">s.d</span> {item.tgl_akhir ? item.tgl_akhir.split('T')[0] : '?'}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-bold bg-[#182D4A]/10 text-[#182D4A] px-2 py-0.5 rounded-md uppercase border border-[#182D4A]/20">
                            {item.pelaksanaan_uji || 'Luring'}
                          </span>
                          <span className="text-[11px] font-bold text-[#CC6B27] flex items-center gap-1">
                            <Clock size={12}/> {item.jam ? item.jam.slice(0,5) : '-'} WIB
                          </span>
                        </div>
                      </td>
                      
                      {/* Kuota */}
                      <td className="py-4 px-4 text-center font-extrabold text-[#071E3D] text-[14px]">
                        {item.kuota || 0}
                      </td>
                      
                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize whitespace-nowrap
                          ${item.status === 'open' ? 'bg-green-50 text-green-600 border-green-200' : 
                            item.status === 'ongoing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            item.status === 'selesai' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                            item.status === 'arsip' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                            'bg-yellow-50 text-yellow-600 border-yellow-200' // Draft
                          }`}>
                          {item.status || 'Draft'}
                        </span>
                      </td>
                      
                      {/* Kolom Kelola (Teks Saja) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          <button 
                            onClick={() => navigate(`/admin/jadwal/${item.id_jadwal}/asesor`)} 
                            className="w-full max-w-[90px] px-2 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-md transition-all text-[11px] font-bold tracking-wide uppercase shadow-sm"
                          >
                            Asesor
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/jadwal/${item.id_jadwal}/peserta`)} 
                            className="w-full max-w-[90px] px-2 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-md transition-all text-[11px] font-bold tracking-wide uppercase shadow-sm"
                          >
                            Peserta
                          </button>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-[#CC6B27] bg-[#CC6B27]/10 rounded hover:bg-[#CC6B27] hover:text-white transition-colors" title="Edit Jadwal">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id_jadwal)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-600 hover:text-white border border-red-100 transition-colors" title="Hapus Jadwal">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#CC6B27]/10 rounded-lg text-[#CC6B27]">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#071E3D] m-0">
                    {isEditMode ? 'Edit Jadwal Uji' : 'Buat Jadwal Baru'}
                  </h3>
                  <p className="text-[12px] text-[#182D4A]/70 m-0">Pengaturan jadwal asesmen dan relasi skema.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="jadwalForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. INFO UMUM */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <ClipboardList size={16}/> Informasi Kegiatan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Kode Jadwal</label>
                      <input type="text" name="kode_jadwal" value={formData.kode_jadwal} onChange={handleInputChange} placeholder="Kosongkan jika auto-generate" className={`${inputClass} font-mono`}/>
                    </div>
                    <div>
                      <label className={labelClass}>Nama Kegiatan <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_kegiatan" value={formData.nama_kegiatan} onChange={handleInputChange} required placeholder="Contoh: Sertifikasi Batch 1 2026" className={inputClass}/>
                    </div>
                  </div>
                </div>

                {/* 2. SKEMA & TUK */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <MapPin size={16}/> Pemilihan Skema & TUK
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#071E3D]/5 p-4 rounded-xl border border-[#071E3D]/10">
                    <div>
                      <label className={labelClass}>Pilih Skema Sertifikasi <span className="text-red-500">*</span></label>
                      <select name="id_skema" value={formData.id_skema} onChange={handleInputChange} className={inputClass} required>
                        <option value="">-- Pilih Skema --</option>
                        {listSkema.map(s => {
                          const idSkema = s.id_skema || s.id;
                          const judul = s.judul_skema || s.judul;
                          const kode = s.kode_skema || s.kode;
                          return (
                            <option key={idSkema} value={idSkema}>{judul} ({kode})</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Pilih TUK <span className="text-red-500">*</span></label>
                      <select name="id_tuk" value={formData.id_tuk} onChange={handleInputChange} className={inputClass} required>
                        <option value="">-- Pilih Tempat Uji --</option>
                        {listTuk.map(t => {
                          const idTuk = t.id_tuk || t.id;
                          const namaTuk = t.nama_tuk || t.nama;
                          return (
                            <option key={idTuk} value={idTuk}>
                              {namaTuk} {t.jenis_tuk ? `(${t.jenis_tuk})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. WAKTU */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <Calendar size={16}/> Waktu Pelaksanaan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                      <label className={labelClass}>Tanggal Pra-Asesmen</label>
                      <input type="date" name="tgl_pra_asesmen" value={formData.tgl_pra_asesmen} onChange={handleInputChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Tanggal Awal Uji</label>
                      <input type="date" name="tgl_awal" value={formData.tgl_awal} onChange={handleInputChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Tanggal Akhir Uji</label>
                      <input type="date" name="tgl_akhir" value={formData.tgl_akhir} onChange={handleInputChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Jam Pelaksanaan</label>
                      <input type="time" name="jam" value={formData.jam} onChange={handleInputChange} className={inputClass}/>
                    </div>
                  </div>
                </div>

                {/* 4. DETAIL */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <Layers size={16}/> Periode & Kuota
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>Tahun</label>
                      <input type="number" name="tahun" value={formData.tahun} onChange={handleInputChange} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Bulan</label>
                      <select name="periode_bulan" value={formData.periode_bulan} onChange={handleInputChange} className={inputClass}>
                          <option value="">-- Pilih --</option>
                          {listBulan.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Gelombang</label>
                      <input type="text" name="gelombang" value={formData.gelombang} onChange={handleInputChange} className={inputClass} placeholder="Cth: 1"/>
                    </div>
                    <div>
                      <label className={labelClass}>Maksimal Kuota</label>
                      <input type="number" name="kuota" value={formData.kuota} onChange={handleInputChange} className={inputClass} placeholder="Cth: 20"/>
                    </div>
                  </div>
                </div>

                {/* 5. STATUS & MODE */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-4 border-b border-[#CC6B27]/20 pb-2">
                    <LinkIcon size={16}/> Pengaturan Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Mode Uji</label>
                      <select name="pelaksanaan_uji" value={formData.pelaksanaan_uji} onChange={handleInputChange} className={inputClass}>
                        <option value="luring">Luring (Offline)</option>
                        <option value="daring">Daring (Online)</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={labelClass}>Status Pendaftaran</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                        <option value="draft">Draft (Disembunyikan)</option>
                        <option value="open">Open (Bisa Mendaftar)</option>
                        <option value="ongoing">Ongoing (Sedang Berjalan)</option>
                        <option value="selesai">Selesai</option>
                        <option value="arsip">Arsip</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={labelClass}>URL Meeting / Group</label>
                      <input type="text" name="url_agenda" value={formData.url_agenda} onChange={handleInputChange} placeholder="https://zoom.us/..." className={inputClass}/>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
              <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>Batal</button>
              <button type="submit" form="jadwalForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                <Save size={16}/> Simpan Jadwal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalUji;