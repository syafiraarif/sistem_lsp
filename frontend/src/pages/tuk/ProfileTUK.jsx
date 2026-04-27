// frontend/src/pages/tuk/ProfileTUK.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  Save,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  Calendar,
  Hash,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE;
const PUBLIC_API = "http://localhost:3000/api/public";

export default function ProfileTUK() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);

  const [wilayahLoading, setWilayahLoading] = useState({
    provinsi: false,
    kota: false,
    kecamatan: false,
    kelurahan: false,
  });

  const [formData, setFormData] = useState({
    nik: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    provinsi_id: "",
    provinsi: "",
    kota_id: "",
    kota: "",
    kecamatan_id: "",
    kecamatan: "",
    kelurahan_id: "",
    kelurahan: "",
    kode_pos: "",
    kode_tuk: "",
    nama_tuk: "",
    telepon: "",
    email: "",
    status: "aktif",
  });

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const fetchProvinsi = async () => {
    try {
      setWilayahLoading((prev) => ({ ...prev, provinsi: true }));
      const res = await axios.get(`${PUBLIC_API}/provinsi`);
      setProvinsi(normalizeList(res.data));
    } catch (err) {
      console.error("Gagal load provinsi:", err);
      toast.error("Gagal memuat provinsi");
      setProvinsi([]);
    } finally {
      setWilayahLoading((prev) => ({ ...prev, provinsi: false }));
    }
  };

  const fetchKota = async (provinsiId) => {
    if (!provinsiId) {
      setKota([]);
      return;
    }

    try {
      setWilayahLoading((prev) => ({ ...prev, kota: true }));
      const res = await axios.get(`${PUBLIC_API}/kota/${provinsiId}`);
      setKota(normalizeList(res.data));
    } catch (err) {
      console.error("Gagal load kota:", err);
      toast.error("Gagal memuat kota");
      setKota([]);
    } finally {
      setWilayahLoading((prev) => ({ ...prev, kota: false }));
    }
  };

  const fetchKecamatan = async (kotaId) => {
    if (!kotaId) {
      setKecamatan([]);
      return;
    }

    try {
      setWilayahLoading((prev) => ({ ...prev, kecamatan: true }));
      const res = await axios.get(`${PUBLIC_API}/kecamatan/${kotaId}`);
      setKecamatan(normalizeList(res.data));
    } catch (err) {
      console.error("Gagal load kecamatan:", err);
      toast.error("Gagal memuat kecamatan");
      setKecamatan([]);
    } finally {
      setWilayahLoading((prev) => ({ ...prev, kecamatan: false }));
    }
  };

  const fetchKelurahan = async (kecamatanId) => {
    if (!kecamatanId) {
      setKelurahan([]);
      return;
    }

    try {
      setWilayahLoading((prev) => ({ ...prev, kelurahan: true }));
      const res = await axios.get(`${PUBLIC_API}/kelurahan/${kecamatanId}`);
      setKelurahan(normalizeList(res.data));
    } catch (err) {
      console.error("Gagal load kelurahan:", err);
      toast.error("Gagal memuat kelurahan");
      setKelurahan([]);
    } finally {
      setWilayahLoading((prev) => ({ ...prev, kelurahan: false }));
    }
  };

  const fetchProfile = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API}/tuk/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};
      const profile_tuk = data.profile_tuk || {};
      const tuk = data.tuk || {};

      setFormData((prev) => ({
        ...prev,
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
        status: tuk.status || "aktif",
      }));
    } catch (err) {
      console.error("Profile error:", err.response?.status, err.response?.data);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinsi();

    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (!formData.provinsi || provinsi.length === 0 || formData.provinsi_id) {
      return;
    }

    const selected = provinsi.find(
      (p) => p.name?.toLowerCase() === formData.provinsi?.toLowerCase()
    );

    if (selected) {
      setFormData((prev) => ({ ...prev, provinsi_id: selected.id }));
      fetchKota(selected.id);
    }
  }, [provinsi, formData.provinsi, formData.provinsi_id]);

  useEffect(() => {
    if (!formData.kota || kota.length === 0 || formData.kota_id) {
      return;
    }

    const selected = kota.find(
      (k) => k.name?.toLowerCase() === formData.kota?.toLowerCase()
    );

    if (selected) {
      setFormData((prev) => ({ ...prev, kota_id: selected.id }));
      fetchKecamatan(selected.id);
    }
  }, [kota, formData.kota, formData.kota_id]);

  useEffect(() => {
    if (!formData.kecamatan || kecamatan.length === 0 || formData.kecamatan_id) {
      return;
    }

    const selected = kecamatan.find(
      (k) => k.name?.toLowerCase() === formData.kecamatan?.toLowerCase()
    );

    if (selected) {
      setFormData((prev) => ({ ...prev, kecamatan_id: selected.id }));
      fetchKelurahan(selected.id);
    }
  }, [kecamatan, formData.kecamatan, formData.kecamatan_id]);

  useEffect(() => {
    if (!formData.kelurahan || kelurahan.length === 0 || formData.kelurahan_id) {
      return;
    }

    const selected = kelurahan.find(
      (k) => k.name?.toLowerCase() === formData.kelurahan?.toLowerCase()
    );

    if (selected) {
      setFormData((prev) => ({ ...prev, kelurahan_id: selected.id }));
    }
  }, [kelurahan, formData.kelurahan, formData.kelurahan_id]);

  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      provinsi_id: id,
      provinsi: name,
      kota_id: "",
      kota: "",
      kecamatan_id: "",
      kecamatan: "",
      kelurahan_id: "",
      kelurahan: "",
    }));

    setKota([]);
    setKecamatan([]);
    setKelurahan([]);

    if (id) await fetchKota(id);
  };

  const handleKotaChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      kota_id: id,
      kota: name,
      kecamatan_id: "",
      kecamatan: "",
      kelurahan_id: "",
      kelurahan: "",
    }));

    setKecamatan([]);
    setKelurahan([]);

    if (id) await fetchKecamatan(id);
  };

  const handleKecamatanChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      kecamatan_id: id,
      kecamatan: name,
      kelurahan_id: "",
      kelurahan: "",
    }));

    setKelurahan([]);

    if (id) await fetchKelurahan(id);
  };

  const handleKelurahanChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      kelurahan_id: id,
      kelurahan: name,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let val = value;

    if (name === "nik") {
      val = value.replace(/[^0-9]/g, "").slice(0, 16);
    }

    if (name === "kode_pos") {
      val = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

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
      return;
    }

    if (
      !profileData.provinsi ||
      !profileData.kota ||
      !profileData.kecamatan ||
      !profileData.kelurahan
    ) {
      toast.error("Lengkapi data wilayah lengkap!");
      return;
    }

    try {
      setSaving(true);

      await axios.put(`${API}/tuk/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPopupMessage("Profil TUK berhasil diperbarui.");
      setShowSuccessPopup(true);

      setTimeout(() => {
        fetchProfile();
        setShowSuccessPopup(false);
      }, 1800);
    } catch (err) {
      console.error("Save error:", err.response?.data);
      setPopupMessage(err.response?.data?.message || "Gagal menyimpan profil.");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-5" size={44} />
          <p className="text-[#071E3D] font-black text-lg">
            Memuat Profil TUK
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccessPopup && (
        <PopupShell>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={34} />
          </div>
          <h3 className="text-2xl font-black text-[#071E3D] mb-2">
            Berhasil Disimpan
          </h3>
          <p className="text-slate-500 font-medium">{popupMessage}</p>
        </PopupShell>
      )}

      {showErrorPopup && (
        <PopupShell>
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-5">
            <XCircle size={34} />
          </div>
          <h3 className="text-2xl font-black text-[#071E3D] mb-2">
            Gagal Menyimpan
          </h3>
          <p className="text-slate-500 font-medium">{popupMessage}</p>
        </PopupShell>
      )}

      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarTUK
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                    <ShieldCheck size={15} className="text-orange-500" />
                    <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                      Profil Tempat Uji Kompetensi
                    </span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                    Profil TUK
                  </h1>

                  <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                    Kelola identitas, data pribadi, alamat, dan kontak Tempat
                    Uji Kompetensi Anda.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`w-full sm:w-fit px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                    saving
                      ? "bg-orange-300 cursor-wait"
                      : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                  }`}
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  {!saving && <ChevronRight size={17} />}
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <section className="xl:col-span-1 space-y-6">
                <Card title="Identitas TUK" icon={<FileText size={22} />}>
                  <div className="space-y-4">
                    <ReadonlyBox
                      label="Kode TUK"
                      value={formData.kode_tuk || "-"}
                      icon={<Hash size={18} />}
                    />
                    <ReadonlyBox
                      label="Nama TUK"
                      value={formData.nama_tuk || "-"}
                      icon={<BadgeCheck size={18} />}
                    />
                    <ReadonlyBox
                      label="Status"
                      value={(formData.status || "aktif").toUpperCase()}
                      icon={<CheckCircle size={18} />}
                      status
                    />
                  </div>
                </Card>

                {(formData.telepon || formData.email) && (
                  <Card title="Kontak TUK" icon={<Phone size={22} />}>
                    <div className="space-y-4">
                      {formData.telepon && (
                        <ReadonlyBox
                          label="Telepon"
                          value={formData.telepon}
                          icon={<Phone size={18} />}
                        />
                      )}
                      {formData.email && (
                        <ReadonlyBox
                          label="Email"
                          value={formData.email}
                          icon={<Mail size={18} />}
                        />
                      )}
                    </div>
                  </Card>
                )}
              </section>

              <section className="xl:col-span-2 space-y-6">
                <Card title="Data Pribadi" icon={<User size={22} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="NIK"
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      placeholder="Masukkan NIK"
                      maxLength={16}
                    />

                    <SelectField
                      label="Jenis Kelamin"
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </SelectField>

                    <InputField
                      label="Tempat Lahir"
                      name="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={handleChange}
                      placeholder="Contoh: Yogyakarta"
                    />

                    <InputField
                      label="Tanggal Lahir"
                      name="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                    />
                  </div>
                </Card>

                <Card title="Alamat Lengkap" icon={<MapPin size={22} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField
                      label="Provinsi"
                      value={formData.provinsi}
                      onChange={handleProvinsiChange}
                      loading={wilayahLoading.provinsi}
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinsi.map((p) => (
                        <option key={p.id} data-id={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </SelectField>

                    <InputField
                      label="Kode Pos"
                      name="kode_pos"
                      value={formData.kode_pos}
                      onChange={handleChange}
                      placeholder="Contoh: 55183"
                      maxLength={10}
                    />

                    <SelectField
                      label="Kota/Kabupaten"
                      value={formData.kota}
                      onChange={handleKotaChange}
                      disabled={!formData.provinsi_id || wilayahLoading.kota}
                      loading={wilayahLoading.kota}
                    >
                      <option value="">
                        {!formData.provinsi_id
                          ? "Pilih provinsi dulu"
                          : "Pilih Kota/Kabupaten"}
                      </option>
                      {kota.map((k) => (
                        <option key={k.id} data-id={k.id} value={k.name}>
                          {k.name}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Kecamatan"
                      value={formData.kecamatan}
                      onChange={handleKecamatanChange}
                      disabled={!formData.kota_id || wilayahLoading.kecamatan}
                      loading={wilayahLoading.kecamatan}
                    >
                      <option value="">
                        {!formData.kota_id
                          ? "Pilih kota dulu"
                          : "Pilih Kecamatan"}
                      </option>
                      {kecamatan.map((kec) => (
                        <option key={kec.id} data-id={kec.id} value={kec.name}>
                          {kec.name}
                        </option>
                      ))}
                    </SelectField>

                    <div className="md:col-span-2">
                      <SelectField
                        label="Kelurahan/Desa"
                        value={formData.kelurahan}
                        onChange={handleKelurahanChange}
                        disabled={!formData.kecamatan_id || wilayahLoading.kelurahan}
                        loading={wilayahLoading.kelurahan}
                      >
                        <option value="">
                          {!formData.kecamatan_id
                            ? "Pilih kecamatan dulu"
                            : "Pilih Kelurahan/Desa"}
                        </option>
                        {kelurahan.map((kel) => (
                          <option key={kel.id} data-id={kel.id} value={kel.name}>
                            {kel.name}
                          </option>
                        ))}
                      </SelectField>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50 mb-2.5">
                        Alamat Lengkap
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] placeholder:text-slate-300 resize-none"
                        placeholder="Contoh: Jl. Contoh No. 123, RT 05 RW 02"
                      />
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const PopupShell = ({ children }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[#071E3D]/60 backdrop-blur-sm">
      <div className="bg-white rounded-[30px] shadow-2xl border border-slate-100 max-w-md w-full p-8 text-center">
        {children}
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Data TUK
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
};

const ReadonlyBox = ({ label, value, icon, status = false }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>

      <p
        className={`font-black ${
          status ? "text-emerald-600" : "text-[#071E3D]"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  maxLength,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] placeholder:text-slate-300"
      />
    </div>
  );
};

const SelectField = ({
  label,
  children,
  onChange,
  value,
  name,
  disabled,
  loading,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none transition-all text-sm font-bold text-[#071E3D] appearance-none ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5`}
        >
          {children}
        </select>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-orange-500" />
          ) : (
            <ChevronRight size={18} className="rotate-90" />
          )}
        </div>
      </div>
    </div>
  );
};