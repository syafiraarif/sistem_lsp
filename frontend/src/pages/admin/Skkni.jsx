import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Search, Plus, Eye, Edit2, Trash2, X, Save, FileText, Loader2, Filter } from "lucide-react";

const Skkni = () => {
  // --- STATE ---
  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

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
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  // Filter Search & Jenis
  useEffect(() => {
    if (!dataList) return;
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = dataList.filter(item => {
      const no = item.no_skkni?.toLowerCase() || '';
      const judul = item.judul_skkni?.toLowerCase() || '';
      const matchSearch = no.includes(lowerTerm) || judul.includes(lowerTerm);
      const matchJenis = filterJenis ? item.jenis_standar === filterJenis : true;
      
      return matchSearch && matchJenis;
    });
    setFilteredData(filtered);
  }, [searchTerm, filterJenis, dataList]);

  // --- API FUNCTIONS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/skkni");
      setDataList(response.data?.data || []);
      setFilteredData(response.data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data SKKNI", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDokumenFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setDokumenFile(null);
      setPreviewUrl(null);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditId(null);
    setDokumenFile(null);
    setPreviewUrl(null);
    setFormData({
      jenis_standar: "SKKNI",
      no_skkni: "",
      judul_skkni: "",
      legalitas: "",
      sektor: "",
      sub_sektor: "",
      penerbit: "",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setPreviewUrl(null);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id_skkni);
    setSelectedItem(item); // Disimpan untuk mengambil nama file eksisting
    setDokumenFile(null);
    setPreviewUrl(null);
    setFormData({
      jenis_standar: item.jenis_standar || "SKKNI",
      no_skkni: item.no_skkni || "",
      judul_skkni: item.judul_skkni || "",
      legalitas: item.legalitas || "",
      sektor: item.sektor || "",
      sub_sektor: item.sub_sektor || "",
      penerbit: item.penerbit || "",
    });
    setShowModal(true);
  };

  // ==========================================
  // --- BLOK FUNGSI VALIDASI ---
  // ==========================================
  const validateForm = () => {
    const fieldsToCheck = [
      { key: 'no_skkni', name: 'Nomor SKKNI' },
      { key: 'judul_skkni', name: 'Judul SKKNI' },
      { key: 'legalitas', name: 'Legalitas' },
      { key: 'sektor', name: 'Sektor' },
      { key: 'sub_sektor', name: 'Sub Sektor' },
      { key: 'penerbit', name: 'Penerbit' },
    ];

    for (let field of fieldsToCheck) {
      const value = String(formData[field.key] || "").trim();
      if (value.length > 0 && value.length < 4) {
        return `Inputan pada kolom "${field.name}" terlalu pendek ("${value}"). Minimal harus 4 karakter!`;
      }
    }
    return null;
  };

  // ==========================================
  // --- BLOK FUNGSI SIMPAN & KONFIRMASI ---
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Validasi Input
    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    // 2. Konfirmasi SweetAlert
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${isEditing ? 'menyimpan perubahan' : 'menambahkan'} data ini?`,
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
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        dataToSend.append(key, formData[key]);
      });
      if (dokumenFile) {
        dataToSend.append("file_dokumen", dokumenFile);
      }

      if (isEditing) {
        await api.put(`/admin/skkni/${editId}`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ title: "Berhasil", text: "Data Standar diperbarui", icon: "success", timer: 1500 });
      } else {
        await api.post("/admin/skkni", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ title: "Berhasil", text: "Data Standar ditambahkan", icon: "success", timer: 1500 });
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
      text: "Yakin ingin menghapus data Standar ini? Data yang terkait mungkin akan ikut terpengaruh!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus Data!",
      cancelButtonText: "Batal"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/skkni/${id}`);
      Swal.fire({ title: "Terhapus!", text: "Data berhasil dihapus.", icon: "success", timer: 1500 });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menghapus data", "error");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-[#071E3D] m-0 mb-1 flex items-center gap-2">
          <FileText className="text-[#CC6B27]" size={24}/>
          Data Standar / SKKNI
        </h2>
        <p className="text-[14px] text-[#182D4A] m-0">Kelola master data SKKNI dan dokumen pendukung.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* --- TOOLBAR (SEARCH, FILTER & TITLE) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="w-full md:w-80 relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" 
                placeholder="Cari No atau Judul SKKNI..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#071E3D]/20 px-3 py-2 rounded-lg w-full md:w-auto">
              <Filter size={16} className="text-[#CC6B27]" />
              <select 
                className="bg-transparent text-[13px] font-medium text-[#071E3D] focus:outline-none w-full md:w-40"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              >
                <option value="">Semua Jenis</option>
                <option value="SKKNI">SKKNI</option>
                <option value="SKK">Standar Khusus (SKK)</option>
                <option value="SI">Standar Internasional (SI)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={openModal} 
            className="w-full md:w-auto px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center justify-center gap-2 text-[13px] transition-all shrink-0"
          >
            <Plus size={16} /> Tambah SKKNI
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nomor SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Judul SKKNI</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Jenis</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Dokumen</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC6B27] mb-3" size={30} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_skkni} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors text-[13px]">
                    <td className="py-4 px-4 text-center font-semibold text-[#071E3D]">{index + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#CC6B27] whitespace-nowrap">{item.no_skkni}</td>
                    <td className="py-4 px-4 font-medium text-[#182D4A]">{item.judul_skkni}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-1 rounded bg-[#071E3D]/10 text-[#071E3D] font-bold text-[11px] uppercase">
                        {item.jenis_standar}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.dokumen ? (
                        <a href={`http://localhost:3000/uploads/${item.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182D4A]/10 text-[#182D4A] hover:bg-[#CC6B27] hover:text-white transition-all text-[11px] font-bold">
                          <FileText size={12}/> Lihat File
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[12px]">Tidak Ada</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openDetailModal(item)} className="p-2 rounded-lg text-[#071E3D] bg-slate-100 hover:bg-[#071E3D] hover:text-white transition-all shadow-sm border border-transparent hover:border-slate-300" title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm border border-transparent" title="Edit Data">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id_skkni)} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-transparent" title="Hapus Data">
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
                      <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data SKKNI tersedia.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM CREATE/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 bg-[#FAFAFA] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-[#182D4A]">
                {isEditing ? <Edit2 size={20} className="text-[#CC6B27]" /> : <Plus size={20} className="text-[#CC6B27]" />}
                <h3 className="font-bold text-[16px]">{isEditing ? "Edit Data SKKNI" : "Tambah SKKNI Baru"}</h3>
              </div>
              <button onClick={closeModal} className="text-[#182D4A]/50 hover:text-red-500 p-1 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="skkniForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="md:col-span-2">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Judul Standar</label>
                  <input required type="text" name="judul_skkni" value={formData.judul_skkni} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" placeholder="Masukkan Judul Standar"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Nomor Standar</label>
                  <input required type="text" name="no_skkni" value={formData.no_skkni} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]" placeholder="Contoh: KEP/123/2023"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Jenis Standar</label>
                  <select name="jenis_standar" value={formData.jenis_standar} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]">
                    <option value="SKKNI">SKKNI</option>
                    <option value="SKK">Standar Khusus (SKK)</option>
                    <option value="SI">Standar Internasional (SI)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Sektor</label>
                  <input type="text" name="sektor" value={formData.sektor} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Sub Sektor</label>
                  <input type="text" name="sub_sektor" value={formData.sub_sektor} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Legalitas</label>
                  <input type="text" name="legalitas" value={formData.legalitas} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#071E3D] mb-1.5 block">Penerbit</label>
                  <input type="text" name="penerbit" value={formData.penerbit} onChange={handleInputChange} className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium text-[13px]"/>
                </div>

                {/* AREA UPLOAD & PREVIEW DOKUMEN */}
                <div className="md:col-span-2 mt-2">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-2 block">Upload Dokumen Pendukung (PDF)</label>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 w-full">
                          <input 
                              type="file" 
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="w-full p-2 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-[#CC6B27]/10 file:text-[#CC6B27] hover:file:bg-[#CC6B27]/20 transition-all"
                          />
                          
                          {isEditing && !dokumenFile && selectedItem?.dokumen && (
                              <p className="text-[12px] text-[#182D4A]/70 mt-3 font-medium bg-blue-50 border border-blue-100 p-2 rounded flex items-center gap-2 w-fit">
                                  <FileText size={14} className="text-blue-500"/>
                                  File saat ini: <span className="font-bold">{selectedItem.dokumen}</span>
                              </p>
                          )}
                      </div>

                      {/* BOX PREVIEW MINI */}
                      <div className="w-full md:w-64 shrink-0 bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg p-2 h-44 flex flex-col justify-center items-center text-center overflow-hidden relative shadow-inner">
                          {previewUrl ? (
                              <div className="w-full h-full relative group">
                                  <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded" title="Preview Baru"/>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                      <a href={previewUrl} target="_blank" rel="noreferrer" className="bg-white text-[#071E3D] px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm hover:scale-105 transition-transform flex items-center gap-1.5">
                                          <Eye size={14}/> Buka Penuh
                                      </a>
                                  </div>
                              </div>
                          ) : isEditing && selectedItem?.dokumen ? (
                              <div className="w-full h-full relative group">
                                  <iframe src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded" title="Preview Current"/>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                      <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="bg-white text-[#071E3D] px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm hover:scale-105 transition-transform flex items-center gap-1.5">
                                          <Eye size={14}/> Buka Penuh
                                      </a>
                                  </div>
                              </div>
                          ) : (
                              <div className="text-[#182D4A]/40 flex flex-col items-center">
                                  <FileText size={42} className="mb-2 opacity-30" />
                                  <p className="text-[11px]">Pilih file PDF untuk melihat pratinjau.</p>
                              </div>
                          )}
                      </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3 shrink-0">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">Batal</button>
              <button type="submit" form="skkniForm" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px] disabled:opacity-70 transition-colors">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {isEditing ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA] shrink-0">
              <h3 className="text-[18px] font-bold text-[#071E3D] flex items-center m-0">
                <FileText className="mr-2 text-[#CC6B27]"/> Detail Data Standar
              </h3>
              <button onClick={closeDetailModal} className="text-[#182D4A] hover:text-red-500 p-1.5 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="bg-[#FAFAFA] p-5 rounded-lg border border-[#071E3D]/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Judul Standar</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.judul_skkni}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Nomor Standar</label>
                    <p className="font-bold text-[#CC6B27] mt-0.5 m-0 bg-[#CC6B27]/10 w-fit px-2 py-0.5 rounded">{selectedItem.no_skkni}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Jenis Standar</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.jenis_standar}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Legalitas</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.legalitas || "-"}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Sektor / Sub Sektor</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.sektor || "-"} / {selectedItem.sub_sektor || "-"}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-[11px] uppercase font-bold tracking-wider">Penerbit</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5 m-0">{selectedItem.penerbit || "-"}</p>
                  </div>
                </div>

                <div className="md:col-span-2 mt-6 pt-4 border-t border-[#071E3D]/10">
                  <label className="text-[13px] font-bold text-[#071E3D] mb-2 block flex items-center gap-2">
                    <Eye className="text-[#CC6B27]" size={16} /> Pratinjau Dokumen
                  </label>
                  
                  {selectedItem.dokumen ? (
                    <div className="w-full h-[400px] mt-2 border border-[#071E3D]/20 rounded-lg bg-gray-50 overflow-hidden relative shadow-inner group">
                        <iframe 
                            src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0`} 
                            className="w-full h-full rounded-lg" 
                            title="Detail PDF"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="bg-white text-[#071E3D] px-5 py-2.5 rounded-full text-[13px] font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                                <Eye size={16}/> Buka Dokumen di Tab Baru
                            </a>
                        </div>
                    </div>
                  ) : (
                    <p className="text-[#182D4A]/50 italic text-[13px] mt-1">Tidak ada dokumen yang dilampirkan.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end shrink-0">
                <button onClick={closeDetailModal} className="px-6 py-2 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-white hover:bg-[#E2E8F0] transition-colors text-[13px]">
                  Tutup
                </button>
            </div>

          </div>
        </div>
      )}

      {/* Style CSS untuk Scrollbar Modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />

    </div>
  );
};

export default Skkni;