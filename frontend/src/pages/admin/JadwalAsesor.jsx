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
          const resAssigned = await api.get(
              `/admin/jadwal-asesor/${id_jadwal}`
          );
         assigned = extractArrayData(resAssigned.data);
        } catch (err) {
            console.error(
                "Error mengambil data asesor",
                err.response?.data || err
            );
            assigned = [];
        }
        setAssignedAsesors(assigned);

      // 3. Ambil daftar semua Asesor yang tersedia (untuk dropdown form)
      // *Perbaikan: Menggunakan fungsi extractArrayData yang lebih robust
      const resAsesor = await api.get('/admin/asesor');
      const asesorBody = extractArrayData(resAsesor.data);
      setAvailableAsesors(asesorBody);
    } catch (error) {
    console.error(error.response?.data);
    Swal.fire({
        icon:"error",
        title:"Backend Error",
        text:error.response?.data?.message ||
             error.message
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

  const totalAssigned = assignedAsesors.length;
  const totalAktif = assignedAsesors.filter((item) => item.status === "aktif").length;
  const totalNonaktif = assignedAsesors.filter((item) => item.status !== "aktif").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="rounded-[30px] border border-slate-100 bg-white px-10 py-8 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-orange-500" size={42} />
          <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
            Memuat data asesor jadwal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <button
                type="button"
                onClick={() => navigate('/admin/jadwal')}
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#071E3D] hover:text-white"
              >
                <ArrowLeft size={14} />
                Kembali ke Jadwal Uji
              </button>

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <ShieldCheck size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Manajemen Asesor Jadwal
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Penugasan Asesor
                <br />
                <span className="text-orange-500">
                  {jadwal?.nama_kegiatan || jadwal?.nama_jadwal || "Jadwal Uji"}
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Tugaskan asesor pada jadwal uji kompetensi, atur jenis tugas,
                aktifkan atau nonaktifkan tugas, serta hapus penugasan jika
                diperlukan.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={fetchAllData}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={17} />
                  )}
                  Refresh Data
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("form-penugasan")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <UserPlus size={17} />
                  Tugaskan Asesor
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Penugasan
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalAssigned} Asesor Bertugas
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data asesor yang sudah terhubung dengan jadwal ini dan
                  memiliki peran sesuai kebutuhan pelaksanaan asesmen.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Aktif" value={`${totalAktif}`} />
                  <HeroPill label="Nonaktif" value={`${totalNonaktif}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Users size={22} />}
            label="Total Penugasan"
            value={`${totalAssigned} Asesor`}
          />
          <MiniStat
            icon={<CheckCircle size={22} />}
            label="Aktif"
            value={`${totalAktif} Tugas`}
            tone="green"
          />
          <MiniStat
            icon={<XCircle size={22} />}
            label="Nonaktif"
            value={`${totalNonaktif} Tugas`}
            tone="red"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[390px_1fr]">
          {/* PANEL KIRI: FORM PENUGASAN */}
          <aside
            id="form-penugasan"
            className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <UserPlus size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Form Penugasan
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Tugaskan Asesor Baru
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                Pilih asesor, tentukan tugas, dan tambahkan catatan jika ada.
              </p>
            </div>

            <form onSubmit={handleAssign} className="space-y-5 p-6">
              <div>
                <Label required>Pilih Asesor</Label>
                <select
                  name="id_user"
                  value={formData.id_user}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  required
                >
                  <option value="">-- Pilih Asesor --</option>
                  {availableAsesors.map((asesor, index) => {
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
                        {getNamaAsesor(asesor)}
                        {emailAsesor ? ` - ${emailAsesor}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <Label>Jenis Tugas</Label>
                <select
                  name="jenis_tugas"
                  value={formData.jenis_tugas}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  {TUGAS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Catatan (Opsional)</Label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Instruksi tambahan untuk asesor..."
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                Tugaskan Asesor
              </button>
            </form>
          </aside>

          {/* PANEL KANAN: DAFTAR ASESOR YANG DITUGASKAN */}
          <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ClipboardCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Daftar Penugasan
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Asesor Bertugas di Jadwal Ini
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Kelola status dan penugasan asesor pada jadwal ini.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Info size={15} />
                {totalAssigned} Penugasan
              </div>
            </div>

            {assignedAsesors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#071E3D]">
                  Belum Ada Asesor
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                  Belum ada asesor yang ditugaskan untuk jadwal ini. Gunakan
                  form di sisi kiri untuk menambahkan asesor.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#071E3D]">
                      <TableHead>Asesor</TableHead>
                      <TableHead>Tugas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead center>Aksi</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedAsesors.map((item, index) => {
                      const user =
                      item.asesor ||
                      item.Asesor ||
                      {};
                          
                      const profile =
                      user.ProfileAsesor ||
                      user.profileAsesor ||
                      user.ProfileAsesors?.[0] ||
                      {};

                      return (
                        <tr key={`${item.id_user}-${item.jenis_tugas}`}>
                          <td className="px-5 py-4">
                            <div className="text-sm font-black text-[#071E3D]">
                                {
                                      profile.nama_lengkap ||
                                      user.nama_lengkap ||
                                      user.username ||
                                      "Tanpa Nama"
                                  }
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-400">
                              {user.email || '-'}
                            </div>

                            {item.catatan && (
                              <div className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                                Catatan: {item.catatan}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                              {item.jenis_tugas.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex w-max items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                item.status === 'aktif'
                                  ? 'border-green-100 bg-green-50 text-green-600'
                                  : 'border-slate-200 bg-slate-50 text-slate-500'
                              }`}
                            >
                              {item.status === 'aktif' ? (
                                <CheckCircle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {item.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id_user, item.jenis_tugas, item.status)}
                                className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                  item.status === 'aktif'
                                    ? 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white'
                                    : 'border-green-100 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                                }`}
                              >
                                {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item.id_user, item.jenis_tugas)}
                                className="inline-flex items-center gap-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 size={14} />
                                Hapus
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
        </section>
      </div>
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
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

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export default JadwalAsesor;