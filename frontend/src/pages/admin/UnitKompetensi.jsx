import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { 
  Plus, Edit, Trash2, Save, X, BookOpen, Search, Loader2, Database
} from 'lucide-react';

const UnitKompetensi = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [skkniList, setSkkniList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal Form (Create/Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State Form Data
  const [formData, setFormData] = useState({
    id_skkni: "",
    kode_unit: "",
    judul_unit: ""
  });

  // Load Data
  useEffect(() => {
    fetchData();
    fetchSkkni();
  }, []);

  // Filter Search
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

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/unit-kompetensi');
      setDataList(res.data?.data || []);
      setFilteredData(res.data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data unit kompetensi", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkkni = async () => {
    try {
      const res = await api.get('/admin/skkni');
      setSkkniList(res.data?.data || []);
    } catch (error) {
      console.error("Gagal memuat daftar SKKNI:", error);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditId(null);
    setFormData({ id_skkni: "", kode_unit: "", judul_unit: "" });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id_unit);
    setFormData({
      id_skkni: item.id_skkni || "",
      kode_unit: item.kode_unit || "",
      judul_unit: item.judul_unit || ""
    });
    setShowModal(true);
  };

  // ==========================================
  // --- BLOK FUNGSI VALIDASI ---
  // ==========================================
  const validateForm = () => {
    if (!formData.id_skkni) {
      return "Silakan pilih Standar/SKKNI rujukan terlebih dahulu!";
    }
    
    const kode = String(formData.kode_unit).trim();
    if (!kode || kode.length < 4) {
      return `Inputan Kode Unit ("${kode}") terlalu pendek. Minimal harus 4 karakter!`;
    }

    const judul = String(formData.judul_unit).trim();
    if (!judul || judul.length < 4) {
      return `Inputan Judul Unit ("${judul}") terlalu pendek. Minimal harus 4 karakter!`;
    }

    return null; // Null berarti lolos validasi
  };

  // ==========================================
  // --- BLOK FUNGSI SIMPAN & KONFIRMASI ---
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Jalankan Validasi
    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    // 2. Tampilkan Konfirmasi SweetAlert
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${isEditing ? 'menyimpan perubahan' : 'menambahkan'} data Unit Kompetensi ini? Pastikan semua data sudah benar.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27", 
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return; // Hentikan eksekusi jika diklik Batal

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/admin/unit-kompetensi/${editId}`, formData);
        Swal.fire({ title: "Berhasil", text: "Data unit kompetensi diperbarui", icon: "success", timer: 1500 });
      } else {
        await api.post('/admin/unit-kompetensi', formData);
        Swal.fire({ title: "Berhasil", text: "Data unit kompetensi ditambahkan", icon: "success", timer: 1500 });
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data", "error");
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
      text: "Yakin ingin menghapus data Unit Kompetensi ini? Aksi ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus Data!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/unit-kompetensi/${id}`);
      Swal.fire({ title: "Terhapus!", text: "Data berhasil dihapus.", icon: "success", timer: 1500 });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menghapus data", "error");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
          <BookOpen className="text-[#CC6B27]" size={24}/>
          Unit Kompetensi
        </h2>
        <p className="text-[14px] text-[#182D4A] m-0">Kelola master data Unit Kompetensi rujukan SKKNI.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
              placeholder="Cari Kode atau Judul Unit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={openModal} 
            className="w-full md:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-[13px] transition-all"
          >
            <Plus size={16} /> Tambah Unit Kompetensi
          </button>
        </div>

        {/* MODAL FORM */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#182D4A]">
                  {isEditing ? <Edit size={20} className="text-[#CC6B27]" /> : <Plus size={20} className="text-[#CC6B27]" />}
                  <h3 className="font-bold text-[16px]">{isEditing ? "Edit Unit Kompetensi" : "Tambah Unit Kompetensi"}</h3>
                </div>
                <button onClick={closeModal} className="text-[#182D4A]/50 hover:text-red-500 p-1 rounded-lg transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <div className="p-6">
                <form id="unitForm" onSubmit={handleSave} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Standar Rujukan (SKKNI)</label>
                    <select
                      name="id_skkni"
                      value={formData.id_skkni}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    >
                      <option value="">-- Pilih SKKNI --</option>
                      {skkniList.map(sk => (
                        <option key={sk.id_skkni} value={sk.id_skkni}>
                          {sk.judul_skkni} {sk.no_skkni ? `(${sk.no_skkni})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Kode Unit</label>
                    <input
                      type="text"
                      name="kode_unit"
                      value={formData.kode_unit}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                      placeholder="Cth: J.620100.004.01"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Judul Unit Kompetensi</label>
                    <input
                      type="text"
                      name="judul_unit"
                      value={formData.judul_unit}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                      placeholder="Cth: Menggunakan Struktur Data"
                    />
                  </div>
                </form>
              </div>

              <div className="pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4 mt-auto">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
                <button type="submit" form="unitForm" disabled={loading} className="px-5 py-2 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70 transition-colors">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isEditing ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Kode Unit</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul Unit</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Rujukan Standar</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={32} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_unit} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors text-[13.5px]">
                    <td className="py-4 px-4 text-center font-semibold text-[#071E3D]">{index + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#CC6B27]">{item.kode_unit}</td>
                    <td className="py-4 px-4 font-medium text-[#182D4A]">{item.judul_unit}</td>
                    
                    {/* KOLOM RUJUKAN STANDAR */}
                    <td className="py-4 px-4 text-[#182D4A]/70 text-[12px] leading-relaxed">
                      {item.skkni ? (
                        <>
                          <span className="font-bold text-[#071E3D] block">{item.skkni.no_skkni || ""}</span>
                          {item.skkni.judul_skkni || ""}
                        </>
                      ) : (
                        <span className="italic text-gray-400">Tidak ada rujukan</span>
                      )}
                    </td>

                    {/* KOLOM AKSI */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* TOMBOL NAVIGASI KE BANK SOAL */}
                        <button
                          onClick={() => navigate(`/admin/bank-soal?unit=${item.id_unit}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm text-[12px] font-bold border border-blue-600 hover:border-blue-700"
                          title="Kelola Bank Soal untuk Unit Ini"
                        >
                          <Database size={14} /> Bank Soal
                        </button>

                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex p-2 rounded-lg text-[#182D4A] bg-slate-100 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm"
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