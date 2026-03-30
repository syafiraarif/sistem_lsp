import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import { ArrowLeftIcon, Loader2Icon, SearchIcon, UserPlusIcon, Trash2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const AsesorPenguji = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwal, setJadwal] = useState(null);
  const [asesorJadwal, setAsesorJadwal] = useState([]);
  const [allAsesor, setAllAsesor] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // 🔥 FIXED: Filter asesor BELUM terdaftar + search
  const filteredAsesor = useMemo(() => {
    // Filter asesor yang BELUM terdaftar di jadwal ini
    const availableAsesor = allAsesor.filter(a => 
      !asesorJadwal.some(j => j.id_user === a.id_user)
    );
    
    return availableAsesor.filter((a) =>
      a.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
      a.no_reg_asesor?.toLowerCase().includes(search.toLowerCase()) ||
      a.username?.toLowerCase().includes(search.toLowerCase()) ||
      a.no_hp?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allAsesor, search, asesorJadwal]);

  // 🔥 FIXED: Response structure SESUAI backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching data for jadwal:', id);

      // 🔥 PARALLEL REQUEST untuk performance
      const [resJadwal, resAsesorJadwal, resAllAsesor] = await Promise.all([
        axios.get(`${API_BASE}/tuk/jadwal/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/tuk/asesor`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('📋 Jadwal:', resJadwal.data);
      console.log('👥 Asesor jadwal:', resAsesorJadwal.data);
      console.log('👨‍💼 All asesor:', resAllAsesor.data);

      // 🔥 FIXED: Sesuai backend response structure
      setJadwal(resJadwal.data.data); // getJadwalById return { data: jadwal }
      setAsesorJadwal(resAsesorJadwal.data.data || []); // listAsesorJadwal return { data: [] }
      setAllAsesor(resAllAsesor.data.data || []); // getAsesorTuk return { data: [] }

    } catch (err) {
      console.error("💥 Fetch Error:", err.response?.data || err);
      
      if (err.response?.status === 401) {
        alert("Session habis, silakan login kembali");
        localStorage.clear();
        navigate("/login");
      } else if (err.response?.status === 404) {
        alert("Jadwal tidak ditemukan");
        navigate("/tuk/jadwal");
      } else {
        alert(err?.response?.data?.message || "Gagal memuat data jadwal");
      }
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);

  // Handlers
  const handleAdd = useCallback((id_user) => {
    if (selected.includes(id_user)) return;
    setSelected(prev => [...prev, id_user]);
  }, [selected]);

  const handleRemove = useCallback((id_user) => {
    setSelected(prev => prev.filter(i => i !== id_user));
  }, []);

  const handleDeleteAsesor = useCallback(async (idUser) => {
    const asesor = asesorJadwal.find(a => a.id_user === parseInt(idUser));
    if (!window.confirm(`Hapus ${asesor?.nama_lengkap || 'asesor ini'} dari jadwal?`)) return;

    try {
      await axios.delete(
        `${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji/${idUser}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Asesor berhasil dihapus dari jadwal");
      fetchData();
    } catch (err) {
      console.error("🗑️ Delete error:", err);
      alert(err?.response?.data?.message || "❌ Gagal menghapus asesor");
    }
  }, [id, token, asesorJadwal, fetchData]);

  const handleSave = useCallback(async () => {
    if (selected.length === 0) {
      alert("❌ Pilih minimal 1 asesor");
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving asesor:', selected);
      
      const payload = {
        listAsesor: selected.map(id_user => ({ id_user: parseInt(id_user) }))
      };

      const res = await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Save response:', res.data);
      
      const message = res.data?.message || 
                     `✅ Berhasil menambahkan ${res.data?.baru || 0} asesor baru, ${res.data?.sudah_ada || 0} sudah ada`;
      alert(message);
      
      setSelected([]);
      fetchData();
    } catch (err) {
      console.error("💾 Save error:", err.response?.data);
      
      if (err.response?.data?.invalid) {
        alert(`❌ Asesor tidak valid: ${err.response.data.invalid.join(', ')}`);
      } else {
        alert(err?.response?.data?.message || "❌ Gagal menyimpan asesor");
      }
    } finally {
      setSaving(false);
    }
  }, [id, token, selected, fetchData]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4 p-8">
          <Loader2Icon className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="text-xl font-semibold text-gray-600">Memuat data jadwal...</div>
        </div>
      </div>
    );
  }

  // Check jadwal kosong
  if (!jadwal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-12 max-w-md mx-auto">
          <div className="text-4xl text-gray-400 mb-6">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Jadwal Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">Jadwal yang Anda cari tidak ditemukan atau tidak memiliki akses.</p>
          <button
            onClick={() => navigate("/tuk/jadwal")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali ke Daftar Jadwal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border hover:shadow-md transition-all flex items-center gap-2 text-gray-700 hover:text-gray-900"
              title="Kembali"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                👥 Asesor Penguji
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Kelola asesor untuk jadwal <strong>"{jadwal.nama_kegiatan || 'Loading...'}"</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= DATA JADWAL & ASESOR AKTIF ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sticky top-4">
              <h2 className="font-black text-2xl mb-8 text-gray-800 flex items-center gap-3">
                📋 Informasi Jadwal
              </h2>

              <div className="space-y-6">
                <div>
                  <span className="text-sm font-semibold text-gray-500 block mb-3 uppercase tracking-wide">Skema</span>
                  <div className="font-black text-2xl text-gray-900 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    {jadwal?.skema?.judul_skema || jadwal?.nama_skema || "Belum ditentukan"}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500 block mb-3 uppercase tracking-wide">Nama Kegiatan</span>
                  <div className="font-bold text-xl text-gray-900 p-3 bg-gray-50 rounded-2xl border">
                    {jadwal?.nama_kegiatan || "-"}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500 block mb-3 uppercase tracking-wide">Periode</span>
                  <div className="font-bold text-xl text-gray-900">
                    {jadwal?.tgl_awal 
                      ? `${new Date(jadwal.tgl_awal).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}${jadwal.tgl_akhir ? ` s/d ${new Date(jadwal.tgl_akhir).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}` : ''}`
                      : "-"
                    }
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-500 block mb-3 uppercase tracking-wide">Kuota</span>
                  <div className="text-3xl font-black text-emerald-600">
                    {jadwal?.kuota || 0}
                  </div>
                </div>
              </div>

              {/* ASESOR TERDAFTAR */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="font-black text-xl mb-6 text-gray-800 flex items-center gap-3">
                  👥 Asesor Aktif
                  <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl text-lg font-bold shadow-lg">
                    {asesorJadwal.length}
                  </span>
                </h3>
                
                {asesorJadwal.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-5xl text-gray-400 mb-4 mx-auto w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center">
                      📭
                    </div>
                    <p className="text-xl font-semibold text-gray-600 mb-2">Belum ada asesor</p>
                    <p className="text-gray-500">Tambahkan asesor penguji untuk jadwal ini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto -mr-4 pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {asesorJadwal.map((a) => (
                      <div key={`${a.id}-${a.id_user}-${a.jenis_tugas}`} className="group p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg text-gray-900 truncate mb-1" title={a.nama_lengkap}>
                              {a.nama_lengkap}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                              {a.no_reg_asesor && (
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-mono border">
                                  Reg: {a.no_reg_asesor}
                                </span>
                              )}
                              {a.no_hp && (
                                <span className="flex items-center gap-1">
                                  📱 {a.no_hp}
                                </span>
                              )}
                              {a.username && (
                                <span className="flex items-center gap-1">
                                  👤 {a.username}
                                </span>
                              )}
                            </div>
                            {a.assigned_by && (
                              <div className="text-xs text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                                Ditugaskan oleh: {a.assigned_by}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAsesor(a.id_user)}
                            className="ml-4 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group-hover:scale-110 opacity-0 group-hover:opacity-100"
                            title="Hapus dari jadwal"
                          >
                            <Trash2Icon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= PILIH ASESOR ================= */}
          <div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <h2 className="font-black text-2xl mb-8 text-gray-800 flex items-center gap-3">
                ➕ Tambah Asesor Penguji
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-2xl font-semibold">
                  {filteredAsesor.length} tersedia 
                  <span className="text-xs ml-1">({allAsesor.length - asesorJadwal.length} belum dipilih)</span>
                </div>
              </h2>

                            {/* SEARCH */}
              <div className="relative mb-8">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, nomor registrasi, username atau HP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-5 py-5 border-2 border-gray-200 rounded-3xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all shadow-lg hover:shadow-xl"
                />
              </div>

              {/* LIST ASESOR */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-8 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredAsesor.length === 0 ? (
                  <div className="text-center py-20 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                    <div className="text-6xl text-gray-400 mb-6 mx-auto w-24 h-24 bg-gray-200 rounded-3xl flex items-center justify-center">
                      🔍
                    </div>
                    <h3 className="text-2xl font-black text-gray-600 mb-3">
                      {search ? "Tidak Ditemukan" : "Semua Asesor Sudah Terpilih"}
                    </h3>
                    {search ? (
                      <p className="text-lg text-gray-500">Coba kata kunci yang berbeda</p>
                    ) : (
                      <p className="text-lg text-gray-500">Semua asesor sudah terdaftar di jadwal ini</p>
                    )}
                  </div>
                ) : (
                  filteredAsesor.map((a) => {
                    return (
                      <div
                        key={a.id_user}
                        className={`p-6 border-2 rounded-3xl shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 group ${
                          selected.includes(a.id_user)
                            ? 'border-emerald-200 bg-emerald-50/50 ring-4 ring-emerald-100/50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-xl text-gray-900 mb-3 truncate" title={a.nama_lengkap}>
                              {a.nama_lengkap}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                              <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm">
                                <span className="font-mono font-bold text-gray-800">Reg:</span>
                                <span className="font-mono bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1 rounded-full text-xs">
                                  {a.no_reg_asesor || '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm">
                                <span className="font-semibold text-gray-800">📱 HP:</span>
                                <span>{a.no_hp || '-'}</span>
                              </div>
                              {a.no_lisensi && (
                                <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm">
                                  <span className="font-semibold text-gray-800">📜 Lisensi:</span>
                                  <span className="font-mono">{a.no_lisensi}</span>
                                </div>
                              )}
                              {a.username && (
                                <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm">
                                  <span className="font-semibold text-gray-800">👤 Username:</span>
                                  <span className="font-mono bg-gray-100 px-3 py-1 rounded-full">@ {a.username}</span>
                                </div>
                              )}
                              {a.bidang_keahlian && (
                                <div className="col-span-full p-3 bg-indigo-50/50 backdrop-blur-sm rounded-2xl border border-indigo-200 mt-2">
                                  <span className="font-semibold text-indigo-800 block mb-1">🎯 Bidang Keahlian:</span>
                                  <span className="text-sm">{a.bidang_keahlian}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 ml-4 shrink-0">
                            {selected.includes(a.id_user) ? (
                              <button
                                onClick={() => handleRemove(a.id_user)}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all transform"
                              >
                                <XCircleIcon className="w-6 h-6" />
                                Batal Pilih
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAdd(a.id_user)}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all transform group-hover:scale-105"
                              >
                                <UserPlusIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Pilih Asesor
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* COUNTER & SAVE BUTTON */}
              {selected.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-white/30 backdrop-blur-xl">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left flex flex-col items-center lg:items-start gap-2">
                      <div className="text-5xl lg:text-6xl font-black drop-shadow-lg">
                        🎉 {selected.length}
                      </div>
                      <div className="text-2xl font-bold drop-shadow-lg">
                        Asesor Siap Ditugaskan
                      </div>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="group flex items-center gap-4 bg-white/90 text-emerald-800 px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-300 border-4 border-white/50 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-[1.02]"
                    >
                      {saving ? (
                        <>
                          <Loader2Icon className="w-8 h-8 animate-spin" />
                          <span className="tracking-wide">Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                          <span className="tracking-wide">Simpan {selected.length} Asesor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsesorPenguji;