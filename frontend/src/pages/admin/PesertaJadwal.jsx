import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../services/api";
import { 
  Search, ArrowLeft, Loader2, User, Award, FileText, CheckCircle, Eye, X, CalendarClock, Info
} from 'lucide-react';

const PesertaJadwal = () => {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jadwalInfo, setJadwalInfo] = useState(null);

  // State untuk Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);

  useEffect(() => {
    fetchPeserta();
  }, [id_jadwal]);

  const fetchPeserta = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/jadwal/${id_jadwal}/peserta`);
      
      const data = res.data.data || [];
      setPesertaList(data);
      
      // Ambil info jadwal dari data pertama jika ada
      // Ini akan jadi "sumber kebenaran" (source of truth) untuk data Skema semua peserta
      if (data && data.length > 0 && data[0].jadwal) {
        setJadwalInfo(data[0].jadwal);
      }
    } catch (error) {
      console.error("Gagal mengambil data peserta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (peserta) => {
    setSelectedPeserta(peserta);
    setShowDetailModal(true);
  };

  // Helper untuk membaca profile (mengakomodasi berbagai format Sequelize)
  const getProfile = (userObj) => {
    if (!userObj) return null;
    return userObj.ProfileAsesi || userObj.profileAsesi || userObj.profile_asesi;
  };

  // Helper untuk membaca skema dengan logika fallback ke jadwalInfo
  // DIPERBARUI: Menggunakan "judul_skema" sesuai database backend
  const getSkemaName = (jadwalObj) => {
    const targetJadwal = jadwalObj || jadwalInfo;
    if (!targetJadwal) return '-';
    
    return targetJadwal.skema?.judul_skema || 
           targetJadwal.Skema?.judul_skema || 
           '-';
  };

  // Filter pencarian
  const filteredData = pesertaList.filter(item => {
    const profile = getProfile(item.user);
    const nama = profile?.nama_lengkap || item.user?.username || item.user?.nama_lengkap || '';
    const nik = profile?.nik || '';
    const email = item.user?.email || '';
    const skema = getSkemaName(item.jadwal);
    const nomor = item.nomor_peserta || '';

    const term = searchTerm.toLowerCase();

    return email.toLowerCase().includes(term) ||
           nomor.toLowerCase().includes(term) ||
           nama.toLowerCase().includes(term) ||
           nik.toLowerCase().includes(term) ||
           skema.toLowerCase().includes(term);
  });

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/admin/jadwal/uji-kompetensi')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#182D4A]">Data Peserta Jadwal</h1>
          <p className="text-gray-500 text-sm">
            {jadwalInfo 
              ? `Jadwal: ${jadwalInfo.nama_kegiatan} | Skema: ${getSkemaName(jadwalInfo)}` 
              : 'Mengelola asesi yang terdaftar di jadwal ini'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, NIK, skema, atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#071E3D] text-white text-[13px]">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Nama / NIK</th>
                <th className="p-4 font-semibold">Skema</th>
                <th className="p-4 font-semibold">Nomor Peserta</th>
                <th className="p-4 font-semibold">Status Asesmen</th>
                <th className="p-4 font-semibold text-center">Nilai Akhir</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-2" size={24} />
                    <p className="text-gray-500 text-sm">Memuat data peserta...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 text-sm">
                    Belum ada peserta yang cocok atau terdaftar pada jadwal ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const profile = getProfile(row.user);
                  const namaLengkap = profile?.nama_lengkap || row.user?.username || row.user?.nama_lengkap || '-';
                  const nik = profile?.nik || '-';
                  const namaSkema = getSkemaName(row.jadwal);

                  return (
                    <tr key={row.id_peserta} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[13px]">
                      <td className="p-4 text-center text-gray-600">{index + 1}</td>
                      
                      {/* Kolom Nama & NIK */}
                      <td className="p-4">
                        <div className="font-medium text-[#182D4A]">{namaLengkap}</div>
                        <div className="text-gray-500 text-xs">NIK: {nik}</div>
                      </td>
                      
                      {/* Kolom Skema */}
                      <td className="p-4 text-gray-600">
                        <span className="line-clamp-2" title={namaSkema}>{namaSkema}</span>
                      </td>
                      
                      <td className="p-4 font-medium text-[#182D4A]">{row.nomor_peserta || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${row.status_asesmen === 'kompeten' ? 'bg-green-100 text-green-700' : 
                            row.status_asesmen === 'belum_kompeten' ? 'bg-red-100 text-red-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {row.status_asesmen?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-[#182D4A]">
                        {row.nilai_akhir ? row.nilai_akhir : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleViewDetail(row)}
                          className="p-1.5 text-[#071E3D] bg-slate-100 hover:bg-[#CC6B27] hover:text-white rounded transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL PESERTA --- */}
      {showDetailModal && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#182D4A]">
                <Info size={20} className="text-[#CC6B27]" />
                <h3 className="font-bold text-[16px]">Detail Peserta Asesmen</h3>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col gap-4">
                
                {/* Info Utama */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Nama Asesi</p>
                    <p className="font-bold text-[#182D4A] text-[14px]">
                      {getProfile(selectedPeserta.user)?.nama_lengkap || selectedPeserta.user?.username || '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">NIK Asesi</p>
                    <p className="font-bold text-[#182D4A] text-[14px]">
                      {getProfile(selectedPeserta.user)?.nik || '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Skema</p>
                    <p className="font-bold text-[#182D4A] text-[14px] line-clamp-2" title={getSkemaName(selectedPeserta.jadwal)}>
                      {getSkemaName(selectedPeserta.jadwal)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Nomor Peserta</p>
                    <p className="font-bold text-[#182D4A] text-[14px]">{selectedPeserta.nomor_peserta || 'Belum di-generate'}</p>
                  </div>
                </div>

                {/* Status & Nilai */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[12px] text-gray-500 font-semibold mb-1">Status Asesmen</p>
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold capitalize
                        ${selectedPeserta.status_asesmen === 'kompeten' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          selectedPeserta.status_asesmen === 'belum_kompeten' ? 'bg-red-100 text-red-700 border border-red-200' : 
                          'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {selectedPeserta.status_asesmen?.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-semibold mb-1">Nilai Akhir</p>
                    <p className="font-extrabold text-[#CC6B27] text-[16px]">{selectedPeserta.nilai_akhir || 'Belum dinilai'}</p>
                  </div>
                </div>

                <hr className="border-gray-100 my-2" />

                {/* Info Waktu */}
                <div>
                  <h4 className="text-[13px] font-bold text-[#182D4A] flex items-center gap-2 mb-3">
                    <CalendarClock size={16} /> Riwayat Waktu Asesmen
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <p className="text-gray-500 font-medium mb-0.5">Waktu Mulai:</p>
                      <p className="font-semibold text-[#071E3D]">{formatDate(selectedPeserta.waktu_mulai)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-0.5">Waktu Selesai:</p>
                      <p className="font-semibold text-[#071E3D]">{formatDate(selectedPeserta.waktu_selesai)}</p>
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div className="mt-2">
                  <p className="text-[12px] text-gray-500 font-semibold mb-1">Keterangan / Catatan Asesor</p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px] text-[13px] text-[#182D4A]">
                    {selectedPeserta.keterangan || <span className="text-gray-400 italic">Tidak ada catatan keterangan.</span>}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PesertaJadwal;