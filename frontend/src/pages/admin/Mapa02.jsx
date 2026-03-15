import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  ArrowLeft, Settings, Plus, Trash2, X, 
  Loader2, CheckSquare, Square, List, Briefcase, BookOpen 
} from 'lucide-react';

const METODE_OPTIONS = [
  { id: "IA01", name: "IA01 - Observasi Langsung" },
  { id: "IA02", name: "IA02 - Tugas Praktik Demonstrasi" },
  { id: "IA03", name: "IA03 - Pertanyaan Lisan" },
  { id: "IA04A", name: "IA04A - Pertanyaan Tertulis (PG)" },
  { id: "IA04B", name: "IA04B - Pertanyaan Tertulis (Esai)" },
  { id: "IA05", name: "IA05 - Pertanyaan Wawancara" },
  { id: "IA06", name: "IA06 - Wawancara Berbasis Portofolio" },
  { id: "IA07", name: "IA07 - Wawancara Berbasis Jurnal" },
  { id: "IA09", name: "IA09 - Cek Portofolio" }
];

const Mapa02 = () => {
  const { id } = useParams(); // Ingat: di route ini "id" adalah id_skema!
  const navigate = useNavigate();

  // --- STATE UTAMA ---
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState(null); // Info MAPA & Skema
  const [listMapping, setListMapping] = useState([]);
  
  // State Data Dropdown
  const [listKelompokPekerjaan, setListKelompokPekerjaan] = useState([]);
  const [listUnitKompetensi, setListUnitKompetensi] = useState([]);

  // State Modal Mapping
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id_unit: '',
    id_kelompok: ''
  });

  // State Modal Metode
  const [showMetodeModal, setShowMetodeModal] = useState(false);
  const [activeMappingId, setActiveMappingId] = useState(null);
  const [activeMetodes, setActiveMetodes] = useState([]); 

  // --- FUNGSI FETCH DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const idSkema = parseInt(id); // Langsung pakai ID dari URL
      let idMapa = null;

      // 1. Cari Master MAPA-02 berdasarkan id_skema
      try {
        const resMapa = await api.get(`/admin/mapa`);
        const allMapa = resMapa.data?.data || resMapa.data || [];
        
        // Temukan record MAPA-02 milik skema ini
        const currentMapa = allMapa.find(m => m.id_skema === idSkema && m.jenis === 'MAPA-02');
        
        if (currentMapa) {
          idMapa = currentMapa.id_mapa;
          setMasterData(currentMapa);
        } else {
          Swal.fire('Info', 'Dokumen Master MAPA-02 untuk skema ini belum ada. Anda mungkin harus membuatnya terlebih dahulu di menu MAPA.', 'info');
        }
      } catch (e) {
        console.error("Gagal load info MAPA:", e);
      }

      // 2. Ambil Daftar Mapping MAPA-02
      if (idMapa) {
        try {
          const resMapping = await api.get(`/admin/mapa02/mapping/${idMapa}`);
          let mappingData = resMapping.data?.data || resMapping.data || [];
          if (!Array.isArray(mappingData) && mappingData.rows) mappingData = mappingData.rows;
          setListMapping(Array.isArray(mappingData) ? mappingData : []);
        } catch (e) {
          console.error("Gagal memuat mapping MAPA-02:", e);
        }
      } else {
        setListMapping([]);
      }

      // 3. Ambil Dropdown Kelompok Pekerjaan (Pasti jalan karena idSkema sudah valid)
      try {
        const resPekerjaan = await api.get(`/admin/kelompok-pekerjaan/skema/${idSkema}`);
        let pekerjaandata = resPekerjaan.data?.data || resPekerjaan.data || [];
        if (!Array.isArray(pekerjaandata) && pekerjaandata.rows) pekerjaandata = pekerjaandata.rows;
        
        setListKelompokPekerjaan(Array.isArray(pekerjaandata) ? pekerjaandata : []);
      } catch (e) {
        console.error("Gagal load kelompok pekerjaan:", e);
        setListKelompokPekerjaan([]);
      }

      // 4. Ambil Dropdown Unit Kompetensi
      try {
        const resUnit = await api.get('/admin/unit-kompetensi');
        let unitData = resUnit.data?.data || resUnit.data || [];
        if (!Array.isArray(unitData) && unitData.rows) unitData = unitData.rows;
        setListUnitKompetensi(Array.isArray(unitData) ? unitData : []);
      } catch (e) {
        console.error("Gagal load unit kompetensi:", e);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Terjadi kesalahan saat memuat data MAPA-02', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  // --- HANDLER MAPPING (UNIT & PEKERJAAN) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitMapping = async (e) => {
    e.preventDefault();
    if (!formData.id_unit || !formData.id_kelompok) {
      return Swal.fire('Peringatan', 'Silakan pilih Unit dan Pekerjaan', 'warning');
    }
    
    // Perbaikan: gunakan id_mapa asli yang di-fetch dari masterData, BUKAN id dari url
    if (!masterData || !masterData.id_mapa) {
      return Swal.fire('Gagal', 'Master MAPA-02 tidak ditemukan. Pastikan Anda sudah membuat dokumen MAPA-02 untuk skema ini di menu MAPA utama.', 'error');
    }

    setSubmitting(true);
    try {
      await api.post('/admin/mapa02/mapping', {
        id_mapa: parseInt(masterData.id_mapa),
        id_unit: parseInt(formData.id_unit),
        id_kelompok: parseInt(formData.id_kelompok)
      });
      Swal.fire('Berhasil', 'Mapping berhasil ditambahkan', 'success');
      setShowModal(false);
      setFormData({ id_unit: '', id_kelompok: '' });
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Gagal menyimpan mapping', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMapping = async (id_mapping) => {
    const confirm = await Swal.fire({
      title: 'Hapus Mapping?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/mapa02/mapping/${id_mapping}`);
        Swal.fire('Terhapus!', 'Mapping berhasil dihapus.', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  // --- HANDLER METODE (IA01, IA02, dll) ---
  const handleOpenMetode = async (id_mapping) => {
    setActiveMappingId(id_mapping);
    setShowMetodeModal(true);
    
    try {
      const res = await api.get(`/admin/mapa02/metode/${id_mapping}`);
      const metodes = res.data?.data || res.data || [];
      setActiveMetodes(metodes.map(m => m.metode)); 
    } catch (error) {
      console.error("Gagal memuat metode:", error);
      setActiveMetodes([]);
    }
  };

  const toggleMetode = async (metodeCode) => {
    const isCurrentlyActive = activeMetodes.includes(metodeCode);
    
    try {
      if (isCurrentlyActive) {
        Swal.fire('Info', 'Fitur hapus metode spesifik memerlukan penyesuaian API DELETE backend', 'info');
      } else {
        await api.post('/admin/mapa02/metode', {
          id_mapping: activeMappingId,
          metode: metodeCode,
          digunakan: true
        });
        
        setActiveMetodes(prev => [...prev, metodeCode]);
      }
    } catch (error) {
      console.error("Gagal toggle metode", error);
      Swal.fire('Error', 'Gagal memperbarui metode', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          
          {/* PERBAIKAN: Tombol Kembali menggunakan navigate(-1) */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-white mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <List className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Pengisian MAPA-02</h1>
              <p className="text-[#FAFAFA]/70 text-sm">
                Skema: {masterData?.skema?.judul_skema || masterData?.Skema?.judul_skema || 'Info Skema Belum Diload'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#071E3D]">Mapping Unit & Metode Asesmen</h2>
            <p className="text-sm text-slate-500">Tentukan kelompok pekerjaan dan metode uji untuk tiap unit kompetensi.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#CC6B27] hover:bg-[#a8561f] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> Tambah Mapping
          </button>
        </div>
        
        {listMapping.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-2">
              <List size={32} />
            </div>
            <p className="text-slate-500 font-medium">Belum ada mapping unit kompetensi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[#182D4A]">
                  <th className="p-4 text-xs font-bold uppercase w-12 text-center">No</th>
                  <th className="p-4 text-xs font-bold uppercase">Unit Kompetensi</th>
                  <th className="p-4 text-xs font-bold uppercase">Kelompok Pekerjaan</th>
                  <th className="p-4 text-xs font-bold uppercase text-center w-48">Pengaturan Metode</th>
                  <th className="p-4 text-xs font-bold uppercase text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listMapping.map((item, index) => {
                  
                  // PERBAIKAN ALIAS (Mencegah tampilan minus/strip)
                  const unitObj = item.UnitKompetensi || item.unit_kompetensi || item.unit || item.Unit || {};
                  const unitName = unitObj.judul_unit || unitObj.nama_unit || '-';
                  const unitCode = unitObj.kode_unit || '';
                  
                  const pekerjaObj = item.KelompokPekerjaan || item.kelompok_pekerjaan || item.kelompok || item.pekerjaan || item.Pekerjaan || {};
                  const pekerjaanName = pekerjaObj.nama_kelompok || pekerjaObj.nama_pekerjaan || '-';

                  return (
                    <tr key={item.id_mapping} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center font-semibold text-slate-500 text-sm">{index + 1}</td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-[#CC6B27] mb-0.5">{unitCode}</div>
                        <div className="text-sm font-bold text-[#071E3D] line-clamp-2">{unitName}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                          <Briefcase size={12}/> {pekerjaanName}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleOpenMetode(item.id_mapping)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#071E3D] text-[#071E3D] hover:text-white rounded-lg text-[12px] font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Settings size={14} /> Atur Metode
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDeleteMapping(item.id_mapping)}
                          className="p-1.5 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded transition-colors inline-flex"
                          title="Hapus Mapping"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL TAMBAH MAPPING --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-[16px] font-bold text-[#071E3D] flex items-center gap-2">
                <Plus size={18} className="text-[#CC6B27]" /> Tambah Mapping Unit
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 p-1"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmitMapping} className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-2 flex items-center gap-1.5">
                  <BookOpen size={14}/> Pilih Unit Kompetensi <span className="text-red-500">*</span>
                </label>
                <select 
                  name="id_unit" 
                  value={formData.id_unit} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none"
                  required
                >
                  <option value="">-- Pilih Unit Kompetensi --</option>
                  {listUnitKompetensi.map((item, index) => {
                    const idUnit = item.id_unit || item.id;
                    const judulUnit = item.judul_unit || item.nama_unit || 'Tanpa Judul';
                    const kodeUnit = item.kode_unit ? `[${item.kode_unit}] ` : '';
                    if(!idUnit) return null;
                    return (
                      <option key={index} value={idUnit}>{kodeUnit}{judulUnit}</option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-2 flex items-center gap-1.5">
                  <Briefcase size={14}/> Pilih Kelompok Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select 
                  name="id_kelompok" 
                  value={formData.id_kelompok} 
                  onChange={handleInputChange} 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none"
                  required
                >
                  <option value="">-- Pilih Pekerjaan / Kelompok --</option>
                  {listKelompokPekerjaan.map((item, index) => {
                    const idKelompok = item.id_kelompok || item.id;
                    const namaKelompok = item.nama_kelompok || item.nama_pekerjaan || item.pekerjaan || 'Tanpa Nama';
                    
                    if(!idKelompok) return null;
                    return (
                      <option key={index} value={idKelompok}>{namaKelompok}</option>
                    )
                  })}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg font-bold bg-[#071E3D] text-white hover:bg-[#182D4A] shadow-sm flex items-center gap-2 text-sm disabled:opacity-70">
                  {submitting ? <Loader2 size={16} className="animate-spin"/> : "Simpan Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PENGATURAN METODE --- */}
      {showMetodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#071E3D] flex items-center gap-2">
                  <Settings size={20} className="text-[#CC6B27]" /> Atur Metode Asesmen
                </h3>
                <p className="text-xs text-slate-500 mt-1">Pilih metode ujian yang akan digunakan untuk unit ini.</p>
              </div>
              <button onClick={() => setShowMetodeModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {METODE_OPTIONS.map((opt) => {
                  const isActive = activeMetodes.includes(opt.id);
                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => toggleMetode(opt.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all select-none
                        ${isActive 
                          ? 'border-[#CC6B27] bg-[#CC6B27]/5 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-[#CC6B27]/40'}`}
                    >
                      <div className={`mt-0.5 ${isActive ? 'text-[#CC6B27]' : 'text-slate-300'}`}>
                        {isActive ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <span className={`font-bold text-sm leading-tight ${isActive ? 'text-[#071E3D]' : 'text-slate-600'}`}>
                        {opt.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-white flex justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setShowMetodeModal(false)} 
                className="px-6 py-2.5 rounded-xl font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-md transition-all text-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mapa02;