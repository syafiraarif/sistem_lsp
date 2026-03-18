import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

const CariAsesi = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  // Dummy fetch - Nanti diganti dengan axios.get('/api/admin/asesi?status=...')
  useEffect(() => {
    // Simulasi pengambilan data dari backend
    // fetchAsesi(searchQuery, filterStatus);
  }, [searchQuery, filterStatus]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#182D4A] mb-2">Pencarian Data Asesi</h1>
      <p className="text-gray-600 mb-6">Cari dan filter data asesi berdasarkan status sertifikasi dan jadwal.</p>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIK atau Nama Asesi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CC6B27]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Filter */}
        <div className="relative w-full md:w-64">
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#CC6B27] appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="pendaftar_baru">Pendaftar Baru (Pending)</option>
            <option value="terjadwal">Terjadwal (Belum Asesmen)</option>
            <option value="kompeten">Kompeten</option>
            <option value="belum_kompeten">Belum Kompeten</option>
            <option value="diblokir">Diblokir (Nonaktif)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#071E3D] text-[#FAFAFA]">
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">NIK</th>
              <th className="p-3 border-b">Nama Lengkap</th>
              <th className="p-3 border-b">Jadwal / Skema</th>
              <th className="p-3 border-b">Status Asesmen</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {/* Map data asesi di sini */}
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">1</td>
              <td className="p-3 border-b">3401123456780001</td>
              <td className="p-3 border-b font-medium text-[#182D4A]">Budi Santoso</td>
              <td className="p-3 border-b">Web Developer</td>
              <td className="p-3 border-b">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Kompeten
                </span>
              </td>
              <td className="p-3 border-b">
                <button className="text-sm bg-[#CC6B27] text-white px-3 py-1 rounded hover:bg-orange-700">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CariAsesi;