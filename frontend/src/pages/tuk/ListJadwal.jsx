// frontend/src/pages/tuk/ListJadwal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Plus, Search } from "lucide-react";

import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API = `${import.meta.env.VITE_API_BASE}/tuk/jadwal`;

const ListJadwal = () => {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchJadwal = async () => {
    try {

      setLoading(true);

      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJadwal(res.data?.data || []);

    } catch (err) {

      console.error("Gagal mengambil jadwal:", err);
      setJadwal([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    fetchJadwal();

  }, []);

  /* ================= DELETE ================= */

  const handleDeleteClick = (id) => {

    setDeleteId(id);
    setShowModal(true);

  };

  const handleDelete = async () => {

    try {

      setDeleting(true);

      await axios.delete(`${API}/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowModal(false);
      setDeleteId(null);

      fetchJadwal();

    } catch (err) {

      alert(err.response?.data?.message || "Gagal menghapus jadwal");

    } finally {

      setDeleting(false);

    }

  };

  /* ================= FILTER ================= */

  const filteredJadwal = jadwal.filter((j) => {

    const keyword = search.toLowerCase();

    return (
      j.nama_kegiatan?.toLowerCase().includes(keyword) ||
      j.kode_jadwal?.toLowerCase().includes(keyword)
    );

  });

  /* ================= FORMAT DATE ================= */

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  };

  /* ================= STATUS BADGE ================= */

  const getStatusBadge = (status) => {

    if (status === "draft") {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          Draft
        </span>
      );
    }

    if (status === "menunggu") {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
          Menunggu
        </span>
      );
    }

    if (status === "open") {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          Open
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
        {status || "-"}
      </span>
    );

  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    navigate("/login");

  };

  return (

    <div className="min-h-screen bg-slate-50 flex">

      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-20 p-6 lg:p-8">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-3">
            <Calendar className="text-orange-500" size={28}/>
            <h1 className="text-2xl font-bold">
              Daftar Jadwal Sertifikasi
            </h1>
          </div>

          <button
            onClick={() => navigate("/tuk/jadwal/buat")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16}/>
            Buat Jadwal
          </button>

        </div>

        {/* SEARCH */}

        <div className="mb-5">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Cari jadwal..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          {loading ? (

            <div className="p-8 text-center text-gray-500">
              Loading data jadwal...
            </div>

          ) : filteredJadwal.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              Tidak ada jadwal ditemukan
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-100 text-sm">

                <tr>
                  <th className="p-3 text-left">Nama / Tanggal</th>
                  <th className="p-3 text-left">Skema / Kuota</th>
                  <th className="p-3 text-left">Asesor</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>

              </thead>

              <tbody>

                {filteredJadwal.map((item)=> (

                  <tr
                    key={item.id_jadwal}
                    className="border-t hover:bg-gray-50"
                  >

                    {/* Nama + Tanggal */}

                    <td className="p-3">

                      <div className="font-semibold text-gray-800">
                        {item.nama_kegiatan}
                      </div>

                      <div className="text-sm text-gray-500">
                        {formatDate(item.tgl_awal)} - {formatDate(item.tgl_akhir)}
                      </div>

                    </td>

                    {/* Skema */}

                    <td className="p-3">

                      <div className="font-medium">
                        {item.skema?.judul_skema || "-"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.skema?.kode_skema}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        Kuota: {item.kuota || 0} Orang
                      </div>

                    </td>

                    {/* Asesor */}

                    <td className="p-3">

                      {item.asesorList?.length ? (

                        item.asesorList.map((a,i)=>(
                          <div key={i} className="text-sm">
                            {a.asesor?.username || "-"}
                          </div>
                        ))

                      ) : (

                        <span className="text-gray-400 text-sm">
                          Belum ada asesor
                        </span>

                      )}

                    </td>

                    {/* STATUS */}

                    <td className="p-3">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* AKSI */}

                    <td className="p-3">

                      {item.status === "draft" || item.status === "menunggu" ? (

                        <span className="text-sm text-gray-400 italic">
                          Belum di ACC Admin
                        </span>

                      ) : (

                        <div className="grid grid-cols-2 gap-2 w-56 ml-auto">

                          <button
                            onClick={()=>navigate(`/tuk/jadwal/${item.id_jadwal}/edit`)}
                            className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                          >
                            Ubah Jadwal
                          </button>

                          <button
                            onClick={()=>handleDeleteClick(item.id_jadwal)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hapus
                          </button>

                          <button
                            onClick={()=>navigate(`/tuk/jadwal/${item.id_jadwal}/asesor`)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Asesor
                          </button>

                          <button
                            onClick={()=>navigate(`/tuk/jadwal/${item.id_jadwal}/verifikasi`)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Verifikasi TUK
                          </button>

                          <button
                            onClick={()=>navigate(`/tuk/jadwal/${item.id_jadwal}/validator`)}
                            className="col-span-2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Validator MKVA
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

      {/* MODAL DELETE */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-96">

            <h2 className="text-lg font-bold mb-3">
              Konfirmasi Hapus
            </h2>

            <p className="text-gray-600 mb-6">
              Jadwal ini akan dihapus permanen
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={()=>{
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default ListJadwal;