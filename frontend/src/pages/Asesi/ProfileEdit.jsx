// frontend/src/pages/asesi/ProfileEdit.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const WILAYAH_API = `${API_BASE}/asesi/wilayah`;

export default function ProfileEdit() {
  const [form, setForm] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const token = localStorage.getItem("token");

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const findByName = (list, name) => {
    if (!name || !Array.isArray(list)) return null;

    return list.find(
      (item) =>
        String(item.name || "").toLowerCase() ===
        String(name || "").toLowerCase()
    );
  };

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      const provList = await fetchProvinsi();
      await fetchProfile(provList);
    };

    init();
  }, []);

  const fetchProfile = async (initialProvinsiList = []) => {
    try {
      setError(null);

      const res = await axios.get(`${API_BASE}/asesi/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};

      let provinsiId = data.provinsi_id || data.id_provinsi || "";
      let provinsiNama = data.provinsi || data.provinsi_nama || "";

      if (!provinsiId && provinsiNama) {
        const foundProv = findByName(initialProvinsiList, provinsiNama);
        provinsiId = foundProv?.id || "";
        provinsiNama = foundProv?.name || provinsiNama;
      }

      let kotaId = data.kota_id || data.id_kota || "";
      let kotaNama = data.kota || data.kota_nama || "";
      let kotaListResolved = [];

      if (provinsiId) {
        kotaListResolved = await fetchKota(provinsiId);
        if (!kotaId && kotaNama) {
          const foundKota = findByName(kotaListResolved, kotaNama);
          kotaId = foundKota?.id || "";
          kotaNama = foundKota?.name || kotaNama;
        }
      }

      let kecamatanId = data.kecamatan_id || data.id_kecamatan || "";
      let kecamatanNama = data.kecamatan || data.kecamatan_nama || "";
      let kecamatanListResolved = [];

      if (kotaId) {
        kecamatanListResolved = await fetchKecamatan(kotaId);
        if (!kecamatanId && kecamatanNama) {
          const foundKec = findByName(kecamatanListResolved, kecamatanNama);
          kecamatanId = foundKec?.id || "";
          kecamatanNama = foundKec?.name || kecamatanNama;
        }
      }

      let kelurahanId = data.kelurahan_id || data.id_kelurahan || "";
      let kelurahanNama = data.kelurahan || data.kelurahan_nama || "";

      if (kecamatanId) {
        const kelurahanListResolved = await fetchKelurahan(kecamatanId);
        if (!kelurahanId && kelurahanNama) {
          const foundKel = findByName(kelurahanListResolved, kelurahanNama);
          kelurahanId = foundKel?.id || "";
          kelurahanNama = foundKel?.name || kelurahanNama;
        }
      }

      setForm({
        ...data,
        tanggal_lahir: data.tanggal_lahir
          ? data.tanggal_lahir.split("T")[0]
          : "",

        provinsi_id: provinsiId,
        provinsi_nama: provinsiNama,

        kota_id: kotaId,
        kota_nama: kotaNama,

        kecamatan_id: kecamatanId,
        kecamatan_nama: kecamatanNama,

        kelurahan_id: kelurahanId,
        kelurahan_nama: kelurahanNama,
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Gagal mengambil data profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinsi = async () => {
    try {
      const res = await axios.get(`${WILAYAH_API}/provinsi`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = normalizeList(res.data);
      setProvinsiList(list);
      return list;
    } catch (err) {
      console.error("Provinsi error:", err);
      setProvinsiList([]);
      setError("Gagal memuat data provinsi.");
      return [];
    }
  };

  const fetchKota = async (provinsiId) => {
    if (!provinsiId) {
      setKotaList([]);
      return [];
    }

    try {
      const res = await axios.get(`${WILAYAH_API}/kota/${provinsiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = normalizeList(res.data);
      setKotaList(list);
      return list;
    } catch (err) {
      console.error("Kota error:", err);
      setKotaList([]);
      setError("Gagal memuat data kota/kabupaten.");
      return [];
    }
  };

  const fetchKecamatan = async (kotaId) => {
    if (!kotaId) {
      setKecamatanList([]);
      return [];
    }

    try {
      const res = await axios.get(`${WILAYAH_API}/kecamatan/${kotaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = normalizeList(res.data);
      setKecamatanList(list);
      return list;
    } catch (err) {
      console.error("Kecamatan error:", err);
      setKecamatanList([]);
      setError("Gagal memuat data kecamatan.");
      return [];
    }
  };

  const fetchKelurahan = async (kecamatanId) => {
    if (!kecamatanId) {
      setKelurahanList([]);
      return [];
    }

    try {
      const res = await axios.get(`${WILAYAH_API}/kelurahan/${kecamatanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = normalizeList(res.data);
      setKelurahanList(list);
      return list;
    } catch (err) {
      console.error("Kelurahan error:", err);
      setKelurahanList([]);
      setError("Gagal memuat data kelurahan/desa.");
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError(null);
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setError(null);
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      provinsi_id: id,
      provinsi_nama: name,
      kota_id: "",
      kota_nama: "",
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKotaList([]);
    setKecamatanList([]);
    setKelurahanList([]);

    if (id) await fetchKota(id);
  };

  const handleKotaChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setError(null);
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      kota_id: id,
      kota_nama: name,
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKecamatanList([]);
    setKelurahanList([]);

    if (id) await fetchKecamatan(id);
  };

  const handleKecamatanChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setError(null);
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      kecamatan_id: id,
      kecamatan_nama: name,
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKelurahanList([]);

    if (id) await fetchKelurahan(id);
  };

  const handleKelurahanChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption?.dataset?.id || "";
    const name = e.target.value;

    setError(null);
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      kelurahan_id: id,
      kelurahan_nama: name,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess("");

      const payload = {
        ...form,

        tanggal_lahir: form.tanggal_lahir
          ? new Date(form.tanggal_lahir).toISOString().split("T")[0]
          : null,

        jenis_kelamin: form.jenis_kelamin
          ? form.jenis_kelamin.toLowerCase()
          : null,

        tahun_lulus: form.tahun_lulus ? parseInt(form.tahun_lulus) : null,

        provinsi_id: form.provinsi_id || null,
        kota_id: form.kota_id || null,
        kecamatan_id: form.kecamatan_id || null,
        kelurahan_id: form.kelurahan_id || null,

        provinsi: form.provinsi_nama || null,
        kota: form.kota_nama || null,
        kecamatan: form.kecamatan_nama || null,
        kelurahan: form.kelurahan_nama || null,
      };

      delete payload.provinsi_nama;
      delete payload.kota_nama;
      delete payload.kecamatan_nama;
      delete payload.kelurahan_nama;

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) {
          payload[key] = null;
        }
      });

      await axios.put(`${API_BASE}/asesi/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Profil berhasil disimpan.");
      const provList = provinsiList.length ? provinsiList : await fetchProvinsi();
      fetchProfile(provList);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2
            className="animate-spin text-orange-500 mx-auto mb-5"
            size={44}
          />
          <p className="text-[#071E3D] font-black text-lg">Memuat Profile</p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
                    Profile Asesi
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Edit Profile Lengkap
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Lengkapi data pribadi, alamat, pendidikan, dan pekerjaan Anda
                  untuk kebutuhan proses sertifikasi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
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

          {error && <AlertMessage type="error" text={error} />}
          {success && <AlertMessage type="success" text={success} />}

          <div className="space-y-6">
            <Card title="Data Pribadi" icon={<User size={22} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="NIK"
                  name="nik"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Nama Lengkap"
                  name="nama_lengkap"
                  form={form}
                  handleChange={handleChange}
                />
                <SelectJenisKelamin
                  label="Jenis Kelamin"
                  name="jenis_kelamin"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Tempat Lahir"
                  name="tempat_lahir"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  type="date"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Kebangsaan"
                  name="kebangsaan"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
            </Card>

            <Card title="Alamat Lengkap" icon={<MapPin size={22} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <TextArea
                    label="Alamat"
                    name="alamat"
                    form={form}
                    handleChange={handleChange}
                  />
                </div>

                <Input
                  label="RT"
                  name="rt"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="RW"
                  name="rw"
                  form={form}
                  handleChange={handleChange}
                />

                <SelectWilayah
                  label="Provinsi"
                  list={provinsiList}
                  value={form.provinsi_nama}
                  onChange={handleProvinsiChange}
                />

                <SelectWilayah
                  label="Kota/Kabupaten"
                  list={kotaList}
                  value={form.kota_nama}
                  onChange={handleKotaChange}
                  disabled={!form.provinsi_id}
                />

                <SelectWilayah
                  label="Kecamatan"
                  list={kecamatanList}
                  value={form.kecamatan_nama}
                  onChange={handleKecamatanChange}
                  disabled={!form.kota_id}
                />

                <SelectWilayah
                  label="Kelurahan/Desa"
                  list={kelurahanList}
                  value={form.kelurahan_nama}
                  onChange={handleKelurahanChange}
                  disabled={!form.kecamatan_id}
                />

                <Input
                  label="Kode Pos"
                  name="kode_pos"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
            </Card>

            <Card title="Pendidikan" icon={<GraduationCap size={22} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Pendidikan Terakhir"
                  name="pendidikan_terakhir"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Universitas"
                  name="universitas"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Jurusan"
                  name="jurusan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Tahun Lulus"
                  name="tahun_lulus"
                  type="number"
                  form={form}
                  handleChange={handleChange}
                />
              </div>
            </Card>

            <Card title="Pekerjaan" icon={<BriefcaseBusiness size={22} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Jabatan"
                  name="jabatan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Nama Perusahaan"
                  name="nama_perusahaan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Telepon Perusahaan"
                  name="telp_perusahaan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Fax Perusahaan"
                  name="fax_perusahaan"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Email Perusahaan"
                  name="email_perusahaan"
                  form={form}
                  handleChange={handleChange}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Alamat Perusahaan"
                    name="alamat_perusahaan"
                    form={form}
                    handleChange={handleChange}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
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
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const AlertMessage = ({ type, text }) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`mb-6 rounded-[24px] border p-5 flex items-start gap-3 ${
        isSuccess
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-red-50 border-red-100 text-red-600"
      }`}
    >
      {isSuccess ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
      <div>
        <p className="font-black">
          {isSuccess ? "Berhasil" : "Terjadi Kesalahan"}
        </p>
        <p className="text-sm font-medium mt-1">{text}</p>
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => (
  <section className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
          Data Profile
        </p>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

function Input({ label, name, type = "text", form, handleChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D]"
      />
    </div>
  );
}

function TextArea({ label, name, form, handleChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>
      <textarea
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        rows={4}
        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] resize-none"
      />
    </div>
  );
}

function SelectJenisKelamin({ label, name, form, handleChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>
      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D]"
      >
        <option value="">-- Pilih Jenis Kelamin --</option>
        <option value="laki-laki">Laki-laki</option>
        <option value="perempuan">Perempuan</option>
      </select>
    </div>
  );
}

function SelectWilayah({ label, list, value, onChange, disabled }) {
  const safeList = Array.isArray(list) ? list : [];

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>

      <div className="relative">
        <select
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] appearance-none ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <option value="">-- Pilih {label} --</option>
          {safeList.map((item) => (
            <option key={item.id} data-id={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}