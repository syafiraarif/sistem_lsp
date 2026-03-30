import React, { useEffect, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";

export default function JadwalAsesi() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]); // jadwal yang sudah dipilih
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const API = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJadwal();
    fetchMyJadwal();
  }, []);

  // Ambil semua jadwal tersedia
  const fetchJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal/tersedia`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJadwal(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat jadwal tersedia");
      setJadwal([]);
    } finally {
      setLoading(false);
    }
  };

  // Ambil jadwal yang sudah dipilih oleh asesi
  const fetchMyJadwal = async () => {
    try {
      const res = await axios.get(`${API}/asesi/jadwal-saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const picked = (res.data.data || []).map(
        (item) => item.id_jadwal || item.jadwal?.id_jadwal
      );
      setMyJadwal(picked);
    } catch (err) {
      console.error(err);
      setMyJadwal([]);
    }
  };

  // Pilih jadwal
  const pilihJadwal = async (id_jadwal) => {
    try {
      await axios.post(
        `${API}/asesi/jadwal/pilih`,
        { id_jadwal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Jadwal berhasil dipilih, tinggal menunggu diterima");
      setMyJadwal((prev) => [...prev, id_jadwal]);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("sudah terdaftar")) {
        alert("Anda sudah terdaftar pada jadwal ini, tinggal menunggu diterima");
      } else {
        alert(msg || "Gagal memilih jadwal");
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* SIDEBAR */}
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* CONTENT */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Jadwal Sertifikasi</h1>

        {loading && <p>Loading jadwal...</p>}
        {!loading && jadwal.length === 0 && (
          <p>Belum ada jadwal tersedia</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jadwal.map((item) => {
            const alreadyPicked = myJadwal.includes(item.id_jadwal);

            return (
              <div
                key={item.id_jadwal}
                className="bg-white rounded-xl shadow p-6 border flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold mb-2">
                    {item.skema?.judul_skema || "Skema tidak tersedia"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">
                    Kode Skema: {item.skema?.kode_skema || "-"}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Jenis Skema: {item.skema?.jenis_skema || "-"}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    TUK: {item.tuk?.nama_tuk || "-"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Tanggal:{" "}
                    {item.tgl_awal
                      ? new Date(item.tgl_awal).toLocaleDateString()
                      : "-"}{" "}
                    s/d{" "}
                    {item.tgl_akhir
                      ? new Date(item.tgl_akhir).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <button
                  disabled={alreadyPicked}
                  onClick={() => pilihJadwal(item.id_jadwal)}
                  className={`w-full px-4 py-2 rounded-lg text-white ${
                    alreadyPicked
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {alreadyPicked ? "Sudah Dipilih" : "Pilih Jadwal"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}