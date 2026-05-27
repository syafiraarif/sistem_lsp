import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, FileText, Upload, BookOpen, Eye, ArrowRight, Filter,
  Sparkles, Layers, BadgeCheck, FileSearch, ClipboardList, DollarSign
} from 'lucide-react';

const Skema = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
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
    bidang: '',
    jenjang_kualifikasi: 'I',
    kode_sektor: '',
    kode_kbli: '',
    kode_kbji: '',
    nomor_revisi: '',
    status_dokumen: 'terkendali',
    dokumen: '',
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

    const minLengthFields = [
      'kode_skema',
      'judul_skema',
      'judul_skema_en'
    ];

    if (name === 'level_kkni') {
      if (value === null || value === '') {
        errorMsg = 'Tidak boleh kosong.';
      }
    } 
    else if (
      minLengthFields.includes(name) &&
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.trim().length <= 3
    ) {
      errorMsg = 'Terlalu pendek (minimal 4 karakter).';
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));

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
    setShowFullPreview(false);
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
      bidang: item.bidang || '',
      jenjang_kualifikasi: item.jenjang_kualifikasi || 'I',
      kode_sektor: item.kode_sektor || '',
      kode_kbli: item.kode_kbli || '',
      kode_kbji: item.kode_kbji || '',
      nomor_revisi: item.nomor_revisi || '',
      status_dokumen: item.status_dokumen || 'terkendali',
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

  const inputClass = (name) => `w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-slate-300
    ${errors[name] ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-100 bg-slate-50 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10'}
  `;

  // --- FILTER ---
  const filteredData = data.filter(item => {
    const matchSearch = (item.judul_skema && item.judul_skema.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.kode_skema && item.kode_skema.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalAktif = data.filter(item => item.status === 'aktif').length;
  const totalDraft = data.filter(item => item.status === 'draft').length;
  const totalNonaktif = data.filter(item => item.status === 'nonaktif').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <BookOpen size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Data Skema Sertifikasi
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola Skema
                <br />
                <span className="text-orange-500">Kompetensi LSP</span>
              </h1>

              <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Atur kode, judul, status, persyaratan, biaya, dokumen, dan instrumen asesmen setiap skema.
              </p>

              <button 
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
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
                <Plus size={16} />
                Tambah Skema
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Total Skema
                </p>

                <h2 className="mb-4 text-5xl font-black leading-none">
                  {data.length}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Ringkasan status skema yang tersedia dalam sistem.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <HeroPill label="Aktif" value={totalAktif} />
                  <HeroPill label="Draft" value={totalDraft} />
                  <HeroPill label="Nonaktif" value={totalNonaktif} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAT */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MiniStat icon={<BookOpen size={22} />} label="Total Skema" value={data.length} />
          <MiniStat icon={<BadgeCheck size={22} />} label="Aktif" value={totalAktif} />
          <MiniStat icon={<FileText size={22} />} label="Draft" value={totalDraft} />
          <MiniStat icon={<Layers size={22} />} label="Nonaktif" value={totalNonaktif} />
        </section>

        {/* TABLE CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <ClipboardList size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Daftar Skema
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Data Skema Sertifikasi
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari berdasarkan kode atau judul, lalu filter berdasarkan status.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
                <div className="relative w-full lg:w-[340px]">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari kode atau judul skema..." 
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative w-full md:w-52">
                  <Filter size={18} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" />
                  <select 
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Judul Skema</TableHead>
                  <TableHead center>Status</TableHead>
                  <TableHead center>Kelola Persyaratan</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
                      <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
                        Memuat Data Skema
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <BookOpen size={48} className="mx-auto mb-3 text-[#071E3D]/20"/>
                      <p className="text-sm font-black text-[#071E3D]">
                        Belum ada data skema ditemukan.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id_skema} className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30">
                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-black text-orange-500">
                          {item.kode_skema}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[420px] font-black text-[#071E3D]">{item.judul_skema}</div>
                        <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">
                          {item.jenis_skema?.toUpperCase()} {item.level_kkni ? `• LEVEL ${item.level_kkni}` : ''}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan`)}
                            className="w-[155px] rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-black text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                          >
                            Persyaratan Dasar
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/persyaratan-tuk`)}
                            className="w-[155px] rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-[11px] font-black text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                          >
                            Persyaratan TUK
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            onClick={() => navigate(`/admin/skema/${item.id_skema}/biaya-uji`)}
                            title="Atur Biaya Uji"
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          >
                            <DollarSign size={16} />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDetail(item)}
                            title="Detail Skema"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Eye size={16} />
                          </IconButton>

                          <IconButton
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            <Edit2 size={16} />
                          </IconButton>
                          
                          <IconButton
                            onClick={() => handleDelete(item.id_skema)}
                            title="Hapus"
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL DETAIL SKEMA */}
      {showDetailModal && selectedSkema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <BookOpen size={21} className="text-orange-500"/>
                  Detail Skema Kompetensi
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Informasi lengkap skema, dokumen, serta pintasan instrumen asesmen.
                </p>
              </div>

              <button onClick={() => setShowDetailModal(false)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                
                <InfoPanel title="Informasi Utama">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Kode Skema">
                      <span className="font-mono text-orange-500">{selectedSkema.kode_skema}</span>
                    </DetailItem>
                    <DetailItem label="Status">
                      <StatusBadge status={selectedSkema.status} />
                    </DetailItem>
                    <DetailItem label="Judul Skema" wide>
                      <span>{selectedSkema.judul_skema}</span>
                      {selectedSkema.judul_skema_en && (
                        <p className="mt-1 text-sm font-semibold italic text-slate-400">{selectedSkema.judul_skema_en}</p>
                      )}
                    </DetailItem>
                  </div>
                </InfoPanel>

                <InfoPanel title="Atribut Skema">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem label="Jenis Skema">{selectedSkema.jenis_skema}</DetailItem>
                    <DetailItem label="Level KKNI">{selectedSkema.level_kkni || '-'}</DetailItem>
                    <DetailItem label="Bidang">{selectedSkema.bidang || '-'}</DetailItem>                    
                    <DetailItem label="Kode Sektor">{selectedSkema.kode_sektor || '-'}</DetailItem>
                    <DetailItem label="Kode KBLI">{selectedSkema.kode_kbli || '-'}</DetailItem>
                    <DetailItem label="Kode KBJI">{selectedSkema.kode_kbji || '-'}</DetailItem>
                    <DetailItem label="Jenjang Kualifikasi">{selectedSkema.jenjang_kualifikasi || '-'}</DetailItem>
                    <DetailItem label="Nomor Revisi">{selectedSkema.nomor_revisi || '-'}</DetailItem>
                    <DetailItem label="Status Dokumen">{selectedSkema.status_dokumen || '-'}</DetailItem>
                  </div>
                </InfoPanel>

                {selectedSkema.dokumen && (
                  <InfoPanel title="Preview Dokumen Skema">
                    <div className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="text-xs font-black uppercase tracking-widest text-[#071E3D]">
                          Dokumen Skema
                        </span>
                        {isPreviewable(selectedSkema.dokumen) && (
                          <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-xs font-black text-orange-500 hover:underline">
                            {showFullPreview ? 'Perkecil' : 'Perbesar Tampilan'}
                          </button>
                        )}
                      </div>
                      
                      <div className={`relative flex-1 transition-all duration-300 ${showFullPreview ? 'h-[620px]' : 'h-[380px] bg-white'}`}>
                        {isPreviewable(selectedSkema.dokumen) ? (
                          isImageFile(selectedSkema.dokumen) ? (
                            <div className="absolute inset-0 flex items-start justify-center overflow-auto bg-slate-50 p-3">
                              <img src={buildFileUrl(selectedSkema.dokumen)} alt="Preview" className="max-w-full object-contain" />
                            </div>
                          ) : (
                            <iframe src={`${buildFileUrl(selectedSkema.dokumen)}#toolbar=0&navpanes=0`} className="absolute inset-0 h-full w-full border-0" title="Preview PDF" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-500">
                            <FileText size={42} className="mb-2 text-blue-400" />
                            <p className="mb-1 text-sm font-black">Preview tidak tersedia</p>
                            <p className="text-xs font-medium">Format file ini tidak dapat dipratinjau.</p>
                            <a href={buildFileUrl(selectedSkema.dokumen)} target="_blank" rel="noreferrer" className="mt-3 rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 hover:bg-blue-100">Unduh File</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </InfoPanel>
                )}

                <InfoPanel title="Navigasi Instrumen & Asesmen">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <NavigationCard
                      title="FR.IA.01"
                      subtitle="Observasi"
                      onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia01`)}
                      className="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                    />
                    <NavigationCard
                      title="FR.IA.03"
                      subtitle="Pertanyaan"
                      onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/ia03`)}
                      className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
                    />
                    <NavigationCard
                      title="FR.MAPA"
                      subtitle="Manajemen"
                      onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/mapa`)}
                      className="border-orange-100 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white"
                    />
                    <NavigationCard
                      title="Kelompok"
                      subtitle="Pekerjaan"
                      onClick={() => navigate(`/admin/skema/${selectedSkema.id_skema}/kelompok-pekerjaan`)}
                      className="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                    />
                  </div>
                </InfoPanel>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  {isEditMode ? <Edit2 size={20} className="text-orange-500"/> : <Plus size={20} className="text-orange-500"/>}
                  {isEditMode ? 'Edit Data Skema' : 'Tambah Skema Baru'}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Lengkapi informasi utama, atribut skema, dan dokumen pendukung.
                </p>
              </div>

              <button onClick={() => setShowModal(false)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="skemaForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  
                  {/* Kolom Kiri */}
                  <div className="space-y-5">
                    <FormSection title="Informasi Skema">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Kode Skema <span className="text-red-500">*</span></Label>
                          <input type="text" name="kode_skema" value={formData.kode_skema} onChange={handleInputChange} required className={inputClass('kode_skema') + " font-mono"} />
                          {errors.kode_skema && <ErrorText>{errors.kode_skema}</ErrorText>}
                        </div>

                        <div>
                          <Label>Status Skema</Label>
                          <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass('status')}>
                            <option value="draft">Draft</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Non-Aktif</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label>Judul Skema (Indonesia) <span className="text-red-500">*</span></Label>
                        <input type="text" name="judul_skema" value={formData.judul_skema} onChange={handleInputChange} required className={inputClass('judul_skema')}/>
                        {errors.judul_skema && <ErrorText>{errors.judul_skema}</ErrorText>}
                      </div>

                      <div>
                        <Label>Judul Skema (Inggris)</Label>
                        <input type="text" name="judul_skema_en" value={formData.judul_skema_en} onChange={handleInputChange} className={inputClass('judul_skema_en')}/>
                        {errors.judul_skema_en && <ErrorText>{errors.judul_skema_en}</ErrorText>}
                      </div>
                    </FormSection>

                    <FormSection title="Atribut & Kode Klasifikasi">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Jenis Skema</Label>
                          <select name="jenis_skema" value={formData.jenis_skema} onChange={handleInputChange} className={inputClass('jenis_skema')}>
                            <option value="kkni">KKNI</option>
                            <option value="okupasi">Okupasi</option>
                            <option value="klaster">Klaster</option>
                          </select>
                        </div>

                        <div>
                          <Label>Level KKNI <span className="text-red-500">*</span></Label>
                          <select name="level_kkni" value={formData.level_kkni} onChange={handleInputChange} className={inputClass('level_kkni')} required>
                            <option value="">-- Pilih Level --</option>
                            {[1,2,3,4,5,6,7,8,9].map(num => <option key={num} value={num}>Level {num}</option>)}
                          </select>
                          {errors.level_kkni && <ErrorText>{errors.level_kkni}</ErrorText>}
                        </div>
                      </div>

                      <div>
                        <Label>Jenjang Kualifikasi</Label>
                        <select
                          name="jenjang_kualifikasi"
                          value={formData.jenjang_kualifikasi}
                          onChange={handleInputChange}
                          className={inputClass('jenjang_kualifikasi')}
                        >
                          <option value="I">I</option>
                          <option value="II">II</option>
                          <option value="III">III</option>
                          <option value="IV">IV</option>
                          <option value="V">V</option>
                          <option value="VI">VI</option>
                          <option value="VII">VII</option>
                          <option value="VIII">VIII</option>
                          <option value="IX">IX</option>
                        </select>
                      </div>

                      <div>
                        <Label>Bidang (Perpustakaan)</Label>
                        <input type="text" name="bidang" value={formData.bidang} onChange={handleInputChange} className={inputClass('bidang')} />
                        {errors.bidang && <ErrorText>{errors.bidang}</ErrorText>}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <Label>Kode Sektor</Label>
                          <input type="text" name="kode_sektor" value={formData.kode_sektor} onChange={handleInputChange} className={inputClass('kode_sektor') + " font-mono"} />
                          {errors.kode_sektor && <ErrorText>{errors.kode_sektor}</ErrorText>}
                        </div>

                        <div>
                          <Label>Kode KBLI</Label>
                          <input type="text" name="kode_kbli" value={formData.kode_kbli} onChange={handleInputChange} className={inputClass('kode_kbli') + " font-mono"} />
                          {errors.kode_kbli && <ErrorText>{errors.kode_kbli}</ErrorText>}
                        </div>

                        <div>
                          <Label>Kode KBJI</Label>
                          <input type="text" name="kode_kbji" value={formData.kode_kbji} onChange={handleInputChange} className={inputClass('kode_kbji') + " font-mono"} />
                          {errors.kode_kbji && <ErrorText>{errors.kode_kbji}</ErrorText>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>
                        <Label>Nomor Revisi / Salinan</Label>
                        <input
                          type="text"
                          name="nomor_revisi"
                          value={formData.nomor_revisi}
                          onChange={handleInputChange}
                          className={inputClass('nomor_revisi')}
                        />
                      </div>

                      <div>
                        <Label>Status Dokumen</Label>

                        <select
                          name="status_dokumen"
                          value={formData.status_dokumen}
                          onChange={handleInputChange}
                          className={inputClass('status_dokumen')}
                        >
                          <option value="terkendali">
                            Terkendali
                          </option>

                          <option value="tidak_terkendali">
                            Tidak Terkendali
                          </option>
                        </select>
                      </div>
                    </div>
                    </FormSection>
                  </div>

                  {/* Kolom Kanan: File & Preview */}
                  <div className="flex flex-col gap-5">
                    <FormSection title="Dokumen Skema">
                      <div className="rounded-[24px] border border-orange-100 bg-orange-50/60 p-5">
                        <Label>
                          <span className="inline-flex items-center gap-2">
                            <Upload size={16} className="text-orange-500"/>
                            Unggah Dokumen Skema (PDF)
                          </span>
                        </Label>
                        
                        <input 
                          type="file" 
                          name="file_dokumen" 
                          onChange={handleFileChange} 
                          accept=".pdf"
                          className="block w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-2 text-sm font-semibold text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#071E3D] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-orange-500"
                        />
                        
                        {isEditMode && formData.dokumen && !selectedFile && (
                          <div className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 text-xs font-black text-orange-500">
                            <FileText size={14} />
                            <span>
                              Tersimpan: <a href={buildFileUrl(formData.dokumen)} target="_blank" rel="noreferrer" className="hover:underline">{formData.dokumen.split('/').pop()}</a>
                            </span>
                          </div>
                        )}
                      </div>
                    </FormSection>

                    <div className="flex min-h-[430px] flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="text-xs font-black uppercase tracking-widest text-[#071E3D]">Pratinjau Dokumen</span>
                        {previewUrl && isPreviewable(previewUrl) && (
                          <button type="button" onClick={() => setShowFullPreview(!showFullPreview)} className="text-xs font-black text-orange-500 hover:underline">
                            {showFullPreview ? 'Perkecil' : 'Perbesar Tampilan'}
                          </button>
                        )}
                      </div>
                      
                      <div className={`relative flex-1 transition-all duration-300 ${showFullPreview ? 'h-[540px]' : 'h-full bg-white'}`}>
                        {previewUrl ? (
                          isPreviewable(previewUrl) ? (
                            isImageFile(previewUrl) ? (
                              <div className="absolute inset-0 flex items-start justify-center overflow-auto bg-slate-50 p-3">
                                <img src={buildFileUrl(previewUrl)} alt="Preview" className="max-w-full object-contain" />
                              </div>
                            ) : (
                              <iframe src={`${buildFileUrl(previewUrl)}#toolbar=0&navpanes=0`} className="absolute inset-0 h-full w-full border-0" title="Preview PDF" />
                            )
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-500">
                              <FileText size={42} className="mb-2 text-blue-400" />
                              <p className="mb-1 text-sm font-black">Preview tidak tersedia</p>
                              <p className="text-xs font-medium">Format file ini tidak dapat dipratinjau.</p>
                            </div>
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                            <FileSearch size={46} className="mb-3 opacity-30" />
                            <p className="text-xs font-bold">Pilih file skema (PDF) untuk melihat pratinjau.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-6">
              <button 
                type="button" 
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white" 
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>

              <button 
                type="submit" 
                form="skemaForm" 
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
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

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const style =
    status === 'aktif'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'nonaktif'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${style}`}>
      {status || 'draft'}
    </span>
  );
}

function IconButton({ children, onClick, title, className }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all ${className}`}
    >
      {children}
    </button>
  );
}

function InfoPanel({ title, children }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-widest text-[#071E3D]">
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailItem({ label, children, wide }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50/70 p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="text-sm font-black capitalize text-[#071E3D]">{children}</div>
    </div>
  );
}

function NavigationCard({ title, subtitle, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`group flex min-h-[112px] flex-col items-center justify-center rounded-3xl border p-4 text-center transition-all shadow-sm ${className}`}
    >
      <span className="mb-1 text-sm font-black">{title}</span>
      <span className="mb-3 text-xs font-bold opacity-75">{subtitle}</span>
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-5 border-b border-slate-100 pb-4 text-sm font-black uppercase tracking-widest text-[#071E3D]">
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </label>
  );
}

function ErrorText({ children }) {
  return (
    <span className="mt-1 block text-xs font-bold text-red-500">
      {children}
    </span>
  );
}

export default Skema;