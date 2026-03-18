import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';

const BankSoalPG = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idSoalQuery = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [activeSoal, setActiveSoal] = useState(null); 
  const [opsiList, setOpsiList] = useState([]);
  
  // State form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    opsi_label: "A",
    isi_opsi: "",
    is_benar: false,
  });

  useEffect(() => {
    // Jika user mengakses halaman ini tanpa ID soal dari bank-soal
    if (!idSoalQuery) {
      Swal.fire("Perhatian", "Tidak ada soal yang dipilih. Anda akan dialihkan kembali.", "warning")
        .then(() => navigate('/admin/bank-soal'));
      return;
    }

    fetchSoalDetail(idSoalQuery);
    fetchOpsi(idSoalQuery);
  }, [idSoalQuery, navigate]);

  // Mengambil detail soal spesifik
  const fetchSoalDetail = async (id) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bank-soal');
      const data = res.data?.data || res.data || [];
      
      // Cari soal berdasarkan ID
      const foundSoal = data.find(s => String(s.id_soal) === String(id));
      
      if (foundSoal) {
        setActiveSoal(foundSoal);
      } else {
        Swal.fire("Error", "Data soal tidak ditemukan!", "error")
          .then(() => navigate('/admin/bank-soal'));
      }
    } catch (error) {
      console.error("Gagal memuat detail soal:", error);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      opsi_label: "A",
      isi_opsi: "",
      is_benar: false,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleEdit = (opsi) => {
    setEditingId(opsi.id_opsi);
    setFormData({
      opsi_label: opsi.opsi_label,
      isi_opsi: opsi.isi_opsi,
      is_benar: opsi.is_benar,
    });
    setModalOpen(true);
  };

  // ==========================================
  // --- BLOK FUNGSI VALIDASI ---
  // ==========================================
  const validateForm = () => {
    // 1. Validasi Anti-Duplikat Label (A/B/C/D/E)
    // Cek apakah ada opsi lain (yang bukan sedang diedit) dengan label yang sama
    const isDuplicate = opsiList.some(
      (opsi) => opsi.opsi_label === formData.opsi_label && opsi.id_opsi !== editingId
    );

    if (isDuplicate) {
      return `Pilihan dengan label "${formData.opsi_label}" sudah ada! Silakan pilih label yang lain.`;
    }

    // 2. Validasi Minimal Karakter
    const isi = String(formData.isi_opsi).trim();
    if (!isi || isi.length < 4) {
      return `Teks pilihan jawaban terlalu pendek. Minimal harus 4 karakter!`;
    }
    return null;
  };

  // ==========================================
  // --- BLOK FUNGSI SIMPAN & KONFIRMASI ---
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeSoal) return;

    // 1. Jalankan Validasi
    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    // 2. Tampilkan Konfirmasi SweetAlert
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${editingId ? 'menyimpan perubahan' : 'menambahkan'} pilihan jawaban ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27", 
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      const payload = { ...formData, id_soal: activeSoal.id_soal };
      if (editingId) {
        await api.put(`/admin/bank-soal-pg/${editingId}`, payload);
        Swal.fire({ title: "Berhasil", text: "Pilihan jawaban diperbarui!", icon: "success", timer: 1500 });
      } else {
        await api.post('/admin/bank-soal-pg', payload);
        Swal.fire({ title: "Berhasil", text: "Pilihan jawaban ditambahkan!", icon: "success", timer: 1500 });
      }
      closeModal();
      fetchOpsi(activeSoal.id_soal);
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan pilihan jawaban", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // --- BLOK FUNGSI HAPUS & KONFIRMASI ---
  // ==========================================
  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin menghapus pilihan jawaban ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/bank-soal-pg/${id}`);
      Swal.fire({ title: "Terhapus", text: "Pilihan jawaban berhasil dibuang", icon: "success", timer: 1500 });
      fetchOpsi(activeSoal.id_soal);
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus pilihan jawaban", "error");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER KEMBALI */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/bank-soal')} 
          className="p-2.5 rounded-lg bg-white border border-[#071E3D]/20 text-[#182D4A] hover:text-[#CC6B27] hover:border-[#CC6B27]/30 transition-all shadow-sm"
          title="Kembali ke Bank Soal"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            Kelola Opsi Pilihan Ganda
          </h2>
          <p className="text-[14px] text-[#182D4A] m-0">Tambahkan atau edit opsi jawaban A, B, C, D untuk soal yang dipilih.</p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {!activeSoal ? (
        <div className="flex justify-center items-center py-20 bg-white border border-[#071E3D]/10 rounded-xl shadow-sm">
          <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#071E3D]/10 flex flex-col flex-1">
          
          {/* HEADER SOAL (Kotak Info) */}
          <div className="p-6 border-b border-[#071E3D]/10 bg-[#FAFAFA] rounded-t-xl flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#071E3D]/10 text-[#071E3D] uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
                <HelpCircle size={14} /> Pertanyaan Soal (Unit: {activeSoal.unit_kompetensi?.kode_unit || activeSoal.id_unit})
              </span>
              <h3 className="text-[16px] font-bold text-[#071E3D] leading-relaxed mt-2 border-l-4 border-[#CC6B27] pl-4">
                {activeSoal.pertanyaan}
              </h3>
            </div>
            <button 
              onClick={openModal} 
              className="w-full md:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-[13px] shrink-0 transition-colors"
            >
              <Plus size={16} /> Tambah Opsi Jawaban
            </button>
          </div>

          {/* DAFTAR OPSI */}
          <div className="p-6 bg-slate-50/50 flex-1">
            {loading && opsiList.length === 0 ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="animate-spin text-[#CC6B27] mb-2" size={32}/>
                <p className="text-sm text-slate-500">Memuat jawaban...</p>
              </div>
            ) : opsiList.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-[14px] border-2 border-dashed border-slate-200 rounded-xl bg-white">
                Belum ada pilihan jawaban (A/B/C/D) yang ditambahkan untuk soal ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opsiList.map(opsi => (
                  <div 
                    key={opsi.id_opsi} 
                    className={`p-5 rounded-xl border flex items-start gap-4 transition-all shadow-sm bg-white relative overflow-hidden
                      ${opsi.is_benar ? 'border-green-400 ring-4 ring-green-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {/* Badge Tanda Benar di Pojok (Opsional) */}
                    {opsi.is_benar && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        KUNCI JAWABAN
                      </div>
                    )}

                    <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl font-bold text-xl mt-1
                      ${opsi.is_benar ? 'bg-green-500 text-white shadow-md' : 'bg-slate-100 text-[#071E3D]'}`}>
                      {opsi.opsi_label}
                    </div>
                    
                    <div className="flex-1 pr-14 md:pr-0">
                      <p className="text-[14.5px] text-[#182D4A] font-medium leading-relaxed">{opsi.isi_opsi}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto md:absolute md:bottom-4 md:right-4 mt-4 md:mt-0">
                      <button onClick={() => handleEdit(opsi)} className="p-2 text-[#071E3D] hover:bg-slate-100 hover:text-[#CC6B27] rounded-lg transition-colors border border-transparent hover:border-slate-200 bg-slate-50">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(opsi.id_opsi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 bg-red-50/50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT OPSI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="font-bold text-[#071E3D]">{editingId ? "Edit Jawaban" : "Tambah Jawaban Baru"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="mb-4">
                <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Label Pilihan</label>
                <select name="opsi_label" value={formData.opsi_label} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-[#FAFAFA] focus:bg-white focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] outline-none text-[13px] font-bold">
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                  <option value="E">Pilihan E</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Teks Pilihan Jawaban</label>
                <textarea name="isi_opsi" rows="3" value={formData.isi_opsi} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-lg bg-[#FAFAFA] focus:bg-white focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] outline-none text-[13px] resize-none" placeholder="Ketik jawaban di sini..."/>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mt-2 cursor-pointer transition-colors hover:bg-green-100" onClick={() => setFormData(prev => ({...prev, is_benar: !prev.is_benar}))}>
                <input type="checkbox" name="is_benar" checked={formData.is_benar} onChange={handleInputChange} onClick={(e) => e.stopPropagation()} className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded cursor-pointer"/>
                <label className="text-[13px] font-bold text-green-800 cursor-pointer select-none flex-1">
                  Tandai ini sebagai Kunci Jawaban (Benar)
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[13px]">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70 transition-all">
                  {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan
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