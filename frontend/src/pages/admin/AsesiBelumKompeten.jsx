import React, { useState, useEffect } from "react";
import { 
  FaSearch, FaTimes, FaEye, FaCalendarAlt, FaUserCheck 
} from "react-icons/fa";
import api from "../../services/api";

const AsesiBelumKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // States untuk Datatable Features
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // States untuk Modals
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedJadwal, setSelectedJadwal] = useState(null);

  const fetchAsesiBelumKompeten = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/peserta-jadwal/global?status=belum_kompeten');
      setAsesiList(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesiBelumKompeten();
  }, []);

  // ==========================================
  // HELPER FUNCTIONS: ANTI-ERROR & AUTO-DETECT COLUMNS
  // ==========================================
  const getAsesiProfile = (user) => {
    if (!user) return {};
    return user.ProfileAsesi || user.profileAsesi || user.profile_asesi || user.Profile_Asesi || {};
  };

  const getJadwal = (item) => {
    if (!item) return {};
    return item.jadwal || item.Jadwal || {};
  };

  const getSkema = (jadwalObj) => {
    if (!jadwalObj) return {};
    return jadwalObj.skema || jadwalObj.Skema || {};
  };

  // Logika Filter (Search)
  const filteredData = asesiList.filter((item) => {
    const profile = getAsesiProfile(item.user);
    const jadwalObj = getJadwal(item);
    const skemaObj = getSkema(jadwalObj);

    const nik = profile.nik || "";
    const nama = profile.nama_lengkap || item.user?.nama_lengkap || item.user?.email || "";
    const skemaTitle = skemaObj.judul_skema || skemaObj.nama_skema || "";
    
    return (
      nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skemaTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Logika Pagination
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // Handlers Modals
  const handleDetail = (item) => setSelectedDetail(item);
  const closeDetailModal = () => setSelectedDetail(null);

  const handleLihatJadwal = (item) => setSelectedJadwal(item);
  const closeJadwalModal = () => setSelectedJadwal(null);

  // Helper Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2 flex items-center gap-2">
        Data Asesi Belum Kompeten
      </h1>
      <p className="text-gray-600 mb-6">
        Daftar asesi yang belum lulus uji kompetensi dan direkomendasikan belum kompeten.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        {/* Kontrol Tabel Atas */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>Show</span>
            <select
              className="mx-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27]"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center text-sm">
            <span className="mr-2 text-gray-600 font-medium">Search:</span>
            <div className="relative">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={12} />
              <input
                type="text"
                className="border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#CC6B27] focus:ring-1 focus:ring-[#CC6B27]"
                placeholder="Cari NIK / Nama / Skema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto border border-gray-200 rounded-t-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#071E3D] text-[#FAFAFA] text-sm">
                <th className="p-3 border-b text-center w-12 font-semibold">No</th>
                <th className="p-3 border-b font-semibold">NIK</th>
                <th className="p-3 border-b font-semibold">Nama Lengkap</th>
                <th className="p-3 border-b font-semibold">Jadwal / Kegiatan</th>
                <th className="p-3 border-b font-semibold">Skema</th>
                <th className="p-3 border-b font-semibold text-center">Nilai</th>
                <th className="p-3 border-b font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">Memuat data...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">Tidak ada entri yang cocok.</td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const profile = getAsesiProfile(item.user);
                  const jadwalObj = getJadwal(item);
                  const skemaObj = getSkema(jadwalObj);

                  return (
                    <tr key={item.id_peserta || index} className="hover:bg-gray-50 text-sm border-b border-gray-100 transition-colors">
                      <td className="p-3 text-center text-gray-600">{indexOfFirstItem + index + 1}</td>
                      <td className="p-3 text-gray-700">{profile.nik || "-"}</td>
                      <td className="p-3 font-medium text-[#182D4A]">
                        {profile.nama_lengkap || item.user?.nama_lengkap || item.user?.email || "-"}
                      </td>
                      <td className="p-3 text-gray-600 text-xs">
                        {jadwalObj.nama_jadwal || jadwalObj.nama_kegiatan || "-"}
                      </td>
                      <td className="p-3 text-gray-600 text-xs font-medium">
                        {skemaObj.judul_skema || skemaObj.nama_skema || "-"}
                      </td>
                      <td className="p-3 text-center font-bold text-red-600">
                        {item.nilai_akhir || "Belum Kompeten"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center flex-wrap gap-2">
                          <button 
                            onClick={() => handleDetail(item)}
                            className="flex items-center gap-1 bg-[#182D4A] text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-[#0a1424] transition-colors text-xs"
                            title="Lihat Detail Asesi"
                          >
                            <FaEye /> Detail
                          </button>
                          <button 
                            onClick={() => handleLihatJadwal(item)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-blue-800 transition-colors text-xs"
                            title="Lihat Detail Jadwal"
                          >
                            <FaCalendarAlt /> Jadwal
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm">
          <div className="text-gray-600 mb-4 md:mb-0">
            Menampilkan {totalEntries === 0 ? 0 : indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, totalEntries)} dari {totalEntries} entri
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-md transition-colors ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1.5 border rounded-md transition-colors ${currentPage === i + 1 ? "bg-[#CC6B27] text-white border-[#CC6B27]" : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 border rounded-md transition-colors ${currentPage === totalPages || totalPages === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-[#182D4A] hover:bg-gray-50 border-gray-300"}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. MODAL DETAIL ASESI */}
      {/* ========================================== */}
      {selectedDetail && (() => {
        const profileDetail = getAsesiProfile(selectedDetail.user);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center bg-[#071E3D] text-white p-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaUserCheck className="text-[#CC6B27]" /> Detail Kelulusan Asesi
                </h2>
                <button onClick={closeDetailModal} className="text-gray-300 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">NIK</label>
                    <p className="font-semibold text-gray-800">{profileDetail.nik || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nama Lengkap</label>
                    <p className="font-semibold text-gray-800">{profileDetail.nama_lengkap || selectedDetail.user?.nama_lengkap || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nilai Akhir</label>
                    <p className="font-bold text-red-600 text-lg">{selectedDetail.nilai_akhir || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Status Rekomendasi</label>
                    <div className="mt-1">
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs border border-red-200">BK - BELUM KOMPETEN</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Keterangan / Catatan Asesor</label>
                    <p className="font-medium text-gray-800 italic bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedDetail.keterangan || selectedDetail.catatan || "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                <button onClick={closeDetailModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-100 transition-colors text-sm font-medium">Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================== */}
      {/* 2. MODAL LIHAT JADWAL */}
      {/* ========================================== */}
      {selectedJadwal && (() => {
        const jadwalObj = getJadwal(selectedJadwal);
        const skemaObj = getSkema(jadwalObj);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
              <div className="flex justify-between items-center bg-blue-800 text-white p-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-300" /> Detail Jadwal Asesmen
                </h2>
                <button onClick={closeJadwalModal} className="text-gray-300 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                  <div className="md:col-span-2">
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Nama Kegiatan</label>
                    <p className="font-bold text-lg text-[#182D4A]">{jadwalObj.nama_jadwal || jadwalObj.nama_kegiatan || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Skema Sertifikasi</label>
                    <p className="font-medium text-gray-800">{skemaObj.judul_skema || skemaObj.nama_skema || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Metode Pelaksanaan</label>
                    <p className="font-medium text-gray-800 uppercase bg-blue-50 text-blue-800 inline-block px-2 py-0.5 rounded border border-blue-200">
                      {jadwalObj.pelaksanaan_uji || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Tanggal Pelaksanaan</label>
                    <p className="font-medium text-gray-800">
                      {formatDate(jadwalObj.tgl_awal)} <span className="text-gray-400 mx-1">s/d</span> {formatDate(jadwalObj.tgl_akhir)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Waktu / Jam</label>
                    <p className="font-medium text-gray-800">{jadwalObj.jam || "-"} WIB</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-500 mb-1 text-xs uppercase tracking-wider">Lokasi / URL Agenda</label>
                    {jadwalObj.url_agenda ? (
                       <a href={jadwalObj.url_agenda} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                         {jadwalObj.url_agenda}
                       </a>
                    ) : (
                      <p className="font-medium text-gray-800">-</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                <button onClick={closeJadwalModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-100 transition-colors text-sm font-medium">Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AsesiBelumKompeten;