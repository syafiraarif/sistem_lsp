// frontend/src/pages/admin/KelompokPekerjaan.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  ArrowLeft,
  Briefcase,
  Sparkles,
  Layers,
  ClipboardList,
  BadgeCheck,
} from 'lucide-react';

const KelompokPekerjaan = () => {
  const { id } = useParams(); // Mendapatkan id_skema dari URL
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // State Form
  const initialFormState = {
    id_skema: id,
    nama_kelompok: '',
    deskripsi: '',
    urutan: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/kelompok-pekerjaan/skema/${id}`);
      setData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Gagal memuat data kelompok pekerjaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setCurrentId(item.id_kelompok);
    setFormData({
      id_skema: item.id_skema,
      nama_kelompok: item.nama_kelompok || '',
      deskripsi: item.deskripsi || '',
      urutan: item.urutan || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id_kelompok) => {
    const result = await Swal.fire({
      title: 'Hapus Kelompok Pekerjaan?',
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
        await api.delete(`/admin/kelompok-pekerjaan/${id_kelompok}`);
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: "Memproses...", text: "Mohon tunggu", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (isEditMode) {
        await api.put(`/admin/kelompok-pekerjaan/${currentId}`, formData);
        Swal.fire('Berhasil', 'Data berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/kelompok-pekerjaan', formData);
        Swal.fire('Berhasil', 'Data baru ditambahkan', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    }
  };

  // --- FILTER ---
  const filteredData = data.filter(item =>
    item.nama_kelompok && item.nama_kelompok.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalKelompok = data.length;
  const totalFiltered = filteredData.length;
  const totalDeskripsi = data.filter((item) => item.deskripsi).length;

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
                onClick={() => navigate('/admin/skema')}
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#071E3D] hover:text-white"
              >
                <ArrowLeft size={14} />
                Kembali ke Skema
              </button>

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Briefcase size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Kelompok Pekerjaan
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Pemetaan Kelompok
                <br />
                <span className="text-orange-500">Pekerjaan</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola pemetaan kelompok pekerjaan pada skema sertifikasi
                berdasarkan urutan, nama kelompok, dan deskripsi pekerjaan.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormState);
                    setIsEditMode(false);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Kelompok
                </button>

                <button
                  type="button"
                  onClick={fetchData}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ClipboardList size={17} />
                  )}
                  Refresh Data
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
                  Ringkasan Kelompok
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalKelompok} Kelompok
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Data ini digunakan untuk memetakan pekerjaan dalam skema
                  sertifikasi agar lebih terstruktur.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Tampil" value={`${totalFiltered}`} />
                  <HeroPill label="Deskripsi" value={`${totalDeskripsi}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Briefcase size={22} />}
            label="Total Kelompok"
            value={`${totalKelompok} Data`}
          />
          <MiniStat
            icon={<Layers size={22} />}
            label="Hasil Filter"
            value={`${totalFiltered} Data`}
            tone="navy"
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Ada Deskripsi"
            value={`${totalDeskripsi} Data`}
            tone="green"
          />
        </section>

        {/* TABLE SECTION */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Search size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Data Kelompok
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Kelompok Pekerjaan
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari dan kelola kelompok pekerjaan berdasarkan skema.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData(initialFormState);
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Tambah Kelompok
            </button>
          </div>

          {/* SEARCH */}
          <div className="p-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Cari nama kelompok..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>Urutan</TableHead>
                  <TableHead>Nama Kelompok</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data kelompok pekerjaan...
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
                      <Briefcase
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        Belum ada kelompok pekerjaan.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id_kelompok}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-black text-orange-500">
                        {item.urutan || '-'}
                      </td>

                      <td className="px-5 py-4 text-sm font-black text-[#071E3D]">
                        {item.nama_kelompok}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold leading-relaxed text-slate-600">
                        {item.deskripsi || '-'}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_kelompok)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  {isEditMode ? (
                    <Edit2 size={20} className="text-orange-500" />
                  ) : (
                    <Plus size={20} className="text-orange-500" />
                  )}
                  {isEditMode ? 'Edit Kelompok Pekerjaan' : 'Tambah Kelompok Pekerjaan'}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Isi detail kelompok pekerjaan pada skema ini.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form id="kelompokForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label required>Urutan</Label>
                  <input
                    type="number"
                    name="urutan"
                    value={formData.urutan}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <Label required>Nama Kelompok</Label>
                  <input
                    type="text"
                    name="nama_kelompok"
                    value={formData.nama_kelompok}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <Label>Deskripsi</Label>
                  <textarea
                    name="deskripsi"
                    rows="4"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
              <button
                type="button"
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>

              <button
                type="submit"
                form="kelompokForm"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Save size={16} />
                Simpan
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
    navy: "bg-slate-50 text-[#071E3D]",
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

export default KelompokPekerjaan;