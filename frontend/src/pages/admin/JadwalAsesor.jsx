// frontend/src/pages/admin/JadwalAsesor.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  BadgeCheck,
  RefreshCcw,
  Info,
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

  // Fungsi helper untuk mengekstrak array data dari response API yang mungkin nested (berlapis)
  const extractArrayData = (resBody) => {
    if (!resBody) return [];
    if (Array.isArray(resBody.data)) return resBody.data;
    if (resBody.data?.data && Array.isArray(resBody.data.data)) return resBody.data.data;
    if (resBody.data?.rows && Array.isArray(resBody.data.rows)) return resBody.data.rows;
    if (Array.isArray(resBody)) return resBody;
    return [];
  };

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
      let assigned = [];
      try {
        const resAssigned = await api.get(`/admin/jadwal-asesor/${id_jadwal}`);
        assigned = extractArrayData(resAssigned.data);
      } catch (err) {
        console.error("Error mengambil data asesor", err.response?.data || err);
        assigned = [];
      }
      setAssignedAsesors(assigned);

      // 3. Ambil daftar semua Asesor yang tersedia (untuk dropdown form)
      const resAsesor = await api.get('/admin/asesor');
      const asesorBody = extractArrayData(resAsesor.data);
      setAvailableAsesors(asesorBody);
    } catch (error) {
      console.error(error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Backend Error",
        text: error.response?.data?.message || error.message
      });
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
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
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

  const totalAssigned = assignedAsesors.length;
  const totalAktif = assignedAsesors.filter((item) => item.status === "aktif").length;
  const totalNonaktif = assignedAsesors.filter((item) => item.status !== "aktif").length;

  const inputClass = "w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10";
  const labelClass = "mb-1.5 block text-[11px] font-bold text-[#071E3D] uppercase tracking-wider";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#CC6B27]" size={42} />
          <p className="text-[13px] font-bold text-[#071E3D]">Memuat data penugasan asesor...</p>
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
                {jadwal?.nama_kegiatan || jadwal?.nama_jadwal || "Jadwal Uji"}
              </h2>
              <p className="m-0 max-w-2xl text-[14px] font-medium text-[#182D4A]/70">
                Tugaskan asesor pada jadwal uji kompetensi, atur jenis tugas, aktifkan atau nonaktifkan tugas, serta hapus penugasan jika diperlukan.
              </p>
            </div>
            
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">

              <button
                type="button"
                onClick={fetchAllData}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50 md:flex-none"
              >
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STATISTIK 1 BARIS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={<Users size={20} />} label="Total Penugasan" value={totalAssigned} />
          <StatCard icon={<CheckCircle size={20} />} label="Status Aktif" value={totalAktif} tone="green" />
          <StatCard icon={<XCircle size={20} />} label="Status Nonaktif" value={totalNonaktif} tone="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[380px_1fr]">
          {/* PANEL KIRI: FORM PENUGASAN */}
          <aside className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm sticky top-6">
            <div className="border-b border-[#071E3D]/10 bg-[#FAFAFA] p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                <UserPlus size={18} className="text-[#CC6B27]" />
                Form Penugasan Asesor
              </h2>
            </div>

            <form onSubmit={handleAssign} className="space-y-5 p-6">
              <div>
                <label className={labelClass}>Pilih Asesor <span className="text-red-500">*</span></label>
                <select
                  name="id_user"
                  value={formData.id_user}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                >
                  <option value="">-- Pilih Asesor --</option>
                  {availableAsesors.map((asesor) => {
                    const idAsesor = asesor.id_user || asesor.id || asesor.user?.id_user || asesor.User?.id_user;
                    const getNamaAsesor = (asesor) =>
                        asesor.nama_lengkap ||
                        asesor.user?.nama_lengkap ||
                        asesor.user?.profileAsesor?.nama_lengkap ||
                        asesor.user?.ProfileAsesor?.nama_lengkap ||
                        asesor.user?.ProfileAsesors?.[0]?.nama_lengkap ||
                        asesor.username ||
                        asesor.user?.username ||
                        "Tanpa Nama";
                    const emailAsesor = asesor.email || asesor.user?.email || asesor.User?.email || '';

                    if (!idAsesor) return null;

                    return (
                      <option key={idAsesor} value={idAsesor}>
                        {getNamaAsesor(asesor)} {emailAsesor ? ` - ${emailAsesor}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className={labelClass}>Jenis Tugas <span className="text-red-500">*</span></label>
                <select
                  name="jenis_tugas"
                  value={formData.jenis_tugas}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  {TUGAS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Catatan (Opsional)</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Instruksi tambahan..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Tugaskan Asesor
              </button>
            </form>
          </aside>

          {/* PANEL KANAN: DAFTAR ASESOR YANG DITUGASKAN */}
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                  <ClipboardCheck size={18} className="text-[#CC6B27]" />
                  Daftar Asesor Bertugas
                </h4>
              </div>
            </div>

            {assignedAsesors.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                <h3 className="text-[16px] font-bold text-[#071E3D]">Belum Ada Asesor</h3>
                <p className="mt-1 text-[13px] font-medium text-[#182D4A]/60 max-w-sm mx-auto">
                  Belum ada asesor yang ditugaskan untuk jadwal ini. Gunakan form di samping untuk menambahkan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse bg-white text-left">
                  <thead>
                    <tr>
                      <TableHead>Profil Asesor</TableHead>
                      <TableHead>Tugas</TableHead>
                      <TableHead center>Status</TableHead>
                      <TableHead center>Aksi</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedAsesors.map((item) => {
                      const user = item.asesor || item.Asesor || {};
                      const profile = user.ProfileAsesor || user.profileAsesor || user.ProfileAsesors?.[0] || {};
                      const isActive = item.status === 'aktif';

                      return (
                        <tr key={`${item.id_user}-${item.jenis_tugas}`} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                          <td className="px-5 py-4">
                            <div className="text-[13.5px] font-bold text-[#071E3D]">
                              {profile.nama_lengkap || user.nama_lengkap || user.username || "Tanpa Nama"}
                            </div>
                            <div className="mt-0.5 text-[11px] font-semibold text-slate-400">
                              {user.email || '-'}
                            </div>
                            {item.catatan && (
                              <div className="mt-2 inline-block rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                                Catatan: {item.catatan}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                              {item.jenis_tugas.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? 'border-green-200 bg-green-50 text-green-600'
                                  : 'border-slate-200 bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {item.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id_user, item.jenis_tugas, item.status)}
                                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                                  isActive
                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white'
                                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                }`}
                              >
                                {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item.id_user, item.jenis_tugas)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-500 transition-all hover:bg-red-600 hover:text-white"
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
          </section>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, icon, tone = "orange" }) => {
  const tones = {
    orange: "bg-orange-50 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60 truncate">{label}</p>
        <p className="mt-0.5 text-xl font-black text-[#071E3D] leading-none truncate">{value}</p>
      </div>
    </div>
  );
};

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export default JadwalAsesor;