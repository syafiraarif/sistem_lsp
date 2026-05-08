import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, ShieldCheck, CheckSquare } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const VerifikasiPendaftaran = () => {
  const [pendaftarList, setPendaftarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk checkbox multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchPendaftar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pendaftaran");
      setPendaftarList(res.data.data || []);
    } catch (error) {
      console.error("Gagal load pendaftar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendaftar();
  }, []);

  const filteredData = pendaftarList.filter((item) =>
    (item.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nik || "").includes(searchQuery) ||
    (item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIC CHECKBOX ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredData.map((item) => item.id_pendaftaran);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  // --- LOGIC DELETE SINGLE ---
  const handleDelete = async (id, nama) => {
    const confirm = await Swal.fire({
      title: "Hapus Pendaftar?",
      text: `Data pendaftaran ${nama} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/pendaftaran/${id}`);
        Swal.fire("Terhapus", "Data pendaftar berhasil dihapus", "success");
        setSelectedIds(selectedIds.filter((item) => item !== id));
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data", "error");
      }
    }
  };

  // --- LOGIC BULK DELETE ---
  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({
      title: `Hapus ${selectedIds.length} Pendaftar?`,
      text: "Semua data yang dipilih akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await api.post("/admin/pendaftaran/bulk-delete", { ids: selectedIds });
        Swal.fire("Terhapus", `${selectedIds.length} data berhasil dihapus`, "success");
        setSelectedIds([]);
        fetchPendaftar();
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data massal", "error");
      }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAFAFA] min-h-screen flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-white p-6 rounded-xl border border-[#071E3D]/10 shadow-sm">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#CC6B27]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] font-black uppercase tracking-wider mb-3">
              <ShieldCheck size={14} />
              Verifikasi Pendaftaran
            </div>
            <h2 className="text-[24px] md:text-[28px] font-black text-[#071E3D] m-0 mb-1">Pendaftar Baru</h2>
            <p className="text-[14px] text-[#182D4A]/70 m-0 font-medium">Validasi data calon asesi baru yang mendaftar.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white shadow-sm transition-all flex items-center justify-center gap-2 text-[13px]"
              >
                <Trash2 size={16} /> Hapus {selectedIds.length} Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#071E3D] m-0 flex items-center gap-2">
            <CheckSquare size={18} className="text-[#CC6B27]"/> Daftar Antrian
          </h4>
          <div className="w-full md:w-80 relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 group-focus-within:text-[#CC6B27] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari Nama, NIK, atau Email..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/20 text-[#071E3D] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
          <table className="w-full text-left border-collapse min-w-max bg-white">
            <thead>
              <tr>
                <th className="py-3.5 px-4 bg-[#071E3D] border-b-4 border-[#CC6B27] w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-[#CC6B27] border-gray-300 focus:ring-[#CC6B27] cursor-pointer"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  />
                </th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] w-16 text-center">No</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Identitas</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Program / Kompetensi</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Tanggal Daftar</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27]">Status</th>
                <th className="py-3.5 px-4 bg-[#071E3D] text-[#FAFAFA] font-semibold text-[12px] uppercase tracking-wider border-b-4 border-[#CC6B27] text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-sm font-medium text-[#182D4A]">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-sm font-medium text-[#182D4A]">Belum ada pendaftar baru.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_pendaftaran} className="border-b border-[#071E3D]/5 hover:bg-[#CC6B27]/5 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-[#CC6B27] border-gray-300 focus:ring-[#CC6B27] cursor-pointer"
                        checked={selectedIds.includes(item.id_pendaftaran)}
                        onChange={(e) => handleSelectOne(e, item.id_pendaftaran)}
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-[#071E3D] text-[13.5px] font-semibold">{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#071E3D] text-[13.5px]">{item.nama_lengkap}</p>
                      <p className="text-[11px] text-[#182D4A]/70 mt-0.5">NIK: {item.nik}</p>
                      <p className="text-[11px] text-[#CC6B27] mt-0.5">{item.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#071E3D] text-[13.5px]">{item.program_studi}</p>
                      <p className="text-[11px] text-[#182D4A]/70 mt-0.5">{item.kompetensi_keahlian}</p>
                    </td>
                    <td className="py-3 px-4 text-[#182D4A] text-[13px] font-medium">
                      {new Date(item.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'pending' ? 'bg-[#CC6B27]/10 text-[#CC6B27] border-[#CC6B27]/20' :
                        item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 text-[#182D4A] bg-[#182D4A]/10 rounded-lg hover:bg-[#182D4A] hover:text-white transition-colors" title="Detail Verifikasi">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id_pendaftaran, item.nama_lengkap)}
                          className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white border border-red-100 transition-colors" 
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifikasiPendaftaran;