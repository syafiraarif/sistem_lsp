import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { 
  Plus, Edit, Trash2, Save, X, BookOpen, Search, Loader2, List
} from 'lucide-react';

const UnitKompetensi = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [skkniList, setSkkniList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Mode Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State Form
  const [formData, setFormData] = useState({
    id_skkni: "",
    kode_unit: "",
    judul_unit: ""
  });

  // Load data awal
  useEffect(() => {
    fetchData();
    fetchSkkni();
  }, []);

  // Efek untuk Search Filter
  useEffect(() => {
    if (!dataList) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = dataList.filter(item => {
      const kode = item.kode_unit?.toLowerCase() || '';
      const judul = item.judul_unit?.toLowerCase() || '';
      const skkni = item.skkni?.judul_skkni?.toLowerCase() || '';
      return kode.includes(lowerTerm) || judul.includes(lowerTerm) || skkni.includes(lowerTerm);
    });
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/unit-kompetensi");
      const result = response.data.data || [];
      setDataList(result);
      setFilteredData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkkni = async () => {
    try {
      const response = await api.get("/admin/skkni");
      setSkkniList(response.data.data || []);
    } catch (err) {
      console.error("Gagal ambil SKKNI", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // --- LOGIKA TOMBOL SIMPAN / UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_skkni || !formData.kode_unit || !formData.judul_unit) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Mohon lengkapi semua field (SKKNI, Kode Unit, Judul Unit).",
        confirmButtonColor: "#CC6B27",
      });
      return;
    }

    const actionTitle = isEditing ? "Simpan Perubahan?" : "Tambah Data Baru?";
    const actionText = isEditing 
      ? "Apakah Anda yakin ingin menyimpan perubahan pada data ini?" 
      : "Apakah Anda yakin ingin menambahkan data unit kompetensi ini?";
    const confirmButtonText = isEditing ? "Ya, Update!" : "Ya, Simpan!";

    const result = await Swal.fire({
      title: actionTitle,
      text: actionText,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Memproses Data...",
          text: "Mohon tunggu sebentar.",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        if (isEditing) {
          await api.put(`/admin/unit-kompetensi/${editId}`, formData);
          Swal.fire({ icon: "success", title: "Berhasil Diperbarui!", timer: 1500, showConfirmButton: false });
        } else {
          await api.post("/admin/unit-kompetensi", formData);
          Swal.fire({ icon: "success", title: "Berhasil Ditambahkan!", timer: 1500, showConfirmButton: false });
        }

        resetForm();
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    }
  };

  // --- LOGIKA EDIT ---
  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id_unit);
    setFormData({
      id_skkni: item.id_skkni,
      kode_unit: item.kode_unit,
      judul_unit: item.judul_unit
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- LOGIKA HAPUS ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan lagi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await api.delete(`/admin/unit-kompetensi/${id}`);
        Swal.fire({ icon: "success", title: "Terhapus!", timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ id_skkni: "", kode_unit: "", judul_unit: "" });
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Manajemen Unit Kompetensi</h2>
        <p className="text-[14px] text-[#182D4A] m-0">Kelola master data unit kompetensi dan relasinya dengan SKKNI.</p>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        <h3 className="text-[16px] font-bold text-[#071E3D] mb-5 border-b border-[#071E3D]/10 pb-3 flex items-center">
          {isEditing ? <Edit size={18} className="mr-2 text-[#CC6B27]"/> : <Plus size={18} className="mr-2 text-[#CC6B27]"/>}
          {isEditing ? "Edit Data Unit Kompetensi" : "Tambah Unit Kompetensi Baru"}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Dropdown SKKNI */}
            <div>
              <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Pilih SKKNI</label>
              <select
                name="id_skkni"
                value={formData.id_skkni}
                onChange={handleChange}
                className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
              >
                <option value="">-- Pilih SKKNI Terkait --</option>
                {skkniList.map((skkni) => (
                  <option key={skkni.id_skkni} value={skkni.id_skkni}>
                    {skkni.judul_skkni}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Kode Unit */}
            <div>
              <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Kode Unit</label>
              <input
                type="text"
                name="kode_unit"
                value={formData.kode_unit}
                onChange={handleChange}
                placeholder="Contoh: TIK.JK01.001.01"
                className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] font-mono"
              />
            </div>

            {/* Input Judul Unit */}
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold text-[#071E3D] mb-1.5">Judul Unit</label>
              <input
                type="text"
                name="judul_unit"
                value={formData.judul_unit}
                onChange={handleChange}
                placeholder="Masukkan Judul Unit Kompetensi Lengkap"
                className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#071E3D]/5">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]"
            >
              <Save size={16} /> {isEditing ? "Update Perubahan" : "Simpan Data"}
            </button>
            
            {(isEditing || formData.kode_unit || formData.judul_unit || formData.id_skkni) && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors flex items-center gap-2 text-[13px]"
              >
                <X size={16} /> Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* Toolbar & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <List size={18} className="text-[#CC6B27]"/> Daftar Unit Kompetensi
          </h4>
          
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Kode, Judul Unit, atau SKKNI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">SKKNI Terkait</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Kode Unit</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul Unit Kompetensi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[#182D4A] mt-3 font-medium text-[14px]">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_unit} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-[#071E3D] text-[13.5px] font-semibold text-center">{index + 1}</td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px]">
                      {item.skkni?.judul_skkni ? (
                        <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#CC6B27]"/> {item.skkni.judul_skkni}</div>
                      ) : (
                        <span className="text-gray-400 italic">ID: {item.id_skkni} (Tidak ditemukan)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] font-bold text-[#CC6B27]">{item.kode_unit}</td>
                    <td className="py-3 px-4 text-[#071E3D] text-[13.5px] font-medium">{item.judul_unit}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm"
                          title="Edit Data"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_unit)}
                          className="inline-flex p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent"
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data unit kompetensi tersedia.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnitKompetensi;