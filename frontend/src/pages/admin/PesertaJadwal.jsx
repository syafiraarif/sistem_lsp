import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../services/api";
import { 
  Search, ArrowLeft, Loader2, Eye, X, CalendarClock, Info,
  Users, BadgeCheck, Award, Hash, User, Sparkles, FileText
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
                  Data Peserta
                  <br />
                  <span className="text-orange-500">Jadwal Asesmen</span>
                </h1>

                <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                  {jadwalInfo
                    ? `Jadwal: ${jadwalInfo.nama_kegiatan} | Skema: ${getSkemaName(jadwalInfo)}`
                    : 'Mengelola asesi yang terdaftar di jadwal ini.'}
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

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Ringkasan peserta yang terdaftar dalam jadwal asesmen ini.
                  </p>

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
                Daftar Peserta
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Peserta Terdaftar
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari peserta berdasarkan nama, NIK, nomor peserta, email, atau skema.
                </p>
              </div>

              <div className="relative w-full lg:w-[400px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, skema, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Nama / NIK</TableHead>
                  <TableHead>Skema</TableHead>
                  <TableHead>Nomor Peserta</TableHead>
                  <TableHead>Status Asesmen</TableHead>
                  <TableHead center>Nilai Akhir</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
                      <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
                        Memuat Data Peserta
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Users size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-sm font-black text-[#071E3D]">
                        Belum ada peserta yang cocok atau terdaftar pada jadwal ini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => {
                    const profile = getProfile(row.user);
                    const namaLengkap = profile?.nama_lengkap || row.user?.username || row.user?.nama_lengkap || '-';
                    const nik = profile?.nik || '-';
                    const namaSkema = getSkemaName(row.jadwal);

                    return (
                      <tr
                        key={row.id_peserta}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-black text-[#071E3D]">{namaLengkap}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400">
                            <Hash size={12} /> NIK: {nik}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[280px] text-sm font-semibold leading-relaxed text-slate-500 line-clamp-2" title={namaSkema}>
                            {namaSkema}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-black text-[#071E3D]">
                            {row.nomor_peserta || '-'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(row.status_asesmen)}`}>
                            {row.status_asesmen?.replace('_', ' ') || 'Terjadwal'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="text-base font-black text-[#071E3D]">
                            {row.nilai_akhir ? row.nilai_akhir : '-'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleViewDetail(row)}
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
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Info size={21} className="text-orange-500" />
                  Detail Peserta Asesmen
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Rincian data peserta, status asesmen, nilai, dan catatan asesor.
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                
                {/* Info Utama */}
                <DetailSection icon={<User size={17} />} title="Informasi Utama">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Nama Asesi">
                      {getProfile(selectedPeserta.user)?.nama_lengkap || selectedPeserta.user?.username || '-'}
                    </DetailItem>
                    <DetailItem label="NIK Asesi">
                      {getProfile(selectedPeserta.user)?.nik || '-'}
                    </DetailItem>
                    <DetailItem label="Skema" wide>
                      <span title={getSkemaName(selectedPeserta.jadwal)}>
                        {getSkemaName(selectedPeserta.jadwal)}
                      </span>
                    </DetailItem>
                    <DetailItem label="Nomor Peserta">
                      {selectedPeserta.nomor_peserta || 'Belum di-generate'}
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Status & Nilai */}
                <DetailSection icon={<Award size={17} />} title="Status & Nilai">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Status Asesmen">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(selectedPeserta.status_asesmen)}`}>
                        {selectedPeserta.status_asesmen?.replace('_', ' ') || 'Terjadwal'}
                      </span>
                    </DetailItem>
                    <DetailItem label="Nilai Akhir">
                      <span className="text-lg font-black text-orange-500">
                        {selectedPeserta.nilai_akhir || 'Belum dinilai'}
                      </span>
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Info Waktu */}
                <DetailSection icon={<CalendarClock size={17} />} title="Riwayat Waktu Asesmen">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Waktu Mulai">
                      {formatDate(selectedPeserta.waktu_mulai)}
                    </DetailItem>
                    <DetailItem label="Waktu Selesai">
                      {formatDate(selectedPeserta.waktu_selesai)}
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* Keterangan */}
                <DetailSection icon={<FileText size={17} />} title="Keterangan / Catatan Asesor">
                  <div className="min-h-[80px] rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-[#071E3D]">
                    {selectedPeserta.keterangan || (
                      <span className="italic text-slate-400">
                        Tidak ada catatan keterangan.
                      </span>
                    )}
                  </div>
                </DetailSection>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-2xl border border-slate-100 bg-white px-7 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
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

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
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
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function DetailSection({ icon, title, children }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black text-[#071E3D]">
        <span className="text-orange-500">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, wide }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <div className="text-sm font-bold text-[#071E3D]">{children}</div>
    </div>
  );
}

export default PesertaJadwal;