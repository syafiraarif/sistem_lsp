import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { Plus, Trash2, X, Save, Loader2, MessageCircleQuestion, FileText, Filter } from 'lucide-react';

const IA03Pertanyaan = () => {
  // State Utama
  const [dataList, setDataList] = useState([]);
  const [unitList, setUnitList] = useState([]); 
  const [selectedUnitId, setSelectedUnitId] = useState("");
  
  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    id_unit: "",
    pertanyaan: ""
  });

  // 1. Ambil data Unit Kompetensi untuk dropdown filter dan form modal
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get("/admin/unit-kompetensi");
        setUnitList(response.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data Unit Kompetensi");
      }
    };
    fetchUnits();
  }, []);

  // 2. Tampilkan data otomatis berdasarkan Dropdown Unit Kompetensi yang dipilih
  useEffect(() => {
    if (selectedUnitId) {
        fetchDataByUnit(selectedUnitId);
    } else {
        setDataList([]);
    }
  }, [selectedUnitId]);

  const fetchDataByUnit = async (id) => {
    setFetching(true);
    try {
      const response = await api.get(`/admin/ia03-pertanyaan/unit/${id}`);
      setDataList(response.data.data || []);
    } catch (err) {
      setDataList([]);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Tambah Pertanyaan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_unit) return Swal.fire({ title: 'Peringatan', text: 'Pilih Unit Kompetensi terlebih dahulu.', icon: 'warning', confirmButtonColor: '#CC6B27' });

    try {
      setLoading(true);
      const payload = {
        id_unit: parseInt(formData.id_unit, 10),
        pertanyaan: formData.pertanyaan
      };

      await api.post("/admin/ia03-pertanyaan", payload);
      
      Swal.fire({ title: 'Berhasil', text: 'Pertanyaan berhasil ditambahkan!', icon: 'success', confirmButtonColor: '#CC6B27' });
      setFormData({ id_unit: "", pertanyaan: "" }); 
      setShowModal(false);
      
      // Auto refresh table or set unit id dropdown to the newly added item's unit
      if (selectedUnitId === payload.id_unit.toString()) {
        fetchDataByUnit(selectedUnitId);
      } else {
        setSelectedUnitId(payload.id_unit.toString());
      }

    } catch (err) {
        Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Gagal menambah data', icon: 'error', confirmButtonColor: '#CC6B27' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Hapus Pertanyaan
  const handleDelete = async (id_ia03) => {
    const result = await Swal.fire({
      title: 'Hapus Pertanyaan?',
      text: "Pertanyaan ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#182D4A',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
          setFetching(true);
          await api.delete(`/admin/ia03-pertanyaan/${id_ia03}`);
          Swal.fire({ title: 'Terhapus!', text: 'Pertanyaan berhasil dihapus.', icon: 'success', confirmButtonColor: '#CC6B27' });
          fetchDataByUnit(selectedUnitId); 
        } catch (err) {
          Swal.fire({ title: 'Gagal', text: 'Gagal menghapus data', icon: 'error', confirmButtonColor: '#CC6B27' });
          setFetching(false);
        }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            <MessageCircleQuestion size={24} className="text-[#CC6B27]"/> Data IA.03 Pertanyaan
          </h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola instrumen pertanyaan lisan/tertulis berdasarkan Unit Kompetensi</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* TOOLBAR: FILTER DROPDOWN & TOMBOL TAMBAH */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
          
          <div className="w-full md:flex-1 relative group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-[#071E3D]/10">
                    <Filter size={18} className="text-[#CC6B27]" />
                </div>
                <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full md:max-w-md p-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] transition-all text-[13px] font-bold appearance-none cursor-pointer"
                >
                    <option value="">-- Pilih Unit Kompetensi untuk melihat data --</option>
                    {unitList.map((unit) => (
                    <option key={unit.id_unit} value={unit.id_unit}>
                        {unit.kode_unit} - {unit.judul_unit}
                    </option>
                    ))}
                </select>
            </div>
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="w-full md:w-auto px-4 py-2.5 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 text-[13px]"
          >
            <Plus size={18} /> Tambah Pertanyaan
          </button>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">No.</th>
                <th className="px-4 py-3.5">Pertanyaan</th>
                <th className="px-4 py-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {fetching ? (
                 <tr>
                    <td colSpan="3" className="text-center py-16">
                        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                        <p className="text-[#182D4A] font-medium text-[14px]">Memuat data pertanyaan...</p>
                    </td>
                </tr>
              ) : dataList.length > 0 ? (
                dataList.map((item, index) => (
                  <tr key={item.id_ia03} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-[#071E3D] text-[13.5px]">{(index + 1)}</td>
                    <td className="px-4 py-4 text-[#182D4A] text-[13.5px] font-medium leading-relaxed whitespace-pre-wrap">{item.pertanyaan}</td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(item.id_ia03)} 
                        className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors mx-auto flex"
                        title="Hapus Data"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">
                        {!selectedUnitId 
                          ? "Silakan pilih Unit Kompetensi di atas terlebih dahulu." 
                          : "Belum ada data pertanyaan untuk Unit Kompetensi ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH DATA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                 <Plus size={20} className="text-[#CC6B27]"/> Tambah Pertanyaan Baru
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="pertanyaanForm" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Pilih Unit Kompetensi <span className="text-red-500">*</span></label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Unit Kompetensi --</option>
                    {unitList.map((unit) => (
                      <option key={unit.id_unit} value={unit.id_unit}>
                        {unit.kode_unit} - {unit.judul_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Isi Pertanyaan <span className="text-red-500">*</span></label>
                  <textarea 
                    name="pertanyaan" 
                    value={formData.pertanyaan} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none" 
                    rows="4" 
                    required
                    placeholder="Tuliskan pertanyaan disini..."
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="pertanyaanForm" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px] disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IA03Pertanyaan;