import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader2, CheckCircle2, XCircle, List, Settings } from 'lucide-react';

const BankSoalPG = () => {
  const [loading, setLoading] = useState(false);
  
  // State untuk Pilihan Soal
  const [soalList, setSoalList] = useState([]);
  const [activeSoal, setActiveSoal] = useState(null); 

  // State untuk Pengelolaan Pilihan Jawaban (Opsi)
  const [opsiList, setOpsiList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State form sesuai model bank_soal_pg_opsi
  const [formData, setFormData] = useState({
    opsi_label: "A",
    isi_opsi: "",
    is_benar: false,
  });

  useEffect(() => {
    fetchSoalList();
  }, []);

  useEffect(() => {
    if (activeSoal) fetchOpsi(activeSoal.id_soal);
  }, [activeSoal]);

  // --- FETCH DATA API ---
  const fetchSoalList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bank-soal');
      // Hanya filter soal yang berjenis Pilihan Ganda
      const data = res.data?.data || res.data || [];
      const soalPG = data.filter(s => s.jenis === "IA05_pg");
      setSoalList(soalPG);
    } catch (error) {
      Swal.fire('Error', 'Gagal mengambil daftar soal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpsi = async (id_soal) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bank-soal-pg/${id_soal}`);
      setOpsiList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching opsi:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (opsi = null) => {
    if (opsi) {
      setEditingId(opsi.id_opsi);
      setFormData({
        opsi_label: opsi.opsi_label,
        isi_opsi: opsi.isi_opsi,
        is_benar: opsi.is_benar,
      });
    } else {
      setEditingId(null);
      setFormData({
        opsi_label: "A",
        isi_opsi: "",
        is_benar: false,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.isi_opsi || !formData.opsi_label) {
      return Swal.fire('Peringatan', 'Silakan isi label dan teks jawaban!', 'warning');
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/admin/bank-soal-pg/${editingId}`, formData);
        Swal.fire('Berhasil', 'Pilihan jawaban diperbarui', 'success');
      } else {
        const payload = { ...formData, id_soal: activeSoal.id_soal };
        await api.post('/admin/bank-soal-pg', payload);
        Swal.fire('Berhasil', 'Pilihan jawaban ditambahkan', 'success');
      }
      closeModal();
      fetchOpsi(activeSoal.id_soal);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id_opsi) => {
    const confirm = await Swal.fire({
      title: 'Hapus Jawaban?',
      text: "Data ini tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/admin/bank-soal-pg/${id_opsi}`);
        Swal.fire('Terhapus!', 'Pilihan jawaban berhasil dihapus.', 'success');
        fetchOpsi(activeSoal.id_soal);
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus jawaban', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- RENDER VIEW 1: DAFTAR SOAL (Jika soal belum dipilih) ---
  if (!activeSoal) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#CC6B27]/10 p-3 rounded-xl">
              <List className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#071E3D]">Pilih Soal Pilihan Ganda (PG)</h1>
              <p className="text-slate-500 text-sm">Pilih soal di bawah untuk mulai mengelola jawaban (A, B, C, D).</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soalList.map((soal) => (
              <div key={soal.id_soal} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#CC6B27]/50 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#CC6B27] mb-2 border border-[#CC6B27]/20 bg-[#CC6B27]/5 inline-block px-2 py-1 rounded">
                    ID Soal: {soal.id_soal}
                  </div>
                  <p className="text-[#071E3D] font-medium text-sm line-clamp-3">
                    {soal.pertanyaan}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveSoal(soal)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#071E3D] hover:bg-[#182D4A] text-white py-2 rounded-lg text-sm font-bold transition-all"
                >
                  <Settings size={16} /> Kelola Jawaban PG
                </button>
              </div>
            ))}
            {soalList.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">
                Belum ada soal Pilihan Ganda. Silakan tambah soal di menu "Bank Soal" terlebih dahulu.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- RENDER VIEW 2: PENGELOLAAN JAWABAN (Opsi) UNTUK SOAL YANG DIPILIH ---
  return (
    <div className="p-6 bg-slate-50 min-h-screen relative">
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveSoal(null)}
            className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-white mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Soal
          </button>
          <h1 className="text-2xl font-black mb-2">Jawaban Pilihan Ganda</h1>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10 mt-4">
            <span className="text-[#CC6B27] font-bold text-xs uppercase tracking-wider mb-1 block">Pertanyaan:</span>
            <p className="text-white text-sm font-medium leading-relaxed">
              {activeSoal.pertanyaan}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#071E3D]">Daftar Jawaban (A, B, C, D)</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#CC6B27] hover:bg-[#a8561f] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all"
          >
            <Plus size={18} /> Tambah Jawaban
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-[#CC6B27]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opsiList.length > 0 ? opsiList.map((opsi) => (
              <div 
                key={opsi.id_opsi} 
                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  opsi.is_benar ? "border-green-500 bg-green-50/50" : "border-slate-200 bg-white hover:border-[#CC6B27]/50"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg ${
                      opsi.is_benar ? "bg-green-500 text-white" : "bg-[#071E3D] text-white"
                    }`}>
                      {opsi.opsi_label}
                    </span>
                    {opsi.is_benar ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={14} /> Jawaban Benar
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                        <XCircle size={14} /> Salah
                      </span>
                    )}
                  </div>
                  <p className="text-[#071E3D] text-sm mb-4 leading-relaxed line-clamp-3">
                    {opsi.isi_opsi}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100/50 mt-auto">
                  <button onClick={() => openModal(opsi)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(opsi.id_opsi)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada jawaban untuk soal ini.
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#071E3D] p-5 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                {editingId ? <Edit2 size={18}/> : <Plus size={18}/>} 
                {editingId ? "Edit Jawaban" : "Tambah Jawaban"}
              </h2>
              <button onClick={closeModal} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Label (A/B/C/D)</label>
                <select name="opsi_label" value={formData.opsi_label} onChange={handleInputChange} className="w-full p-2.5 rounded-lg border border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none text-sm font-medium">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#182D4A] mb-1.5">Teks Jawaban</label>
                <textarea name="isi_opsi" value={formData.isi_opsi} onChange={handleInputChange} required rows="4" className="w-full p-2.5 rounded-lg border border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 outline-none text-sm" placeholder="Ketik teks jawaban di sini..."/>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mt-2 cursor-pointer" onClick={() => setFormData(prev => ({...prev, is_benar: !prev.is_benar}))}>
                <input type="checkbox" name="is_benar" checked={formData.is_benar} onChange={handleInputChange} onClick={(e) => e.stopPropagation()} className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded cursor-pointer"/>
                <label className="text-[13px] font-bold text-green-800 cursor-pointer select-none flex-1">
                  Tandai ini sebagai Kunci Jawaban (Benar)
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-sm disabled:opacity-70">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoalPG;