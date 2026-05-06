// frontend/src/pages/admin/Asesor.jsx

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
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  User as UserIcon,
  Loader2,
  Upload,
  FileSpreadsheet,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Users,
  Key,
  Filter,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const Asesor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKotaId, setSelectedKotaId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");

  const [errors, setErrors] = useState({});

  const initialFormState = {
    nik: "",
    email: "",
    no_hp: "",
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
    alamat: "",
    rt: "",
    rw: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    kode_pos: "",
    bidang_keahlian: "",
    no_reg_asesor: "",
    no_lisensi: "",
    masa_berlaku: "",
    status_asesor: "aktif",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);

    try {
      const response = await api.get(
        `/admin/asesor?page=${page}&limit=${pagination.limit}&search=${search}`
      );

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
  }, [pagination.page, searchTerm]);

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  useEffect(() => {
    const loadProvinsi = async () => {
      try {
        const res = await getProvinsi();
        setProvinsiList(extractArray(res));
      } catch (err) {
        console.error("Gagal load provinsi", err);
      }
    };

    loadProvinsi();
  }, []);

  const handleProvinsiChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedProvinsiId(id);
    setFormData((prev) => ({
      ...prev,
      provinsi: id ? text : "",
      kota: "",
      kecamatan: "",
      kelurahan: "",
    }));
    setKotaList([]);
    setKecamatanList([]);
    setKelurahanList([]);
    setSelectedKotaId("");
    setSelectedKecamatanId("");

    if (id) {
      try {
        const res = await getKota(id);
        setKotaList(extractArray(res));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKotaId(id);
    setFormData((prev) => ({
      ...prev,
      kota: id ? text : "",
      kecamatan: "",
      kelurahan: "",
    }));
    setKecamatanList([]);
    setKelurahanList([]);
    setSelectedKecamatanId("");

    if (id) {
      try {
        const res = await getKecamatan(id);
        setKecamatanList(extractArray(res));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = e.target.options[index].text;

    setSelectedKecamatanId(id);
    setFormData((prev) => ({
      ...prev,
      kecamatan: id ? text : "",
      kelurahan: "",
    }));
    setKelurahanList([]);

    if (id) {
      try {
        const res = await getKelurahan(id);
        setKelurahanList(extractArray(res));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleKelurahanChange = (e) => {
    const text = e.target.options[e.target.selectedIndex].text;
    setFormData((prev) => ({
      ...prev,
      kelurahan: e.target.value ? text : "",
    }));
  };

  const validateInput = (name, value) => {
    let errorMsg = "";

    if (name === "nik") {
      if (!value) errorMsg = "NIK tidak boleh kosong.";
      else if (value.length !== 16) errorMsg = "NIK harus tepat 16 digit.";
    } else if (name === "no_hp") {
      if (!value) errorMsg = "No HP tidak boleh kosong.";
      else if (value.length < 12 || value.length > 13)
        errorMsg = "No HP harus 12-13 digit.";
    } else if (name === "email") {
      if (!value) errorMsg = "Email tidak boleh kosong.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errorMsg = "Format email tidak valid.";
    } else if (name === "nama_lengkap") {
      if (!value || value.trim() === "")
        errorMsg = "Nama Lengkap wajib diisi.";
      else if (value.trim().length < 3)
        errorMsg = "Nama terlalu pendek (minimal 3 karakter).";
    } else if (name === "tempat_lahir") {
      if (value && value.trim().length > 0 && value.trim().length < 3)
        errorMsg = "Terlalu pendek (minimal 3 karakter).";
    } else if (name === "gelar_depan") {
      if (value && value.trim().length > 0 && value.trim().length < 2)
        errorMsg = "Gelar terlalu pendek (minimal 2 karakter).";
    } else if (name === "gelar_belakang") {
      if (value && value.trim().length > 0 && value.trim().length < 2)
        errorMsg = "Gelar terlalu pendek (minimal 2 karakter).";
    } else if (name === "bidang_keahlian") {
      if (!value || value.trim() === "")
        errorMsg = "Bidang Keahlian wajib diisi.";
      else if (value.trim().length < 2)
        errorMsg = "Bidang keahlian minimal 2 karakter.";
    } else if (name === "institut_asal") {
      if (value && value.trim().length > 0 && value.trim().length < 3)
        errorMsg = "Nama institusi terlalu pendek (minimal 3 karakter).";
    } else if (name === "alamat") {
      if (value && value.trim().length > 0 && value.trim().length < 5)
        errorMsg = "Alamat terlalu pendek (minimal 5 karakter).";
    } else if (name === "kode_pos") {
      if (value && value.length > 0 && value.length !== 5)
        errorMsg = "Kode Pos Indonesia wajib 5 digit.";
    } else if (name === "tahun_lulus" && value) {
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();

      if (value.length !== 4)
        errorMsg = "Tahun lulus harus 4 digit angka (misal: 2022).";
      else if (year < 1950) errorMsg = "Tahun lulus tidak valid (minimal 1950).";
      else if (year > currentYear)
        errorMsg =
          "Wah, tahun lulusnya dari masa depan nih? Maksimal tahun ini ya.";
    } else if (name === "tanggal_lahir" && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date("1945-12-31");

      if (selectedDate > today)
        errorMsg = "Tanggal lahir tidak boleh di masa depan.";
      else if (selectedDate <= minDate)
        errorMsg = "Tanggal lahir tidak valid (harus setelah 1945).";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (["nik", "no_hp", "rt", "rw", "kode_pos", "tahun_lulus"].includes(name)) {
      finalValue = value.replace(/\D/g, "");
    } else if (
      [
        "nama_lengkap",
        "tempat_lahir",
        "kebangsaan",
        "institut_asal",
        "bidang_keahlian",
      ].includes(name)
    ) {
      finalValue = value.replace(/[0-9]/g, "");
    }

    if (name === "tahun_lulus" && finalValue.length > 4) {
      finalValue = finalValue.slice(0, 4);
    }

    if (name === "kode_pos" && finalValue.length > 5) {
      finalValue = finalValue.slice(0, 5);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    validateInput(name, finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (["email", "no_hp", "nik"].includes(key) && isEditMode) return;

      if (!validateInput(key, formData[key])) {
        isValid = false;
      }
    });

    if (!isValid) {
      return Swal.fire(
        "Peringatan",
        "Silakan perbaiki isian yang masih kosong atau formatnya salah!",
        "warning"
      );
    }

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = { ...formData };

      if (payload.tanggal_lahir === "") payload.tanggal_lahir = null;
      if (payload.masa_berlaku === "") payload.masa_berlaku = null;

      payload.tahun_lulus = payload.tahun_lulus
        ? parseInt(payload.tahun_lulus)
        : null;

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
      const msg =
        error.response?.data?.message ||
        "Gagal menyimpan data. Cek inputan Anda.";
      Swal.fire("Gagal", msg, "error");
    }
  };

  const handleSendAccount = async (id_user) => {
    if (!id_user) {
      return Swal.fire(
        "Error",
        "Data User (Akun) tidak ditemukan untuk asesor ini.",
        "error"
      );
    }

    const confirm = await Swal.fire({
      title: "Kirim Informasi Akun?",
      text: "Sistem akan mengirimkan email berisi Username dan Password ke alamat email Asesor tersebut.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Kirim Email",
    });

    if (confirm.isConfirmed) {
      setSendingEmailId(id_user);

      try {
        await api.post(`/admin/send-email/${id_user}`);
        setEmailSentIds((prev) => new Set(prev).add(id_user));
        Swal.fire(
          "Terkirim!",
          "Informasi akun berhasil dikirim ke email asesor.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Gagal",
          error.response?.data?.message ||
            "Terjadi kesalahan saat mengirim email.",
          "error"
        );
      } finally {
        setSendingEmailId(null);
      }
    }
  };

  const handleResetPassword = async (id_user, email) => {
    const confirm = await Swal.fire({
      title: "Reset Password?",
      text: `Sandi untuk akun ${
        email || "ini"
      } akan direset ulang dan dikirimkan ke email asesor.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Reset & Kirim",
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: "Memproses...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await api.post(
          `/admin/asesor/${id_user}/reset-password`
        );

        const resData = response.data !== undefined ? response.data : response;
        const { username } = resData.data;

        Swal.fire({
          title: "Berhasil Reset!",
          html: `Sandi untuk Username / Email <b>${username}</b> berhasil diatur ulang.<br><br>Sandi yang baru telah otomatis dikirimkan ke email asesor dan tercatat dalam sistem notifikasi.`,
          icon: "success",
        });
      } catch (error) {
        Swal.fire(
          "Gagal",
          error.response?.data?.message || "Gagal mereset password",
          "error"
        );
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedProvinsiId("");
    setSelectedKotaId("");
    setSelectedKecamatanId("");
    setIsEditMode(false);
    setIsDetailMode(false);
    setCurrentId(null);
    setErrors({});
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = async (item) => {
    resetForm();
    setIsEditMode(true);
    setCurrentId(item.id_user || item.id);

    setFormData({
      nik: item.nik || "",
      email: item.user?.email || item.email || "",
      no_hp: item.user?.no_hp || item.no_hp || "",
      gelar_depan: item.gelar_depan || "",
      nama_lengkap: item.nama_lengkap || "",
      gelar_belakang: item.gelar_belakang || "",
      jenis_kelamin: item.jenis_kelamin || "laki-laki",
      tempat_lahir: item.tempat_lahir || "",
      tanggal_lahir: item.tanggal_lahir
        ? item.tanggal_lahir.split("T")[0]
        : "",
      kebangsaan: item.kebangsaan || "Indonesia",
      pendidikan_terakhir: item.pendidikan_terakhir || "S1",
      tahun_lulus: item.tahun_lulus || "",
      institut_asal: item.institut_asal || "",
      alamat: item.alamat || "",
      rt: item.rt || "",
      rw: item.rw || "",
      provinsi: item.provinsi || "",
      kota: item.kota || "",
      kecamatan: item.kecamatan || "",
      kelurahan: item.kelurahan || "",
      kode_pos: item.kode_pos || "",
      bidang_keahlian: item.bidang_keahlian || "",
      no_reg_asesor: item.no_reg_asesor || "",
      no_lisensi: item.no_lisensi || "",
      masa_berlaku: item.masa_berlaku
        ? item.masa_berlaku.split("T")[0]
        : "",
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

    if (!fileExcel) {
      return Swal.fire("Peringatan", "Pilih file Excel terlebih dahulu", "warning");
    }

    const formUpload = new FormData();
    formUpload.append("file", fileExcel);

    try {
      Swal.fire({
        title: "Proses Import...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.post("/admin/import-asesor", formUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Sukses", "Data Asesor berhasil diimport", "success");
      setShowImportModal(false);
      setFileExcel(null);
      fetchData(pagination.page);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal import excel",
        "error"
      );
    }
  };

  const inputClass = (name) =>
    `w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-80 ${
      errors[name]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-100 bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
    }`;

  const filteredData = data.filter((item) => {
    const matchSearch =
      (item.nama_lengkap &&
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nik && item.nik.includes(searchTerm));

    const matchStatus = filterStatus
      ? item.status_asesor === filterStatus
      : true;

    return matchSearch && matchStatus;
  });

  const totalAktif = data.filter((item) => item.status_asesor === "aktif").length;
  const totalNonaktif = data.filter(
    (item) => item.status_asesor === "nonaktif"
  ).length;

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
                <Users size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Data Asesor
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola
                <br />
                <span className="text-orange-500">Asesor Kompetensi</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola data asesor, akun login, status asesor, informasi
                sertifikasi, alamat, dan kebutuhan import Excel.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Asesor
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <FileSpreadsheet size={17} />
                  Import Excel
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Asesor
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {data.length} Data Asesor
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Pantau asesor aktif dan nonaktif dalam satu halaman
                  administrasi.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Aktif" value={`${totalAktif}`} />
                  <HeroPill label="Nonaktif" value={`${totalNonaktif}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Users size={22} />}
            label="Total Asesor"
            value={`${data.length} Data`}
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Asesor Aktif"
            value={`${totalAktif} Aktif`}
            tone="green"
          />
          <MiniStat
            icon={<ShieldCheck size={22} />}
            label="Nonaktif"
            value={`${totalNonaktif} Nonaktif`}
            tone="red"
          />
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <ClipboardList size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Daftar Asesor
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Data Asesor Kompetensi
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari berdasarkan nama atau NIK, lalu filter berdasarkan status.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-80">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="text"
                  placeholder="Cari Nama atau NIK..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full md:w-52">
                <Filter
                  size={18}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-300"
                />
                <select
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-black text-[#071E3D] outline-none focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-Aktif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Bidang Keahlian</TableHead>
                  <TableHead>No. MET</TableHead>
                  <TableHead center>Status</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={38}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data asesor...
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <UserIcon
                        className="mx-auto mb-4 text-slate-300"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Belum ada data asesor ditemukan.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id_user || item.id || index}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="px-5 py-4 font-mono text-sm font-black text-orange-500">
                        {item.nik}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-[#071E3D]">
                          {item.gelar_depan} {item.nama_lengkap}{" "}
                          {item.gelar_belakang}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {item.user?.email || item.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {item.bidang_keahlian || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-500">
                        {item.no_reg_asesor || "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                            item.status_asesor === "aktif"
                              ? "border-green-100 bg-green-50 text-green-600"
                              : "border-red-100 bg-red-50 text-red-600"
                          }`}
                        >
                          {item.status_asesor}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleResetPassword(
                                item.id_user || item.id,
                                item.user?.email || item.email
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                            title="Reset Password Asesor"
                          >
                            <Key size={14} />
                            Reset Sandi
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendAccount(item.id_user)}
                            disabled={
                              emailSentIds.has(item.id_user) ||
                              sendingEmailId === item.id_user
                            }
                            className={`inline-flex items-center justify-center rounded-xl border p-2 transition-all ${
                              emailSentIds.has(item.id_user)
                                ? "cursor-not-allowed border-green-100 bg-green-50 text-green-500 opacity-60"
                                : "border-green-100 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                            }`}
                            title={
                              emailSentIds.has(item.id_user)
                                ? "Email Sudah Terkirim"
                                : "Kirim Akun via Email"
                            }
                          >
                            {sendingEmailId === item.id_user ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Mail size={16} />
                            )}
                          </button>

                          <IconButton
                            onClick={() => {
                              handleEdit(item);
                              setIsDetailMode(true);
                            }}
                            icon={<Eye size={16} />}
                            title="Detail"
                            tone="navy"
                          />
                          <IconButton
                            onClick={() => handleEdit(item)}
                            icon={<Edit2 size={16} />}
                            title="Edit"
                            tone="orange"
                          />
                          <IconButton
                            onClick={() => handleDelete(item.id_user || item.id)}
                            icon={<Trash2 size={16} />}
                            title="Hapus"
                            tone="red"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <UserIcon size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#071E3D]">
                    {isDetailMode
                      ? "Detail Data Asesor"
                      : isEditMode
                      ? "Edit Data Asesor"
                      : "Tambah Asesor Baru"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Lengkapi informasi data diri, alamat, dan sertifikasi
                    asesor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="asesorForm" onSubmit={handleSubmit} className="space-y-6">
                <FormSection
                  icon={<UserIcon size={20} />}
                  title="Identitas Pribadi"
                >
                  <FormInput
                    label="NIK"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    maxLength="16"
                    required
                    disabled={isDetailMode}
                    placeholder="16 Digit Angka"
                    inputClass={inputClass}
                    error={errors.nik}
                  />

                  <FormInput
                    label="Nama Lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    required
                    disabled={isDetailMode}
                    placeholder="Nama tanpa gelar"
                    inputClass={inputClass}
                    error={errors.nama_lengkap}
                  />

                  <FormInput
                    label="Gelar Depan"
                    name="gelar_depan"
                    value={formData.gelar_depan}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    placeholder="Dr., Ir."
                    inputClass={inputClass}
                    error={errors.gelar_depan}
                  />

                  <FormInput
                    label="Gelar Belakang"
                    name="gelar_belakang"
                    value={formData.gelar_belakang}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    placeholder="S.Kom, M.T"
                    inputClass={inputClass}
                    error={errors.gelar_belakang}
                  />

                  <FormInput
                    label="Email Login"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isDetailMode || isEditMode}
                    placeholder="Email aktif"
                    inputClass={inputClass}
                    error={errors.email}
                  />

                  <FormInput
                    label="No HP / WhatsApp"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    maxLength="13"
                    required
                    disabled={isDetailMode}
                    placeholder="08xxxxxxxx"
                    inputClass={inputClass}
                    error={errors.no_hp}
                  />

                  <FormInput
                    label="Tempat Lahir"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    placeholder="Hanya huruf"
                    inputClass={inputClass}
                    error={errors.tempat_lahir}
                  />

                  <FormInput
                    label="Tanggal Lahir"
                    name="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                    error={errors.tanggal_lahir}
                  />

                  <FormSelect
                    label="Jenis Kelamin"
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                    options={[
                      { value: "laki-laki", label: "Laki-laki" },
                      { value: "perempuan", label: "Perempuan" },
                    ]}
                  />

                  <FormInput
                    label="Kebangsaan"
                    name="kebangsaan"
                    value={formData.kebangsaan}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    placeholder="Hanya huruf"
                    inputClass={inputClass}
                  />
                </FormSection>

                <FormSection icon={<MapPin size={20} />} title="Alamat & Domisili">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="alamat"
                      rows="3"
                      value={formData.alamat}
                      onChange={handleChange}
                      disabled={isDetailMode}
                      placeholder="Nama jalan, perumahan, gang..."
                      className={`${inputClass("alamat")} resize-none`}
                    />
                    {errors.alamat && (
                      <span className="mt-1 block text-[11px] font-semibold text-red-500">
                        {errors.alamat}
                      </span>
                    )}
                  </div>

                  {isDetailMode ? (
                    <>
                      <ReadOnlyInput
                        label="Provinsi"
                        value={formData.provinsi || "-"}
                        inputClass={inputClass}
                      />
                      <ReadOnlyInput
                        label="Kota / Kabupaten"
                        value={formData.kota || "-"}
                        inputClass={inputClass}
                      />
                      <ReadOnlyInput
                        label="Kecamatan"
                        value={formData.kecamatan || "-"}
                        inputClass={inputClass}
                      />
                      <ReadOnlyInput
                        label="Kelurahan"
                        value={formData.kelurahan || "-"}
                        inputClass={inputClass}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Provinsi
                        </label>
                        <select
                          onChange={handleProvinsiChange}
                          value={selectedProvinsiId}
                          className={inputClass("provinsi")}
                        >
                          <option value="">
                            {formData.provinsi
                              ? `[Tersimpan] ${formData.provinsi}`
                              : "Pilih Provinsi"}
                          </option>
                          {provinsiList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Kota / Kabupaten
                        </label>
                        <select
                          onChange={handleKotaChange}
                          value={selectedKotaId}
                          disabled={!selectedProvinsiId && !formData.kota}
                          className={inputClass("kota")}
                        >
                          <option value="">
                            {formData.kota && !selectedProvinsiId
                              ? `[Tersimpan] ${formData.kota}`
                              : "Pilih Kota"}
                          </option>
                          {kotaList.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Kecamatan
                        </label>
                        <select
                          onChange={handleKecamatanChange}
                          value={selectedKecamatanId}
                          disabled={!selectedKotaId && !formData.kecamatan}
                          className={inputClass("kecamatan")}
                        >
                          <option value="">
                            {formData.kecamatan && !selectedKotaId
                              ? `[Tersimpan] ${formData.kecamatan}`
                              : "Pilih Kecamatan"}
                          </option>
                          {kecamatanList.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Kelurahan
                        </label>
                        <select
                          onChange={handleKelurahanChange}
                          disabled={!selectedKecamatanId && !formData.kelurahan}
                          className={inputClass("kelurahan")}
                        >
                          <option value="">
                            {formData.kelurahan && !selectedKecamatanId
                              ? `[Tersimpan] ${formData.kelurahan}`
                              : "Pilih Kelurahan"}
                          </option>
                          {kelurahanList.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <FormInput
                    label="RT"
                    name="rt"
                    value={formData.rt}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                  />
                  <FormInput
                    label="RW"
                    name="rw"
                    value={formData.rw}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                  />
                  <FormInput
                    label="Kode Pos"
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                    error={errors.kode_pos}
                  />
                </FormSection>

                <FormSection
                  icon={<GraduationCap size={20} />}
                  title="Pendidikan & Keahlian"
                >
                  <FormSelect
                    label="Pendidikan Terakhir"
                    name="pendidikan_terakhir"
                    value={formData.pendidikan_terakhir}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                    options={[
                      { value: "SMA/SMK", label: "SMA/SMK" },
                      { value: "D3", label: "D3" },
                      { value: "D4", label: "D4" },
                      { value: "S1", label: "S1" },
                      { value: "S2", label: "S2" },
                      { value: "S3", label: "S3" },
                    ]}
                  />

                  <FormInput
                    label="Tahun Lulus"
                    name="tahun_lulus"
                    value={formData.tahun_lulus}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    placeholder="YYYY (Misal: 2020)"
                    maxLength="4"
                    inputClass={inputClass}
                    error={errors.tahun_lulus}
                  />

                  <div className="md:col-span-2">
                    <FormInput
                      label="Nama Institusi / Universitas"
                      name="institut_asal"
                      value={formData.institut_asal}
                      onChange={handleChange}
                      disabled={isDetailMode}
                      placeholder="Hanya huruf"
                      inputClass={inputClass}
                      error={errors.institut_asal}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormInput
                      label="Bidang Keahlian"
                      name="bidang_keahlian"
                      value={formData.bidang_keahlian}
                      onChange={handleChange}
                      required
                      disabled={isDetailMode}
                      placeholder="Contoh: Pemrograman Web, Jaringan"
                      inputClass={inputClass}
                      error={errors.bidang_keahlian}
                    />
                  </div>
                </FormSection>

                <FormSection
                  icon={<Briefcase size={20} />}
                  title="Data Sertifikasi"
                >
                  <FormInput
                    label="No. Registrasi (MET)"
                    name="no_reg_asesor"
                    value={formData.no_reg_asesor}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                  />
                  <FormInput
                    label="No. Lisensi"
                    name="no_lisensi"
                    value={formData.no_lisensi}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                  />
                  <FormInput
                    label="Masa Berlaku Sertifikat"
                    name="masa_berlaku"
                    type="date"
                    value={formData.masa_berlaku}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                  />
                  <FormSelect
                    label="Status Asesor"
                    name="status_asesor"
                    value={formData.status_asesor}
                    onChange={handleChange}
                    disabled={isDetailMode}
                    inputClass={inputClass}
                    options={[
                      { value: "aktif", label: "Aktif" },
                      { value: "nonaktif", label: "Non-Aktif" },
                    ]}
                  />
                </FormSection>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 p-6">
              {isDetailMode ? (
                <button
                  type="button"
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="asesorForm"
                    className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    <Save size={16} />
                    Simpan Data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <FileSpreadsheet size={22} />
                </div>
                <h3 className="text-xl font-black text-[#071E3D]">
                  Import Data Excel
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportExcel}>
              <div className="p-6">
                <label className="block cursor-pointer rounded-[28px] border-2 border-dashed border-orange-200 bg-orange-50/40 p-8 text-center transition-all hover:bg-orange-50">
                  <Upload className="mx-auto mb-4 text-orange-500" size={40} />
                  <p className="text-sm font-black text-[#071E3D]">
                    Upload file template Excel
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Format file .xlsx atau .xls
                  </p>

                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFileExcel(e.target.files[0])}
                    className="mt-5 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-[#071E3D] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-orange-500"
                  />

                  {fileExcel && (
                    <p className="mt-4 break-words rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-black text-green-600">
                      File terpilih: {fileExcel.name}
                    </p>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 p-6">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  onClick={() => setShowImportModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function IconButton({ icon, onClick, title, tone = "navy" }) {
  const tones = {
    navy: "bg-slate-50 text-[#071E3D] hover:bg-[#071E3D] hover:text-white",
    orange: "bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white",
    red: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-xl border border-slate-100 p-2 transition-all ${
        tones[tone] || tones.navy
      }`}
    >
      {icon}
    </button>
  );
}

function FormSection({ icon, title, children }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-4 border-b border-slate-100 bg-white p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>
        <h4 className="text-lg font-black text-[#071E3D]">{title}</h4>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  inputClass,
  error,
  type = "text",
  required,
  disabled,
  placeholder,
  maxLength,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClass(name)}
      />
      {error && (
        <span className="mt-1 block text-[11px] font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  inputClass,
  options,
  disabled,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={inputClass(name)}
      >
        {options.map((item) => (
          <option key={`${name}-${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyInput({ label, value, inputClass }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <input type="text" value={value} disabled className={inputClass(label)} />
    </div>
  );
}

export default Asesor;