import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaTimes, FaSave, FaFileAlt } from "react-icons/fa";

const Skkni = () => {
  // --- STATE ---
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal Form (Create/Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // State Form Data (Sesuai Model Backend)
  const [formData, setFormData] = useState({
    jenis_standar: "SKKNI",
    no_skkni: "",
    judul_skkni: "",
    legalitas: "",
    sektor: "",
    sub_sektor: "",
    penerbit: "",
  });

  // State khusus file upload
  const [dokumenFile, setDokumenFile] = useState(null);

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skkni");
      // Urutkan manual berdasarkan ID descending (karena timestamps: false)
      const sortedData = (response.data.data || []).sort((a, b) => b.id_skkni - a.id_skkni);
      setDataList(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDokumenFile(e.target.files[0]);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      jenis_standar: "SKKNI",
      no_skkni: "",
      judul_skkni: "",
      legalitas: "",
      sektor: "",
      sub_sektor: "",
      penerbit: "",
    });
    setDokumenFile(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditId(item.id_skkni);
    setFormData({
      jenis_standar: item.jenis_standar || "SKKNI",
      no_skkni: item.no_skkni || "",
      judul_skkni: item.judul_skkni || "",
      legalitas: item.legalitas || "",
      sektor: item.sektor || "",
      sub_sektor: item.sub_sektor || "",
      penerbit: item.penerbit || "",
    });
    setDokumenFile(null); 
    setSelectedItem(item); 
    setShowModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // --- SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Input Wajib
    if (!formData.no_skkni || !formData.judul_skkni) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Pastikan No SKKNI dan Judul SKKNI telah diisi.",
      });
      return;
    }

    // 2. Konfirmasi
    const confirmResult = await Swal.fire({
      title: isEditing ? "Simpan Perubahan?" : "Tambah Data Baru?",
      text: isEditing 
        ? "Pastikan data yang diubah sudah benar." 
        : "Apakah Anda yakin ingin menyimpan data ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEditing ? "Ya, Update" : "Ya, Simpan",
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    // 3. Prepare FormData
    const payload = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });

    // Append File dengan nama field 'file_dokumen' (SESUAI BACKEND)
    if (dokumenFile) {
      payload.append("file_dokumen", dokumenFile);
    }

    try {
      Swal.fire({
        title: "Sedang Memproses...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (isEditing) {
        // Update
        await api.put(`/admin/skkni/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Berhasil!", "Data SKKNI berhasil diperbarui.", "success");
      } else {
        // Create
        await api.post("/admin/skkni", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Berhasil!", "Data SKKNI berhasil ditambahkan.", "success");
      }

      setShowModal(false);
      fetchData();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan server.",
      });
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda Yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
            title: "Menghapus...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading() 
        });
        
        await api.delete(`/admin/skkni/${id}`);
        Swal.fire("Terhapus!", "Data SKKNI telah dihapus.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data.", "error");
      }
    }
  };

  // --- FILTERING ---
  const filteredData = dataList.filter((item) =>
    (item.judul_skkni || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.no_skkni || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1">Data SKKNI</h2>
          <p className="text-[14px] text-[#182D4A] m-0">Kelola Standar Kompetensi Kerja Nasional Indonesia</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="px-4 py-2 bg-[#CC6B27] text-white rounded-lg hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2 text-[13px]"
        >
          <FaPlus /> Tambah Data
        </button>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* SEARCH BOX */}
        <div className="w-full md:w-80 relative group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
            placeholder="Cari Judul atau No SKKNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[50px] text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-[180px]">Nomor SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Jenis</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Sektor</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-[180px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <p className="text-[#182D4A] font-medium text-[14px]">Loading data...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_skkni} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-4 px-4 text-[#071E3D] text-[13.5px] font-semibold text-center">{index + 1}</td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13px] font-mono font-semibold">{item.no_skkni}</td>
                    <td className="py-4 px-4 text-[#071E3D] font-bold text-[13.5px] max-w-sm truncate" title={item.judul_skkni}>{item.judul_skkni}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 text-[11px] rounded-full border border-[#071E3D]/20 bg-[#FAFAFA] font-bold text-[#182D4A]">
                        {item.jenis_standar === 'SI' ? 'Standar Int.' : 
                         item.jenis_standar === 'SKK' ? 'SKK Khusus' : item.jenis_standar}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#182D4A] text-[13.5px] font-medium">{item.sektor || "-"}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 transition-colors" 
                          onClick={() => openDetailModal(item)}
                          title="Lihat Detail"
                        >
                          <FaEye size={16} />
                        </button>
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-[#071E3D] hover:bg-[#071E3D]/10 transition-colors" 
                          onClick={() => openEditModal(item)}
                          title="Edit Data"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          className="p-1.5 rounded-lg text-[#182D4A] hover:text-red-600 hover:bg-red-50 transition-colors" 
                          onClick={() => handleDelete(item.id_skkni)}
                          title="Hapus Data"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-[#182D4A]/50">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM (CREATE / EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              
              <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
                <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                  {isEditing ? <FaEdit className="text-[#CC6B27]"/> : <FaPlus className="text-[#CC6B27]"/>}
                  {isEditing ? "Edit Data SKKNI" : "Tambah Data SKKNI"}
                </h3>
                <button type="button" className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" onClick={() => setShowModal(false)}>
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Jenis Standar <span className="text-red-500">*</span></label>
                    <select 
                      name="jenis_standar" 
                      value={formData.jenis_standar} 
                      onChange={handleInputChange} 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"
                    >
                      <option value="SKKNI">SKKNI</option>
                      <option value="SKK">SKK Khusus</option>
                      <option value="SI">Standar Internasional</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Nomor SKKNI <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="no_skkni"
                      value={formData.no_skkni}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Contoh: 123 Tahun 2023"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-bold text-[#071E3D]">Judul SKKNI <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="judul_skkni"
                      value={formData.judul_skkni}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Masukkan Judul Lengkap"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Sektor</label>
                    <input
                      type="text"
                      name="sektor"
                      value={formData.sektor}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Contoh: Teknologi Informasi"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Sub Sektor</label>
                    <input
                      type="text"
                      name="sub_sektor"
                      value={formData.sub_sektor}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Contoh: Rekayasa Perangkat Lunak"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Legalitas (Nomor Keputusan)</label>
                    <input
                      type="text"
                      name="legalitas"
                      value={formData.legalitas}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Nomor Keputusan Menteri..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#071E3D]">Penerbit</label>
                    <input
                      type="text"
                      name="penerbit"
                      value={formData.penerbit}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px] placeholder:text-[#182D4A]/40"
                      placeholder="Contoh: Kemenaker"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2 pt-3 border-t border-dashed border-[#071E3D]/20">
                    <label className="text-[13px] font-bold text-[#071E3D]">Upload Dokumen (PDF/Doc)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-[13px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27]/20 transition-all cursor-pointer bg-[#FAFAFA] border border-[#071E3D]/10 rounded-lg p-1"
                      accept=".pdf,.doc,.docx"
                    />
                    {isEditing && selectedItem?.dokumen && (
                      <p className="text-[12px] text-[#182D4A]/70 mt-1">
                        File saat ini: <strong className="text-[#CC6B27]">{selectedItem.dokumen}</strong> <br/>
                        (Biarkan kosong jika tidak ingin mengubah file)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[13px]">
                  <FaSave /> {isEditing ? "Update Data" : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL --- */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden zoom-in-95">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center gap-2 m-0">
                <FaEye className="text-[#CC6B27]"/> Detail Data SKKNI
              </h3>
              <button className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" onClick={() => setShowDetailModal(false)}>
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Jenis Standar</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.jenis_standar}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Nomor SKKNI</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.no_skkni}</p>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Judul SKKNI</label>
                    <p className="font-bold text-[#071E3D] mt-0.5 m-0 text-[14px] leading-relaxed">{selectedItem.judul_skkni}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Sektor</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.sektor || "-"}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Sub Sektor</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.sub_sektor || "-"}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Legalitas</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.legalitas || "-"}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Penerbit</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0 text-[13.5px]">{selectedItem.penerbit || "-"}</p>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2 mt-2 pt-4 border-t border-[#071E3D]/10">
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Dokumen Lampiran</label>
                    {selectedItem.dokumen ? (
                        <div className="flex items-center gap-2 mt-1.5 text-[13px] bg-[#FAFAFA] px-3 py-2 border border-[#071E3D]/10 rounded-lg w-fit font-medium">
                            <FaFileAlt className="text-[#CC6B27]" size={16}/>
                            <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="text-[#CC6B27] hover:text-[#071E3D] transition-colors">
                              {selectedItem.dokumen}
                            </a>
                        </div>
                    ) : (
                        <p className="text-[#182D4A]/50 italic text-[13px] mt-1">Tidak ada dokumen diupload.</p>
                    )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 px-6 pb-4">
                <button className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowDetailModal(false)}>
                    Tutup
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Skkni;