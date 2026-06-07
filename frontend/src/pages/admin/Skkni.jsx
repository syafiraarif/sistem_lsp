import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, FileText, Loader2, Filter,
  Sparkles, ClipboardList, Layers, BookOpen, Upload, FileSearch
} from "lucide-react";

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
    setSelectedItem(null);
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
    setSelectedItem(item);
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

    const errorMsg = validateForm();
    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

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

  const totalSkkni = dataList.filter(item => item.jenis_standar === 'SKKNI').length;
  const totalSkk = dataList.filter(item => item.jenis_standar === 'SKK').length;
  const totalSi = dataList.filter(item => item.jenis_standar === 'SI').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Data Standar / SKKNI
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola Standar
                <br />
                <span className="text-orange-500">Kompetensi</span>
              </h1>

              <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola master data SKKNI, Standar Khusus, Standar Internasional, dan dokumen pendukung.
              </p>

              <button 
                onClick={openModal} 
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Plus size={16} />
                Tambah SKKNI
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Total Standar
                </p>

                <h2 className="mb-4 text-5xl font-black leading-none">
                  {dataList.length}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Ringkasan data standar yang tersedia dalam sistem.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <HeroPill label="SKKNI" value={totalSkkni} />
                  <HeroPill label="SKK" value={totalSkk} />
                  <HeroPill label="SI" value={totalSi} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAT */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MiniStat icon={<BookOpen size={22} />} label="Total Standar" value={dataList.length} />
          <MiniStat icon={<FileText size={22} />} label="SKKNI" value={totalSkkni} />
          <MiniStat icon={<Layers size={22} />} label="SKK" value={totalSkk} />
          <MiniStat icon={<ClipboardList size={22} />} label="SI" value={totalSi} />
        </section>

        {/* TABLE CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <ClipboardList size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Daftar Standar
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Data Standar / SKKNI
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari berdasarkan nomor atau judul standar, lalu filter berdasarkan jenis.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
                <div className="relative w-full lg:w-[340px]">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Cari No atau Judul SKKNI..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative w-full md:w-56">
                  <Filter size={18} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" />
                  <select 
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Nomor SKKNI</TableHead>
                  <TableHead>Judul SKKNI</TableHead>
                  <TableHead center>Jenis</TableHead>
                  <TableHead center>Dokumen</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
                      <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
                        Memuat Data Standar
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id_skkni} className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30">
                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-black text-orange-500">
                          {item.no_skkni}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[430px] font-black text-[#071E3D]">
                          {item.judul_skkni}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#071E3D]">
                          {item.jenis_standar}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.dokumen ? (
                          <a href={`http://localhost:3000/uploads/${item.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#071E3D]/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-orange-500 hover:text-white">
                            <FileText size={13}/>
                            Lihat File
                          </a>
                        ) : (
                          <span className="text-xs font-bold italic text-slate-300">Tidak Ada</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            onClick={() => openDetailModal(item)}
                            title="Lihat Detail"
                            className="bg-[#071E3D]/10 text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                          >
                            <Eye size={16} />
                          </IconButton>

                          <IconButton
                            onClick={() => handleEdit(item)}
                            title="Edit Data"
                            className="bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            <Edit2 size={16} />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDelete(item.id_skkni)}
                            title="Hapus Data"
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <FileText size={48} className="mx-auto mb-3 text-[#071E3D]/20"/>
                      <p className="text-sm font-black text-[#071E3D]">
                        Belum ada data SKKNI tersedia.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL FORM CREATE/EDIT */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
              
              <div className="flex items-start justify-between border-b border-slate-100 p-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                    {isEditing ? <Edit2 size={20} className="text-orange-500" /> : <Plus size={20} className="text-orange-500" />}
                    {isEditing ? "Edit Data SKKNI" : "Tambah SKKNI Baru"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Lengkapi data standar dan unggah dokumen PDF pendukung.
                  </p>
                </div>

                <button onClick={closeModal} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                  <X size={20}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="skkniForm" onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  
                  <div className="space-y-5">
                    <FormSection title="Informasi Standar">
                      <div>
                        <Label>Judul Standar</Label>
                        <input required type="text" name="judul_skkni" value={formData.judul_skkni} onChange={handleInputChange} className={inputClass} placeholder="Masukkan Judul Standar"/>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Nomor Standar</Label>
                          <input required type="text" name="no_skkni" value={formData.no_skkni} onChange={handleInputChange} className={inputClass} placeholder="Contoh: KEP/123/2023"/>
                        </div>

                        <div>
                          <select name="jenis_standar" value={formData.jenis_standar} onChange={handleInputChange} className={inputClass}>
                            <option value="SKKNI">SKKNI</option>
                            <option value="SKK">Standar Khusus (SKK)</option>
                            <option value="SI">Standar Internasional (SI)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Sektor</Label>
                          <input type="text" name="sektor" value={formData.sektor} onChange={handleInputChange} className={inputClass}/>
                        </div>

                        <div>
                          <Label>Sub Sektor</Label>
                          <input type="text" name="sub_sektor" value={formData.sub_sektor} onChange={handleInputChange} className={inputClass}/>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Tahun Terbit</Label>
                          <input type="text" name="" value={formData.legalitas} onChange={handleInputChange} className={inputClass}/>
                        </div>

                        <div>
                          <Label>Lembaga Penerbit</Label>
                          <input type="text" name="penerbit" value={formData.penerbit} onChange={handleInputChange} className={inputClass}/>
                        </div>
                      </div>
                    </FormSection>
                  </div>

                  <div className="space-y-5">
                    <FormSection title="Dokumen Pendukung">
                      <div className="rounded-[24px] border border-orange-100 bg-orange-50/60 p-5">
                        <Label>
                          <span className="inline-flex items-center gap-2">
                            <Upload size={16} className="text-orange-500"/>
                            Upload Dokumen Pendukung (PDF)
                          </span>
                        </Label>

                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="block w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-2 text-sm font-semibold text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#071E3D] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-orange-500"
                        />
                        
                        {isEditing && !dokumenFile && selectedItem?.dokumen && (
                          <p className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-[#071E3D]">
                            <FileText size={14} className="text-blue-500"/>
                            File saat ini: <span>{selectedItem.dokumen}</span>
                          </p>
                        )}
                      </div>
                    </FormSection>

                    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <span className="text-xs font-black uppercase tracking-widest text-[#071E3D]">Preview Dokumen</span>
                      </div>

                      <div className="relative flex-1 bg-white">
                        {previewUrl ? (
                          <div className="group absolute inset-0">
                            <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="h-full w-full" title="Preview Baru"/>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                              <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#071E3D] shadow-sm transition-transform hover:scale-105">
                                <Eye size={14}/>
                                Buka Penuh
                              </a>
                            </div>
                          </div>
                        ) : isEditing && selectedItem?.dokumen ? (
                          <div className="group absolute inset-0">
                            <iframe src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0&navpanes=0&scrollbar=0`} className="h-full w-full" title="Preview Current"/>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                              <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#071E3D] shadow-sm transition-transform hover:scale-105">
                                <Eye size={14}/>
                                Buka Penuh
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                            <FileSearch size={48} className="mb-3 opacity-30" />
                            <p className="text-xs font-bold">Pilih file PDF untuk melihat pratinjau.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-6">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white">
                  Batal
                </button>
                <button type="submit" form="skkniForm" disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isEditing ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL DETAIL */}
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
              
              <div className="flex items-start justify-between border-b border-slate-100 p-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                    <FileText className="text-orange-500"/>
                    Detail Data Standar
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Rincian informasi standar dan dokumen pendukung.
                  </p>
                </div>

                <button onClick={closeDetailModal} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6">
                  <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                    <h4 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-widest text-[#071E3D]">
                      Informasi Standar
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DetailItem label="Judul Standar" value={selectedItem.judul_skkni} />
                      <DetailItem label="Nomor Standar">
                        <span className="inline-flex rounded-xl bg-orange-50 px-3 py-1.5 font-mono text-orange-500">
                          {selectedItem.no_skkni}
                        </span>
                      </DetailItem>
                      <DetailItem label="Legalitas" value={selectedItem.legalitas || "-"} />
                      <DetailItem label="Sektor / Sub Sektor" value={`${selectedItem.sektor || "-"} / ${selectedItem.sub_sektor || "-"}`} />
                      <DetailItem label="Penerbit" value={selectedItem.penerbit || "-"} />
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-widest text-[#071E3D]">
                      <Eye className="text-orange-500" size={16} />
                      Pratinjau Dokumen
                    </h4>
                    
                    {selectedItem.dokumen ? (
                      <div className="group relative mt-2 h-[500px] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
                        <iframe 
                          src={`http://localhost:3000/uploads/${selectedItem.dokumen}#toolbar=0`} 
                          className="h-full w-full rounded-2xl" 
                          title="Detail PDF"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <a href={`http://localhost:3000/uploads/${selectedItem.dokumen}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] shadow-xl transition-transform hover:scale-105">
                            <Eye size={16}/>
                            Buka Dokumen di Tab Baru
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                        <p className="text-sm font-bold italic text-slate-400">Tidak ada dokumen yang dilampirkan.</p>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-6">
                <button onClick={closeDetailModal} className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white">
                  Tutup
                </button>
              </div>

            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
        `}} />
      </div>
    </div>
  );
};

const inputClass = "w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10";

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

function IconButton({ children, onClick, title, className }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all ${className}`}
    >
      {children}
    </button>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-5 border-b border-slate-100 pb-4 text-sm font-black uppercase tracking-widest text-[#071E3D]">
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </label>
  );
}

function DetailItem({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="text-sm font-black text-[#071E3D]">{children || value}</div>
    </div>
  );
}

export default Skkni;