import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import {
  Search, Plus, Eye, Edit2, Trash2, X, Save, User as UserIcon, Loader2, FileSpreadsheet, Briefcase, GraduationCap, MapPin, Mail, Users, Filter, Sparkles, BadgeCheck, ShieldCheck, Download, ClipboardList, Upload
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
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [fileExcel, setFileExcel] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [provinsiList, setProvinsiList] = useState([]);
  const [kebangsaanList, setKebangsaanList] = useState([]);

  const [kotaListKtp, setKotaListKtp] = useState([]);
  const [kecamatanListKtp, setKecamatanListKtp] = useState([]);
  const [kelurahanListKtp, setKelurahanListKtp] = useState([]);
  const [selectedProvKtp, setSelectedProvKtp] = useState("");
  const [selectedKotaKtp, setSelectedKotaKtp] = useState("");
  const [selectedKecKtp, setSelectedKecKtp] = useState("");

  const [kotaListDom, setKotaListDom] = useState([]);
  const [kecamatanListDom, setKecamatanListDom] = useState([]);
  const [kelurahanListDom, setKelurahanListDom] = useState([]);
  const [selectedProvDom, setSelectedProvDom] = useState("");
  const [selectedKotaDom, setSelectedKotaDom] = useState("");
  const [selectedKecDom, setSelectedKecDom] = useState("");

  const [errors, setErrors] = useState({});

  const initialFormState = {
    nik: "",
    email: "",
    no_hp: "08",
    gelar_depan: "",
    nama_lengkap: "",
    gelar_belakang: "",
    jenis_kelamin: "laki-laki",
    tempat_lahir: "",
    tanggal_lahir: "",
    kebangsaan: "Indonesia",
    pendidikan_terakhir: "S1",
    tahun_lulus: "",
    institut_asal: "",
    alamat_ktp: "",
    rt_ktp: "",
    rw_ktp: "",
    provinsi_ktp: "",
    kota_ktp: "",
    kecamatan_ktp: "",
    kelurahan_ktp: "",
    kode_pos_ktp: "",
    alamat_domisili: "",
    rt_domisili: "",
    rw_domisili: "",
    provinsi_domisili: "",
    kota_domisili: "",
    kecamatan_domisili: "",
    kelurahan_domisili: "",
    kode_pos_domisili: "",
    bidang_keahlian: "",
    no_reg_asesor: "",
    no_lisensi: "",
    masa_berlaku: "",
    status_asesor: "aktif"
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    localStorage.setItem("emailSentAsesor", JSON.stringify(Array.from(emailSentIds)));
  }, [emailSentIds]);

  useEffect(() => {
    fetchData(pagination.page, searchTerm);
  }, [pagination.page, searchTerm]);

  useEffect(() => {
    loadProvinsi();
    loadKebangsaan();
    loadSkema();
  }, []);

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);

    try {
      const response = await api.get(`/admin/asesor?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`);
      const resBody = response.data !== undefined ? response.data : response;
      const listData = Array.isArray(resBody.data) ? resBody.data : resBody.data?.data && Array.isArray(resBody.data.data) ? resBody.data.data : Array.isArray(resBody) ? resBody : [];
      const pag = resBody.data?.pagination || resBody.pagination || null;

      setData(listData);
      setPagination((prev) => ({
        ...prev,
        page: pag?.currentPage || page,
        total: pag?.totalItems || listData.length,
        totalPages: pag?.totalPages || 1
      }));
    } catch (error) {
      console.error("Error fetching:", error);
      notifikasi.gagal("Gagal memuat data asesor");
    } finally {
      setLoading(false);
    }
  };

  const loadProvinsi = async () => {
    try {
      const res = await getProvinsi();
      setProvinsiList(extractArray(res));
    } catch (error) {
      console.error(error);
    }
  };

  const loadSkema = async () => {
    try {
      const res = await api.get("/admin/dropdown/skema");
      setSkemaList(extractArray(res.data !== undefined ? res.data : res));
    } catch (error) {
      console.error(error);
    }
  };

  const loadKebangsaan = async () => {
    try {
      const res = await api.get("/public/dropdown/kebangsaan");
      setKebangsaanList(extractArray(res.data !== undefined ? res.data : res));
    } catch (error) {
      console.error(error);
    }
  };

  const handleWilayahChange = async (e, type, level) => {
    const id = e.target.value;
    const text = e.target.selectedIndex >= 0 && id ? e.target.options[e.target.selectedIndex].text : "";

    setFormData((prev) => {
      const next = { ...prev, [`${level}_${type}`]: text };

      if (level === "provinsi") {
        next[`kota_${type}`] = "";
        next[`kecamatan_${type}`] = "";
        next[`kelurahan_${type}`] = "";
      } else if (level === "kota") {
        next[`kecamatan_${type}`] = "";
        next[`kelurahan_${type}`] = "";
      } else if (level === "kecamatan") {
        next[`kelurahan_${type}`] = "";
      }

      if (type === "ktp" && sameAsKtp) {
        next[`${level}_domisili`] = text;

        if (level === "provinsi") {
          next.kota_domisili = "";
          next.kecamatan_domisili = "";
          next.kelurahan_domisili = "";
        } else if (level === "kota") {
          next.kecamatan_domisili = "";
          next.kelurahan_domisili = "";
        } else if (level === "kecamatan") {
          next.kelurahan_domisili = "";
        }
      }

      return next;
    });

    try {
      if (type === "ktp") {
        if (level === "provinsi") {
          setSelectedProvKtp(id);
          setSelectedKotaKtp("");
          setSelectedKecKtp("");
          setKotaListKtp([]);
          setKecamatanListKtp([]);
          setKelurahanListKtp([]);

          if (id) {
            const res = await getKota(id);
            setKotaListKtp(extractArray(res));
          }
        } else if (level === "kota") {
          setSelectedKotaKtp(id);
          setSelectedKecKtp("");
          setKecamatanListKtp([]);
          setKelurahanListKtp([]);

          if (id) {
            const res = await getKecamatan(id);
            setKecamatanListKtp(extractArray(res));
          }
        } else if (level === "kecamatan") {
          setSelectedKecKtp(id);
          setKelurahanListKtp([]);

          if (id) {
            const res = await getKelurahan(id);
            setKelurahanListKtp(extractArray(res));
          }
        }
      } else {
        if (level === "provinsi") {
          setSelectedProvDom(id);
          setSelectedKotaDom("");
          setSelectedKecDom("");
          setKotaListDom([]);
          setKecamatanListDom([]);
          setKelurahanListDom([]);

          if (id) {
            const res = await getKota(id);
            setKotaListDom(extractArray(res));
          }
        } else if (level === "kota") {
          setSelectedKotaDom(id);
          setSelectedKecDom("");
          setKecamatanListDom([]);
          setKelurahanListDom([]);

          if (id) {
            const res = await getKecamatan(id);
            setKecamatanListDom(extractArray(res));
          }
        } else if (level === "kecamatan") {
          setSelectedKecDom(id);
          setKelurahanListDom([]);

          if (id) {
            const res = await getKelurahan(id);
            setKelurahanListDom(extractArray(res));
          }
        }
      }
    } catch (error) {
      console.error("Gagal memuat wilayah:", error);
      notifikasi.gagal("Gagal memuat data wilayah");
    }
  };

  const handleSameAddress = (checked) => {
    setSameAsKtp(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        alamat_domisili: prev.alamat_ktp,
        rt_domisili: prev.rt_ktp,
        rw_domisili: prev.rw_ktp,
        provinsi_domisili: prev.provinsi_ktp,
        kota_domisili: prev.kota_ktp,
        kecamatan_domisili: prev.kecamatan_ktp,
        kelurahan_domisili: prev.kelurahan_ktp,
        kode_pos_domisili: prev.kode_pos_ktp
      }));
    }
  };

  const validateInput = (name, value) => {
    let errorMsg = "";

    if (name === "nik") {
      if (!value) errorMsg = "NIK tidak boleh kosong.";
      else if (value.length !== 16) errorMsg = "NIK harus tepat 16 digit.";
    } else if (name === "no_hp") {
      if (!value || value === "08") errorMsg = "No HP tidak boleh kosong.";
      else if (value.length !== 13 || !value.startsWith("08")) errorMsg = "No HP harus 13 digit dan diawali 08.";
    } else if (name === "email") {
      if (!value) errorMsg = "Email tidak boleh kosong.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Format email tidak valid.";
    } else if (name === "nama_lengkap") {
      if (!value || !value.trim()) errorMsg = "Nama Lengkap wajib diisi.";
      else if (/\d/.test(value)) errorMsg = "Nama Lengkap tidak boleh mengandung angka.";
    } else if (name === "bidang_keahlian") {
      if (!value || !value.trim()) errorMsg = "Bidang Keahlian wajib diisi.";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "nama_lengkap") {
      finalValue = value.replace(/[0-9]/g, "");
    } else if (name === "no_hp") {
      const digits = value.replace(/\D/g, "");
      let rest = digits;

      if (!rest || rest === "0" || rest === "08") {
        finalValue = "08";
      } else {
        if (rest.startsWith("08")) rest = rest.slice(2);
        else if (rest.startsWith("8")) rest = rest.slice(1);
        else if (rest.startsWith("0")) rest = rest.slice(1);

        finalValue = `08${rest.slice(0, 11)}`;
      }
    } else if (["nik", "rt_ktp", "rw_ktp", "kode_pos_ktp", "rt_domisili", "rw_domisili", "kode_pos_domisili", "tahun_lulus"].includes(name)) {
      finalValue = value.replace(/\D/g, "");

      if (["rt_ktp", "rw_ktp", "rt_domisili", "rw_domisili"].includes(name)) {
        finalValue = finalValue.slice(0, 3);
      }

      if (["kode_pos_ktp", "kode_pos_domisili"].includes(name)) {
        finalValue = finalValue.slice(0, 5);
      }

      if (name === "nik") finalValue = finalValue.slice(0, 16);
      if (name === "tahun_lulus") finalValue = finalValue.slice(0, 4);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: finalValue };

      if (sameAsKtp && name.includes("_ktp")) {
        const domName = name.replace("_ktp", "_domisili");
        updated[domName] = finalValue;
      }

      return updated;
    });

    validateInput(name, finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nik || formData.nik.length !== 16) {
      notifikasi.peringatan("NIK harus tepat 16 digit");
      return;
    }

    if (!formData.no_hp || formData.no_hp.length !== 13 || !formData.no_hp.startsWith("08")) {
      notifikasi.peringatan("No HP harus 13 digit dan diawali 08");
      return;
    }

    if (!formData.nama_lengkap.trim()) {
      notifikasi.peringatan("Nama Lengkap wajib diisi");
      return;
    }

    if (/\d/.test(formData.nama_lengkap)) {
      notifikasi.peringatan("Nama Lengkap tidak boleh mengandung angka");
      return;
    }

    if (!formData.bidang_keahlian) {
      notifikasi.peringatan("Bidang Keahlian wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };

      delete payload.provinsi;
      delete payload.kota;
      delete payload.kecamatan;
      delete payload.kelurahan;

      payload.tanggal_lahir = payload.tanggal_lahir || null;
      payload.masa_berlaku = payload.masa_berlaku || null;
      payload.tahun_lulus = payload.tahun_lulus ? parseInt(payload.tahun_lulus, 10) : null;
      payload.nik = String(payload.nik).trim();
      payload.no_hp = String(payload.no_hp).trim();

      if (isEditMode) {
        await api.put(`/admin/asesor/${currentId}`, payload);
        await notifikasi.sukses("Berhasil", "Data asesor berhasil diperbarui");
      } else {
        await api.post("/admin/asesor", payload);
      }

      setShowModal(false);
      resetForm();
      await fetchData(pagination.page, searchTerm);
    } catch (error) {
      console.error("Error Detail:", error.response?.data);
      let errMsg = error.response?.data?.message || "Gagal menyimpan data.";

      if (errMsg.includes("Validation error") || errMsg.includes("Duplicate")) {
        errMsg = "NIK atau Email yang dimasukkan sudah terdaftar di database.";
      }

      notifikasi.gagal("Gagal Disimpan", errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAccount = async (id_user) => {
    if (!id_user) {
      notifikasi.gagal("Error", "Akun tidak ditemukan.");
      return;
    }

    setSendingEmailId(id_user);

    try {
      await api.post(`/admin/send-email/${id_user}`);
      setEmailSentIds((prev) => new Set(prev).add(id_user));
      await notifikasi.sukses("Terkirim", "Informasi akun berhasil dikirim.");
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleResetPassword = async (id_user, email) => {
    const confirmResult = await notifikasi.konfirmasi(
      "Sandi akun akan direset dan dikirim ke email asesor.",
      "Lanjutkan proses reset password?",
      "Ya, Reset",
      "Batal",
      "warning"
    );

    if (!confirmResult?.isConfirmed) return;

    setSendingEmailId(id_user);

    try {
      const response = await api.post(`/admin/asesor/${id_user}/reset-password`);
      const resData = response.data !== undefined ? response.data : response;
      await notifikasi.sukses("Berhasil Reset", `Sandi baru untuk ${resData.data?.username || email || "akun ini"} telah dikirim ke email.`);
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Gagal mereset password");
    } finally {
      setSendingEmailId(null);
    }
  };

  const resetForm = () => {
    setFormData({ ...initialFormState });
    setSelectedProvKtp("");
    setSelectedKotaKtp("");
    setSelectedKecKtp("");
    setSelectedProvDom("");
    setSelectedKotaDom("");
    setSelectedKecDom("");
    setKotaListKtp([]);
    setKecamatanListKtp([]);
    setKelurahanListKtp([]);
    setKotaListDom([]);
    setKecamatanListDom([]);
    setKelurahanListDom([]);
    setSameAsKtp(false);
    setIsEditMode(false);
    setIsDetailMode(false);
    setCurrentId(null);
    setErrors({});
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    resetForm();
    setIsEditMode(true);
    setCurrentId(item.id_user || item.id);

    setFormData({
      nik: item.nik || "",
      email: item.user?.email || item.email || "",
      no_hp: item.user?.no_hp || item.no_hp || "08",
      gelar_depan: item.gelar_depan || "",
      nama_lengkap: item.nama_lengkap || "",
      gelar_belakang: item.gelar_belakang || "",
      jenis_kelamin: item.jenis_kelamin || "laki-laki",
      tempat_lahir: item.tempat_lahir || "",
      tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split("T")[0] : "",
      kebangsaan: item.kebangsaan || "Indonesia",
      pendidikan_terakhir: item.pendidikan_terakhir || "S1",
      tahun_lulus: item.tahun_lulus || "",
      institut_asal: item.institut_asal || "",
      alamat_ktp: item.alamat_ktp || "",
      rt_ktp: item.rt_ktp || "",
      rw_ktp: item.rw_ktp || "",
      provinsi_ktp: item.provinsi_ktp || "",
      kota_ktp: item.kota_ktp || "",
      kecamatan_ktp: item.kecamatan_ktp || "",
      kelurahan_ktp: item.kelurahan_ktp || "",
      kode_pos_ktp: item.kode_pos_ktp || "",
      alamat_domisili: item.alamat_domisili || "",
      rt_domisili: item.rt_domisili || "",
      rw_domisili: item.rw_domisili || "",
      provinsi_domisili: item.provinsi_domisili || "",
      kota_domisili: item.kota_domisili || "",
      kecamatan_domisili: item.kecamatan_domisili || "",
      kelurahan_domisili: item.kelurahan_domisili || "",
      kode_pos_domisili: item.kode_pos_domisili || "",
      bidang_keahlian: item.bidang_keahlian || "",
      no_reg_asesor: item.no_reg_asesor || "",
      no_lisensi: item.no_lisensi || "",
      masa_berlaku: item.masa_berlaku ? item.masa_berlaku.split("T")[0] : "",
      status_asesor: item.status_asesor || "aktif"
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await notifikasi.konfirmasi(
      "Data asesor yang dihapus tidak dapat dikembalikan.",
      "Hapus data asesor?",
      "Ya, Hapus!",
      "Batal",
      "warning",
      "danger"
    );

    if (!result?.isConfirmed) return;

    setLoading(true);

    try {
      await api.delete(`/admin/asesor/${id}`);
      await notifikasi.sukses("Terhapus", "Data asesor telah dihapus.");
      await fetchData(pagination.page, searchTerm);
    } catch (error) {
      notifikasi.gagal("Gagal", error.response?.data?.message || "Tidak bisa menghapus data.");
    } finally {
      setLoading(false);
    }
  };
const handleImportExcel = async (e) => {
    e.preventDefault();

    if (!fileExcel) {
      notifikasi.peringatan("Pilih file Excel terlebih dahulu");
      return;
    }

    const formUpload = new FormData();
    formUpload.append("file", fileExcel);
    setLoading(true);

    try {
      const response = await api.post("/admin/import-asesor", formUpload, { headers: { "Content-Type": "multipart/form-data" } });
      
      // Ambil respons data yang merincikan berhasil dan gagal
      const resultData = response.data?.data || response.data;
      const berhasil = resultData.berhasil || 0;
      const gagal = resultData.gagal || 0;
      const msg = `Berhasil (termasuk diproses email): ${berhasil}, Gagal: ${gagal}`;

      if (gagal > 0) {
        // Tampilkan warning jika terdapat error pada baris tertentu
        notifikasi.peringatan(
          "Import Selesai (Ada Catatan)", 
          `${msg}\n\nCatatan Error:\n${(resultData.rincian_error || []).join('\n')}`
        );
      } else {
        // Tampilkan sukses jika semua baris ter-import
        notifikasi.sukses("Import Selesai", msg);
      }

      setShowImportModal(false);
      setFileExcel(null);
      await fetchData(pagination.page, searchTerm);
    } catch (error) {
      notifikasi.gagal("Error", error.response?.data?.message || "Gagal import Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/admin/download-template-asesor", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Template_Import_Asesor.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await notifikasi.sukses("Berhasil", "Template berhasil didownload");
    } catch (error) {
      notifikasi.gagal("Error", "Gagal mengambil template dari server");
    }
  };

  const inputClass = (name) => `w-full rounded-lg border p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 disabled:bg-gray-100 disabled:opacity-70 ${errors[name] ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#071E3D]/20 bg-[#FAFAFA] focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"}`;

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = item.nama_lengkap?.toLowerCase().includes(search) || item.nik?.includes(search);
    const matchStatus = filterStatus ? item.status_asesor === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalAktif = data.filter((item) => item.status_asesor === "aktif").length;
  const totalNonaktif = data.filter((item) => item.status_asesor === "nonaktif").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Data Asesor</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">Kelola data profil, sertifikasi, dan akun login asesor.</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <button type="button" onClick={handleDownloadTemplate} className="flex-1 rounded-lg border border-[#CC6B27]/50 bg-white px-4 py-2.5 text-[13px] font-bold text-[#CC6B27] shadow-sm transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27]/10 md:flex-none">
                <span className="flex items-center justify-center gap-2"><Download size={18} /> Template Excel</span>
              </button>

              <button type="button" onClick={() => setShowImportModal(true)} className="flex-1 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 md:flex-none">
                <span className="flex items-center justify-center gap-2"><FileSpreadsheet size={18} /> Import Excel</span>
              </button>

              <button type="button" onClick={handleAdd} className="flex-1 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] hover:shadow-md md:flex-none">
                <span className="flex items-center justify-center gap-2"><Plus size={18} /> Tambah Asesor</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<Users size={22} />} label="Total Asesor" value={`${data.length} Data`} />
          <StatCard icon={<BadgeCheck size={22} />} label="Asesor Aktif" value={`${totalAktif} Aktif`} tone="green" />
          <StatCard icon={<ShieldCheck size={22} />} label="Nonaktif" value={`${totalNonaktif} Nonaktif`} tone="red" />
        </div>

        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <ClipboardList size={18} className="text-[#CC6B27]" />
              Daftar Asesor
            </h4>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="group relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
                <input type="text" placeholder="Cari Nama atau NIK..." className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none focus:border-[#CC6B27]">
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">NIK</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nama Lengkap</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Keahlian & MET</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="w-64 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data asesor...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <UserIcon size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Belum ada data asesor ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id_user || item.id || index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#CC6B27]">{item.nik || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="text-[13.5px] font-bold text-[#071E3D]">{item.gelar_depan} {item.nama_lengkap} {item.gelar_belakang}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#182D4A]/70">
                          <Mail size={12} />
                          {item.user?.email || item.email || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#182D4A]">
                        <div className="font-semibold text-[#071E3D]">{item.bidang_keahlian || "-"}</div>
                        <div className="mt-0.5 text-[11px] text-[#182D4A]/70">{item.no_reg_asesor || "MET: -"}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${item.status_asesor === "aktif" ? "border-green-200 bg-green-50 text-green-600" : "border-red-200 bg-red-50 text-red-600"}`}>
                          {item.status_asesor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button type="button" onClick={() => { handleEdit(item); setIsDetailMode(true); }} className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white" title="Detail">
                            <Eye size={16} />
                          </button>
                          <button type="button" onClick={() => handleEdit(item)} className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id_user || item.id)} className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={pagination.page <= 1} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#071E3D] disabled:cursor-not-allowed disabled:opacity-40">
                  Sebelumnya
                </button>
                <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#071E3D] disabled:cursor-not-allowed disabled:opacity-40">
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]"><UserIcon size={20} /></div>
                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">{isDetailMode ? "Detail Data Asesor" : isEditMode ? "Edit Data Asesor" : "Tambah Asesor Baru"}</h3>
                  </div>
                </div>

                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]">
                  <X size={20} />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
                <form id="asesorForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <SectionTitle icon={<UserIcon size={16} />} title="Identitas Pribadi" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormInput label="NIK" required error={errors.nik}>
                      <input type="text" name="nik" value={formData.nik} onChange={handleChange} maxLength="16" inputMode="numeric" required disabled={isDetailMode} placeholder="16 Digit Angka" className={inputClass("nik")} />
                    </FormInput>

                    <FormInput label="Nama Lengkap" required error={errors.nama_lengkap}>
                      <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required disabled={isDetailMode} placeholder="Masukkan nama lengkap" className={inputClass("nama_lengkap")} />
                    </FormInput>

                    <FormInput label="Gelar Depan" error={errors.gelar_depan}>
                      <input type="text" name="gelar_depan" value={formData.gelar_depan} onChange={handleChange} disabled={isDetailMode} className={inputClass("gelar_depan")} />
                    </FormInput>

                    <FormInput label="Gelar Belakang" error={errors.gelar_belakang}>
                      <input type="text" name="gelar_belakang" value={formData.gelar_belakang} onChange={handleChange} disabled={isDetailMode} className={inputClass("gelar_belakang")} />
                    </FormInput>

                    <FormInput label="Email Login" required error={errors.email}>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isDetailMode || isEditMode} className={inputClass("email")} />
                    </FormInput>

                    <FormInput label="No HP / WhatsApp" required error={errors.no_hp}>
                      <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} maxLength="13" inputMode="numeric" required disabled={isDetailMode} placeholder="08xxxxxxxxxxx" className={inputClass("no_hp")} />
                    </FormInput>

                    <FormInput label="Tempat Lahir">
                      <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isDetailMode} className={inputClass("tempat_lahir")} />
                    </FormInput>

                    <FormInput label="Tanggal Lahir" error={errors.tanggal_lahir}>
                      <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} disabled={isDetailMode} className={inputClass("tanggal_lahir")} />
                    </FormInput>

                    <FormInput label="Jenis Kelamin">
                      <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} disabled={isDetailMode} className={inputClass("jenis_kelamin")}>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </FormInput>

                    <FormInput label="Kebangsaan">
                      <select name="kebangsaan" value={formData.kebangsaan} onChange={handleChange} disabled={isDetailMode} className={inputClass("kebangsaan")}>
                        <option value="">Pilih Kebangsaan</option>
                        {kebangsaanList.map((item, index) => <option key={index} value={item.value}>{item.label}</option>)}
                      </select>
                    </FormInput>
                  </div>

                  <SectionTitle icon={<Briefcase size={16} />} title="Data Sertifikasi" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormInput label="Bidang Keahlian" required error={errors.bidang_keahlian}>
                        <select name="bidang_keahlian" value={formData.bidang_keahlian} onChange={handleChange} required disabled={isDetailMode} className={inputClass("bidang_keahlian")}>
                          <option value="">Pilih Skema</option>
                          {skemaList.map((item) => <option key={item.id_skema} value={item.judul_skema}>{item.judul_skema}</option>)}
                        </select>
                      </FormInput>
                    </div>

                    <FormInput label="No. Registrasi (MET)">
                      <input type="text" name="no_reg_asesor" value={formData.no_reg_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass("no_reg_asesor")} />
                    </FormInput>

                    <FormInput label="No. Sertifikat Kompetensi">
                      <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleChange} disabled={isDetailMode} className={inputClass("no_lisensi")} />
                    </FormInput>

                    <FormInput label="Masa Berlaku Sertifikat">
                      <input type="date" name="masa_berlaku" value={formData.masa_berlaku} onChange={handleChange} disabled={isDetailMode} className={inputClass("masa_berlaku")} />
                    </FormInput>

                    <FormInput label="Status Asesor">
                      <select name="status_asesor" value={formData.status_asesor} onChange={handleChange} disabled={isDetailMode} className={inputClass("status_asesor")}>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-Aktif</option>
                      </select>
                    </FormInput>
                  </div>

                  <SectionTitle icon={<GraduationCap size={16} />} title="Pendidikan" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormInput label="Pendidikan Terakhir">
                      <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} disabled={isDetailMode} className={inputClass("pendidikan_terakhir")}>
                        <option value="D3">D3</option>
                        <option value="D4">D4</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </FormInput>

                    <FormInput label="Tahun Lulus" error={errors.tahun_lulus}>
                      <input type="text" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleChange} disabled={isDetailMode} maxLength="4" inputMode="numeric" placeholder="4 digit" className={inputClass("tahun_lulus")} />
                    </FormInput>

                    <div className="md:col-span-2">
                      <FormInput label="Nama Institusi / Universitas" error={errors.institut_asal}>
                        <input type="text" name="institut_asal" value={formData.institut_asal} onChange={handleChange} disabled={isDetailMode} className={inputClass("institut_asal")} />
                      </FormInput>
                    </div>
                  </div>

                  <SectionTitle icon={<MapPin size={16} />} title="Alamat KTP" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormInput label="Alamat Lengkap KTP">
                        <textarea name="alamat_ktp" rows="2" value={formData.alamat_ktp} onChange={handleChange} disabled={isDetailMode} className={`${inputClass("alamat_ktp")} resize-none`} />
                      </FormInput>
                    </div>

                    <FormInput label="Provinsi KTP">
                      <select name="provinsi_ktp" value={selectedProvKtp} onChange={(e) => handleWilayahChange(e, "ktp", "provinsi")} disabled={isDetailMode} className={inputClass("provinsi_ktp")}>
                        <option value="">{formData.provinsi_ktp || "Pilih Provinsi"}</option>
                        {provinsiList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kota KTP">
                      <select name="kota_ktp" value={selectedKotaKtp} onChange={(e) => handleWilayahChange(e, "ktp", "kota")} disabled={isDetailMode || (!selectedProvKtp && !formData.provinsi_ktp)} className={inputClass("kota_ktp")}>
                        <option value="">{formData.kota_ktp || "Pilih Kota/Kab"}</option>
                        {kotaListKtp.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kecamatan KTP">
                      <select name="kecamatan_ktp" value={selectedKecKtp} onChange={(e) => handleWilayahChange(e, "ktp", "kecamatan")} disabled={isDetailMode || (!selectedKotaKtp && !formData.kota_ktp)} className={inputClass("kecamatan_ktp")}>
                        <option value="">{formData.kecamatan_ktp || "Pilih Kecamatan"}</option>
                        {kecamatanListKtp.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kelurahan KTP">
                      <select name="kelurahan_ktp" value={formData.kelurahan_ktp} onChange={(e) => handleWilayahChange(e, "ktp", "kelurahan")} disabled={isDetailMode || (!selectedKecKtp && !formData.kecamatan_ktp)} className={inputClass("kelurahan_ktp")}>
                        <option value="">{formData.kelurahan_ktp || "Pilih Kelurahan"}</option>
                        {kelurahanListKtp.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="RT KTP">
                      <input name="rt_ktp" value={formData.rt_ktp} onChange={handleChange} disabled={isDetailMode} maxLength="3" inputMode="numeric" placeholder="Maks. 3 digit" className={inputClass("rt_ktp")} />
                    </FormInput>

                    <FormInput label="RW KTP">
                      <input name="rw_ktp" value={formData.rw_ktp} onChange={handleChange} disabled={isDetailMode} maxLength="3" inputMode="numeric" placeholder="Maks. 3 digit" className={inputClass("rw_ktp")} />
                    </FormInput>

                    <FormInput label="Kode Pos KTP">
                      <input name="kode_pos_ktp" value={formData.kode_pos_ktp} onChange={handleChange} disabled={isDetailMode} maxLength="5" inputMode="numeric" placeholder="5 digit" className={inputClass("kode_pos_ktp")} />
                    </FormInput>
                  </div>

                  <div className="my-2 border-t border-dashed border-slate-300" />

                  <div className="flex items-center justify-between gap-4">
                    <SectionTitle icon={<MapPin size={16} />} title="Alamat Domisili" />
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#CC6B27]">
                      <input type="checkbox" checked={sameAsKtp} onChange={(e) => handleSameAddress(e.target.checked)} disabled={isDetailMode} className="accent-[#CC6B27]" />
                      Sama dengan KTP
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormInput label="Alamat Lengkap Domisili">
                        <textarea name="alamat_domisili" rows="2" value={formData.alamat_domisili} onChange={handleChange} disabled={isDetailMode || sameAsKtp} className={`${inputClass("alamat_domisili")} resize-none`} />
                      </FormInput>
                    </div>

                    <FormInput label="Provinsi Domisili">
                      <select name="provinsi_domisili" value={selectedProvDom} onChange={(e) => handleWilayahChange(e, "domisili", "provinsi")} disabled={isDetailMode || sameAsKtp} className={inputClass("provinsi_domisili")}>
                        <option value="">{formData.provinsi_domisili || "Pilih Provinsi"}</option>
                        {provinsiList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kota Domisili">
                      <select name="kota_domisili" value={selectedKotaDom} onChange={(e) => handleWilayahChange(e, "domisili", "kota")} disabled={isDetailMode || sameAsKtp || (!selectedProvDom && !formData.provinsi_domisili)} className={inputClass("kota_domisili")}>
                        <option value="">{formData.kota_domisili || "Pilih Kota/Kab"}</option>
                        {kotaListDom.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kecamatan Domisili">
                      <select name="kecamatan_domisili" value={selectedKecDom} onChange={(e) => handleWilayahChange(e, "domisili", "kecamatan")} disabled={isDetailMode || sameAsKtp || (!selectedKotaDom && !formData.kota_domisili)} className={inputClass("kecamatan_domisili")}>
                        <option value="">{formData.kecamatan_domisili || "Pilih Kecamatan"}</option>
                        {kecamatanListDom.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="Kelurahan Domisili">
                      <select name="kelurahan_domisili" value={formData.kelurahan_domisili} onChange={(e) => handleWilayahChange(e, "domisili", "kelurahan")} disabled={isDetailMode || sameAsKtp || (!selectedKecDom && !formData.kecamatan_domisili)} className={inputClass("kelurahan_domisili")}>
                        <option value="">{formData.kelurahan_domisili || "Pilih Kelurahan"}</option>
                        {kelurahanListDom.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
                      </select>
                    </FormInput>

                    <FormInput label="RT Domisili">
                      <input name="rt_domisili" value={formData.rt_domisili} onChange={handleChange} disabled={isDetailMode || sameAsKtp} maxLength="3" inputMode="numeric" placeholder="Maks. 3 digit" className={inputClass("rt_domisili")} />
                    </FormInput>

                    <FormInput label="RW Domisili">
                      <input name="rw_domisili" value={formData.rw_domisili} onChange={handleChange} disabled={isDetailMode || sameAsKtp} maxLength="3" inputMode="numeric" placeholder="Maks. 3 digit" className={inputClass("rw_domisili")} />
                    </FormInput>

                    <FormInput label="Kode Pos Domisili">
                      <input name="kode_pos_domisili" value={formData.kode_pos_domisili} onChange={handleChange} disabled={isDetailMode || sameAsKtp} maxLength="5" inputMode="numeric" placeholder="5 digit" className={inputClass("kode_pos_domisili")} />
                    </FormInput>
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                {isDetailMode ? (
                  <button type="button" className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" onClick={() => { setShowModal(false); resetForm(); }}>
                    Tutup
                  </button>
                ) : (
                  <>
                    <button type="button" className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" onClick={() => { setShowModal(false); resetForm(); }}>
                      Batal
                    </button>

                    <button type="submit" form="asesorForm" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:cursor-not-allowed disabled:bg-slate-300">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Simpan Data
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h3 className="text-lg font-black text-[#071E3D]">Import Data Asesor</h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">Upload file Excel untuk menambahkan data asesor.</p>
                </div>

                <button type="button" onClick={() => { setShowImportModal(false); setFileExcel(null); }} className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleImportExcel} className="p-5">
                <div className="rounded-2xl border border-dashed border-[#CC6B27]/40 bg-orange-50/40 p-6 text-center">
                  <FileSpreadsheet size={42} className="mx-auto mb-3 text-[#CC6B27]" />
                  <p className="mb-3 text-sm font-bold text-[#071E3D]">Pilih file Excel</p>
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => setFileExcel(e.target.files?.[0] || null)} className="mx-auto block w-full text-sm" />
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowImportModal(false); setFileExcel(null); }} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-black text-[#071E3D]">
                    Batal
                  </button>

                  <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#CC6B27] px-5 py-2.5 text-xs font-black text-white disabled:bg-slate-300">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    Import Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
        ` }} />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500"
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title }) => <h4 className="mb-0 flex items-center gap-2 border-b border-[#CC6B27]/20 pb-2 text-[14px] font-bold text-[#CC6B27]">{icon} {title}</h4>;

const FormInput = ({ label, required, error, children, icon }) => (
  <div>
    <label className="mb-1 flex items-center gap-1 text-[12px] font-bold text-[#071E3D]">{icon} {label} {required && <span className="text-red-500">*</span>}</label>
    {children}
    {error && <span className="mt-1 block text-[11px] font-medium text-red-500">{error}</span>}
  </div>
);

export default Asesor;