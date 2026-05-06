import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, Building2, ArrowLeft, Link as LinkIcon, Unlink,
  Sparkles, ClipboardCheck, Layers, ShieldCheck
} from 'lucide-react';

// PASTIKAN TIDAK ADA IMPORT CSS EKSTERNAL DI SINI

const SkemaPersyaratanTuk = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [skemaDetail, setSkemaDetail] = useState(null);
  const [masterData, setMasterData] = useState([]);
  const [attachedData, setAttachedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMaster, setSearchMaster] = useState('');
  
  const [attachFormId, setAttachFormId] = useState('');

  const [showModalMaster, setShowModalMaster] = useState(false);
  const [isEditMaster, setIsEditMaster] = useState(false);
  const [currentMasterId, setCurrentMasterId] = useState(null);
  const [formMaster, setFormMaster] = useState({ nama_perlengkapan: '', spesifikasi: '' });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resMaster = await api.get('/admin/persyaratan-tuk');
      setMasterData(resMaster.data.data || []);

      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data.data);
      setAttachedData(resSkema.data.data?.persyaratan_tuks || resSkema.data.data?.persyaratanTuks || []);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data perlengkapan TUK', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleAttach = async (e) => {
    e.preventDefault();
    if (!attachFormId) return Swal.fire('Peringatan', 'Pilih perlengkapan terlebih dahulu', 'warning');
    
    try {
      Swal.fire({ title: "Menambahkan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.post('/admin/persyaratan-tuk/attach', { 
        id_skema: id, 
        id_persyaratan_tuk: attachFormId
      });
      Swal.fire('Sukses', 'Perlengkapan ditambahkan ke skema', 'success');
      setAttachFormId('');
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDetach = async (id_persyaratan_tuk) => {
    const result = await Swal.fire({ title: 'Lepas Perlengkapan?', text: "Perlengkapan akan dilepas dari skema ini.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Ya, Lepas!' });
    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Melepas...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/persyaratan-tuk/detach/${id}/${id_persyaratan_tuk}`);
        Swal.fire('Terlepas!', 'Berhasil dilepas.', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal', 'Gagal melepas data', 'error');
      }
    }
  };

  const handleSubmitMaster = async (e) => {
    e.preventDefault();
    try {
      if (isEditMaster) {
        await api.put(`/admin/persyaratan-tuk/${currentMasterId}`, formMaster);
        Swal.fire('Sukses', 'Master Perlengkapan diperbarui', 'success');
      } else {
        await api.post('/admin/persyaratan-tuk', formMaster);
        Swal.fire('Sukses', 'Master Perlengkapan ditambahkan', 'success');
      }
      setShowModalMaster(false);
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleEditMaster = (item) => {
    setIsEditMaster(true);
    setCurrentMasterId(item.id_persyaratan_tuk);
    setFormMaster({ nama_perlengkapan: item.nama_perlengkapan, spesifikasi: item.spesifikasi || '' });
    setShowModalMaster(true);
  };

  const handleDeleteMaster = async (id_persyaratan_tuk) => {
    const result = await Swal.fire({ title: 'Hapus Master?', text: "Data akan hilang dari semua skema!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus' });
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/persyaratan-tuk/${id_persyaratan_tuk}`);
        Swal.fire('Terhapus!', 'Master berhasil dihapus.', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal', 'Gagal menghapus data master', 'error');
      }
    }
  };

  const filteredMaster = masterData.filter(item => item.nama_perlengkapan.toLowerCase().includes(searchMaster.toLowerCase()));
  const availableToAttach = masterData.filter(m => !attachedData.some(a => a.id_persyaratan_tuk === m.id_persyaratan_tuk));

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
                onClick={() => navigate('/admin/skema')}
                className="mb-6 inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
              >
                <ArrowLeft size={16} />
                Kembali ke Skema
              </button>

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Building2 size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Persyaratan TUK
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola Perlengkapan
                <br />
                <span className="text-orange-500">TUK Skema</span>
              </h1>

              <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Skema: <span className="font-black text-orange-500">{skemaDetail?.kode_skema || 'Memuat...'}</span>
                {skemaDetail?.judul_skema ? ` - ${skemaDetail.judul_skema}` : ''}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Perlengkapan Terpasang
                </p>

                <h2 className="mb-4 text-5xl font-black leading-none">
                  {attachedData.length}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Total perlengkapan TUK yang sudah ditautkan ke skema ini.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Master" value={masterData.length} />
                  <HeroPill label="Tersedia" value={availableToAttach.length} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-100 bg-white py-20 shadow-sm">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="mt-4 text-sm font-black uppercase tracking-widest text-[#071E3D]">
              Memuat Perlengkapan TUK
            </p>
          </div>
        ) : (
          <>
            {/* TABEL ANAKAN */}
            <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <LinkIcon size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Terpasang Pada Skema
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Perlengkapan Pada Skema Ini
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Tambahkan perlengkapan dari master data TUK ke skema aktif.
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleAttach} className="mb-6 rounded-[28px] border border-slate-100 bg-slate-50/70 p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
                      value={attachFormId}
                      onChange={(e) => setAttachFormId(e.target.value)}
                    >
                      <option value="">-- Pilih Perlengkapan dari Master Data --</option>
                      {availableToAttach.map(item => (
                        <option key={item.id_persyaratan_tuk} value={item.id_persyaratan_tuk}>{item.nama_perlengkapan}</option>
                      ))}
                    </select>

                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-orange-500">
                      <Plus size={16} />
                      Tambahkan
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#071E3D]">
                        <TableHead center>No</TableHead>
                        <TableHead>Nama Perlengkapan</TableHead>
                        <TableHead center>Aksi</TableHead>
                      </tr>
                    </thead>
                    <tbody>
                      {attachedData.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-12 text-center">
                            <ShieldCheck size={44} className="mx-auto mb-3 text-[#071E3D]/20" />
                            <p className="text-sm font-black text-[#071E3D]">
                              Belum ada perlengkapan di skema ini.
                            </p>
                          </td>
                        </tr>
                      ) : attachedData.map((item, index) => (
                        <tr key={item.id_persyaratan_tuk} className="border-b border-slate-100 bg-white transition-all last:border-0 hover:bg-orange-50/30">
                          <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-black text-[#071E3D]">{item.nama_perlengkapan}</div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button onClick={() => handleDetach(item.id_persyaratan_tuk)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white" title="Lepas dari Skema">
                              <Unlink size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* TABEL INDUK */}
            <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ClipboardCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Master Data
                  </span>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#071E3D]">
                      Master Data Perlengkapan TUK
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate-400">
                      Kelola daftar perlengkapan TUK yang dapat digunakan semua skema.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
                    <div className="relative w-full lg:w-[320px]">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari master..."
                        value={searchMaster}
                        onChange={(e) => setSearchMaster(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setFormMaster({nama_perlengkapan:'', spesifikasi:''});
                        setIsEditMaster(false);
                        setShowModalMaster(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                    >
                      <Plus size={16}/>
                      Master
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                  <table className="w-full min-w-[880px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#071E3D]">
                        <TableHead center>No</TableHead>
                        <TableHead>Nama Perlengkapan</TableHead>
                        <TableHead>Spesifikasi</TableHead>
                        <TableHead center>Aksi</TableHead>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaster.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center">
                            <Layers size={44} className="mx-auto mb-3 text-[#071E3D]/20" />
                            <p className="text-sm font-black text-[#071E3D]">
                              Master perlengkapan tidak ditemukan.
                            </p>
                          </td>
                        </tr>
                      ) : filteredMaster.map((item, index) => (
                        <tr key={item.id_persyaratan_tuk} className="border-b border-slate-100 bg-white transition-all last:border-0 hover:bg-orange-50/30">
                          <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-black text-[#071E3D]">{item.nama_perlengkapan}</div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold leading-relaxed text-slate-500">{item.spesifikasi || '-'}</div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditMaster(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white">
                                <Edit2 size={16}/>
                              </button>
                              <button onClick={() => handleDeleteMaster(item.id_persyaratan_tuk)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {/* MODAL MASTER DATA */}
        {showModalMaster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 p-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                    {isEditMaster ? <Edit2 size={20} className="text-orange-500"/> : <Plus size={20} className="text-orange-500"/>}
                    {isEditMaster ? 'Edit Master Perlengkapan' : 'Tambah Master Perlengkapan'}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Kelola master perlengkapan TUK untuk digunakan pada skema.
                  </p>
                </div>

                <button onClick={() => setShowModalMaster(false)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleSubmitMaster} className="space-y-5 p-6">
                <div>
                  <Label>Nama Perlengkapan</Label>
                  <input
                    type="text"
                    value={formMaster.nama_perlengkapan}
                    onChange={(e) => setFormMaster({...formMaster, nama_perlengkapan: e.target.value})}
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <Label>Spesifikasi</Label>
                  <textarea
                    rows="4"
                    value={formMaster.spesifikasi}
                    onChange={(e) => setFormMaster({...formMaster, spesifikasi: e.target.value})}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setShowModalMaster(false)} className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white">
                    Batal
                  </button>

                  <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]">
                    <Save size={16}/>
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
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

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </label>
  );
}

export default SkemaPersyaratanTuk;