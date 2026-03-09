// frontend/src/pages/tuk/DetailJadwal.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Users,
} from "lucide-react";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API = "http://localhost:3000/api/tuk/jadwal";

const DetailJadwal = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);

  /* ================= FETCH DETAIL ================= */
  useEffect(() => {

    const fetchDetail = async () => {
      try {

        const res = await axios.get(
          `${API}/${id}/detail`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setData(res.data.data);

      } catch (err) {
        alert("Gagal ambil detail jadwal");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        Data tidak ditemukan
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-50 flex">

      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-20 p-6 lg:p-8">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">

          <button
            onClick={() => navigate("/tuk/jadwal")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-orange-500" />
            Detail Jadwal
          </h1>

        </div>

        {/* ================= INFO JADWAL ================= */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6">

          <h2 className="text-lg font-bold mb-4">
            Informasi Jadwal
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Kode</p>
              <p className="font-semibold">
                {data.kode_jadwal}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Nama Kegiatan</p>
              <p className="font-semibold">
                {data.nama_kegiatan}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Tahun</p>
              <p>{data.tahun}</p>
            </div>

            <div>
              <p className="text-gray-500">Periode Bulan</p>
              <p>{data.periode_bulan}</p>
            </div>

            <div>
              <p className="text-gray-500">Kuota</p>
              <p>{data.kuota} Orang</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="capitalize font-semibold">
                {data.status}
              </p>
            </div>

          </div>
        </div>

        {/* ================= SKEMA ================= */}
        {data.skema && (
          <div className="bg-white p-6 rounded-2xl shadow mb-6">

            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} />
              Skema
            </h2>

            <div className="text-sm grid md:grid-cols-2 gap-4">

              <div>
                <p className="text-gray-500">Kode Skema</p>
                <p>{data.skema.kode_skema}</p>
              </div>

              <div>
                <p className="text-gray-500">Judul</p>
                <p>{data.skema.judul_skema}</p>
              </div>

              <div>
                <p className="text-gray-500">Jenis</p>
                <p>{data.skema.jenis_skema}</p>
              </div>

            </div>
          </div>
        )}

        {/* ================= ASESSOR LIST ================= */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users size={18} />
            Daftar Asesor
          </h2>

          {data.asesorList && data.asesorList.length > 0 ? (

            <div className="space-y-4">

              {data.asesorList.map((item) => (

                <div
                  key={item.id}
                  className="border p-4 rounded-lg bg-gray-50"
                >

                  <div className="flex items-center gap-3">

                    <User className="text-orange-500" />

                    <div>

                      <p className="font-semibold">
                        {item.asesor?.username}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.asesor?.no_hp}
                      </p>

                    </div>

                  </div>

                  {/* Profile Asesor */}
                  {item.profileAsesor && (
                    <div className="mt-3 text-sm">

                      <p>
                        <span className="text-gray-500">
                          Keahlian:
                        </span>{" "}
                        {item.profileAsesor.keahlian}
                      </p>

                      <p>
                        <span className="text-gray-500">
                          Pengalaman:
                        </span>{" "}
                        {item.profileAsesor.pengalaman}
                      </p>

                    </div>
                  )}

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              Belum ada asesor yang ditambahkan
            </p>

          )}

        </div>

      </div>
    </div>
  );
};

export default DetailJadwal;