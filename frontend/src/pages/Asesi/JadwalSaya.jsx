// src/pages/asesi/JadwalSaya.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserTie, FaCalendarAlt } from "react-icons/fa";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const JadwalSaya = () => {
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil base URL dari .env
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE}/asesi/jadwal-saya`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;

        // Ambil data asesor untuk masing-masing jadwal
        const dataWithAsesor = await Promise.all(
          data.map(async (pj) => {
            try {
              const resAsesor = await axios.get(
                `${API_BASE}/asesi/jadwal/${pj.id_jadwal}/asesor`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...pj, asesor: resAsesor.data.data || [] };
            } catch {
              return { ...pj, asesor: [] };
            }
          })
        );

        setJadwalSaya(dataWithAsesor);
      } catch (err) {
        console.error("Error fetching jadwal saya:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, [API_BASE]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Konten utama */}
      <div className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#071E3D] mb-4">Jadwal Saya</h2>

        {jadwalSaya.length === 0 && (
          <p className="text-[#182D4A]">Belum ada jadwal yang Anda daftar.</p>
        )}

        <div className="grid gap-6">
          {jadwalSaya.map((item) => (
            <div
              key={item.id_peserta_jadwal}
              className="bg-white rounded-xl p-5 shadow-sm border border-[#071E3D]/10"
            >
              {/* Info Skema & TUK */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-[#071E3D] text-lg">
                    {item.jadwal?.skema?.judul_skema} ({item.jadwal?.skema?.kode_skema})
                  </h3>
                  <p className="text-sm text-[#182D4A]">
                    TUK: {item.jadwal?.tuk?.nama_tuk} | Jenis: {item.jadwal?.skema?.jenis_skema}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#CC6B27]">
                  <FaCalendarAlt /> {new Date(item.jadwal?.tgl_awal).toLocaleDateString()} - {new Date(item.jadwal?.tgl_akhir).toLocaleDateString()}
                </div>
              </div>

              {/* Status */}
              <p className="text-[12px] mb-2">
                Status Pendaftaran:{" "}
                <span className="font-semibold text-[#CC6B27]">{item.status_asesmen}</span>
              </p>

              {/* Asesor */}
              <div className="flex flex-wrap gap-2">
                {item.asesor?.length > 0 ? (
                  item.asesor.map((a) => (
                    <div
                      key={a.id_user}
                      className="flex items-center gap-1 px-2 py-1 bg-[#182D4A]/10 text-[#182D4A] rounded-full text-sm"
                    >
                      <FaUserTie /> {a.nama}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-[#182D4A]">Belum ada asesor</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JadwalSaya;