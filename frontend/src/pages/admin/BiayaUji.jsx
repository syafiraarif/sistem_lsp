import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader2, DollarSign 
} from 'lucide-react';

const BiayaUji = () => {
  const { id } = useParams(); // id_skema
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [skemaDetail, setSkemaDetail] = useState(null);
  const [biayaList, setBiayaList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    jenis_biaya: 'uji_kompetensi',
    metode_uji: 'luring',
    nominal: '',
    keterangan: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil Info Skema
      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data?.data || resSkema.data);

      // Ambil Daftar Biaya Uji berdasarkan Skema
      const resBiaya = await api.get(`/admin/biaya-uji/skema/${id}`);
      let data = resBiaya.data?.data || resBiaya.data || [];
      if (!Array.isArray(data) && data.rows) data = data.rows;
      setBiayaList(data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      Swal.fire('Error', 'Gagal memuat data biaya uji', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setIsEdit(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setFormData({
      id_biaya: item.id_biaya,
      jenis_biaya: item.jenis_biaya,
      metode_uji: item.metode_uji,
      nominal: item.nominal,
      keterangan: item.keterangan || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        id_skema: parseInt(id)
      };

      if (isEdit) {
        await api.put(`/admin/biaya-uji/${formData.id_biaya}`, payload);
        Swal.fire('Berhasil', 'Data biaya berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/biaya-uji', payload);
        Swal.fire('Berhasil', 'Data biaya berhasil ditambahkan', 'success');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id_biaya) => {
    const confirm = await Swal.fire({
      title: 'Hapus Biaya?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/biaya-uji/${id_biaya}`);
        Swal.fire('Terhapus!', 'Data biaya berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  // Helper untuk format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
  };

  // Helper merapikan Enum
  const formatEnum = (text) => {
    if (!text) return '-';
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#CC6B27]" size={40} /></div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white">
        <button onClick={() => navigate('/admin/skema')} className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke List Skema
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl">
            <DollarSign className="text-[#CC6B27]" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black mb-1">Pengaturan Biaya Uji</h1>
            <p className="text-white/70 text-sm">
              Skema: {skemaDetail?.judul_skema || 'Memuat...'}
            </p>
          </div>
        </div>
      </div>

      {/* KONTEN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="font-bold text-[#071E3D] text-lg">Daftar Biaya</h2>
            <p className="text-xs text-slate-500 mt-0.5">Atur rincian biaya yang dibebankan kepada Asesi berdasarkan metodenya.</p>
          </div>
          <button onClick={handleAdd} className="bg-[#CC6B27] hover:bg-[#a8561f] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={16}/> Tambah Biaya
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#182D4A]">
                <th className="p-3 text-xs font-bold uppercase w-12 text-center">No</th>
                <th className="p-3 text-xs font-bold uppercase">Jenis Biaya</th>
                <th className="p-3 text-xs font-bold uppercase">Metode Uji</th>
                <th className="p-3 text-xs font-bold uppercase">Nominal</th>
                <th className="p-3 text-xs font-bold uppercase">Keterangan</th>
                <th className="p-3 text-xs font-bold uppercase text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {biayaList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Belum ada data biaya untuk skema ini.</td>
                </tr>
              ) : (
                biayaList.map((item, index) => (
                  <tr key={item.id_biaya} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-sm text-slate-500 font-medium">{index + 1}</td>
                    <td className="p-3 text-sm font-bold text-[#071E3D]">{formatEnum(item.jenis_biaya)}</td>
                    <td className="p-3 text-sm font-semibold text-slate-600">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] ${
                        item.metode_uji === 'daring' ? 'bg-blue-100 text-blue-700' : 
                        item.metode_uji === 'hybrid' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {formatEnum(item.metode_uji)}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-black text-[#CC6B27]">{formatRupiah(item.nominal)}</td>
                    <td className="p-3 text-xs text-slate-500">{item.keterangan || '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id_biaya)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#071E3D]">{isEdit ? 'Edit Biaya Uji' : 'Tambah Biaya Uji'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Jenis Biaya <span className="text-red-500">*</span></label>
                <select name="jenis_biaya" value={formData.jenis_biaya} onChange={handleInputChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27]">
                  <option value="uji_kompetensi">Uji Kompetensi</option>
                  <option value="pra_asesmen">Pra Asesmen</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Metode Uji <span className="text-red-500">*</span></label>
                <select name="metode_uji" value={formData.metode_uji} onChange={handleInputChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27]">
                  <option value="luring">Luring (Offline / Tatap Muka)</option>
                  <option value="daring">Daring (Online)</option>
                  <option value="hybrid">Hybrid (Campuran)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Nominal Biaya (Rp) <span className="text-red-500">*</span></label>
                <input type="number" name="nominal" value={formData.nominal} onChange={handleInputChange} required min="0" placeholder="Contoh: 1500000" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27]" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Keterangan (Opsional)</label>
                <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows="3" placeholder="Tambahkan catatan jika perlu..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27] resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#071E3D] hover:bg-[#182D4A] rounded-lg text-sm font-bold text-white flex items-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin"/> : <><Save size={16}/> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiayaUji;