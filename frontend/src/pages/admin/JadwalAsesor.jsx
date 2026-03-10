import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  ArrowLeft, Users, UserPlus, Trash2, 
  CheckCircle, XCircle, Loader2, Calendar, ShieldCheck 
} from 'lucide-react';

const TUGAS_OPTIONS = [
  { value: "asesor_penguji", label: "Asesor Penguji" },
  { value: "verifikator_tuk", label: "Verifikator TUK" },
  { value: "validator_mkva", label: "Validator MKVA" },
  { value: "komite_teknis", label: "Komite Teknis" }
];

const JadwalAsesor = () => {
  const { id_jadwal } = useParams(); // Diambil dari URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State Data
  const [jadwal, setJadwal] = useState(null);
  const [assignedAsesors, setAssignedAsesors] = useState([]);
  const [availableAsesors, setAvailableAsesors] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    id_user: "",
    jenis_tugas: "asesor_penguji",
    catatan: ""
  });

  useEffect(() => {
    if (id_jadwal) {
      fetchAllData();
    }
  }, [id_jadwal]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // 1. Ambil detail jadwal (untuk ditampilkan di Header)
      try {
        const resJadwal = await api.get(`/admin/jadwal/${id_jadwal}`);
        setJadwal(resJadwal.data?.data || resJadwal.data);
      } catch (e) {
        console.error("Jadwal tidak ditemukan", e);
      }

      // 2. Ambil Asesor yang sudah ditugaskan ke jadwal ini
      const resAssigned = await api.get(`/admin/jadwal-asesor/${id_jadwal}`);
      let assignedData = resAssigned.data?.data || resAssigned.data || [];
      // Antisipasi jika data dibungkus dalam .rows (pagination Sequelize)
      if (!Array.isArray(assignedData) && assignedData.rows) assignedData = assignedData.rows;
      setAssignedAsesors(Array.isArray(assignedData) ? assignedData : []);

      // 3. Ambil daftar semua Asesor yang tersedia (untuk dropdown form)
      const resAsesor = await api.get('/admin/asesor');
      let asesorData = resAsesor.data?.data || resAsesor.data || [];
      // Antisipasi jika data dibungkus dalam .rows
      if (!Array.isArray(asesorData) && asesorData.rows) asesorData = asesorData.rows;
      setAvailableAsesors(Array.isArray(asesorData) ? asesorData : []);

    } catch (error) {
      console.error("Gagal mengambil data", error);
      Swal.fire('Gagal', 'Terjadi kesalahan saat memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // FUNGSI: Menugaskan Asesor Baru
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!formData.id_user) {
      return Swal.fire('Peringatan', 'Silakan pilih asesor terlebih dahulu', 'warning');
    }

    try {
      setSubmitting(true);
      const payload = {
        id_jadwal: parseInt(id_jadwal),
        id_user: parseInt(formData.id_user),
        jenis_tugas: formData.jenis_tugas,
        catatan: formData.catatan || ""
      };

      await api.post('/admin/jadwal-asesor', payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Asesor berhasil ditugaskan ke jadwal ini.',
        timer: 1500,
        showConfirmButton: false
      });

      // Reset form dan refresh data table
      setFormData({ ...formData, id_user: "", catatan: "" });
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Gagal menugaskan asesor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // FUNGSI: Ubah Status (Aktif/Nonaktif)
  const handleToggleStatus = async (id_user, jenis_tugas, currentStatus) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    const actionText = newStatus === 'aktif' ? 'mengaktifkan' : 'menonaktifkan';

    const confirm = await Swal.fire({
      title: 'Konfirmasi',
      text: `Yakin ingin ${actionText} tugas asesor ini?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'aktif' ? '#10B981' : '#F59E0B',
      confirmButtonText: 'Ya, Lanjutkan'
    });

    if (confirm.isConfirmed) {
      try {
        await api.put(`/admin/jadwal-asesor/${id_jadwal}/${id_user}/${jenis_tugas}`, { status: newStatus });
        Swal.fire('Berhasil', 'Status tugas berhasil diperbarui', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
    }
  };

  // FUNGSI: Hapus Penugasan Asesor
  const handleDelete = async (id_user, jenis_tugas) => {
    const confirm = await Swal.fire({
      title: 'Hapus Penugasan?',
      text: "Data penugasan asesor pada tugas ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/jadwal-asesor/${id_jadwal}/${id_user}/${jenis_tugas}`);
        Swal.fire('Terhapus', 'Penugasan asesor berhasil dihapus', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal menghapus penugasan', 'error');
      }
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
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/admin/jadwal/uji-kompetensi')}
            className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-white mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali ke Jadwal Uji
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <ShieldCheck className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Manajemen Asesor Jadwal</h1>
              <p className="text-[#FAFAFA]/70 text-sm flex items-center gap-2">
                <Calendar size={14} /> 
                {jadwal?.nama_kegiatan || jadwal?.nama_jadwal || 'Memuat Jadwal...'} 
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL KIRI: FORM PENUGASAN */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-[#071E3D] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <UserPlus size={20} className="text-[#CC6B27]" /> Tugaskan Asesor Baru
            </h2>
            
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Pilih Asesor</label>
                <select 
                  name="id_user"
                  value={formData.id_user}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none transition-all"
                  required
                >
                  <option value="">-- Pilih Asesor --</option>
                  {availableAsesors.map((asesor, index) => {
                    // Pengecekan dinamis untuk berbagai skenario relasi tabel di Backend
                    const idAsesor = asesor.id_user || asesor.id || asesor.user?.id_user || asesor.User?.id_user;
                    const namaAsesor = asesor.nama_lengkap || asesor.username || asesor.nama || asesor.user?.username || asesor.User?.username || 'Tanpa Nama';
                    const emailAsesor = asesor.email || asesor.user?.email || asesor.User?.email || '';

                    if (!idAsesor) return null; // Abaikan jika ID tidak ditemukan

                    return (
                      <option key={index} value={idAsesor}>
                        {namaAsesor} {emailAsesor ? `- ${emailAsesor}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Jenis Tugas</label>
                <select 
                  name="jenis_tugas"
                  value={formData.jenis_tugas}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none transition-all font-medium"
                >
                  {TUGAS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Catatan (Opsional)</label>
                <textarea 
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Instruksi tambahan untuk asesor..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#071E3D] hover:bg-[#182D4A] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin"/> : <UserPlus size={16} />}
                Tugaskan Asesor
              </button>
            </form>
          </div>
        </div>

        {/* PANEL KANAN: DAFTAR ASESOR YANG DITUGASKAN */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#071E3D] flex items-center gap-2">
                <Users size={20} className="text-[#CC6B27]" /> Asesor Bertugas di Jadwal Ini
              </h2>
            </div>
            
            {assignedAsesors.length === 0 ? (
              <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-3">
                <Users size={48} className="text-slate-300" />
                <p>Belum ada asesor yang ditugaskan untuk jadwal ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      <th className="p-4 text-xs font-bold uppercase">Asesor</th>
                      <th className="p-4 text-xs font-bold uppercase">Tugas</th>
                      <th className="p-4 text-xs font-bold uppercase">Status</th>
                      <th className="p-4 text-xs font-bold uppercase text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedAsesors.map((item, index) => {
                      // Penyesuaian nama relasi
                      const user = item.asesor || item.Asesor || {};
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-[#071E3D] text-sm">{user.username || user.nama || 'Tanpa Nama'}</div>
                            <div className="text-xs text-slate-500">{user.email || '-'}</div>
                            {item.catatan && (
                              <div className="mt-1 text-[11px] text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                Catatan: {item.catatan}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-sm font-bold text-slate-700 uppercase">
                            {item.jenis_tugas.replace('_', ' ')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex w-max items-center gap-1.5
                              ${item.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {item.status === 'aktif' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                              <button 
                                onClick={() => handleToggleStatus(item.id_user, item.jenis_tugas, item.status)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors border
                                  ${item.status === 'aktif' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'}`}
                              >
                                {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id_user, item.jenis_tugas)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[12px] font-bold transition-colors border border-red-100 flex items-center gap-1"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default JadwalAsesor;