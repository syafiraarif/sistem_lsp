import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API_BASE = import.meta.env.VITE_API_BASE;

const VerifikasiTUK = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jadwal, setJadwal] = useState(null);
  const [asesorJadwal, setAsesorJadwal] = useState([]);
  const [allAsesor, setAllAsesor] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== TAMBAHAN SEARCH ===== */
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch jadwal detail
      const resJadwal = await axios.get(
        `${API_BASE}/tuk/jadwal/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const dataJadwal = resJadwal.data?.data;
      setJadwal(dataJadwal);

      // 2. Fetch asesor verifikasi TUK yang sudah dipilih
      const resAsesorJadwal = await axios.get(
        `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAsesorJadwal(resAsesorJadwal.data?.data || []);

      // 3. Fetch semua asesor TUK
      const resAllAsesor = await axios.get(
        `${API_BASE}/tuk/asesor`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAllAsesor(resAllAsesor.data?.data || []);

    } catch (err) {
      console.error("Error fetch data:", err);
      alert(err?.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  /* ================= TAMBAH ASESOR ================= */
  const handleAdd = (id_user) => {
    setSelected((prev) => {
      if (prev.includes(id_user)) return prev;
      return [...prev, id_user];
    });
  };

  /* ================= REMOVE ================= */
  const handleRemove = (id_user) => {
    setSelected((prev) => prev.filter((i) => i !== id_user));
  };

  /* ================= SIMPAN ================= */
  const handleSave = async () => {
    try {
      if (selected.length === 0) {
        alert("Pilih minimal 1 asesor");
        return;
      }

      const payload = {
        listAsesor: selected.map((id_user) => ({
          id_user: parseInt(id_user)
        }))
      };

      await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelected([]);
      alert("Berhasil menyimpan asesor verifikasi TUK!");
      fetchData(); // Refresh data

    } catch (err) {
      console.error("Error save:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan");
    }
  };

  /* ================= HAPUS ASESOR ================= */
  const handleDeleteAsesor = async (id_user) => {
    if (!window.confirm("Hapus asesor dari verifikasi TUK?")) return;

    try {
      await axios.delete(
        `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk/${id_user}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Asesor berhasil dihapus!");
      fetchData(); // Refresh data

    } catch (err) {
      console.error("Error delete:", err);
      alert(err?.response?.data?.message || "Gagal menghapus");
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-20 p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Verifikasi TUK
          </h1>
          <p className="text-gray-600 mt-1">
            Pilih asesor untuk verifikasi TUK pada jadwal ini
          </p>
        </div>

        {/* DATA JADWAL */}
        {jadwal ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Data Jadwal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-8">
              <div>
                <span className="text-gray-500 block mb-1">Skema</span>
                <div className="font-semibold text-gray-900">
                  {jadwal?.skema?.judul_skema || "-"}
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Kegiatan</span>
                <div className="font-semibold text-gray-900">
                  {jadwal?.nama_kegiatan || "-"}
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Tanggal</span>
                <div className="font-semibold text-gray-900">
                  {jadwal?.tgl_awal} - {jadwal?.tgl_akhir}
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Kuota</span>
                <div className="font-semibold text-gray-900">
                  {jadwal?.kuota || 0}
                </div>
              </div>
            </div>

            {/* ASESOR TERPILIH */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <span className="text-gray-700 font-medium block mb-2">
                👥 Asesor Verifikasi TUK ({asesorJadwal.length})
              </span>
              
              {asesorJadwal.length === 0 ? (
                <div className="text-gray-500 italic">
                  Belum ada asesor verifikasi TUK
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {asesorJadwal.map((asesor) => (
                    <div
                      key={asesor.id_user}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {asesor.nama_lengkap}
                      <button
                        onClick={() => handleDeleteAsesor(asesor.id_user)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        title="Hapus asesor"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 text-center text-gray-500">
            Jadwal tidak ditemukan
          </div>
        )}

        {/* PILIH ASESOR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            ➕ Pilih Asesor Verifikasi TUK
          </h2>

          {/* SEARCH */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari nama asesor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* LIST ASESOR */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allAsesor
              .filter((a) =>
                a.nama_lengkap
                  ?.toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((a) => {
                const sudahAda = asesorJadwal.some(
                  (j) => j.id_user === a.id_user
                );

                return (
                  <div
                    key={a.id_user}
                    className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition-all hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {a.nama_lengkap}
                        </div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          <div>IDR: {a.no_reg_asesor}</div>
                          <div>📱 {a.no_hp}</div>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        {sudahAda ? (
                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                            ✓ Sudah Dipilih
                          </span>
                        ) : selected.includes(a.id_user) ? (
                          <button
                            onClick={() => handleRemove(a.id_user)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            Batalkan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdd(a.id_user)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            Tambah
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* TOMBOL SIMPAN */}
          {selected.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="text-sm text-gray-600">
                  Akan menambahkan {selected.length} asesor baru
                </div>
                <button
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  💾 Simpan Verifikasi TUK ({selected.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifikasiTUK;