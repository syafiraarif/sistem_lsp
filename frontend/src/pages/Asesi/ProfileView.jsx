import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/asesi/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data?.data);
    } catch (err) {
      console.error("Gagal ambil profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (!profile) return <p className="p-10">Profile tidak ditemukan</p>;

  const imageBase = API_BASE.replace("/api", "");

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ================= CONTENT ================= */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Profile Saya
          </h1>
          <p className="text-gray-500">
            Detail informasi data diri asesi
          </p>
        </div>

        {/* ================= CARD PROFILE ================= */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">

          {/* FOTO PROFIL BULAT */}
          <div className="flex justify-center mb-8">
            {profile.foto_profil ? (
              <img
                src={`${imageBase}/${profile.foto_profil}`}
                alt="Foto Profil"
                className="w-36 h-36 rounded-full object-cover border-4 border-orange-500 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                No Photo
              </div>
            )}
          </div>

          {/* ================= DATA PROFILE ================= */}
          <div className="grid grid-cols-2 gap-6 text-gray-700">

            <div>
              <p className="text-sm text-gray-500">NIK</p>
              <p className="font-semibold">
                {profile.nik || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="font-semibold">
                {profile.nama_lengkap || "-"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-500">Alamat</p>
              <p className="font-semibold">
                {profile.alamat || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Pendidikan Terakhir
              </p>
              <p className="font-semibold">
                {profile.pendidikan_terakhir || "-"}
              </p>
            </div>

            {/* ✅ TAMBAHAN PEKERJAAN */}
            <div>
              <p className="text-sm text-gray-500">
                Pekerjaan
              </p>
              <p className="font-semibold">
                {profile.pekerjaan || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Jabatan
              </p>
              <p className="font-semibold">
                {profile.jabatan || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ================= BUTTON ================= */}
        <div className="mt-6 flex gap-4">

          <button
            onClick={() => navigate("/asesi/profile/edit")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow hover:bg-orange-600 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => navigate("/asesi/profile/dokumen")}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 transition"
          >
            Upload Dokumen
          </button>

        </div>

      </div>
    </div>
  );
}