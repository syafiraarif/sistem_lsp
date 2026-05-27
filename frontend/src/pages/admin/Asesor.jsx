import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  getProvinsi,
  getKota,
  getKecamatan,
  getKelurahan,
} from "../../services/wilayah.service";
import {
  Search, Plus, Eye, Edit2, Trash2, X, Save, User as UserIcon, Loader2, 
  Upload, FileSpreadsheet, Briefcase, GraduationCap, MapPin, Mail, Users, 
  Key, Filter, Sparkles, BadgeCheck, ShieldCheck, Download, ChevronLeft, ChevronRight,
  ClipboardList
} from "lucide-react";

const Asesor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [skemaList, setSkemaList] = useState([]);
  const [sameAsKtp, setSameAsKtp] = useState(false);

  const [emailSentIds, setEmailSentIds] = useState(() => {
    const saved = localStorage.getItem("emailSentAsesor");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(
      "emailSentAsesor",
      JSON.stringify(Array.from(emailSentIds))
    );
  }, [emailSentIds]);

  const [sendingEmailId, setSendingEmailId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [fileExcel, setFileExcel] = useState(null);

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);
  const [kebangsaanList, setKebangsaanList] = useState([]); // State untuk Dropdown Kebangsaan

  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKotaId, setSelectedKotaId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");

  const [errors, setErrors] = useState({});

  const initialFormState = {
    nik: "", email: "", no_hp: "", gelar_depan: "", nama_lengkap: "",
    gelar_belakang: "", jenis_kelamin: "laki-laki", tempat_lahir: "",
    tanggal_lahir: "", kebangsaan: "Indonesia", pendidikan_terakhir: "S1",
    tahun_lulus: "", institut_asal: "", alamat: "", alamat_domisili: "", rt: "", rw: "",
    provinsi: "", kota: "", kecamatan: "", kelurahan: "", kode_pos: "",
    bidang_keahlian: "", no_reg_asesor: "", no_lisensi: "", masa_berlaku: "",
    status_asesor: "aktif",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/asesor?page=${page}&limit=${pagination.limit}&search=${search}`);
      const resBody = response.data !== undefined ? response.data : response;

      let listData = [];
      let pag = null;

      if (Array.isArray(resBody.data)) {
        listData = resBody.data;
      } else if (resBody.data?.data && Array.isArray(resBody.data.data)) {
        listData = resBody.data.data;
        pag = resBody.data.pagination;
      } else if (Array.isArray(resBody)) {
        listData = resBody;
      }

      setData(listData);
      setPagination((prev) => ({
        ...prev,
        page: pag?.currentPage || page,
        total: pag?.totalItems || listData.length,
        totalPages: pag?.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, searchTerm);
    loadProvinsi();
    loadKebangsaan(); // Memanggil fungsi loadKebangsaan saat komponen dimuat
    loadSkema();
  }, [pagination.page, searchTerm]);

  const loadProvinsi = async () => {
    try {
      const res = await getProvinsi();
      setProvinsiList(extractArray(res));
    } catch (err) {
      console.error("Gagal load provinsi", err);
    }
  };

    const loadSkema = async () => {
    try {
      const response = await api.get("/admin/dropdown/skema");
      const resData = response.data !== undefined ? response.data : response;

      setSkemaList(extractArray(resData));
    } catch (error) {
      console.error("Gagal load skema", error);
    }
  };

  const loadKebangsaan = async () => {
    try {
      // Sebelumnya: const response = await api.get('/dropdown/kebangsaan');
      
      // UBAH MENJADI (jika prefix backend kamu adalah /public):
      const response = await api.get('/public/dropdown/kebangsaan'); 
      
      const resData = response.data !== undefined ? response.data : response;
      setKebangsaanList(extractArray(resData));
    } catch (error) {
      console.error("Gagal load kebangsaan", error);
    }
  };

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const handleProvinsiChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedProvinsiId(id);
    setFormData({ ...formData, provinsi: id ? text : "", kota: "", kecamatan: "", kelurahan: "" });
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    setSelectedKotaId(""); setSelectedKecamatanId("");

    if (id) {
      try {
        const res = await getKota(id);
        setKotaList(extractArray(res));
      } catch (err) { console.error(err); }
    }
  };

    const handleSameAddress = (checked) => {
    setSameAsKtp(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        alamat_domisili: prev.alamat,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        alamat_domisili: "",
      }));
    }
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKotaId(id);
    setFormData({ ...formData, kota: id ? text : "", kecamatan: "", kelurahan: "" });
    setKecamatanList([]); setKelurahanList([]); setSelectedKecamatanId("");

    if (id) {
      try {
        const res = await getKecamatan(id);
        setKecamatanList(extractArray(res));
      } catch (err) { console.error(err); }
    }
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKecamatanId(id);
    setFormData({ ...formData, kecamatan: id ? text : "", kelurahan: "" });
    setKelurahanList([]);

    if (id) {
      try {
        const res = await getKelurahan(id);
        setKelurahanList(extractArray(res));
      } catch (err) { console.error(err); }
    }
  };

  const handleKelurahanChange = (e) => {
    const text = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, kelurahan: e.target.value ? text : "" });
  };

  const validateInput = (name, value) => {
    let errorMsg = "";

    if (name === "nik") {
      if (!value) errorMsg = "NIK tidak boleh kosong.";
      else if (value.length !== 16) errorMsg = "NIK harus tepat 16 digit.";
    } else if (name === "no_hp") {
      if (!value) errorMsg = "No HP tidak boleh kosong.";
      else if (value.length < 12 || value.length > 13) errorMsg = "No HP harus 12-13 digit.";
    } else if (name === "email") {
      if (!value) errorMsg = "Email tidak boleh kosong.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Format email tidak valid.";
    } else if (name === "nama_lengkap") {
      if (!value || value.trim() === "") errorMsg = "Nama Lengkap wajib diisi.";
    } else if (name === "bidang_keahlian") {
      if (!value || value.trim() === "") errorMsg = "Bidang Keahlian wajib diisi.";
    } else if (name === "kode_pos") {
      if (value && value.length > 0 && value.length !== 5) errorMsg = "Kode Pos Indonesia wajib 5 digit.";
    } else if (name === "tahun_lulus" && value) {
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();
      if (value.length !== 4) errorMsg = "Tahun lulus harus 4 digit angka.";
      else if (year < 1950) errorMsg = "Tahun lulus tidak valid.";
      else if (year > currentYear) errorMsg = "Maksimal tahun ini.";
    } else if (name === "tanggal_lahir" && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      if (selectedDate > today) errorMsg = "Tanggal lahir tidak boleh di masa depan.";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (["nik", "no_hp", "rt", "rw", "kode_pos", "tahun_lulus"].includes(name)) {
      finalValue = value.replace(/\D/g, "");
    } else if (["nama_lengkap", "tempat_lahir", "kebangsaan", "institut_asal", "bidang_keahlian"].includes(name)) {
      finalValue = value.replace(/[0-9]/g, "");
    }

    if (name === "tahun_lulus" && finalValue.length > 4) finalValue = finalValue.slice(0, 4);
    if (name === "kode_pos" && finalValue.length > 5) finalValue = finalValue.slice(0, 5);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: finalValue,
      };

      if (name === "alamat" && sameAsKtp) {
        updated.alamat_domisili = finalValue;
      }

      return updated;
    });
    validateInput(name, finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (["email", "no_hp", "nik"].includes(key) && isEditMode) return;
      if (!validateInput(key, formData[key])) isValid = false;
    });

    if (!isValid) return Swal.fire("Peringatan", "Perbaiki isian yang masih kosong atau salah!", "warning");

    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const payload = { ...formData };
      if (payload.tanggal_lahir === "") payload.tanggal_lahir = null;
      if (payload.masa_berlaku === "") payload.masa_berlaku = null;
      payload.tahun_lulus = payload.tahun_lulus ? parseInt(payload.tahun_lulus) : null;
      payload.nik = String(payload.nik).trim();
      payload.no_hp = String(payload.no_hp).trim();

      if (isEditMode) {
        await api.put(`/admin/asesor/${currentId}`, payload);
        Swal.fire("Berhasil", "Data asesor diperbarui", "success");
      } else {
        await api.post("/admin/asesor", payload);
        Swal.fire("Berhasil", "Asesor baru ditambahkan", "success");
      }

      setShowModal(false);
      fetchData(pagination.page);
      resetForm();
    } catch (error) {
      Swal.fire("Gagal", error.response?.data?.message || "Gagal menyimpan data.", "error");
    }
  };

  const handleSendAccount = async (id_user) => {
    if (!id_user) return Swal.fire("Error", "Akun tidak ditemukan.", "error");

    const confirm = await Swal.fire({
      title: "Kirim Informasi Akun?",
      text: "Sistem akan mengirim email berisi Username dan Password ke asesor.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Kirim",
    });

    if (confirm.isConfirmed) {
      setSendingEmailId(id_user);
      try {
        await api.post(`/admin/send-email/${id_user}`);
        setEmailSentIds((prev) => new Set(prev).add(id_user));
        Swal.fire("Terkirim!", "Informasi akun berhasil dikirim.", "success");
      } catch (error) {
        Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan.", "error");
      } finally {
        setSendingEmailId(null);
      }
    }
  };

  const handleResetPassword = async (id_user, email) => {
    const confirm = await Swal.fire({
      title: "Reset Password?",
      text: `Sandi untuk akun ${email || "ini"} akan direset dan dikirim ke email asesor.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Reset",
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const response = await api.post(`/admin/asesor/${id_user}/reset-password`);
        const resData = response.data !== undefined ? response.data : response;
        Swal.fire("Berhasil Reset!", `Sandi baru untuk <b>${resData.data.username}</b> telah dikirim ke email.`, "success");
      } catch (error) {
        Swal.fire("Gagal", error.response?.data?.message || "Gagal mereset password", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedProvinsiId(""); setSelectedKotaId(""); setSelectedKecamatanId("");
    setIsEditMode(false); setIsDetailMode(false); setCurrentId(null); setErrors({});
  };

  const handleAdd = () => { resetForm(); setShowModal(true); };

  const handleEdit = async (item) => {
    resetForm();
    setIsEditMode(true);
    setCurrentId(item.id_user || item.id);
    setFormData({
      nik: item.nik || "", email: item.user?.email || item.email || "", no_hp: item.user?.no_hp || item.no_hp || "",
      gelar_depan: item.gelar_depan || "", nama_lengkap: item.nama_lengkap || "", gelar_belakang: item.gelar_belakang || "",
      jenis_kelamin: item.jenis_kelamin || "laki-laki", tempat_lahir: item.tempat_lahir || "",
      tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split("T")[0] : "",
      kebangsaan: item.kebangsaan || "Indonesia", pendidikan_terakhir: item.pendidikan_terakhir || "S1",
      tahun_lulus: item.tahun_lulus || "", institut_asal: item.institut_asal || "",
      alamat: item.alamat || "", alamat_domisili: item.alamat_domisili || "", rt: item.rt || "", rw: item.rw || "",
      provinsi: item.provinsi || "", kota: item.kota || "", kecamatan: item.kecamatan || "",
      kelurahan: item.kelurahan || "", kode_pos: item.kode_pos || "",
      bidang_keahlian: item.bidang_keahlian || "", no_reg_asesor: item.no_reg_asesor || "",
      no_lisensi: item.no_lisensi || "", masa_berlaku: item.masa_berlaku ? item.masa_berlaku.split("T")[0] : "",
      status_asesor: item.status_asesor || "aktif",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/asesor/${id}`);
        Swal.fire("Terhapus!", "Data asesor telah dihapus.", "success");
        fetchData(pagination.page);
      } catch (error) {
        Swal.fire("Gagal", "Tidak bisa menghapus data.", "error");
      }
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!fileExcel) return Swal.fire("Peringatan", "Pilih file Excel terlebih dahulu", "warning");
    const formUpload = new FormData();
    formUpload.append("file", fileExcel);
    try {
      Swal.fire({ title: "Proses Import...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.post("/admin/import-asesor", formUpload, { headers: { "Content-Type": "multipart/form-data" } });
      Swal.fire("Sukses", "Data Asesor berhasil diimport", "success");
      setShowImportModal(false);
      setFileExcel(null);
      fetchData(pagination.page);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Gagal import excel", "error");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/admin/download-template-asesor", { 
        responseType: "blob" 
      });

      const blob = new Blob([response.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Template_Import_Asesor.xlsx");
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire("Berhasil", "Template berhasil didownload", "success");
    } catch (error) {
      console.error("Download error:", error);
      Swal.fire("Error", "Gagal mengambil template dari server", "error");
    }
  };

  const inputClass = (name) => `w-full p-2.5 border rounded-lg text-[13px] text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium placeholder:text-[#182D4A]/40
    ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#071E3D]/20 focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10'}`;

  const filteredData = data.filter((item) => {
    const matchSearch =
      (item.nama_lengkap && item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nik && item.nik.includes(searchTerm));
    const matchStatus = filterStatus ? item.status_asesor === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalAktif = data.filter((item) => item.status_asesor === "aktif").length;
  const totalNonaktif = data.filter((item) => item.status_asesor === "nonaktif").length;

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#CC6B27]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              Data Asesor
            </div>
            <h2 className="text-[24px] md:text-[28px] font-black text-[#071E3D] m-0 mb-1">Data Asesor</h2>
            <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium">Kelola data profil, sertifikasi, dan akun login asesor.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button onClick={handleDownloadTemplate} className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-white text-[#CC6B27] border border-[#CC6B27]/50 hover:bg-[#CC6B27]/10 hover:border-[#CC6B27] shadow-sm transition-all flex items-center justify-center gap-2 text-[13px]">
              <Download size={18} /> Template Excel
            </button>
            <button onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-white text-[#071E3D] border border-[#071E3D]/20 hover:bg-[#071E3D]/5 shadow-sm transition-all flex items-center justify-center gap-2 text-[13px]">
              <FileSpreadsheet size={18} /> Import Excel
            </button>
            <button onClick={handleAdd} className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[13px]">
              <Plus size={18} /> Tambah Asesor
            </button>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={<Users size={22}/>} label="Total Asesor" value={`${data.length} Data`} />
        <StatCard icon={<BadgeCheck size={22}/>} label="Asesor Aktif" value={`${totalAktif} Aktif`} tone="green" />
        <StatCard icon={<ShieldCheck size={22}/>} label="Nonaktif" value={`${totalNonaktif} Nonaktif`} tone="red" />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <ClipboardList size={18} className="text-[#CC6B27]"/> Daftar Asesor
          </h4>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64 relative group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
              <input type="text" placeholder="Cari Nama atau NIK..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="w-full sm:w-48 relative group">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors z-10" />
              <select className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px] appearance-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-12 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">NIK</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Nama Lengkap</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Keahlian & MET</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-64">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-3" size={36} />
                    <p className="text-[#182D4A] font-medium text-[14px]">Memuat data asesor...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <UserIcon size={48} className="text-[#071E3D]/20 mx-auto mb-3"/>
                    <p className="text-[#182D4A] font-medium text-[14px]">Belum ada data asesor ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_user || item.id || index} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="py-3 px-4 font-mono text-[13px] font-bold text-[#CC6B27]">{item.nik || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#071E3D] text-[13.5px]">{item.gelar_depan} {item.nama_lengkap} {item.gelar_belakang}</div>
                      <div className="text-[11px] text-[#182D4A]/70 mt-0.5 flex items-center gap-1.5"><Mail size={12}/> {item.user?.email || item.email || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px]">
                      <div className="font-semibold text-[#071E3D]">{item.bidang_keahlian || "-"}</div>
                      <div className="text-[11px] text-[#182D4A]/70 mt-0.5">{item.no_reg_asesor || "MET: -"}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.status_asesor === "aktif" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                      }`}>{item.status_asesor}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => handleResetPassword(item.id_user || item.id, item.user?.email || item.email)} className="px-2 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all border bg-[#182D4A]/5 text-[#182D4A] border-[#182D4A]/20 hover:bg-[#182D4A] hover:text-white" title="Reset Password">
                          <Key size={14} /> Sandi
                        </button>
                        <button onClick={() => handleSendAccount(item.id_user)} disabled={emailSentIds.has(item.id_user) || sendingEmailId === item.id_user} className={`px-2 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all border ${emailSentIds.has(item.id_user) ? "bg-green-50 text-green-500 border-green-200 cursor-not-allowed opacity-60" : "bg-[#CC6B27]/5 text-[#CC6B27] border-[#CC6B27]/20 hover:bg-[#CC6B27] hover:text-white"}`} title="Kirim Akun via Email">
                          {sendingEmailId === item.id_user ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Email
                        </button>
                        <button onClick={() => { handleEdit(item); setIsDetailMode(true); }} className="p-1.5 text-[#182D4A] bg-[#182D4A]/10 rounded-lg hover:bg-[#182D4A] hover:text-white transition-colors" title="Detail"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#CC6B27] bg-[#CC6B27]/10 rounded-lg hover:bg-[#CC6B27] hover:text-white transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id_user || item.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white border border-red-100 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-[13px] text-[#182D4A] font-medium">
            <span>Halaman {pagination.page} dari {pagination.totalPages || 1}</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] transition-all disabled:opacity-50" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                <ChevronLeft size={18}/>
              </button>
              <span className="px-4 py-1.5 font-bold bg-[#FAFAFA] border border-[#071E3D]/10 rounded-md text-[#071E3D]">{pagination.page} / {pagination.totalPages || 1}</span>
              <button className="p-1.5 border border-[#071E3D]/20 rounded-md hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] transition-all disabled:opacity-50" disabled={pagination.page >= (pagination.totalPages || 1)} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#CC6B27]/10 rounded-lg text-[#CC6B27]">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#071E3D] m-0">
                    {isDetailMode ? "Detail Data Asesor" : isEditMode ? "Edit Data Asesor" : "Tambah Asesor Baru"}
                  </h3>
                  <p className="text-[12px] text-[#182D4A]/70 m-0">Lengkapi informasi data diri, sertifikasi, dan domisili.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
              <form id="asesorForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. Identitas */}
                <SectionTitle icon={<UserIcon size={16}/>} title="Identitas Pribadi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="NIK" required error={errors.nik}>
                    <input type="text" name="nik" value={formData.nik} onChange={handleChange} maxLength="16" required disabled={isDetailMode} placeholder="16 Digit Angka" className={inputClass('nik')}/>
                  </FormInput>
                  <FormInput label="Nama Lengkap" required error={errors.nama_lengkap}>
                    <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required disabled={isDetailMode} placeholder="Nama tanpa gelar" className={inputClass('nama_lengkap')}/>
                  </FormInput>
                  <FormInput label="Gelar Depan" error={errors.gelar_depan}>
                    <input type="text" name="gelar_depan" value={formData.gelar_depan} onChange={handleChange} disabled={isDetailMode} placeholder="Dr., Ir." className={inputClass('gelar_depan')}/>
                  </FormInput>
                  <FormInput label="Gelar Belakang" error={errors.gelar_belakang}>
                    <input type="text" name="gelar_belakang" value={formData.gelar_belakang} onChange={handleChange} disabled={isDetailMode} placeholder="S.Kom, M.T" className={inputClass('gelar_belakang')}/>
                  </FormInput>
                  <FormInput label="Email Login" required error={errors.email}>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isDetailMode || isEditMode} placeholder="Email aktif" className={inputClass('email')}/>
                  </FormInput>
                  <FormInput label="No HP / WhatsApp" required error={errors.no_hp}>
                    <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} maxLength="13" required disabled={isDetailMode} placeholder="08xxxxxxxx" className={inputClass('no_hp')}/>
                  </FormInput>
                  <FormInput label="Tempat Lahir">
                    <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isDetailMode} placeholder="Hanya huruf" className={inputClass('tempat_lahir')}/>
                  </FormInput>
                  <FormInput label="Tanggal Lahir" error={errors.tanggal_lahir}>
                    <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} disabled={isDetailMode} className={inputClass('tanggal_lahir')}/>
                  </FormInput>
                  <FormInput label="Jenis Kelamin">
                    <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} disabled={isDetailMode} className={inputClass('jenis_kelamin')}>
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </FormInput>
                  <FormInput label="Kebangsaan">
                    <select
                      name="kebangsaan"
                      value={formData.kebangsaan}
                      onChange={handleChange}
                      disabled={isDetailMode}
                      className={inputClass('kebangsaan')}
                    >
                      <option value="">Pilih Kebangsaan</option>
                      {kebangsaanList.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </FormInput>
                </div>

                {/* 2. Sertifikasi */}
                <SectionTitle icon={<Briefcase size={16}/>} title="Data Sertifikasi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                  <FormInput label="Bidang Keahlian" required error={errors.bidang_keahlian}>
                    <select
                      name="bidang_keahlian"
                      value={formData.bidang_keahlian}
                      onChange={handleChange}
                      required
                      disabled={isDetailMode}
                      className={inputClass("bidang_keahlian")}
                    >
                      <option value="">Pilih Skema</option>

                      {skemaList.map((item) => (
                        <option
                          key={item.id_skema}
                          value={item.judul_skema}
                        >
                          {item.judul_skema}
                        </option>
                      ))}
                    </select>
                  </FormInput>
                  </div>
                  <FormInput label="No. Registrasi (MET)">
                    <input type="text" name="no_reg_asesor" value={formData.no_reg_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass('no_reg_asesor')}/>
                  </FormInput>
                  <FormInput label="No. Sertifikat Kompetensi">
                    <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} disabled={isDetailMode} className={inputClass('no_lisensi')}/>
                  </FormInput>
                  <FormInput label="Masa Berlaku Sertifikat">
                    <input type="date" name="masa_berlaku" value={formData.masa_berlaku} onChange={handleChange} disabled={isDetailMode} className={inputClass('masa_berlaku')}/>
                  </FormInput>
                  <FormInput label="Status Asesor">
                    <select name="status_asesor" value={formData.status_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass('status_asesor')}>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Non-Aktif</option>
                    </select>
                  </FormInput>
                </div>

                {/* 3. Pendidikan */}
                <SectionTitle icon={<GraduationCap size={16}/>} title="Pendidikan" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Pendidikan Terakhir">
                    <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} disabled={isDetailMode} className={inputClass('pendidikan_terakhir')}>
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </FormInput>
                  <FormInput label="Tahun Lulus" error={errors.tahun_lulus}>
                    <input type="text" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleChange} disabled={isDetailMode} placeholder="YYYY" maxLength="4" className={inputClass('tahun_lulus')}/>
                  </FormInput>
                  <div className="md:col-span-2">
                    <FormInput label="Nama Institusi / Universitas" error={errors.institut_asal}>
                      <input type="text" name="institut_asal" value={formData.institut_asal} onChange={handleChange} disabled={isDetailMode} className={inputClass('institut_asal')}/>
                    </FormInput>
                  </div>
                </div>

                {/* 4. Alamat */}
                <SectionTitle icon={<MapPin size={16}/>} title="Alamat & Domisili" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormInput label="Alamat KTP" error={errors.alamat}>
                      <textarea name="alamat" rows="2" value={formData.alamat} onChange={handleChange} disabled={isDetailMode} placeholder="Nama jalan, perumahan..." className={`${inputClass('alamat')} resize-none`}></textarea>
                    </FormInput>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-[12px] font-medium text-[#182D4A] mb-2">
                      <input
                        type="checkbox"
                        checked={sameAsKtp}
                        onChange={(e) => handleSameAddress(e.target.checked)}
                        disabled={isDetailMode}
                        className="accent-[#CC6B27]"
                      />
                      Alamat domisili sesuai dengan alamat KTP
                    </label>

                    <FormInput label="Alamat Domisili">
                      <textarea
                        name="alamat_domisili"
                        rows="2"
                        value={formData.alamat_domisili}
                        onChange={handleChange}
                        disabled={isDetailMode || sameAsKtp}
                        placeholder="Isi alamat domisili"
                        className={`${inputClass('alamat_domisili')} resize-none ${
                          sameAsKtp ? "bg-gray-100 text-gray-500" : ""
                        }`}
                      />
                    </FormInput>
                  </div>

                  {isDetailMode ? (
                    <>
                      <FormInput label="Provinsi"><input type="text" value={formData.provinsi || '-'} disabled className={inputClass('provinsi')} /></FormInput>
                      <FormInput label="Kota / Kabupaten"><input type="text" value={formData.kota || '-'} disabled className={inputClass('kota')} /></FormInput>
                      <FormInput label="Kecamatan"><input type="text" value={formData.kecamatan || '-'} disabled className={inputClass('kecamatan')} /></FormInput>
                      <FormInput label="Kelurahan"><input type="text" value={formData.kelurahan || '-'} disabled className={inputClass('kelurahan')} /></FormInput>
                    </>
                  ) : (
                    <>
                      <FormInput label="Provinsi">
                        <select onChange={handleProvinsiChange} value={selectedProvinsiId} className={inputClass('provinsi')}>
                          <option value="">{formData.provinsi ? `[Tersimpan] ${formData.provinsi}` : 'Pilih Provinsi'}</option>
                          {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </FormInput>

                      <FormInput label="Kota / Kabupaten">
                        <select onChange={handleKotaChange} value={selectedKotaId} disabled={!selectedProvinsiId && !formData.kota} className={inputClass('kota')}>
                          <option value="">{formData.kota && !selectedProvinsiId ? `[Tersimpan] ${formData.kota}` : 'Pilih Kota'}</option>
                          {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </FormInput>

                      <FormInput label="Kecamatan">
                        <select onChange={handleKecamatanChange} value={selectedKecamatanId} disabled={!selectedKotaId && !formData.kecamatan} className={inputClass('kecamatan')}>
                          <option value="">{formData.kecamatan && !selectedKotaId ? `[Tersimpan] ${formData.kecamatan}` : 'Pilih Kecamatan'}</option>
                          {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </FormInput>

                      <FormInput label="Kelurahan">
                        <select onChange={handleKelurahanChange} disabled={!selectedKecamatanId && !formData.kelurahan} className={inputClass('kelurahan')}>
                          <option value="">{formData.kelurahan && !selectedKecamatanId ? `[Tersimpan] ${formData.kelurahan}` : 'Pilih Kelurahan'}</option>
                          {kelurahanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </FormInput>
                    </>
                  )}

                  <div className="grid grid-cols-3 gap-3 md:col-span-2">
                    <FormInput label="RT"><input type="text" name="rt" value={formData.rt} onChange={handleChange} disabled={isDetailMode} className={inputClass('rt')}/></FormInput>
                    <FormInput label="RW"><input type="text" name="rw" value={formData.rw} onChange={handleChange} disabled={isDetailMode} className={inputClass('rw')}/></FormInput>
                    <FormInput label="Kode Pos" error={errors.kode_pos}><input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleChange} disabled={isDetailMode} className={inputClass('kode_pos')}/></FormInput>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
              {isDetailMode ? (
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>Tutup</button>
              ) : (
                <>
                  <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" form="asesorForm" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                    <Save size={16} /> Simpan Data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- IMPORT MODAL --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071E3D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <div>
                <h3 className="text-[16px] font-bold text-[#071E3D] m-0">Import Data Asesor Excel</h3>
                <p className="text-[12px] text-[#182D4A]/70 mt-1 m-0">Unggah file Excel berisi data asesor.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleImportExcel}>
              <div className="p-6 bg-white">
                <div className="border-2 border-dashed border-[#CC6B27]/30 rounded-xl p-8 text-center bg-[#CC6B27]/5">
                  <Upload className="mx-auto text-[#CC6B27] mb-3" size={36} />
                  <p className="text-[13px] font-bold text-[#071E3D] mb-4">Upload file Excel Asesor (.xlsx)</p>
                  <input type="file" accept=".xlsx, .xls" onChange={(e) => setFileExcel(e.target.files[0])} className="block w-full text-[12px] text-[#182D4A] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-bold file:bg-[#071E3D] file:text-white hover:file:bg-[#182D4A] file:cursor-pointer cursor-pointer transition-colors"/>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#071E3D]/10 bg-[#FAFAFA] flex justify-end gap-3">
                <button type="button" className="px-5 py-2.5 rounded-lg font-bold border border-[#071E3D]/20 text-[#182D4A] bg-[#FAFAFA] hover:bg-[#E2E8F0] transition-colors text-[13px]" onClick={() => setShowImportModal(false)}>Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-sm flex items-center gap-2 text-[13px]">
                  <Upload size={16}/> Upload Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      `}} />
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title }) => (
  <h4 className="text-[14px] font-bold text-[#CC6B27] flex items-center gap-2 mb-0 border-b border-[#CC6B27]/20 pb-2">
    {icon} {title}
  </h4>
);

const FormInput = ({ label, required, error, children, icon }) => (
  <div>
    <label className="block text-[12px] font-bold text-[#071E3D] mb-1 flex items-center gap-1">
      {icon} {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-[11px] text-red-500 font-medium block mt-1">{error}</span>}
  </div>
);

export default Asesor;