import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Save, Loader2, Building2, ArrowLeft, Link as LinkIcon, Unlink
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
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/skema')} className="p-2 bg-[#FAFAFA] text-[#182D4A] rounded-lg border border-[#071E3D]/10 hover:bg-[#E2E8F0] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#071E3D] m-0 mb-1">Persyaratan TUK (Perlengkapan)</h2>
            <p className="text-[13px] text-[#182D4A] m-0 font-medium">
              Skema: <span className="text-[#CC6B27] font-bold">{skemaDetail?.kode_skema || 'Memuat...'}</span> - {skemaDetail?.judul_skema || ''}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 bg-white rounded-xl border border-[#071E3D]/10"><Loader2 className="animate-spin text-[#CC6B27]" size={36} /></div>
      ) : (
        <>
          {/* TABEL ANAKAN */}
          <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 border-t-4 border-t-[#CC6B27]">
            <h3 className="text-[16px] font-bold text-[#071E3D] mb-4 flex items-center gap-2">
              <LinkIcon size={18} className="text-[#CC6B27]"/> Perlengkapan Pada Skema Ini
            </h3>
            
            <form onSubmit={handleAttach} className="flex flex-col md:flex-row gap-4 mb-6 bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
              <div className="flex-1">
                <select className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] text-[13px] font-medium focus:outline-none focus:border-[#CC6B27] bg-white" value={attachFormId} onChange={(e) => setAttachFormId(e.target.value)}>
                  <option value="">-- Pilih Perlengkapan dari Master Data --</option>
                  {availableToAttach.map(item => (
                    <option key={item.id_persyaratan_tuk} value={item.id_persyaratan_tuk}>{item.nama_perlengkapan}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#071E3D] text-[#FAFAFA] hover:bg-[#182D4A] shadow-sm text-[13px] flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Tambahkan
              </button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Perlengkapan</th>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {attachedData.length === 0 ? (
                    <tr><td colSpan="3" className="py-8 text-center text-[#182D4A] text-[13px] bg-white">Belum ada perlengkapan di skema ini.</td></tr>
                  ) : attachedData.map((item, index) => (
                    <tr key={item.id_persyaratan_tuk} className="border-b border-[#071E3D]/5 bg-white hover:bg-[#CC6B27]/5">
                      <td className="py-3 px-4 text-center text-[13px] text-[#071E3D] font-semibold">{index + 1}</td>
                      <td className="py-3 px-4 text-[13.5px] font-bold text-[#071E3D]">{item.nama_perlengkapan}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleDetach(item.id_persyaratan_tuk)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white border border-red-100 transition-colors" title="Lepas dari Skema"><Unlink size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL INDUK */}
          <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
                <Building2 size={18} className="text-[#CC6B27]"/> Master Data Perlengkapan TUK
              </h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50" />
                  <input type="text" placeholder="Cari master..." value={searchMaster} onChange={(e) => setSearchMaster(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#071E3D]/20 text-[13px] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27]"/>
                </div>
                <button onClick={() => { setFormMaster({nama_perlengkapan:'', spesifikasi:''}); setIsEditMaster(false); setShowModalMaster(true); }} className="px-4 py-2.5 bg-[#CC6B27] text-white rounded-lg font-bold text-[13px] hover:bg-[#a8561f] flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                  <Plus size={16}/> Master
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
              <table className="w-full text-left border-collapse min-w-max bg-white">
                <thead>
                  <tr>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Perlengkapan</th>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Spesifikasi</th>
                    <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaster.map((item, index) => (
                    <tr key={item.id_persyaratan_tuk} className="border-b border-[#071E3D]/5 bg-white hover:bg-[#CC6B27]/5">
                      <td className="py-3 px-4 text-center text-[13px] text-[#071E3D] font-semibold">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-[#071E3D] text-[13.5px]">{item.nama_perlengkapan}</td>
                      <td className="py-3 px-4 text-[12px] text-[#182D4A]/80">{item.spesifikasi || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => handleEditMaster(item)} className="p-1.5 text-[#CC6B27] bg-[#CC6B27]/10 rounded hover:bg-[#CC6B27] hover:text-white transition-colors"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeleteMaster(item.id_persyaratan_tuk)} className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL MASTER DATA */}
      {showModalMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[16px] font-bold text-[#071E3D]">{isEditMaster ? 'Edit Master Perlengkapan' : 'Tambah Master Perlengkapan'}</h3>
              <button onClick={() => setShowModalMaster(false)} className="text-[#182D4A] hover:text-[#CC6B27]"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitMaster} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Nama Perlengkapan</label>
                <input type="text" value={formMaster.nama_perlengkapan} onChange={(e) => setFormMaster({...formMaster, nama_perlengkapan: e.target.value})} required className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] focus:border-[#CC6B27] bg-[#FAFAFA] focus:bg-white outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Spesifikasi</label>
                <textarea rows="3" value={formMaster.spesifikasi} onChange={(e) => setFormMaster({...formMaster, spesifikasi: e.target.value})} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[13px] focus:border-[#CC6B27] bg-[#FAFAFA] focus:bg-white outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#071E3D]/10">
                <button type="button" onClick={() => setShowModalMaster(false)} className="px-4 py-2.5 bg-[#FAFAFA] text-[#182D4A] border border-[#071E3D]/20 rounded-lg font-bold text-[13px] hover:bg-[#E2E8F0]">Batal</button>
                <button type="submit" className="px-4 py-2.5 bg-[#CC6B27] text-white rounded-lg font-bold text-[13px] flex items-center gap-1.5 shadow-sm hover:shadow-md"><Save size={16}/> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkemaPersyaratanTuk;