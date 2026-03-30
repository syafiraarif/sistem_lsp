import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";

const JadwalSaya = () => {
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(`${API_BASE}/asesi/jadwal-saya`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJadwalSaya(res.data.data || []);
      } catch (err) {
        console.error("Error fetching jadwal saya:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, [API_BASE, navigate]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#071E3D] mb-4">Jadwal Saya</h2>

        {jadwalSaya.length === 0 ? (
          <p className="text-[#182D4A]">Belum ada jadwal yang Anda daftar.</p>
        ) : (
          <div className="grid gap-6">
            {jadwalSaya.map((item) => (
              <div
                key={`${item.id_user}-${item.id_jadwal}`}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#071E3D]/10"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-[#071E3D] text-lg">
                    {item.jadwal?.skema?.judul_skema} ({item.jadwal?.skema?.kode_skema})
                  </h3>
                  <p className="text-sm text-[#182D4A]">
                    TUK: {item.jadwal?.tuk?.nama_tuk} | Jenis: {item.jadwal?.pelaksanaan_uji}
                  </p>
                </div>

                <div className="flex gap-3 mt-3 flex-wrap">
                  {/* Kerjakan APL01 */}
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() =>
                      navigate(`/asesi/apl01/${item.jadwal?.skema?.id_skema}`)
                    }
                  >
                    Kerjakan APL01
                  </button>

                  {/* Bayar Sekarang */}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() =>
                      navigate(`/asesi/pembayaran/${item.jadwal?.skema?.id_skema}`)
                    }
                  >
                    Bayar Sekarang
                  </button>

                  {/* Kerjakan APL02 */}
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={() =>
                      navigate(`/asesi/apl02/${item.jadwal?.skema?.id_skema}`)
                    }
                  >
                    Kerjakan APL02
                  </button>

                  {/* Pra Asesmen */}
                  <button
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    onClick={() =>
                      navigate(`/asesi/pra-asesmen/${item.jadwal?.skema?.id_skema}`)
                    }
                  >
                    Pra Asesmen
                  </button>

                  {/* Ajukan Banding */}
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() =>
                      navigate(`/asesi/banding?jadwal=${item.id_jadwal}&skema=${item.jadwal?.skema?.id_skema}`)
                    }
                  >
                    Ajukan Banding
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalSaya;