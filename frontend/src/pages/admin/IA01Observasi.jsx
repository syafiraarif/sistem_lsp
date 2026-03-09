import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { Plus, Trash2, X, Save, Loader2, ClipboardList, FileText, Filter } from 'lucide-react';

const IA01Observasi = () => {
  // State Utama
  const [dataList, setDataList] = useState([]);
  const [unitList, setUnitList] = useState([]); 
  const [selectedUnitId, setSelectedUnitId] = useState(""); // Menggantikan searchQuery teks manual
  
  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    id_unit: "",
    id_kuk: "",
    elemen: "",
    kuk: "",
    urutan: ""
  });

  // 1. Fetch Semua Unit Kompetensi saat komponen dimount (Untuk Dropdown Filter & Modal)
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

  // 2. Fetch Data Observasi otomatis ketika Unit Kompetensi dipilih dari Dropdown
  useEffect(() => {
    if (selectedUnitId) {
      fetchDataByUnit(selectedUnitId);
    } else {
      setDataList([]); // Kosongkan tabel jika tidak ada unit yang dipilih
    }
  }, [selectedUnitId]);

  const fetchDataByUnit = async (id) => {
    setFetching(true);
    try {
      const response = await api.get(`/admin/ia01-observasi/unit/${id}`);
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

  // 3. Submit Data Baru via Modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_unit) return Swal.fire({ title: 'Peringatan', text: 'Pilih Unit Kompetensi terlebih dahulu.', icon: 'warning', confirmButtonColor: '#CC6B27' });

    try {
      setLoading(true);
      const payload = {
        id_unit: parseInt(formData.id_unit, 10),
        id_kuk: formData.id_kuk ? parseInt(formData.id_kuk, 10) : null,
        elemen: formData.elemen,
        kuk: formData.kuk,
        urutan: parseInt(formData.urutan, 10)
      };

      await api.post("/admin/ia01-observasi", payload);
      
      Swal.fire({ title: 'Berhasil', text: 'Data observasi ditambahkan!', icon: 'success', confirmButtonColor: '#CC6B27' });
      setFormData({ id_unit: "", id_kuk: "", elemen: "", kuk: "", urutan: "" });
      setShowModal(false);
      
      // Jika data yang baru ditambah sesuai dengan unit yang sedang dipilih, otomatis refresh tabel
      if (selectedUnitId === payload.id_unit.toString()) {
        fetchDataByUnit(selectedUnitId);
      } else {
        // Otomatis pindah filter ke unit yang baru ditambahkan
        setSelectedUnitId(payload.id_unit.toString()); 
      }

    } catch (err) {
      Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Gagal menambah data', icon: 'error', confirmButtonColor: '#CC6B27' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Data
  const handleDelete = async (id_observasi) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data observasi ini akan dihapus secara permanen!",
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', cancelButtonColor: '#182D4A', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setFetching(true);
        await api.delete(`/admin/ia01-observasi/${id_observasi}`);
        Swal.fire({ title: 'Terhapus!', text: 'Data berhasil dihapus.', icon: 'success', confirmButtonColor: '#CC6B27' });
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
            <ClipboardList size={24} className="text-[#CC6B27]"/> Data IA.01 Observasi
          </h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola instrumen observasi langsung untuk asesi berdasarkan Unit Kompetensi</p>
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
            <Plus size={18} /> Tambah Observasi Baru
          </button>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">Urutan</th>
                <th className="px-4 py-3.5 text-center">ID KUK</th>
                <th className="px-4 py-3.5">Elemen</th>
                <th className="px-4 py-3.5">KUK</th>
                <th className="px-4 py-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {fetching ? (
                 <tr>
                    <td colSpan="5" className="text-center py-16">
                        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                        <p className="text-[#182D4A] font-medium text-[14px]">Memuat data observasi...</p>
                    </td>
                </tr>
              ) : dataList.length > 0 ? (
                dataList.map((item) => (
                  <tr key={item.id_observasi} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-[#071E3D] text-[13.5px]">{item.urutan}</td>
                    <td className="px-4 py-4 text-center text-[#182D4A] font-mono text-[13px]">{item.id_kuk || "-"}</td>
                    <td className="px-4 py-4 text-[#182D4A] text-[13px] font-medium leading-relaxed">{item.elemen}</td>
                    <td className="px-4 py-4 text-[#182D4A] text-[13px] font-medium leading-relaxed">{item.kuk}</td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(item.id_observasi)} 
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
                  <td colSpan="5" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">
                        {!selectedUnitId 
                          ? "Silakan pilih Unit Kompetensi di atas terlebih dahulu." 
                          : "Belum ada data observasi untuk Unit Kompetensi ini."}
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
                <Plus size={20} className="text-[#CC6B27]"/> Tambah Observasi Baru
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="observasiForm" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Pilih Unit Kompetensi <span className="text-red-500">*</span></label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">ID KUK (Opsional)</label>
                    <input type="number" name="id_kuk" value={formData.id_kuk} onChange={handleChange} placeholder="Kosongkan jika tidak ada" className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Urutan <span className="text-red-500">*</span></label>
                    <input type="number" name="urutan" value={formData.urutan} onChange={handleChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Elemen <span className="text-red-500">*</span></label>
                  <textarea name="elemen" value={formData.elemen} onChange={handleChange} className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none" rows="2" required></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Kriteria Unjuk Kerja (KUK) <span className="text-red-500">*</span></label>
                  <textarea name="kuk" value={formData.kuk} onChange={handleChange} className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none" rows="3" required></textarea>
                </div>
              </form>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="observasiForm" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px] disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IA01Observasi;