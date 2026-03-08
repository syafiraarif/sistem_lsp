import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bankSoalService } from "../../services/bankSoalService";
import { unitKompetensiService } from "../../services/unitKompetensiService";
import Swal from "sweetalert2";
import { Database, Plus, Edit2, Trash2, X, Save, Loader2, Filter, Settings, FileText } from 'lucide-react';

const BankSoal = () => {
  const navigate = useNavigate();
  const [soalList, setSoalList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id_unit: "",
    jenis: "IA05_pg",
    pertanyaan: "",
    tingkat_kesulitan: "sedang",
    status: "aktif",
  });

  // Filter state
  const [filterUnit, setFilterUnit] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  useEffect(() => {
    fetchSoal();
    fetchUnits();
  }, []);

  const fetchSoal = async () => {
    setLoading(true);
    try {
      const res = await bankSoalService.getAll();
      setSoalList(res.data?.data || res.data || []);
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal memuat data soal", icon: "error", confirmButtonColor: '#CC6B27' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await unitKompetensiService.getAll(); 
      setUnitList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Gagal memuat unit kompetensi");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (soal = null) => {
    if (soal) {
      setEditingId(soal.id_soal);
      setFormData({
        id_unit: soal.id_unit,
        jenis: soal.jenis,
        pertanyaan: soal.pertanyaan,
        tingkat_kesulitan: soal.tingkat_kesulitan || "sedang",
        status: soal.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        id_unit: "",
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
    try {
      if (editingId) {
        await bankSoalService.update(editingId, formData);
        Swal.fire({ title: "Berhasil", text: "Soal berhasil diperbarui", icon: "success", confirmButtonColor: '#CC6B27' });
      } else {
        await bankSoalService.create(formData);
        Swal.fire({ title: "Berhasil", text: "Soal berhasil ditambahkan", icon: "success", confirmButtonColor: '#CC6B27' });
      }
      closeModal();
      fetchSoal();
    } catch (error) {
      Swal.fire({ title: "Error", text: "Gagal menyimpan soal", icon: "error", confirmButtonColor: '#CC6B27' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await bankSoalService.delete(id);
        Swal.fire({ title: "Terhapus", text: "Soal berhasil dihapus", icon: "success", confirmButtonColor: '#CC6B27' });
        fetchSoal();
      } catch (error) {
        Swal.fire({ title: "Error", text: "Gagal menghapus soal", icon: "error", confirmButtonColor: '#CC6B27' });
      }
    }
  };

  // Filter logic
  const filteredSoal = soalList.filter((soal) => {
    if (filterUnit && soal.id_unit != filterUnit) return false;
    if (filterJenis && soal.jenis !== filterJenis) return false;
    return true;
  });

  const getUnitName = (id) => {
    const unit = unitList.find((u) => u.id_unit === id);
    return unit ? unit.judul_unit || unit.nama_unit : "-";
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
            <Database size={24} className="text-[#CC6B27]"/> Bank Soal
          </h1>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola master soal untuk berbagai metode asesmen</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2 text-[13px]"
        >
          <Plus size={18} /> Tambah Soal
        </button>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#FAFAFA] p-4 rounded-lg border border-[#071E3D]/10">
          <div className="flex items-center gap-3 w-full md:w-auto md:flex-1">
             <div className="p-2 bg-white rounded-lg shadow-sm border border-[#071E3D]/10"><Filter size={18} className="text-[#CC6B27]" /></div>
             <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] transition-all text-[13px] font-bold appearance-none cursor-pointer"
              >
                <option value="">Semua Unit Kompetensi</option>
                {unitList.map((unit) => (
                  <option key={unit.id_unit} value={unit.id_unit}>
                    {unit.kode_unit} - {unit.judul_unit || unit.nama_unit}
                  </option>
                ))}
              </select>
          </div>
          <div className="w-full md:w-64">
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27] transition-all text-[13px] font-bold appearance-none cursor-pointer"
              >
                <option value="">Semua Jenis Soal</option>
                <option value="IA05_pg">Pilihan Ganda (IA.05)</option>
                <option value="IA06_essay">Essay / Esai (IA.06)</option>
                <option value="IA07_lisan">Lisan (IA.07)</option>
                <option value="IA09_wawancara">Wawancara (IA.09)</option>
              </select>
          </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead className="bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Unit Kompetensi</th>
                <th className="px-4 py-3.5 w-1/3">Pertanyaan</th>
                <th className="px-4 py-3.5 text-center">Jenis</th>
                <th className="px-4 py-3.5 text-center">Level</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E3D]/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                     <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36}/>
                     <p className="text-[#182D4A] font-medium text-[14px]">Memuat data bank soal...</p>
                  </td>
                </tr>
              ) : filteredSoal.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                     <FileText size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                     <p className="text-[#182D4A] font-medium text-[14px]">Data soal tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredSoal.map((soal, index) => (
                  <tr key={soal.id_soal} className="hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-[#071E3D] text-[13.5px]">{index + 1}</td>
                    <td className="px-4 py-4 text-[#182D4A] text-[13px] font-medium">{getUnitName(soal.id_unit)}</td>
                    <td className="px-4 py-4">
                      <div className="text-[13.5px] text-[#071E3D] font-medium leading-relaxed max-w-sm truncate" title={soal.pertanyaan}>
                        {soal.pertanyaan}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-bold text-[#182D4A] bg-[#071E3D]/5 px-2.5 py-1 rounded-md border border-[#071E3D]/10 uppercase">{soal.jenis?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border capitalize ${
                            soal.tingkat_kesulitan === 'mudah' ? 'text-green-700 bg-green-50 border-green-200' :
                            soal.tingkat_kesulitan === 'sedang' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                            'text-red-700 bg-red-50 border-red-200'
                        }`}>{soal.tingkat_kesulitan || soal.tingkat_kesulilan}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                          soal.status === "aktif" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {soal.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {soal.jenis === "IA05_pg" && (
                          <button
                            onClick={() => navigate(`/admin/bank-soal-pg/${soal.id_soal}`)}
                            className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors" title="Kelola Opsi PG"
                          >
                            <Settings size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(soal)}
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" title="Edit Soal"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(soal.id_soal)}
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Soal"
                        >
                          <Trash2 size={18} />
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
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] zoom-in-95">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                {editingId ? <><Edit2 size={20} className="text-[#CC6B27]"/> Edit Soal</> : <><Plus size={20} className="text-[#CC6B27]"/> Tambah Soal Baru</>}
              </h3>
              <button onClick={closeModal} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="soalForm" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Unit Kompetensi <span className="text-red-500">*</span></label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none"
                  >
                    <option value="">-- Pilih Unit --</option>
                    {unitList.map((unit) => (
                      <option key={unit.id_unit} value={unit.id_unit}>
                        {unit.kode_unit} - {unit.judul_unit || unit.nama_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Jenis Soal <span className="text-red-500">*</span></label>
                    <select
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none"
                    >
                        <option value="IA05_pg">Pilihan Ganda (IA.05)</option>
                        <option value="IA06_essay">Essay (IA.06)</option>
                        <option value="IA07_lisan">Lisan (IA.07)</option>
                        <option value="IA09_wawancara">Wawancara (IA.09)</option>
                    </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Tingkat Kesulitan</label>
                    <select
                        name="tingkat_kesulitan"
                        value={formData.tingkat_kesulitan}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none"
                    >
                        <option value="mudah">Mudah</option>
                        <option value="sedang">Sedang</option>
                        <option value="sulit">Sulit</option>
                    </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#071E3D]">Pertanyaan <span className="text-red-500">*</span></label>
                  <textarea
                    name="pertanyaan"
                    value={formData.pertanyaan}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] resize-none"
                    placeholder="Tuliskan isi pertanyaan..."
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-1/2">
                  <label className="text-[13px] font-bold text-[#071E3D]">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] appearance-none"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

              </form>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="soalForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                <Save size={16}/> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoal;