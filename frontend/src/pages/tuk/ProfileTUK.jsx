// frontend/src/pages/tuk/ProfileTUK.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  BadgeCheck,
  FileText,
  Loader2,
  MapPin,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  User,
  Building
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API = import.meta.env.VITE_API_BASE;
const PUBLIC_API = "http://localhost:3000/api/public";

export default function ProfileTUK() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    username: "",
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
      notifikasi.gagal("Gagal", "Gagal memuat daftar provinsi");
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
      notifikasi.gagal("Gagal", "Gagal memuat daftar kota");
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
      notifikasi.gagal("Gagal", "Gagal memuat daftar kecamatan");
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
      notifikasi.gagal("Gagal", "Gagal memuat daftar kelurahan");
      setKelurahan([]);
    } finally {
      setWilayahLoading((prev) => ({ ...prev, kelurahan: false }));
    }
  };

  const fetchProfile = async (showSuccess = false) => {
    if (!token) {
      notifikasi.gagal("Error", "Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API}/tuk/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};
      const user = data.user || {};
      const profile_tuk = data.profile_tuk || {};
      const tuk = data.tuk || {};

      setFormData((prev) => ({
        ...prev,
        username: user.username || tuk.kode_tuk || "",
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
        kode_tuk: tuk.kode_tuk || user.username || "",
        nama_tuk: tuk.nama_tuk || "",
        telepon: tuk.telepon || "",
        email: tuk.email || "",
        status: tuk.status || "aktif",
      }));

      if (showSuccess) {
        notifikasi.sukses("Berhasil", "Data profile TUK berhasil diperbarui.");
      }
    } catch (err) {
      console.error("Profile error:", err.response?.status, err.response?.data);
      notifikasi.gagal("Gagal Memuat Profile", "Gagal memuat data profile TUK.");
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

  // Efek-efek sinkronisasi wilayah
  useEffect(() => {
    if (!formData.provinsi || provinsi.length === 0 || formData.provinsi_id) return;
    const selected = provinsi.find((p) => p.name?.toLowerCase() === formData.provinsi?.toLowerCase());
    if (selected) {
      setFormData((prev) => ({ ...prev, provinsi_id: selected.id }));
      fetchKota(selected.id);
    }
  }, [provinsi, formData.provinsi, formData.provinsi_id]);

  useEffect(() => {
    if (!formData.kota || kota.length === 0 || formData.kota_id) return;
    const selected = kota.find((k) => k.name?.toLowerCase() === formData.kota?.toLowerCase());
    if (selected) {
      setFormData((prev) => ({ ...prev, kota_id: selected.id }));
      fetchKecamatan(selected.id);
    }
  }, [kota, formData.kota, formData.kota_id]);

  useEffect(() => {
    if (!formData.kecamatan || kecamatan.length === 0 || formData.kecamatan_id) return;
    const selected = kecamatan.find((k) => k.name?.toLowerCase() === formData.kecamatan?.toLowerCase());
    if (selected) {
      setFormData((prev) => ({ ...prev, kecamatan_id: selected.id }));
      fetchKelurahan(selected.id);
    }
  }, [kecamatan, formData.kecamatan, formData.kecamatan_id]);

  useEffect(() => {
    if (!formData.kelurahan || kelurahan.length === 0 || formData.kelurahan_id) return;
    const selected = kelurahan.find((k) => k.name?.toLowerCase() === formData.kelurahan?.toLowerCase());
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
    setFormData((prev) => ({ ...prev, kelurahan_id: id, kelurahan: name }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "username") {
      val = value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "").toUpperCase().slice(0, 50);
    }
    if (name === "nik") {
      val = value.replace(/[^0-9]/g, "").slice(0, 16);
    }
    if (name === "kode_pos") {
      val = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      notifikasi.gagal("Error", "Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    const profileData = {
      username: formData.username.trim(),
      kode_tuk: formData.username.trim(),
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
      telepon: formData.telepon.trim(),
      email: formData.email.trim(),
    };

    if (!profileData.alamat) {
      notifikasi.peringatan("Peringatan", "Alamat lengkap wajib diisi!");
      return;
    }

    if (!profileData.provinsi || !profileData.kota || !profileData.kecamatan || !profileData.kelurahan) {
      notifikasi.peringatan("Peringatan", "Data wilayah harus dipilih lengkap!");
      return;
    }

    try {
      setSaving(true);
      await axios.put(`${API}/tuk/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      notifikasi.sukses("Berhasil", "Data profile TUK berhasil disimpan.");
      fetchProfile();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      notifikasi.gagal(
        "Gagal Menyimpan",
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const displayName = formData.nama_tuk || formData.username || "TUK";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarTUK isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          {/* Header Dashboard */}
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Data Profile {displayName}
                  </h1>
                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola identitas, data pribadi PIC, alamat, dan kontak Tempat Uji Kompetensi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchProfile(true)}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    Refresh
                  </span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <ProfileStat
                icon={<Building size={21} />}
                label="Nama TUK"
                value={displayName}
              />
              <ProfileStat
                icon={<BadgeCheck size={21} />}
                label="Status TUK"
                value={(formData.status || "Aktif").toUpperCase()}
                tone={formData.status === "aktif" ? "green" : "orange"}
              />
              <ProfileStat
                icon={<ShieldCheck size={21} />}
                label="Kode TUK"
                value={formData.kode_tuk || formData.username || "Belum tersedia"}
              />
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              
              <FormSection icon={<FileText size={18} />} title="Identitas TUK" desc="Informasi dasar kredensial TUK.">
                <div className="md:col-span-2">
                  <FormInput label="Username / Kode TUK" required>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Contoh: TUK-JOGJA-01"
                      maxLength={50}
                      className={inputClass()}
                    />
                  </FormInput>
                </div>
                <div className="md:col-span-2">
                  <FormInput label="Nama TUK (Read Only)">
                    <input
                      type="text"
                      value={formData.nama_tuk || "-"}
                      readOnly
                      className={inputClass(true)}
                    />
                  </FormInput>
                </div>
              </FormSection>

              <FormSection icon={<Phone size={18} />} title="Kontak TUK" desc="Informasi kontak yang dapat dihubungi.">
                <div className="md:col-span-2">
                  <FormInput label="Nomor Telepon">
                    <input
                      type="text"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      className={inputClass()}
                    />
                  </FormInput>
                </div>
                <div className="md:col-span-2">
                  <FormInput label="Email Aktif">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Contoh: tuk@email.com"
                      className={inputClass()}
                    />
                  </FormInput>
                </div>
              </FormSection>

            </section>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <User size={17} className="text-[#CC6B27]" />
                  Data Pribadi PIC
                </h2>
              </div>
              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Lengkapi data pribadi penanggung jawab TUK.
                </p>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="NIK" required>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      maxLength="16"
                      placeholder="Masukkan NIK 16 digit"
                      className={inputClass()}
                    />
                  </FormInput>

                  <FormInput label="Jenis Kelamin">
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      className={inputClass()}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </FormInput>

                  <FormInput label="Tempat Lahir">
                    <input
                      type="text"
                      name="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={handleChange}
                      placeholder="Contoh: Yogyakarta"
                      className={inputClass()}
                    />
                  </FormInput>

                  <FormInput label="Tanggal Lahir">
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                      className={inputClass()}
                    />
                  </FormInput>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <MapPin size={17} className="text-[#CC6B27]" />
                  Alamat Lengkap
                </h2>
              </div>
              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Informasi wilayah dan detail alamat lengkap TUK.
                </p>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Provinsi" required>
                    <select
                      value={formData.provinsi}
                      onChange={handleProvinsiChange}
                      disabled={wilayahLoading.provinsi}
                      className={inputClass(wilayahLoading.provinsi)}
                    >
                      <option value="">{wilayahLoading.provinsi ? "Memuat..." : "Pilih Provinsi"}</option>
                      {provinsi.map((p) => (
                        <option key={p.id} data-id={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Kota / Kabupaten" required>
                    <select
                      value={formData.kota}
                      onChange={handleKotaChange}
                      disabled={!formData.provinsi_id || wilayahLoading.kota}
                      className={inputClass(!formData.provinsi_id || wilayahLoading.kota)}
                    >
                      <option value="">{!formData.provinsi_id ? "Pilih provinsi dulu" : wilayahLoading.kota ? "Memuat..." : "Pilih Kota/Kabupaten"}</option>
                      {kota.map((k) => (
                        <option key={k.id} data-id={k.id} value={k.name}>
                          {k.name}
                        </option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Kecamatan" required>
                    <select
                      value={formData.kecamatan}
                      onChange={handleKecamatanChange}
                      disabled={!formData.kota_id || wilayahLoading.kecamatan}
                      className={inputClass(!formData.kota_id || wilayahLoading.kecamatan)}
                    >
                      <option value="">{!formData.kota_id ? "Pilih kota dulu" : wilayahLoading.kecamatan ? "Memuat..." : "Pilih Kecamatan"}</option>
                      {kecamatan.map((kec) => (
                        <option key={kec.id} data-id={kec.id} value={kec.name}>
                          {kec.name}
                        </option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Kelurahan / Desa" required>
                    <select
                      value={formData.kelurahan}
                      onChange={handleKelurahanChange}
                      disabled={!formData.kecamatan_id || wilayahLoading.kelurahan}
                      className={inputClass(!formData.kecamatan_id || wilayahLoading.kelurahan)}
                    >
                      <option value="">{!formData.kecamatan_id ? "Pilih kecamatan dulu" : wilayahLoading.kelurahan ? "Memuat..." : "Pilih Kelurahan/Desa"}</option>
                      {kelurahan.map((kel) => (
                        <option key={kel.id} data-id={kel.id} value={kel.name}>
                          {kel.name}
                        </option>
                      ))}
                    </select>
                  </FormInput>

                  <div className="md:col-span-2">
                    <FormInput label="Detail Alamat" required>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        rows="3"
                        className={`${inputClass()} resize-none`}
                        placeholder="Contoh: Jl. Merdeka No. 123, RT 05 RW 02"
                      />
                    </FormInput>
                  </div>

                  <FormInput label="Kode Pos">
                    <input
                      type="text"
                      name="kode_pos"
                      value={formData.kode_pos}
                      onChange={handleChange}
                      maxLength="10"
                      placeholder="Contoh: 55183"
                      className={inputClass()}
                    />
                  </FormInput>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                    Simpan Profile
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                    Periksa kembali data Anda sebelum menekan tombol simpan.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Simpan Perubahan
                  </span>
                </button>
              </div>
            </section>
          </form>
        </div>
      </main>
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function ProfileStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: { icon: "bg-[#CC6B27]/10 text-[#CC6B27]", value: "text-[#071E3D]" },
    green: { icon: "bg-emerald-50 text-emerald-600", value: "text-emerald-600" },
    blue: { icon: "bg-blue-50 text-blue-600", value: "text-[#071E3D]" },
  };

  const current = tones[tone] || tones.orange;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${current.icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>
        <p className={`mt-1 truncate text-[15px] font-black ${current.value}`}>
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function FormSection({ icon, title, desc, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
          <span className="text-[#CC6B27]">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3">
        <p className="text-[11px] font-medium text-[#182D4A]/60">{desc}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FormInput({ label, required = false, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="mt-1 block text-[11px] font-medium text-red-500">{error}</span>}
    </div>
  );
}

function inputClass(disabled = false) {
  return `w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 ${
    disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : ""
  }`;
}