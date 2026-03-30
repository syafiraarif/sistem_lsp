// src/pages/asesi/Banding.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const Banding = () => {
  const [isiBanding, setIsiBanding] = useState(""); // input banding baru
  const [riwayatBanding, setRiwayatBanding] = useState([]); // data banding saya
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;

  // Fetch riwayat banding saya
  const fetchBanding = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API_BASE}/asesi/banding-saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // pastikan selalu array
      setRiwayatBanding(res.data?.data || []);
    } catch (err) {
      console.error("Error fetchBanding:", err);
      alert("Gagal memuat data banding");
    } finally {
      setLoading(false);
    }
  };

  // Submit banding baru
  const submitBanding = async (e) => {
    e.preventDefault();
    if (!isiBanding.trim()) {
      alert("Isi banding wajib diisi!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      await axios.post(
        `${API_BASE}/asesi/banding`,
        { isi_banding: isiBanding },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Banding berhasil diajukan!");
      setIsiBanding("");
      fetchBanding(); // refresh list
    } catch (err) {
      console.error("Error submitBanding:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan server");
    }
  };

  useEffect(() => {
    fetchBanding();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#071E3D]">Ajukan Banding</h1>

        {/* Form Ajukan Banding */}
        <form onSubmit={submitBanding} className="mb-8">
          <textarea
            value={isiBanding}
            onChange={(e) => setIsiBanding(e.target.value)}
            className="border border-[#071E3D]/20 p-3 w-full rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tulis alasan banding Anda..."
            rows={4}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Ajukan Banding
          </button>
        </form>

        {/* Riwayat Banding */}
        <h2 className="text-xl font-semibold mb-4 text-[#071E3D]">Riwayat Banding Saya</h2>

        {loading ? (
          <p>Loading...</p>
        ) : riwayatBanding.length === 0 ? (
          <p className="text-[#182D4A]">Belum ada banding yang diajukan.</p>
        ) : (
          <div className="grid gap-4">
            {riwayatBanding.map((b) => (
              <div
                key={b.id}
                className="border border-[#071E3D]/20 rounded-lg p-4 bg-white shadow-sm"
              >
                <p>
                  <strong>Isi Banding:</strong> {b.isi_banding || "-"}
                </p>
                <p>
                  <strong>Tanggal Ajukan:</strong>{" "}
                  {b.tanggal_ajukan
                    ? new Date(b.tanggal_ajukan).toLocaleString()
                    : "-"}
                </p>
                <p>
                  <strong>Skema:</strong> {b.skema?.judul_skema || "-"}
                </p>
                <p>
                  <strong>Jadwal:</strong> {b.jadwal?.pelaksanaan_uji || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banding;