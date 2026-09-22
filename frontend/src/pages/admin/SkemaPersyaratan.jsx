import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, FileCheck, ArrowLeft, Link as LinkIcon, Unlink,
  Sparkles, ClipboardCheck, Layers, ShieldCheck
} from 'lucide-react';

const SkemaPersyaratan = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [skemaDetail, setSkemaDetail] = useState(null);
  const [masterData, setMasterData] = useState([]);
  const [attachedData, setAttachedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMaster, setSearchMaster] = useState('');
  
  const [attachForm, setAttachForm] = useState({ id_persyaratan: '', wajib: true });

  const [showModalMaster, setShowModalMaster] = useState(false);
  const [isEditMaster, setIsEditMaster] = useState(false);
  const [currentMasterId, setCurrentMasterId] = useState(null);
  const [formMaster, setFormMaster] = useState({ nama_persyaratan: '', jenis_persyaratan: 'dasar', keterangan: '' });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resMaster = await api.get('/admin/persyaratan');
      setMasterData(resMaster.data.data || []);

      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data.data);
      setAttachedData(resSkema.data.data?.persyaratans || resSkema.data.data?.persyaratan || []);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data persyaratan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleAttach = async (e) => {
    e.preventDefault();
    if (!attachForm.id_persyaratan) return Swal.fire('Peringatan', 'Pilih persyaratan terlebih dahulu', 'warning');
    
    try {
      Swal.fire({ title: "Menambahkan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.post('/admin/persyaratan/attach', { 
        id_skema: id, 
        id_persyaratan: attachForm.id_persyaratan,
        wajib: attachForm.wajib 
      });
      Swal.fire('Sukses', 'Persyaratan ditambahkan ke skema', 'success');
      setAttachForm({ id_persyaratan: '', wajib: true });
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDetach = async (id_persyaratan) => {
    const result = await Swal.fire({ 
      title: 'Lepas Persyaratan?', 
      text: "Persyaratan ini akan dilepas dari skema ini.", 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#EF4444', 
      cancelButtonColor: '#182D4A', 
      confirmButtonText: 'Ya, Lepas!' 
    });
    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Melepas...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/persyaratan/detach/${id}/${id_persyaratan}`);
        Swal.fire('Terlepas!', 'Berhasil dilepas dari skema.', 'success');
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
        await api.put(`/admin/persyaratan/${currentMasterId}`, formMaster);
        Swal.fire('Sukses', 'Master Persyaratan diperbarui', 'success');
      } else {
        await api.post('/admin/persyaratan', formMaster);
        Swal.fire('Sukses', 'Master Persyaratan ditambahkan', 'success');
      }
      setShowModalMaster(false);
      fetchAllData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleEditMaster = (item) => {
    setIsEditMaster(true);
    setCurrentMasterId(item.id_persyaratan);
    setFormMaster({ nama_persyaratan: item.nama_persyaratan, jenis_persyaratan: item.jenis_persyaratan, keterangan: item.keterangan || '' });
    setShowModalMaster(true);
  };

  const handleDeleteMaster = async (id_persyaratan) => {
    const result = await Swal.fire({ 
      title: 'Hapus Master?', 
      text: "Data master yang dihapus akan hilang dari semua skema!", 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#182D4A', 
      confirmButtonText: 'Ya, Hapus' 
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/persyaratan/${id_persyaratan}`);
        Swal.fire('Terhapus!', 'Data master berhasil dihapus.', 'success');
        fetchAllData();
      } catch (error) {
        Swal.fire('Gagal', 'Gagal menghapus data master', 'error');
      }
    }
  };

  const filteredMaster = masterData.filter(item => item.nama_persyaratan.toLowerCase().includes(searchMaster.toLowerCase()));
  const availableToAttach = masterData.filter(m => !attachedData.some(a => a.id_persyaratan === m.id_persyaratan));

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <button
                onClick={() => navigate('/admin/skema')}
                className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#182D4A]/70 transition-colors hover:text-[#CC6B27]"
              >
                <ArrowLeft size={16} />
                Kembali ke Data Skema
              </button>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                Kelola Persyaratan Skema
              </h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Skema: <span className="font-bold text-[#CC6B27]">{skemaDetail?.kode_skema || 'Memuat...'}</span> {skemaDetail?.judul_skema ? `- ${skemaDetail.judul_skema}` : ''}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">Terpasang</p>
                <p className="mt-1 text-2xl font-black text-[#071E3D] leading-none">{attachedData.length}</p>
              </div>
              <div className="rounded-xl border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">Master Data</p>
                <p className="mt-1 text-2xl font-black text-[#CC6B27] leading-none">{masterData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#071E3D]/10 bg-white py-20 shadow-sm">
            <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
            <p className="mt-4 text-[13px] font-bold text-[#071E3D]">Memuat Persyaratan...</p>
          </div>
        ) : (
          <>
            {/* MASTER DATA CARD (DIPINDAH KE ATAS) */}
            <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#071E3D]/10 bg-[#FAFAFA]/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                    <FileCheck size={18} className="text-[#CC6B27]" />
                    Master Data Persyaratan
                  </h4>
                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola daftar master persyaratan yang dapat digunakan oleh semua skema.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors focus-within:text-[#CC6B27]" />
                    <input
                      type="text"
                      placeholder="Cari master..."
                      value={searchMaster}
                      onChange={(e) => setSearchMaster(e.target.value)}
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-white py-2 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setFormMaster({nama_persyaratan:'', jenis_persyaratan:'dasar', keterangan:''});
                      setIsEditMaster(false);
                      setShowModalMaster(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f]"
                  >
                    <Plus size={16}/>
                    Tambah Master
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
                  <table className="w-full min-w-[820px] border-collapse bg-white text-left">
                    <thead>
                      <tr className="bg-[#071E3D]">
                        <th className="w-12 border-b-4 border-[#CC6B27] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nama Persyaratan</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Jenis</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMaster.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center">
                            <Layers size={44} className="mx-auto mb-3 text-[#071E3D]/20" />
                            <p className="text-[13px] font-medium text-[#182D4A]/60">
                              Master persyaratan tidak ditemukan.
                            </p>
                          </td>
                        </tr>
                      ) : filteredMaster.map((item, index) => (
                        <tr key={item.id_persyaratan} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                          <td className="px-4 py-3.5 text-center text-[13.5px] font-semibold text-[#071E3D]">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_persyaratan}</div>
                            <div className="mt-1 text-[12px] font-medium text-[#182D4A]/70">{item.keterangan || '-'}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-flex rounded-md border border-[#071E3D]/10 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#071E3D]">
                              {item.jenis_persyaratan}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditMaster(item)} className="inline-flex p-1.5 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] transition-all hover:bg-[#CC6B27] hover:text-white" title="Edit">
                                <Edit2 size={16}/>
                              </button>
                              <button onClick={() => handleDeleteMaster(item.id_persyaratan)} className="inline-flex p-1.5 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white" title="Hapus">
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
            </div>

            {/* ATTACHED CARD (DIPINDAH KE BAWAH) */}
            <div className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b border-[#071E3D]/10 p-6">
                <h2 className="text-[18px] font-black text-[#071E3D]">
                  Persyaratan Pada Skema Ini
                </h2>
                <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                  Tambahkan persyaratan dari master data lalu tentukan apakah wajib atau opsional.
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleAttach} className="mb-6 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                    <select 
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10"
                      value={attachForm.id_persyaratan}
                      onChange={(e) => setAttachForm({...attachForm, id_persyaratan: e.target.value})}
                    >
                      <option value="">-- Pilih Persyaratan dari Master Data --</option>
                      {availableToAttach.map(item => (
                        <option key={item.id_persyaratan} value={item.id_persyaratan}>
                          {item.nama_persyaratan} ({item.jenis_persyaratan})
                        </option>
                      ))}
                    </select>

                    <label htmlFor="wajibCheckbox" className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] select-none">
                      <input 
                        type="checkbox" 
                        id="wajibCheckbox" 
                        checked={attachForm.wajib} 
                        onChange={(e) => setAttachForm({...attachForm, wajib: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-[#CC6B27] focus:ring-[#CC6B27]"
                      />
                      Syarat Wajib
                    </label>

                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#071E3D] px-6 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#182D4A]">
                      <Plus size={16} />
                      Tambahkan
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
                  <table className="w-full min-w-[780px] border-collapse text-left bg-white">
                    <thead>
                      <tr className="bg-[#071E3D]">
                        <th className="w-12 border-b-4 border-[#CC6B27] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Persyaratan</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                        <th className="border-b-4 border-[#CC6B27] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachedData.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center">
                            <ShieldCheck size={44} className="mx-auto mb-3 text-[#071E3D]/20" />
                            <p className="text-[13px] font-medium text-[#182D4A]/60">
                              Belum ada persyaratan di skema ini.
                            </p>
                          </td>
                        </tr>
                      ) : attachedData.map((item, index) => (
                        <tr key={item.id_persyaratan} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                          <td className="px-4 py-3.5 text-center text-[13.5px] font-semibold text-[#071E3D]">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-[13.5px] font-bold text-[#071E3D]">{item.nama_persyaratan}</div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                              {item.jenis_persyaratan}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              item.skema_persyaratan?.wajib 
                                ? 'border-green-200 bg-green-50 text-green-700' 
                                : 'border-[#071E3D]/10 bg-slate-50 text-slate-600'
                            }`}>
                              {item.skema_persyaratan?.wajib ? 'Wajib' : 'Opsional'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <button onClick={() => handleDetach(item.id_persyaratan)} className="inline-flex p-1.5 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white" title="Lepas dari Skema">
                              <Unlink size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODAL MASTER */}
        {showModalMaster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                    {isEditMaster ? <Edit2 size={20}/> : <Plus size={20}/>}
                  </div>
                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                      {isEditMaster ? 'Edit Master Persyaratan' : 'Tambah Master Persyaratan'}
                    </h3>
                  </div>
                </div>

                <button onClick={() => setShowModalMaster(false)} className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]">
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleSubmitMaster} className="space-y-5 p-6">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">Nama Persyaratan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formMaster.nama_persyaratan}
                    onChange={(e) => setFormMaster({...formMaster, nama_persyaratan: e.target.value})}
                    required
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">Jenis Persyaratan <span className="text-red-500">*</span></label>
                  <select
                    value={formMaster.jenis_persyaratan}
                    onChange={(e) => setFormMaster({...formMaster, jenis_persyaratan: e.target.value})}
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  >
                    <option value="dasar">Dasar</option>
                    <option value="administratif">Administratif</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-[#071E3D]">Keterangan</label>
                  <textarea
                    rows="3"
                    value={formMaster.keterangan}
                    onChange={(e) => setFormMaster({...formMaster, keterangan: e.target.value})}
                    className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 pt-5">
                  <button type="button" onClick={() => setShowModalMaster(false)} className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]">
                    Batal
                  </button>

                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f]">
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

export default SkemaPersyaratan;