// frontend/src/pages/tuk/ProfileTUK.jsx - VERSI FINAL & PERFECT ✅ WILAYAH CASCADE FIXED
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save, Phone, Mail, MapPin, FileText, User, Calendar, Hash, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API = import.meta.env.VITE_API_BASE;

export default function ProfileTUK() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // ✅ POPUP STATE
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ WILAYAH STATE - FULL CASCADE SYSTEM
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const [provinsiLoading, setProvinsiLoading] = useState(false);
  const [kotaLoading, setKotaLoading] = useState(false);
  const [kecamatanLoading, setKecamatanLoading] = useState(false);
  const [kelurahanLoading, setKelurahanLoading] = useState(false);

  // ✅ WILAYAH ID STATE - PENTING UNTUK CASCADE
  const [provinsiId, setProvinsiId] = useState("");
  const [kotaId, setKotaId] = useState("");
  const [kecamatanId, setKecamatanId] = useState("");
  const [kelurahanId, setKelurahanId] = useState("");

  const [formData, setFormData] = useState({
    nik: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    kode_pos: "",
    kode_tuk: "",
    nama_tuk: "",
    telepon: "",
    email: "",
    status: "aktif"
  });

  /* ====================================== */
  /* FETCH WILAYAH DATA - WITH AUTH HEADER */
  /* ====================================== */
  const fetchProvinsi = async () => {
    if (!token) return;
    try {
      setProvinsiLoading(true);
      const res = await axios.get(`${API}/tuk/wilayah/provinsi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProvinsiList(res.data);
    } catch (error) {
      console.error("❌ Error fetch provinsi:", error);
      toast.error("Gagal memuat provinsi");
    } finally {
      setProvinsiLoading(false);
    }
  };

  const fetchKota = async (provId) => {
    if (!provId || !token) {
      setKotaList([]);
      setKotaId("");
      setKecamatanId("");
      setKelurahanId("");
      setKelurahanList([]);
      setFormData(prev => ({ 
        ...prev, 
        kota: "", 
        kecamatan: "", 
        kelurahan: ""
      }));
      return;
    }
    try {
      setKotaLoading(true);
      const res = await axios.get(`${API}/tuk/wilayah/kota/${provId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKotaList(res.data);
    } catch (error) {
      console.error("❌ Error fetch kota:", error);
      toast.error("Gagal memuat kota");
    } finally {
      setKotaLoading(false);
    }
  };

  const fetchKecamatan = async (kotaIdParam) => {
    if (!kotaIdParam || !token) {
      setKecamatanList([]);
      setKecamatanId("");
      setKelurahanId("");
      setKelurahanList([]);
      setFormData(prev => ({ 
        ...prev, 
        kecamatan: "", 
        kelurahan: ""
      }));
      return;
    }
    try {
      setKecamatanLoading(true);
      const res = await axios.get(`${API}/tuk/wilayah/kecamatan/${kotaIdParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKecamatanList(res.data);
    } catch (error) {
      console.error("❌ Error fetch kecamatan:", error);
      toast.error("Gagal memuat kecamatan");
    } finally {
      setKecamatanLoading(false);
    }
  };

  const fetchKelurahan = async (kecId) => {
    if (!kecId || !token) {
      setKelurahanList([]);
      setKelurahanId("");
      setFormData(prev => ({ 
        ...prev, 
        kelurahan: ""
      }));
      return;
    }
    try {
      setKelurahanLoading(true);
      const res = await axios.get(`${API}/tuk/wilayah/kelurahan/${kecId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKelurahanList(res.data);
    } catch (error) {
      console.error("❌ Error fetch kelurahan:", error);
      toast.error("Gagal memuat kelurahan");
    } finally {
      setKelurahanLoading(false);
    }
  };

  /* ====================================== */
  /* FETCH PROFILE - WITH WILAYAH CASCADE */
  /* ====================================== */
  const fetchProfile = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login ulang.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.get(`${API}/tuk/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data?.data || {};
      const profile_tuk = data.profile_tuk || {};
      const tuk = data.tuk || {};

      // Set form data
      const newFormData = {
        nik: profile_tuk.nik || "",
        jenis_kelamin: profile_tuk.jenis_kelamin || "",
        tempat_lahir: profile_tuk.tempat_lahir || "",
        tanggal_lahir: profile_tuk.tanggal_lahir || "",
        alamat: profile_tuk.alamat || "",
        provinsi: profile_tuk.provinsi || "",
        kota: profile_tuk.kota || "",
        kecamatan: profile_tuk.kecamatan || "",
        kelurahan: profile_tuk.kelurahan || "",
        kode_pos: profile_tuk.kode_pos || "",
        kode_tuk: tuk.kode_tuk || "",
        nama_tuk: tuk.nama_tuk || "",
        telepon: tuk.telepon || "",
        email: tuk.email || "",
        status: tuk.status || "aktif"
      };

      setFormData(newFormData);

      // Set wilayah IDs untuk cascade (harus dilakukan setelah provinsi list loaded)
      setTimeout(() => {
        if (newFormData.provinsi) {
          const selectedProv = provinsiList.find(p => p.name === newFormData.provinsi);
          if (selectedProv) {
            setProvinsiId(selectedProv.id);
          }
        }
      }, 500);

    } catch (err) {
      console.error("❌ Profile error:", err.response?.status, err.response?.data);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchProvinsi();
      fetchProfile();
    }
  }, [token]);

  // ✅ CASCADE EFFECTS - WILAYAH HIERARCHY
  useEffect(() => {
    if (provinsiId && token) {
      fetchKota(provinsiId);
    }
  }, [provinsiId, token]);

  useEffect(() => {
    if (kotaId && token) {
      fetchKecamatan(kotaId);
    }
  }, [kotaId, token]);

  useEffect(() => {
    if (kecamatanId && token) {
      fetchKelurahan(kecamatanId);
    }
  }, [kecamatanId, token]);

  /* ====================================== */
  /* HANDLE INPUT CHANGE - CASCADE WILAYAH */
  /* ====================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "provinsi") {
      const selectedProv = provinsiList.find(p => p.id == value);
      setProvinsiId(value);
      setKotaId("");
      setKecamatanId("");
      setKelurahanId("");
      setFormData({
        ...formData,
        provinsi: selectedProv?.name || "",
        kota: "",
        kecamatan: "",
        kelurahan: ""
      });
    } else if (name === "kota") {
      const selectedKota = kotaList.find(k => k.id == value);
      setKotaId(value);
      setKecamatanId("");
      setKelurahanId("");
      setFormData({
        ...formData,
        kota: selectedKota?.name || "",
        kecamatan: "",
        kelurahan: ""
      });
    } else if (name === "kecamatan") {
      const selectedKec = kecamatanList.find(k => k.id == value);
      setKecamatanId(value);
      setKelurahanId("");
      setFormData({
        ...formData,
        kecamatan: selectedKec?.name || "",
        kelurahan: ""
      });
    } else if (name === "kelurahan") {
      const selectedKel = kelurahanList.find(k => k.id == value);
      setKelurahanId(value);
      setFormData({
        ...formData,
        kelurahan: selectedKel?.name || ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  /* ====================================== */
  /* HANDLE SAVE */
  /* ====================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        nik: formData.nik.trim(),
        jenis_kelamin: formData.jenis_kelamin.trim(),
        tempat_lahir: formData.tempat_lahir.trim(),
        tanggal_lahir: formData.tanggal_lahir,
        alamat: formData.alamat.trim(),
        provinsi: formData.provinsi.trim(),
        kota: formData.kota.trim(),
        kecamatan: formData.kecamatan.trim(),
        kelurahan: formData.kelurahan.trim(),
        kode_pos: formData.kode_pos.trim(),
      };

      if (!profileData.alamat) {
        toast.error("Alamat wajib diisi!");
        setSaving(false);
        return;
      }

      if (!profileData.provinsi || !profileData.kota || !profileData.kecamatan || !profileData.kelurahan) {
        toast.error("Lengkapi data wilayah lengkap!");
        setSaving(false);
        return;
      }

      const res = await axios.put(`${API}/tuk/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPopupMessage("✅ Profil TUK berhasil diperbarui!");
      setShowSuccessPopup(true);
      
      setTimeout(() => {
        fetchProfile();
        setShowSuccessPopup(false);
      }, 2000);

    } catch (err) {
      console.error("💥 Save error:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Gagal menyimpan profil";
      setPopupMessage(errorMsg);
      setShowErrorPopup(true);
      
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ====================================== */
  /* POPUP COMPONENTS */
  /* ====================================== */
  const SuccessPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-200 max-w-md w-full mx-4 transform animate-bounce">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
            <CheckCircle size={36} className="text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-800">Berhasil Disimpan!</h3>
            <p className="text-green-700 font-medium">{popupMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-red-200 max-w-md w-full mx-4 transform animate-pulse">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl">
            <XCircle size={36} className="text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-red-800">Gagal Menyimpan!</h3>
            <p className="text-red-700 font-medium">{popupMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-xl font-semibold text-gray-700 mb-2 animate-pulse">Memuat profil TUK...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccessPopup && <SuccessPopup />}
      {showErrorPopup && <ErrorPopup />}

      <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <SidebarTUK isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />

        <div className="flex-1 lg:ml-20 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#071E3D] to-orange-600 bg-clip-text text-transparent">
                Profil TUK
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Kelola data profil lengkap Tempat Uji Kompetensi</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !provinsiId || !kotaId || !kecamatanId || !kelurahanId}
              className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-2xl 
                         hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Save size={22} />
              <span>{saving ? "Menyimpan..." : "Simpan Semua Perubahan"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* IDENTITAS TUK - READ ONLY */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#071E3D]">Identitas TUK</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Kode TUK</label>
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl font-bold text-2xl text-[#071E3D]">
                      {formData.kode_tuk || "TUK001"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Status</label>
                    <div className={`p-6 rounded-2xl font-bold text-xl shadow-inner ${
                      formData.status === 'aktif' 
                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 border-2 border-emerald-200' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                    }`}>
                      AKTIF
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Nama TUK</label>
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl font-bold text-xl text-[#071E3D]">
                    {formData.nama_tuk || "TUK Pelatihan"}
                  </div>
                </div>
              </div>
            </div>

            {/* DATA PRIBADI - EDITABLE */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-orange-100">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#071E3D]">Data Pribadi</h3>
                  <p className="text-sm text-orange-600 font-medium mt-1">NIK, Kelamin, Tempat/Tgl Lahir</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">NIK</label>
                    <input
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50"
                      placeholder="Masukkan NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Jenis Kelamin</label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tempat Lahir</label>
                    <input
                      name="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={handleChange}
                      className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50"
                      placeholder="Contoh: Yogyakarta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tanggal Lahir</label>
                    <input
                      name="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                      className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ ALAMAT & LOKASI - WILAYAH DROPDOWN CASCADE PERFECT */}
          <div className="mt-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/60">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-orange-100">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#071E3D]">Alamat Lengkap</h3>
                <p className="text-sm text-orange-600 font-medium mt-1">Provinsi → Kota → Kecamatan → Kelurahan</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Provinsi</label>
                  <select
                    name="provinsi"
                    value={provinsiId}
                    onChange={handleChange}
                    disabled={provinsiLoading}
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">📍 Pilih Provinsi</option>
                    {provinsiList.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  {provinsiLoading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                      <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      Memuat provinsi...
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Kode Pos</label>
                  <input
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleChange}
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50"
                    placeholder="55183"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Kota/Kabupaten</label>
                  <select
                    name="kota"
                    value={kotaId}
                    onChange={handleChange}
                    disabled={kotaLoading || !provinsiId}
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!provinsiId ? "Pilih provinsi dulu" : kotaLoading ? "Memuat..." : "📍 Pilih Kota/Kabupaten"}
                    </option>
                    {kotaList.map((kota) => (
                      <option key={kota.id} value={kota.id}>
                        {kota.name}
                      </option>
                    ))}
                  </select>
                  {kotaLoading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                      <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      Memuat kota...
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Kecamatan</label>
                  <select
                    name="kecamatan"
                    value={kecamatanId}
                    onChange={handleChange}
                    disabled={kecamatanLoading || !kotaId}
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!kotaId ? "Pilih kota dulu" : kecamatanLoading ? "Memuat..." : "📍 Pilih Kecamatan"}
                    </option>
                    {kecamatanList.map((kec) => (
                      <option key={kec.id} value={kec.id}>
                        {kec.name}
                      </option>
                    ))}
                  </select>
                  {kecamatanLoading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                      <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                      Memuat kecamatan...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Kelurahan/Desa</label>
                <select
                  name="kelurahan"
                  value={kelurahanId}
                  onChange={handleChange}
                  disabled={kelurahanLoading || !kecamatanId}
                  className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!kecamatanId ? "Pilih kecamatan dulu" : kelurahanLoading ? "Memuat..." : "📍 Pilih Kelurahan/Desa"}
                  </option>
                  {kelurahanList.map((kel) => (
                    <option key={kel.id} value={kel.id}>
                      {kel.name}
                    </option>
                  ))}
                </select>
                {kelurahanLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                    <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    Memuat kelurahan...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Alamat Lengkap</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all bg-white/50 resize-vertical"
                  placeholder="Contoh: Jl. Contoh No. 123, RT 05 RW 02"
                />
              </div>
            </div>
          </div>

          {/* KONTAK TUK */}
          {(formData.telepon || formData.email) && (
            <div className="mt-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Phone size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#071E3D]">Kontak TUK</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {formData.telepon && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Phone size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500 uppercase">Telepon</span>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 font-semibold text-blue-900">
                      {formData.telepon}
                    </div>
                  </div>
                )}
                
                {formData.email && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Mail size={16} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500 uppercase">Email</span>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 font-semibold text-emerald-900">
                      {formData.email}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}