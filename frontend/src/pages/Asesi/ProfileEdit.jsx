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

  /* ================= STATE WILAYAH ================= */
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const token = localStorage.getItem("token");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!token) return;

    fetchProvinsi();
    fetchProfile();

  }, []);

  const fetchProfile = async () => {

    try {

      setError(null);

      const res = await axios.get(`${API_BASE}/asesi/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};

      /* FIX AUTO SELECT DROPDOWN + DATE */
      const fixedData = {
        ...data,

        // ✅ FIX DATE
        tanggal_lahir: data.tanggal_lahir
          ? data.tanggal_lahir.split("T")[0]
          : "",

        provinsi: data.provinsi_id || data.provinsi || "",
        kota: data.kota_id || data.kota || "",
        kecamatan: data.kecamatan_id || data.kecamatan || "",
        kelurahan: data.kelurahan_id || data.kelurahan || "",
      };

      setForm(fixedData);

      if (fixedData.provinsi) {
        await fetchKota(fixedData.provinsi);
      }

      if (fixedData.kota) {
        await fetchKecamatan(fixedData.kota);
      }

      if (fixedData.kecamatan) {
        await fetchKelurahan(fixedData.kecamatan);
      }

    } catch (err) {

      console.error("Fetch error:", err);
      setError("Gagal mengambil data profile");

    } finally {

      setLoading(false);

    }

  };

  /* ================= FETCH WILAYAH ================= */

  const fetchProvinsi = async () => {

    try {

      const res = await axios.get(
        `${API_BASE}/asesi/wilayah/provinsi`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProvinsiList(res.data);

    } catch (err) {

      console.error("Provinsi error:", err);

    }

  };

  const fetchKota = async (id) => {

    try {

      const res = await axios.get(
        `${API_BASE}/asesi/wilayah/kota/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKotaList(res.data);

    } catch (err) {

      console.error("Kota error:", err);

    }

  };

  const fetchKecamatan = async (id) => {

    try {

      const res = await axios.get(
        `${API_BASE}/asesi/wilayah/kecamatan/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKecamatanList(res.data);

    } catch (err) {

      console.error("Kecamatan error:", err);

    }

  };

  const fetchKelurahan = async (id) => {

    try {

      const res = await axios.get(
        `${API_BASE}/asesi/wilayah/kelurahan/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKelurahanList(res.data);

    } catch (err) {

      console.error("Kelurahan error:", err);

    }

  };

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "provinsi") {

      fetchKota(value);
      setKecamatanList([]);
      setKelurahanList([]);

      setForm((prev) => ({
        ...prev,
        kota: "",
        kecamatan: "",
        kelurahan: "",
      }));

    }

    if (name === "kota") {

      fetchKecamatan(value);
      setKelurahanList([]);

      setForm((prev) => ({
        ...prev,
        kecamatan: "",
        kelurahan: "",
      }));

    }

    if (name === "kecamatan") {

      fetchKelurahan(value);

      setForm((prev) => ({
        ...prev,
        kelurahan: "",
      }));

    }

  };

  /* ================= SAVE ================= */

  const handleSave = async () => {

    try {

      setSaving(true);
      setError(null);

      const getName = (list, id) => {
        const found = list.find((item) => item.id == id);
        return found ? found.name : id || null;
      };

      const payload = {
        ...form,

        tanggal_lahir: form.tanggal_lahir
          ? new Date(form.tanggal_lahir).toISOString().split("T")[0]
          : null,

        jenis_kelamin: form.jenis_kelamin
          ? form.jenis_kelamin.toLowerCase()
          : null,

        tahun_lulus: form.tahun_lulus
          ? parseInt(form.tahun_lulus)
          : null,

        provinsi: getName(provinsiList, form.provinsi),
        kota: getName(kotaList, form.kota),
        kecamatan: getName(kecamatanList, form.kecamatan),
        kelurahan: getName(kelurahanList, form.kelurahan),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) {
          payload[key] = null;
        }
      });

      console.log("PAYLOAD:", payload);

      await axios.put(`${API_BASE}/asesi/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Berhasil disimpan ✅");

      fetchProfile();

    } catch (err) {

      console.error("Update error:", err);

      setError(err.response?.data?.message || "Gagal menyimpan data");

    } finally {

      setSaving(false);

    }

  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="flex">

      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

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

          <SelectWilayah label="Provinsi" name="provinsi" list={provinsiList} form={form} handleChange={handleChange} />
          <SelectWilayah label="Kota" name="kota" list={kotaList} form={form} handleChange={handleChange} />
          <SelectWilayah label="Kecamatan" name="kecamatan" list={kecamatanList} form={form} handleChange={handleChange} />
          <SelectWilayah label="Kelurahan" name="kelurahan" list={kelurahanList} form={form} handleChange={handleChange} />

          <Input label="Kode Pos" name="kode_pos" form={form} handleChange={handleChange} />

          <Input label="Pendidikan Terakhir" name="pendidikan_terakhir" form={form} handleChange={handleChange} />
          <Input label="Universitas" name="universitas" form={form} handleChange={handleChange} />
          <Input label="Jurusan" name="jurusan" form={form} handleChange={handleChange} />
          <Input label="Tahun Lulus" name="tahun_lulus" type="number" form={form} handleChange={handleChange} />

          <Input label="Pekerjaan" name="pekerjaan" form={form} handleChange={handleChange} />
          <Input label="Jabatan" name="jabatan" form={form} handleChange={handleChange} />
          <Input label="Nama Perusahaan" name="nama_perusahaan" form={form} handleChange={handleChange} />
          <TextArea label="Alamat Perusahaan" name="alamat_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Telepon Perusahaan" name="telp_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Fax Perusahaan" name="fax_perusahaan" form={form} handleChange={handleChange} />
          <Input label="Email Perusahaan" name="email_perusahaan" form={form} handleChange={handleChange} />

        </div>

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

function SelectWilayah({ label, name, list, form, handleChange }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>

      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="border p-2 w-full rounded mt-1 bg-white"
      >
        <option value="">-- Pilih {label} --</option>

        {list.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}

      </select>
    </div>
  );
}