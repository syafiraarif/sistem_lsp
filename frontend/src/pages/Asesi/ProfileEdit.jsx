import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ProfileEdit() {

  const [form, setForm] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setError(null);

      const res = await axios.get(`${API_BASE}/asesi/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm(res.data?.data || {});
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal mengambil data profile");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.put(`${API_BASE}/asesi/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Berhasil disimpan ✅");
      fetchProfile();
    } catch (err) {
      console.error("Update error:", err);
      setError("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="flex">

      {/* ================= SIDEBAR ================= */}
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ================= CONTENT ================= */}
      <div className="flex-1 p-8 bg-gray-50">

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile Lengkap
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow">

          {/* ===== BIODATA ===== */}
          <Input label="NIK" name="nik" form={form} handleChange={handleChange} />
          <Input label="Nama Lengkap" name="nama_lengkap" form={form} handleChange={handleChange} />

          <SelectJenisKelamin
            label="Jenis Kelamin"
            name="jenis_kelamin"
            form={form}
            handleChange={handleChange}
          />

          <Input label="Tempat Lahir" name="tempat_lahir" form={form} handleChange={handleChange} />
          <Input label="Tanggal Lahir" name="tanggal_lahir" type="date" form={form} handleChange={handleChange} />
          <Input label="Kebangsaan" name="kebangsaan" form={form} handleChange={handleChange} />

          <TextArea label="Alamat" name="alamat" form={form} handleChange={handleChange} />

          <Input label="RT" name="rt" form={form} handleChange={handleChange} />
          <Input label="RW" name="rw" form={form} handleChange={handleChange} />
          <Input label="Provinsi" name="provinsi" form={form} handleChange={handleChange} />
          <Input label="Kota" name="kota" form={form} handleChange={handleChange} />
          <Input label="Kecamatan" name="kecamatan" form={form} handleChange={handleChange} />
          <Input label="Kelurahan" name="kelurahan" form={form} handleChange={handleChange} />
          <Input label="Kode Pos" name="kode_pos" form={form} handleChange={handleChange} />

          {/* ===== PENDIDIKAN ===== */}
          <Input label="Pendidikan Terakhir" name="pendidikan_terakhir" form={form} handleChange={handleChange} />
          <Input label="Universitas" name="universitas" form={form} handleChange={handleChange} />
          <Input label="Jurusan" name="jurusan" form={form} handleChange={handleChange} />
          <Input label="Tahun Lulus" name="tahun_lulus" type="number" form={form} handleChange={handleChange} />

          {/* ===== PEKERJAAN ===== */}
          <Input label="Pekerjaan" name="pekerjaan" form={form} handleChange={handleChange} />
          <Input label="Jabatan" name="jabatan" form={form} handleChange={handleChange} />
          <Input label="Nama Perusahaan" name="nama_perusahaan" form={form} handleChange={handleChange} />
          <TextArea label="Alamat Perusahaan" name="alamat_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Telepon Perusahaan" name="telp_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Fax Perusahaan" name="fax_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Email Perusahaan" name="email_perusahaan" form={form} handleChange={handleChange} />

        </div>

        {/* BUTTON */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({ label, name, type = "text", form, handleChange }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="border p-2 w-full rounded mt-1"
      />
    </div>
  );
}

function TextArea({ label, name, form, handleChange }) {
  return (
    <div className="col-span-2">
      <label className="text-sm font-semibold">{label}</label>
      <textarea
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="border p-2 w-full rounded mt-1"
      />
    </div>
  );
}

/* ================= DROPDOWN ================= */

function SelectJenisKelamin({ label, name, form, handleChange }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>

      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="border p-2 w-full rounded mt-1 bg-white"
      >
        <option value="">-- Pilih Jenis Kelamin --</option>
        <option value="laki-laki">Laki-laki</option>
        <option value="perempuan">Perempuan</option>
      </select>
    </div>
  );
}