import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Database, Plus, Edit2, Trash2, X, Save, Loader2, Filter, Settings, FileText, List, ArrowLeft } from 'lucide-react';

const BankSoal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitQuery = searchParams.get('unit'); // Tangkap parameter ?unit=ID dari URL

  const [soalList, setSoalList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State form mengikuti model bank_soal
  const [formData, setFormData] = useState({
    id_unit: "",
    jenis: "IA05_pg",
    pertanyaan: "",
    tingkat_kesulitan: "sedang",
    status: "aktif",
  });

  // Jika URL membawa unitQuery, jadikan nilai awal filter
  const [filterUnit, setFilterUnit] = useState(unitQuery || "");
  const [filterJenis, setFilterJenis] = useState("");

  // Update filter otomatis jika URL query berubah
  useEffect(() => {
    if (unitQuery) {
      setFilterUnit(unitQuery);
    }
  }, [unitQuery]);

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
      Swal.fire({ title: "Error", text: "Gagal mengambil data soal", icon: "error" });
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

  // --- FILTERING ---
  const filteredSoal = soalList.filter(s => {
    const matchUnit = filterUnit ? String(s.id_unit) === String(filterUnit) : true;
    const matchJenis = filterJenis ? s.jenis === filterJenis : true;
    return matchUnit && matchJenis;
  });

  // Cari detail unit yang sedang aktif (jika masuk lewat mode khusus / ada unitQuery)
  const activeUnitInfo = unitList.find(u => String(u.id_unit) === String(unitQuery));

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      id_unit: unitQuery || filterUnit || "", // Otomatis terisi unit yang sedang aktif
      jenis: "IA05_pg",
      pertanyaan: "",
      tingkat_kesulitan: "sedang",
      status: "aktif",
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleEdit = (soal) => {
    setEditingId(soal.id_soal);
    setFormData({
      id_unit: soal.id_unit || "",
      jenis: soal.jenis || "IA05_pg",
      pertanyaan: soal.pertanyaan || "",
      tingkat_kesulitan: soal.tingkat_kesulitan || "sedang",
      status: soal.status || "aktif",
    });
    setModalOpen(true);
  };

  // ==========================================
  // --- BLOK FUNGSI VALIDASI ---
  // ==========================================
  const validateForm = () => {
    if (!formData.id_unit) {
      return "Silakan pilih Unit Kompetensi terlebih dahulu!";
    }
    
    const tanya = String(formData.pertanyaan).trim();
    if (!tanya || tanya.length < 4) {
      return `Teks pertanyaan terlalu pendek. Minimal harus 4 karakter!`;
    }

    return null; 
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
      text: `Yakin ingin ${editingId ? 'menyimpan perubahan' : 'menambahkan'} data Bank Soal ini?`,
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
      if (editingId) {
        await api.put(`/admin/bank-soal/${editingId}`, formData);
        Swal.fire({ title: "Berhasil", text: "Soal berhasil diperbarui", icon: "success", timer: 1500 });
      } else {
        await api.post('/admin/bank-soal', formData);
        Swal.fire({ title: "Berhasil", text: "Soal berhasil ditambahkan", icon: "success", timer: 1500 });
      }
      closeModal();
      fetchSoal();
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal menyimpan soal", icon: "error" });
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
      text: "Yakin ingin menghapus data Soal ini? Aksi ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/bank-soal/${id}`);
      Swal.fire({ title: "Terhapus", text: "Soal berhasil dihapus", icon: "success", timer: 1500 });
      fetchSoal();
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal menghapus soal", icon: "error" });
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER DENGAN TOMBOL KEMBALI JIKA DIAKSES DARI UNIT KOMPETENSI */}
      <div className="flex items-center gap-4">
        {unitQuery && (
          <button 
            onClick={() => navigate('/admin/unit-kompetensi')} 
            className="p-2.5 rounded-lg bg-white border border-[#071E3D]/20 text-[#182D4A] hover:text-[#CC6B27] hover:border-[#CC6B27]/30 transition-all shadow-sm"
            title="Kembali ke Unit Kompetensi"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            <Database className="text-[#CC6B27]" size={24}/>
            Bank Soal Ujian
          </h2>
          <p className="text-[14px] text-[#182D4A] m-0">
            {unitQuery && activeUnitInfo 
              ? `Mengelola bank soal khusus untuk unit: ${activeUnitInfo.kode_unit}` 
              : "Pengelolaan bank soal untuk ujian tertulis dan lisan asesi."}
          </p>
        </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className={`flex items-center gap-2 border px-3 py-2 rounded-lg transition-colors ${unitQuery ? 'bg-gray-100 border-gray-200' : 'bg-[#FAFAFA] border-[#071E3D]/20'}`}>
            <Filter size={16} className={unitQuery ? "text-gray-400" : "text-[#CC6B27]"} />
            <select 
              className={`bg-transparent text-[13px] font-medium focus:outline-none w-40 ${unitQuery ? 'text-gray-500 cursor-not-allowed' : 'text-[#071E3D]'}`}
              value={filterUnit}
              disabled={!!unitQuery} // Kunci dropdown filter jika sedang berada dalam mode "Per Unit"
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              <option value="">Semua Unit Kompetensi</option>
              {unitList.map(u => (
                <option key={u.id_unit} value={u.id_unit}>{u.kode_unit}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#071E3D]/20 px-3 py-2 rounded-lg">
            <Settings size={16} className="text-[#CC6B27]" />
            <select 
              className="bg-transparent text-[13px] font-medium text-[#071E3D] focus:outline-none w-40"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua Jenis Soal</option>
              <option value="IA05_pg">Pilihan Ganda (PG)</option>
              <option value="IA06_essay">Ujian Esai</option>
              <option value="IA07_lisan">Ujian Lisan</option>
              <option value="IA09_wawancara">Wawancara</option>
            </select>
          </div>
        </div>

        <button onClick={openModal} className="w-full md:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-[13px] transition-all">
          <Plus size={16} /> Tambah Soal
        </button>

      </div>

      {/* TABLE LIST */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Unit</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Jenis Soal</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-1/3">Pertanyaan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Kesulitan</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={32} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredSoal.length > 0 ? (
                filteredSoal.map((item, idx) => (
                  <tr key={item.id_soal} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors text-[13.5px]">
                    <td className="py-4 px-4 text-center font-semibold text-[#071E3D]">{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#CC6B27]">
                      {item.unit_kompetensi?.kode_unit || item.id_unit}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-1 rounded bg-[#071E3D]/10 text-[#071E3D] text-[11px] font-bold uppercase">
                        {item.jenis === 'IA05_pg' ? 'PILIHAN GANDA' : 
                         item.jenis === 'IA06_essay' ? 'ESAI' : 
                         item.jenis === 'IA07_lisan' ? 'LISAN' : 
                         item.jenis === 'IA09_wawancara' ? 'WAWANCARA' : item.jenis}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#182D4A]">
                      <div className="line-clamp-2" title={item.pertanyaan}>{item.pertanyaan}</div>
                    </td>
                    <td className="py-4 px-4 text-center capitalize font-medium text-[#182D4A]">{item.tingkat_kesulitan?.replace('_', ' ')}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* TOMBOL KELOLA OPSI KHUSUS PG */}
                        {item.jenis === 'IA05_pg' && (
                          <button 
                            onClick={() => navigate(`/admin/bank-soal-pg?id=${item.id_soal}`)} 
                            className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100" 
                            title="Kelola Opsi Pilihan Ganda"
                          >
                            <List size={16} />
                          </button>
                        )}

                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm" title="Edit Soal">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id_soal)} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100" title="Hapus Soal">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                      <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data soal ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM CREATE/EDIT SOAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#182D4A]">
                {editingId ? <Edit2 size={20} className="text-[#CC6B27]" /> : <Plus size={20} className="text-[#CC6B27]" />}
                <h3 className="font-bold text-[16px]">{editingId ? "Edit Bank Soal" : "Tambah Bank Soal Baru"}</h3>
              </div>
              <button onClick={closeModal} className="text-[#182D4A]/50 hover:text-red-500 p-1 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <form id="soalForm" onSubmit={handleSave} className="flex flex-col gap-4">
                
                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">
                    Pilih Unit Kompetensi {unitQuery && <span className="text-red-500 font-normal italic">(Terkunci)</span>}
                  </label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleInputChange}
                    disabled={!!unitQuery} // Input disable jika sedang mode spesifik per unit
                    className={`w-full p-2.5 border border-[#071E3D]/20 rounded-lg font-medium text-[13px] transition-all ${
                      unitQuery 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                        : 'text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10'
                    }`}
                  >
                    <option value="">-- Silakan Pilih --</option>
                    {unitList.map((u) => (
                      <option key={u.id_unit} value={u.id_unit}>
                        {u.kode_unit} - {u.judul_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Jenis Soal</label>
                    <select
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    >
                      <option value="IA05_pg">IA.05 Pilihan Ganda</option>
                      <option value="IA06_essay">IA.06 Esai</option>
                      <option value="IA07_lisan">IA.07 Lisan</option>
                      <option value="IA09_wawancara">IA.09 Wawancara</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Tingkat Kesulitan</label>
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

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Isi Pertanyaan</label>
                  <textarea
                    name="pertanyaan"
                    rows="4"
                    value={formData.pertanyaan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Apa yang dimaksud dengan..."
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Status</label>
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
              <button type="submit" form="soalForm" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70 transition-colors">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {editingId ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoal;