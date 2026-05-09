import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, ArrowLeft, Loader2, Eye, X, CalendarClock, Info,
  Users, BadgeCheck, Award, Hash, Sparkles, FileText, UserPlus
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

      // 2. Fetch Asesor Penguji dari jadwal ini (Untuk Dropdown)
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

  // --- FUNGSI: Assign Asesor ke Peserta ---
  const handleAssignAsesor = async (id_peserta, id_asesor) => {
      try {
        Swal.fire({
            title: "Menyimpan...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        await api.put(`/admin/peserta-jadwal/${id_peserta}/assign-asesor`, {
            id_asesor: id_asesor || null // kirim null jika select box dikosongkan
        });

        Swal.fire('Berhasil', 'Asesor penguji berhasil ditugaskan', 'success');
        
        // Update state lokal agar UI langsung berubah tanpa reload halaman
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

  // Helper untuk mendapatkan nama Asesor di Dropdown
  const getDropdownAsesorName = (itemJadwalAsesor) => {
    const user = itemJadwalAsesor.asesor || {};
    const profile = user.ProfileAsesor || user.profile_asesor || {};
    
    if (profile.nama_lengkap) return profile.nama_lengkap;
    if (user.nama) return user.nama;
    if (user.username && !/^\d+$/.test(user.username)) return user.username;
    
    // Fallback terakhir jika profil benar-benar kosong
    return user.username ? `Asesor (${user.username})` : 'Tanpa Nama';
  };

  // Helper untuk mendapatkan nama Asesor di baris tabel / Modal (dari data pesertaJadwal)
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  const totalKompeten = pesertaList.filter(item => item.status_asesmen === 'kompeten').length;
  const totalBelumKompeten = pesertaList.filter(item => item.status_asesmen === 'belum_kompeten').length;
  const totalProses = pesertaList.filter(item => item.status_asesmen !== 'kompeten' && item.status_asesmen !== 'belum_kompeten').length;

  const statusClass = (status) => {
    if (status === 'kompeten') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'belum_kompeten') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 p-6 lg:p-8">
            <button
              onClick={() => navigate('/admin/jadwal/uji-kompetensi')}
              className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
            >
              <ArrowLeft size={16} />
              Kembali ke Jadwal
            </button>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Users size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Peserta Jadwal
                  </span>
                </div>

                <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                  Data Peserta &
                  <br />
                  <span className="text-orange-500">Penugasan Asesor</span>
                </h1>

                <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                  {jadwalInfo
                    ? `Jadwal: ${jadwalInfo.nama_kegiatan} | Skema: ${getSkemaName(jadwalInfo)}`
                    : 'Mengelola asesi dan menentukan asesor pengujinya.'}
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Total Peserta
                  </p>

                  <h2 className="mb-4 text-5xl font-black leading-none">
                    {pesertaList.length}
                  </h2>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <HeroPill label="Proses" value={`${totalProses}`} />
                    <HeroPill label="K" value={`${totalKompeten}`} />
                    <HeroPill label="BK" value={`${totalBelumKompeten}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MiniStat icon={<Users size={22} />} label="Total Peserta" value={pesertaList.length} />
          <MiniStat icon={<CalendarClock size={22} />} label="Proses" value={totalProses} />
          <MiniStat icon={<BadgeCheck size={22} />} label="Kompeten" value={totalKompeten} />
          <MiniStat icon={<Award size={22} />} label="Belum Kompeten" value={totalBelumKompeten} />
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <FileText size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Daftar Peserta & Penugasan
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">Kelola Peserta Asesmen</h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Pilih Asesor Penguji untuk masing-masing peserta melalui kolom dropdown.
                </p>
              </div>

              <div className="relative w-full lg:w-[400px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau nomor peserta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Asesi (Peserta)</TableHead>
                  <TableHead>Nomor Peserta</TableHead>
                  <TableHead>
                      <div className="flex items-center gap-2">
                          <UserPlus size={14} className="text-orange-500" /> 
                          Asesor Penguji
                      </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead center>Nilai</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
                      <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">Memuat Data Peserta</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Users size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-sm font-black text-[#071E3D]">Belum ada peserta yang cocok atau terdaftar pada jadwal ini.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => {
                    const asesiName = getAsesiName(row.user);
                    const asesiNik = getAsesiNik(row.user);

                    return (
                      <tr key={row.id_peserta} className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30">
                        <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">{index + 1}</td>
                        <td className="px-5 py-4">
                          <div className="font-black text-[#071E3D]">{asesiName}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400">
                            <Hash size={12} /> NIK: {asesiNik}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-black text-[#071E3D]">
                            {row.nomor_peserta || '-'}
                          </span>
                        </td>

                        {/* --- KOLOM PILIH ASESOR --- */}
                        <td className="px-5 py-4">
                           {listAsesor.length === 0 ? (
                               <span className="text-xs font-semibold italic text-red-500">
                                   *Belum ada Asesor Penguji
                               </span>
                           ) : (
                               <select 
                                  value={row.id_asesor || ""}
                                  onChange={(e) => handleAssignAsesor(row.id_peserta, e.target.value)}
                                  className={`w-full max-w-[220px] cursor-pointer appearance-none rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 ${row.id_asesor ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-500'}`}
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

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(row.status_asesmen)}`}>
                            {row.status_asesmen?.replace('_', ' ') || 'Terjadwal'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-base font-black text-[#071E3D]">{row.nilai_akhir || '-'}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => { setSelectedPeserta(row); setShowDetailModal(true); }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                            title="Lihat Detail"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAL DETAIL PESERTA --- */}
      {showDetailModal && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-[#071E3D]">Detail <span className="text-orange-500">Asesi</span></h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap Asesi</p>
                  <p className="font-bold text-[#071E3D]">{getAsesiName(selectedPeserta.user)}</p>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Asesor Penguji</p>
                  <p className="font-bold text-orange-600">
                    {getAssignedAsesorName(selectedPeserta.asesor_penguji)}
                  </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nilai Akhir</p>
                  <p className="text-xl font-black text-[#071E3D]">{selectedPeserta.nilai_akhir || '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-blue-600 uppercase text-xs mt-1">{selectedPeserta.status_asesmen?.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedPeserta.keterangan && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catatan</p>
                    <p className="text-sm font-medium text-[#071E3D]">{selectedPeserta.keterangan}</p>
                </div>
              )}
            </div>

            <button onClick={() => setShowDetailModal(false)} className="w-full mt-6 py-4 bg-[#071E3D] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all">
              Tutup Modal
            </button>
          </div>
        </div>
      )}

      {/* Style untuk scrollbar modal jika kontennya panjang */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
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

export default PesertaJadwal;