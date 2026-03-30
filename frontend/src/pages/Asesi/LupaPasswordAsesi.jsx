import React, { useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
});

// inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ChangePasswordAsesi() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.old_password || !form.new_password) {
      return alert("Password lama dan baru wajib diisi");
    }

    if (form.new_password.length < 6) {
      return alert("Password baru minimal 6 karakter");
    }

    try {
      setLoading(true);

      const res = await api.put("/asesi/ubah-password", form);

      // ✅ SESUAI RESPONSE BACKEND
      if (res.data?.success) {
        alert(res.data.message || "Password berhasil diperbarui");

        setForm({
          old_password: "",
          new_password: "",
        });
      } else {
        alert(res.data?.message || "Gagal ubah password");
      }

    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);

      // ✅ HANDLE SEMUA ERROR BACKEND
      if (err.response) {
        alert(err.response.data?.message || "Terjadi kesalahan");
      } else {
        alert("Server tidak merespon");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAsesi />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Ubah Password</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow max-w-md"
        >
          {/* PASSWORD LAMA */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Password Lama
            </label>
            <input
              type="password"
              name="old_password"
              value={form.old_password}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </div>

          {/* PASSWORD BARU */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Password Baru
            </label>
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}