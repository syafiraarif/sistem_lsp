// frontend/src/pages/tuk/ListJadwal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Plus, Search, Users } from "lucide-react";
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

      // 1. Fetch jadwal utama
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jadwalList = res.data?.data || [];

      // 2. Fetch asesor untuk setiap jadwal (hanya untuk jadwal yang statusnya bukan draft)
      const jadwalWithAsesor = await Promise.all(
        jadwalList.map(async (item) => {
          if (item.status === "draft") {
            return { 
              ...item, 
              asesorSummary: { 
                asesor_penguji: { count: 0, names: [] }, 
                verifikator_tuk: { count: 0, names: [] }, 
                validator_mkva: { count: 0, names: [] } 
              } 
            };
          }

          try {
            const asesorPromises = [
              axios.get(`${API}/${item.id_jadwal}/asesor/asesor_penguji`, { headers: { Authorization: `Bearer ${token}` } }),
              axios.get(`${API}/${item.id_jadwal}/asesor/verifikator_tuk`, { headers: { Authorization: `Bearer ${token}` } }),
              axios.get(`${API}/${item.id_jadwal}/asesor/validator_mkva`, { headers: { Authorization: `Bearer ${token}` } })
            ];

            const [pengujiRes, verifRes, mkvaRes] = await Promise.all(asesorPromises);
            
            return {
              ...item,
              asesorSummary: {
                asesor_penguji: {
                  count: pengujiRes.data.data?.length || 0,
                  names: pengujiRes.data.data?.map(a => a.nama_lengkap).slice(0, 2) || []
                },
                verifikator_tuk: {
                  count: verifRes.data.data?.length || 0,
                  names: verifRes.data.data?.map(a => a.nama_lengkap).slice(0, 2) || []
                },
                validator_mkva: {
                  count: mkvaRes.data.data?.length || 0,
                  names: mkvaRes.data.data?.map(a => a.nama_lengkap).slice(0, 2) || []
                }
              }
            };
          } catch (err) {
            console.warn(`Gagal fetch asesor untuk jadwal ${item.id_jadwal}:`, err);
            return {
              ...item,
              asesorSummary: { 
                asesor_penguji: { count: 0, names: [] }, 
                verifikator_tuk: { count: 0, names: [] }, 
                validator_mkva: { count: 0, names: [] } 
              }
            };
          }
        })
      );

      setJadwal(jadwalWithAsesor);
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
      j.kode_jadwal?.toLowerCase().includes(keyword) ||
      j.skema?.judul_skema?.toLowerCase().includes(keyword)
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
    const statusMap = {
      draft: { bg: "bg-gray-200", text: "text-gray-700", label: "Draft" },
      open: { bg: "bg-green-100", text: "text-green-700", label: "Open" },
      ongoing: { bg: "bg-blue-100", text: "text-blue-700", label: "Ongoing" },
      selesai: { bg: "bg-purple-100", text: "text-purple-700", label: "Selesai" },
      arsip: { bg: "bg-gray-100", text: "text-gray-600", label: "Arsip" }
    };

    const config = statusMap[status] || statusMap.arsip;
    return (
      <span className={`px-2 py-1 text-xs ${config.bg} ${config.text} rounded-full font-medium`}>
        {config.label}
      </span>
    );
  };

  /* ================= ASESOR SUMMARY - NAMA + COUNT ================= */
  const renderAsesorSummary = (asesorSummary) => {
    const totalAsesor = Object.values(asesorSummary).reduce((sum, data) => sum + data.count, 0);
    
    if (totalAsesor === 0) {
      return (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Users size={12} />
          Belum ada asesor
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {/* Total asesor */}
        <div className="text-sm font-medium text-gray-900">
          {totalAsesor} Asesor
        </div>
        
        {/* Detail per jenis tugas - NAMA + COUNT */}
        <div className="space-y-0.5 text-xs">
          {asesorSummary.asesor_penguji.count > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <span className="font-medium">👨‍🏫</span>
              <span className="font-medium">{asesorSummary.asesor_penguji.count} Penguji:</span>
              <span className="text-gray-700">
                {asesorSummary.asesor_penguji.names.join(', ')}
                {asesorSummary.asesor_penguji.count > 2 && ` +${asesorSummary.asesor_penguji.count - 2}`}
              </span>
            </div>
          )}
          
          {asesorSummary.verifikator_tuk.count > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <span className="font-medium">✅</span>
              <span className="font-medium">{asesorSummary.verifikator_tuk.count} Verif:</span>
              <span className="text-gray-700">
                {asesorSummary.verifikator_tuk.names.join(', ')}
                {asesorSummary.verifikator_tuk.count > 2 && ` +${asesorSummary.verifikator_tuk.count - 2}`}
              </span>
            </div>
          )}
          
          {asesorSummary.validator_mkva.count > 0 && (
            <div className="flex items-center gap-1 text-purple-600">
              <span className="font-medium">📋</span>
              <span className="font-medium">{asesorSummary.validator_mkva.count} MKVA:</span>
              <span className="text-gray-700">
                {asesorSummary.validator_mkva.names.join(', ')}
                {asesorSummary.validator_mkva.count > 2 && ` +${asesorSummary.validator_mkva.count - 2}`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ================= RENDER ACTION BUTTONS ================= */
  const renderActionButtons = (item) => {
    // Jika status draft, tampilkan pesan "Belum di-acc Admin"
    if (item.status === "draft") {
      return (
        <div className="p-4 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⏳</span>
            </div>
            <p className="text-sm font-medium text-orange-800 mb-1">Menunggu Persetujuan</p>
            <p className="text-xs text-orange-600">Belum di-acc Admin</p>
          </div>
        </div>
      );
    }

    // Button untuk status non-draft
    return (
      <div className="flex flex-col sm:flex-row gap-2 justify-end items-end">
        <button
          onClick={() => navigate(`/tuk/jadwal/${item.id_jadwal}/edit`)}
          className="px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none"
          title="Edit Jadwal"
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={() => handleDeleteClick(item.id_jadwal)}
          className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none"
          title="Hapus Jadwal"
        >
          🗑️ Hapus
        </button>
        
        <button
          onClick={() => navigate(`/tuk/jadwal/${item.id_jadwal}/asesor`)}
          className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none"
          title="Kelola Asesor Penguji"
        >
          👨‍🏫 Penguji
        </button>
        
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/tuk/jadwal/${item.id_jadwal}/verifikasi`)}
            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors w-full"
            title="Kelola Verifikasi TUK"
          >
            ✅ Verif TUK
          </button>
          <button
            onClick={() => navigate(`/tuk/jadwal/${item.id_jadwal}/validator`)}
            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors w-full"
            title="Kelola Validator MKVA"
          >
            📋 MKVA
          </button>
        </div>
      </div>
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="text-orange-500" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Daftar Jadwal Sertifikasi
              </h1>
              <p className="text-gray-600 mt-1">Kelola jadwal asesmen kompetensi</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/tuk/jadwal/buat")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Buat Jadwal Baru
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="🔍 Cari nama kegiatan, kode jadwal, atau skema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data jadwal...</p>
            </div>
          ) : filteredJadwal.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Belum ada jadwal</h3>
              <p className="mb-4">Buat jadwal pertama Anda untuk memulai</p>
              <button
                onClick={() => navigate("/tuk/jadwal/buat")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium"
              >
                Buat Jadwal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-800">Kegiatan & Tanggal</th>
                    <th className="p-4 text-left font-semibold text-gray-800">Skema & Kuota</th>
                    <th className="p-4 text-left font-semibold text-gray-800">Asesor</th>
                    <th className="p-4 text-left font-semibold text-gray-800">Status</th>
                    <th className="p-4 text-right font-semibold text-gray-800">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJadwal.map((item) => (
                    <tr key={item.id_jadwal} className="border-t hover:bg-gray-50 transition-colors">
                      {/* Nama + Tanggal */}
                      <td className="p-4">
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          {item.nama_kegiatan}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          📅 {formatDate(item.tgl_awal)} - {formatDate(item.tgl_akhir)}
                        </div>
                        {item.kode_jadwal && (
                          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-1 inline-block">
                            {item.kode_jadwal}
                          </div>
                        )}
                      </td>

                      {/* Skema */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {item.skema?.judul_skema || "-"}
                        </div>
                        {item.skema?.kode_skema && (
                          <div className="text-sm text-gray-500">{item.skema.kode_skema}</div>
                        )}
                        <div className="text-sm font-medium text-gray-700 mt-2">
                          👥 Kuota: <span className="text-orange-600">{item.kuota || 0}</span> orang
                        </div>
                      </td>

                      {/* ASESOR SUMMARY - NAMA + COUNT */}
                      <td className="p-4">
                        {renderAsesorSummary(item.asesorSummary || {})}
                      </td>

                                            {/* STATUS */}
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* AKSI - Conditional Rendering */}
                      <td className="p-4">
                        {renderActionButtons(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SUMMARY */}
        {!loading && (
          <div className="mt-6 text-sm text-gray-500 text-right">
            Menampilkan {filteredJadwal.length} dari {jadwal.length} jadwal
          </div>
        )}
      </div>

      {/* MODAL DELETE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Konfirmasi Penghapusan
              </h2>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus jadwal ini? 
                <br />
                <strong className="text-red-600">Data akan hilang permanen</strong>
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {deleting ? "Menghapus..." : "Hapus Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListJadwal;