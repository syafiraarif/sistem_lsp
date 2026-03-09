// frontend/src/pages/tuk/ProfileTUK.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API = import.meta.env.VITE_API_URL;

export default function ProfileTUK() {

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    kode_tuk: "",
    nama_tuk: "",
    jenis_tuk: "mandiri",
    penanggung_jawab: "",
    alamat: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    rt: "",
    rw: "",
    kode_pos: "",
    telepon: "",
    email_tuk: "",
    institusi_induk: "",
    no_lisensi: "",
    masa_berlaku_lisensi: "",
    status: "aktif"
  });

  /* =============================== */
  /* FETCH PROFILE */
  /* =============================== */
  const fetchProfile = async () => {
    try {

      const res = await axios.get(`${API}/tuk/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.data) {
        setFormData(res.data.data);
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Gagal mengambil data profil"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =============================== */
  /* HANDLE INPUT */
  /* =============================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* =============================== */
  /* HANDLE SAVE */
  /* =============================== */
  const handleSubmit = async (e) => {

    e.preventDefault();
    setSaving(true);

    try {

      const res = await axios.put(
        `${API}/tuk/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(res.data?.message || "Profil berhasil diperbarui");

      // 🔥 Refresh data setelah update
      fetchProfile();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Gagal menyimpan profil"
      );

    } finally {
      setSaving(false);
    }
  };

  /* =============================== */

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Content */}
      <div className="flex-1 lg:ml-20 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#071E3D]">
            Profile TUK
          </h1>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          {/* ===== IDENTITAS ===== */}
          <div className="md:col-span-2 font-semibold border-b pb-1">
            Identitas
          </div>

          <input
            name="kode_tuk"
            value={formData.kode_tuk || ""}
            disabled
            className="p-2 border rounded-lg bg-gray-100"
            placeholder="Kode TUK"
          />

          <input
            name="nama_tuk"
            value={formData.nama_tuk || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Nama TUK"
          />

          <select
            name="jenis_tuk"
            value={formData.jenis_tuk}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          >
            <option value="mandiri">Mandiri</option>
            <option value="sewaktu">Sewaktu</option>
            <option value="tempat_kerja">Tempat Kerja</option>
          </select>

          <input
            name="penanggung_jawab"
            value={formData.penanggung_jawab || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Penanggung Jawab"
          />

          <input
            name="institusi_induk"
            value={formData.institusi_induk || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Institusi Induk"
          />

          <input
            name="status"
            value={formData.status}
            disabled
            className="p-2 border rounded-lg bg-gray-100"
          />

          {/* ===== ALAMAT ===== */}
          <div className="md:col-span-2 font-semibold border-b pb-1 mt-2">
            Alamat
          </div>

          <textarea
            name="alamat"
            value={formData.alamat || ""}
            onChange={handleChange}
            rows={2}
            className="md:col-span-2 p-2 border rounded-lg"
            placeholder="Alamat"
          />

          <input
            name="provinsi"
            value={formData.provinsi || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Provinsi"
          />

          <input
            name="kota"
            value={formData.kota || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Kota"
          />

          <input
            name="kecamatan"
            value={formData.kecamatan || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Kecamatan"
          />

          <input
            name="kelurahan"
            value={formData.kelurahan || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Kelurahan"
          />

          <div className="flex gap-2">
            <input
              name="rt"
              value={formData.rt || ""}
              onChange={handleChange}
              className="p-2 border rounded-lg w-1/2"
              placeholder="RT"
            />

            <input
              name="rw"
              value={formData.rw || ""}
              onChange={handleChange}
              className="p-2 border rounded-lg w-1/2"
              placeholder="RW"
            />
          </div>

          <input
            name="kode_pos"
            value={formData.kode_pos || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Kode Pos"
          />

          {/* ===== KONTAK ===== */}
          <div className="md:col-span-2 font-semibold border-b pb-1 mt-2">
            Kontak & Legalitas
          </div>

          <input
            name="telepon"
            value={formData.telepon || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Telepon"
          />

          <input
            name="email_tuk"
            value={formData.email_tuk || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="Email TUK"
          />

          <input
            name="no_lisensi"
            value={formData.no_lisensi || ""}
            onChange={handleChange}
            className="p-2 border rounded-lg"
            placeholder="No Lisensi"
          />

          <input
            type="date"
            name="masa_berlaku_lisensi"
            value={
              formData.masa_berlaku_lisensi
                ? formData.masa_berlaku_lisensi.split("T")[0]
                : ""
            }
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />

        </form>
      </div>
    </div>
  );
}