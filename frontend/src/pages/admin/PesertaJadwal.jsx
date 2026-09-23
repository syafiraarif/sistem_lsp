import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, ArrowLeft, Loader2, Eye, X, CalendarClock, Info,
  Users, BadgeCheck, Award, Hash, Sparkles, FileText, UserPlus, RefreshCcw
} from 'lucide-react';

const PesertaJadwal = () => {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();
  
  const [pesertaList, setPesertaList] = useState([]);
  const [listAsesor, setListAsesor] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jadwalInfo, setJadwalInfo] = useState(null);
  
  // State untuk Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id_jadwal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Peserta
      const resPeserta = await api.get(`/admin/jadwal/${id_jadwal}/peserta`);
      const data = resPeserta.data?.data || [];
      setPesertaList(data);
      
      if (data && data.length > 0 && data[0].jadwal) {
        setJadwalInfo(data[0].jadwal);
      }

      // 2. Fetch Asesor Penguji dari jadwal ini
      const resAsesor = await api.get(`/admin/jadwal-asesor/${id_jadwal}`);
      let allAssignedAsesor = resAsesor.data?.data || resAsesor.data || [];
      if (!Array.isArray(allAssignedAsesor) && allAssignedAsesor.rows) {
          allAssignedAsesor = allAssignedAsesor.rows;
      }
      
      // Filter: Hanya yang bertugas sebagai asesor penguji dan statusnya aktif
      const asesorPenguji = allAssignedAsesor.filter(a => a.jenis_tugas === 'asesor_penguji' && a.status === 'aktif');
      setListAsesor(asesorPenguji);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Assign Asesor ke Peserta
  const handleAssignAsesor = async (id_peserta, id_asesor) => {
      try {
        Swal.fire({
            title: "Menyimpan...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        await api.put(`/admin/peserta-jadwal/${id_peserta}/assign-asesor`, {
            id_asesor: id_asesor || null
        });
        Swal.fire('Berhasil', 'Asesor penguji berhasil ditugaskan', 'success');
        
        setPesertaList(prev => prev.map(p => {
            if (p.id_peserta === id_peserta) {
                return { ...p, id_asesor: id_asesor || null };
            }
            return p;
        }));
      } catch (error) {
          console.error(error);
          Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan', 'error');
      }
  };

  // --- HELPER FUNCTIONS ---
  const getAsesiName = (userObj) => {
    if (!userObj) return '-';
    const profile = userObj.ProfileAsesi || userObj.profileAsesi || userObj.profile_asesi;
    return profile?.nama_lengkap || userObj.username || '-';
  };

  const getAsesiNik = (userObj) => {
    if (!userObj) return '-';
    const profile = userObj.ProfileAsesi || userObj.profileAsesi || userObj.profile_asesi;
    return profile?.nik || '-';
  };

  const getSkemaName = (jadwalObj) => {
    const targetJadwal = jadwalObj || jadwalInfo;
    if (!targetJadwal) return '-';
    return targetJadwal.skema?.judul_skema || targetJadwal.Skema?.judul_skema || '-';
  };

  const getDropdownAsesorName = (itemJadwalAsesor) => {
    if (!itemJadwalAsesor) return 'Tanpa Nama';
    const user = itemJadwalAsesor.asesor || {};
    const profile =
      itemJadwalAsesor.profileAsesor ||
      itemJadwalAsesor.ProfileAsesor ||
      {};
    if (profile.nama_lengkap) return profile.nama_lengkap;
    if (user.nama) return user.nama;
    if (user.username && !/^\d+$/.test(user.username)) return user.username;
    return user.username ? `Asesor (${user.username})` : 'Tanpa Nama';
  };

  const getAssignedAsesorName = (userPenguji) => {
    if (!userPenguji) return 'Pilih Asesor Penguji';
    const profile = userPenguji.ProfileAsesor || userPenguji.profile_asesor || {};
    
    if (profile.nama_lengkap) return profile.nama_lengkap;
    if (userPenguji.nama) return userPenguji.nama;
    if (userPenguji.username && !/^\d+$/.test(userPenguji.username)) return userPenguji.username;
    
    return userPenguji.username ? `Asesor (${userPenguji.username})` : 'Tanpa Nama';
  };

  const filteredData = pesertaList.filter(item => {
    const nama = getAsesiName(item.user).toLowerCase();
    const nik = getAsesiNik(item.user).toLowerCase();
    const nomor = (item.nomor_peserta || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nomor.includes(term) || nama.includes(term) || nik.includes(term);
  });

  const totalKompeten = pesertaList.filter(item => item.status_asesmen === 'kompeten').length;
  const totalBelumKompeten = pesertaList.filter(item => item.status_asesmen === 'belum_kompeten').length;
  const totalProses = pesertaList.filter(item => item.status_asesmen !== 'kompeten' && item.status_asesmen !== 'belum_kompeten').length;

  const statusClass = (status) => {
    if (status === 'kompeten') return 'bg-green-50 text-green-600 border-green-200';
    if (status === 'belum_kompeten') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#CC6B27]" size={42} />
          <p className="text-[13px] font-bold text-[#071E3D]">Memuat data peserta jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        
        {/* HEADER HERO */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                {jadwalInfo ? jadwalInfo.nama_kegiatan : 'Data Peserta & Penugasan'}
              </h2>
              <p className="m-0 max-w-2xl text-[14px] font-medium text-[#182D4A]/70">
                {jadwalInfo ? `Skema: ${getSkemaName(jadwalInfo)}` : 'Mengelola asesi dan menentukan asesor pengujinya.'}
              </p>
            </div>
            
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} 
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STATISTIK 1 BARIS */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <StatCard icon={<Users size={22} />} label="Total Peserta" value={`${pesertaList.length} Orang`} tone="navy" />
          <StatCard icon={<CalendarClock size={22} />} label="Proses" value={`${totalProses} Data`} tone="blue" />
          <StatCard icon={<BadgeCheck size={22} />} label="Kompeten" value={`${totalKompeten} Lulus`} tone="green" />
          <StatCard icon={<Award size={22} />} label="Belum Kompeten" value={`${totalBelumKompeten} Gagal`} tone="red" />
        </div>

        {/* CONTENT - Disesuaikan dengan layout Skema */}
        <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
              <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                <FileText size={18} className="text-[#CC6B27]" />
                Daftar Peserta & Penugasan
              </h4>
            </div>
            <div className="relative w-full sm:max-w-xs group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] focus:bg-white py-2.5 pl-10 pr-4 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1100px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <TableHead center>No</TableHead>
                  <TableHead>Asesi (Peserta)</TableHead>
                  <TableHead>Nomor Peserta</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <UserPlus size={14} className="text-[#CC6B27]" /> 
                      Asesor Penguji
                    </div>
                  </TableHead>
                  <TableHead center>Status</TableHead>
                  <TableHead center>Nilai</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Users size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Belum ada peserta yang terdaftar atau cocok dengan pencarian.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => {
                    const asesiName = getAsesiName(row.user);
                    const asesiNik = getAsesiNik(row.user);
                    
                    return (
                      <tr key={row.id_peserta} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                        <td className="px-5 py-4 text-center text-[13.5px] font-semibold text-[#071E3D]">{index + 1}</td>
                        
                        <td className="px-5 py-4">
                          <div className="text-[13.5px] font-bold text-[#071E3D]">{asesiName}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Hash size={12} /> NIK: {asesiNik}
                          </div>
                        </td>
                        
                        <td className="px-5 py-4">
                          <span className="rounded bg-slate-50 border border-slate-200 px-2 py-1 text-[12px] font-bold text-[#071E3D]">
                            {row.nomor_peserta || '-'}
                          </span>
                        </td>

                        {/* --- KOLOM PILIH ASESOR --- */}
                        <td className="px-5 py-4">
                          {listAsesor.length === 0 ? (
                            <span className="text-[11px] font-semibold italic text-red-500">
                                *Belum ada Asesor Penguji
                            </span>
                          ) : (
                            <select 
                                value={row.id_asesor || ""}
                                onChange={(e) => handleAssignAsesor(row.id_peserta, e.target.value)}
                                className={`w-full max-w-[220px] cursor-pointer appearance-none rounded-lg border px-3 py-2 text-[12px] font-semibold outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 ${row.id_asesor ? 'bg-orange-50 text-[#CC6B27] border-[#CC6B27]/30' : 'bg-[#FAFAFA] text-[#071E3D] border-[#071E3D]/20'}`}
                            >
                                <option value="">-- Pilih Asesor --</option>
                                {listAsesor.map(a => {
                                    const asId = a.asesor?.id_user;
                                    if (!asId) return null;
                                    return (
                                        <option key={asId} value={asId}>
                                          {getDropdownAsesorName(a)}
                                        </option>
                                    )
                                })}
                            </select>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClass(row.status_asesmen)}`}>
                            {row.status_asesmen?.replace('_', ' ') || 'Terjadwal'}
                          </span>
                        </td>
                        
                        <td className="px-5 py-4 text-center">
                          <span className="text-[13.5px] font-bold text-[#071E3D]">{row.nilai_akhir || '-'}</span>
                        </td>
                        
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => { setSelectedPeserta(row); setShowDetailModal(true); }}
                            className="inline-flex items-center justify-center rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
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
      </div>

      {/* --- MODAL DETAIL PESERTA --- */}
      {showDetailModal && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#CC6B27]/10 p-2 rounded-lg text-[#CC6B27]">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Asesi</h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body Modal */}
            <div className="space-y-4 overflow-y-auto custom-scrollbar p-6 bg-white flex-1">
              <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Lengkap Asesi</p>
                  <p className="text-[13.5px] font-bold text-[#071E3D]">{getAsesiName(selectedPeserta.user)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-[#CC6B27]/20">
                  <p className="text-[10px] font-bold text-[#CC6B27] uppercase tracking-widest mb-1">Asesor Penguji</p>
                  <p className="text-[13.5px] font-bold text-[#CC6B27]">
                    {getAssignedAsesorName(selectedPeserta.asesor_penguji)}
                  </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nilai Akhir</p>
                  <p className="text-[18px] font-black text-[#071E3D]">{selectedPeserta.nilai_akhir || '-'}</p>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-[#071E3D] uppercase text-[12px] mt-1">{selectedPeserta.status_asesmen?.replace('_', ' ') || 'Terjadwal'}</p>
                </div>
              </div>
              {selectedPeserta.keterangan && (
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catatan / Keterangan</p>
                    <p className="text-[13px] font-medium text-[#071E3D] leading-relaxed">{selectedPeserta.keterangan}</p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-5 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[13px] font-bold transition-all"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style untuk scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, icon, tone = "orange" }) => {
  const tones = {
    navy: "bg-[#071E3D]/10 text-[#071E3D]",
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60 truncate">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D] leading-none truncate">{value}</p>
      </div>
    </div>
  );
};

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

export default PesertaJadwal;