import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Database, Plus, Edit2, Trash2, X, Save, Loader2, Filter, Settings, FileText } from 'lucide-react';

const BankSoal = () => {
  const [soalList, setSoalList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State form mengikut model bank_soal
  const [formData, setFormData] = useState({
    id_unit: "",
    jenis: "IA05_pg",
    pertanyaan: "",
    tingkat_kesulitan: "sedang",
    status: "aktif",
  });

  const [filterUnit, setFilterUnit] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  useEffect(() => {
    fetchSoal();
    fetchUnits();
  }, []);

  // --- FETCH DATA ---
  const fetchSoal = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bank-soal');
      setSoalList(res.data?.data || res.data || []);
    } catch (error) {
      Swal.fire({ title: "Ralat", text: "Gagal mengambil data soal", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get('/admin/unit-kompetensi');
      setUnitList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Gagal mengambil data unit:", error);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (soal = null) => {
    if (soal) {
      setEditingId(soal.id_soal);
      setFormData({
        id_unit: soal.id_unit,
        jenis: soal.jenis,
        pertanyaan: soal.pertanyaan,
        tingkat_kesulitan: soal.tingkat_kesulitan,
        status: soal.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        id_unit: unitList.length > 0 ? unitList[0].id_unit : "",
        jenis: "IA05_pg",
        pertanyaan: "",
        tingkat_kesulitan: "sedang",
        status: "aktif",
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
    if (!formData.id_unit || !formData.pertanyaan) {
      return Swal.fire("Amaran", "Sila lengkapkan semua ruang yang wajib", "warning");
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/admin/bank-soal/${editingId}`, formData);
        Swal.fire("Berjaya", "Soal berjaya dikemas kini", "success");
      } else {
        await api.post('/admin/bank-soal', formData);
        Swal.fire("Berjaya", "Soal baharu berjaya ditambah", "success");
      }
      closeModal();
      fetchSoal();
    } catch (error) {
      Swal.fire("Ralat", error.response?.data?.message || "Berlaku ralat sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Soal?",
      text: "Data ini tidak boleh dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/admin/bank-soal/${id}`);
        Swal.fire("Dihapus!", "Soal berjaya dihapuskan.", "success");
        fetchSoal();
      } catch (error) {
        Swal.fire("Ralat", "Gagal menghapus soal", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- FILTERING ---
  const filteredSoal = soalList.filter(soal => {
    const matchUnit = filterUnit ? soal.id_unit.toString() === filterUnit : true;
    const matchJenis = filterJenis ? soal.jenis === filterJenis : true;
    return matchUnit && matchJenis;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-[#071E3D] rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <Database className="text-[#CC6B27]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">Bank Soal Uji</h1>
              <p className="text-[#FAFAFA]/70 text-sm">Kelola data pertanyaan untuk ujian (Pilihan Ganda, Esei, Lisan, Wawancara)</p>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#CC6B27] hover:bg-[#a8561f] px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-[#CC6B27]/30"
          >
            <Plus size={18} /> Tambah Soal
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter size={18} /> <span className="text-sm">Filter:</span>
        </div>
        <select 
          className="w-full md:w-auto p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27]"
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
        >
          <option value="">Semua Unit Kompetensi</option>
          {unitList.map(u => (
            <option key={u.id_unit} value={u.id_unit}>{u.kode_unit} - {u.judul_unit}</option>
          ))}
        </select>
        <select 
          className="w-full md:w-auto p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#CC6B27]"
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
        >
          <option value="">Semua Jenis Soal</option>
          <option value="IA05_pg">IA.05 Pilihan Ganda</option>
          <option value="IA06_essay">IA.06 Esei</option>
          <option value="IA07_lisan">IA.07 Lisan</option>
          <option value="IA09_wawancara">IA.09 Wawancara</option>
        </select>
      </div>

      {/* LIST SOAL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#CC6B27]" size={40} />
          </div>
        ) : filteredSoal.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p>Belum ada data soal ujian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Unit</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Jenis & Kesulitan</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Pertanyaan</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSoal.map((soal) => (
                  <tr key={soal.id_soal} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-700">#{soal.id_soal}</td>
                    <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={soal.unit_kompetensi?.judul_unit}>
                      {soal.unit_kompetensi ? soal.unit_kompetensi.kode_unit : soal.id_unit}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-[#071E3D] bg-blue-50 py-1 px-2 rounded-md inline-block w-max">
                          {soal.jenis.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-max ${
                          soal.tingkat_kesulitan === 'mudah' ? 'bg-green-100 text-green-700' :
                          soal.tingkat_kesulitan === 'sedang' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {soal.tingkat_kesulitan.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700 max-w-md">
                      <div className="line-clamp-2">{soal.pertanyaan}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${soal.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {soal.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(soal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(soal.id_soal)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#071E3D] p-5 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                {editingId ? <Edit2 size={18}/> : <Plus size={18}/>} 
                {editingId ? "Edit Bank Soal" : "Tambah Bank Soal"}
              </h2>
              <button onClick={closeModal} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="soalForm" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Unit Kompetensi</label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    required
                  >
                    <option value="">-- Pilih Unit Kompetensi --</option>
                    {unitList.map(u => (
                      <option key={u.id_unit} value={u.id_unit}>{u.kode_unit} - {u.judul_unit}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Jenis Soal</label>
                    <select
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    >
                      <option value="IA05_pg">IA.05 Pilihan Ganda</option>
                      <option value="IA06_essay">IA.06 Esei</option>
                      <option value="IA07_lisan">IA.07 Lisan</option>
                      <option value="IA09_wawancara">IA.09 Wawancara</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Tingkat Kesulitan</label>
                    <select
                      name="tingkat_kesulitan"
                      value={formData.tingkat_kesulitan}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Pertanyaan</label>
                  <textarea
                    name="pertanyaan"
                    value={formData.pertanyaan}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
                    placeholder="Taip pertanyaan di sini..."
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-1/2">
                  <label className="text-[13px] font-bold text-[#071E3D]">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Tidak Aktif</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="soalForm" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoal;