// frontend/src/pages/tuk/ListJadwal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API = "http://localhost:3000/api/tuk/jadwal";

const ListJadwal = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= MODAL DELETE ================= */
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchJadwal = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJadwal(res.data.data || []);
    } catch (err) {
      console.error("Gagal load jadwal", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await axios.delete(`${API}/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setDeleteId(null);
      fetchJadwal();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  /* ================= FILTER ================= */
  const filteredJadwal = jadwal.filter(
    (j) =>
      j.nama_kegiatan?.toLowerCase().includes(search.toLowerCase()) ||
      j.kode_jadwal?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-600",
      open: "bg-blue-100 text-blue-600",
      ongoing: "bg-orange-100 text-orange-600",
      selesai: "bg-green-100 text-green-600",
      arsip: "bg-slate-100 text-slate-600",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
          colors[status] || colors.draft
        }`}
      >
        {status}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-orange-500" size={28} />
            <h1 className="text-2xl font-bold">
              Daftar Jadwal
            </h1>
          </div>

          <button
            onClick={() => navigate("/tuk/jadwal/buat")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={16} />
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
              placeholder="Cari kode atau nama kegiatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading...
            </div>
          ) : filteredJadwal.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada jadwal
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="p-3 text-left">Kode</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Kuota</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredJadwal.map((item) => (
                  <tr
                    key={item.id_jadwal}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{item.kode_jadwal}</td>

                    <td className="p-3">
                      <div className="font-semibold">
                        {item.nama_kegiatan}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.periode_bulan} {item.tahun}
                      </div>
                    </td>

                    <td className="p-3">
                      {formatDate(item.tgl_awal)} -{" "}
                      {formatDate(item.tgl_akhir)}
                    </td>

                    <td className="p-3">
                      {item.kuota} Orang
                    </td>

                    <td className="p-3">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* ACTION */}
                    <td className="p-3">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            navigate(
                              `/tuk/jadwal/${item.id_jadwal}/detail`
                            )
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/tuk/jadwal/${item.id_jadwal}/edit`
                            )
                          }
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteClick(item.id_jadwal)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL DELETE ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96">

            <h2 className="text-lg font-bold mb-3">
              Konfirmasi Hapus
            </h2>

            <p className="text-gray-600 mb-6">
              Jadwal ini akan dihapus permanen.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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